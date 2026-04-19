/**
 * Footer canónico de los mailings de Furgocasa.
 *
 * Este footer es la única fuente de verdad para todos los mails de marketing:
 * - La IA editora NO debe escribir su propio footer: solo debe colocar el
 *   marcador literal `<!--FURGOCASA_FOOTER-->` donde quiere que vaya.
 * - `injectCanonicalFooter()` sustituye ese marcador por el bloque oficial
 *   (logo blanco, iconos blancos IG/FB, dirección, contacto, baja, copyright).
 * - Si la IA no pone el marcador, lo inyectamos automáticamente antes de
 *   `</body>`. Si además escribió su propio footer, lo dejamos pero el oficial
 *   queda debajo — por eso es importante que el prompt le pida explícitamente
 *   que no lo escriba.
 *
 * Datos fijos (no se generan dinámicamente desde BD a propósito, para evitar
 * que un cambio mal hecho rompa TODOS los mails):
 *   · Dirección : Avenida Puente Tocinos, 4 · 30007 Casillas - Murcia
 *   · Tel       : 868 36 41 61
 *   · Email     : info@furgocasa.com
 *   · Web       : https://www.furgocasa.com
 *   · IG        : https://www.instagram.com/furgocasa
 *   · FB        : https://www.facebook.com/furgocasa
 *
 * Placeholders dinámicos que deja inyectados para el renderer por-contacto:
 *   · {{UNSUBSCRIBE_URL}}  · resuelto por renderTemplate() al enviar
 */

export const FOOTER_MARKER = '<!--FURGOCASA_FOOTER-->';

export function buildCanonicalFooter(): string {
  const year = new Date().getFullYear();
  return `<!-- FURGOCASA CANONICAL FOOTER (inyectado por el backend — no editar a mano) -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#063971;margin:0;">
  <tr>
    <td align="center" style="padding:34px 20px 28px 20px;">
      <a href="https://www.furgocasa.com" style="text-decoration:none;display:inline-block;">
        <img src="https://www.furgocasa.com/images/mailing/LOGO%20BLANCO.png" alt="Furgocasa" width="180" style="display:block;max-width:180px;height:auto;margin:0 auto 20px auto;border:0;outline:none;" />
      </a>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 20px auto;">
        <tr>
          <td style="padding:0 8px;">
            <a href="https://www.instagram.com/furgocasa" style="text-decoration:none;display:inline-block;">
              <img src="https://www.furgocasa.com/images/mailing/instagram-white.png" alt="Instagram" width="28" height="28" style="display:block;border:0;width:28px;height:28px;outline:none;" />
            </a>
          </td>
          <td style="padding:0 8px;">
            <a href="https://www.facebook.com/furgocasa" style="text-decoration:none;display:inline-block;">
              <img src="https://www.furgocasa.com/images/mailing/facebook-white.png" alt="Facebook" width="28" height="28" style="display:block;border:0;width:28px;height:28px;outline:none;" />
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 6px 0;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;line-height:1.5;">Furgocasa · Alquiler de campers y autocaravanas</p>
      <p style="margin:0 0 6px 0;color:#cbd5e1;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;">Avenida Puente Tocinos, 4 · 30007 Casillas - Murcia</p>
      <p style="margin:0 0 18px 0;color:#cbd5e1;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;">
        <a href="tel:+34868364161" style="color:#ffffff;text-decoration:none;">868 36 41 61</a>
        &nbsp;·&nbsp;
        <a href="mailto:info@furgocasa.com" style="color:#ffffff;text-decoration:none;">info@furgocasa.com</a>
        &nbsp;·&nbsp;
        <a href="https://www.furgocasa.com" style="color:#ffffff;text-decoration:none;">www.furgocasa.com</a>
      </p>
      <p style="margin:0 0 10px 0;color:#cbd5e1;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.55;max-width:440px;">
        Recibes este correo porque estás suscrito a Furgocasa o has sido cliente. Si prefieres no recibir más comunicaciones,
        <a href="{{UNSUBSCRIBE_URL}}" style="color:#ffffff;text-decoration:underline;">date de baja aquí</a>.
      </p>
      <p style="margin:0;color:#94a3b8;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;">© ${year} Furgocasa. Todos los derechos reservados.</p>
    </td>
  </tr>
</table>
<!-- /FURGOCASA CANONICAL FOOTER -->`;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Inyecta el footer canónico en el HTML devuelto por la IA.
 *
 * Estrategia, por orden de prioridad:
 *   1) Si el HTML contiene el marcador `<!--FURGOCASA_FOOTER-->`, sustituye
 *      TODO lo que hay desde el marcador hasta `</body>` (exclusive) por el
 *      footer canónico. Esto borra cualquier footer que la IA haya escrito
 *      después del marcador por error.
 *   2) Si no hay marcador pero existe `</body>`, inserta el footer justo antes.
 *   3) Si el HTML no trae `</body>` (muy raro), concatena el footer al final.
 *
 * El footer devuelto contiene `{{UNSUBSCRIBE_URL}}` como placeholder: lo
 * resolverá `renderTemplate()` por cada destinatario al enviar.
 */
export function injectCanonicalFooter(html: string): string {
  if (!html) return html;
  const footer = buildCanonicalFooter();

  if (html.includes(FOOTER_MARKER)) {
    const re = new RegExp(`${escapeRegex(FOOTER_MARKER)}[\\s\\S]*?(?=<\\/body>)`, 'i');
    if (re.test(html)) {
      return html.replace(re, `${footer}\n`);
    }
    return html.replace(FOOTER_MARKER, footer);
  }

  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${footer}\n</body>`);
  }

  return `${html}\n${footer}`;
}
