/**
 * GET /api/cron/booking-management-email
 *
 * Envía el email de gestión inicial (booking_management) cuando llega la hora
 * programada (20 min tras el 1er pago + confirmación de la reserva).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendGestionEmail } from "@/lib/rental-admin/dispatch";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: dueRows, error } = await supabase
    .from("booking_admin_checklist")
    .select("booking_id, booking:bookings!inner(id, status, booking_number)")
    .not("management_email_due_at", "is", null)
    .lte("management_email_due_at", now);

  if (error) {
    console.error("[booking-management-email] query:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const actions: Array<{ booking: string; result: string }> = [];

  for (const row of dueRows || []) {
    const booking = row.booking as unknown as {
      id: string;
      status: string;
      booking_number: string;
    } | null;

    if (!booking || booking.status === "cancelled") {
      await supabase
        .from("booking_admin_checklist")
        .update({ management_email_due_at: null })
        .eq("booking_id", row.booking_id);
      continue;
    }

    const res = await sendGestionEmail(supabase, row.booking_id, "booking_management", {
      onlyIfNotSent: true,
      ccCompany: true,
      source: "cron-management-delay",
    });

    actions.push({
      booking: booking.booking_number,
      result: res.skipped ? "skipped" : res.ok ? "sent" : `error: ${res.error}`,
    });

    // Limpiar programación si se envió o ya existía; mantener si falló SMTP para reintentar.
    if (res.ok) {
      await supabase
        .from("booking_admin_checklist")
        .update({ management_email_due_at: null })
        .eq("booking_id", row.booking_id);
    }
  }

  return NextResponse.json({
    success: true,
    processed: dueRows?.length || 0,
    sent: actions.filter((a) => a.result === "sent").length,
    skipped: actions.filter((a) => a.result === "skipped").length,
    failed: actions.filter((a) => a.result.startsWith("error")).length,
    actions,
  });
}
