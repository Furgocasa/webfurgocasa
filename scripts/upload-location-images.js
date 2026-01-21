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
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Directorio de imágenes de lugares
const LOCAL_IMAGES_DIR = path.join(__dirname, '../furgocasa_images/fotos_lugares');
const BUCKET_NAME = 'media';
const REMOTE_FOLDER = 'locations';

console.log('🚀 Subiendo imágenes de lugares a Supabase Storage');
console.log('================================================\n');

// ==========================================
// FUNCIONES
// ==========================================

async function optimizeImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .resize(800, 600, { // Tamaño optimizado para las cards
        fit: 'cover',
        position: 'center'
      })
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

// ==========================================
// PROCESO PRINCIPAL
// ==========================================

async function main() {
  try {
    // Obtener todos los archivos de imagen
    const files = fs.readdirSync(LOCAL_IMAGES_DIR)
      .filter(f => f.match(/\.(jpg|jpeg|png)$/i));

    console.log(`📁 Encontrados ${files.length} archivos de imagen\n`);

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      console.log(`📸 Procesando: ${file}`);
      
      const inputPath = path.join(LOCAL_IMAGES_DIR, file);
      const basename = path.basename(file, path.extname(file));
      const remotePath = `${REMOTE_FOLDER}/${basename}.webp`;
      const tempPath = path.join(__dirname, `temp_${basename}.webp`);

      // Optimizar
      console.log(`   🔧 Optimizando...`);
      const optimizeResult = await optimizeImage(inputPath, tempPath);
      
      if (!optimizeResult.success) {
        console.log(`   ❌ Error optimizando: ${optimizeResult.error}\n`);
        failCount++;
        continue;
      }

      const sizeKB = (optimizeResult.size / 1024).toFixed(2);
      console.log(`   ✓ Optimizado (${sizeKB} KB)`);

      // Subir
      console.log(`   ☁️  Subiendo a Supabase...`);
      const uploadResult = await uploadToSupabase(tempPath, remotePath);

      // Limpiar temporal
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      if (!uploadResult.success) {
        console.log(`   ❌ Error subiendo: ${uploadResult.error}\n`);
        failCount++;
        continue;
      }

      console.log(`   ✅ Subido correctamente`);
      console.log(`   🔗 ${uploadResult.publicUrl}\n`);
      successCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`Archivos procesados: ${files.length}`);
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Fallidos: ${failCount}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    process.exit(1);
  }
}

main().then(() => {
  console.log('\n✨ Proceso completado\n');
  process.exit(0);
});
