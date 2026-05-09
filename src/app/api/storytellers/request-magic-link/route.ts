/**
 * POST /api/storytellers/request-magic-link
 *
 * El cliente introduce su email en /storytellers/mis-puntos.
 * Generamos un magic link y se lo enviamos por email.
 *
 * Por seguridad: NO indicamos si el email tiene actividad o no.
 * Siempre devolvemos el mismo mensaje genérico (success).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/smtp-client";
import { getEmailBaseTemplate } from "@/lib/email/templates";
import { buildMyPointsUrl } from "@/lib/storytellers/magic-link";
import { verifyRecaptcha } from "@/lib/storytellers/recaptcha";
import { normalizeEmail } from "@/lib/storytellers/config";
import { getBalance } from "@/lib/storytellers/points";

const schema = z.object({
  email: z.string().trim().email().max(254),
  recaptchaToken: z.string().optional(),
  companyWebsite: z.string().optional(),
});

const GENERIC_RESPONSE = {
  ok: true,
  message:
    "Si tu email está asociado a alguna actividad en el programa Storytellers, te hemos enviado un enlace para acceder.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (typeof body?.companyWebsite === "string" && body.companyWebsite.trim().length > 0) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const captcha = await verifyRecaptcha(parsed.data.recaptchaToken, "storytellers_magic");
    if (!captcha.ok) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const email = normalizeEmail(parsed.data.email);
    const balance = await getBalance(email);

    // Solo enviamos email si HAY actividad. Pero nunca lo decimos.
    if (balance > 0) {
      const url = buildMyPointsUrl(email, "es");
      const html = getEmailBaseTemplate(buildBody(url), "Acceso a tu área Storytellers");
      await sendEmail({
        to: [email, "reservas@furgocasa.com"],
        subject: "[Furgocasa] Acceso a tu área Storytellers",
        html,
      });
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (e) {
    console.error("[storytellers/request-magic-link]", e);
    return NextResponse.json(GENERIC_RESPONSE);
  }
}

function buildBody(url: string): string {
  return `
    <tr>
      <td style="padding: 32px 24px; color: #111827; font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="margin: 0 0 16px; color: #063971; font-size: 22px;">Acceso a tu área Storytellers</h1>
        <p style="margin: 0 0 16px; font-size: 15px;">Has solicitado acceder a tu área privada del programa Storytellers de Furgocasa.</p>
        <p style="margin: 0 0 24px; font-size: 15px;">Pulsa el botón para entrar (válido 30 días):</p>
        <p style="margin: 0 0 24px;">
          <a href="${url}"
             style="display: inline-block; background: #f97316; color: #ffffff; text-decoration: none;
                    padding: 12px 24px; border-radius: 8px; font-weight: bold;">
            Ver mis puntos
          </a>
        </p>
        <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
          Si no has solicitado este enlace, ignora este mensaje.
        </p>
      </td>
    </tr>
  `;
}
