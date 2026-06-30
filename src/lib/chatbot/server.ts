/**
 * Helpers de servidor para el chatbot: cliente Supabase (service role), OpenAI,
 * recuperacion RAG, deteccion de idioma y subida de adjuntos.
 *
 * SOLO debe importarse desde codigo de servidor (API routes / scripts).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { Database } from '@/lib/supabase/database.types';

export const CHAT_MODEL = process.env.OPENAI_CHATBOT_MODEL || 'gpt-4o';
export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const CHATBOT_BUCKET = 'chatbot-uploads';
export const RAG_MATCH_COUNT = 6;
export const HISTORY_LIMIT = 20;

let _supabase: SupabaseClient<Database> | null = null;
let _openai: OpenAI | null = null;

export function getServiceClient(): SupabaseClient<Database> {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  }
  _supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabase;
}

export function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Falta OPENAI_API_KEY');
  _openai = new OpenAI({ apiKey });
  return _openai;
}

function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

/**
 * Traduce una consulta al espanol para mejorar la recuperacion del RAG (la base
 * de conocimiento esta indexada en espanol). Si el texto ya parece espanol o la
 * traduccion falla, devuelve el original. Llamada barata con un modelo pequeno.
 */
async function translateQueryToSpanish(text: string): Promise<string> {
  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content:
            'Traduce el texto del usuario al espanol para una busqueda interna. Si ya esta en espanol, devuelvelo igual. Responde SOLO con la traduccion, sin comillas ni explicaciones.',
        },
        { role: 'user', content: text },
      ],
    });
    const out = completion.choices[0]?.message?.content?.trim();
    return out || text;
  } catch {
    return text;
  }
}

/**
 * Embebe una consulta y recupera los fragmentos mas relevantes de la base de conocimiento.
 * Devuelve un bloque de texto listo para inyectar en el prompt del sistema.
 *
 * @param query   Texto de busqueda (mensaje del cliente).
 * @param locale  Idioma de la web; si no es 'es', se traduce la consulta a espanol
 *                antes de embeber para mejorar la recuperacion multilingue.
 */
export async function retrieveContext(query: string, locale?: string): Promise<string> {
  const text = query.trim();
  if (!text) return '';

  try {
    const openai = getOpenAI();
    const supabase = getServiceClient();

    const searchText = locale && locale !== 'es' ? await translateQueryToSpanish(text) : text;

    const emb = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: searchText });
    const vector = toVectorLiteral(emb.data[0].embedding as number[]);

    const { data, error } = await supabase.rpc('match_chatbot_chunks', {
      query_embedding: vector,
      match_count: RAG_MATCH_COUNT,
    });

    if (error || !data) {
      console.error('[chatbot] error en match_chatbot_chunks:', error?.message);
      return '';
    }

    return (data as Array<{ content: string }>)
      .map((row, i) => `[Fragmento ${i + 1}]\n${row.content}`)
      .join('\n\n---\n\n');
  } catch (err) {
    console.error('[chatbot] retrieveContext fallo:', err);
    return '';
  }
}

/**
 * Construye un bloque de DATOS REALES (fuente de verdad) leido directamente de las
 * tablas de la web: temporadas con precios reales, sedes con sobrecoste real
 * (extra_fee x2 = ida + vuelta) y minimos por sede, extras, flota y reglas de negocio.
 *
 * Pensado para el AUDITOR de respuestas: el RAG puede estar incompleto o desfasado,
 * asi que estos datos tienen PRIORIDAD sobre el contexto recuperado.
 */
export async function buildBusinessDataBlock(): Promise<string> {
  const sb = getServiceClient();
  const lines: string[] = [];

  // Temporadas: precios reales por tramo de duracion + minimos.
  const { data: seasons } = await sb
    .from('seasons')
    .select(
      'name, season_type, start_date, end_date, min_days, price_less_than_week, price_one_week, price_two_weeks, price_three_weeks, is_active'
    )
    .eq('is_active', true)
    .order('start_date', { ascending: true });
  if (seasons?.length) {
    lines.push(
      'TEMPORADAS Y PRECIOS REALES (€/dia segun duracion: menos de 1 semana / 1+ sem / 2+ sem / 3+ sem):'
    );
    for (const s of seasons) {
      lines.push(
        `- ${s.name} (${s.season_type}) del ${s.start_date} al ${s.end_date}: ${s.price_less_than_week}/${s.price_one_week}/${s.price_two_weeks}/${s.price_three_weeks} €/dia; minimo ${s.min_days} dias.`
      );
    }
    lines.push(
      'Estos son los precios EXACTOS por fecha. El total final lo calcula el buscador de reservas.'
    );
  }

  // Sedes: sobrecoste real al cliente = extra_fee x2; minimos por sede (pico jul-sep / resto).
  const { data: locs } = await sb
    .from('locations')
    .select('slug, name, is_active, is_pickup, min_days, min_days_peak, min_days_off_peak, extra_fee')
    .eq('is_active', true)
    .eq('is_pickup', true)
    .order('name');
  if (locs?.length) {
    lines.push('', 'SEDES DE RECOGIDA (sobrecoste real al cliente = recogida + devolucion; minimos por sede):');
    for (const l of locs) {
      const fee = Number(l.extra_fee) || 0;
      const feeTxt = fee > 0 ? `sobrecoste +${fee * 2} € (ida y vuelta)` : 'sin sobrecoste';
      let minTxt: string;
      if (l.slug === 'murcia') {
        minTxt = 'minimo segun temporada';
      } else {
        const peak = l.min_days_peak ?? l.min_days ?? null;
        const off = l.min_days_off_peak ?? l.min_days ?? null;
        minTxt = `minimo ${off ?? '?'} dias (octubre-junio) / ${peak ?? '?'} dias (julio-septiembre)`;
      }
      lines.push(`- ${l.name}: ${feeTxt}; ${minTxt}. Devolucion en la misma sede.`);
    }
  }

  // Extras opcionales con su precio real.
  const { data: extras } = await sb
    .from('extras')
    .select('name, price_per_day, price_per_rental, price_per_unit, price_type, is_active')
    .eq('is_active', true);
  if (extras?.length) {
    lines.push('', 'EXTRAS OPCIONALES (precio real):');
    for (const e of extras) {
      let price = 'incluido / sin coste';
      if (e.price_type === 'per_day' && Number(e.price_per_day) > 0) price = `${e.price_per_day} €/dia`;
      else if (Number(e.price_per_rental) > 0) price = `${e.price_per_rental} €/alquiler`;
      else if (Number(e.price_per_unit) > 0) price = `${e.price_per_unit} €/unidad`;
      lines.push(`- ${e.name}: ${price}.`);
    }
  }

  // Flota de alquiler (plazas).
  const { data: vehicles } = await sb
    .from('vehicles')
    .select('name, brand, model, seats, beds, is_for_rent, status')
    .eq('is_for_rent', true)
    .neq('status', 'inactive');
  if (vehicles?.length) {
    lines.push('', `FLOTA DE ALQUILER (${vehicles.length} campers, maximo 4 plazas de viaje cada una):`);
    for (const v of vehicles) {
      const title = [v.brand, v.model].filter(Boolean).join(' ').trim() || v.name;
      lines.push(`- ${title}: ${v.seats ?? 4} plazas de dia / ${v.beds ?? '-'} camas.`);
    }
  }

  // Flota EN VENTA (campers a la venta, con precio y plazas/camas).
  const { data: forSale } = await sb
    .from('vehicles')
    .select('name, brand, model, slug, seats, beds, sale_price, sale_price_negotiable, year, is_for_sale, sale_status')
    .eq('is_for_sale', true)
    .eq('sale_status', 'available');
  lines.push('', `CAMPERS EN VENTA (${forSale?.length || 0} disponibles actualmente):`);
  if (forSale?.length) {
    for (const v of forSale) {
      const title = [v.brand, v.model].filter(Boolean).join(' ').trim() || v.name;
      const price = Number(v.sale_price) > 0
        ? `${v.sale_price} €${v.sale_price_negotiable ? ' (negociable)' : ''}`
        : 'precio a consultar';
      lines.push(
        `- ${title}${v.year ? ` (${v.year})` : ''}: ${v.seats ?? '-'} plazas / ${v.beds ?? '-'} camas; precio ${price}. Ficha: https://www.furgocasa.com/es/ventas/${v.slug || ''}`
      );
    }
    lines.push('Para informacion exacta de modelos en venta usa SIEMPRE esta lista (no inventes modelos ni precios).');
  } else {
    lines.push('Ahora mismo no hay campers en venta publicadas; deriva a ventas para novedades.');
  }

  // Reglas de negocio fijas (verdad absoluta).
  lines.push(
    '',
    'REGLAS DE NEGOCIO (verdad absoluta):',
    '- FIANZA: 1.000 € SIEMPRE por TRANSFERENCIA bancaria (nunca con tarjeta), maximo 72 h antes, con justificante + certificado de titularidad; devolucion en 10 dias laborables.',
    '- PAGO DEL ALQUILER: con TARJETA via pasarela Redsys; 50% al reservar y 50% 15 dias antes del inicio.',
    '- Sobrecoste de sede distinta de Murcia = extra_fee x2 (recogida + devolucion).',
    '- La devolucion es SIEMPRE en la misma sede de recogida.',
    '- Maximo 4 plazas de viaje por camper; Furgocasa NO alquila caravanas.',
    '- Para PRECIO o DISPONIBILIDAD de fechas concretas, la fuente final es el buscador de reservas (no dar tabla de precios por un mes/fechas).'
  );

  return lines.join('\n');
}

/**
 * Deteccion de idioma sencilla (heuristica por palabras frecuentes) para
 * etiquetar la conversacion en el panel de admin. El modelo responde igualmente
 * en el idioma del usuario por instruccion del prompt.
 */
export function detectLanguage(text: string): string {
  const t = ` ${text.toLowerCase()} `;
  const score: Record<string, number> = { es: 0, en: 0, fr: 0, de: 0, it: 0, pt: 0 };
  const dict: Record<string, string[]> = {
    es: [' el ', ' la ', ' que ', ' de ', ' hola ', ' gracias ', ' como ', ' donde ', ' cuanto ', ' precio '],
    en: [' the ', ' and ', ' what ', ' how ', ' hello ', ' thanks ', ' where ', ' price ', ' is ', ' you '],
    fr: [' le ', ' la ', ' bonjour ', ' merci ', ' comment ', ' ou ', ' prix ', ' est ', ' vous ', ' je '],
    de: [' der ', ' die ', ' das ', ' hallo ', ' danke ', ' wie ', ' wo ', ' preis ', ' ich ', ' und '],
    it: [' il ', ' la ', ' ciao ', ' grazie ', ' come ', ' dove ', ' prezzo ', ' che ', ' sono ', ' per '],
    pt: [' o ', ' a ', ' ola ', ' obrigado ', ' como ', ' onde ', ' preco ', ' que ', ' voce ', ' sim '],
  };
  for (const [lang, words] of Object.entries(dict)) {
    for (const w of words) {
      if (t.includes(w)) score[lang]++;
    }
  }
  let best = 'es';
  let bestScore = 0;
  for (const [lang, s] of Object.entries(score)) {
    if (s > bestScore) {
      best = lang;
      bestScore = s;
    }
  }
  return best;
}

/** Sube un adjunto (imagen/audio) al bucket del chatbot y devuelve la URL publica. */
export async function uploadChatMedia(
  buffer: Buffer,
  mimeType: string,
  kind: 'image'
): Promise<string | null> {
  try {
    const supabase = getServiceClient();
    const ext = mimeType.split('/')[1]?.split(';')[0] || 'jpg';
    const path = `${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error } = await supabase.storage
      .from(CHATBOT_BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: false });
    if (error) {
      console.error('[chatbot] error subiendo adjunto:', error.message);
      return null;
    }
    return supabase.storage.from(CHATBOT_BUCKET).getPublicUrl(path).data.publicUrl;
  } catch (err) {
    console.error('[chatbot] uploadChatMedia fallo:', err);
    return null;
  }
}

/** Convierte un dataURL base64 en buffer + mimeType. */
export function parseDataUrl(dataUrl: string): { buffer: Buffer; mimeType: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mimeType: match[1], buffer: Buffer.from(match[2], 'base64') };
}
