/**
 * Script para listar todos los títulos del blog
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listBlogTitles() {
  console.log('📋 Lista de Artículos del Blog\n');

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, title_en, slug, category_id, status, published_at, views')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    // Obtener categorías
    const { data: categories } = await supabase
      .from('content_categories')
      .select('id, name, slug');

    const catMap = {};
    categories?.forEach(cat => {
      catMap[cat.id] = cat;
    });

    console.log(`Total de artículos: ${posts.length}\n`);
    console.log('━'.repeat(100));

    // Agrupar por estado
    const byStatus = {};
    posts.forEach(post => {
      if (!byStatus[post.status]) {
        byStatus[post.status] = [];
      }
      byStatus[post.status].push(post);
    });

    // Mostrar por estado
    Object.keys(byStatus).sort().forEach(status => {
      const statusPosts = byStatus[status];
      console.log(`\n📑 ${status.toUpperCase()} (${statusPosts.length})\n`);

      statusPosts.slice(0, 20).forEach((post, i) => {
        const cat = catMap[post.category_id];
        const catName = cat ? cat.name : 'Sin categoría';
        const pubDate = post.published_at ? new Date(post.published_at).toLocaleDateString('es-ES') : 'Sin fecha';
        const hasEn = post.title_en ? '🇬🇧' : '  ';
        
        console.log(`${String(i + 1).padStart(3)}. ${hasEn} [${catName.padEnd(15)}] ${post.title}`);
        console.log(`      📅 ${pubDate} | 👁️  ${post.views} visitas`);
        if (!post.title_en && status === 'published') {
          console.log(`      ⚠️  SIN TRADUCCIÓN AL INGLÉS`);
        }
      });

      if (statusPosts.length > 20) {
        console.log(`\n      ... y ${statusPosts.length - 20} artículos más`);
      }
    });

    // Resumen de traducciones
    const published = posts.filter(p => p.status === 'published');
    const withEn = published.filter(p => p.title_en).length;
    const withoutEn = published.filter(p => !p.title_en).length;

    console.log('\n━'.repeat(100));
    console.log('\n📊 RESUMEN DE TRADUCCIONES (solo publicados)');
    console.log(`   Con traducción al inglés:    ${withEn} / ${published.length} (${Math.round(withEn/published.length*100)}%)`);
    console.log(`   Sin traducción al inglés:    ${withoutEn} / ${published.length} (${Math.round(withoutEn/published.length*100)}%)`);

    // Top 10 más vistos
    console.log('\n━'.repeat(100));
    console.log('\n🔥 TOP 10 ARTÍCULOS MÁS VISTOS\n');
    
    const topPosts = [...posts]
      .filter(p => p.status === 'published')
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    topPosts.forEach((post, i) => {
      const cat = catMap[post.category_id];
      const hasEn = post.title_en ? '🇬🇧' : '  ';
      console.log(`${String(i + 1).padStart(2)}. ${hasEn} ${post.title}`);
      console.log(`    [${cat?.name || 'Sin cat'}] | 👁️  ${post.views} visitas`);
    });

    console.log('\n✅ Listado completado\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listBlogTitles();
