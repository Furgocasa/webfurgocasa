import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role para bypass de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener la oferta con datos del vehículo y ubicaciones
    const { data: offer, error } = await supabase
      .from('last_minute_offers')
      .select(`
        *,
        vehicle:vehicles(
          id, name, slug, brand, model, seats, beds, 
          base_price_per_day, internal_code,
          images:vehicle_images(image_url, is_primary, sort_order)
        ),
        pickup_location:locations!last_minute_offers_pickup_location_id_fkey(
          id, name, address, extra_fee
        ),
        dropoff_location:locations!last_minute_offers_dropoff_location_id_fkey(
          id, name, address, extra_fee
        )
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error || !offer) {
      return NextResponse.json({ 
        error: 'Oferta no encontrada o no disponible' 
      }, { status: 404 });
    }

    // Verificar que la oferta no ha expirado
    const today = new Date().toISOString().split('T')[0];
    if (offer.offer_start_date < today) {
      return NextResponse.json({ 
        error: 'Esta oferta ha expirado' 
      }, { status: 410 });
    }

    return NextResponse.json({ offer });
  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
