/**
 * Ingesta de la base de conocimiento del chatbot a Supabase (pgvector).
 *
 * Fuentes:
 *  - CSV (chatbot_documentacion/): condiciones, funcionamiento, faqs y la informacion
 *    GENERICA de modelos (caracteristicas comunes, diferencias, como elegir).
 *  - Base de datos de la web (SOLO LECTURA): vehiculos, ubicaciones/sedes, extras,
 *    datos de empresa + reglas de reserva (settings) y temporadas (seasons).
 *
 * IMPORTANTE: este script NUNCA modifica las tablas de la web. Solo LEE de ellas y
 * unicamente ESCRIBE/BORRA en la tabla del chatbot `chatbot_kb_chunks`.
 *
 * Trocea, genera embeddings con text-embedding-3-small y reemplaza el contenido de
 * chatbot_kb_chunks por fuente.
 *
 * Uso:
 *   npm run ingest:chatbot-kb
 *
 * Requiere en .env.local: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { parse } from 'csv-parse/sync';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { runAndReport } from './verify-chatbot-coherence';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}
if (!openaiApiKey) {
  console.error('❌ Falta OPENAI_API_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

const EMBEDDING_MODEL = 'text-embedding-3-small';
const MAX_CHARS_PER_CHUNK = 1400;
const EMBED_BATCH_SIZE = 64;
const SITE_URL = 'https://www.furgocasa.com';

type Source =
  | 'condiciones'
  | 'funcionamiento'
  | 'faqs'
  | 'modelos_general'
  | 'vehiculos'
  | 'ventas'
  | 'ubicaciones'
  | 'extras'
  | 'empresa'
  | 'temporadas';

const DOCS_DIR = resolve(process.cwd(), 'chatbot_documentacion');

interface Chunk {
  source: Source;
  title: string;
  content: string;
  content_hash: string;
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Trocea un texto largo por parrafos manteniendo trozos por debajo del limite. */
function splitContent(text: string): string[] {
  const clean = text.replace(/\r\n/g, '\n').trim();
  if (clean.length <= MAX_CHARS_PER_CHUNK) return [clean];

  const paragraphs = clean.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const p = para.trim();
    if (!p) continue;

    if (p.length > MAX_CHARS_PER_CHUNK) {
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      const sentences = p.split(/(?<=[.!?])\s+/);
      for (const s of sentences) {
        if ((current + ' ' + s).length > MAX_CHARS_PER_CHUNK && current) {
          chunks.push(current.trim());
          current = '';
        }
        current += (current ? ' ' : '') + s;
      }
      continue;
    }

    if ((current + '\n\n' + p).length > MAX_CHARS_PER_CHUNK && current) {
      chunks.push(current.trim());
      current = '';
    }
    current += (current ? '\n\n' : '') + p;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function hashChunk(source: string, title: string, idx: number, content: string): string {
  return createHash('sha256').update(`${source}::${title}::${idx}::${content}`).digest('hex');
}

/** Anade uno o varios chunks (troceando si hace falta) con el titulo como prefijo. */
function addChunks(out: Chunk[], source: Source, title: string, body: string) {
  const baseTitle = (title || '(sin titulo)').replace(/\s+/g, ' ').trim();
  if (!body || !body.trim()) return;
  const parts = splitContent(body);
  parts.forEach((part, idx) => {
    const content =
      parts.length > 1
        ? `${baseTitle} (${idx + 1}/${parts.length})\n\n${part}`
        : `${baseTitle}\n\n${part}`;
    out.push({
      source,
      title: baseTitle,
      content,
      content_hash: hashChunk(source, baseTitle, idx, part),
    });
  });
}

/** Limpia HTML y entidades de los campos de descripcion de la web. */
function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>(?=)/gi, '\n')
    .replace(/<\/(p|h\d|li|div)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&aacute;/gi, 'á').replace(/&eacute;/gi, 'é').replace(/&iacute;/gi, 'í')
    .replace(/&oacute;/gi, 'ó').replace(/&uacute;/gi, 'ú').replace(/&ntilde;/gi, 'ñ')
    .replace(/&Aacute;/gi, 'Á').replace(/&Eacute;/gi, 'É').replace(/&Iacute;/gi, 'Í')
    .replace(/&Oacute;/gi, 'Ó').replace(/&Uacute;/gi, 'Ú').replace(/&Ntilde;/gi, 'Ñ')
    .replace(/&uuml;/gi, 'ü').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#\d+;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Lee un CSV y devuelve filas como [col0, col1]. */
function readRows(file: string): Array<[string, string]> {
  const filePath = resolve(DOCS_DIR, file);
  if (!existsSync(filePath)) {
    console.warn(`⚠️  No encontrado: ${file} (se omite)`);
    return [];
  }
  const raw = readFileSync(filePath, 'utf-8');
  const records = parse(raw, { skip_empty_lines: true, relax_column_count: true, bom: true }) as string[][];
  if (records.length === 0) return [];
  return records
    .slice(1)
    .map((cols) => [(cols[0] || '').trim(), (cols[1] || '').trim()] as [string, string])
    .filter(([title, info]) => title || info);
}

function normalizeTitle(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
}

// ---------------------------------------------------------------------------
// Fuentes CSV
// ---------------------------------------------------------------------------

/** condiciones y funcionamiento: una fila = un tema. */
function buildSimpleCsv(out: Chunk[], source: Source, file: string) {
  const rows = readRows(file);
  let count = out.length;
  for (const [title, info] of rows) {
    addChunks(out, source, title || '(sin titulo)', info || title);
  }
  console.log(`📄 ${file}: ${rows.length} filas -> ${out.length - count} fragmentos (${source})`);
}

/** modelos: SOLO filas genericas (titulo "ESP - ..."). Las fichas por modelo vienen de la BBDD. */
function buildModelosGeneral(out: Chunk[]) {
  const rows = readRows('MODELOS-Grid view.csv');
  const before = out.length;
  let generic = 0;
  for (const [title, info] of rows) {
    if (normalizeTitle(title).startsWith('ESP')) {
      addChunks(out, 'modelos_general', title, info || title);
      generic++;
    }
  }
  console.log(`📄 MODELOS-Grid view.csv: ${generic}/${rows.length} filas genericas -> ${out.length - before} fragmentos (modelos_general)`);
}

/** faqs: una fila por categoria con muchas preguntas. Se trocea en 1 fragmento por pregunta. */
function buildFaqs(out: Chunk[]) {
  const rows = readRows('FAQS - Preguntas frecuentes-Grid view.csv');
  const before = out.length;
  let questions = 0;

  for (const [category, qaBlock] of rows) {
    const lines = qaBlock.split('\n').map((l) => l.trim());
    let section = '';
    let question = '';
    let answer: string[] = [];

    const flush = () => {
      if (question && answer.join(' ').trim()) {
        const ctx = section ? `${category} / ${section}` : category;
        const body = `FAQ — ${ctx}\n\nPregunta: ${question}\n\nRespuesta: ${answer.join('\n').trim()}`;
        addChunks(out, 'faqs', question, body);
        questions++;
      }
      question = '';
      answer = [];
    };

    for (const line of lines) {
      if (!line) continue;
      // Encabezado de seccion: "1. Requisitos y condiciones del alquiler"
      if (/^\d+\.\s+\S/.test(line) && !line.endsWith('?')) {
        flush();
        section = line.replace(/^\d+\.\s+/, '').trim();
        continue;
      }
      // Pregunta: linea breve que termina en '?'
      if (line.endsWith('?') && line.length <= 200) {
        flush();
        question = line;
        continue;
      }
      // Cualquier otra cosa es respuesta de la pregunta en curso
      if (question) answer.push(line);
    }
    flush();
  }

  console.log(`📄 FAQS: ${rows.length} categorias -> ${questions} preguntas -> ${out.length - before} fragmentos (faqs)`);
}

// ---------------------------------------------------------------------------
// Fuentes de la base de datos de la web (SOLO LECTURA)
// ---------------------------------------------------------------------------

/** vehiculos: ficha por cada camper de alquiler activa (mismo filtro que el catalogo web ES). */
async function buildVehiculos(out: Chunk[], db: SupabaseClient) {
  const before = out.length;
  const { data, error } = await db
    .from('vehicles')
    .select('name, brand, model, slug, seats, beds, length_m, height_m, width_m, fuel_type, transmission, year, short_description, description, features')
    .eq('is_for_rent', true)
    .neq('status', 'inactive');

  if (error) {
    console.warn(`⚠️  No se pudieron leer vehiculos: ${error.message}`);
    return;
  }

  for (const v of data || []) {
    const title = [v.brand, v.model].filter(Boolean).join(' ').trim() || v.name;
    const lines: string[] = [];
    lines.push(`Camper de alquiler de Furgocasa. Marca: ${v.brand || '-'}. Modelo: ${v.model || v.name}.`);
    lines.push(`Plazas: ${v.seats ?? 4} de viaje (día) / ${v.beds ?? '-'} de noche.`);
    const ficha = [
      v.transmission ? `cambio ${String(v.transmission).toLowerCase()}` : null,
      v.fuel_type ? String(v.fuel_type).toLowerCase() : null,
      v.year ? `año ${v.year}` : null,
    ].filter(Boolean).join(', ');
    if (ficha) lines.push(`Características: ${ficha}.`);
    if (v.length_m) {
      const dims = [
        v.length_m ? `${v.length_m} m de largo` : null,
        v.height_m ? `${v.height_m} m de alto` : null,
        v.width_m ? `${v.width_m} m de ancho` : null,
      ].filter(Boolean).join(', ');
      lines.push(`Dimensiones: ${dims}.`);
    }
    if (v.short_description) lines.push(`Resumen: ${v.short_description.trim()}`);
    const desc = stripHtml(v.description);
    if (desc) lines.push(`Descripción: ${desc}`);
    if (Array.isArray(v.features) && v.features.length) {
      lines.push(`Equipamiento: ${(v.features as string[]).join('; ')}.`);
    }
    if (v.slug) lines.push(`Ficha y reserva: ${SITE_URL}/es/vehiculos/${v.slug}`);

    addChunks(out, 'vehiculos', title, lines.join('\n'));
  }

  console.log(`🚐 vehicles (BBDD, solo lectura): ${data?.length || 0} campers -> ${out.length - before} fragmentos (vehiculos)`);
}

/** ventas: ficha por cada camper EN VENTA disponible (mismo filtro que la web de ventas). */
async function buildVentas(out: Chunk[], db: SupabaseClient) {
  const before = out.length;
  const { data, error } = await db
    .from('vehicles')
    .select('name, brand, model, slug, seats, beds, length_m, height_m, fuel_type, transmission, year, sale_price, sale_price_negotiable, short_description, description, features, is_for_sale, sale_status')
    .eq('is_for_sale', true)
    .eq('sale_status', 'available');

  if (error) {
    console.warn(`⚠️  No se pudieron leer campers en venta: ${error.message}`);
    return;
  }

  for (const v of data || []) {
    const title = [v.brand, v.model].filter(Boolean).join(' ').trim() || v.name;
    const lines: string[] = [];
    lines.push(`Camper EN VENTA de Furgocasa. Marca: ${v.brand || '-'}. Modelo: ${v.model || v.name}${v.year ? `. Año ${v.year}` : ''}.`);
    lines.push(`Plazas: ${v.seats ?? '-'} de viaje (día) / ${v.beds ?? '-'} camas (noche).`);
    const price = Number(v.sale_price) > 0
      ? `${v.sale_price} €${v.sale_price_negotiable ? ' (precio negociable)' : ''}`
      : 'precio a consultar';
    lines.push(`Precio de venta: ${price}.`);
    const ficha = [
      v.transmission ? `cambio ${String(v.transmission).toLowerCase()}` : null,
      v.fuel_type ? String(v.fuel_type).toLowerCase() : null,
    ].filter(Boolean).join(', ');
    if (ficha) lines.push(`Características: ${ficha}.`);
    if (v.short_description) lines.push(`Resumen: ${v.short_description.trim()}`);
    const desc = stripHtml(v.description);
    if (desc) lines.push(`Descripción: ${desc}`);
    if (Array.isArray(v.features) && v.features.length) {
      lines.push(`Equipamiento: ${(v.features as string[]).join('; ')}.`);
    }
    if (v.slug) lines.push(`Ficha y compra: ${SITE_URL}/es/ventas/${v.slug}`);

    addChunks(out, 'ventas', `En venta: ${title}`, lines.join('\n'));
  }

  console.log(`🏷️  ventas (BBDD, solo lectura): ${data?.length || 0} campers en venta -> ${out.length - before} fragmentos (ventas)`);
}

/** ubicaciones: ficha por sede activa con direccion, horario, sobrecoste real (x2) y minimos por sede. */
async function buildUbicaciones(out: Chunk[], db: SupabaseClient) {
  const before = out.length;
  const { data, error } = await db
    .from('locations')
    .select('name, city, address, slug, is_active, is_pickup, is_dropoff, opening_time, closing_time, extra_fee, min_days, min_days_peak, min_days_off_peak, phone, notes')
    .eq('is_active', true);

  if (error) {
    console.warn(`⚠️  No se pudieron leer ubicaciones: ${error.message}`);
    return;
  }

  const hhmm = (t: string | null) => (t ? String(t).slice(0, 5) : null);

  for (const l of data || []) {
    const lines: string[] = [];
    lines.push(`Sede de Furgocasa en ${l.name}${l.city && l.city !== l.name ? ` (${l.city})` : ''}.`);
    if (l.address) lines.push(`Dirección: ${l.address}.`);
    const open = hhmm(l.opening_time);
    const close = hhmm(l.closing_time);
    if (open && close) lines.push(`Horario de recogida y entrega: de ${open} a ${close}.`);
    const tipo = [l.is_pickup ? 'recogida' : null, l.is_dropoff ? 'entrega' : null].filter(Boolean).join(' y ');
    if (tipo) lines.push(`Punto de ${tipo}. La devolución se realiza SIEMPRE en la misma sede de recogida.`);
    // Sobrecoste REAL al cliente = extra_fee x2 (recogida + devolución), igual que el buscador de la web.
    const fee = Number(l.extra_fee) || 0;
    if (fee > 0) {
      lines.push(`Sobrecoste por usar esta sede: ${fee * 2} € por alquiler (incluye recogida y devolución; la sede principal de Murcia no tiene sobrecoste).`);
    } else {
      lines.push(`Sin sobrecoste por usar esta sede.`);
    }
    // Mínimo de días por sede: las sedes distintas de Murcia tienen su propio mínimo (pico jul-sep / resto del año).
    if (l.slug === 'murcia') {
      lines.push(`Duración mínima del alquiler en esta sede: según la temporada (2 días en baja/media, 7 días en alta).`);
    } else {
      const peak = l.min_days_peak ?? l.min_days ?? null;
      const off = l.min_days_off_peak ?? l.min_days ?? null;
      if (peak != null || off != null) {
        lines.push(
          `Duración mínima del alquiler en esta sede: ${off ?? '?'} días de octubre a junio y ${peak ?? '?'} días en julio, agosto y septiembre.`
        );
      }
    }
    if (l.phone) lines.push(`Teléfono: ${l.phone}.`);
    if (l.notes) lines.push(stripHtml(l.notes));

    addChunks(out, 'ubicaciones', `Sede de ${l.name}`, lines.join('\n'));
  }

  console.log(`📍 locations (BBDD, solo lectura): ${data?.length || 0} sedes -> ${out.length - before} fragmentos (ubicaciones)`);
}

/** extras: un fragmento por extra opcional con su precio. */
async function buildExtras(out: Chunk[], db: SupabaseClient) {
  const before = out.length;
  const { data, error } = await db
    .from('extras')
    .select('name, description, price_per_day, price_per_rental, price_per_unit, price_type, min_quantity, max_quantity, is_active')
    .eq('is_active', true);

  if (error) {
    console.warn(`⚠️  No se pudieron leer extras: ${error.message}`);
    return;
  }

  for (const e of data || []) {
    let price = 'incluido / sin coste adicional';
    if (e.price_type === 'per_day' && Number(e.price_per_day) > 0) {
      price = `${e.price_per_day} € por día de alquiler`;
    } else if (Number(e.price_per_rental) > 0) {
      price = `${e.price_per_rental} € por alquiler`;
    } else if (Number(e.price_per_unit) > 0) {
      price = `${e.price_per_unit} € por unidad`;
    }
    const lines: string[] = [];
    lines.push(`Extra opcional contratable al reservar: ${e.name}.`);
    if (e.description) lines.push(`${e.description}.`);
    lines.push(`Precio: ${price}.`);
    if (e.min_quantity) lines.push(`Mínimo: ${e.min_quantity}.`);
    if (e.max_quantity) lines.push(`Máximo por reserva: ${e.max_quantity}.`);

    addChunks(out, 'extras', `Extra: ${e.name}`, lines.join('\n'));
  }

  console.log(`🧰 extras (BBDD, solo lectura): ${data?.length || 0} extras -> ${out.length - before} fragmentos (extras)`);
}

/** empresa + reglas de reserva, desde settings. */
async function buildEmpresa(out: Chunk[], db: SupabaseClient) {
  const before = out.length;
  const { data, error } = await db.from('settings').select('key, value');
  if (error) {
    console.warn(`⚠️  No se pudieron leer settings: ${error.message}`);
    return;
  }
  const map = new Map<string, any>();
  for (const s of data || []) map.set(s.key, s.value);

  const company = map.get('company');
  if (company) {
    const lines = [
      `Datos de contacto de Furgocasa.`,
      company.phone ? `Teléfono: ${company.phone}.` : null,
      company.email ? `Email: ${company.email}.` : null,
      company.address ? `Sede principal: ${company.address}.` : null,
    ].filter(Boolean) as string[];
    addChunks(out, 'empresa', 'Datos de contacto de Furgocasa', lines.join('\n'));
  }

  const booking = map.get('booking');
  const payment = map.get('payment');
  if (booking || payment) {
    const lines: string[] = ['Condiciones generales de reserva y pago de Furgocasa.'];
    if (booking?.min_days) lines.push(`Duración mínima del alquiler: ${booking.min_days} días.`);
    if (booking?.max_days) lines.push(`Duración máxima del alquiler: ${booking.max_days} días.`);
    if (booking?.advance_days) lines.push(`Antelación mínima para reservar: ${booking.advance_days} día(s).`);
    if (booking?.deposit_percentage) lines.push(`Para reservar se abona online una señal del ${booking.deposit_percentage} % del importe del alquiler; el vehículo queda bloqueado al pagarla.`);
    if (payment?.full_payment_days_before) lines.push(`El importe restante se paga ${payment.full_payment_days_before} días antes de la recogida.`);
    if (booking?.cancellation_hours) lines.push(`Política de cancelación: hasta ${booking.cancellation_hours} horas antes.`);
    addChunks(out, 'empresa', 'Condiciones de reserva y pago', lines.join('\n'));
  }

  console.log(`🏢 settings (BBDD, solo lectura): -> ${out.length - before} fragmentos (empresa)`);
}

/** temporadas: fechas y minimos por temporada (sin precios diarios concretos). */
async function buildTemporadas(out: Chunk[], db: SupabaseClient) {
  const before = out.length;
  const { data, error } = await db
    .from('seasons')
    .select('name, season_type, start_date, end_date, min_days, is_active, year')
    .eq('is_active', true)
    .order('start_date', { ascending: true });

  if (error) {
    console.warn(`⚠️  No se pudieron leer temporadas: ${error.message}`);
    return;
  }
  if (!data || data.length === 0) {
    console.log('📅 seasons (BBDD): sin temporadas activas');
    return;
  }

  const lines: string[] = [
    'Calendario de temporadas de Furgocasa (las fechas determinan la temporada; para el precio y la disponibilidad de unas fechas concretas hay que consultar la web de reservas).',
  ];
  for (const s of data) {
    lines.push(
      `${s.name}: del ${s.start_date} al ${s.end_date} — temporada ${s.season_type}${s.min_days ? `, mínimo ${s.min_days} días` : ''}.`
    );
  }
  addChunks(out, 'temporadas', 'Calendario de temporadas', lines.join('\n'));

  console.log(`📅 seasons (BBDD, solo lectura): ${data.length} temporadas -> ${out.length - before} fragmentos (temporadas)`);
}

// ---------------------------------------------------------------------------
// Orquestacion
// ---------------------------------------------------------------------------

async function buildAllChunks(): Promise<Chunk[]> {
  const out: Chunk[] = [];

  // CSV
  buildSimpleCsv(out, 'condiciones', 'CONDICIONES-Grid view.csv');
  buildSimpleCsv(out, 'funcionamiento', 'FUNCIONAMIENTO-Grid view.csv');
  buildFaqs(out);
  buildModelosGeneral(out);

  // Base de datos de la web (solo lectura)
  await buildVehiculos(out, supabase);
  await buildVentas(out, supabase);
  await buildUbicaciones(out, supabase);
  await buildExtras(out, supabase);
  await buildEmpresa(out, supabase);
  await buildTemporadas(out, supabase);

  // Deduplicar por content_hash dentro de la ejecucion.
  const seen = new Set<string>();
  return out.filter((c) => {
    if (seen.has(c.content_hash)) return false;
    seen.add(c.content_hash);
    return true;
  });
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts });
  return res.data.map((d) => d.embedding as number[]);
}

function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

async function main() {
  console.log('🚀 Ingesta de la base de conocimiento del chatbot\n');

  const chunks = await buildAllChunks();
  console.log(`\n🧩 Total de fragmentos a indexar: ${chunks.length}\n`);

  if (chunks.length === 0) {
    console.error('❌ No hay fragmentos. Revisa las fuentes (CSV y BBDD).');
    process.exit(1);
  }

  const rows: Array<{ source: string; title: string; content: string; content_hash: string; embedding: string }> = [];

  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const embeddings = await embedBatch(batch.map((c) => c.content));
    batch.forEach((c, j) => {
      rows.push({
        source: c.source,
        title: c.title,
        content: c.content,
        content_hash: c.content_hash,
        embedding: toVectorLiteral(embeddings[j]),
      });
    });
    console.log(`   embeddings ${Math.min(i + EMBED_BATCH_SIZE, chunks.length)}/${chunks.length}`);
  }

  // Reemplazar SOLO en la tabla del chatbot: borrar lo existente de estas fuentes e insertar de nuevo.
  const sources = Array.from(new Set(rows.map((r) => r.source)));
  console.log(`\n🗑️  Borrando fragmentos previos (solo en chatbot_kb_chunks) de: ${sources.join(', ')}`);
  const { error: delError } = await supabase.from('chatbot_kb_chunks').delete().in('source', sources);
  if (delError) {
    console.error('❌ Error borrando fragmentos previos:', delError.message);
    process.exit(1);
  }

  const INSERT_BATCH = 200;
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const batch = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase.from('chatbot_kb_chunks').insert(batch as never);
    if (error) {
      console.error('❌ Error insertando fragmentos:', error.message);
      process.exit(1);
    }
    console.log(`   insertados ${Math.min(i + INSERT_BATCH, rows.length)}/${rows.length}`);
  }

  console.log(`\n✅ Ingesta completada: ${rows.length} fragmentos indexados.`);
  console.log('💡 Recomendado en Supabase: ANALYZE chatbot_kb_chunks;');

  // Verificar coherencia con los datos reales de la web (solo lectura).
  await runAndReport(supabase);
}

main().catch((err) => {
  console.error('❌ Error inesperado:', err);
  process.exit(1);
});
