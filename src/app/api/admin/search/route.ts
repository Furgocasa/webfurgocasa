import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const supabase = await createClient();

    // Verificar que el usuario es administrador
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchTerm = `%${query}%`;

    // Primero buscar clientes que coincidan
    const { data: matchingCustomers } = await supabase
      .from("customers")
      .select("id")
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`)
      .limit(10);

    const customerIds = matchingCustomers?.map(c => c.id) || [];

    // Buscar vehículos que coincidan
    const { data: matchingVehicles } = await supabase
      .from("vehicles")
      .select("id")
      .or(`name.ilike.${searchTerm},internal_code.ilike.${searchTerm}`)
      .limit(10);

    const vehicleIds = matchingVehicles?.map(v => v.id) || [];

    // Buscar ubicaciones que coincidan
    const { data: matchingLocations } = await supabase
      .from("locations")
      .select("id")
      .or(`name.ilike.${searchTerm},city.ilike.${searchTerm},address.ilike.${searchTerm}`)
      .limit(10);

    const locationIds = matchingLocations?.map(l => l.id) || [];

    // Debug: Log para ver qué IDs se encontraron
    console.log('🔍 Búsqueda:', query);
    console.log('📍 Location IDs encontrados:', locationIds);
    console.log('👥 Customer IDs encontrados:', customerIds);
    console.log('🚗 Vehicle IDs encontrados:', vehicleIds);

    // Construir consulta de bookings dinámicamente
    const buildBookingsQuery = async () => {
      const orConditions: string[] = [
        `booking_number.ilike.${searchTerm}`,
        `customer_name.ilike.${searchTerm}`,
        `customer_email.ilike.${searchTerm}`,
      ];

      if (customerIds.length > 0) {
        orConditions.push(`customer_id.in.(${customerIds.join(",")})`);
      }
      if (vehicleIds.length > 0) {
        orConditions.push(`vehicle_id.in.(${vehicleIds.join(",")})`);
      }
      if (locationIds.length > 0) {
        orConditions.push(`pickup_location_id.in.(${locationIds.join(",")})`);
        orConditions.push(`dropoff_location_id.in.(${locationIds.join(",")})`);
      }

      console.log('🔎 OR Conditions para bookings:', orConditions);

      return supabase
        .from("bookings")
        .select(`
          id, 
          booking_number, 
          status, 
          payment_status,
          pickup_date,
          dropoff_date,
          total_price,
          customer_id,
          vehicle_id,
          pickup_location_id,
          dropoff_location_id,
          customer:customer_id(name, email, phone),
          vehicle:vehicle_id(name, internal_code),
          pickup_location:pickup_location_id(id, name, city),
          dropoff_location:dropoff_location_id(id, name, city)
        `)
        .or(orConditions.join(','))
        .order("created_at", { ascending: false })
        .limit(5);
    };

    // Buscar en paralelo en todas las entidades
    const [vehicles, bookings, customers, extras, locations] = await Promise.all([
      // Vehículos
      supabase
        .from("vehicles")
        .select("id, name, internal_code, brand, model, year, status, plate_number")
        .or(`name.ilike.${searchTerm},internal_code.ilike.${searchTerm},brand.ilike.${searchTerm},model.ilike.${searchTerm},plate_number.ilike.${searchTerm}`)
        .limit(5),

      // Reservas - Buscar por número de reserva O por cliente O por vehículo O por ubicación
      buildBookingsQuery(),

      // Clientes
      supabase
        .from("customers")
        .select("id, name, email, phone, dni, total_bookings")
        .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm},dni.ilike.${searchTerm}`)
        .limit(5),

      // Extras
      supabase
        .from("extras")
        .select("id, name, description, price_per_day, price_per_rental, price_type")
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .eq("is_active", true)
        .limit(5),

      // Ubicaciones
      supabase
        .from("locations")
        .select("id, name, address, city, postal_code, is_active")
        .or(`name.ilike.${searchTerm},address.ilike.${searchTerm},city.ilike.${searchTerm}`)
        .limit(5),
    ]);

    // Debug: Log de resultados
    console.log('📊 Bookings encontrados:', bookings.data?.length || 0);
    console.log('📋 Bookings:', bookings.data);
    if (bookings.error) {
      console.error('❌ Error en bookings query:', bookings.error);
    }

    // Formatear resultados
    const results = {
      vehicles: vehicles.data || [],
      bookings: bookings.data || [],
      customers: customers.data || [],
      extras: extras.data || [],
      locations: locations.data || [],
      total:
        (vehicles.data?.length || 0) +
        (bookings.data?.length || 0) +
        (customers.data?.length || 0) +
        (extras.data?.length || 0) +
        (locations.data?.length || 0),
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in global search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

