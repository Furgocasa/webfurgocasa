/**
 * Red de seguridad para el HTML generado por la IA editora de mailings.
 *
 * El SYSTEM_PROMPT prohíbe explícitamente gradientes, sombras, transform, flex,
 * grid, `background-image` decorativa, etc. porque Outlook Desktop (Word) no
 * los soporta y el mail se rompe. Sin embargo, los LLMs incumplen con cierta
 * frecuencia. Esta función aplica sustituciones CONSERVADORAS sobre el HTML
 * para que, incluso si la IA mete algo prohibido, el render en Outlook sea
 * correcto:
 *
 *   · linear/radial/conic-gradient → background-color con el primer hex que
 *     aparece dentro del gradiente (fallback al azul corporativo #063971).
 *   · background / background-image con url(...) → se eliminan (Outlook los
 *     ignora y quedan huecos blancos en el preview).
 *   · background: #hex;  (shorthand con solo color) → background-color:#hex;
 *   · box-shadow, text-shadow, transform, filter, backdrop-filter,
 *     animation, transition → se eliminan.
 *   · display:flex / display:grid / display:inline-flex → se quitan.
 *   · **AUTO-FIX BGCOLOR**: cualquier <td>, <tr>, <th>, <table> o <body> que
 *     tenga "background-color:#xxxxxx" en su style pero no el atributo
 *     HTML `bgcolor="..."`, se le añade automáticamente. Sin esto, Outlook
 *     Desktop Windows deja el fondo blanco aunque Chrome lo pinte.
 *
 * NO toca:
 *   · rgba() / hsl() — cambiarlos a hex requiere parsear números; el prompt
 *     lo prohíbe, y Outlook hace fallback razonable.
 *   · border-radius — Outlook lo ignora y ya; no hace daño dejarlo.
 *   · Tipografías externas — irrelevante para Outlook.
 *
 * El objetivo es: garantizar que, pase lo que pase, el mail se ve igual en
 * Outlook Desktop Windows que en Chrome.
 */

const GRADIENT_RE =
  /background(-image)?\s*:\s*(?:linear|radial|conic)-gradient\(([^)]*)\)\s*;?/gi;

// background / background-image con url(...) (cualquier posición en el shorthand)
const BG_URL_IMAGE_RE = /\bbackground-image\s*:\s*url\([^)]*\)\s*;?/gi;
const BG_SHORTHAND_WITH_URL_RE = /\bbackground\s*:\s*[^;"']*url\([^)]*\)[^;"']*;?/gi;

// background: #hex;  → background-color:#hex;
// Importante: el alternativo [0-9a-f]{6} va ANTES de [0-9a-f]{3} para que
// el regex capture el hex largo completo (si no, "ffffff" matchea como "fff").
const BG_SHORTHAND_SOLID_RE = /\bbackground\s*:\s*(#(?:[0-9a-f]{6}|[0-9a-f]{3}))\s*;?/gi;

const FORBIDDEN_DECLARATIONS_RE =
  /\b(?:-webkit-)?(?:box-shadow|text-shadow|transform|filter|backdrop-filter|animation|transition)\s*:\s*[^;"']+;?/gi;

const FORBIDDEN_DISPLAYS_RE =
  /\bdisplay\s*:\s*(?:flex|inline-flex|grid|inline-grid)\s*;?/gi;

// Tags a los que aplica el atributo HTML bgcolor (los que Outlook respeta).
const BGCOLOR_TAG_RE = /<(td|tr|th|table|body)\b([^>]*)>/gi;

// background-color dentro de un style="..." o style='...'
const STYLE_ATTR_RE = /\bstyle\s*=\s*(["'])([^"']*)\1/i;
// Idem: 6 dígitos antes que 3 para capturar el hex largo completo.
const BG_COLOR_IN_STYLE_RE = /background-color\s*:\s*(#(?:[0-9a-f]{6}|[0-9a-f]{3}))/i;
const HAS_BGCOLOR_ATTR_RE = /\bbgcolor\s*=/i;

export function sanitizeForOutlook(html: string): string {
  if (!html) return html;

  let out = html;

  // 1) Gradientes → color sólido (primer hex encontrado dentro del gradient).
  out = out.replace(GRADIENT_RE, (_m, _p1, inside: string) => {
    const hexMatch = inside.match(/#([0-9a-f]{6}|[0-9a-f]{3})\b/i);
    const color = hexMatch ? hexMatch[0] : '#063971';
    return `background-color:${color};`;
  });

  // 2) Fondos con imagen (Outlook los ignora; causan hueco blanco).
  out = out.replace(BG_URL_IMAGE_RE, '');
  out = out.replace(BG_SHORTHAND_WITH_URL_RE, '');

  // 3) Shorthand "background:#hex" → "background-color:#hex"
  out = out.replace(BG_SHORTHAND_SOLID_RE, 'background-color:$1;');

  // 4) Declaraciones CSS que rompen Outlook silenciosamente.
  out = out.replace(FORBIDDEN_DECLARATIONS_RE, '');

  // 5) Layouts modernos.
  out = out.replace(FORBIDDEN_DISPLAYS_RE, '');

  // 6) AUTO-PROMOTE: patrón muy común en HTML generado por IA:
  //      <td style="padding:0;">
  //        <div style="background-color:#063971;...">...hero con texto blanco...</div>
  //      </td>
  //    Outlook IGNORA el background-color en <div>. Resultado: fondo blanco
  //    y texto blanco → hueco vacío. Promovemos el color al <td> padre:
  //    añadimos bgcolor + merge de background-color en el style del <td>.
  //    Preservamos el <div> tal cual (en Chrome lo sigue pintando; en Outlook
  //    ahora el <td> ya garantiza el fondo).
  out = promoteDivBgToParentTd(out);

  // 7) AUTO-FIX bgcolor: si un <td>/<tr>/<th>/<table>/<body> tiene
  //    background-color en style pero no el atributo bgcolor, añadirlo.
  //    Es la clave para que Outlook Desktop pinte el fondo de hero, cajas
  //    destacadas, etc. (Chrome lo hace con CSS solo; Word no).
  out = out.replace(BGCOLOR_TAG_RE, (match, tag: string, attrs: string) => {
    if (HAS_BGCOLOR_ATTR_RE.test(attrs)) return match;
    const styleMatch = attrs.match(STYLE_ATTR_RE);
    if (!styleMatch) return match;
    const bgMatch = styleMatch[2].match(BG_COLOR_IN_STYLE_RE);
    if (!bgMatch) return match;
    const color = bgMatch[1];
    // Preservamos el resto de atributos. Insertamos bgcolor justo después del nombre del tag.
    return `<${tag} bgcolor="${color}"${attrs}>`;
  });

  return out;
}

/**
 * Promociona el background-color de un <div> hijo directo al <td> padre si
 * este último no tiene fondo propio. Así Outlook ya puede pintar el fondo
 * correctamente (Word no respeta background-color en <div>).
 *
 * Solo actúa cuando entre el <td> y el <div> solo hay whitespace, que es el
 * patrón estándar que la IA suele generar para heros/secciones destacadas.
 */
function promoteDivBgToParentTd(html: string): string {
  // Grupos:
  //   1: atributos del <td>
  //   2: whitespace entre <td> y <div>
  //   3: atributos del <div> antes del style
  //   4: comilla (simple o doble) del style del div
  //   5: contenido del style del div
  //   6: hex color del background-color dentro del style del div
  const TD_DIV_BG_RE =
    /<td\b([^>]*)>(\s*)<div\b([^>]*?)\sstyle\s*=\s*(["'])([^"']*?\bbackground-color\s*:\s*(#(?:[0-9a-f]{6}|[0-9a-f]{3}))[^"']*?)\4/gi;

  return html.replace(TD_DIV_BG_RE, (match, tdAttrs: string, ws: string, divAttrsBefore: string, q: string, divStyle: string, color: string) => {
    // Si el <td> ya tiene bgcolor o background-color, no tocar.
    if (HAS_BGCOLOR_ATTR_RE.test(tdAttrs)) return match;
    const tdStyleMatch = tdAttrs.match(STYLE_ATTR_RE);
    if (tdStyleMatch && BG_COLOR_IN_STYLE_RE.test(tdStyleMatch[2])) return match;

    let newTdAttrs: string;
    if (tdStyleMatch) {
      const styleRaw = tdStyleMatch[2].trim();
      const sep = styleRaw && !styleRaw.endsWith(';') ? ';' : '';
      const newStyle = `${styleRaw}${sep}background-color:${color};`;
      newTdAttrs = tdAttrs.replace(
        STYLE_ATTR_RE,
        `style=${tdStyleMatch[1]}${newStyle}${tdStyleMatch[1]}`,
      );
    } else {
      newTdAttrs = `${tdAttrs} style="background-color:${color};"`;
    }

    return `<td bgcolor="${color}"${newTdAttrs}>${ws}<div${divAttrsBefore} style=${q}${divStyle}${q}`;
  });
}
