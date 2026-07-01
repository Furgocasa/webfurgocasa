/**
 * POST /api/rental-docs/validate-booking
 *
 * Paso 1 de la subida de documentación: el cliente introduce nº de reserva +
 * email. Si coinciden, devolvemos un token de sesión (HMAC, 30 min, el mismo de
 * la firma de contratos) y la lista de documentos ya subidos por conductor.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateBookingForSigning } from "@/lib/contracts/booking-validation";
import { createSignSessionToken, SIGN_SESSION_TTL_SEC } from "@/lib/contracts/config";
import { createAdminClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";

const schema = z.object({
  bookingNumber: z.string().trim().min(2).max(40),
  email: z.string().trim().email().max(254),
  companyWebsite: z.string().optional(), // honeypot
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`rental-docs-validate:${ip}`, RATE_LIMIT_CONFIGS.PUBLIC_WRITE);
    if (!rl.success) {
      return NextResponse.json(
        { ok: false, error: "Demasiados intentos. Espera un minuto e inténtalo de nuevo." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    if (typeof body?.companyWebsite === "string" && body.companyWebsite.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Datos no válidos." }, { status: 400 });
    }

    const { bookingNumber, email } = parsed.data;
    const result = await validateBookingForSigning({ bookingNumber, email });
    if (!result.ok) {
      const fail = result as { message: string; reason: string };
      return NextResponse.json({ ok: false, error: fail.message, reason: fail.reason }, { status: 400 });
    }

    const sessionToken = createSignSessionToken(
      result.booking.bookingId,
      result.booking.customerEmail
    );

    // Documentos ya subidos (metadata, sin imágenes).
    const supabase = createAdminClient();
    const { data: docs } = await supabase
      .from("rental_documents")
      .select("driver_index, driver_label, is_driver, doc_kind, ai_status, ai_notes, uploaded_at")
      .eq("booking_id", result.booking.bookingId)
      .order("driver_index", { ascending: true });

    return NextResponse.json({
      ok: true,
      session: { token: sessionToken, expiresInSec: SIGN_SESSION_TTL_SEC },
      booking: {
        bookingNumber: result.booking.bookingNumber,
        customerName: result.booking.customerName,
        pickupDate: result.booking.pickupDate,
        dropoffDate: result.booking.dropoffDate,
      },
      documents: docs || [],
    });
  } catch (e) {
    console.error("[rental-docs/validate-booking]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}

export const runtime = "nodejs";
