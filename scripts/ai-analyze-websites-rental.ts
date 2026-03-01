/**
 * Script para que la IA analice las webs de motorhome_services y detecte
 * empresas de alquiler que se hayan escapado del filtro anterior.
 * Furgocasa es empresa de alquiler y no queremos mostrar competencia directa.
 *
 * Uso:
 *   npx tsx scripts/ai-analyze-websites-rental.ts              # Analiza todos (solo identifica)
 *   npx tsx scripts/ai-analyze-websites-rental.ts --limit 20   # Prueba con 20 primeros
 *   npx tsx scripts/ai-analyze-websites-rental.ts --delete     # Tras analizar, elimina los detectados
 *   npx tsx scripts/ai-analyze-websites-rental.ts --delete-from-csv  # Elimina los del CSV sin reanalizar
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { JSDOM } from 'jsdom';
import { resolve } from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!openaiKey) {
  console.error('❌ Falta OPENAI_API_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiKey });

const DELAY_MS = 2500; // Pausa entre peticiones para no saturar
const FETCH_TIMEOUT_MS = 15000;
const MAX_TEXT_CHARS = 4000; // Límite para no exceder tokens

interface MotorhomeService {
  id: string;
  name: string;
  slug: string;
  category: string;
  website: string | null;
  province: string | null;
}

function parseArgs(): { limit?: number; delete: boolean; deleteFromCsv: boolean } {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 && args[limitIdx + 1]
    ? parseInt(args[limitIdx + 1], 10)
    : undefined;
  const doDelete = args.includes('--delete');
  const deleteFromCsv = args.includes('--delete-from-csv');
  return { limit, delete: doDelete, deleteFromCsv };
}

async function fetchPageText(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FurgocasaBot/1.0; +https://furgocasa.com)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'es,en;q=0.9',
      },
      redirect: 'follow',
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();
    const dom = new JSDOM(html);
    const body = dom.window.document.body;
    if (!body) return null;

    let text = body.textContent || '';
    text = text.replace(/\s+/g, ' ').trim();
    if (text.length > MAX_TEXT_CHARS) {
      text = text.slice(0, MAX_TEXT_CHARS) + '...';
    }
    return text || null;
  } catch {
    return null;
  }
}

async function isRentalBusinessFromWeb(
  name: string,
  category: string,
  websiteText: string
): Promise<{ isRental: boolean; reason?: string }> {
  const prompt = `Analiza este texto extraído de la web de un negocio relacionado con autocaravanas/campers.

NOMBRE DEL NEGOCIO: ${name}
CATEGORÍA ACTUAL EN BASE DE DATOS: ${category}

TEXTO DE LA WEB (extracto):
---
${websiteText}
---

PREGUNTA: ¿Este negocio se dedica PRINCIPALMENTE o EXCLUSIVAMENTE al ALQUILER de autocaravanas, campers o furgonetas camperizadas?

Responde ÚNICAMENTE en este formato JSON (sin otro texto):
{"is_rental": true o false, "reason": "breve explicación en una frase"}

Criterios:
- Si alquila autocaravanas/campers como actividad principal = is_rental: true
- Si es taller, concesionario de venta, tienda de accesorios, camping, área de servicio = is_rental: false
- Si hace alquiler Y venta/taller pero el alquiler es secundario = is_rental: false
- En caso de duda = is_rental: false`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un clasificador. Respondes solo con JSON válido. No incluyas markdown ni texto extra.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 150,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || '{}';
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned) as { is_rental?: boolean; reason?: string };
    return {
      isRental: !!parsed.is_rental,
      reason: parsed.reason,
    };
  } catch (e) {
    console.error(`   ⚠️ Error OpenAI:`, e);
    return { isRental: false };
  }
}

async function main() {
  const { limit, delete: doDelete, deleteFromCsv } = parseArgs();

  // Modo: eliminar desde CSV sin reanalizar
  if (deleteFromCsv) {
    const csvPath = resolve(process.cwd(), 'scripts', 'rental-detected-by-ai.csv');
    if (!existsSync(csvPath)) {
      console.error('❌ No existe rental-detected-by-ai.csv. Ejecuta primero el análisis.');
      process.exit(1);
    }
    const content = readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length < 2) {
      console.log('No hay registros en el CSV.');
      return;
    }
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const ids = lines.slice(1).map((l) => {
      const m = l.match(uuidRegex);
      return m ? m[0] : null;
    }).filter((id): id is string => !!id);
    console.log(`🗑️ Eliminando ${ids.length} registros del CSV...`);
    const { error } = await supabase.from('motorhome_services').delete().in('id', ids);
    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
    console.log(`✅ ${ids.length} registros eliminados.`);
    return;
  }

  console.log('📂 Cargando motorhome_services con website...\n');

  let query = supabase
    .from('motorhome_services')
    .select('id, name, slug, category, website, province')
    .eq('status', 'active')
    .eq('operational_status', 'OPERATIONAL')
    .not('website', 'is', null);

  const { data: services, error } = await query;

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  const withWeb = (services || []).filter(
    (s: MotorhomeService) => s.website && s.website.startsWith('http')
  ) as MotorhomeService[];

  const toProcess = limit ? withWeb.slice(0, limit) : withWeb;

  console.log(`📊 Total con website: ${withWeb.length}`);
  console.log(`🔍 A analizar: ${toProcess.length}${limit ? ` (límite --limit ${limit})` : ''}\n`);

  const detected: Array<MotorhomeService & { reason?: string }> = [];
  let processed = 0;
  let skipped = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const s = toProcess[i];
    const url = s.website!.trim();
    process.stdout.write(`[${i + 1}/${toProcess.length}] ${s.name}... `);

    const text = await fetchPageText(url);
    if (!text || text.length < 100) {
      console.log('⏭️ Sin texto suficiente');
      skipped++;
      await sleep(DELAY_MS);
      continue;
    }

    const { isRental, reason } = await isRentalBusinessFromWeb(s.name, s.category, text);
    if (isRental) {
      console.log('🚨 ALQUILER');
      detected.push({ ...s, reason });
    } else {
      console.log('✅ No alquiler');
    }

    processed++;
    await sleep(DELAY_MS);
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`\n📊 Resumen: ${processed} analizados, ${skipped} sin texto, ${detected.length} empresas de alquiler detectadas\n`);

  if (detected.length > 0) {
    console.log('🚨 Empresas de alquiler detectadas por IA:\n');
    for (const d of detected) {
      console.log(`   • ${d.name} (${d.province || '-'})`);
      if (d.reason) console.log(`     Motivo: ${d.reason}`);
      console.log(`     Web: ${d.website}`);
    }

    const csvPath = resolve(process.cwd(), 'scripts', 'rental-detected-by-ai.csv');
    const csvHeader = 'id,name,slug,category,province,website,reason';
    const csvRows = detected.map((d) =>
      [d.id, d.name, d.slug, d.category, d.province || '', d.website || '', d.reason || '']
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ).join('\n');
    writeFileSync(csvPath, '\ufeff' + csvHeader + '\n' + csvRows, 'utf-8');
    console.log(`\n📄 CSV exportado: ${csvPath}`);

    if (doDelete) {
      const ids = detected.map((d) => d.id);
      const { error: delErr } = await supabase
        .from('motorhome_services')
        .delete()
        .in('id', ids);

      if (delErr) {
        console.error('\n❌ Error al eliminar:', delErr.message);
        process.exit(1);
      }
      console.log(`\n✅ ${ids.length} registros eliminados.`);
    } else {
      console.log('\n💡 Para eliminar estos registros:');
      console.log('   npx tsx scripts/ai-analyze-websites-rental.ts --delete           # Reanaliza y elimina');
      console.log('   npx tsx scripts/ai-analyze-websites-rental.ts --delete-from-csv # Elimina desde el CSV');
    }
  } else {
    console.log('✅ No se detectaron más empresas de alquiler.');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch(console.error);
