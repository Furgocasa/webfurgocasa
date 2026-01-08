/**
 * Script para traducir TODOS los artículos del blog a inglés usando OpenAI
 * Ejecutar una sola vez con: node translate-blog-content.js
 * 
 * IMPORTANTE: 
 * 1. Antes de ejecutar, asegúrate de tener NEXT_PUBLIC_OPENAI_API_KEY en .env
 * 2. Este script agregará las columnas title_en, excerpt_en, content_en si no existen
 * 3. Solo traducirá posts que NO tengan traducción aún
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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
async function translateWithOpenAI(text, context = 'general') {
  if (!text || text.trim() === '') return '';

  try {
    const systemPrompt = context === 'title' 
      ? 'You are a professional translator specializing in travel and campervan blog content. Translate the following blog post title from Spanish to English. Keep it engaging, SEO-friendly, and natural. Maintain the same tone and style.'
      : context === 'excerpt'
      ? 'You are a professional translator specializing in travel and campervan blog content. Translate the following blog post excerpt/summary from Spanish to English. Keep it concise, engaging, and natural. Maintain the same tone.'
      : 'You are a professional translator specializing in travel and campervan blog content. Translate the following blog post content from Spanish to English. Maintain all HTML tags, formatting, links, and structure exactly as they are. Keep the same tone, style, and SEO keywords. Be natural and fluent.';

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
    return text; // Fallback al texto original
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

// Función principal de traducción
async function translateAllPosts() {
  console.log('🚀 Iniciando traducción de artículos del blog...\n');

  await ensureTranslationColumns();

  // Obtener todos los posts publicados que NO tienen traducción
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
      // Traducir título
      console.log('   📝 Traduciendo título...');
      const titleEn = await translateWithOpenAI(post.title, 'title');
      
      // Generar slug en inglés desde el título traducido
      const slugEn = generateSlug(titleEn);
      console.log(`   🔗 Slug generado: ${slugEn}`);
      
      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Traducir excerpt
      console.log('   📝 Traduciendo excerpt...');
      const excerptEn = post.excerpt ? await translateWithOpenAI(post.excerpt, 'excerpt') : null;
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Traducir contenido
      console.log('   📝 Traduciendo contenido (esto puede tardar)...');
      const contentEn = post.content ? await translateWithOpenAI(post.content, 'content') : null;
      
      // Guardar en BD
      console.log('   💾 Guardando traducción...');
      console.log(`   📊 Datos a guardar:`, {
        title_en: titleEn ? titleEn.substring(0, 50) + '...' : 'NULL',
        slug_en: slugEn || 'NULL',
        excerpt_en: excerptEn ? 'OK' : 'NULL',
        content_en: contentEn ? 'OK' : 'NULL'
      });
      
      const { data: updateData, error: updateError } = await supabase
        .from('posts')
        .update({
          title_en: titleEn,
          slug_en: slugEn,
          excerpt_en: excerptEn,
          content_en: contentEn,
        })
        .eq('id', post.id)
        .select();

      if (updateError) {
        console.error('   ❌ Error en UPDATE:', updateError);
        throw updateError;
      }

      console.log('   ✅ Actualización exitosa:', updateData ? 'Datos actualizados' : 'Sin datos retornados');
      console.log('   ✅ ¡Traducción completada!');
      successCount++;

      // Pausa más larga entre posts para no saturar la API
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
translateAllPosts().catch(console.error);
