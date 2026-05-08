/**
 * POST /api/storytellers/validate-booking
 *
 * Paso 1 del uploader Storytellers: cliente introduce nº de reserva + email.
 * Devuelve un "session token" firmado HMAC válido 30 min, que permite
 * subir archivos en /api/storytellers/upload sin volver a validar.
 *
 * Validaciones:
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
} from "@/lib/storytellers/config";

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
      return NextResponse.json(
        { ok: false, error: "Validación de seguridad fallida. Recarga la página e inténtalo de nuevo." },
        { status: 403 }
      );
    }

    const result = await validateBookingForUpload({ bookingNumber, email });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.message, reason: result.reason },
        { status: 400 }
      );
    }

    const sessionToken = createUploadSessionToken(result.booking.bookingId, result.booking.customerEmail);

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
    });
  } catch (e) {
    console.error("[storytellers/validate-booking]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
