import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';

const EDITABLE_FIELDS = [
  'subject',
  'description',
  'max_per_hour',
  'batch_size_per_tick',
  'audience_filter',
  'html_content',
] as const;

type Params = { params: Promise<{ slug: string }> };

async function loadCampaign(sb: any, slug: string) {
  const { data: campaign, error } = await sb
    .from('mailing_campaigns')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return { error: error.message, status: 500 };
  if (!campaign) return { error: 'Campaña no encontrada', status: 404 };
  return { campaign };
}

export async function GET(_req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const r = await loadCampaign(g.sb, slug);
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status });

  const { data: stats } = await g.sb
    .from('mailing_campaigns_stats')
    .select('*')
    .eq('id', r.campaign.id)
    .maybeSingle();

  return NextResponse.json({ campaign: r.campaign, stats: stats || null });
}

export async function PATCH(req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const r = await loadCampaign(g.sb, slug);
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status });

  const body = await req.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  for (const f of EDITABLE_FIELDS) {
    if (body[f] !== undefined) update[f] = body[f];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
  }

  const { data, error } = await g.sb
    .from('mailing_campaigns')
    .update(update)
    .eq('id', r.campaign.id)
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaign: data });
}

export async function DELETE(_req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const r = await loadCampaign(g.sb, slug);
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status });
  if (r.campaign.status !== 'draft') {
    return NextResponse.json(
      { error: 'Solo se pueden borrar campañas en estado "draft". Archívala en su lugar.' },
      { status: 409 },
    );
  }

  const { error } = await g.sb
    .from('mailing_campaigns')
    .delete()
    .eq('id', r.campaign.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
