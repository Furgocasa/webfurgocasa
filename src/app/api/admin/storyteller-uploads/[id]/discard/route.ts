/**
 * POST   /api/admin/storyteller-uploads/[id]/discard
 * DELETE /api/admin/storyteller-uploads/[id]/discard  (revierte descarte)
 *
 * Marca/desmarca una subida como "descartada" por admin.
 *
 * Diferencia importante con `select`:
 *  - NO toca el ledger de puntos (los puntos por subida que ya ganó el
 *    cliente al subir se conservan).
 *  - NO genera ni modifica cupones.
 *  - NO envía email al cliente. El cliente solo lo notará por ausencia
 *    de los emails "tu foto/vídeo ha sido seleccionado".
 *  - Es mutuamente excluyente con la selección (constraint en BD).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { discardUpload, restoreFromDiscard } from "@/lib/storytellers/points";

const bodySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

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
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const { id } = await context.params;
    const adminEmail = await getAdminEmail();

    let reason: string | undefined;
    try {
      const json = await req.json();
      const parsed = bodySchema.safeParse(json);
      if (parsed.success) reason = parsed.data.reason;
    } catch {
      // body opcional, lo ignoramos si no llega válido
    }

    const result = await discardUpload({ uploadId: id, adminEmail, reason });
    if (!result.ok) {
      const message =
        result.reason === "migration_pending"
          ? "La migración 20260509-storytellers-discarded.sql aún no se ha aplicado en Supabase. Aplícala antes de descartar."
          : result.reason === "already_selected"
          ? "Esta subida ya fue aprobada para archivo. Si quieres descartarla, primero revierte la selección."
          : result.reason === "already_discarded"
          ? "Esta subida ya estaba descartada."
          : result.reason === "upload_not_found"
          ? "Subida no encontrada."
          : "No se pudo descartar.";
      return NextResponse.json(
        { ok: false, error: message, reason: result.reason },
        { status: result.reason === "migration_pending" ? 503 : 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/storyteller-uploads/discard]", e);
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
    const result = await restoreFromDiscard({ uploadId: id });
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.reason },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/storyteller-uploads/discard DELETE]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
