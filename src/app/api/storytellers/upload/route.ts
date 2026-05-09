/**
 * POST /api/storytellers/upload
 *
 * Paso 2 del uploader. Recibe multipart/form-data:
 *   - sessionToken: string (devuelto por validate-booking)
 *   - files: 1..N File[] (entry repetida)
 *
 * Para cada archivo:
 *   - Valida tipo + tamaño
 *   - Sube a bucket privado `storyteller-uploads/bookings/{booking_id}/{upload_id}.{ext}`
 *   - Crea registro en `storyteller_uploads`
 *   - Suma puntos en ledger
 *   - Tras procesar todos: si es la 1ª subida del email → cupón instant 3%
 *   - Tras procesar todos: sincroniza cupón con saldo (si cruza umbral)
 *
 * Devuelve resumen de la operación + URL "Mis puntos" firmada.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyUploadSessionToken } from "@/app/api/storytellers/validate-booking/route";
import {
  ALLOWED_PHOTO_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MIN_PHOTOS_PER_UPLOAD_BATCH,
  POINTS_PER_PHOTO_UPLOAD,
  POINTS_PER_VIDEO_UPLOAD,
  normalizeEmail,
} from "@/lib/storytellers/config";
import { checkUploadCapacity } from "@/lib/storytellers/booking-validation";
import {
  createInstantFirstUploadCouponIfNeeded,
  getBalance,
  syncCouponWithBalance,
} from "@/lib/storytellers/points";
import { buildMyPointsUrl } from "@/lib/storytellers/magic-link";
import { sendUploadConfirmationEmail } from "@/lib/storytellers/emails";

const STORAGE_BUCKET = "storyteller-uploads";

interface UploadResultItem {
  filename: string;
  status: "ok" | "rejected";
  reason?: string;
  /** Código corto de motivo (ej. "duplicate", "size", "format", "storage", "db") */
  reasonCode?: string;
  uploadId?: string;
  points?: number;
}

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
  return fromName ? fromName.toLowerCase().slice(0, 6) : "bin";
}

function isPhoto(mime: string): boolean {
  return (ALLOWED_PHOTO_MIME_TYPES as readonly string[]).includes(mime);
}
function isVideo(mime: string): boolean {
  return (ALLOWED_VIDEO_MIME_TYPES as readonly string[]).includes(mime);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const sessionToken = formData.get("sessionToken");
    if (typeof sessionToken !== "string") {
      return NextResponse.json({ ok: false, error: "Sesión no válida." }, { status: 400 });
    }
    const session = verifyUploadSessionToken(sessionToken);
    if (!session.ok) {
      return NextResponse.json(
        { ok: false, error: "Tu sesión ha caducado. Vuelve al paso anterior." },
        { status: 401 }
      );
    }

    const filesRaw = formData.getAll("files");
    const files = filesRaw.filter((f): f is File => typeof f === "object" && f !== null && "size" in f);
    if (files.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No has adjuntado ningún archivo." },
        { status: 400 }
      );
    }

    // Conteo previo
    const photoCount = files.filter((f) => isPhoto(f.type)).length;
    const videoCount = files.filter((f) => isVideo(f.type)).length;
    const otherCount = files.length - photoCount - videoCount;

    if (otherCount > 0) {
      return NextResponse.json(
        { ok: false, error: "Algunos archivos no tienen un formato aceptado." },
        { status: 400 }
      );
    }

    // Lote mínimo: 3 fotos OR 1 vídeo
    const meetsBatchMin = photoCount >= MIN_PHOTOS_PER_UPLOAD_BATCH || videoCount >= 1;
    if (!meetsBatchMin) {
      return NextResponse.json(
        {
          ok: false,
          error: `Lote mínimo: ${MIN_PHOTOS_PER_UPLOAD_BATCH} fotos o 1 vídeo. Has subido ${photoCount} fotos y ${videoCount} vídeos.`,
        },
        { status: 400 }
      );
    }

    // Conteo actual en BD para validar topes
    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("storyteller_uploads")
      .select("file_type")
      .eq("booking_id", session.bookingId);

    const existingPhotos = (existing || []).filter((u) => u.file_type === "photo").length;
    const existingVideos = (existing || []).filter((u) => u.file_type === "video").length;

    const normalizedEmailEarly = normalizeEmail(session.email);

    // Carga TODOS los hashes ya subidos por este email para detectar
    // duplicados antes de hacer upload a Storage. La comparación es por
    // customer_email (identidad maestra del programa), NO por booking_id,
    // para evitar trampas del tipo "subo la misma foto en otra reserva".
    const { data: existingHashesRows } = await supabase
      .from("storyteller_uploads")
      .select("file_hash, original_filename")
      .eq("customer_email", normalizedEmailEarly)
      .not("file_hash", "is", null);

    const existingHashes = new Set<string>(
      (existingHashesRows || [])
        .map((r) => (r as { file_hash: string | null }).file_hash)
        .filter((h): h is string => Boolean(h))
    );

    // Y el nombre + nº de reserva para personalizar el código del cupón
    // y el email de confirmación (un único lookup).
    const { data: bookingRowEarly } = await supabase
      .from("bookings")
      .select("customer_name, booking_number")
      .eq("id", session.bookingId)
      .maybeSingle();
    const customerNameForCoupon = (bookingRowEarly?.customer_name as string | null) || null;
    const bookingNumberHuman =
      (bookingRowEarly?.booking_number as string | null) || session.bookingId;

    const cap = checkUploadCapacity({
      existingPhotos,
      existingVideos,
      newPhotos: photoCount,
      newVideos: videoCount,
    });
    if (!cap.ok) {
      return NextResponse.json({ ok: false, error: cap.message }, { status: 400 });
    }

    // Procesar cada archivo
    const items: UploadResultItem[] = [];
    let totalPointsAwarded = 0;
    const normalizedEmail = normalizedEmailEarly;
    // Hashes vistos en este mismo lote (evita aceptar dos veces el mismo
    // archivo dentro del propio request).
    const seenInBatch = new Set<string>();

    for (const file of files) {
      const fileType: "photo" | "video" = isPhoto(file.type) ? "photo" : "video";
      const maxSize = fileType === "photo" ? MAX_PHOTO_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
      if (file.size > maxSize) {
        items.push({
          filename: file.name || "archivo",
          status: "rejected",
          reason: `El archivo supera el tamaño máximo permitido (${(maxSize / (1024 * 1024)).toFixed(0)} MB).`,
          reasonCode: "size",
        });
        continue;
      }

      const arrayBuf = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);

      // SHA-256 del contenido — identidad de archivo para anti-duplicados
      const fileHash = createHash("sha256").update(buffer).digest("hex");

      if (existingHashes.has(fileHash) || seenInBatch.has(fileHash)) {
        items.push({
          filename: file.name || "archivo",
          status: "rejected",
          reason:
            "Este archivo ya lo habías subido antes. No se sube dos veces.",
          reasonCode: "duplicate",
        });
        continue;
      }

      const uploadId = randomUUID();
      const ext = getMimeExtension(file.type, file.name || "");
      const path = `bookings/${session.bookingId}/${uploadId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("[storytellers/upload] storage error:", uploadError);
        items.push({
          filename: file.name || "archivo",
          status: "rejected",
          reason: "Error de almacenamiento. Inténtalo más tarde.",
          reasonCode: "storage",
        });
        continue;
      }

      const points = fileType === "photo" ? POINTS_PER_PHOTO_UPLOAD : POINTS_PER_VIDEO_UPLOAD;

      const { error: insertError } = await supabase
        .from("storyteller_uploads")
        .insert({
          id: uploadId,
          booking_id: session.bookingId,
          customer_email: normalizedEmail,
          customer_name: customerNameForCoupon || null,
          file_url: path, // path interno; URL firmada se genera bajo demanda
          file_path: path,
          file_type: fileType,
          file_size_bytes: file.size,
          file_mime_type: file.type,
          file_hash: fileHash,
          original_filename: file.name?.slice(0, 300) || null,
          points_at_upload: points,
        });

      if (insertError) {
        console.error("[storytellers/upload] insert error:", insertError);
        // Intenta limpiar el archivo huérfano
        await supabase.storage.from(STORAGE_BUCKET).remove([path]);
        items.push({
          filename: file.name || "archivo",
          status: "rejected",
          reason: "Error registrando la subida.",
          reasonCode: "db",
        });
        continue;
      }

      // Ledger
      await supabase.from("storyteller_points_ledger").insert({
        customer_email: normalizedEmail,
        delta: points,
        reason: fileType === "photo" ? "upload_photo" : "upload_video",
        related_upload_id: uploadId,
        related_booking_id: session.bookingId,
      });

      seenInBatch.add(fileHash);
      existingHashes.add(fileHash);
      totalPointsAwarded += points;
      items.push({
        filename: file.name || "archivo",
        status: "ok",
        uploadId,
        points,
      });
    }

    const okCount = items.filter((i) => i.status === "ok").length;

    let instantCouponInfo: { code: string; pct: number; validUntil: string } | null = null;
    let thresholdCouponInfo: { code: string; pct: number; validUntil: string } | null = null;

    if (okCount > 0) {
      const instant = await createInstantFirstUploadCouponIfNeeded({
        email: normalizedEmail,
        bookingId: session.bookingId,
        customerName: customerNameForCoupon,
      });
      if (instant.created && instant.coupon) {
        instantCouponInfo = {
          code: instant.coupon.code,
          pct: instant.coupon.pct,
          validUntil: instant.coupon.validUntil,
        };
      }

      const sync = await syncCouponWithBalance(normalizedEmail, customerNameForCoupon);
      if (sync.generated && sync.newCoupon) {
        thresholdCouponInfo = {
          code: sync.newCoupon.code,
          pct: sync.newCoupon.pct,
          validUntil: sync.newCoupon.validUntil,
        };
      }
    }

    const balanceAfter = await getBalance(normalizedEmail);
    const myPointsUrl = buildMyPointsUrl(normalizedEmail, "es");

    if (okCount > 0) {
      try {
        await sendUploadConfirmationEmail({
          email: normalizedEmail,
          bookingNumber: bookingNumberHuman,
          acceptedCount: okCount,
          pointsAwarded: totalPointsAwarded,
          balanceAfter,
          instantCoupon: instantCouponInfo,
          thresholdCoupon: thresholdCouponInfo,
        });
      } catch (e) {
        console.error("[storytellers/upload] confirmation email error:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      summary: {
        accepted: okCount,
        rejected: items.length - okCount,
        pointsAwarded: totalPointsAwarded,
        balanceAfter,
        instantCoupon: instantCouponInfo,
        thresholdCoupon: thresholdCouponInfo,
      },
      items,
      myPointsUrl,
    });
  } catch (e) {
    console.error("[storytellers/upload]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}

// Aumentamos el límite del body para permitir vídeos hasta ~500 MB.
// Next.js 14 App Router permite configurar el bodyParser size por route segment.
export const runtime = "nodejs";
export const maxDuration = 300; // 5 min (Vercel Pro)
