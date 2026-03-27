import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/server";
import { differenceInDays, parseISO, eachDayOfInterval, format } from "date-fns";

// ============================================
// ENDPOINT PÚBLICO: Indicadores para el cliente (semáforo en /reservar)
// ============================================
// GET /api/occupancy-highlights
//
// Mide presión para el cliente: días no reservables = reservas que ya contábamos
// (confirmada / en curso / completada) ∪ bloqueos (blocked_dates).
// El admin sigue pudiendo separar bloqueo vs venta; aquí se agregan para el semáforo.
// blocked_dates: RLS solo admin → lectura con service role en servidor.
// Cache recomendado: 1-2 horas
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface OccupancyPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  occupancy_rate: number;
  status: "available" | "moderate" | "high" | "full";
  color: "green" | "yellow" | "orange" | "red";
  label: string;
  icon: string;
}

// Periodos destacados 2026 (actualizar anualmente)
const KEY_PERIODS_2026 = [
  { id: "semana-santa-2026", name: "Semana Santa", start: "2026-03-29", end: "2026-04-05" },
  { id: "puente-mayo-2026", name: "Puente de Mayo", start: "2026-05-01", end: "2026-05-04" },
  { id: "verano-julio-2026", name: "Julio", start: "2026-07-01", end: "2026-07-31" },
  { id: "verano-agosto-2026", name: "Agosto", start: "2026-08-01", end: "2026-08-31" },
  { id: "puente-pilar-2026", name: "Puente del Pilar", start: "2026-10-10", end: "2026-10-13" },
  { id: "puente-diciembre-2026", name: "Puente Diciembre", start: "2026-12-05", end: "2026-12-08" },
];

function getOccupancyStatus(rate: number): {
  status: OccupancyPeriod["status"];
  color: OccupancyPeriod["color"];
  label: string;
  icon: string;
} {
  // Umbrales semáforo (vista cliente): moderado 40–60, alta 60–85, muy alta >85
  if (rate > 85) {
    return {
      status: "full",
      color: "red",
      label: "Muy alta demanda",
      icon: "🔴",
    };
  }
  if (rate >= 60) {
    return {
      status: "high",
      color: "orange",
      label: "Alta demanda",
      icon: "🟠",
    };
  }
  if (rate >= 40) {
    return {
      status: "moderate",
      color: "yellow",
      label: "Ocupación moderada",
      icon: "🟡",
    };
  }
  return {
    status: "available",
    color: "green",
    label: "Disponible",
    icon: "🟢",
  };
}

const minKeyPeriodStart = KEY_PERIODS_2026.reduce(
  (min, p) => (p.start < min ? p.start : min),
  KEY_PERIODS_2026[0].start
);
const maxKeyPeriodEnd = KEY_PERIODS_2026.reduce(
  (max, p) => (p.end > max ? p.end : max),
  KEY_PERIODS_2026[0].end
);

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Obtener vehículos alquilables activos
    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("id")
      .eq("is_for_rent", true)
      .eq("status", "available")
      .or('sale_status.neq.sold,sale_status.is.null');

    if (vehiclesError) {
      console.error("Error fetching vehicles:", vehiclesError);
      return NextResponse.json(
        { error: "Error al obtener vehículos" },
        { status: 500 }
      );
    }

    const totalVehicles = vehicles?.length || 0;

    if (totalVehicles === 0) {
      return NextResponse.json(
        { error: "No hay vehículos disponibles" },
        { status: 404 }
      );
    }

    // 2. Reservas que cuentan como ocupación (igual que antes este endpoint)
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("vehicle_id, pickup_date, dropoff_date")
      .in("status", ["confirmed", "in_progress", "completed"]);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { error: "Error al obtener reservas" },
        { status: 500 }
      );
    }

    const fleetIds = vehicles.map((v) => v.id);

    // 3. Bloqueos por vehículo (RLS: solo service role en servidor)
    let blockedRanges: {
      vehicle_id: string;
      start_date: string;
      end_date: string;
    }[] = [];
    try {
      const admin = createAdminClient();
      const { data: blocks, error: blocksError } = await admin
        .from("blocked_dates")
        .select("vehicle_id, start_date, end_date")
        .in("vehicle_id", fleetIds)
        .lte("start_date", maxKeyPeriodEnd)
        .gte("end_date", minKeyPeriodStart);

      if (blocksError) {
        console.error("Error fetching blocked_dates:", blocksError);
      } else {
        blockedRanges = blocks ?? [];
      }
    } catch (e) {
      console.error("Admin client / blocked_dates:", e);
    }

    // 4. Calcular % de días no reservables (reservas ∪ bloqueos) por periodo
    const results: OccupancyPeriod[] = KEY_PERIODS_2026.map((period) => {
      const periodStart = parseISO(period.start);
      const periodEnd = parseISO(period.end);
      const totalDays = differenceInDays(periodEnd, periodStart) + 1;
      const totalAvailableDays = totalDays * totalVehicles;

      let totalNonReservableDays = 0;

      vehicles?.forEach((vehicle) => {
        const vehicleBookings =
          bookings?.filter((b) => b.vehicle_id === vehicle.id) || [];
        const vehicleBlocks =
          blockedRanges.filter((b) => b.vehicle_id === vehicle.id) || [];

        const nonReservableDates = new Set<string>();

        vehicleBookings.forEach((booking) => {
          const bookingStart = parseISO(booking.pickup_date);
          const bookingEnd = parseISO(booking.dropoff_date);

          if (bookingEnd >= periodStart && bookingStart <= periodEnd) {
            const effectiveStart =
              bookingStart < periodStart ? periodStart : bookingStart;
            const effectiveEnd =
              bookingEnd > periodEnd ? periodEnd : bookingEnd;

            eachDayOfInterval({
              start: effectiveStart,
              end: effectiveEnd,
            }).forEach((day) => {
              nonReservableDates.add(format(day, "yyyy-MM-dd"));
            });
          }
        });

        vehicleBlocks.forEach((block) => {
          const blockStart = parseISO(block.start_date);
          const blockEnd = parseISO(block.end_date);
          if (blockEnd >= periodStart && blockStart <= periodEnd) {
            const effectiveStart =
              blockStart < periodStart ? periodStart : blockStart;
            const effectiveEnd = blockEnd > periodEnd ? periodEnd : blockEnd;
            eachDayOfInterval({
              start: effectiveStart,
              end: effectiveEnd,
            }).forEach((day) => {
              nonReservableDates.add(format(day, "yyyy-MM-dd"));
            });
          }
        });

        totalNonReservableDays += nonReservableDates.size;
      });

      const occupancyRate =
        totalAvailableDays > 0
          ? Math.round(
              (totalNonReservableDays / totalAvailableDays) * 100 * 10
            ) / 10
          : 0;

      // Obtener estado y color
      const statusInfo = getOccupancyStatus(occupancyRate);

      return {
        id: period.id,
        name: period.name,
        start_date: period.start,
        end_date: period.end,
        occupancy_rate: occupancyRate,
        ...statusInfo,
      };
    });

    // 5. Filtrar periodos pasados y ordenar por fecha
    const now = new Date();
    const futureResults = results.filter(
      (period) => parseISO(period.end_date) >= now
    );

    // 6. Solo periodos con ocupación >= 40% (moderado o más — alineado con nuevos umbrales)
    const highDemandResults = futureResults.filter(
      (period) => period.occupancy_rate >= 40
    );

    // 7. Limitar a los próximos 5 periodos de alta demanda
    const limitedResults = highDemandResults.slice(0, 5);

    return NextResponse.json(
      {
        success: true,
        periods: limitedResults,
        metadata: {
          total_vehicles: totalVehicles,
          total_periods: limitedResults.length,
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
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
