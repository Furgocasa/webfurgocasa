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

- **Panel admin:** `/administrator/mails` · crear/editar campañas, generar HTML con IA (OpenAI gpt-4o-mini), cargar destinatarios desde `marketing_contacts`, envío gradual con cron cada minuto, pausa automática por rate-limit SMTP, panel de bajas RGPD (`/administrator/mails/bajas`).
- **Tablas Supabase:** `marketing_contacts`, `email_suppressions`, `mailing_campaigns`, `mailing_recipients`, vista `mailing_campaigns_stats`.
- **Documentación técnica completa:** [`README-SISTEMA-MARKETING.md`](./README-SISTEMA-MARKETING.md). **Esto es lo que hay que leer** para cualquier duda operativa del mailing.
- **Prompt maestro original del sistema:** [`GUIA_MAILS.md`](./GUIA_MAILS.md) — ya ejecutado; se conserva como referencia exportable a otros proyectos.

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
- **Rojo pendiente** (importes / penalizaciones): `#dc2626`
- **Azul suave** (info / fianza): `#eff6ff` con borde `#063971`
- **Verde suave** (consejo / pago completo): `#f0fdf4` / `#d1fae5` con borde `#10b981`
- **Fondo secciones:** `#f9fafb`
- **Fondo página:** `#f4f4f5`
