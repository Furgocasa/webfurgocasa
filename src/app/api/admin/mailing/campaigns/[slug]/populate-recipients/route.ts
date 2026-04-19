import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';
import { populateRecipients, type AudienceType } from '@/lib/mailing/audience';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Params = { params: Promise<{ slug: string }> };

const VALID_AUDIENCES: AudienceType[] = ['all', 'customers', 'newsletter'];

export async function POST(req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const body = await req.json().catch(() => ({}));
  const audience = (body.audience || 'all') as AudienceType;
  const testEmails = (body.test_emails || null) as string | null;

  if (!VALID_AUDIENCES.includes(audience)) {
    return NextResponse.json(
      { error: `audience inválida (${VALID_AUDIENCES.join(' | ')})` },
      { status: 400 },
    );
  }

  const { data: campaign, error } = await g.sb
    .from('mailing_campaigns')
    .select('id, status')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });

  if (campaign.status === 'sending' || campaign.status === 'sent' || campaign.status === 'archived') {
    return NextResponse.json(
      {
        error:
          'No se puede modificar la audiencia de una campaña en envío, enviada o archivada. Pausa y reinicia con un nuevo borrador si necesitas cambiarla.',
      },
      { status: 409 },
    );
  }

  try {
    const result = await populateRecipients(g.sb, campaign.id, {
      audience,
      test_emails: testEmails,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
