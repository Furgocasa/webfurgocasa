/**
 * Script para obtener los IDs de categorías de Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCategorias() {
  const { data, error } = await supabase
    .from('content_categories')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log('\n📂 CATEGORÍAS DISPONIBLES:\n');
  data.forEach(cat => {
    console.log(`   ${cat.name.padEnd(20)} | ID: ${cat.id}`);
    console.log(`   Slug: ${cat.slug}`);
    console.log();
  });
  
  console.log('\n💡 Copia estos IDs al mapeo CATEGORIA_MAP en el script\n');
}

getCategorias();
