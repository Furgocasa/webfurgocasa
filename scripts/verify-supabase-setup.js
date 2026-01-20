/**
 * Script para verificar que la tabla sale_location_targets existe y tiene datos
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Verificando configuración de Supabase...\n');

  // 1. Verificar que la tabla existe y tiene datos
  console.log('1️⃣ Verificando tabla sale_location_targets...');
  const { data: locations, error: locError } = await supabase
    .from('sale_location_targets')
    .select('slug, name, province, is_active')
    .order('display_order');

  if (locError) {
    console.error('❌ Error al cargar sale_location_targets:', locError.message);
    return false;
  }

  if (!locations || locations.length === 0) {
    console.error('❌ La tabla sale_location_targets está vacía');
    return false;
  }

  console.log(`✅ Tabla existe con ${locations.length} ciudades`);
  console.log('\n📋 Primeras 10 ciudades:');
  locations.slice(0, 10).forEach((loc, i) => {
    console.log(`   ${i + 1}. ${loc.name} (${loc.province}) - slug: ${loc.slug} - activa: ${loc.is_active}`);
  });

  // 2. Verificar ciudades activas
  const activeCities = locations.filter(loc => loc.is_active);
  console.log(`\n✅ ${activeCities.length} ciudades activas`);

  // 3. Verificar que location_targets también existe (para nearest_location_id)
  console.log('\n2️⃣ Verificando tabla location_targets (para referencias)...');
  const { data: physicalLocations, error: physError } = await supabase
    .from('location_targets')
    .select('slug, name, city')
    .eq('is_active', true);

  if (physError) {
    console.error('❌ Error al cargar location_targets:', physError.message);
    return false;
  }

  console.log(`✅ ${physicalLocations.length} ubicaciones físicas disponibles`);

  console.log('\n✅ ¡TODO CORRECTO! La base de datos está lista.');
  console.log('\n📦 Siguiente paso: Trigger nuevo build en Vercel');
  
  return true;
}

verifySetup()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Error inesperado:', error);
    process.exit(1);
  });
