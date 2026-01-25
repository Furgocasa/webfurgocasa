import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/search-analytics
 * 
 * Obtiene estadísticas y análisis de búsquedas
 * 
 * Query params:
 * - start_date: Fecha inicio (YYYY-MM-DD)
 * - end_date: Fecha fin (YYYY-MM-DD)
 * - type: 'overview' | 'funnel' | 'dates' | 'vehicles' | 'seasons' | 'duration'
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar que el usuario es administrador
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return NextResponse.json(
        { error: "No autorizado - Solo administradores" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const type = searchParams.get("type") || "overview";

    // Fechas por defecto: últimos 30 días
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const dateFrom = startDate || defaultStartDate;
    const dateTo = endDate || defaultEndDate;

    // ============================================
    // OVERVIEW: KPIs generales
    // ============================================
    if (type === "overview") {
      const { data: searches, error } = await supabase
        .from("search_queries")
        .select("*")
        .gte("searched_at", dateFrom)
        .lte("searched_at", dateTo + " 23:59:59");

      if (error) {
        console.error("Error obteniendo búsquedas:", error);
        return NextResponse.json(
          { error: "Error al obtener estadísticas" },
          { status: 500 }
        );
      }

      const totalSearches = searches?.length || 0;
      const withAvailability = searches?.filter(s => s.had_availability).length || 0;
      const vehicleSelections = searches?.filter(s => s.vehicle_selected).length || 0;
      const bookingsCreated = searches?.filter(s => s.booking_created).length || 0;

      const avgRentalDays = searches?.length 
        ? searches.reduce((sum, s) => sum + s.rental_days, 0) / searches.length 
        : 0;

      const avgAdvanceDays = searches?.length 
        ? searches.reduce((sum, s) => sum + s.advance_days, 0) / searches.length 
        : 0;

      const avgTimeToSelect = searches?.filter(s => s.time_to_select_seconds)
        .reduce((sum, s) => sum + (s.time_to_select_seconds || 0), 0) / 
        (searches?.filter(s => s.time_to_select_seconds).length || 1);

      const avgTimeToBooking = searches?.filter(s => s.time_to_booking_seconds)
        .reduce((sum, s) => sum + (s.time_to_booking_seconds || 0), 0) / 
        (searches?.filter(s => s.time_to_booking_seconds).length || 1);

      return NextResponse.json({
        period: { from: dateFrom, to: dateTo },
        kpis: {
          totalSearches,
          withAvailability,
          vehicleSelections,
          bookingsCreated,
          selectionRate: totalSearches > 0 ? (vehicleSelections / totalSearches * 100).toFixed(2) : 0,
          bookingRateFromSelection: vehicleSelections > 0 ? (bookingsCreated / vehicleSelections * 100).toFixed(2) : 0,
          overallConversionRate: totalSearches > 0 ? (bookingsCreated / totalSearches * 100).toFixed(2) : 0,
          avgRentalDays: avgRentalDays.toFixed(1),
          avgAdvanceDays: avgAdvanceDays.toFixed(1),
          avgTimeToSelectSeconds: Math.round(avgTimeToSelect),
          avgTimeToBookingSeconds: Math.round(avgTimeToBooking),
        }
      });
    }

    // ============================================
    // FUNNEL: Datos para visualización de embudo
    // ============================================
    if (type === "funnel") {
      const { data: searches } = await supabase
        .from("search_queries")
        .select("funnel_stage, had_availability")
        .gte("searched_at", dateFrom)
        .lte("searched_at", dateTo + " 23:59:59");

      const total = searches?.length || 0;
      const withAvailability = searches?.filter(s => s.had_availability).length || 0;
      const withoutAvailability = total - withAvailability;
      const vehicleSelected = searches?.filter(s => s.funnel_stage === "vehicle_selected" || s.funnel_stage === "booking_created").length || 0;
      const bookingCreated = searches?.filter(s => s.funnel_stage === "booking_created").length || 0;

      return NextResponse.json({
        funnel: [
          { stage: "Búsquedas", count: total, percentage: 100 },
          { stage: "Con disponibilidad", count: withAvailability, percentage: total > 0 ? (withAvailability / total * 100).toFixed(1) : 0 },
          { stage: "Vehículo seleccionado", count: vehicleSelected, percentage: total > 0 ? (vehicleSelected / total * 100).toFixed(1) : 0 },
          { stage: "Reserva creada", count: bookingCreated, percentage: total > 0 ? (bookingCreated / total * 100).toFixed(1) : 0 },
        ],
        abandonment: {
          noAvailability: withoutAvailability,
          afterSearch: withAvailability - vehicleSelected,
          afterSelection: vehicleSelected - bookingCreated,
        }
      });
    }

    // ============================================
    // DATES: Fechas más buscadas
    // ============================================
    if (type === "dates") {
      const { data: searches } = await supabase
        .from("search_queries")
        .select("pickup_date, dropoff_date, rental_days, booking_created, season_applied, avg_price_shown")
        .gte("searched_at", dateFrom)
        .lte("searched_at", dateTo + " 23:59:59");

      // Agrupar por rango de fechas
      const dateGroups = searches?.reduce((acc: any, s) => {
        const key = `${s.pickup_date}|${s.dropoff_date}`;
        if (!acc[key]) {
          acc[key] = {
            pickup_date: s.pickup_date,
            dropoff_date: s.dropoff_date,
            rental_days: s.rental_days,
            search_count: 0,
            bookings_count: 0,
            season: s.season_applied,
            avg_price: 0,
            prices: [],
          };
        }
        acc[key].search_count++;
        if (s.booking_created) acc[key].bookings_count++;
        if (s.avg_price_shown) acc[key].prices.push(s.avg_price_shown);
        return acc;
      }, {});

      const topDates = Object.values(dateGroups || {})
        .map((d: any) => ({
          ...d,
          avg_price: d.prices.length > 0 ? (d.prices.reduce((a: number, b: number) => a + b, 0) / d.prices.length).toFixed(2) : 0,
          conversion_rate: d.search_count > 0 ? (d.bookings_count / d.search_count * 100).toFixed(2) : 0,
        }))
        .sort((a: any, b: any) => b.search_count - a.search_count)
        .slice(0, 20);

      return NextResponse.json({ topDates });
    }

    // ============================================
    // VEHICLES: Rendimiento por vehículo
    // ============================================
    if (type === "vehicles") {
      const { data: vehicleStats } = await supabase
        .from("search_queries")
        .select(`
          selected_vehicle_id,
          vehicle_selected,
          booking_created,
          selected_vehicle_price
        `)
        .gte("searched_at", dateFrom)
        .lte("searched_at", dateTo + " 23:59:59")
        .not("selected_vehicle_id", "is", null);

      // Agrupar por vehículo
      const vehicleGroups = vehicleStats?.reduce((acc: any, s) => {
        const id = s.selected_vehicle_id;
        if (!id) return acc;
        
        if (!acc[id]) {
          acc[id] = {
            vehicle_id: id,
            times_selected: 0,
            times_booked: 0,
            prices: [],
          };
        }
        acc[id].times_selected++;
        if (s.booking_created) acc[id].times_booked++;
        if (s.selected_vehicle_price) acc[id].prices.push(s.selected_vehicle_price);
        return acc;
      }, {});

      const vehicleIds = Object.keys(vehicleGroups || {});
      
      // Obtener nombres de vehículos
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("id, name, slug")
        .in("id", vehicleIds);

      const vehiclePerformance = Object.values(vehicleGroups || {})
        .map((v: any) => {
          const vehicle = vehicles?.find((vh: any) => vh.id === v.vehicle_id);
          return {
            vehicle_id: v.vehicle_id,
            vehicle_name: vehicle?.name || "Desconocido",
            vehicle_slug: vehicle?.slug,
            times_selected: v.times_selected,
            times_booked: v.times_booked,
            booking_rate: v.times_selected > 0 ? (v.times_booked / v.times_selected * 100).toFixed(2) : 0,
            avg_price: v.prices.length > 0 ? (v.prices.reduce((a: number, b: number) => a + b, 0) / v.prices.length).toFixed(2) : 0,
          };
        })
        .sort((a: any, b: any) => b.times_selected - a.times_selected);

      return NextResponse.json({ vehiclePerformance });
    }

    // ============================================
    // SEASONS: Análisis por temporada
    // ============================================
    if (type === "seasons") {
      const { data: searches } = await supabase
        .from("search_queries")
        .select("season_applied, vehicle_selected, booking_created, avg_price_shown")
        .gte("searched_at", dateFrom)
        .lte("searched_at", dateTo + " 23:59:59")
        .not("season_applied", "is", null);

      const seasonGroups = searches?.reduce((acc: any, s) => {
        const season = s.season_applied || "Sin temporada";
        if (!acc[season]) {
          acc[season] = {
            season_name: season,
            search_count: 0,
            selection_count: 0,
            booking_count: 0,
            prices: [],
          };
        }
        acc[season].search_count++;
        if (s.vehicle_selected) acc[season].selection_count++;
        if (s.booking_created) acc[season].booking_count++;
        if (s.avg_price_shown) acc[season].prices.push(s.avg_price_shown);
        return acc;
      }, {});

      const seasonStats = Object.values(seasonGroups || {})
        .map((s: any) => ({
          ...s,
          selection_rate: s.search_count > 0 ? (s.selection_count / s.search_count * 100).toFixed(2) : 0,
          conversion_rate: s.search_count > 0 ? (s.booking_count / s.search_count * 100).toFixed(2) : 0,
          avg_price: s.prices.length > 0 ? (s.prices.reduce((a: number, b: number) => a + b, 0) / s.prices.length).toFixed(2) : 0,
        }))
        .sort((a: any, b: any) => b.search_count - a.search_count);

      return NextResponse.json({ seasonStats });
    }

    // ============================================
    // DURATION: Distribución por duración
    // ============================================
    if (type === "duration") {
      const { data: searches } = await supabase
        .from("search_queries")
        .select("rental_days, booking_created")
        .gte("searched_at", dateFrom)
        .lte("searched_at", dateTo + " 23:59:59");

      const durationGroups = {
        "1-2 días": { count: 0, bookings: 0 },
        "3-6 días": { count: 0, bookings: 0 },
        "7-13 días (1 semana)": { count: 0, bookings: 0 },
        "14-20 días (2 semanas)": { count: 0, bookings: 0 },
        "21+ días": { count: 0, bookings: 0 },
      };

      searches?.forEach(s => {
        const days = s.rental_days;
        let group: keyof typeof durationGroups;
        
        if (days <= 2) group = "1-2 días";
        else if (days <= 6) group = "3-6 días";
        else if (days <= 13) group = "7-13 días (1 semana)";
        else if (days <= 20) group = "14-20 días (2 semanas)";
        else group = "21+ días";

        durationGroups[group].count++;
        if (s.booking_created) durationGroups[group].bookings++;
      });

      const durationStats = Object.entries(durationGroups).map(([name, data]) => ({
        duration: name,
        search_count: data.count,
        booking_count: data.bookings,
        conversion_rate: data.count > 0 ? (data.bookings / data.count * 100).toFixed(2) : 0,
        percentage: searches?.length ? (data.count / searches.length * 100).toFixed(1) : 0,
      }));

      return NextResponse.json({ durationStats });
    }

    // ============================================
    // DEMAND-AVAILABILITY: Demanda vs Disponibilidad
    // ============================================
    if (type === "demand-availability") {
      // 1. Obtener todas las búsquedas agrupadas por semana
      const { data: searches } = await supabase
        .from("search_queries")
        .select("pickup_date, dropoff_date, rental_days")
        .gte("searched_at", dateFrom)
        .lte("searched_at", dateTo + " 23:59:59")
        .gte("pickup_date", dateFrom) // Solo búsquedas para fechas futuras en el rango
        .lte("pickup_date", new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Próximo año

      // 2. Agrupar búsquedas por semana
      const weeklyDemand: Record<string, {
        start: string;
        end: string;
        searches: number;
        dateRanges: Set<string>;
      }> = {};

      searches?.forEach(s => {
        const pickupDate = new Date(s.pickup_date);
        // Obtener lunes de esa semana
        const monday = new Date(pickupDate);
        monday.setDate(pickupDate.getDate() - pickupDate.getDay() + 1);
        const weekKey = monday.toISOString().split('T')[0];
        
        // Calcular domingo
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        if (!weeklyDemand[weekKey]) {
          weeklyDemand[weekKey] = {
            start: weekKey,
            end: sunday.toISOString().split('T')[0],
            searches: 0,
            dateRanges: new Set(),
          };
        }
        
        weeklyDemand[weekKey].searches++;
        weeklyDemand[weekKey].dateRanges.add(`${s.pickup_date}|${s.dropoff_date}`);
      });

      // 3. Para cada semana, calcular ocupación
      const weeks = Object.keys(weeklyDemand).sort();
      const demandAvailabilityData = await Promise.all(
        weeks.map(async (weekStart) => {
          const weekData = weeklyDemand[weekStart];
          
          // Obtener todas las reservas que se solapan con esta semana
          const { data: bookings } = await supabase
            .from("bookings")
            .select("pickup_date, dropoff_date, vehicle_id")
            .neq("status", "cancelled")
            .in("payment_status", ["partial", "paid"])
            .lte("pickup_date", weekData.end)
            .gte("dropoff_date", weekData.start);

          // Obtener total de vehículos disponibles para alquiler
          const { count: totalVehicles } = await supabase
            .from("vehicles")
            .select("id", { count: "exact", head: true })
            .eq("is_for_rent", true)
            .eq("status", "available");

          // Calcular días-vehículo ocupados
          let totalDaysOccupied = 0;
          const weekStartDate = new Date(weekData.start);
          const weekEndDate = new Date(weekData.end);
          const weekDays = 7;

          bookings?.forEach(booking => {
            const bookingStart = new Date(booking.pickup_date);
            const bookingEnd = new Date(booking.dropoff_date);
            
            // Calcular overlap entre la reserva y la semana
            const overlapStart = bookingStart > weekStartDate ? bookingStart : weekStartDate;
            const overlapEnd = bookingEnd < weekEndDate ? bookingEnd : weekEndDate;
            
            if (overlapStart <= overlapEnd) {
              const daysOverlap = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              totalDaysOccupied += daysOverlap;
            }
          });

          // Calcular % de ocupación
          const totalCapacity = (totalVehicles || 1) * weekDays;
          const occupancyRate = (totalDaysOccupied / totalCapacity) * 100;
          const availabilityRate = 100 - occupancyRate;

          // Calcular índice de demanda (búsquedas por vehículo disponible)
          const demandIndex = weekData.searches / (totalVehicles || 1);

          // Determinar oportunidad de precio
          let priceOpportunity: "high" | "medium" | "low" | "none" = "none";
          let recommendation = "";

          if (occupancyRate >= 80 && demandIndex >= 2) {
            priceOpportunity = "high";
            recommendation = `⚠️ ALTA DEMANDA + ALTA OCUPACIÓN: Considera subir precios +15-20%`;
          } else if (occupancyRate >= 60 && demandIndex >= 1.5) {
            priceOpportunity = "medium";
            recommendation = `💡 DEMANDA MODERADA: Posible subida de precios +10%`;
          } else if (occupancyRate < 40 && demandIndex < 0.5) {
            priceOpportunity = "low";
            recommendation = `📉 BAJA DEMANDA: Considera promociones o descuentos`;
          } else if (occupancyRate >= 70 && demandIndex < 1) {
            recommendation = `✅ OCUPACIÓN ALTA pero pocas búsquedas: Precio adecuado`;
          } else if (occupancyRate < 50 && demandIndex >= 2) {
            recommendation = `🎯 ALTA DEMANDA pero baja ocupación: Revisar proceso de reserva`;
          } else {
            recommendation = `✓ Situación normal`;
          }

          return {
            week_start: weekData.start,
            week_end: weekData.end,
            search_count: weekData.searches,
            unique_date_ranges: weekData.dateRanges.size,
            occupancy_rate: occupancyRate.toFixed(1),
            availability_rate: availabilityRate.toFixed(1),
            total_vehicles: totalVehicles || 0,
            demand_index: demandIndex.toFixed(2),
            price_opportunity: priceOpportunity,
            recommendation,
          };
        })
      );

      return NextResponse.json({ 
        demandAvailability: demandAvailabilityData.sort((a, b) => 
          b.week_start.localeCompare(a.week_start)
        ) 
      });
    }

    return NextResponse.json(
      { error: "Tipo de análisis no soportado" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error en search-analytics:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
