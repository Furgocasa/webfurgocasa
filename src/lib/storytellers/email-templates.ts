/**
 * Storytellers · HTML embebido para runtime (crons + scripts CLI)
 * =================================================================
 *
 * ⚠️  ARCHIVO GENERADO AUTOMÁTICAMENTE — NO EDITAR A MANO.
 *
 * Fuente de los HTML originales: `mailing/app/05–08*.html`.
 * Regenerar tras tocar cualquier HTML:
 *
 *     node scripts/sync-storyteller-emails-to-ts.mjs
 *
 * Por qué embebido en TS (y no `fs.readFile` desde `mailing/app/`):
 * Vercel no empaqueta archivos no-JS en las funciones serverless de los
 * crons. Si se leyera con `fs` desde `mailing/app/` el archivo no
 * existiría en `/var/task` y el dispatch quedaría `failed` con
 * `ENOENT`. Embebido como string, Webpack lo incluye con el código de la
 * función y siempre está disponible — mismo patrón que
 * `getReturnReminderTemplate` (email 04) en
 * `src/lib/email/templates.ts`.
 *
 * Última generación: 2026-05-15T18:39:32.038Z
 */

/* ----------------------------------------------------------------
 *  05 día de salida (noche)
 *  Origen: mailing/app/05-storytellers-dia-salida-noche.html
 *  Bytes:  20205
 * ---------------------------------------------------------------- */
export const STORYTELLER_05_HTML: string = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Furgocasa · Storytellers · Tu viaje ya ha empezado</title>
  <!--
    Referencia visual · Envío previsto: el mismo día del pickup (salida), 20:00–21:00 Europe/Madrid.
    Placeholders para automatización (cuando exista cron/plantilla en código):
      Nombre cliente: la cadena "Juan" (linea Hola...) -> primer nombre del cliente.
      Booking number: la cadena "FC-2026-001234" -> b.booking_number (para que lo
      copie y pegue directo en /es/storytellers/subir).
  -->
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Mobile / iPhones antiguos: imagen hero full-bleed */
    @media only screen and (max-width: 600px) {
      .hero-img {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
      }
      .container-600 {
        width: 100% !important;
        max-width: 100% !important;
      }
      .outer-pad {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <!-- Preheader oculto -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Comparte tu viaje con Furgocasa a cambio de descuento: 3 % al instante en tu primera subida, hasta 15 % en tu próxima reserva.
  </div>
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" class="outer-pad" style="padding: 20px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="container-600" style="background-color: #ffffff; max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="background-color: #ffffff; padding: 25px 20px; border-bottom: 4px solid #063971;">
              <a href="https://www.furgocasa.com" style="text-decoration: none;">
                <img src="https://www.furgocasa.com/images/mailing/LOGO%20AZUL.png" alt="Furgocasa" width="200" style="display: block; max-width: 200px; height: auto;" />
              </a>
            </td>
          </tr>

          <!-- Portada con texto + flecha quemados (sharp + SVG). NO es clicable a propósito:
               su única función es decir "hay descuento" y empujar el scroll a los CTAs del cuerpo. -->
          <tr>
            <td style="padding: 0;">
              <img src="https://www.furgocasa.com/images/mailing/storytellers/cover-cta-05.jpg" alt="¿Quieres ganar descuento y regalos? Programa Storytellers de Furgocasa: comparte tu viaje a cambio de descuentos." width="600" class="hero-img" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>

          <!-- Cabecera de refuerzo -->
          <tr>
            <td style="padding: 26px 24px 6px 24px;">
              <h1 style="margin: 0; color: #111827; font-size: 26px; line-height: 1.25; font-weight: bold;">
                Comparte tu viaje a cambio de descuentos.
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #ea580c; font-weight: bold; line-height: 1.35;">
                Empieza con un 3 % al instante. Y sigue subiendo: hasta un 15 % de descuento, más regalos.
              </p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 14px 24px 6px 24px;">
              <p style="margin: 0 0 10px 0; font-size: 17px; color: #374151; line-height: 1.6;">
                Hola <strong>Juan</strong>,
              </p>
              <p style="margin: 0; font-size: 17px; color: #374151; line-height: 1.6;">
                Hoy empieza tu viaje con Furgocasa. Y como sabemos que vas a hacer <strong>fotos y vídeos chulos</strong>,
                te proponemos un trato muy sencillo: <strong>súbenoslos al programa Storytellers</strong> y nosotros
                te invitamos al <strong>siguiente</strong>. Tú nos das tu mejor material, nosotros te damos
                <strong>descuento</strong> (y algún <strong>regalo</strong>) para que vuelvas a viajar antes de lo previsto.
                Sin crear cuenta, sin contraseñas, sin compromisos.
              </p>
            </td>
          </tr>

          <!-- Banner narrativa: arrancar el viaje -->
          <tr>
            <td style="padding: 18px 0 4px 0;">
              <img src="https://www.furgocasa.com/images/mailing/storytellers/banner-05-salida.jpg" alt="Pareja cargando los últimos bártulos en la camper al amanecer en la costa mediterránea" width="600" class="hero-img" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>

          <!-- Bloque destacado: qué te llevas -->
          <tr>
            <td style="padding: 18px 24px 6px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff7ed; border: 1px solid #fed7aa;">
                <tr>
                  <td style="padding: 18px 18px 14px 18px;">
                    <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #9a3412;">
                      Esto es lo que te llevas tú
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 4px 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                          &bull; <strong>3 % de descuento al instante</strong> con tu primera subida &mdash; te lo regalamos solo por arrancar.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                          &bull; Hasta un <strong>15 % de descuento</strong> según vas sumando puntos (5 % &rarr; 8 % &rarr; 10 % &rarr; 12 % &rarr; 15 %).
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                          &bull; Y cuando llegas al techo, <strong>regalos</strong>: taza, camiseta y sudadera de edición Storytellers.
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                      Cupones válidos 18 meses, en baja y media temporada y reservas de 4 días o más.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA secundario inline: para el lector que ya está convencido por
               las promesas y no necesita leer todos los pasos. Estilo "outline"
               (borde naranja, fondo blanco) para diferenciarlo del CTA principal
               final, que va en naranja sólido. -->
          <tr>
            <td align="center" style="padding: 16px 24px 4px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ffffff; border: 2px solid #ea580c; padding: 12px 26px;">
                    <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #ea580c; text-decoration: none; font-weight: bold; font-size: 16px;">Empezar a sumar ahora &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cómo se hace en 3 pasos -->
          <tr>
            <td style="padding: 28px 24px 8px 24px;">
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">
                Cómo se hace, en 3 pasos
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 24px 0 24px;">
              <!-- Paso 1 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 10px;">
                <tr>
                  <td width="40" valign="top" style="padding: 0 12px 0 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="32" height="32" align="center" style="background-color: #063971; color: #ffffff; font-size: 16px; font-weight: bold;">1</td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" style="font-size: 15px; color: #374151; line-height: 1.55;">
                    <strong style="color: #111827;">Entra al portal Storytellers</strong><br/>
                    <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #063971; text-decoration: underline;">www.furgocasa.com/es/storytellers/subir</a>
                  </td>
                </tr>
              </table>
              <!-- Paso 2 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 10px;">
                <tr>
                  <td width="40" valign="top" style="padding: 0 12px 0 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="32" height="32" align="center" style="background-color: #063971; color: #ffffff; font-size: 16px; font-weight: bold;">2</td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" style="font-size: 15px; color: #374151; line-height: 1.55;">
                    <strong style="color: #111827;">Identifícate</strong> con tu <strong>número de reserva</strong> &mdash;
                    <span style="font-family: Consolas, 'Courier New', monospace; background-color: #f3f4f6; padding: 4px 10px; color: #063971; font-weight: bold; font-size: 16px; border: 1px solid #e5e7eb;">FC-2026-001234</span>
                    &mdash; y el <strong>email asociado</strong> a esa reserva. Cópialo de aquí mismo, sin login ni contraseñas.
                  </td>
                </tr>
              </table>
              <!-- Paso 3 -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 6px;">
                <tr>
                  <td width="40" valign="top" style="padding: 0 12px 0 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="32" height="32" align="center" style="background-color: #063971; color: #ffffff; font-size: 16px; font-weight: bold;">3</td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" style="font-size: 15px; color: #374151; line-height: 1.55;">
                    <strong style="color: #111827;">Sube fotos o vídeos en lotes</strong>.
                    Lote mínimo: <strong>3 fotos o 1 vídeo</strong>. Hasta 100 fotos y 20 vídeos por reserva.
                    No hace falta esperar al final del viaje: súbelos según los vas haciendo.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cómo se ganan los puntos -->
          <tr>
            <td style="padding: 28px 24px 8px 24px;">
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">
                Cómo se ganan los puntos
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb;">
                <tr>
                  <td style="padding: 9px 12px; font-size: 15px; color: #374151; border-bottom: 1px solid #e5e7eb;">Subir 1 foto</td>
                  <td style="padding: 9px 12px; font-size: 15px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">+2 ptos</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; font-size: 15px; color: #374151; border-bottom: 1px solid #e5e7eb;">Subir 1 vídeo (≥10 s)</td>
                  <td style="padding: 9px 12px; font-size: 15px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">+5 ptos</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; font-size: 15px; color: #374151; border-bottom: 1px solid #e5e7eb;">Foto seleccionada para nuestro archivo</td>
                  <td style="padding: 9px 12px; font-size: 15px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">+20 ptos</td>
                </tr>
                <tr>
                  <td style="padding: 9px 12px; font-size: 15px; color: #374151;">Vídeo seleccionado para nuestro archivo</td>
                  <td style="padding: 9px 12px; font-size: 15px; color: #ea580c; font-weight: bold; text-align: right;">+60 ptos</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Callout: la selección multiplica los puntos -->
          <tr>
            <td style="padding: 16px 24px 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff7ed; border: 2px solid #fed7aa;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #9a3412;">
                      Y si son buenas&hellip; mucho mejor.
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                      Subir ya suma. Pero <strong>lo que dispara los puntos es que tu material entre en nuestro archivo</strong>:
                      una foto seleccionada vale <strong style="color: #ea580c;">×10</strong> y un vídeo seleccionado <strong style="color: #ea580c;">×12</strong>.
                      <strong>Tómate tu tiempo &mdash; el esfuerzo se recompensa.</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Mosaico ejemplos -->
          <tr>
            <td style="padding: 30px 24px 6px 24px;">
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">
                El tipo de momentos que nos encantan
              </p>
              <p style="margin: 10px 0 0 0; font-size: 15px; color: #6b7280; line-height: 1.55;">
                No necesitas ser fotógrafo. Buscamos lo de verdad: <strong>luz natural, gente real, rincones que cuentan algo</strong>. Tu móvil basta.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 20px 6px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-sunset-couple.jpg" alt="Pareja al atardecer junto a su camper" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                  <td width="34%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-interior-cozy.jpg" alt="Interior acogedor de una camper con café y luz natural" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-family-fun.jpg" alt="Familia jugando junto a su camper en un camino forestal" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 28px 24px 8px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ea580c; padding: 14px 32px;">
                    <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 17px;">Subir fotos o vídeos ahora</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 4px 24px 24px 24px;">
              <a href="https://www.furgocasa.com/es/storytellers" style="font-size: 15px; color: #063971; text-decoration: underline;">Cómo funciona Storytellers (programa completo)</a>
            </td>
          </tr>

          <!-- Despedida -->
          <tr>
            <td style="padding: 4px 24px 30px 24px;">
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.55;">
                Disfruta del viaje. Y cuando tengas la primera foto buena, ya sabes dónde subirla.<br/>
                <strong>El equipo de Furgocasa</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #374151;">Furgocasa - Alquiler de Campers</p>
              <p style="margin: 0 0 5px 0; font-size: 15px; color: #6b7280;">
                Tel: <a href="tel:+34868364161" style="color: #063971; text-decoration: none;">+34 868 364 161</a>
              </p>
              <p style="margin: 0 0 5px 0; font-size: 15px; color: #6b7280;">
                Email: <a href="mailto:reservas@furgocasa.com" style="color: #063971; text-decoration: none;">reservas@furgocasa.com</a>
              </p>
              <p style="margin: 0 0 15px 0; font-size: 15px; color: #6b7280;">
                Web: <a href="https://www.furgocasa.com" style="color: #063971; text-decoration: none;">www.furgocasa.com</a>
              </p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                Este correo ha sido enviado automáticamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ----------------------------------------------------------------
 *  06 mitad de viaje
 *  Origen: mailing/app/06-storytellers-mitad-viaje.html
 *  Bytes:  17532
 * ---------------------------------------------------------------- */
export const STORYTELLER_06_HTML: string = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Furgocasa · Storytellers · Mitad de viaje</title>
  <!--
    Referencia visual · Envío previsto: día intermedio del alquiler (~punto medio entre pickup y dropoff), mañana Europe/Madrid.
    Placeholders: {{NOMBRE_CLIENTE}}, {{LINK_PROGRAMA}}, {{LINK_SUBIR}}
    Foco del correo: recordatorio de los DESCUENTOS desbloqueables y empuje a empezar a subir ya.
    No incluimos número de reserva ni fechas: el cliente las conoce y se identifica con ellas en el portal.
  -->
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Mobile / iPhones antiguos: imagen hero full-bleed */
    @media only screen and (max-width: 600px) {
      .hero-img {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
      }
      .container-600 {
        width: 100% !important;
        max-width: 100% !important;
      }
      .outer-pad {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Comparte tu viaje a cambio de descuento: súbenos ya tus mejores fotos y vídeos y empieza a desbloquear cupones (3 % al instante, hasta 15 %).
  </div>
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" class="outer-pad" style="padding: 20px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="container-600" style="background-color: #ffffff; max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="background-color: #ffffff; padding: 25px 20px; border-bottom: 4px solid #063971;">
              <a href="https://www.furgocasa.com" style="text-decoration: none;">
                <img src="https://www.furgocasa.com/images/mailing/LOGO%20AZUL.png" alt="Furgocasa" width="200" style="display: block; max-width: 200px; height: auto;" />
              </a>
            </td>
          </tr>

          <!-- Portada con texto + flecha quemados. NO es clicable a propósito. -->
          <tr>
            <td style="padding: 0;">
              <img src="https://www.furgocasa.com/images/mailing/storytellers/cover-cta-06.jpg" alt="Tu viaje vale descuento y regalos. Programa Storytellers de Furgocasa: súbelo ya, hasta 15 %." width="600" class="hero-img" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>

          <!-- Cabecera -->
          <tr>
            <td style="padding: 28px 24px 6px 24px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #ea580c; text-transform: uppercase; letter-spacing: 1px;">
                Programa Storytellers · Comparte tu viaje, llévate descuento
              </p>
              <h1 style="margin: 0; color: #111827; font-size: 28px; line-height: 1.2; font-weight: bold;">
                Cada foto o vídeo que nos pases es descuento en tu bolsillo.
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #ea580c; font-weight: bold; line-height: 1.35;">
                Empieza con un 3 % al instante. Y sigue: hasta un 15 % de descuento + regalos en tu próxima reserva.
              </p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 14px 24px 6px 24px;">
              <p style="margin: 0 0 10px 0; font-size: 17px; color: #374151; line-height: 1.6;">
                Hola <strong>Juan</strong>,
              </p>
              <p style="margin: 0; font-size: 17px; color: #374151; line-height: 1.6;">
                ¿Qué tal va la ruta? A estas alturas seguro que ya tienes <strong>fotos y vídeos para enseñar al volver</strong>.
                Mándanoslas también a nosotros por el programa <strong>Storytellers</strong> y, con la primera subida,
                ya te llevas un <strong>3 % de descuento</strong> para tu próxima escapada con Furgocasa.
                <strong>Cuanto antes subas, antes empieza a sumar</strong> &mdash; y antes tienes cupón listo en tu cuenta.
              </p>
            </td>
          </tr>

          <!-- Banner narrativa: vida en ruta, compañeros de viaje -->
          <tr>
            <td style="padding: 18px 0 4px 0;">
              <img src="https://www.furgocasa.com/images/mailing/storytellers/banner-06-teckel.jpg" alt="Perro asomado por la ventana de una camper en marcha por una carretera de sierra" width="600" class="hero-img" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>

          <!-- Tabla de descuentos -->
          <tr>
            <td style="padding: 24px 24px 6px 24px;">
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">
                Descuentos que puedes desbloquear
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #063971; color: #ffffff; padding: 10px 12px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Cuándo</td>
                  <td style="background-color: #063971; color: #ffffff; padding: 10px 12px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Cupón</td>
                </tr>
                <tr>
                  <td style="background-color: #fff7ed; padding: 11px 12px; font-size: 15px; color: #1f2937; border-bottom: 1px solid #fed7aa;">
                    <strong>Tu primera subida válida</strong>
                    <br/><span style="color: #6b7280; font-size: 13px;">Cupón de bienvenida &middot; una sola vez</span>
                  </td>
                  <td style="background-color: #fff7ed; padding: 11px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #fed7aa;">3 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">Al alcanzar 40 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">5 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">Al alcanzar 100 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">8 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">Al alcanzar 200 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">10 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">Al alcanzar 400 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">12 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; border-bottom: 2px solid #063971;">Al alcanzar 800 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #c2410c; font-weight: bold; text-align: right; border-bottom: 2px solid #063971;">15 %&nbsp;&middot;&nbsp;techo</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 24px 0 24px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.55;">
                Subir suma <strong>+2 ptos por foto</strong> y <strong>+5 por vídeo</strong>.
                Pero si tu material entra en nuestro archivo, multiplica:
                <strong style="color: #ea580c;">+20 por foto seleccionada (&times;10)</strong> y
                <strong style="color: #ea580c;">+60 por vídeo seleccionado (&times;12)</strong>.
              </p>
            </td>
          </tr>
          <!-- Callout: y si son buenas, mucho mejor -->
          <tr>
            <td style="padding: 16px 24px 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff7ed; border: 2px solid #fed7aa;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #9a3412;">
                      Y si son buenas&hellip; mucho mejor.
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                      No buscamos cantidad, buscamos verdad de viaje. <strong>Tómate tu tiempo</strong> con esa foto del atardecer
                      o ese vídeo del desayuno en ruta: si lo elegimos para nuestro archivo, los puntos llegan multiplicados &mdash;
                      y antes verás aparecer cupones más grandes.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Mosaico ejemplos -->
          <tr>
            <td style="padding: 28px 24px 6px 24px;">
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">
                Inspiración del tipo de contenido
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 20px 6px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-breakfast-table.jpg" alt="Desayuno en la mesa plegable de una camper con café y un mapa abierto" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                  <td width="34%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-pet-travel.jpg" alt="Perro asomado a la puerta lateral de una camper en plena naturaleza" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-sunset-couple.jpg" alt="Pareja junto a su camper al atardecer haciéndose una foto" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA secundario tras los ejemplos: el lector se reconoce en
               el tipo de fotos. Estilo "outline" (borde naranja, fondo
               blanco) para diferenciarlo del CTA principal final. -->
          <tr>
            <td align="center" style="padding: 16px 24px 4px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ffffff; border: 2px solid #ea580c; padding: 12px 26px;">
                    <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #ea580c; text-decoration: none; font-weight: bold; font-size: 16px;">Sí, tengo de estas. Subirlas &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cómo subir (recordatorio rápido) -->
          <tr>
            <td style="padding: 24px 24px 6px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f9ff; border-left: 4px solid #063971;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #111827; font-size: 16px;">Subir es cosa de un minuto</p>
                    <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.55;">
                      Entra en <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #063971; text-decoration: underline;">www.furgocasa.com/es/storytellers/subir</a>, escribe tu <strong>número de reserva</strong> &mdash;
                      <span style="font-family: Consolas, 'Courier New', monospace; background-color: #ffffff; padding: 4px 10px; color: #063971; font-weight: bold; font-size: 16px; border: 1px solid #cbd5e1;">FC-2026-001234</span>
                      &mdash; y el <strong>email con el que reservaste</strong>, y arrastra los archivos. Mínimo 3 fotos o 1 vídeo por subida. Y tranquilidad: puedes hacer varias durante el viaje.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 26px 24px 8px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ea580c; padding: 14px 32px;">
                    <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 17px;">Subir fotos o vídeos ahora</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 4px 24px 26px 24px;">
              <a href="https://www.furgocasa.com/es/storytellers" style="font-size: 15px; color: #063971; text-decoration: underline;">Ver todas las reglas del programa</a>
            </td>
          </tr>

          <!-- Despedida -->
          <tr>
            <td style="padding: 4px 24px 30px 24px;">
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.55;">
                Que sigan saliendo buenas fotos. Nos vemos a la vuelta &mdash; con descuento ya en tu cuenta, esperemos.<br/>
                <strong>El equipo de Furgocasa</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #374151;">Furgocasa - Alquiler de Campers</p>
              <p style="margin: 0 0 5px 0; font-size: 15px; color: #6b7280;">
                Tel: <a href="tel:+34868364161" style="color: #063971; text-decoration: none;">+34 868 364 161</a>
              </p>
              <p style="margin: 0 0 5px 0; font-size: 15px; color: #6b7280;">
                Email: <a href="mailto:reservas@furgocasa.com" style="color: #063971; text-decoration: none;">reservas@furgocasa.com</a>
              </p>
              <p style="margin: 0 0 15px 0; font-size: 15px; color: #6b7280;">
                Web: <a href="https://www.furgocasa.com" style="color: #063971; text-decoration: none;">www.furgocasa.com</a>
              </p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                Este correo ha sido enviado automáticamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ----------------------------------------------------------------
 *  07 día después de la vuelta
 *  Origen: mailing/app/07-storytellers-dia-despues-vuelta.html
 *  Bytes:  19257
 * ---------------------------------------------------------------- */
export const STORYTELLER_07_HTML: string = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Furgocasa · Storytellers · Tu próximo descuento te espera</title>
  <!--
    Referencia visual · Envío previsto: 1 día natural después del dropoff, mañana Europe/Madrid.
    Placeholders: {{NOMBRE_CLIENTE}}, {{LINK_PROGRAMA}}, {{LINK_SUBIR}}, {{LINK_MIS_PUNTOS}}
    Foco del correo: recordatorio del PROGRAMA y del DESCUENTO. Mensaje de cierre claro:
    "no pierdas la oportunidad de viajar de nuevo con descuento". Se respeta la
    ventana de 90 días post-devolución para subir contenido.
  -->
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Mobile / iPhones antiguos: imagen hero full-bleed */
    @media only screen and (max-width: 600px) {
      .hero-img {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
      }
      .container-600 {
        width: 100% !important;
        max-width: 100% !important;
      }
      .outer-pad {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    No dejes el descuento en el móvil: tienes 90 días para subir tus fotos y vídeos a Storytellers y llevarte hasta un 15 % en tu próxima reserva con Furgocasa.
  </div>
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" class="outer-pad" style="padding: 20px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="container-600" style="background-color: #ffffff; max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="background-color: #ffffff; padding: 25px 20px; border-bottom: 4px solid #063971;">
              <a href="https://www.furgocasa.com" style="text-decoration: none;">
                <img src="https://www.furgocasa.com/images/mailing/LOGO%20AZUL.png" alt="Furgocasa" width="200" style="display: block; max-width: 200px; height: auto;" />
              </a>
            </td>
          </tr>

          <!-- Portada con texto + flecha quemados. NO es clicable a propósito. -->
          <tr>
            <td style="padding: 0;">
              <img src="https://www.furgocasa.com/images/mailing/storytellers/cover-cta-07.jpg" alt="No dejes el descuento en el móvil. Programa Storytellers de Furgocasa: 90 días para subir, descuentos y regalos." width="600" class="hero-img" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>

          <!-- Cabecera -->
          <tr>
            <td style="padding: 28px 24px 6px 24px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #ea580c; text-transform: uppercase; letter-spacing: 1px;">
                Programa Storytellers · Comparte tu viaje, llévate descuento
              </p>
              <h1 style="margin: 0; color: #111827; font-size: 28px; line-height: 1.2; font-weight: bold;">
                No dejes el descuento en el móvil.
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #ea580c; font-weight: bold; line-height: 1.35;">
                Súbenos las fotos y vídeos del viaje y empieza a ahorrar en la próxima escapada &mdash; hasta un 15 %, más regalos.
              </p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 14px 24px 6px 24px;">
              <p style="margin: 0 0 10px 0; font-size: 17px; color: #374151; line-height: 1.6;">
                Hola <strong>Juan</strong>,
              </p>
              <p style="margin: 0; font-size: 17px; color: #374151; line-height: 1.6;">
                Esperamos que la ruta con la camper haya ido bien. Antes de que esas <strong>fotos y vídeos chulos</strong>
                se queden olvidados en la galería del móvil para siempre, te recordamos el trato del programa
                <strong>Storytellers</strong>: tú nos los pasas, <strong>nosotros te devolvemos descuento</strong> (y algún
                <strong>regalo</strong>) para tu siguiente escapada con Furgocasa. Y no hay prisa: tienes <strong>90 días</strong>
                desde la devolución para subirlos.
              </p>
            </td>
          </tr>

          <!-- Mensaje principal -->
          <tr>
            <td style="padding: 18px 24px 6px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff7ed; border: 1px solid #fed7aa;">
                <tr>
                  <td style="padding: 18px 18px 14px 18px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #9a3412;">
                      No dejes pasar la oportunidad de volver a viajar con descuento
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                      Con solo <strong>3 fotos</strong> o <strong>1 vídeo</strong> ya te llevas un
                      <strong>cupón del 3 %</strong> al instante, válido durante 18 meses.
                      Y si nos enamoramos de algo de lo que subes y lo elegimos para nuestro archivo, los puntos engordan rápido:
                      <strong>5 % &rarr; 8 % &rarr; 10 % &rarr; 12 % &rarr; 15 %</strong>. Y por encima del 15 %, <strong>regalos</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner narrativa: recuerdos en el bolsillo (manos + móvil + galería) -->
          <tr>
            <td style="padding: 18px 0 4px 0;">
              <img src="https://www.furgocasa.com/images/mailing/storytellers/banner-07-recuerdos.jpg" alt="Manos sosteniendo un móvil que muestra la galería de fotos del viaje en camper" width="600" class="hero-img" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>

          <!-- Tabla de descuentos -->
          <tr>
            <td style="padding: 28px 24px 6px 24px;">
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">
                Descuentos del programa
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #063971; color: #ffffff; padding: 10px 12px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Cuándo</td>
                  <td style="background-color: #063971; color: #ffffff; padding: 10px 12px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Cupón</td>
                </tr>
                <tr>
                  <td style="background-color: #fff7ed; padding: 11px 12px; font-size: 15px; color: #1f2937; border-bottom: 1px solid #fed7aa;">
                    <strong>Tu primera subida válida</strong>
                    <br/><span style="color: #6b7280; font-size: 13px;">Cupón de bienvenida &middot; una sola vez</span>
                  </td>
                  <td style="background-color: #fff7ed; padding: 11px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #fed7aa;">3 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">Al alcanzar 40 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">5 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">Al alcanzar 100 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">8 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">Al alcanzar 200 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">10 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">Al alcanzar 400 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">12 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; border-bottom: 2px solid #063971;">Al alcanzar 800 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #c2410c; font-weight: bold; text-align: right; border-bottom: 2px solid #063971;">15 %&nbsp;&middot;&nbsp;techo</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 24px 0 24px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.55;">
                Cupones válidos en <strong>baja y media temporada</strong>, mínimo 4 días de reserva, no acumulables con otras promos.
              </p>
            </td>
          </tr>

          <!-- Callout: y si son buenas, mucho mejor (selección multiplica) -->
          <tr>
            <td style="padding: 22px 24px 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff7ed; border: 2px solid #fed7aa;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #9a3412;">
                      Y si son buenas&hellip; mucho mejor.
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                      Subir cualquier foto ya suma (<strong>+2 ptos</strong>; <strong>+5</strong> por vídeo). Pero
                      <strong>lo que de verdad multiplica los puntos es que tu material entre en nuestro archivo</strong>:
                      <strong style="color: #ea580c;">+20 por foto seleccionada (&times;10)</strong> y
                      <strong style="color: #ea580c;">+60 por vídeo seleccionado (&times;12)</strong>.
                      No tengas prisa por subir cualquier cosa: revisa con calma, elige las que mejor cuentan tu viaje y mándanoslas.
                      <strong>El esfuerzo se recompensa.</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Mosaico ejemplos -->
          <tr>
            <td style="padding: 28px 24px 6px 24px;">
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">
                Tipos de momento que solemos seleccionar
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 20px 6px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-sunset-couple.jpg" alt="Pareja al atardecer junto a su camper" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                  <td width="34%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-pet-travel.jpg" alt="Perro asomado a la puerta lateral de la camper" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-interior-cozy.jpg" alt="Interior acogedor de camper con café y luz natural" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA secundario tras los ejemplos: el lector se reconoce en
               el tipo de fotos. Estilo "outline" (borde naranja, fondo
               blanco) para diferenciarlo del CTA principal final. -->
          <tr>
            <td align="center" style="padding: 16px 24px 4px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ffffff; border: 2px solid #ea580c; padding: 12px 26px;">
                    <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #ea580c; text-decoration: none; font-weight: bold; font-size: 16px;">Sí, tengo similares. Subirlas &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cómo subir -->
          <tr>
            <td style="padding: 24px 24px 6px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f9ff; border-left: 4px solid #063971;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #111827; font-size: 16px;">Subir es cosa de menos de 2 minutos</p>
                    <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.55;">
                      Entra en <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #063971; text-decoration: underline;">www.furgocasa.com/es/storytellers/subir</a>, escribe tu <strong>número de reserva</strong> &mdash;
                      <span style="font-family: Consolas, 'Courier New', monospace; background-color: #ffffff; padding: 4px 10px; color: #063971; font-weight: bold; font-size: 16px; border: 1px solid #cbd5e1;">FC-2026-001234</span>
                      &mdash; y el <strong>email con el que reservaste</strong>, y arrastra los archivos. Mínimo 3 fotos o 1 vídeo. <strong>Sin login, sin contraseñas, sin formularios largos.</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 28px 24px 8px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ea580c; padding: 14px 32px;">
                    <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 17px;">Subir mis fotos o vídeos</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 4px 24px 4px 24px;">
              <a href="https://www.furgocasa.com/es/storytellers/mis-puntos" style="font-size: 15px; color: #063971; text-decoration: underline;">Ver mis puntos y cupones</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 24px 26px 24px;">
              <a href="https://www.furgocasa.com/es/storytellers" style="font-size: 15px; color: #063971; text-decoration: underline;">Cómo funciona Storytellers</a>
            </td>
          </tr>

          <!-- Despedida -->
          <tr>
            <td style="padding: 4px 24px 30px 24px;">
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.55;">
                Gracias por viajar con Furgocasa. Nos encantará verte de nuevo &mdash; y, si haces los deberes con Storytellers, con descuento puesto.<br/>
                <strong>El equipo de Furgocasa</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #374151;">Furgocasa - Alquiler de Campers</p>
              <p style="margin: 0 0 5px 0; font-size: 15px; color: #6b7280;">
                Tel: <a href="tel:+34868364161" style="color: #063971; text-decoration: none;">+34 868 364 161</a>
              </p>
              <p style="margin: 0 0 5px 0; font-size: 15px; color: #6b7280;">
                Email: <a href="mailto:reservas@furgocasa.com" style="color: #063971; text-decoration: none;">reservas@furgocasa.com</a>
              </p>
              <p style="margin: 0 0 15px 0; font-size: 15px; color: #6b7280;">
                Web: <a href="https://www.furgocasa.com" style="color: #063971; text-decoration: none;">www.furgocasa.com</a>
              </p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                Este correo ha sido enviado automáticamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/* ----------------------------------------------------------------
 *  08 rescate post-lanzamiento
 *  Origen: mailing/app/08-storytellers-rescate-recien-lanzado.html
 *  Bytes:  18694
 * ---------------------------------------------------------------- */
export const STORYTELLER_08_HTML: string = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Furgocasa · Acabamos de lanzar Storytellers · Aún estás a tiempo</title>
  <!--
    Mail puntual de RESCATE por LANZAMIENTO del programa Storytellers.
    Va dirigido SOLO a reservas que ya finalizaron pero entran en la
    ventana viva de 90 días post-devolución y a quienes el backfill
    histórico marcó como "ya enviados" para evitar mails antiguos
    descontextualizados.

    Envío UNA SOLA VEZ (no es ciclo, no hay versión recurrente).
    Placeholders: <strong>Juan</strong> y FC-2026-001234 (mismos del 07
    para reutilizar el helper renderCycleEmailHtml).
  -->
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    @media only screen and (max-width: 600px) {
      .hero-img {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
      }
      .container-600 {
        width: 100% !important;
        max-width: 100% !important;
      }
      .outer-pad {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    Acabamos de lanzar Storytellers. Aunque ya devolviste la camper, aún tienes 90 días para subir tus fotos y vídeos y llevarte hasta un 15&nbsp;% en tu próxima reserva.
  </div>
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" class="outer-pad" style="padding: 20px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="container-600" style="background-color: #ffffff; max-width: 600px; width: 100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="background-color: #ffffff; padding: 25px 20px; border-bottom: 4px solid #063971;">
              <a href="https://www.furgocasa.com" style="text-decoration: none;">
                <img src="https://www.furgocasa.com/images/mailing/LOGO%20AZUL.png" alt="Furgocasa" width="200" style="display: block; max-width: 200px; height: auto;" />
              </a>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding: 0;">
              <img src="https://www.furgocasa.com/images/mailing/storytellers/cover-cta-07.jpg" alt="Acabamos de lanzar Storytellers. Aún estás a tiempo de aprovecharlo." width="600" class="hero-img" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>

          <!-- Etiqueta superior + h1 -->
          <tr>
            <td style="padding: 28px 24px 6px 24px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #ea580c; text-transform: uppercase; letter-spacing: 1px;">
                Novedad · Programa Storytellers
              </p>
              <h1 style="margin: 0; color: #111827; font-size: 28px; line-height: 1.2; font-weight: bold;">
                Acabamos de lanzar Storytellers.<br/>Y aún estás a tiempo.
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; color: #ea580c; font-weight: bold; line-height: 1.35;">
                Tu viaje terminó hace nada. Si nos pasas las fotos y vídeos del bolsillo, te llevas descuento (hasta el 15&nbsp;%) en la próxima escapada con Furgocasa.
              </p>
            </td>
          </tr>

          <!-- Intro personalizada -->
          <tr>
            <td style="padding: 14px 24px 6px 24px;">
              <p style="margin: 0 0 10px 0; font-size: 17px; color: #374151; line-height: 1.6;">
                Hola <strong>Juan</strong>,
              </p>
              <p style="margin: 0 0 10px 0; font-size: 17px; color: #374151; line-height: 1.6;">
                Te escribimos por una razón muy concreta: <strong>acabamos de poner en marcha</strong> el programa
                <strong>Storytellers</strong>, y queremos que te enteres tú, que devolviste la camper hace muy poco.
              </p>
              <p style="margin: 0; font-size: 17px; color: #374151; line-height: 1.6;">
                Cuando reservaste, este programa todavía no existía, así que no te lo contamos en su día.
                Pero como el material que cuenta de verdad un viaje sigue intacto en tu galería, abrimos
                el programa también para ti: tienes <strong>hasta 90 días desde la devolución</strong> para
                subir tus fotos y vídeos y entrar en la mecánica de descuentos. Sin login, sin formularios.
              </p>
            </td>
          </tr>

          <!-- Mensaje principal -->
          <tr>
            <td style="padding: 18px 24px 6px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff7ed; border: 1px solid #fed7aa;">
                <tr>
                  <td style="padding: 18px 18px 14px 18px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #9a3412;">
                      Cómo funciona, en 30 segundos
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                      Subes el material de tu reserva. Por solo participar (mínimo <strong>3 fotos</strong> o
                      <strong>1 vídeo</strong>) te damos un <strong>cupón de bienvenida del 3&nbsp;%</strong> al instante,
                      válido durante <strong>18 meses</strong>.
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                      Si nos enamoramos de algún material y lo elegimos para nuestro archivo, los puntos engordan rápido y el cupón salta automáticamente:
                      <strong>5 % &rarr; 8 % &rarr; 10 % &rarr; 12 % &rarr; 15 %</strong>.
                      Y por encima del 15 %, <strong>regalos físicos</strong> (taza, camiseta, sudadera).
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner narrativa -->
          <tr>
            <td style="padding: 18px 0 4px 0;">
              <img src="https://www.furgocasa.com/images/mailing/storytellers/banner-07-recuerdos.jpg" alt="Manos sosteniendo un móvil que muestra la galería de fotos del viaje en camper" width="600" class="hero-img" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none; text-decoration: none;" />
            </td>
          </tr>

          <!-- Tabla de descuentos -->
          <tr>
            <td style="padding: 28px 24px 6px 24px;">
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">
                Escala de descuentos
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #063971; color: #ffffff; padding: 10px 12px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Cuándo</td>
                  <td style="background-color: #063971; color: #ffffff; padding: 10px 12px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Cupón</td>
                </tr>
                <tr>
                  <td style="background-color: #fff7ed; padding: 11px 12px; font-size: 15px; color: #1f2937; border-bottom: 1px solid #fed7aa;">
                    <strong>Tu primera subida válida</strong>
                    <br/><span style="color: #6b7280; font-size: 13px;">Cupón de bienvenida &middot; una sola vez</span>
                  </td>
                  <td style="background-color: #fff7ed; padding: 11px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #fed7aa;">3 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">Al alcanzar 40 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">5 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">Al alcanzar 100 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">8 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; border-bottom: 1px solid #e5e7eb;">Al alcanzar 200 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; border-bottom: 1px solid #e5e7eb;">10 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">Al alcanzar 400 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #ea580c; font-weight: bold; text-align: right; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">12 %</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; font-size: 15px; color: #1f2937; border-bottom: 2px solid #063971;">Al alcanzar 800 ptos</td>
                  <td style="padding: 10px 12px; font-size: 16px; color: #c2410c; font-weight: bold; text-align: right; border-bottom: 2px solid #063971;">15 %&nbsp;&middot;&nbsp;techo</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 24px 0 24px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.55;">
                Cupones válidos en <strong>baja y media temporada</strong>, mínimo 4 días de reserva, no acumulables con otras promos.
              </p>
            </td>
          </tr>

          <!-- Callout: ventana de 90 días -->
          <tr>
            <td style="padding: 22px 24px 0 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f9ff; border-left: 4px solid #063971;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: bold; color: #063971;">
                      Tienes 90 días desde la devolución
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.55;">
                      Como acabas de devolver la camper hace muy poco, sigues dentro de la ventana del programa.
                      No corras: revisa con calma la galería, elige las que mejor cuentan tu viaje y mándanoslas.
                      <strong>Lo que entra en nuestro archivo multiplica los puntos</strong> (+20 por foto seleccionada,
                      +60 por vídeo). Por eso compensa elegir bien.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Mosaico ejemplos -->
          <tr>
            <td style="padding: 28px 24px 6px 24px;">
              <p style="margin: 0; font-size: 17px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">
                Tipos de momento que solemos seleccionar
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 20px 6px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-sunset-couple.jpg" alt="Pareja al atardecer junto a su camper" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                  <td width="34%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-pet-travel.jpg" alt="Perro asomado a la puerta lateral de la camper" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <img src="https://www.furgocasa.com/images/mailing/storytellers/showcase-interior-cozy.jpg" alt="Interior acogedor de camper con café y luz natural" width="180" style="display: block; width: 100%; max-width: 180px; height: auto; border: 0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Cómo subir -->
          <tr>
            <td style="padding: 24px 24px 6px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f9ff; border-left: 4px solid #063971;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #111827; font-size: 16px;">Subir es cosa de menos de 2 minutos</p>
                    <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.55;">
                      Entra en <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #063971; text-decoration: underline;">www.furgocasa.com/es/storytellers/subir</a>, escribe tu <strong>número de reserva</strong> &mdash;
                      <span style="font-family: Consolas, 'Courier New', monospace; background-color: #ffffff; padding: 4px 10px; color: #063971; font-weight: bold; font-size: 16px; border: 1px solid #cbd5e1;">FC-2026-001234</span>
                      &mdash; y el <strong>email con el que reservaste</strong>, y arrastra los archivos. Mínimo 3 fotos o 1 vídeo. <strong>Sin login, sin contraseñas, sin formularios largos.</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 28px 24px 8px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ea580c; padding: 14px 32px;">
                    <a href="https://www.furgocasa.com/es/storytellers/subir?ref=FC-2026-001234" referrerpolicy="no-referrer" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 17px;">Subir mis fotos o vídeos</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 4px 24px 4px 24px;">
              <a href="https://www.furgocasa.com/es/storytellers" style="font-size: 15px; color: #063971; text-decoration: underline;">Cómo funciona Storytellers</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 24px 26px 24px;">
              <a href="https://www.furgocasa.com/es/storytellers/mis-puntos" style="font-size: 15px; color: #063971; text-decoration: underline;">Ver mis puntos y cupones</a>
            </td>
          </tr>

          <!-- Despedida -->
          <tr>
            <td style="padding: 4px 24px 30px 24px;">
              <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.55;">
                Gracias por viajar con Furgocasa. Como muestra de que el programa también va para los que ya volvisteis,
                te dejamos esta puerta abierta. Nos encantará ver tu material &mdash; y tenerte de vuelta con descuento.<br/>
                <strong>El equipo de Furgocasa</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold; color: #374151;">Furgocasa - Alquiler de Campers</p>
              <p style="margin: 0 0 5px 0; font-size: 15px; color: #6b7280;">
                Tel: <a href="tel:+34868364161" style="color: #063971; text-decoration: none;">+34 868 364 161</a>
              </p>
              <p style="margin: 0 0 5px 0; font-size: 15px; color: #6b7280;">
                Email: <a href="mailto:reservas@furgocasa.com" style="color: #063971; text-decoration: none;">reservas@furgocasa.com</a>
              </p>
              <p style="margin: 0 0 15px 0; font-size: 15px; color: #6b7280;">
                Web: <a href="https://www.furgocasa.com" style="color: #063971; text-decoration: none;">www.furgocasa.com</a>
              </p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                Aviso único enviado tras el lanzamiento del programa Storytellers.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Mapa por código de ciclo (`"05" | "06" | "07"`). `08` se importa
 * directamente como `STORYTELLER_08_HTML` desde el script de rescate.
 */
export const CYCLE_EMAIL_HTML: Record<"05" | "06" | "07", string> = {
  "05": STORYTELLER_05_HTML,
  "06": STORYTELLER_06_HTML,
  "07": STORYTELLER_07_HTML,
};
