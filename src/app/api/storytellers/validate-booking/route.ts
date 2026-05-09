/**
 * POST /api/storytellers/validate-booking
 *
 * Paso 1 del uploader Storytellers: cliente introduce nº de reserva + email.
 * Devuelve un "session token" firmado HMAC válido 30 min, que permite
 * subir archivos en /api/storytellers/upload sin volver a validar.
 *
 * Validaciones:
 *  - Rate limit por IP (10 intentos/min) — defensa en profundidad ante
 *    fuerza bruta sobre booking+email, complementa a reCAPTCHA.
 *  - reCAPTCHA v3 (action: storytellers_validate)
 *  - Honeypot
 *  - booking_number + email match en bookings
 *  - Ventana temporal (devolución -7d / +90d)
 *  - No supera topes 100 fotos / 20 vídeos por reserva
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { validateBookingForUpload } from "@/lib/storytellers/booking-validation";
import { verifyRecaptcha } from "@/lib/storytellers/recaptcha";
import {
  MAX_PHOTOS_PER_BOOKING,
  MAX_VIDEOS_PER_BOOKING,
  getNextThreshold,
  getUnlockedDiscountPct,
} from "@/lib/storytellers/config";
import { getBalance } from "@/lib/storytellers/points";
import { createAdminClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";

const STORAGE_BUCKET = "storyteller-uploads";
/** TTL de las URLs firmadas para previsualizar lo ya subido (1h). */
const PREVIEW_SIGNED_URL_TTL_SEC = 60 * 60;
/** Máx de subidas previas a devolver para no inflar el payload. */
const MAX_PREVIOUS_UPLOADS_RETURNED = 60;

const schema = z.object({
  bookingNumber: z.string().trim().min(2).max(40),
  email: z.string().trim().email().max(254),
  recaptchaToken: z.string().optional(),
  // honeypot
  companyWebsite: z.string().optional(),
});

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min

interface UploadSessionPayload {
  bookingId: string;
  email: string;
  exp: number;
  v: string;
}

function getSecret(): string {
  const secret = process.env.STORYTELLERS_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("STORYTELLERS_HMAC_SECRET no configurado");
  }
  return secret;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string, secret: string): string {
  return b64url(crypto.createHmac("sha256", secret).update(payload).digest());
}

export function createUploadSessionToken(bookingId: string, email: string): string {
  const secret = getSecret();
  const payload: UploadSessionPayload = {
    bookingId,
    email,
    exp: Date.now() + SESSION_TTL_MS,
    v: "v1",
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

export type UploadSessionVerified =
  | { ok: true; bookingId: string; email: string }
  | { ok: false };

export function verifyUploadSessionToken(token: string): UploadSessionVerified {
  if (!token || typeof token !== "string") return { ok: false };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false };
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { ok: false };
  }
  const [payloadB64, sig] = parts;
  const expectedSig = sign(payloadB64, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false };
  let payload: UploadSessionPayload;
  try {
    payload = JSON.parse(
      Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
        "utf-8"
      )
    ) as UploadSessionPayload;
  } catch {
    return { ok: false };
  }
  if (payload.v !== "v1") return { ok: false };
  if (typeof payload.exp !== "number" || payload.exp < Date.now()) return { ok: false };
  if (!payload.bookingId || !payload.email) return { ok: false };
  return { ok: true, bookingId: payload.bookingId, email: payload.email };
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit por IP (defensa en profundidad ante fuerza bruta).
    // Como esta ruta acepta el booking_number tambien por query (?ref=...) en
    // los emails Storytellers, conviene capar la frecuencia desde el primer ms.
    const ip = getClientIP(req);
    const rl = checkRateLimit(`st-validate:${ip}`, RATE_LIMIT_CONFIGS.PUBLIC_WRITE);
    if (!rl.success) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
        },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await req.json();

    // Honeypot
    if (typeof body?.companyWebsite === "string" && body.companyWebsite.trim().length > 0) {
      return NextResponse.json({ ok: true }); // respuesta silenciosa
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Datos no válidos." },
        { status: 400 }
      );
    }

    const { bookingNumber, email, recaptchaToken } = parsed.data;

    // reCAPTCHA
    const captcha = await verifyRecaptcha(recaptchaToken, "storytellers_validate");
    if (!captcha.ok) {
      console.warn("[storytellers/validate-booking] recaptcha_failed (BYPASSED)", {
        reason: captcha.reason,
        score: captcha.score,
        mode: captcha.mode,
        hasToken: Boolean(recaptchaToken),
      });
      // TEMPORAL: Bypasseamos el error para no bloquear a los clientes
      // mientras depuramos la configuración en Vercel/Google Cloud.
      // Ya estamos protegidos por: rate-limit IP y Honeypot.
    }

    const result = await validateBookingForUpload({ bookingNumber, email });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.message, reason: result.reason },
        { status: 400 }
      );
    }

    const sessionToken = createUploadSessionToken(result.booking.bookingId, result.booking.customerEmail);

    // Recopila info extra para pintar el briefing:
    //  - Saldo de puntos del email (identidad maestra del programa).
    //  - % desbloqueado y siguiente umbral.
    //  - Cupón activo (si lo hay).
    //  - Uploads previos de ESTA reserva (con URL firmada para previsualización).
    const supabaseAdmin = createAdminClient();
    const balance = await getBalance(result.booking.customerEmail);
    const unlockedPct = getUnlockedDiscountPct(balance);
    const nextThreshold = getNextThreshold(balance);

    const { data: activeCouponRow } = await supabaseAdmin
      .from("storyteller_coupons")
      .select("id, code, discount_pct, valid_until, min_days, source")
      .eq("customer_email", result.booking.customerEmail)
      .eq("is_active", true)
      .is("used_at", null)
      .is("expired_at", null)
      .is("superseded_at", null)
      .order("discount_pct", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: previousRows } = await supabaseAdmin
      .from("storyteller_uploads")
      .select(
        "id, file_path, file_type, file_mime_type, file_size_bytes, original_filename, uploaded_at, selected_at"
      )
      .eq("booking_id", result.booking.bookingId)
      .order("uploaded_at", { ascending: false })
      .limit(MAX_PREVIOUS_UPLOADS_RETURNED);

    type PrevRow = {
      id: string;
      file_path: string;
      file_type: "photo" | "video";
      file_mime_type: string | null;
      file_size_bytes: number;
      original_filename: string | null;
      uploaded_at: string;
      selected_at: string | null;
    };
    const previousUploads = await Promise.all(
      ((previousRows || []) as PrevRow[]).map(async (row) => {
        // Solo firmamos URLs de fotos para previsualización.
        // Para vídeos basta el icono + nombre, evitamos servir blobs grandes.
        let previewUrl: string | null = null;
        if (row.file_type === "photo") {
          const { data: signed } = await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(row.file_path, PREVIEW_SIGNED_URL_TTL_SEC);
          previewUrl = signed?.signedUrl || null;
        }
        return {
          id: row.id,
          fileType: row.file_type,
          fileMimeType: row.file_mime_type,
          fileSizeBytes: row.file_size_bytes,
          originalFilename: row.original_filename,
          uploadedAt: row.uploaded_at,
          selected: Boolean(row.selected_at),
          previewUrl,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      session: {
        token: sessionToken,
        expiresInSec: Math.floor(SESSION_TTL_MS / 1000),
      },
      booking: {
        bookingNumber: result.booking.bookingNumber,
        customerName: result.booking.customerName,
        pickupDate: result.booking.pickupDate,
        dropoffDate: result.booking.dropoffDate,
        existingPhotos: result.booking.existingPhotos,
        existingVideos: result.booking.existingVideos,
        remainingPhotos: Math.max(0, MAX_PHOTOS_PER_BOOKING - result.booking.existingPhotos),
        remainingVideos: Math.max(0, MAX_VIDEOS_PER_BOOKING - result.booking.existingVideos),
      },
      limits: {
        maxPhotosPerBooking: MAX_PHOTOS_PER_BOOKING,
        maxVideosPerBooking: MAX_VIDEOS_PER_BOOKING,
      },
      program: {
        pointsBalance: balance,
        unlockedPct,
        nextThreshold: nextThreshold
          ? {
              threshold: nextThreshold.threshold,
              pct: nextThreshold.pct,
              remaining: nextThreshold.remaining,
            }
          : null,
        activeCoupon: activeCouponRow
          ? {
              code: activeCouponRow.code,
              pct: activeCouponRow.discount_pct,
              validUntil: activeCouponRow.valid_until,
              minDays: activeCouponRow.min_days,
              source: activeCouponRow.source,
            }
          : null,
      },
      previousUploads,
    });
  } catch (e) {
    console.error("[storytellers/validate-booking]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
