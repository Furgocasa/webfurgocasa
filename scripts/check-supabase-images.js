/**
 * Script para verificar qué imágenes de Supabase referenciadas en posts NO existen
 * Ejecutar: node scripts/check-supabase-images.js
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

// Cache de archivos existentes por bucket
const existingFiles = new Map();

async function listAllStorageFiles(bucket, path = '') {
  const files = [];
  
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path, { limit: 1000 });
    
    if (error || !data) return files;
    
    for (const item of data) {
      const fullPath = path ? `${path}/${item.name}` : item.name;
      
      if (item.metadata) {
        // Es un archivo
        files.push(fullPath);
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

async function loadExistingFiles() {
  const buckets = ['blog', 'media', 'vehicles'];
  
  for (const bucket of buckets) {
    console.log(`📁 Cargando bucket: ${bucket}...`);
    const files = await listAllStorageFiles(bucket);
    existingFiles.set(bucket, new Set(files));
    console.log(`   ${files.length} archivos encontrados`);
  }
}

function checkImageExists(imageUrl) {
  // Extraer bucket y path de la URL de Supabase
  // Formato: https://xxx.supabase.co/storage/v1/object/public/BUCKET/PATH
  const match = imageUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  
  if (!match) return { exists: true, bucket: null, path: null }; // No es URL de Supabase
  
  const [, bucket, rawPath] = match;
  
  // Decodificar URL (convertir %20 a espacios, etc.)
  let path;
  try {
    path = decodeURIComponent(rawPath);
  } catch (e) {
    path = rawPath;
  }
  
  const bucketFiles = existingFiles.get(bucket);
  
  if (!bucketFiles) return { exists: false, bucket, path, reason: 'bucket no existe' };
  
  // Verificar si existe tal cual
  if (bucketFiles.has(path)) {
    return { exists: true, bucket, path };
  }
  
  // Verificar si existe con espacios convertidos a guiones bajos
  const pathWithUnderscores = path.replace(/ /g, '_');
  if (bucketFiles.has(pathWithUnderscores)) {
    return { exists: true, bucket, path, actualPath: pathWithUnderscores, needsUpdate: true };
  }
  
  // Verificar si existe con guiones bajos convertidos a espacios
  const pathWithSpaces = path.replace(/_/g, ' ');
  if (bucketFiles.has(pathWithSpaces)) {
    return { exists: true, bucket, path, actualPath: pathWithSpaces, needsUpdate: true };
  }
  
  // Verificar la versión codificada original
  if (bucketFiles.has(rawPath)) {
    return { exists: true, bucket, path: rawPath };
  }
  
  return { exists: false, bucket, path };
}

function extractSupabaseUrls(text) {
  if (!text) return [];
  
  // Regex mejorado: no cortar en paréntesis codificados %28 %29 o reales ()
  // Captura hasta encontrar comillas, espacio, < o >
  const regex = /https:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/[^\s"'<>]+/gi;
  
  const matches = text.match(regex) || [];
  
  // Limpiar URLs que terminen en caracteres extraños
  return [...new Set(matches.map(url => {
    // Eliminar caracteres de puntuación al final que no sean parte del nombre
    return url.replace(/[,;:]+$/, '');
  }))];
}

async function main() {
  console.log('🔍 Verificando imágenes de Supabase en posts del blog...\n');
  
  // Cargar todos los archivos existentes
  await loadExistingFiles();
  
  console.log('\n📝 Analizando posts...\n');
  
  // Obtener todos los posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, featured_image, content');
  
  if (error) {
    console.error('❌ Error obteniendo posts:', error.message);
    process.exit(1);
  }
  
  const brokenImages = [];
  const postsWithBrokenImages = new Set();
  
  for (const post of posts) {
    // Verificar featured_image
    if (post.featured_image && post.featured_image.includes('supabase.co')) {
      const result = checkImageExists(post.featured_image);
      if (!result.exists) {
        brokenImages.push({
          postId: post.id,
          postTitle: post.title,
          postSlug: post.slug,
          type: 'featured_image',
          url: post.featured_image,
          bucket: result.bucket,
          path: result.path
        });
        postsWithBrokenImages.add(post.id);
      }
    }
    
    // Verificar imágenes en content
    const contentUrls = extractSupabaseUrls(post.content);
    for (const url of contentUrls) {
      const result = checkImageExists(url);
      if (!result.exists) {
        brokenImages.push({
          postId: post.id,
          postTitle: post.title,
          postSlug: post.slug,
          type: 'content',
          url: url,
          bucket: result.bucket,
          path: result.path
        });
        postsWithBrokenImages.add(post.id);
      }
    }
  }
  
  // Mostrar resultados
  console.log('=' .repeat(80));
  console.log('📊 RESULTADOS:');
  console.log('=' .repeat(80));
  console.log(`\n📄 Posts analizados: ${posts.length}`);
  console.log(`❌ Imágenes rotas encontradas: ${brokenImages.length}`);
  console.log(`📝 Posts afectados: ${postsWithBrokenImages.size}\n`);
  
  if (brokenImages.length > 0) {
    console.log('=' .repeat(80));
    console.log('🔴 IMÁGENES ROTAS:');
    console.log('=' .repeat(80));
    
    // Agrupar por bucket
    const byBucket = {};
    for (const img of brokenImages) {
      if (!byBucket[img.bucket]) byBucket[img.bucket] = [];
      byBucket[img.bucket].push(img);
    }
    
    for (const [bucket, images] of Object.entries(byBucket)) {
      console.log(`\n📁 Bucket: ${bucket} (${images.length} imágenes rotas)`);
      console.log('-'.repeat(60));
      
      for (const img of images) {
        console.log(`  ❌ ${img.path}`);
        console.log(`     Post: "${img.postTitle.substring(0, 50)}..."`);
        console.log(`     Tipo: ${img.type}`);
      }
    }
    
    // Exportar lista de paths faltantes
    console.log('\n' + '=' .repeat(80));
    console.log('📋 LISTA DE ARCHIVOS FALTANTES (para subir a Supabase):');
    console.log('=' .repeat(80));
    
    const uniquePaths = [...new Set(brokenImages.map(img => `${img.bucket}/${img.path}`))];
    uniquePaths.forEach(path => console.log(`  - ${path}`));
  } else {
    console.log('✅ Todas las imágenes de Supabase existen correctamente!');
  }
}

main().catch(console.error);
