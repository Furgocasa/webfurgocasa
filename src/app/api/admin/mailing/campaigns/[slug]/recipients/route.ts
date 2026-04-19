import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';
type Params = { params: Promise<{ slug: string }> };

const VALID_STATUS = [
  'pending',
  'sent',
  'failed',
  'skipped_opt_out',
  'skipped_no_email',
  'bounced',
] as const;

type RecipientStatus = (typeof VALID_STATUS)[number];

export async function GET(req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const pageSize = Math.max(1, Math.min(100, Number(url.searchParams.get('pageSize') || 25)));

  const { data: campaign, error } = await g.sb
    .from('mailing_campaigns')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });

  let query = g.sb
    .from('mailing_recipients')
    .select('*', { count: 'exact' })
    .eq('campaign_id', campaign.id)
    .order('created_at', { ascending: true });

  if (status && (VALID_STATUS as readonly string[]).includes(status)) {
    query = query.eq('status', status as RecipientStatus);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error: qErr } = await query.range(from, to);
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  return NextResponse.json({
    recipients: data || [],
    page,
    pageSize,
    total: count || 0,
  });
}
