import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/availability
 * 
 * Busca vehículos disponibles para las fechas indicadas
 * 
 * Query params:
 * - pickup_date: Fecha de recogida (YYYY-MM-DD)
 * - dropoff_date: Fecha de devolución (YYYY-MM-DD)
 * - pickup_location: ID de ubicación de recogida
 * - dropoff_location: ID de ubicación de devolución (opcional)
 * - category: Slug de categoría (opcional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const pickupDate = searchParams.get("pickup_date");
    const dropoffDate = searchParams.get("dropoff_date");
    const pickupLocation = searchParams.get("pickup_location");
    const dropoffLocation = searchParams.get("dropoff_location") || pickupLocation;
    const category = searchParams.get("category");

    // Validaciones
    if (!pickupDate || !dropoffDate) {
      return NextResponse.json(
        { error: "Fechas de recogida y devolución requeridas" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Obtener todos los vehículos activos para alquiler
    let vehiclesQuery = supabase
      .from("vehicles")
      .select(`
        *,
        category:vehicle_categories(*),
        images:vehicle_images(*)
      `)
      .eq("is_for_rent", true)
      .eq("status", "available")
      .order("sort_order", { ascending: true });

    // Filtrar por categoría si se especifica
    if (category) {
      vehiclesQuery = vehiclesQuery.eq("category.slug", category);
    }

    const { data: vehicles, error: vehiclesError } = await vehiclesQuery;

    if (vehiclesError) {
      console.error("Error obteniendo vehículos:", vehiclesError);
      return NextResponse.json(
        { error: "Error al buscar vehículos" },
        { status: 500 }
      );
    }

    // 2. Obtener reservas que se solapan con las fechas solicitadas
    // SOLO bloquean vehículos las reservas confirmadas o en curso
    // Las reservas 'pending' NO bloquean disponibilidad
    const { data: conflictingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("vehicle_id")
      .in("status", ["confirmed", "in_progress"])
      .or(`and(pickup_date.lte.${dropoffDate},dropoff_date.gte.${pickupDate})`);

    if (bookingsError) {
      console.error("Error obteniendo reservas:", bookingsError);
      return NextResponse.json(
        { error: "Error al verificar disponibilidad" },
        { status: 500 }
      );
    }

    // 3. Obtener fechas bloqueadas que se solapan
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("vehicle_id")
      .or(`and(start_date.lte.${dropoffDate},end_date.gte.${pickupDate})`);

    if (blockedError) {
      console.error("Error obteniendo bloqueos:", blockedError);
    }

    // IDs de vehículos no disponibles
    const unavailableVehicleIds = new Set([
      ...(conflictingBookings?.map((b) => b.vehicle_id) || []),
      ...(blockedDates?.map((b) => b.vehicle_id) || []),
    ]);

    // 4. Filtrar vehículos disponibles
    const availableVehicles = vehicles?.filter(
      (v) => !unavailableVehicleIds.has(v.id)
    );

    // 5. Calcular precios para cada vehículo
    const days = Math.ceil(
      (new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Obtener temporada aplicable
    const { data: season } = await supabase
      .from("seasons")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", pickupDate)
      .gte("end_date", pickupDate)
      .single();

    /**
     * Calcula el precio base por día según la duración (siempre basado en temporada baja)
     * - Menos de 7 días: 95€/día
     * - 7-13 días: 85€/día
     * - 14-20 días: 75€/día
     * - 21+ días: 65€/día
     */
    const getBasePriceByDuration = (days: number): number => {
      if (days >= 21) return 65;
      if (days >= 14) return 75;
      if (days >= 7) return 85;
      return 95;
    };

    const basePricePerDay = getBasePriceByDuration(days);

    // Usar los precios de temporada directamente si están disponibles
    // Si no hay temporada o no hay precios, usar 0 como adición
    const seasonalAddition = 0; // TODO: Implementar lógica de precios de temporada basada en los campos reales
    
    const finalPricePerDay = basePricePerDay + seasonalAddition;

    // Calcular precios
    const vehiclesWithPrices = availableVehicles?.map((vehicle) => {
      const totalPrice = finalPricePerDay * days;

      // Calcular cuánto se está ahorrando respecto al precio sin descuento por duración
      const fullPricePerDay = 95 + seasonalAddition; // Precio base sin descuento por duración
      const savings = fullPricePerDay - finalPricePerDay;
      const discountPercentage = Math.round((savings / fullPricePerDay) * 100);

      return {
        ...vehicle,
        pricing: {
          days,
          pricePerDay: Math.round(finalPricePerDay * 100) / 100,
          originalPricePerDay: Math.round(fullPricePerDay * 100) / 100,
          totalPrice: Math.round(totalPrice * 100) / 100,
          originalTotalPrice: Math.round(fullPricePerDay * days * 100) / 100,
          season: season?.name || "Temporada Baja",
          seasonalAddition: seasonalAddition,
          durationDiscount: discountPercentage,
          hasDurationDiscount: discountPercentage > 0,
        },
      };
    });

    // 6. Obtener datos de ubicaciones
    const { data: locations } = await supabase
      .from("locations")
      .select("*")
      .in("id", [pickupLocation, dropoffLocation].filter(Boolean) as string[]);

    // Calcular fee de ubicación si son diferentes
    let locationFee = 0;
    if (pickupLocation !== dropoffLocation) {
      const dropoffLoc = locations?.find((l) => l.id === dropoffLocation);
      locationFee = dropoffLoc?.extra_fee || 0;
    }

    return NextResponse.json({
      success: true,
      searchParams: {
        pickupDate,
        dropoffDate,
        pickupLocation,
        dropoffLocation,
        days,
      },
      season: season
        ? {
            name: season.name,
            modifier: season.base_price_per_day || 0,
            minDays: season.min_days,
          }
        : null,
      locationFee,
      vehicles: vehiclesWithPrices || [],
      totalResults: vehiclesWithPrices?.length || 0,
    });
  } catch (error) {
    console.error("Error en búsqueda de disponibilidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
