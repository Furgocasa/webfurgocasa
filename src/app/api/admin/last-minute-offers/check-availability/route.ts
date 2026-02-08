import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role para bypass de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface OfferAvailability {
  offer_id: string;
  vehicle_id: string;
  vehicle_name: string;
  vehicle_internal_code: string;
  offer_start_date: string;
  offer_end_date: string;
  offer_days: number;
  discount_percentage: number;
  status: string;
  is_available: boolean;
  conflicting_bookings: Array<{
    booking_id: string;
    pickup_date: string;
    dropoff_date: string;
    customer_name: string;
  }>;
  reason?: string;
}

// GET - Consultar disponibilidad de ofertas publicadas
export async function GET() {
  try {
    // 1. Obtener todas las ofertas publicadas
    const { data: offers, error: offersError } = await supabase
      .from('last_minute_offers')
      .select(`
        id,
        vehicle_id,
        offer_start_date,
        offer_end_date,
        offer_days,
        discount_percentage,
        status,
        vehicle:vehicles(name, internal_code, slug)
      `)
      .eq('status', 'published')
      .order('offer_start_date');

    if (offersError) {
      console.error('Error fetching offers:', offersError);
      return NextResponse.json({ 
        results: [],
        error: offersError.message 
      }, { status: 500 });
    }

    if (!offers || offers.length === 0) {
      return NextResponse.json({ 
        results: [],
        message: 'No hay ofertas publicadas para consultar'
      });
    }

    // 2. Para cada oferta, verificar si hay reservas que ocupen esas fechas
    const results: OfferAvailability[] = await Promise.all(
      offers.map(async (offer) => {
        // Consultar reservas confirmadas que se solapen con las fechas de la oferta
        // Una reserva se solapa si: pickup <= offer_end AND dropoff >= offer_start
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            pickup_date,
            dropoff_date,
            customer:customers(name)
          `)
          .eq('vehicle_id', offer.vehicle_id)
          .in('status', ['confirmed', 'active', 'completed'])
          .lte('pickup_date', offer.offer_end_date)
          .gte('dropoff_date', offer.offer_start_date);

        if (bookingsError) {
          console.error('Error checking bookings for offer', offer.id, ':', bookingsError);
        }

        const conflictingBookings = (bookings || []).map(b => ({
          booking_id: b.id,
          pickup_date: b.pickup_date,
          dropoff_date: b.dropoff_date,
          customer_name: b.customer?.name || 'Cliente desconocido'
        }));

        const isAvailable = conflictingBookings.length === 0;

        // También verificar fechas bloqueadas
        const { data: blockedDates } = await supabase
          .from('blocked_dates')
          .select('start_date, end_date, reason')
          .eq('vehicle_id', offer.vehicle_id)
          .lte('start_date', offer.offer_end_date)
          .gte('end_date', offer.offer_start_date);

        let reason: string | undefined;
        if (!isAvailable) {
          reason = `Fechas ocupadas por ${conflictingBookings.length} reserva(s)`;
        } else if (blockedDates && blockedDates.length > 0) {
          reason = `Fechas bloqueadas: ${blockedDates[0].reason || 'Sin motivo'}`;
        }

        return {
          offer_id: offer.id,
          vehicle_id: offer.vehicle_id,
          vehicle_name: offer.vehicle?.name || 'Vehículo desconocido',
          vehicle_internal_code: offer.vehicle?.internal_code || '-',
          offer_start_date: offer.offer_start_date,
          offer_end_date: offer.offer_end_date,
          offer_days: offer.offer_days,
          discount_percentage: offer.discount_percentage,
          status: offer.status,
          is_available: isAvailable && (!blockedDates || blockedDates.length === 0),
          conflicting_bookings: conflictingBookings,
          reason
        };
      })
    );

    // Separar disponibles y no disponibles
    const available = results.filter(r => r.is_available);
    const unavailable = results.filter(r => !r.is_available);

    return NextResponse.json({ 
      results,
      summary: {
        total: results.length,
        available: available.length,
        unavailable: unavailable.length
      }
    });
  } catch (error) {
    console.error('Error in check availability:', error);
    return NextResponse.json({ 
      results: [],
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
