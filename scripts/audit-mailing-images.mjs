// scripts/audit-mailing-images.mjs
// Audita el HTML guardado de todas las campañas de mailing y reporta
// para cada una:
//   · Qué URLs de /images/mailing/vehicles/ contiene el HTML.
//   · Cuáles apuntan a archivos que EXISTEN en disco y cuáles no.
//   · Una sospecha de "cross-match" si ve más de una tarjeta con el
//     mismo internal_code en el filename.
//
// Uso:
//   node scripts/audit-mailing-images.mjs
//   node scripts/audit-mailing-images.mjs <slug>   # solo una campaña
//
// Necesita SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno (o en
// .env.local, que cargamos manualmente más abajo).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

// ── Cargar .env.local si existe ─────────────────────────────────────────
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
} catch {
  // opcional
}

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('✖ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Archivos reales en public/images/mailing/vehicles ──────────────────
const dir = path.join(process.cwd(), 'public', 'images', 'mailing', 'vehicles');
const realFiles = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const realSet = new Set(realFiles.map((f) => f.toLowerCase()));
const realByCode = new Map();
for (const f of realFiles) {
  const m = f.toLowerCase().match(/^(fu\d+)-/);
  if (m && !realByCode.has(m[1])) realByCode.set(m[1], f);
}

console.log(`\n→ Archivos reales disponibles (${realFiles.length}):`);
for (const [code, file] of realByCode) console.log(`   ${code} → ${file}`);

// ── Cargar campañas ─────────────────────────────────────────────────────
const slugFilter = process.argv[2] || null;
let query = sb.from('mailing_campaigns').select('id, slug, number, subject, html_content, status');
if (slugFilter) query = query.eq('slug', slugFilter);
const { data: campaigns, error } = await query.order('number', { ascending: true });
if (error) {
  console.error('✖ Error cargando campañas:', error.message);
  process.exit(1);
}

const IMG_SRC_RE =
  /<img\b[^>]*\bsrc\s*=\s*["']([^"']*\/images\/mailing\/vehicles\/[^"']+)["'][^>]*>/gi;
const HEADING_NEAR_IMG_RE =
  /(?:<h[1-4][^>]*>|<td[^>]*>|<p[^>]*>)([^<]{1,80})<[^]*?<img\b[^>]*\bsrc\s*=\s*["']([^"']*\/images\/mailing\/vehicles\/[^"']+)["']/gi;

for (const c of campaigns || []) {
  const html = c.html_content || '';
  console.log(`\n─────────────────────────────────────────────────────────`);
  console.log(`#${c.number ?? '-'} [${c.status}]  ${c.slug}`);
  console.log(`  subject: ${c.subject}`);
  const matches = [...html.matchAll(IMG_SRC_RE)].map((m) => m[1]);
  if (matches.length === 0) {
    console.log('  (no hay <img> de /images/mailing/vehicles/ en el HTML)');
    continue;
  }
  const seenCodes = new Map(); // code → count
  for (const url of matches) {
    const basename = url.split('/').pop().split('?')[0].toLowerCase();
    const exists = realSet.has(basename);
    const codeMatch = basename.match(/^(fu\d+)-/);
    const code = codeMatch ? codeMatch[1] : '???';
    seenCodes.set(code, (seenCodes.get(code) || 0) + 1);
    const icon = exists ? '✓' : '✖ 404';
    console.log(`  ${icon}  ${basename}`);
  }
  const repeated = [...seenCodes.entries()].filter(([, n]) => n > 1);
  if (repeated.length > 0) {
    console.log('  ⚠ Códigos repetidos en más de una <img>:');
    for (const [code, n] of repeated) console.log(`     ${code} aparece ${n}×`);
  }
}

console.log('\nListo.');
