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
├── 20260419-mailing-system.sql                       · mailing_campaigns + mailing_recipients + vista
├── 20260419-seed-historical-campaigns.sql            · Seed de campañas históricas (archivadas)
├── 20260420-mailing-tick-lock.sql                    · Columna mailing_campaigns.tick_lock_at + índice parcial (lock del cron)
├── 20260421-mailing-tick-lock-rpc.sql                · Funciones SQL mailing_claim_campaign_tick / mailing_release_campaign_tick (SECURITY DEFINER)
└── 20260422-marketing-backfill-contact-names.sql     · Rellena marketing_contacts.name desde customers/bookings + sincroniza mailing_recipients pending

src/lib/mailing/
├── transport.ts     · SMTP + detección de rate-limit
├── render.ts        · Placeholders {{NOMBRE}}, {{CIUDAD}}, {{UNSUBSCRIBE_URL}} + firstName()
├── audience.ts      · populateRecipients() — filtra y dedupe
├── send.ts          · sendOneRecipient() + sendTestEmail() con doble check opt-out
├── auth.ts          · requireMailingAdmin() → (user, sb service_role)
├── context.ts       · buildMailingContext() — grounding IA con ofertas/posts/flota reales
├── footer.ts        · Footer oficial reutilizable (logo blanco, redes, unsubscribe, dirección)
└── outlook-safe.ts  · Saneado HTML Outlook (quita gradientes, añade bgcolor, arregla vehículos)

src/app/api/admin/mailing/
├── campaigns/route.ts                        · GET (listado) + POST (crear borrador)
├── campaigns/[slug]/route.ts                 · GET + PATCH + DELETE
├── campaigns/[slug]/generate/route.ts        · POST SSE con OpenAI (gpt-4.1 default · gpt-4o · gpt-5.4)
├── campaigns/[slug]/preview/route.ts         · GET html renderizado para iframe
├── campaigns/[slug]/send-test/route.ts       · POST enviar prueba (no toca recipients)
├── campaigns/[slug]/populate-recipients/...  · POST cargar destinatarios (audience)
├── campaigns/[slug]/start / pause / resume / retry-failed / archive
├── campaigns/[slug]/tick-now/route.ts        · POST "Forzar tick ahora" (diagnóstico)
├── campaigns/[slug]/recipients/route.ts      · GET paginado por status
├── references/route.ts                       · GET campañas pasadas (selector IA)
├── contacts-search/route.ts                  · GET búsqueda para preview/test
└── suppressions/route.ts                     · GET/POST/DELETE panel de bajas

src/app/api/cron/mailing-tick/route.ts        · Tick cada minuto (vercel.json) — exporta runTickOnce()

src/app/api/unsubscribe/route.ts              · Público, 3 modos + bilingüe ES/EN

src/app/administrator/(protected)/mails/
├── page.tsx + CampaignsClient.tsx            · Listado
├── nueva/page.tsx                            · Crear borrador
├── [slug]/page.tsx + CampaignDetailClient    · Detalle con 4 pestañas (Contenido/Preview/Audiencia/Envío)
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
SMTP_STRICT_TLS=false                           # 'true' si la red tiene proxy AV
OPENAI_MAILING_MODEL=gpt-4.1                    # OPCIONAL — default del selector de IA
```

Para generar un `CRON_SECRET` seguro (PowerShell):

```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

O (bash/node):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

⚠️ **Configúralo también en Vercel → Settings → Environment Variables → Production**. Tras añadir o cambiar la variable hay que **redeploy** (las envs no se inyectan en caliente al deployment existente).

Vercel Cron ya envía automáticamente `Authorization: Bearer $CRON_SECRET` a los crons registrados en `vercel.json`. Si el cron lo disparas desde un servicio externo (ver troubleshooting abajo), configura ese header manualmente.

## Flujo admin de una campaña

1. **`/administrator/mails/nueva`** · crear borrador (asunto + slug + descripción auto-generada por la IA).
2. **Pestaña Contenido** · **elegir modelo de IA** (`gpt-4.1` · `gpt-4o` · `gpt-5.4`) + escribir briefing + marcar hasta 2 referencias previas + "Generar". Stream SSE en consola ASCII. También se puede pegar HTML manual. La IA está "grounded" con `CONTEXTO_BD` (ofertas/posts/flota reales, precios europeos pre-calculados) y aplica reglas estrictas de Outlook-safe, clicabilidad máxima y densidad visual controlada.
3. **Pestaña Preview** · elegir contacto real, preview en iframe con datos reales, enviar correo de prueba.
4. **Pestaña Audiencia** · elegir `all` o filtrar por `source` (customer/newsletter/manual/lead/import), cargar destinatarios. Opcional: `test_emails` para envíos piloto.
5. **Pestaña Envío** · arrancar. El cron cada minuto enviará hasta `batch_size_per_tick` (default 3) correos respetando `max_per_hour` (default 150). Controles: Lanzar / Pausar / Reanudar / Reintentar fallidos / Archivar. Incluye **botón "Forzar tick ahora"** que invoca `runTickOnce()` y muestra la respuesta cruda del servidor (ver troubleshooting).

### Autorefresh del progreso

La pestaña Envío recarga la tabla de destinatarios **cada 15 s** mientras la campaña esté en `status='sending'`. El resumen global (barra de progreso, métricas) se refresca al pulsar "Refrescar" o al cambiar de pestaña. Si la barra no avanza, antes de asumir que el cron está roto, lee la nota del último tick en la propia cabecera de la campaña.

### Nombres (`{{NOMBRE}}`) y backfill

El envío masivo usa `marketing_contacts.name` (copiado a `mailing_recipients.nombre` al cargar audiencia). Si muchos contactos quedaron sin `name` pero en `customers` o en la última `bookings` por mismo email sí hay nombre, ejecuta en Supabase la migración **`20260422-marketing-backfill-contact-names.sql`**: rellena `name` (y `city` si faltaba), enlaza `customer_id` cuando estaba NULL, y alinea destinatarios `pending` ya insertados para no tener que volver a cargar audiencia. Es idempotente (solo toca `name` vacío en contactos).

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

## Lock atómico del cron (anti-duplicados)

Vercel Cron dispara `/api/cron/mailing-tick` cada minuto. Si una campaña grande tarda >60 s, dos ticks consecutivos podrían procesar la misma fila `pending` → correo duplicado. Para evitarlo:

1. La migración **`20260420-mailing-tick-lock.sql`** añade la columna `mailing_campaigns.tick_lock_at` (+ índice parcial).
2. La migración **`20260421-mailing-tick-lock-rpc.sql`** crea las funciones `mailing_claim_campaign_tick(uuid)` y `mailing_release_campaign_tick(uuid)` (`SECURITY DEFINER`, `GRANT EXECUTE` solo a `service_role`).
3. El cron las invoca con `sb.rpc('mailing_claim_campaign_tick', …)`. Solo si devuelve `true` procesa la campaña; al acabar llama a `mailing_release_campaign_tick`. Watchdog: si el lock lleva más de 5 min sin liberarse, el siguiente tick lo recupera.

**¿Por qué via RPC y no un UPDATE REST?** En producción vimos un caso donde PostgREST devolvía `column mailing_campaigns.tick_lock_at does not exist` al hacer `UPDATE .or('tick_lock_at.is.null,...')` **aunque la columna sí existía** en `information_schema` y el SQL Editor la veía. Caché / capa REST. Las funciones SQL ejecutan en el motor directamente y el problema desaparece.

## Troubleshooting del envío

Herramienta principal: pestaña Envío → **"Forzar tick ahora"** (botón ámbar). Llama al endpoint admin `POST /api/admin/mailing/campaigns/[slug]/tick-now` que ejecuta el mismo `runTickOnce()` del cron y devuelve la respuesta cruda del servidor, incluyendo `stateBefore` y `stateAfter` de la campaña. Con esa respuesta se diagnostica cualquier problema en segundos.

### Tabla rápida de síntomas

| Síntoma en la respuesta cruda | Causa | Solución |
|---|---|---|
| `error: "Faltan SMTP_HOST / SMTP_USER / SMTP_PASSWORD"` | SMTP no configurado en Vercel Production | Añadir variables en Vercel → Settings → Env Vars → Production + **redeploy** |
| `note: "error tomando lock: column ... tick_lock_at does not exist"` | Falta migración `20260420` o PostgREST desfasado | Aplicar `20260420` + `20260421` en Supabase y `NOTIFY pgrst, 'reload schema';` |
| `note: "error tomando lock: function mailing_claim_campaign_tick does not exist"` | Falta migración `20260421` | Ejecutar el SQL de `20260421-mailing-tick-lock-rpc.sql` en Supabase |
| `active: 0, results: []` | La campaña no está en `status='sending'` o `is_paused=true` | Pulsar **Lanzar** o **Reanudar** en el panel |
| `note: "cupo horario lleno: X/Y"` | Ya consumido el tope `max_per_hour` en los últimos 60 min | Esperar o subir `max_per_hour` con "Guardar config" |
| `note: "sin html_content"` | La campaña se lanzó sin generar el HTML | Ir a Contenido → Generar con IA / pegar HTML |
| `note: "rate-limit SMTP: ..."` | OVH u otro proveedor cortó el envío | Esperar ≥60 min y Reanudar |
| `note: "skip: tick previo aún en curso (lock activo)"` | Un tick anterior tardó >60 s y sigue corriendo, o murió sin liberar el lock | Esperar ~1 min (watchdog 5 min recupera locks viejos). Si persiste, `UPDATE mailing_campaigns SET tick_lock_at=NULL WHERE id='...';` |
| El envío no avanza pese a estar `sending` y `is_paused=false` | El cron de Vercel no se dispara | Ver siguiente sección |

### Verificación SQL rápida

```sql
-- ¿Están las migraciones del lock aplicadas?
SELECT column_name FROM information_schema.columns
WHERE table_schema='public' AND table_name='mailing_campaigns' AND column_name='tick_lock_at';

SELECT proname FROM pg_proc
WHERE proname IN ('mailing_claim_campaign_tick','mailing_release_campaign_tick');

-- Estado actual de las campañas activas
SELECT slug, status, is_paused, tick_lock_at, last_tick_at, last_tick_note,
       sent_count, failed_count, skipped_count, total_recipients
FROM mailing_campaigns ORDER BY created_at DESC LIMIT 5;

-- ¿Se han enviado correos en los últimos 5 min? (señal de vida del cron)
SELECT COUNT(*) FROM mailing_recipients
WHERE status='sent' AND sent_at > now() - interval '5 minutes';
```

### Vercel Cron: ojo al plan

- **Hobby**: Vercel **ignora el `* * * * *`** y ejecuta el cron como mucho 1 vez al día. Síntoma: campaña en `sending`, 0 enviados, horas sin avanzar.
- **Pro**: ejecución por minuto real.

Verificar si el cron corre: Vercel → proyecto → Observability / Logs → filtro `mailing-tick` en la última hora. Si no hay invocaciones, no corre.

Alternativas si estás en Hobby:

1. **Pasar a Pro** (~20 $/mes).
2. **Cron externo gratuito**: [cron-job.org](https://cron-job.org) o [EasyCron](https://www.easycron.com) con:
   - URL: `https://www.furgocasa.com/api/cron/mailing-tick`
   - Método: `GET` o `POST`
   - Header: `Authorization: Bearer <CRON_SECRET>`
   - Cada 1 min · timeout 60 s
3. **Empujar manualmente** con "Forzar tick ahora" (aceptable para volúmenes puntuales).

### Timings realistas

Con `max_per_hour=150` y `batch_size_per_tick=3` → ritmo efectivo ~150 correos/h (el tope horario manda sobre el batch). Estimaciones:

- 760 destinatarios → ~5 h 4 min
- 1.500 destinatarios → ~10 h
- 2.000 destinatarios → ~13 h 20 min

Subir ritmo: elevar `max_per_hour` hasta lo que aguante tu SMTP (OVH: NO pasar de 200/h por buzón o cortará) y `batch_size_per_tick` a 10–20 para aprovechar cada tick. Nunca >200/h en un solo buzón; si necesitas más volumen, habilita un segundo buzón.

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
