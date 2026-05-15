# Plantillas de Email · Furgocasa

Esta carpeta contiene **HTML de correos de Furgocasa**, agrupado en tres tipos muy distintos. Ninguno de ellos es la "fuente de verdad" del envío — la fuente de verdad vive en código o en base de datos, según el tipo. Los archivos de aquí son **referencia visual** para poder revisar, compartir y discutir diseño sin tener que arrancar la app.

| Tipo | Dónde vive en esta carpeta | Fuente de verdad del envío |
|---|---|---|
| **Transaccionales** (reserva, pagos, recordatorio) | `mailing/app/*.html` (espejo de código) | `src/lib/email/templates.ts` |
| **Marketing — Sistema actual** (desde abril 2026) | ❌ No se guarda aquí. Se crea y envía desde el panel admin. | Tabla `mailing_campaigns.html_content` en Supabase |
| **Marketing — Históricos** (pre-sistema) | Raíz de `mailing/` + subcarpetas `YYYY.MM.DD - nombre/` | Se enviaron desde herramientas externas; ya no se reutilizan |

---

## 📬 Sistema de mailing marketing (desde abril 2026)

Las campañas de marketing **ya no se envían desde herramientas externas**. Tenemos un sistema completo integrado en la propia app:

- **Panel admin:** `/administrator/mails` · crear/editar campañas, generar HTML con IA (OpenAI, selector de modelo con `gpt-5.4` por defecto; también `gpt-4.1` / `gpt-4o`), cargar destinatarios desde `marketing_contacts`, envío gradual con cron cada minuto, pausa automática por rate-limit SMTP, botón **"Forzar tick ahora"** para diagnóstico, panel de bajas RGPD (`/administrator/mails/bajas`).
- **Tablas Supabase:** `marketing_contacts`, `email_suppressions`, `mailing_campaigns` (incluye `tick_lock_at` para lock atómico del cron), `mailing_recipients`, vista `mailing_campaigns_stats`.
- **Funciones SQL:** `mailing_claim_campaign_tick` / `mailing_release_campaign_tick` (`SECURITY DEFINER`) — lock atómico del cron vía RPC, evita colisiones y problemas de caché de PostgREST.
- **Documentación técnica completa:** [`README-SISTEMA-MARKETING.md`](./README-SISTEMA-MARKETING.md). **Esto es lo que hay que leer** para cualquier duda operativa del mailing (incluye troubleshooting de Vercel Cron, SMTP, lock y tabla de síntomas/causa/fix).
- **Prompt maestro original del sistema:** [`GUIA_MAILS.md`](./GUIA_MAILS.md) — ya ejecutado; se conserva como referencia exportable a otros proyectos (incluye ANEXO E · Gotchas de Vercel Cron con lecciones aprendidas en producción).

⚠️ **El HTML definitivo de cada campaña vive en BD, no en esta carpeta.** Si necesitas editar el HTML de una campaña, hazlo desde el panel admin.

---

## 📧 Correos transaccionales (`mailing/app/`)

Son los correos automáticos de la web: reserva creada, pagos confirmados, recordatorio de devolución.

### Flujo

Cada transaccional se envía **al mismo tiempo** a:

- Cliente (el email que proporcionó al reservar)
- `reservas@furgocasa.com`

### ⚠️ REGLA DE SINCRONIZACIÓN (obligatoria)

> **Siempre que se cambie una plantilla en `src/lib/email/templates.ts`, se DEBE actualizar el HTML correspondiente en `mailing/app/` para que sea un reflejo exacto del email que se envía en producción.**

Motivo: el código real vive en `src/lib/email/templates.ts` (es lo que ve el cliente). Los HTML de `mailing/app/` son **documentación de diseño**: si se desincronizan, dejan de ser útiles y se pierde la referencia visual fiable.

**Checklist al tocar un template transaccional:**

1. Editar la función correspondiente en `src/lib/email/templates.ts`.
2. Regenerar/actualizar el HTML espejo en `mailing/app/` con **los mismos datos de ejemplo** (Juan, FU0018, Camper XL Deluxe, Murcia, 22–27 de marzo de 2026).
3. Abrir el HTML en el navegador y comprobar que coincide con el email real (se puede enviar un correo de prueba desde `POST /api/bookings/send-email`).
4. Commit único que incluya **el cambio en `templates.ts` + el cambio en `mailing/app/`**. Nunca uno sin el otro.

### Mapa de plantillas transaccionales

| Archivo HTML (referencia) | Función en `templates.ts` | Cuándo se envía | Disparador en el código |
|---|---|---|---|
| `app/01-reserva-creada.html` | `getBookingCreatedTemplate` | El cliente crea la reserva (pendiente de pago) | `src/app/api/bookings/create/route.ts` |
| `app/02-primer-pago-confirmado.html` | `getFirstPaymentConfirmedTemplate` | Se confirma el primer pago (50% o 100%) | `src/app/api/redsys/notification/route.ts`, `src/app/api/redsys/verify-payment/route.ts`, `src/app/api/payments/update-manual/route.ts` |
| `app/03-segundo-pago-confirmado.html` | `getSecondPaymentConfirmedTemplate` | Se completa el pago total (segundo pago) | mismos archivos que el anterior |
| `app/04-recordatorio-devolucion.html` | `getReturnReminderTemplate` | La víspera del `dropoff_date` (cron diario) | `src/app/api/cron/return-reminders/route.ts` |

#### Storytellers · HTML de referencia en `mailing/app/`

> 🌟 **Documento técnico completo y obligatorio:** [`STORYTELLERS_MAILS.md`](./STORYTELLERS_MAILS.md)
> — explica en detalle los 3 emails, el deep-link `?ref=`, la tabla de
> tracking `booking_email_dispatches`, las defensas de seguridad
> (rate-limit, reCAPTCHA, HMAC, honeypot), el backfill histórico y los
> crons pendientes. **Léelo antes de tocar cualquier email Storytellers.**

Las tres plantillas siguientes son **emails de ciclo de vida del viaje** (salida → mitad → vuelta). **Ciclo automático operativo en producción** desde el 15/05/2026 (commit `9d0323ea`): cada email se renderiza con una función TypeScript en `src/lib/storytellers/email-templates.ts` (mismo patrón que `getReturnReminderTemplate` del email 04). Los HTML de `mailing/app/05–07*.html` son el **espejo visual editable a mano**; tras cualquier edición hay que regenerar el TS con `node scripts/sync-storyteller-emails-to-ts.mjs`.

| Archivo HTML (referencia) | Momento de envío previsto (producto) | Estado en código |
|---|---|---|
| `app/05-storytellers-dia-salida-noche.html` (espejo) → `getStorytellerPickupNightTemplate(data)` | Mismo día del pickup (salida), ~20:00–21:00 (Europe/Madrid) | **Operativo** · cron `storyteller-pickup-night` |
| `app/06-storytellers-mitad-viaje.html` (espejo) → `getStorytellerMidTripTemplate(data)` | Día intermedio del alquiler (punto medio pickup ↔ dropoff), mañana. **No se envía en viajes <6 días.** | **Operativo** · cron `storyteller-mid-trip` |
| `app/07-storytellers-dia-despues-vuelta.html` (espejo) → `getStorytellerPostTripTemplate(data)` | 1 día natural después del `dropoff_date`, mañana | **Operativo** · cron `storyteller-post-trip-day-after`. El recordatorio automático antiguo a **+7 días** (`buildPostTripReminderHtml` + `storyteller-post-trip-reminder`) sigue conviviendo como red de seguridad bajo el mismo `email_type='storyteller_post_trip'`. |

Los 3 emails incluyen:

- **Hero CTA vertical** (no clicable, fuerza scroll) con texto + flecha quemados sobre la imagen (`cover-cta-05/06/07.jpg`, 4:5).
- **Banner narrativa promocional horizontal** en mitad del cuerpo (`banner-05/06/07.jpg`, 3:2 a 1536×1024 px) con texto promocional integrado por **`gpt-image-2`** (no quemado a mano con SVG). El modelo recibe la versión limpia `banner-XX-clean.jpg` como base + un brief con literalidad exacta del título, sublínea, pill naranja `HASTA 15 % + REGALOS` / `+ REGALOS POR TUS PUNTOS`, paleta y posición, y compone el cartel completo. **Una imagen distinta por email**. Script: [`scripts/generate-storytellers-email-promo-images.ts`](../scripts/generate-storytellers-email-promo-images.ts).
- **Deep-link `?ref=<booking_number>`** en todos los CTAs → la página `/es/storytellers/subir` prerrellena el nº de reserva y enfoca el campo email automáticamente.
- **`referrerpolicy="no-referrer"`** en todos los CTAs (evita filtración del query a terceros vía header `Referer`).
- **CTA secundario "outline"** (botón blanco con borde naranja) en mitad del cuerpo + CTA principal naranja sólido al final.
- **Tracking idempotente** en `booking_email_dispatches` (índice único parcial sobre `status='sent'`).

Las **versiones limpias sin texto** (`banner-XX-clean.jpg`) se reutilizan en la landing pública `/es/storytellers` dentro de 3 bloques `<LifestyleFeature>` (zigzag imagen + texto + bullets), no como banners full-bleed pelados. Una sola fuente de imágenes para email y web, dos tratamientos visuales distintos.

**Otros correos al cliente ligados a Storytellers** (ya implementados o disparados por acción):

| Origen | Cuándo |
|---|---|
| `sendUploadConfirmationEmail` | Tras una subida correcta |
| `POST /api/storytellers/request-magic-link` | El cliente pide enlace a "Mis puntos" |
| `POST /api/admin/storyteller-uploads/[id]/select` | El equipo marca foto/vídeo como seleccionado (puntos / cupón) |

Los HTML `05`–`07` usan dos cadenas placeholder literales que se reemplazan al renderizar: `Juan` (saludo) y `FC-2026-001234` (booking number, también en el `?ref=`). Para detalle completo ver [`STORYTELLERS_MAILS.md`](./STORYTELLERS_MAILS.md).

> `getCompanyNotificationTemplate` existe en `templates.ts` pero está **deprecado** y solo redirige a las tres primeras plantillas: no tiene HTML propio.

---

## 🗄️ Campañas históricas (raíz de `mailing/` y subcarpetas con fecha)

Los HTML sueltos en la raíz (`email_earlysummer2026.html`, `ENV - email_ofertas_20260317.html`, etc.) y las subcarpetas `YYYY.MM.DD - Nombre/` (Black Friday 2025, Oferta invierno, etc.) son **campañas enviadas antes de que existiera el sistema integrado**.

**Rol actual:** archivo histórico / referencia de diseño. No se usan como plantilla de nuevas campañas — para eso está la IA generadora + el campo "referencias" del panel admin, que puede apuntar a campañas previas ya almacenadas en `mailing_campaigns`.

Si en el futuro se añade un HTML histórico nuevo (p. ej. porque alguien envió algo manualmente durante una migración), respetar la convención:

- Subcarpetas por campaña: `YYYY.MM.DD - Nombre de la campaña/`
- Incluir las imágenes de la campaña junto al HTML.
- Si existe versión específica para Outlook o móvil, nombrarla con el sufijo `_OUTLOOK` / `_movil`.

---

## 🎨 Diseño compatible con todos los clientes de correo

Todas las plantillas (tanto transaccionales como las generadas por el sistema de marketing) están optimizadas para **máxima compatibilidad**:

- **Basado en tablas HTML** (no flexbox ni CSS Grid)
- **Estilos inline** (no clases CSS externas)
- **Sin gradientes** — colores sólidos
- **Estructura XHTML** para clientes antiguos
- **Código específico para Outlook** (`<!--[if mso]>`)
- **Imágenes con URL absoluta `https://`** servidas desde `public/images/mailing/` o `public/images/brand/`
- **CTA como `<a>` con background sólido** (nunca solo una imagen)

### Compatibilidad probada

Outlook (desktop y web) · Gmail (web y app) · Apple Mail · Yahoo Mail · Thunderbird · Mail iOS/Android.

---

## 🔍 Previsualización

Puedes abrir cualquier `.html` directamente en el navegador para ver cómo se verá el email. Para HTML de campañas de marketing que están en BD, usa el botón **Preview** del panel `/administrator/mails/[slug]`.

---

## 📝 Notas

- Los datos mostrados en `mailing/app/` son de ejemplo (Juan García López, reserva FU0018, Camper XL Deluxe, Murcia, 22–27 de marzo de 2026). En producción se reemplazan con los datos reales de cada reserva.
- Las plantillas transaccionales reales (fuente de verdad) están en `src/lib/email/templates.ts`.
- El **mismo email transaccional** se envía tanto al cliente como a `reservas@furgocasa.com`.
- El asunto transaccional incluye: código vehículo, fecha inicio, nombre y apellidos del cliente.
- Los emails de marketing **NO** se envían a `reservas@furgocasa.com` (solo al contacto de la lista). Usan `List-Unsubscribe` + `List-Unsubscribe-Post: One-Click` para el botón nativo de Gmail/Outlook.

---

## 🎨 Colores de la marca

- **Azul corporativo** (cabecera, títulos, botón): `#063971`
- **Verde éxito** (confirmaciones): `#10b981`
- **Amarillo alerta** (avisos): `#fef3c7` con borde `#f59e0b`
- **Rojo pendiente** (importes / penalizaciones / **aviso de hora flexible**): `#dc2626`
- **Azul suave** (info / fianza): `#eff6ff` con borde `#063971`
- **Verde suave** (consejo / pago completo): `#f0fdf4` / `#d1fae5` con borde `#10b981`
- **Fondo secciones:** `#f9fafb`
- **Fondo página:** `#f4f4f5`

---

## 📝 Historial de cambios en plantillas transaccionales

Aquí se anotan **únicamente** cambios en las plantillas de `mailing/app/*.html` (que son espejo de `src/lib/email/templates.ts`). Para detalle completo de cada cambio ver `CHANGELOG.md` raíz y [`docs/04-referencia/emails/SISTEMA-EMAILS.md`](../docs/04-referencia/emails/SISTEMA-EMAILS.md).

### `04-recordatorio-devolucion.html`

| Fecha | Cambio |
|---|---|
| 29/04/2026 | **Aviso de hora flexible.** Asterisco `(*)` rojo (`#dc2626`) y negrita junto a la hora de devolución, y nueva fila bajo la tabla "Tu devolución" con frase **toda en rojo** (mantiene cursiva y negritas internas) que aclara que un acuerdo verbal con FURGOCASA en la entrega prevalece sobre la hora del email. |
| 23/03/2026 | Creación inicial. Cron diario, idempotencia vía `bookings.return_reminder_sent`. Tabla de penalizaciones idéntica a la web, chips, sección de fianza y CTA. |
