/**
 * POST   /api/admin/storyteller-uploads/[id]/select
 * DELETE /api/admin/storyteller-uploads/[id]/select  (revierte selección)
 *
 * Marca/desmarca una subida como seleccionada para archivo.
 * - Suma/resta puntos en ledger automáticamente.
 * - Sincroniza cupón del cliente con el nuevo saldo (puede generar nuevo cupón).
 * - Envía email al cliente notificando la selección.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  awardSelectionPoints,
  getBalance,
  revertSelection,
  syncCouponWithBalance,
} from "@/lib/storytellers/points";
import { sendEmail } from "@/lib/email/smtp-client";
import { getEmailBaseTemplate } from "@/lib/email/templates";
import { buildMyPointsUrl } from "@/lib/storytellers/magic-link";

async function getAdminEmail(): Promise<string> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email || "admin";
  } catch {
    return "admin";
  }
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await context.params;
    const adminEmail = await getAdminEmail();

    const result = await awardSelectionPoints({ uploadId: id, adminEmail });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.reason },
        { status: 400 }
      );
    }

    // Recupera info del cliente para email
    const supa = createAdminClient();
    const { data: upload } = await supa
      .from("storyteller_uploads")
      .select("customer_email, file_type")
      .eq("id", id)
      .single();

    let newCoupon: { code: string; pct: number; validUntil: string } | null = null;
    if (upload) {
      const sync = await syncCouponWithBalance(upload.customer_email);
      if (sync.generated && sync.newCoupon) {
        newCoupon = {
          code: sync.newCoupon.code,
          pct: sync.newCoupon.pct,
          validUntil: sync.newCoupon.validUntil,
        };
      }
      const balance = await getBalance(upload.customer_email);
      const myPointsUrl = buildMyPointsUrl(upload.customer_email, "es");
      const html = getEmailBaseTemplate(
        buildSelectedBody({
          fileType: upload.file_type,
          delta: result.delta,
          balance,
          myPointsUrl,
          newCoupon,
        }),
        upload.file_type === "photo"
          ? "Tu foto ha sido seleccionada"
          : "Tu vídeo ha sido seleccionado"
      );
      await sendEmail({
        to: upload.customer_email,
        subject:
          upload.file_type === "photo"
            ? "[Furgocasa] Tu foto ha sido seleccionada"
            : "[Furgocasa] Tu vídeo ha sido seleccionado",
        html,
      });
    }

    return NextResponse.json({ ok: true, delta: result.delta, newCoupon });
  } catch (e) {
    console.error("[admin/storyteller-uploads/select]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await context.params;
    const adminEmail = await getAdminEmail();
    const result = await revertSelection({ uploadId: id, adminEmail });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/storyteller-uploads/select DELETE]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

function buildSelectedBody(params: {
  fileType: string;
  delta: number;
  balance: number;
  myPointsUrl: string;
  newCoupon: { code: string; pct: number; validUntil: string } | null;
}): string {
  const { fileType, delta, balance, myPointsUrl, newCoupon } = params;
  const couponBlock = newCoupon
    ? `
    <div style="margin-top: 24px; padding: 16px; border: 2px dashed #f97316; border-radius: 8px; background: #fff7ed;">
      <p style="margin: 0 0 4px; font-weight: bold; color: #9a3412;">Has desbloqueado un nuevo cupón</p>
      <p style="margin: 0 0 4px; font-size: 18px; color: #9a3412;">
        <strong>${newCoupon.pct}% de descuento</strong> en tu próxima reserva
      </p>
      <p style="margin: 0; font-size: 13px; color: #9a3412;">
        Código: <strong>${newCoupon.code}</strong> · válido hasta ${newCoupon.validUntil}
      </p>
    </div>
  `
    : "";
  return `
    <tr>
      <td style="padding: 32px 24px; color: #111827; font-family: Arial, sans-serif; line-height: 1.6;">
        <h1 style="margin: 0 0 16px; color: #063971; font-size: 22px;">¡Tu ${fileType === "photo" ? "foto" : "vídeo"} ha sido seleccionado!</h1>
        <p style="margin: 0 0 16px; font-size: 15px;">
          Tu ${fileType === "photo" ? "foto" : "vídeo"} ha sido seleccionado para el archivo profesional de Furgocasa.
        </p>
        <p style="margin: 0 0 8px; font-size: 15px;">
          <strong>+${delta} puntos.</strong> Saldo total: <strong>${balance} puntos</strong>.
        </p>
        ${couponBlock}
        <p style="margin: 24px 0 0;">
          <a href="${myPointsUrl}"
             style="display: inline-block; background: #f97316; color: #ffffff; text-decoration: none;
                    padding: 12px 24px; border-radius: 8px; font-weight: bold;">
            Ver mis puntos
          </a>
        </p>
      </td>
    </tr>
  `;
}
