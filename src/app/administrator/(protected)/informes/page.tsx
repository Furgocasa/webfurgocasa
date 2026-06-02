import { createClient, createAdminClient } from "@/lib/supabase/server";
import InformesClient from "./informes-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Informes | Furgocasa",
};

async function getInformesData() {
  const supabase = await createClient();
  
  // Obtener vehículos (incluidos vendidos para histórico)
  const { data: vehicles, error: vehiclesError } = await supabase
    .from('vehicles')
    .select('id, name, slug, internal_code, is_for_rent, status, sale_status')
    .order('internal_code', { ascending: true, nullsFirst: false });

  if (vehiclesError) {
    console.error('Error fetching vehicles:', vehiclesError);
  }

  // Obtener todas las reservas con datos del vehículo
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      id,
      vehicle_id,
      customer_id,
      pickup_date,
      dropoff_date,
      total_price,
      amount_paid,
      status,
      created_at,
      customer_name,
      customer_email,
      days,
      vehicle:vehicles(id, name, internal_code)
    `)
    .order('pickup_date', { ascending: false });

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
  }

  // Obtener temporadas
  const { data: seasons, error: seasonsError } = await supabase
    .from('seasons')
    .select('id, name, slug, start_date, end_date, is_active, season_type')
    .order('start_date', { ascending: true });

  if (seasonsError) {
    console.error('Error fetching seasons:', seasonsError);
  }

  // Histórico: service_role (RLS sin políticas públicas). Paginado (>1000 filas).
  let historical: {
    id: string;
    vehicle_code: string | null;
    vehicle_label: string;
    vehicle_name: string | null;
    customer_name: string | null;
    channel: string | null;
    location: string | null;
    season_label: string | null;
    season_type: string | null;
    pickup_date: string;
    dropoff_date: string;
    days: number;
    total_price: number;
  }[] = [];

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "SUPABASE_SERVICE_ROLE_KEY no configurada: no se puede cargar historical_bookings"
    );
  } else {
    const adminSupabase = createAdminClient();
    const HISTORICAL_SELECT =
      "id, vehicle_code, vehicle_label, vehicle_name, customer_name, channel, location, season_label, season_type, pickup_date, dropoff_date, days, total_price";
    const PAGE = 1000;
    for (let page = 0; ; page++) {
      const { data: batch, error: historicalError } = await adminSupabase
        .from("historical_bookings")
        .select(HISTORICAL_SELECT)
        .order("pickup_date", { ascending: false })
        .range(page * PAGE, (page + 1) * PAGE - 1);
      if (historicalError) {
        console.error("Error fetching historical_bookings:", historicalError.message);
        break;
      }
      if (!batch?.length) break;
      historical.push(...batch);
      if (batch.length < PAGE) break;
    }
  }

  return { 
    vehicles: vehicles || [], 
    bookings: bookings || [], 
    seasons: seasons || [],
    historical: historical || [],
  };
}

export default async function InformesPage() {
  const { vehicles, bookings, seasons, historical } = await getInformesData();

  return (
    <InformesClient
      vehicles={vehicles}
      bookings={bookings}
      seasons={seasons}
      historical={historical}
    />
  );
}
