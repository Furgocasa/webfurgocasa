import { NextRequest, NextResponse } from 'next/server';
import { requireMailingAdmin } from '@/lib/mailing/auth';
import { renderTemplate, unsubscribeUrlFor } from '@/lib/mailing/render';
import { sanitizeForOutlook } from '@/lib/mailing/outlook-safe';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

/**
 * GET /api/admin/mailing/campaigns/:slug/preview?contactId=<uuid>
 * Devuelve HTML renderizado con datos reales de un contacto (o placeholder ficticio).
 * Pensado para mostrarse en un <iframe> del panel.
 *
 * Si se abre directamente en el navegador sin sesión o sin HTML, devuelve una
 * pagina HTML amigable explicando el caso, en vez de un JSON técnico.
 */
export async function GET(req: NextRequest, ctx: Params) {
  const { slug } = await ctx.params;

  const g = await requireMailingAdmin();
  if (g instanceof NextResponse) {
    // requireMailingAdmin devuelve 401 o 403 como JSON.
    // Convertimos a página amigable preservando el status.
    const status = g.status;
    return htmlPage(status, buildAuthErrorHtml(slug, status));
  }

  const { data: campaign, error } = await g.sb
    .from('mailing_campaigns')
    .select('id, slug, subject, html_content, status')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    return htmlPage(500, buildGenericErrorHtml('Error consultando la base de datos', error.message));
  }
  if (!campaign) {
    return htmlPage(404, buildNotFoundHtml(slug));
  }
  if (!campaign.html_content) {
    return htmlPage(400, buildNoHtmlHtml(slug, campaign.subject));
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

  // Aplicamos la sanitización Outlook-safe también en preview para que lo que
  // se ve en el iframe del admin sea exactamente lo que llegará a Outlook
  // (aunque el HTML guardado en BD tenga aún restos que un LLM antiguo
  // hubiera colado: gradientes, background-image, sin bgcolor, etc.).
  const safeHtml = sanitizeForOutlook(campaign.html_content);
  const html = renderTemplate(safeHtml, {
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

// ──────────────────────────────────────────────────────────────
// Helpers: páginas HTML amigables (solo se usan en casos de error
// o cuando se abre el endpoint directo en el navegador).
// ──────────────────────────────────────────────────────────────
function htmlPage(status: number, body: string) {
  return new NextResponse(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function shell(title: string, inner: string) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} · Furgocasa</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    background: #f6f7fb;
    color: #1f2937;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 32px;
    max-width: 560px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  }
  .logo { color: #063971; font-weight: 700; letter-spacing: .02em; font-size: 14px; text-transform: uppercase; }
  h1 { font-size: 22px; margin: 8px 0 12px; color: #063971; }
  p { line-height: 1.55; color: #374151; margin: 0 0 12px; }
  code { background: #f3f4f6; padding: 1px 6px; border-radius: 4px; font-size: 13px; color: #111827; }
  .actions { margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 10px; font-size: 14px; text-decoration: none; font-weight: 500; }
  .btn-primary { background: #063971; color: white; }
  .btn-primary:hover { background: #052a54; }
  .btn-ghost { border: 1px solid #d1d5db; color: #374151; background: white; }
  .btn-ghost:hover { background: #f9fafb; }
  .muted { font-size: 12px; color: #6b7280; margin-top: 20px; }
</style>
</head>
<body>
  <div class="card">
    <div class="logo">Furgocasa · Admin mailing</div>
    ${inner}
  </div>
</body>
</html>`;
}

function buildAuthErrorHtml(slug: string, status: number) {
  const isLoggedNotAdmin = status === 403;
  const title = isLoggedNotAdmin ? 'Sin permisos' : 'Necesitas iniciar sesión';
  const loginUrl = `/administrator/login?next=${encodeURIComponent(
    `/administrator/mails/${slug}`,
  )}`;
  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p>
      Esta URL es la <strong>vista previa interna</strong> de la campaña
      <code>${escapeHtml(slug)}</code>.  Se sirve solo a administradores con sesión activa, por eso
      al abrirla directamente no ves el correo.
    </p>
    <p>
      Para ver el mail renderizado como se mostrará en Outlook/Gmail, entra al panel de administración
      y abre la pestaña <strong>Vista previa</strong> de la campaña (ahí va embebida en un iframe con tu sesión).
    </p>
    <div class="actions">
      ${
        isLoggedNotAdmin
          ? `<a class="btn btn-ghost" href="/">Volver al inicio</a>`
          : `<a class="btn btn-primary" href="${escapeAttr(loginUrl)}">Iniciar sesión de admin</a>
             <a class="btn btn-ghost" href="/administrator/mails/${escapeAttr(slug)}">Ir al detalle si ya tienes sesión</a>`
      }
    </div>
    <p class="muted">
      ${
        isLoggedNotAdmin
          ? 'Tu usuario no está marcado como administrador activo. Pídele a un admin que te de permisos.'
          : 'Si acabas de iniciar sesión, recarga esta pestaña.'
      }
    </p>
  `;
  return shell(title, inner);
}

function buildNoHtmlHtml(slug: string, subject: string) {
  const inner = `
    <h1>Campaña aún sin HTML</h1>
    <p>
      La campaña <strong>${escapeHtml(subject)}</strong> (<code>${escapeHtml(slug)}</code>)
      todavía no tiene HTML generado, así que no hay nada que previsualizar.
    </p>
    <p>
      Entra al panel y, en la pestaña <strong>Contenido</strong>, pulsa <em>Generar con IA</em>
      con un briefing y hasta 3 campañas de referencia. Cuando termine, esta misma URL mostrará el email
      renderizado.
    </p>
    <div class="actions">
      <a class="btn btn-primary" href="/administrator/mails/${escapeAttr(slug)}">Ir al detalle de la campaña</a>
      <a class="btn btn-ghost" href="/administrator/mails">Listado de campañas</a>
    </div>
  `;
  return shell('Sin HTML', inner);
}

function buildNotFoundHtml(slug: string) {
  const inner = `
    <h1>Campaña no encontrada</h1>
    <p>
      No existe ninguna campaña con slug <code>${escapeHtml(slug)}</code>.
      Puede que la hayas borrado o que el enlace esté mal.
    </p>
    <div class="actions">
      <a class="btn btn-primary" href="/administrator/mails">Ver todas las campañas</a>
    </div>
  `;
  return shell('No encontrada', inner);
}

function buildGenericErrorHtml(title: string, detail: string) {
  const inner = `
    <h1>${escapeHtml(title)}</h1>
    <p>Se ha producido un error inesperado:</p>
    <p><code>${escapeHtml(detail)}</code></p>
    <div class="actions">
      <a class="btn btn-primary" href="/administrator/mails">Volver al panel</a>
    </div>
  `;
  return shell(title, inner);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
