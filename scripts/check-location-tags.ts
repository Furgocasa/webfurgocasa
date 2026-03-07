/**
 * Verifica el estado de location_tags en posts
 * Uso: npm run check:location-tags
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log('📊 Comprobando location_tags en posts...\n');

  // Total de posts
  const { count: total } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true });
  console.log(`Total posts: ${total ?? 0}`);

  // Posts con location_tags no nulo y no vacío
  const { count: withTags } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .not('location_tags', 'is', null)
    .neq('location_tags', '[]');
  console.log(`Con location_tags (no null, no []): ${withTags ?? 0}`);

  // Posts con location_tags null o []
  const { count: withoutTags } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .or('location_tags.is.null,location_tags.eq.[]');
  console.log(`Sin location_tags (null o []): ${withoutTags ?? 0}`);

  // 3 ejemplos con location_tags
  const { data: examples } = await supabase
    .from('posts')
    .select('id, title, slug, location_tags')
    .not('location_tags', 'is', null)
    .neq('location_tags', '[]')
    .limit(3);

  console.log('\n📄 Ejemplos de posts CON location_tags:');
  if (examples?.length) {
    examples.forEach((p, i) =>
      console.log(`  ${i + 1}. ${p.title} | tags: ${JSON.stringify(p.location_tags)}`)
    );
  } else {
    console.log('  (ninguno)');
  }

  // Posts con "alicante" en location_tags (filter cs funciona; contains no)
  const { data: alicantePosts } = await supabase
    .from('posts')
    .select('id, title, slug, location_tags')
    .filter('location_tags', 'cs', '["alicante"]');

  console.log('\n🏷️ Posts con "alicante" en location_tags:');
  if (alicantePosts?.length) {
    console.log(`  Encontrados: ${alicantePosts.length}`);
    alicantePosts.slice(0, 5).forEach((p, i) =>
      console.log(`  ${i + 1}. ${p.title} | ${JSON.stringify(p.location_tags)}`)
    );
    if (alicantePosts.length > 5) {
      console.log(`  ... y ${alicantePosts.length - 5} más`);
    }
  } else {
    console.log('  Ninguno');
  }

  // Slugs en location_targets (¿existe alicante?)
  const { data: locations } = await supabase
    .from('location_targets')
    .select('slug')
    .eq('is_active', true)
    .order('slug');
  const slugs = (locations || []).map((l) => l.slug);
  console.log(`\n📍 Slugs en location_targets: ${slugs.length}`);
  console.log(`   ¿Existe "alicante"? ${slugs.includes('alicante') ? 'Sí' : 'No'}`);
  if (!slugs.includes('alicante')) {
    const similar = slugs.filter((s) => s.includes('alic') || s.includes('alicante'));
    if (similar.length) console.log(`   Similares: ${similar.join(', ')}`);
  }

  // Buscar posts que mencionen Alicante pero no lo tengan en tags
  const { data: allWithTags } = await supabase
    .from('posts')
    .select('id, title, location_tags')
    .not('location_tags', 'is', null)
    .neq('location_tags', '[]');
  const alicanteMentions = (allWithTags || []).filter(
    (p) =>
      p.title?.toLowerCase().includes('alicante') ||
      JSON.stringify(p.location_tags).toLowerCase().includes('alicante')
  );
  console.log(`\n🔍 Posts cuyo título o tags mencionan "alicante": ${alicanteMentions.length}`);
  alicanteMentions.slice(0, 3).forEach((p, i) =>
    console.log(`   ${i + 1}. ${p.title} | ${JSON.stringify(p.location_tags)}`)
  );

  console.log('\n✅ Comprobación completada.');
}

main().catch(console.error);
