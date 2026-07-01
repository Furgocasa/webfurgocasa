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
    total: 0,
    byQuality: { correcta: 0, mejorable: 0, incorrecta: 0, sin_tipo: 0 } as Record<Quality, number>,
    byLanguage: {} as Record<string, number>,
  };
}

/** Encuentra el ultimo mensaje de usuario anterior a un mensaje del asistente. */
function precedingUserQuestion(
  conversationMessages: Array<{ role: string; content: string; created_at: string | null }>,
  assistantCreatedAt: string | null
): string {
  if (!assistantCreatedAt) return '';
  const ts = new Date(assistantCreatedAt).getTime();
  let last = '';
  for (const m of conversationMessages) {
    const mt = m.created_at ? new Date(m.created_at).getTime() : 0;
    if (mt > ts) break;
    if (m.role === 'user' && m.content?.trim()) last = m.content.trim();
  }
  return last;
}

/**
 * GET /api/admin/chatbot/messages
 * Lista respuestas del asistente (mensaje a mensaje) + estadisticas por calidad.
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

  let query = supabase
    .from('chatbot_messages')
    .select(
      `
      id,
      conversation_id,
      content,
      response_quality,
      admin_notes,
      created_at,
      chatbot_conversations!inner (
        id,
        language,
        created_at,
        contact_name,
        contact_phone,
        contact_email
      )
    `
    )
    .eq('role', 'assistant')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(300);

  if (quality) query = query.eq('response_quality', quality);
  if (language) query = query.eq('chatbot_conversations.language', language);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', `${to} 23:59:59`);
  if (q) query = query.ilike('content', `%${q}%`);

  const { data: rows, error } = await query;
  if (error) {
    console.error('[admin/chatbot/messages] error listando:', error.message);
    return NextResponse.json({ error: 'Error al listar mensajes' }, { status: 500 });
  }

  const convIds = Array.from(new Set((rows || []).map((r) => r.conversation_id)));
  const threadMap = new Map<string, Array<{ role: string; content: string; created_at: string | null }>>();

  if (convIds.length > 0) {
    const { data: thread } = await supabase
      .from('chatbot_messages')
      .select('conversation_id, role, content, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    for (const m of thread || []) {
      const list = threadMap.get(m.conversation_id) || [];
      list.push({ role: m.role, content: m.content, created_at: m.created_at });
      threadMap.set(m.conversation_id, list);
    }
  }

  const messages = (rows || []).map((r) => {
    const conv = r.chatbot_conversations as {
      id: string;
      language: string | null;
      created_at: string | null;
      contact_name: string | null;
      contact_phone: string | null;
      contact_email: string | null;
    };
    const thread = threadMap.get(r.conversation_id) || [];
    return {
      id: r.id,
      conversation_id: r.conversation_id,
      content: r.content,
      response_quality: (r.response_quality || 'sin_tipo') as Quality,
      admin_notes: r.admin_notes,
      created_at: r.created_at,
      user_question: precedingUserQuestion(thread, r.created_at),
      language: conv.language,
      contact_name: conv.contact_name,
      contact_phone: conv.contact_phone,
      contact_email: conv.contact_email,
    };
  });

  // Estadisticas globales sobre respuestas del asistente.
  const { data: allAssistant } = await supabase
    .from('chatbot_messages')
    .select('response_quality, chatbot_conversations!inner(language)')
    .eq('role', 'assistant')
    .limit(10000);

  const stats = emptyStats();
  stats.total = allAssistant?.length || 0;
  for (const row of allAssistant || []) {
    const qd = (row.response_quality || 'sin_tipo') as Quality;
    if (qd in stats.byQuality) stats.byQuality[qd]++;
    const lang = ((row.chatbot_conversations as { language: string | null })?.language ||
      'desconocido') as string;
    stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
  }

  return NextResponse.json({ messages, stats });
}
