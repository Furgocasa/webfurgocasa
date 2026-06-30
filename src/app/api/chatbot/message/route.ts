import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type OpenAI from 'openai';
import { buildSystemPrompt } from '@/lib/chatbot/prompt';
import {
  CHAT_MODEL,
  HISTORY_LIMIT,
  detectLanguage,
  getOpenAI,
  getServiceClient,
  parseDataUrl,
  retrieveContext,
  transcribeAudio,
  uploadChatMedia,
} from '@/lib/chatbot/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  sessionId: z.string().min(8).max(128),
  conversationId: z.string().uuid().optional(),
  text: z.string().max(4000).optional(),
  media: z
    .object({
      type: z.enum(['image', 'audio']),
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

  const { sessionId, conversationId, text, media } = parsed;

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
    const { data: created, error: convError } = await supabase
      .from('chatbot_conversations')
      .insert({ session_id: sessionId, language: detectLanguage(text || '') })
      .select('id')
      .single();
    if (convError || !created) {
      return NextResponse.json({ ok: false, error: 'No se pudo crear la conversacion' }, { status: 500 });
    }
    convId = created.id;
  }

  // 2. Adjuntos (imagen / audio)
  let mediaUrl: string | null = null;
  let mediaType: 'image' | 'audio' | null = null;
  let transcription: string | null = null;

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
    if (media.type === 'audio') {
      transcription = await transcribeAudio(parsedMedia.buffer, parsedMedia.mimeType);
    }
  }

  // Texto efectivo del usuario (lo escrito o la transcripcion del audio)
  const userText = (text?.trim() || transcription || '').trim();
  const ragQuery = userText || 'consulta general sobre la camper';

  // 3. Contexto RAG
  const context = await retrieveContext(ragQuery);

  // 4. Historial reciente
  const { data: history } = await supabase
    .from('chatbot_messages')
    .select('role, content')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT);

  const historyMessages: ChatMessage[] = (history || [])
    .reverse()
    .filter((m) => m.content)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

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
    { role: 'system', content: buildSystemPrompt(context) },
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
    transcription,
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
          temperature: 0.4,
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
      } finally {
        controller.close();
        // 8. Persistir respuesta y actualizar la conversacion (fuera del flujo de bytes)
        try {
          const sb = getServiceClient();
          await sb.from('chatbot_messages').insert({
            conversation_id: finalConvId,
            role: 'assistant',
            content: full,
          });
          await sb
            .from('chatbot_conversations')
            .update({
              last_message_at: new Date().toISOString(),
              language: detectLanguage(userText),
            })
            .eq('id', finalConvId);
        } catch (persistErr) {
          console.error('[chatbot] error persistiendo respuesta:', persistErr);
        }
      }
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
