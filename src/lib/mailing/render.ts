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

/**
 * Extrae un nombre de pila usable en el saludo de un mail a partir de un
 * nombre "completo" que puede venir con apellidos, partículas y espacios
 * extra. El objetivo es que "Hola {{NOMBRE}}" suene cercano y personal,
 * nunca burocrático.
 *
 * Regla: tomamos la PRIMERA palabra. Es la opción más segura en español:
 *   · "Julio César Amat de Pérez" → "Julio"  (evita leer como formal)
 *   · "María José López"          → "María"  (evita decir "María José López")
 *   · "Pilar"                     → "Pilar"
 *   · "Ismael Sosa"               → "Ismael"
 *   · "juan carlos pérez"         → "Juan"   (capitalizado)
 *
 * Si el token resultante es muy corto (≤ 1 char) o está vacío, devuelve el
 * fallback para no romper el saludo.
 */
export function firstName(
  fullName: string | null | undefined,
  fallback: string = 'hola',
): string {
  const raw = (fullName || '').trim();
  if (!raw) return fallback;

  const first = raw.split(/\s+/)[0] || '';
  if (first.length < 2) return fallback;

  // Capitalización suave: primera letra mayúscula, resto como está
  // (no toca "Mª" ni apóstrofes ni tildes).
  return first.charAt(0).toLocaleUpperCase('es-ES') + first.slice(1);
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
