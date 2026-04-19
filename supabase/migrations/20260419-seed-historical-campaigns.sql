-- 20260419 · Seed de campañas históricas (ya enviadas antes del sistema de mailing)
--
-- Se registran dos campañas de marketing que se enviaron ANTES de tener
-- el sistema de mailing en producción. Se guardan con status = 'archived'
-- para que queden en el histórico del panel /administrator/mails.
--
-- Son sólo referencia de contenido: no tienen recipients ni stats reales
-- (no se registraron en su momento). Si el usuario las quiere "renviar",
-- puede duplicarlas desde el panel como campaña nueva.
--
-- Idempotente: ON CONFLICT (slug) DO NOTHING.

-- ──────────────────────────────────────────────────────────────────────
-- 1) 2026-01-05 · Oferta Invierno 2026 (-15% código INV2026)
-- ──────────────────────────────────────────────────────────────────────
INSERT INTO mailing_campaigns (
  slug, subject, description, status,
  template_file, audience_filter,
  total_recipients, sent_count, failed_count, skipped_count,
  max_per_hour, batch_size_per_tick,
  created_at, started_at, completed_at, archived_at,
  html_content
) VALUES (
  '2026-01-05-oferta-invierno-2026',
  'Invierno Mágico 2026 · -15% con código INV2026',
  'Campaña histórica de enero 2026. Oferta -15% en autocaravanas para reservas mínimas de 10 días durante el invierno (código INV2026).',
  'archived',
  'mailing/2026.01.05 - mail oferta invierno.html',
  '{"audience":"all","note":"seed historico - no se guardaron filtros originales"}'::jsonb,
  0, 0, 0, 0,
  150, 3,
  TIMESTAMPTZ '2026-01-05 10:00:00+01',
  TIMESTAMPTZ '2026-01-05 10:00:00+01',
  TIMESTAMPTZ '2026-01-05 18:00:00+01',
  now(),
  $HIST_INVIERNO$<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Oferta Invierno 2026 - FURGOCASA</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f0f0f0;">
    
    <!-- Wrapper principal -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f0f0f0;">
        <tr>
            <td style="padding: 20px 0;">
                
                <!-- Container principal -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #1a1a1a; max-width: 600px;" class="email-container">
                    
                    <!-- Header con muñeco de nieve -->
                    <tr>
                        <td style="background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%); padding: 50px 30px; text-align: center; border-bottom: 8px solid #ff3333;">
                            <!-- Logo Furgocasa -->
                            <div style="margin-bottom: 30px;">
                                <a href="https://www.furgocasa.com" target="_blank" style="display: inline-block;">
                                    <img src="https://www.furgocasa.com/images/brand/LOGO%20BLANCO.png" alt="FURGOCASA" width="200" style="max-width: 200px; height: auto; display: block;">
                                </a>
                            </div>
                            <div style="font-size: 80px; margin-bottom: 15px;">⛄</div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; text-shadow: 3px 3px 0 #ff3333, 6px 6px 0 #64c8ff;">INVIERNO MÁGICO 2026</h1>
                            <p style="margin: 15px 0 0; color: #64c8ff; font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px;">❄️ ESCAPADAS EN CAMPER ❄️</p>
                        </td>
                    </tr>
                    
                    <!-- Saludo personalizado -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 40px 30px 20px; color: #f0f0f0; font-size: 18px; line-height: 1.6; border-top: 6px solid #64c8ff;">
                            <p style="margin: 0 0 20px;">Hola,</p>
                            <p style="margin: 0;">¿Listo/a para vivir una <strong style="color: #ff3333;">aventura invernal inolvidable</strong>? En <strong style="color: #64c8ff;">FURGOCASA</strong> tenemos la oferta perfecta para ti.</p>
                        </td>
                    </tr>
                    
                    <!-- Descripción -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 0 30px 30px; color: #f0f0f0; font-size: 17px; line-height: 1.7;">
                            <p style="margin: 0;">
                                Ya sea que sueñes con <strong style="color: #fff;">montañas nevadas</strong>, pueblos con encanto o playas desiertas en invierno, nuestras <strong style="color: #64c8ff;">autocaravanas totalmente equipadas</strong> te llevarán donde quieras. 🚐❄️
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Caja de descuento BOLD -->
                    <tr>
                        <td style="padding: 0 30px 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #ff3333 0%, #ff6666 100%); border: 6px solid #ffffff; box-shadow: 0 0 0 6px #64c8ff;">
                                <tr>
                                    <td style="padding: 50px 30px; text-align: center;">
                                        <div style="font-size: 100px; margin-bottom: 20px;">❄️</div>
                                        <h2 style="margin: 0 0 15px; color: #ffffff; font-size: 80px; font-weight: 900; text-shadow: 4px 4px 0 #000000;">-15%</h2>
                                        <p style="margin: 0 0 10px; color: #ffffff; font-size: 22px; font-weight: 900; text-transform: uppercase; text-shadow: 2px 2px 0 #000000;">¡DESCUENTO INVIERNO 2026!</p>
                                        <p style="margin: 0 0 25px; color: #ffffff; font-size: 20px; font-weight: 900; text-transform: uppercase; text-shadow: 2px 2px 0 #000000;">⚡ En TODAS nuestras AUTOCARAVANAS ⚡</p>
                                        <div style="background-color: #000000; color: #64c8ff; padding: 20px; border: 4px solid #ffffff; margin-top: 25px;">
                                            <p style="margin: 0; font-size: 20px; font-weight: 900; text-transform: uppercase;">💥 ¡ALQUILA MÍNIMO 10 DÍAS! 💥</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Código promocional -->
                    <tr>
                        <td style="background-color: #2a2a2a; padding: 40px 30px; text-align: center; border-top: 8px solid #ff3333; border-bottom: 8px solid #64c8ff;">
                            <p style="margin: 0 0 25px; color: #ffffff; font-size: 26px; font-weight: 900; text-transform: uppercase; text-shadow: 2px 2px 0 #ff3333, 4px 4px 0 #64c8ff;">⚡ ¡TU CÓDIGO PROMOCIONAL! ⚡</p>
                            <div style="display: inline-block; background-color: #ffffff; color: #000000; padding: 25px 50px; font-size: 40px; font-weight: 900; letter-spacing: 10px; border: 6px solid #ff3333; box-shadow: 0 0 0 6px #64c8ff; margin: 20px 0;">
                                INV2026
                            </div>
                            <p style="margin: 25px 0 0; color: #f0f0f0; font-size: 17px; line-height: 1.7;">
                                💥 Copia este código y úsalo en tu reserva de <strong style="color: #ff3333;">10 días o más</strong> para conseguir un <strong style="color: #64c8ff;">15% DE DESCUENTO</strong> 💥
                            </p>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="background-color: #2a2a2a; padding: 0 30px 40px; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #64c8ff 0%, #3399ff 100%); border: 5px solid #ffffff; box-shadow: 0 0 0 5px #ff3333; padding: 20px 50px; text-align: center;">
                                        <a href="https://www.furgocasa.com/es/reservar" style="color: #000000; text-decoration: none; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; display: block;">¡RESERVAR AHORA!</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Alert / Destacado -->
                    <tr>
                        <td style="padding: 0 30px 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #ff6666 0%, #ff3333 100%); border: 6px solid #ffffff; box-shadow: 0 0 0 6px #64c8ff;">
                                <tr>
                                    <td style="padding: 30px;">
                                        <p style="margin: 0 0 15px; color: #ffffff; font-size: 24px; font-weight: 900; text-transform: uppercase; text-shadow: 2px 2px 0 #000000;">⛄ ¡OFERTA ESPECIAL INVIERNO 2026! ❄️</p>
                                        <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.7; font-weight: 700;">
                                            ⏰ No dejes pasar esta oportunidad única de vivir el invierno en autocaravana. Montañas nevadas, pueblos con encanto, playas desiertas, rutas espectaculares... ¡TÚ eliges el destino! ⛄❄️🚐
                                        </p>
                                        <p style="margin: 20px 0 0; color: #ffffff; font-size: 16px; line-height: 1.7; font-weight: 700;">
                                            ⚡ <strong>Condiciones:</strong> Reserva mínima de 10 días para obtener el 15% de descuento. Promoción válida del 5 de enero hasta el inicio de la primavera 2026. 🌸
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Ventajas / Features -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 50px 30px 30px;">
                            <h3 style="margin: 0 0 35px; color: #ffffff; font-size: 32px; font-weight: 900; text-align: center; text-transform: uppercase; text-shadow: 2px 2px 0 #ff3333, 4px 4px 0 #64c8ff;">⛄ ¿POR QUÉ ELEGIR FURGOCASA? ⚡</h3>
                            
                            <!-- Features Grid - 2 columnas -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <!-- Feature 1 -->
                                    <td width="50%" style="padding: 15px; vertical-align: top;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #2a2a2a; border: 4px solid #ffffff; box-shadow: 0 0 0 4px #64c8ff;">
                                            <tr>
                                                <td style="padding: 25px; text-align: center;">
                                                    <div style="font-size: 45px; margin-bottom: 12px;">🚐</div>
                                                    <p style="margin: 0 0 10px; color: #64c8ff; font-size: 18px; font-weight: 900; text-transform: uppercase;">Flota Moderna</p>
                                                    <p style="margin: 0; color: #f0f0f0; font-size: 14px; line-height: 1.5;">Autocaravanas nuevas y totalmente equipadas</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <!-- Feature 2 -->
                                    <td width="50%" style="padding: 15px; vertical-align: top;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #2a2a2a; border: 4px solid #ffffff; box-shadow: 0 0 0 4px #64c8ff;">
                                            <tr>
                                                <td style="padding: 25px; text-align: center;">
                                                    <div style="font-size: 45px; margin-bottom: 12px;">🔥</div>
                                                    <p style="margin: 0 0 10px; color: #64c8ff; font-size: 18px; font-weight: 900; text-transform: uppercase;">Calefacción Total</p>
                                                    <p style="margin: 0; color: #f0f0f0; font-size: 14px; line-height: 1.5;">Disfruta del invierno con máximo confort</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <!-- Feature 3 -->
                                    <td width="50%" style="padding: 15px; vertical-align: top;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #2a2a2a; border: 4px solid #ffffff; box-shadow: 0 0 0 4px #64c8ff;">
                                            <tr>
                                                <td style="padding: 25px; text-align: center;">
                                                    <div style="font-size: 45px; margin-bottom: 12px;">🗺️</div>
                                                    <p style="margin: 0 0 10px; color: #64c8ff; font-size: 18px; font-weight: 900; text-transform: uppercase;">Libertad Total</p>
                                                    <p style="margin: 0; color: #f0f0f0; font-size: 14px; line-height: 1.5;">Viaja a tu ritmo. ¡Tú decides!</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <!-- Feature 4 -->
                                    <td width="50%" style="padding: 15px; vertical-align: top;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #2a2a2a; border: 4px solid #ffffff; box-shadow: 0 0 0 4px #64c8ff;">
                                            <tr>
                                                <td style="padding: 25px; text-align: center;">
                                                    <div style="font-size: 45px; margin-bottom: 12px;">📞</div>
                                                    <p style="margin: 0 0 10px; color: #64c8ff; font-size: 18px; font-weight: 900; text-transform: uppercase;">Asistencia 24/7</p>
                                                    <p style="margin: 0; color: #f0f0f0; font-size: 14px; line-height: 1.5;">Soporte técnico siempre disponible</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <!-- Feature 5 -->
                                    <td width="50%" style="padding: 15px; vertical-align: top;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #2a2a2a; border: 4px solid #ffffff; box-shadow: 0 0 0 4px #64c8ff;">
                                            <tr>
                                                <td style="padding: 25px; text-align: center;">
                                                    <div style="font-size: 45px; margin-bottom: 12px;">💰</div>
                                                    <p style="margin: 0 0 10px; color: #64c8ff; font-size: 18px; font-weight: 900; text-transform: uppercase;">Sin Sorpresas</p>
                                                    <p style="margin: 0; color: #f0f0f0; font-size: 14px; line-height: 1.5;">Precio final transparente</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <!-- Feature 6 -->
                                    <td width="50%" style="padding: 15px; vertical-align: top;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #2a2a2a; border: 4px solid #ffffff; box-shadow: 0 0 0 4px #64c8ff;">
                                            <tr>
                                                <td style="padding: 25px; text-align: center;">
                                                    <div style="font-size: 45px; margin-bottom: 12px;">⭐</div>
                                                    <p style="margin: 0 0 10px; color: #64c8ff; font-size: 18px; font-weight: 900; text-transform: uppercase;">Experiencia Única</p>
                                                    <p style="margin: 0; color: #f0f0f0; font-size: 14px; line-height: 1.5;">Tu mejor invierno te espera</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Pasos para reservar -->
                    <tr>
                        <td style="background-color: #2a2a2a; padding: 50px 30px 30px; border-top: 8px solid #ff3333;">
                            <h3 style="margin: 0 0 30px; color: #ffffff; font-size: 32px; font-weight: 900; text-align: center; text-transform: uppercase; text-shadow: 2px 2px 0 #ff3333, 4px 4px 0 #64c8ff;">⚡ ¿CÓMO CONSEGUIR TU DESCUENTO? ⛄</h3>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border: 6px solid #ffffff; box-shadow: 0 0 0 6px #64c8ff;">
                                <tr>
                                    <td style="padding: 35px; color: #f0f0f0; font-size: 17px; line-height: 2.2;">
                                        <p style="margin: 0 0 15px;"><strong style="color: #ff3333; font-size: 24px; margin-right: 10px;">1️⃣</strong> Elige tus fechas (mínimo 10 días) 📅</p>
                                        <p style="margin: 0 0 15px;"><strong style="color: #ff3333; font-size: 24px; margin-right: 10px;">2️⃣</strong> Selecciona tu autocaravana ideal 🚐</p>
                                        <p style="margin: 0 0 15px;"><strong style="color: #ff3333; font-size: 24px; margin-right: 10px;">3️⃣</strong> Introduce el código: <strong style="color: #64c8ff;">INV2026</strong> ⛄</p>
                                        <p style="margin: 0 0 15px;"><strong style="color: #ff3333; font-size: 24px; margin-right: 10px;">4️⃣</strong> ¡ZAS! Descuento del 15% aplicado ⚡</p>
                                        <p style="margin: 0;"><strong style="color: #ff3333; font-size: 24px; margin-right: 10px;">5️⃣</strong> ¡Prepara tu aventura invernal! 🎒</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA Button Final -->
                    <tr>
                        <td style="background-color: #2a2a2a; padding: 30px; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #64c8ff 0%, #3399ff 100%); border: 5px solid #ffffff; box-shadow: 0 0 0 5px #ff3333; padding: 22px 60px; text-align: center;">
                                        <a href="https://www.furgocasa.com/es/reservar" style="color: #000000; text-decoration: none; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; display: block;">¡EMPEZAR AHORA!</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer / Disclaimer -->
                    <tr>
                        <td style="background-color: #2a2a2a; padding: 30px; text-align: center; color: #999999; font-size: 13px; line-height: 1.8; font-style: italic;">
                            <p style="margin: 0 0 15px;">
                                *Promoción válida del 5 de enero al inicio de la primavera 2026. Descuento del 15% aplicable solo en reservas de 10 días o más. No acumulable con otras ofertas. Sujeto a disponibilidad.
                            </p>
                            <p style="margin: 0;">
                                ¡Tu escapada invernal perfecta te está esperando! ❄️
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Logo y datos de contacto -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 40px 30px; text-align: center; border-top: 6px solid #64c8ff;">
                            <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 3px;">FURGOCASA</h2>
                            <p style="margin: 0 0 10px; color: #f0f0f0; font-size: 15px;">
                                📧 <a href="mailto:info@furgocasa.com" style="color: #64c8ff; text-decoration: none;">info@furgocasa.com</a>
                            </p>
                            <p style="margin: 0; color: #f0f0f0; font-size: 15px;">
                                🌐 <a href="https://www.furgocasa.com" style="color: #64c8ff; text-decoration: none;">www.furgocasa.com</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Unsuscribe -->
                    <tr>
                        <td style="background-color: #0a0a0a; padding: 20px 30px; text-align: center; color: #666666; font-size: 11px;">
                            <p style="margin: 0;">
                                Has recibido este email porque eres cliente de FURGOCASA.<br>
                                Si no deseas recibir más ofertas, <a href="mailto:info@furgocasa.com?subject=No%20deseo%20seguir%20recibiendo%20estos%20emails" style="color: #999999; text-decoration: underline;">date de baja aquí</a>.
                            </p>
                        </td>
                    </tr>
                    
                </table>
                <!-- Fin Container principal -->
                
            </td>
        </tr>
    </table>
    <!-- Fin Wrapper principal -->
    
    <!-- Versión móvil responsive -->
    <style type="text/css">
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                min-width: 100% !important;
            }
            h1 {
                font-size: 32px !important;
            }
            h2 {
                font-size: 60px !important;
            }
            h3 {
                font-size: 26px !important;
            }
            table[width="50%"] {
                display: block !important;
                width: 100% !important;
            }
            td[width="50%"] {
                display: block !important;
                width: 100% !important;
            }
            img[alt="FURGOCASA"] {
                max-width: 150px !important;
                width: 150px !important;
            }
        }
    </style>
    
</body>
</html>
$HIST_INVIERNO$
)
ON CONFLICT (slug) DO NOTHING;


-- ──────────────────────────────────────────────────────────────────────
-- 2) 2026-03-17 · 5 ofertas de última hora (huecos entre reservas)
-- ──────────────────────────────────────────────────────────────────────
INSERT INTO mailing_campaigns (
  slug, subject, description, status,
  template_file, audience_filter,
  total_recipients, sent_count, failed_count, skipped_count,
  max_per_hour, batch_size_per_tick,
  created_at, started_at, completed_at, archived_at,
  html_content
) VALUES (
  '2026-03-17-ofertas-ultima-hora',
  '5 ofertas de última hora · Hasta -25% en campers',
  'Campaña histórica de marzo 2026. 5 huecos entre reservas con descuentos del 15-25% en Adria Twin Family, Dreamer Fun D55 (x2), Dethleffs Globetrail 600 DS y Knaus Boxstar Family. Recordatorio del código EARLYSUMMER2026 (-15% verano).',
  'archived',
  'mailing/2026.03.17 - email ofertas.html',
  '{"audience":"all","note":"seed historico - no se guardaron filtros originales"}'::jsonb,
  0, 0, 0, 0,
  150, 3,
  TIMESTAMPTZ '2026-03-17 10:00:00+01',
  TIMESTAMPTZ '2026-03-17 10:00:00+01',
  TIMESTAMPTZ '2026-03-17 18:00:00+01',
  now(),
  $HIST_MARZO$<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>Furgocasa - 5 Ofertas de &Uacute;ltima Hora | Marzo 2026</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    #MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }

    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-padding-hero { padding: 32px 20px !important; }
      .hero-title { font-size: 28px !important; line-height: 34px !important; }
      .hero-subtitle { font-size: 16px !important; line-height: 24px !important; }
      .offer-price-big { font-size: 22px !important; }
      .feature-col { display: block !important; width: 100% !important; padding-bottom: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    &#128293; 5 ofertas de &uacute;ltima hora: hasta -25% en campers. Adria Twin Family, Dreamer Fun D55, Knaus Boxstar... &#161;Plazas limitadas!
  </div>
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 20px 10px;">

        <!-- CONTAINER 600px -->
        <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color: #ffffff; padding: 25px 20px; border-bottom: 4px solid #063971;">
              <a href="https://www.furgocasa.com" style="text-decoration: none;">
                <img src="https://www.furgocasa.com/images/mailing/LOGO%20AZUL.png" alt="Furgocasa" width="200" style="display: block; max-width: 200px; height: auto;" />
              </a>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="padding: 0;">
              <!--[if mso]>
              <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px;">
                <v:fill type="gradient" color="#D65A31" color2="#063971" angle="135"/>
                <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
              <![endif]-->
              <div style="background: linear-gradient(135deg, #D65A31 0%, #C04F2A 40%, #063971 100%); padding: 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="mobile-padding-hero" style="padding: 48px 40px 16px 40px; text-align: center;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                        <tr>
                          <!--[if mso]><td style="background-color: #b8451f; padding: 8px 20px;"><![endif]-->
                          <!--[if !mso]><!--><td style="background-color: rgba(255,255,255,0.15); border-radius: 50px; padding: 8px 20px;"><!--<![endif]-->
                            <span style="color: #ffffff; font-size: 13px;">&#128293;</span>
                            <span style="color: #ffffff; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">&nbsp;&nbsp;5 Ofertas Disponibles</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td class="mobile-padding-hero" style="padding: 16px 40px 0 40px; text-align: center;">
                      <h1 class="hero-title" style="margin: 0; font-size: 38px; line-height: 44px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                        Ofertas de <span style="color: #FBBF24;">&Uacute;ltima Hora</span>
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td class="mobile-padding-hero" style="padding: 10px 40px 0 40px; text-align: center;">
                      <p class="hero-subtitle" style="margin: 0; color: #fde8e0; font-size: 18px; line-height: 28px;">
                        Huecos entre reservas a precios especiales. Descuentos de hasta el <strong style="color: #FBBF24;">25%</strong> en campers totalmente equipadas.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px 40px 40px 40px; text-align: center;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                        <tr>
                          <!--[if mso]><td style="background-color: #b8451f; padding: 6px 16px;"><![endif]-->
                          <!--[if !mso]><!--><td style="background-color: rgba(0,0,0,0.15); border-radius: 8px; padding: 6px 16px;"><!--<![endif]-->
                            <span style="color: #fde8e0; font-size: 12px; letter-spacing: 1px;">&#128197; Actualizado: 17 de marzo de 2026</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              <!--[if mso]>
                </v:textbox>
              </v:rect>
              <![endif]-->
            </td>
          </tr>

          <!-- INTRO -->
          <tr>
            <td style="padding: 32px 30px 20px 30px;" class="mobile-padding">
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #111827; font-weight: 700;">Hola,</p>
              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 22px;">
                Tenemos <strong style="color: #D65A31;">5 ofertas de &uacute;ltima hora</strong> disponibles ahora mismo. Son huecos entre reservas que ofrecemos a precios especiales. Echa un vistazo y reserva antes de que se agoten:
              </p>
            </td>
          </tr>

          <!-- ============================================ -->
          <!-- OFERTA 1: Adria Twin Family — 6-21 abr — 15 d&iacute;as — -15% -->
          <!-- ============================================ -->
          <tr>
            <td style="padding: 8px 20px;" class="mobile-padding">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 0; line-height: 0; font-size: 0;">
                    <a href="https://www.furgocasa.com/es/reservar/oferta/8e72c778-824f-4eac-9b94-c39b5ffa5c1f" style="text-decoration: none;">
                      <img src="https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/vehicles/FU0015%20-%20Adria%20Twin%20Family/1767823219692-43vk03itsf8.png" alt="Adria Twin Family" width="560" style="display: block; width: 100%; max-width: 560px; height: auto; background-color: #f3f4f6;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #D65A31; color: #ffffff; font-size: 13px; font-weight: 800; padding: 5px 14px; border-radius: 0 0 10px 10px;">
                          -15%
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px 20px 20px;">
                    <h3 style="margin: 0 0 2px 0; font-size: 18px; font-weight: 800; color: #111827;">
                      <a href="https://www.furgocasa.com/es/reservar/oferta/8e72c778-824f-4eac-9b94-c39b5ffa5c1f" style="color: #111827; text-decoration: none;">Adria Twin Family</a>
                    </h3>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">Adria Twin Plus 600 SPB &middot; FU0015</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#128101; 4 plazas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#127769; 4 camas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #FFF7ED; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #D65A31; font-weight: 600;">
                                &#9200; 15 d&iacute;as
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 4px;">
                          <p style="margin: 0; font-size: 13px; color: #374151;">&#128197; <strong>6 abr &mdash; 21 abr 2026</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 14px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280;">&#128205; Recogida y devoluci&oacute;n en Murcia</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding-top: 14px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="vertical-align: bottom;">
                                <p style="margin: 0 0 2px 0;">
                                  <span style="font-size: 13px; color: #9ca3af; text-decoration: line-through;">1.264,95 &euro;</span>
                                  &nbsp;
                                  <span style="font-size: 11px; color: #10B981; font-weight: 600; background-color: #F0FDF4; padding: 2px 8px; border-radius: 8px;">Ahorras 189,75 &euro;</span>
                                </p>
                                <p style="margin: 0;">
                                  <span class="offer-price-big" style="font-size: 26px; font-weight: 800; color: #111827;">1.075,20 &euro;</span>
                                  <span style="font-size: 12px; color: #6b7280;">&nbsp;(71,68 &euro;/d&iacute;a)</span>
                                </p>
                              </td>
                              <td style="vertical-align: bottom; text-align: right; width: 150px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right">
                                  <tr>
                                    <td align="center" style="background-color: #D65A31; border-radius: 10px;" bgcolor="#D65A31">
                                      <!--[if mso]>
                                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.furgocasa.com/es/reservar/oferta/8e72c778-824f-4eac-9b94-c39b5ffa5c1f" style="height:40px;v-text-anchor:middle;width:140px;" arcsize="25%" strokecolor="#D65A31" fillcolor="#D65A31">
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">Reservar ahora</center>
                                      </v:roundrect>
                                      <![endif]-->
                                      <!--[if !mso]><!-->
                                      <a href="https://www.furgocasa.com/es/reservar/oferta/8e72c778-824f-4eac-9b94-c39b5ffa5c1f" style="display: inline-block; background-color: #D65A31; color: #ffffff; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 10px;">
                                        Reservar ahora
                                      </a>
                                      <!--<![endif]-->
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============================================ -->
          <!-- OFERTA 2: Dreamer Fun D55 — 21-29 abr — 8 d&iacute;as — -15% -->
          <!-- ============================================ -->
          <tr>
            <td style="padding: 8px 20px;" class="mobile-padding">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 0; line-height: 0; font-size: 0;">
                    <a href="https://www.furgocasa.com/es/reservar/oferta/74734269-d266-428a-b4cb-850901e715fc" style="text-decoration: none;">
                      <img src="https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/vehicles/FU0006%20-%20Dreamer%20Fun/1767823085803-z6c2jhpo39.jpg" alt="Dreamer Fun D55" width="560" style="display: block; width: 100%; max-width: 560px; height: auto; background-color: #f3f4f6;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #D65A31; color: #ffffff; font-size: 13px; font-weight: 800; padding: 5px 14px; border-radius: 0 0 10px 10px;">
                          -15%
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px 20px 20px;">
                    <h3 style="margin: 0 0 2px 0; font-size: 18px; font-weight: 800; color: #111827;">
                      <a href="https://www.furgocasa.com/es/reservar/oferta/74734269-d266-428a-b4cb-850901e715fc" style="color: #111827; text-decoration: none;">Dreamer Fun D55</a>
                    </h3>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">Dreamer D55 Fun &middot; FU0006</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#128101; 4 plazas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#127769; 2 camas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #FFF7ED; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #D65A31; font-weight: 600;">
                                &#9200; 8 d&iacute;as
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 4px;">
                          <p style="margin: 0; font-size: 13px; color: #374151;">&#128197; <strong>21 abr &mdash; 29 abr 2026</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 14px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280;">&#128205; Recogida y devoluci&oacute;n en Murcia</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding-top: 14px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="vertical-align: bottom;">
                                <p style="margin: 0 0 2px 0;">
                                  <span style="font-size: 13px; color: #9ca3af; text-decoration: line-through;">680,00 &euro;</span>
                                  &nbsp;
                                  <span style="font-size: 11px; color: #10B981; font-weight: 600; background-color: #F0FDF4; padding: 2px 8px; border-radius: 8px;">Ahorras 102,00 &euro;</span>
                                </p>
                                <p style="margin: 0;">
                                  <span class="offer-price-big" style="font-size: 26px; font-weight: 800; color: #111827;">578,00 &euro;</span>
                                  <span style="font-size: 12px; color: #6b7280;">&nbsp;(72,25 &euro;/d&iacute;a)</span>
                                </p>
                              </td>
                              <td style="vertical-align: bottom; text-align: right; width: 150px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right">
                                  <tr>
                                    <td align="center" style="background-color: #D65A31; border-radius: 10px;" bgcolor="#D65A31">
                                      <!--[if mso]>
                                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.furgocasa.com/es/reservar/oferta/74734269-d266-428a-b4cb-850901e715fc" style="height:40px;v-text-anchor:middle;width:140px;" arcsize="25%" strokecolor="#D65A31" fillcolor="#D65A31">
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">Reservar ahora</center>
                                      </v:roundrect>
                                      <![endif]-->
                                      <!--[if !mso]><!-->
                                      <a href="https://www.furgocasa.com/es/reservar/oferta/74734269-d266-428a-b4cb-850901e715fc" style="display: inline-block; background-color: #D65A31; color: #ffffff; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 10px;">
                                        Reservar ahora
                                      </a>
                                      <!--<![endif]-->
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============================================ -->
          <!-- OFERTA 3: Dethleffs Globetrail 600 DS — 12-22 may — 10 d&iacute;as — -15% -->
          <!-- ============================================ -->
          <tr>
            <td style="padding: 8px 20px;" class="mobile-padding">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 0; line-height: 0; font-size: 0;">
                    <a href="https://www.furgocasa.com/es/reservar/oferta/be441319-a0c7-4153-8c96-1eaf1cb98e49" style="text-decoration: none;">
                      <img src="https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/vehicles/FU0021%20-%20Dethleffs%20Globetrail/1769677227601-sqplp6goneb.webp" alt="Dethleffs Globetrail 600 DS" width="560" style="display: block; width: 100%; max-width: 560px; height: auto; background-color: #f3f4f6;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #D65A31; color: #ffffff; font-size: 13px; font-weight: 800; padding: 5px 14px; border-radius: 0 0 10px 10px;">
                          -15%
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px 20px 20px;">
                    <h3 style="margin: 0 0 2px 0; font-size: 18px; font-weight: 800; color: #111827;">
                      <a href="https://www.furgocasa.com/es/reservar/oferta/be441319-a0c7-4153-8c96-1eaf1cb98e49" style="color: #111827; text-decoration: none;">Dethleffs Globetrail 600 DS</a>
                    </h3>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">Dethleffs Globetrail DS &middot; FU0021</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#128101; 4 plazas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#127769; 2 camas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #FFF7ED; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #D65A31; font-weight: 600;">
                                &#9200; 10 d&iacute;as
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 4px;">
                          <p style="margin: 0; font-size: 13px; color: #374151;">&#128197; <strong>12 may &mdash; 22 may 2026</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 14px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280;">&#128205; Recogida y devoluci&oacute;n en Murcia</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding-top: 14px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="vertical-align: bottom;">
                                <p style="margin: 0 0 2px 0;">
                                  <span style="font-size: 13px; color: #9ca3af; text-decoration: line-through;">850,00 &euro;</span>
                                  &nbsp;
                                  <span style="font-size: 11px; color: #10B981; font-weight: 600; background-color: #F0FDF4; padding: 2px 8px; border-radius: 8px;">Ahorras 127,50 &euro;</span>
                                </p>
                                <p style="margin: 0;">
                                  <span class="offer-price-big" style="font-size: 26px; font-weight: 800; color: #111827;">722,50 &euro;</span>
                                  <span style="font-size: 12px; color: #6b7280;">&nbsp;(72,25 &euro;/d&iacute;a)</span>
                                </p>
                              </td>
                              <td style="vertical-align: bottom; text-align: right; width: 150px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right">
                                  <tr>
                                    <td align="center" style="background-color: #D65A31; border-radius: 10px;" bgcolor="#D65A31">
                                      <!--[if mso]>
                                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.furgocasa.com/es/reservar/oferta/be441319-a0c7-4153-8c96-1eaf1cb98e49" style="height:40px;v-text-anchor:middle;width:140px;" arcsize="25%" strokecolor="#D65A31" fillcolor="#D65A31">
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">Reservar ahora</center>
                                      </v:roundrect>
                                      <![endif]-->
                                      <!--[if !mso]><!-->
                                      <a href="https://www.furgocasa.com/es/reservar/oferta/be441319-a0c7-4153-8c96-1eaf1cb98e49" style="display: inline-block; background-color: #D65A31; color: #ffffff; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 10px;">
                                        Reservar ahora
                                      </a>
                                      <!--<![endif]-->
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============================================ -->
          <!-- OFERTA 4: Dreamer Fun D55 — 20 may - 12 jun — 23 d&iacute;as — -25% (BEST DEAL) -->
          <!-- ============================================ -->
          <tr>
            <td style="padding: 8px 20px;" class="mobile-padding">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 2px solid #D65A31; border-radius: 16px; overflow: hidden;">
                <!-- BEST DEAL banner -->
                <tr>
                  <td style="background-color: #D65A31; padding: 8px 16px; text-align: center;">
                    <p style="margin: 0; color: #ffffff; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">&#11088; Mayor descuento &mdash; 25% OFF</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0; line-height: 0; font-size: 0;">
                    <a href="https://www.furgocasa.com/es/reservar/oferta/16349034-2758-4394-89f9-d1e0063b9275" style="text-decoration: none;">
                      <img src="https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/vehicles/FU0006%20-%20Dreamer%20Fun/1767823085803-z6c2jhpo39.jpg" alt="Dreamer Fun D55" width="560" style="display: block; width: 100%; max-width: 560px; height: auto; background-color: #f3f4f6;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #D65A31; color: #ffffff; font-size: 13px; font-weight: 800; padding: 5px 14px; border-radius: 0 0 10px 10px;">
                          -25%
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px 20px 20px;">
                    <h3 style="margin: 0 0 2px 0; font-size: 18px; font-weight: 800; color: #111827;">
                      <a href="https://www.furgocasa.com/es/reservar/oferta/16349034-2758-4394-89f9-d1e0063b9275" style="color: #111827; text-decoration: none;">Dreamer Fun D55</a>
                    </h3>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">Dreamer D55 Fun &middot; FU0006</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#128101; 4 plazas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#127769; 2 camas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #FFF7ED; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #D65A31; font-weight: 600;">
                                &#9200; 23 d&iacute;as
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 4px;">
                          <p style="margin: 0; font-size: 13px; color: #374151;">&#128197; <strong>20 may &mdash; 12 jun 2026</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 14px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280;">&#128205; Recogida y devoluci&oacute;n en Murcia</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding-top: 14px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="vertical-align: bottom;">
                                <p style="margin: 0 0 2px 0;">
                                  <span style="font-size: 13px; color: #9ca3af; text-decoration: line-through;">1.615,06 &euro;</span>
                                  &nbsp;
                                  <span style="font-size: 11px; color: #10B981; font-weight: 600; background-color: #F0FDF4; padding: 2px 8px; border-radius: 8px;">Ahorras 403,65 &euro;</span>
                                </p>
                                <p style="margin: 0;">
                                  <span class="offer-price-big" style="font-size: 26px; font-weight: 800; color: #111827;">1.211,41 &euro;</span>
                                  <span style="font-size: 12px; color: #6b7280;">&nbsp;(52,67 &euro;/d&iacute;a)</span>
                                </p>
                              </td>
                              <td style="vertical-align: bottom; text-align: right; width: 150px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right">
                                  <tr>
                                    <td align="center" style="background-color: #D65A31; border-radius: 10px;" bgcolor="#D65A31">
                                      <!--[if mso]>
                                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.furgocasa.com/es/reservar/oferta/16349034-2758-4394-89f9-d1e0063b9275" style="height:40px;v-text-anchor:middle;width:140px;" arcsize="25%" strokecolor="#D65A31" fillcolor="#D65A31">
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">Reservar ahora</center>
                                      </v:roundrect>
                                      <![endif]-->
                                      <!--[if !mso]><!-->
                                      <a href="https://www.furgocasa.com/es/reservar/oferta/16349034-2758-4394-89f9-d1e0063b9275" style="display: inline-block; background-color: #D65A31; color: #ffffff; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 10px;">
                                        Reservar ahora
                                      </a>
                                      <!--<![endif]-->
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============================================ -->
          <!-- OFERTA 5: Knaus Boxstar Family — 18 jul - 8 ago — 21 d&iacute;as — -15% -->
          <!-- ============================================ -->
          <tr>
            <td style="padding: 8px 20px;" class="mobile-padding">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 0; line-height: 0; font-size: 0;">
                    <a href="https://www.furgocasa.com/es/reservar/oferta/b6ca1075-deaf-4730-a5e6-e2a80dffeb93" style="text-decoration: none;">
                      <img src="https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/vehicles/FU0012%20-%20Knaus%20Boxstar%20Family/1767823175067-anwc0esh8z.jpg" alt="Knaus Boxstar Family" width="560" style="display: block; width: 100%; max-width: 560px; height: auto; background-color: #f3f4f6;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="background-color: #D65A31; color: #ffffff; font-size: 13px; font-weight: 800; padding: 5px 14px; border-radius: 0 0 10px 10px;">
                          -15%
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 20px 20px 20px;">
                    <h3 style="margin: 0 0 2px 0; font-size: 18px; font-weight: 800; color: #111827;">
                      <a href="https://www.furgocasa.com/es/reservar/oferta/b6ca1075-deaf-4730-a5e6-e2a80dffeb93" style="color: #111827; text-decoration: none;">Knaus Boxstar Family</a>
                    </h3>
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">Knaus Boxstar 600 Family &middot; FU0012</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#128101; 4 plazas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #EFF6FF; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #063971; font-weight: 600;">
                                &#127769; 4 camas
                              </td>
                              <td style="width: 6px;"></td>
                              <td style="background-color: #FFF7ED; padding: 4px 10px; border-radius: 12px; font-size: 12px; color: #D65A31; font-weight: 600;">
                                &#9200; 21 d&iacute;as
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 4px;">
                          <p style="margin: 0; font-size: 13px; color: #374151;">&#128197; <strong>18 jul &mdash; 8 ago 2026</strong></p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 14px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280;">&#128205; Recogida y devoluci&oacute;n en Murcia</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding-top: 14px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="vertical-align: bottom;">
                                <p style="margin: 0 0 2px 0;">
                                  <span style="font-size: 13px; color: #9ca3af; text-decoration: line-through;">2.415,00 &euro;</span>
                                  &nbsp;
                                  <span style="font-size: 11px; color: #10B981; font-weight: 600; background-color: #F0FDF4; padding: 2px 8px; border-radius: 8px;">Ahorras 362,25 &euro;</span>
                                </p>
                                <p style="margin: 0;">
                                  <span class="offer-price-big" style="font-size: 26px; font-weight: 800; color: #111827;">2.052,75 &euro;</span>
                                  <span style="font-size: 12px; color: #6b7280;">&nbsp;(97,75 &euro;/d&iacute;a)</span>
                                </p>
                              </td>
                              <td style="vertical-align: bottom; text-align: right; width: 150px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="right">
                                  <tr>
                                    <td align="center" style="background-color: #D65A31; border-radius: 10px;" bgcolor="#D65A31">
                                      <!--[if mso]>
                                      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.furgocasa.com/es/reservar/oferta/b6ca1075-deaf-4730-a5e6-e2a80dffeb93" style="height:40px;v-text-anchor:middle;width:140px;" arcsize="25%" strokecolor="#D65A31" fillcolor="#D65A31">
                                        <w:anchorlock/>
                                        <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">Reservar ahora</center>
                                      </v:roundrect>
                                      <![endif]-->
                                      <!--[if !mso]><!-->
                                      <a href="https://www.furgocasa.com/es/reservar/oferta/b6ca1075-deaf-4730-a5e6-e2a80dffeb93" style="display: inline-block; background-color: #D65A31; color: #ffffff; font-weight: bold; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 10px;">
                                        Reservar ahora
                                      </a>
                                      <!--<![endif]-->
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ============================================ -->
          <!-- SEPARATOR + COUPON REMINDER -->
          <!-- ============================================ -->
          <tr>
            <td style="padding: 28px 20px 0 20px;" class="mobile-padding">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Summer coupon reminder -->
          <tr>
            <td style="padding: 24px 20px 8px 20px;" class="mobile-padding">
              <!--[if mso]>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #063971;">
                <tr><td style="padding: 24px;">
              <![endif]-->
              <!--[if !mso]><!-->
              <div style="background: linear-gradient(135deg, #063971 0%, #042A54 100%); border-radius: 16px; padding: 24px; overflow: hidden;">
              <!--<![endif]-->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="text-align: center;">
                      <p style="margin: 0 0 4px 0; color: #FBBF24; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">
                        &#9728;&#65039; Adem&aacute;s, recuerda...
                      </p>
                      <h3 style="margin: 0 0 8px 0; color: #ffffff; font-size: 20px; font-weight: 800;">
                        <span style="color: #FBBF24;">15%</span> de descuento con el c&oacute;digo de verano
                      </h3>
                      <p style="margin: 0 0 14px 0; color: #93b4d4; font-size: 13px; line-height: 20px;">
                        V&aacute;lido para alquileres del 15/06 al 15/09. M&iacute;n. 10 d&iacute;as. Reserva antes del 31/03.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                        <tr>
                          <!--[if mso]><td style="background-color: #0d5da0; border: 2px dashed #1a7ad4; padding: 10px 24px;"><![endif]-->
                          <!--[if !mso]><!--><td style="background-color: rgba(255,255,255,0.1); border: 2px dashed rgba(255,255,255,0.25); border-radius: 12px; padding: 10px 24px;"><!--<![endif]-->
                            <span style="color: #FBBF24; font-size: 20px; font-weight: 900; letter-spacing: 3px; font-family: 'Courier New', Courier, monospace;">EARLYSUMMER2026</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              <!--[if mso]>
                </td></tr>
              </table>
              <![endif]-->
              <!--[if !mso]><!-->
              </div>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- ============================================ -->
          <!-- INFO + URGENCY -->
          <!-- ============================================ -->
          <tr>
            <td style="padding: 20px 20px 8px 20px;" class="mobile-padding">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #063971;">
                      &#128161; &iquest;C&oacute;mo funcionan estas ofertas?
                    </p>
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #374151; line-height: 20px;">
                      En temporada alta aplicamos periodos m&iacute;nimos de alquiler. Esto genera peque&ntilde;os <strong>huecos entre reservas</strong> que ofrecemos a precios especiales.
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #374151; line-height: 20px;">
                      &#128073; Haz clic en <strong>&laquo;Reservar ahora&raquo;</strong> y las fechas y el descuento ya estar&aacute;n aplicados autom&aacute;ticamente.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 12px 20px 20px 20px;" class="mobile-padding">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FFF7ED; border-left: 4px solid #D65A31; border-radius: 0 8px 8px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px 0; font-weight: bold; color: #111827; font-size: 14px;">&#9203; &#161;Plazas muy limitadas!</p>
                    <p style="margin: 0; font-size: 13px; color: #374151; line-height: 20px;">
                      Cada oferta es &uacute;nica: una vez reservada, desaparece. Si ves algo que te guste, no lo dejes para ma&ntilde;ana.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 10px 30px 32px 30px; text-align: center; background-color: #f0f9ff;" class="mobile-padding">
              <h2 style="margin: 0 0 6px 0; color: #063971; font-size: 22px; font-weight: 800;">&#191;Quieres ver m&aacute;s?</h2>
              <p style="margin: 0 0 20px 0; color: #374151; font-size: 14px; line-height: 22px;">
                Visita nuestra p&aacute;gina de ofertas para ver todas las opciones actualizadas en tiempo real.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #063971;" bgcolor="#063971">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.furgocasa.com/es/ofertas" style="height:50px;v-text-anchor:middle;width:280px;" arcsize="24%" strokecolor="#063971" fillcolor="#063971">
                      <w:anchorlock/>
                      <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Ver todas las ofertas</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="https://www.furgocasa.com/es/ofertas" style="display: inline-block; background-color: #063971; color: #ffffff; font-weight: bold; font-size: 15px; text-decoration: none; padding: 14px 36px; border-radius: 12px;">
                      Ver todas las ofertas
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #063971; padding: 30px 20px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <a href="https://www.furgocasa.com" style="text-decoration: none;">
                      <img src="https://www.furgocasa.com/images/brand/LOGO%20BLANCO.png" alt="Furgocasa" width="160" style="display: block; max-width: 160px; height: auto;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 6px;">
                    <p style="margin: 0; font-size: 14px; font-weight: bold; color: #ffffff;">Furgocasa - Alquiler de Campers</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 4px;">
                    <p style="margin: 0; font-size: 13px; color: #93b4d4;">
                      Tel: <a href="tel:+34868364161" style="color: #FBBF24; text-decoration: none;">+34 868 364 161</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 4px;">
                    <p style="margin: 0; font-size: 13px; color: #93b4d4;">
                      Email: <a href="mailto:reservas@furgocasa.com" style="color: #FBBF24; text-decoration: none;">reservas@furgocasa.com</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #93b4d4;">
                      Web: <a href="https://www.furgocasa.com" style="color: #FBBF24; text-decoration: none;">www.furgocasa.com</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="https://www.instagram.com/furgocasa/" style="text-decoration: none; color: #93b4d4; font-size: 13px;">Instagram</a>
                        </td>
                        <td style="color: #4a6a8a;">|</td>
                        <td style="padding: 0 8px;">
                          <a href="https://www.facebook.com/furgocasa/" style="text-decoration: none; color: #93b4d4; font-size: 13px;">Facebook</a>
                        </td>
                        <td style="color: #4a6a8a;">|</td>
                        <td style="padding: 0 8px;">
                          <a href="https://www.furgocasa.com" style="text-decoration: none; color: #93b4d4; font-size: 13px;">Web</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background-color: #042A54; padding: 16px 20px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #5a7d9e; line-height: 18px;">
                Has recibido este correo porque formas parte de la comunidad Furgocasa.
              </p>
              <p style="margin: 0; font-size: 11px; color: #5a7d9e; line-height: 18px;">
                Si no deseas recibir m&aacute;s comunicaciones, puedes <a href="https://www.furgocasa.com/unsubscribe" style="color: #93b4d4; text-decoration: underline;">darte de baja aqu&iacute;</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
$HIST_MARZO$
)
ON CONFLICT (slug) DO NOTHING;
