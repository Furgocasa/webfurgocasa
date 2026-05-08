/**
 * GET /api/cron/storyteller-post-trip-day-after
 *
 * Cron diario (Vercel) — schedule en `vercel.json`:
 *   "0 9 * * *"  (UTC) ≡ 10:00 Madrid en invierno / 11:00 Madrid en verano.
 *
 * Lógica:
 *   - Selecciona reservas con `dropoff_date == ayer` (Madrid) que aún
 *     NO tienen dispatch `storyteller_post_trip` (`sent`/`skipped`/`bounced`).
 *   - Manda el email 07 vía `sendCycleEmail`.
 *
 * Este cron SUSTITUYE funcionalmente al viejo `storyteller-post-trip-reminder`
 * (+7 días). Como ambos comparten el mismo `email_type` (`storyteller_post_trip`),
 * cuando este cron envía a +1d, el viejo cron de +7d encuentra ya
 * `status='sent'` y hace skip → no se duplica nada.
 *
 * El viejo cron sigue en `vercel.json` durante un período de transición
 * para cubrir reservas anteriores; ver
 * `mailing/STORYTELLERS_MAILS.md` § decisiones cerradas.
 *
 * Protegido por CRON_SECRET en producción.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  findEligibleBookings,
  sendCycleEmail,
  madridDateOffset,
} from "@/lib/storytellers/emails-cycle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const auth = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
    if (!process.env.CRON_SECRET || auth !== expected) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  const supabase = createAdminClient();
  const yesterday = madridDateOffset(-1);

  console.log(
    `[cron/storyteller-post-trip-day-after] buscando reservas con dropoff_date = ${yesterday}`
  );

  const candidates = await findEligibleBookings(supabase, "07", madridDateOffset(0));

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      type: "07",
      date: yesterday,
      total: 0,
      sent: 0,
      results: [],
    });
  }

  console.log(
    `[cron/storyteller-post-trip-day-after] ${candidates.length} candidato(s) elegible(s)`
  );

  const results: Array<{
    booking_number: string;
    customer_email: string | null;
    ok: boolean;
    skipped?: string;
    error?: string;
  }> = [];

  for (const booking of candidates) {
    const r = await sendCycleEmail({
      supabase,
      booking,
      type: "07",
      ccReservas: true,
      metadata: { trigger: "cron", cron: "storyteller-post-trip-day-after" },
    });
    results.push({
      booking_number: booking.booking_number,
      customer_email: booking.customer_email,
      ok: r.ok,
      skipped: r.ok ? undefined : r.skipped,
      error: r.ok ? undefined : r.error,
    });
    console.log(
      `[cron/storyteller-post-trip-day-after] ${booking.booking_number} → ${
        booking.customer_email
      }: ${r.ok ? "OK" : r.skipped || r.error}`
    );
  }

  const sent = results.filter((r) => r.ok).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.ok && !r.skipped).length;

  return NextResponse.json({
    ok: true,
    type: "07",
    date: yesterday,
    total: candidates.length,
    sent,
    skipped,
    failed,
    results,
  });
}
