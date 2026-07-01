/**
 * POST /api/admin/administracion/send-email
 *
 * Reenvío manual de un email de gestión concreto a una reserva (o envío de la
 * cita). Lo usa el panel admin con los botones "Reenviar recordatorio" / "Enviar
 * cita". Siempre envía (no comprueba idempotencia) porque es una acción explícita.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/server";
import { sendGestionEmail } from "@/lib/rental-admin/dispatch";

const schema = z.object({
  bookingId: z.string().uuid(),
  type: z.enum([
    "booking_management",
    "second_payment_reminder",
    "contract_reminder",
    "documentation_reminder",
    "deposit_reminder",
    "appointment",
  ]),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Datos no válidos." }, { status: 400 });
    }
    const { bookingId, type } = parsed.data;

    const supabase = createAdminClient();
    const result = await sendGestionEmail(supabase, bookingId, type, {
      onlyIfNotSent: false,
      ccCompany: true,
      source: "admin-manual",
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, to: result.to });
  } catch (e) {
    console.error("[admin/administracion/send-email]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
