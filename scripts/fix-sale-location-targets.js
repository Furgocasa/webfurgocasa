/**
 * FIX COMPLETO: sale_location_targets
 * 
 * Este script corrige automáticamente todos los problemas en sale_location_targets:
 * - Elimina "| Furgocasa" y " - Furgocasa" de los meta_titles
 * - Normaliza todos los slugs (minúsculas, sin espacios)
 * - Asegura que Granada existe y está correctamente configurada
 * - Genera reportes detallados
 * 
 * Uso: node scripts/fix-sale-location-targets.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  console.error('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║     CORRECCIÓN AUTOMÁTICA: sale_location_targets                ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

// ===================================================================
// 1. VERIFICACIÓN INICIAL
// ===================================================================
console.log('📊 PASO 1: Verificación inicial...\n');

const { data: initialData, error: initialError } = await supabase
  .from('sale_location_targets')
  .select('slug, name, meta_title, is_active')
  .order('name');

if (initialError) {
  console.error('❌ Error al consultar sale_location_targets:', initialError.message);
  process.exit(1);
}

const totalRegistros = initialData.length;
const activos = initialData.filter(r => r.is_active).length;
const conSufijoFurgocasa = initialData.filter(r => 
  r.meta_title && (r.meta_title.includes('| Furgocasa') || r.meta_title.includes('- Furgocasa'))
).length;
const slugsSinNormalizar = initialData.filter(r => r.slug !== r.slug.toLowerCase().trim()).length;
const sinMetaTitle = initialData.filter(r => !r.meta_title || r.meta_title.trim() === '').length;

console.log(`   Total de registros: ${totalRegistros}`);
console.log(`   Registros activos: ${activos}`);
console.log(`   Con sufijo "Furgocasa": ${conSufijoFurgocasa}`);
console.log(`   Slugs sin normalizar: ${slugsSinNormalizar}`);
console.log(`   Sin meta_title: ${sinMetaTitle}\n`);

// ===================================================================
// 2. OBTENER ID DE MURCIA (para Granada)
// ===================================================================
console.log('🔍 PASO 2: Obteniendo ID de Murcia...\n');

const { data: murciaLocation, error: murciaError } = await supabase
  .from('locations')
  .select('id')
  .eq('city', 'Murcia')
  .single();

if (murciaError || !murciaLocation) {
  console.warn('   ⚠️  No se encontró Murcia en locations, se usará null para nearest_location_id');
}

const murciaLocationId = murciaLocation?.id || null;

// ===================================================================
// 3. CORRECCIÓN: Eliminar sufijos "Furgocasa" de meta_titles
// ===================================================================
console.log('🔧 PASO 3: Corrigiendo meta_titles...\n');

if (conSufijoFurgocasa > 0) {
  const registrosACorregir = initialData.filter(r => 
    r.meta_title && (r.meta_title.includes('| Furgocasa') || r.meta_title.includes('- Furgocasa'))
  );

  let corregidos = 0;
  for (const registro of registrosACorregir) {
    let nuevoMetaTitle = registro.meta_title
      .replace(/\s*\|\s*Furgocasa\s*$/g, '')
      .replace(/\s*-\s*Furgocasa\s*$/g, '')
      .trim();

    const { error: updateError } = await supabase
      .from('sale_location_targets')
      .update({ 
        meta_title: nuevoMetaTitle,
        updated_at: new Date().toISOString()
      })
      .eq('slug', registro.slug);

    if (updateError) {
      console.error(`   ❌ Error actualizando ${registro.name}:`, updateError.message);
    } else {
      corregidos++;
      console.log(`   ✅ ${registro.name}: "${registro.meta_title}" → "${nuevoMetaTitle}"`);
    }
  }
  console.log(`\n   ✅ ${corregidos} meta_titles corregidos\n`);
} else {
  console.log('   ✅ No hay meta_titles con sufijo "Furgocasa"\n');
}

// ===================================================================
// 4. CORRECCIÓN: Normalizar slugs
// ===================================================================
console.log('🔧 PASO 4: Normalizando slugs...\n');

if (slugsSinNormalizar > 0) {
  const registrosANormalizar = initialData.filter(r => r.slug !== r.slug.toLowerCase().trim());
  
  let normalizados = 0;
  for (const registro of registrosANormalizar) {
    const nuevoSlug = registro.slug.toLowerCase().trim();
    
    const { error: updateError } = await supabase
      .from('sale_location_targets')
      .update({ 
        slug: nuevoSlug,
        updated_at: new Date().toISOString()
      })
      .eq('slug', registro.slug);

    if (updateError) {
      console.error(`   ❌ Error normalizando slug de ${registro.name}:`, updateError.message);
    } else {
      normalizados++;
      console.log(`   ✅ ${registro.name}: "${registro.slug}" → "${nuevoSlug}"`);
    }
  }
  console.log(`\n   ✅ ${normalizados} slugs normalizados\n`);
} else {
  console.log('   ✅ Todos los slugs están normalizados\n');
}

// ===================================================================
// 5. ASEGURAR QUE GRANADA EXISTE
// ===================================================================
console.log('🏔️  PASO 5: Verificando/creando Granada...\n');

const { data: granadaData, error: granadaCheckError } = await supabase
  .from('sale_location_targets')
  .select('*')
  .eq('slug', 'granada')
  .single();

if (granadaCheckError && granadaCheckError.code !== 'PGRST116') {
  console.error('   ❌ Error verificando Granada:', granadaCheckError.message);
} else if (!granadaData) {
  // Granada no existe, crearla
  console.log('   📝 Granada no existe, creándola...');
  
  const { error: insertError } = await supabase
    .from('sale_location_targets')
    .insert({
      slug: 'granada',
      name: 'Granada',
      province: 'Granada',
      region: 'Andalucía',
      nearest_location_id: murciaLocationId,
      distance_km: 370,
      travel_time_minutes: 240,
      meta_title: 'Venta de Autocaravanas en Granada',
      meta_description: 'Compra tu autocaravana en Granada. Entrega desde Murcia. Stock disponible y financiación.',
      h1_title: 'Venta de Autocaravanas en Granada',
      intro_text: 'Encuentra tu autocaravana ideal para Granada y Sierra Nevada.',
      is_active: true,
      display_order: 31
    });

  if (insertError) {
    console.error('   ❌ Error creando Granada:', insertError.message);
  } else {
    console.log('   ✅ Granada creada correctamente\n');
  }
} else {
  // Granada existe, actualizarla si es necesario
  console.log('   ✅ Granada existe');
  
  const necesitaActualizacion = 
    granadaData.meta_title?.includes('| Furgocasa') ||
    granadaData.meta_title?.includes('- Furgocasa') ||
    !granadaData.is_active ||
    granadaData.slug !== 'granada';

  if (necesitaActualizacion) {
    console.log('   📝 Actualizando Granada...');
    
    const nuevoMetaTitle = granadaData.meta_title
      ? granadaData.meta_title.replace(/\s*\|\s*Furgocasa\s*$/g, '').replace(/\s*-\s*Furgocasa\s*$/g, '').trim()
      : 'Venta de Autocaravanas en Granada';

    const { error: updateError } = await supabase
      .from('sale_location_targets')
      .update({
        slug: 'granada',
        name: 'Granada',
        province: 'Granada',
        region: 'Andalucía',
        nearest_location_id: murciaLocationId,
        distance_km: 370,
        travel_time_minutes: 240,
        meta_title: nuevoMetaTitle,
        meta_description: granadaData.meta_description || 'Compra tu autocaravana en Granada. Entrega desde Murcia. Stock disponible y financiación.',
        h1_title: granadaData.h1_title || 'Venta de Autocaravanas en Granada',
        intro_text: granadaData.intro_text || 'Encuentra tu autocaravana ideal para Granada y Sierra Nevada.',
        is_active: true,
        display_order: 31,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'granada');

    if (updateError) {
      console.error('   ❌ Error actualizando Granada:', updateError.message);
    } else {
      console.log('   ✅ Granada actualizada correctamente\n');
    }
  } else {
    console.log('   ✅ Granada ya está correctamente configurada\n');
  }
}

// ===================================================================
// 6. REPORTE FINAL
// ===================================================================
console.log('📊 PASO 6: Generando reporte final...\n');

const { data: finalData, error: finalError } = await supabase
  .from('sale_location_targets')
  .select('slug, name, meta_title, is_active, province, region')
  .order('name');

if (finalError) {
  console.error('❌ Error al generar reporte final:', finalError.message);
  process.exit(1);
}

const finalActivos = finalData.filter(r => r.is_active);
const finalConSufijo = finalData.filter(r => 
  r.meta_title && (r.meta_title.includes('| Furgocasa') || r.meta_title.includes('- Furgocasa'))
).length;
const finalSlugsSinNormalizar = finalData.filter(r => r.slug !== r.slug.toLowerCase().trim()).length;

console.log('╔═══════════════════════════════════════════════════════════════════╗');
console.log('║                        REPORTE FINAL                             ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

console.log(`Total de registros: ${finalData.length}`);
console.log(`Registros activos: ${finalActivos.length}`);
console.log(`Con sufijo "Furgocasa": ${finalConSufijo} ${finalConSufijo === 0 ? '✅' : '❌'}`);
console.log(`Slugs sin normalizar: ${finalSlugsSinNormalizar} ${finalSlugsSinNormalizar === 0 ? '✅' : '❌'}\n`);

// Verificar Granada específicamente
const granadaFinal = finalData.find(r => r.slug === 'granada');
if (granadaFinal) {
  console.log('🏔️  GRANADA:');
  console.log(`   Slug: ${granadaFinal.slug}`);
  console.log(`   Nombre: ${granadaFinal.name}`);
  console.log(`   Meta Title: ${granadaFinal.meta_title}`);
  console.log(`   Activa: ${granadaFinal.is_active ? '✅ Sí' : '❌ No'}`);
  
  const granadaOk = 
    granadaFinal.slug === 'granada' &&
    granadaFinal.is_active === true &&
    granadaFinal.meta_title &&
    !granadaFinal.meta_title.includes('| Furgocasa') &&
    !granadaFinal.meta_title.includes('- Furgocasa');
  
  console.log(`   Estado: ${granadaOk ? '✅ TODO CORRECTO' : '❌ REVISAR'}\n`);
} else {
  console.log('❌ GRANADA: No encontrada\n');
}

// Listar todas las ciudades activas
console.log('📋 CIUDADES ACTIVAS:');
finalActivos.forEach((ciudad, index) => {
  const estado = 
    ciudad.meta_title &&
    !ciudad.meta_title.includes('| Furgocasa') &&
    !ciudad.meta_title.includes('- Furgocasa') &&
    ciudad.slug === ciudad.slug.toLowerCase().trim()
    ? '✅' : '❌';
  
  console.log(`   ${index + 1}. ${estado} ${ciudad.name} (${ciudad.slug})`);
  if (ciudad.meta_title) {
    console.log(`      Meta Title: "${ciudad.meta_title}"`);
  }
});

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║                    CORRECCIÓN COMPLETADA                          ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

// Verificar si hay problemas pendientes
const problemasPendientes = finalConSufijo > 0 || finalSlugsSinNormalizar > 0 || !granadaFinal || !granadaFinal.is_active;

if (problemasPendientes) {
  console.log('⚠️  Hay problemas pendientes. Revisa el reporte anterior.\n');
  process.exit(1);
} else {
  console.log('✅ Todos los problemas han sido corregidos correctamente.\n');
  process.exit(0);
}
