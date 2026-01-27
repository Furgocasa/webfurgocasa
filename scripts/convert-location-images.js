const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../images/slides web');
const TARGET_DIR = path.join(__dirname, '../public/images/locations');

// Crear directorio si no existe
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Obtener todos los archivos JPG
const files = fs.readdirSync(SOURCE_DIR).filter(file => file.endsWith('.jpg'));

console.log(`📸 Encontrados ${files.length} archivos JPG`);
console.log('🔄 Convirtiendo a WebP optimizado...\n');

let processed = 0;
let errors = 0;

// Procesar cada archivo
Promise.all(
  files.map(async (file) => {
    try {
      const inputPath = path.join(SOURCE_DIR, file);
      const outputFile = file.replace('.jpg', '.webp');
      const outputPath = path.join(TARGET_DIR, outputFile);

      await sharp(inputPath)
        .resize(1920, null, { // Max width 1920px, altura proporcional
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ 
          quality: 75, // Calidad alta pero optimizada
          effort: 6    // Más compresión (0-6, 6 es más lento pero mejor compresión)
        })
        .toFile(outputPath);

      const originalSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

      console.log(`✅ ${file}`);
      console.log(`   → ${outputFile}`);
      console.log(`   📊 ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(newSize / 1024 / 1024).toFixed(2)} MB (${savings}% reducción)\n`);
      
      processed++;
    } catch (error) {
      console.error(`❌ Error procesando ${file}:`, error.message);
      errors++;
    }
  })
).then(() => {
  console.log('\n' + '='.repeat(60));
  console.log(`✨ Conversión completada`);
  console.log(`   ✅ Procesados: ${processed}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📁 Guardados en: ${TARGET_DIR}`);
  console.log('='.repeat(60));
});
