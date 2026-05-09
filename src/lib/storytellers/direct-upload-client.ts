/**
 * Storytellers · Direct upload client (signed upload URL vía SDK oficial)
 *
 * El archivo va directamente del navegador a Supabase Storage usando
 * `supabase.storage.from(bucket).uploadToSignedUrl(path, token, file, …)`.
 *
 * Por qué NO seguimos con XHR manual
 * ------------------------------------
 * El cliente JS de Supabase inyecta siempre `apikey` + `Authorization` en
 * todas las peticiones a Storage. Sin esos headers el gateway responde
 * HTTP 400 aunque el FormData sea correcto (multipart + cacheControl).
 * Reimplementar eso a mano es frágil y ya nos costó varios intentos.
 *
 * Trade-off: fetch del SDK no expone `upload.onprogress`; durante la
 * subida mostramos estado «subiendo» sin porcentaje fino (solo salto a
 * 100 % al terminar). Fiabilidad > barra de progreso granular.
 */

"use client";

import { createClient } from "@supabase/supabase-js";
import { storytellerEffectiveMime } from "@/lib/storytellers/config";

// ---------- Tipos públicos ----------

export type FileStatus =
  | "idle"
  | "hashing"
  | "ready"
  | "uploading"
  | "uploaded"
  | "rejected"
  | "error"
  | "confirmed";

export interface FileProgress {
  clientId: string;
  filename: string;
  sizeBytes: number;
  status: FileStatus;
  percent: number;
  bytesUploaded: number;
  message?: string;
  reasonCode?: string;
  pointsAwarded?: number;
}

export interface DirectUploadCallbacks {
  onProgress?: (snapshot: FileProgress[]) => void;
  onComplete?: (summary: DirectUploadFinalSummary) => void;
}

export interface DirectUploadFinalSummary {
  ok: boolean;
  summary?: {
    accepted: number;
    rejected: number;
    pointsAwarded: number;
    balanceAfter: number;
    instantCoupon: { code: string; pct: number; validUntil: string } | null;
    thresholdCoupon: { code: string; pct: number; validUntil: string } | null;
  } | null;
  files: FileProgress[];
  items: Array<{
    filename: string;
    status: "ok" | "rejected";
    reason?: string;
    reasonCode?: string;
    points?: number;
  }>;
  myPointsUrl?: string;
  errorMessage?: string;
}

interface DirectUploadOptions {
  files: File[];
  sessionToken: string;
  callbacks?: DirectUploadCallbacks;
}

function hexFromBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, "0");
  }
  return s;
}

async function sha256OfFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return hexFromBuffer(digest);
}

/** Safari iOS a veces deja `File.type` vacío; Storage necesita un Content-Type coherente con el bucket. */
function fileWithExplicitMime(file: File, mime: string): File {
  if (file.type?.trim() || !mime) return file;
  try {
    return new File([file], file.name, { type: mime, lastModified: file.lastModified });
  } catch {
    return file;
  }
}

function storageErrorStatus(err: unknown): number {
  if (err && typeof err === "object") {
    const o = err as { statusCode?: number; status?: number };
    if (typeof o.statusCode === "number") return o.statusCode;
    if (typeof o.status === "number") return o.status;
  }
  return 400;
}

function storageErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Subida con el mismo código que la documentación oficial de Supabase.
 */
async function uploadViaSupabaseSdk(params: {
  supabaseUrl: string;
  anonKey: string;
  bucket: string;
  path: string;
  token: string;
  file: File;
}): Promise<{ ok: true } | { ok: false; status: number; body: string }> {
  const supabase = createClient(params.supabaseUrl, params.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error } = await supabase.storage.from(params.bucket).uploadToSignedUrl(params.path, params.token, params.file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return {
      ok: false,
      status: storageErrorStatus(error),
      body: storageErrorMessage(error),
    };
  }
  return { ok: true };
}

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

  const effectiveMimes = files.map((f) => storytellerEffectiveMime(f.name, f.type));

  const fire = () => callbacks?.onProgress?.([...snapshot]);
  fire();

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
      snapshot[i].message = e instanceof Error ? e.message : "No se pudo procesar el archivo (hash).";
    }
    fire();
  }

  const initBody = {
    sessionToken,
    files: snapshot
      .map((s, i) => {
        const hash = (s as FileProgress & { _sha256?: string })._sha256;
        if (!hash || s.status !== "ready") return null;
        return {
          clientId: s.clientId,
          filename: files[i].name,
          mimeType: effectiveMimes[i] ?? "",
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

  const {
    ticket,
    supabaseUrl,
    anonKey,
    bucket,
    uploads,
  } = initJson as {
    ticket: string | null;
    supabaseUrl: string;
    anonKey: string;
    bucket: string;
    uploads: Array<{
      clientId: string;
      status: "ready" | "rejected";
      path?: string;
      uploadId?: string;
      signedToken?: string;
      reason?: string;
      reasonCode?: string;
    }>;
  };

  const initByClient = new Map(uploads.map((u) => [u.clientId, u]));

  interface Reservation {
    uploadId: string;
    path: string;
    signedToken: string;
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
    } else if (r.status === "ready" && r.uploadId && r.path && r.signedToken) {
      reservedById.set(r.uploadId, {
        uploadId: r.uploadId,
        path: r.path,
        signedToken: r.signedToken,
        idx: i,
      });
    }
  }
  fire();

  if (!ticket || reservedById.size === 0) {
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
    const { idx, path, signedToken } = reservation;
    const raw = files[idx];
    const mime = effectiveMimes[idx] ?? "";
    const file = fileWithExplicitMime(raw, mime);

    snapshot[idx].status = "uploading";
    snapshot[idx].percent = 10;
    snapshot[idx].bytesUploaded = 0;
    fire();

    // eslint-disable-next-line no-console
    console.info(
      "[direct-upload] SDK upload",
      raw.name,
      `(${(raw.size / 1024 / 1024).toFixed(1)} MB) →`,
      `${bucket}/${path}`
    );

    const uploadResult = await uploadViaSupabaseSdk({
      supabaseUrl,
      anonKey,
      bucket,
      path,
      token: signedToken,
      file,
    });

    if (uploadResult.ok === false) {
      const { status, body } = uploadResult;

      // eslint-disable-next-line no-console
      console.error("[direct-upload] SDK error", raw.name, status, body);

      let userMsg: string;
      const bodyLow = body.toLowerCase();
      const looksLikeStorageMaxSize =
        status === 413 ||
        bodyLow.includes("maximum allowed size") ||
        bodyLow.includes("exceeded the maximum") ||
        (bodyLow.includes("exceeded") && bodyLow.includes("size")) ||
        bodyLow.includes("too large");
      const looksLikeMime =
        bodyLow.includes("mime") ||
        bodyLow.includes("content-type") ||
        bodyLow.includes("invalid type") ||
        bodyLow.includes("not allowed");

      if (status === 401 || status === 403) {
        userMsg = "Permisos denegados por el almacenamiento. Recarga la página y vuelve a intentarlo.";
      } else if (looksLikeMime) {
        userMsg =
          "El servidor no aceptó el tipo de archivo enviado. Si es un vídeo del iPhone (.mov), actualiza la página y vuelve a intentarlo; si sigue fallando, exporta el clip como MP4 desde Fotos y súbelo así.";
      } else if (looksLikeStorageMaxSize) {
        const mb = (raw.size / (1024 * 1024)).toFixed(1);
        userMsg =
          `Tu vídeo pesa ~${mb} MB y Supabase lo rechaza: el bucket «storyteller-uploads» tiene un «tamaño máximo por archivo» demasiado bajo ` +
          `(por defecto 50 MB si lo creaste a mano, u otro límite antiguo). En Supabase: ejecuta la migración ` +
          `supabase/migrations/20260509-storytellers-bucket-3gb-limit.sql (SQL Editor) para subirlo a 3 GB, ` +
          `o Dashboard → Storage → bucket → límites.`;
      } else if (status >= 500) {
        userMsg = `Error temporal en el servidor (HTTP ${status}). Reintenta en unos minutos.`;
      } else if (body.toLowerCase().includes("network")) {
        userMsg =
          "No se pudo completar la subida. Tu red parece inestable: prueba con WiFi o donde tengas mejor cobertura, y vuelve a intentarlo.";
      } else {
        userMsg = `Error subiendo el archivo (HTTP ${status}). ${body.slice(0, 120)}`;
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
      return;
    }

    snapshot[idx].status = "uploaded";
    snapshot[idx].percent = 100;
    snapshot[idx].bytesUploaded = raw.size;
    fire();
    results.push({ uploadId, path, success: true });
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
