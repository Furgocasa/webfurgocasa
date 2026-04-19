# Sistema de mailing marketing de Furgocasa

> **Ojo:** este documento describe el sistema de **mailings de marketing** (campañas
> masivas: newsletters, promociones, cross-selling). Los emails **transaccionales**
> (reserva creada, pagos, recordatorio de devolución) están descritos en
> `mailing/README.md` y su código vive en `src/lib/email/`.

Los dos sistemas son **independientes**:

| Dimensión         | Transaccional (`src/lib/email/`)           | Marketing (`src/lib/mailing/`)                                    |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| Cuándo se dispara | Evento del negocio (reserva, pago)         | El admin lo arranca desde `/administrator/mails`                  |
| Destinatarios     | 1 a 1 (cliente concreto)                   | Masivo (tabla `marketing_contacts`), con envío gradual            |
| Contenido         | Plantilla TS en `templates.ts`             | HTML guardado en BD (`mailing_campaigns.html_content`)            |
| Opt-out           | No aplica (son operativos)                 | Obligatorio: `{{UNSUBSCRIBE_URL}}` + cabeceras List-Unsubscribe   |
| Motor             | Node directamente                          | Cron `/api/cron/mailing-tick` cada minuto, con rate-limit y pausa |

## Estructura de archivos

```
supabase/migrations/
├── 20260419-marketing-contacts-and-suppressions.sql  · marketing_contacts + email_suppressions
└── 20260419-mailing-system.sql                        · mailing_campaigns + mailing_recipients + vista

src/lib/mailing/
├── transport.ts   · SMTP + detección de rate-limit
├── render.ts      · Placeholders {{NOMBRE}}, {{CIUDAD}}, {{UNSUBSCRIBE_URL}}
├── audience.ts    · populateRecipients() — filtra y dedupe
├── send.ts        · sendOneRecipient() + sendTestEmail() con doble check opt-out
└── auth.ts        · requireMailingAdmin() → (user, sb service_role)

src/app/api/admin/mailing/
├── campaigns/route.ts                        · GET (listado) + POST (crear borrador)
├── campaigns/[slug]/route.ts                 · GET + PATCH + DELETE
├── campaigns/[slug]/generate/route.ts        · POST SSE con OpenAI gpt-4o-mini
├── campaigns/[slug]/preview/route.ts         · GET html renderizado para iframe
├── campaigns/[slug]/send-test/route.ts       · POST enviar prueba (no toca recipients)
├── campaigns/[slug]/populate-recipients/...  · POST cargar destinatarios (audience)
├── campaigns/[slug]/start / pause / resume / retry-failed / archive
├── campaigns/[slug]/recipients/route.ts      · GET paginado por status
├── references/route.ts                       · GET campañas pasadas (selector IA)
├── contacts-search/route.ts                  · GET búsqueda para preview/test
└── suppressions/route.ts                     · GET/POST/DELETE panel de bajas

src/app/api/cron/mailing-tick/route.ts        · Tick cada minuto (vercel.json)

src/app/api/unsubscribe/route.ts              · Público, 3 modos + bilingüe ES/EN

src/app/administrator/(protected)/mails/
├── page.tsx + CampaignsClient.tsx            · Listado
├── nueva/page.tsx                            · Crear borrador
├── [slug]/page.tsx + CampaignDetailClient    · Detalle con 4 pestañas
└── bajas/page.tsx + SuppressionsClient       · Panel de bajas
```

## Variables de entorno necesarias

```env
# Ya existentes
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=reservas@furgocasa.com
SMTP_PASSWORD=...
SMTP_FROM_EMAIL=reservas@furgocasa.com
SMTP_FROM_NAME=Furgocasa

NEXT_PUBLIC_URL=https://www.furgocasa.com
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=sk-...

# A añadir para mailing
CRON_SECRET=genera_con_openssl_rand_hex_32      # OPCIONAL pero muy recomendado
SMTP_STRICT_TLS=false                            # 'true' si la red tiene proxy AV
```

Para generar un `CRON_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Y después configúralo **también** en Vercel → Project Settings → Cron Jobs →
elige el cron `/api/cron/mailing-tick` y pega el secreto como header
`Authorization: Bearer <secret>`.

## Flujo admin de una campaña

1. **`/administrator/mails/nueva`** · crear borrador (asunto + slug + descripción).
2. **Pestaña Contenido** · generar HTML con IA (briefing + hasta 2 referencias) o
   pegarlo manualmente. Guardar.
3. **Pestaña Preview y test** · elegir un contacto real, abrir preview en iframe,
   enviar correo de prueba a tu inbox.
4. **Pestaña Audiencia** · elegir `all` o filtrar por `source`
   (customer/newsletter/manual/lead/import), cargar destinatarios. Opcional:
   test_emails para envíos de prueba en masa pequeña.
5. **Pestaña Envío** · arrancar. El cron cada minuto enviará hasta
   `batch_size_per_tick` (default 3) correos respetando `max_per_hour`
   (default 150). Pausar/reanudar en cualquier momento.

## Cómo funciona el opt-out

- Cada `marketing_contacts` tiene un `marketing_opt_out_token` (UUID único).
- Los HTML incluyen `{{UNSUBSCRIBE_URL}}` que se renderiza a
  `https://www.furgocasa.com/api/unsubscribe?t=<token>`.
- Al hacer clic (o al usar "Darse de baja" nativo de Gmail, gracias a
  `List-Unsubscribe-Post: One-Click`), el contacto se marca
  `marketing_opt_out_at=NOW()` y se añade también a `email_suppressions`.
- El formulario público `/api/unsubscribe` (sin token) acepta email directo
  (para cuando el usuario ha perdido el link). Respuesta GDPR-safe: NUNCA
  confirma si el email existía o no.

## Rate-limit y pausas

- El cron cuenta los `sent` de la última hora directamente en BD (no en memoria,
  porque Vercel no persiste). Si supera `max_per_hour`, no envía más hasta que
  pase tiempo.
- Si nodemailer devuelve un error que huele a rate-limit (421, 451 4.7, "too
  many", "quota", etc.), la campaña se **pausa automáticamente**
  (`is_paused=true`) y se anota el error en `last_tick_note`. El admin decide
  cuándo reanudar desde el panel.
- Los destinatarios que fallan por rate-limit NO se marcan como `failed`;
  se quedan en `pending` y se reintentan cuando se reanude.

## Checklist de seguridad

- ✅ Todas las tablas de mailing tienen `ENABLE ROW LEVEL SECURITY` sin políticas
  → denied-by-default para `anon` y `authenticated`.
- ✅ Todo endpoint admin pasa por `requireMailingAdmin()` que valida contra
  `admins(user_id, is_active)`.
- ✅ El cron valida `CRON_SECRET` si está configurado.
- ✅ El envío hace **doble check** de opt-out justo antes de cada `sendMail`:
  (a) flag en el contacto, (b) email en `email_suppressions`.
- ✅ El endpoint `/api/unsubscribe` nunca filtra información de si un email existe.

## Imágenes para los correos

Van en `public/images/mailing/` con URL absoluta
`https://www.furgocasa.com/images/mailing/...`. Ver
`public/images/mailing/README.md` para detalles y listado esperado.
