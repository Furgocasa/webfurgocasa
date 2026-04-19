/**
 * Red de seguridad para el HTML generado por la IA editora de mailings.
 *
 * El SYSTEM_PROMPT prohíbe explícitamente gradientes, sombras, transform, flex,
 * grid, etc. porque Outlook Desktop (Word) no los soporta y el mail se rompe.
 * Sin embargo, los LLMs incumplen con cierta frecuencia. Esta función aplica
 * sustituciones CONSERVADORAS sobre el HTML para garantizar que, incluso si la
 * IA mete algo prohibido, el render en Outlook no quede destrozado:
 *
 *   · linear/radial/conic-gradient → background-color con el primer hex que
 *     aparece dentro del gradiente (fallback al azul corporativo #063971).
 *   · box-shadow, text-shadow, transform, filter, backdrop-filter,
 *     -webkit-transform, animation, transition → se eliminan (Outlook los
 *     ignora; en el preview web quedan limpios).
 *   · display:flex / display:grid / display:inline-flex → se quitan. Las
 *     tablas ya mandan la semántica real; "display:flex" sólo "adorna" en
 *     Chrome y en Outlook no hace nada, pero quita margen de confusión.
 *
 * NO toca:
 *   · rgba() / hsl() — cambiarlos a hex requiere parsear números reales,
 *     riesgo alto de romper colores. El prompt lo prohíbe, y si cuela, la
 *     mayoría de Outlooks hace fallback razonable.
 *   · border-radius — Outlook lo ignora y ya; no hace daño dejarlo.
 *   · Tipografías externas — irrelevante para Outlook.
 *
 * El objetivo es: "si al final cuela algo prohibido, que al menos no reviente
 * visualmente". No pretende ser un transpilador Outlook-safe completo.
 */

const GRADIENT_RE =
  /background(-image)?\s*:\s*(?:linear|radial|conic)-gradient\(([^)]*)\)\s*;?/gi;

const FORBIDDEN_DECLARATIONS_RE =
  /\b(?:-webkit-)?(?:box-shadow|text-shadow|transform|filter|backdrop-filter|animation|transition)\s*:\s*[^;"']+;?/gi;

const FORBIDDEN_DISPLAYS_RE =
  /\bdisplay\s*:\s*(?:flex|inline-flex|grid|inline-grid)\s*;?/gi;

export function sanitizeForOutlook(html: string): string {
  if (!html) return html;

  let out = html;

  // Gradientes → color sólido (primer hex encontrado dentro del gradient).
  out = out.replace(GRADIENT_RE, (_m, _p1, inside: string) => {
    const hexMatch = inside.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
    const color = hexMatch ? hexMatch[0] : '#063971';
    return `background-color:${color};`;
  });

  // Declaraciones CSS que rompen Outlook silenciosamente.
  out = out.replace(FORBIDDEN_DECLARATIONS_RE, '');

  // Layouts modernos.
  out = out.replace(FORBIDDEN_DISPLAYS_RE, '');

  return out;
}
