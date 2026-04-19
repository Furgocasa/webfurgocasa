/**
 * Tick del cron de mailing.
 *
 * Invocado por Vercel Cron cada minuto. Por cada campaña activa
 * (status='sending' AND is_paused=false):
 *   · Comprueba cupo horario (sent_at >= now()-1h < max_per_hour).
 *   · Toma hasta `batch_size_per_tick` destinatarios pending.
 *   · Doble check opt-out + envío vía nodemailer con List-Unsubscribe.
 *   · Si rate-limit → pausa la campaña y anota note.
 *   · Si no quedan pending → marca status='sent', completed_at=NOW().
 *
 * Autorización: si `CRON_SECRET` está configurado, exige
 * `Authorization: Bearer <secret>` (estándar de Vercel Cron con secret header).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { buildTransport, loadSmtpConfig } from '@/lib/mailing/transport';
import {
  sendOneRecipient,
  type CampaignForSend,
  type RecipientForSend,
} from '@/lib/mailing/send';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Transporter } from 'nodemailer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type CampaignRow = {
  id: string;
  slug: string;
  subject: string;
  html_content: string | null;
  status: string;
  is_paused: boolean;
  max_per_hour: number;
  batch_size_per_tick: number;
  started_at: string | null;
};

type TickResult = {
  slug: string;
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
  rateLimited: boolean;
  note: string;
};

async function recomputeCounters(sb: SupabaseClient, id: string) {
  const { data: rows } = await sb
    .from('mailing_recipients')
    .select('status')
    .eq('campaign_id', id);
  const n = (s: string) => (rows || []).filter((r: { status: string }) => r.status === s).length;
  await sb
    .from('mailing_campaigns')
    .update({
      sent_count: n('sent'),
      failed_count: n('failed'),
      skipped_count: n('skipped_opt_out') + n('skipped_no_email') + n('bounced'),
    })
    .eq('id', id);
}

async function processCampaign(
  sb: SupabaseClient,
  t: Transporter,
  c: CampaignRow,
): Promise<TickResult> {
  const res: TickResult = {
    slug: c.slug,
    attempted: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    rateLimited: false,
    note: '',
  };

  if (!c.html_content) {
    res.note = 'sin html_content';
    await sb
      .from('mailing_campaigns')
      .update({
        is_paused: true,
        last_tick_at: new Date().toISOString(),
        last_tick_note: 'Pausada: sin html_content. Genera el HTML antes de continuar.',
      })
      .eq('id', c.id);
    return res;
  }

  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count: used } = await sb
    .from('mailing_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', c.id)
    .eq('status', 'sent')
    .gte('sent_at', oneHourAgo);
  const remaining = Math.max(0, c.max_per_hour - (used || 0));
  if (remaining === 0) {
    res.note = `cupo horario lleno: ${used}/${c.max_per_hour}`;
    await sb
      .from('mailing_campaigns')
      .update({
        last_tick_at: new Date().toISOString(),
        last_tick_note: `Tope horario (${used}/${c.max_per_hour}). Reanuda auto en próximos ticks.`,
      })
      .eq('id', c.id);
    return res;
  }

  const batchSize = Math.min(c.batch_size_per_tick, remaining);
  const { data: queue } = await sb
    .from('mailing_recipients')
    .select('id,contact_id,email,nombre,ciudad')
    .eq('campaign_id', c.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (!queue || queue.length === 0) {
    const { count: pendingLeft } = await sb
      .from('mailing_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', c.id)
      .eq('status', 'pending');
    if ((pendingLeft || 0) === 0) {
      await sb
        .from('mailing_campaigns')
        .update({
          status: 'sent',
          completed_at: new Date().toISOString(),
          last_tick_at: new Date().toISOString(),
          last_tick_note: 'Campaña enviada (0 pending).',
        })
        .eq('id', c.id);
      res.note = 'enviada';
    } else {
      res.note = 'sin pending ahora mismo';
    }
    await recomputeCounters(sb, c.id);
    return res;
  }

  const forSend: CampaignForSend = {
    id: c.id,
    slug: c.slug,
    subject: c.subject,
    html_content: c.html_content,
  };

  for (const row of queue as RecipientForSend[]) {
    res.attempted++;
    const out = await sendOneRecipient(sb, t, forSend, row);
    if (out.kind === 'sent') res.sent++;
    else if (out.kind === 'skipped_opt_out') res.skipped++;
    else if (out.kind === 'failed') res.failed++;
    else if (out.kind === 'rate_limited') {
      res.rateLimited = true;
      res.note = `rate-limit SMTP: ${out.reason.slice(0, 160)}`;
      await sb
        .from('mailing_campaigns')
        .update({
          is_paused: true,
          last_tick_at: new Date().toISOString(),
          last_tick_note: `Pausada por rate-limit: "${out.reason.slice(0, 200)}". Reanuda manualmente tras ≥ 60 min.`,
        })
        .eq('id', c.id);
      break;
    }
  }

  await recomputeCounters(sb, c.id);
  if (!res.rateLimited) {
    res.note = `batch: ${res.sent} ok · ${res.failed} fail · ${res.skipped} skip · ${(used || 0) + res.sent}/${c.max_per_hour} en la última hora`;
    await sb
      .from('mailing_campaigns')
      .update({
        last_tick_at: new Date().toISOString(),
        last_tick_note: res.note,
      })
      .eq('id', c.id);
  }
  return res;
}

async function handleTick(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    loadSmtpConfig();
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message, hint: 'Faltan SMTP_* en .env' },
      { status: 500 },
    );
  }

  const sb = createAdminClient();
  const { data: campaigns, error } = await sb
    .from('mailing_campaigns')
    .select(
      'id,slug,subject,html_content,status,is_paused,max_per_hour,batch_size_per_tick,started_at',
    )
    .eq('status', 'sending')
    .eq('is_paused', false)
    .order('started_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!campaigns?.length) return NextResponse.json({ ok: true, active: 0, results: [] });

  const t = buildTransport();
  const results: TickResult[] = [];
  // Lock-watchdog: si un tick previo murió sin liberar, tras este timeout
  // cualquier nuevo tick puede tomarlo. 5 min > maxDuration(60s) + margen.
  const LOCK_STALE_MS = 5 * 60_000;
  for (const c of campaigns as CampaignRow[]) {
    const now = new Date();
    const staleCutoff = new Date(now.getTime() - LOCK_STALE_MS).toISOString();

    // CAS atómico: solo un tick a la vez dentro de processCampaign().
    // La condición .or() hace que el UPDATE falle si otro proceso ya
    // agarró el lock y aún no ha caducado.
    const { data: lockRows, error: lockErr } = await sb
      .from('mailing_campaigns')
      .update({ tick_lock_at: now.toISOString() })
      .eq('id', c.id)
      .or(`tick_lock_at.is.null,tick_lock_at.lt.${staleCutoff}`)
      .select('id');

    if (lockErr) {
      results.push({
        slug: c.slug,
        attempted: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
        rateLimited: false,
        note: `error tomando lock: ${lockErr.message}`,
      });
      continue;
    }
    if (!lockRows || lockRows.length === 0) {
      // Otro tick lo está procesando ya. Saltamos sin ruido.
      results.push({
        slug: c.slug,
        attempted: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
        rateLimited: false,
        note: 'skip: tick previo aún en curso',
      });
      continue;
    }

    try {
      results.push(await processCampaign(sb as SupabaseClient, t, c));
    } catch (e) {
      const msg = (e as Error).message || String(e);
      results.push({
        slug: c.slug,
        attempted: 0,
        sent: 0,
        failed: 0,
        skipped: 0,
        rateLimited: false,
        note: `error: ${msg}`,
      });
      await sb
        .from('mailing_campaigns')
        .update({
          last_tick_at: new Date().toISOString(),
          last_tick_note: `Excepción en tick: ${msg.slice(0, 200)}`,
        })
        .eq('id', c.id);
    } finally {
      // Liberamos el lock pase lo que pase (si el proceso muere aquí,
      // el watchdog de 5 min lo recupera en el siguiente tick).
      await sb
        .from('mailing_campaigns')
        .update({ tick_lock_at: null })
        .eq('id', c.id);
    }
  }

  // Cerramos el transport para no dejar conexiones colgadas.
  try {
    t.close();
  } catch {
    // noop
  }

  return NextResponse.json({ ok: true, active: campaigns.length, results });
}

export async function GET(req: NextRequest) {
  return handleTick(req);
}
export async function POST(req: NextRequest) {
  return handleTick(req);
}
