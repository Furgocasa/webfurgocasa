import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type OpenAI from 'openai';
import { buildSystemPrompt } from '@/lib/chatbot/prompt';
import {
  CHAT_MODEL,
  HISTORY_LIMIT,
  detectLanguage,
  getActiveOffersBlock,
  getOpenAI,
  getServiceClient,
  parseDataUrl,
  retrieveContext,
  uploadChatMedia,
} from '@/lib/chatbot/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  sessionId: z.string().min(8).max(128),
  conversationId: z.string().uuid().optional(),
  text: z.string().max(4000).optional(),
  // Idioma de navegacion de la web (señal fiable del idioma del cliente).
  locale: z.enum(['es', 'en', 'fr', 'de']).optional(),
  media: z
    .object({
      type: z.literal('image'),
      dataUrl: z.string().startsWith('data:'),
    })
    .optional(),
});

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export async function POST(request: NextRequest) {
  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Solicitud invalida' }, { status: 400 });
  }

  const { sessionId, conversationId, text, media, locale } = parsed;

  if (!text?.trim() && !media) {
    return NextResponse.json({ ok: false, error: 'Mensaje vacio' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getServiceClient();
  } catch {
    return NextResponse.json({ ok: false, error: 'Servidor no configurado' }, { status: 500 });
  }

  // 1. Conversacion (reutilizar o crear)
  let convId = conversationId;
  if (convId) {
    const { data: existing } = await supabase
      .from('chatbot_conversations')
      .select('id, session_id')
      .eq('id', convId)
      .maybeSingle();
    if (!existing || existing.session_id !== sessionId) {
      convId = undefined;
    }
  }
  if (!convId) {
    // Idioma de la conversacion: el locale de la web es la señal mas fiable;
    // si no llega, caemos a la deteccion por contenido. Se fija UNA sola vez.
    const conversationLanguage = locale || detectLanguage(text || '');
    const { data: created, error: convError } = await supabase
      .from('chatbot_conversations')
      .insert({ session_id: sessionId, language: conversationLanguage })
      .select('id')
      .single();
    if (convError || !created) {
      return NextResponse.json({ ok: false, error: 'No se pudo crear la conversacion' }, { status: 500 });
    }
    convId = created.id;
  }

  // 2. Adjuntos (solo imagen)
  let mediaUrl: string | null = null;
  let mediaType: 'image' | null = null;

  if (media) {
    const parsedMedia = parseDataUrl(media.dataUrl);
    if (!parsedMedia) {
      return NextResponse.json({ ok: false, error: 'Adjunto invalido' }, { status: 400 });
    }
    // Limite de tamano (~8MB)
    if (parsedMedia.buffer.length > 8 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: 'Adjunto demasiado grande' }, { status: 413 });
    }
    mediaType = media.type;
    mediaUrl = await uploadChatMedia(parsedMedia.buffer, parsedMedia.mimeType, media.type);
  }

  // Texto efectivo del usuario
  const userText = (text?.trim() || '').trim();
  const ragQuery = userText || 'consulta general sobre la camper';

  // 3. Contexto RAG (traduce la consulta a espanol si el cliente navega en otro idioma)
  //    + ofertas de ultima hora vigentes en tiempo real (no estan en el RAG porque caducan).
  const [context, offersBlock] = await Promise.all([
    retrieveContext(ragQuery, locale),
    getActiveOffersBlock(),
  ]);

  // 4. Historial reciente. Incluimos media_url para que las imagenes enviadas en
  // turnos anteriores sigan siendo "visibles" por el modelo en los mensajes
  // posteriores de la misma conversacion (si no, solo veria la imagen del turno
  // exacto en que se envio y respondia de forma incoherente despues).
  const { data: history } = await supabase
    .from('chatbot_messages')
    .select('role, content, media_url, media_type')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  const historyMessages: ChatMessage[] = (history || [])
    .reverse()
    .filter((m) => m.content || m.media_url)
    .map((m) => {
      if (m.role === 'user' && m.media_type === 'image' && m.media_url) {
        return {
          role: 'user',
          content: [
            { type: 'text', text: m.content || 'Te envio esta imagen, ayudame con ella.' },
            { type: 'image_url', image_url: { url: m.media_url } },
          ],
        } as ChatMessage;
      }
      return { role: m.role as 'user' | 'assistant', content: m.content || '' };
    });

  // 5. Mensaje actual del usuario (con imagen si aplica)
  let currentUserMessage: ChatMessage;
  if (mediaType === 'image' && mediaUrl) {
    currentUserMessage = {
      role: 'user',
      content: [
        { type: 'text', text: userText || 'Te envio esta imagen, ayudame con ella.' },
        { type: 'image_url', image_url: { url: mediaUrl } },
      ],
    };
  } else {
    currentUserMessage = { role: 'user', content: userText };
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: buildSystemPrompt(context, offersBlock) },
    ...historyMessages,
    currentUserMessage,
  ];

  // 6. Guardar el mensaje del usuario
  await supabase.from('chatbot_messages').insert({
    conversation_id: convId,
    role: 'user',
    content: userText,
    media_url: mediaUrl,
    media_type: mediaType,
  });

  // 7. Llamada al modelo en streaming
  let openai;
  try {
    openai = getOpenAI();
  } catch {
    return NextResponse.json({ ok: false, error: 'IA no configurada' }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const finalConvId = convId;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = '';
      try {
        const completion = await openai.chat.completions.create({
          model: CHAT_MODEL,
          messages,
          temperature: 0.55,
          stream: true,
        });

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            full += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
      } catch (err) {
        console.error('[chatbot] error en completion:', err);
        if (!full) {
          const fallback =
            'Lo siento, ahora mismo no puedo responder. Puedes contactar con nuestro equipo de Administracion y reservas en el +34 678 081 261.';
          full = fallback;
          controller.enqueue(encoder.encode(fallback));
        }
      }

      // 8. Persistir la respuesta ANTES de cerrar el stream. En entornos serverless
      // (Vercel) el trabajo posterior a controller.close() puede cancelarse, por lo
      // que el mensaje del asistente debe guardarse mientras la funcion sigue viva.
      try {
        const sb = getServiceClient();
        await sb.from('chatbot_messages').insert({
          conversation_id: finalConvId,
          role: 'assistant',
          content: full,
        });
        // No recalculamos el idioma aqui: se fijo al crear la conversacion con el
        // locale de la web. Recalcularlo en cada turno con una heuristica debil
        // provocaba que un mensaje suelto cambiara mal la etiqueta (es -> pt).
        await sb
          .from('chatbot_conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', finalConvId);
      } catch (persistErr) {
        console.error('[chatbot] error persistiendo respuesta:', persistErr);
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'x-conversation-id': finalConvId,
    },
  });
}
