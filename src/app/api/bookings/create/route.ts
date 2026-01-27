import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

// ✅ SEGURIDAD: Validar que las variables de entorno existen (sin fallback peligroso)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Esquema de validación con Zod
const bookingSchema = z.object({
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
  customerStats: z.object({
    customer_id: z.string().uuid(),
    total_price: z.number().nonnegative(),
  }).optional(),
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

    const { booking, extras, customerStats } = validationResult.data;

    const { data: createdBooking, error: bookingError } = await supabase
      .from("bookings")
      .insert(booking)
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

    if (customerStats?.customer_id) {
      const { data: currentCustomer } = await supabase
        .from("customers")
        .select("total_bookings,total_spent")
        .eq("id", customerStats.customer_id)
        .single();

      if (currentCustomer) {
        const { error: statsError } = await supabase
          .from("customers")
          .update({
            total_bookings: (currentCustomer.total_bookings || 0) + 1,
            total_spent: (currentCustomer.total_spent || 0) + (customerStats.total_price || 0),
          })
          .eq("id", customerStats.customer_id);

        if (statsError) {
          console.error("Error updating customer stats:", statsError);
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

    return NextResponse.json({ booking: createdBooking }, { status: 201 });
  } catch (error: any) {
    console.error("Error in bookings API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
