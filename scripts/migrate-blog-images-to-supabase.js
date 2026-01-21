const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIGURACIÓN
// ==========================================

// Cargar variables de .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de entorno no configuradas');
  console.log('Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  console.log(`URL encontrada: ${SUPABASE_URL ? 'SI' : 'NO'}`);
  console.log(`KEY encontrada: ${SUPABASE_SERVICE_KEY ? 'SI' : 'NO'}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Directorio de imágenes locales
const LOCAL_IMAGES_DIR = path.join(__dirname, '../furgocasa_images/blog');
const BUCKET_NAME = 'blog';

// Modo prueba o completo
const TEST_MODE = process.argv.includes('--test') || process.argv.includes('--dry-run');
const LIMIT_POSTS = TEST_MODE ? 10 : null;

console.log('🚀 Iniciando migración de imágenes del blog a Supabase Storage');
console.log('================================================');
console.log(`📦 Bucket: ${BUCKET_NAME}`);
console.log(`🔧 Modo: ${TEST_MODE ? 'PRUEBA (10 posts)' : 'COMPLETO (todos los posts)'}`);
console.log('================================================\n');

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

/**
 * Extrae año y mes de una URL de imagen
 * Soporta múltiples formatos:
 * - /images/2025/12/29/nombre.png
 * - /images/furgocasa/blog/2025.12/nombre.png
 */
function extractDateFromUrl(imageUrl) {
  // Formato 1: /images/2025/12/29/nombre.png
  let match = imageUrl.match(/\/images\/(\d{4})\/(\d{2})\/\d+\/(.+)$/);
  if (match) {
    return {
      year: match[1],
      month: match[2],
      // Decodificar URL para convertir %20 en espacios, etc.
      filename: decodeURIComponent(match[3])
    };
  }
  
  // Formato 2: /images/furgocasa/blog/2025.12/nombre.png
  match = imageUrl.match(/\/images\/furgocasa\/blog\/(\d{4})\.(\d{2})\/(.+)$/);
  if (match) {
    return {
      year: match[1],
      month: match[2],
      // Decodificar URL para convertir %20 en espacios, etc.
      filename: decodeURIComponent(match[3])
    };
  }
  
  return null;
}

/**
 * Busca una imagen en las carpetas locales usando la fecha del post y búsqueda flexible
 */
function findLocalImage(imageUrl, postPublishedAt) {
  // Intentar extraer fecha de la URL primero
  const dateInfo = extractDateFromUrl(imageUrl);
  
  const filename = dateInfo ? dateInfo.filename : path.basename(imageUrl);
  
  // Obtener nombre base sin extensión y sufijos para búsqueda flexible
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const cleanBasename = basename
    .replace(/_large$/, '')
    .replace(/_medium$/, '')
    .replace(/_small$/, '')
    .replace(/_\d+$/, '') // Ej: _2, _3
    .replace(/\s+/g, '_'); // Espacios a guiones bajos

  // Lista de carpetas donde buscar (priorizando fecha del post)
  const possibleFolders = [];
  
  // 1. Si tenemos la fecha de publicación del post, usarla primero
  if (postPublishedAt) {
    const postDate = new Date(postPublishedAt);
    const postYear = postDate.getFullYear();
    const postMonth = String(postDate.getMonth() + 1).padStart(2, '0');
    
    possibleFolders.push(
      path.join(LOCAL_IMAGES_DIR, `${postYear}.${postMonth}`),
      path.join(LOCAL_IMAGES_DIR, postYear.toString(), postMonth)
    );
  }
  
  // 2. Si pudimos extraer fecha de la URL, agregar esas carpetas
  if (dateInfo) {
    const { year, month } = dateInfo;
    possibleFolders.push(
      path.join(LOCAL_IMAGES_DIR, `${year}.${month}`),
      path.join(LOCAL_IMAGES_DIR, year, month)
    );
  }
  
  // 3. IMPORTANTE: Agregar TODAS las carpetas del blog para búsqueda exhaustiva
  try {
    const allFolders = fs.readdirSync(LOCAL_IMAGES_DIR)
      .filter(f => {
        const fullPath = path.join(LOCAL_IMAGES_DIR, f);
        return fs.statSync(fullPath).isDirectory() && f.match(/^\d{4}\.\d{2}$/);
      })
      .map(f => path.join(LOCAL_IMAGES_DIR, f));
    
    // Agregar las carpetas que aún no están en la lista
    allFolders.forEach(folder => {
      if (!possibleFolders.includes(folder)) {
        possibleFolders.push(folder);
      }
    });
  } catch (err) {
    console.log(`   ⚠️  Error al listar carpetas: ${err.message}`);
  }

  // Buscar en cada carpeta posible
  for (const folderPath of possibleFolders) {
    if (!fs.existsSync(folderPath)) {
      continue;
    }

    try {
      const files = fs.readdirSync(folderPath);
      
      // 1. Buscar archivo exacto
      const exactMatch = files.find(f => f === filename);
      if (exactMatch) {
        return path.join(folderPath, exactMatch);
      }
      
      // 2. Buscar por nombre base flexible (sin _large, sin extensión, etc.)
      const flexibleMatch = files.find(f => {
        const fBasename = path.basename(f, path.extname(f));
        const fClean = fBasename
          .replace(/_large$/, '')
          .replace(/_medium$/, '')
          .replace(/_small$/, '')
          .replace(/_\d+$/, '')
          .replace(/\s+/g, '_');
        
        // Coincidencia bidireccional y por prefijo
        return fClean === cleanBasename || 
               fBasename === cleanBasename ||
               fClean.toLowerCase() === cleanBasename.toLowerCase() ||
               fBasename.toLowerCase().startsWith(cleanBasename.toLowerCase()) ||
               cleanBasename.toLowerCase().startsWith(fBasename.toLowerCase());
      });

      if (flexibleMatch) {
        console.log(`   ℹ️  Encontrado: ${flexibleMatch} en ${path.basename(folderPath)}`);
        return path.join(folderPath, flexibleMatch);
      }
    } catch (error) {
      // Continuar con la siguiente carpeta
    }
  }

  console.log(`   ⚠️  No encontrado: ${filename}`);
  return null;
}

/**
 * Optimiza imagen a WebP
 */
async function optimizeImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({
        quality: 85,
        effort: 6
      })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    return {
      success: true,
      size: stats.size
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sube imagen a Supabase Storage
 */
async function uploadToSupabase(localPath, remotePath) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(remotePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(remotePath);

    return {
      success: true,
      publicUrl
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Procesa una imagen: busca local, optimiza y sube
 */
async function processImage(imageUrl, postSlug, postPublishedAt) {
  console.log(`   📸 Procesando: ${path.basename(imageUrl)}`);

  // 1. Buscar imagen local (usando fecha del post)
  const localPath = findLocalImage(imageUrl, postPublishedAt);
  if (!localPath) {
    return { success: false, reason: 'not_found_locally' };
  }

  // 2. Generar nombre para Storage
  const dateInfo = extractDateFromUrl(imageUrl);
  const actualFilename = path.basename(localPath);
  const ext = path.extname(actualFilename);
  const basename = path.basename(actualFilename, ext);
  
  // Usar fecha del post si no hay fecha en la URL
  let remotePath;
  if (dateInfo) {
    remotePath = `${dateInfo.year}/${dateInfo.month}/${basename}.webp`;
  } else if (postPublishedAt) {
    const postDate = new Date(postPublishedAt);
    const year = postDate.getFullYear();
    const month = String(postDate.getMonth() + 1).padStart(2, '0');
    remotePath = `${year}/${month}/${basename}.webp`;
  } else {
    remotePath = `otros/${basename}.webp`;
  }

  // 3. Optimizar a WebP temporal
  const tempPath = path.join(__dirname, `temp_${basename}.webp`);
  
  console.log(`   🔧 Optimizando a WebP...`);
  const optimizeResult = await optimizeImage(localPath, tempPath);
  
  if (!optimizeResult.success) {
    return { success: false, reason: 'optimization_failed', error: optimizeResult.error };
  }

  const sizeKB = (optimizeResult.size / 1024).toFixed(2);
  console.log(`   ✓ Optimizado (${sizeKB} KB)`);

  // 4. Subir a Supabase
  console.log(`   ☁️  Subiendo a Supabase: ${remotePath}`);
  const uploadResult = await uploadToSupabase(tempPath, remotePath);

  // 5. Limpiar archivo temporal
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }

  if (!uploadResult.success) {
    return { success: false, reason: 'upload_failed', error: uploadResult.error };
  }

  console.log(`   ✅ Subido correctamente`);
  console.log(`   🔗 URL: ${uploadResult.publicUrl}\n`);

  return {
    success: true,
    oldUrl: imageUrl,
    newUrl: uploadResult.publicUrl,
    remotePath
  };
}

/**
 * Extrae todas las URLs de imágenes de un post
 */
function extractImageUrls(post) {
  const urls = new Set();

  // 1. Featured image
  if (post.featured_image && post.featured_image.includes('/images/')) {
    urls.add(post.featured_image);
  }

  // 2. Imágenes en el contenido HTML - múltiples formatos
  if (post.content) {
    // Formato 1: /images/2025/12/29/nombre.png
    const imgRegex1 = /src=["']([^"']*\/images\/\d{4}\/\d{2}\/\d+\/[^"']+)["']/g;
    let match;
    while ((match = imgRegex1.exec(post.content)) !== null) {
      urls.add(match[1]);
    }
    
    // Formato 2: /images/furgocasa/blog/2025.12/nombre.png
    const imgRegex2 = /src=["']([^"']*\/images\/furgocasa\/blog\/\d{4}\.\d{2}\/[^"']+)["']/g;
    while ((match = imgRegex2.exec(post.content)) !== null) {
      urls.add(match[1]);
    }
  }

  // 3. Imágenes en el array images (JSONB)
  if (post.images && Array.isArray(post.images)) {
    post.images.forEach(img => {
      if (typeof img === 'string' && img.includes('/images/')) {
        urls.add(img);
      } else if (img.url && img.url.includes('/images/')) {
        urls.add(img.url);
      }
    });
  }

  return Array.from(urls);
}

/**
 * Actualiza un post reemplazando las URLs antiguas por las nuevas
 */
async function updatePost(postId, urlMappings) {
  if (urlMappings.length === 0) {
    console.log('   ℹ️  No hay URLs para actualizar\n');
    return { success: true, updated: false };
  }

  try {
    // Obtener el post actual
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return { success: false, error: 'Post no encontrado' };
    }

    let updated = false;
    let newContent = post.content;
    let newFeaturedImage = post.featured_image;

    // Reemplazar URLs
    urlMappings.forEach(({ oldUrl, newUrl }) => {
      // En featured_image
      if (post.featured_image === oldUrl) {
        newFeaturedImage = newUrl;
        updated = true;
      }

      // En content
      if (post.content && post.content.includes(oldUrl)) {
        newContent = newContent.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
        updated = true;
      }
    });

    if (!updated) {
      console.log('   ℹ️  No se necesitaron cambios\n');
      return { success: true, updated: false };
    }

    // Actualizar en Supabase
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        content: newContent,
        featured_image: newFeaturedImage,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    console.log('   ✅ Post actualizado en Supabase\n');
    return { success: true, updated: true };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Procesa un post completo
 */
async function processPost(post, index, total) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 POST ${index + 1}/${total}: ${post.title}`);
  console.log(`   Slug: ${post.slug}`);
  console.log(`   ID: ${post.id}`);
  console.log(`${'='.repeat(60)}\n`);

  // 1. Extraer URLs de imágenes
  const imageUrls = extractImageUrls(post);
  
  if (imageUrls.length === 0) {
    console.log('   ℹ️  Este post no tiene imágenes para migrar\n');
    return {
      postId: post.id,
      postTitle: post.title,
      imagesProcessed: 0,
      imagesSuccess: 0,
      imagesFailed: 0
    };
  }

  console.log(`   🖼️  Imágenes encontradas: ${imageUrls.length}`);
  imageUrls.forEach(url => console.log(`      - ${url}`));
  console.log();

  // 2. Procesar cada imagen
  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const imageUrl of imageUrls) {
    const result = await processImage(imageUrl, post.slug, post.published_at || post.created_at);
    results.push(result);
    
    if (result.success) {
      successCount++;
    } else {
      failCount++;
      console.log(`   ❌ Falló: ${result.reason} - ${result.error || ''}\n`);
    }
  }

  // 3. Actualizar post con las nuevas URLs
  const urlMappings = results
    .filter(r => r.success)
    .map(r => ({ oldUrl: r.oldUrl, newUrl: r.newUrl }));

  console.log(`   📝 Actualizando post en base de datos...`);
  const updateResult = await updatePost(post.id, urlMappings);

  if (!updateResult.success) {
    console.log(`   ❌ Error al actualizar: ${updateResult.error}\n`);
  }

  return {
    postId: post.id,
    postTitle: post.title,
    postSlug: post.slug,
    imagesProcessed: imageUrls.length,
    imagesSuccess: successCount,
    imagesFailed: failCount,
    updated: updateResult.updated
  };
}

// ==========================================
// PROCESO PRINCIPAL
// ==========================================

async function main() {
  try {
    // 1. Asumir que el bucket existe (ya verificado en UI)
    console.log(`📦 Usando bucket: ${BUCKET_NAME}\n`);

    // 2. Obtener posts de Supabase
    console.log(`📚 Obteniendo posts${LIMIT_POSTS ? ` (primeros ${LIMIT_POSTS})` : ''}...\n`);
    
    let query = supabase
      .from('posts')
      .select('id, title, slug, content, featured_image, images, status, published_at, created_at')
      .eq('post_type', 'blog')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (LIMIT_POSTS) {
      query = query.limit(LIMIT_POSTS);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      throw new Error(`Error al obtener posts: ${postsError.message}`);
    }

    console.log(`✅ ${posts.length} posts obtenidos\n`);

    if (posts.length === 0) {
      console.log('ℹ️  No hay posts para procesar');
      return;
    }

    // 3. Procesar cada post
    const results = [];
    
    for (let i = 0; i < posts.length; i++) {
      const result = await processPost(posts[i], i, posts.length);
      results.push(result);
    }

    // 4. Resumen final
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`Posts procesados: ${results.length}`);
    console.log(`Imágenes totales: ${results.reduce((sum, r) => sum + r.imagesProcessed, 0)}`);
    console.log(`Imágenes exitosas: ${results.reduce((sum, r) => sum + r.imagesSuccess, 0)}`);
    console.log(`Imágenes fallidas: ${results.reduce((sum, r) => sum + r.imagesFailed, 0)}`);
    console.log(`Posts actualizados: ${results.filter(r => r.updated).length}`);
    console.log('='.repeat(60));

    // Guardar log detallado
    const logPath = path.join(__dirname, `migration-log-${Date.now()}.json`);
    fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Log detallado guardado en: ${logPath}`);

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    process.exit(1);
  }
}

// Ejecutar
main().then(() => {
  console.log('\n✨ Proceso completado\n');
  process.exit(0);
});
