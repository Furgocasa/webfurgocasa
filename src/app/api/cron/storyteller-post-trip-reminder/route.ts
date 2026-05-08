/**
 * GET /api/cron/storyteller-post-trip-reminder
 *
 * Cron diario que envía un único recordatorio post-viaje a clientes
 * cuya reserva terminó hace exactamente 7 días y todavía NO han subido
 * material al programa Storytellers.
 *
 * Usa la tabla `customers.notification_log` o un campo dedicado para evitar
 * duplicados; aquí lo hacemos sin tabla extra usando el booking_id (un email
 * por reserva máximo, basado en metadata).
 *
 * Para evitar reenvíos sin nueva tabla: marcamos en `bookings.notes` un tag
 * "[storyteller-reminder-sent]" tras enviar. Si la nota ya lo contiene, skip.
 *
 * Protegido por CRON_SECRET en producción.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/smtp-client";
import { buildPostTripReminderHtml } from "@/lib/storytellers/emails";

const REMINDER_TAG = "[storyteller-reminder-sent]";
const DAYS_AFTER_DROPOFF = 7;
const BATCH_LIMIT = 100;

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const auth = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
    if (!process.env.CRON_SECRET || auth !== expected) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  try {
    const supabase = createAdminClient();
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() - DAYS_AFTER_DROPOFF);
    const targetIso = target.toISOString().slice(0, 10);

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, booking_number, customer_email, customer_name, dropoff_date, admin_notes")
      .eq("dropoff_date", targetIso)
      .limit(BATCH_LIMIT);

    if (error) {
      console.error("[cron/storyteller-post-trip] query:", error);
      return NextResponse.json({ ok: false, error: "query" }, { status: 500 });
    }

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const b of bookings || []) {
      if ((b.admin_notes || "").includes(REMINDER_TAG)) {
        skipped += 1;
        continue;
      }
      if (!b.customer_email || !b.customer_email.includes("@")) {
        skipped += 1;
        continue;
      }

      // Si el cliente YA subió algo en esta reserva, no le enviamos
      const { count } = await supabase
        .from("storyteller_uploads")
        .select("id", { count: "exact", head: true })
        .eq("booking_id", b.id);

      if ((count || 0) > 0) {
        skipped += 1;
        continue;
      }

      const html = buildPostTripReminderHtml({
        customerName: b.customer_name,
        bookingNumber: b.booking_number,
        hasContent: true,
      });
      const result = await sendEmail({
        to: b.customer_email,
        subject: "[Furgocasa] ¿Tienes fotos del viaje?",
        html,
      });

      if (result.success) {
        sent += 1;
        await supabase
          .from("bookings")
          .update({
            admin_notes: ((b.admin_notes || "") + "\n" + REMINDER_TAG).trim(),
          })
          .eq("id", b.id);
      } else {
        errors.push(`${b.booking_number}: ${result.error}`);
      }
    }

    return NextResponse.json({ ok: true, sent, skipped, errors, target: targetIso });
  } catch (e) {
    console.error("[cron/storyteller-post-trip]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
