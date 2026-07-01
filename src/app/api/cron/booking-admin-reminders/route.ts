/**
 * GET /api/cron/booking-admin-reminders
 *
 * Cron diario (Vercel). Sustituye la automatización n8n "Avisos MAIL pendientes
 * NOTION". Para cada reserva próxima aplica las reglas:
 *
 *   · 2º pago / contrato / documentación / fianza pendientes → recordatorio DIARIO
 *     (una vez al día mientras siga sin resolver, cron 06:00 UTC)
 *   · 2º pago + contrato + documentación + fianza OK y sin cita → email de CITA (una vez)
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendGestionEmail } from "@/lib/rental-admin/dispatch";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

function minusDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const madrid = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  const today = madrid.toISOString().slice(0, 10);
  const in45 = new Date(madrid);
  in45.setDate(in45.getDate() + 45);
  const in45Str = in45.toISOString().slice(0, 10);

  // Reservas próximas (inicio entre hoy y +45 días), no canceladas.
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_number, status, payment_status, total_price, amount_paid, pickup_date"
    )
    .neq("status", "cancelled")
    .gte("pickup_date", today)
    .lte("pickup_date", in45Str)
    .order("pickup_date", { ascending: true });

  if (error) {
    console.error("[booking-admin-reminders] bookings:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ success: true, processed: 0, actions: [] });
  }

  const ids = bookings.map((b) => b.id);
  const [checklistRes, contractsRes, docsRes] = await Promise.all([
    supabase.from("booking_admin_checklist").select("*").in("booking_id", ids),
    supabase.from("signed_contracts").select("booking_id").in("booking_id", ids),
    supabase
      .from("rental_documents")
      .select("booking_id, driver_index, doc_kind, ai_status")
      .in("booking_id", ids),
  ]);

  const checklistBy = new Map<string, Record<string, unknown>>();
  for (const c of checklistRes.data || []) checklistBy.set(c.booking_id, c);
  const contractSet = new Set<string>();
  for (const c of contractsRes.data || []) contractSet.add(c.booking_id);
  const docsBy = new Map<string, Map<number, Record<string, string>>>();
  for (const d of docsRes.data || []) {
    if (!docsBy.has(d.booking_id)) docsBy.set(d.booking_id, new Map());
    const drivers = docsBy.get(d.booking_id)!;
    if (!drivers.has(d.driver_index)) drivers.set(d.driver_index, {});
    drivers.get(d.driver_index)![d.doc_kind] = d.ai_status;
  }

  const actions: Array<{ booking: string; type: string; result: string }> = [];

  for (const b of bookings) {
    const chk = checklistBy.get(b.id) || {};
    const venc = minusDaysIso(b.pickup_date, 15);
    const limiteFianza = minusDaysIso(b.pickup_date, 8);

    const paymentComplete =
      (b.payment_status || "").toLowerCase() === "paid" ||
      (typeof b.amount_paid === "number" &&
        typeof b.total_price === "number" &&
        b.amount_paid >= b.total_price &&
        b.total_price > 0);

    const contractSigned = contractSet.has(b.id);

    const drivers = docsBy.get(b.id);
    const titular = drivers?.get(0);
    const docsAutoOk = Boolean(
      titular && titular["dni_front"] === "ok" && titular["license_front"] === "ok"
    );
    const docComplete = Boolean(chk.documentation_received) || docsAutoOk;

    const secondInvoiceDone = Boolean(chk.second_invoice_done);
    const depositReceived = Boolean(chk.deposit_received);
    const appointmentConfirmed = Boolean(chk.appointment_confirmed);

    const jobs: string[] = [];

    if (today >= venc && !paymentComplete) jobs.push("second_payment_reminder");
    if (today >= venc && !contractSigned) jobs.push("contract_reminder");
    if (today >= venc && !docComplete) jobs.push("documentation_reminder");
    if (today >= limiteFianza && !depositReceived) jobs.push("deposit_reminder");

    // Cita automática: todo listo y no enviada.
    const ready =
      secondInvoiceDone && contractSigned && docComplete && depositReceived && !appointmentConfirmed;
    if (ready) jobs.push("appointment");

    for (const type of jobs) {
      const isAppointment = type === "appointment";
      const res = await sendGestionEmail(supabase, b.id, type as any, {
        onlyIfNotSent: isAppointment,
        onlyIfNotSentToday: !isAppointment,
        ccCompany: true,
        source: "cron",
      });
      actions.push({
        booking: b.booking_number,
        type,
        result: res.skipped ? "skipped" : res.ok ? "sent" : `error: ${res.error}`,
      });
    }
  }

  const sent = actions.filter((a) => a.result === "sent").length;
  const skipped = actions.filter((a) => a.result === "skipped").length;
  const failed = actions.filter((a) => a.result.startsWith("error")).length;

  return NextResponse.json({
    success: true,
    date: today,
    processed: bookings.length,
    sent,
    skipped,
    failed,
    actions,
  });
}
