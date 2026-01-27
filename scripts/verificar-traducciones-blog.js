/**
 * Script para VERIFICAR el estado de traducciones del blog
 * Muestra qué posts faltan por traducir a cada idioma
 * 
 * Ejecutar: node scripts/verificar-traducciones-blog.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TARGET_LOCALES = ['en', 'fr', 'de'];
const LOCALE_NAMES = {
  en: 'Inglés',
  fr: 'Francés',
  de: 'Alemán'
};

async function verificarTraducciones() {
  console.log('🔍 Verificando estado de traducciones del blog...\n');
  console.log('='.repeat(70));

  // Obtener todos los posts publicados
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, excerpt, content, slug, title_en, excerpt_en, content_en, slug_en, slug_fr, slug_de')
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
  const stats = {
    en: { title: 0, excerpt: 0, content: 0, total: 0 },
    fr: { title: 0, excerpt: 0, content: 0, total: 0 },
    de: { title: 0, excerpt: 0, content: 0, total: 0 }
  };

  const missingPosts = {
    en: [],
    fr: [],
    de: []
  };

  posts.forEach(post => {
    TARGET_LOCALES.forEach(locale => {
      let needsTranslation = false;

      // Verificar título
      if (locale === 'en') {
        if (!post.title_en) {
          stats.en.title++;
          needsTranslation = true;
        }
      } else {
        if (!translationsMap.has(`${post.id}_title_${locale}`)) {
          stats[locale].title++;
          needsTranslation = true;
        }
      }

      // Verificar excerpt
      if (post.excerpt) {
        if (locale === 'en') {
          if (!post.excerpt_en) {
            stats.en.excerpt++;
            needsTranslation = true;
          }
        } else {
          if (!translationsMap.has(`${post.id}_excerpt_${locale}`)) {
            stats[locale].excerpt++;
            needsTranslation = true;
          }
        }
      }

      // Verificar contenido
      if (locale === 'en') {
        if (!post.content_en) {
          stats.en.content++;
          needsTranslation = true;
        }
      } else {
        if (!translationsMap.has(`${post.id}_content_${locale}`)) {
          stats[locale].content++;
          needsTranslation = true;
        }
      }

      if (needsTranslation && !missingPosts[locale].find(p => p.id === post.id)) {
        missingPosts[locale].push({
          id: post.id,
          title: post.title.substring(0, 60) + '...',
          slug: post.slug
        });
      }
    });
  });

  // Calcular totales
  TARGET_LOCALES.forEach(locale => {
    stats[locale].total = stats[locale].title + stats[locale].excerpt + stats[locale].content;
  });

  // Mostrar resumen
  console.log('📊 RESUMEN POR IDIOMA:\n');
  TARGET_LOCALES.forEach(locale => {
    const totalPosts = posts.length;
    const postsWithMissing = missingPosts[locale].length;
    const percentage = ((totalPosts - postsWithMissing) / totalPosts * 100).toFixed(1);

    console.log(`${LOCALE_NAMES[locale]} (${locale}):`);
    console.log(`  📝 Títulos faltantes: ${stats[locale].title}`);
    console.log(`  📄 Excerpts faltantes: ${stats[locale].excerpt}`);
    console.log(`  📖 Contenidos faltantes: ${stats[locale].content}`);
    console.log(`  📊 Total campos a traducir: ${stats[locale].total}`);
    console.log(`  📚 Posts con traducciones faltantes: ${postsWithMissing} de ${totalPosts} (${percentage}% completado)`);
    console.log('');
  });

  // Mostrar algunos ejemplos de posts faltantes
  console.log('='.repeat(70));
  console.log('📋 EJEMPLOS DE POSTS CON TRADUCCIONES FALTANTES:\n');

  TARGET_LOCALES.forEach(locale => {
    if (missingPosts[locale].length > 0) {
      console.log(`${LOCALE_NAMES[locale]} (${locale}) - Primeros 5:`);
      missingPosts[locale].slice(0, 5).forEach((post, idx) => {
        console.log(`  ${idx + 1}. ${post.title}`);
        console.log(`     Slug: ${post.slug}`);
      });
      if (missingPosts[locale].length > 5) {
        console.log(`  ... y ${missingPosts[locale].length - 5} más`);
      }
      console.log('');
    }
  });

  // Resumen final
  const totalMissing = stats.en.total + stats.fr.total + stats.de.total;
  console.log('='.repeat(70));
  console.log('📊 RESUMEN GENERAL:');
  console.log(`  Total de campos a traducir: ${totalMissing}`);
  console.log(`  Posts afectados: ${new Set([...missingPosts.en, ...missingPosts.fr, ...missingPosts.de].map(p => p.id)).size}`);
  console.log('='.repeat(70));

  if (totalMissing > 0) {
    console.log('\n💡 Para traducir todo automáticamente, ejecuta:');
    console.log('   node scripts/traducir-blog-completo.js\n');
  } else {
    console.log('\n✅ ¡Todos los posts están traducidos!\n');
  }
}

verificarTraducciones().catch(console.error);
