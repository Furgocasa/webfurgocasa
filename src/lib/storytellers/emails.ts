/**
 * Plantillas de emails del programa Storytellers.
 *
 * Tres flujos:
 *  1. Confirmación de subida (tras /api/storytellers/upload exitoso).
 *  2. Selección para archivo (tras admin marca como seleccionada — ya implementado en /api/admin/storyteller-uploads/[id]/select).
 *  3. Magic link de acceso (tras /api/storytellers/request-magic-link — ya implementado).
 *  4. Recordatorio post-viaje (cron 7 días después de dropoff_date).
 *
 * Esta utility centraliza los textos. Llamada desde los endpoints / cron.
 */

import { sendEmail } from "@/lib/email/smtp-client";
import { getEmailBaseTemplate } from "@/lib/email/templates";
import { buildMyPointsUrl } from "./magic-link";
import { MAX_DISCOUNT_PCT } from "./config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://www.furgocasa.com";

// ============================================
// 1. Email de confirmación de subida
// ============================================
export async function sendUploadConfirmationEmail(params: {
  email: string;
  bookingNumber: string;
  acceptedCount: number;
  pointsAwarded: number;
  balanceAfter: number;
  instantCoupon: { code: string; pct: number; validUntil: string } | null;
  thresholdCoupon: { code: string; pct: number; validUntil: string } | null;
}) {
  const { email, bookingNumber, acceptedCount, pointsAwarded, balanceAfter, instantCoupon, thresholdCoupon } =
    params;
  const myPointsUrl = buildMyPointsUrl(email, "es");
  const couponBlock = thresholdCoupon
    ? buildCouponBlock(thresholdCoupon.pct, thresholdCoupon.code, thresholdCoupon.validUntil, false)
    : instantCoupon
    ? buildCouponBlock(instantCoupon.pct, instantCoupon.code, instantCoupon.validUntil, true)
    : "";

  const content = `
    <tr>
      <td style="padding: 32px 24px; color: #111827; font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="margin: 0 0 16px; color: #063971; font-size: 22px;">¡Hemos recibido tu material!</h1>
        <p style="margin: 0 0 12px; font-size: 15px;">
          Has subido <strong>${acceptedCount} archivos</strong> de la reserva <strong>${bookingNumber}</strong>.
        </p>
        <p style="margin: 0 0 12px; font-size: 15px;">
          Sumas <strong>+${pointsAwarded} puntos</strong>. Saldo total: <strong>${balanceAfter} puntos</strong>.
        </p>
        ${couponBlock}
        <p style="margin: 24px 0 16px;">
          <a href="${myPointsUrl}"
             style="display: inline-block; background: #f97316; color: #ffffff; text-decoration: none;
                    padding: 12px 24px; border-radius: 8px; font-weight: bold;">
            Ver mis puntos
          </a>
        </p>
        <p style="margin: 16px 0 0; font-size: 13px; color: #6b7280;">
          En los próximos días el equipo Furgocasa revisará tu material para seleccionar piezas para nuestro archivo profesional.
          Cada selección te dará puntos extra.
        </p>
      </td>
    </tr>
  `;

  return sendEmail({
    to: email,
    subject: `[Furgocasa Storytellers] +${pointsAwarded} ptos por tu subida`,
    html: getEmailBaseTemplate(content, "Hemos recibido tu material"),
  });
}

function buildCouponBlock(pct: number, code: string, validUntil: string, isInstant: boolean): string {
  return `
    <div style="margin: 16px 0; padding: 16px; border: 2px dashed #f97316; border-radius: 8px; background: #fff7ed;">
      <p style="margin: 0 0 6px; font-weight: bold; color: #9a3412; font-size: 13px;">
        ${isInstant ? "Cupón de bienvenida desbloqueado" : "Has desbloqueado un nuevo cupón"}
      </p>
      <p style="margin: 0 0 4px; font-size: 22px; font-weight: bold; color: #9a3412;">${pct}% descuento</p>
      <p style="margin: 0; font-size: 13px; color: #9a3412;">
        Código: <strong style="font-family: monospace;">${code}</strong> · válido hasta ${validUntil}
      </p>
    </div>
  `;
}

// ============================================
// 4. Recordatorio post-viaje (cron)
// ============================================
export function buildPostTripReminderHtml(params: {
  customerName: string | null;
  bookingNumber: string;
  hasContent: boolean;
}): string {
  const { customerName, bookingNumber, hasContent } = params;
  const greeting = customerName ? `Hola ${customerName.split(" ")[0]},` : "Hola,";

  const inner = hasContent
    ? `
      <p style="margin: 0 0 16px; font-size: 15px;">
        ¿Has hecho fotos o vídeos durante tu viaje en Furgocasa? Súbelos al programa <strong>Storytellers</strong>
        y empieza a sumar puntos para descuentos en próximas reservas (hasta el <strong>${MAX_DISCOUNT_PCT}%</strong>).
      </p>
      <p style="margin: 0 0 16px; font-size: 14px; color: #4b5563;">
        Solo necesitas tu nº de reserva (${bookingNumber}) y este mismo email. Sin login.
      </p>
      <p style="margin: 0 0 24px;">
        <a href="${APP_URL}/es/storytellers/subir"
           style="display: inline-block; background: #f97316; color: #ffffff; text-decoration: none;
                  padding: 12px 24px; border-radius: 8px; font-weight: bold;">
          Subir mis fotos y vídeos
        </a>
      </p>
      <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
        Bonus de bienvenida: por tu primera subida válida (mín. 3 fotos o 1 vídeo) recibirás un cupón instantáneo del 3%.
      </p>
    `
    : "";

  return getEmailBaseTemplate(
    `
      <tr>
        <td style="padding: 32px 24px; color: #111827; font-family: Arial, sans-serif; line-height: 1.6;">
          <h1 style="margin: 0 0 16px; color: #063971; font-size: 22px;">${greeting}</h1>
          <p style="margin: 0 0 16px; font-size: 15px;">
            Esperamos que tu viaje con Furgocasa haya sido genial.
          </p>
          ${inner}
        </td>
      </tr>
    `,
    "¿Tienes fotos del viaje?"
  );
}
