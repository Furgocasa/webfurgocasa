const sharp = require('sharp');
const path = require('path');

async function optimizeOGImage() {
  const inputPath = path.join(__dirname, '../public/opengraph-image.jpg');
  const outputPath = path.join(__dirname, '../src/app/ventas/opengraph-image.jpg');
  
  try {
    await sharp(inputPath)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    
    console.log('✅ OpenGraph image optimized successfully for /ventas');
  } catch (error) {
    console.error('❌ Error optimizing image:', error);
    process.exit(1);
  }
}

optimizeOGImage();
