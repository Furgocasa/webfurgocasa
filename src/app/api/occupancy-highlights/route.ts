import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import {
  differenceInDays,
  parseISO,
  eachDayOfInterval,
  format,
  addMonths,
  getDaysInMonth,
} from "date-fns";

// ============================================
// ENDPOINT PÚBLICO: Semáforo de ocupación (vista cliente)
// ============================================
// GET /api/occupancy-highlights
//
// Devuelve los próximos N meses con desglose por SEMANAS calendario (1-7, 8-14,
// 15-21, 22-28, 29-fin). Para cada semana y para el total mensual se calcula
// la ocupación como (reservas ∪ bloqueos) / (días × flota alquilable).
//
// Se incluye un mes en la respuesta si:
//   - el TOTAL del mes >= UMBRAL_MODERADO, o
//   - alguna SEMANA del mes >= UMBRAL_MODERADO.
//
// El mes en curso se omite solo si quedan ≤ 3 días para fin de mes;
// en ese mes en curso se ocultan las semanas ya terminadas.
// Cache CDN: 1h.
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cuántos meses hacia adelante analizamos (incluido el mes actual).
const MONTHS_AHEAD = 12;

// Umbral mínimo para que un mes/semana se considere "con presión" y se muestre.
const THRESHOLD_MODERATE = 40;

// Omitir el mes en curso solo si quedan ≤ N días (p. ej. 29-31 may → junio).
const DAYS_LEFT_TO_SKIP_CURRENT_MONTH = 3;

type StatusKey = "available" | "moderate" | "high" | "full";
type ColorKey = "green" | "yellow" | "orange" | "red";

interface OccupancyWeek {
  id: string;
  label: string; // Ej: "1-7"
  start_date: string;
  end_date: string;
  occupancy_rate: number;
  status: StatusKey;
  color: ColorKey;
  status_label: string;
  icon: string;
}

interface OccupancyMonth {
  id: string; // "2026-08"
  name: string; // "Agosto 2026"
  year: number;
  month: number; // 1-12
  start_date: string;
  end_date: string;
  occupancy_rate: number;
  status: StatusKey;
  color: ColorKey;
  status_label: string;
  icon: string;
  weeks: OccupancyWeek[];
  has_high_demand_week: boolean;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function isoDate(year: number, month1Based: number, day: number): string {
  return `${year}-${pad2(month1Based)}-${pad2(day)}`;
}

const MONTH_NAMES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getOccupancyStatus(rate: number): {
  status: StatusKey;
  color: ColorKey;
  status_label: string;
  icon: string;
} {
  // Umbrales: moderado 40–60, alta 60–85, muy alta >85.
  if (rate > 85) {
    return { status: "full", color: "red", status_label: "Muy alta demanda", icon: "🔴" };
  }
  if (rate >= 60) {
    return { status: "high", color: "orange", status_label: "Alta demanda", icon: "🟠" };
  }
  if (rate >= THRESHOLD_MODERATE) {
    return { status: "moderate", color: "yellow", status_label: "Ocupación moderada", icon: "🟡" };
  }
  return { status: "available", color: "green", status_label: "Disponible", icon: "🟢" };
}

interface WeekRange {
  id: string;
  label: string;
  start: string;
  end: string;
  startDay: number;
  endDay: number;
}

/** Trocea un mes en semanas de hasta 7 días: 1-7, 8-14, 15-21, 22-28, 29-fin. */
function buildMonthWeeks(year: number, month1Based: number): WeekRange[] {
  const daysInMonth = getDaysInMonth(new Date(year, month1Based - 1, 1));
  const weeks: WeekRange[] = [];
  let day = 1;
  let idx = 1;
  while (day <= daysInMonth) {
    const endDay = Math.min(day + 6, daysInMonth);
    weeks.push({
      id: `${year}-${pad2(month1Based)}-w${idx}`,
      label: `${day}-${endDay}`,
      start: isoDate(year, month1Based, day),
      end: isoDate(year, month1Based, endDay),
      startDay: day,
      endDay,
    });
    day = endDay + 1;
    idx++;
  }
  return weeks;
}

interface VehicleRow {
  id: string;
}
interface BookingRow {
  vehicle_id: string;
  pickup_date: string;
  dropoff_date: string;
}
interface BlockRow {
  vehicle_id: string;
  start_date: string;
  end_date: string;
}

function calcOccupancyRate(
  periodStart: Date,
  periodEnd: Date,
  vehicles: VehicleRow[],
  bookings: BookingRow[],
  blocks: BlockRow[]
): number {
  const totalDays = differenceInDays(periodEnd, periodStart) + 1;
  const totalAvailableDays = totalDays * vehicles.length;
  if (totalAvailableDays <= 0) return 0;

  let totalNonReservableDays = 0;

  vehicles.forEach((vehicle) => {
    const vehicleBookings = bookings.filter((b) => b.vehicle_id === vehicle.id);
    const vehicleBlocks = blocks.filter((b) => b.vehicle_id === vehicle.id);

    const nonReservableDates = new Set<string>();

    vehicleBookings.forEach((booking) => {
      const bookingStart = parseISO(booking.pickup_date);
      const bookingEnd = parseISO(booking.dropoff_date);
      if (bookingEnd >= periodStart && bookingStart <= periodEnd) {
        const effectiveStart = bookingStart < periodStart ? periodStart : bookingStart;
        const effectiveEnd = bookingEnd > periodEnd ? periodEnd : bookingEnd;
        eachDayOfInterval({ start: effectiveStart, end: effectiveEnd }).forEach((day) => {
          nonReservableDates.add(format(day, "yyyy-MM-dd"));
        });
      }
    });

    vehicleBlocks.forEach((block) => {
      const blockStart = parseISO(block.start_date);
      const blockEnd = parseISO(block.end_date);
      if (blockEnd >= periodStart && blockStart <= periodEnd) {
        const effectiveStart = blockStart < periodStart ? periodStart : blockStart;
        const effectiveEnd = blockEnd > periodEnd ? periodEnd : blockEnd;
        eachDayOfInterval({ start: effectiveStart, end: effectiveEnd }).forEach((day) => {
          nonReservableDates.add(format(day, "yyyy-MM-dd"));
        });
      }
    });

    totalNonReservableDays += nonReservableDates.size;
  });

  return Math.round((totalNonReservableDays / totalAvailableDays) * 100 * 10) / 10;
}

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Flota alquilable activa
    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("id")
      .eq("is_for_rent", true)
      .eq("status", "available")
      .or("sale_status.neq.sold,sale_status.is.null");

    if (vehiclesError) {
      console.error("Error fetching vehicles:", vehiclesError);
      return NextResponse.json({ error: "Error al obtener vehículos" }, { status: 500 });
    }

    const totalVehicles = vehicles?.length || 0;
    if (totalVehicles === 0) {
      return NextResponse.json({ error: "No hay vehículos disponibles" }, { status: 404 });
    }

    // 2. Rango global: desde el mes en curso (si aplica) o el siguiente,
    //    hasta MONTHS_AHEAD meses vista.
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentDay = now.getDate();
    const daysInCurrentMonth = getDaysInMonth(
      new Date(currentYear, currentMonth - 1, 1)
    );
    const daysRemainingInMonth = daysInCurrentMonth - currentDay + 1;
    const skipCurrentMonth =
      daysRemainingInMonth <= DAYS_LEFT_TO_SKIP_CURRENT_MONTH;

    const loopStartRef = skipCurrentMonth
      ? addMonths(new Date(currentYear, currentMonth - 1, 1), 1)
      : new Date(currentYear, currentMonth - 1, 1);

    const rangeStartIso = isoDate(
      loopStartRef.getFullYear(),
      loopStartRef.getMonth() + 1,
      skipCurrentMonth ? 1 : currentDay
    );

    const lastMonthRef = addMonths(loopStartRef, MONTHS_AHEAD - 1);
    const lastMonthYear = lastMonthRef.getFullYear();
    const lastMonthMonth = lastMonthRef.getMonth() + 1;
    const lastDayOfLastMonth = getDaysInMonth(
      new Date(lastMonthYear, lastMonthMonth - 1, 1)
    );
    const rangeEndIso = isoDate(lastMonthYear, lastMonthMonth, lastDayOfLastMonth);

    // 3. Reservas que solapan el rango
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("vehicle_id, pickup_date, dropoff_date")
      .in("status", ["confirmed", "in_progress", "completed"])
      .lte("pickup_date", rangeEndIso)
      .gte("dropoff_date", rangeStartIso);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
    }

    const fleetIds = vehicles.map((v) => v.id);

    // 4. Bloqueos (service role, RLS lo restringe a admin)
    let blockedRanges: BlockRow[] = [];
    try {
      const admin = createAdminClient();
      const { data: blocks, error: blocksError } = await admin
        .from("blocked_dates")
        .select("vehicle_id, start_date, end_date")
        .in("vehicle_id", fleetIds)
        .lte("start_date", rangeEndIso)
        .gte("end_date", rangeStartIso);

      if (blocksError) {
        console.error("Error fetching blocked_dates:", blocksError);
      } else {
        blockedRanges = (blocks ?? []) as BlockRow[];
      }
    } catch (e) {
      console.error("Admin client / blocked_dates:", e);
    }

    const vehiclesTyped = vehicles as VehicleRow[];
    const bookingsTyped = (bookings ?? []) as BookingRow[];

    // 5. Meses: incluimos el mes en curso salvo en sus últimos 3 días.
    const months: OccupancyMonth[] = [];

    for (let i = 0; i < MONTHS_AHEAD; i++) {
      const ref = addMonths(loopStartRef, i);
      const year = ref.getFullYear();
      const month = ref.getMonth() + 1;
      const daysInMonth = getDaysInMonth(new Date(year, month - 1, 1));
      const monthStartIso = isoDate(year, month, 1);
      const monthEndIso = isoDate(year, month, daysInMonth);
      const isCurrentMonth = year === currentYear && month === currentMonth;

      const monthRate = calcOccupancyRate(
        parseISO(monthStartIso),
        parseISO(monthEndIso),
        vehiclesTyped,
        bookingsTyped,
        blockedRanges
      );

      // Semanas completas del calendario; en el mes en curso omitimos las ya pasadas.
      const weekRanges = buildMonthWeeks(year, month).filter((w) => {
        if (!isCurrentMonth) return true;
        return w.endDay >= currentDay;
      });

      const weeks: OccupancyWeek[] = weekRanges.map((w) => {
        const rate = calcOccupancyRate(
          parseISO(w.start),
          parseISO(w.end),
          vehiclesTyped,
          bookingsTyped,
          blockedRanges
        );
        const status = getOccupancyStatus(rate);
        return {
          id: w.id,
          label: w.label,
          start_date: w.start,
          end_date: w.end,
          occupancy_rate: rate,
          ...status,
        };
      });

      const hasHighDemandWeek = weeks.some(
        (w) => w.occupancy_rate >= THRESHOLD_MODERATE
      );
      const monthStatus = getOccupancyStatus(monthRate);

      if (monthRate < THRESHOLD_MODERATE && !hasHighDemandWeek) {
        continue;
      }

      months.push({
        id: `${year}-${pad2(month)}`,
        name: `${MONTH_NAMES_ES[month - 1]} ${year}`,
        year,
        month,
        start_date: monthStartIso,
        end_date: monthEndIso,
        occupancy_rate: monthRate,
        ...monthStatus,
        weeks,
        has_high_demand_week: hasHighDemandWeek,
      });
    }

    return NextResponse.json(
      {
        success: true,
        months,
        metadata: {
          total_vehicles: totalVehicles,
          total_months: months.length,
          months_analyzed: MONTHS_AHEAD,
          threshold: THRESHOLD_MODERATE,
          generated_at: new Date().toISOString(),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          "CDN-Cache-Control": "public, s-maxage=3600",
          "Vercel-CDN-Cache-Control": "public, s-maxage=3600",
        },
      }
    );
  } catch (error) {
    console.error("Error in occupancy-highlights:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
