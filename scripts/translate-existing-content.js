/**
 * Script para traducir contenido existente de Supabase con OpenAI
 * =====================================================
 * 
 * Uso:
 *   node scripts/translate-existing-content.js [--table=posts] [--locale=en] [--dry-run]
 * 
 * Opciones:
 *   --table=<nombre>   Solo traducir una tabla específica (posts, vehicles, location_targets)
 *   --locale=<código>  Solo traducir a un idioma (en, fr, de)
 *   --dry-run          Ver qué se traduciría sin ejecutar
 *   --limit=<n>        Limitar número de registros
 *   --batch-size=<n>   Tamaño de batch (default: 5)
 * 
 * Requiere:
 *   - SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env
 *   - OPENAI_API_KEY en .env
 */

// Cargar variables de entorno de .env.local (prioridad) y .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // fallback a .env
const { createClient } = require('@supabase/supabase-js');

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ Falta OPENAI_API_KEY en .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Parsear argumentos
const args = process.argv.slice(2);
const options = {
  table: null,
  locale: null,
  dryRun: args.includes('--dry-run'),
  limit: null,
  batchSize: 5,
};

args.forEach(arg => {
  if (arg.startsWith('--table=')) options.table = arg.split('=')[1];
  if (arg.startsWith('--locale=')) options.locale = arg.split('=')[1];
  if (arg.startsWith('--limit=')) options.limit = parseInt(arg.split('=')[1]);
  if (arg.startsWith('--batch-size=')) options.batchSize = parseInt(arg.split('=')[1]);
});

const LOCALES = options.locale ? [options.locale] : ['en', 'fr', 'de'];

const LOCALE_NAMES = {
  en: 'English',
  fr: 'French',
  de: 'German',
};

// Configuración de tablas y campos a traducir
// Campos con notación de punto (ej: 'content_sections.introduction') acceden a JSON anidado
const TABLES_CONFIG = {
  // ========== CONTENIDO PRINCIPAL ==========
  posts: {
    fields: ['title', 'excerpt', 'content', 'meta_title', 'meta_description'],
    filter: { status: 'published' },
  },
  
  // ========== VEHÍCULOS ==========
  vehicles: {
    fields: [
      'name', 'description', 'short_description',
      'meta_title', 'meta_description',
      // Campos de venta
      'sale_description', 'sale_meta_title', 'sale_meta_description',
    ],
    filter: {},
    customFilter: (query) => query.neq('status', 'inactive'),
  },
  vehicle_categories: {
    fields: ['name', 'description'],
    filter: { is_active: true },
  },
  vehicle_images: {
    fields: ['alt_text'],
    filter: {},
  },
  
  // ========== LANDINGS ALQUILER ==========
  location_targets: {
    fields: [
      'name', 'meta_title', 'meta_description', 'h1_title', 'intro_text',
      // Campos JSON anidados de content_sections (contenido turístico)
      'content_sections.introduction',
      'content_sections.gastronomy',
      'content_sections.practical_tips',
      // Arrays de objetos (se traducirán como JSON completo)
      'content_sections.attractions',
      'content_sections.routes',
      'content_sections.parking_areas',
    ],
    filter: { is_active: true },
  },
  
  // ========== LANDINGS VENTA ==========
  sale_location_targets: {
    fields: [
      'name', 'meta_title', 'meta_description', 'h1_title', 'intro_text',
      // Campos JSON de content_sections (si tiene contenido)
      'content_sections.introduction',
      'content_sections.gastronomy',
      'content_sections.practical_tips',
      'content_sections.attractions',
      'content_sections.routes',
      'content_sections.parking_areas',
    ],
    filter: { is_active: true },
  },
  
  // ========== EXTRAS Y EQUIPAMIENTO ==========
  extras: {
    fields: ['name', 'description'],
    filter: { is_active: true },
  },
  equipment: {
    fields: ['name', 'description'],
    filter: { is_active: true },
  },
  
  // ========== CATEGORÍAS BLOG ==========
  content_categories: {
    fields: ['name', 'description', 'meta_title', 'meta_description'],
    filter: { is_active: true },
  },
  tags: {
    fields: ['name', 'description'],
    filter: {},
  },
  
  // ========== TEMPORADAS Y UBICACIONES ==========
  seasons: {
    fields: ['name'],
    filter: { is_active: true },
  },
  locations: {
    fields: ['name', 'notes'],
    filter: { is_active: true },
  },
};

// Descripción del tipo de contenido para el prompt
const CONTENT_TYPES = {
  // Campos generales
  title: 'a title/headline',
  excerpt: 'a brief excerpt/summary',
  content: 'article content (preserve HTML)',
  description: 'a description',
  short_description: 'a short description',
  meta_title: 'an SEO meta title (max 60 chars)',
  meta_description: 'an SEO meta description (max 160 chars)',
  name: 'a name/title',
  h1_title: 'a main page heading (H1)',
  intro_text: 'introductory text',
  notes: 'additional notes or instructions',
  alt_text: 'image alt text for SEO (describe the image briefly)',
  
  // Campos de venta de vehículos
  sale_description: 'a detailed description for vehicle sale listing',
  sale_meta_title: 'an SEO meta title for vehicle sale page (max 60 chars)',
  sale_meta_description: 'an SEO meta description for vehicle sale page (max 160 chars)',
  
  // Campos de content_sections (contenido turístico)
  'content_sections.introduction': 'an introductory paragraph about a tourist destination',
  'content_sections.gastronomy': 'text about local gastronomy and food',
  'content_sections.practical_tips': 'practical travel tips for visitors',
  'content_sections.attractions': 'a JSON array of tourist attractions (translate title and description fields, keep structure)',
  'content_sections.routes': 'a JSON array of travel routes (translate title and description fields, keep structure)',
  'content_sections.parking_areas': 'a JSON array of parking areas (translate name, description and services fields, keep structure)',
};

// Traducir con OpenAI
async function translateText(text, targetLocale, contentType) {
  const targetLanguage = LOCALE_NAMES[targetLocale];
  const contentDesc = CONTENT_TYPES[contentType] || 'text';
  const isHtml = text.includes('<') && text.includes('>');
  const isJson = text.startsWith('[') || text.startsWith('{');

  let systemPrompt = `You are a professional translator for a Spanish campervan rental company.
Translate the following Spanish text to ${targetLanguage}.
${isHtml ? 'Preserve all HTML tags and structure exactly.' : ''}
This is ${contentDesc}.
Only return the translated text, nothing else.
Maintain the same tone and style.`;

  // Para arrays/objetos JSON, dar instrucciones especiales
  if (isJson) {
    systemPrompt = `You are a professional translator for a Spanish campervan rental company.
Translate the following JSON from Spanish to ${targetLanguage}.
IMPORTANT: 
- Keep the exact same JSON structure
- Only translate the text values (title, description, name, etc.)
- Do NOT translate keys, property names, or technical values like "type"
- Keep arrays of services in their original language or translate them naturally
- Return valid JSON only, nothing else
This is ${contentDesc}.`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: Math.min(text.length * 3, 8000), // More tokens for JSON content
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim();
  } catch (error) {
    console.error(`   ❌ Error traduciendo: ${error.message}`);
    return null;
  }
}

// Verificar si ya existe traducción
async function translationExists(sourceTable, sourceId, sourceField, locale) {
  const { data } = await supabase
    .from('content_translations')
    .select('id')
    .eq('source_table', sourceTable)
    .eq('source_id', sourceId)
    .eq('source_field', sourceField)
    .eq('locale', locale)
    .single();
  
  return !!data;
}

// Guardar traducción
async function saveTranslation(sourceTable, sourceId, sourceField, locale, translatedText) {
  const { error } = await supabase
    .from('content_translations')
    .upsert({
      source_table: sourceTable,
      source_id: sourceId,
      source_field: sourceField,
      locale: locale,
      translated_text: translatedText,
      is_auto_translated: true,
      translation_model: 'gpt-4o-mini',
    }, {
      onConflict: 'source_table,source_id,source_field,locale',
    });

  if (error) {
    console.error(`   ❌ Error guardando: ${error.message}`);
    return false;
  }
  return true;
}

// Obtener valor de campo (soporta notación de punto para JSON anidado)
function getFieldValue(record, field) {
  if (field.includes('.')) {
    const parts = field.split('.');
    let value = record;
    for (const part of parts) {
      if (value === null || value === undefined) return null;
      value = value[part];
    }
    return value;
  }
  return record[field];
}

// Preparar texto para traducción (maneja strings y objetos JSON)
function prepareTextForTranslation(value, field) {
  if (value === null || value === undefined) return null;
  
  // Si es un array u objeto (content_sections.attractions, etc.), convertir a JSON
  if (typeof value === 'object') {
    // Filtrar arrays vacíos
    if (Array.isArray(value) && value.length === 0) return null;
    // Filtrar objetos vacíos
    if (!Array.isArray(value) && Object.keys(value).length === 0) return null;
    return JSON.stringify(value, null, 2);
  }
  
  // Si es string
  if (typeof value === 'string') {
    return value.trim() || null;
  }
  
  return null;
}

// Procesar una tabla
async function processTable(tableName, config) {
  console.log(`\n📋 Procesando tabla: ${tableName}`);
  console.log(`   Campos: ${config.fields.join(', ')}`);
  console.log(`   Idiomas: ${LOCALES.join(', ')}`);

  // Construir query
  let query = supabase.from(tableName).select('*');
  
  // Aplicar filtros estándar
  Object.entries(config.filter).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  // Aplicar filtro personalizado si existe (ej: vehicles usa status != 'inactive')
  if (config.customFilter) {
    query = config.customFilter(query);
  }

  // Aplicar límite
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data: records, error } = await query;

  if (error) {
    console.error(`   ❌ Error obteniendo registros: ${error.message}`);
    return { translated: 0, skipped: 0, failed: 0 };
  }

  console.log(`   Encontrados: ${records.length} registros`);

  let stats = { translated: 0, skipped: 0, failed: 0 };

  // Procesar cada registro
  for (const record of records) {
    const recordId = record.id;
    const identifier = record.title || record.name || record.slug || recordId.slice(0, 8);
    
    console.log(`\n   → ${identifier}`);

    // Procesar cada campo
    for (const field of config.fields) {
      const rawValue = getFieldValue(record, field);
      const originalText = prepareTextForTranslation(rawValue, field);
      
      if (!originalText) {
        continue;
      }

      // Procesar cada idioma
      for (const locale of LOCALES) {
        // Verificar si ya existe
        const exists = await translationExists(tableName, recordId, field, locale);
        
        if (exists) {
          console.log(`     ⏭️  ${field} → ${locale} (ya existe)`);
          stats.skipped++;
          continue;
        }

        if (options.dryRun) {
          console.log(`     🔍 ${field} → ${locale} (dry-run, ${originalText.length} chars)`);
          stats.skipped++;
          continue;
        }

        // Traducir
        console.log(`     ⏳ ${field} → ${locale}...`);
        const translated = await translateText(originalText, locale, field);

        if (translated) {
          const saved = await saveTranslation(tableName, recordId, field, locale, translated);
          if (saved) {
            console.log(`     ✅ ${field} → ${locale} (${translated.length} chars)`);
            stats.translated++;
          } else {
            stats.failed++;
          }
        } else {
          stats.failed++;
        }

        // Pausa para no saturar OpenAI
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  return stats;
}

// Main
async function main() {
  console.log('🌐 TRADUCCIÓN DE CONTENIDO EXISTENTE');
  console.log('====================================');
  console.log(`Modo: ${options.dryRun ? 'DRY-RUN (sin cambios)' : 'EJECUCIÓN REAL'}`);
  
  if (options.table) {
    console.log(`Tabla: ${options.table}`);
  }
  if (options.locale) {
    console.log(`Idioma: ${options.locale}`);
  }
  if (options.limit) {
    console.log(`Límite: ${options.limit} registros por tabla`);
  }

  // Verificar que existe la tabla content_translations
  const { error: checkError } = await supabase
    .from('content_translations')
    .select('id')
    .limit(1);

  if (checkError) {
    console.error('\n❌ La tabla content_translations no existe.');
    console.error('   Ejecuta primero: supabase/create-translations-system.sql');
    process.exit(1);
  }

  // Determinar qué tablas procesar
  const tablesToProcess = options.table 
    ? { [options.table]: TABLES_CONFIG[options.table] }
    : TABLES_CONFIG;

  if (options.table && !TABLES_CONFIG[options.table]) {
    console.error(`\n❌ Tabla "${options.table}" no configurada.`);
    console.error(`   Tablas disponibles: ${Object.keys(TABLES_CONFIG).join(', ')}`);
    process.exit(1);
  }

  // Procesar tablas
  let totalStats = { translated: 0, skipped: 0, failed: 0 };

  for (const [tableName, config] of Object.entries(tablesToProcess)) {
    const stats = await processTable(tableName, config);
    totalStats.translated += stats.translated;
    totalStats.skipped += stats.skipped;
    totalStats.failed += stats.failed;
  }

  // Resumen final
  console.log('\n====================================');
  console.log('📊 RESUMEN FINAL');
  console.log('====================================');
  console.log(`✅ Traducidos: ${totalStats.translated}`);
  console.log(`⏭️  Omitidos:   ${totalStats.skipped}`);
  console.log(`❌ Fallidos:   ${totalStats.failed}`);

  if (options.dryRun) {
    console.log('\n💡 Ejecuta sin --dry-run para aplicar traducciones.');
  }
}

main().catch(console.error);
