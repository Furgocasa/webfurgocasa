/**
 * Script para remover Header/Footer de las páginas públicas
 * Ya que ahora están en el layout.tsx global
 * 
 * Este script:
 * 1. Remueve imports de Header y Footer
 * 2. Remueve los elementos <Header /> y <Footer /> del JSX
 * 3. Remueve padding-top compensatorio (pt-24, pt-28, pt-32) de main/section
 * 4. Limpia fragmentos vacíos si es necesario
 */

const fs = require('fs');
const path = require('path');

// Páginas que NO deben modificarse (admin pages, etc.)
const EXCLUDE_PATTERNS = [
  '/administrator/',
  '/admin/',
];

// Lista de archivos a procesar
const files = [
  'src/app/page.tsx',
  'src/app/buscar/page.tsx',
  'src/app/reservar/page.tsx',
  'src/app/reservar/vehiculo/page.tsx',
  'src/app/reservar/nueva/page.tsx',
  'src/app/reservar/[id]/page.tsx',
  'src/app/reservar/[id]/pago/page.tsx',
  'src/app/reservar/[id]/confirmacion/page.tsx',
  'src/app/vehiculos/page.tsx',
  'src/app/vehiculos/[slug]/page.tsx',
  'src/app/contacto/page.tsx',
  'src/app/blog/page.tsx',
  'src/app/blog/[category]/page.tsx',
  'src/app/blog/[category]/[slug]/page.tsx',
  'src/app/alquiler-autocaravanas-campervans-[location]/page.tsx',
  'src/app/[location]/page.tsx',
  'src/app/alquiler-[city]/page.tsx',
  'src/app/quienes-somos/page.tsx',
  'src/app/tarifas/page.tsx',
  'src/app/ofertas/page.tsx',
  'src/app/faqs/page.tsx',
  'src/app/faqs/[slug]/page.tsx',
  'src/app/guia-camper/page.tsx',
  'src/app/ventas/page.tsx',
  'src/app/ventas/[slug]/page.tsx',
  'src/app/ventas/videos/page.tsx',
  'src/app/venta-autocaravanas-camper-[location]/page.tsx',
  'src/app/cookies/page.tsx',
  'src/app/privacidad/page.tsx',
  'src/app/aviso-legal/page.tsx',
  'src/app/pago/exito/page.tsx',
  'src/app/pago/error/page.tsx',
  'src/app/video-tutoriales/page.tsx',
  'src/app/parking-murcia/page.tsx',
  'src/app/mapa-areas/page.tsx',
  'src/app/inteligencia-artificial/page.tsx',
  'src/app/documentacion-alquiler/page.tsx',
  'src/app/como-reservar-fin-semana/page.tsx',
  'src/app/clientes-vip/page.tsx',
  'src/app/sitemap-html/page.tsx',
];

function processFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  No existe: ${filePath}`);
    return { processed: false, reason: 'not_found' };
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // 1. Remover import de Header
  const headerImportRegex = /import\s*{\s*Header\s*}\s*from\s*["']@\/components\/layout\/header["'];?\s*\n?/g;
  if (headerImportRegex.test(content)) {
    content = content.replace(headerImportRegex, '');
    modified = true;
  }
  
  // 2. Remover import de Footer
  const footerImportRegex = /import\s*{\s*Footer\s*}\s*from\s*["']@\/components\/layout\/footer["'];?\s*\n?/g;
  if (footerImportRegex.test(content)) {
    content = content.replace(footerImportRegex, '');
    modified = true;
  }
  
  // 3. Remover <Header /> (con posibles espacios y saltos de línea)
  const headerElementRegex = /\s*<Header\s*\/>\s*\n?/g;
  if (headerElementRegex.test(content)) {
    content = content.replace(headerElementRegex, '\n');
    modified = true;
  }
  
  // 4. Remover <Footer /> (con posibles espacios y saltos de línea)
  const footerElementRegex = /\s*<Footer\s*\/>\s*\n?/g;
  if (footerElementRegex.test(content)) {
    content = content.replace(footerElementRegex, '\n');
    modified = true;
  }
  
  // 5. Remover padding-top compensatorio del main
  // Patrones: pt-20, pt-24, pt-28, pt-32 (y sus versiones md:)
  content = content.replace(
    /(<main[^>]*className="[^"]*)\s*pt-(?:20|24|28|32)\s*md:pt-(?:20|24|28|32)/g,
    '$1'
  );
  content = content.replace(
    /(<main[^>]*className="[^"]*)\s*pt-(?:20|24|28|32)/g,
    '$1'
  );
  
  // 6. Remover padding-top compensatorio de section (solo la primera)
  content = content.replace(
    /(<section[^>]*className="[^"]*)\s*pt-(?:20|24|28|32)\s*md:pt-(?:20|24|28|32)/g,
    '$1'
  );
  
  // 7. Limpiar espacios múltiples en className
  content = content.replace(/className="([^"]*)\s{2,}([^"]*)"/g, 'className="$1 $2"');
  content = content.replace(/className="\s+/g, 'className="');
  content = content.replace(/\s+"/g, '"');
  
  // 8. Limpiar líneas vacías múltiples (máximo 2 seguidas)
  content = content.replace(/\n{4,}/g, '\n\n\n');
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Procesado: ${filePath}`);
    return { processed: true, reason: 'modified' };
  } else {
    console.log(`ℹ️  Sin cambios: ${filePath}`);
    return { processed: false, reason: 'no_changes' };
  }
}

console.log('🔧 Removiendo Header/Footer de las páginas...\n');
console.log('=' .repeat(60));

let processed = 0;
let noChanges = 0;
let notFound = 0;

files.forEach(file => {
  const result = processFile(file);
  if (result.processed) processed++;
  else if (result.reason === 'no_changes') noChanges++;
  else if (result.reason === 'not_found') notFound++;
});

console.log('=' .repeat(60));
console.log('\n📊 Resumen:');
console.log(`✅ Modificados: ${processed}`);
console.log(`ℹ️  Sin cambios: ${noChanges}`);
console.log(`⚠️  No encontrados: ${notFound}`);
console.log(`📁 Total procesados: ${files.length}`);
