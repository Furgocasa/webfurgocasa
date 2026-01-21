/**
 * Script para corregir featured_image con URLs rotas
 * Ejecutar: node scripts/fix-featured-images.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan credenciales de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Imagen placeholder para usar cuando no hay imagen
const PLACEHOLDER = '/images/slides/hero-01.webp';

async function main() {
  console.log('🔍 Buscando posts con featured_image rota...\n');

  // Obtener todos los posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image')
    .not('featured_image', 'is', null);
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  // Filtrar posts con URLs antiguas de furgocasa.com que dan 404
  const brokenPosts = posts.filter(p => 
    p.featured_image && (
      p.featured_image.includes('furgocasa.com/images/furgocasa/') ||
      p.featured_image.includes('furgocasa.com/images/2020/') ||
      p.featured_image.includes('furgocasa.com/images/2021/') ||
      p.featured_image.includes('furgocasa.com/images/2022/') ||
      p.featured_image.includes('furgocasa.com/images/2023/') ||
      p.featured_image.includes('furgocasa.com/images/2024/') ||
      p.featured_image.includes('furgocasa.com/images/2025/') ||
      p.featured_image.startsWith('/images/furgocasa/')
    )
  );
  
  console.log(`Total posts con imagen: ${posts.length}`);
  console.log(`Posts con featured_image rota: ${brokenPosts.length}\n`);
  
  if (brokenPosts.length === 0) {
    console.log('✅ No se encontraron featured_image rotas');
    return;
  }
  
  console.log('📋 Posts con imagen destacada rota:\n');
  brokenPosts.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title}`);
    console.log(`   URL rota: ${p.featured_image}\n`);
  });
  
  // Corregir: poner placeholder
  console.log('\n🔄 Aplicando imagen placeholder...\n');
  
  let fixed = 0;
  for (const post of brokenPosts) {
    const { error: updateError } = await supabase
      .from('posts')
      .update({ featured_image: PLACEHOLDER })
      .eq('id', post.id);
    
    if (!updateError) {
      console.log(`✅ ${post.title}`);
      fixed++;
    } else {
      console.log(`❌ Error en ${post.title}: ${updateError.message}`);
    }
  }
  
  console.log(`\n📊 Resumen: ${fixed}/${brokenPosts.length} corregidos`);
  console.log('🎉 Proceso completado!');
}

main().catch(console.error);
