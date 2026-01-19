import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await request.json();
    const { booking, extras, customerStats } = body || {};

    if (
      !booking ||
      !booking.vehicle_id ||
      !booking.customer_id ||
      !booking.pickup_date ||
      !booking.dropoff_date
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos para crear la reserva" },
        { status: 400 }
      );
    }

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
