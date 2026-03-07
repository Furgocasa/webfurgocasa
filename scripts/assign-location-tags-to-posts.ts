/**
 * Asigna location_tags a artículos del blog usando OpenAI
 *
 * Analiza título, excerpt y contenido de cada artículo y asigna los slugs
 * de location_targets que correspondan según provincias/lugares mencionados.
 *
 * Uso: npx tsx scripts/assign-location-tags-to-posts.ts
 *      npx tsx scripts/assign-location-tags-to-posts.ts --dry-run  (solo muestra, no escribe)
 *      npx tsx scripts/assign-location-tags-to-posts.ts --category=rutas  (solo categoría rutas)
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DRY_RUN = process.argv.includes('--dry-run');
const CATEGORY_ARG = process.argv.find((a) => a.startsWith('--category='));
const CATEGORY_FILTER = CATEGORY_ARG ? CATEGORY_ARG.split('=')[1] : null;

async function getLocationSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from('location_targets')
    .select('slug')
    .eq('is_active', true)
    .order('slug');
  return (data || []).map((r) => r.slug);
}

async function getPostsToTag(): Promise<
  Array<{ id: string; title: string; slug: string; excerpt: string | null; content: string }>
> {
  let query = supabase
    .from('posts')
    .select('id, title, slug, excerpt, content')
    .eq('status', 'published')
    .or('location_tags.is.null,location_tags.eq.[]');

  if (CATEGORY_FILTER) {
    const { data: cat } = await supabase
      .from('content_categories')
      .select('id')
      .eq('slug', CATEGORY_FILTER)
      .single();
    if (cat) query = query.eq('category_id', cat.id);
  }

  const { data } = await query.order('published_at', { ascending: false });

  return (data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: (p.content || '').replace(/<[^>]*>/g, ' ').slice(0, 3000),
  }));
}

async function analyzeWithOpenAI(
  post: { title: string; excerpt: string | null; content: string },
  locationSlugs: string[]
): Promise<string[]> {
  const slugList = locationSlugs.join(', ');
  const text = [
    `Título: ${post.title}`,
    post.excerpt ? `Resumen: ${post.excerpt}` : '',
    `Contenido (extracto): ${post.content}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const prompt = `Analiza este artículo de blog sobre rutas/destinos en autocaravana en España.

Identifica TODAS las provincias, ciudades, regiones o lugares concretos que menciona o sobre los que trata.

Slugs válidos (usa EXACTAMENTE estos, sin modificar):
${slugList}

Responde ÚNICAMENTE con un JSON válido en este formato:
{"location_tags": ["slug1", "slug2", ...]}

Reglas:
- Solo incluye slugs de la lista que aparezcan o estén claramente relacionados
- Si habla de "Región de Murcia" incluye: murcia, y las ciudades que mencione (lorca, cartagena, etc.)
- Si habla de "Sierra Espuña" incluye: sierra-espuna, murcia
- Si habla de "Costa Blanca" incluye: alicante, elche, benidorm, etc.
- Si no hay ningún lugar concreto, devuelve: {"location_tags": []}
- Máximo 8 slugs por artículo
- NO inventes slugs que no estén en la lista

Artículo:
${text}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Eres un analizador de contenido. Respondes ÚNICAMENTE con JSON válido. No incluyes explicaciones.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0].message.content || '{}';
  const parsed = JSON.parse(raw);
  const tags: string[] = Array.isArray(parsed.location_tags) ? parsed.location_tags : [];

  const validSet = new Set(locationSlugs.map((s) => s.toLowerCase()));
  return tags.filter((s) => typeof s === 'string' && validSet.has(s.toLowerCase()));
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY no configurada en .env.local');
    process.exit(1);
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY no configurada en .env.local');
    process.exit(1);
  }

  console.log('📚 Asignando location_tags a artículos del blog con OpenAI\n');
  if (DRY_RUN) console.log('🔍 Modo DRY-RUN: no se escribirá en la base de datos\n');
  if (CATEGORY_FILTER) console.log(`📂 Filtro categoría: ${CATEGORY_FILTER}\n`);

  const [locationSlugs, posts] = await Promise.all([getLocationSlugs(), getPostsToTag()]);

  console.log(`📍 Slugs de ubicaciones: ${locationSlugs.length}`);
  console.log(`📄 Artículos a procesar: ${posts.length}\n`);

  if (posts.length === 0) {
    console.log('✅ No hay artículos pendientes de etiquetar.');
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] ${post.title.slice(0, 60)}...`);

    try {
      const tags = await analyzeWithOpenAI(post, locationSlugs);

      if (tags.length === 0) {
        console.log(`   ⏭️  Sin tags relevantes, se omite`);
        skipped++;
        continue;
      }

      console.log(`   🏷️  Tags: ${tags.join(', ')}`);

      if (!DRY_RUN) {
        const { error } = await supabase
          .from('posts')
          .update({ location_tags: tags })
          .eq('id', post.id);

        if (error) {
          console.error(`   ❌ Error: ${error.message}`);
        } else {
          updated++;
        }
      } else {
        updated++;
      }

      // Pequeña pausa para no saturar la API
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`   ❌ Error:`, err);
    }
  }

  console.log(`\n✅ Procesados: ${posts.length} | Actualizados: ${updated} | Omitidos: ${skipped}`);
  if (DRY_RUN) console.log('\n💡 Ejecuta sin --dry-run para aplicar los cambios.');
}

main().catch(console.error);
