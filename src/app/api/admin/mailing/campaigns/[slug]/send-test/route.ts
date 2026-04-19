import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';
import { buildTransport } from '@/lib/mailing/transport';
import { sendTestEmail } from '@/lib/mailing/send';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Params = { params: Promise<{ slug: string }> };

/**
 * POST /api/admin/mailing/campaigns/:slug/send-test
 * Body: { to: string, contactId?: string }
 * NO toca mailing_recipients. Solo envía una prueba puntual.
 */
export async function POST(req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const body = await req.json().catch(() => ({}));
  const to = (body.to || '').trim();
  const contactId = (body.contactId || null) as string | null;
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'Email destino no válido' }, { status: 400 });
  }

  const { data: campaign, error } = await g.sb
    .from('mailing_campaigns')
    .select('id, subject, html_content')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
  if (!campaign.html_content) {
    return NextResponse.json({ error: 'La campaña no tiene HTML' }, { status: 400 });
  }

  let nombre: string | null = null;
  let ciudad: string | null = null;
  if (contactId) {
    const { data: contact } = await g.sb
      .from('marketing_contacts')
      .select('name,city')
      .eq('id', contactId)
      .maybeSingle();
    nombre = contact?.name || null;
    ciudad = contact?.city || null;
  }

  try {
    const transport = buildTransport();
    const result = await sendTestEmail(g.sb, transport, {
      to,
      subject: `[TEST] ${campaign.subject}`,
      html_content: campaign.html_content,
      contactId,
      nombre,
      ciudad,
    });
    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (e) {
    const msg = (e as Error).message || String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
