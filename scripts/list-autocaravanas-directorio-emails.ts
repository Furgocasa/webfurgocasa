/**
 * Lista nombre y email del directorio de /es/autocaravanas (Supabase motorhome_services).
 * Mismos filtros que la guía: status active, OPERATIONAL, categorías taller y concesionario.
 *
 * Uso:
 *   npx tsx scripts/list-autocaravanas-directorio-emails.ts
 *   npx tsx scripts/list-autocaravanas-directorio-emails.ts --csv-con-email ruta/salida.csv
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PAGE = 1000;
const CATEGORIES = ['taller_camper', 'concesionario_autocaravanas'] as const;

type Row = { name: string; email: string | null; category: string };

function labelCategory(c: string): string {
  if (c === 'taller_camper') return 'Taller';
  if (c === 'concesionario_autocaravanas') return 'Concesionario';
  return c;
}

function csvCell(v: string): string {
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function fetchAll(): Promise<Row[]> {
  const out: Row[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('motorhome_services')
      .select('name, email, category')
      .eq('status', 'active')
      .eq('operational_status', 'OPERATIONAL')
      .in('category', [...CATEGORIES])
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .range(from, from + PAGE - 1);

    if (error) {
      console.error('❌ Error Supabase:', error.message);
      process.exit(1);
    }

    const batch = (data || []) as Row[];
    out.push(...batch);
    if (batch.length < PAGE) break;
    from += PAGE;
  }

  return out;
}

async function main() {
  const argv = process.argv.slice(2);
  const csvIdx = argv.indexOf('--csv-con-email');
  const csvOut =
    csvIdx >= 0 && argv[csvIdx + 1]
      ? resolve(process.cwd(), argv[csvIdx + 1])
      : null;

  const rows = await fetchAll();

  let conEmail = 0;
  let sinEmail = 0;
  for (const r of rows) {
    const em = r.email?.trim();
    if (em) conEmail++;
    else sinEmail++;
  }

  if (csvOut) {
    const withEmail = rows.filter((r) => r.email?.trim());
    const header = ['nombre', 'email', 'categoria'].map(csvCell).join(',');
    const body = withEmail
      .map((r) =>
        [csvCell(r.name), csvCell(r.email!.trim()), csvCell(labelCategory(r.category))].join(',')
      )
      .join('\n');
    writeFileSync(csvOut, '\ufeff' + header + '\n' + body, 'utf-8');
    console.log(
      `✅ CSV (${withEmail.length} filas con email): ${csvOut}\n` +
        `   Total directorio: ${rows.length} (${sinEmail} sin email excluidos)`
    );
    return;
  }

  console.log(
    `# Directorio autocaravanas: ${rows.length} registros (${conEmail} con email, ${sinEmail} sin email)\n`
  );

  for (const r of rows) {
    const email = r.email?.trim() || '(sin email)';
    console.log(`${r.name}, ${email}`);
  }

  console.log('\n--- Por categoría ---');
  for (const cat of CATEGORIES) {
    const sub = rows.filter((r) => r.category === cat);
    const withE = sub.filter((r) => r.email?.trim()).length;
    console.log(`${labelCategory(cat)}: ${sub.length} total, ${withE} con email`);
  }
}

main();
