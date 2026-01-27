/**
 * Script para traducir TODOS los artículos del blog a inglés, francés y alemán
 * Guarda TODO en content_translations (sistema unificado)
 * También actualiza columnas title_en, excerpt_en, content_en para compatibilidad
 * 
 * Ejecutar: node scripts/traducir-blog-completo.js
 * 
 * IMPORTANTE: 
 * 1. Requiere OPENAI_API_KEY en .env.local
 * 2. Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local
 * 3. Solo traduce posts que NO tienen traducción aún
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// ⚠️ IMPORTANTE: Usar SERVICE_ROLE_KEY para tener permisos de escritura
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY no encontrada en .env.local');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no encontrada en .env.local');
  process.exit(1);
}

// Idiomas objetivo
const TARGET_LOCALES = ['en', 'fr', 'de'];
const LOCALE_NAMES = {
  en: 'Inglés',
  fr: 'Francés',
  de: 'Alemán'
};

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

// Función para traducir texto con OpenAI
async function translateWithOpenAI(text, locale, context = 'general') {
  if (!text || text.trim() === '') return '';

  const localeNames = {
    en: 'English',
    fr: 'French',
    de: 'German'
  };

  const systemPrompts = {
    title: `You are a professional translator specializing in travel and campervan blog content. Translate the following blog post title from Spanish to ${localeNames[locale]}. Keep it engaging, SEO-friendly, and natural. Maintain the same tone and style.`,
    excerpt: `You are a professional translator specializing in travel and campervan blog content. Translate the following blog post excerpt/summary from Spanish to ${localeNames[locale]}. Keep it concise, engaging, and natural. Maintain the same tone.`,
    content: `You are a professional translator specializing in travel and campervan blog content. Translate the following blog post content from Spanish to ${localeNames[locale]}. Maintain all HTML tags, formatting, links, and structure exactly as they are. Keep the same tone, style, and SEO keywords. Be natural and fluent.`
  };

  try {
    const systemPrompt = systemPrompts[context] || systemPrompts.content;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: context === 'title' ? 100 : context === 'excerpt' ? 300 : 4000,
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
    console.error(`❌ Error traduciendo: ${error.message}`);
    throw error;
  }
}

// Verificar qué traducciones faltan
async function checkMissingTranslations() {
  console.log('🔍 Verificando traducciones faltantes...\n');

  // Obtener todos los posts publicados
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, slug, title_en, excerpt_en, content_en')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ Error cargando posts:', error);
    return null;
  }

  if (!posts || posts.length === 0) {
    console.log('⚠️  No hay posts publicados');
    return null;
  }

  console.log(`📚 Total de posts publicados: ${posts.length}\n`);

  // Verificar traducciones existentes en content_translations
  const { data: existingTranslations } = await supabase
    .from('content_translations')
    .select('source_id, source_field, locale')
    .eq('source_table', 'posts')
    .in('locale', TARGET_LOCALES)
    .in('source_field', ['title', 'excerpt', 'content']);

  // Crear mapa de traducciones existentes
  const translationsMap = new Map();
  if (existingTranslations) {
    existingTranslations.forEach(t => {
      const key = `${t.source_id}_${t.source_field}_${t.locale}`;
      translationsMap.set(key, true);
    });
  }

  // Analizar qué falta
  const missing = {
    en: { title: [], excerpt: [], content: [] },
    fr: { title: [], excerpt: [], content: [] },
    de: { title: [], excerpt: [], content: [] }
  };

  posts.forEach(post => {
    TARGET_LOCALES.forEach(locale => {
      // Verificar en content_translations
      const hasTitle = translationsMap.has(`${post.id}_title_${locale}`);
      const hasExcerpt = translationsMap.has(`${post.id}_excerpt_${locale}`);
      const hasContent = translationsMap.has(`${post.id}_content_${locale}`);

      // Para inglés, también verificar columnas
      if (locale === 'en') {
        if (!post.title_en) missing.en.title.push(post.id);
        if (!post.excerpt_en && post.excerpt) missing.en.excerpt.push(post.id);
        if (!post.content_en) missing.en.content.push(post.id);
      } else {
        if (!hasTitle) missing[locale].title.push(post.id);
        if (!hasExcerpt && post.excerpt) missing[locale].excerpt.push(post.id);
        if (!hasContent) missing[locale].content.push(post.id);
      }
    });
  });

  // Mostrar resumen
  console.log('📊 RESUMEN DE TRADUCCIONES FALTANTES:\n');
  TARGET_LOCALES.forEach(locale => {
    const total = missing[locale].title.length + missing[locale].excerpt.length + missing[locale].content.length;
    console.log(`${LOCALE_NAMES[locale]} (${locale}):`);
    console.log(`  - Títulos faltantes: ${missing[locale].title.length}`);
    console.log(`  - Excerpts faltantes: ${missing[locale].excerpt.length}`);
    console.log(`  - Contenidos faltantes: ${missing[locale].content.length}`);
    console.log(`  - Total campos a traducir: ${total}\n`);
  });

  return { posts, missing };
}

// Guardar traducción en content_translations
async function saveTranslation(postId, field, locale, translatedText) {
  const { error } = await supabase
    .from('content_translations')
    .upsert({
      source_table: 'posts',
      source_id: postId,
      source_field: field,
      locale: locale,
      translated_text: translatedText,
      is_auto_translated: true,
      translation_model: 'gpt-4o-mini'
    }, {
      onConflict: 'source_table,source_id,source_field,locale'
    });

  if (error) {
    throw new Error(`Error guardando traducción: ${error.message}`);
  }
}

// Traducir un post completo
async function translatePost(post, locale) {
  const results = {
    title: null,
    excerpt: null,
    content: null,
    slug: null
  };

  try {
    // Traducir título
    if (post.title) {
      console.log(`      📝 Traduciendo título...`);
      results.title = await translateWithOpenAI(post.title, locale, 'title');
      // Sin pausa aquí para acelerar
    }

    // Traducir excerpt
    if (post.excerpt) {
      console.log(`      📝 Traduciendo excerpt...`);
      results.excerpt = await translateWithOpenAI(post.excerpt, locale, 'excerpt');
      // Sin pausa aquí para acelerar
    }

    // Traducir contenido
    if (post.content) {
      console.log(`      📝 Traduciendo contenido (esto puede tardar)...`);
      results.content = await translateWithOpenAI(post.content, locale, 'content');
      // Sin pausa aquí para acelerar
    }

    // Generar slug desde título traducido
    if (results.title) {
      results.slug = generateSlug(results.title);
    }

    return results;
  } catch (error) {
    console.error(`      ❌ Error traduciendo: ${error.message}`);
    throw error;
  }
}

// Función principal
async function translateAllPosts() {
  console.log('🚀 Iniciando traducción completa del blog...\n');
  console.log('='.repeat(70));

  // Verificar qué falta
  const analysis = await checkMissingTranslations();
  if (!analysis) {
    return;
  }

  const { posts, missing } = analysis;

  // Crear mapa de posts por ID
  const postsMap = new Map();
  posts.forEach(p => postsMap.set(p.id, p));

  let totalTranslated = 0;
  let totalErrors = 0;

  // Procesar cada idioma
  for (const locale of TARGET_LOCALES) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🌐 TRADUCIENDO A ${LOCALE_NAMES[locale].toUpperCase()} (${locale})`);
    console.log('='.repeat(70));

    // Obtener IDs únicos de posts que necesitan traducción
    const postIdsToTranslate = new Set([
      ...missing[locale].title,
      ...missing[locale].excerpt,
      ...missing[locale].content
    ]);

    const postsToTranslate = Array.from(postIdsToTranslate)
      .map(id => postsMap.get(id))
      .filter(p => p);

    console.log(`\n📚 Posts a traducir: ${postsToTranslate.length}\n`);

    for (let i = 0; i < postsToTranslate.length; i++) {
      const post = postsToTranslate[i];
      console.log(`\n[${i + 1}/${postsToTranslate.length}] ${LOCALE_NAMES[locale]}: "${post.title.substring(0, 60)}..."`);

      try {
        // Traducir el post
        const translations = await translatePost(post, locale);

        // Guardar en content_translations
        console.log(`      💾 Guardando traducciones en content_translations...`);
        
        if (translations.title) {
          await saveTranslation(post.id, 'title', locale, translations.title);
        }
        if (translations.excerpt) {
          await saveTranslation(post.id, 'excerpt', locale, translations.excerpt);
        }
        if (translations.content) {
          await saveTranslation(post.id, 'content', locale, translations.content);
        }

        // Para inglés, también actualizar columnas de posts (compatibilidad)
        if (locale === 'en') {
          const updateData = {};
          if (translations.title) updateData.title_en = translations.title;
          if (translations.excerpt) updateData.excerpt_en = translations.excerpt;
          if (translations.content) updateData.content_en = translations.content;
          if (translations.slug) updateData.slug_en = translations.slug;

          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
              .from('posts')
              .update(updateData)
              .eq('id', post.id);

            if (updateError) {
              console.error(`      ⚠️  Error actualizando columnas: ${updateError.message}`);
            }
          }
        }

        // Para francés y alemán, también guardar slugs en posts
        if ((locale === 'fr' || locale === 'de') && translations.slug) {
          const slugColumn = locale === 'fr' ? 'slug_fr' : 'slug_de';
          const { error: slugError } = await supabase
            .from('posts')
            .update({ [slugColumn]: translations.slug })
            .eq('id', post.id);

          if (slugError) {
            console.error(`      ⚠️  Error actualizando slug: ${slugError.message}`);
          }
        }

        console.log(`      ✅ Traducción completada`);
        totalTranslated++;

        // Pausa entre posts (reducida para acelerar)
        if (i < postsToTranslate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`      ❌ Error: ${error.message}`);
        totalErrors++;
      }
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(70));
  console.log(`✅ Traducciones completadas: ${totalTranslated}`);
  console.log(`❌ Errores: ${totalErrors}`);
  console.log('='.repeat(70));
  console.log('\n🎉 ¡Proceso completado!');
  console.log('\n💡 Todas las traducciones están guardadas en content_translations');
  console.log('💡 Las traducciones al inglés también están en las columnas title_en, excerpt_en, content_en');
}

// Ejecutar
translateAllPosts().catch(console.error);
