/**
 * GET /api/cron/storyteller-pickup-night
 *
 * Cron diario (Vercel) — schedule en `vercel.json`:
 *   "0 19 * * *"  (UTC) ≡ 20:30 Madrid en horario estándar / 21:30 en verano.
 *
 * (Usamos 19:00 UTC porque Vercel solo acepta granularidad horaria; queremos
 *  que el email se envíe a última hora del día de pickup. Un 19:00 UTC en
 *  invierno = 20:00 Madrid, y en verano = 21:00 Madrid; los dos casos son
 *  apropiados para "esta noche, ya en la furgo".)
 *
 * Lógica:
 *   - Selecciona reservas con `pickup_date == hoy` (Madrid) que aún NO
 *     hayan recibido el email 05 (`storyteller_pickup_night`).
 *   - Manda el email 05 vía `sendCycleEmail`. CC implícito a reservas@.
 *   - El INSERT en `booking_email_dispatches` con `status='sent'` lo hace
 *     la propia lib (ver `src/lib/storytellers/emails-cycle.ts`).
 *
 * Idempotente: aunque Vercel reintente o se relance manualmente el mismo
 * día, el chequeo `isAlreadyDispatched` impide reenvíos.
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
  const today = madridDateOffset(0);

  console.log(
    `[cron/storyteller-pickup-night] buscando reservas con pickup_date = ${today}`
  );

  const candidates = await findEligibleBookings(supabase, "05", today);

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      type: "05",
      date: today,
      total: 0,
      sent: 0,
      results: [],
    });
  }

  console.log(
    `[cron/storyteller-pickup-night] ${candidates.length} candidato(s) elegible(s)`
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
      type: "05",
      ccReservas: true,
      metadata: { trigger: "cron", cron: "storyteller-pickup-night" },
    });
    results.push({
      booking_number: booking.booking_number,
      customer_email: booking.customer_email,
      ok: r.ok,
      skipped: r.ok ? undefined : r.skipped,
      error: r.ok ? undefined : r.error,
    });
    console.log(
      `[cron/storyteller-pickup-night] ${booking.booking_number} → ${
        booking.customer_email
      }: ${r.ok ? "OK" : r.skipped || r.error}`
    );
  }

  const sent = results.filter((r) => r.ok).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.ok && !r.skipped).length;

  return NextResponse.json({
    ok: true,
    type: "05",
    date: today,
    total: candidates.length,
    sent,
    skipped,
    failed,
    results,
  });
}
