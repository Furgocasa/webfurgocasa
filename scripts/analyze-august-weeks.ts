/**
 * Análisis de ocupación por semanas (jun–sep 2026).
 * Replica la lógica de /api/occupancy-highlights y añade métrica "solo reservas / capacidad ofrecida".
 *
 * Uso: npx tsx scripts/analyze-august-weeks.ts
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import {
  differenceInDays,
  parseISO,
  eachDayOfInterval,
  format,
  getDaysInMonth,
} from "date-fns";

config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const MONTHS = [
  { year: 2026, month: 6, label: "Junio" },
  { year: 2026, month: 7, label: "Julio" },
  { year: 2026, month: 8, label: "Agosto" },
  { year: 2026, month: 9, label: "Septiembre" },
];

const RANGE_START = "2026-06-01";
const RANGE_END = "2026-09-30";

interface Period {
  id: string;
  name: string;
  start: string;
  end: string;
  isMonthTotal?: boolean;
}

interface Vehicle {
  id: string;
  name: string;
  internal_code: string | null;
  status: string;
}

interface Booking {
  vehicle_id: string;
  pickup_date: string;
  dropoff_date: string;
  status: string;
}

interface Block {
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Trocea un mes en semanas de 7 días desde el día 1 + total mensual */
function buildMonthPeriods(year: number, month: number, label: string): Period[] {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const periods: Period[] = [];
  let weekNum = 1;
  let day = 1;

  while (day <= daysInMonth) {
    const endDay = Math.min(day + 6, daysInMonth);
    periods.push({
      id: `${year}-${pad(month)}-w${weekNum}`,
      name: `${label} S${weekNum} (${day}-${endDay})`,
      start: toIso(year, month, day),
      end: toIso(year, month, endDay),
    });
    day = endDay + 1;
    weekNum++;
  }

  periods.push({
    id: `${year}-${pad(month)}-total`,
    name: `${label} TOTAL`,
    start: toIso(year, month, 1),
    end: toIso(year, month, daysInMonth),
    isMonthTotal: true,
  });

  return periods;
}

function pct(n: number, d: number): number {
  if (d <= 0) return 0;
  return Math.round((n / d) * 100 * 10) / 10;
}

function statusLabel(rateA: number): string {
  if (rateA > 85) return "🔴 Muy alta";
  if (rateA >= 60) return "🟠 Alta";
  if (rateA >= 40) return "🟡 Moderada";
  return "🟢 Baja";
}

function calcPeriod(
  periodStart: Date,
  periodEnd: Date,
  vehicles: Vehicle[],
  bookings: Booking[],
  blocks: Block[]
) {
  const totalDays = differenceInDays(periodEnd, periodStart) + 1;
  const grossCapacity = totalDays * vehicles.length;

  let bookedDays = 0;
  let blockedDays = 0;
  let nonReservableDays = 0;

  vehicles.forEach((vehicle) => {
    const vehicleBookings = bookings.filter((b) => b.vehicle_id === vehicle.id);
    const vehicleBlocks = blocks.filter((b) => b.vehicle_id === vehicle.id);

    const bookedDates = new Set<string>();
    const blockedDates = new Set<string>();
    const nonReservableDates = new Set<string>();

    vehicleBookings.forEach((booking) => {
      const bookingStart = parseISO(booking.pickup_date);
      const bookingEnd = parseISO(booking.dropoff_date);
      if (bookingEnd >= periodStart && bookingStart <= periodEnd) {
        const effectiveStart =
          bookingStart < periodStart ? periodStart : bookingStart;
        const effectiveEnd = bookingEnd > periodEnd ? periodEnd : bookingEnd;
        eachDayOfInterval({ start: effectiveStart, end: effectiveEnd }).forEach(
          (day) => {
            const key = format(day, "yyyy-MM-dd");
            bookedDates.add(key);
            nonReservableDates.add(key);
          }
        );
      }
    });

    vehicleBlocks.forEach((block) => {
      const blockStart = parseISO(block.start_date);
      const blockEnd = parseISO(block.end_date);
      if (blockEnd >= periodStart && blockStart <= periodEnd) {
        const effectiveStart =
          blockStart < periodStart ? periodStart : blockStart;
        const effectiveEnd = blockEnd > periodEnd ? periodEnd : blockEnd;
        eachDayOfInterval({ start: effectiveStart, end: effectiveEnd }).forEach(
          (day) => {
            const key = format(day, "yyyy-MM-dd");
            blockedDates.add(key);
            nonReservableDates.add(key);
          }
        );
      }
    });

    bookedDays += bookedDates.size;
    blockedDays += blockedDates.size;
    nonReservableDays += nonReservableDates.size;
  });

  const offeredCapacity = grossCapacity - blockedDays;

  return {
    totalDays,
    grossCapacity,
    bookedDays,
    blockedDays,
    nonReservableDays,
    offeredCapacity,
    rateA: pct(nonReservableDays, grossCapacity),
    rateB: pct(bookedDays, offeredCapacity),
  };
}

function printTable(
  title: string,
  periods: Period[],
  vehicles: Vehicle[],
  bookings: Booking[],
  blocks: Block[]
) {
  console.log(`\n${"═".repeat(105)}`);
  console.log(`  ${title}`);
  console.log("═".repeat(105));
  console.log(
    "Periodo".padEnd(26) +
      "Cap.bruta".padStart(10) +
      "Reserv.".padStart(9) +
      "Bloq.".padStart(8) +
      "Ofertada".padStart(10) +
      "API (A)".padStart(10) +
      "Res/Ofert".padStart(12) +
      "  Semáforo"
  );
  console.log("─".repeat(105));

  for (const period of periods) {
    const r = calcPeriod(
      parseISO(period.start),
      parseISO(period.end),
      vehicles,
      bookings,
      blocks
    );
    const prefix = period.isMonthTotal ? "▶ " : "  ";
    console.log(
      `${prefix}${period.name}`.padEnd(26) +
        String(r.grossCapacity).padStart(10) +
        String(r.bookedDays).padStart(9) +
        String(r.blockedDays).padStart(8) +
        String(r.offeredCapacity).padStart(10) +
        `${r.rateA}%`.padStart(10) +
        `${r.rateB}%`.padStart(12) +
        `  ${statusLabel(r.rateA)}`
    );
  }
}

async function main() {
  console.log("📊 Ocupación por semanas — Junio a Septiembre 2026\n");

  const { data: vehicles, error: vehiclesError } = await supabase
    .from("vehicles")
    .select("id, name, internal_code, status")
    .eq("is_for_rent", true)
    .eq("status", "available")
    .or("sale_status.neq.sold,sale_status.is.null");

  if (vehiclesError || !vehicles?.length) {
    console.error("❌ Error vehículos:", vehiclesError);
    process.exit(1);
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("vehicle_id, pickup_date, dropoff_date, status")
    .in("status", ["confirmed", "in_progress", "completed"])
    .lte("pickup_date", RANGE_END)
    .gte("dropoff_date", RANGE_START);

  if (bookingsError) {
    console.error("❌ Error reservas:", bookingsError);
    process.exit(1);
  }

  const fleetIds = vehicles.map((v) => v.id);
  const { data: blocks, error: blocksError } = await supabase
    .from("blocked_dates")
    .select("vehicle_id, start_date, end_date, reason")
    .in("vehicle_id", fleetIds)
    .lte("start_date", RANGE_END)
    .gte("end_date", RANGE_START);

  if (blocksError) {
    console.error("❌ Error bloqueos:", blocksError);
    process.exit(1);
  }

  const v = vehicles as Vehicle[];
  const b = (bookings || []) as Booking[];
  const bl = (blocks || []) as Block[];

  console.log(`🚐 Flota alquilable activa: ${v.length} vehículos`);
  console.log(`📅 Reservas jun–sep: ${b.length}`);
  console.log(`🚫 Bloqueos jun–sep: ${bl.length}`);

  if (bl.length > 0) {
    console.log("\n── Bloqueos en el periodo ──");
    const vehicleMap = new Map(v.map((veh) => [veh.id, veh]));
    bl.forEach((block) => {
      const veh = vehicleMap.get(block.vehicle_id);
      console.log(
        `  ${veh?.internal_code || "?"} ${veh?.name || ""} | ${block.start_date} → ${block.end_date} | ${block.reason || "(sin motivo)"}`
      );
    });
  }

  const allPeriods = MONTHS.flatMap(({ year, month, label }) =>
    buildMonthPeriods(year, month, label)
  );

  for (const { year, month, label } of MONTHS) {
    const periods = buildMonthPeriods(year, month, label);
    printTable(`${label} ${year}`, periods, v, b, bl);
  }

  // Resumen: semanas con API (A) >= 40% en todo el verano
  console.log(`\n${"═".repeat(105)}`);
  console.log("  RESUMEN — Semanas con presión visible en web (API ≥ 40%)");
  console.log("═".repeat(105));

  const hotWeeks = allPeriods
    .filter((p) => !p.isMonthTotal)
    .map((p) => ({
      ...p,
      ...calcPeriod(parseISO(p.start), parseISO(p.end), v, b, bl),
    }))
    .filter((p) => p.rateA >= 40)
    .sort((a, b) => b.rateA - a.rateA);

  if (hotWeeks.length === 0) {
    console.log("  Ninguna semana supera el 40%.");
  } else {
    hotWeeks.forEach((w) => {
      console.log(
        `  ${w.start} → ${w.end} | ${w.name.padEnd(22)} | API ${w.rateA}% | Res/Ofert ${w.rateB}% | ${statusLabel(w.rateA)}`
      );
    });
  }

  console.log(`\n${"═".repeat(105)}`);
  console.log("  TOTALES MENSUALES");
  console.log("═".repeat(105));
  MONTHS.forEach(({ year, month, label }) => {
    const total = buildMonthPeriods(year, month, label).find((p) => p.isMonthTotal)!;
    const r = calcPeriod(parseISO(total.start), parseISO(total.end), v, b, bl);
    console.log(
      `  ${label.padEnd(12)} ${total.start} → ${total.end} | API ${String(r.rateA).padStart(5)}% | Res/Ofert ${String(r.rateB).padStart(5)}% | ${statusLabel(r.rateA)}`
    );
  });

  console.log(`
Leyenda:
  Cap.bruta   = días × ${v.length} vehículos
  API (A)     = (reservas + bloqueos) / cap.bruta — fórmula actual del semáforo web
  Res/Ofert   = reservas / (cap.bruta − bloqueos) — presión sobre lo realmente ofertable
  Semáforo    = 🟡 ≥40%  🟠 ≥60%  🔴 >85%
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
