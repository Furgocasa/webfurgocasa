/**
 * Storytellers · Direct upload client (PUT único, sin chunking)
 *
 * Encapsula el flujo de subida directa cliente → Supabase Storage usando
 * **signed upload URLs**:
 *
 *   1) Hash SHA-256 de cada archivo en el navegador (WebCrypto).
 *   2) POST /api/storytellers/upload-init → reserva paths, signed URLs y
 *      ticket HMAC.
 *   3) Cada archivo se sube en UN SOLO PUT al signed URL de Supabase. Si la
 *      red se cae a mitad, el archivo se da por fallido y el usuario debe
 *      reintentar. Sin chunking ni reanudación: simple y robusto.
 *   4) POST /api/storytellers/upload-confirm con ticket + resultados.
 *
 * Por qué descartamos tus
 * -----------------------
 * Probamos primero `tus-js-client` con chunking + reanudación, pero los
 * PATCH intermedios fallaban en producción (CORS / auth) y el cliente
 * entraba en bucle de "reanudando reanudando" sin avanzar. Con PUT único
 * la subida o va o no va, y el usuario ve un error claro y puede
 * reintentar. Se mantiene la concurrencia (2 archivos a la vez) para no
 * saturar 4G.
 */

"use client";

// ---------- Tipos públicos ----------

export type FileStatus =
  | "idle"
  | "hashing"
  | "ready"          // /init devolvió "ready", esperando turno de subida
  | "uploading"
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
 * modernos. Por encima podría dar problemas de memoria.
 */
async function sha256OfFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return hexFromBuffer(digest);
}

/**
 * Sube `file` a la signed URL de Supabase Storage en una sola request PUT.
 * Usa XHR para tener `progress` events nativos.
 *
 * Convención del endpoint signed de Supabase Storage (signed upload URL):
 *   - Método: PUT.
 *   - Body: multipart/form-data con un campo "file" (sin nombre de campo
 *     concreto, basta con que esté).
 *   - `cacheControl` se manda como campo dentro del FormData.
 *   - Header: `x-upsert: false` para no sobrescribir.
 *   - El Content-Type lo pone el navegador automáticamente con el
 *     boundary de FormData; NO debemos setearlo a mano.
 *   - El token de auth ya viene como query string en la URL firmada.
 *
 * Importante: NO funciona enviar el File crudo como body. Supabase
 * Storage devuelve HTTP 400 ('Empty file' o similar) porque espera
 * multipart/form-data. Esto es lo que hace internamente
 * `supabase.storage.from(bucket).uploadToSignedUrl()`.
 */
function putToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress: (bytesUploaded: number) => void
): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);
    // Headers que Supabase entiende (NO Content-Type manual: lo pone el
    // navegador con el boundary del FormData).
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true });
      } else {
        resolve({
          ok: false,
          status: xhr.status,
          body: (xhr.responseText || "").slice(0, 500),
        });
      }
    };
    xhr.onerror = () => {
      // Sin status: típico de CORS, DNS, sin red, o navegador abortó.
      resolve({ ok: false, status: 0, body: "Network error" });
    };
    xhr.ontimeout = () => {
      resolve({ ok: false, status: 0, body: "Timeout" });
    };
    // Timeout generoso: 5 min para vídeos grandes con red regular.
    xhr.timeout = 5 * 60 * 1000;

    // Body multipart/form-data — convención de Supabase Storage.
    const formData = new FormData();
    formData.append("cacheControl", "3600");
    // El nombre de campo "" + el filename son los que usa supabase-js
    // internamente. Mantenemos compatibilidad bit-a-bit con su SDK.
    formData.append("", file, file.name);

    xhr.send(formData);
  });
}

// ---------- Núcleo ----------

/**
 * Ejecuta el flujo completo de subida directa.
 */
export async function directUpload({
  files,
  sessionToken,
  callbacks,
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

  // 1) Hashing en serie (no saturar memoria).
  for (let i = 0; i < files.length; i++) {
    snapshot[i].status = "hashing";
    snapshot[i].percent = 0;
    fire();
    try {
      const hash = await sha256OfFile(files[i]);
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

  // 2) /upload-init.
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

  const { ticket, uploads } = initJson as {
    ticket: string | null;
    uploads: Array<{
      clientId: string;
      status: "ready" | "rejected";
      path?: string;
      uploadId?: string;
      signedUrl?: string;
      signedToken?: string;
      reason?: string;
      reasonCode?: string;
    }>;
  };

  // Mapeamos respuesta → snapshot por clientId.
  const initByClient = new Map(uploads.map((u) => [u.clientId, u]));
  interface Reservation {
    uploadId: string;
    path: string;
    signedUrl: string;
    idx: number;
  }
  const reservedById = new Map<string, Reservation>();

  for (let i = 0; i < snapshot.length; i++) {
    const r = initByClient.get(snapshot[i].clientId);
    if (!r) continue;
    if (r.status === "rejected") {
      snapshot[i].status = "rejected";
      snapshot[i].message = r.reason;
      snapshot[i].reasonCode = r.reasonCode;
    } else if (r.status === "ready" && r.uploadId && r.path && r.signedUrl) {
      reservedById.set(r.uploadId, {
        uploadId: r.uploadId,
        path: r.path,
        signedUrl: r.signedUrl,
        idx: i,
      });
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

  // 3) Subida de cada archivo en un único PUT. Concurrencia 2 para no
  //    saturar 4G; cada archivo va entero, sin chunking.
  const CONCURRENCY = 2;
  const results: Array<{
    uploadId: string;
    path: string;
    success: boolean;
    errorMessage?: string;
  }> = [];

  async function uploadOne(uploadId: string): Promise<void> {
    const reservation = reservedById.get(uploadId);
    if (!reservation) return;
    const { idx, path, signedUrl } = reservation;
    const file = files[idx];

    snapshot[idx].status = "uploading";
    snapshot[idx].percent = 0;
    snapshot[idx].bytesUploaded = 0;
    fire();

    // eslint-disable-next-line no-console
    console.info(
      "[direct-upload] subiendo",
      file.name,
      `(${(file.size / 1024 / 1024).toFixed(1)} MB) →`,
      path
    );

    const r = await putToSignedUrl(signedUrl, file, (uploaded) => {
      snapshot[idx].bytesUploaded = uploaded;
      snapshot[idx].percent = Math.round((uploaded / file.size) * 100);
      fire();
    });

    if (r.ok) {
      snapshot[idx].status = "uploaded";
      snapshot[idx].percent = 100;
      snapshot[idx].bytesUploaded = file.size;
      fire();
      results.push({ uploadId, path, success: true });
      return;
    }

    // eslint-disable-next-line no-console
    console.error("[direct-upload] error subiendo", file.name, {
      status: r.status,
      body: r.body,
    });

    let userMsg: string;
    if (r.status === 401 || r.status === 403) {
      userMsg = "Permisos denegados por el almacenamiento. Recarga la página y vuelve a intentarlo.";
    } else if (r.status === 413) {
      userMsg = "El archivo es demasiado grande para el almacenamiento.";
    } else if (r.status >= 500) {
      userMsg = `Error temporal en el servidor (HTTP ${r.status}). Reintenta en unos minutos.`;
    } else if (r.status === 0) {
      userMsg =
        "No se pudo completar la subida. Tu red parece inestable: prueba con WiFi o donde tengas mejor cobertura, y vuelve a intentarlo.";
    } else {
      userMsg = `Error subiendo el archivo (HTTP ${r.status}).`;
    }

    snapshot[idx].status = "error";
    snapshot[idx].message = userMsg;
    fire();
    results.push({
      uploadId,
      path,
      success: false,
      errorMessage: userMsg,
    });
  }

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
