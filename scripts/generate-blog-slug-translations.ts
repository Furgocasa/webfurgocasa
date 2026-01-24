/**
 * Script para generar traducciones de slugs de posts del blog
 * ============================================================
 * 
 * Este script:
 * 1. Lee todos los posts publicados
 * 2. Obtiene las traducciones de 'title' existentes de content_translations
 * 3. Genera el slug a partir del título traducido
 * 4. Inserta las traducciones de 'slug' en content_translations
 * 
 * Ejecutar: npx tsx scripts/generate-blog-slug-translations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type Locale = 'en' | 'fr' | 'de';
const LOCALES: Locale[] = ['en', 'fr', 'de'];

/**
 * Genera un slug a partir de un texto
 * Ejemplo: "Mapa Furgocasa: la alternativa" -> "mapa-furgocasa-la-alternativa"
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, '') // Quitar guiones al inicio/final
    .substring(0, 100); // Máximo 100 caracteres
}

async function main() {
  console.log('🚀 Iniciando generación de slugs traducidos para posts del blog...\n');

  // 1. Obtener todos los posts publicados
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, slug, title')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('❌ Error obteniendo posts:', postsError);
    process.exit(1);
  }

  console.log(`📝 Encontrados ${posts.length} posts publicados\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts) {
    console.log(`\n📄 Procesando: "${post.title}" (${post.slug})`);

    for (const locale of LOCALES) {
      // 2. Verificar si ya existe traducción de slug
      const { data: existingSlug } = await supabase
        .from('content_translations')
        .select('id')
        .eq('source_table', 'posts')
        .eq('source_id', post.id)
        .eq('source_field', 'slug')
        .eq('locale', locale)
        .single();

      if (existingSlug) {
        console.log(`   ⏭️  [${locale}] Slug ya existe, saltando...`);
        skipped++;
        continue;
      }

      // 3. Obtener traducción del título
      const { data: titleTranslation } = await supabase
        .from('content_translations')
        .select('translated_text')
        .eq('source_table', 'posts')
        .eq('source_id', post.id)
        .eq('source_field', 'title')
        .eq('locale', locale)
        .single();

      if (!titleTranslation?.translated_text) {
        console.log(`   ⚠️  [${locale}] No hay traducción de título, usando título original`);
        // Usar título original si no hay traducción
      }

      // 4. Generar slug
      const sourceTitle = titleTranslation?.translated_text || post.title;
      const translatedSlug = generateSlug(sourceTitle);

      // 5. Insertar traducción de slug
      const { error: insertError } = await supabase
        .from('content_translations')
        .insert({
          source_table: 'posts',
          source_id: post.id,
          source_field: 'slug',
          locale: locale,
          translated_text: translatedSlug
        });

      if (insertError) {
        console.error(`   ❌ [${locale}] Error insertando slug:`, insertError.message);
        errors++;
      } else {
        console.log(`   ✅ [${locale}] Slug creado: "${translatedSlug}"`);
        created++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN:');
  console.log(`   ✅ Slugs creados: ${created}`);
  console.log(`   ⏭️  Slugs existentes (saltados): ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log('='.repeat(60) + '\n');

  if (created > 0) {
    console.log('🎉 ¡Slugs traducidos generados exitosamente!');
    console.log('   Ahora los artículos del blog tendrán URLs traducidas.');
  }
}

main().catch(console.error);
