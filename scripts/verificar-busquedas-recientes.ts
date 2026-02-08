import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verificarBusquedasRecientes() {
  console.log('🔍 Verificando búsquedas recientes en search_queries...\n');

  // 1. Contar total de búsquedas
  const { count: totalCount, error: countError } = await supabase
    .from('search_queries')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error contando búsquedas:', countError);
    return;
  }

  console.log(`📊 Total de búsquedas en la tabla: ${totalCount}\n`);

  // 2. Obtener las últimas 20 búsquedas
  const { data: latestSearches, error: latestError } = await supabase
    .from('search_queries')
    .select('id, searched_at, pickup_date, dropoff_date, had_availability, vehicle_selected, booking_created, locale, pickup_location_id')
    .order('searched_at', { ascending: false })
    .limit(20);

  if (latestError) {
    console.error('❌ Error obteniendo últimas búsquedas:', latestError);
    return;
  }

  console.log('📅 Últimas 20 búsquedas registradas:');
  console.log('─'.repeat(120));
  console.log('ID'.padEnd(40) + 'Fecha búsqueda'.padEnd(25) + 'Pickup'.padEnd(15) + 'Disp.'.padEnd(8) + 'Idioma');
  console.log('─'.repeat(120));
  
  latestSearches?.forEach(search => {
    const searchedAt = new Date(search.searched_at).toLocaleString('es-ES');
    const pickupDate = search.pickup_date || 'N/A';
    const availability = search.had_availability ? '✅' : '❌';
    const locale = search.locale || 'N/A';
    
    console.log(
      search.id.substring(0, 38).padEnd(40) +
      searchedAt.padEnd(25) +
      pickupDate.padEnd(15) +
      availability.padEnd(8) +
      locale
    );
  });

  console.log('─'.repeat(120));

  // 3. Contar búsquedas por fecha de los últimos 10 días
  const last10Days = new Date();
  last10Days.setDate(last10Days.getDate() - 10);
  const last10DaysStr = last10Days.toISOString().split('T')[0];

  const { data: recentSearches, error: recentError } = await supabase
    .from('search_queries')
    .select('searched_at')
    .gte('searched_at', last10DaysStr);

  if (recentError) {
    console.error('❌ Error obteniendo búsquedas recientes:', recentError);
    return;
  }

  // Agrupar por día
  const searchesByDay: Record<string, number> = {};
  recentSearches?.forEach(search => {
    const day = search.searched_at.split('T')[0];
    searchesByDay[day] = (searchesByDay[day] || 0) + 1;
  });

  console.log('\n\n📈 Búsquedas por día (últimos 10 días):');
  console.log('─'.repeat(50));
  Object.keys(searchesByDay)
    .sort()
    .reverse()
    .forEach(day => {
      const count = searchesByDay[day];
      const bar = '█'.repeat(Math.min(count, 50));
      console.log(`${day}: ${count.toString().padStart(4)} ${bar}`);
    });
  console.log('─'.repeat(50));

  // 4. Verificar si hay límite de 1000 registros
  console.log('\n\n🔎 Verificando posible límite de registros...');
  
  const { data: oldestSearch } = await supabase
    .from('search_queries')
    .select('searched_at')
    .order('searched_at', { ascending: true })
    .limit(1)
    .single();

  const { data: newestSearch } = await supabase
    .from('search_queries')
    .select('searched_at')
    .order('searched_at', { ascending: false })
    .limit(1)
    .single();

  if (oldestSearch && newestSearch) {
    const oldest = new Date(oldestSearch.searched_at).toLocaleDateString('es-ES');
    const newest = new Date(newestSearch.searched_at).toLocaleDateString('es-ES');
    
    console.log(`📅 Búsqueda más antigua: ${oldest}`);
    console.log(`📅 Búsqueda más reciente: ${newest}`);
  }

  // 5. Verificar búsquedas desde el 6 de febrero
  const { count: countSince6Feb, error: since6FebError } = await supabase
    .from('search_queries')
    .select('*', { count: 'exact', head: true })
    .gte('searched_at', '2026-02-06');

  if (since6FebError) {
    console.error('❌ Error contando búsquedas desde el 6 de febrero:', since6FebError);
  } else {
    console.log(`\n📊 Búsquedas desde el 6 de febrero de 2026: ${countSince6Feb}`);
  }

  // 6. Verificar búsquedas del día 7 y 8 de febrero específicamente
  const { count: count7Feb } = await supabase
    .from('search_queries')
    .select('*', { count: 'exact', head: true })
    .gte('searched_at', '2026-02-07')
    .lte('searched_at', '2026-02-07 23:59:59');

  const { count: count8Feb } = await supabase
    .from('search_queries')
    .select('*', { count: 'exact', head: true })
    .gte('searched_at', '2026-02-08')
    .lte('searched_at', '2026-02-08 23:59:59');

  console.log(`📊 Búsquedas el 7 de febrero: ${count7Feb || 0}`);
  console.log(`📊 Búsquedas el 8 de febrero (hoy): ${count8Feb || 0}`);

  console.log('\n✅ Verificación completada');
}

verificarBusquedasRecientes().catch(console.error);
