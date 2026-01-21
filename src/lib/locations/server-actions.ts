import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';

export interface LocationData {
  id: string;
  name: string;
  slug: string;
  province: string;
  region: string;
  meta_title: string;
  meta_description: string | null;
  h1_title: string | null;
  intro_text: string | null;
  distance_km: number | null;
  drive_time_minutes: number | null;
  hero_image: string | null;
  description: string | null;
  attractions: string[] | null;
  routes: string[] | null;
  lat: number | null;
  lng: number | null;
}

export interface NearbyDestination {
  name: string;
  distance: number;
  description: string;
}

// ⚡ Cache para optimización
export const getLocationBySlug = cache(async (citySlug: string): Promise<LocationData | null> => {
  // Usar cliente público para SSG
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // El slug ya viene en el formato correcto desde generateStaticParams
  // Pero necesitamos extraer solo la parte final si tiene el prefijo completo
  let actualSlug = citySlug;
  if (citySlug && citySlug.includes('alquiler-autocaravanas-campervans-')) {
    const parts = citySlug.split('-');
    actualSlug = parts[parts.length - 1];
  }

  const { data, error } = await supabase
    .from('location_targets')
    .select('*')
    .eq('slug', actualSlug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as LocationData;
});

// Obtener todas las localizaciones para generateStaticParams
export const getAllLocations = cache(async (): Promise<Array<{ city: string }>> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('location_targets')
    .select('slug')
    .order('name');

  if (!data) return [];

  return data.map(loc => ({
    city: `alquiler-autocaravanas-campervans-${loc.slug}`
  }));
});

// Obtener destinos cercanos
export const getNearbyDestinations = cache(async (locationId: string): Promise<NearbyDestination[]> => {
  // Por ahora retornar array vacío, se puede implementar lógica más adelante
  return [];
});

// Obtener vehículos disponibles
export const getAvailableVehicles = cache(async (limit: number = 3) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('vehicles')
    .select(`
      id,
      name,
      slug,
      brand,
      model,
      passengers,
      beds,
      images:vehicle_images(image_url, is_primary)
    `)
    .eq('is_for_rent', true)
    .neq('status', 'inactive')
    .order('internal_code', { ascending: true })
    .limit(limit);

  return (data || []).map(vehicle => ({
    ...vehicle,
    main_image: vehicle.images?.find((img: any) => img.is_primary)?.image_url || vehicle.images?.[0]?.image_url || null
  }));
});

// Helpers para formateo
export function formatDistanceInfo(location: LocationData): string {
  if (!location.distance_km || !location.drive_time_minutes) {
    return '';
  }

  const hours = Math.floor(location.drive_time_minutes / 60);
  const minutes = location.drive_time_minutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${minutes}min` : `${minutes} minutos`;

  return `A solo ${location.distance_km} km de nuestra sede en Murcia (${timeStr} en coche)`;
}
