const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Cargar variables de .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const STORAGE_BASE_URL = 'https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/blog';

console.log('🚀 Subiendo automáticamente las 41 imágenes de portada encontradas...\n');

/**
 * Optimiza imagen para featured image
 */
async function optimizeImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSizeKB = (stats.size / 1024).toFixed(2);
    
    await sharp(inputPath)
      .webp({
        quality: 90, // Alta calidad para featured images
        effort: 6
      })
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);
    
    const newStats = fs.statSync(outputPath);
    const newSizeKB = (newStats.size / 1024).toFixed(2);
    
    return {
      success: true,
      originalSize: originalSizeKB,
      newSize: newSizeKB
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
async function uploadToSupabase(localPath, year, month, filename) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const remotePath = `${year}/${month}/${filename}`;
    
    const { data, error } = await supabase.storage
      .from('blog')
      .upload(remotePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const publicUrl = `${STORAGE_BASE_URL}/${remotePath}`;

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
 * Actualiza featured_image en la base de datos
 */
async function updatePostFeaturedImage(postId, newUrl) {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ featured_image: newUrl })
      .eq('id', postId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extrae año y mes de la fecha de publicación del post
 */
async function getPostDate(postId) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('published_at, created_at')
      .eq('id', postId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    const date = new Date(data.published_at || data.created_at);
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, '0')
    };
  } catch (error) {
    return null;
  }
}

async function main() {
  try {
    // Leer el JSON con las imágenes encontradas
    const analysisPath = path.join(__dirname, '../ANALISIS-IMAGENES-PORTADA.json');
    
    if (!fs.existsSync(analysisPath)) {
      console.error('❌ No se encontró ANALISIS-IMAGENES-PORTADA.json');
      console.error('   Ejecuta primero: node scripts/analyze-featured-images-locally.js');
      process.exit(1);
    }

    const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
    const imagesToUpload = analysisData.imagenes_encontradas;

    console.log(`📊 Total de imágenes a subir: ${imagesToUpload.length}\n`);

    let uploadedCount = 0;
    let errorCount = 0;
    const results = [];

    // Crear directorio temporal para imágenes optimizadas
    const tempDir = path.join(__dirname, 'temp_featured');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    for (let i = 0; i < imagesToUpload.length; i++) {
      const item = imagesToUpload[i];
      console.log(`\n[${i + 1}/${imagesToUpload.length}] ${item.title}`);
      console.log(`   📁 Archivo local: ${item.localRelativePath}`);
      
      // Obtener fecha del post
      const postDate = await getPostDate(item.id);
      
      if (!postDate) {
        console.log('   ❌ No se pudo obtener fecha del post');
        errorCount++;
        results.push({
          ...item,
          status: 'error',
          reason: 'No se pudo obtener fecha del post'
        });
        continue;
      }
      
      console.log(`   📅 Fecha del post: ${postDate.year}/${postDate.month}`);
      
      // Optimizar imagen
      const tempFilename = `featured_${Date.now()}.webp`;
      const tempPath = path.join(tempDir, tempFilename);
      
      console.log('   🔧 Optimizando imagen...');
      const optimizeResult = await optimizeImage(item.localPath, tempPath);
      
      if (!optimizeResult.success) {
        console.log(`   ❌ Error al optimizar: ${optimizeResult.error}`);
        errorCount++;
        results.push({
          ...item,
          status: 'error',
          reason: `Error al optimizar: ${optimizeResult.error}`
        });
        continue;
      }
      
      console.log(`   ✓ Optimizado: ${optimizeResult.originalSize} KB → ${optimizeResult.newSize} KB`);
      
      // Subir a Supabase
      const uploadFilename = `featured_${item.slug}.webp`;
      console.log(`   ☁️  Subiendo a Supabase: blog/${postDate.year}/${postDate.month}/${uploadFilename}`);
      
      const uploadResult = await uploadToSupabase(tempPath, postDate.year, postDate.month, uploadFilename);
      
      // Limpiar temporal
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      if (!uploadResult.success) {
        console.log(`   ❌ Error al subir: ${uploadResult.error}`);
        errorCount++;
        results.push({
          ...item,
          status: 'error',
          reason: `Error al subir: ${uploadResult.error}`
        });
        continue;
      }
      
      console.log(`   ✅ Subida correcta: ${uploadResult.publicUrl}`);
      
      // Actualizar base de datos
      console.log('   💾 Actualizando base de datos...');
      const updateResult = await updatePostFeaturedImage(item.id, uploadResult.publicUrl);
      
      if (!updateResult.success) {
        console.log(`   ❌ Error al actualizar BD: ${updateResult.error}`);
        errorCount++;
        results.push({
          ...item,
          status: 'uploaded_but_not_updated',
          new_url: uploadResult.publicUrl,
          reason: `Subida OK pero error al actualizar BD: ${updateResult.error}`
        });
        continue;
      }
      
      console.log('   ✅ ¡Todo completado correctamente!');
      uploadedCount++;
      results.push({
        ...item,
        status: 'success',
        new_url: uploadResult.publicUrl
      });
    }

    // Limpiar directorio temporal
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }

    // Resumen
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(70));
    console.log(`Total procesadas: ${imagesToUpload.length}`);
    console.log(`✅ Completadas correctamente: ${uploadedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log('='.repeat(70));

    // Guardar log
    const logPath = path.join(__dirname, 'upload-featured-images-log.json');
    const logData = {
      fecha: new Date().toISOString(),
      total: imagesToUpload.length,
      exitosas: uploadedCount,
      errores: errorCount,
      resultados: results
    };
    
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    console.log(`\n📄 Log guardado en: ${logPath}`);

    if (uploadedCount > 0) {
      console.log('\n✨ ¡Proceso completado con éxito!');
      console.log(`\n🎉 ${uploadedCount} posts ahora tienen su imagen de portada en Supabase Storage`);
      console.log('\n📋 Siguiente paso:');
      console.log('   Ejecuta: node scripts/list-posts-without-featured-image.js');
      console.log('   Para ver cuántos posts quedan sin imagen');
    }

    if (errorCount > 0) {
      console.log(`\n⚠️  Hubo ${errorCount} errores. Revisa el log para más detalles.`);
    }

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main().then(() => {
  console.log('\n✨ Proceso completado\n');
  process.exit(0);
});
