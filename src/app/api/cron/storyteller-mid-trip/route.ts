/**
 * GET /api/cron/storyteller-mid-trip
 *
 * Cron diario (Vercel) — schedule en `vercel.json`:
 *   "0 9 * * *"  (UTC) ≡ 10:00 Madrid en invierno / 11:00 Madrid en verano.
 *
 * Lógica:
 *   - Selecciona reservas que hoy (Madrid) están en mitad de viaje:
 *       `pickup_date < hoy < dropoff_date`
 *     y la duración es ≥ 6 días, y hoy ≥ midpoint
 *     (`pickup + floor(duración/2)`).
 *   - Excluye las que ya tienen un dispatch `storyteller_mid_trip`
 *     (`sent`/`skipped`/`bounced`).
 *   - Manda el email 06 vía `sendCycleEmail`.
 *
 * NOTA: los viajes < 6 días NO reciben el 06 por diseño (mantenemos el 05
 * y el 07 en su lugar). El filtro lo aplica `findEligibleBookings("06")`.
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
    `[cron/storyteller-mid-trip] buscando reservas en mitad de viaje (≥6d) hoy=${today}`
  );

  const candidates = await findEligibleBookings(supabase, "06", today);

  if (candidates.length === 0) {
    return NextResponse.json({
      ok: true,
      type: "06",
      date: today,
      total: 0,
      sent: 0,
      results: [],
    });
  }

  console.log(
    `[cron/storyteller-mid-trip] ${candidates.length} candidato(s) elegible(s)`
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
      type: "06",
      ccReservas: true,
      metadata: { trigger: "cron", cron: "storyteller-mid-trip" },
    });
    results.push({
      booking_number: booking.booking_number,
      customer_email: booking.customer_email,
      ok: r.ok,
      skipped: r.ok ? undefined : r.skipped,
      error: r.ok ? undefined : r.error,
    });
    console.log(
      `[cron/storyteller-mid-trip] ${booking.booking_number} → ${
        booking.customer_email
      }: ${r.ok ? "OK" : r.skipped || r.error}`
    );
  }

  const sent = results.filter((r) => r.ok).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.ok && !r.skipped).length;

  return NextResponse.json({
    ok: true,
    type: "06",
    date: today,
    total: candidates.length,
    sent,
    skipped,
    failed,
    results,
  });
}
