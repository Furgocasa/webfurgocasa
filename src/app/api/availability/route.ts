import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { 
  calculateRentalDays, 
  calculatePricingDays, 
  calculateSeasonalPrice, 
  calculateSeasonalSurcharge,
  Season 
} from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/**
 * GET /api/availability
 * 
 * Busca vehículos disponibles para las fechas indicadas
 * 
 * Query params:
 * - pickup_date: Fecha de recogida (YYYY-MM-DD)
 * - dropoff_date: Fecha de devolución (YYYY-MM-DD)
 * - pickup_time: Hora de recogida (HH:MM) - default: 10:00
 * - dropoff_time: Hora de devolución (HH:MM) - default: 10:00
 * - pickup_location: ID de ubicación de recogida
 * - dropoff_location: ID de ubicación de devolución (opcional)
 * - category: Slug de categoría (opcional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const pickupDate = searchParams.get("pickup_date");
    const dropoffDate = searchParams.get("dropoff_date");
    const pickupTime = searchParams.get("pickup_time") || "10:00";
    const dropoffTime = searchParams.get("dropoff_time") || "10:00";
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
    // Bloquean vehículos SOLO si ya tienen al menos el primer pago,
    // independientemente del estado operativo de la reserva
    const { data: conflictingBookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("vehicle_id")
      .neq("status", "cancelled")
      .in("payment_status", ["partial", "paid"])
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
    // IMPORTANTE: Usar calculateRentalDays que considera las horas (períodos completos de 24h)
    const days = calculateRentalDays(pickupDate, pickupTime, dropoffDate, dropoffTime);
    
    // Regla de negocio: 2 días se cobran como 3
    const pricingDays = calculatePricingDays(days);
    const hasTwoDayPricing = days === 2;

    // Obtener TODAS las temporadas activas que cubren el rango de fechas
    const { data: seasonsData } = await supabase
      .from("seasons")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", dropoffDate)
      .gte("end_date", pickupDate);

    // Usar función centralizada para calcular precios por temporada
    const seasons = (seasonsData || []) as Season[];
    const priceResult = calculateSeasonalPrice(pickupDate, pricingDays, seasons);
    
    // Para mostrar el precio promedio por día
    const finalPricePerDay = priceResult.avgPricePerDay;
    
    // Calcular sobrecoste promedio respecto a temporada baja
    const seasonalAddition = calculateSeasonalSurcharge(finalPricePerDay, pricingDays);

    // Calcular precios
    const vehiclesWithPrices = availableVehicles?.map((vehicle) => {
      const totalPrice = priceResult.total;

      // Calcular cuánto se está ahorrando respecto al precio máximo (temporada baja < 7 días)
      const fullPricePerDay = 95; // Precio base sin descuento por duración
      const maxPossiblePrice = fullPricePerDay + (seasonalAddition > 0 ? seasonalAddition : 0);
      const savings = maxPossiblePrice - finalPricePerDay;
      const discountPercentage = Math.round((savings / maxPossiblePrice) * 100);

      return {
        ...vehicle,
        pricing: {
          days, // Días reales del alquiler
          pricingDays, // Días usados para calcular el precio
          hasTwoDayPricing, // Flag para mostrar aviso
          pricePerDay: Math.round(finalPricePerDay * 100) / 100,
          originalPricePerDay: fullPricePerDay,
          totalPrice: Math.round(totalPrice * 100) / 100,
          originalTotalPrice: Math.round(fullPricePerDay * pricingDays * 100) / 100,
          season: priceResult.dominantSeason,
          seasonBreakdown: priceResult.seasonBreakdown,
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

    // Información de las temporadas aplicables al período
    const seasonsInfo = priceResult.seasonBreakdown.map(s => ({
      name: s.name,
      days: s.days,
      pricePerDay: s.pricePerDay,
    }));

    // Obtener los días mínimos de la temporada dominante (viene del cálculo)
    const minDays = priceResult.minDays;

    const response = NextResponse.json({
      success: true,
      searchParams: {
        pickupDate,
        dropoffDate,
        pickupTime,
        dropoffTime,
        pickupLocation,
        dropoffLocation,
        days,
        pricingDays,
        hasTwoDayPricing,
      },
      season: {
        name: priceResult.dominantSeason,
        seasonalAddition: seasonalAddition,
        minDays: minDays,
        breakdown: seasonsInfo,
      },
      locationFee,
      vehicles: vehiclesWithPrices || [],
      totalResults: vehiclesWithPrices?.length || 0,
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (error) {
    console.error("Error en búsqueda de disponibilidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
