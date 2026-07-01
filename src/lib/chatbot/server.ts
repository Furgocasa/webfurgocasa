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
export const RAG_MATCH_COUNT = 8;
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
 * Ofertas de ultima hora VIGENTES en tiempo real (misma fuente que la web /ofertas:
 * RPC get_active_last_minute_offers). No se indexan en el RAG porque caducan; se
 * inyectan en cada turno para que el bot solo hable de ofertas realmente activas.
 * Devuelve '' si no hay ofertas o si falla la consulta.
 */
export async function getActiveOffersBlock(): Promise<string> {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb.rpc('get_active_last_minute_offers');
    if (error || !data) return '';
    const offers = data as Array<Record<string, any>>;
    if (!offers.length) return '';

    const lines: string[] = [
      'OFERTAS DE ULTIMA HORA VIGENTES AHORA MISMO (huecos entre reservas con descuento; datos en tiempo real). Si el cliente busca el mejor precio, una oferta o un chollo, menciona las que encajen con lo que pide (modelo, plazas, fechas o sede) y enlaza a la pagina de Ofertas:',
    ];
    for (const o of offers.slice(0, 15)) {
      const title = [o.vehicle_brand, o.vehicle_model].filter(Boolean).join(' ').trim() || o.vehicle_name || 'Camper';
      const seats = o.vehicle_seats != null ? `${o.vehicle_seats} plazas` : '';
      const beds = o.vehicle_beds != null ? `${o.vehicle_beds} camas` : '';
      const ficha = [seats, beds].filter(Boolean).join('/');
      lines.push(
        `- ${title}${ficha ? ` (${ficha})` : ''}: del ${o.offer_start_date} al ${o.offer_end_date}` +
          `${o.offer_days ? ` (${o.offer_days} días)` : ''}` +
          `${o.pickup_location_name ? `, recogida en ${o.pickup_location_name}` : ''}.` +
          `${o.discount_percentage ? ` Descuento ${o.discount_percentage}%:` : ''}` +
          `${o.final_price_per_day ? ` ${o.final_price_per_day} €/día` : ''}` +
          `${o.original_price_per_day ? ` (antes ${o.original_price_per_day} €/día)` : ''}` +
          `${o.total_final_price ? `, total ${o.total_final_price} €` : ''}` +
          `${o.savings ? `, ahorras ${o.savings} €` : ''}.`
      );
    }
    lines.push(
      'Estas ofertas son para FECHAS y vehiculos concretos y caducan: para reservarlas o ver el detalle, enlaza a la pagina de Ofertas. Si ninguna encaja con lo que pide el cliente, no te las inventes.'
    );
    return lines.join('\n');
  } catch {
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

  lines.push('', await buildEquipmentDataBlock());
  lines.push('', buildElectricityDataBlock());

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
 * Reglas de electricidad (12V vs 220V, sin inversor). Prioridad sobre RAG ambiguo.
 */
export function buildElectricityDataBlock(): string {
  return [
    'ELECTRICIDAD EN LA CAMPER (verdad absoluta):',
    '- Con baterias de vivienda y placas solares (sin cable a red externa): solo hay 12 V (CC). Alimenta luces, nevera compresor, calefaccion Truma, bomba de agua, USB y tomas mechero.',
    '- Los enchufes de 220 V del interior SOLO funcionan cuando la camper esta conectada con cable a una red externa (camping o area con toma). Sin ese cable, los enchufes 220 V NO dan corriente.',
    '- NO hay inversor: no se puede convertir 12 V de las baterias en 220 V dentro de la camper.',
    '- Cafetera electrica, microondas, secador, plancha, tostadora u otros aparatos de 220 V: SOLO con la camper enchufada a red externa. Con baterias/placas solas NO.',
    '- Alternativas sin 220 V: cafetera italiana (incluida), cocina a gas, aparatos 12 V especificos para camper.',
    '- Furgocasa facilita cable y adaptador para conectar a red de 220 V en camping.',
  ].join('\n');
}

/**
 * Datos reales de equipamiento (flota estandar + detalle por modelo).
 * Se inyecta en cada turno del chat y en el auditor via buildBusinessDataBlock.
 */
export async function buildEquipmentDataBlock(): Promise<string> {
  const sb = getServiceClient();
  const lines: string[] = [
    'EQUIPAMIENTO ESTANDAR EN TODAS LAS CAMPERS DE ALQUILER (verdad absoluta):',
    '- Placas solares INSTALADAS en el techo en TODAS las campers (nunca "algunas", "opcional" ni "preinstalacion").',
    '- Baño completo con ducha y WC quimico (cassette de aguas negras).',
    '- Cocina a gas: placa, fregadero y nevera (capacidad y tipo compresor/gas varian por modelo).',
    '- Calefaccion Truma Combi (calefaccion del habitaculo + agua caliente).',
    '- Toldo exterior, camara marcha atras, radio multimedia.',
    '- NO cites capacidad Ah de bateria (p. ej. "95 Ah") como dato universal de toda la flota: varia por modelo (gel vs litio). Solo mencionalo si preguntan por un modelo concreto y aparece en su ficha.',
  ];

  const { data: vehicles } = await sb
    .from('vehicles')
    .select('name, brand, model, slug, battery_capacity, solar_power, has_solar_panel')
    .eq('is_for_rent', true)
    .neq('status', 'inactive')
    .order('name');

  if (vehicles?.length) {
    lines.push('', 'DETALLE POR MODELO (usar solo si preguntan por un modelo concreto o diferencias):');
    for (const v of vehicles) {
      const title = [v.brand, v.model].filter(Boolean).join(' ').trim() || v.name;
      const parts: string[] = [];
      if (v.has_solar_panel !== false) parts.push('placa solar');
      if (v.solar_power) parts.push(`${v.solar_power} W solar`);
      if (v.battery_capacity) parts.push(`bateria ${v.battery_capacity}`);
      const detail = parts.length ? parts.join(', ') : 'equipamiento estandar';
      const ficha = v.slug ? ` Ficha: https://www.furgocasa.com/es/vehiculos/${v.slug}` : '';
      lines.push(`- ${title}: ${detail}.${ficha}`);
    }
  }

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
