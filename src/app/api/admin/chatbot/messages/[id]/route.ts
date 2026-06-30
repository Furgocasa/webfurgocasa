import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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

const patchSchema = z.object({
  response_quality: z.enum(['correcta', 'mejorable', 'incorrecta', 'sin_tipo']).optional(),
  admin_notes: z.string().max(5000).nullable().optional(),
});

/** GET /api/admin/chatbot/messages/[id] -> detalle de una respuesta del asistente */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: row, error } = await supabase
    .from('chatbot_messages')
    .select(
      `
      id,
      conversation_id,
      content,
      response_quality,
      admin_notes,
      created_at,
      role,
      chatbot_conversations!inner (
        id,
        language,
        contact_name,
        contact_phone,
        contact_email
      )
    `
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 });
  }
  if (row.role !== 'assistant') {
    return NextResponse.json({ error: 'No es una respuesta del asistente' }, { status: 400 });
  }

  const { data: thread } = await supabase
    .from('chatbot_messages')
    .select('role, content, created_at')
    .eq('conversation_id', row.conversation_id)
    .order('created_at', { ascending: true });

  let userQuestion = '';
  const ts = row.created_at ? new Date(row.created_at).getTime() : 0;
  for (const m of thread || []) {
    const mt = m.created_at ? new Date(m.created_at).getTime() : 0;
    if (mt >= ts) break;
    if (m.role === 'user' && m.content?.trim()) userQuestion = m.content.trim();
  }

  const conv = row.chatbot_conversations as {
    language: string | null;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
  };

  return NextResponse.json({
    message: {
      id: row.id,
      conversation_id: row.conversation_id,
      content: row.content,
      response_quality: row.response_quality || 'sin_tipo',
      admin_notes: row.admin_notes,
      created_at: row.created_at,
      user_question: userQuestion,
      language: conv.language,
      contact_name: conv.contact_name,
      contact_phone: conv.contact_phone,
      contact_email: conv.contact_email,
    },
  });
}

/** PATCH /api/admin/chatbot/messages/[id] -> clasificar una respuesta del asistente */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  let body;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 });
  }

  if (Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('chatbot_messages')
    .select('id, role')
    .eq('id', id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 });
  }
  if (existing.role !== 'assistant') {
    return NextResponse.json({ error: 'Solo se clasifican respuestas del asistente' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('chatbot_messages')
    .update(body)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}
