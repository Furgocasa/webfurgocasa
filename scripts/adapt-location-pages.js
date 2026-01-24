const fs = require('fs');
const path = require('path');

// Configuración de páginas por idioma y tipo
const pages = {
  es: {
    rent: { folder: 'alquiler-autocaravanas-campervans-[location]', locale: 'es', type: 'rent' },
    sale: { folder: 'venta-autocaravanas-camper-[location]', locale: 'es', type: 'sale' }
  },
  en: {
    rent: { folder: 'rent-campervan-motorhome-[location]', locale: 'en', type: 'rent' },
    sale: { folder: 'campervans-for-sale-in-[location]', locale: 'en', type: 'sale' }
  },
  fr: {
    rent: { folder: 'location-camping-car-[location]', locale: 'fr', type: 'rent' },
    sale: { folder: 'camping-cars-a-vendre-[location]', locale: 'fr', type: 'sale' }
  },
  de: {
    rent: { folder: 'wohnmobil-mieten-[location]', locale: 'de', type: 'rent' },
    sale: { folder: 'wohnmobile-zu-verkaufen-[location]', locale: 'de', type: 'sale' }
  }
};

function adaptPageFile(locale, type, config) {
  const filePath = path.join(__dirname, '..', 'src', 'app', locale, config.folder, 'page.tsx');
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ No existe: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Remover export dynamic = 'force-dynamic' (ya no necesitamos headers)
  content = content.replace(/export const dynamic = 'force-dynamic';.*\n/g, '');
  
  // 2. Remover imports de headers
  content = content.replace(/import \{ headers \} from "next\/headers";\n/g, '');
  
  // 3. Remover todas las funciones helper que ya no necesitamos
  const helpersToRemove = [
    'getPageKind',
    'extractRentSlug',
    'extractSaleSlug',
    'detectLocale',
    'getLocaleFromHeaders'
  ];
  
  helpersToRemove.forEach(funcName => {
    // Remover función completa (desde 'function' o 'async function' hasta el cierre '}')
    const funcRegex = new RegExp(`(async )?function ${funcName}\\([^)]*\\)[^{]*\\{[\\s\\S]*?\\n\\}\\n`, 'g');
    content = content.replace(funcRegex, '');
  });
  
  // 4. Remover tipo PageKind y comentarios obsoletos
  content = content.replace(/type PageKind = .*;\n/g, '');
  content = content.replace(/\/\/ ============================================================================\n\/\/ NOTA: Esta página se sirve via rewrite desde el middleware[\s\S]*?\/\/ ============================================================================\n/g, '');
  content = content.replace(/\/\/ ============================================================================\n\/\/ HELPERS - Detección de tipo de página y extracción de slug\n\/\/ ============================================================================\n/g, '');
  
  // 5. Adaptar generateMetadata para usar params directamente
  const isRent = type === 'rent';
  const newMetadataSignature = `interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location: slug } = await params;
  const locale: Locale = '${locale}';`;
  
  content = content.replace(
    /export async function generateMetadata\(\): Promise<Metadata> \{[\s\S]*?const headersList = await headers\(\);[\s\S]*?const locationParam = headersList\.get\('x-location-param'\);[\s\S]*?if \(!locationParam\) \{[\s\S]*?\}[\s\S]*?const kind = getPageKind\(locationParam\);[\s\S]*?const locale = await getLocaleFromHeaders\(\) \|\| detectLocale\(locationParam\);/,
    newMetadataSignature
  );
  
  // 6. Mantener solo la lógica del tipo correcto (rent o sale) en generateMetadata
  if (isRent) {
    // Remover bloque de "sale"
    content = content.replace(/\n  if \(kind === "sale"\) \{[\s\S]*?\n  \}/g, '');
    // Remover "if (kind === "rent")" y dejarlo directo
    content = content.replace(/if \(kind === "rent"\) \{\n    const slug = extractRentSlug\(locationParam\);/, '');
  } else {
    // Remover bloque de "rent"
    content = content.replace(/\n  if \(kind === "rent"\) \{[\s\S]*?\n  \}/g, '');
    // Remover "if (kind === "sale")" y dejarlo directo
    content = content.replace(/if \(kind === "sale"\) \{\n    const slug = extractSaleSlug\(locationParam\);/, '');
  }
  
  // 7. Remover el return final de "Página no encontrada"
  content = content.replace(/\n  return \{ title: "Página no encontrada", robots: \{ index: false, follow: false \} \};\n\}/g, '\n}');
  
  // 8. Adaptar función principal (default export)
  const newMainSignature = `export default async function LocationPage({ params }: PageProps) {
  const { location: slug } = await params;
  const locale: Locale = '${locale}';`;
  
  content = content.replace(
    /export default async function LocationPage\(\) \{[\s\S]*?const headersList = await headers\(\);[\s\S]*?const locationParam = headersList\.get\('x-location-param'\);[\s\S]*?if \(!locationParam\) \{[\s\S]*?\}[\s\S]*?const kind = getPageKind\(locationParam\);[\s\S]*?if \(kind === "unknown"\) \{[\s\S]*?\}[\s\S]*?const locale = await getLocaleFromHeaders\(\) \|\| detectLocale\(locationParam\);/,
    newMainSignature
  );
  
  // 9. Simplificar el cuerpo principal (solo una rama: rent o sale)
  if (isRent) {
    // Remover bloque completo de sale y el notFound final
    content = content.replace(/\n  \/\/ \[RESTO DE LA IMPLEMENTACIÓN PARA "sale"...\][\s\S]*?notFound\(\);\n\}/g, '\n}');
    // Remover "if (kind === "rent")" y "const slug = extractRentSlug"
    content = content.replace(/if \(kind === "rent"\) \{\n    const slug = extractRentSlug\(locationParam\);/, '');
    // Cerrar el bloque correctamente
    content = content.replace(/\n  \}\n\n  \/\/ \[RESTO DE LA IMPLEMENTACIÓN PARA "sale"...\]/, '');
  } else {
    // Para sale, remover bloque de rent
    content = content.replace(/\/\/ ============================================================================\n  \/\/ RENDERIZAR PÁGINA DE ALQUILER[\s\S]*?\n  \/\/ \[RESTO DE LA IMPLEMENTACIÓN PARA "sale"...\]\n  \n  notFound\(\);/g, '');
    content = content.replace(/if \(kind === "sale"\) \{\n    const slug = extractSaleSlug\(locationParam\);/, '');
  }
  
  // 10. Limpiar llaves sobrantes y espacios
  content = content.replace(/\n  \}\n\n  notFound\(\);\n\}/g, '\n}');
  
  // Guardar archivo adaptado
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Adaptado: ${locale}/${config.folder} (${type})`);
}

console.log('🚀 Adaptando páginas [location] para nueva arquitectura...\n');

Object.entries(pages).forEach(([locale, types]) => {
  Object.entries(types).forEach(([type, config]) => {
    adaptPageFile(locale, type, config);
  });
});

console.log('\n✅ ¡Todas las páginas [location] adaptadas!');
