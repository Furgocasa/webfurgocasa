import { NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/mailing/references
 * Lista campañas con HTML disponible para usarlas como referencia en la IA generadora.
 */
export async function GET() {
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  const { data, error } = await g.sb
    .from('mailing_campaigns_stats')
    .select('id, slug, number, subject, description, status, created_at, sent_count')
    .eq('has_html', true)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ references: data || [] });
}
