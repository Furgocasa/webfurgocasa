/**
 * SCRIPT DE IMPORTACIÓN DIRECTA A SUPABASE
 * =========================================
 * 
 * Importa todos los artículos del blog directamente a Supabase
 * usando la API REST en lugar de SQL.
 * 
 * Uso:
 * node scripts/import-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credenciales de Supabase
const SUPABASE_URL = 'https://uygxrqqtdebyzllvbuef.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_XNYprkfzo2n1_UHKtmsacg_SkezdbhE';

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('🚀 Iniciando importación de artículos a Supabase...\n');
  
  // Leer el archivo JSON con los artículos
  const jsonPath = path.join(__dirname, 'blog-articles.json');
  const articlesData = fs.readFileSync(jsonPath, 'utf-8');
  const articles = JSON.parse(articlesData);
  
  console.log(`📦 Cargados ${articles.length} artículos del archivo JSON\n`);
  
  // Paso 1: Obtener los IDs de las categorías
  console.log('📂 Obteniendo IDs de categorías...');
  const { data: categories, error: catError } = await supabase
    .from('content_categories')
    .select('id, slug')
    .in('slug', ['rutas', 'noticias', 'vehiculos']);
  
  if (catError) {
    console.error('❌ Error al obtener categorías:', catError);
    return;
  }
  
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.slug] = cat.id;
  });
  
  console.log('✅ Categorías obtenidas:');
  console.log(`   - Rutas: ${categoryMap.rutas}`);
  console.log(`   - Noticias: ${categoryMap.noticias}`);
  console.log(`   - Vehículos: ${categoryMap.vehiculos}\n`);
  
  // Paso 2: Preparar los artículos para insertar
  console.log('📝 Preparando artículos para importar...\n');
  
  let imported = 0;
  let updated = 0;
  let errors = 0;
  
  // Importar en lotes de 10 para no sobrecargar
  const batchSize = 10;
  
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);
    
    console.log(`📦 Procesando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(articles.length / batchSize)} (artículos ${i + 1}-${Math.min(i + batchSize, articles.length)})`);
    
    for (const article of batch) {
      const categoryId = categoryMap[article.category];
      
      if (!categoryId) {
        console.error(`   ⚠️  Categoría no encontrada para: ${article.slug}`);
        errors++;
        continue;
      }
      
      // Preparar el objeto para insertar
      const postData = {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content || '',
        featured_image: article.featuredImage || null,
        category_id: categoryId,
        status: 'published',
        is_featured: imported < 3, // Los primeros 3 como destacados
        reading_time: article.readingTime || 1,
        meta_title: article.metaTitle || article.title,
        meta_description: article.metaDescription || article.excerpt || '',
        meta_keywords: article.metaKeywords || '',
        og_image: article.featuredImage || null,
        published_at: article.publishedDate || new Date().toISOString(),
        post_type: 'blog'
      };
      
      // Intentar insertar o actualizar
      const { data, error } = await supabase
        .from('posts')
        .upsert(postData, { 
          onConflict: 'slug',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        console.error(`   ❌ Error en "${article.title.substring(0, 50)}...": ${error.message}`);
        errors++;
      } else {
        if (data && data.length > 0) {
          imported++;
          console.log(`   ✅ ${article.title.substring(0, 60)}...`);
        } else {
          updated++;
          console.log(`   🔄 Actualizado: ${article.title.substring(0, 60)}...`);
        }
      }
      
      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('');
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('✅ IMPORTACIÓN COMPLETADA');
  console.log('='.repeat(60));
  console.log(`📊 Resumen:`);
  console.log(`   ✅ Importados: ${imported}`);
  console.log(`   🔄 Actualizados: ${updated}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📦 Total procesados: ${articles.length}`);
  
  // Verificación final
  console.log('\n📊 Verificando importación...');
  
  const { data: stats, error: statsError } = await supabase
    .from('posts')
    .select('category_id, content_categories(name)', { count: 'exact' })
    .eq('post_type', 'blog');
  
  if (!statsError && stats) {
    console.log(`\n✅ Total de artículos en la base de datos: ${stats.length}`);
    
    // Contar por categoría
    const countByCategory = {};
    stats.forEach(post => {
      const catName = post.content_categories?.name || 'Sin categoría';
      countByCategory[catName] = (countByCategory[catName] || 0) + 1;
    });
    
    console.log('\n📂 Distribución por categoría:');
    Object.entries(countByCategory).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} artículos`);
    });
  }
  
  console.log('\n🎉 ¡Importación finalizada con éxito!');
}

// Ejecutar
main().catch(error => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});
