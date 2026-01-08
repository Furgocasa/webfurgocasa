/**
 * Queries reutilizables de Supabase
 * Funciones helper para consultas comunes
 */

import { supabase } from './client';
import { createClient } from './server';

// ==============================================
// VEHÍCULOS
// ==============================================

/**
 * Obtener todos los vehículos (para administrador)
 * Ordenados por código interno por defecto
 */
export async function getAllVehicles() {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from('vehicles')
    .select(`
      *,
      category:vehicle_categories(*)
    `)
    .order('internal_code', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching all vehicles:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Obtener todos los vehículos disponibles para alquiler
 * Ordenados por código interno por defecto
 */
export async function getAvailableVehicles() {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      category:vehicle_categories(*),
      images:vehicle_images(*)
    `)
    .eq('is_for_rent', true)
    .neq('status', 'inactive')
    .order('internal_code', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching vehicles:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Obtener un vehículo por slug (Server-side)
 */
export async function getVehicleBySlug(slug: string) {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from('vehicles')
    .select(`
      *,
      category:vehicle_categories(*),
      images:vehicle_images(*),
      vehicle_equipment(
        id,
        notes,
        equipment(*)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching vehicle:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Obtener vehículos en venta
 * Ordenados por código interno por defecto
 */
export async function getVehiclesForSale() {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      category:vehicle_categories(*),
      images:vehicle_images(*)
    `)
    .eq('is_for_sale', true)
    .eq('sale_status', 'available')
    .order('internal_code', { ascending: true, nullsFirst: false });

  if (error) {
    console.error('Error fetching vehicles for sale:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// ==============================================
// CATEGORÍAS
// ==============================================

/**
 * Obtener todas las categorías de vehículos
 */
export async function getVehicleCategories() {
  const { data, error } = await supabase
    .from('vehicle_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// ==============================================
// UBICACIONES
// ==============================================

/**
 * Obtener ubicaciones activas
 */
export async function getActiveLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching locations:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// ==============================================
// EXTRAS
// ==============================================

/**
 * Obtener extras activos
 */
export async function getActiveExtras() {
  const { data, error } = await supabase
    .from('extras')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching extras:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// ==============================================
// BLOG/PUBLICACIONES
// ==============================================

/**
 * Obtener posts publicados
 */
export async function getPublishedPosts(postType?: 'blog' | 'publication' | 'news') {
  let query = supabase
    .from('posts')
    .select(`
      *,
      category:content_categories(*),
      author:admins(*)
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (postType) {
    query = query.eq('post_type', postType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Obtener un post por slug
 */
export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      category:content_categories(*),
      author:admins(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// ==============================================
// FUNCIONES AVANZADAS (Server-side con service_role)
// ==============================================

/**
 * Verificar disponibilidad de un vehículo (RPC)
 */
export async function checkVehicleAvailability(
  vehicleId: string,
  pickupDate: string,
  dropoffDate: string
) {
  const { data, error } = await supabase
    .rpc('check_vehicle_availability', {
      p_vehicle_id: vehicleId,
      p_pickup_date: pickupDate,
      p_dropoff_date: dropoffDate,
    });

  if (error) {
    console.error('Error checking availability:', error);
    return { available: false, error };
  }

  return { available: data, error: null };
}

/**
 * Crear una reserva (Server-side)
 * Nota: Esta función debería llamarse desde una API route
 */
export async function createBooking(bookingData: any) {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// ==============================================
// RESERVAS (ADMINISTRADOR)
// ==============================================

/**
 * Obtener todas las reservas (para administrador)
 */
export async function getAllBookings() {
  const supabaseServer = await createClient();
  const { data, error } = await supabaseServer
    .from('bookings')
    .select(`
      *,
      vehicle:vehicles(id, name, slug, internal_code),
      customer:customers(id, name, email, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all bookings:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Obtener estadísticas del dashboard
 */
export async function getDashboardStats() {
  const supabaseServer = await createClient();
  
  // Obtener estadísticas de vehículos
  const { data: vehiclesData } = await supabaseServer
    .from('vehicles')
    .select('id, status, is_for_rent');
  
  // Obtener estadísticas de reservas
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  
  const { data: bookingsData } = await supabaseServer
    .from('bookings')
    .select('id, status, total_price, pickup_date, created_at');
  
  // Calcular estadísticas
  const totalVehicles = vehiclesData?.length || 0;
  const availableVehicles = vehiclesData?.filter(v => v.status === 'available').length || 0;
  
  const todayBookings = bookingsData?.filter(b => 
    b.pickup_date === today
  ).length || 0;
  
  const monthRevenue = bookingsData?.filter(b => 
    b.created_at >= firstDayOfMonth && (b.status === 'confirmed' || b.status === 'completed')
  ).reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
  
  const pendingBookings = bookingsData?.filter(b => b.status === 'pending').length || 0;
  const confirmedBookings = bookingsData?.filter(b => b.status === 'confirmed').length || 0;
  const inProgressBookings = bookingsData?.filter(b => b.status === 'in_progress').length || 0;
  
  return {
    todayBookings,
    monthRevenue,
    availableVehicles,
    totalVehicles,
    pendingBookings,
    confirmedBookings,
    inProgressBookings,
  };
}




