# Storytellers · Ciclo de vida del viaje (05–07) + rescate puntual (08)

> **Estado:** plantillas HTML listas (`mailing/app/05–07` + `08-storytellers-rescate-recien-lanzado.html`), tracking en BD activo (`booking_email_dispatches`), backfill histórico ejecutado. Los **crons** que disparan 05/06/07 están en **`vercel.json`** y apuntan a `/api/cron/storyteller-*` (detalle en §8). Para pruebas visuales sin tocar BD sigue existiendo `node scripts/test-storyteller-emails.mjs`.

Esta carpeta documenta los **tres correos automáticos de ciclo de vida** del programa Storytellers (salida → mitad → día después de la vuelta), más un **cuarto HTML de rescate** (`08`) que solo se envía **a mano o por script puntual**, no por cron. Son los emails que más palanca tienen sobre el programa: si no se
mandan, casi nadie sube fotos. Si se mandan bien, el cupón "3 % de
bienvenida" entra en el bolsillo del cliente y arranca el ciclo de
descuentos hasta el 15 % + regalos.

Documento equivalente para el resto del mailing: [`README.md`](./README.md).
Documento de fondo del programa de fidelización: landings públicas **`/es/storytellers`**, `/en/storytellers`, `/fr/storytellers`, `/de/storytellers` (mismo contenido traducido) y [`docs/02-desarrollo/contenido/`](../docs/02-desarrollo/contenido/). Los enlaces en estos emails siguen apuntando al **portal en español** (`/es/storytellers/subir` …): es la única implementación del flujo de subida a día de hoy.

---

## 1 · Por qué este documento es crítico

- Los emails **05–07** **deciden** si el programa Storytellers funciona o no:
  son los únicos que llaman a la acción "sube tus fotos y vídeos".
- Cualquier cambio descoordinado entre HTML, copy, deep-link `?ref=` y
  endpoint de subida puede **romper la experiencia del cliente** justo en
  el momento de mayor intención (acaba de volver del viaje).
- Hay **seguridad de fondo** (rate-limit, reCAPTCHA, HMAC, honeypot) que
  exige que el `?ref=` se mantenga como `?ref=` y no se renombre sin tocar
  también el componente del uploader.
- Hay **idempotencia en BD** (`booking_email_dispatches` con índice único
  parcial sobre `status='sent'`): si se manda dos veces el mismo email a la
  misma reserva, la segunda inserción queda registrada como duplicada y
  **no se vuelve a enviar**.

⚠️ Quien edite estos correos debe leer este documento entero antes de tocar.

---

## 2 · Mapa de los emails

### 2.1 · Ciclo automático (05–07) — crons diarios

| Archivo HTML (referencia) | Cuándo se envía (producto) | Foco del copy |
|---|---|---|
| `app/05-storytellers-dia-salida-noche.html` | Mismo día del `pickup_date`, ~20:00–21:00 (Europe/Madrid) | Bienvenida al programa + cupón **3 %** instantáneo + cómo subir en 3 pasos |
| `app/06-storytellers-mitad-viaje.html` | Punto medio del viaje (entre `pickup_date` y `dropoff_date`), mañana | Recordatorio + tabla completa de descuentos hasta el **15 %** + multiplicadores ×10/×12 |
| `app/07-storytellers-dia-despues-vuelta.html` | 1 día natural después del `dropoff_date`, mañana | "No dejes el descuento en el móvil" · 90 días para subir · regalos por puntos |

### 2.2 · Rescate post-lanzamiento (`08`) — manual / script

| Archivo HTML | Cuándo | Notas |
|---|---|---|
| `app/08-storytellers-rescate-recien-lanzado.html` | Tras el lanzamiento del programa: clientes cuyo **07** quedó marcado `sent` por backfill histórico pero siguen **dentro de la ventana de subida** (90 días desde dropoff) | **No** tiene cron. Envío idempotente vía `scripts/storyteller-send-rescue-launch.ts` (metadata `rescue_launch_sent_at`; no se añade un `email_type` nuevo — ver §6). Misma anatomía visual y placeholders `Juan` / `FC-2026-001234` que 05–07. |

### Reglas de negocio (05–07)

- **Viajes cortos (`<6 días`):** se envían **solo 05 y 07**. El 06 se marca como `skipped` con `reason: 'short_trip_no_mid_email'` para que el cron no lo reintente.
- **Viajes largos (`≥6 días`):** los 3 emails.
- **Reservas terminadas en el pasado** (`dropoff_date < CURRENT_DATE`): los 4 emails (04, 05, 06, 07) están marcados como `sent` en BD por backfill, **no se reenvían**.
- **Reservas en curso al hacer el backfill:**
  - 05 marcado como `sent` (asumimos que ya empezaron y no se les molesta retroactivamente).
  - 06 marcado como `sent` solo si ya pasó el punto medio.
  - 07 queda libre, se mandará al día siguiente del dropoff.

---

## 3 · Estructura visual común a los 3 emails

Todos siguen la misma anatomía (idéntica a las recomendaciones de
[`GUIA_MAILS.md`](./GUIA_MAILS.md)):

1. **Logo** (azul corporativo `#063971`).
2. **Hero vertical CTA** con texto quemado, drop-shadow y flecha "scroll
   down". **NO es clicable** a propósito: el hero solo invita a deslizar.
   Imágenes: `cover-cta-05.jpg`, `cover-cta-06.jpg`, `cover-cta-07.jpg`.
   Generadas dinámicamente con `sharp` + SVG en
   `scripts/download-mailing-assets.mjs`.
3. **H1 + subhead naranja** (`#ea580c`) con la promesa principal.
4. **Saludo `Hola Juan,`** — `Juan` se reemplaza por el primer nombre real.
5. **Bloque "qué te llevas"** (caja naranja claro `#fff7ed` con borde
   `#fed7aa`).
6. **CTA secundario "outline"** (botón blanco con borde naranja, posición
   variable según email):
   - `05`: tras el bloque "Esto es lo que te llevas".
   - `06`: tras el mosaico de ejemplos.
   - `07`: tras el mosaico de ejemplos.
7. **Pasos / tabla de descuentos / tabla de puntos** según email.
8. **Callout "Y si son buenas… mucho mejor"** (×10 fotos / ×12 vídeos).
9. **Mosaico** (3 imágenes) del tipo de contenido que queremos.
10. **Bloque azul claro `#f0f9ff`** "Subir es cosa de un minuto" con
    nº de reserva en `<span>` monospaced (solo en 06 y 07).
11. **CTA principal** (botón naranja sólido `#ea580c`).
12. **Link secundario** "Cómo funciona Storytellers" / "Ver mis puntos".
13. **Despedida + firma** ("El equipo de Furgocasa").
14. **Footer** con teléfono, email y web.

Todos los CTAs llevan `referrerpolicy="no-referrer"` para no filtrar el
`?ref=` por header `Referer` si el cliente navega a un link externo desde
la página de subida.

### Responsive / mobile

Cada HTML incluye un `<style>` en `<head>` con media-queries `@media only
screen and (max-width: 600px)` que hacen:

- `.hero-img { width: 100% !important; height: auto !important; }`
- `.container-600 { width: 100% !important; max-width: 100% !important; }`
- `.outer-pad { padding: 0 !important; }` (full-bleed en móvil).

Tipografías inline aumentadas +2px sobre la base, ya validado en iPhone
antiguo y nuevo.

---

## 4 · Placeholders dinámicos

En los HTML hay 2 cadenas literales que **se sustituyen** al renderizar:

| Placeholder | Sustituido por | Aparece en |
|---|---|---|
| `Juan` | Primer nombre del cliente (`bookings.customer_name.split(' ')[0]`) | Saludo `Hola Juan,` |
| `FC-2026-001234` | `bookings.booking_number` real | • Spans visibles "monoespaciados" en pasos 2 / bloque azul de 06–07.<br>• `?ref=FC-2026-001234` en TODOS los CTAs. |

⚠️ Mantener exactamente esas dos cadenas. El reemplazo es `.replace(/.../g,
real)` global, así que afecta tanto al texto visible como al query string.
Si cambias `FC-2026-001234` por otro placeholder distinto, **rompes el
deep-link `?ref=`**.

---

## 5 · Deep-link `?ref=<booking_number>` (UX y seguridad)

### El problema que resuelve

El cliente recibe el email, clica el CTA y llega a
`/es/storytellers/subir`. El paso 1 le pide **nº de reserva + email**.
Antes el cliente tenía que volver al email, copiar el número y pegarlo
(roce alto). Ahora el CTA del email lleva `?ref=FC-2026-NNNNNN` y la
página **prerrellena** automáticamente el número de reserva y **enfoca**
el campo de email. El cliente solo tiene que escribir su email y darle a
Continuar.

### Cómo funciona

1. **Email** (`mailing/app/05–07.html`): cada `<a>` que apunta a
   `/storytellers/subir` lleva `?ref=FC-2026-001234` y
   `referrerpolicy="no-referrer"`.

2. **Render del email** (`scripts/test-storyteller-emails.mjs` — y en el
   futuro el cron): `renderHtml()` reemplaza `FC-2026-001234` por el
   `booking_number` real con un regex global. Como es la misma cadena en
   texto visible y en URL, una sola llamada cubre ambos casos.

3. **Componente uploader** (`src/components/storytellers/uploader-flow.tsx`):
   en un `useEffect` lee `window.location.search`, parsea `ref`, hace
   `setBookingNumber(cleaned)` y a los 50 ms enfoca `emailInputRef.current`.
   Se usa `window.location.search` y NO `useSearchParams` para evitar la
   restricción de `<Suspense>` de Next.js App Router en build estático.

### ¿Por qué esto NO crea brecha de seguridad?

El `booking_number` **no es un secreto**. Ya viaja en:

- el cuerpo del propio email (bloque azul de 06/07, paso 2 de 05);
- el email de confirmación de reserva (`01-reserva-creada.html`);
- la factura, el contrato, las facturas.

La autenticación real para subir contenido es **`booking_number + email +
reCAPTCHA + HMAC`**, todo eso intacto. Quien tiene acceso al buzón del
cliente ya tiene los dos factores con o sin `?ref=`.

Las únicas exposiciones extra que el `?ref=` añade son menores:

| Riesgo | ¿Real? | Mitigación |
|---|---|---|
| Logs de servidor con la query | Sí, pero infra propia | Aceptable |
| `Referer` filtrando a terceros | Sí, mínimo | `referrerpolicy="no-referrer"` ✅ |
| Historial de navegador en equipo compartido | Sí | Mismo riesgo que cualquier link de email |
| Reenvío del email | El `booking_number` ya está en el cuerpo | Ninguna nueva |

E incluso si un atacante llegara a colar una subida: **los puntos y
cupones se asignan a la cuenta del cliente legítimo**, no al atacante. Y
el contenido pasa por moderación humana antes de publicarse. No hay
incentivo económico.

### Defensas en el endpoint `/api/storytellers/validate-booking`

Resumen del orden de validaciones (ver
`src/app/api/storytellers/validate-booking/route.ts`):

1. **Rate limit por IP** — `RATE_LIMIT_CONFIGS.PUBLIC_WRITE` (10
   intentos/min). Devuelve `429` con headers `X-RateLimit-*`. Implementado
   con la lib existente `src/lib/security/rate-limit.ts`.
2. **Honeypot `companyWebsite`** — silently `200 OK` si está relleno (los
   bots simples lo rellenan).
3. **Validación Zod** — formato de `bookingNumber` y `email`.
4. **reCAPTCHA Enterprise v3** (`storytellers_validate`) — bloquea bots
   sofisticados.
5. **`validateBookingForUpload(bookingNumber, email)`** — match exacto en
   `bookings`, ventana temporal `dropoff -7d / +90d`, no superar topes
   100 fotos / 20 vídeos.
6. **`createUploadSessionToken(bookingId, email)`** — genera HMAC SHA-256
   firmado con `STORYTELLERS_HMAC_SECRET` (≥32 chars), TTL 30 min, payload
   con `bookingId + email + exp + v`. La subida posterior reusa este token
   sin volver a validar.

Mensajes de error siempre genéricos ("No hemos podido validar esa
reserva") para no filtrar si existe el `booking_number`.

---

## 6 · Tracking en BD: `booking_email_dispatches`

Tabla creada por `supabase/migrations/20260508-booking-email-dispatches.sql`.
Centraliza **todos los emails transaccionales asociados a una reserva**, no
solo los Storytellers (incluye también `04-recordatorio-devolucion`).

### Esquema (resumen; fuente: migración SQL)

La definición canónica está en `supabase/migrations/20260508-booking-email-dispatches.sql`. Columnas principales:

- `booking_id`, `customer_email`, `email_type`, `status`, `sent_at`, `smtp_message_id`, `error_message`, `metadata` (JSONB).

Valores vigentes de `email_type` incluyen (lista del CHECK en migración):  
`booking_created`, `pickup_reminder`, `storyteller_pickup_night`, `storyteller_mid_trip`, `return_reminder`, `storyteller_post_trip`, `magic_link`, `upload_confirmation`.

Estados `status`: `sent`, `failed`, `bounced`, `skipped`.

### Idempotencia

Índice único parcial:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_dispatches_unique_sent
  ON booking_email_dispatches (booking_id, email_type)
  WHERE status = 'sent';
```

Solo puede haber **una fila `sent` por `(booking_id, email_type)`**. Filas `failed` / `skipped` / `bounced` no entran en ese índice, así que los reintentos siguen siendo posibles según la lógica de cada cron o script.

### Mail de rescate (`08`) sin nuevo `email_type`

El HTML `08-storytellers-rescate-recien-lanzado.html` **no** amplía el CHECK de `email_type`. El script `scripts/storyteller-send-rescue-launch.ts` marca el envío puntual en **`metadata`** (`rescue_launch_sent_at`, `rescue_launch_smtp_id`) respecto a la reserva elegible, sin romper la idempotencia del ciclo normal (`storyteller_post_trip`).

### Backfill histórico

`supabase/migrations/20260508-booking-email-dispatches-backfill-historic.sql`
ya ejecutado en producción:

- **Reservas con `dropoff_date < CURRENT_DATE`**: marca los 4 emails (04, 05, 06, 07) como `sent`.
- **Reservas largas en curso (`≥6 días`)**: 05 = `sent`. 06 = `sent` solo si pasó el punto medio. 07 libre.
- **Reservas cortas en curso (`<6 días`)**: 05 = `sent`. 06 = `skipped` (`reason: short_trip_no_mid_email`). 07 libre.
- **Reservas cortas futuras (`<6 días`)**: 06 = `skipped`.

Filtrado a `status IN ('confirmed', 'in_progress', 'completed')` y
`customer_email` válido (no nulo, con `@`).

### Política RLS

RLS activa. Solo SELECT para admins (vía `is_admin()` en JWT). Sin INSERT/UPDATE/DELETE público — todo lo escribe el backend con `service_role`.

---

## 7 · Envíos manuales (scripts CLI)

### 7.1 · Pruebas visuales (NO toca BD)

Script: `scripts/test-storyteller-emails.mjs`. Solo para validar el
diseño en gestores de correo reales.

```bash
node scripts/test-storyteller-emails.mjs \
  --to "reservas@furgocasa.com,narciso.pardo@outlook.com"
```

Manda los 3 emails (05/06/07) cogiendo una reserva aleatoria de la BD
para sacar nombre y `booking_number`. **No escribe** en
`booking_email_dispatches` — es solo prueba visual.

### 7.2 · Envío real a un cliente concreto (SÍ escribe en BD)

Script: `scripts/storyteller-send-cycle-email.ts`. Manda **uno** de los
3 emails a la reserva indicada y registra el dispatch en
`booking_email_dispatches`. Idempotente: no permite reenviar lo que ya
está enviado salvo con `--force`.

```bash
# Mandar email 06 a una reserva concreta (CC reservas@ por defecto):
tsx scripts/storyteller-send-cycle-email.ts --booking FG01410169 --type 06

# Mandar sin CC a reservas@:
tsx scripts/storyteller-send-cycle-email.ts --booking FG01410169 --type 06 --no-cc

# Dry run: enseña qué haría, sin enviar:
tsx scripts/storyteller-send-cycle-email.ts --booking FG01410169 --type 06 --dry-run

# Forzar reenvío aunque ya esté en sent (NO recomendado, casi nunca útil):
tsx scripts/storyteller-send-cycle-email.ts --booking FG01410169 --type 06 --force
```

**Flujo interno:** `test-storyteller-emails.mjs` y `storyteller-send-cycle-email.ts` comparten render con `src/lib/storytellers/emails-cycle.ts` para 05/06/07 (misma salida que los crons).

### 7.3 · Rescate post-lanzamiento (`08`) — auditoría y batch

Script: `scripts/storyteller-send-rescue-launch.ts`. Caso de uso: clientes marcados por backfill como ya enviados en `storyteller_post_trip` pero aún dentro de ventana de subida.

```bash
# Dry-run / auditoría (opcional --days N)
tsx scripts/storyteller-send-rescue-launch.ts
tsx scripts/storyteller-send-rescue-launch.ts --days 10

# Muestra solo a reservas@ (no clientes, no BD)
tsx scripts/storyteller-send-rescue-launch.ts --example

# Una reserva
tsx scripts/storyteller-send-rescue-launch.ts --booking FC26050096

# Todas las elegibles (requiere --confirm)
tsx scripts/storyteller-send-rescue-launch.ts --all --confirm --days 10
```

Detalle de idempotencia y vars de entorno en la cabecera del propio script.

---

## 8 · Cron jobs (operativa diaria)

### 8.1 · Tabla resumen

Todos en `Europe/Madrid` (Vercel Cron usa UTC; los offset que se
muestran son la traducción aproximada al horario local Madrid).

| Path | UTC | Madrid (CET / CEST) | Email | `email_type` BD |
|---|---|---|---|---|
| `/api/cron/storyteller-pickup-night` | `0 19 * * *` | 20:00 / 21:00 | **05** día de salida (noche) | `storyteller_pickup_night` |
| `/api/cron/storyteller-mid-trip` | `0 9 * * *` | 10:00 / 11:00 | **06** mitad de viaje (≥6 días) | `storyteller_mid_trip` |
| `/api/cron/storyteller-post-trip-day-after` | `30 9 * * *` | 10:30 / 11:30 | **07** día después de la vuelta | `storyteller_post_trip` |
| `/api/cron/return-reminders` | `0 18 * * *` | 19:00 / 20:00 | **04** recordatorio devolución | `return_reminder` |
| `/api/cron/storyteller-post-trip-reminder` | `0 10 * * *` | 11:00 / 12:00 | recordatorio post-viaje +7d (legacy) | `storyteller_post_trip` |
| `/api/cron/storyteller-orphan-cleanup` | `30 4 * * *` | 05:30 / 06:30 | limpieza de objetos huérfanos en Storage (subidas firmadas abortadas) | — |

### 8.2 · Reglas de selección por cron

Lib única: `src/lib/storytellers/emails-cycle.ts` → `findEligibleBookings(supabase, type, today)`.

- **05 (`pickup-night`)**: `pickup_date == hoy` (Madrid),
  `status ∈ {confirmed, in_progress, completed}`, `customer_email != null`,
  y NO existe dispatch `storyteller_pickup_night` con `status ∈ {sent, skipped, bounced}`.
- **06 (`mid-trip`)**: `pickup_date < hoy < dropoff_date`, duración ≥ 6 días,
  hoy ≥ `pickup + floor(duración/2)`. Resto de filtros igual que 05.
  Los viajes < 6 días NO reciben el 06 por diseño (no se marcan como
  `skipped` — el filtro los excluye naturalmente).
- **07 (`post-trip-day-after`)**: `dropoff_date == ayer` (Madrid). Resto igual.

### 8.3 · Idempotencia (cómo NO se duplican envíos)

Una sola línea de defensa en BD: el `UNIQUE INDEX` parcial sobre
`(booking_id, email_type) WHERE status='sent'` (ver migración
`20260508-booking-email-dispatches.sql`).

Flujo en `sendCycleEmail`:

1. **SELECT previo** — si ya hay fila `sent`/`skipped`/`bounced` para
   `(booking, email_type)`, devuelve `skipped: 'already_dispatched'` y
   sale sin SMTP.
2. **Render + envío SMTP**. Si SMTP falla → INSERT `status='failed'`
   (no entra en el unique parcial → cron del día siguiente reintenta).
3. **INSERT `status='sent'`** + `sent_at` + `smtp_message_id`. Si por
   carrera la BD lo rechaza con `23505` (unique_violation), tratamos
   como soft-OK: el email ya se envió y no marcamos doble.

### 8.4 · Coexistencia de los dos crons "post-viaje"

Existen DOS crons que escriben con el mismo `email_type='storyteller_post_trip'`:

- **`storyteller-post-trip-day-after`** (NUEVO, +1 día): es el principal.
  Manda el email 07 con tono emocional/promocional ("no dejes el
  descuento en el móvil") al día siguiente del dropoff.
- **`storyteller-post-trip-reminder`** (LEGACY, +7 días): manda otro
  HTML (definido en `src/lib/storytellers/emails.ts` →
  `buildPostTripReminderHtml`) más sobrio. Como ambos comparten
  `email_type`, el cron de +7 días casi nunca encuentra trabajo (ya
  hizo `sent` el de +1 día) y se mantiene como red de seguridad para
  reservas anteriores. Decisión: **coexisten** durante el periodo de
  transición; cuando se confirme que el 07 cubre el caso, se eliminará
  del `vercel.json`.

### 8.5 · Refactor de los crons existentes (mayo 2026)

- `return-reminders/route.ts` ahora escribe **también** en
  `booking_email_dispatches` (`email_type='return_reminder'`) además del
  flag legacy `bookings.return_reminder_sent`. El SELECT previo evita
  reenvíos si la fila ya existe (sincroniza el flag legacy si está
  desfasado).
- `storyteller-post-trip-reminder/route.ts` ahora escribe en
  `booking_email_dispatches` (`email_type='storyteller_post_trip'`)
  además del tag `[storyteller-reminder-sent]` en `admin_notes`. Si el
  cliente ya subió contenido, marca `status='skipped'` con
  `metadata.reason='already_uploaded'`.

---

## 9 · Generación de imágenes hero y banners promocionales

> ⭐ **Regla de oro (08/05/2026 · obligatoria a futuro):** cualquier
> banner, hero o cartel promocional con texto encima de una foto **se
> genera con `gpt-image-2`** vía `openai.images.edit`, no con `sharp` +
> SVG quemado a mano. Pasarle al modelo la foto base + un brief con
> texto exacto, paleta y posición es lo que produce composiciones
> integradas, naturales y editoriales. SVG queda reservado para casos
> donde necesitamos reproducibilidad pixel-perfect (por ejemplo logos,
> watermarks, marcos de blog) o cuando no hay foto base de partida.

### 9.1 Portadas hero (`cover-cta-05/06/07.jpg`) y banners promocionales (`banner-05/06/07.jpg`)

Las **6 imágenes promocionales del email** (3 hero verticales + 3
banners horizontales con texto) se generan ahora con un único script
dedicado, usando **`gpt-image-2`** (la nueva generación del modelo de
imagen de OpenAI, integrada también en blog covers, showcase landing y
creator). El modelo recibe la foto base limpia + un brief con texto,
paleta y posición, y compone el cartel completo.

```bash
# Las 6 imágenes (≈ 12 min, ~2-3 € en OpenAI con quality high)
npx tsx scripts/generate-storytellers-email-promo-images.ts

# Solo los hero verticales
npx tsx scripts/generate-storytellers-email-promo-images.ts cover

# Solo los banners horizontales del cuerpo
npx tsx scripts/generate-storytellers-email-promo-images.ts banner

# Una imagen suelta
npx tsx scripts/generate-storytellers-email-promo-images.ts cover-05
```

**Tags disponibles:** `cover-05`, `cover-06`, `cover-07`, `banner-05`,
`banner-06`, `banner-07` (y los alias `cover` / `banner` para los
trios).

Imágenes base que el modelo usa como punto de partida (no se modifican,
solo sirven de fondo / contexto):

| Tag | Out | Base img | Tamaño output |
|---|---|---|---|
| cover-05 | `cover-cta-05.jpg` | `public/images/storytellers/showcase-hero.webp` | 1024×1536 (4:5) |
| cover-06 | `cover-cta-06.jpg` | `public/images/storytellers/showcase-detail-route.webp` | 1024×1536 (4:5) |
| cover-07 | `cover-cta-07.jpg` | `public/images/storytellers/showcase-family-fun.webp` | 1024×1536 (4:5) |
| banner-05 | `banner-05-salida.jpg` | `public/images/mailing/storytellers/banner-05-salida-clean.jpg` | 1536×1024 (3:2) |
| banner-06 | `banner-06-teckel.jpg` | `public/images/mailing/storytellers/banner-06-teckel-clean.jpg` | 1536×1024 (3:2) |
| banner-07 | `banner-07-recuerdos.jpg` | `public/images/mailing/storytellers/banner-07-recuerdos-clean.jpg` | 1536×1024 (3:2) |

Especificaciones del brief que recibe el modelo (compartido por las 6 +
overrides puntuales por imagen):

- **Paleta obligatoria de marca:** naranja primario `#ea580c`,
  blanco `#ffffff`, azul corporativo `#063971` (acento sutil).
- **Tipografía:** sans-serif moderna, titulares en peso black (900) y
  mayúsculas, subtítulo bold (700), kicker uppercase con tracking amplio.
- **Foto base intacta:** prohibido recortar o redibujar a personas,
  vehículos o paisaje. Solo se permite un gradiente sutil sobre la zona
  muerta para mejorar contraste del texto.
- **Texto perfectamente escrito en español**, respetando tildes (`á é í
  ó ú ñ`), signos de apertura/cierre (`¿ ¡`) y `%`. El brief es
  literalidad exacta para evitar invenciones del modelo.
- **Posición del texto:** lado opuesto al sujeto principal de la foto
  (zona muerta como cielo, asfalto, mar, manta de fondo, etc.).
- **Pill (badge) decorativo:** redondeado completamente, naranja sólido
  `#ea580c`, texto blanco bold mayúsculas. NO simula un botón clicable
  con sombra fuerte: es un cartel publicitario, no un CTA.
- **Estilo:** editorial premium, espacio en blanco generoso, contraste
  alto. Look marca de viaje moderno (vibe nomade / outdoor voices).
  Prohibido: HDR agresivo, glow, fantasía, render 3D, ilustración,
  logos legibles, matrículas legibles, hashtags.

Salida final: JPG progresivo `mozjpeg` `quality: 86`. Pesos típicos:
175–275 KB por imagen.

⚠️ **Coste y tiempos:** cada llamada a `gpt-image-2` con `quality: high`
y `1024×1536` o `1536×1024` cuesta ~0.30 € y tarda ~2 min. **Antes de
regenerar las 6** asegúrate de que el cambio lo justifica.

⚠️ **Redes con MITM/proxy corporativo** (`Connection error` →
`UNABLE_TO_VERIFY_LEAF_SIGNATURE`): el SDK de OpenAI usa `node-fetch`
que no respeta `--use-system-ca`. Solución de sesión:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
npx tsx scripts/generate-storytellers-email-promo-images.ts
```

Solo para sesión local mientras generas; **nunca** dejar esa variable
en `.env*` ni en Vercel. La forma "limpia" de fondo es exportar el cert
de la CA corporativa y apuntar `NODE_EXTRA_CA_CERTS=ruta/ca.pem`, pero
para regeneraciones puntuales el `NODE_TLS_REJECT_UNAUTHORIZED=0` es
aceptable.

### 9.2 Mensajes literales que recibe el modelo

Cada cartel tiene su brief específico (literalidad exacta de los
títulos, sublíneas y pill). Resumen de copy:

#### Hero verticales 4:5 (no clicables, invitan a deslizar)

| Tag | Kicker | Titular dos líneas | Sublínea naranja | Pill naranja | Indicación scroll |
|---|---|---|---|---|---|
| cover-05 | `PROGRAMA STORYTELLERS` | `¿QUIERES GANAR / UN DESCUENTO?` | `3 % AL INSTANTE · HASTA 15 %` | `+ REGALOS POR TUS PUNTOS` | "Desliza hacia abajo para saber cómo" + flecha |
| cover-06 | `PROGRAMA STORYTELLERS` | `TU VIAJE VALE / DESCUENTO` | `SÚBELO YA · HASTA 15 %` | `+ REGALOS POR TUS PUNTOS` | "Desliza y empieza a sumar puntos" + flecha |
| cover-07 | `PROGRAMA STORYTELLERS` | `NO DEJES EL DESCUENTO / EN EL MÓVIL` | `90 DÍAS PARA SUBIR · HASTA 15 %` | `+ REGALOS POR TUS PUNTOS` | "Desliza y no pierdas la oportunidad" + flecha |

#### Banners horizontales 3:2 (en el cuerpo del email)

| Tag | Titular dos líneas | Sublínea blanca | Pill naranja |
|---|---|---|---|
| banner-05 | `FOTOS POR / DESCUENTO` | "Empieza con un 3 % al instante" | `HASTA 15 % + REGALOS` |
| banner-06 | `TU VIAJE VALE / DESCUENTO` | "Súbenoslo y empieza a sumar" | `+ REGALOS POR TUS PUNTOS` |
| banner-07 | `NO LAS DEJES / OLVIDADAS` | "Tienes 90 días para subirlas" | `HASTA 15 % + REGALOS` |

Diferencias intencionales hero vs banner del cuerpo:

- El hero **lleva** el kicker `PROGRAMA STORYTELLERS` y la flecha de
  scroll; el banner del cuerpo **NO** los lleva (sería ruido,
  duplicaría info y molestaría al scroll dentro del email).
- El hero usa **dos cromos de naranja** (sublínea + pill) para máxima
  agresividad comercial al primer pantallazo; el banner del cuerpo
  usa **un solo cromo de naranja** (la pill) para no saturar a mitad
  de email.

Posiciones en el HTML:

- **05:** banner tras la intro `Hola Juan,...`, antes del bloque "Esto es lo que te llevas".
- **06:** banner tras la intro, antes de la tabla de descuentos.
- **07:** banner tras el bloque "No dejes pasar la oportunidad", antes de la tabla.

Todos los banners reutilizan la clase `.hero-img` para que el media
query mobile los haga full-bleed (`width: 100% !important`) y se
sirven desde `/public/images/mailing/storytellers/` con URL absoluta
`https://www.furgocasa.com/...` (Outlook no soporta WebP, JPG forzado).

### 9.3 Versiones limpias (`banner-XX-clean.jpg`) — landing pública

Las **versiones limpias sin texto** (`banner-05-salida-clean.jpg`,
`banner-06-teckel-clean.jpg`, `banner-07-recuerdos-clean.jpg`) viven en
la misma carpeta y se usan en la landing pública `/es/storytellers`
como imágenes de los **3 bloques `<LifestyleFeature>`** (zigzag con
texto + bullets), no como banners full-bleed pelados. Cada bloque tiene
un mensaje propio que conecta con la sección cercana:

| Banner clean | Bloque en landing | Refuerza |
|---|---|---|
| `banner-05-salida-clean.jpg` | "El día 1 ya cuenta · Empieza con la primera foto del viaje" | Sección "Cómo funciona" |
| `banner-06-teckel-clean.jpg` | "Verdad de viaje · Lo que ya estás haciendo, vale puntos" | Sección "Cómo se ganan los puntos" |
| `banner-07-recuerdos-clean.jpg` | "No las dejes en el móvil · 90 días para subirlas" | Sección "Cuándo se canjean los cupones" |

Componente: `LifestyleFeature` en
`src/components/storytellers/storytellers-landing.tsx`. Imagen 4:3 mobile
/ 3:2 desktop con `rounded-3xl` y `shadow-md`, dentro de `max-w-6xl`.

### 9.4 Regenerar las 6 imágenes promocionales

Si cambia el copy de cualquier título / sublínea / pill o decides
sustituir una foto base, se regenera con el script único:

```bash
npx tsx scripts/generate-storytellers-email-promo-images.ts <tag(s)>
```

(Ver §9.1 para la lista de tags y los flags TLS si la red hace
inspección SSL.)

Editar el copy es tan fácil como cambiar el `prompt` del job
correspondiente en
[`scripts/generate-storytellers-email-promo-images.ts`](../scripts/generate-storytellers-email-promo-images.ts)
y volver a lanzar el script para los tags afectados — **no hace falta
volver a generar las 6** si solo cambia una.

Si lo que cambia es la **foto base** (la `-clean.jpg`), basta con
sustituir el archivo y volver a lanzar el script. La landing pública
seguirá usando la nueva `-clean.jpg` automáticamente, y el cartel del
email se reconstruirá encima.

---

## 10 · Checklist al editar uno de estos emails

Antes de hacer commit:

- [ ] La estructura visual sigue siendo coherente entre los emails tocados (05–07 y, si aplica, `08`).
- [ ] **Los `<a>` que llevan a `/storytellers/subir` tienen `?ref=FC-2026-001234`.**
- [ ] **Los `<a>` que llevan a `/storytellers/subir` tienen `referrerpolicy="no-referrer"`.**
- [ ] La cadena `Juan` en el saludo y la cadena `FC-2026-001234` en el cuerpo siguen siendo cadenas literales (sin caracteres especiales que rompan el `replace` global).
- [ ] El media query mobile sigue intacto (`.hero-img`, `.container-600`, `.outer-pad`).
- [ ] Las imágenes referenciadas existen en `public/images/mailing/storytellers/` con URL absoluta `https://www.furgocasa.com/...`.
- [ ] Probado en navegador y enviado a `reservas@furgocasa.com` con el script de prueba.
- [ ] Si se ha cambiado el `email_type` o el flujo: actualizar este documento + la migración SQL del CHECK constraint.

---

## 11 · Cambios recientes

| Fecha | Cambio |
|---|---|
| 08/05/2026 | **Creación del programa Storytellers en email.** Tres HTML de ciclo de vida (05, 06, 07), tabla `booking_email_dispatches` con índice único parcial, backfill histórico, deep-link `?ref=` con prerrelleno automático en `/es/storytellers/subir`, rate-limit `PUBLIC_WRITE` en `validate-booking`, `referrerpolicy="no-referrer"` en todos los CTAs. *(Los crons se activaron el 09/05; ver fila siguiente.)* |
| 08/05/2026 (tarde) | **Banners narrativa promocionales + integración en landing.** Banners del cuerpo del email (`banner-05/06/07.jpg`) ahora llevan texto promocional quemado (título + subtítulo + pill naranja) generado con `sharp` + SVG sobre las versiones limpias `banner-XX-clean.jpg`. Mantienen aspect ratio 3:2 (1200×800) para no engordar el email. La landing pública `/es/storytellers` deja de usar banners full-bleed pelados y los integra en 3 bloques `<LifestyleFeature>` (zigzag imagen + texto + bullets) usando las versiones `-clean.jpg`. |
| 08/05/2026 (noche) | **Migración de SVG quemado a `gpt-image-2` para las 6 imágenes promocionales del email.** Nuevo script único `scripts/generate-storytellers-email-promo-images.ts` que usa `openai.images.edit` con `gpt-image-2` y la imagen `-clean.jpg` como base, dejando que el modelo componga el cartel completo (texto, jerarquía, pill, drop-shadow, gradient sutil) a partir de un brief con literalidad exacta + paleta `#ea580c / #ffffff / #063971` + posición. Resultado claramente más editorial e integrado que el SVG previo. **Regla de oro a futuro:** banners/hero/carteles con texto se hacen siempre con `gpt-image-2`, no con SVG quemado. SVG queda para casos que necesitan reproducibilidad pixel-perfect. |
| 09/05/2026 | **Crons Storytellers operativos + lib unificada `emails-cycle.ts` + cross-sell en email 04.** Tres crons nuevos en `vercel.json` (`storyteller-pickup-night`, `storyteller-mid-trip`, `storyteller-post-trip-day-after`), todos sobre la misma lib `src/lib/storytellers/emails-cycle.ts` (render + envío + escritura idempotente en `booking_email_dispatches`). Refactor de los crons existentes (`return-reminders` y `storyteller-post-trip-reminder`) para escribir también en la tabla unificada manteniendo los flags legacy como compat. El cron de +7d se mantiene como red de seguridad: comparte `email_type='storyteller_post_trip'` con el de +1d, así que casi nunca encuentra trabajo. Nuevo script CLI `scripts/storyteller-send-cycle-email.ts` para envíos manuales que SÍ escriben en BD. Email **04 recordatorio devolución** ahora incluye un párrafo cross-sell de Storytellers con CTA naranja al final, tanto en `src/lib/email/templates.ts` (runtime) como en el espejo `mailing/app/04-recordatorio-devolucion.html` (preview). |
| 09/05/2026 (PM) | **Subida directa firmada** (`upload-init` / `upload-confirm`), MIME efectivo iPhone/Safari, runbook `STORYTELLERS-STORAGE-TROUBLESHOOTING.md`. Correo de confirmación de subida con **`await`** en `upload-confirm`. Panel admin: preview HEVC/Chromium + **descargar original** en foto y vídeo. Cron **`storyteller-orphan-cleanup`**. Mail rescate **`08-storytellers-rescate-recien-lanzado.html`** + script **`storyteller-send-rescue-launch.ts`** (idempotencia `metadata.rescue_launch_*` sin nuevo `email_type`). |

---

## 12 · Documentos relacionados

- [`mailing/README.md`](./README.md) — visión general de todo el mailing.
- [`mailing/GUIA_MAILS.md`](./GUIA_MAILS.md) — guía de buenas prácticas HTML.
- [`mailing/README-SISTEMA-MARKETING.md`](./README-SISTEMA-MARKETING.md) — sistema de campañas de marketing.
- [`docs/04-referencia/emails/SISTEMA-EMAILS.md`](../docs/04-referencia/emails/SISTEMA-EMAILS.md) — sistema de emails transaccionales.
- [`supabase/migrations/20260508-booking-email-dispatches.sql`](../supabase/migrations/20260508-booking-email-dispatches.sql) — esquema de tracking.
- [`supabase/migrations/20260508-booking-email-dispatches-backfill-historic.sql`](../supabase/migrations/20260508-booking-email-dispatches-backfill-historic.sql) — backfill histórico.
- [`src/lib/storytellers/emails-cycle.ts`](../src/lib/storytellers/emails-cycle.ts) — **lib unificada del ciclo 05/06/07** (render, envío, idempotencia, selección de elegibles).
- [`src/app/api/cron/storyteller-pickup-night/route.ts`](../src/app/api/cron/storyteller-pickup-night/route.ts) — cron diario 20:00–21:00 Madrid → email 05.
- [`src/app/api/cron/storyteller-mid-trip/route.ts`](../src/app/api/cron/storyteller-mid-trip/route.ts) — cron diario 10:00–11:00 Madrid → email 06 (solo viajes ≥6 días).
- [`src/app/api/cron/storyteller-post-trip-day-after/route.ts`](../src/app/api/cron/storyteller-post-trip-day-after/route.ts) — cron diario 10:30–11:30 Madrid → email 07.
- [`src/app/api/cron/return-reminders/route.ts`](../src/app/api/cron/return-reminders/route.ts) — cron 04 recordatorio devolución (refactor para escribir en `booking_email_dispatches`).
- [`src/app/api/cron/storyteller-post-trip-reminder/route.ts`](../src/app/api/cron/storyteller-post-trip-reminder/route.ts) — cron legacy +7 días (refactor para escribir en `booking_email_dispatches`).
- [`src/app/api/cron/storyteller-orphan-cleanup/route.ts`](../src/app/api/cron/storyteller-orphan-cleanup/route.ts) — limpieza diaria de objetos huérfanos en Storage.
- [`scripts/test-storyteller-emails.mjs`](../scripts/test-storyteller-emails.mjs) — script de **prueba visual** (NO escribe en BD).
- [`scripts/storyteller-send-cycle-email.ts`](../scripts/storyteller-send-cycle-email.ts) — script CLI de **envío manual idempotente** a una reserva concreta (sí escribe en BD).
- [`scripts/storyteller-send-rescue-launch.ts`](../scripts/storyteller-send-rescue-launch.ts) — envío puntual del HTML **08** (rescate post-lanzamiento) con auditoría `--days`, `--example`, `--booking`, `--all --confirm`.
- [`scripts/generate-storytellers-email-promo-images.ts`](../scripts/generate-storytellers-email-promo-images.ts) — generador de las 6 imágenes promocionales del email con `gpt-image-2` (3 hero verticales + 3 banners horizontales con texto).
- [`scripts/generate-storytellers-showcase-images.ts`](../scripts/generate-storytellers-showcase-images.ts) — generador de las imágenes lifestyle / mosaico de la landing pública (versiones limpias sin texto).
- [`scripts/download-mailing-assets.mjs`](../scripts/download-mailing-assets.mjs) — utilidades varias del mailing (descargas, conversiones).
