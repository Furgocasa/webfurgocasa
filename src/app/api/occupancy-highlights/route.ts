import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { differenceInDays, parseISO, eachDayOfInterval, format } from "date-fns";

// ============================================
// ENDPOINT PÚBLICO: Indicadores de Ocupación
// ============================================
// GET /api/occupancy-highlights
// 
// Devuelve ocupación de periodos clave (Semana Santa, verano, puentes)
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
  if (rate >= 90) {
    return {
      status: "full",
      color: "red",
      label: "Completo",
      icon: "🔴",
    };
  }
  if (rate >= 70) {
    return {
      status: "high",
      color: "orange",
      label: "Alta demanda",
      icon: "🟠",
    };
  }
  if (rate >= 50) {
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

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Obtener vehículos alquilables activos
    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("id")
      .eq("is_for_rent", true)
      .eq("status", "available");

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

    // 2. Obtener todas las reservas confirmadas/activas/completadas
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("vehicle_id, pickup_date, dropoff_date, status")
      .in("status", ["confirmed", "in_progress", "completed"]);

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { error: "Error al obtener reservas" },
        { status: 500 }
      );
    }

    // 3. Calcular ocupación para cada periodo
    const results: OccupancyPeriod[] = KEY_PERIODS_2026.map((period) => {
      const periodStart = parseISO(period.start);
      const periodEnd = parseISO(period.end);
      const totalDays = differenceInDays(periodEnd, periodStart) + 1;
      const totalAvailableDays = totalDays * totalVehicles;

      // Calcular días ocupados
      let totalBookedDays = 0;

      vehicles?.forEach((vehicle) => {
        const vehicleBookings = bookings?.filter(
          (b) => b.vehicle_id === vehicle.id
        ) || [];

        // Set para evitar contar el mismo día dos veces
        const bookedDates = new Set<string>();

        vehicleBookings.forEach((booking) => {
          const bookingStart = parseISO(booking.pickup_date);
          const bookingEnd = parseISO(booking.dropoff_date);

          // Verificar si hay solapamiento con el periodo
          if (bookingEnd >= periodStart && bookingStart <= periodEnd) {
            // Calcular fechas efectivas dentro del periodo
            const effectiveStart =
              bookingStart < periodStart ? periodStart : bookingStart;
            const effectiveEnd =
              bookingEnd > periodEnd ? periodEnd : bookingEnd;

            // Generar todas las fechas del rango
            const days = eachDayOfInterval({
              start: effectiveStart,
              end: effectiveEnd,
            });

            days.forEach((day) => {
              bookedDates.add(format(day, "yyyy-MM-dd"));
            });
          }
        });

        totalBookedDays += bookedDates.size;
      });

      // Calcular tasa de ocupación
      const occupancyRate =
        totalAvailableDays > 0
          ? Math.round((totalBookedDays / totalAvailableDays) * 100 * 10) / 10
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

    // 4. Filtrar periodos pasados y ordenar por fecha
    const now = new Date();
    const futureResults = results.filter(
      (period) => parseISO(period.end_date) >= now
    );

    // 5. ⚠️ IMPORTANTE: Solo mostrar periodos con ocupación >= 50%
    // No tiene sentido mostrar disponibilidad alta (verde) - no genera urgencia
    const highDemandResults = futureResults.filter(
      (period) => period.occupancy_rate >= 50
    );

    // 6. Limitar a los próximos 5 periodos de alta demanda
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
