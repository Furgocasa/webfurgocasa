import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Falta el ID de la reserva" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        customer:customers(
          id,
          name,
          email,
          phone,
          dni,
          address,
          city,
          postal_code,
          country,
          date_of_birth,
          driver_license,
          driver_license_expiry,
          notes,
          total_bookings,
          total_spent
        ),
        vehicle:vehicles(
          id, 
          name, 
          brand, 
          model,
          internal_code,
          images:vehicle_images(image_url, is_primary, sort_order)
        ),
        pickup_location:locations!pickup_location_id(name, address),
        dropoff_location:locations!dropoff_location_id(name, address),
        booking_extras(
          id,
          quantity,
          unit_price,
          total_price,
          extra:extras(name, description)
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Reserva no encontrada" },
          { status: 404 }
        );
      }

      console.error("Error loading booking:", error);
      return NextResponse.json(
        { error: error.message || "Error al cargar la reserva" },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error in booking detail API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
