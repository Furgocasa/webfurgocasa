/**
 * Suprime emails tras rebotes/fallos de campaña: inserta en email_suppressions
 * (source=bounce) y marca opt-out en marketing_contacts, igual que el flujo admin.
 *
 * Uso:
 *   npx tsx scripts/mailing-suppress-bounce-batch.ts
 *   npx tsx scripts/mailing-suppress-bounce-batch.ts --dry-run
 *
 * Requiere: .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const DEFAULT_LIST = [
  'auronotaria@yahoo.es',
  'luis@luis.com',
  'carpinteria_davidserrano@hotmail.com',
  'vesova1@hotmail.com',
  'canarioconk2@hotmail.com',
  'geraalberto@gmail.com',
  'javier.ros.gonzale@gmail.com',
  'sandriku_pr_90@hotmail.com',
  'ja_s_a@yahoo.es',
  'adsaqu2020@icloud.com',
  'rouse-valverde@yahoo.es',
  'ana_alcantara23@hotmail.com',
];

const REASON = 'Rebote / fallo de entrega (limpieza tras campaña)';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const emails =
    process.argv.includes('--') ?
      process.argv
        .slice(process.argv.indexOf('--') + 1)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    : DEFAULT_LIST.map((e) => e.trim().toLowerCase());

  if (emails.length === 0) {
    console.log('No hay emails. Pasa lista tras -- o edita DEFAULT_LIST en el script.');
    process.exit(0);
  }

  if (dryRun) console.log('🔍 MODO DRY-RUN (no escribe en BD)\n');

  let added = 0;
  let skippedDup = 0;
  let contactsUpdated = 0;

  for (const email of emails) {
    const { data: dup } = await supabase
      .from('email_suppressions')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (dup) {
      skippedDup++;
      console.log(`⏭  Ya suprimido: ${email}`);
    } else if (!dryRun) {
      const { error } = await supabase.from('email_suppressions').insert({
        email,
        reason: REASON,
        source: 'bounce',
      });
      if (error) {
        console.error(`❌ Insert suppression ${email}:`, error.message);
        process.exit(1);
      }
      added++;
      console.log(`✅ Supresión añadida: ${email}`);
    } else {
      console.log(`[dry-run] insertar supresión: ${email}`);
      added++;
    }

    if (!dryRun) {
      const { data: contacts } = await supabase
        .from('marketing_contacts')
        .select('id, marketing_opt_out_at')
        .ilike('email', email);
      type C = { id: string; marketing_opt_out_at: string | null };
      const ids = ((contacts || []) as C[])
        .filter((c) => !c.marketing_opt_out_at)
        .map((c) => c.id);
      if (ids.length) {
        const { error: uerr } = await supabase
          .from('marketing_contacts')
          .update({
            marketing_opt_out_at: new Date().toISOString(),
            marketing_opt_out_reason: REASON,
          })
          .in('id', ids);
        if (uerr) {
          console.error(`❌ Opt-out contactos ${email}:`, uerr.message);
          process.exit(1);
        }
        contactsUpdated += ids.length;
        console.log(`   → Opt-out ${ids.length} fila(s) en marketing_contacts`);
      }
    } else {
      const { data: contacts } = await supabase
        .from('marketing_contacts')
        .select('id, marketing_opt_out_at')
        .ilike('email', email);
      const pending = ((contacts || []) as { marketing_opt_out_at: string | null }[]).filter(
        (c) => !c.marketing_opt_out_at,
      ).length;
      if (pending) console.log(`[dry-run] marcar opt-out ${pending} contacto(s) para ${email}`);
    }
  }

  console.log('\n---');
  console.log(
    dryRun ?
      `Resumen dry-run: ${added} supresiones nuevas simuladas, ${skippedDup} ya existían.`
    : `Hecho: ${added} supresiones insertadas, ${skippedDup} ya estaban, ${contactsUpdated} contactos pasados a opt-out.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
