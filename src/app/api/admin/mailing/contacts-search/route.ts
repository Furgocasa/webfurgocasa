import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/mailing/contacts-search?q=
 * Busca contactos de marketing_contacts por nombre/email/ciudad para usarlos
 * como "perfil real" en el preview y en el envío de test.
 */
export async function GET(req: NextRequest) {
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;
  const q = (new URL(req.url).searchParams.get('q') || '').trim();

  let query = g.sb
    .from('marketing_contacts')
    .select('id, email, name, city, source, locale, marketing_opt_out_at')
    .is('marketing_opt_out_at', null)
    .order('created_at', { ascending: false })
    .limit(25);

  if (q) {
    const safe = q.replace(/[%_]/g, '');
    query = query.or(`email.ilike.%${safe}%,name.ilike.%${safe}%,city.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contacts: data || [] });
}
