import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';
type Params = { params: Promise<{ slug: string }> };

export async function POST(_req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const { data, error } = await g.sb
    .from('mailing_campaigns')
    .update({
      is_paused: true,
      last_tick_at: new Date().toISOString(),
      last_tick_note: 'Pausada manualmente por admin.',
    })
    .eq('slug', slug)
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ campaign: data });
}
