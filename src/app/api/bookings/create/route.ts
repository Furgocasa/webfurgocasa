import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validatePickupDropoffAgainstClosedDates } from "@/lib/business-closed-dates";
import { buildPricingForSearch } from "@/lib/rental-search-pricing";
import { extraLineUnitPriceEuros } from "@/lib/utils";

// ✅ SEGURIDAD: Validar que las variables de entorno existen (sin fallback peligroso)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Esquema de validación con Zod
const bookingSchema = z.object({
  booking_number: z.string().min(1).max(20).optional(), // Opcional porque puede generarse por trigger
  vehicle_id: z.string().uuid("ID de vehículo inválido"),
  customer_id: z.string().uuid("ID de cliente inválido"),
  pickup_location_id: z.string().uuid("ID de ubicación de recogida inválido"),
  dropoff_location_id: z.string().uuid("ID de ubicación de devolución inválido"),
  pickup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  dropoff_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  pickup_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido"),
  dropoff_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido"),
  days: z.number().int().positive(),
  base_price: z.number().nonnegative(),
  extras_price: z.number().nonnegative().optional(),
  location_fee: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  total_price: z.number().positive(),
  amount_paid: z.number().nonnegative().optional(),
  customer_name: z.string().min(2).max(200),
  customer_email: z.string().email().max(255),
  notes: z.string().max(2000).optional().nullable(),
  status: z.string().optional(),
  payment_status: z.string().optional(),
  last_minute_offer_id: z.string().uuid().optional().nullable(), // Aceptado pero no insertado (no existe en DB)
  // Campos de cupón (opcionales)
  coupon_id: z.string().uuid().optional().nullable(),
  coupon_code: z.string().max(50).optional().nullable(),
  coupon_discount: z.number().nonnegative().optional(),
});

const extraSchema = z.object({
  extra_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
  total_price: z.number().nonnegative(),
});

const requestSchema = z.object({
  booking: bookingSchema,
  extras: z.array(extraSchema).optional(),
  // customerStats ya no es necesario - se actualiza automáticamente via trigger DB
});

export async function POST(request: Request) {
  try {
    // ✅ SEGURIDAD: Verificar que las variables de entorno están configuradas
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Error: Variables de entorno de Supabase no configuradas");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await request.json();
    
    // ✅ SEGURIDAD: Validar y sanitizar input con Zod
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(", ");
      return NextResponse.json(
        { error: `Datos inválidos: ${errors}` },
        { status: 400 }
      );
    }

    const { booking, extras } = validationResult.data;

    const { data: businessClosedRows } = await supabase
      .from("business_closed_dates")
      .select("start_date, end_date");

    const closedRanges =
      businessClosedRows?.map((r) => ({
        start_date: r.start_date,
        end_date: r.end_date,
      })) ?? [];

    const closedCheck = validatePickupDropoffAgainstClosedDates(
      booking.pickup_date,
      booking.dropoff_date,
      closedRanges
    );
    if (!closedCheck.ok) {
      return NextResponse.json({ error: closedCheck.error }, { status: 400 });
    }

    // ================================================================
    // VALIDACIÓN CRÍTICA: Verificar que el vehículo NO tiene bloqueos
    // ni reservas activas en las fechas solicitadas ANTES de crear
    // ================================================================
    const { data: blockedDates, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("id, start_date, end_date, reason")
      .eq("vehicle_id", booking.vehicle_id)
      .or(`and(start_date.lte.${booking.dropoff_date},end_date.gte.${booking.pickup_date})`);

    if (blockedError) {
      console.error("Error verificando bloqueos:", blockedError);
      return NextResponse.json(
        { error: "Error al verificar disponibilidad del vehículo" },
        { status: 500 }
      );
    }

    if (blockedDates && blockedDates.length > 0) {
      console.error("🚫 RESERVA RECHAZADA: Vehículo bloqueado", {
        vehicle_id: booking.vehicle_id,
        fechas_solicitadas: `${booking.pickup_date} → ${booking.dropoff_date}`,
        bloqueos: blockedDates.map(b => `${b.start_date} → ${b.end_date} (${b.reason || 'sin motivo'})`),
      });
      return NextResponse.json(
        { error: "El vehículo no está disponible en las fechas seleccionadas. Por favor, elige otras fechas o un vehículo diferente." },
        { status: 409 }
      );
    }

    const { data: paidConflicts, error: conflictError } = await supabase
      .from("bookings")
      .select("id, booking_number")
      .eq("vehicle_id", booking.vehicle_id)
      .neq("status", "cancelled")
      .in("payment_status", ["partial", "paid"])
      .or(`and(pickup_date.lte.${booking.dropoff_date},dropoff_date.gte.${booking.pickup_date})`);

    if (conflictError) {
      console.error("Error verificando reservas existentes:", conflictError);
      return NextResponse.json(
        { error: "Error al verificar disponibilidad del vehículo" },
        { status: 500 }
      );
    }

    if (paidConflicts && paidConflicts.length > 0) {
      console.error("🚫 RESERVA RECHAZADA: Vehículo ya reservado con pago", {
        vehicle_id: booking.vehicle_id,
        fechas_solicitadas: `${booking.pickup_date} → ${booking.dropoff_date}`,
        conflictos: paidConflicts.map(b => b.booking_number),
      });
      return NextResponse.json(
        { error: "El vehículo no está disponible en las fechas seleccionadas. Por favor, elige otras fechas o un vehículo diferente." },
        { status: 409 }
      );
    }
    // ================================================================

    // ================================================================
    // ✅ SEGURIDAD: Recalcular precio en servidor y validar contra el cliente.
    // Defensa en profundidad frente a manipulación de `total_price` por cliente.
    // Las reservas desde last_minute_offer_id se loggean pero no se bloquean
    // (el importe proviene de la oferta, no del cálculo estándar).
    // ================================================================
    try {
      const locationIds = [booking.pickup_location_id, booking.dropoff_location_id]
        .filter(Boolean) as string[];
      const { data: locationsData } = await supabase
        .from("locations")
        .select("id, slug")
        .in("id", locationIds);
      const pickupSlug = locationsData?.find(l => l.id === booking.pickup_location_id)?.slug || null;
      const dropoffSlug = locationsData?.find(l => l.id === booking.dropoff_location_id)?.slug || null;

      const serverPricing = await buildPricingForSearch(supabase, {
        pickupDate: booking.pickup_date,
        pickupTime: booking.pickup_time,
        dropoffDate: booking.dropoff_date,
        dropoffTime: booking.dropoff_time,
        pickupLocation: pickupSlug,
        dropoffLocation: dropoffSlug,
      });

      let extrasPriceServer = 0;
      if (Array.isArray(extras) && extras.length > 0) {
        const extraIds = extras.map(e => e.extra_id);
        const { data: extrasData } = await supabase
          .from("extras")
          .select("id, price_per_day, price_per_unit, price_per_rental, price_type, min_quantity")
          .in("id", extraIds);
        const extrasMap = new Map((extrasData || []).map(e => [e.id, e]));
        for (const clientExtra of extras) {
          const serverExtra = extrasMap.get(clientExtra.extra_id);
          if (!serverExtra) {
            console.warn("⚠️ [SEGURIDAD] Extra no encontrado en BD:", clientExtra.extra_id);
            continue;
          }
          const unit = extraLineUnitPriceEuros(serverExtra as any, serverPricing.days);
          extrasPriceServer += unit * clientExtra.quantity;
        }
        extrasPriceServer = Math.round(extrasPriceServer * 100) / 100;
      }

      let couponDiscountServer = 0;
      if (booking.coupon_id) {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("discount_type, discount_value, is_active, valid_from, valid_until, max_uses, current_uses, min_rental_amount, min_rental_days")
          .eq("id", booking.coupon_id)
          .single();
        if (coupon && coupon.is_active) {
          const rentalAmount = serverPricing.basePrice + extrasPriceServer;
          if (coupon.discount_type === "percentage") {
            couponDiscountServer = Math.round((rentalAmount * Number(coupon.discount_value) / 100) * 100) / 100;
          } else {
            couponDiscountServer = Math.min(Number(coupon.discount_value), rentalAmount);
          }
        }
      }

      const totalServer = Math.round(
        (serverPricing.totalPrice + extrasPriceServer - couponDiscountServer) * 100
      ) / 100;
      const totalClient = Number(booking.total_price || 0);
      const diff = Math.abs(totalClient - totalServer);
      const tolerance = Math.max(2, totalServer * 0.02);

      if (diff > tolerance) {
        const isOfferBooking = !!booking.last_minute_offer_id;
        console.warn("⚠️ [SEGURIDAD] Precio cliente != precio servidor:", {
          vehicle_id: booking.vehicle_id,
          pickup: `${booking.pickup_date} ${booking.pickup_time}`,
          dropoff: `${booking.dropoff_date} ${booking.dropoff_time}`,
          totalClient,
          totalServer,
          diff,
          tolerance,
          isOfferBooking,
          basePriceServer: serverPricing.basePrice,
          locationFeeServer: serverPricing.locationFee,
          extrasPriceServer,
          couponDiscountServer,
        });
        if (!isOfferBooking) {
          return NextResponse.json(
            { error: "El precio de la reserva no coincide con el cálculo del servidor. Recarga la página e inténtalo de nuevo." },
            { status: 400 }
          );
        }
      }
    } catch (priceCheckError) {
      // No bloqueamos la reserva si falla el recálculo por un error técnico.
      // Loggeamos y seguimos (mejor reserva con posible inconsistencia que downtime).
      console.error("❌ [SEGURIDAD] Error recalculando precio en servidor:", priceCheckError);
    }
    // ================================================================

    // Filtrar columnas que NO existen en la tabla bookings antes de insertar
    // (ej: last_minute_offer_id - la relación es last_minute_offers.booking_id)
    const ALLOWED_BOOKING_COLUMNS = [
      "booking_number", "vehicle_id", "customer_id", "pickup_location_id", "dropoff_location_id",
      "pickup_date", "pickup_time", "dropoff_date", "dropoff_time", "days",
      "base_price", "extras_price", "location_fee", "discount", "total_price", "amount_paid",
      "status", "payment_status", "customer_name", "customer_email", "notes",
      "coupon_id", "coupon_code", "coupon_discount"
    ] as const;
    const bookingForInsert = Object.fromEntries(
      Object.entries(booking).filter(([key]) => ALLOWED_BOOKING_COLUMNS.includes(key as any))
    ) as typeof booking;

    const { data: createdBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingForInsert)
      .select()
      .single();

    if (bookingError || !createdBooking) {
      console.error("Error creating booking:", bookingError);
      return NextResponse.json(
        { error: bookingError?.message || "Error al crear la reserva" },
        { status: 500 }
      );
    }

    if (Array.isArray(extras) && extras.length > 0) {
      const bookingExtrasData = extras.map((extra: any) => ({
        booking_id: createdBooking.id,
        extra_id: extra.extra_id,
        quantity: extra.quantity,
        unit_price: extra.unit_price,
        total_price: extra.total_price,
      }));

      const { error: extrasError } = await supabase
        .from("booking_extras")
        .insert(bookingExtrasData);

      if (extrasError) {
        console.error("Error creating booking extras:", extrasError);
        return NextResponse.json(
          { error: "Error al crear extras de la reserva" },
          { status: 500 }
        );
      }
    }

    // ============================================
    // NOTA: Las estadísticas del cliente (total_bookings y total_spent)
    // se actualizan automáticamente mediante triggers de base de datos.
    // Ver: supabase/auto-update-customer-stats.sql
    // ============================================

    // Re-validar cupón antes de registrar su uso
    if (booking.coupon_id && booking.coupon_discount && booking.coupon_discount > 0) {
      const { data: couponCheck } = await supabase
        .from("coupons")
        .select("valid_from, valid_until, is_active, max_uses, current_uses")
        .eq("id", booking.coupon_id)
        .single();

      if (couponCheck) {
        const [cpY, cpM, cpD] = booking.pickup_date.split('-').map(Number);
        const pickupDate = new Date(cpY, cpM - 1, cpD);
        const couponInvalid = !couponCheck.is_active
          || (couponCheck.valid_from && pickupDate < new Date(couponCheck.valid_from + 'T00:00:00'))
          || (couponCheck.valid_until && pickupDate > new Date(couponCheck.valid_until + 'T00:00:00'))
          || (couponCheck.max_uses !== null && couponCheck.current_uses >= couponCheck.max_uses);

        if (couponInvalid) {
          await supabase
            .from("bookings")
            .update({
              coupon_id: null,
              coupon_code: null,
              coupon_discount: 0,
              discount: 0,
              total_price: booking.total_price + booking.coupon_discount,
            })
            .eq("id", createdBooking.id);

          return NextResponse.json({
            success: true,
            booking: { ...createdBooking, coupon_removed: true },
            message: "Reserva creada pero el cupón no era válido para las fechas seleccionadas y fue eliminado",
          });
        }
      }
    }

    // Registrar uso del cupón si se aplicó uno
    if (booking.coupon_id && booking.coupon_discount && booking.coupon_discount > 0) {
      // Incrementar contador de usos
      await supabase.rpc('increment_coupon_uses', { coupon_id: booking.coupon_id });
      
      // Registrar en historial de uso
      const originalAmount = booking.total_price + booking.coupon_discount;
      await supabase
        .from("coupon_usage")
        .insert({
          coupon_id: booking.coupon_id,
          booking_id: createdBooking.id,
          customer_id: booking.customer_id,
          discount_amount: booking.coupon_discount,
          original_amount: originalAmount,
          final_amount: booking.total_price,
        });
    }

    // ============================================
    // TRACKING: Actualizar conversión en search_queries
    // ============================================
    try {
      // Intentar obtener el search_query_id desde cookie o header
      const sessionId = request.headers.get('cookie')
        ?.split(';')
        .find(c => c.trim().startsWith('furgocasa_session_id='))
        ?.split('=')[1];
      
      if (sessionId) {
        // Buscar la búsqueda más reciente de esta sesión que seleccionó este vehículo
        const { data: searchQuery } = await supabase
          .from("search_queries")
          .select("id")
          .eq("session_id", sessionId)
          .eq("selected_vehicle_id", booking.vehicle_id)
          .eq("booking_created", false)
          .order("searched_at", { ascending: false })
          .limit(1)
          .single();
        
        if (searchQuery) {
          await supabase
            .from("search_queries")
            .update({
              booking_created: true,
              booking_id: createdBooking.id,
              booking_created_at: new Date().toISOString(),
              funnel_stage: "booking_created",
            })
            .eq("id", searchQuery.id);
        }
      }
    } catch (trackingError) {
      // No fallar la creación de reserva si falla el tracking
      console.error("Error actualizando tracking de conversión:", trackingError);
    }

    // ============================================
    // EMAIL: Enviar email de reserva creada
    // ============================================
    try {
      const { sendBookingCreatedEmail, getBookingDataForEmail } = await import('@/lib/email');
      
      const bookingData = await getBookingDataForEmail(createdBooking.id, supabase);
      
      if (bookingData) {
        const result = await sendBookingCreatedEmail(booking.customer_email, bookingData);
        
        if (result.success) {
          console.log('✅ Email de reserva creada enviado a:', booking.customer_email);
        } else {
          console.error('❌ Error enviando email de reserva creada:', result.error);
        }
      } else {
        console.error('❌ No se pudieron obtener datos de la reserva para el email');
      }
    } catch (emailError) {
      console.error('❌ Error crítico enviando email de reserva creada:', emailError);
      // No bloqueamos la creación de reserva si falla el email
    }

    return NextResponse.json({ booking: createdBooking }, { status: 201 });
  } catch (error: any) {
    console.error("Error in bookings API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
