/**
 * Script para verificar si una búsqueda específica se registró
 * 
 * Uso: node scripts/verificar-busqueda-especifica.js "2026-04-23" "2026-04-30" "murcia"
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parámetros de búsqueda a verificar (puedes cambiarlos)
const pickupDate = process.argv[2] || '2026-04-23';
const dropoffDate = process.argv[3] || '2026-04-30';
const pickupLocation = process.argv[4] || 'murcia';

async function verificarBusqueda() {
  console.log('\n🔍 VERIFICANDO BÚSQUEDA ESPECÍFICA\n');
  console.log('='.repeat(60));
  console.log(`Pickup Date: ${pickupDate}`);
  console.log(`Dropoff Date: ${dropoffDate}`);
  console.log(`Location: ${pickupLocation}`);
  console.log('='.repeat(60));

  try {
    // Buscar búsquedas que coincidan con estos parámetros (últimas 24 horas)
    const hace24h = new Date();
    hace24h.setHours(hace24h.getHours() - 24);

    const { data: busquedas, error } = await supabase
      .from('search_queries')
      .select('*')
      .eq('pickup_date', pickupDate)
      .eq('dropoff_date', dropoffDate)
      .ilike('pickup_location', `%${pickupLocation}%`)
      .gte('searched_at', hace24h.toISOString())
      .order('searched_at', { ascending: false });

    if (error) {
      console.error('❌ Error buscando:', error);
      return;
    }

    if (!busquedas || busquedas.length === 0) {
      console.log('\n⚠️  NO se encontraron búsquedas con estos parámetros en las últimas 24 horas');
      console.log('\n📋 Últimas 5 búsquedas registradas (para referencia):');
      
      const { data: ultimas } = await supabase
        .from('search_queries')
        .select('*')
        .order('searched_at', { ascending: false })
        .limit(5);

      if (ultimas && ultimas.length > 0) {
        ultimas.forEach((b, i) => {
          const fecha = new Date(b.searched_at);
          console.log(`\n${i + 1}. ${fecha.toLocaleString('es-ES')}`);
          console.log(`   Pickup: ${b.pickup_date} → Dropoff: ${b.dropoff_date}`);
          console.log(`   Location: ${b.pickup_location}`);
          console.log(`   Session: ${b.session_id?.substring(0, 20)}...`);
        });
      }
    } else {
      console.log(`\n✅ Se encontraron ${busquedas.length} búsqueda(s) con estos parámetros:`);
      
      busquedas.forEach((b, i) => {
        const fecha = new Date(b.searched_at);
        const ahora = new Date();
        const minutosAtras = Math.floor((ahora - fecha) / (1000 * 60));
        
        console.log(`\n${i + 1}. Registrada hace ${minutosAtras} minutos`);
        console.log(`   Fecha: ${fecha.toLocaleString('es-ES')}`);
        console.log(`   ID: ${b.id}`);
        console.log(`   Session ID: ${b.session_id?.substring(0, 30)}...`);
        console.log(`   Vehículos disponibles: ${b.vehicles_available_count}`);
        console.log(`   Funnel stage: ${b.funnel_stage}`);
      });
    }

    // Verificar también búsquedas recientes (última hora)
    console.log('\n📊 BÚSQUEDAS EN LA ÚLTIMA HORA:');
    const hace1h = new Date();
    hace1h.setHours(hace1h.getHours() - 1);

    const { data: recientes, error: errorRecientes } = await supabase
      .from('search_queries')
      .select('*')
      .gte('searched_at', hace1h.toISOString())
      .order('searched_at', { ascending: false });

    if (errorRecientes) {
      console.error('❌ Error:', errorRecientes);
    } else {
      console.log(`   Total: ${recientes?.length || 0} búsquedas`);
      if (recientes && recientes.length > 0) {
        recientes.forEach((b, i) => {
          const fecha = new Date(b.searched_at);
          const minutosAtras = Math.floor((new Date() - fecha) / (1000 * 60));
          console.log(`   ${i + 1}. Hace ${minutosAtras} min - ${b.pickup_date} → ${b.dropoff_date} (${b.pickup_location})`);
        });
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Verificación completada\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  }
}

verificarBusqueda();
