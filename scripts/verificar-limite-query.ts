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

async function verificarLimite() {
  console.log('🔍 Verificando límite de registros en consultas...\n');

  // Simular la consulta que hace la API del admin
  const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dateTo = new Date().toISOString().split('T')[0];

  console.log(`📅 Rango de fechas: ${dateFrom} a ${dateTo}\n`);

  // 1. Consulta SIN límite explícito (como está en la API ahora)
  console.log('1️⃣ Consulta SIN límite explícito:');
  const { data: withoutLimit, error: error1 } = await supabase
    .from("search_queries")
    .select("*")
    .gte("searched_at", dateFrom)
    .lte("searched_at", dateTo + " 23:59:59");

  if (error1) {
    console.error('❌ Error:', error1);
  } else {
    console.log(`   ✅ Registros obtenidos: ${withoutLimit?.length || 0}`);
    
    if (withoutLimit && withoutLimit.length > 0) {
      const dates = withoutLimit.map(s => s.searched_at).sort();
      console.log(`   📅 Fecha más antigua: ${new Date(dates[0]).toLocaleString('es-ES')}`);
      console.log(`   📅 Fecha más reciente: ${new Date(dates[dates.length - 1]).toLocaleString('es-ES')}`);
    }
  }

  // 2. Contar con count exact
  console.log('\n2️⃣ Conteo EXACTO en el rango:');
  const { count, error: error2 } = await supabase
    .from("search_queries")
    .select("*", { count: 'exact', head: true })
    .gte("searched_at", dateFrom)
    .lte("searched_at", dateTo + " 23:59:59");

  if (error2) {
    console.error('❌ Error:', error2);
  } else {
    console.log(`   ✅ Total de registros: ${count}`);
  }

  // 3. Ver si hay un límite de 1000 por defecto
  console.log('\n3️⃣ Verificando límite por defecto de Supabase:');
  
  if (withoutLimit && count) {
    if (withoutLimit.length < count) {
      console.log(`   ⚠️  PROBLEMA DETECTADO:`);
      console.log(`   🔴 La consulta devuelve ${withoutLimit.length} registros`);
      console.log(`   🔴 Pero existen ${count} registros en total`);
      console.log(`   🔴 Diferencia: ${count - withoutLimit.length} registros NO se están obteniendo`);
      console.log(`   \n   💡 SOLUCIÓN: Supabase tiene un límite por defecto de 1000 registros.`);
      console.log(`      Necesitas aplicar paginación o aumentar el límite explícitamente.`);
    } else {
      console.log(`   ✅ No hay límite aplicado, todos los registros se obtienen correctamente`);
    }
  }

  // 4. Buscar las búsquedas más recientes que NO están en los primeros 1000
  console.log('\n4️⃣ Verificando búsquedas recientes que podrían estar fuera del límite:');
  
  const { data: allSearches } = await supabase
    .from("search_queries")
    .select("searched_at")
    .gte("searched_at", dateFrom)
    .lte("searched_at", dateTo + " 23:59:59")
    .order("searched_at", { ascending: false });

  if (allSearches && allSearches.length >= 1000) {
    const search1000 = allSearches[999];
    const search1001 = allSearches[1000];
    
    console.log(`   📊 Registro #1000: ${new Date(search1000.searched_at).toLocaleString('es-ES')}`);
    if (search1001) {
      console.log(`   📊 Registro #1001: ${new Date(search1001.searched_at).toLocaleString('es-ES')}`);
      console.log(`   ⚠️  Las búsquedas después del registro #1000 NO se muestran en el admin`);
    }
  }

  console.log('\n✅ Verificación completada\n');
}

verificarLimite().catch(console.error);
