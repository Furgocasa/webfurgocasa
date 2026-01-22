/**
 * Consulta rápida de una ciudad de venta (sale_location_targets).
 * Uso: node scripts/check-sale-location.js albacete
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });
 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase en .env.local');
  process.exit(1);
}
 
const supabase = createClient(supabaseUrl, supabaseKey);
 
const slug = (process.argv[2] || 'albacete').toLowerCase().trim();
 
async function run() {
  console.log('\n🔎 Consultando venta por ciudad (sale_location_targets)');
  console.log(`   Slug: ${slug}\n`);
 
  const { data, error } = await supabase
    .from('sale_location_targets')
    .select(
      'slug, name, province, region, is_active, meta_title, meta_description, h1_title'
    )
    .eq('slug', slug)
    .maybeSingle();
 
  if (error) {
    console.error('❌ Error en Supabase:', error.message);
    process.exit(1);
  }
 
  if (!data) {
    console.log('❌ No existe registro para ese slug.');
    console.log('   Resultado: la página mostrará "Ubicación no encontrada" y 404.');
    process.exit(0);
  }
 
  console.log('✅ Registro encontrado:');
  console.log(`   Nombre: ${data.name}`);
  console.log(`   Provincia: ${data.province}`);
  console.log(`   Región: ${data.region}`);
  console.log(`   Activo: ${data.is_active ? 'sí' : 'no'}`);
  console.log(`   Meta título: ${data.meta_title || '(vacío)'}`);
  console.log(`   H1: ${data.h1_title || '(vacío)'}`);
 
  if (!data.is_active) {
    console.log('\n⚠️  Está inactivo: la página devolverá 404.');
  }
}
 
run();
