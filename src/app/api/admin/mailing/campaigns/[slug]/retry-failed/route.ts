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
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });

  const { data: updated, error: updErr } = await g.sb
    .from('mailing_recipients')
    .update({ status: 'pending', failed_reason: null })
    .eq('campaign_id', campaign.id)
    .eq('status', 'failed')
    .select('id');
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, requeued: (updated || []).length });
}
