/**
 * Script para traducir los fragmentos de content_sections (JSON) de location_targets
 * hacia content_translations (EN, FR, DE).
 * 
 * Uso:
 *   node scripts/translate-location-content-sections.js           (Traduce todos los location_targets que faltan por traducir en content_sections)
 *   node scripts/translate-location-content-sections.js <slug>    (Solo traduce una ciudad específica)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SLUG_ARG = process.argv[2];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY no encontrada en .env.local');
  process.exit(1);
}

const LOCALE_NAMES = { en: 'English', fr: 'French', de: 'German' };
const LOCALES = ['en', 'fr', 'de'];

/**
 * Llama a OpenAI para traducir. Devuelve el JSON resultante si isJson = true.
 */
async function translateWithOpenAI(text, targetLocale, isHtml = false) {
  if (!text || text.trim() === '') return '';
  const targetLang = LOCALE_NAMES[targetLocale];

  const systemPrompt = `You are a professional translator specializing in travel and campervan content.
Translate the following Spanish text to ${targetLang}.
${isHtml ? 'The text contains HTML. Maintain all HTML tags, formatting, and structure exactly as they are. DO NOT translate HTML tags.' : ''}
Only return the translated text, nothing else. Do not add explanations.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const translation = data.choices[0]?.message?.content || text;
    return translation.trim();
  } catch (error) {
    console.error(`❌ Error traduciendo (${targetLocale}): ${error.message}`);
    return null;
  }
}

async function saveTranslation(sourceId, sourceField, locale, translatedText) {
  if (!translatedText) return;
  const { error } = await supabase
    .from('content_translations')
    .upsert({
      source_table: 'location_targets',
      source_id: sourceId,
      source_field: sourceField,
      locale,
      translated_text: translatedText,
      is_auto_translated: true,
      translation_model: 'gpt-4o-mini',
    }, { onConflict: 'source_table,source_id,source_field,locale' });

  if (error) {
    console.error(`   ❌ Error guardando ${sourceField} (${locale}):`, error.message);
  }
}

/**
 * Traduce un JSONB de content_sections para una ubicación.
 * Extrae los fragmentos, traduce campo por campo (title, description, name, etc) y guarda en DB con `content_sections.XXX`
 */
async function processLocationContent(location) {
  console.log(`\n======================================================`);
  console.log(`📍 Procesando: ${location.name} (${location.slug})`);
  console.log(`======================================================`);

  const cs = location.content_sections;
  if (!cs || typeof cs !== 'object') {
    console.log(`   ⏭️  Sin content_sections válido.`);
    return;
  }

  for (const locale of LOCALES) {
    console.log(`\n🌐 === ${locale.toUpperCase()} ===`);
    let translatedCount = 0;

    // 1. Introduction (HTML)
    if (cs.introduction) {
      const sf = 'content_sections.introduction';
      console.log(`   📝 Traduciendo ${sf}...`);
      const txt = await translateWithOpenAI(cs.introduction, locale, true);
      await saveTranslation(location.id, sf, locale, txt);
      translatedCount++;
      await new Promise(r => setTimeout(r, 500));
    }

    // 2. Gastronomy (HTML)
    if (cs.gastronomy) {
      const sf = 'content_sections.gastronomy';
      console.log(`   📝 Traduciendo ${sf}...`);
      const txt = await translateWithOpenAI(cs.gastronomy, locale, true);
      await saveTranslation(location.id, sf, locale, txt);
      translatedCount++;
      await new Promise(r => setTimeout(r, 500));
    }

    // 3. Practical Tips (HTML)
    if (cs.practical_tips) {
      const sf = 'content_sections.practical_tips';
      console.log(`   📝 Traduciendo ${sf}...`);
      const txt = await translateWithOpenAI(cs.practical_tips, locale, true);
      await saveTranslation(location.id, sf, locale, txt);
      translatedCount++;
      await new Promise(r => setTimeout(r, 500));
    }

    // 4. Attractions (Array of objects: title, description)
    if (Array.isArray(cs.attractions)) {
      for (let i = 0; i < cs.attractions.length; i++) {
        const item = cs.attractions[i];
        if (item.title) {
          const sf = `content_sections.attractions[${i}].title`;
          console.log(`   📝 Traduciendo ${sf}...`);
          const txt = await translateWithOpenAI(item.title, locale, false);
          await saveTranslation(location.id, sf, locale, txt);
          translatedCount++;
        }
        if (item.description) {
          const sf = `content_sections.attractions[${i}].description`;
          console.log(`   📝 Traduciendo ${sf}...`);
          const txt = await translateWithOpenAI(item.description, locale, true);
          await saveTranslation(location.id, sf, locale, txt);
          translatedCount++;
        }
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // 5. Parking Areas (Array of objects: name, description, approximate_location)
    if (Array.isArray(cs.parking_areas)) {
      for (let i = 0; i < cs.parking_areas.length; i++) {
        const item = cs.parking_areas[i];
        if (item.name) {
          const sf = `content_sections.parking_areas[${i}].name`;
          console.log(`   📝 Traduciendo ${sf}...`);
          const txt = await translateWithOpenAI(item.name, locale, false);
          await saveTranslation(location.id, sf, locale, txt);
          translatedCount++;
        }
        if (item.description) {
          const sf = `content_sections.parking_areas[${i}].description`;
          console.log(`   📝 Traduciendo ${sf}...`);
          const txt = await translateWithOpenAI(item.description, locale, true);
          await saveTranslation(location.id, sf, locale, txt);
          translatedCount++;
        }
        if (item.approximate_location) {
          const sf = `content_sections.parking_areas[${i}].approximate_location`;
          console.log(`   📝 Traduciendo ${sf}...`);
          const txt = await translateWithOpenAI(item.approximate_location, locale, false);
          await saveTranslation(location.id, sf, locale, txt);
          translatedCount++;
        }
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // 6. Routes (Array of objects: title, description, duration, difficulty)
    if (Array.isArray(cs.routes)) {
      for (let i = 0; i < cs.routes.length; i++) {
        const item = cs.routes[i];
        if (item.title) {
          const sf = `content_sections.routes[${i}].title`;
          console.log(`   📝 Traduciendo ${sf}...`);
          const txt = await translateWithOpenAI(item.title, locale, false);
          await saveTranslation(location.id, sf, locale, txt);
          translatedCount++;
        }
        if (item.description) {
          const sf = `content_sections.routes[${i}].description`;
          console.log(`   📝 Traduciendo ${sf}...`);
          const txt = await translateWithOpenAI(item.description, locale, true);
          await saveTranslation(location.id, sf, locale, txt);
          translatedCount++;
        }
        if (item.duration) {
          const sf = `content_sections.routes[${i}].duration`;
          console.log(`   📝 Traduciendo ${sf}...`);
          const txt = await translateWithOpenAI(item.duration, locale, false);
          await saveTranslation(location.id, sf, locale, txt);
          translatedCount++;
        }
        if (item.difficulty) {
          const sf = `content_sections.routes[${i}].difficulty`;
          console.log(`   📝 Traduciendo ${sf}...`);
          const txt = await translateWithOpenAI(item.difficulty, locale, false);
          await saveTranslation(location.id, sf, locale, txt);
          translatedCount++;
        }
        await new Promise(r => setTimeout(r, 500));
      }
    }

    console.log(`   ✅ Guardados ${translatedCount} fragmentos en ${locale.toUpperCase()}.`);
  }
}

async function main() {
  console.log('🚀 Iniciando traducción de content_sections...');

  let query = supabase
    .from('location_targets')
    .select('id, slug, name, content_sections')
    .eq('is_active', true)
    .not('content_sections', 'is', null);

  if (SLUG_ARG) {
    query = query.eq('slug', SLUG_ARG);
  }

  const { data: locations, error } = await query;

  if (error) {
    console.error('❌ Error obteniendo ubicaciones:', error);
    process.exit(1);
  }

  console.log(`📍 Encontradas ${locations.length} ubicaciones para procesar.\n`);

  for (const loc of locations) {
    // Verificamos si ya está traducido revisando si existe la intro en inglés
    if (!SLUG_ARG) {
      const { data: existing } = await supabase
        .from('content_translations')
        .select('id')
        .eq('source_table', 'location_targets')
        .eq('source_id', loc.id)
        .eq('source_field', 'content_sections.introduction')
        .eq('locale', 'en')
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Saltando ${loc.name} - Ya tiene traducciones en content_sections.`);
        continue;
      }
    }

    await processLocationContent(loc);
  }

  console.log('\n✨ Proceso completado.');
}

main().catch(console.error);