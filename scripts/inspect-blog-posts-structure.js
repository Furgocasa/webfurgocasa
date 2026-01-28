/**
 * Script para inspeccionar la estructura de la tabla posts
 * Muestra columnas, tipos y datos de ejemplo
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectBlogPosts() {
  console.log('🔍 Inspeccionando estructura de la tabla posts...\n');

  try {
    // 1. Obtener 3 posts de ejemplo con todos los campos
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('❌ Error al obtener posts:', error.message);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️ No se encontraron posts publicados');
      return;
    }

    console.log(`✅ Se encontraron ${posts.length} posts\n`);

    // 2. Mostrar estructura de columnas
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTRUCTURA DE COLUMNAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const firstPost = posts[0];
    const columns = Object.keys(firstPost);

    columns.forEach(col => {
      const value = firstPost[col];
      const type = value === null ? 'NULL' : typeof value;
      const preview = value === null 
        ? '(null)' 
        : type === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : type === 'object'
            ? JSON.stringify(value).substring(0, 50) + '...'
            : value;
      
      console.log(`  ${col.padEnd(25)} [${type.padEnd(7)}] ${preview}`);
    });

    // 3. Analizar campos de título
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 ANÁLISIS DE TÍTULOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    posts.forEach((post, i) => {
      console.log(`${i + 1}. Post ID: ${post.id}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   ─────────────────────────────────────`);
      console.log(`   🇪🇸 title:    ${post.title || '(vacío)'}`);
      console.log(`   🇪🇸 slug:     ${post.slug || '(vacío)'}`);
      console.log(`   🇬🇧 title_en: ${post.title_en || '(NULL)'}`);
      console.log(`   🇬🇧 slug_en:  ${post.slug_en || '(NULL)'}`);
      console.log(`   🇫🇷 slug_fr:  ${post.slug_fr || '(NULL)'}`);
      console.log(`   🇩🇪 slug_de:  ${post.slug_de || '(NULL)'}`);
      console.log('');
    });

    // 4. Estadísticas de traducciones
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 ESTADÍSTICAS DE TRADUCCIONES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data: allPosts, error: statsError } = await supabase
      .from('posts')
      .select('title, title_en, slug_en, slug_fr, slug_de, excerpt_en, content_en')
      .eq('status', 'published');

    if (statsError) {
      console.error('❌ Error al obtener estadísticas:', statsError.message);
      return;
    }

    const total = allPosts.length;
    const withTitleEn = allPosts.filter(p => p.title_en).length;
    const withSlugEn = allPosts.filter(p => p.slug_en).length;
    const withSlugFr = allPosts.filter(p => p.slug_fr).length;
    const withSlugDe = allPosts.filter(p => p.slug_de).length;
    const withExcerptEn = allPosts.filter(p => p.excerpt_en).length;
    const withContentEn = allPosts.filter(p => p.content_en).length;

    console.log(`  Total posts publicados:        ${total}`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  Con title_en:                  ${withTitleEn} (${Math.round(withTitleEn/total*100)}%)`);
    console.log(`  Con excerpt_en:                ${withExcerptEn} (${Math.round(withExcerptEn/total*100)}%)`);
    console.log(`  Con content_en:                ${withContentEn} (${Math.round(withContentEn/total*100)}%)`);
    console.log(`  Con slug_en:                   ${withSlugEn} (${Math.round(withSlugEn/total*100)}%)`);
    console.log(`  Con slug_fr:                   ${withSlugFr} (${Math.round(withSlugFr/total*100)}%)`);
    console.log(`  Con slug_de:                   ${withSlugDe} (${Math.round(withSlugDe/total*100)}%)`);

    // 5. Ver tabla content_translations
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 TABLA CONTENT_TRANSLATIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const { data: translations, error: transError } = await supabase
      .from('content_translations')
      .select('source_table, source_field, locale, count')
      .eq('source_table', 'posts');

    if (transError) {
      console.log('⚠️  Tabla content_translations no existe o está vacía');
    } else {
      // Agrupar por locale y field
      const byLocale = {};
      
      for (const trans of translations || []) {
        if (!byLocale[trans.locale]) {
          byLocale[trans.locale] = {};
        }
        if (!byLocale[trans.locale][trans.source_field]) {
          byLocale[trans.locale][trans.source_field] = 0;
        }
        byLocale[trans.locale][trans.source_field]++;
      }

      Object.keys(byLocale).forEach(locale => {
        console.log(`  ${locale}:`);
        Object.keys(byLocale[locale]).forEach(field => {
          console.log(`    - ${field}: ${byLocale[locale][field]} traducciones`);
        });
      });
    }

    console.log('\n✅ Inspección completada\n');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar
inspectBlogPosts();
