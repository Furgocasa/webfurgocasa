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

  const update: Record<string, unknown> = {
    is_paused: false,
    last_tick_at: new Date().toISOString(),
    last_tick_note: 'Reanudada manualmente por admin.',
  };
  if (campaign.status === 'draft') {
    if (!campaign.html_content) {
      return NextResponse.json(
        { error: 'No puede reanudarse sin HTML.' },
        { status: 400 },
      );
    }
    update.status = 'sending';
    update.started_at = new Date().toISOString();
  }

  const { data, error: updErr } = await g.sb
    .from('mailing_campaigns')
    .update(update)
    .eq('id', campaign.id)
    .select('*')
    .single();
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
  return NextResponse.json({ campaign: data });
}
