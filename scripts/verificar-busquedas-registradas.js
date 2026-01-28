/**
 * Script para verificar si las búsquedas se están registrando correctamente
 * en la tabla search_queries de Supabase
 * 
 * Uso: node scripts/verificar-busquedas-registradas.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarBusquedas() {
  console.log('\n🔍 VERIFICACIÓN DE BÚSQUEDAS REGISTRADAS\n');
  console.log('=' .repeat(60));

  try {
    // 1. Total de búsquedas registradas
    const { count: totalCount, error: countError } = await supabase
      .from('search_queries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error obteniendo total:', countError);
      return;
    }

    console.log(`\n📊 TOTAL DE BÚSQUEDAS REGISTRADAS: ${totalCount || 0}`);

    // 2. Búsquedas de las últimas 24 horas
    const hace24h = new Date();
    hace24h.setHours(hace24h.getHours() - 24);

    const { count: count24h, error: error24h } = await supabase
      .from('search_queries')
      .select('*', { count: 'exact', head: true })
      .gte('searched_at', hace24h.toISOString());

    if (error24h) {
      console.error('❌ Error obteniendo búsquedas 24h:', error24h);
    } else {
      console.log(`📅 Últimas 24 horas: ${count24h || 0} búsquedas`);
    }

    // 3. Búsquedas de las últimas 7 días
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);

    const { count: count7d, error: error7d } = await supabase
      .from('search_queries')
      .select('*', { count: 'exact', head: true })
      .gte('searched_at', hace7dias.toISOString());

    if (error7d) {
      console.error('❌ Error obteniendo búsquedas 7 días:', error7d);
    } else {
      console.log(`📅 Últimos 7 días: ${count7d || 0} búsquedas`);
    }

    // 4. Últimas 10 búsquedas con detalles
    console.log('\n📋 ÚLTIMAS 10 BÚSQUEDAS REGISTRADAS:');
    console.log('-'.repeat(60));

    const { data: ultimasBusquedas, error: errorUltimas } = await supabase
      .from('search_queries')
      .select('*')
      .order('searched_at', { ascending: false })
      .limit(10);

    if (errorUltimas) {
      console.error('❌ Error obteniendo últimas búsquedas:', errorUltimas);
    } else if (!ultimasBusquedas || ultimasBusquedas.length === 0) {
      console.log('⚠️  No se encontraron búsquedas registradas');
    } else {
      ultimasBusquedas.forEach((busqueda, index) => {
        console.log(`\n${index + 1}. Búsqueda ID: ${busqueda.id}`);
        console.log(`   Fecha: ${new Date(busqueda.searched_at).toLocaleString('es-ES')}`);
        console.log(`   Pickup: ${busqueda.pickup_date} ${busqueda.pickup_time || 'N/A'}`);
        console.log(`   Dropoff: ${busqueda.dropoff_date} ${busqueda.dropoff_time || 'N/A'}`);
        console.log(`   Ubicación: ${busqueda.pickup_location || 'N/A'} → ${busqueda.dropoff_location || 'N/A'}`);
        console.log(`   Vehículos disponibles: ${busqueda.vehicles_available_count || 0}`);
        console.log(`   Precio promedio: €${busqueda.avg_price_shown || 'N/A'}`);
        console.log(`   Locale: ${busqueda.locale || 'N/A'}`);
        console.log(`   Dispositivo: ${busqueda.user_agent_type || 'N/A'}`);
        console.log(`   Funnel stage: ${busqueda.funnel_stage || 'N/A'}`);
        console.log(`   Session ID: ${busqueda.session_id?.substring(0, 20)}...`);
      });
    }

    // 5. Estadísticas por funnel_stage
    console.log('\n📈 ESTADÍSTICAS POR FASE DEL FUNNEL:');
    console.log('-'.repeat(60));

    const { data: statsFunnel, error: errorFunnel } = await supabase
      .from('search_queries')
      .select('funnel_stage')
      .gte('searched_at', hace7dias.toISOString());

    if (errorFunnel) {
      console.error('❌ Error obteniendo estadísticas:', errorFunnel);
    } else if (statsFunnel) {
      const stats = {
        search_only: statsFunnel.filter(s => s.funnel_stage === 'search_only').length,
        vehicle_selected: statsFunnel.filter(s => s.funnel_stage === 'vehicle_selected').length,
        booking_created: statsFunnel.filter(s => s.funnel_stage === 'booking_created').length,
      };

      console.log(`   Solo búsqueda: ${stats.search_only}`);
      console.log(`   Vehículo seleccionado: ${stats.vehicle_selected}`);
      console.log(`   Reserva creada: ${stats.booking_created}`);
    }

    // 6. Verificar búsquedas específicas de Murcia (como en el ejemplo)
    console.log('\n🔎 BÚSQUEDAS ESPECÍFICAS (Murcia, últimas 7 días):');
    console.log('-'.repeat(60));

    const { data: busquedasMurcia, error: errorMurcia } = await supabase
      .from('search_queries')
      .select('*')
      .ilike('pickup_location', '%murcia%')
      .gte('searched_at', hace7dias.toISOString())
      .order('searched_at', { ascending: false })
      .limit(5);

    if (errorMurcia) {
      console.error('❌ Error obteniendo búsquedas de Murcia:', errorMurcia);
    } else if (!busquedasMurcia || busquedasMurcia.length === 0) {
      console.log('⚠️  No se encontraron búsquedas de Murcia en los últimos 7 días');
    } else {
      busquedasMurcia.forEach((busqueda, index) => {
        console.log(`\n${index + 1}. ${new Date(busqueda.searched_at).toLocaleString('es-ES')}`);
        console.log(`   ${busqueda.pickup_date} → ${busqueda.dropoff_date}`);
        console.log(`   Vehículos: ${busqueda.vehicles_available_count}`);
      });
    }

    // 7. Verificar errores comunes
    console.log('\n🔍 VERIFICACIÓN DE PROBLEMAS COMUNES:');
    console.log('-'.repeat(60));

    // Búsquedas sin session_id
    const { count: sinSessionId } = await supabase
      .from('search_queries')
      .select('*', { count: 'exact', head: true })
      .is('session_id', null);

    if (sinSessionId > 0) {
      console.log(`⚠️  Búsquedas sin session_id: ${sinSessionId}`);
    } else {
      console.log(`✅ Todas las búsquedas tienen session_id`);
    }

    // Búsquedas sin locale
    const { count: sinLocale } = await supabase
      .from('search_queries')
      .select('*', { count: 'exact', head: true })
      .is('locale', null)
      .gte('searched_at', hace7dias.toISOString());

    if (sinLocale > 0) {
      console.log(`⚠️  Búsquedas sin locale (últimos 7 días): ${sinLocale}`);
    } else {
      console.log(`✅ Todas las búsquedas recientes tienen locale`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Verificación completada\n');

  } catch (error) {
    console.error('\n❌ ERROR GENERAL:', error);
    if (error.message) {
      console.error('   Mensaje:', error.message);
    }
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
  }
}

verificarBusquedas();
