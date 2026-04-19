#!/usr/bin/env node
/**
 * scripts/renumber-campaigns.mjs
 *
 * Renumera manualmente las campañas de mailing según el orden deseado por
 * el admin. El campo `number` es UNIQUE, por lo que hacemos el swap en dos
 * pasos: primero a valores negativos temporales, luego a los finales.
 *
 * Uso:
 *   node --env-file=.env.local scripts/renumber-campaigns.mjs
 *
 * Configura el mapeo deseado abajo.
 */

import { createClient } from '@supabase/supabase-js';

// Orden deseado (por slug → número final).
// Si mañana quieres reordenar otra vez, edita este mapa y reejecuta.
const DESIRED = [
  { slug: '2026-01-05-oferta-invierno-2026', number: 1 },
  { slug: '2026-03-17-ofertas-ultima-hora', number: 2 },
  { slug: 'ofertas-en-mayo', number: 3 },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log('· Consultando campañas actuales...');
  const slugs = DESIRED.map((d) => d.slug);
  const { data: rows, error } = await sb
    .from('mailing_campaigns')
    .select('id, slug, number, subject, status')
    .in('slug', slugs);
  if (error) throw new Error(`SELECT: ${error.message}`);

  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const missing = slugs.filter((s) => !bySlug.has(s));
  if (missing.length) {
    console.error('\n✗ Slugs no encontrados en la BD:');
    for (const s of missing) console.error('  · ' + s);
    process.exit(1);
  }

  console.log('\nEstado actual:');
  for (const r of rows) {
    console.log(`  #${r.number}  ${r.slug.padEnd(40)}  ${r.status}  "${r.subject}"`);
  }

  console.log('\nObjetivo:');
  for (const d of DESIRED) {
    const r = bySlug.get(d.slug);
    console.log(`  #${d.number}  ${d.slug.padEnd(40)}  "${r.subject}"`);
  }

  console.log('\n· Paso 1/2: moviendo a números temporales negativos para evitar chocar con UNIQUE...');
  for (let i = 0; i < DESIRED.length; i++) {
    const row = bySlug.get(DESIRED[i].slug);
    const tmp = -(i + 1) * 1000;
    const { error: e } = await sb
      .from('mailing_campaigns')
      .update({ number: tmp })
      .eq('id', row.id);
    if (e) throw new Error(`UPDATE tmp #${tmp} (${row.slug}): ${e.message}`);
    console.log(`  ${row.slug} → ${tmp}`);
  }

  console.log('\n· Paso 2/2: asignando números finales...');
  for (const d of DESIRED) {
    const row = bySlug.get(d.slug);
    const { error: e } = await sb
      .from('mailing_campaigns')
      .update({ number: d.number })
      .eq('id', row.id);
    if (e) throw new Error(`UPDATE final #${d.number} (${d.slug}): ${e.message}`);
    console.log(`  ${d.slug} → ${d.number}`);
  }

  console.log('\n· Verificando...');
  const { data: after, error: e2 } = await sb
    .from('mailing_campaigns')
    .select('slug, number, subject, status')
    .in('slug', slugs)
    .order('number', { ascending: true });
  if (e2) throw new Error(`SELECT final: ${e2.message}`);
  console.log('Estado final:');
  for (const r of after) {
    console.log(`  #${r.number}  ${r.slug.padEnd(40)}  ${r.status}  "${r.subject}"`);
  }
  console.log('\n✓ Renumeración completada.');
}

main().catch((e) => {
  console.error('\n✗ Error:', e.message);
  process.exit(1);
});
