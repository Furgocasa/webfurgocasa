import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role para poder llamar a funciones SECURITY DEFINER
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Llamar a la función que obtiene ofertas activas
    const { data, error } = await supabase.rpc('get_active_last_minute_offers');

    if (error) {
      console.error('Error fetching last minute offers:', error);
      return NextResponse.json({ 
        offers: [],
        error: 'Error al obtener ofertas' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      offers: data || [],
      count: (data || []).length
    });
  } catch (error) {
    console.error('Error in last minute offers API:', error);
    return NextResponse.json({ 
      offers: [],
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
