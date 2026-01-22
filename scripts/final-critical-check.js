/**
 * VERIFICACIÓN CRÍTICA FINAL
 * Revisar todos los puntos potencialmente problemáticos
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

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║              VERIFICACIÓN CRÍTICA FINAL - SEO                    ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

let allGood = true;

// 1. Verificar location_targets (ALQUILER)
console.log('1️⃣  CIUDADES DE ALQUILER (location_targets)');
const { data: rentalCities, error: rentalError } = await supabase
  .from('location_targets')
  .select('slug, name, meta_title, is_active')
  .eq('is_active', true);

if (rentalError) {
  console.log('   ❌ Error al consultar:', rentalError.message);
  allGood = false;
} else {
  const withFurgocasa = rentalCities.filter(c => /(-|\|)\s*Furgocasa\s*$/i.test(c.meta_title));
  if (withFurgocasa.length > 0) {
    console.log(`   ⚠️  ${withFurgocasa.length} ciudades tienen "Furgocasa" en el título`);
    allGood = false;
  } else {
    console.log(`   ✅ ${rentalCities.length} ciudades activas - Títulos correctos`);
  }
}

// 2. Verificar sale_location_targets (VENTA)
console.log('\n2️⃣  CIUDADES DE VENTA (sale_location_targets)');
const { data: saleCities, error: saleError } = await supabase
  .from('sale_location_targets')
  .select('slug, name, meta_title, is_active')
  .eq('is_active', true);

if (saleError) {
  console.log('   ❌ Error al consultar:', saleError.message);
  allGood = false;
} else {
  const withFurgocasa = saleCities.filter(c => /(-|\|)\s*Furgocasa\s*$/i.test(c.meta_title));
  if (withFurgocasa.length > 0) {
    console.log(`   ⚠️  ${withFurgocasa.length} ciudades tienen "Furgocasa" en el título`);
    allGood = false;
  } else {
    console.log(`   ✅ ${saleCities.length} ciudades activas - Títulos correctos`);
  }
}

// 3. Verificar vehicles (meta_title)
console.log('\n3️⃣  VEHÍCULOS DE ALQUILER (vehicles)');
const { data: vehicles, error: vehiclesError } = await supabase
  .from('vehicles')
  .select('internal_code, name, meta_title');

if (vehiclesError) {
  console.log('   ❌ Error al consultar:', vehiclesError.message);
  allGood = false;
} else {
  const withFurgocasa = vehicles.filter(v => v.meta_title && /(-|\|)\s*Furgocasa\s*$/i.test(v.meta_title));
  if (withFurgocasa.length > 0) {
    console.log(`   ⚠️  ${withFurgocasa.length} vehículos tienen "Furgocasa" en el título`);
    allGood = false;
  } else {
    console.log(`   ✅ ${vehicles.length} vehículos - Títulos correctos`);
  }
}

// 4. Verificar ciudades desactivadas que podrían causar 404
console.log('\n4️⃣  CIUDADES DESACTIVADAS (posibles 404)');
const { data: inactiveRental } = await supabase
  .from('location_targets')
  .select('slug, name')
  .eq('is_active', false);

const { data: inactiveSale } = await supabase
  .from('sale_location_targets')
  .select('slug, name')
  .eq('is_active', false);

if ((inactiveRental?.length || 0) > 0 || (inactiveSale?.length || 0) > 0) {
  console.log(`   ⚠️  ${(inactiveRental?.length || 0)} alquiler + ${(inactiveSale?.length || 0)} venta desactivadas`);
  console.log('   ℹ️  URLs de estas ciudades mostrarán "Ubicación no encontrada"');
} else {
  console.log('   ✅ No hay ciudades desactivadas');
}

// 5. Verificar que no haya meta_title NULL
console.log('\n5️⃣  META_TITLE NULL (crítico para SEO)');
const { data: nullTitlesRental } = await supabase
  .from('location_targets')
  .select('slug, name')
  .is('meta_title', null)
  .eq('is_active', true);

const { data: nullTitlesSale } = await supabase
  .from('sale_location_targets')
  .select('slug, name')
  .is('meta_title', null)
  .eq('is_active', true);

if ((nullTitlesRental?.length || 0) > 0 || (nullTitlesSale?.length || 0) > 0) {
  console.log(`   ❌ CRÍTICO: ${(nullTitlesRental?.length || 0)} alquiler + ${(nullTitlesSale?.length || 0)} venta sin meta_title`);
  allGood = false;
} else {
  console.log('   ✅ Todas las ciudades activas tienen meta_title');
}

// RESUMEN FINAL
console.log('\n' + '='.repeat(70));
if (allGood) {
  console.log('\n✅ ¡PERFECTO! No se encontraron problemas críticos\n');
  console.log('📊 Resumen:');
  console.log(`   - ${rentalCities.length} ciudades de alquiler activas`);
  console.log(`   - ${saleCities.length} ciudades de venta activas`);
  console.log(`   - ${vehicles.length} vehículos activos`);
  console.log(`   - 0 problemas críticos detectados`);
} else {
  console.log('\n⚠️  SE ENCONTRARON PROBLEMAS CRÍTICOS');
  console.log('Revisa los detalles arriba y corrige los errores\n');
  process.exit(1);
}
console.log('='.repeat(70) + '\n');
