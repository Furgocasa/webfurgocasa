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
 * Embebe una consulta y recupera los fragmentos mas relevantes de la base de conocimiento.
 * Devuelve un bloque de texto listo para inyectar en el prompt del sistema.
 */
export async function retrieveContext(query: string): Promise<string> {
  const text = query.trim();
  if (!text) return '';

  try {
    const openai = getOpenAI();
    const supabase = getServiceClient();

    const emb = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: text });
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
