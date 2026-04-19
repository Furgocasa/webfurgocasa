import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';
import { renderTemplate, unsubscribeUrlFor } from '@/lib/mailing/render';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/admin/mailing/campaigns/:slug/preview?contactId=<uuid>
 * Devuelve HTML renderizado con datos reales de un contacto (o placeholder ficticio).
 * Pensado para mostrarse en un <iframe srcDoc={...}> del panel.
 */
export async function GET(req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const { data: campaign, error } = await g.sb
    .from('mailing_campaigns')
    .select('id, html_content')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
  if (!campaign.html_content) {
    return NextResponse.json(
      { error: 'La campaña no tiene HTML todavía. Genera o pega uno.' },
      { status: 400 },
    );
  }

  const contactId = new URL(req.url).searchParams.get('contactId');
  let nombre = 'Juan';
  let ciudad = 'Madrid';
  let token: string | null = null;

  if (contactId) {
    const { data: contact } = await g.sb
      .from('marketing_contacts')
      .select('name,city,marketing_opt_out_token')
      .eq('id', contactId)
      .maybeSingle();
    if (contact) {
      nombre = contact.name || nombre;
      ciudad = contact.city || ciudad;
      token = (contact.marketing_opt_out_token as string | null) || null;
    }
  }

  const html = renderTemplate(campaign.html_content, {
    NOMBRE: nombre,
    CIUDAD: ciudad,
    UNSUBSCRIBE_URL: unsubscribeUrlFor(token),
  });

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
