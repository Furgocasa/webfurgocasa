/**
 * Script inteligente para reemplazar imágenes del blog
 * Busca en Supabase Storage y reemplaza URLs si encuentra coincidencias
 * Ejecutar: node scripts/smart-fix-images.js
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
const STORAGE_BASE = `${supabaseUrl}/storage/v1/object/public`;

async function listAllStorageFiles(bucket, path = '') {
  const files = [];
  
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path, { limit: 1000 });
    
    if (error || !data) return files;
    
    for (const item of data) {
      const fullPath = path ? `${path}/${item.name}` : item.name;
      
      if (item.metadata) {
        // Es un archivo
        files.push({
          path: fullPath,
          name: item.name,
          url: `${STORAGE_BASE}/${bucket}/${fullPath}`
        });
      } else {
        // Es una carpeta, buscar recursivamente
        const subFiles = await listAllStorageFiles(bucket, fullPath);
        files.push(...subFiles);
      }
    }
  } catch (e) {
    console.log(`   Error listando ${bucket}/${path}: ${e.message}`);
  }
  
  return files;
}

function normalizeFileName(name) {
  // Normalizar nombre para comparación
  return name
    .toLowerCase()
    .replace(/[_\-\s]+/g, '-')
    .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
    .replace(/[^a-z0-9\-]/g, '');
}

function findBestMatch(oldUrl, availableFiles) {
  // Extraer nombre del archivo de la URL antigua
  const oldFileName = oldUrl.split('/').pop().split('?')[0];
  const normalizedOld = normalizeFileName(oldFileName);
  
  // Buscar coincidencia exacta primero
  for (const file of availableFiles) {
    if (file.name.toLowerCase() === oldFileName.toLowerCase()) {
      return file;
    }
  }
  
  // Buscar coincidencia por nombre normalizado
  for (const file of availableFiles) {
    const normalizedNew = normalizeFileName(file.name);
    if (normalizedNew === normalizedOld) {
      return file;
    }
  }
  
  // Buscar coincidencia parcial (el nombre antiguo está contenido en el nuevo o viceversa)
  for (const file of availableFiles) {
    const normalizedNew = normalizeFileName(file.name);
    if (normalizedNew.includes(normalizedOld) || normalizedOld.includes(normalizedNew)) {
      if (normalizedNew.length > 5 && normalizedOld.length > 5) { // Evitar matches muy cortos
        return file;
      }
    }
  }
  
  return null;
}

async function main() {
  console.log('🔍 Cargando imágenes disponibles en Supabase Storage...\n');
  
  // Listar todos los buckets de imágenes
  const buckets = ['blog', 'media', 'vehicles'];
  const allFiles = [];
  
  for (const bucket of buckets) {
    console.log(`📁 Listando bucket: ${bucket}`);
    const files = await listAllStorageFiles(bucket);
    console.log(`   Encontradas ${files.length} imágenes`);
    allFiles.push(...files);
  }
  
  console.log(`\n📊 Total imágenes en Storage: ${allFiles.length}\n`);
  
  // Obtener posts con contenido
  console.log('🔍 Analizando posts del blog...\n');
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image, content');
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  // Regex para URLs antiguas
  const oldUrlPatterns = [
    /https?:\/\/(?:www\.)?furgocasa\.com\/images\/[^\s"'<>)]+/gi,
    /\/images\/furgocasa\/[^\s"'<>)]+/gi,
    /\/images\/202[0-5]\/[^\s"'<>)]+/gi,
  ];
  
  let totalFixed = 0;
  let totalRemoved = 0;
  let totalErrors = 0;
  
  for (const post of posts) {
    let contentChanged = false;
    let featuredChanged = false;
    let newContent = post.content || '';
    let newFeatured = post.featured_image;
    
    // Buscar URLs antiguas en el contenido
    for (const pattern of oldUrlPatterns) {
      pattern.lastIndex = 0;
      let match;
      
      while ((match = pattern.exec(post.content || '')) !== null) {
        const oldUrl = match[0];
        const bestMatch = findBestMatch(oldUrl, allFiles);
        
        if (bestMatch) {
          console.log(`✅ [${post.title.substring(0, 40)}...]`);
          console.log(`   Antiguo: ${oldUrl.substring(0, 60)}...`);
          console.log(`   Nuevo:   ${bestMatch.url.substring(0, 60)}...`);
          newContent = newContent.replace(oldUrl, bestMatch.url);
          contentChanged = true;
          totalFixed++;
        } else {
          // No encontrado - eliminar la etiqueta img completa
          const imgRegex = new RegExp(`<img[^>]*src=["']?${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']?[^>]*>`, 'gi');
          if (imgRegex.test(newContent)) {
            newContent = newContent.replace(imgRegex, '');
            contentChanged = true;
            totalRemoved++;
            console.log(`🗑️  [${post.title.substring(0, 40)}...] Eliminada: ${oldUrl.split('/').pop()}`);
          }
        }
      }
    }
    
    // Verificar featured_image
    if (newFeatured) {
      let isOldUrl = false;
      for (const pattern of oldUrlPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(newFeatured)) {
          isOldUrl = true;
          break;
        }
      }
      
      if (isOldUrl) {
        const bestMatch = findBestMatch(newFeatured, allFiles);
        
        if (bestMatch) {
          console.log(`✅ [FEATURED: ${post.title.substring(0, 30)}...]`);
          console.log(`   Antiguo: ${newFeatured.substring(0, 60)}...`);
          console.log(`   Nuevo:   ${bestMatch.url.substring(0, 60)}...`);
          newFeatured = bestMatch.url;
          featuredChanged = true;
          totalFixed++;
        } else {
          // Usar placeholder
          newFeatured = '/images/slides/hero-01.webp';
          featuredChanged = true;
          totalRemoved++;
          console.log(`🗑️  [FEATURED: ${post.title.substring(0, 30)}...] → placeholder`);
        }
      }
    }
    
    // Actualizar si hay cambios
    if (contentChanged || featuredChanged) {
      const updateData = {};
      if (contentChanged) updateData.content = newContent;
      if (featuredChanged) updateData.featured_image = newFeatured;
      
      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', post.id);
      
      if (updateError) {
        console.log(`❌ Error actualizando ${post.title}: ${updateError.message}`);
        totalErrors++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN FINAL:');
  console.log('='.repeat(60));
  console.log(`   ✅ Imágenes reemplazadas: ${totalFixed}`);
  console.log(`   🗑️  Imágenes eliminadas:   ${totalRemoved}`);
  console.log(`   ❌ Errores:              ${totalErrors}`);
  console.log('='.repeat(60));
  console.log('\n🎉 Proceso completado!');
}

main().catch(console.error);
