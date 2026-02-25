/**
 * Script para traducir artículos del blog usando OpenAI
 * 
 * Uso:
 *   node translate-blog-content.js                    → Traduce TODOS los posts sin traducción (solo inglés, modo legacy)
 *   node translate-blog-content.js <slug>              → Re-traduce UN artículo específico a EN, FR, DE
 * 
 * Ejemplo para re-traducir artículo modificado:
 *   node translate-blog-content.js ruta-en-camper-por-la-toscana-espanola-los-pueblos-de-guadalajara-en-autocaravana
 * 
 * IMPORTANTE: 
 * 1. Antes de ejecutar, asegúrate de tener OPENAI_API_KEY en .env.local
 * 2. Con slug: guarda en content_translations (EN, FR, DE) y actualiza slugs en posts
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Slug opcional como argumento
const SLUG_ARG = process.argv[2];

// ⚠️ IMPORTANTE: Usar SERVICE_ROLE_KEY para tener permisos de escritura
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

console.log('🔑 Usando key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE (con permisos de escritura)' : 'ANON_KEY (puede no tener permisos)');

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY no encontrada en .env.local');
  console.error('   Agrega OPENAI_API_KEY=tu-api-key o NEXT_PUBLIC_OPENAI_API_KEY=tu-api-key');
  process.exit(1);
}

const LOCALE_NAMES = { en: 'English', fr: 'French', de: 'German' };

// Función para generar slug desde texto
function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-'); // Múltiples guiones a uno solo
}

// Función para traducir texto con OpenAI (acepta idioma destino)
async function translateWithOpenAI(text, context = 'general', targetLocale = 'en') {
  if (!text || text.trim() === '') return '';

  const targetLang = LOCALE_NAMES[targetLocale] || 'English';
  const isHtml = context === 'content' && text.includes('<') && text.includes('>');

  const contextHints = {
    title: `a blog post title. Keep it engaging, SEO-friendly, and natural.`,
    excerpt: `a brief excerpt/summary. Keep it concise, engaging, and natural.`,
    content: `article content. ${isHtml ? 'Maintain all HTML tags, formatting, links, and structure exactly as they are.' : ''} Keep the same tone, style, and SEO keywords. Be natural and fluent.`
  };
  const hint = contextHints[context] || 'text content';

  const systemPrompt = `You are a professional translator specializing in travel and campervan blog content. 
Translate the following Spanish text to ${targetLang}.
The text is ${hint}
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
        max_tokens: context === 'title' ? 150 : context === 'excerpt' ? 400 : 4000,
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
    return text;
  }
}

// Función para agregar columnas de traducción si no existen
async function ensureTranslationColumns() {
  console.log('📋 Verificando columnas de traducción...');
  
  try {
    // Intentar hacer un SELECT para ver si las columnas existen
    const { error } = await supabase
      .from('posts')
      .select('title_en, excerpt_en, content_en')
      .limit(1);

    if (error) {
      console.log('⚠️  Las columnas de traducción no existen. Por favor, ejecuta este SQL en Supabase:');
      console.log('\n--- SQL MIGRATION ---');
      console.log(`
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
ADD COLUMN IF NOT EXISTS content_en TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_title_en ON posts(title_en);
      `);
      console.log('--- FIN SQL ---\n');
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      return new Promise((resolve) => {
        readline.question('¿Has ejecutado el SQL? (s/n): ', (answer) => {
          readline.close();
          if (answer.toLowerCase() === 's') {
            console.log('✅ Continuando...\n');
            resolve(true);
          } else {
            console.log('❌ Abortando. Ejecuta el SQL primero.');
            process.exit(0);
          }
        });
      });
    } else {
      console.log('✅ Columnas de traducción encontradas.\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Error verificando columnas:', error);
    return false;
  }
}

// ========== MODO: Re-traducir UN artículo específico a EN, FR, DE ==========
async function translateSinglePost(slug) {
  console.log('🚀 Re-traduciendo artículo específico a EN, FR, DE...\n');
  console.log(`   Slug buscado: ${slug}\n`);

  const { data: post, error } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, slug, meta_title, meta_description')
    .eq('status', 'published')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    console.error('❌ No se encontró el artículo con slug:', slug);
    console.error('   Verifica que el slug sea correcto (ej: ruta-en-camper-por-la-toscana-espanola-los-pueblos-de-guadalajara-en-autocaravana)');
    process.exit(1);
  }

  console.log(`📄 Artículo: "${post.title}"\n`);

  const locales = ['en', 'fr', 'de'];
  const fields = ['title', 'excerpt', 'content', 'meta_title', 'meta_description'];

  for (const locale of locales) {
    console.log(`\n🌐 === ${locale.toUpperCase()} ===`);
    const translations = {};

    for (const field of fields) {
      const value = post[field];
      if (!value || (typeof value === 'string' && !value.trim())) continue;

      console.log(`   📝 Traduciendo ${field}...`);
      const translated = await translateWithOpenAI(value, field === 'title' ? 'title' : field === 'excerpt' ? 'excerpt' : 'content', locale);
      translations[field] = translated;
      await new Promise(r => setTimeout(r, 800));
    }

    // Guardar en content_translations
    for (const [field, text] of Object.entries(translations)) {
      const { error: upsertErr } = await supabase
        .from('content_translations')
        .upsert({
          source_table: 'posts',
          source_id: post.id,
          source_field: field,
          locale,
          translated_text: text,
          is_auto_translated: true,
          translation_model: 'gpt-4o-mini',
        }, { onConflict: 'source_table,source_id,source_field,locale' });

      if (upsertErr) {
        console.error(`   ❌ Error guardando ${field} (${locale}):`, upsertErr.message);
      }
    }
    console.log(`   ✅ ${locale.toUpperCase()} guardado en content_translations`);
  }

  // Actualizar slugs en posts desde títulos traducidos
  const slugUpdates = {};
  for (const locale of locales) {
    const { data: titleRow } = await supabase
      .from('content_translations')
      .select('translated_text')
      .eq('source_table', 'posts')
      .eq('source_id', post.id)
      .eq('source_field', 'title')
      .eq('locale', locale)
      .single();

    const col = locale === 'en' ? 'slug_en' : locale === 'fr' ? 'slug_fr' : 'slug_de';
    slugUpdates[col] = titleRow?.translated_text ? generateSlug(titleRow.translated_text) : null;
  }

  // También actualizar columnas legacy para inglés
  const { data: titleEn } = await supabase
    .from('content_translations')
    .select('translated_text')
    .eq('source_table', 'posts')
    .eq('source_id', post.id)
    .eq('source_field', 'title')
    .eq('locale', 'en')
    .single();

  const postUpdates = { ...slugUpdates };
  if (titleEn?.translated_text) {
    postUpdates.slug_en = generateSlug(titleEn.translated_text);
    postUpdates.title_en = titleEn.translated_text;
  }
  const { data: excerptEn } = await supabase.from('content_translations').select('translated_text')
    .eq('source_table', 'posts').eq('source_id', post.id).eq('source_field', 'excerpt').eq('locale', 'en').single();
  const { data: contentEn } = await supabase.from('content_translations').select('translated_text')
    .eq('source_table', 'posts').eq('source_id', post.id).eq('source_field', 'content').eq('locale', 'en').single();
  if (excerptEn?.translated_text) postUpdates.excerpt_en = excerptEn.translated_text;
  if (contentEn?.translated_text) postUpdates.content_en = contentEn.translated_text;

  const { error: updateErr } = await supabase.from('posts').update(postUpdates).eq('id', post.id);
  if (updateErr) {
    console.error('   ⚠️ Error actualizando slugs en posts:', updateErr.message);
  } else {
    console.log('\n   ✅ Slugs actualizados en posts (slug_en, slug_fr, slug_de)');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 ¡Re-traducción completada!');
  console.log('   El artículo está traducido a EN, FR y DE.');
  console.log('='.repeat(60));
}

// ========== MODO: Traducir TODOS los posts sin traducción (solo inglés, legacy) ==========
async function translateAllPosts() {
  console.log('🚀 Iniciando traducción de artículos del blog (modo legacy: solo inglés)...\n');

  await ensureTranslationColumns();

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, slug')
    .eq('status', 'published')
    .or('title_en.is.null,title_en.eq.')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ Error cargando posts:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('✅ ¡Todos los posts ya están traducidos!');
    return;
  }

  console.log(`📚 Encontrados ${posts.length} posts por traducir.\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`\n[${i + 1}/${posts.length}] Traduciendo: "${post.title}"`);
    console.log(`   Slug: ${post.slug}`);

    try {
      console.log('   📝 Traduciendo título...');
      const titleEn = await translateWithOpenAI(post.title, 'title', 'en');
      const slugEn = generateSlug(titleEn);
      console.log(`   🔗 Slug generado: ${slugEn}`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('   📝 Traduciendo excerpt...');
      const excerptEn = post.excerpt ? await translateWithOpenAI(post.excerpt, 'excerpt', 'en') : null;
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('   📝 Traduciendo contenido (esto puede tardar)...');
      const contentEn = post.content ? await translateWithOpenAI(post.content, 'content', 'en') : null;

      console.log('   💾 Guardando traducción...');
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          title_en: titleEn,
          slug_en: slugEn,
          excerpt_en: excerptEn,
          content_en: contentEn,
        })
        .eq('id', post.id);

      if (updateError) {
        console.error('   ❌ Error en UPDATE:', updateError);
        throw updateError;
      }

      console.log('   ✅ ¡Traducción completada!');
      successCount++;

      if (i < posts.length - 1) {
        console.log('   ⏳ Esperando 2 segundos antes del siguiente...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.error(`   ❌ Error traduciendo post ${post.id}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE TRADUCCIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Posts traducidos exitosamente: ${successCount}`);
  console.log(`❌ Posts con errores: ${errorCount}`);
  console.log(`📚 Total procesados: ${posts.length}`);
  console.log('='.repeat(60));
  console.log('\n🎉 ¡Proceso completado!');
}

// Ejecutar
if (SLUG_ARG) {
  translateSinglePost(SLUG_ARG).catch(console.error);
} else {
  translateAllPosts().catch(console.error);
}
