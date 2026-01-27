/**
 * Script para verificar qué posts tienen slugs traducidos
 * y generar los que faltan desde los títulos traducidos
 * 
 * Ejecutar: node scripts/verificar-slugs-traducidos.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

async function verificarSlugs() {
  console.log('🔍 Verificando slugs traducidos...\n');
  console.log('='.repeat(70));

  // Obtener todos los posts publicados
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, title_en, slug_en, slug_fr, slug_de')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ Error cargando posts:', error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log('⚠️  No hay posts publicados');
    return;
  }

  console.log(`📚 Total de posts publicados: ${posts.length}\n`);

  // Verificar traducciones de títulos en content_translations
  const { data: titleTranslations } = await supabase
    .from('content_translations')
    .select('source_id, locale, translated_text')
    .eq('source_table', 'posts')
    .eq('source_field', 'title')
    .in('locale', ['en', 'fr', 'de']);

  // Crear mapa de títulos traducidos
  const titleMap = new Map();
  if (titleTranslations) {
    titleTranslations.forEach(t => {
      const key = `${t.source_id}_${t.locale}`;
      titleMap.set(key, t.translated_text);
    });
  }

  // Analizar qué falta
  const stats = {
    en: { conSlug: 0, sinSlug: 0, conTitulo: 0 },
    fr: { conSlug: 0, sinSlug: 0, conTitulo: 0 },
    de: { conSlug: 0, sinSlug: 0, conTitulo: 0 }
  };

  const postsSinSlug = {
    en: [],
    fr: [],
    de: []
  };

  posts.forEach(post => {
    // Inglés
    if (post.title_en) {
      stats.en.conTitulo++;
      if (post.slug_en) {
        stats.en.conSlug++;
      } else {
        stats.en.sinSlug++;
        postsSinSlug.en.push({
          id: post.id,
          title: post.title,
          title_en: post.title_en,
          slug: post.slug
        });
      }
    } else {
      // Verificar en content_translations
      const titleEn = titleMap.get(`${post.id}_en`);
      if (titleEn) {
        stats.en.conTitulo++;
        if (!post.slug_en) {
          stats.en.sinSlug++;
          postsSinSlug.en.push({
            id: post.id,
            title: post.title,
            title_en: titleEn,
            slug: post.slug
          });
        } else {
          stats.en.conSlug++;
        }
      }
    }

    // Francés
    const titleFr = titleMap.get(`${post.id}_fr`);
    if (titleFr) {
      stats.fr.conTitulo++;
      if (post.slug_fr) {
        stats.fr.conSlug++;
      } else {
        stats.fr.sinSlug++;
        postsSinSlug.fr.push({
          id: post.id,
          title: post.title,
          title_fr: titleFr,
          slug: post.slug
        });
      }
    }

    // Alemán
    const titleDe = titleMap.get(`${post.id}_de`);
    if (titleDe) {
      stats.de.conTitulo++;
      if (post.slug_de) {
        stats.de.conSlug++;
      } else {
        stats.de.sinSlug++;
        postsSinSlug.de.push({
          id: post.id,
          title: post.title,
          title_de: titleDe,
          slug: post.slug
        });
      }
    }
  });

  // Mostrar resumen
  console.log('📊 RESUMEN DE SLUGS TRADUCIDOS:\n');
  
  ['en', 'fr', 'de'].forEach(locale => {
    const localeName = locale === 'en' ? 'Inglés' : locale === 'fr' ? 'Francés' : 'Alemán';
    console.log(`${localeName} (${locale}):`);
    console.log(`  📝 Posts con título traducido: ${stats[locale].conTitulo}`);
    console.log(`  ✅ Posts con slug traducido: ${stats[locale].conSlug}`);
    console.log(`  ❌ Posts SIN slug traducido: ${stats[locale].sinSlug}`);
    console.log('');
  });

  // Mostrar ejemplos
  console.log('='.repeat(70));
  console.log('📋 EJEMPLOS DE POSTS SIN SLUGS TRADUCIDOS:\n');

  ['en', 'fr', 'de'].forEach(locale => {
    const localeName = locale === 'en' ? 'Inglés' : locale === 'fr' ? 'Francés' : 'Alemán';
    if (postsSinSlug[locale].length > 0) {
      console.log(`${localeName} (${locale}) - Primeros 5:`);
      postsSinSlug[locale].slice(0, 5).forEach((post, idx) => {
        const titleKey = locale === 'en' ? 'title_en' : locale === 'fr' ? 'title_fr' : 'title_de';
        console.log(`  ${idx + 1}. "${post.title.substring(0, 50)}..."`);
        console.log(`     Título traducido: "${post[titleKey]?.substring(0, 50)}..."`);
        console.log(`     Slug actual: ${post.slug}`);
        const slugGenerado = generateSlug(post[titleKey] || '');
        console.log(`     Slug que debería tener: ${slugGenerado}`);
      });
      if (postsSinSlug[locale].length > 5) {
        console.log(`  ... y ${postsSinSlug[locale].length - 5} más`);
      }
      console.log('');
    }
  });

  // Resumen final
  const totalSinSlug = stats.en.sinSlug + stats.fr.sinSlug + stats.de.sinSlug;
  console.log('='.repeat(70));
  console.log('📊 RESUMEN GENERAL:');
  console.log(`  Total de slugs faltantes: ${totalSinSlug}`);
  console.log('='.repeat(70));

  if (totalSinSlug > 0) {
    console.log('\n💡 Para generar los slugs faltantes automáticamente, ejecuta:');
    console.log('   node scripts/generar-slugs-traducidos.js\n');
  } else {
    console.log('\n✅ ¡Todos los posts tienen slugs traducidos!\n');
  }

  return { postsSinSlug, stats };
}

verificarSlugs().catch(console.error);
