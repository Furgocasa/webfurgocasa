/**
 * POST /api/contracts/validate-booking
 *
 * Paso 1 de la firma de contratos: el cliente introduce nº de reserva + email.
 * Si la reserva existe y el email coincide, devolvemos un token de sesión
 * firmado (HMAC, 30 min) que autoriza a firmar en /api/contracts/sign sin
 * volver a validar.
 *
 * Defensas: rate limit por IP + honeypot. Mensajes de error genéricos.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateBookingForSigning } from "@/lib/contracts/booking-validation";
import {
  createSignSessionToken,
  SIGN_SESSION_TTL_SEC,
  CONTRACT_DOCUMENTS,
} from "@/lib/contracts/config";
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";

const schema = z.object({
  bookingNumber: z.string().trim().min(2).max(40),
  email: z.string().trim().email().max(254),
  // honeypot
  companyWebsite: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`contract-validate:${ip}`, RATE_LIMIT_CONFIGS.PUBLIC_WRITE);
    if (!rl.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
        },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await req.json();

    // Honeypot: respuesta silenciosa
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
      // strictNullChecks=false en este proyecto no estrecha la unión; cast explícito.
      const fail = result as { message: string; reason: string };
      return NextResponse.json(
        { ok: false, error: fail.message, reason: fail.reason },
        { status: 400 }
      );
    }

    const sessionToken = createSignSessionToken(
      result.booking.bookingId,
      result.booking.customerEmail
    );

    return NextResponse.json({
      ok: true,
      session: {
        token: sessionToken,
        expiresInSec: SIGN_SESSION_TTL_SEC,
      },
      booking: {
        bookingNumber: result.booking.bookingNumber,
        customerName: result.booking.customerName,
        pickupDate: result.booking.pickupDate,
        dropoffDate: result.booking.dropoffDate,
        alreadySigned: result.booking.alreadySigned,
      },
      documents: CONTRACT_DOCUMENTS.map((d) => ({
        id: d.id,
        title: d.title,
      })),
    });
  } catch (e) {
    console.error("[contracts/validate-booking]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
