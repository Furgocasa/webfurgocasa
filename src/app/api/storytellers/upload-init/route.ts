/**
 * POST /api/storytellers/upload-init
 *
 * Paso 1 del nuevo flujo de upload directo (signed URL + tus resumable).
 * El cliente envía METADATA de los archivos (sin el contenido). El server
 * valida cuotas, formatos y deduplicación, reserva un path por archivo y
 * devuelve un "ticket" HMAC que el cliente presentará a /upload-confirm.
 *
 * Body JSON:
 *   {
 *     sessionToken: string,        // de validate-booking
 *     files: [
 *       {
 *         filename: string,
 *         mimeType: string,
 *         sizeBytes: number,
 *         sha256: string           // hex 64 chars, calculado en cliente con WebCrypto
 *       },
 *       ...
 *     ]
 *   }
 *
 * Response:
 *   {
 *     ok: true,
 *     ticket: string,              // HMAC, presentar a /upload-confirm
 *     expiresAt: number,
 *     supabaseUrl: string,         // SUPABASE_URL para el cliente
 *     anonKey: string,             // ANON_KEY (es pública en cualquier caso)
 *     bucket: "storyteller-uploads",
 *     uploads: [
 *       {
 *         clientId: string,        // mismo que el cliente envió, para mapear
 *         status: "ready" | "rejected",
 *         path?: string,           // bookings/<bookingId>/<uuid>.<ext>
 *         uploadId?: string,       // UUID que será el id en BD
 *         reason?: string,
 *         reasonCode?: "duplicate" | "size" | "format" | "quota"
 *       },
 *       ...
 *     ]
 *   }
 *
 * Códigos HTTP:
 *   200 - validación parcial OK (algunos rechazados)
 *   400 - request mal formada (JSON, schema, lote mínimo, formato no aceptado)
 *   401 - sessionToken inválido / expirado
 *   500 - error interno
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyUploadSessionToken } from "@/app/api/storytellers/validate-booking/route";
import {
  ALLOWED_PHOTO_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MIN_PHOTOS_PER_UPLOAD_BATCH,
  normalizeEmail,
  storytellerEffectiveMime,
} from "@/lib/storytellers/config";
import { checkUploadCapacity } from "@/lib/storytellers/booking-validation";
import {
  createUploadTicket,
  type ReservedFile,
} from "@/lib/storytellers/upload-ticket";

const STORAGE_BUCKET = "storyteller-uploads";

const fileSchema = z.object({
  /** ID arbitrario del cliente (lo usa para mapear respuestas). */
  clientId: z.string().min(1).max(80),
  filename: z.string().min(1).max(300),
  mimeType: z.string().max(120),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024 * 1024), // hard cap 10 GB
  sha256: z.string().regex(/^[a-f0-9]{64}$/, "sha256 inválido"),
});

const bodySchema = z.object({
  sessionToken: z.string(),
  files: z.array(fileSchema).min(1).max(120),
});

function getMimeExtension(mime: string, originalName: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/x-quicktime": "mov",
  };
  if (map[mime]) return map[mime];
  const fromName = originalName.split(".").pop();
  return fromName ? fromName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 6) || "bin" : "bin";
}

function isPhoto(mime: string): boolean {
  return (ALLOWED_PHOTO_MIME_TYPES as readonly string[]).includes(mime);
}
function isVideo(mime: string): boolean {
  return (ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(mime);
}

interface UploadEntryReady {
  clientId: string;
  status: "ready";
  path: string;
  uploadId: string;
  /** URL firmada para subir directamente (PUT único, sin chunking). */
  signedUrl: string;
  /** Token a presentar en el header `x-upsert` o como query param. */
  signedToken: string;
}
interface UploadEntryRejected {
  clientId: string;
  status: "rejected";
  reason: string;
  reasonCode: "duplicate" | "size" | "format" | "quota";
}
type UploadEntry = UploadEntryReady | UploadEntryRejected;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Petición no válida.", details: parsed.error.issues.slice(0, 3) },
        { status: 400 }
      );
    }
    const { sessionToken, files: rawFiles } = parsed.data;
    const files = rawFiles.map((f) => ({
      ...f,
      mimeType: storytellerEffectiveMime(f.filename, f.mimeType),
    }));

    const session = verifyUploadSessionToken(sessionToken);
    if (!session.ok) {
      return NextResponse.json(
        { ok: false, error: "Tu sesión ha caducado. Vuelve al paso anterior." },
        { status: 401 }
      );
    }

    // ---------------- Validación de lote ----------------
    let photoCount = 0;
    let videoCount = 0;
    for (const f of files) {
      if (isPhoto(f.mimeType)) photoCount++;
      else if (isVideo(f.mimeType)) videoCount++;
    }
    const otherCount = files.length - photoCount - videoCount;
    if (otherCount > 0) {
      return NextResponse.json(
        { ok: false, error: "Algunos archivos no tienen un formato aceptado." },
        { status: 400 }
      );
    }
    const meetsBatchMin =
      photoCount >= MIN_PHOTOS_PER_UPLOAD_BATCH || videoCount >= 1;
    if (!meetsBatchMin) {
      return NextResponse.json(
        {
          ok: false,
          error: `Lote mínimo: ${MIN_PHOTOS_PER_UPLOAD_BATCH} fotos o 1 vídeo. Has indicado ${photoCount} fotos y ${videoCount} vídeos.`,
        },
        { status: 400 }
      );
    }

    // ---------------- Conteo en BD para topes y dedupe ----------------
    const supabase = createAdminClient();
    const normalizedEmail = normalizeEmail(session.email);

    const { data: existingByBooking } = await supabase
      .from("storyteller_uploads")
      .select("file_type")
      .eq("booking_id", session.bookingId);

    const existingPhotos = (existingByBooking || []).filter((u) => u.file_type === "photo")
      .length;
    const existingVideos = (existingByBooking || []).filter((u) => u.file_type === "video")
      .length;

    // Capacity check global del lote (no se acepta nada si rebasa)
    const cap = checkUploadCapacity({
      existingPhotos,
      existingVideos,
      newPhotos: photoCount,
      newVideos: videoCount,
    });
    if (cap.ok === false) {
      return NextResponse.json({ ok: false, error: cap.message }, { status: 400 });
    }

    // Hashes ya subidos por este email — para dedupe.
    const { data: hashRows } = await supabase
      .from("storyteller_uploads")
      .select("file_hash")
      .eq("customer_email", normalizedEmail)
      .not("file_hash", "is", null);
    const existingHashes = new Set<string>(
      (hashRows || [])
        .map((r) => (r as { file_hash: string | null }).file_hash)
        .filter((h): h is string => Boolean(h))
    );

    // ---------------- Generar paths reservados + filtrar duplicados ----------------
    const seenInBatch = new Set<string>();
    const entries: UploadEntry[] = [];
    const reserved: ReservedFile[] = [];

    for (const f of files) {
      const fileType: "photo" | "video" = isPhoto(f.mimeType) ? "photo" : "video";
      const max = fileType === "photo" ? MAX_PHOTO_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
      if (f.sizeBytes > max) {
        entries.push({
          clientId: f.clientId,
          status: "rejected",
          reason: `El archivo supera el tamaño máximo permitido (${(max / (1024 * 1024)).toFixed(0)} MB).`,
          reasonCode: "size",
        });
        continue;
      }
      if (existingHashes.has(f.sha256) || seenInBatch.has(f.sha256)) {
        entries.push({
          clientId: f.clientId,
          status: "rejected",
          reason: "Este archivo ya lo habías subido antes. No se sube dos veces.",
          reasonCode: "duplicate",
        });
        continue;
      }

      const uploadId = randomUUID();
      const ext = getMimeExtension(f.mimeType, f.filename);
      const path = `bookings/${session.bookingId}/${uploadId}.${ext}`;

      // Generamos una signed upload URL por archivo: el cliente la usará
      // para hacer un PUT/POST único al endpoint de Supabase Storage sin
      // necesitar autenticación. Es válida 2 horas (suficiente para subir
      // hasta 3 GB en una conexión razonable).
      const { data: signed, error: signedError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(path);

      if (signedError || !signed) {
        console.error("[storytellers/upload-init] createSignedUploadUrl error:", signedError);
        entries.push({
          clientId: f.clientId,
          status: "rejected",
          reason: "No se pudo preparar el almacenamiento. Inténtalo en unos segundos.",
          reasonCode: "quota",
        });
        continue;
      }

      seenInBatch.add(f.sha256);
      entries.push({
        clientId: f.clientId,
        status: "ready",
        path,
        uploadId,
        signedUrl: signed.signedUrl,
        signedToken: signed.token,
      });
      reserved.push({
        uploadId,
        path,
        fileType,
        mimeType: f.mimeType,
        fileSizeBytes: f.sizeBytes,
        sha256: f.sha256,
        originalFilename: f.filename.slice(0, 300),
      });
    }

    // Si TODOS quedaron rechazados, devolvemos 200 con la lista (el cliente
    // ya muestra los reasonCodes al usuario), pero no emitimos ticket.
    if (reserved.length === 0) {
      return NextResponse.json({
        ok: true,
        ticket: null,
        uploads: entries,
        message: "Ningún archivo elegible (todos duplicados o exceden tamaño).",
      });
    }

    const { token: ticket, expiresAt } = createUploadTicket(
      session.bookingId,
      normalizedEmail,
      reserved
    );

    // Devolvemos también la URL pública de Supabase y la anon key porque el
    // cliente las necesita para hablar con el endpoint /upload/resumable.
    // La anon key es pública por diseño, no es un secreto.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      console.error("[storytellers/upload-init] faltan envs NEXT_PUBLIC_SUPABASE_*");
      return NextResponse.json(
        { ok: false, error: "Configuración del servidor incompleta." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      ticket,
      expiresAt,
      supabaseUrl,
      anonKey,
      bucket: STORAGE_BUCKET,
      uploads: entries,
    });
  } catch (e) {
    console.error("[storytellers/upload-init]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}

export const runtime = "nodejs";
