import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';

function isValidEmail(s: string) {
  return !!s && s.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function GET(req: NextRequest) {
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;
  const q = (new URL(req.url).searchParams.get('q') || '').trim().toLowerCase();
  let query = g.sb
    .from('email_suppressions')
    .select('id,email,reason,source,created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (q) query = query.ilike('email', `%${q}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ suppressions: data || [] });
}

export async function POST(req: NextRequest) {
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;
  const body = await req.json().catch(() => ({}));
  const email = (body?.email || '').toString().trim().toLowerCase();
  const reason = body?.reason ? String(body.reason).slice(0, 500) : null;
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Email no válido' }, { status: 400 });
  }

  const { data: dup } = await g.sb
    .from('email_suppressions')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (dup) return NextResponse.json({ error: 'Ya está en la lista' }, { status: 409 });

  // Coherencia: también marcamos los marketing_contacts con ese email como opt-out.
  const { data: contacts } = await g.sb
    .from('marketing_contacts')
    .select('id, marketing_opt_out_at')
    .ilike('email', email);
  type C = { id: string; marketing_opt_out_at: string | null };
  const ids = ((contacts || []) as C[]).filter((c) => !c.marketing_opt_out_at).map((c) => c.id);
  if (ids.length) {
    await g.sb
      .from('marketing_contacts')
      .update({
        marketing_opt_out_at: new Date().toISOString(),
        marketing_opt_out_reason: reason || 'Añadido manualmente por admin',
      })
      .in('id', ids);
  }

  const { data, error } = await g.sb
    .from('email_suppressions')
    .insert({ email, reason, source: 'admin' })
    .select('id,email,reason,source,created_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    { suppression: data, contactsMarkedOptOut: ids.length },
    { status: 201 },
  );
}

export async function DELETE(req: NextRequest) {
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;
  let id = new URL(req.url).searchParams.get('id') || '';
  if (!id) {
    const b = await req.json().catch(() => ({}));
    id = b?.id || '';
  }
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });

  // Solo quitamos de email_suppressions. NO tocamos marketing_contacts.marketing_opt_out_at
  // porque el flag del contacto puede venir de múltiples fuentes.
  const { data, error } = await g.sb
    .from('email_suppressions')
    .delete()
    .eq('id', id)
    .select('id,email')
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json({ ok: true, removed: data });
}
