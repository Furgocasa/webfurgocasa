/**
 * Queries reutilizables de Supabase
 * Funciones helper para consultas comunes
 * 
 * IMPORTANTE: Para datos públicos (vehículos, categorías, etc.) usar el cliente
 * público `supabase` definido abajo. NO usar createClient() de ./server ya que
 * usa cookies y falla en generateMetadata de Next.js 15.
 * 
 * @updated 2026-01-23 - Fix error 500 en páginas de vehículos
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from './server';

// Cliente público para queries de datos públicos (sin cookies)
// Funciona tanto en servidor como en cliente
// ⚠️ CRÍTICO: Usar este cliente para vehículos, categorías, etc.
const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
 * Usa el cliente público (anon) ya que los vehículos son datos públicos
 */
export async function getVehicleBySlug(slug: string) {
  const { data, error } = await supabase
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
 * Obtener estadísticas avanzadas del dashboard
 */
export async function getDashboardStats() {
  const supabaseServer = await createClient();
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0).toISOString();
  
  // 1. VEHÍCULOS
  const { data: vehiclesData } = await supabaseServer
    .from('vehicles')
    .select('id, name, status, is_for_rent, base_price_per_day, next_itv_date');
  
  // 2. RESERVAS — query simple sin joins de locations (más robusta)
  const { data: bookingsData, error: bookingsError } = await supabaseServer
    .from('bookings')
    .select(`
      id, booking_number, status, payment_status,
      total_price, amount_paid, pickup_date, dropoff_date,
      pickup_time, dropoff_time, pickup_location_id, dropoff_location_id,
      days, notes, admin_notes, created_at, vehicle_id,
      customer_id, customer_name,
      vehicle:vehicles(name, internal_code),
      customer:customers(name, total_bookings, phone, driver_license_expiry),
      booking_extras(quantity, extra:extras(name))
    `);
  if (bookingsError) {
    console.error('[Dashboard] Bookings query failed:', bookingsError.message);
  }

  // 2b. LOCATIONS — mapa id→nombre para resolver ubicaciones
  const { data: locationsData } = await supabaseServer
    .from('locations')
    .select('id, name, city');
  const locMap = new Map((locationsData || []).map(l => [l.id, l]));
  
  // 3. PAGOS
  const { data: paymentsData } = await supabaseServer
    .from('payments')
    .select('id, amount, status, created_at, booking_id');
  
  // 4. DAÑOS PENDIENTES (con detalle de vehículo)
  const { data: damagesData } = await supabaseServer
    .from('vehicle_damages')
    .select('id, vehicle_id, severity, repair_cost, status, description, vehicle:vehicles(name, internal_code)')
    .neq('status', 'repaired');

  // 5. BLOQUEOS ACTIVOS
  const { data: blockedDatesData } = await supabaseServer
    .from('blocked_dates')
    .select('id, vehicle_id, start_date, end_date, reason, vehicle:vehicles(name, internal_code)')
    .gte('end_date', todayStr)
    .lte('start_date', todayStr);
  
  // ===== CÁLCULOS =====
  
  // Vehículos disponibles (considerando reservas activas HOY)
  // IMPORTANTE: Usar EXACTAMENTE la misma lógica que el calendario
  // El calendario solo filtra por: status !== 'cancelled' y rango de fechas
  // NO considera payment_status para determinar disponibilidad
  const activeBookings = bookingsData?.filter(b => 
    b.status !== 'cancelled' && 
    b.pickup_date <= todayStr &&
    b.dropoff_date >= todayStr
  ) || [];
  
  const occupiedVehicleIds = new Set(activeBookings.map(b => b.vehicle_id));
  const totalVehicles = vehiclesData?.length || 0;
  const availableVehicles = totalVehicles - occupiedVehicleIds.size;
  const vehiclesInMaintenance = vehiclesData?.filter(v => v.status === 'maintenance').length || 0;
  
  // Tasa de ocupación (últimos 30 días)
  const last30DaysBookings = bookingsData?.filter(b => 
    b.pickup_date >= thirtyDaysAgo && 
    b.status !== 'cancelled'
  ) || [];
  
  const totalDaysAvailable = totalVehicles * 30;
  const totalDaysRented = last30DaysBookings.reduce((sum, b) => {
    const start = new Date(b.pickup_date);
    const end = new Date(b.dropoff_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return sum + days;
  }, 0);
  const occupancyRate = totalDaysAvailable > 0 ? (totalDaysRented / totalDaysAvailable) * 100 : 0;
  
  // Reservas por estado
  const todayBookings = bookingsData?.filter(b => b.pickup_date === todayStr).length || 0;
  const pendingBookings = bookingsData?.filter(b => b.status === 'pending').length || 0;
  const confirmedBookings = bookingsData?.filter(b => b.status === 'confirmed').length || 0;
  const inProgressBookings = bookingsData?.filter(b => b.status === 'in_progress').length || 0;
  const completedBookings = bookingsData?.filter(b => b.status === 'completed').length || 0;
  
  // Ingresos
  const monthRevenue = bookingsData?.filter(b => 
    b.created_at >= firstDayOfMonth && 
    (b.status === 'confirmed' || b.status === 'completed' || b.status === 'in_progress')
  ).reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
  
  const lastMonthRevenue = bookingsData?.filter(b => 
    b.created_at >= lastMonth && 
    b.created_at <= lastMonthEnd &&
    (b.status === 'confirmed' || b.status === 'completed' || b.status === 'in_progress')
  ).reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
  
  const totalRevenue = bookingsData?.filter(b => 
    b.status === 'confirmed' || b.status === 'completed' || b.status === 'in_progress'
  ).reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
  
  const pendingRevenue = bookingsData?.filter(b => 
    b.status !== 'cancelled' && 
    (b.payment_status === 'pending' || b.payment_status === 'partial')
  ).reduce((sum, b) => sum + ((b.total_price || 0) - (b.amount_paid || 0)), 0) || 0;
  
  // Ingreso promedio por reserva
  const confirmedAndCompleted = bookingsData?.filter(b => 
    b.status === 'confirmed' || b.status === 'completed' || b.status === 'in_progress'
  ) || [];
  const averageBookingValue = confirmedAndCompleted.length > 0 
    ? totalRevenue / confirmedAndCompleted.length 
    : 0;
  
  // Vehículo más rentable (últimos 30 días)
  const vehicleRevenue = new Map<string, { name: string; revenue: number; bookings: number }>();
  last30DaysBookings.forEach(b => {
    if (b.status !== 'cancelled') {
      const vehicleName = b.vehicle?.name || 'Desconocido';
      const current = vehicleRevenue.get(b.vehicle_id) || { name: vehicleName, revenue: 0, bookings: 0 };
      vehicleRevenue.set(b.vehicle_id, {
        name: vehicleName,
        revenue: current.revenue + (b.total_price || 0),
        bookings: current.bookings + 1
      });
    }
  });
  
  const topVehicle = Array.from(vehicleRevenue.values())
    .sort((a, b) => b.revenue - a.revenue)[0] || null;
  
  // Cliente más frecuente
  const customerBookings = new Map<string, { name: string; bookings: number; spent: number }>();
  bookingsData?.forEach(b => {
    if (b.customer_id && b.status !== 'cancelled') {
      const customerName = b.customer?.name || b.customer_name || 'Desconocido';
      const current = customerBookings.get(b.customer_id) || { name: customerName, bookings: 0, spent: 0 };
      customerBookings.set(b.customer_id, {
        name: customerName,
        bookings: current.bookings + 1,
        spent: current.spent + (b.total_price || 0)
      });
    }
  });
  
  const topCustomer = Array.from(customerBookings.values())
    .sort((a, b) => b.bookings - a.bookings)[0] || null;
  
  // Alertas
  const itvAlerts = vehiclesData?.filter(v => {
    if (!v.next_itv_date) return false;
    const itvDate = new Date(v.next_itv_date);
    const daysUntilItv = Math.ceil((itvDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilItv <= 30 && daysUntilItv >= 0;
  }).length || 0;
  
  const pendingPayments = bookingsData?.filter(b => 
    b.status !== 'cancelled' && 
    b.payment_status === 'pending'
  ).length || 0;
  
  const unrepairedDamages = damagesData?.length || 0;
  
  // Gráfico de ingresos últimos 30 días (agrupado por día)
  const revenueByDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    revenueByDay.set(dateStr, 0);
  }
  
  bookingsData?.forEach(b => {
    const bookingDate = b.created_at.split('T')[0];
    if (revenueByDay.has(bookingDate) && (b.status === 'confirmed' || b.status === 'completed' || b.status === 'in_progress')) {
      revenueByDay.set(bookingDate, (revenueByDay.get(bookingDate) || 0) + (b.total_price || 0));
    }
  });
  
  const revenueChart = Array.from(revenueByDay.entries()).map(([date, revenue]) => ({
    date,
    revenue
  }));
  
  // Próximas entregas y recogidas (hoy y mañana) - para compatibilidad
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const upcomingActions = bookingsData?.filter(b => 
    (b.pickup_date === todayStr || b.pickup_date === tomorrow || 
     b.dropoff_date === todayStr || b.dropoff_date === tomorrow) &&
    b.status !== 'cancelled'
  ).map(b => ({
    id: b.id,
    type: b.pickup_date === todayStr || b.pickup_date === tomorrow ? 'pickup' : 'dropoff',
    date: b.pickup_date === todayStr || b.pickup_date === tomorrow ? b.pickup_date : b.dropoff_date,
    time: b.pickup_date === todayStr || b.pickup_date === tomorrow ? b.pickup_time : b.dropoff_time,
    customer: b.customer_name,
    vehicle: b.vehicle?.name || 'Vehículo',
    bookingId: b.id
  })) || [];

  // ===== DATOS PARA DASHBOARD DE OPERACIONES =====
  const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  type BookingVeh = { name?: string; internal_code?: string } | null;
  type BookingExtra = { quantity: number; extra: { name: string } | null } | null;
  type BookingCustomer = { name?: string; total_bookings?: number; phone?: string; driver_license_expiry?: string } | null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapBookingOps = (b: any) => ({
    id: b.id,
    bookingNumber: b.booking_number || '',
    status: b.status,
    paymentStatus: b.payment_status,
    pickupDate: b.pickup_date,
    pickupTime: b.pickup_time || '09:00',
    dropoffDate: b.dropoff_date,
    dropoffTime: b.dropoff_time || '09:00',
    days: b.days || 0,
    vehicle: (b.vehicle as BookingVeh)?.name || 'Vehículo',
    vehicleCode: (b.vehicle as BookingVeh)?.internal_code || '',
    customer: b.customer_name || 'Cliente',
    customerPhone: (b.customer as BookingCustomer)?.phone || '',
    pickupLocation: locMap.get(b.pickup_location_id)?.name || '',
    dropoffLocation: locMap.get(b.dropoff_location_id)?.name || '',
    extras: ((b.booking_extras || []) as BookingExtra[])
      .filter((e): e is NonNullable<BookingExtra> => !!e?.extra?.name)
      .map(e => `${e.extra!.name}${e.quantity > 1 ? ` x${e.quantity}` : ''}`),
    notes: b.notes || '',
    adminNotes: b.admin_notes || '',
    driverLicenseExpiry: (b.customer as BookingCustomer)?.driver_license_expiry || '',
  });

  const nonCancelledBookings = bookingsData?.filter(b => b.status !== 'cancelled') || [];

  const upcomingRentals = nonCancelledBookings
    .filter(b => b.pickup_date >= todayStr && b.pickup_date <= weekEnd)
    .sort((a, b) => a.pickup_date.localeCompare(b.pickup_date) || a.pickup_time.localeCompare(b.pickup_time))
    .map(mapBookingOps);

  type ActionWeek = ReturnType<typeof mapBookingOps> & { type: 'pickup' | 'dropoff'; date: string; time: string };
  const upcomingActionsWeek: ActionWeek[] = [];
  nonCancelledBookings.forEach(b => {
    const mapped = mapBookingOps(b);
    if (b.pickup_date >= todayStr && b.pickup_date <= weekEnd) {
      upcomingActionsWeek.push({ ...mapped, type: 'pickup', date: b.pickup_date, time: b.pickup_time || '09:00' });
    }
    if (b.dropoff_date >= todayStr && b.dropoff_date <= weekEnd) {
      upcomingActionsWeek.push({ ...mapped, type: 'dropoff', date: b.dropoff_date, time: b.dropoff_time || '09:00' });
    }
  });
  upcomingActionsWeek.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  // Alquileres en curso: pickup ya pasó y dropoff >= hoy
  const activeRentals = nonCancelledBookings
    .filter(b => b.pickup_date <= todayStr && b.dropoff_date >= todayStr && (b.status === 'confirmed' || b.status === 'in_progress'))
    .sort((a, b) => a.dropoff_date.localeCompare(b.dropoff_date))
    .map(b => {
      const mapped = mapBookingOps(b);
      const startMs = new Date(b.pickup_date + 'T00:00:00').getTime();
      const endMs = new Date(b.dropoff_date + 'T00:00:00').getTime();
      const todayMs = new Date(todayStr + 'T00:00:00').getTime();
      const totalDays = Math.max(1, Math.round((endMs - startMs) / 86400000) + 1);
      const currentDay = Math.min(totalDays, Math.round((todayMs - startMs) / 86400000) + 1);
      const daysRemaining = Math.max(0, Math.round((endMs - todayMs) / 86400000));
      return { ...mapped, currentDay, totalDays, daysRemaining };
    });

  const pendingReview = nonCancelledBookings
    .filter(b => b.status === 'in_progress' && b.dropoff_date < todayStr)
    .sort((a, b) => a.dropoff_date.localeCompare(b.dropoff_date))
    .map(b => {
      const mapped = mapBookingOps(b);
      const daysSinceReturn = Math.ceil((today.getTime() - new Date(b.dropoff_date).getTime()) / (1000 * 60 * 60 * 24));
      const vehicleDamages = damagesData?.filter(d => d.vehicle_id === b.vehicle_id).length || 0;
      return { ...mapped, daysSinceReturn, vehicleDamages };
    });

  // Estado de flota
  const blockedVehicleIds = new Set((blockedDatesData || []).map(bd => bd.vehicle_id));
  const fleetStatus = {
    available: (vehiclesData || []).filter(v => v.is_for_rent && v.status === 'available' && !occupiedVehicleIds.has(v.id) && !blockedVehicleIds.has(v.id)).length,
    rented: occupiedVehicleIds.size,
    maintenance: vehiclesInMaintenance,
    blocked: blockedVehicleIds.size,
  };
  const activeBlocks = (blockedDatesData || []).map(bd => ({
    vehicleName: (bd.vehicle as BookingVeh)?.name || 'Vehículo',
    vehicleCode: (bd.vehicle as BookingVeh)?.internal_code || '',
    reason: bd.reason || 'Sin motivo',
    endDate: bd.end_date,
  }));

  // Daños pendientes agrupados por vehículo
  type DamageRow = { id: string; vehicle_id: string; severity: string; repair_cost: number | null; status: string; description: string; vehicle: BookingVeh };
  const damagesByVehicle = new Map<string, { name: string; code: string; damages: { severity: string; status: string; description: string }[] }>();
  (damagesData as DamageRow[] || []).forEach(d => {
    const key = d.vehicle_id;
    if (!damagesByVehicle.has(key)) {
      damagesByVehicle.set(key, {
        name: d.vehicle?.name || 'Vehículo',
        code: d.vehicle?.internal_code || '',
        damages: [],
      });
    }
    damagesByVehicle.get(key)!.damages.push({ severity: d.severity, status: d.status, description: d.description });
  });
  const damagesByVehicleList = Array.from(damagesByVehicle.values()).sort((a, b) => b.damages.length - a.damages.length);

  // Carnets próximos a caducar (reservas confirmadas/in_progress con pickup futuro)
  const expiringLicenses = nonCancelledBookings
    .filter(b => {
      if (b.status !== 'confirmed' && b.status !== 'in_progress') return false;
      if (b.pickup_date < todayStr) return false;
      const expiry = (b.customer as BookingCustomer)?.driver_license_expiry;
      if (!expiry) return false;
      return expiry <= b.pickup_date;
    })
    .map(b => ({
      bookingNumber: b.booking_number || '',
      customer: b.customer_name || 'Cliente',
      customerPhone: (b.customer as BookingCustomer)?.phone || '',
      licenseExpiry: (b.customer as BookingCustomer)?.driver_license_expiry || '',
      pickupDate: b.pickup_date,
      vehicle: (b.vehicle as BookingVeh)?.name || 'Vehículo',
    }));
  
  return {
    // Básicas
    todayBookings,
    totalVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    
    // Reservas
    pendingBookings,
    confirmedBookings,
    inProgressBookings,
    completedBookings,
    
    // Financiero
    monthRevenue,
    lastMonthRevenue,
    totalRevenue,
    pendingRevenue,
    averageBookingValue,
    
    // Métricas avanzadas
    occupancyRate,
    topVehicle,
    topCustomer,
    
    // Alertas
    itvAlerts,
    pendingPayments,
    unrepairedDamages,
    
    // Datos para gráficos
    revenueChart,
    upcomingActions: upcomingActions.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    }).slice(0, 10),
    // Operaciones
    upcomingRentals,
    activeRentals,
    upcomingActionsWeek,
    pendingReview,
    fleetStatus,
    activeBlocks,
    damagesByVehicleList,
    expiringLicenses,
  };
}




