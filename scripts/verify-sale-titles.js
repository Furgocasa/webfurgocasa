/**
 * Verificar que todas las ciudades de venta tienen títulos correctos
 * SIN " - Furgocasa" ni "| Furgocasa" al final (el template lo añade automáticamente)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de ciudades a verificar
const citiesToCheck = [
  'murcia', 'cartagena', 'lorca', 'torrevieja', 'san-javier', 'yecla',
  'alicante', 'benidorm', 'elche', 'orihuela', 'denia', 'calpe',
  'valencia', 'malaga', 'granada', 'almeria', 'jaen', 'vera',
  'albacete', 'madrid', 'alcorcon', 'getafe'
];

async function verifyTitles() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║    VERIFICACIÓN DE TÍTULOS - PÁGINAS DE VENTA POR CIUDAD        ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

  const { data: cities, error } = await supabase
    .from('sale_location_targets')
    .select('slug, name, meta_title, is_active')
    .in('slug', citiesToCheck)
    .order('name');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`📊 Encontradas ${cities.length}/${citiesToCheck.length} ciudades en la base de datos\n`);

  let correct = 0;
  let incorrect = 0;
  let missing = 0;

  for (const slug of citiesToCheck) {
    const city = cities.find(c => c.slug === slug);
    
    if (!city) {
      console.log(`❌ FALTA: ${slug} - No existe en la base de datos`);
      missing++;
      continue;
    }

    // Verificar si el título tiene "- Furgocasa" o "| Furgocasa" al final
    const hasFurgocasaSuffix = /(-|\|)\s*Furgocasa\s*$/i.test(city.meta_title);
    
    if (hasFurgocasaSuffix) {
      console.log(`⚠️  INCORRECTO: ${city.name} (${slug})`);
      console.log(`    Título actual: "${city.meta_title}"`);
      console.log(`    Debe ser sin "- Furgocasa" al final (el template lo añade)\n`);
      incorrect++;
    } else {
      console.log(`✅ CORRECTO: ${city.name} (${slug})`);
      console.log(`    Título: "${city.meta_title}"`);
      console.log(`    Título final en web: "${city.meta_title} - Furgocasa"\n`);
      correct++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Correctos: ${correct}`);
  console.log(`   ⚠️  Incorrectos: ${incorrect}`);
  console.log(`   ❌ Faltantes: ${missing}`);
  console.log(`   📍 Total verificados: ${citiesToCheck.length}`);
  console.log('\n' + '='.repeat(70));

  if (incorrect > 0 || missing > 0) {
    console.log('\n⚠️  ACCIÓN REQUERIDA: Hay ciudades con problemas');
    process.exit(1);
  } else {
    console.log('\n✅ ¡Perfecto! Todas las ciudades tienen títulos correctos');
  }
}

verifyTitles();
