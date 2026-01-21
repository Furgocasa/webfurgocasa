/**
 * Endpoint para mantener Vercel y Supabase "calientes"
 * Ejecutado cada 5 minutos por Vercel Cron
 * Evita cold starts en el panel de administrador
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Crear conexión a Supabase (esto "despierta" la BD)
    const supabase = await createClient();
    
    // Hacer una consulta simple para mantener la conexión activa
    const { count, error } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('[Keepalive] Error:', error);
      return NextResponse.json(
        { 
          status: 'error', 
          message: error.message,
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }
    
    const duration = Date.now() - startTime;
    
    console.log(`[Keepalive] OK - ${duration}ms - ${count} vehículos`);
    
    return NextResponse.json({
      status: 'ok',
      duration: `${duration}ms`,
      vehicleCount: count,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error: any) {
    console.error('[Keepalive] Exception:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
