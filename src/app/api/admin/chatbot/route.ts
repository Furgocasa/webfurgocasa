import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: 'No autenticado' };

  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!admin) return { ok: false as const, status: 403, error: 'Solo administradores' };
  return { ok: true as const };
}

type Quality = 'correcta' | 'mejorable' | 'incorrecta' | 'sin_tipo';

function emptyStats() {
  return {
    totalResponses: 0,
    totalConversations: 0,
    byQuality: { correcta: 0, mejorable: 0, incorrecta: 0, sin_tipo: 0 } as Record<Quality, number>,
    byLanguage: {} as Record<string, number>,
  };
}

/**
 * GET /api/admin/chatbot
 * Lista conversaciones + estadisticas (calidad por respuesta del asistente).
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const supabase = createAdminClient();
  const params = request.nextUrl.searchParams;
  const quality = params.get('quality') as Quality | null;
  const language = params.get('language');
  const from = params.get('from');
  const to = params.get('to');
  const q = params.get('q')?.trim();

  let conversationIdsFromSearch: string[] | null = null;
  if (q) {
    const { data: msgs } = await supabase
      .from('chatbot_messages')
      .select('conversation_id')
      .ilike('content', `%${q}%`)
      .limit(2000);
    conversationIdsFromSearch = Array.from(new Set((msgs || []).map((m) => m.conversation_id)));
    if (conversationIdsFromSearch.length === 0) {
      return NextResponse.json({ conversations: [], stats: emptyStats() });
    }
  }

  // Filtro por calidad: conversaciones que tengan al menos una respuesta del asistente con ese tipo.
  let conversationIdsFromQuality: string[] | null = null;
  if (quality) {
    const { data: qMsgs } = await supabase
      .from('chatbot_messages')
      .select('conversation_id')
      .eq('role', 'assistant')
      .eq('response_quality', quality)
      .limit(5000);
    conversationIdsFromQuality = Array.from(new Set((qMsgs || []).map((m) => m.conversation_id)));
    if (conversationIdsFromQuality.length === 0) {
      return NextResponse.json({ conversations: [], stats: emptyStats() });
    }
  }

  let query = supabase
    .from('chatbot_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(300);

  if (language) query = query.eq('language', language);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', `${to} 23:59:59`);
  if (conversationIdsFromSearch) query = query.in('id', conversationIdsFromSearch);
  if (conversationIdsFromQuality) query = query.in('id', conversationIdsFromQuality);

  const { data: conversations, error } = await query;
  if (error) {
    console.error('[admin/chatbot] error listando:', error.message);
    return NextResponse.json({ error: 'Error al listar conversaciones' }, { status: 500 });
  }

  const ids = (conversations || []).map((c) => c.id);

  // Puntuacion por calidad de respuesta (para la nota media de la conversacion).
  const QUALITY_SCORE: Record<string, number> = { correcta: 10, mejorable: 5, incorrecta: 0 };

  const previews = new Map<
    string,
    {
      count: number;
      assistantCount: number;
      unclassified: number;
      classified: number;
      scoreSum: number;
      firstUser: string;
      last: string;
    }
  >();

  if (ids.length > 0) {
    const { data: messages } = await supabase
      .from('chatbot_messages')
      .select('conversation_id, role, content, media_type, transcription, created_at, response_quality')
      .in('conversation_id', ids)
      .order('created_at', { ascending: true });

    for (const m of messages || []) {
      const entry = previews.get(m.conversation_id) || {
        count: 0,
        assistantCount: 0,
        unclassified: 0,
        classified: 0,
        scoreSum: 0,
        firstUser: '',
        last: '',
      };
      entry.count++;
      const text =
        m.content?.trim() ||
        m.transcription?.trim() ||
        (m.media_type === 'image' ? '[imagen]' : m.media_type === 'audio' ? '[audio]' : '');
      if (m.role === 'user' && !entry.firstUser) entry.firstUser = text;
      if (m.role === 'assistant') {
        entry.assistantCount++;
        const qd = (m.response_quality || 'sin_tipo') as Quality;
        if (qd === 'sin_tipo') {
          entry.unclassified++;
        } else if (qd in QUALITY_SCORE) {
          entry.classified++;
          entry.scoreSum += QUALITY_SCORE[qd];
        }
      }
      entry.last = text;
      previews.set(m.conversation_id, entry);
    }
  }

  const result = (conversations || []).map((c) => {
    const p = previews.get(c.id) || {
      count: 0,
      assistantCount: 0,
      unclassified: 0,
      classified: 0,
      scoreSum: 0,
      firstUser: '',
      last: '',
    };
    return {
      id: c.id,
      created_at: c.created_at,
      last_message_at: c.last_message_at,
      language: c.language,
      status: c.status,
      admin_notes: c.admin_notes,
      contact_name: c.contact_name,
      contact_phone: c.contact_phone,
      contact_email: c.contact_email,
      message_count: p.count,
      assistant_count: p.assistantCount,
      unclassified_responses: p.unclassified,
      classified_responses: p.classified,
      quality_score: p.classified > 0 ? Math.round((p.scoreSum / p.classified) * 10) / 10 : null,
      first_user_message: p.firstUser,
      last_message: p.last,
    };
  });

  const stats = emptyStats();

  const { count: convCount } = await supabase
    .from('chatbot_conversations')
    .select('*', { count: 'exact', head: true });

  stats.totalConversations = convCount || 0;

  const { data: allAssistant } = await supabase
    .from('chatbot_messages')
    .select('response_quality, chatbot_conversations!inner(language)')
    .eq('role', 'assistant')
    .limit(10000);

  stats.totalResponses = allAssistant?.length || 0;
  for (const row of allAssistant || []) {
    const qd = (row.response_quality || 'sin_tipo') as Quality;
    if (qd in stats.byQuality) stats.byQuality[qd]++;
    const lang = ((row.chatbot_conversations as { language: string | null })?.language ||
      'desconocido') as string;
    stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
  }

  return NextResponse.json({ conversations: result, stats });
}
