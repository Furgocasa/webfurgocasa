// Verificar Albacete y sus traducciones
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkAlbacete() {
  console.log('🔍 Verificando Albacete en location_targets...\n');
  
  // 1. Buscar el registro
  const { data, error } = await supabase
    .from('location_targets')
    .select('id, slug, name, meta_title, h1_title, is_active, province, region')
    .eq('slug', 'albacete')
    .single();
  
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  if (!data) {
    console.log('❌ NO existe el slug "albacete"');
    return;
  }
  
  console.log('✅ Registro encontrado:');
  console.log('   ID:', data.id);
  console.log('   Slug:', data.slug);
  console.log('   Name:', data.name);
  console.log('   Province:', data.province);
  console.log('   Region:', data.region);
  console.log('   Active:', data.is_active);
  console.log('   H1 Title:', data.h1_title || '(vacío)');
  console.log('   Meta Title:', data.meta_title || '(vacío)');
  
  // 2. Verificar traducciones
  console.log('\n🌍 Verificando traducciones...');
  
  const locales = ['en', 'fr', 'de'];
  
  for (const locale of locales) {
    const { data: trans } = await supabase
      .from('content_translations')
      .select('source_field, translated_text')
      .eq('source_table', 'location_targets')
      .eq('source_id', data.id)
      .eq('locale', locale);
    
    console.log(`\n${locale.toUpperCase()}: ${trans ? trans.length : 0} traducciones`);
    
    if (trans && trans.length > 0) {
      // Mostrar solo los primeros campos importantes
      const important = trans.filter(t => ['name', 'h1_title', 'meta_title'].includes(t.source_field));
      important.forEach(t => {
        const preview = t.translated_text?.substring(0, 60) || '(vacío)';
        console.log(`  - ${t.source_field}: ${preview}`);
      });
      
      if (trans.length > important.length) {
        console.log(`  ... y ${trans.length - important.length} campos más`);
      }
    } else {
      console.log('  ⚠️  Sin traducciones');
    }
  }
  
  // 3. Verificar generateStaticParams
  console.log('\n📋 Verificando que la página tenga generateStaticParams...');
  const fs = require('fs');
  const pagePath = 'src/app/es/alquiler-autocaravanas-campervans-[location]/page.tsx';
  
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8');
    if (content.includes('generateStaticParams')) {
      console.log('✅ La página tiene generateStaticParams');
    } else {
      console.log('❌ La página NO tiene generateStaticParams');
    }
  }
}

checkAlbacete().catch(console.error);
