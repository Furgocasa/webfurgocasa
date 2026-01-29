import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { 
  calculateRentalDays, 
  calculatePricingDays, 
  calculateSeasonalPrice, 
  calculateSeasonalSurcharge,
  calculateDurationDiscount,
  Season 
} from "@/lib/utils";
import { detectDeviceType } from "@/lib/search-tracking/session";

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

    // Calcular descuento por duración CORRECTAMENTE:
    // Compara precio sin descuento (price_less_than_week de cada día) vs precio con descuento
    const durationDiscountInfo = calculateDurationDiscount(pickupDate, pricingDays, seasons);

    // 6. Obtener datos de ubicaciones (por slug, no por ID)
    const locationSlugs = [pickupLocation, dropoffLocation].filter(Boolean) as string[];
    const { data: locations } = await supabase
      .from("locations")
      .select("*")
      .in("slug", locationSlugs);

    // Calcular fee de ubicación (sumar ambas ubicaciones)
    let locationFee = 0;
    const pickupLoc = locations?.find((l) => l.slug === pickupLocation);
    const dropoffLoc = locations?.find((l) => l.slug === dropoffLocation);
    locationFee = (pickupLoc?.extra_fee || 0) + (dropoffLoc?.extra_fee || 0);
    console.log(`[LOCATION_FEE] Pickup: ${pickupLocation} (${pickupLoc?.extra_fee || 0}€), Dropoff: ${dropoffLocation} (${dropoffLoc?.extra_fee || 0}€), Total: ${locationFee}€`);

    // Calcular precios
    const vehiclesWithPrices = availableVehicles?.map((vehicle) => {
      // Calcular precio total incluyendo location_fee
      const baseTotal = priceResult.total; // Precio con descuento por duración
      const originalTotal = durationDiscountInfo.originalTotal; // Precio sin descuento por duración
      
      // Totales con location_fee
      const totalWithLocationFee = baseTotal + locationFee;
      const originalTotalWithLocationFee = originalTotal + locationFee;
      
      // Precio por día incluyendo location_fee (para mostrar correctamente)
      const pricePerDayWithLocation = totalWithLocationFee / pricingDays;
      const originalPricePerDayWithLocation = originalTotalWithLocationFee / pricingDays;
      
      // Calcular descuento efectivo (sobre totales CON location_fee)
      // Esto es lo que el usuario realmente ve como descuento
      const effectiveDiscountPercentage = originalTotalWithLocationFee > 0
        ? Math.round(((originalTotalWithLocationFee - totalWithLocationFee) / originalTotalWithLocationFee) * 1000) / 10
        : 0;
      
      return {
        ...vehicle,
        pricing: {
          days, // Días reales del alquiler
          pricingDays, // Días usados para calcular el precio
          hasTwoDayPricing, // Flag para mostrar aviso
          pricePerDay: Math.round(pricePerDayWithLocation * 100) / 100, // Precio por día CON location_fee
          originalPricePerDay: Math.round(originalPricePerDayWithLocation * 100) / 100, // Precio original por día CON location_fee
          basePrice: Math.round(baseTotal * 100) / 100, // Precio base del alquiler (sin location_fee)
          locationFee: Math.round(locationFee * 100) / 100, // Cargo extra por ubicación
          totalPrice: Math.round(totalWithLocationFee * 100) / 100, // Total incluyendo location_fee
          originalTotalPrice: Math.round(originalTotalWithLocationFee * 100) / 100, // Original CON location_fee
          season: priceResult.dominantSeason,
          seasonBreakdown: priceResult.seasonBreakdown,
          seasonalAddition: seasonalAddition,
          durationDiscount: effectiveDiscountPercentage, // Descuento efectivo considerando location_fee
          hasDurationDiscount: effectiveDiscountPercentage > 0,
        },
      };
    });

    // Información de las temporadas aplicables al período
    const seasonsInfo = priceResult.seasonBreakdown.map(s => ({
      name: s.name,
      days: s.days,
      pricePerDay: s.pricePerDay,
    }));

    // Obtener los días mínimos de la temporada dominante (viene del cálculo)
    const minDays = priceResult.minDays;

    // ============================================
    // TRACKING: Registrar búsqueda en search_queries
    // ============================================
    console.log("🔍 [TRACKING] ========================================");
    console.log("🔍 [TRACKING] INICIANDO PROCESO DE TRACKING");
    console.log("🔍 [TRACKING] URL:", request.url);
    console.log("🔍 [TRACKING] Método:", request.method);
    console.log("🔍 [TRACKING] ========================================");
    
    let searchQueryId: string | null = null;
    let sessionId: string = request.cookies.get('furgocasa_session_id')?.value || crypto.randomUUID();
    
    console.log("🔍 [TRACKING] Session ID:", sessionId.substring(0, 20) + "...");
    console.log("🔍 [TRACKING] Pickup Date:", pickupDate);
    console.log("🔍 [TRACKING] Dropoff Date:", dropoffDate);
    
    try {
      // Calcular días de antelación
      const advanceDays = Math.ceil(
        (new Date(pickupDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      // Detectar locale desde el referer o accept-language
      let detectedLocale = null;
      const referer = request.headers.get("referer");
      if (referer) {
        // Extraer locale de la URL: /es/, /en/, /fr/, /de/
        const localeMatch = referer.match(/\/(es|en|fr|de)\//);
        if (localeMatch) {
          detectedLocale = localeMatch[1];
        }
      }
      // Fallback a accept-language si no se detecta desde referer
      if (!detectedLocale) {
        detectedLocale = request.headers.get("accept-language")?.split(",")[0]?.split("-")[0] || null;
      }
      
      // Obtener IDs reales de ubicaciones (convertir slugs a UUIDs si es necesario)
      let pickupLocationId: string | null = null;
      let dropoffLocationId: string | null = null;
      
      // Si las ubicaciones son slugs (no UUIDs), obtener sus IDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (pickupLocation) {
        if (uuidRegex.test(pickupLocation)) {
          pickupLocationId = pickupLocation;
        } else {
          const { data: pickupLoc } = await supabase
            .from("locations")
            .select("id")
            .eq("slug", pickupLocation)
            .single();
          pickupLocationId = pickupLoc?.id || null;
        }
      }
      
      if (dropoffLocation) {
        if (uuidRegex.test(dropoffLocation)) {
          dropoffLocationId = dropoffLocation;
        } else {
          const { data: dropoffLoc } = await supabase
            .from("locations")
            .select("id")
            .eq("slug", dropoffLocation)
            .single();
          dropoffLocationId = dropoffLoc?.id || null;
        }
      }
      
      // Preparar datos para insertar
      const searchData = {
        session_id: sessionId,
        pickup_date: pickupDate,
        dropoff_date: dropoffDate,
        pickup_time: pickupTime,
        dropoff_time: dropoffTime,
        rental_days: days,
        advance_days: Math.max(0, advanceDays),
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        pickup_location_id: pickupLocationId,
        dropoff_location_id: dropoffLocationId,
        same_location: pickupLocation === dropoffLocation,
        category_slug: category,
        vehicles_available_count: vehiclesWithPrices?.length || 0,
        season_applied: priceResult.dominantSeason,
        avg_price_shown: finalPricePerDay,
        had_availability: (vehiclesWithPrices?.length || 0) > 0,
        funnel_stage: "search_only",
        locale: detectedLocale,
        user_agent_type: detectDeviceType(request.headers.get("user-agent")),
      };
      
      // Log para debugging - MEJORADO para mejor visibilidad
      console.log("🔍 [TRACKING] ========================================");
      console.log("🔍 [TRACKING] INICIANDO REGISTRO DE BÚSQUEDA");
      console.log("🔍 [TRACKING] ========================================");
      console.log("🔍 [TRACKING] Datos a insertar:", JSON.stringify({
        session_id: sessionId.substring(0, 20) + "...",
        pickup_date: pickupDate,
        dropoff_date: dropoffDate,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        vehicles_count: vehiclesWithPrices?.length || 0,
        locale: detectedLocale,
        user_agent_type: detectDeviceType(request.headers.get("user-agent")),
        funnel_stage: "search_only"
      }, null, 2));
      
      // Insertar registro en search_queries
      const { data: searchQuery, error: searchError } = await supabase
        .from("search_queries")
        .insert(searchData)
        .select("id")
        .single();
      
      if (!searchError && searchQuery) {
        searchQueryId = searchQuery.id;
        console.log("✅ [TRACKING] ========================================");
        console.log("✅ [TRACKING] BÚSQUEDA REGISTRADA EXITOSAMENTE");
        console.log("✅ [TRACKING] ID:", searchQueryId);
        console.log("✅ [TRACKING] Session ID:", sessionId.substring(0, 20) + "...");
        console.log("✅ [TRACKING] ========================================");
      } else {
        console.error("❌ [TRACKING] ========================================");
        console.error("❌ [TRACKING] ERROR REGISTRANDO BÚSQUEDA");
        console.error("❌ [TRACKING] ========================================");
        console.error("❌ [TRACKING] Error completo:", JSON.stringify({
          error: searchError,
          message: searchError?.message,
          details: searchError?.details,
          hint: searchError?.hint,
          code: searchError?.code
        }, null, 2));
        console.error("❌ [TRACKING] Datos que intentaron insertarse:", JSON.stringify({
          ...searchData,
          session_id: sessionId.substring(0, 20) + "..."
        }, null, 2));
        console.error("❌ [TRACKING] ========================================");
        // No fallar la búsqueda si falla el tracking
      }
    } catch (trackingError) {
      // No fallar la búsqueda si falla el tracking
      console.error("❌ [TRACKING] ========================================");
      console.error("❌ [TRACKING] EXCEPCIÓN EN TRACKING DE BÚSQUEDA");
      console.error("❌ [TRACKING] ========================================");
      console.error("❌ [TRACKING] Error:", trackingError);
      if (trackingError instanceof Error) {
        console.error("❌ [TRACKING] Mensaje:", trackingError.message);
        console.error("❌ [TRACKING] Stack trace:", trackingError.stack);
      }
      console.error("❌ [TRACKING] ========================================");
    }

    // Log final antes de responder
    console.log("🔍 [TRACKING] ========================================");
    console.log("🔍 [TRACKING] PREPARANDO RESPUESTA");
    console.log("🔍 [TRACKING] SearchQueryId en respuesta:", searchQueryId);
    console.log("🔍 [TRACKING] Vehículos encontrados:", vehiclesWithPrices?.length || 0);
    console.log("🔍 [TRACKING] ========================================");
    
    const response = NextResponse.json({
      success: true,
      searchQueryId, // Incluir para tracking del cliente
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
    
    // Establecer cookie de sesión con el sessionId ya generado
    if (!request.cookies.get('furgocasa_session_id')) {
      response.cookies.set('furgocasa_session_id', sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 días
        path: '/',
        sameSite: 'lax',
      });
    }
    
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
