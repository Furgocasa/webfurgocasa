/**
 * Render de plantillas de mailing y utilidades de formato.
 *
 * Placeholders soportados en el HTML de las campañas:
 *   {{NOMBRE}}           → nombre del contacto (fallback: "hola")
 *   {{CIUDAD}}           → ciudad del contacto (fallback: "")
 *   {{UNSUBSCRIBE_URL}}  → URL única de baja del contacto
 */

const MESES_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;

export function formatFechaLargaEs(d: Date): string {
  return `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

export type RenderVars = {
  NOMBRE?: string | null;
  CIUDAD?: string | null;
  UNSUBSCRIBE_URL?: string | null;
  [key: string]: string | null | undefined;
};

export function renderTemplate(html: string, vars: RenderVars): string {
  let out = html;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{{${k}}}`).join(v ?? '');
  }
  return out;
}

export function baseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.furgocasa.com';
  return raw.replace(/\/$/, '');
}

export function unsubscribeUrlFor(token: string | null | undefined): string {
  return token ? `${baseUrl()}/api/unsubscribe?t=${token}` : `${baseUrl()}/api/unsubscribe`;
}
