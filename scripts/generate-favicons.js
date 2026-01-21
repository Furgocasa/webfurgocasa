/**
 * Script para generar todos los tamaños de favicon necesarios para Google y PWA
 * 
 * Uso:
 * 1. Instalar sharp si no está instalado: npm install sharp --save-dev
 * 2. Ejecutar: node scripts/generate-favicons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuración
const sourceIcon = path.join(__dirname, '../src/app/icon.png');
const publicDir = path.join(__dirname, '../public');

// Tamaños necesarios para PWA y Google
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateFavicons() {
  console.log('🎨 Generando favicons en múltiples tamaños...\n');
  
  // Verificar que el icono fuente existe
  if (!fs.existsSync(sourceIcon)) {
    console.error('❌ Error: No se encuentra el archivo fuente src/app/icon.png');
    process.exit(1);
  }

  try {
    // Generar iconos PNG en múltiples tamaños
    console.log('📱 Generando iconos PWA...');
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ quality: 95, compressionLevel: 9 })
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      console.log(`  ✅ icon-${size}x${size}.png (${(stats.size / 1024).toFixed(2)} KB)`);
    }

    // Generar favicon.ico (multi-tamaño: 16x16, 32x32, 48x48)
    console.log('\n🌐 Generando favicon.ico...');
    const icoPath = path.join(publicDir, 'favicon.ico');
    
    // Crear un favicon.ico básico de 48x48
    await sharp(sourceIcon)
      .resize(48, 48, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(icoPath.replace('.ico', '-temp.png'));

    // Renombrar como .ico (simplificado - para multi-tamaño real se necesitaría una librería adicional)
    fs.renameSync(icoPath.replace('.ico', '-temp.png'), icoPath);
    
    const icoStats = fs.statSync(icoPath);
    console.log(`  ✅ favicon.ico (${(icoStats.size / 1024).toFixed(2)} KB)`);

    // Copiar icon.png a public para el manifest.json
    const publicIconPath = path.join(publicDir, 'icon.png');
    await sharp(sourceIcon)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 95 })
      .toFile(publicIconPath);
    
    const iconStats = fs.statSync(publicIconPath);
    console.log(`  ✅ icon.png (${(iconStats.size / 1024).toFixed(2)} KB)`);

    // Copiar apple-icon.png
    const appleIconPath = path.join(publicDir, 'apple-icon.png');
    await sharp(sourceIcon)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 95 })
      .toFile(appleIconPath);
    
    const appleStats = fs.statSync(appleIconPath);
    console.log(`  ✅ apple-icon.png (${(appleStats.size / 1024).toFixed(2)} KB)`);

    console.log('\n✅ ¡Todos los favicons generados correctamente!\n');
    console.log('📋 Archivos generados:');
    console.log('  - public/favicon.ico (navegadores legacy + Google)');
    console.log('  - public/icon.png (favicon principal)');
    console.log('  - public/apple-icon.png (dispositivos Apple)');
    console.log('  - public/icon-72x72.png hasta icon-512x512.png (PWA)');
    console.log('\n🚀 Próximos pasos:');
    console.log('  1. Verificar que todos los archivos están en public/');
    console.log('  2. Hacer build del proyecto: npm run build');
    console.log('  3. Desplegar a producción');
    console.log('  4. Solicitar indexación en Google Search Console');
    console.log('  5. Esperar 24-48 horas para que Google indexe el favicon');

  } catch (error) {
    console.error('❌ Error generando favicons:', error);
    process.exit(1);
  }
}

// Ejecutar
generateFavicons().catch(console.error);
