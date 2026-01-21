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
  deposit_amount: z.number().nonnegative().optional(),
  customer_name: z.string().min(2).max(200),
  customer_email: z.string().email().max(255),
  notes: z.string().max(2000).optional().nullable(),
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

    return NextResponse.json({ booking: createdBooking }, { status: 201 });
  } catch (error: any) {
    console.error("Error in bookings API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
