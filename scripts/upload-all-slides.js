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

const SLIDES_DIR = path.join(__dirname, '../furgocasa_images/slides');
const BUCKET_NAME = 'media';
const BUCKET_PATH = 'slides';

console.log('🚀 Subiendo TODAS las imágenes de slides a Supabase Storage');
console.log('='.repeat(70));
console.log(`📁 Origen: ${SLIDES_DIR}`);
console.log(`📦 Destino: ${BUCKET_NAME}/${BUCKET_PATH}/`);
console.log('='.repeat(70) + '\n');

/**
 * Optimiza imagen para hero slides
 */
async function optimizeSlideImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSizeKB = (stats.size / 1024).toFixed(2);
    
    await sharp(inputPath)
      .webp({
        quality: 90,
        effort: 6
      })
      .resize(1920, 1080, {
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
async function uploadToSupabase(localPath, remoteName) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const remotePath = `${BUCKET_PATH}/${remoteName}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(remotePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) {
      return { success: false, error: error.message };
    }

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

async function main() {
  try {
    // Leer TODOS los archivos de imagen del directorio
    const files = fs.readdirSync(SLIDES_DIR)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      })
      .sort(); // Ordenar alfabéticamente

    console.log(`📸 Encontradas ${files.length} imágenes en total\n`);

    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n[${i + 1}/${files.length}] Procesando: ${file}`);
      
      const inputPath = path.join(SLIDES_DIR, file);
      
      // Generar nombre de salida: mantener nombre original pero cambiar a .webp
      const baseName = path.basename(file, path.extname(file));
      const outputName = `${baseName}.webp`;
      const tempPath = path.join(__dirname, `temp_slide_${Date.now()}.webp`);
      
      // Si ya es webp y tiene buen tamaño, verificar si ya existe en Supabase
      if (path.extname(file).toLowerCase() === '.webp') {
        const stats = fs.statSync(inputPath);
        const sizeKB = stats.size / 1024;
        
        // Si es menor de 2MB, subir directamente sin re-optimizar
        if (sizeKB < 2048) {
          console.log(`   ℹ️  Ya es WebP optimizado (${sizeKB.toFixed(0)} KB)`);
          console.log(`   ☁️  Subiendo directamente...`);
          
          const uploadResult = await uploadToSupabase(inputPath, outputName);
          
          if (uploadResult.success) {
            console.log(`   ✅ Subido correctamente`);
            console.log(`   🔗 ${uploadResult.publicUrl}`);
            successCount++;
            uploadedImages.push({
              original: file,
              uploaded: outputName,
              url: uploadResult.publicUrl
            });
          } else {
            console.log(`   ❌ Error al subir: ${uploadResult.error}`);
            failCount++;
          }
          continue;
        }
      }
      
      // Optimizar imagen
      console.log(`   🔧 Optimizando a 1920x1080 WebP 90%...`);
      const optimizeResult = await optimizeSlideImage(inputPath, tempPath);
      
      if (!optimizeResult.success) {
        console.log(`   ❌ Error al optimizar: ${optimizeResult.error}`);
        failCount++;
        continue;
      }
      
      console.log(`   ✓ Optimizado: ${optimizeResult.originalSize} KB → ${optimizeResult.newSize} KB`);
      
      // Subir
      console.log(`   ☁️  Subiendo a Supabase...`);
      const uploadResult = await uploadToSupabase(tempPath, outputName);
      
      // Limpiar temporal
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      if (uploadResult.success) {
        console.log(`   ✅ Subido correctamente`);
        console.log(`   🔗 ${uploadResult.publicUrl}`);
        successCount++;
        uploadedImages.push({
          original: file,
          uploaded: outputName,
          url: uploadResult.publicUrl
        });
      } else {
        console.log(`   ❌ Error al subir: ${uploadResult.error}`);
        failCount++;
      }
    }

    // Resumen
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(70));
    console.log(`Total archivos encontrados: ${files.length}`);
    console.log(`✅ Subidas exitosamente: ${successCount}`);
    console.log(`❌ Errores: ${failCount}`);
    console.log('='.repeat(70));

    // Guardar log de URLs
    const logPath = path.join(__dirname, 'all-slides-uploaded.json');
    fs.writeFileSync(logPath, JSON.stringify(uploadedImages, null, 2));
    console.log(`\n📄 Log completo guardado en: ${logPath}`);

    // Listar las primeras 10 URLs para usar en el slider de la home
    console.log('\n\n' + '='.repeat(70));
    console.log('🎨 IMÁGENES DISPONIBLES PARA EL SLIDER DE LA HOME:');
    console.log('='.repeat(70));
    console.log('\nPrimeras 10 imágenes:');
    uploadedImages.slice(0, 10).forEach((img, idx) => {
      console.log(`${idx + 1}. ${img.original}`);
      console.log(`   → ${img.url}\n`);
    });

    console.log('\n✨ ¡Todas las imágenes están ahora en Supabase Storage!');
    console.log('📁 Ubicación: media/slides/');
    console.log(`🔗 Base URL: https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/\n`);

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
