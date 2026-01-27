/**
 * Script para generar slugs traducidos desde los títulos traducidos
 * Genera slugs para posts que tienen título traducido pero no slug traducido
 * 
 * Ejecutar: node scripts/generar-slugs-traducidos.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no encontrada en .env.local');
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

async function generarSlugs() {
  console.log('🚀 Generando slugs traducidos...\n');
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

  let totalGenerados = 0;
  let totalErrores = 0;

  // Procesar cada post
  for (const post of posts) {
    const updates = {};

    // Inglés
    let titleEn = post.title_en;
    if (!titleEn) {
      titleEn = titleMap.get(`${post.id}_en`);
    }
    if (titleEn && !post.slug_en) {
      const slugEn = generateSlug(titleEn);
      updates.slug_en = slugEn;
      console.log(`📝 [EN] "${post.title.substring(0, 50)}..."`);
      console.log(`   Slug generado: ${slugEn}`);
    }

    // Francés
    const titleFr = titleMap.get(`${post.id}_fr`);
    if (titleFr && !post.slug_fr) {
      const slugFr = generateSlug(titleFr);
      updates.slug_fr = slugFr;
      console.log(`📝 [FR] "${post.title.substring(0, 50)}..."`);
      console.log(`   Slug generado: ${slugFr}`);
    }

    // Alemán
    const titleDe = titleMap.get(`${post.id}_de`);
    if (titleDe && !post.slug_de) {
      const slugDe = generateSlug(titleDe);
      updates.slug_de = slugDe;
      console.log(`📝 [DE] "${post.title.substring(0, 50)}..."`);
      console.log(`   Slug generado: ${slugDe}`);
    }

    // Actualizar si hay cambios
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', post.id);

      if (updateError) {
        console.error(`   ❌ Error actualizando: ${updateError.message}`);
        totalErrores++;
      } else {
        console.log(`   ✅ Actualizado con ${Object.keys(updates).length} slug(s)`);
        totalGenerados += Object.keys(updates).length;
      }
      console.log('');
    }
  }

  // Resumen final
  console.log('='.repeat(70));
  console.log('📊 RESUMEN FINAL');
  console.log('='.repeat(70));
  console.log(`✅ Slugs generados: ${totalGenerados}`);
  console.log(`❌ Errores: ${totalErrores}`);
  console.log('='.repeat(70));
  console.log('\n🎉 ¡Proceso completado!');
}

generarSlugs().catch(console.error);
