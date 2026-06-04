/**
 * POST /api/contracts/sign
 *
 * Paso 2 de la firma de contratos. Requiere el token de sesión devuelto por
 * /api/contracts/validate-booking. El cliente debe haber aceptado Y firmado
 * AMBOS documentos (condiciones + protección de datos): se valida también en
 * servidor (no solo en el cliente).
 *
 * Flujo:
 *  1. Verifica token de sesión (HMAC) -> bookingId + email.
 *  2. Recarga la reserva (datos para el sello/email).
 *  3. Genera el PDF combinado firmado (pdf-lib).
 *  4. Lo sube al bucket privado `signed-contracts`.
 *  5. Inserta el registro en `signed_contracts`.
 *  6. Envía el PDF por email al cliente y a la empresa.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import {
  verifySignSessionToken,
  SIGNED_CONTRACTS_BUCKET,
  CONTRACT_VERSION,
} from "@/lib/contracts/config";
import { generateSignedContractPdf } from "@/lib/contracts/pdf";
import {
  ALL_CONFIRMATION_IDS,
  findConfirmationLabel,
} from "@/lib/contracts/confirmations";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail, getCompanyEmail } from "@/lib/email/smtp-client";
import { getEmailBaseTemplate } from "@/lib/email/templates";
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";

// Firma PNG en dataURL. Límite generoso (~3MB en base64) para evitar abusos.
const MAX_SIGNATURE_CHARS = 3_000_000;
const pngDataUrl = z
  .string()
  .max(MAX_SIGNATURE_CHARS)
  .refine((s) => s.startsWith("data:image/png;base64,"), {
    message: "Firma no válida.",
  });

const schema = z.object({
  sessionToken: z.string().min(10),
  acceptedConditions: z.literal(true),
  acceptedDataProtection: z.literal(true),
  signatureConditions: pngDataUrl,
  signatureDataProtection: pngDataUrl,
  confirmations: z.array(z.string()).default([]),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BOTH_REQUIRED_MSG =
  "No se puede continuar con el alquiler. Debes aceptar y firmar ambos documentos.";

function formatPickupDateForSubject(pickupDate: string | null | undefined): string {
  if (!pickupDate) return "";
  const date = new Date(pickupDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Madrid",
  });
}

function buildSignedContractEmailSubject(params: {
  bookingNumber: string;
  vehicleInternalCode: string | null | undefined;
  pickupDate: string | null | undefined;
}): string {
  const parts = [`Reserva ${params.bookingNumber}`];
  const vehicle = params.vehicleInternalCode?.trim();
  parts.push(vehicle || "SIN ASIGNAR");
  const pickup = formatPickupDateForSubject(params.pickupDate);
  if (pickup) parts.push(pickup);
  return `Furgocasa | Contrato firmado - ${parts.join(" - ")}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`contract-sign:${ip}`, RATE_LIMIT_CONFIGS.PUBLIC_WRITE);
    if (!rl.success) {
      return NextResponse.json(
        { ok: false, error: "Demasiados intentos. Espera un minuto e inténtalo de nuevo." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      // Si falla por aceptación/firma faltante, devolvemos el mensaje claro.
      return NextResponse.json({ ok: false, error: BOTH_REQUIRED_MSG }, { status: 400 });
    }

    const {
      sessionToken,
      signatureConditions,
      signatureDataProtection,
      confirmations,
    } = parsed.data;

    // Todas las confirmaciones de puntos delicados son obligatorias.
    const confirmedSet = new Set(confirmations);
    const allConfirmed = ALL_CONFIRMATION_IDS.every((id) => confirmedSet.has(id));
    if (!allConfirmed) {
      return NextResponse.json({ ok: false, error: BOTH_REQUIRED_MSG }, { status: 400 });
    }
    const confirmationsDetail = ALL_CONFIRMATION_IDS.map((id) => ({
      id,
      label: findConfirmationLabel(id) || id,
    }));

    const session = verifySignSessionToken(sessionToken);
    if (!session.ok) {
      return NextResponse.json(
        { ok: false, error: "Tu sesión ha caducado. Vuelve a introducir tu nº de reserva." },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Recargar reserva (fuente de verdad para el sello/email)
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select(
        "id, booking_number, customer_email, customer_name, pickup_date, vehicle:vehicles(internal_code)"
      )
      .eq("id", session.bookingId)
      .maybeSingle();

    if (bookingErr || !booking) {
      return NextResponse.json(
        { ok: false, error: "No se ha encontrado la reserva." },
        { status: 404 }
      );
    }

    const customerEmail = (booking.customer_email || session.email).trim().toLowerCase();
    const signedAt = new Date();

    // URL base para descargar los PDFs originales (en serverless /public no se
    // incluye en el bundle de la función, hay que descargarlo por HTTP).
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin;

    // 1. Generar PDF combinado firmado
    const pdfBytes = await generateSignedContractPdf({
      bookingNumber: booking.booking_number,
      customerName: booking.customer_name,
      customerEmail,
      signedAt,
      ipAddress: ip,
      signatureConditions,
      signatureDataProtection,
      confirmations: confirmationsDetail,
      baseUrl,
    });
    const pdfBuffer = Buffer.from(pdfBytes);

    // 2. Subir al bucket privado
    const contractId = crypto.randomUUID();
    const storagePath = `${booking.id}/${contractId}.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from(SIGNED_CONTRACTS_BUCKET)
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadErr) {
      console.error("[contracts/sign] upload error:", uploadErr);
      return NextResponse.json(
        { ok: false, error: "No se pudo guardar el contrato firmado. Inténtalo de nuevo." },
        { status: 500 }
      );
    }

    // 3. Registrar en BD
    const { error: insertErr } = await (supabase as any)
      .from("signed_contracts")
      .insert({
        id: contractId,
        booking_id: booking.id,
        booking_number: booking.booking_number,
        customer_email: customerEmail,
        customer_name: booking.customer_name,
        accepted_conditions: true,
        accepted_data_protection: true,
        contract_version: CONTRACT_VERSION,
        confirmations: confirmationsDetail,
        signed_pdf_path: storagePath,
        signed_at: signedAt.toISOString(),
        ip_address: ip,
        user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
      });

    if (insertErr) {
      console.error("[contracts/sign] insert error:", insertErr);
      // El PDF ya está guardado; no bloqueamos al cliente por el registro,
      // pero avisamos en logs para reconciliación manual.
    }

    // 4. Email con el PDF adjunto (cliente + empresa)
    const filename = `Contrato-firmado-${booking.booking_number}.pdf`;
    const companyEmail = getCompanyEmail();
    const vehicleInternalCode =
      (booking.vehicle as { internal_code?: string | null } | null)?.internal_code ?? null;
    const pickupDateLabel = formatPickupDateForSubject(booking.pickup_date);

    const html = buildSignedContractEmail({
      customerName: booking.customer_name,
      bookingNumber: booking.booking_number,
      vehicleInternalCode,
      pickupDateLabel,
      signedAtLabel: signedAt.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Madrid",
      }),
    });

    const emailResult = await sendEmail({
      to: [customerEmail, companyEmail],
      subject: buildSignedContractEmailSubject({
        bookingNumber: booking.booking_number,
        vehicleInternalCode,
        pickupDate: booking.pickup_date,
      }),
      html,
      attachments: [
        { filename, content: pdfBuffer, contentType: "application/pdf" },
      ],
    });

    if (!emailResult.success) {
      console.error("[contracts/sign] email error:", emailResult.error);
    }

    return NextResponse.json({
      ok: true,
      bookingNumber: booking.booking_number,
      emailSent: emailResult.success,
    });
  } catch (e) {
    console.error("[contracts/sign]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}

function buildSignedContractEmail(params: {
  customerName: string | null;
  bookingNumber: string;
  vehicleInternalCode: string | null;
  pickupDateLabel: string;
  signedAtLabel: string;
}): string {
  const name = params.customerName?.trim().split(/\s+/)[0] || "cliente";
  const content = `
    <tr>
      <td style="padding: 30px 20px 20px 20px;">
        <h2 style="margin: 0 0 15px 0; color: #063971; font-size: 20px;">Contrato firmado correctamente</h2>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151;">Hola <strong>${name}</strong>,</p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151;">
          Hemos recibido tu firma del <strong>contrato de alquiler</strong> y del
          <strong>anexo de protección de datos</strong> de la reserva
          <strong>${params.bookingNumber}</strong>.
        </p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151;">
          Adjuntamos en este email el <strong>PDF del contrato firmado</strong> para tu archivo.
          También se ha enviado una copia a Furgocasa.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 16px 0;">
          <tr>
            <td style="background-color: #f4f4f5; border-radius: 8px; padding: 16px;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;">Nº de reserva: <strong style="color:#111827;">${params.bookingNumber}</strong></p>
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;">Vehículo: <strong style="color:#111827;">${params.vehicleInternalCode?.trim() || "SIN ASIGNAR"}</strong></p>
              ${params.pickupDateLabel ? `<p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280;">Inicio del alquiler: <strong style="color:#111827;">${params.pickupDateLabel}</strong></p>` : ""}
              <p style="margin: 0; font-size: 13px; color: #6b7280;">Fecha de firma: <strong style="color:#111827;">${params.signedAtLabel}</strong> (hora peninsular)</p>
            </td>
          </tr>
        </table>
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          Si no has sido tú quien ha firmado este contrato, contacta con nosotros respondiendo a este email.
        </p>
      </td>
    </tr>
  `;
  const previewParts = [
    `Reserva ${params.bookingNumber}`,
    params.vehicleInternalCode?.trim() || "SIN ASIGNAR",
    params.pickupDateLabel,
  ].filter(Boolean);
  return getEmailBaseTemplate(content, `Contrato firmado - ${previewParts.join(" - ")}`);
}
