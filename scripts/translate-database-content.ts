#!/usr/bin/env tsx

/**
 * Script para traducir automáticamente el contenido de la base de datos usando OpenAI
 * 
 * INSTALACIÓN:
 * 1. npm install -D tsx
 * 2. npm install openai
 * 3. Configurar OPENAI_API_KEY en .env.local
 * 4. Configurar SUPABASE_SERVICE_ROLE_KEY en .env.local
 * 
 * USO:
 * npx tsx scripts/translate-database-content.ts
 * 
 * COSTE ESTIMADO:
 * - GPT-3.5-turbo: ~$5-10 USD para todo el contenido
 * - GPT-4-turbo: ~$20-30 USD para todo el contenido
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// =====================================================
// CONFIGURACIÓN
// =====================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ IMPORTANTE: Usar la clave de SERVICIO, no la ANON
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Modelo a usar (puedes cambiar a gpt-4-turbo para mejor calidad)
const MODEL = 'gpt-3.5-turbo';

// Idiomas objetivo (añade más si quieres)
const TARGET_LANGUAGES = ['en'] as const;

// =====================================================
// FUNCIONES DE TRADUCCIÓN
// =====================================================

async function translate(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in tourism and automotive content. 
Translate the following text from Spanish to ${targetLang}. 
Maintain the tone, style, and technical accuracy. 
Do not translate brand names, model names, or specific technical terms.
If the text contains HTML, preserve all HTML tags exactly as they are.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3, // Más bajo = más consistente
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error('❌ Error al traducir:', error);
    return text;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// =====================================================
// TRADUCIR VEHÍCULOS
// =====================================================

async function translateVehicles() {
  console.log('\n🚗 Traduciendo vehículos...');
  
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('id, name, description, short_description')
    .is('name_en', null);

  if (error) {
    console.error('❌ Error al obtener vehículos:', error);
    return;
  }

  console.log(`📊 Encontrados ${vehicles?.length || 0} vehículos para traducir`);

  for (const vehicle of vehicles || []) {
    console.log(`  ⏳ Traduciendo: ${vehicle.name}...`);

    const nameEn = await translate(vehicle.name, 'en');
    const descEn = vehicle.description ? await translate(vehicle.description, 'en') : null;
    const shortDescEn = vehicle.short_description ? await translate(vehicle.short_description, 'en') : null;

    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        name_en: nameEn,
        description_en: descEn,
        short_description_en: shortDescEn,
        slug_en: slugify(nameEn),
      })
      .eq('id', vehicle.id);

    if (updateError) {
      console.error(`  ❌ Error al actualizar ${vehicle.name}:`, updateError);
    } else {
      console.log(`  ✅ ${vehicle.name} → ${nameEn}`);
    }

    // Pequeña pausa para no sobrecargar la API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Vehículos traducidos completamente');
}

// =====================================================
// TRADUCIR CATEGORÍAS DE VEHÍCULOS
// =====================================================

async function translateVehicleCategories() {
  console.log('\n📂 Traduciendo categorías de vehículos...');
  
  const { data: categories, error } = await supabase
    .from('vehicle_categories')
    .select('id, name, description')
    .is('name_en', null);

  if (error) {
    console.error('❌ Error al obtener categorías:', error);
    return;
  }

  console.log(`📊 Encontradas ${categories?.length || 0} categorías para traducir`);

  for (const category of categories || []) {
    console.log(`  ⏳ Traduciendo: ${category.name}...`);

    const nameEn = await translate(category.name, 'en');
    const descEn = category.description ? await translate(category.description, 'en') : null;

    const { error: updateError } = await supabase
      .from('vehicle_categories')
      .update({
        name_en: nameEn,
        description_en: descEn,
        slug_en: slugify(nameEn),
      })
      .eq('id', category.id);

    if (updateError) {
      console.error(`  ❌ Error al actualizar ${category.name}:`, updateError);
    } else {
      console.log(`  ✅ ${category.name} → ${nameEn}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Categorías traducidas completamente');
}

// =====================================================
// TRADUCIR EXTRAS
// =====================================================

async function translateExtras() {
  console.log('\n🎁 Traduciendo extras...');
  
  const { data: extras, error } = await supabase
    .from('extras')
    .select('id, name, description')
    .is('name_en', null);

  if (error) {
    console.error('❌ Error al obtener extras:', error);
    return;
  }

  console.log(`📊 Encontrados ${extras?.length || 0} extras para traducir`);

  for (const extra of extras || []) {
    console.log(`  ⏳ Traduciendo: ${extra.name}...`);

    const nameEn = await translate(extra.name, 'en');
    const descEn = extra.description ? await translate(extra.description, 'en') : null;

    const { error: updateError } = await supabase
      .from('extras')
      .update({
        name_en: nameEn,
        description_en: descEn,
      })
      .eq('id', extra.id);

    if (updateError) {
      console.error(`  ❌ Error al actualizar ${extra.name}:`, updateError);
    } else {
      console.log(`  ✅ ${extra.name} → ${nameEn}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Extras traducidos completamente');
}

// =====================================================
// TRADUCIR EQUIPAMIENTO
// =====================================================

async function translateEquipment() {
  console.log('\n🔧 Traduciendo equipamiento...');
  
  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('id, name, description')
    .is('name_en', null);

  if (error) {
    console.error('❌ Error al obtener equipamiento:', error);
    return;
  }

  console.log(`📊 Encontrados ${equipment?.length || 0} items de equipamiento para traducir`);

  for (const item of equipment || []) {
    console.log(`  ⏳ Traduciendo: ${item.name}...`);

    const nameEn = await translate(item.name, 'en');
    const descEn = item.description ? await translate(item.description, 'en') : null;

    const { error: updateError } = await supabase
      .from('equipment')
      .update({
        name_en: nameEn,
        description_en: descEn,
        slug_en: slugify(nameEn),
      })
      .eq('id', item.id);

    if (updateError) {
      console.error(`  ❌ Error al actualizar ${item.name}:`, updateError);
    } else {
      console.log(`  ✅ ${item.name} → ${nameEn}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Equipamiento traducido completamente');
}

// =====================================================
// TRADUCIR ARTÍCULOS DE BLOG
// =====================================================

async function translateBlogPosts() {
  console.log('\n📝 Traduciendo artículos de blog...');
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, slug')
    .eq('status', 'published')
    .is('title_en', null);

  if (error) {
    console.error('❌ Error al obtener posts:', error);
    return;
  }

  console.log(`📊 Encontrados ${posts?.length || 0} posts para traducir`);
  console.log('⚠️  ADVERTENCIA: Traducir posts puede ser costoso. Presiona Ctrl+C para cancelar.');
  
  // Pausa de 5 segundos para cancelar si es necesario
  await new Promise(resolve => setTimeout(resolve, 5000));

  for (const post of posts || []) {
    console.log(`  ⏳ Traduciendo: ${post.title}...`);

    const titleEn = await translate(post.title, 'en');
    const excerptEn = post.excerpt ? await translate(post.excerpt, 'en') : null;
    const contentEn = post.content ? await translate(post.content, 'en') : null;

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        title_en: titleEn,
        excerpt_en: excerptEn,
        content_en: contentEn,
        slug_en: slugify(titleEn),
      })
      .eq('id', post.id);

    if (updateError) {
      console.error(`  ❌ Error al actualizar ${post.title}:`, updateError);
    } else {
      console.log(`  ✅ ${post.title} → ${titleEn}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Más tiempo para posts (contenido largo)
  }

  console.log('✅ Posts traducidos completamente');
}

// =====================================================
// TRADUCIR CATEGORÍAS DE BLOG
// =====================================================

async function translateContentCategories() {
  console.log('\n📁 Traduciendo categorías de blog...');
  
  const { data: categories, error } = await supabase
    .from('content_categories')
    .select('id, name, description')
    .is('name_en', null);

  if (error) {
    console.error('❌ Error al obtener categorías de blog:', error);
    return;
  }

  console.log(`📊 Encontradas ${categories?.length || 0} categorías para traducir`);

  for (const category of categories || []) {
    console.log(`  ⏳ Traduciendo: ${category.name}...`);

    const nameEn = await translate(category.name, 'en');
    const descEn = category.description ? await translate(category.description, 'en') : null;

    const { error: updateError } = await supabase
      .from('content_categories')
      .update({
        name_en: nameEn,
        description_en: descEn,
        slug_en: slugify(nameEn),
      })
      .eq('id', category.id);

    if (updateError) {
      console.error(`  ❌ Error al actualizar ${category.name}:`, updateError);
    } else {
      console.log(`  ✅ ${category.name} → ${nameEn}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('✅ Categorías de blog traducidas completamente');
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

async function main() {
  console.log('🌍 ========================================');
  console.log('🌍 TRADUCCIÓN AUTOMÁTICA DE BASE DE DATOS');
  console.log('🌍 ========================================\n');
  console.log('📝 Modelo: ' + MODEL);
  console.log('🗣️  Idiomas objetivo: ' + TARGET_LANGUAGES.join(', '));
  console.log('\n');

  try {
    // Ejecutar todas las traducciones en orden
    await translateVehicles();
    await translateVehicleCategories();
    await translateExtras();
    await translateEquipment();
    await translateContentCategories();
    
    // ⚠️ COMENTADO: Descomentar si quieres traducir los posts del blog
    // await translateBlogPosts();

    console.log('\n');
    console.log('✅ ========================================');
    console.log('✅ TRADUCCIÓN COMPLETADA EXITOSAMENTE');
    console.log('✅ ========================================');
    console.log('\n');
    console.log('📊 Próximos pasos:');
    console.log('1. Verifica las traducciones en Supabase');
    console.log('2. Actualiza las páginas para usar los campos *_en');
    console.log('3. Prueba la web en inglés: /en/');
  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ ERROR DURANTE LA TRADUCCIÓN');
    console.error('❌ ========================================');
    console.error(error);
  }
}

// Ejecutar
main();
