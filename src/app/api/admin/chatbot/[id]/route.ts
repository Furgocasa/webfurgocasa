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

/** GET /api/admin/chatbot/[id] -> conversacion + mensajes */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: conversation, error: convError } = await supabase
    .from('chatbot_conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (convError || !conversation) {
    return NextResponse.json({ error: 'Conversacion no encontrada' }, { status: 404 });
  }

  const { data: messages } = await supabase
    .from('chatbot_messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ conversation, messages: messages || [] });
}

const patchSchema = z.object({
  status: z.enum(['open', 'closed', 'archived']).optional(),
  admin_notes: z.string().max(5000).nullable().optional(),
});

/** PATCH /api/admin/chatbot/[id] -> actualizar calidad / estado / notas */
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
  const { data, error } = await supabase
    .from('chatbot_conversations')
    .update(body)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'No se pudo actualizar' }, { status: 500 });
  }

  return NextResponse.json({ conversation: data });
}
