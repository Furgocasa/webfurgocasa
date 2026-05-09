/**
 * Storytellers · Direct upload client
 *
 * Encapsula el flujo de subida directa cliente → Supabase Storage:
 *
 *   1) Hash SHA-256 de cada archivo en el navegador (WebCrypto).
 *   2) POST /api/storytellers/upload-init → reserva paths y obtiene ticket.
 *   3) Subida de cada archivo con tus-js-client al endpoint resumable de
 *      Supabase Storage. Si la red se cae, tus reanuda automáticamente.
 *   4) POST /api/storytellers/upload-confirm con ticket + resultados.
 *
 * Solo se usa desde el navegador. El servidor jamás invoca este módulo.
 *
 * Por qué SHA-256 en cliente
 * --------------------------
 * El servidor antiguo (`/api/storytellers/upload`) recibía el archivo y le
 * calculaba el hash en server. Ahora el archivo va de cliente a Supabase y
 * el servidor nunca lo ve, así que el cliente lo declara. La integridad
 * está protegida por el ticket HMAC + verificación de tamaño en /confirm.
 * Para fraude masivo daría igual: la única "ventaja" sería duplicar puntos,
 * pero los puntos están topados a 1500 totales y los cupones tienen
 * temporadas bloqueadas.
 */

"use client";

import * as tus from "tus-js-client";

// ---------- Tipos públicos ----------

export type FileStatus =
  | "idle"
  | "hashing"
  | "ready"          // /init devolvió "ready", esperando turno de subida
  | "uploading"
  | "retrying"
  | "uploaded"       // archivo en Storage; pendiente de /confirm
  | "rejected"       // rechazado por /init o /confirm
  | "error"          // error transitorio del cliente
  | "confirmed";     // procesado correctamente por /confirm

export interface FileProgress {
  /** ID estable que asigna el cliente (no UUID — solo identificador local). */
  clientId: string;
  filename: string;
  sizeBytes: number;
  status: FileStatus;
  /** Porcentaje 0-100 (solo en hashing y uploading). */
  percent: number;
  /** Bytes enviados / totales. */
  bytesUploaded: number;
  /** Mensaje legible, en error/rejected. */
  message?: string;
  /** Código corto cuando status=rejected (ver upload-init/confirm). */
  reasonCode?: string;
  /** Puntos otorgados al confirmar (si status=confirmed). */
  pointsAwarded?: number;
}

export interface DirectUploadCallbacks {
  /** Notifica cualquier cambio en cualquier archivo. */
  onProgress?: (snapshot: FileProgress[]) => void;
  /** Cuando todo el flujo termina (con éxito parcial o total). */
  onComplete?: (summary: DirectUploadFinalSummary) => void;
}

export interface DirectUploadFinalSummary {
  ok: boolean;
  /** Resumen del backend (stats globales y cupones desbloqueados). */
  summary?: {
    accepted: number;
    rejected: number;
    pointsAwarded: number;
    balanceAfter: number;
    instantCoupon: { code: string; pct: number; validUntil: string } | null;
    thresholdCoupon: { code: string; pct: number; validUntil: string } | null;
  } | null;
  /** Por archivo, status final de cara al usuario. */
  files: FileProgress[];
  /** items[] del backend (para mensaje de rechazos). */
  items: Array<{
    filename: string;
    status: "ok" | "rejected";
    reason?: string;
    reasonCode?: string;
    points?: number;
  }>;
  /** URL "Mis puntos" devuelta por el backend. */
  myPointsUrl?: string;
  /** Mensaje de error global (cuando ok=false). */
  errorMessage?: string;
}

interface DirectUploadOptions {
  files: File[];
  sessionToken: string;
  callbacks?: DirectUploadCallbacks;
  /** Tamaño de chunk para tus, default 6 MB. Vercel/Cloudfront-friendly. */
  chunkSizeBytes?: number;
}

// ---------- Helpers internos ----------

function hexFromBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, "0");
  }
  return s;
}

/**
 * SHA-256 de un File usando WebCrypto. Para archivos hasta ~1 GB en móviles
 * modernos. Por encima podría dar problemas de memoria (raro en Storytellers,
 * pero documentado en docs/02-desarrollo/contenido/GUIA_CONTENIDO.md).
 */
async function sha256OfFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return hexFromBuffer(digest);
}

/**
 * Codifica strings a base64 para Upload-Metadata de tus (formato:
 * `key base64value,key base64value`). Lo hace tus-js-client por debajo,
 * pero nos sirve para verificar mentalmente el wire format.
 */
// (no usado — tus-js-client maneja el encoding)

// ---------- Núcleo ----------

/**
 * Ejecuta el flujo completo de subida directa. Lanza si /upload-init falla
 * de forma fatal; en ese caso `summary` viene null y `files[]` lleva el
 * estado parcial.
 */
export async function directUpload({
  files,
  sessionToken,
  callbacks,
  chunkSizeBytes = 6 * 1024 * 1024,
}: DirectUploadOptions): Promise<DirectUploadFinalSummary> {
  const snapshot: FileProgress[] = files.map((f, i) => ({
    clientId: `f${i}-${f.name.slice(0, 40)}`,
    filename: f.name,
    sizeBytes: f.size,
    status: "idle",
    percent: 0,
    bytesUploaded: 0,
  }));

  const fire = () => callbacks?.onProgress?.([...snapshot]);
  fire();

  // 1) Hashing en paralelo de TODOS los archivos. Es rápido en fotos, lento
  //    en vídeos (5–15 s en un iPhone moderno por cada 100 MB). Se hace en
  //    serie para no saturar memoria si hay varios vídeos grandes.
  for (let i = 0; i < files.length; i++) {
    snapshot[i].status = "hashing";
    snapshot[i].percent = 0;
    fire();
    try {
      const hash = await sha256OfFile(files[i]);
      // Guardamos el hash en una propiedad temporal — usamos clientId como
      // clave para el siguiente paso (mapear con la respuesta de /init).
      (snapshot[i] as FileProgress & { _sha256: string })._sha256 = hash;
      snapshot[i].percent = 100;
      snapshot[i].status = "ready";
    } catch (e) {
      snapshot[i].status = "error";
      snapshot[i].message =
        e instanceof Error ? e.message : "No se pudo procesar el archivo (hash).";
    }
    fire();
  }

  // 2) /upload-init con los archivos que sí han hasheado.
  const initBody = {
    sessionToken,
    files: snapshot
      .map((s, i) => {
        const hash = (s as FileProgress & { _sha256?: string })._sha256;
        if (!hash || s.status !== "ready") return null;
        return {
          clientId: s.clientId,
          filename: files[i].name,
          mimeType: files[i].type,
          sizeBytes: files[i].size,
          sha256: hash,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null),
  };

  if (initBody.files.length === 0) {
    const summary: DirectUploadFinalSummary = {
      ok: false,
      summary: null,
      files: [...snapshot],
      items: [],
      errorMessage: "Ningún archivo se pudo procesar localmente.",
    };
    callbacks?.onComplete?.(summary);
    return summary;
  }

  const initRes = await fetch("/api/storytellers/upload-init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(initBody),
  });
  const initJson = await initRes.json().catch(() => ({}));

  if (!initRes.ok || !initJson?.ok) {
    const errorMessage =
      initJson?.error ||
      "No hemos podido iniciar la subida. Vuelve a intentarlo en un momento.";
    for (const s of snapshot) {
      if (s.status === "ready") {
        s.status = "error";
        s.message = errorMessage;
      }
    }
    fire();
    const summary: DirectUploadFinalSummary = {
      ok: false,
      summary: null,
      files: [...snapshot],
      items: [],
      errorMessage,
    };
    callbacks?.onComplete?.(summary);
    return summary;
  }

  const { ticket, supabaseUrl, anonKey, bucket, uploads } = initJson as {
    ticket: string | null;
    supabaseUrl: string;
    anonKey: string;
    bucket: string;
    uploads: Array<{
      clientId: string;
      status: "ready" | "rejected";
      path?: string;
      uploadId?: string;
      reason?: string;
      reasonCode?: string;
    }>;
  };

  // Mapeamos cada respuesta a su progreso correspondiente.
  const initByClient = new Map(uploads.map((u) => [u.clientId, u]));
  const reservedById = new Map<string, { uploadId: string; path: string; idx: number }>();

  for (let i = 0; i < snapshot.length; i++) {
    const r = initByClient.get(snapshot[i].clientId);
    if (!r) continue;
    if (r.status === "rejected") {
      snapshot[i].status = "rejected";
      snapshot[i].message = r.reason;
      snapshot[i].reasonCode = r.reasonCode;
    } else if (r.status === "ready" && r.uploadId && r.path) {
      reservedById.set(r.uploadId, { uploadId: r.uploadId, path: r.path, idx: i });
    }
  }
  fire();

  if (!ticket || reservedById.size === 0) {
    // Todos rechazados.
    const summary: DirectUploadFinalSummary = {
      ok: true,
      summary: {
        accepted: 0,
        rejected: snapshot.filter((s) => s.status === "rejected").length,
        pointsAwarded: 0,
        balanceAfter: 0,
        instantCoupon: null,
        thresholdCoupon: null,
      },
      files: [...snapshot],
      items: snapshot
        .filter((s) => s.status === "rejected")
        .map((s) => ({
          filename: s.filename,
          status: "rejected" as const,
          reason: s.message,
          reasonCode: s.reasonCode,
        })),
      errorMessage: initJson.message,
    };
    callbacks?.onComplete?.(summary);
    return summary;
  }

  // 3) Subida tus de cada archivo. Lo hacemos con concurrencia limitada
  //    (2 a la vez) para no saturar la red móvil.
  const CONCURRENCY = 2;
  const results: Array<{
    uploadId: string;
    path: string;
    success: boolean;
    errorMessage?: string;
  }> = [];

  const tusEndpoint = `${supabaseUrl}/storage/v1/upload/resumable`;

  async function uploadOne(uploadId: string): Promise<void> {
    const reservation = reservedById.get(uploadId);
    if (!reservation) return;
    const { idx, path } = reservation;
    const file = files[idx];
    snapshot[idx].status = "uploading";
    snapshot[idx].percent = 0;
    snapshot[idx].bytesUploaded = 0;
    fire();

    return new Promise<void>((resolve) => {
      const upload = new tus.Upload(file, {
        endpoint: tusEndpoint,
        retryDelays: [0, 1000, 3000, 5000, 10000, 20000, 30000],
        chunkSize: chunkSizeBytes,
        // Mantenemos el fingerprint en localStorage para reanudar tras
        // recargar la pestaña. tus borra el fingerprint en éxito.
        removeFingerprintOnSuccess: true,
        uploadDataDuringCreation: true,
        headers: {
          authorization: `Bearer ${anonKey}`,
          // apikey es para passthrough al backend de Supabase (lo exigen
          // sus runtime checks en algunas regiones).
          apikey: anonKey,
        },
        metadata: {
          bucketName: bucket,
          objectName: path,
          contentType: file.type,
          cacheControl: "3600",
        },
        onError(err) {
          // Solo se considera fallo definitivo cuando ya no quedan retries.
          // tus llama onError tras agotar retryDelays.
          snapshot[idx].status = "error";
          snapshot[idx].message =
            "Error subiendo este archivo: " +
            (err instanceof Error ? err.message : String(err));
          fire();
          results.push({
            uploadId,
            path,
            success: false,
            errorMessage: snapshot[idx].message,
          });
          resolve();
        },
        onChunkComplete() {
          // Si tras un chunk seguimos en "retrying" lo devolvemos a "uploading".
          if (snapshot[idx].status === "retrying") {
            snapshot[idx].status = "uploading";
            fire();
          }
        },
        onShouldRetry() {
          snapshot[idx].status = "retrying";
          fire();
          // Devolver true para usar los retryDelays.
          return true;
        },
        onProgress(bytesUploaded, bytesTotal) {
          snapshot[idx].bytesUploaded = bytesUploaded;
          snapshot[idx].percent = Math.round((bytesUploaded / bytesTotal) * 100);
          if (snapshot[idx].status === "retrying") {
            snapshot[idx].status = "uploading";
          }
          fire();
        },
        onSuccess() {
          snapshot[idx].status = "uploaded";
          snapshot[idx].percent = 100;
          snapshot[idx].bytesUploaded = file.size;
          fire();
          results.push({ uploadId, path, success: true });
          resolve();
        },
      });

      // Si tus tiene previa de este archivo en localStorage (por subida
      // interrumpida), arranca desde donde estaba.
      upload.findPreviousUploads().then((previous) => {
        if (previous.length > 0) {
          upload.resumeFromPreviousUpload(previous[0]);
        }
        upload.start();
      });
    });
  }

  // Concurrency pool sencilla.
  const queue = [...reservedById.keys()];
  const workers: Promise<void>[] = [];
  for (let w = 0; w < CONCURRENCY; w++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const next = queue.shift();
          if (!next) break;
          await uploadOne(next);
        }
      })()
    );
  }
  await Promise.all(workers);

  // 4) /upload-confirm.
  const confirmRes = await fetch("/api/storytellers/upload-confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket, results }),
  });
  const confirmJson = await confirmRes.json().catch(() => ({}));

  if (!confirmRes.ok || !confirmJson?.ok) {
    for (const s of snapshot) {
      if (s.status === "uploaded") {
        s.status = "error";
        s.message =
          "Tus archivos llegaron al almacenamiento pero no pudimos registrarlos. Soporte técnico revisará tu caso.";
      }
    }
    fire();
    const summary: DirectUploadFinalSummary = {
      ok: false,
      summary: null,
      files: [...snapshot],
      items: [],
      errorMessage:
        confirmJson?.error ||
        "Subida correcta pero no se pudo confirmar. Reintenta o contacta con soporte.",
    };
    callbacks?.onComplete?.(summary);
    return summary;
  }

  // Marca los confirmados.
  type ServerItem = {
    filename: string;
    status: "ok" | "rejected";
    reason?: string;
    reasonCode?: string;
    uploadId?: string;
    points?: number;
  };
  const serverItems = (confirmJson.items as ServerItem[]) || [];
  // Mapeamos por uploadId cuando se puede; si no, por filename (best effort).
  const serverByUploadId = new Map<string, ServerItem>();
  for (const it of serverItems) {
    if (it.uploadId) serverByUploadId.set(it.uploadId, it);
  }

  for (const [uploadId, info] of reservedById) {
    const idx = info.idx;
    const it = serverByUploadId.get(uploadId);
    if (!it) continue;
    if (it.status === "ok") {
      snapshot[idx].status = "confirmed";
      snapshot[idx].pointsAwarded = it.points;
    } else {
      snapshot[idx].status = "rejected";
      snapshot[idx].message = it.reason;
      snapshot[idx].reasonCode = it.reasonCode;
    }
  }
  fire();

  const summary: DirectUploadFinalSummary = {
    ok: true,
    summary: confirmJson.summary,
    files: [...snapshot],
    items: serverItems,
    myPointsUrl: confirmJson.myPointsUrl,
  };
  callbacks?.onComplete?.(summary);
  return summary;
}
