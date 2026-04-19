/**
 * Render de plantillas de mailing y utilidades de formato.
 *
 * Placeholders soportados en el HTML de las campañas:
 *   {{NOMBRE}}           → nombre de pila del contacto (fallback: "", se limpia el saludo)
 *   {{CIUDAD}}           → ciudad del contacto (fallback: "")
 *   {{UNSUBSCRIBE_URL}}  → URL única de baja del contacto
 *
 * Regla importante: si un contacto no tiene nombre, {{NOMBRE}} se sustituye
 * por cadena vacía (NO por "hola") y el post-render limpia artefactos como
 * "Hola ," → "Hola,". Así el saludo queda natural tanto si hay nombre ("Hola
 * Juan,") como si no ("Hola,") sin depender del prompt.
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
  return cleanupEmptyPlaceholderArtifacts(out);
}

/**
 * Limpia los artefactos que deja un placeholder vacío en el texto del saludo
 * o en menciones contextuales. Se aplica con regex deliberadamente conservadoras
 * para no tocar CSS, atributos HTML ni otras estructuras del documento.
 *
 * Casos cubiertos:
 *   "Hola ,"        → "Hola,"
 *   "Hola !"        → "Hola!"
 *   "Hola ."        → "Hola."
 *   "¡Hola ,"       → "¡Hola,"
 *   "en ,"          → ","   (p.ej. "nos vemos en {{CIUDAD}},")
 *   "desde ,"       → ","
 *   "en tu ciudad ," → "en tu ciudad,"  (no aplica — se queda igual)
 *
 * No colapsa dobles espacios genéricos del documento para evitar tocar
 * markup/estilos; sí colapsa dobles espacios que quedan INMEDIATAMENTE antes
 * de un signo de puntuación, que casi siempre son un placeholder vacío.
 */
function cleanupEmptyPlaceholderArtifacts(html: string): string {
  let out = html;

  // 1) "Hola <espacios> <puntuación>" → "Hola<puntuación>"
  //    Cubre tildes/mayúsculas: "Hola", "hola", "¡Hola".
  out = out.replace(/\bhola[ \t]+([,.!?;:])/gi, (m, p1) => {
    const start = m.slice(0, 4); // conserva el caso "Hola"/"hola"/"HOLA"
    return `${start}${p1}`;
  });

  // 2) Preposiciones sueltas + coma: "en ,", "desde ,", "hacia ,", "para ,".
  //    Solo si el espacio es >= 1 (así no tocamos casos ya correctos).
  out = out.replace(/\b(en|desde|hacia|para|hasta|a|por)[ \t]+([,.])/gi, '$2');

  // 3) Dobles espacios JUSTO antes de puntuación (" ," → ",").
  //    Muy localizado: no se aplica a espacios generales del documento.
  out = out.replace(/[ \t]{2,}([,.!?;:])/g, '$1');

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
  fallback: string = '',
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
