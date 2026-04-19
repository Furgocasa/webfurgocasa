/**
 * Envío efectivo de correos de mailing (uno a uno, con doble check de opt-out).
 */
import type { Transporter } from 'nodemailer';
import type { SupabaseClient } from '@supabase/supabase-js';
import { looksLikeRateLimitError, loadSmtpConfig } from './transport';
import { fixMailingVehicleImages } from './context';
import { firstName, renderTemplate, unsubscribeUrlFor } from './render';
import { sanitizeForOutlook } from './outlook-safe';

export type CampaignForSend = {
  id: string;
  slug: string;
  subject: string;
  html_content: string;
};

export type RecipientForSend = {
  id: string;
  contact_id: string | null;
  email: string;
  nombre: string | null;
  ciudad: string | null;
};

export type SendResult =
  | { kind: 'sent'; messageId: string | null }
  | { kind: 'skipped_opt_out'; reason: string }
  | { kind: 'failed'; reason: string; rateLimit: boolean }
  | { kind: 'rate_limited'; reason: string };

export async function resolveContactOptOut(
  sb: SupabaseClient,
  contactId: string | null,
): Promise<{ optedOut: boolean; token: string | null }> {
  if (!contactId) return { optedOut: false, token: null };
  const { data } = await sb
    .from('marketing_contacts')
    .select('marketing_opt_out_token, marketing_opt_out_at')
    .eq('id', contactId)
    .maybeSingle();
  if (!data) return { optedOut: false, token: null };
  return {
    optedOut: !!data.marketing_opt_out_at,
    token: (data.marketing_opt_out_token as string | null) || null,
  };
}

export async function renderCampaignHtmlFor(
  sb: SupabaseClient,
  campaign: Pick<CampaignForSend, 'html_content'>,
  r: Pick<RecipientForSend, 'contact_id' | 'nombre' | 'ciudad'>,
): Promise<{ html: string; unsubscribeUrl: string }> {
  const { token } = await resolveContactOptOut(sb, r.contact_id);
  const unsubscribeUrl = unsubscribeUrlFor(token);
  // Antes de sanear Outlook, corregimos URLs rotas de
  // /images/mailing/vehicles/ en campañas legacy (p.ej. filenames con
  // prefijo duplicado que generaba la IA antes del grounding).
  const withFixedImgs = fixMailingVehicleImages(campaign.html_content).html;
  // Sanitizamos también aquí por si el HTML guardado tiene restos no
  // Outlook-safe (gradientes, background-image, <td> sin bgcolor, etc.).
  const safe = sanitizeForOutlook(withFixedImgs);
  const html = renderTemplate(safe, {
    NOMBRE: firstName(r.nombre),
    CIUDAD: r.ciudad || '',
    UNSUBSCRIBE_URL: unsubscribeUrl,
  });
  return { html, unsubscribeUrl };
}

export async function sendOneRecipient(
  sb: SupabaseClient,
  transport: Transporter,
  campaign: CampaignForSend,
  recipient: RecipientForSend,
): Promise<SendResult> {
  // Seguridad 1/2: releer opt-out del contacto justo antes de enviar.
  const { optedOut, token } = await resolveContactOptOut(sb, recipient.contact_id);
  if (optedOut) {
    await sb
      .from('mailing_recipients')
      .update({
        status: 'skipped_opt_out',
        failed_reason: 'opt-out detectado antes de enviar',
      })
      .eq('id', recipient.id);
    return { kind: 'skipped_opt_out', reason: 'opt-out' };
  }

  // Seguridad 2/2: lista global por email.
  const cleanEmail = (recipient.email || '').trim().toLowerCase();
  if (cleanEmail) {
    const { data: suppression } = await sb
      .from('email_suppressions')
      .select('email')
      .ilike('email', cleanEmail)
      .limit(1)
      .maybeSingle();
    if (suppression) {
      await sb
        .from('mailing_recipients')
        .update({
          status: 'skipped_opt_out',
          failed_reason: 'email en email_suppressions',
        })
        .eq('id', recipient.id);
      return { kind: 'skipped_opt_out', reason: 'suppression' };
    }
  }

  const unsubscribeUrl = unsubscribeUrlFor(token);
  // Doble capa de seguridad: aunque el generador ya sanee al guardar, aquí
  // volvemos a sanear antes de enviar. Es idempotente y barato. También
  // corregimos URLs rotas de /images/mailing/vehicles/ de campañas legacy.
  const withFixedImgs = fixMailingVehicleImages(campaign.html_content).html;
  const safeHtml = sanitizeForOutlook(withFixedImgs);
  const html = renderTemplate(safeHtml, {
    NOMBRE: firstName(recipient.nombre),
    CIUDAD: recipient.ciudad || '',
    UNSUBSCRIBE_URL: unsubscribeUrl,
  });

  const cfg = loadSmtpConfig();
  const unsubscribeMailto = `mailto:${cfg.fromEmail}?subject=unsubscribe`;

  try {
    const info = await transport.sendMail({
      from: cfg.from,
      to: recipient.email,
      subject: campaign.subject,
      html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>, <${unsubscribeMailto}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    await sb
      .from('mailing_recipients')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        message_id: info.messageId || null,
        failed_reason: null,
      })
      .eq('id', recipient.id);
    return { kind: 'sent', messageId: info.messageId || null };
  } catch (e) {
    const reason = String((e as Error)?.message || e).slice(0, 500);
    if (looksLikeRateLimitError(reason)) {
      // Deja la fila en pending → se reintentará cuando se reanude la campaña.
      return { kind: 'rate_limited', reason };
    }
    await sb
      .from('mailing_recipients')
      .update({ status: 'failed', failed_reason: reason })
      .eq('id', recipient.id);
    return { kind: 'failed', reason, rateLimit: false };
  }
}

export async function sendTestEmail(
  sb: SupabaseClient,
  transport: Transporter,
  opts: {
    to: string;
    subject: string;
    html_content: string;
    contactId?: string | null;
    nombre?: string | null;
    ciudad?: string | null;
  },
): Promise<{ messageId: string | null }> {
  const cfg = loadSmtpConfig();
  const { token } = await resolveContactOptOut(sb, opts.contactId || null);
  const unsubscribeUrl = unsubscribeUrlFor(token);
  // Sanitize antes de renderizar — así el test llega a Outlook igual que el
  // envío masivo real (con bgcolor auto-añadido, sin gradientes, URLs de
  // vehículos corregidas, etc.).
  const withFixedImgs = fixMailingVehicleImages(opts.html_content).html;
  const safeHtml = sanitizeForOutlook(withFixedImgs);
  const html = renderTemplate(safeHtml, {
    NOMBRE: firstName(opts.nombre),
    CIUDAD: opts.ciudad || '',
    UNSUBSCRIBE_URL: unsubscribeUrl,
  });
  const unsubscribeMailto = `mailto:${cfg.fromEmail}?subject=unsubscribe`;
  const info = await transport.sendMail({
    from: cfg.from,
    to: opts.to,
    subject: opts.subject,
    html,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>, <${unsubscribeMailto}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
  return { messageId: info.messageId || null };
}
