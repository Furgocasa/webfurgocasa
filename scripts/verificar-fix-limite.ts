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

async function verificarFix() {
  console.log('✅ Verificando que el fix funciona correctamente...\n');

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

  // Consulta CON límite de 10000 (simulando el fix aplicado)
  const { data: withNewLimit } = await supabase
    .from("search_queries")
    .select("searched_at")
    .gte("searched_at", dateFrom)
    .lte("searched_at", dateTo + " 23:59:59")
    .limit(10000)
    .order("searched_at", { ascending: false });

  if (withNewLimit) {
    console.log(`✅ Registros obtenidos CON límite de 10000: ${withNewLimit.length}\n`);

    if (withNewLimit.length === count) {
      console.log('🎉 ¡PERFECTO! Ahora se obtienen TODOS los registros\n');
    } else if (withNewLimit.length < count!) {
      console.log(`⚠️  Advertencia: Se obtienen ${withNewLimit.length} de ${count} registros\n`);
    }

    // Mostrar las más recientes
    console.log('📅 Últimas 10 búsquedas (las más recientes):');
    console.log('─'.repeat(70));
    withNewLimit.slice(0, 10).forEach((search, index) => {
      const date = new Date(search.searched_at).toLocaleString('es-ES');
      console.log(`${(index + 1).toString().padStart(2)}. ${date}`);
    });
    console.log('─'.repeat(70));

    // Verificar que las búsquedas del 7 y 8 de febrero están incluidas
    const feb7Count = withNewLimit.filter(s => 
      s.searched_at.startsWith('2026-02-07')
    ).length;
    
    const feb8Count = withNewLimit.filter(s => 
      s.searched_at.startsWith('2026-02-08')
    ).length;

    console.log(`\n📊 Búsquedas del 7 de febrero en resultados: ${feb7Count}`);
    console.log(`📊 Búsquedas del 8 de febrero en resultados: ${feb8Count}`);

    if (feb7Count > 0 && feb8Count > 0) {
      console.log('\n✅ ¡EXCELENTE! Las búsquedas del 7 y 8 de febrero AHORA SÍ aparecen');
    } else {
      console.log('\n❌ Error: Las búsquedas recientes todavía no aparecen');
    }

    // Verificar búsquedas de hoy
    const today = new Date().toISOString().split('T')[0];
    const todayCount = withNewLimit.filter(s => 
      s.searched_at.startsWith(today)
    ).length;
    
    console.log(`\n🕐 Búsquedas de HOY (${today}): ${todayCount}`);
    
    if (todayCount > 0) {
      const latestToday = withNewLimit.find(s => s.searched_at.startsWith(today));
      if (latestToday) {
        console.log(`   Más reciente: ${new Date(latestToday.searched_at).toLocaleString('es-ES')}`);
      }
    }
  }

  console.log('\n✅ Verificación completada\n');
}

verificarFix().catch(console.error);
