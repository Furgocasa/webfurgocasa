/**
 * Endpoint de diagnóstico: "Forzar tick ahora".
 *
 * Permite al admin disparar manualmente un tick del cron desde el panel
 * (pestaña "Envío" → botón "Forzar envío ahora"). Devuelve el TickSummary
 * crudo con los resultados por campaña (intentos, enviados, fallos,
 * skipped, rate-limit, notas, errores) para diagnosticar por qué una
 * campaña no avanza: falta de migración del lock, SMTP mal configurado,
 * sin html_content, cupo horario lleno, is_paused, etc.
 *
 * No reemplaza al cron de Vercel: es un atajo de inspección / aceleración
 * puntual. Procesa TODAS las campañas activas, igual que el cron.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';
import { runTickOnce } from '@/app/api/cron/mailing-tick/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Params = { params: Promise<{ slug: string }> };

export async function POST(_req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;
  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) return g;

  // Estado crudo de la campaña ANTES del tick, para diagnosticar por qué
  // no avanza aunque el cron no la procese (status != sending, paused, etc.).
  const { data: before } = await g.sb
    .from('mailing_campaigns')
    .select(
      'id, slug, status, is_paused, tick_lock_at, last_tick_at, last_tick_note, max_per_hour, batch_size_per_tick, sent_count, failed_count, skipped_count, total_recipients',
    )
    .eq('slug', slug)
    .maybeSingle();

  const summary = await runTickOnce();

  // Estado después del tick (para que el panel vea la evolución sin refrescar).
  const { data: after } = await g.sb
    .from('mailing_campaigns')
    .select(
      'id, slug, status, is_paused, tick_lock_at, last_tick_at, last_tick_note, sent_count, failed_count, skipped_count',
    )
    .eq('slug', slug)
    .maybeSingle();

  // Destacamos el resultado de la campaña concreta que el admin está mirando.
  const forThis =
    summary.results.find((r) => r.slug === slug) || null;

  return NextResponse.json({
    ok: summary.ok,
    summary,
    forThisCampaign: forThis,
    stateBefore: before || null,
    stateAfter: after || null,
  });
}
