/**
 * Endpoint público de baja de marketing (RGPD).
 *
 * 3 modos en un único archivo:
 *   1. GET ?t=<token>   → baja directa por token (click desde el mail).
 *   2. POST ?t=<token>  → baja one-click (cabecera List-Unsubscribe-Post).
 *   3. GET sin token    → formulario bilingüe ES/EN.
 *   4. POST sin token   → procesar formulario por email (respuesta genérica GDPR-safe).
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type Locale = 'es' | 'en';

function pickLocale(req: Request, fromQuery?: string | null): Locale {
  const q = (fromQuery || '').toLowerCase();
  if (q === 'en') return 'en';
  if (q === 'es') return 'es';
  const accept = (req.headers.get('accept-language') || '').toLowerCase();
  return accept.startsWith('en') ? 'en' : 'es';
}

function htmlResponse(body: string, status = 200): NextResponse {
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

const BASE_STYLES = `
  body { margin:0; font-family:system-ui,Arial,sans-serif; background:#f5f7fa; color:#1f2a44; }
  main { max-width:560px; margin:80px auto; padding:40px 32px; background:#fff; border-radius:16px; box-shadow:0 2px 12px rgba(6,57,113,0.06); }
  main.center { text-align:center; }
  img.logo { max-width:160px; margin-bottom:24px; }
  h1 { font-family:Georgia,serif; font-size:26px; margin:0 0 12px; text-align:center; color:#063971; }
  p  { color:#475569; line-height:1.6; font-size:15px; }
  a  { color:#063971; }
  label { display:block; font-size:14px; color:#1f2a44; margin:18px 0 6px; font-weight:500; }
  input[type=email], textarea { width:100%; box-sizing:border-box; padding:12px 14px; border:1px solid #d8dee9; border-radius:10px; font-size:15px; font-family:inherit; }
  input[type=email]:focus, textarea:focus { outline:none; border-color:#063971; box-shadow:0 0 0 3px rgba(6,57,113,0.15); }
  textarea { min-height:84px; resize:vertical; }
  button { margin-top:24px; width:100%; padding:14px 18px; border:none; cursor:pointer; background:#063971; color:#fff; border-radius:12px; font-size:15px; font-weight:600; }
  button:hover { background:#052a55; }
  .lang { text-align:center; margin-top:24px; font-size:13px; color:#94a3b8; }
  .note { margin-top:24px; font-size:13px; color:#94a3b8; text-align:center; }
`;

const LOGO_URL = 'https://www.furgocasa.com/images/mailing/LOGO%20AZUL.png';
const SUPPORT_EMAIL =
  process.env.SMTP_FROM_EMAIL || process.env.COMPANY_EMAIL || 'reservas@furgocasa.com';

const I18N = {
  es: {
    formTitle: 'Darse de baja de los correos de Furgocasa',
    formIntro:
      'Introduce el email con el que recibes nuestras comunicaciones y pulsa el botón para dejar de recibir correos comerciales de Furgocasa.',
    emailLabel: 'Email',
    reasonLabel: 'Motivo (opcional)',
    reasonPlaceholder: 'Cuéntanos brevemente por qué te das de baja',
    submit: 'Darme de baja',
    emailError: 'Introduce un email válido.',
    okTitle: 'Listo, te hemos dado de baja',
    okByContact: (n: string) =>
      `No volveremos a enviar comunicaciones comerciales a <strong>${n}</strong>.`,
    okByEmail: (e: string) =>
      `Si <strong>${e}</strong> figuraba en nuestra lista, ya no recibirá más correos comerciales de Furgocasa.`,
    okFallback: 'No volveremos a enviarte comunicaciones comerciales.',
    okTail:
      'Los correos imprescindibles sobre tus reservas, pagos o devoluciones seguirán llegando, porque son necesarios para usar el servicio.',
    okContact: (e: string) =>
      `¿Te has dado de baja sin querer? Escríbenos a <a href="mailto:${e}">${e}</a> y lo revertimos.`,
    errorTitle: 'Enlace no válido',
    errorBody: (e: string) =>
      `Este enlace de baja no es correcto o ha caducado. Si quieres dejar de recibir nuestros mails, escríbenos a <a href="mailto:${e}">${e}</a> y lo hacemos manualmente.`,
    langSwitch: 'English',
  },
  en: {
    formTitle: 'Unsubscribe from Furgocasa emails',
    formIntro:
      'Enter the email address you receive our communications on and click the button to stop receiving marketing emails from Furgocasa.',
    emailLabel: 'Email',
    reasonLabel: 'Reason (optional)',
    reasonPlaceholder: 'Briefly tell us why you are unsubscribing',
    submit: 'Unsubscribe',
    emailError: 'Please enter a valid email address.',
    okTitle: 'You have been unsubscribed',
    okByContact: (n: string) => `We will no longer send marketing emails to <strong>${n}</strong>.`,
    okByEmail: (e: string) =>
      `If <strong>${e}</strong> was on our list, it will no longer receive marketing emails from Furgocasa.`,
    okFallback: 'We will no longer send you marketing communications.',
    okTail:
      'Essential emails about your bookings, payments or refunds will keep arriving, as they are required to use the service.',
    okContact: (e: string) =>
      `Did you unsubscribe by mistake? Write to <a href="mailto:${e}">${e}</a> and we will revert it.`,
    errorTitle: 'Invalid link',
    errorBody: (e: string) =>
      `This unsubscribe link is not valid or has expired. If you want to stop receiving our emails, write to <a href="mailto:${e}">${e}</a> and we will handle it manually.`,
    langSwitch: 'Español',
  },
} as const;

function pageForm(loc: Locale, opts?: { email?: string; error?: string }): string {
  const i = I18N[loc];
  const other: Locale = loc === 'es' ? 'en' : 'es';
  const otherLabel = I18N[other].langSwitch;
  const email = (opts?.email || '').replace(/"/g, '&quot;');
  const err = opts?.error
    ? `<p style="color:#b54124;margin:0 0 12px;font-size:14px;">${opts.error}</p>`
    : '';
  return `<!doctype html>
<html lang="${loc}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${i.formTitle} · Furgocasa</title><style>${BASE_STYLES}</style></head><body><main>
<div style="text-align:center"><img class="logo" src="${LOGO_URL}" alt="Furgocasa"/></div>
<h1>${i.formTitle}</h1><p style="text-align:center">${i.formIntro}</p>${err}
<form method="POST" action="/api/unsubscribe?lang=${loc}" accept-charset="utf-8">
  <label for="email">${i.emailLabel}</label>
  <input type="email" id="email" name="email" required value="${email}" autocomplete="email"/>
  <label for="reason">${i.reasonLabel}</label>
  <textarea id="reason" name="reason" placeholder="${i.reasonPlaceholder}" maxlength="500"></textarea>
  <button type="submit">${i.submit}</button>
</form>
<p class="lang"><a href="/api/unsubscribe?lang=${other}">${otherLabel}</a></p>
</main></body></html>`;
}

function pageOk(
  loc: Locale,
  opts: { contactName?: string | null; email?: string | null },
): string {
  const i = I18N[loc];
  const other: Locale = loc === 'es' ? 'en' : 'es';
  const main = opts.contactName
    ? i.okByContact(opts.contactName)
    : opts.email
      ? i.okByEmail(opts.email)
      : i.okFallback;
  return `<!doctype html>
<html lang="${loc}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${i.okTitle} · Furgocasa</title><style>${BASE_STYLES}</style></head><body><main class="center">
<img class="logo" src="${LOGO_URL}" alt="Furgocasa"/><h1>${i.okTitle}</h1>
<p>${main}</p><p>${i.okTail}</p>
<p class="note">${i.okContact(SUPPORT_EMAIL)}</p>
<p class="lang"><a href="/api/unsubscribe?lang=${other}">${I18N[other].langSwitch}</a></p>
</main></body></html>`;
}

function pageError(loc: Locale): string {
  const i = I18N[loc];
  return `<!doctype html>
<html lang="${loc}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${i.errorTitle} · Furgocasa</title><style>${BASE_STYLES}</style></head><body><main class="center">
<img class="logo" src="${LOGO_URL}" alt="Furgocasa"/>
<h1>${i.errorTitle}</h1><p>${i.errorBody(SUPPORT_EMAIL)}</p></main></body></html>`;
}

function isValidEmail(s: string) {
  return !!s && s.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function applyTokenOptOut(
  token: string,
  reason: string | null,
): Promise<{ ok: false } | { ok: true; contact: { id: string; name: string | null; marketing_opt_out_at: string | null } }> {
  const sb = createAdminClient();
  const { data: contact } = await sb
    .from('marketing_contacts')
    .select('id,name,email,marketing_opt_out_at')
    .eq('marketing_opt_out_token', token)
    .maybeSingle();
  if (!contact) return { ok: false };
  if (!contact.marketing_opt_out_at) {
    await sb
      .from('marketing_contacts')
      .update({
        marketing_opt_out_at: new Date().toISOString(),
        marketing_opt_out_reason: reason || null,
      })
      .eq('id', contact.id);

    // Coherencia: también lo metemos en email_suppressions (source='self').
    try {
      const emailLower = (contact.email || '').trim().toLowerCase();
      if (emailLower) {
        const { error } = await sb
          .from('email_suppressions')
          .insert({ email: emailLower, reason: reason || null, source: 'self' });
        if (error && error.code !== '23505') {
          console.error('[unsubscribe] suppressions insert failed:', error);
        }
      }
    } catch (e) {
      console.error('[unsubscribe] suppressions unexpected error:', e);
    }
  }
  return { ok: true, contact };
}

async function applyEmailOptOut(emailRaw: string, reason: string | null) {
  const email = emailRaw.trim().toLowerCase();
  const sb = createAdminClient();

  // Marca todos los marketing_contacts con ese email como opt-out.
  const { data: contacts } = await sb
    .from('marketing_contacts')
    .select('id, marketing_opt_out_at')
    .ilike('email', email);
  type R = { id: string; marketing_opt_out_at: string | null };
  const ids = ((contacts ?? []) as R[]).filter((c) => !c.marketing_opt_out_at).map((c) => c.id);
  if (ids.length) {
    await sb
      .from('marketing_contacts')
      .update({
        marketing_opt_out_at: new Date().toISOString(),
        marketing_opt_out_reason: reason || null,
      })
      .in('id', ids);
  }

  // Añade a la lista global (ignoramos duplicados 23505).
  try {
    const { error } = await sb
      .from('email_suppressions')
      .insert({ email, reason: reason || null, source: 'self' });
    if (error && error.code !== '23505') {
      console.error('[unsubscribe] suppressions insert failed:', error);
    }
  } catch (e) {
    console.error('[unsubscribe] suppressions unexpected error:', e);
  }
}

async function readPostBody(req: Request): Promise<URLSearchParams> {
  const ct = (req.headers.get('content-type') || '').toLowerCase();
  if (ct.includes('application/x-www-form-urlencoded')) {
    return new URLSearchParams(await req.text());
  }
  if (ct.includes('multipart/form-data')) {
    const fd = await req.formData();
    const p = new URLSearchParams();
    for (const [k, v] of fd.entries()) if (typeof v === 'string') p.append(k, v);
    return p;
  }
  if (ct.includes('application/json')) {
    const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(b)) if (typeof v === 'string') p.append(k, v);
    return p;
  }
  return new URLSearchParams(await req.text().catch(() => ''));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('t') || url.searchParams.get('token');
  const reason = (url.searchParams.get('reason') || '').slice(0, 500);
  const loc = pickLocale(req, url.searchParams.get('lang'));
  if (token) {
    const r = await applyTokenOptOut(token, reason || null);
    if (!r.ok) return htmlResponse(pageError(loc), 404);
    return htmlResponse(pageOk(loc, { contactName: r.contact.name || null, email: null }));
  }
  return htmlResponse(pageForm(loc));
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const loc = pickLocale(req, url.searchParams.get('lang'));
  const token = url.searchParams.get('t') || url.searchParams.get('token');
  if (token) {
    const reason = (url.searchParams.get('reason') || '').slice(0, 500);
    const r = await applyTokenOptOut(token, reason || null);
    if (!r.ok) return htmlResponse(pageError(loc), 404);
    return htmlResponse(pageOk(loc, { contactName: r.contact.name || null, email: null }));
  }
  const body = await readPostBody(req);
  const email = (body.get('email') || '').trim();
  const reason = (body.get('reason') || '').slice(0, 500);
  if (!isValidEmail(email)) {
    return htmlResponse(pageForm(loc, { email, error: I18N[loc].emailError }), 400);
  }
  await applyEmailOptOut(email, reason || null);
  // Respuesta genérica (GDPR-safe): NUNCA revelar si el email existía.
  return htmlResponse(pageOk(loc, { contactName: null, email }));
}
