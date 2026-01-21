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
const BUCKET_PATH = 'slides'; // Carpeta dentro del bucket media

console.log('🚀 Iniciando subida de imágenes de slides a Supabase Storage');
console.log('================================================');
console.log(`📁 Origen: ${SLIDES_DIR}`);
console.log(`📦 Destino: ${BUCKET_NAME}/${BUCKET_PATH}/`);
console.log('================================================\n');

/**
 * Optimiza imagen para hero slides
 */
async function optimizeSlideImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSizeKB = (stats.size / 1024).toFixed(2);
    
    await sharp(inputPath)
      .webp({
        quality: 90, // Alta calidad para heroes
        effort: 6
      })
      .resize(1920, 1080, {
        fit: 'cover',
        position: 'center'
      })
      .toFile(outputPath);
    
    const newStats = fs.statSync(outputPath);
    const newSizeKB = (newStats.size / 1024).toFixed(2);
    
    console.log(`   ✓ Optimizado: ${originalSizeKB} KB → ${newSizeKB} KB`);
    
    return {
      success: true,
      size: newStats.size
    };
  } catch (error) {
    console.error(`   ❌ Error al optimizar: ${error.message}`);
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

async function main() {
  try {
    // Leer archivos del directorio
    const files = fs.readdirSync(SLIDES_DIR)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      })
      .filter(file => file.includes('furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_'));

    console.log(`📸 Encontradas ${files.length} imágenes de ciudades\n`);

    let successCount = 0;
    let failCount = 0;
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`\n[${i + 1}/${files.length}] Procesando: ${file}`);
      
      const inputPath = path.join(SLIDES_DIR, file);
      const outputName = path.basename(file, path.extname(file)) + '.webp';
      const tempPath = path.join(__dirname, `temp_slide_${outputName}`);
      
      // Optimizar
      console.log(`   🔧 Optimizando...`);
      const optimizeResult = await optimizeSlideImage(inputPath, tempPath);
      
      if (!optimizeResult.success) {
        console.log(`   ❌ Error al optimizar`);
        failCount++;
        continue;
      }
      
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
        
        // Extraer nombre de ciudad del archivo
        const cityMatch = file.match(/rent_(.+)\.(jpg|jpeg|png|webp)$/i);
        if (cityMatch) {
          const citySlug = cityMatch[1].replace(/_/g, ' ');
          uploadedImages.push({
            city: citySlug,
            filename: outputName,
            url: uploadResult.publicUrl
          });
        }
      } else {
        console.log(`   ❌ Error al subir: ${uploadResult.error}`);
        failCount++;
      }
    }

    // Resumen
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 RESUMEN');
    console.log('='.repeat(60));
    console.log(`Total procesadas: ${files.length}`);
    console.log(`✅ Exitosas: ${successCount}`);
    console.log(`❌ Fallidas: ${failCount}`);
    console.log('='.repeat(60));

    // Guardar log de URLs
    const logPath = path.join(__dirname, 'uploaded-slides-log.json');
    fs.writeFileSync(logPath, JSON.stringify(uploadedImages, null, 2));
    console.log(`\n📄 Log guardado en: ${logPath}`);

    // Generar código de mapeo para copiar y pegar
    console.log('\n\n' + '='.repeat(60));
    console.log('📝 CÓDIGO PARA USAR EN getLocationHeroImage():');
    console.log('='.repeat(60));
    console.log(`
const LOCATION_HERO_IMAGES: Record<string, string> = {`);
    
    uploadedImages.slice(0, 20).forEach(img => {
      const cityName = img.city
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      console.log(`  "${cityName}": "${img.url}",`);
    });
    
    console.log(`  // ... resto de ciudades
};`);

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    process.exit(1);
  }
}

main().then(() => {
  console.log('\n✨ Proceso completado\n');
  process.exit(0);
});
