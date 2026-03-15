import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/last-minute-offers/revert-by-booking
 * 
 * Revierte ofertas vinculadas a una reserva cuando esta se cancela o elimina.
 * Pone la oferta de vuelta a "published" para que vuelva a estar disponible.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId requerido' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: reverted, error } = await supabase
      .from('last_minute_offers')
      .update({
        status: 'published',
        booking_id: null,
        reserved_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('booking_id', bookingId)
      .or('status.eq.reserved,status.eq.reserved_pending_payment')
      .select('id, offer_start_date, offer_end_date');

    if (error) {
      console.error('Error revirtiendo ofertas:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reverted: reverted?.length || 0,
      offers: reverted || [],
    });
  } catch (error) {
    console.error('Error in revert-by-booking:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
