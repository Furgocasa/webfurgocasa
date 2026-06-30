/**
 * Verificacion de coherencia entre la base de conocimiento del chatbot (CSV / RAG)
 * y los datos reales de la web (tablas de Supabase).
 *
 * Objetivo: detectar desajustes entre lo que dira el chatbot (CSV) y lo que la web
 * tiene actualmente (vehiculos, temporadas/precios, ubicaciones, ajustes) para que
 * una persona pueda reconciliarlos. NO modifica nada: solo informa.
 *
 * Uso:
 *   npm run verify:chatbot-kb
 *   (tambien se ejecuta automaticamente al final de npm run ingest:chatbot-kb)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const DOCS_DIR = resolve(process.cwd(), 'chatbot_documentacion');
const REPORT_PATH = resolve(process.cwd(), 'docs/02-desarrollo/chatbot/INFORME-COHERENCIA-RAG.md');

export type Severity = 'ok' | 'warn' | 'info';

export interface CoherenceIssue {
  area: string;
  severity: Severity;
  message: string;
}

// ---------- utilidades ----------

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(' ')
    .filter((t) => t.length >= 3 && !['DEL', 'LOS', 'LAS', 'CON', 'PARA', 'ESP'].includes(t));
}

function tokenOverlap(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let common = 0;
  for (const t of ta) if (tb.has(t)) common++;
  return common / Math.min(ta.size, tb.size);
}

function readCsvRows(file: string): Array<[string, string]> {
  const path = resolve(DOCS_DIR, file);
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, 'utf-8');
  const records = parse(raw, { skip_empty_lines: true, relax_column_count: true, bom: true }) as string[][];
  return records
    .slice(1)
    .map((c) => [(c[0] || '').trim(), (c[1] || '').trim()] as [string, string]);
}

function getClient(provided?: SupabaseClient): SupabaseClient {
  if (provided) return provided;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// ---------- checks ----------

/**
 * Vehiculos: ahora las fichas se generan desde la BBDD (tabla vehicles), no del CSV.
 * Esta comprobacion: (1) lista la flota indexada, (2) avisa de filas de modelo
 * individuales que aun quedan en el CSV (se IGNORAN en la ingesta y conviene limpiarlas).
 */
async function checkModels(supabase: SupabaseClient, issues: CoherenceIssue[]) {
  const rows = readCsvRows('MODELOS-Grid view.csv');
  const csvModels = rows
    .map(([title]) => title.replace(/\s+/g, ' ').trim())
    .filter((t) => t && !normalize(t).startsWith('ESP'));

  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('name, brand, model, is_for_rent, status');

  if (error) {
    issues.push({ area: 'Vehiculos', severity: 'warn', message: `No se pudo leer la tabla vehicles: ${error.message}` });
    return;
  }

  const fleet = (vehicles || []).filter((v: any) => v.is_for_rent === true && v.status !== 'inactive');
  const fleetLabels = fleet.map((v: any) => [v.brand, v.model].filter(Boolean).join(' ').trim() || v.name);

  issues.push({
    area: 'Vehiculos',
    severity: 'ok',
    message: `Flota indexada desde la BBDD (${fleet.length}): ${fleetLabels.join(', ')}`,
  });

  // Filas de modelo que aun quedan en el CSV (ya no se usan: las fichas vienen de la BBDD).
  if (csvModels.length > 0) {
    issues.push({
      area: 'Vehiculos',
      severity: 'info',
      message: `El CSV de modelos aun contiene ${csvModels.length} fichas individuales que se IGNORAN (las fichas se toman de la BBDD). Puedes eliminarlas para evitar confusion: ${csvModels.join(', ')}`,
    });
  }
}

/** Extras: se indexan desde la BBDD; informe del catalogo. */
async function checkExtras(supabase: SupabaseClient, issues: CoherenceIssue[]) {
  const { data, error } = await supabase
    .from('extras')
    .select('name, is_active')
    .eq('is_active', true);
  if (error) {
    issues.push({ area: 'Extras', severity: 'info', message: `No se pudo leer la tabla extras: ${error.message}` });
    return;
  }
  issues.push({
    area: 'Extras',
    severity: 'ok',
    message: `Extras indexados desde la BBDD (${data?.length || 0}): ${(data || []).map((e: any) => e.name).join(', ')}`,
  });
}

/** Precios orientativos por temporada del CSV CONDICIONES vs tabla seasons. */
async function checkSeasonPrices(supabase: SupabaseClient, issues: CoherenceIssue[]) {
  const rows = readCsvRows('CONDICIONES-Grid view.csv');
  const pricingRow = rows.find(([title]) => normalize(title).includes('PAGO Y PRECIOS'));
  const csvPrices: Record<string, number[]> = {};

  if (pricingRow) {
    const text = pricingRow[1];
    for (const label of ['Baja', 'Media', 'Alta']) {
      const re = new RegExp(`Temporada\\s+${label}([\\s\\S]*?)(?:####|###|$)`, 'i');
      const block = re.exec(text)?.[1] || '';
      const nums = (block.match(/(\d{2,3})\s*€/g) || []).map((m) => parseInt(m, 10)).slice(0, 4);
      if (nums.length) csvPrices[label.toLowerCase()] = nums;
    }
  }

  const { data: seasons, error } = await supabase
    .from('seasons')
    .select('name, season_type, price_less_than_week, price_one_week, price_two_weeks, price_three_weeks, is_active, year')
    .eq('is_active', true);

  if (error) {
    issues.push({ area: 'Temporadas', severity: 'warn', message: `No se pudo leer la tabla seasons: ${error.message}` });
    return;
  }

  if (Object.keys(csvPrices).length === 0) {
    issues.push({ area: 'Temporadas', severity: 'info', message: 'No se pudieron extraer los precios orientativos del CSV CONDICIONES para comparar.' });
  }

  // Mapear season_type de la web a las etiquetas del CSV.
  const typeToLabel: Record<string, string> = {
    baja: 'baja',
    low: 'baja',
    media: 'media',
    mid: 'media',
    'media_alta': 'media',
    alta: 'alta',
    high: 'alta',
  };

  const seenTypes = new Set<string>();
  for (const s of seasons || []) {
    const type = (s.season_type || '').toLowerCase();
    const label = typeToLabel[type];
    const dbPrices = [s.price_less_than_week, s.price_one_week, s.price_two_weeks, s.price_three_weeks];
    if (!label || !csvPrices[label]) {
      if (!seenTypes.has(type)) {
        issues.push({
          area: 'Temporadas',
          severity: 'info',
          message: `Temporada web "${s.name}" (${s.season_type}) precios=[${dbPrices.join(', ')}] (sin equivalente claro en el CSV para comparar).`,
        });
      }
      seenTypes.add(type);
      continue;
    }
    const csv = csvPrices[label];
    const mismatch = dbPrices.some((p, i) => csv[i] != null && p != null && Number(p) !== Number(csv[i]));
    if (mismatch) {
      issues.push({
        area: 'Temporadas',
        severity: 'warn',
        message: `Precio orientativo del CSV CONDICIONES no coincide con la BBDD en temporada "${label}" -> web "${s.name}": [${dbPrices.join(', ')}] vs texto CSV: [${csv.join(', ')}]. Revisar/actualizar el texto orientativo del CSV.`,
      });
    } else if (!seenTypes.has(type)) {
      issues.push({ area: 'Temporadas', severity: 'ok', message: `Precios temporada "${label}" coinciden web/CSV: [${csv.join(', ')}]` });
    }
    seenTypes.add(type);
  }
}

/** Sedes/localizaciones mencionadas en el CSV vs tabla locations activa. */
async function checkLocations(supabase: SupabaseClient, issues: CoherenceIssue[]) {
  const allText = ['CONDICIONES-Grid view.csv', 'FAQS - Preguntas frecuentes-Grid view.csv']
    .flatMap((f) => readCsvRows(f).map(([, info]) => info))
    .join(' ')
    .toUpperCase();

  const candidates = ['MURCIA', 'MADRID', 'ALBACETE', 'ALICANTE'];
  const mentioned = candidates.filter((c) => allText.includes(c));

  const { data: locations, error } = await supabase
    .from('locations')
    .select('name, city, is_active, is_pickup')
    .eq('is_active', true);

  if (error) {
    issues.push({ area: 'Ubicaciones', severity: 'warn', message: `No se pudo leer la tabla locations: ${error.message}` });
    return;
  }

  const dbCities = Array.from(
    new Set((locations || []).map((l: any) => normalize(l.city || l.name)).filter(Boolean))
  );

  // Ubicaciones activas en la web no mencionadas en el CSV.
  for (const city of dbCities) {
    const isMentioned = mentioned.some((m) => city.includes(m) || m.includes(city));
    if (!isMentioned) {
      issues.push({
        area: 'Ubicaciones',
        severity: 'warn',
        message: `Sede activa en la web "${city}" no se menciona en la documentacion del chatbot.`,
      });
    }
  }

  // Ubicaciones mencionadas en el CSV que no estan activas en la web.
  for (const m of mentioned) {
    const inDb = dbCities.some((c) => c.includes(m) || m.includes(c));
    if (!inDb) {
      issues.push({
        area: 'Ubicaciones',
        severity: 'info',
        message: `El CSV menciona "${m}" pero no hay una sede activa con ese nombre en la web (puede estar desactivada por temporada).`,
      });
    } else {
      issues.push({ area: 'Ubicaciones', severity: 'ok', message: `Sede "${m}" coherente entre CSV y web.` });
    }
  }
}

/**
 * Sedes: minimos por sede (peak/off) y sobrecoste real al cliente (extra_fee x2).
 * Estos datos no estaban en el RAG y eran fuente de errores del chatbot.
 */
async function checkLocationMinDaysAndFees(supabase: SupabaseClient, issues: CoherenceIssue[]) {
  const { data: locations, error } = await supabase
    .from('locations')
    .select('slug, name, is_active, is_pickup, min_days, min_days_peak, min_days_off_peak, extra_fee')
    .eq('is_active', true)
    .eq('is_pickup', true);

  if (error) {
    issues.push({ area: 'Sedes (minimos/sobrecoste)', severity: 'warn', message: `No se pudo leer locations: ${error.message}` });
    return;
  }

  for (const l of (locations || []) as any[]) {
    const fee = Number(l.extra_fee) || 0;
    const feeReal = fee * 2;

    if (l.slug === 'murcia') {
      issues.push({
        area: 'Sedes (minimos/sobrecoste)',
        severity: 'ok',
        message: `Murcia: sin sobrecoste; minimo segun temporada.`,
      });
      continue;
    }

    const peak = l.min_days_peak ?? l.min_days ?? null;
    const off = l.min_days_off_peak ?? l.min_days ?? null;

    // Aviso si una sede distinta de Murcia no tiene minimo configurado.
    if (peak == null && off == null) {
      issues.push({
        area: 'Sedes (minimos/sobrecoste)',
        severity: 'warn',
        message: `Sede "${l.name}" sin minimo de dias configurado (min_days/min_days_peak/min_days_off_peak). El chatbot no podra indicarlo.`,
      });
    } else {
      issues.push({
        area: 'Sedes (minimos/sobrecoste)',
        severity: 'ok',
        message: `"${l.name}": minimo ${off ?? '?'} dias (oct-jun) / ${peak ?? '?'} dias (jul-sep).`,
      });
    }

    // Sobrecoste real al cliente = extra_fee x2 (lo que cobra el buscador de la web).
    if (fee > 0) {
      issues.push({
        area: 'Sedes (minimos/sobrecoste)',
        severity: 'info',
        message: `"${l.name}": extra_fee en BBDD = ${fee} € (por trayecto). Sobrecoste REAL al cliente = ${feeReal} € (recogida + devolucion). El RAG debe indexar ${feeReal} €, no ${fee} €.`,
      });
    } else {
      issues.push({
        area: 'Sedes (minimos/sobrecoste)',
        severity: 'warn',
        message: `Sede "${l.name}" distinta de Murcia con extra_fee = 0. Revisar si deberia tener sobrecoste.`,
      });
    }
  }
}

/** Fianza y franquicia del CSV vs ajustes (best-effort). */
async function checkSettings(supabase: SupabaseClient, issues: CoherenceIssue[]) {
  const { data: settings, error } = await supabase.from('settings').select('key, value');
  if (error) {
    issues.push({ area: 'Ajustes', severity: 'info', message: 'No se pudo leer la tabla settings (se omite).' });
    return;
  }
  const relevant = (settings || []).filter((s: any) =>
    /fianza|deposit|franquic|seguro|insurance/i.test(s.key)
  );
  if (relevant.length === 0) {
    issues.push({
      area: 'Ajustes',
      severity: 'info',
      message: 'No hay ajustes de fianza/franquicia en settings. El CSV indica fianza 1000 € y franquicia 900 €/siniestro; verificar manualmente.',
    });
    return;
  }
  for (const s of relevant) {
    issues.push({ area: 'Ajustes', severity: 'info', message: `settings."${s.key}" = ${JSON.stringify(s.value)} (CSV: fianza 1000 €, franquicia 900 €).` });
  }
}

// ---------- runner ----------

export async function runCoherenceChecks(provided?: SupabaseClient): Promise<CoherenceIssue[]> {
  const supabase = getClient(provided);
  const issues: CoherenceIssue[] = [];

  await checkModels(supabase, issues);
  await checkExtras(supabase, issues);
  await checkSeasonPrices(supabase, issues);
  await checkLocations(supabase, issues);
  await checkLocationMinDaysAndFees(supabase, issues);
  await checkSettings(supabase, issues);

  return issues;
}

function buildReport(issues: CoherenceIssue[]): string {
  const ts = new Date().toISOString();
  const warns = issues.filter((i) => i.severity === 'warn');
  const infos = issues.filter((i) => i.severity === 'info');
  const oks = issues.filter((i) => i.severity === 'ok');

  const byArea = (list: CoherenceIssue[]) => {
    const groups: Record<string, CoherenceIssue[]> = {};
    for (const i of list) (groups[i.area] ||= []).push(i);
    return groups;
  };

  let md = `# Informe de coherencia RAG vs web\n\n`;
  md += `Generado: ${ts}\n\n`;
  md += `- Avisos (revisar): **${warns.length}**\n- Informativos: **${infos.length}**\n- Correctos: **${oks.length}**\n\n`;

  md += `## Avisos a revisar\n\n`;
  if (warns.length === 0) md += `Sin avisos. Todo cuadra.\n\n`;
  else {
    const g = byArea(warns);
    for (const area of Object.keys(g)) {
      md += `### ${area}\n`;
      for (const i of g[area]) md += `- [ ] ${i.message}\n`;
      md += `\n`;
    }
  }

  md += `## Informativos\n\n`;
  const gi = byArea(infos);
  for (const area of Object.keys(gi)) {
    md += `### ${area}\n`;
    for (const i of gi[area]) md += `- ${i.message}\n`;
    md += `\n`;
  }

  md += `## Verificaciones correctas\n\n`;
  const go = byArea(oks);
  for (const area of Object.keys(go)) {
    md += `### ${area}\n`;
    for (const i of go[area]) md += `- ${i.message}\n`;
    md += `\n`;
  }

  return md;
}

/** Imprime resumen en consola y escribe el informe a docs/. */
export async function runAndReport(provided?: SupabaseClient): Promise<void> {
  console.log('\n🔎 Verificando coherencia RAG vs datos de la web...');
  let issues: CoherenceIssue[] = [];
  try {
    issues = await runCoherenceChecks(provided);
  } catch (err) {
    console.warn('⚠️  No se pudo completar la verificacion de coherencia:', (err as Error).message);
    return;
  }

  const warns = issues.filter((i) => i.severity === 'warn');
  const infos = issues.filter((i) => i.severity === 'info');
  const oks = issues.filter((i) => i.severity === 'ok');

  for (const i of warns) console.warn(`   ⚠️  [${i.area}] ${i.message}`);
  console.log(`   ✓ ${oks.length} correctos · ⚠️ ${warns.length} avisos · ℹ️ ${infos.length} informativos`);

  try {
    mkdirSync(resolve(process.cwd(), 'docs/02-desarrollo/chatbot'), { recursive: true });
    writeFileSync(REPORT_PATH, buildReport(issues), 'utf-8');
    console.log(`   📄 Informe escrito en docs/02-desarrollo/chatbot/INFORME-COHERENCIA-RAG.md`);
  } catch (err) {
    console.warn('   ⚠️  No se pudo escribir el informe:', (err as Error).message);
  }
}

// Ejecucion directa
if (process.argv[1] && process.argv[1].includes('verify-chatbot-coherence')) {
  runAndReport().then(() => process.exit(0));
}
