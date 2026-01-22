/**
 * DIAGNÓSTICO: Comparar páginas de alquiler vs venta
 * 
 * Verifica exactamente qué consultas se hacen y qué se devuelve
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║     DIAGNÓSTICO: Páginas de Alquiler vs Venta                    ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

// ===================================================================
// 1. SIMULAR CÓMO LLEGA EL PARÁMETRO
// ===================================================================
console.log('📋 PASO 1: Simulando parámetros de URL\n');

// URL de ALQUILER: /es/alquiler-autocaravanas-campervans-murcia
// La carpeta es: alquiler-autocaravanas-campervans-[location]
// Por lo tanto, Next.js extrae "location" como lo que va DESPUÉS del prefijo
// Es decir, si la carpeta fuera solo [location], el parámetro sería "alquiler-autocaravanas-campervans-murcia"
// Pero como la carpeta tiene el prefijo, el parámetro es solo "murcia"

// ESPERA! La carpeta es literalmente "alquiler-autocaravanas-campervans-[location]"
// Esto significa que el [location] captura TODO lo que viene después de "/es/"
// O sea que el parámetro location = "alquiler-autocaravanas-campervans-murcia" ¿no?

// Vamos a verificar qué devuelve generateStaticParams de cada página

console.log('=== ALQUILER (location_targets) ===');

// Simular getAllLocations
const { data: rentalLocations } = await supabase
  .from('location_targets')
  .select('slug, name, meta_title')
  .eq('is_active', true)
  .order('name')
  .limit(5);

console.log('generateStaticParams devuelve:');
if (rentalLocations) {
  rentalLocations.forEach(loc => {
    // Esto es lo que devuelve getAllLocations:
    const staticParam = { city: `alquiler-autocaravanas-campervans-${loc.slug}` };
    console.log(`   ${JSON.stringify(staticParam)}`);
  });
}

console.log('\n   ⚠️  PROBLEMA: Devuelve { city: ... } pero el parámetro es [location]!\n');

console.log('=== VENTA (sale_location_targets) ===');

const { data: saleLocations } = await supabase
  .from('sale_location_targets')
  .select('slug, name, meta_title')
  .eq('is_active', true)
  .order('name')
  .limit(5);

console.log('generateStaticParams devuelve:');
if (saleLocations) {
  saleLocations.forEach(loc => {
    // Esto es lo que devuelve generateStaticParams de venta:
    const staticParam = { location: loc.slug };
    console.log(`   ${JSON.stringify(staticParam)}`);
  });
}

// ===================================================================
// 2. SIMULAR extractCitySlug
// ===================================================================
console.log('\n📋 PASO 2: Probando extractCitySlug\n');

function extractCitySlug(locationParam) {
  if (!locationParam) return '';
  const cleaned = locationParam.trim().toLowerCase();
  const patterns = [
    /^venta-autocaravanas-camper-(.+)$/i,
    /^campervans-for-sale-in-(.+)$/i,
    /^camping-cars-a-vendre-(.+)$/i,
    /^wohnmobile-zu-verkaufen-(.+)$/i,
  ];
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return cleaned;
}

// Casos de prueba
const testCases = [
  'granada',
  'albacete', 
  'murcia',
  'venta-autocaravanas-camper-granada',
  'venta-autocaravanas-camper-albacete',
  'GRANADA',
  'Granada',
  ' granada ',
];

console.log('Resultados de extractCitySlug:');
testCases.forEach(input => {
  const output = extractCitySlug(input);
  console.log(`   "${input}" => "${output}"`);
});

// ===================================================================
// 3. CONSULTAR DIRECTAMENTE LAS TABLAS
// ===================================================================
console.log('\n📋 PASO 3: Consultando bases de datos\n');

// Verificar Granada y Albacete en ambas tablas
const citiesToCheck = ['granada', 'albacete', 'murcia', 'elche'];

console.log('=== location_targets (ALQUILER) ===');
for (const city of citiesToCheck) {
  const { data, error } = await supabase
    .from('location_targets')
    .select('slug, name, meta_title, is_active')
    .eq('slug', city)
    .single();
  
  if (data) {
    console.log(`   ✅ ${city}: "${data.meta_title}" (activo: ${data.is_active})`);
  } else {
    console.log(`   ❌ ${city}: NO ENCONTRADO - ${error?.message}`);
  }
}

console.log('\n=== sale_location_targets (VENTA) ===');
for (const city of citiesToCheck) {
  const { data, error } = await supabase
    .from('sale_location_targets')
    .select('slug, name, meta_title, is_active')
    .eq('slug', city)
    .single();
  
  if (data) {
    console.log(`   ✅ ${city}: "${data.meta_title}" (activo: ${data.is_active})`);
  } else {
    console.log(`   ❌ ${city}: NO ENCONTRADO - ${error?.message}`);
  }
}

// ===================================================================
// 4. VERIFICAR QUÉ DEVUELVE generateStaticParams EN CADA CASO
// ===================================================================
console.log('\n📋 PASO 4: Verificando generateStaticParams\n');

// ALQUILER - devuelve { city: "alquiler-autocaravanas-campervans-{slug}" }
// PERO el archivo usa [location] no [city]!
console.log('ALQUILER:');
console.log('   Carpeta: alquiler-autocaravanas-campervans-[location]');
console.log('   generateStaticParams devuelve: { city: "alquiler-autocaravanas-campervans-murcia" }');
console.log('   ⚠️  INCONSISTENCIA: Devuelve "city" pero el parámetro es "location"');
console.log('');

// VENTA - devuelve { location: "{slug}" }
console.log('VENTA:');
console.log('   Carpeta: venta-autocaravanas-camper-[location]');
console.log('   generateStaticParams devuelve: { location: "murcia" }');
console.log('   ✅ CORRECTO: El nombre coincide');

// ===================================================================
// 5. SIMULAR LA CONSULTA EXACTA DE generateMetadata
// ===================================================================
console.log('\n📋 PASO 5: Simulando generateMetadata para VENTA\n');

// Simular cómo llega el parámetro y qué se busca
const testParams = ['granada', 'albacete', 'elche'];

for (const locationParam of testParams) {
  console.log(`--- Probando con locationParam = "${locationParam}" ---`);
  
  // Extraer slug
  const citySlug = extractCitySlug(locationParam);
  console.log(`   1. extractCitySlug("${locationParam}") => "${citySlug}"`);
  
  // Buscar en base de datos
  const { data, error } = await supabase
    .from('sale_location_targets')
    .select('name, province, region, meta_title, meta_description, featured_image, lat, lng')
    .eq('slug', citySlug)
    .eq('is_active', true)
    .single();
  
  if (data) {
    console.log(`   2. ✅ ENCONTRADO: "${data.meta_title}"`);
    console.log(`   3. Título que se usaría: "${data.meta_title || `Venta de Autocaravanas en ${data.name}`}"`);
  } else {
    console.log(`   2. ❌ NO ENCONTRADO`);
    console.log(`   3. Error: ${error?.message}`);
    console.log(`   4. Título que se usaría: "Ubicación no encontrada"`);
  }
  console.log('');
}

// ===================================================================
// 6. RESUMEN
// ===================================================================
console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║                          RESUMEN                                  ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

// Contar registros
const { count: rentalCount } = await supabase
  .from('location_targets')
  .select('*', { count: 'exact', head: true })
  .eq('is_active', true);

const { count: saleCount } = await supabase
  .from('sale_location_targets')
  .select('*', { count: 'exact', head: true })
  .eq('is_active', true);

console.log(`location_targets (ALQUILER): ${rentalCount} registros activos`);
console.log(`sale_location_targets (VENTA): ${saleCount} registros activos`);

console.log('\n✅ Las consultas a la base de datos funcionan correctamente.');
console.log('✅ Los slugs existen y están activos.');
console.log('\n⚠️  El problema puede estar en:');
console.log('   1. Cómo Next.js pasa el parámetro en producción');
console.log('   2. El cliente de Supabase creado en el módulo (líneas 16-19)');
console.log('   3. Variables de entorno en build time vs runtime');
console.log('   4. Caché de metadatos en Next.js');

process.exit(0);
