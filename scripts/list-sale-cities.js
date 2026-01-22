/**
 * Script para listar todas las ciudades en sale_location_targets
 * y verificar cuáles existen vs cuáles aparecen en las URLs
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

async function listSaleCities() {
  console.log('\n📍 CIUDADES EN sale_location_targets:\n');
  
  const { data: cities, error } = await supabase
    .from('sale_location_targets')
    .select('slug, name, is_active, meta_title')
    .order('name');

  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }

  console.log(`Total: ${cities.length} ciudades\n`);
  
  cities.forEach((city, index) => {
    const status = city.is_active ? '✅' : '❌';
    console.log(`${status} ${(index + 1).toString().padStart(2, '0')}. ${city.name.padEnd(20)} (${city.slug})`);
    console.log(`    Título: "${city.meta_title}"`);
  });
}

listSaleCities();
