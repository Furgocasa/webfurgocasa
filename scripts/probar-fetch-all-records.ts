import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función helper para obtener todos los registros con paginación
async function fetchAllRecords<T>(query: any, pageSize: number = 1000): Promise<T[]> {
  let allRecords: T[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error en paginación:', error);
      throw error;
    }

    if (data && data.length > 0) {
      allRecords = allRecords.concat(data);
      hasMore = data.length === pageSize;
      page++;
    } else {
      hasMore = false;
    }
  }

  return allRecords;
}

async function probarFetchAllRecords() {
  console.log('✅ Probando función fetchAllRecords...\n');

  const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dateTo = new Date().toISOString().split('T')[0];

  console.log(`📅 Rango de fechas: ${dateFrom} a ${dateTo}\n`);

  // Contar total
  const { count } = await supabase
    .from("search_queries")
    .select("*", { count: 'exact', head: true })
    .gte("searched_at", dateFrom)
    .lte("searched_at", dateTo + " 23:59:59");

  console.log(`📊 Total de búsquedas en el rango: ${count}\n`);

  // Usar fetchAllRecords
  const baseQuery = supabase
    .from("search_queries")
    .select("searched_at")
    .gte("searched_at", dateFrom)
    .lte("searched_at", dateTo + " 23:59:59");

  console.log('⏳ Obteniendo TODOS los registros con paginación...\n');

  const allSearches = await fetchAllRecords<any>(baseQuery);

  console.log(`✅ Registros obtenidos: ${allSearches.length}\n`);

  if (allSearches.length === count) {
    console.log('🎉 ¡PERFECTO! Se obtienen TODOS los registros\n');
  } else {
    console.log(`⚠️  Diferencia: Se esperaban ${count} pero se obtuvieron ${allSearches.length}\n`);
  }

  // Ordenar por fecha
  allSearches.sort((a, b) => new Date(b.searched_at).getTime() - new Date(a.searched_at).getTime());

  // Mostrar las más recientes
  console.log('📅 Últimas 10 búsquedas (las más recientes):');
  console.log('─'.repeat(70));
  allSearches.slice(0, 10).forEach((search, index) => {
    const date = new Date(search.searched_at).toLocaleString('es-ES');
    console.log(`${(index + 1).toString().padStart(2)}. ${date}`);
  });
  console.log('─'.repeat(70));

  // Verificar búsquedas del 7 y 8 de febrero
  const feb7Count = allSearches.filter(s => s.searched_at.startsWith('2026-02-07')).length;
  const feb8Count = allSearches.filter(s => s.searched_at.startsWith('2026-02-08')).length;

  console.log(`\n📊 Búsquedas del 7 de febrero: ${feb7Count}`);
  console.log(`📊 Búsquedas del 8 de febrero: ${feb8Count}`);

  if (feb7Count > 0 && feb8Count > 0) {
    console.log('\n✅ ¡EXCELENTE! Las búsquedas del 7 y 8 de febrero están incluidas');
  } else {
    console.log('\n❌ Error: Faltan búsquedas recientes');
  }

  // Verificar búsquedas de hoy
  const today = new Date().toISOString().split('T')[0];
  const todayCount = allSearches.filter(s => s.searched_at.startsWith(today)).length;
  
  console.log(`\n🕐 Búsquedas de HOY (${today}): ${todayCount}`);
  
  if (todayCount > 0) {
    const latestToday = allSearches.find(s => s.searched_at.startsWith(today));
    if (latestToday) {
      console.log(`   Más reciente: ${new Date(latestToday.searched_at).toLocaleString('es-ES')}`);
    }
  }

  console.log('\n✅ Prueba completada\n');
}

probarFetchAllRecords().catch(console.error);
