# Storytellers · 3 emails de ciclo de vida del viaje

> **Estado:** plantillas HTML listas (`mailing/app/05–07`), tracking en BD ya
> activo (`booking_email_dispatches`), backfill histórico ejecutado. **Falta**
> implementar los 3 cron jobs que las disparan automáticamente. Hasta ese
> momento se pueden mandar manualmente con
> `node scripts/test-storyteller-emails.mjs`.

Esta carpeta contiene los **tres correos de ciclo de vida del programa
Storytellers**, que acompañan al cliente desde el día de salida hasta la
vuelta. Son los emails que más palanca tienen sobre el programa: si no se
mandan, casi nadie sube fotos. Si se mandan bien, el cupón "3 % de
bienvenida" entra en el bolsillo del cliente y arranca el ciclo de
descuentos hasta el 15 % + regalos.

Documento equivalente para el resto del mailing: [`README.md`](./README.md).
Documento de fondo del programa de fidelización: ver landing pública
`/es/storytellers` y [`docs/02-desarrollo/contenido/`](../docs/02-desarrollo/contenido/).

---

## 1 · Por qué este documento es crítico

- Los 3 emails **deciden** si el programa Storytellers funciona o no:
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

## 2 · Mapa de los 3 emails

| Archivo HTML (referencia) | Cuándo se envía (producto) | Foco del copy |
|---|---|---|
| `app/05-storytellers-dia-salida-noche.html` | Mismo día del `pickup_date`, ~20:00–21:00 (Europe/Madrid) | Bienvenida al programa + cupón **3 %** instantáneo + cómo subir en 3 pasos |
| `app/06-storytellers-mitad-viaje.html` | Punto medio del viaje (entre `pickup_date` y `dropoff_date`), mañana | Recordatorio + tabla completa de descuentos hasta el **15 %** + multiplicadores ×10/×12 |
| `app/07-storytellers-dia-despues-vuelta.html` | 1 día natural después del `dropoff_date`, mañana | "No dejes el descuento en el móvil" · 90 días para subir · regalos por puntos |

### Reglas de negocio

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

### Esquema

```sql
booking_email_dispatches (
  id              uuid PRIMARY KEY,
  booking_id      uuid REFERENCES bookings(id) ON DELETE CASCADE,
  customer_email  text NOT NULL,
  email_type      text NOT NULL CHECK (email_type IN (
                    '01_reserva_creada',
                    '02_primer_pago_confirmado',
                    '03_segundo_pago_confirmado',
                    '04_recordatorio_devolucion',
                    '05_storyteller_dia_salida',
                    '06_storyteller_mitad_viaje',
                    '07_storyteller_dia_despues_vuelta',
                    'storyteller_post_trip_reminder'
                  )),
  status          text NOT NULL DEFAULT 'sent' CHECK (status IN (
                    'sent', 'failed', 'skipped', 'queued'
                  )),
  sent_at         timestamptz,
  smtp_message_id text,
  error_message   text,
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)
```

### Idempotencia

Índice único parcial:

```sql
CREATE UNIQUE INDEX idx_email_dispatches_unique_sent
  ON booking_email_dispatches (booking_id, email_type)
  WHERE status = 'sent';
```

Esto significa: solo puede haber **una fila `sent` por `(booking_id,
email_type)`**. Filas `failed` / `queued` / `skipped` no cuentan, así que
los reintentos siguen siendo posibles. Inserciones idempotentes con
`INSERT ... ON CONFLICT DO NOTHING`.

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

## 7 · Cómo enviar pruebas (manual, hasta que estén los crons)

Script: `scripts/test-storyteller-emails.mjs`.

### Uso

```bash
node scripts/test-storyteller-emails.mjs --to "reservas@furgocasa.com,narciso.pardo@outlook.com,otro@dominio.com"
```

### Qué hace

1. Carga `.env.local` (con `dotenv.config({ path, override: false })`,
   sin depender del `.env` por defecto).
2. Conecta a Supabase con la `SERVICE_ROLE_KEY`.
3. Coge una reserva aleatoria con datos válidos.
4. Para cada uno de los 3 HTML (`05`, `06`, `07`):
   - Lee el archivo.
   - Reemplaza `Juan` → primer nombre del cliente.
   - Reemplaza `FC-2026-001234` → `booking_number` real (también el
     `?ref=` queda actualizado por la misma sustitución).
   - Envía el email vía SMTP con `nodemailer`.
5. Acepta varios destinatarios separados por coma vía `--to`.

⚠️ **Este script NO escribe en `booking_email_dispatches`.** Es solo para
pruebas visuales en gestores de correo reales. Los crons que se
implementen sí deben escribir cada envío en la tabla con el `email_type`
correcto.

---

## 8 · Pendientes (cron jobs)

Los 3 crons que faltan, todos en `Europe/Madrid`:

| Cron (path sugerido) | Frecuencia | Filtro principal | `email_type` a registrar |
|---|---|---|---|
| `/api/cron/storyteller-pickup-night` | Diario, 20:30 | `pickup_date = CURRENT_DATE` y trip ≥1 día y no exista fila `sent` para `05` | `05_storyteller_dia_salida` |
| `/api/cron/storyteller-mid-trip` | Diario, 09:00 | `pickup_date < CURRENT_DATE < dropoff_date`, `(dropoff - pickup) ≥ 6` días, hoy ≥ punto medio, no exista fila `sent` para `06` | `06_storyteller_mitad_viaje` |
| `/api/cron/storyteller-post-trip-day-after` | Diario, 09:00 | `dropoff_date = CURRENT_DATE - 1` y no exista fila `sent` para `07` | `07_storyteller_dia_despues_vuelta` |

Todos deben:

1. Filtrar por `status IN ('confirmed', 'in_progress', 'completed')` y
   `customer_email` válido.
2. Usar `INSERT ... ON CONFLICT DO NOTHING` en
   `booking_email_dispatches` con `status='queued'` antes de intentar
   enviar (lock atómico anti-duplicados).
3. Tras enviar OK: `UPDATE ... SET status='sent', sent_at=now(),
   smtp_message_id=...`.
4. Si falla: `UPDATE ... SET status='failed', error_message=...`. Las
   filas `failed` permiten reintento por el cron del día siguiente.
5. Renderizar el HTML correspondiente con los reemplazos de
   `Juan` / `FC-2026-001234` (preferiblemente extraer la lógica del script
   de prueba a `src/lib/storytellers/emails.ts` cuando se haga).
6. Respetar la regla de viaje corto: el `mid-trip` cron debe insertar fila
   `skipped` (`reason: 'short_trip_no_mid_email'`) si `<6 días`.

Existente y a refactorizar:

- `src/app/api/cron/return-reminders/route.ts` actualmente usa
  `bookings.return_reminder_sent` como flag. Debe migrarse a escribir en
  `booking_email_dispatches` con `email_type='04_recordatorio_devolucion'`.
- `src/app/api/cron/storyteller-post-trip-reminder/route.ts` actualmente
  manda el reminder a +7 días con `admin_notes` como flag. Decisión
  pendiente: ¿se sustituye por el nuevo `storyteller-post-trip-day-after`
  (a +1 día) o se mantienen los dos?

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

- [ ] La estructura visual sigue siendo coherente entre los 3 emails.
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
| 08/05/2026 | **Creación del programa Storytellers en email.** Tres HTML de ciclo de vida (05, 06, 07), tabla `booking_email_dispatches` con índice único parcial, backfill histórico, deep-link `?ref=` con prerrelleno automático en `/es/storytellers/subir`, rate-limit `PUBLIC_WRITE` en `validate-booking`, `referrerpolicy="no-referrer"` en todos los CTAs. Cron jobs **pendientes**. |
| 08/05/2026 (tarde) | **Banners narrativa promocionales + integración en landing.** Banners del cuerpo del email (`banner-05/06/07.jpg`) ahora llevan texto promocional quemado (título + subtítulo + pill naranja) generado con `sharp` + SVG sobre las versiones limpias `banner-XX-clean.jpg`. Mantienen aspect ratio 3:2 (1200×800) para no engordar el email. La landing pública `/es/storytellers` deja de usar banners full-bleed pelados y los integra en 3 bloques `<LifestyleFeature>` (zigzag imagen + texto + bullets) usando las versiones `-clean.jpg`. |
| 08/05/2026 (noche) | **Migración de SVG quemado a `gpt-image-2` para las 6 imágenes promocionales del email.** Nuevo script único `scripts/generate-storytellers-email-promo-images.ts` que usa `openai.images.edit` con `gpt-image-2` y la imagen `-clean.jpg` como base, dejando que el modelo componga el cartel completo (texto, jerarquía, pill, drop-shadow, gradient sutil) a partir de un brief con literalidad exacta + paleta `#ea580c / #ffffff / #063971` + posición. Resultado claramente más editorial e integrado que el SVG previo. **Regla de oro a futuro:** banners/hero/carteles con texto se hacen siempre con `gpt-image-2`, no con SVG quemado. SVG queda para casos que necesitan reproducibilidad pixel-perfect. |

---

## 12 · Documentos relacionados

- [`mailing/README.md`](./README.md) — visión general de todo el mailing.
- [`mailing/GUIA_MAILS.md`](./GUIA_MAILS.md) — guía de buenas prácticas HTML.
- [`mailing/README-SISTEMA-MARKETING.md`](./README-SISTEMA-MARKETING.md) — sistema de campañas de marketing.
- [`docs/04-referencia/emails/SISTEMA-EMAILS.md`](../docs/04-referencia/emails/SISTEMA-EMAILS.md) — sistema de emails transaccionales.
- [`supabase/migrations/20260508-booking-email-dispatches.sql`](../supabase/migrations/20260508-booking-email-dispatches.sql) — esquema de tracking.
- [`supabase/migrations/20260508-booking-email-dispatches-backfill-historic.sql`](../supabase/migrations/20260508-booking-email-dispatches-backfill-historic.sql) — backfill histórico.
- [`scripts/test-storyteller-emails.mjs`](../scripts/test-storyteller-emails.mjs) — script de prueba (envía los 3 mails con datos reales de una reserva aleatoria).
- [`scripts/generate-storytellers-email-promo-images.ts`](../scripts/generate-storytellers-email-promo-images.ts) — generador de las 6 imágenes promocionales del email con `gpt-image-2` (3 hero verticales + 3 banners horizontales con texto).
- [`scripts/generate-storytellers-showcase-images.ts`](../scripts/generate-storytellers-showcase-images.ts) — generador de las imágenes lifestyle / mosaico de la landing pública (versiones limpias sin texto).
- [`scripts/download-mailing-assets.mjs`](../scripts/download-mailing-assets.mjs) — utilidades varias del mailing (descargas, conversiones).
