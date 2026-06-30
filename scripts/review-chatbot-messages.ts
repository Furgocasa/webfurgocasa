/**
 * Revisa respuestas del chatbot sin clasificar, las evalua contra el RAG
 * y actualiza response_quality + admin_notes en Supabase.
 *
 * Uso:
 *   npm run review:chatbot-messages
 *   npm run review:chatbot-messages -- --dry-run
 *   npm run review:chatbot-messages -- --limit 20
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { buildBusinessDataBlock, getOpenAI, getServiceClient, retrieveContext } from '../src/lib/chatbot/server';
import { buildSystemPrompt } from '../src/lib/chatbot/prompt';

config({ path: resolve(process.cwd(), '.env.local') });

type Quality = 'correcta' | 'mejorable' | 'incorrecta';

interface AssistantRow {
  id: string;
  conversation_id: string;
  content: string | null;
  response_quality: string;
  created_at: string | null;
}

interface ReviewResult {
  id: string;
  conversation_id: string;
  user_question: string;
  assistant_answer: string;
  quality: Quality;
  notes: string;
  suggested_fix?: string;
}

const REPORT_PATH = resolve(process.cwd(), 'docs/02-desarrollo/chatbot/INFORME-REVISION-MENSAJES.md');

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    // --all: re-evalua TODOS los mensajes del asistente (no solo los 'sin_tipo'),
    // util tras mejorar el auditor para reclasificar lo evaluado con la version antigua.
    all: args.includes('--all'),
    limit: Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0') || undefined,
  };
}

async function getUserQuestion(conversationId: string, createdAt: string | null): Promise<string> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('chatbot_messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  const ts = createdAt ? new Date(createdAt).getTime() : 0;
  let lastUser = '';
  for (const m of data || []) {
    const mt = m.created_at ? new Date(m.created_at).getTime() : 0;
    if (mt >= ts) break;
    if (m.role === 'user' && m.content?.trim()) lastUser = m.content.trim();
  }
  return lastUser;
}

async function evaluateMessage(row: AssistantRow, businessData: string): Promise<ReviewResult> {
  const userQuestion = await getUserQuestion(row.conversation_id, row.created_at);
  const assistantAnswer = (row.content || '').trim();
  const ragContext = await retrieveContext(userQuestion || assistantAnswer.slice(0, 200));
  const systemPrompt = buildSystemPrompt(ragContext);

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_CHATBOT_MODEL || 'gpt-4o',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}

=== DATOS REALES DE LA WEB (FUENTE DE VERDAD, PRIORIDAD MAXIMA) ===
Estos datos vienen directamente de las tablas de la web y MANDAN sobre el RAG (que puede estar incompleto o desfasado). Si la respuesta del asistente contradice estos datos, es INCORRECTA aunque el RAG parezca respaldarla.
${businessData}
=== FIN DATOS REALES ===

Eres un auditor de calidad ESCRUPULOSO del chatbot de Furgocasa. Evalua UNA respuesta concreta del asistente comparandola con los DATOS REALES de arriba y las reglas, NO solo con el RAG.

Verificaciones obligatorias antes de puntuar:
1. Precios: si la respuesta da un precio €/dia para un MES o FECHAS concretas, comprueba contra TEMPORADAS Y PRECIOS REALES. Si no coincide con la temporada de esas fechas, es INCORRECTA. Dar la tabla generica (155/145/135/125) para un mes concreto es INCORRECTO.
2. Sedes: minimos por sede y SOBRECOSTE (ida+vuelta, extra_fee x2). Si dice un minimo o un sobrecoste que no coincide con los DATOS REALES, es INCORRECTA.
3. Fianza vs pago: fianza SOLO por transferencia; pago del alquiler con tarjeta. Confundirlos es INCORRECTA.
4. Plazas: maximo 4 por camper. Extras: precios reales.
5. Idioma: debe responder en el idioma del cliente.

Criterios:
- correcta: responde bien, coherente con los DATOS REALES y las reglas, sin errores.
- mejorable: la idea es correcta pero falta precision, enlaces utiles, tono, o podria ser mas clara (sin errores de datos).
- incorrecta: contradice los DATOS REALES o las reglas, da cifras erroneas, no responde a la pregunta o inventa datos.

Responde SOLO JSON valido:
{
  "quality": "correcta" | "mejorable" | "incorrecta",
  "notes": "breve explicacion en espanol (1-3 frases), citando el dato real si hubo error",
  "suggested_fix": "si es mejorable o incorrecta, que deberia haber dicho o que cambiar en prompt/RAG (opcional)"
}`,
      },
      {
        role: 'user',
        content: `PREGUNTA DEL CLIENTE:
${userQuestion || '(sin pregunta previa clara)'}

RESPUESTA DEL ASISTENTE:
${assistantAnswer || '(vacia)'}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || '{}';
  let parsed: { quality?: string; notes?: string; suggested_fix?: string } = {};
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { quality: 'mejorable', notes: 'No se pudo parsear la evaluacion automatica.' };
  }

  const quality = (['correcta', 'mejorable', 'incorrecta'].includes(parsed.quality || '')
    ? parsed.quality
    : 'mejorable') as Quality;

  return {
    id: row.id,
    conversation_id: row.conversation_id,
    user_question: userQuestion,
    assistant_answer: assistantAnswer,
    quality,
    notes: parsed.notes?.trim() || 'Sin notas.',
    suggested_fix: parsed.suggested_fix?.trim(),
  };
}

function buildReport(results: ReviewResult[], dryRun: boolean) {
  const counts = { correcta: 0, mejorable: 0, incorrecta: 0 };
  for (const r of results) counts[r.quality]++;

  const lines: string[] = [
    '# Informe de revision automatica de mensajes del chatbot',
    '',
    `Generado: ${new Date().toISOString()}`,
    dryRun ? 'Modo: **dry-run** (sin escribir en Supabase)' : 'Modo: **aplicado** (clasificaciones guardadas)',
    '',
    '## Resumen',
    '',
    `- Correctas: ${counts.correcta}`,
    `- Mejorables: ${counts.mejorable}`,
    `- Incorrectas: ${counts.incorrecta}`,
    `- Total revisadas: ${results.length}`,
    '',
  ];

  const problematic = results.filter((r) => r.quality !== 'correcta');
  if (problematic.length) {
    lines.push('## Respuestas a mejorar o incorrectas', '');
    for (const r of problematic) {
      lines.push(`### ${r.quality.toUpperCase()} — ${r.id.slice(0, 8)}…`);
      lines.push('');
      lines.push(`**Pregunta:** ${r.user_question || '—'}`);
      lines.push('');
      lines.push(`**Respuesta:** ${r.assistant_answer.slice(0, 500)}${r.assistant_answer.length > 500 ? '…' : ''}`);
      lines.push('');
      lines.push(`**Notas:** ${r.notes}`);
      if (r.suggested_fix) lines.push(`**Sugerencia:** ${r.suggested_fix}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

async function main() {
  const { dryRun, all, limit } = parseArgs();
  const supabase = getServiceClient();

  let query = supabase
    .from('chatbot_messages')
    .select('id, conversation_id, content, response_quality, created_at')
    .eq('role', 'assistant')
    .order('created_at', { ascending: true });

  // Por defecto solo los no clasificados; con --all se reevaluan todos.
  if (!all) query = query.eq('response_quality', 'sin_tipo');

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error('Error leyendo mensajes:', error.message);
    if (error.message.includes('response_quality')) {
      console.error('Ejecuta primero supabase/migrations/chatbot-message-quality.sql');
    }
    process.exit(1);
  }

  const rows = (data || []) as AssistantRow[];
  console.log(`Mensajes a revisar: ${rows.length}${all ? ' (todos)' : ' (sin clasificar)'}${dryRun ? ' (dry-run)' : ''}`);

  if (!rows.length) {
    console.log('Nada que revisar.');
    return;
  }

  // Cargar UNA vez la fuente de verdad (tablas reales) para auditar contra ella.
  console.log('Cargando datos reales de la web (temporadas, sedes, extras, flota)...');
  const businessData = await buildBusinessDataBlock();

  const results: ReviewResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    process.stdout.write(`[${i + 1}/${rows.length}] ${row.id.slice(0, 8)}… `);
    try {
      const review = await evaluateMessage(row, businessData);
      results.push(review);
      console.log(review.quality);

      if (!dryRun) {
        const { error: upErr } = await supabase
          .from('chatbot_messages')
          .update({
            response_quality: review.quality,
            admin_notes: `[auto] ${review.notes}${review.suggested_fix ? ` | Fix: ${review.suggested_fix}` : ''}`,
          })
          .eq('id', row.id);
        if (upErr) console.error('  Error guardando:', upErr.message);
      }
    } catch (err) {
      console.log('error');
      console.error(err);
    }
  }

  mkdirSync(resolve(process.cwd(), 'docs/02-desarrollo/chatbot'), { recursive: true });
  writeFileSync(REPORT_PATH, buildReport(results, dryRun), 'utf8');
  console.log(`\nInforme: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
