import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usar service role para bypass de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obtener todas las ofertas
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('last_minute_offers')
      .select(`
        *,
        vehicle:vehicles(name, internal_code, slug)
      `)
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
      return NextResponse.json({ 
        offers: [],
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ offers: data || [] });
  } catch (error) {
    console.error('Error in GET offers:', error);
    return NextResponse.json({ 
      offers: [],
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// POST - Crear/publicar una oferta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('last_minute_offers')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Error creating offer:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ offer: data });
  } catch (error) {
    console.error('Error in POST offer:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// PATCH - Actualizar estado de oferta
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('last_minute_offers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating offer:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ offer: data });
  } catch (error) {
    console.error('Error in PATCH offer:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// DELETE - Eliminar oferta
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const { error } = await supabase
      .from('last_minute_offers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting offer:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE offer:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
