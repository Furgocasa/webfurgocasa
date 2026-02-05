import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateICalendar, bookingsToCalendarEvents, BookingEventData } from "./ics-generator";

/**
 * Función compartida para manejar peticiones de calendario
 * Usada por los endpoints /api/calendar/entregas y /api/calendar/entregas.ics
 */
export async function handleCalendarRequest(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Verificar token de autenticación
    const token = request.nextUrl.searchParams.get('token');
    // ✅ SEGURIDAD: Usar variable de entorno (ya configurada en Vercel)
    const validToken = process.env.CALENDAR_SUBSCRIPTION_TOKEN;
    
    if (!validToken) {
      console.error('[Calendar API] CALENDAR_SUBSCRIPTION_TOKEN no configurado');
      return new NextResponse('Error de configuración del servidor', { status: 500 });
    }
    
    if (!token || token !== validToken) {
      return new NextResponse('Unauthorized - Token inválido', { status: 401 });
    }
    
    // 2. Obtener reservas activas de los próximos 6 meses
    const supabase = createAdminClient();
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 7); // Incluir semana pasada por si hay retrasos
    
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 6); // Próximos 6 meses
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        pickup_date,
        pickup_time,
        dropoff_date,
        dropoff_time,
        status,
        customer_id,
        vehicle_id,
        pickup_location_id,
        dropoff_location_id
      `)
      .gte('dropoff_date', startDateStr)
      .lte('pickup_date', endDateStr)
      .neq('status', 'cancelled')
      .order('pickup_date', { ascending: true });
    
    if (error) {
      console.error('[Calendar API] Error fetching bookings:', error);
      return new NextResponse('Error al obtener reservas', { status: 500 });
    }
    
    if (!bookings || bookings.length === 0) {
      // Generar calendario vacío si no hay reservas
      const emptyCalendar = generateICalendar([]);
      return new NextResponse(emptyCalendar, {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'inline; filename="furgocasa-entregas.ics"',
          'Cache-Control': 'no-cache, must-revalidate',
        },
      });
    }
    
    // 3. Enriquecer bookings con datos relacionados
    const customerIds = [...new Set(bookings.map(b => b.customer_id).filter(Boolean))];
    const vehicleIds = [...new Set(bookings.map(b => b.vehicle_id).filter(Boolean))];
    const locationIds = [...new Set([
      ...bookings.map(b => b.pickup_location_id),
      ...bookings.map(b => b.dropoff_location_id)
    ].filter(Boolean))];
    
    // Cargar datos relacionados en paralelo
    const [customersResult, vehiclesResult, locationsResult] = await Promise.all([
      supabase.from('customers').select('id, name, phone').in('id', customerIds),
      supabase.from('vehicles').select('id, name, internal_code').in('id', vehicleIds),
      supabase.from('locations').select('id, name, address').in('id', locationIds),
    ]);
    
    // Crear mapas para acceso rápido
    const customersMap = new Map(customersResult.data?.map(c => [c.id, c]) || []);
    const vehiclesMap = new Map(vehiclesResult.data?.map(v => [v.id, v]) || []);
    const locationsMap = new Map(locationsResult.data?.map(l => [l.id, l]) || []);
    
    // 4. Mapear a formato BookingEventData
    const enrichedBookings: BookingEventData[] = bookings.map(booking => ({
      id: booking.id,
      booking_number: booking.booking_number,
      pickup_date: booking.pickup_date,
      pickup_time: booking.pickup_time,
      dropoff_date: booking.dropoff_date,
      dropoff_time: booking.dropoff_time,
      status: booking.status || 'pending',
      customer: booking.customer_id ? (customersMap.get(booking.customer_id) || null) : null,
      vehicle: vehiclesMap.get(booking.vehicle_id) || null,
      pickup_location: locationsMap.get(booking.pickup_location_id) || null,
      dropoff_location: locationsMap.get(booking.dropoff_location_id) || null,
    }));
    
    // 5. Convertir a eventos de calendario
    const events = bookingsToCalendarEvents(enrichedBookings);
    
    // 6. Generar archivo .ics
    const icsContent = generateICalendar(events);
    
    // 7. Devolver con headers correctos para suscripción de calendario
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="furgocasa-entregas.ics"',
        'Cache-Control': 'no-cache, must-revalidate',
        'X-Robots-Tag': 'noindex, nofollow', // No indexar en buscadores
      },
    });
    
  } catch (error) {
    console.error('[Calendar API] Error:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
