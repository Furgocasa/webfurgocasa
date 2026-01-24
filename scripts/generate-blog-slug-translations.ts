/**
 * Script para generar traducciones de slugs de posts del blog
 * ============================================================
 * 
 * Este script:
 * 1. Lee todos los posts publicados
 * 2. Obtiene las traducciones de 'title' de content_translations
 * 3. Genera el slug traducido a partir del título traducido
 * 4. Actualiza directamente las columnas slug_en, slug_fr, slug_de en posts
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

// Mapeo de locale a columna de slug
const SLUG_COLUMNS: Record<Locale, string> = {
  en: 'slug_en',
  fr: 'slug_fr',
  de: 'slug_de'
};

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
    .substring(0, 200); // Máximo 200 caracteres
}

interface Post {
  id: string;
  slug: string;
  title: string;
  slug_en: string | null;
  slug_fr: string | null;
  slug_de: string | null;
}

async function main() {
  console.log('🚀 Iniciando generación de slugs traducidos para posts del blog...\n');

  // 1. Obtener todos los posts publicados
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, slug, title, slug_en, slug_fr, slug_de')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('❌ Error obteniendo posts:', postsError);
    process.exit(1);
  }

  console.log(`📝 Encontrados ${posts.length} posts publicados\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const post of posts as Post[]) {
    console.log(`\n📄 Procesando: "${post.title.substring(0, 50)}..."`);
    console.log(`   Slug ES: ${post.slug}`);

    const slugUpdates: Record<string, string> = {};

    for (const locale of LOCALES) {
      const slugColumn = SLUG_COLUMNS[locale];
      const currentSlug = post[slugColumn as keyof Post] as string | null;

      // Si ya tiene slug traducido, saltar
      if (currentSlug) {
        console.log(`   ⏭️  [${locale.toUpperCase()}] Ya tiene slug: ${currentSlug.substring(0, 40)}...`);
        skipped++;
        continue;
      }

      // 2. Obtener traducción del título desde content_translations
      const { data: titleTranslation } = await supabase
        .from('content_translations')
        .select('translated_text')
        .eq('source_table', 'posts')
        .eq('source_id', post.id)
        .eq('source_field', 'title')
        .eq('locale', locale)
        .single();

      // 3. Generar slug
      let translatedSlug: string;
      
      if (titleTranslation?.translated_text) {
        translatedSlug = generateSlug(titleTranslation.translated_text);
        console.log(`   🌐 [${locale.toUpperCase()}] Título traducido encontrado`);
      } else {
        // Fallback: generar slug desde título español con sufijo de idioma
        translatedSlug = generateSlug(post.title) + `-${locale}`;
        console.log(`   ⚠️  [${locale.toUpperCase()}] Sin traducción de título, usando fallback`);
      }

      slugUpdates[slugColumn] = translatedSlug;
      console.log(`   ✨ [${locale.toUpperCase()}] Slug generado: ${translatedSlug.substring(0, 50)}...`);
    }

    // 4. Actualizar el post si hay slugs nuevos
    if (Object.keys(slugUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('posts')
        .update(slugUpdates)
        .eq('id', post.id);

      if (updateError) {
        console.error(`   ❌ Error actualizando post:`, updateError.message);
        errors++;
      } else {
        console.log(`   ✅ Post actualizado con ${Object.keys(slugUpdates).length} slug(s) nuevo(s)`);
        updated += Object.keys(slugUpdates).length;
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN:');
  console.log(`   ✅ Slugs creados/actualizados: ${updated}`);
  console.log(`   ⏭️  Slugs existentes (saltados): ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log('='.repeat(70) + '\n');

  if (updated > 0) {
    console.log('🎉 ¡Slugs traducidos generados exitosamente!');
    console.log('');
    console.log('📋 Ahora las URLs del blog serán:');
    console.log('   ES: /es/blog/{categoria}/{slug}');
    console.log('   EN: /en/blog/{category}/{slug_en}');
    console.log('   FR: /fr/blog/{categorie}/{slug_fr}');
    console.log('   DE: /de/blog/{kategorie}/{slug_de}');
  }
}

main().catch(console.error);
