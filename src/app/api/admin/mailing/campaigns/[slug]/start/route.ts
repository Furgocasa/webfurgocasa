import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function POST(_req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const { data: campaign, error } = await g.sb
    .from('mailing_campaigns')
    .select('id, status, html_content')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
  if (!campaign.html_content) {
    return NextResponse.json(
      { error: 'No se puede arrancar sin HTML. Genera o pega uno antes.' },
      { status: 400 },
    );
  }
  if (campaign.status === 'archived') {
    return NextResponse.json({ error: 'Campaña archivada. Reactívala primero.' }, { status: 409 });
  }

  const { count: pending } = await g.sb
    .from('mailing_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaign.id)
    .eq('status', 'pending');
  if (!pending) {
    return NextResponse.json(
      { error: 'No hay destinatarios "pending". Carga la audiencia primero.' },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const { data, error: updErr } = await g.sb
    .from('mailing_campaigns')
    .update({
      status: 'sending',
      is_paused: false,
      started_at: campaign.status === 'draft' ? now : undefined,
      last_tick_at: now,
      last_tick_note: 'Arrancada por admin. Cron enviará en el próximo tick.',
    })
    .eq('id', campaign.id)
    .select('*')
    .single();
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  return NextResponse.json({ campaign: data });
}
