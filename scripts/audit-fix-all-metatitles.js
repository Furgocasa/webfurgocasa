/**
 * ========================================================================
 * SCRIPT COMPLETO: Auditoría y corrección de meta_title
 * ========================================================================
 * 
 * OBJETIVO:
 * - Verificar que NINGÚN meta_title en la BD incluya "- Furgocasa" 
 * - El template del layout.tsx ya añade automáticamente " - Furgocasa"
 * - Evitar duplicados como "Título - Furgocasa - Furgocasa"
 * 
 * TABLAS A REVISAR:
 * - location_targets (ciudades de alquiler)
 * - sale_location_targets (ciudades de venta)
 * - blog_posts (artículos del blog)
 * - vehicles (vehículos de alquiler)
 * - vehicles_for_sale (vehículos en venta)
 * ========================================================================
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env.local desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ========================================================================
// FUNCIONES AUXILIARES
// ========================================================================

function cleanTitle(title, entityName = '') {
  if (!title) return null;
  
  // Eliminar cualquier variación de "- Furgocasa" al final
  let cleaned = title
    .replace(/\s*-\s*Furgocasa\s*Campervans\s*$/i, '')
    .replace(/\s*-\s*Furgocasa\s*$/i, '')
    .replace(/\s*\|\s*Furgocasa\s*$/i, '')
    .trim();
  
  return cleaned;
}

function needsCleaning(title) {
  if (!title) return false;
  return /(-|\\|)\s*Furgocasa/i.test(title);
}

// ========================================================================
// FUNCIONES DE AUDITORÍA Y CORRECCIÓN POR TABLA
// ========================================================================

async function auditLocationTargets() {
  console.log('\n📍 AUDITANDO: location_targets (ciudades de alquiler)');
  console.log('='.repeat(70));
  
  const { data: locations, error } = await supabase
    .from('location_targets')
    .select('id, slug, name, meta_title')
    .order('name');

  if (error) {
    console.error('❌ Error:', error.message);
    return { updated: 0, errors: 0 };
  }

  let updated = 0;
  let errors = 0;

  for (const loc of locations) {
    if (needsCleaning(loc.meta_title)) {
      const cleaned = cleanTitle(loc.meta_title, loc.name);
      console.log(`\n⚠️  ${loc.name}:`);
      console.log(`   Antes: "${loc.meta_title}"`);
      console.log(`   Después: "${cleaned}"`);
      
      const { error: updateError } = await supabase
        .from('location_targets')
        .update({ meta_title: cleaned })
        .eq('id', loc.id);

      if (updateError) {
        console.error(`   ❌ Error: ${updateError.message}`);
        errors++;
      } else {
        console.log(`   ✅ Corregido`);
        updated++;
      }
    } else {
      console.log(`✓ ${loc.name} - OK`);
    }
  }

  return { updated, errors, total: locations.length };
}

async function auditSaleLocationTargets() {
  console.log('\n🏷️  AUDITANDO: sale_location_targets (ciudades de venta)');
  console.log('='.repeat(70));
  
  const { data: locations, error } = await supabase
    .from('sale_location_targets')
    .select('id, slug, name, meta_title')
    .order('name');

  if (error) {
    console.error('❌ Error:', error.message);
    return { updated: 0, errors: 0 };
  }

  let updated = 0;
  let errors = 0;

  for (const loc of locations) {
    if (needsCleaning(loc.meta_title)) {
      const cleaned = cleanTitle(loc.meta_title, loc.name);
      console.log(`\n⚠️  ${loc.name}:`);
      console.log(`   Antes: "${loc.meta_title}"`);
      console.log(`   Después: "${cleaned}"`);
      
      const { error: updateError } = await supabase
        .from('sale_location_targets')
        .update({ meta_title: cleaned })
        .eq('id', loc.id);

      if (updateError) {
        console.error(`   ❌ Error: ${updateError.message}`);
        errors++;
      } else {
        console.log(`   ✅ Corregido`);
        updated++;
      }
    } else {
      console.log(`✓ ${loc.name} - OK`);
    }
  }

  return { updated, errors, total: locations.length };
}

async function auditBlogPosts() {
  console.log('\n📝 AUDITANDO: blog_posts (artículos del blog)');
  console.log('='.repeat(70));
  
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, slug, title, meta_title')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return { updated: 0, errors: 0 };
  }

  let updated = 0;
  let errors = 0;

  for (const post of posts) {
    if (needsCleaning(post.meta_title)) {
      const cleaned = cleanTitle(post.meta_title, post.title);
      console.log(`\n⚠️  ${post.title}:`);
      console.log(`   Antes: "${post.meta_title}"`);
      console.log(`   Después: "${cleaned}"`);
      
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update({ meta_title: cleaned })
        .eq('id', post.id);

      if (updateError) {
        console.error(`   ❌ Error: ${updateError.message}`);
        errors++;
      } else {
        console.log(`   ✅ Corregido`);
        updated++;
      }
    } else {
      console.log(`✓ ${post.slug} - OK`);
    }
  }

  return { updated, errors, total: posts.length };
}

async function auditVehicles() {
  console.log('\n🚐 AUDITANDO: vehicles (vehículos de alquiler)');
  console.log('='.repeat(70));
  
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('id, internal_code, name, meta_title')
    .order('internal_code');

  if (error) {
    console.error('❌ Error:', error.message);
    return { updated: 0, errors: 0 };
  }

  let updated = 0;
  let errors = 0;

  for (const vehicle of vehicles) {
    if (needsCleaning(vehicle.meta_title)) {
      const cleaned = cleanTitle(vehicle.meta_title, vehicle.name);
      console.log(`\n⚠️  ${vehicle.name} (${vehicle.internal_code}):`);
      console.log(`   Antes: "${vehicle.meta_title}"`);
      console.log(`   Después: "${cleaned}"`);
      
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ meta_title: cleaned })
        .eq('id', vehicle.id);

      if (updateError) {
        console.error(`   ❌ Error: ${updateError.message}`);
        errors++;
      } else {
        console.log(`   ✅ Corregido`);
        updated++;
      }
    } else {
      console.log(`✓ ${vehicle.internal_code} - OK`);
    }
  }

  return { updated, errors, total: vehicles.length };
}

async function auditVehiclesForSale() {
  console.log('\n💰 AUDITANDO: vehicles_for_sale (vehículos en venta)');
  console.log('='.repeat(70));
  
  const { data: vehicles, error } = await supabase
    .from('vehicles_for_sale')
    .select('id, slug, name, meta_title')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    return { updated: 0, errors: 0 };
  }

  let updated = 0;
  let errors = 0;

  for (const vehicle of vehicles) {
    if (needsCleaning(vehicle.meta_title)) {
      const cleaned = cleanTitle(vehicle.meta_title, vehicle.name);
      console.log(`\n⚠️  ${vehicle.name}:`);
      console.log(`   Antes: "${vehicle.meta_title}"`);
      console.log(`   Después: "${cleaned}"`);
      
      const { error: updateError } = await supabase
        .from('vehicles_for_sale')
        .update({ meta_title: cleaned })
        .eq('id', vehicle.id);

      if (updateError) {
        console.error(`   ❌ Error: ${updateError.message}`);
        errors++;
      } else {
        console.log(`   ✅ Corregido`);
        updated++;
      }
    } else {
      console.log(`✓ ${vehicle.slug} - OK`);
    }
  }

  return { updated, errors, total: vehicles.length };
}

// ========================================================================
// FUNCIÓN PRINCIPAL
// ========================================================================

async function main() {
  console.log('\n');
  console.log('╔═════════════════════════════════════════════════════════════════════╗');
  console.log('║         AUDITORÍA COMPLETA DE META_TITLE EN BASE DE DATOS         ║');
  console.log('╚═════════════════════════════════════════════════════════════════════╝');
  console.log('\nBuscando títulos que contengan "- Furgocasa" (debe eliminarse)...');
  console.log('El template de Next.js ya añade automáticamente " - Furgocasa"\n');

  try {
    const results = {
      location_targets: await auditLocationTargets(),
      sale_location_targets: await auditSaleLocationTargets(),
      blog_posts: await auditBlogPosts(),
      vehicles: await auditVehicles(),
      vehicles_for_sale: await auditVehiclesForSale(),
    };

    // Resumen final
    console.log('\n');
    console.log('╔═════════════════════════════════════════════════════════════════════╗');
    console.log('║                         RESUMEN FINAL                               ║');
    console.log('╚═════════════════════════════════════════════════════════════════════╝');
    
    let totalUpdated = 0;
    let totalErrors = 0;
    let totalRecords = 0;

    for (const [table, result] of Object.entries(results)) {
      console.log(`\n📊 ${table}:`);
      console.log(`   Total registros: ${result.total}`);
      console.log(`   Actualizados: ${result.updated}`);
      console.log(`   Errores: ${result.errors}`);
      
      totalUpdated += result.updated;
      totalErrors += result.errors;
      totalRecords += result.total;
    }

    console.log('\n' + '='.repeat(70));
    console.log(`\n✅ TOTALES:`);
    console.log(`   Registros revisados: ${totalRecords}`);
    console.log(`   Corregidos: ${totalUpdated}`);
    console.log(`   Errores: ${totalErrors}`);
    console.log('\n' + '='.repeat(70));

    if (totalUpdated === 0) {
      console.log('\n✨ ¡Perfecto! Todos los títulos están correctos.');
    } else {
      console.log(`\n✅ Se corrigieron ${totalUpdated} títulos.`);
    }

    if (totalErrors > 0) {
      console.log(`\n⚠️  Hubo ${totalErrors} errores. Revisa los mensajes arriba.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar
main();
