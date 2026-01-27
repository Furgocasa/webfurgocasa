const fs = require('fs');
const path = require('path');

// Archivos a modificar
const files = [
  'src/app/en/rent-campervan-motorhome/[location]/page.tsx',
  'src/app/fr/location-camping-car/[location]/page.tsx',
  'src/app/de/wohnmobil-mieten/[location]/page.tsx',
  'src/app/es/venta-autocaravanas-camper/[location]/page.tsx',
  'src/app/en/campervans-for-sale-in/[location]/page.tsx',
  'src/app/fr/camping-cars-a-vendre/[location]/page.tsx',
  'src/app/de/wohnmobile-zu-verkaufen/[location]/page.tsx'
];

const rootDir = path.join(__dirname, '..');

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Agregar import
  if (!content.includes('import { getLocationHeroImage }')) {
    content = content.replace(
      /import { LocationHeroWithSkeleton } from "@\/components\/locations\/location-hero-with-skeleton";/,
      `import { LocationHeroWithSkeleton } from "@/components/locations/location-hero-with-skeleton";\nimport { getLocationHeroImage } from "@/lib/locationImages";`
    );
  }
  
  // 2. Eliminar const DEFAULT_HERO_IMAGE
  content = content.replace(/\nconst DEFAULT_HERO_IMAGE = "\/images\/slides\/hero-06\.webp";\n/, '\n');
  
  // 3. Reemplazar uso en openGraph images
  content = content.replace(
    /images: \[{ url: location\.hero_image \|\| DEFAULT_HERO_IMAGE,/g,
    'images: [{ url: location.hero_image || getLocationHeroImage(slug),'
  );
  
  // 4. Reemplazar uso en heroImageUrl
  content = content.replace(
    /const heroImageUrl = location\.hero_image \|\| DEFAULT_HERO_IMAGE;/g,
    'const heroImageUrl = location.hero_image || getLocationHeroImage(location.slug);'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Actualizado: ${file}`);
});

console.log('\n✨ Todos los archivos actualizados correctamente');
