import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role para bypass de RLS y poder llamar funciones SECURITY DEFINER
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Detectar huecos entre reservas
export async function GET() {
  try {
    const { data, error } = await supabase.rpc('detect_booking_gaps');

    if (error) {
      console.error('Error detecting gaps:', error);
      
      // Si la función no existe
      if (error.code === '42883' || error.message?.includes('does not exist')) {
        return NextResponse.json({ 
          gaps: [],
          error: 'La función detect_booking_gaps no existe. Ejecuta el SQL 08 en Supabase.',
          needsSetup: true
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        gaps: [],
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ gaps: data || [] });
  } catch (error) {
    console.error('Error in detect gaps:', error);
    return NextResponse.json({ 
      gaps: [],
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
