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

/**
 * GET /api/admin/chatbot
 * Lista conversaciones del chatbot + estadisticas (calidad e idioma).
 * Query params: quality, language, from, to, q (busqueda en mensajes)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const supabase = createAdminClient();
  const params = request.nextUrl.searchParams;
  const quality = params.get('quality');
  const language = params.get('language');
  const from = params.get('from');
  const to = params.get('to');
  const q = params.get('q')?.trim();

  // Si hay busqueda de texto, primero localizamos las conversaciones que contienen el termino.
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

  let query = supabase
    .from('chatbot_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(300);

  if (quality) query = query.eq('response_quality', quality);
  if (language) query = query.eq('language', language);
  if (from) query = query.gte('created_at', from);
  if (to) query = query.lte('created_at', `${to} 23:59:59`);
  if (conversationIdsFromSearch) query = query.in('id', conversationIdsFromSearch);

  const { data: conversations, error } = await query;
  if (error) {
    console.error('[admin/chatbot] error listando:', error.message);
    return NextResponse.json({ error: 'Error al listar conversaciones' }, { status: 500 });
  }

  const ids = (conversations || []).map((c) => c.id);

  // Mensajes de esas conversaciones para previsualizacion y conteo.
  const previews = new Map<
    string,
    { count: number; firstUser: string; last: string }
  >();
  if (ids.length > 0) {
    const { data: messages } = await supabase
      .from('chatbot_messages')
      .select('conversation_id, role, content, media_type, transcription, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: true });

    for (const m of messages || []) {
      const entry = previews.get(m.conversation_id) || { count: 0, firstUser: '', last: '' };
      entry.count++;
      const text =
        m.content?.trim() ||
        m.transcription?.trim() ||
        (m.media_type === 'image' ? '[imagen]' : m.media_type === 'audio' ? '[audio]' : '');
      if (m.role === 'user' && !entry.firstUser) entry.firstUser = text;
      entry.last = text;
      previews.set(m.conversation_id, entry);
    }
  }

  const result = (conversations || []).map((c) => {
    const p = previews.get(c.id) || { count: 0, firstUser: '', last: '' };
    return {
      id: c.id,
      created_at: c.created_at,
      last_message_at: c.last_message_at,
      language: c.language,
      status: c.status,
      response_quality: c.response_quality,
      contact_name: c.contact_name,
      contact_phone: c.contact_phone,
      contact_email: c.contact_email,
      message_count: p.count,
      first_user_message: p.firstUser,
      last_message: p.last,
    };
  });

  // Estadisticas globales (sobre todas las conversaciones, sin filtros).
  const { data: all } = await supabase
    .from('chatbot_conversations')
    .select('response_quality, language')
    .limit(10000);

  const stats = emptyStats();
  stats.total = all?.length || 0;
  for (const row of all || []) {
    const qd = row.response_quality as keyof typeof stats.byQuality;
    if (qd in stats.byQuality) stats.byQuality[qd]++;
    const lang = (row.language || 'desconocido') as string;
    stats.byLanguage[lang] = (stats.byLanguage[lang] || 0) + 1;
  }

  return NextResponse.json({ conversations: result, stats });
}

function emptyStats() {
  return {
    total: 0,
    byQuality: { correcta: 0, mejorable: 0, incorrecta: 0, sin_tipo: 0 } as Record<string, number>,
    byLanguage: {} as Record<string, number>,
  };
}
