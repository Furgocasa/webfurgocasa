import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';
import { populateRecipients, type AudienceType, type SourceFilter } from '@/lib/mailing/audience';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Params = { params: Promise<{ slug: string }> };

const VALID_AUDIENCES: AudienceType[] = ['all', 'by_source'];
const VALID_SOURCES: SourceFilter[] = ['customer', 'newsletter', 'manual', 'lead', 'import'];

export async function POST(req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const body = await req.json().catch(() => ({}));
  const audience = (body.audience || 'all') as AudienceType;
  const source = (body.source || null) as SourceFilter | null;
  const testEmails = (body.test_emails || null) as string | null;

  if (!VALID_AUDIENCES.includes(audience)) {
    return NextResponse.json({ error: 'audience inválida' }, { status: 400 });
  }
  if (audience === 'by_source' && (!source || !VALID_SOURCES.includes(source))) {
    return NextResponse.json(
      { error: `source requerido (${VALID_SOURCES.join(' | ')})` },
      { status: 400 },
    );
  }

  const { data: campaign, error } = await g.sb
    .from('mailing_campaigns')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });

  try {
    const result = await populateRecipients(g.sb, campaign.id, {
      audience,
      source,
      test_emails: testEmails,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
