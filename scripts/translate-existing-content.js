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

require('dotenv').config();
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
const TABLES_CONFIG = {
  posts: {
    fields: ['title', 'excerpt', 'content', 'meta_title', 'meta_description'],
    filter: { is_published: true },
  },
  vehicles: {
    fields: ['name', 'description', 'short_description'],
    filter: { is_active: true },
  },
  location_targets: {
    fields: ['name', 'meta_title', 'meta_description', 'h1_title', 'intro_text'],
    filter: { is_active: true },
  },
  sale_location_targets: {
    fields: ['name', 'meta_title', 'meta_description', 'h1_title', 'intro_text'],
    filter: { is_active: true },
  },
  vehicle_categories: {
    fields: ['name', 'description'],
    filter: { is_active: true },
  },
  extras: {
    fields: ['name', 'description'],
    filter: {},
  },
  content_categories: {
    fields: ['name', 'description'],
    filter: {},
  },
};

// Descripción del tipo de contenido para el prompt
const CONTENT_TYPES = {
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
};

// Traducir con OpenAI
async function translateText(text, targetLocale, contentType) {
  const targetLanguage = LOCALE_NAMES[targetLocale];
  const contentDesc = CONTENT_TYPES[contentType] || 'text';
  const isHtml = text.includes('<') && text.includes('>');

  const systemPrompt = `You are a professional translator for a Spanish campervan rental company.
Translate the following Spanish text to ${targetLanguage}.
${isHtml ? 'Preserve all HTML tags and structure exactly.' : ''}
This is ${contentDesc}.
Only return the translated text, nothing else.
Maintain the same tone and style.`;

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
        max_tokens: Math.min(text.length * 2, 4000),
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

// Procesar una tabla
async function processTable(tableName, config) {
  console.log(`\n📋 Procesando tabla: ${tableName}`);
  console.log(`   Campos: ${config.fields.join(', ')}`);
  console.log(`   Idiomas: ${LOCALES.join(', ')}`);

  // Construir query
  let query = supabase.from(tableName).select('*');
  
  // Aplicar filtros
  Object.entries(config.filter).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

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
      const originalText = record[field];
      
      if (!originalText || originalText.trim() === '') {
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
