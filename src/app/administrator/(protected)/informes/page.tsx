import { createClient } from "@/lib/supabase/server";
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
    .select('id, name, slug, start_date, end_date, is_active')
    .order('start_date', { ascending: true });

  if (seasonsError) {
    console.error('Error fetching seasons:', seasonsError);
  }

  return { 
    vehicles: vehicles || [], 
    bookings: bookings || [], 
    seasons: seasons || [] 
  };
}

export default async function InformesPage() {
  const { vehicles, bookings, seasons } = await getInformesData();

  return (
    <InformesClient
      vehicles={vehicles}
      bookings={bookings}
      seasons={seasons}
    />
  );
}
