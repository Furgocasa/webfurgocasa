/**
 * GET /api/cron/storyteller-post-trip-reminder
 *
 * Cron diario que envía un único recordatorio post-viaje a clientes
 * cuya reserva terminó hace exactamente 7 días y todavía NO han subido
 * material al programa Storytellers.
 *
 * RELACIÓN CON EL NUEVO `storyteller-post-trip-day-after` (+1 día):
 *   - Ambos crons graban en `booking_email_dispatches` con
 *     `email_type='storyteller_post_trip'`.
 *   - El cron de +1 día (storyteller 07) suele ganar SIEMPRE porque
 *     corre antes en el ciclo. Cuando este cron de +7 días llega, ya
 *     hay un dispatch `sent` y hace skip.
 *   - Por lo tanto, este cron queda como RED DE SEGURIDAD (no manda a
 *     casi nadie en el día a día). Se mantiene operativo durante un
 *     periodo de transición. Decisión documentada en
 *     `mailing/STORYTELLERS_MAILS.md`.
 *
 * Idempotencia:
 *   - Tras enviar OK, INSERT en `booking_email_dispatches` con
 *     status='sent'. Si la BD rechaza por UNIQUE (otro cron ganó la
 *     carrera), tratamos como "ya enviado".
 *   - Mantenemos también el tag legacy en `admin_notes` para no romper
 *     el cron antiguo si algún script externo lo lee.
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
      // Skip: tag legacy
      if ((b.admin_notes || "").includes(REMINDER_TAG)) {
        skipped += 1;
        continue;
      }
      // Skip: nuevo sistema centralizado
      const { data: existingDispatch } = await supabase
        .from("booking_email_dispatches")
        .select("id, status")
        .eq("booking_id", b.id)
        .eq("email_type", "storyteller_post_trip")
        .in("status", ["sent", "skipped", "bounced"])
        .limit(1);

      if (existingDispatch && existingDispatch.length > 0) {
        // Sincronizamos tag legacy si falta
        if (!(b.admin_notes || "").includes(REMINDER_TAG)) {
          await supabase
            .from("bookings")
            .update({
              admin_notes: ((b.admin_notes || "") + "\n" + REMINDER_TAG).trim(),
            })
            .eq("id", b.id);
        }
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
        // Marcamos como skipped en el dispatch para que no vuelva a salir
        await supabase.from("booking_email_dispatches").insert({
          booking_id: b.id,
          customer_email: b.customer_email,
          email_type: "storyteller_post_trip",
          status: "skipped",
          metadata: {
            booking_number: b.booking_number,
            reason: "already_uploaded",
            cron: "storyteller-post-trip-reminder",
          },
        });
        skipped += 1;
        continue;
      }

      const html = buildPostTripReminderHtml({
        customerName: b.customer_name,
        bookingNumber: b.booking_number,
        hasContent: true,
      });
      const result = await sendEmail({
        to: [b.customer_email, "reservas@furgocasa.com"],
        subject: "[Furgocasa] ¿Tienes fotos del viaje?",
        html,
      });

      if (result.success) {
        sent += 1;
        // INSERT en sistema unificado (idempotente vía UNIQUE parcial)
        const ins = await supabase
          .from("booking_email_dispatches")
          .insert({
            booking_id: b.id,
            customer_email: b.customer_email,
            email_type: "storyteller_post_trip",
            status: "sent",
            sent_at: new Date().toISOString(),
            smtp_message_id: result.messageId || null,
            metadata: {
              booking_number: b.booking_number,
              cron: "storyteller-post-trip-reminder",
              days_after_dropoff: DAYS_AFTER_DROPOFF,
            },
          });

        if (ins.error && !/duplicate key/i.test(ins.error.message)) {
          console.error(
            `[cron/storyteller-post-trip] dispatch log failed for ${b.booking_number}:`,
            ins.error,
          );
        }

        // Tag legacy (compatibilidad).
        await supabase
          .from("bookings")
          .update({
            admin_notes: ((b.admin_notes || "") + "\n" + REMINDER_TAG).trim(),
          })
          .eq("id", b.id);
      } else {
        await supabase.from("booking_email_dispatches").insert({
          booking_id: b.id,
          customer_email: b.customer_email,
          email_type: "storyteller_post_trip",
          status: "failed",
          error_message: result.error || "smtp send failed",
          metadata: {
            booking_number: b.booking_number,
            cron: "storyteller-post-trip-reminder",
          },
        });
        errors.push(`${b.booking_number}: ${result.error}`);
      }
    }

    return NextResponse.json({ ok: true, sent, skipped, errors, target: targetIso });
  } catch (e) {
    console.error("[cron/storyteller-post-trip]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
