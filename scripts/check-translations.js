// Verificar traducciones en content_translations
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTranslations() {
  console.log('🔍 Verificando traducciones en content_translations...\n');
  
  // 1. Verificar traducciones para location_targets (alquiler)
  console.log('📍 LOCATION_TARGETS (Alquiler):');
  const { data: rentTranslations } = await supabase
    .from('content_translations')
    .select('source_table, locale, source_field')
    .eq('source_table', 'location_targets')
    .limit(5);
  
  if (rentTranslations && rentTranslations.length > 0) {
    console.log(`✅ Existen ${rentTranslations.length}+ traducciones`);
    console.log('Ejemplo:', rentTranslations[0]);
    
    // Contar por locale
    const { data: countRent } = await supabase
      .from('content_translations')
      .select('locale', { count: 'exact', head: true })
      .eq('source_table', 'location_targets');
    console.log(`Total traducciones: ${countRent}`);
  } else {
    console.log('❌ NO hay traducciones para location_targets');
  }
  
  // 2. Verificar traducciones para sale_location_targets (venta)
  console.log('\n💰 SALE_LOCATION_TARGETS (Venta):');
  const { data: saleTranslations } = await supabase
    .from('content_translations')
    .select('source_table, locale, source_field')
    .eq('source_table', 'sale_location_targets')
    .limit(5);
  
  if (saleTranslations && saleTranslations.length > 0) {
    console.log(`✅ Existen ${saleTranslations.length}+ traducciones`);
    console.log('Ejemplo:', saleTranslations[0]);
  } else {
    console.log('❌ NO hay traducciones para sale_location_targets');
  }
  
  // 3. Ver todas las tablas que tienen traducciones
  console.log('\n📊 Tablas con traducciones:');
  const { data: tables } = await supabase
    .from('content_translations')
    .select('source_table')
    .limit(1000);
  
  if (tables) {
    const uniqueTables = [...new Set(tables.map(t => t.source_table))];
    uniqueTables.forEach(table => console.log(`  - ${table}`));
  }
}

checkTranslations().catch(console.error);
