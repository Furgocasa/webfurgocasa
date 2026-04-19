/**
 * Ingesta one-shot de customers → marketing_contacts (source='customer').
 *
 * La tabla marketing_contacts tiene un índice único sobre LOWER(TRIM(email)),
 * así que las re-ejecuciones son idempotentes: los ya existentes se saltan
 * por conflicto. Usamos upsert con onConflict=email (case-insensitive no
 * tiene upsert nativo en Supabase JS, así que pre-cargamos los existentes
 * y filtramos).
 *
 * Uso:
 *   node --env-file=.env.local scripts/ingest-customers-to-marketing.mjs
 *   node --env-file=.env.local scripts/ingest-customers-to-marketing.mjs --dry
 */
import { createClient } from '@supabase/supabase-js';

const DRY = process.argv.includes('--dry');
const BATCH = 200;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

function normEmail(e) {
  return (e || '').trim().toLowerCase();
}

async function main() {
  console.log(`\n=== Ingesta customers → marketing_contacts${DRY ? ' (DRY-RUN)' : ''} ===\n`);

  // 1) Cargar todos los customers con email válido.
  const { data: customers, error: cErr } = await sb
    .from('customers')
    .select('id,email,name,city')
    .not('email', 'is', null)
    .neq('email', '');
  if (cErr) throw new Error(`Error cargando customers: ${cErr.message}`);
  console.log(`· customers con email: ${customers.length}`);

  // 2) Cargar los marketing_contacts ya existentes (solo email y customer_id).
  const { data: existing, error: eErr } = await sb
    .from('marketing_contacts')
    .select('email,customer_id');
  if (eErr) throw new Error(`Error cargando marketing_contacts: ${eErr.message}`);
  const existingEmails = new Set(existing.map((r) => normEmail(r.email)));
  const existingCustomerIds = new Set(existing.map((r) => r.customer_id).filter(Boolean));
  console.log(`· marketing_contacts existentes: ${existing.length}`);

  // 3) Preparar inserts, deduplicando por email normalizado (dentro del lote
  //    puede haber varios customers con el mismo email).
  const seen = new Set();
  const toInsert = [];
  let skippedExistingEmail = 0;
  let skippedDupInBatch = 0;
  let skippedInvalid = 0;
  let skippedAlreadyLinked = 0;

  for (const c of customers) {
    const norm = normEmail(c.email);
    if (!norm || !norm.includes('@')) {
      skippedInvalid++;
      continue;
    }
    if (existingEmails.has(norm)) {
      skippedExistingEmail++;
      continue;
    }
    if (existingCustomerIds.has(c.id)) {
      skippedAlreadyLinked++;
      continue;
    }
    if (seen.has(norm)) {
      skippedDupInBatch++;
      continue;
    }
    seen.add(norm);
    toInsert.push({
      email: c.email.trim(),
      name: c.name || null,
      city: c.city || null,
      source: 'customer',
      locale: 'es',
      customer_id: c.id,
    });
  }

  console.log(`\nResumen previo al insert:`);
  console.log(`  · a insertar          : ${toInsert.length}`);
  console.log(`  · ya existentes email : ${skippedExistingEmail}`);
  console.log(`  · ya enlazados        : ${skippedAlreadyLinked}`);
  console.log(`  · duplicados en lote  : ${skippedDupInBatch}`);
  console.log(`  · emails inválidos    : ${skippedInvalid}`);

  if (DRY) {
    console.log(`\n(DRY-RUN) No se inserta nada. Ejemplos:`);
    toInsert.slice(0, 5).forEach((r, i) =>
      console.log(`  ${i + 1}. ${r.email}  ${r.name ? '· ' + r.name : ''}${r.city ? ' · ' + r.city : ''}`),
    );
    return;
  }

  // 4) Insert en lotes.
  let inserted = 0;
  let errors = 0;
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const chunk = toInsert.slice(i, i + BATCH);
    const { error, data } = await sb
      .from('marketing_contacts')
      .insert(chunk)
      .select('id');
    if (error) {
      errors++;
      console.error(`  ✖ Lote ${Math.floor(i / BATCH) + 1}: ${error.message}`);
      continue;
    }
    inserted += data.length;
    process.stdout.write(`  · lote ${Math.floor(i / BATCH) + 1}: ${data.length} insertados\r`);
  }

  console.log(`\n\n✓ Ingesta completada: ${inserted} insertados · ${errors} lotes fallidos`);

  const { count: finalCount } = await sb
    .from('marketing_contacts')
    .select('*', { count: 'exact', head: true });
  console.log(`· marketing_contacts total ahora: ${finalCount}`);
}

main().catch((e) => {
  console.error('\n✖ ERROR:', e.message);
  process.exit(1);
});
