/**
 * Script para corregir URLs de imágenes del blog rotas
 * Ejecutar: node scripts/fix-blog-images.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan credenciales de Supabase en .env.local');
  console.log('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// URL base de Supabase Storage para el bucket de blog
const STORAGE_BASE_URL = `${supabaseUrl}/storage/v1/object/public/blog`;

async function main() {
  console.log('🔍 Buscando artículos con imágenes rotas...\n');

  // 1. Obtener todos los posts con su contenido
  const { data: allPosts, error } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image, content');
  
  if (error) {
    console.error('❌ Error al consultar:', error.message);
    process.exit(1);
  }
  
  console.log(`Total posts: ${allPosts.length}`);
  
  // Regex para encontrar URLs de imágenes antiguas
  const oldImagePatterns = [
    /\/images\/furgocasa\/[^"'\s)]+/g,
    /\/images\/2022\/[^"'\s)]+/g,
    /\/images\/2021\/[^"'\s)]+/g,
    /\/images\/2020\/[^"'\s)]+/g,
  ];
  
  // Encontrar todas las URLs antiguas únicas
  const allOldUrls = new Set();
  const postsWithOldUrls = [];
  
  for (const post of allPosts) {
    const oldUrls = [];
    
    // Buscar en featured_image
    if (post.featured_image) {
      for (const pattern of oldImagePatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(post.featured_image)) {
          oldUrls.push({ field: 'featured_image', url: post.featured_image });
          allOldUrls.add(post.featured_image);
        }
      }
    }
    
    // Buscar en contenido
    if (post.content) {
      for (const pattern of oldImagePatterns) {
        pattern.lastIndex = 0;
        let match;
        while ((match = pattern.exec(post.content)) !== null) {
          oldUrls.push({ field: 'content', url: match[0] });
          allOldUrls.add(match[0]);
        }
      }
    }
    
    if (oldUrls.length > 0) {
      postsWithOldUrls.push({
        ...post,
        oldUrls
      });
    }
  }
  
  // Usar la variable posts del filtro original
  const posts = postsWithOldUrls;
  
  console.log(`Posts con URLs antiguas: ${posts.length}`);
  console.log(`URLs antiguas únicas encontradas: ${allOldUrls.size}\n`);
  
  if (allOldUrls.size > 0) {
    console.log('📋 URLs antiguas encontradas:');
    [...allOldUrls].slice(0, 20).forEach((url, i) => {
      console.log(`   ${i + 1}. ${url}`);
    });
    if (allOldUrls.size > 20) {
      console.log(`   ... y ${allOldUrls.size - 20} más`);
    }
    console.log('');
  }

  if (!posts || posts.length === 0) {
    console.log('✅ No se encontraron imágenes con URLs locales antiguas');
    return;
  }

  console.log(`📝 Encontrados ${posts.length} artículos con URLs antiguas:\n`);

  // Mostrar lista
  posts.forEach((post, i) => {
    console.log(`${i + 1}. ${post.title}`);
    console.log(`   URL actual: ${post.featured_image}`);
    console.log('');
  });

  // 2. Reemplazar URLs antiguas en el contenido
  console.log('\n🔄 Reemplazando URLs antiguas en el contenido de los posts...\n');
  
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const post of posts) {
    let newContent = post.content;
    let contentChanged = false;
    
    // Reemplazar todas las URLs antiguas por vacío (eliminar las imágenes rotas del contenido)
    for (const pattern of oldImagePatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(newContent)) {
        // Eliminar las etiquetas <img> completas que contienen estas URLs
        // Patrón para eliminar <img> con estas URLs
        const imgPattern = new RegExp(`<img[^>]*src=["']?[^"']*\\/images\\/(furgocasa|202[0-2])\\/[^"'\\s>]*["']?[^>]*>`, 'gi');
        newContent = newContent.replace(imgPattern, '<!-- imagen eliminada -->');
        contentChanged = true;
      }
    }
    
    // También eliminar URLs de furgocasa.com con imágenes antiguas
    const externalOldPattern = /<img[^>]*src=["']?https?:\/\/www\.furgocasa\.com\/images\/(furgocasa|202[0-2])\/[^"']*["']?[^>]*>/gi;
    if (externalOldPattern.test(newContent)) {
      newContent = newContent.replace(externalOldPattern, '<!-- imagen eliminada -->');
      contentChanged = true;
    }
    
    if (contentChanged) {
      const { error: updateError } = await supabase
        .from('posts')
        .update({ content: newContent })
        .eq('id', post.id);
      
      if (updateError) {
        console.log(`❌ Error en "${post.title}": ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`✅ Limpiado: ${post.title}`);
        fixedCount++;
      }
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Posts corregidos: ${fixedCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log('\n🎉 Proceso completado!');
}

main().catch(console.error);
