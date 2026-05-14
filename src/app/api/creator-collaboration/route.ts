import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail, getCompanyEmail } from "@/lib/email/smtp-client";

const MAX_REQUESTED_DAYS = 14;

/**
 * Devuelve la etiqueta de nivel (Tiny / Light / Standard / Premium) según los
 * días de cesión. >7 → caso a valorar fuera de tabla.
 * Sincronizado con `COLLAB_LEVELS` y `levelFromDays` en
 * `src/components/content-creators/creator-application-form.tsx`.
 */
function levelTagFromDays(days: number): "Tiny" | "Light" | "Standard" | "Premium" | "Fuera de tabla" {
  if (days <= 1) return "Tiny";
  if (days <= 3) return "Light";
  if (days <= 5) return "Standard";
  if (days <= 7) return "Premium";
  return "Fuera de tabla";
}

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(6).max(40),
  cityCountry: z.string().trim().min(2).max(200),
  instagram: z.string().trim().max(120).optional().or(z.literal("")),
  tiktok: z.string().trim().max(120).optional().or(z.literal("")),
  portfolioUrl: z.union([z.literal(""), z.string().trim().url().max(2000)]),
  creatorType: z.string().trim().min(1).max(120),
  equipment: z.enum(["movil", "camara", "ambos"]),
  shootsRawLog: z.enum(["si", "no", "no_se"]),
  workExamplesUrl: z.string().trim().url().max(2000),
  requestedDays: z.coerce.number().int().min(1).max(MAX_REQUESTED_DAYS),
  proposal: z.string().trim().min(40).max(8000),
  contentToDeliver: z.string().trim().min(20).max(8000),
  destinationsStyle: z.string().trim().max(8000).optional().or(z.literal("")),
  workedWithBrands: z.enum(["si", "no", "prefiero_no_decir"]),
  privacyAccepted: z.boolean().refine((v) => v === true, { message: "required" }),
  rightsAccepted: z.boolean().refine((v) => v === true, { message: "required" }),
  deliveryRefundAccepted: z.boolean().refine((v) => v === true, { message: "required" }),
});

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Anti-spam: honeypot rellenado → respuesta silenciosa
    if (typeof body?.companyWebsite === "string" && body.companyWebsite.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }
    const { companyWebsite: _drop, ...rest } = body ?? {};
    const parsed = schema.safeParse(rest);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Datos no válidos. Revisa los campos obligatorios." },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const levelTag = levelTagFromDays(d.requestedDays);

    const rows: [string, string][] = [
      ["Nombre", d.name],
      ["Email", d.email],
      ["Teléfono / WhatsApp", d.phone],
      ["Ciudad / país", d.cityCountry],
      ["Instagram", d.instagram || "—"],
      ["TikTok", d.tiktok || "—"],
      ["Web / portfolio", d.portfolioUrl || "—"],
      ["Tipo de creador", d.creatorType],
      ["Equipo", d.equipment],
      [
        "Forma de entrega habitual",
        d.shootsRawLog === "si"
          ? "Cámara dedicada (RAW + LOG/flat)"
          : d.shootsRawLog === "no"
            ? "Móvil de alta gama (material listo)"
            : "Otro / lo explica en la propuesta",
      ],
      ["Enlace ejemplos de trabajo", d.workExamplesUrl],
      [
        "Días solicitados / nivel",
        `${d.requestedDays} ${d.requestedDays === 1 ? "día" : "días"} → nivel ${levelTag}`,
      ],
      ["Propuesta de colaboración", d.proposal],
      ["Contenido a entregar", d.contentToDeliver],
      ["Destinos / estilo de viaje", d.destinationsStyle || "—"],
      [
        "¿Ha trabajado con marcas?",
        d.workedWithBrands === "prefiero_no_decir" ? "Prefiero no decir" : d.workedWithBrands === "si" ? "Sí" : "No",
      ],
      ["Acepta cesión perpetua mundial", d.rightsAccepted ? "Sí" : "No"],
      [
        "Acepta cobro de alquiler + reembolso al entregar",
        d.deliveryRefundAccepted ? "Sí" : "No",
      ],
    ];

    const html = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111">
  <h1 style="color:#063971">Nueva solicitud — programa creadores FURGOCASA</h1>
  <table style="border-collapse:collapse;max-width:720px">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="vertical-align:top;padding:8px 16px 8px 0;font-weight:600;border-bottom:1px solid #eee">${escapeHtml(
            k
          )}</td><td style="padding:8px 0;border-bottom:1px solid #eee;white-space:pre-wrap">${escapeHtml(
            v
          )}</td></tr>`
      )
      .join("")}
  </table>
  <p style="margin-top:24px;font-size:13px;color:#666">Enviado desde el formulario web /creadores-de-contenido</p>
</body></html>`;

    const result = await sendEmail({
      to: getCompanyEmail(),
      subject: `[FURGOCASA] Creadores — ${d.name}`,
      html,
      replyTo: d.email,
    });

    if (!result.success) {
      console.error("[creator-collaboration] sendEmail:", result.error);
      return NextResponse.json(
        { ok: false, error: "No se pudo enviar ahora. Inténtalo más tarde o escríbenos a info@furgocasa.com." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[creator-collaboration]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
