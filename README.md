# Furgocasa - Sistema de Alquiler de Campers

[![Version](https://img.shields.io/badge/version-4.5.0-green.svg)](./CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-production-success.svg)](https://www.furgocasa.com)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black.svg)](https://vercel.com)
[![PageSpeed](https://img.shields.io/badge/PageSpeed-99%2F100_desktop-brightgreen.svg)](https://pagespeed.web.dev/)
[![PageSpeed Mobile](https://img.shields.io/badge/PageSpeed-92%2F100_mobile-green.svg)](https://pagespeed.web.dev/)
[![LCP](https://img.shields.io/badge/LCP-0.83s_mobile-brightgreen.svg)](./OPTIMIZACION-LCP-MOVIL.md)
[![SEO](https://img.shields.io/badge/SEO-100%2F100-brightgreen.svg)](./CHANGELOG.md)
[![i18n](https://img.shields.io/badge/i18n-4_idiomas-blue.svg)](./I18N_IMPLEMENTATION.md)

**🎉 VERSIÓN 4.5.0 COMPLETADA** - [https://www.furgocasa.com](https://www.furgocasa.com)

> **✅ ESTADO: Franjas horarias por ubicación + Timezone Europe/Madrid estandarizado** - Horarios configurables | Fechas consistentes globalmente

Sistema completo de gestión de alquiler de campers y autocaravanas desarrollado con Next.js 15, TypeScript, Supabase, sistema dual de pagos (Redsys + Stripe) y TinyMCE.

---

## 🗺️ Landings SEO alquiler por ciudad (estado marzo 2026)

- **`location_targets` activos**: **59** en producción (verificar: `npm run check:location-targets-db`).
- **Sedes de recogida**: Murcia, Madrid, Alicante, Albacete + lógica por `nearest_location_id` / `distance_km` por ciudad.
- **Región de Murcia**: **14** landings (capital, costa, interior, Sierra Espuña).
- **Expansión reciente**: **22** localidades en anillo (Madrid + entorno Alicante + entorno Albacete) y **Hellín** (recogida Albacete).
- **Contenido IA** (`content_sections`): `npm run generate-content:all` | `:ring` | `:thin` | `single <slug>` — guía en [`docs/04-referencia/otros/GENERACION-CONTENIDO-IA.md`](./docs/04-referencia/otros/GENERACION-CONTENIDO-IA.md).
- **Metas ES + EN/FR/DE**: `node scripts/update-location-targets-rent-meta.js` (tabla `location_targets` + `content_translations`).

---

## 📊 Abril 2026 — Tracking GTM ecommerce: fix doble conteo + funnel completo (29/04/2026)

- **Problema 1 (crítico):** el evento `purchase` de GTM se disparaba en cada uno de los **dos cobros Redsys** (primer 50 % y segundo 50 %) con `value = total_price` completo en ambos. Resultado: GA4 doblaba ingresos y Google Ads doblaba ROAS.
- **Problema 2:** la deduplicación se hacía con `sessionStorage + booking.id`, que se borra al cerrar la pestaña. Si el cliente reabría el email de confirmación días después, se reenvíaba `purchase`.
- **Fix `purchase`:** detección de primer pago client-side (`amount_paid - payment.amount <= 0.01`). Solo el primer pago dispara `purchase` con LTV completo y `payment_type: first_50|full`; los pagos posteriores disparan un evento custom `additional_payment_received` (con `value = payment.amount` real). Dedup en `localStorage` con clave `gtm_purchase_${order_number}`.
- **Funnel añadido:** `generate_lead` (confirmación de transferencia bancaria) · `begin_checkout` (`/reservar/[id]` con status pending y sin pago) · `add_payment_info` (justo antes de redirigir a Redsys/Stripe). 16 archivos en 4 idiomas.
- **GTM container — nota crítica:** la etiqueta de conversión de Google Ads debe enchufarse SOLO a `purchase` (no a `additional_payment_received`).
- **Documentación:** [CONFIGURACION-GOOGLE-ANALYTICS.md](./docs/02-desarrollo/analytics/CONFIGURACION-GOOGLE-ANALYTICS.md) (sección *Eventos Ecommerce GTM*) · [INDICE-DOCUMENTACION-ANALYTICS.md](./docs/02-desarrollo/analytics/INDICE-DOCUMENTACION-ANALYTICS.md) · [SISTEMA-PAGOS.md](./docs/02-desarrollo/pagos/SISTEMA-PAGOS.md) · CHANGELOG entrada del 29 abr 2026 📊.

---

## ✉️ Abril 2026 — Aviso de hora flexible en el recordatorio de devolución (29/04/2026)

- **Síntoma:** clientes recibían el email "Mañana devuelves tu camper" con la hora estricta de la reserva (p. ej. 11:00 h) y entraban en pánico cuando, en la entrega, FURGOCASA ya les había ampliado el margen verbalmente ("puedes traerla a la 1"). Llamadas/whatsapps de aclaración constantes.
- **Solución:** la plantilla `getReturnReminderTemplate()` añade un asterisco `(*)` en **rojo** (`#dc2626`) y negrita junto a la hora, y una nota inmediata bajo la tabla "Tu devolución" — **toda en rojo** — con el mismo asterisco al inicio:

  > **(*) Sobre la hora:** es la hora de tu reserva. Si el día de la entrega acordaste con el personal de FURGOCASA una hora distinta para devolver el vehículo, **prevalece esa hora acordada** y no esta.

- **Archivos:** `src/lib/email/templates.ts` (líneas ~782-797), `mailing/app/04-recordatorio-devolucion.html` (maqueta sincronizada), `scripts/test-return-reminder-email.ts` (script de prueba que envía solo a `reservas@furgocasa.com`).
- **Documentación:** [SISTEMA-EMAILS.md](./docs/04-referencia/emails/SISTEMA-EMAILS.md) — sección 4, recordatorio de devolución.

---

## 🔴 Abril 2026 — Regla "última pending gana" + RGPD en mensajes (29/04/2026)

- **Síntoma:** un cliente buscaba un vehículo que sí salía disponible (correcto: solo había una *pending* sin pagar de otro cliente) pero al pulsar "Reservar" recibía un error de conflicto que **incluía el nombre completo del otro cliente** (brecha de RGPD) y le impedía reservar.
- **Causa:** el trigger SQL `prevent_booking_conflicts` filtraba por `status != 'cancelled'`, así que las *pendings* también disparaban conflicto. Además su `RAISE EXCEPTION` incluía `customer_name`, que terminaba mostrándose al cliente.
- **Regla nueva — "última pending gana":** las pendings NO bloquean. Si llega una segunda reserva sobre fechas/vehículo solapantes, **la pending anterior se cancela automáticamente** antes del INSERT. Si nadie paga, gana siempre la última pending. Si alguno paga, su pending se confirma y las demás (si hubiese) se cancelan vía webhook Redsys.
- **RGPD:** el trigger ya no incluye `customer_name` y el endpoint `/api/bookings/create` nunca devuelve `bookingError.message` crudo: detecta si es conflicto y responde con un mensaje genérico.
- **Archivos:** `src/app/api/bookings/create/route.ts`, `supabase/migrations/prevent-booking-conflicts.sql`, nueva migración `supabase/migrations/20260429-prevent-conflicts-pending-rgpd.sql`.
- **Documentación:** [CORRECCION-PENDING-OVERRIDE-Y-RGPD-2026-04-29.md](./docs/03-mantenimiento/fixes/CORRECCION-PENDING-OVERRIDE-Y-RGPD-2026-04-29.md) · [SISTEMA-PREVENCION-CONFLICTOS.md](./docs/04-referencia/sistemas/SISTEMA-PREVENCION-CONFLICTOS.md).

---

## 🔴 Abril 2026 — Fix crítico doble reserva (filtro de `payment_status`)

- **Incidente:** un cliente externo pudo ver, reservar y pagar un vehículo que ya estaba reservado por una reserva confirmada manualmente sin pago registrado (`status = 'confirmed'`, `payment_status = 'pending'`).
- **Causa raíz:** todos los endpoints de disponibilidad filtraban por `payment_status IN ('partial','paid')` en lugar de `status` operativo, dejando fuera del cómputo las reservas confirmadas pero sin pago (efectivo, transferencia pendiente, reservas internas).
- **Regla unificada (nueva):** una reserva bloquea el vehículo si su `status` es **`confirmed`**, **`in_progress`** o **`completed`**, **independientemente del `payment_status`**. Solo `pending` (carrito) y `cancelled` no bloquean.
- **Endpoints corregidos (7):** `/api/availability`, `/api/availability/alternatives`, `/api/bookings/create`, `/api/redsys/notification`, `/api/redsys/verify-payment`, `/api/admin/search-analytics`, `/api/admin/last-minute-offers/check-availability`.
- **Migración SQL:** `supabase/migrations/20260427-fix-availability-by-status.sql` (RPC `check_vehicle_availability` ajustada).
- **Trigger BD:** se reinstala `prevent_booking_conflicts` (`supabase/migrations/prevent-booking-conflicts.sql`) como red de seguridad final.
- **Documentación:** [CORRECCION-DOBLE-RESERVA-2026-04-27.md](./docs/03-mantenimiento/fixes/CORRECCION-DOBLE-RESERVA-2026-04-27.md) · [SISTEMA-PREVENCION-CONFLICTOS.md](./docs/04-referencia/sistemas/SISTEMA-PREVENCION-CONFLICTOS.md).

---

## 🛡️ Abril 2026 — RLS en `booking_price_changes` (auditoría de precios admin)

- **Síntoma:** al editar el precio de una reserva en `/administrator/reservas/[id]/editar` aparecía `new row violates row-level security policy for table "booking_price_changes"`.
- **Causa:** existe un trigger en `bookings` que escribe en la tabla de auditoría `booking_price_changes` cuando cambia `total_price`/`base_price`. La tabla tenía RLS habilitado pero le faltaba la policy de INSERT para admins, así que el UPDATE de la reserva fallaba.
- **Solución:** policies SELECT/INSERT/UPDATE/DELETE para admins activos (mismo patrón que `business_closed_dates`).
- **Migración:** `supabase/migrations/20260427-fix-rls-booking-price-changes.sql`.

---

## 🖼️ Abril 2026 — Portadas IA del blog (WebP + referencias flota)

- **Implementación:** `src/lib/blog/generate-blog-cover.ts` · **Admin:** `POST /api/admin/blog/generate-cover` · **CLI:** `scripts/generate-blog-cover.ts`.
- **Modelos:** texto **`gpt-5.4`** (dos pasadas); imagen **`gpt-image-2`** (1536×1024, alta calidad). Variables opcionales: `BLOG_COVER_TEXT_MODEL`, `BLOG_COVER_IMAGE_MODEL`, `BLOG_COVER_WEBP_QUALITY`, `BLOG_COVER_USE_VEHICLE_REFERENCES`.
- **Storage:** bucket **`blog`**, carpeta **`ai-covers/`**, ficheros **`.webp`** (el PNG de la API se convierte con **sharp** antes de subir).
- **Referencias:** fotos reales en **`images/IA_blog/`** (el script también usa rutas fijas de respaldo). Reglas de negocio en prompt: **un solo toldo como máximo**, siempre **lateral derecho**; sin copiar el encuadre de la referencia.
- **Comandos:**
  - `npm run generate:blog-cover -- "https://www.furgocasa.com/es/blog/rutas/slug-del-articulo"`
  - `npm run reencode:blog-cover-webp -- "url-articulo-1" "url-articulo-2"` (solo reconvertir la portada actual a WebP, sin IA). Si en Windows no llegan bien los argumentos: `npx tsx scripts/generate-blog-cover.ts reencode-webp "url1"`.
- **Documentación:** [`docs/02-desarrollo/media/GESTION-MEDIA-STORAGE.md`](./docs/02-desarrollo/media/GESTION-MEDIA-STORAGE.md) (sección *Portadas del blog generadas por IA*), notas de producto en [`agente generador de imágenes.txt`](./agente%20generador%20de%20imágenes.txt).

---

## 🚐 Marzo 2026 — Listados de vehículos (flota, ventas, búsqueda)

- **Flota alquiler** (`/es/vehiculos`, `/en/vehicles`, `/fr/vehicules`, `/de/fahrzeuge`): un solo componente `src/components/vehicle/vehicle-list-client.tsx` — título = `vehicle.name` (sin segunda línea marca/modelo redundante). **ISR** `revalidate = 3600`: los cambios pueden tardar hasta ~1 h en verse en CDN.
- **Transmisión en UI**: el admin guarda `Manual` / `Automática`; la app normaliza con `isAutomaticTransmission()` en `src/lib/utils.ts` para mostrar y filtrar coherente con `automatic` / `manual` en BD.
- **Ventas**: tarjetas en `sale-vehicle-card.tsx` y duplicado en `ventas-client` (es/en/fr/de) — cabecera con badges **marca · año · km**; fila de specs: plazas, plazas noche, combustible, transmisión.
- **Resultados de búsqueda**: `src/components/booking/vehicle-card.tsx` muestra transmisión y usa la misma lógica de detección automática/manual. **Sin cupo:** fechas alternativas (ver sección siguiente).

**Referencia:** [`docs/04-referencia/vehiculos/PAGINAS-VEHICULOS-GARANTIA.md`](./docs/04-referencia/vehiculos/PAGINAS-VEHICULOS-GARANTIA.md)

---

## 🔍 Marzo 2026 — Búsqueda sin resultados: fechas alternativas (4 idiomas)

Si no hay campers disponibles para las fechas elegidas, las páginas de búsqueda (`/es/buscar`, `/en/search`, `/fr/recherche`, `/de/suche`) muestran **ventanas alternativas** (misma duración, ventana ±30 días) con tarjetas al estilo resultado: imagen, precio para esas fechas y equipamiento.

| Pieza | Ubicación |
|-------|-----------|
| API | `GET /api/availability/alternatives` |
| Precio (misma lógica que disponibilidad) | `src/lib/rental-search-pricing.ts` |
| UI cliente | `src/components/booking/no-results-with-alternatives.tsx` |
| Textos EN/FR/DE | `src/lib/i18n/translations/common.ts` |
| Navegación «Buscar» | `getTranslatedRoute('/buscar?…', language)` |

**Página Tarifas:** la sección «Puntualidad en las citas» está **después** del bloque Seguro a todo riesgo + Devolución y **antes** del CTA «¿Listo para tu aventura?» (ES/EN/FR/DE).

**Emails de mailing:** la carpeta `emails/mailing/` (campañas, HTML e imágenes) está en **`.gitignore`** y no se versiona. Las plantillas transaccionales de reserva siguen en `emails/01-03-*.html` (ver `emails/README.md`).

---

## 📧 Marzo 2026 — Recordatorio automático de devolución (cron diario)

Cada día a las 20:00 h (Madrid) un cron de Vercel busca reservas `confirmed` / `in_progress` cuyo `dropoff_date` es **mañana** y envía al **cliente** (con copia a `reservas@furgocasa.com`) un email recordatorio con:

- Fecha, hora y lugar de devolución.
- Tabla de penalizaciones idéntica a la sección "Devolución del vehículo: obligatorio" de la web (limpieza ≥120 €, aguas grises 20 €, WC 70 €, puntualidad 40 €+20 €/h).
- Nota sobre fianza (1.000 €) y consejo de preparación.
- CTA a `furgocasa.com/es/tarifas#devolucion-vehiculo`.

| Pieza | Ubicación |
|-------|-----------|
| Cron endpoint | `src/app/api/cron/return-reminders/route.ts` |
| Plantilla HTML | `getReturnReminderTemplate()` en `src/lib/email/templates.ts` |
| Schedule | `0 18 * * *` en `vercel.json` (18:00 UTC) |
| Idempotencia | Columna `bookings.return_reminder_sent` (boolean) |
| Migración SQL | `supabase/migrations/20260323-add-return-reminder-sent.sql` |

**Compatibilidad email:** tablas HTML puras (sin emojis, sin `border-radius`, chips como `<td>`), testado en Outlook desktop, Gmail y móvil.

**Documentación:** [`docs/04-referencia/emails/SISTEMA-EMAILS.md`](./docs/04-referencia/emails/SISTEMA-EMAILS.md)

---

## 🧾 Marzo 2026 — Comisión Stripe en el PVP y precio correcto de extras en el admin

**Documentación detallada:** [`docs/02-desarrollo/pagos/SISTEMA-PAGOS.md`](./docs/02-desarrollo/pagos/SISTEMA-PAGOS.md) · [`docs/02-desarrollo/pagos/STRIPE-CONFIGURACION.md`](./docs/02-desarrollo/pagos/STRIPE-CONFIGURACION.md)

- **Stripe y facturación:** La comisión repercutida al cliente (aprox. 2 % sobre la base de alquiler de cada cobro) forma parte del **PVP total** de la reserva. En base de datos: `bookings.total_price` incluye esa comisión acumulada; `bookings.stripe_fee_total` la desglosa; en cada fila de `payments` con Stripe, `payments.amount` es lo cobrado al cliente y `payments.stripe_fee` la parte de comisión de ese cobro (0 en Redsys, transferencia, etc.).
- **Antigua reserva / SQL:** Si despliegas código nuevo sobre una BD antigua, ejecuta en Supabase el `ALTER TABLE` documentado en `STRIPE-CONFIGURACION.md` (columnas `stripe_fee_total` y `stripe_fee`).
- **Depósito 50 %:** El importe a cobrar con Stripe se calcula sobre el total contractual sin duplicar comisiones ya integradas (`rentalBaseAmountForStripePayment` en `src/lib/stripe/index.ts`; misma idea en las páginas de pago del cliente).
- **Admin — nuevas/editar reserva:** El precio unitario de líneas de extras debe resolverse con **`extraLineUnitPriceEuros`** en `src/lib/utils.ts` (según `price_type`: `per_unit` → `price_per_unit`, `per_day` → días, etc.). No usar `price_per_rental` como comodín para todo lo que no sea `per_day` (evita errores históricos con sábanas, edredón, etc.).

---

## 📅 Abril 2026 — Pago 100 % obligatorio si faltan menos de 15 días para la recogida

**Documentación:** [`docs/02-desarrollo/pagos/SISTEMA-PAGOS.md`](./docs/02-desarrollo/pagos/SISTEMA-PAGOS.md)

- Si el cliente **aún no ha pagado** y la **fecha de recogida** dista **menos de 15 días** desde hoy, en la página de pago el botón **«Pagar 50 % ahora»** queda **deshabilitado**; solo puede **«Pagar total ahora»** (misma lógica en ES/EN/FR/DE: `es/reservar/[id]/pago`, `en/book/[id]/payment`, `de/buchen/[id]/zahlung`, `fr/reserver/[id]/paiement`).
- Valores de negocio canónicos: `src/lib/company.ts` → `rentalPolicy.bookingPayment` (50 % + plazo 15 días).

---

## 📅 Abril 2026 — Calendario admin: reasignación ágil + edición inline

**Documentación:** [`docs/04-referencia/admin/CALENDARIO-ADMIN-EDICION.md`](./docs/04-referencia/admin/CALENDARIO-ADMIN-EDICION.md)

Rediseño operativo del calendario de admin para resolver el "15-puzzle" de reasignar la flota cuando todos los vehículos están ocupados, sin crear vehículos ficticios ni salir del calendario.

- **`bookings.vehicle_id` nullable**: estado intermedio *Sin vehículo asignado* durante reasignaciones en cadena. Migración `supabase/migrations/20260417-allow-null-vehicle-in-bookings.sql`.
- **Filas "Sin asignar N" en el Gantt**: cada reserva pendiente aparece como fila virtual con sus fechas exactas y badges de ubicación (misma lógica que los vehículos reales).
- **Modal emergente convertido en editor inline** con guardado al vuelo (`patchBookingInline()`): estado, vehículo (con marca `✓ libre` / `⚠️ OCUPADO` por `hasVehicleConflict()`), fecha y hora de recogida/devolución (`<input type="date|time">` nativos) y ubicaciones de origen y destino.
- **Safeguards**: no permite `in_progress` / `completed` sin vehículo ni `dropoff_date < pickup_date`.
- **Fix crítico `total_price` al editar**: incluye `stripe_fee_total` acumulado por el webhook Stripe. Antes se restaba la comisión al recalcular y el `max` del input *Monto pagado* rechazaba el submit. Script puntual de reparación: `supabase/migrations/20260417-fix-booking-16bf1a08-total-price.sql`.
- **Botón "Editar" en el modal** (junto a Cerrar / Ver detalles).
- **Indicadores extendidos a listado, ficha y suscripción ICS** (`⚠️ SIN ASIGNAR`).

**Archivos clave:** `src/app/administrator/(protected)/calendario/page.tsx`, `src/app/administrator/(protected)/reservas/[id]/editar/page.tsx`, `src/app/administrator/(protected)/reservas/[id]/page.tsx`, `src/app/administrator/(protected)/reservas/page.tsx`, `src/lib/calendar/ics-generator.ts`, `src/lib/supabase/database.types.ts`.

---

## 🔒 Abril 2026 — Cierre Auditoría Supabase Security Advisor

**Estado:** ✅ Completada — 53 warnings resueltos, 12 aceptados como diseño, cero regresiones.  
**Documentación:** [`docs/03-mantenimiento/AUDITORIA-SEGURIDAD-SUPABASE-ABRIL-2026.md`](./docs/03-mantenimiento/AUDITORIA-SEGURIDAD-SUPABASE-ABRIL-2026.md)

Segunda ola de hardening tras la auditoría de febrero. Enfocada en el Security Advisor de Supabase:

- **Privilege escalation cerrada en `admins`:** eliminadas policies permisivas de `INSERT` y `DELETE`. Ningún usuario autenticado puede auto-promocionarse a admin; solo `service_role`.
- **Buckets storage** (`blog`, `extras`, `media`, `vehicles`): SELECT restringido a `authenticated`. Las URLs públicas siguen funcionando; se bloquea `.list()` desde visitantes anónimos.
- **Search-path injection mitigado** en 46 funciones PL/pgSQL (`SET search_path = public, pg_temp`).
- **Leaked Password Protection** activada en Supabase Auth (HaveIBeenPwned).
- **Endpoints actualizados** para usar `createAdminClient()` sobre `search_queries` tras activar RLS en esa tabla.

Decisiones documentadas sobre lo **no** modificado (policies permisivas en flujos anónimos de reservas/cupones/comentarios y `pg_trgm` en `public`) con mitigaciones activas.

**Pendientes críticos reordenados** en [`docs/03-mantenimiento/PENDIENTES-SEGURIDAD.md`](./docs/03-mantenimiento/PENDIENTES-SEGURIDAD.md):
- Recalcular precios en `/api/bookings/create` (refuerzo frente a `rls_policy_always_true` aceptado en `bookings`).
- Activar bloqueo de importe en `/api/redsys/initiate`.
- Rotar `CALENDAR_SUBSCRIPTION_TOKEN` y eliminar `NEXT_PUBLIC_CALENDAR_TOKEN` del cliente.
- Migrar rate-limit a Upstash Redis.

---

## ⚡ [ÚLTIMA ACTUALIZACIÓN] - 25 de Febrero 2026 - **Franjas Horarias por Ubicación + Fix Timezone Europe/Madrid**

### 🕐 Franjas Horarias Configurables por Ubicación

**Estado**: ✅ Completado y desplegado  
**Commit**: `eec9bf5`

Las ubicaciones ahora permiten configurar múltiples franjas horarias de apertura (ej: Horario 1: 10:00-14:00, Horario 2: 17:00-19:00). El selector de hora en el buscador de reservas genera los slots disponibles dinámicamente según la ubicación seleccionada.

**Funcionalidades:**
- ✅ **Franjas horarias dinámicas**: Cada ubicación puede tener N franjas horarias configurables desde el admin
- ✅ **UI en admin**: Sección "Horarios de apertura" con inputs de hora, botón añadir/eliminar franjas
- ✅ **TimeSelector dinámico**: Genera slots cada 30 min basándose en las franjas de la ubicación seleccionada
- ✅ **Propagación automática**: Ubicación → LocationSelector → SearchWidget → TimeSelector
- ✅ **Almacenamiento JSONB**: Campo `opening_hours` en tabla `locations` con formato `[{"open":"10:00","close":"14:00"}]`
- ✅ **Defaults inteligentes**: Sin franjas configuradas → usa 10:00-14:00 y 17:00-19:00

**Migración SQL requerida:**
- `supabase/migrations/add-opening-hours-to-locations.sql` - Añadir columna `opening_hours` JSONB

**Archivos modificados:**
- `src/app/administrator/(protected)/ubicaciones/page.tsx` - UI franjas horarias en formulario + badges en listado
- `src/components/booking/time-selector.tsx` - Generación dinámica de slots desde franjas
- `src/components/booking/location-selector.tsx` - Propaga `opening_hours` al seleccionar ubicación
- `src/components/booking/search-widget.tsx` - Conecta ubicación con TimeSelector
- `src/types/database.ts` - Tipo `opening_hours` en Location

### 🌍 Fix Timezone: Todas las Fechas en Europe/Madrid

**Commit**: `654f3b9`

Un cliente desde Latinoamérica experimentó un desfase de +1 día en sus fechas de reserva (15-30 abril → 16 abril - 1 mayo). Se estandarizó todo el manejo de fechas a timezone `Europe/Madrid` en toda la aplicación.

**Problema detectado:**
- `new Date("2026-04-15")` se interpreta como UTC midnight → en zonas horarias negativas (Latinoamérica) el día retrocede
- Las fechas de reserva, cálculos de precios y visualización mostraban días incorrectos

**Solución:**
- ✅ **Helpers centralizados**: `parseDateString()` y `toDateString()` en `src/lib/utils.ts`
- ✅ **getMadridToday()**: El calendario siempre usa la fecha actual de Madrid
- ✅ **timeZone: Europe/Madrid**: En todos los `toLocaleDateString` de las 8 páginas de booking (es, en, fr, de)
- ✅ **APIs corregidas**: availability, pricing, bookings/create, blocked-dates, search-analytics
- ✅ **Sin impacto en reservas existentes**: Solo se modifica la lógica de procesamiento, no los datos almacenados

**Archivos modificados (20):**
- `src/lib/utils.ts` - Helpers parseDateString/toDateString + cálculos corregidos
- `src/components/booking/date-range-picker.tsx` - getMadridToday()
- `src/components/booking/search-summary.tsx` - parseDateString
- `src/components/booking/occupancy-highlights.tsx` - Fechas con T00:00:00
- `src/hooks/use-season-min-days.ts` - Parseo explícito
- `src/app/{es,en,fr,de}/reservar|book/vehiculo|nueva|vehicle|new/page.tsx` (8 archivos)
- `src/app/api/{availability,pricing/calculate,bookings/create,blocked-dates,admin/search-analytics}/route.ts`

---

### ⚡ [ACTUALIZACIÓN ANTERIOR] - 24 de Febrero 2026 - **Sistema de Daños: Fix Caché PWA + Navegación + Numeración Independiente**

**Funcionalidades del sistema de daños (commits: `38276d7`, `8589b95`, `bd67640`, `4df0b36`):**
- ✅ **Cache-bust PWA**: `?v=2` en URLs de imágenes del plano de daños para forzar recarga
- ✅ **Flechas de navegación**: Botones ← → para cambiar entre vistas del vehículo directamente en el plano
- ✅ **Numeración independiente por tipo**: Exteriores: 1, 2, 3... / Interiores: 1, 2, 3...
- ✅ **Lista lateral separada**: Secciones diferenciadas (naranja ext, azul int)
- ✅ **PDF separado**: Tablas independientes para exteriores e interiores
- ✅ **Fix constraint DB**: `interior` añadido a `vehicle_damages_view_type_check`

---

## ⚡ [ACTUALIZACIÓN ANTERIOR] - 12 de Febrero 2026 - **Sistema de Vehículos Vendidos**

### 🚗 Estado Definitivo para Vehículos Vendidos

**Estado**: ✅ Completado y desplegada  
**Documentación**: [`docs/04-referencia/vehiculos/SISTEMA-VEHICULOS-VENDIDOS.md`](./docs/04-referencia/vehiculos/SISTEMA-VEHICULOS-VENDIDOS.md)

Nuevo sistema para marcar vehículos como vendidos de forma independiente (no requiere estar "en venta"):

**Funcionalidades:**
- ✅ **Sección "Estado definitivo"** en formularios (editar/nuevo vehículo)
- ✅ **Modal de confirmación** detallado al marcar como vendido
- ✅ **Botón "Revertir venta"** para casos excepcionales (ej: arras canceladas)
- ✅ **Exclusión automática** de vendidos en: calendario, disponibilidad, nueva reserva
- ✅ **Toggle "Mostrar vendidos"** en lista de vehículos y registro de daños
- ✅ **Indicadores visuales** rojos (fondo + badge VENDIDO)

**Informes (cambio importante):**
- Los informes muestran **TODOS** los vehículos (incluidos vendidos) para mantener histórico completo
- Los vendidos se destacan con fondo rojo y badge VENDIDO
- El cálculo de ocupación solo usa vehículos activos en alquiler

**Commits**: `72c2147`, `cd076ab`, `865734c`, `02440f1`

---

## ⚡ [ACTUALIZACIÓN ANTERIOR] - 5 de Febrero 2026 - **Auditoría de Seguridad Completa**

### 🔒 Auditoría de Seguridad y Correcciones Implementadas

**Estado**: ✅ Completada y desplegada  
**Documentación**: [`docs/03-mantenimiento/AUDITORIA-SEGURIDAD-2026.md`](./docs/03-mantenimiento/AUDITORIA-SEGURIDAD-2026.md)

Se ha realizado una auditoría completa de seguridad identificando y corrigiendo vulnerabilidades críticas:

**Vulnerabilidades Corregidas:**
- ✅ **Logs sensibles eliminados** - Información sensible solo en desarrollo
- ✅ **Errores genéricos en producción** - Sin exposición de detalles internos
- ✅ **Token hardcodeado eliminado** - Token de calendario ahora desde variables de entorno
- ✅ **Datos admin minimizados** - Solo se expone `isAdmin` boolean
- ✅ **Validación de montos** - Monitoreo de discrepancias en pagos

**Documentación de Seguridad:**
- 📖 **[AUDITORIA-SEGURIDAD-2026.md](./docs/03-mantenimiento/AUDITORIA-SEGURIDAD-2026.md)** - Auditoría completa
- 📖 **[ATAQUES-EXTERNOS-AMENAZAS.md](./docs/03-mantenimiento/ATAQUES-EXTERNOS-AMENAZAS.md)** - Análisis de amenazas
- 📖 **[CORRECCIONES-SEGURAS-SIN-AFECTAR.md](./docs/03-mantenimiento/CORRECCIONES-SEGURAS-SIN-AFECTAR.md)** - Estrategia de correcciones
- 📖 **[GUIA-CAMBIAR-TOKEN-CALENDARIO.md](./docs/03-mantenimiento/GUIA-CAMBIAR-TOKEN-CALENDARIO.md)** - Guía de tokens

**Commit**: `7ad02ce` - fix(security): auditoría de seguridad - eliminar exposición de datos sensibles

---

## ⚡ [ACTUALIZACIÓN ANTERIOR] - 27 de Enero 2026 - **Fix Language Switcher Blog + Analytics**

### 🌐 Language Switcher con Slugs Traducidos del Blog

**Estado**: ✅ Resuelto  
**Documentación**: [`docs/SISTEMA-TRADUCCIONES-BLOG.md`](./docs/SISTEMA-TRADUCCIONES-BLOG.md)

El Language Switcher ahora navega correctamente a URLs con slugs traducidos en el blog:

| Cambio de idioma | Antes (incorrecto) | Ahora (correcto) |
|------------------|-------------------|------------------|
| ES → FR | `/fr/blog/itineraires/slug-en-español` | `/fr/blog/itineraires/slug-en-francais` |
| ES → DE | `/de/blog/routen/slug-en-español` | `/de/blog/routen/slug-auf-deutsch` |

**Causa del bug**: Navegación duplicada en `header.tsx` que competía con el contexto de idioma.

### 🔧 Fix Visitas Duplicadas en Analytics

**Estado**: ✅ Resuelto mediante configuración GA4  
**Documentación**: [`FIX-ANALYTICS-VISITAS-DUPLICADAS.md`](./FIX-ANALYTICS-VISITAS-DUPLICADAS.md)

### 📊 Qué se Detectó

Después de la migración a `@next/third-parties/google` (v4.4.0), las páginas del blog y vehículos registraban **2 pageviews** por cada navegación interna (SPA), inflando artificialmente las estadísticas.

| Escenario | Comportamiento Esperado | Antes del Fix |
|-----------|------------------------|---------------|
| Landing directo | 1 pageview | 1 pageview ✅ |
| Navegación SPA (blog → artículo) | 1 pageview | **2 pageviews** ❌ |

### ✅ Solución Implementada

**No requirió cambios de código**, solo configuración en Google Analytics 4:

**Ruta**: Admin → Flujos de datos → Medición mejorada → Configuración avanzada

**Cambio**:
```
☑️ Cargas de página                                    [ACTIVADO]
☐  La página cambia en función de los eventos del      [DESACTIVADO] ✅
   historial de navegación
```

### 🎯 Resultado

- ✅ **1 pageview por navegación** (correcto)
- ✅ Landing pages funcionando perfectamente
- ✅ Todos los eventos (scroll, clicks, etc.) funcionando
- ✅ Sin impacto en código o rendimiento

### 📖 Causa Técnica

GA4 "Enhanced Measurement" detectaba cambios en `window.history` (navegación SPA) y enviaba pageviews automáticos, **duplicando** los que ya enviaba `@next/third-parties/google`.

**Documentación completa**: [`FIX-ANALYTICS-VISITAS-DUPLICADAS.md`](./FIX-ANALYTICS-VISITAS-DUPLICADAS.md)

---

## 📊 [ACTUALIZACIÓN PREVIA] - 25 de Enero 2026 - **Sistema de Análisis de Búsquedas**

### 🔍 Sistema Completo de Tracking del Funnel de Conversión

**Estado**: ✅ Completado y listo para deploy  
**Tiempo de desarrollo**: 2 sesiones de trabajo  
**Resultado**: Sistema completo de revenue management con tracking de búsquedas, selecciones y conversiones

### 📊 Funcionalidades Implementadas

**1. Tracking del Funnel de Conversión (3 etapas):**
- ✅ **Búsqueda Realizada** - Se registra cada búsqueda en `/api/availability`
- ✅ **Vehículo Seleccionado** - Usuario hace clic en "Reservar" (indica interés real)
- ✅ **Reserva Creada** - Conversión completada con pago

**2. Análisis Demanda vs Disponibilidad (Revenue Management):**
- ✅ **Índice de Demanda** - Búsquedas / Vehículos disponibles por semana
- ✅ **% Ocupación** - Días-vehículo reservados vs disponibles
- ✅ **Recomendaciones automáticas** - 4 niveles de oportunidad de precio:
  - 🔥 **ALTA** (ocupación ≥80% + demanda ≥2.0): Subir +15-20%
  - 💡 **MEDIA** (ocupación ≥60% + demanda ≥1.5): Subir +10%
  - 📉 **BAJA** (ocupación <40% + demanda <0.5): Aplicar descuentos
  - ✅ **Normal**: Precio adecuado

**3. Base de Datos SQL Definitiva:**
- ✅ **33 campos completos** en tabla `search_queries`
- ✅ **Conversión automática** slugs → UUIDs para ubicaciones
- ✅ **7 índices optimizados** para consultas analíticas rápidas
- ✅ **Triggers automáticos** calculan tiempos entre etapas
- ✅ **3 vistas agregadas** para reportes
- ✅ **RLS habilitado** (solo admins leen, API puede insertar/actualizar)

**4. Dashboard Administrativo:**
- ✅ **Nueva página** `/administrator/busquedas`
- ✅ **6 tipos de análisis** con gráficos interactivos
- ✅ **Filtros por fecha** personalizables
- ✅ **Visualización clara** con tablas, badges y códigos de color

### 📁 Archivos Creados/Modificados

**SQL:**
1. ✅ `supabase/search-queries-DEFINITIVO.sql` - SQL definitivo con DROP/CREATE limpio (260 líneas)

**Backend:**
2. ✅ `src/app/api/availability/route.ts` - Tracking reactivado con todos los campos
3. ✅ `src/app/api/search-tracking/route.ts` - Endpoint para actualizar selecciones
4. ✅ `src/app/api/admin/search-analytics/route.ts` - Endpoint de análisis (incluye demand-availability)
5. ✅ `src/lib/search-tracking/session.ts` - Utilidades de sesión y device detection

**Frontend:**
6. ✅ `src/app/administrator/(protected)/busquedas/page.tsx` - Dashboard de análisis
7. ✅ `src/components/admin/sidebar.tsx` - Nuevo enlace "Búsquedas"
8. ✅ `src/components/booking/vehicle-card.tsx` - Tracking de clicks
9. ✅ `src/app/{es,en,fr,de}/buscar|search|recherche|suche/buscar-client.tsx` - Resultados + `searchQueryId`; sin resultados → `NoResultsWithAlternatives`

**Informes Admin (Fixes):**
10. ✅ `src/app/administrator/(protected)/informes/informes-client.tsx` - Fix filtrado por fecha de creación

**Tipos:**
11. ✅ `src/types/database.ts` - Tipos TypeScript para `search_queries`

**Documentación:**
12. ✅ `SISTEMA-BUSQUEDAS-README.md` - Documentación completa (410 líneas)

### 🎯 Cómo Funciona

**Flujo Completo:**

```
1. Usuario busca vehículos
   ↓
   /api/availability registra búsqueda en search_queries
   - Captura: fechas, ubicaciones, precios, temporada, disponibilidad
   - Genera: session_id (cookie 30 días) + search_query_id
   - Detecta: tipo de dispositivo (móvil/desktop/tablet)
   ↓
2. Usuario hace clic en "Reservar" en un vehículo
   ↓
   VehicleCard llama /api/search-tracking
   - Actualiza: vehicle_selected = true
   - Registra: vehículo seleccionado + precio + timestamp
   - Calcula: tiempo desde búsqueda (trigger SQL)
   ↓
3. Usuario completa reserva y paga
   ↓
   /api/bookings/create busca búsqueda por session_id
   - Actualiza: booking_created = true
   - Registra: booking_id + timestamp
   - Calcula: tiempo total de conversión (trigger SQL)
   ↓
4. Administrador analiza datos en /administrator/busquedas
   - Ve embudo de conversión completo
   - Identifica fechas con alta demanda
   - Recibe recomendaciones de precio automáticas
```

### 🚀 Próximos Pasos

**PARA ACTIVAR EL SISTEMA:**

1. ✅ **Ejecuta SQL en Supabase:**
   - Ve al dashboard de Supabase → SQL Editor
   - Copia y pega `supabase/search-queries-DEFINITIVO.sql`
   - Ejecuta (tarda ~5 segundos)

2. ✅ **Deploy a producción:**
   - Ya está en commit `da8e0cf`
   - Vercel lo desplegará automáticamente

3. ✅ **Verifica funcionamiento:**
   - Haz una búsqueda en /es/buscar
   - Ve a /administrator/busquedas
   - Deberías ver la búsqueda registrada

### 📚 Documentación Completa

**👉 [SISTEMA-BUSQUEDAS-README.md](./SISTEMA-BUSQUEDAS-README.md)** - Guía técnica completa:
- Arquitectura del sistema
- Uso del dashboard
- Consultas SQL útiles
- Mantenimiento y limpieza
- Troubleshooting

**Commits:**
- `da8e0cf` - feat: sistema búsquedas completo con SQL definitivo

### 🎊 Beneficios

**Para el negocio:**
- 📊 Datos reales de demanda vs disponibilidad
- 💰 Recomendaciones automáticas de ajuste de precios
- 🎯 Identificar períodos de alta demanda para maximizar ingresos
- 📉 Detectar períodos de baja demanda para aplicar promociones
- 🔍 Entender el comportamiento del usuario en el funnel

**Para el equipo:**
- ✅ Dashboard intuitivo y fácil de usar
- ✅ Datos en tiempo real
- ✅ Reportes automáticos sin SQL
- ✅ Sistema totalmente automatizado (sin mantenimiento manual)

**ROI esperado**: +10-15% en ingresos al optimizar precios basados en demanda real

---

## ⚡ [ACTUALIZACIÓN ANTERIOR] - 25 de Enero 2026 - **Páginas SEO Multiidioma: Marruecos**

### 🇲🇦 Nuevas Páginas: Motorhome Marruecos desde España

**Estado**: ✅ Completadas y funcionando  
**Páginas creadas**: 4 (ES/EN/FR/DE)  
**Objetivo**: Captar búsquedas internacionales de viajeros que quieren alquilar motorhome para viajar a Marruecos

### 📊 Todas las Páginas SEO Implementadas

#### **Páginas Marruecos** (Nuevo - commit 8c54fb2)

| Idioma | URL | Audiencia |
|--------|-----|-----------|
| 🇪🇸 ES | `/es/alquiler-motorhome-marruecos-desde-espana` | Internacional |
| 🇬🇧 EN | `/en/motorhome-rental-morocco-from-spain` | Angloparlantes |
| 🇫🇷 FR | `/fr/camping-car-maroc-depuis-espagne` | Francoparlantes |
| 🇩🇪 DE | `/de/wohnmobil-miete-marokko-von-spanien` | Germanoparlantes |

#### **Páginas Europa**

| Idioma | URL | Audiencia |
|--------|-----|-----------|
| 🇪🇸 ES | `/es/alquiler-motorhome-europa-desde-espana` | LATAM |
| 🇬🇧 EN | `/en/motorhome-rental-europe-from-spain` | Angloparlantes |
| 🇫🇷 FR | `/fr/camping-car-europe-depuis-espagne` | Francoparlantes |
| 🇩🇪 DE | `/de/wohnmobil-miete-europa-von-spanien` | Germanoparlantes |

### ✅ Características Páginas Marruecos

**Contenido Específico Marruecos:**
- ✅ **Información Ferry** - 3 opciones: Tarifa→Tánger (35min), Algeciras→Tánger (1h), Almería→Nador (3-4h)
- ✅ **Documentación incluida** - Carta Verde (seguro Marruecos), autorización propietario, docs aduana
- ✅ **Rutas sugeridas** - Tánger & Norte, Ciudades Imperiales, Costa Atlántica, Gran Ruta + Desierto
- ✅ **Sin descuento LATAM** - El descuento -15% es exclusivo para páginas Europa LATAM
- ✅ **Badge hero** - "🇲🇦 Aventura en África desde España" (traducido)

**Diferencias con Páginas Europa:**
- ❌ NO incluye descuento -15% (solo para viajeros LATAM en páginas Europa)
- ✅ Enfoque en ferry y cruce a África
- ✅ Rutas por Marruecos en vez de Europa
- ✅ Documentación específica para cruzar frontera

**SEO Optimizado (común a ambas):**
- ✅ **Meta títulos** específicos por destino (Europa vs Marruecos)
- ✅ **Canonical URLs** correctos por idioma
- ✅ **Hreflang alternates** conectando las 4 versiones
- ✅ **Sitemap inclusion** - XML + HTML en 4 idiomas, prioridad 0.9
- ✅ **ISR configurado** - Revalidación cada 24h

**Integración Blog (común a ambas):**
- ✅ **Categoría única `rutas`** - Todos los idiomas consultan la misma
- ✅ **URLs traducidas** - Slugs desde `slug_fr`, `slug_en`, `slug_de`
- ✅ **Contenido traducido** - Títulos y excerpts desde `content_translations`
- ✅ **Fallback inteligente** - Usa español si no hay traducción

### 📁 Archivos Creados/Modificados (Marruecos)

**Nuevos archivos:**
1. ✅ `src/app/es/alquiler-motorhome-marruecos-desde-espana/page.tsx` - Página ES Marruecos (683 líneas)
2. ✅ `src/app/en/motorhome-rental-morocco-from-spain/page.tsx` - Página EN Marruecos (681 líneas)
3. ✅ `src/app/fr/camping-car-maroc-depuis-espagne/page.tsx` - Página FR Marruecos (681 líneas)
4. ✅ `src/app/de/wohnmobil-miete-marokko-von-spanien/page.tsx` - Página DE Marruecos (681 líneas)

**Archivos modificados:**
5. ✅ `src/lib/route-translations.ts` - Añadidas rutas Marruecos
6. ✅ `src/app/sitemap.ts` - Añadida entrada Marruecos con prioridad 0.9

### 📁 Archivos Anteriores (Europa)

7. ✅ `src/app/es/alquiler-motorhome-europa-desde-espana/page.tsx` - Página ES Europa (LATAM)
8. ✅ `src/app/en/motorhome-rental-europe-from-spain/page.tsx` - Página EN Europa
9. ✅ `src/app/fr/camping-car-europe-depuis-espagne/page.tsx` - Página FR Europa
10. ✅ `src/app/de/wohnmobil-miete-europa-von-spanien/page.tsx` - Página DE Europa
11. ✅ `src/lib/home/server-actions.ts` - `getRoutesArticles` con traducciones completas
12. ✅ `src/components/blog/blog-article-link.tsx` - Selección de slug traducido
13. ✅ `src/components/blog/blog-list-client.tsx` - URLs con slugs traducidos
14. ✅ `src/components/blog/blog-content.tsx` - Fetch slugs traducidos

### 📚 Documentación Completa

**👉 [PAGINAS-MOTORHOME-MARRUECOS-MULTIIDIOMA.md](./PAGINAS-MOTORHOME-MARRUECOS-MULTIIDIOMA.md)** - Guía páginas Marruecos:
- Información ferry (Tarifa, Algeciras, Almería)
- Documentación para cruzar (Carta Verde, aduana)
- Rutas por Marruecos (Norte, Imperial, Costa, Desierto)
- SEO y metadata optimizados
- Diferencias con páginas Europa

**👉 [PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md](./PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md)** - Guía páginas Europa:
- Diferenciación por audiencia (LATAM vs resto)
- Descuento -15% exclusivo LATAM
- Estructura de contenido
- SEO y metadata
- Errores resueltos (French 404, Blog routes)

**Commits Marruecos:**
- `8c54fb2` - feat(seo): añadir páginas multiidioma Motorhome Marruecos

**Commits Europa:**
- `d18de0f` - fix(motorhome-europa): corregir consulta traducciones en getRoutesArticles
- `173e55b` - feat(blog): usar slugs traducidos en URLs de la página principal del blog
- `4f7c8e0` - feat(motorhome-europa): usar slugs traducidos en URLs del blog
- `f81e853` - feat(motorhome-europa): cargar títulos y excerpts traducidos del blog
- `c274f82` - feat(motorhome-europa): usar categoría 'rutas' para todos los idiomas

### 🎯 Objetivo SEO

**Páginas Marruecos** - Captar tráfico de personas buscando:
- "motorhome rental morocco from spain" (EN)
- "location camping-car maroc espagne" (FR)
- "wohnmobil miete marokko spanien" (DE)
- "alquiler motorhome marruecos españa" (ES)

**Páginas Europa** - Captar tráfico internacional buscando:
- "motorhome rental europe" (EN)
- "location camping-car europe" (FR)
- "wohnmobil miete europa" (DE)
- "alquiler motorhome europa" (ES/LATAM)

**ROI esperado**: +20-30% tráfico orgánico internacional en 3-6 meses (8 páginas estratégicas)

---

## ⚡ [ACTUALIZACIÓN ANTERIOR] - 25 de Enero 2026 - **Optimización LCP Móvil**

### 🏆 Hito de Rendimiento: LCP Móvil Optimizado al Máximo

**Estado**: ✅ Completada  
**Tiempo de optimización**: 3 iteraciones (Fix #1 → Fix #2 → SEO)  
**Resultado**: LCP móvil **0.83s** (objetivo Google: <2.5s)

### 📊 Resultados Finales

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **LCP Móvil** | 3.9s ⚠️ | **0.83s** ✅ | **-79%** 🎉 |
| **Score Móvil** | 87/100 | **92/100** | +5 pts |
| **SEO Score** | 92/100 | **100/100** | +8 pts |
| **Desktop** | 99/100 | **99/100** | Mantenido ✅ |

### ✅ Optimizaciones Implementadas

**Fix #1 (commit ea0f19b):**
- Eliminado preload manual duplicado de imagen Hero
- Impacto: 87 → 92, LCP: 3.9s → 3.2s (-18%)

**Fix #2 (commit 8f1ac55):**
- Añadido `decoding="sync"` a imagen Hero
- Cambiado GTM script de `beforeInteractive` → `afterInteractive`
- Impacto: Retraso renderizado: 490ms → 60ms (-87%)

**Fix #3 SEO (commit cabc14d):**
- Cambiado "Más información" → "Política de cookies"
- Cambiado "Más información" → "Contactar"
- Impacto: SEO 92 → **100/100**

### 🎯 Desglose Técnico LCP (0.83s)

```
Time to First Byte:              0 ms    ( 0%)  ⚡
Retraso de carga de recursos:  630 ms   (76%)  ✅
Duración de la carga:          140 ms   (17%)  ✅
Retraso de renderizado:         60 ms   ( 7%)  ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL LCP:                     830 ms  (100%)  🏆
```

**Análisis:**
- ✅ El 76% del tiempo es "descubrimiento de recursos" (normal en Next.js SSR)
- ✅ Descarga solo toma 140ms (Vercel CDN + optimización Next.js)
- ✅ Renderizado casi instantáneo gracias a `decoding="sync"`

### 📁 Archivos Modificados

1. ✅ `src/app/es/alquiler-autocaravanas-campervans/[location]/page.tsx`
   - Eliminado preload manual duplicado
   - Añadido `decoding="sync"` en imagen Hero

2. ✅ `src/components/analytics-scripts.tsx`
   - GTM: `beforeInteractive` → `afterInteractive`
   - Añadido `send_page_view: false` para control manual

3. ✅ `src/components/cookies/cookie-banner.tsx`
   - Enlace: "Más información" → "Política de cookies"

4. ✅ `src/components/locations/nearby-office-notice.tsx`
   - Enlace: "Más información" → "Contactar"

### 📚 Documentación Completa

**👉 [OPTIMIZACION-LCP-MOVIL.md](./OPTIMIZACION-LCP-MOVIL.md)** - Análisis técnico completo con:
- Diagnóstico inicial
- Causas raíz identificadas
- Soluciones implementadas paso a paso
- Resultados verificados en producción
- Desglose técnico de cada métrica

**Commits:**
- `ea0f19b` - Fix #1: Eliminar preload duplicado
- `8f1ac55` - Fix #2: decoding="sync" + GTM afterInteractive
- `cabc14d` - Fix #3: Enlaces descriptivos para SEO 100/100

### 🎊 Conclusión

Con un **LCP móvil de 0.83 segundos** (frente al objetivo de Google de <2.5s), **Furgocasa.com está ahora en el top 5% de rendimiento web mundial**. Las tres optimizaciones implementadas han reducido el LCP en un **79%** sin afectar negativamente ninguna otra métrica.

**ROI esperado**: Mejor ranking en Google (Core Web Vitals), mayor conversión móvil, mejor experiencia de usuario.

---

## 🎊 ÚLTIMA ACTUALIZACIÓN: Migración Completa a Carpetas Fijas por Idioma (v4.0.0)

**24 Enero 2026** - ✅ **MIGRACIÓN 100% COMPLETADA**

### 🏆 Hito Mayor: Arquitectura de Carpetas Fijas por Idioma

**Estado**: ✅ Completada al 100%  
**Páginas migradas**: 108 páginas estáticas + 8 páginas dinámicas `[location]`  
**Total**: 116 páginas (27 por idioma × 4 idiomas)  
**Código eliminado**: -8,419 líneas

### 📊 Resumen Ejecutivo

**ARQUITECTURA NUEVA**: Carpetas fijas por idioma (`/es/`, `/en/`, `/fr/`, `/de/`)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MIGRACIÓN COMPLETADA:               145 archivos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Páginas estáticas migradas:      108 (27 × 4 idiomas)
✅ Páginas dinámicas [location]:    8 (2 × 4 idiomas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL PÁGINAS MIGRADAS:             116
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Código añadido:                      +18,549 líneas
Código eliminado:                    -8,419 líneas (neto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ✅ Cambios Principales

**Problema solucionado**: La arquitectura dinámica `[locale]` causaba:
- URLs `/en/contacto` (español en URL inglesa ❌)
- Rewrites complejos (80+ líneas)
- Middleware sobrecargado (540 líneas)

**Solución implementada**:
- ✅ **Carpetas físicas por idioma**: `/es/`, `/en/`, `/fr/`, `/de/`
- ✅ **URLs perfectamente traducidas**: `/en/contact`, `/fr/contact`, `/de/kontakt`
- ✅ **Middleware simplificado**: 540 → 200 líneas (-63%)
- ✅ **Rewrites simplificados**: 80 → 40 líneas (-50%)
- ✅ **Código más limpio**: -8,419 líneas eliminadas

**Páginas migradas** (27 por idioma):

| Categoría | Páginas | Ejemplos |
|-----------|---------|----------|
| **Core** | 3 | Home, Vehículos, Blog |
| **Institucionales** | 3 | Quiénes somos, Contacto, Cómo funciona |
| **Comerciales** | 5 | Tarifas, Ofertas, Ventas, Búsqueda, Reservar |
| **Servicios** | 9 | Guía camper, Documentación, Mapa áreas, etc. |
| **Legales** | 3 | Aviso legal, Privacidad, Cookies |
| **Especiales** | 4 | FAQs, Sitemap, Alquiler Europa, Publicaciones |
| **[location]** | 2 | Alquiler/Venta por ciudad |
| **TOTAL** | **29** | **116 páginas (4 idiomas)** |

**Estructura física creada**:
```
src/app/
├── es/                                    # 🇪🇸 ESPAÑOL
│   ├── alquiler-autocaravanas-campervans/
│   │   └── [location]/page.tsx            # Páginas dinámicas por ciudad
│   ├── venta-autocaravanas-camper/
│   │   └── [location]/page.tsx
│   ├── blog/ (listado, categorías, artículos)
│   ├── contacto/, vehiculos/, tarifas/
│   └── [22 páginas más...]
│
├── en/                                    # 🇬🇧 INGLÉS
│   ├── rent-campervan-motorhome/
│   │   └── [location]/page.tsx
│   ├── campervans-for-sale-in/
│   │   └── [location]/page.tsx
│   ├── blog/, contact/, vehicles/, rates/
│   └── [22 páginas más...]
│
├── fr/                                    # 🇫🇷 FRANCÉS
│   ├── location-camping-car/
│   │   └── [location]/page.tsx
│   ├── camping-cars-a-vendre/
│   │   └── [location]/page.tsx
│   ├── blog/, contact/, vehicules/, tarifs/
│   └── [22 páginas más...]
│
└── de/                                    # 🇩🇪 ALEMÁN
    ├── wohnmobil-mieten/
    │   └── [location]/page.tsx
    ├── wohnmobile-zu-verkaufen/
    │   └── [location]/page.tsx
    ├── blog/, kontakt/, fahrzeuge/, preise/
    └── [22 páginas más...]
```

**Beneficios SEO**:
- ✅ **URLs traducidas correctamente** por idioma
- ✅ **Sin contenido duplicado** entre idiomas
- ✅ **Canonical URLs correctos** por idioma
- ✅ **Hreflang alternates correctos**
- ✅ **Arquitectura escalable** (fácil añadir idiomas)

**Archivos modificados**:
- `src/middleware.ts` - Simplificado (-63%)
- `next.config.js` - Rewrites simplificados (-50%)
- `src/app/[locale]/` - **ELIMINADO** (-6,400 líneas)
- `src/app/location-target/` - **ELIMINADO** (-441 líneas)

### 📁 Documentación Completa

1. **[MIGRACION-CARPETAS-FIJAS-COMPLETADA.md](./MIGRACION-CARPETAS-FIJAS-COMPLETADA.md)** - Informe completo de la migración
2. **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios v4.0.0

### 🚀 Estado Actual (v4.3.0)

1. ✅ Arquitectura carpetas fijas implementada
2. ✅ 116 páginas migradas y funcionando
3. ✅ **4 páginas Motorhome Europa** diferenciadas por audiencia (NUEVO)
4. ✅ Middleware y rewrites simplificados
5. ✅ **Blog con slugs multiidioma** (200 posts × 4 idiomas)
6. ✅ **+400 traducciones de UI** para todas las páginas
7. ✅ **Language switcher inteligente** para blog
8. ✅ **LCP móvil optimizado: 0.83s** (top 5% mundial)
9. ✅ **SEO perfecto: 100/100**
10. ✅ Deploy a producción (Vercel)

**ROI esperado**: +20-50% tráfico orgánico internacional en 3-6 meses + mejor ranking por Core Web Vitals

---

## 🌍 Sistema de Blog Multiidioma (v4.2.0)

**24 Enero 2026** - Blog con URLs completamente traducidas

### URLs de Artículos por Idioma

| Idioma | URL Ejemplo |
|--------|-------------|
| 🇪🇸 ES | `/es/blog/noticias/mi-articulo-espanol` |
| 🇬🇧 EN | `/en/blog/news/my-english-article` |
| 🇫🇷 FR | `/fr/blog/actualites/mon-article-francais` |
| 🇩🇪 DE | `/de/blog/nachrichten/mein-deutscher-artikel` |

### Implementación

- **Base de datos**: Columnas `slug_en`, `slug_fr`, `slug_de` en tabla `posts`
- **Generación automática**: Script `scripts/generate-blog-slug-translations.ts`
- **Language switcher**: Detecta páginas de blog y navega al slug correcto

### Traducciones de UI

El archivo `src/lib/translations-preload.ts` contiene **8,500+ líneas** de traducciones para:
- Página de Ofertas
- Listado de Blog
- Parking Murcia
- Video Tutoriales
- Clientes VIP
- Búsqueda y Filtros
- Documentación de Alquiler

**Documentación**: [I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md) | [GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)

---

## 🚀 [Versiones Anteriores] - Optimización SEO Fase 1-3 (v3.0.0)

**24 Enero 2026** - Fases 1-3 completadas con arquitectura `[locale]` dinámica (ahora migrada a carpetas fijas)

### ✅ Optimización SEO - Fase 1-2 Completadas

**Contexto**: Auditoría SEO realizada por ChatGPT 5.2 detectó problemas críticos en arquitectura de URLs multiidioma.

**Problemas identificados**:
- ❌ URLs `/en/vehicles` sirviendo contenido español (señales contradictorias)
- ⚠️ Sistema de rewrites complejo (220 reglas)
- ⚠️ Robots.txt duplicado (conflicto)
- ⚠️ Sin herramientas de validación automatizada

**Fases completadas**:

#### FASE 1: Correcciones Inmediatas ✅
- ✅ Eliminado `public/robots.txt` duplicado
- ✅ Creado script de validación (`npm run validate:urls`)
- ✅ Validación de 30+ URLs críticas automatizada
- ✅ 4 nuevos comandos NPM para testing

#### FASE 2: Limpieza y Optimización ✅
- ✅ Reorganizadas redirecciones en 5 grupos lógicos
- ✅ Documentación completa inline en `next.config.js`
- ✅ Backup de seguridad creado
- ✅ TODOs marcados para Fase 3 (migración [locale])

**Archivos modificados**:
- `next.config.js` - Documentación mejorada
- `package.json` - Scripts de validación
- `scripts/validate-urls.js` - Nuevo script

**Documentación generada**:
- [AUDITORIA-SEO-URLS-MULTIIDIOMA.md](./AUDITORIA-SEO-URLS-MULTIIDIOMA.md) - Auditoría completa (606 líneas)
- [PLAN-ACCION-SEO-URLS-MULTIIDIOMA.md](./PLAN-ACCION-SEO-URLS-MULTIIDIOMA.md) - Plan de 5 fases (402 líneas)
- [RESUMEN-FASES-1-2-COMPLETADAS.md](./RESUMEN-FASES-1-2-COMPLETADAS.md) - Resumen ejecutivo
- [ANALISIS-NEXTCONFIG-OPTIMIZATION.md](./ANALISIS-NEXTCONFIG-OPTIMIZATION.md) - Análisis técnico

**Próximas fases**:
- ⏳ **FASE 3**: Migración a arquitectura `[locale]` (1-2 semanas)
- ⏳ **FASE 4**: Testing y validación (3-4 días)
- ⏳ **FASE 5**: Deploy y monitoreo (continuo)

**ROI esperado**: +20-30% tráfico orgánico en 6 meses

**Comandos disponibles**:
```bash
npm run validate:urls         # Validar URLs en producción
npm run validate:urls:local   # Validar en local
npm run validate:urls:staging # Validar en staging
npm run validate:urls:verbose # Modo detallado
```

**Documentación completa**: Ver [PLAN-ACCION-SEO-URLS-MULTIIDIOMA.md](./PLAN-ACCION-SEO-URLS-MULTIIDIOMA.md)

---

## 🔧 Fix Crítico Schema.org (v2.0.1)

**24 Enero 2026** - Corregidos errores de Schema.org en Google Search Console

**Problema**: Google Search Console reportaba errores en "Fragmentos de productos" en páginas críticas (Home, Locations, Alquiler).

**Error**: "Se ha detectado 1 elemento no válido. Debe especificarse 'offers', 'review' o 'aggregateRating'"

**Solución implementada**:

1. **Páginas de Alquiler**: Cambio de `@type: "Product"` a `@type: "Service"` (correcto para servicios de alquiler)
2. **Páginas de Venta**: Corrección de `@type` duplicado en `Vehicle` schema

**Archivos corregidos**:
- `src/components/locations/local-business-jsonld.tsx` - Schema de alquiler
- `src/components/locations/sale-location-jsonld.tsx` - Schema de venta

**Resultado**: ✅ Esquemas validados correctamente, errores de Search Console resueltos

**Documentación completa**: [FIX-SCHEMA-PRODUCTO-GOOGLE.md](./FIX-SCHEMA-PRODUCTO-GOOGLE.md) | [CHANGELOG.md](./CHANGELOG.md) → v2.0.1

---

## 🚀 Versión 1.0.10: Optimización Rendimiento

**23-25 Enero 2026** - PageSpeed **99/100** escritorio, **92/100** móvil

### 📊 Resultados PageSpeed Insights

| Dispositivo | Rendimiento | FCP | LCP | CLS |
|-------------|-------------|-----|-----|-----|
| **Escritorio** | **99** ✅ | 0.3s | 0.9s | 0 |
| **Móvil** | **92** ✅ | 1.2s | **0.83s** ✨ | 0 |

### 🎯 Optimizaciones Implementadas

| Optimización | Antes | Después | Mejora |
|--------------|-------|---------|--------|
| **Imágenes hero** | 400-530 KB | 50-120 KB | **-80%** |
| **LCP móvil** | 3.9s | **0.83s** | **-79%** 🏆 |
| **Formato** | WebP | AVIF/WebP | Mejor compresión |
| **Preconnect** | No | Sí | -200ms conexión |
| **CSS crítico** | No | Sí (critters) | FCP más rápido |
| **Pre-generación** | No | ~320 páginas | SEO boost |
| **Decodificación** | async | **sync** | Pintado inmediato |
| **GTM Loading** | beforeInteractive | **afterInteractive** | No bloqueante |
| **Enlaces SEO** | Genéricos | **Descriptivos** | SEO 100/100 |

**📖 Documentación completa:** [OPTIMIZACION-LCP-MOVIL.md](./OPTIMIZACION-LCP-MOVIL.md)

---

## 🎨 Versión 1.0.9: Mejoras SEO Masivas

**22 Enero 2026**

- **Pre-generación estática** - ~320 páginas con `generateStaticParams`
- **Hero image por localización** - Imagen personalizada desde Supabase
- **Traducciones páginas venta** - FR/DE completas

---

## 🚀 OPTIMIZACIONES SEO IMPLEMENTADAS (Enero 2026)

El sitio web ha sido **completamente optimizado para SEO** siguiendo las mejores prácticas de Google 2024-2026:

### 📊 Mejoras de Performance

| Área | SEO Score | First Paint | Mejora |
|------|-----------|-------------|--------|
| **Blog** | 40 → **95-100** | 3-4s → **0.3s** | +137% / 90% |
| **Landing Pages** | 45 → **95** | 2.5s → **0.8s** | +111% / 68% |
| **Home** | 42 → **98** | 4.2s → **1.5s** | +133% / 64% |
| **Páginas Estáticas** | 50-70 → **95-100** | ~2s → **~0.2s** | +50% / 90% |

### ✅ Estrategias Implementadas

1. **Blog**: SSR + ISR (1h) + generateStaticParams
2. **Landing Pages**: SSG + ISR (24h) + generateStaticParams  
3. **Home**: Server Component + ISR (1h)
4. **Páginas Estáticas**: SSG sin revalidación

### 📚 Documentación Completa

- **[SEO-COMPLETE-SUMMARY.md](./SEO-COMPLETE-SUMMARY.md)** - Índice general
- **[SEO-OPTIMIZATION-COMPLETE.md](./SEO-OPTIMIZATION-COMPLETE.md)** - Blog
- **[SEO-LANDING-HOME-COMPLETE.md](./SEO-LANDING-HOME-COMPLETE.md)** - Landing Pages + Home
- **[SEO-STATIC-PAGES-COMPLETE.md](./SEO-STATIC-PAGES-COMPLETE.md)** - Páginas estáticas
- **[SEO-LOCAL-OPENGRAPH.md](./SEO-LOCAL-OPENGRAPH.md)** - SEO local + Redes sociales

### 🎯 Características SEO

- ✅ **8 tipos de Schema.org** (BlogPosting, LocalBusiness, Organization, Product, AboutPage, ContactPage, BreadcrumbList, FAQPage)
- ✅ **Open Graph perfecto** para redes sociales (Facebook, Twitter, LinkedIn, WhatsApp)
- ✅ **Sitemap.xml dinámico** con todas las páginas
- ✅ **robots.txt optimizado**
- ✅ **URLs canónicas** (www.furgocasa.com)
- ✅ **100% del contenido indexable** por Google
- ✅ **Core Web Vitals perfectos**

---

## 🚨 REGLAS ABSOLUTAS - NO TOCAR LO QUE FUNCIONA

### ⛔ ADVERTENCIA CRÍTICA

**SI ALGO FUNCIONA CORRECTAMENTE, NO LO TOQUES**

Esta aplicación ha pasado por múltiples iteraciones y correcciones. Cada "mejora" sin entender la arquitectura ha causado regresiones graves. 

### 📜 REGLAS DE ORO (NUNCA VIOLAR)

#### 1️⃣ **SISTEMA DE AUTENTICACIÓN SUPABASE** ⚠️ **CRÍTICO**

**REGLA ABSOLUTA**: NO modificar `src/lib/supabase/client.ts` ni `src/lib/supabase/server.ts`

**✅ FUNCIONAMIENTO CORRECTO ACTUAL:**

```typescript
// ✅ Client-side (Browser) - client.ts
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ✅ Server-side (Next.js) - server.ts  
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(...);
}
```

**❌ NUNCA HACER:**

```typescript
// ❌ NO USAR SINGLETON - Causa sesiones desactualizadas
let browserClient = null;
if (!browserClient) {
  browserClient = createBrowserClient(...);
}
return browserClient; // ❌ MALO - sesión congelada

// ❌ NO importar supabase estáticamente en componentes cliente
import { supabase } from '@/lib/supabase/client'; // ❌ MALO
// EN SU LUGAR:
import { createClient } from '@/lib/supabase/client'; // ✅ BUENO
const supabase = createClient(); // ✅ Crear instancia fresca
```

**POR QUÉ ES CRÍTICO:**
- El singleton causa que TODAS las peticiones usen la misma sesión desactualizada
- Los administradores pierden autenticación en páginas cliente
- Causa errores RLS (Row Level Security) y `AbortError`
- **ESTO FUE EL ERROR QUE ROMPIÓ TODO EL ADMINISTRADOR**

#### 2️⃣ **HOOKS DE DATOS - NO MODIFICAR** ⚠️ **CRÍTICO**

**REGLA**: Los hooks `usePaginatedData`, `useAdminData` y `useAllDataProgressive` funcionan correctamente. **NO LOS TOQUES**.

**✅ PATRÓN CORRECTO EN LOS HOOKS:**

```typescript
// src/hooks/use-paginated-data.ts
export function usePaginatedData<T>({ table, select, ... }) {
  const query = useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = createClient(); // ✅ Nueva instancia en CADA query
      let queryBuilder = supabase.from(table).select(select);
      // ...
    }
  });
}

// src/hooks/use-admin-data.ts
export function useAdminData<T>({ queryFn, ... }) {
  const loadData = async () => {
    const supabase = createClient(); // ✅ Nueva instancia
    const result = await queryFn();
    // ...
  };
}
```

**CONSECUENCIA SI SE MODIFICAN MAL:**
- TODAS las secciones del administrador dejan de cargar
- Errores `[usePaginatedData] Error`, `[useAdminData] Error`
- Pérdida de acceso al panel completo

#### 3️⃣ **ARQUITECTURA NEXT.JS - SERVER VS CLIENT** ⚠️ **CRÍTICO**

**REGLA**: Las páginas públicas son Server Components, las páginas del admin son Client Components.

| Tipo de Página | Componente | Cliente Supabase | Hook/Query |
|----------------|------------|------------------|------------|
| **Páginas públicas** | Server Component | `createClient()` de `/server.ts` | Directo con `await` |
| **Dashboard admin** | Server Component | `createClient()` de `/server.ts` | Queries desde `/queries.ts` |
| **Páginas admin (CRUD)** | Client Component (`"use client"`) | `createClient()` de `/client.ts` | Hooks de React Query |

**✅ CORRECTO - Página pública:**
```typescript
// Sin "use client"
import { createClient } from '@/lib/supabase/server';

export default async function VehiculosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('vehicles').select('*');
  return <div>...</div>;
}
```

**✅ CORRECTO - Página admin:**
```typescript
"use client";
import { usePaginatedData } from '@/hooks/use-paginated-data';

export default function VehiculosAdminPage() {
  const { data } = usePaginatedData({ table: 'vehicles', ... });
  return <div>...</div>;
}
```

**❌ NUNCA:**
- Añadir `"use client"` a páginas públicas (destruye SEO)
- Usar hooks de React en Server Components
- Importar `createClient` de `/client.ts` en Server Components

#### 4️⃣ **SISTEMA i18n - NO ROMPER** ⚠️ **CRÍTICO**

**REGLA**: El sistema de traducciones dual funciona. NO LO CAMBIES.

- **Server Components**: `translateServer(key, locale)`
- **Client Components**: `useLanguage()` hook

**❌ NUNCA usar `useLanguage()` en Server Components** - Causa errores de hidratación

**Sistema de Cambio de Idioma:**
- **Blog**: Slugs traducidos dinámicos desde Supabase (`content_translations`)
- **Localizaciones (ciudades)**: Slugs estáticos (mismo nombre en todos los idiomas)
- **Páginas transaccionales**: Cambio de idioma deshabilitado

**📖 Ver:** `REGLAS-ARQUITECTURA-NEXTJS.md`, `GUIA-TRADUCCION.md` y `I18N_IMPLEMENTATION.md`

#### 5️⃣ **FLUJO DE RESERVA - SAGRADO** ⚠️ **CRÍTICO**

**REGLA**: El flujo de reserva es secuencial y TODOS los pasos son obligatorios.

```
/reservar → /buscar → /reservar/vehiculo → /reservar/nueva → /reservar/[id] → /reservar/[id]/pago → /reservar/[id]/confirmacion
```

**NUNCA:**
- Eliminar ninguna de estas páginas
- Saltar pasos en el flujo
- Cambiar el orden de los pasos
- Modificar los parámetros URL sin actualizar TODO el flujo

**📖 Ver:** `FLUJO-RESERVAS-CRITICO.md` y `PROCESO-RESERVA-COMPLETO.md`

---

## 🔧 Fix Crítico v1.0.4 - Sistema de Autenticación

### **PROBLEMA CRÍTICO RESUELTO: Administrador completamente roto**

**FECHA**: 20 de Enero 2026

**SÍNTOMAS:**
- ✅ Dashboard del admin funcionaba
- ❌ Vehículos, Reservas, Clientes, Pagos, Extras, Equipamiento, Temporadas, Ubicaciones y Calendario NO cargaban
- ❌ Errores en consola: `[usePaginatedData] Error`, `[useAdminData] Error`, `AbortError`
- ❌ Error: `Cannot read properties of null (reading 'find')` en Calendario

**CAUSA RAÍZ:**

El archivo `src/lib/supabase/client.ts` usaba un **patrón singleton** que congelaba la sesión de autenticación:

```typescript
// ❌ CÓDIGO PROBLEMÁTICO (NUNCA VOLVER A ESTO)
let browserClient = null;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(...); // Se crea UNA VEZ
  }
  return browserClient; // SIEMPRE retorna la MISMA instancia
}
```

**CONSECUENCIAS:**
1. Primera carga después de login → Sesión OK
2. Navegación a otra sección → **Misma instancia con sesión vieja**
3. Peticiones fallan porque la sesión no se refresca
4. RLS (Row Level Security) rechaza las peticiones
5. TODAS las secciones del admin fallan

**SOLUCIÓN APLICADA:**

```typescript
// ✅ CÓDIGO CORRECTO (MANTENER SIEMPRE ASÍ)
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  // ✅ Nueva instancia en CADA llamada = sesión siempre actualizada
}
```

**ARCHIVOS MODIFICADOS:**
- ✅ `src/lib/supabase/client.ts` - Eliminado singleton
- ✅ `src/hooks/use-paginated-data.ts` - Crear instancia en queryFn
- ✅ `src/hooks/use-admin-data.ts` - Crear instancia en loadData
- ✅ `src/hooks/use-all-data-progressive.ts` - Crear instancia en loadAllData
- ✅ Todas las páginas del admin - Usar `createClient()` en funciones async

**RESULTADO:**
- ✅ Todas las secciones del administrador funcionan
- ✅ Sin errores de autenticación
- ✅ Sin AbortError
- ✅ Sin errores de RLS
- ✅ Calendario funciona con carga en lotes

### **Fix Adicional: Meta Pixel**

**PROBLEMA:** Error `[Meta Pixel] - Invalid PixelID: null` en consola

**SOLUCIÓN:** Carga condicional solo si existe la variable de entorno

```tsx
{process.env.NEXT_PUBLIC_META_PIXEL_ID && (
  <Script id="facebook-pixel" ... />
)}
```

**📖 Ver:** `CONFIGURACION-META-PIXEL.md`

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Estilos**: TailwindCSS, Radix UI, Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Autenticación**: Supabase Auth con RLS (Row Level Security)
- **Pagos**: **Sistema Dual** - Redsys (TPV Español, 0.3%) + Stripe (Internacional, 1.4% + 0.25€)
- **Editor**: TinyMCE Cloud
- **Estado**: Zustand, React Query (@tanstack/react-query)
- **Formularios**: React Hook Form + Zod
- **Fechas**: date-fns
- **Traducciones**: Sistema i18n multiidioma con URLs localizadas (ES/EN/FR/DE)
- **Despliegue**: Vercel (recomendado)

---

## 🏗️ ARQUITECTURA DE LA APLICACIÓN

### 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FURGOCASA APP                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│   PÁGINAS PÚBLICAS  │         │   PANEL ADMINISTRADOR│
│  (Server Components)│         │  (Client Components) │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │ usa                          │ usa
           ↓                               ↓
┌─────────────────────┐         ┌─────────────────────┐
│  createClient()     │         │  createClient()     │
│  /lib/supabase/     │         │  /lib/supabase/     │
│  server.ts          │         │  client.ts          │
│                     │         │                     │
│  • cookies()        │         │  • createBrowser    │
│  • Server Auth      │         │    Client           │
│  • Service Role     │         │  • Nueva instancia  │
│                     │         │    en CADA llamada  │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │                               │ usa
           │                               ↓
           │                    ┌─────────────────────┐
           │                    │  HOOKS DE DATOS     │
           │                    │  • usePaginatedData │
           │                    │  • useAdminData     │
           │                    │  • useAllData...    │
           │                    └──────────┬──────────┘
           │                               │
           └───────────┬───────────────────┘
                       │
                       ↓
            ┌──────────────────────┐
            │   SUPABASE BACKEND   │
            │   • PostgreSQL       │
            │   • RLS habilitado   │
            │   • Storage          │
            │   • Auth             │
            └──────────────────────┘
```

### 🔐 Sistema de Autenticación - CÓMO FUNCIONA

#### **Dos Tipos de Clientes Supabase:**

1. **Cliente Servidor** (`/lib/supabase/server.ts`)
   - **Dónde**: Server Components, API Routes, Server Actions
   - **Cómo**: Lee cookies de Next.js para obtener sesión
   - **Cuándo**: Páginas públicas, dashboard admin
   - **Seguridad**: Puede usar service_role si es necesario

2. **Cliente Navegador** (`/lib/supabase/client.ts`)  
   - **Dónde**: Client Components (con `"use client"`)
   - **Cómo**: `createBrowserClient` mantiene sesión en localStorage del navegador
   - **Cuándo**: Páginas interactivas del admin (vehiculos, reservas, etc.)
   - **Seguridad**: Solo anon_key, RLS protege datos

#### **Por Qué Necesitamos NUEVA Instancia en Cada Llamada:**

```typescript
// ❌ PROBLEMA - Singleton (NO USAR NUNCA)
let client = createBrowserClient(...); // Se crea una vez
export const supabase = client; // TODAS las llamadas usan esta instancia

// Flujo:
// 1. Usuario hace login → client tiene sesión A
// 2. Usuario navega a /vehiculos → client SIGUE con sesión A (puede estar expirada)
// 3. Usuario navega a /reservas → client SIGUE con sesión A vieja
// 4. Las peticiones FALLAN porque la sesión no se refresca

// ✅ SOLUCIÓN - Nueva instancia (USAR SIEMPRE)
export function createClient() {
  return createBrowserClient(...); // Nueva instancia cada vez
}

// Flujo:
// 1. Usuario hace login → guarda token en localStorage
// 2. Usuario navega a /vehiculos → createClient() lee token ACTUAL de localStorage
// 3. Usuario navega a /reservas → createClient() lee token ACTUAL de localStorage  
// 4. Todas las peticiones usan sesión actualizada = TODO FUNCIONA
```

#### **Cómo Usar Correctamente:**

```typescript
// ✅ EN HOOKS
export function usePaginatedData({ table }) {
  const query = useInfiniteQuery({
    queryFn: async () => {
      const supabase = createClient(); // ✅ SIEMPRE crear instancia aquí
      const { data } = await supabase.from(table).select();
      return data;
    }
  });
}

// ✅ EN FUNCIONES ASYNC DE COMPONENTES
const handleDelete = async (id: string) => {
  const supabase = createClient(); // ✅ Crear instancia
  await supabase.from('table').delete().eq('id', id);
};

// ✅ EN PÁGINAS SERVER COMPONENT
export default async function Page() {
  const supabase = await createClient(); // ✅ Server client
  const { data } = await supabase.from('table').select();
}
```

### 🗂️ **Estructura de Archivos de Autenticación**

```
src/lib/supabase/
├── client.ts              ⚠️ NO TOCAR - Cliente para navegador
│   └── createClient()     ⚠️ Retorna NUEVA instancia siempre
│
├── server.ts              ⚠️ NO TOCAR - Cliente para servidor
│   └── createClient()     ⚠️ Lee cookies de Next.js
│
├── queries.ts             ✅ Se puede extender - Queries reutilizables
│   ├── getAllVehicles()   ✅ Usa createClient() de server.ts
│   └── getDashboardStats() ✅ Usa createClient() de server.ts
│
└── database.types.ts      ℹ️ Generado - Tipos de Supabase
```

---

## 📋 SECCIONES DEL ADMINISTRADOR - ESTADO ACTUAL

### ✅ TODAS FUNCIONANDO CORRECTAMENTE

| Sección | Ruta | Estado | Hook Usado | Notas |
|---------|------|--------|------------|-------|
| **Dashboard** | `/administrator` | ✅ | Server Component | Usa `queries.ts` |
| **Vehículos** | `/administrator/vehiculos` | ✅ | `usePaginatedData` | CRUD completo |
| **Reservas** | `/administrator/reservas` | ✅ | `useAllDataProgressive` | Con filtros |
| **Clientes** | `/administrator/clientes` | ✅ | `usePaginatedData` | Con búsqueda |
| **Gestión pagos** | `/administrator/pagos` | ✅ | `usePaginatedData` | Lectura + Edición manual |
| **Extras** | `/administrator/extras` | ✅ | `useAdminData` | CRUD inline |
| **Equipamiento** | `/administrator/equipamiento` | ✅ | `useAdminData` | CRUD inline |
| **Temporadas** | `/administrator/temporadas` | ✅ | `useAdminData` | Por año |
| **Ubicaciones** | `/administrator/ubicaciones` | ✅ | `useAdminData` | CRUD inline |
| **Calendario** | `/administrator/calendario` | ✅ | `useAdminData` (x2) | Vista Gantt |
| **Daños** | `/administrator/danos/[id]` | ✅ | Client Component | Numeración ext/int independiente, PDF |

**⚠️ SI UNA SECCIÓN DEJA DE FUNCIONAR:**

1. **NO TOQUES LOS HOOKS** - El problema NO está ahí
2. Verifica que la página usa `createClient()` correctamente:
   ```typescript
   const supabase = createClient(); // ✅ Dentro de la función
   ```
3. Verifica que el `queryFn` del hook crea instancia:
   ```typescript
   queryFn: async () => {
     const supabase = createClient(); // ✅ Debe estar aquí
   }
   ```
4. Verifica políticas RLS en Supabase
5. Limpia caché: `rm -rf .next` y reinicia servidor

---

## 🚀 Características

### Sitio Público
- ✅ **Página de inicio dinámica**
- ✅ Búsqueda de vehículos por fechas y ubicación
- ✅ **Fechas alternativas** si no hay disponibilidad (misma duración; UI en ES/EN/FR/DE)
- ✅ **Catálogo de vehículos con imágenes dinámicas**
- ✅ **Proceso de reserva completo paso a paso** 🎯
- ✅ **Sistema de pago fraccionado (50 %-50 %)**; si la recogida es en **menos de 15 días** y no hay pago previo, solo **100 %** en pantalla
- ✅ **Sistema de pagos dual - Redsys + Stripe** 💳
- ✅ Blog completo con categorías y SEO
- ✅ **Sistema i18n con URLs localizadas** (ES/EN/FR/DE)
- ✅ Sistema de cookies GDPR compliant
- ✅ Diseño responsive total

### Panel de Administración
- ✅ Login seguro con Supabase Auth
- ✅ **PWA (Progressive Web App)** 📱
- ✅ Dashboard con estadísticas en tiempo real
- ✅ **Buscador Global Inteligente** 🔍
- ✅ **Gestión completa de vehículos**
- ✅ **Sistema de Media/Imágenes**
- ✅ **Gestión de reservas con calendario Gantt**
- ✅ **Sistema de temporadas y tarifas**
- ✅ **Blog CMS con TinyMCE**
- ✅ Gestión de clientes (CRM)
- ✅ Gestión de pagos
- ✅ Gestión de extras/equipamiento
- ✅ Gestión de ubicaciones

---

## 📋 Requisitos previos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Credenciales de Redsys (pruebas o producción)
- API Key de TinyMCE (gratuita en tiny.cloud)

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
cd furgocasa-app
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redsys (Método principal - 0.3% comisión)
REDSYS_MERCHANT_CODE=tu-codigo-comercio
REDSYS_TERMINAL=001
REDSYS_SECRET_KEY=tu-clave-secreta
REDSYS_NOTIFICATION_URL=https://tu-dominio.com/api/redsys/notification

# Stripe (Método alternativo - 1.4% + 0.25€)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# TinyMCE
NEXT_PUBLIC_TINYMCE_API_KEY=tu-api-key

# Marketing (Opcionales)
NEXT_PUBLIC_META_PIXEL_ID=tu-pixel-id  # Opcional - Sin esto no hay error
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX         # Opcional - Google Analytics
```

### 3. Configurar la base de datos

1. Crea un proyecto en Supabase
2. Ve al SQL Editor
3. Ejecuta los siguientes scripts en orden:

```sql
-- 1. Schema principal
supabase/schema.sql

-- 2. Políticas RLS (ROW LEVEL SECURITY) - CRÍTICO
supabase/fix-all-rls-policies.sql

-- 3. Sistema de blog
supabase/blog-schema.sql

-- 4. Migración a clientes normalizados (IMPORTANTE)
supabase/migrate-bookings-to-normalized-customers.sql

-- 5. Soporte para Stripe
supabase/add-stripe-support.sql
```

**⚠️ IMPORTANTE:** El script `fix-all-rls-policies.sql` es CRÍTICO. Sin él, el administrador no podrá acceder a los datos.

### 4. Crear primer administrador

**Paso 1: Crear usuario en Supabase Auth**

1. Ve a tu proyecto de Supabase
2. **Authentication** → **Users** → **Add user**
3. Email: `admin@furgocasa.com`
4. Password: Una contraseña segura
5. **Copia el UUID del usuario**

**Paso 2: Asignar permisos**

En SQL Editor ejecuta (reemplaza el UUID):

```sql
INSERT INTO admins (user_id, email, name, role, is_active)
VALUES (
  'uuid-del-usuario-aqui',
  'admin@furgocasa.com',
  'Administrador Principal',
  'superadmin',
  true
);
```

**Roles disponibles:**
- `superadmin` - Acceso total
- `admin` - Acceso completo excepto gestión de usuarios
- `editor` - Solo editar contenido
- `viewer` - Solo lectura

### 5. Verificar políticas RLS

**MUY IMPORTANTE:** Verifica que las políticas RLS están activas:

```sql
-- En SQL Editor de Supabase:
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('vehicles', 'bookings', 'customers', 'payments')
ORDER BY tablename, policyname;
```

**Debes ver:**
- `public_select_vehicles` - Lectura pública
- `admin_all_vehicles` - Admin puede todo
- `public_insert_bookings` - Crear reservas público
- `admin_all_bookings` - Admin puede todo
- etc.

**Si NO ves estas políticas**, ejecuta `supabase/fix-all-rls-policies.sql`

### 6. Iniciar el servidor

```bash
npm run dev
```

- Web pública: [http://localhost:3000](http://localhost:3000)
- Panel admin: [http://localhost:3000/administrator](http://localhost:3000/administrator)

### Comandos disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # Linter
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── es/                              # 🇪🇸 ESPAÑOL (27 carpetas)
│   │   ├── layout.tsx                   # Layout español
│   │   ├── page.tsx                     # Home ES
│   │   ├── alquiler-autocaravanas-campervans/
│   │   │   └── [location]/page.tsx      # Páginas dinámicas alquiler
│   │   ├── venta-autocaravanas-camper/
│   │   │   └── [location]/page.tsx      # Páginas dinámicas venta
│   │   ├── blog/                        # Blog ES
│   │   ├── contacto/                    # Contacto ES
│   │   ├── vehiculos/                   # Vehículos ES
│   │   ├── tarifas/                     # Tarifas ES
│   │   └── [22 páginas más...]
│   │
│   ├── en/                              # 🇬🇧 INGLÉS (27 carpetas)
│   │   ├── layout.tsx                   # Layout inglés
│   │   ├── page.tsx                     # Home EN
│   │   ├── rent-campervan-motorhome/
│   │   │   └── [location]/page.tsx
│   │   ├── campervans-for-sale-in/
│   │   │   └── [location]/page.tsx
│   │   ├── blog/                        # Blog EN
│   │   ├── contact/                     # Contact EN
│   │   ├── vehicles/                    # Vehicles EN
│   │   ├── rates/                       # Rates EN
│   │   └── [22 páginas más...]
│   │
│   ├── fr/                              # 🇫🇷 FRANCÉS (27 carpetas)
│   │   ├── layout.tsx                   # Layout francés
│   │   ├── page.tsx                     # Home FR
│   │   ├── location-camping-car/
│   │   │   └── [location]/page.tsx
│   │   ├── camping-cars-a-vendre/
│   │   │   └── [location]/page.tsx
│   │   ├── blog/                        # Blog FR
│   │   ├── contact/                     # Contact FR
│   │   ├── vehicules/                   # Véhicules FR
│   │   ├── tarifs/                      # Tarifs FR
│   │   └── [22 páginas más...]
│   │
│   ├── de/                              # 🇩🇪 ALEMÁN (27 carpetas)
│   │   ├── layout.tsx                   # Layout alemán
│   │   ├── page.tsx                     # Home DE
│   │   ├── wohnmobil-mieten/
│   │   │   └── [location]/page.tsx
│   │   ├── wohnmobile-zu-verkaufen/
│   │   │   └── [location]/page.tsx
│   │   ├── blog/                        # Blog DE
│   │   ├── kontakt/                     # Kontakt DE
│   │   ├── fahrzeuge/                   # Fahrzeuge DE
│   │   ├── preise/                      # Preise DE
│   │   └── [22 páginas más...]
│   │
│   ├── reservar/                        # Sistema de reservas (sin idioma)
│   │   ├── page.tsx                     # Búsqueda inicial ⚠️ CRÍTICO
│   │   ├── vehiculo/page.tsx            # Detalle + Extras ⚠️ MUY CRÍTICO
│   │   ├── nueva/page.tsx               # Formulario cliente ⚠️ MUY CRÍTICO
│   │   └── [id]/
│   │       ├── page.tsx                 # Ver reserva ⚠️ CRÍTICO
│   │       ├── pago/page.tsx            # Pasarela ⚠️ CRÍTICO
│   │       └── confirmacion/            # Confirmación ⚠️ CRÍTICO
│   │
│   ├── pago/                            # Flujo de pago (sin idioma)
│   │   ├── exito/page.tsx               # Pago exitoso
│   │   └── error/page.tsx               # Pago fallido
│   │
│   ├── vehiculos/[slug]/                # Páginas individuales de vehículos (sin idioma)
│   ├── ventas/[slug]/                   # Páginas individuales de ventas (sin idioma)
│   ├── faqs/[slug]/                     # FAQs individuales (sin idioma)
│   │
│   ├── administrator/
│   │   ├── (auth)/login/                # Login admin
│   │   ├── (protected)/                 # Páginas protegidas
│   │   │   ├── layout.tsx               # ⚠️ Verifica auth (Server)
│   │   │   ├── page.tsx                 # Dashboard ✅ (Server)
│   │   │   ├── vehiculos/               # ✅ (Client) - usePaginatedData
│   │   │   ├── reservas/                # ✅ (Client) - useAllDataProgressive  
│   │   │   ├── clientes/                # ✅ (Client) - usePaginatedData
│   │   │   ├── pagos/                   # ✅ (Client) - usePaginatedData
│   │   │   ├── extras/                  # ✅ (Client) - useAdminData
│   │   │   ├── equipamiento/            # ✅ (Client) - useAdminData
│   │   │   ├── temporadas/              # ✅ (Client) - useAdminData
│   │   │   ├── ubicaciones/             # ✅ (Client) - useAdminData
│   │   │   └── calendario/              # ✅ (Client) - useAdminData x2
│   │   └── api/
│   │       ├── availability/            # API disponibilidad
│   │       ├── bookings/                # API reservas
│   │       ├── redsys/                  # Webhooks Redsys
│   │       └── stripe/                  # Webhooks Stripe
│   │
│   └── layout.tsx                       # Root layout
│
├── components/
│   ├── admin/                       # Componentes admin (Client)
│   ├── booking/                     # Componentes reserva (search-widget, vehicle-card, no-results-with-alternatives, …)
│   ├── layout/                      # Header, Footer (Client + Server)
│   ├── cookies/                     # Sistema cookies (Client)
│   └── vehicle/                     # Componentes vehículos
│
├── contexts/
│   ├── admin-auth-context.tsx       # ⚠️ Auth admin (Client)
│   └── language-context.tsx         # ⚠️ i18n (Client solo)
│
├── hooks/
│   ├── use-paginated-data.ts        # ⚠️ NO TOCAR - Paginación
│   ├── use-admin-data.ts            # ⚠️ NO TOCAR - Datos admin
│   └── use-all-data-progressive.ts  # ⚠️ NO TOCAR - Carga progresiva
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # ⚠️⚠️⚠️ NO TOCAR - Cliente browser
│   │   ├── server.ts                # ⚠️⚠️⚠️ NO TOCAR - Cliente server
│   │   ├── queries.ts               # ✅ Queries reutilizables
│   │   └── database.types.ts        # Tipos generados
│   │
│   ├── i18n/
│   │   ├── config.ts                # Configuración idiomas
│   │   └── server-translation.ts    # ⚠️ Solo para Server Components
│   │
│   ├── redsys/                      # Integración Redsys
│   ├── stripe/                      # Integración Stripe
│   └── utils.ts                     # Utilidades
│
└── types/
    ├── database.ts                  # Tipos de BD
    └── blog.ts                      # Tipos blog
```

---

## 🔍 DEBUGGING - Cuando Algo No Funciona

### Checklist de Diagnóstico

#### ❌ Error: "Las secciones del admin no cargan"

```bash
# 1. Verifica que el usuario está autenticado
# En consola del navegador:
> localStorage.getItem('supabase.auth.token')
# Debe retornar un objeto JSON con access_token

# 2. Verifica que createClient() crea nueva instancia
# En src/lib/supabase/client.ts debe decir:
export function createClient() {
  return createBrowserClient(...); // ✅ Sin singleton
}

# 3. Verifica que los hooks crean instancia
# Busca en los archivos de hooks:
grep -r "const supabase = createClient()" src/hooks/

# 4. Limpia caché
rm -rf .next
npm run dev
```

#### ❌ Error: "AbortError" o "Query error"

```typescript
// Verifica que TODAS las funciones async crean instancia:

// ❌ MALO
const { data } = await supabase.from('table').select();

// ✅ BUENO  
const supabase = createClient();
const { data } = await supabase.from('table').select();
```

#### ❌ Error: "RLS policy violation"

```sql
-- Ejecuta en SQL Editor:
supabase/fix-all-rls-policies.sql
```

#### ❌ Error: "Cannot read properties of null"

- Verifica que los datos se cargan antes de usarlos
- Añade validaciones: `if (!data) return;`
- Muestra estados de carga apropiados

---

## 💳 Sistema de Pagos Completo (v2.0)

**Estado:** ✅ COMPLETAMENTE OPERATIVO  
**Última actualización:** abril 2026 (PVP Stripe; si faltan menos de 15 días para la recogida sin pago previo → solo 100 % en UI; ver [`docs/02-desarrollo/pagos/SISTEMA-PAGOS.md`](./docs/02-desarrollo/pagos/SISTEMA-PAGOS.md))

### 🎯 Funcionalidades

✅ **Pagos en línea** - Redsys (sin comisión repercutida) + Stripe (comisión ~2 % **incluida en el PVP** de la reserva)  
✅ **Pago fraccionado** - 50 % al reservar y 50 % como máximo 15 días antes de la recogida; **si faltan menos de 15 días para la recogida y no hay pago previo, la UI solo permite el 100 %**  
✅ **Gestión manual** - Transferencias, efectivo, bizum desde admin  
✅ **Fallback automático** - Si notificación falla, se procesa en `/pago/exito`  
✅ **Emails automatizados** - Confirmación al cliente + admin  

### 📚 Documentación Completa

| Documento | Contenido |
|-----------|-----------|
| **[SISTEMA-PAGOS.md](./docs/02-desarrollo/pagos/SISTEMA-PAGOS.md)** | 📖 Guía completa del sistema |
| **[REDSYS-FUNCIONANDO.md](./docs/02-desarrollo/pagos/REDSYS-FUNCIONANDO.md)** | ✅ Estado y configuración Redsys |
| **[REDSYS-CRYPTO-NO-TOCAR.md](./docs/02-desarrollo/pagos/REDSYS-CRYPTO-NO-TOCAR.md)** | ⛔ Firma criptográfica protegida |

### Métodos de Pago

**1. Redsys** (Recomendado - Sin comisión)
- TPV bancario español
- Visa, Mastercard, American Express
- Procesamiento inmediato

**2. Stripe** (+2% comisión)
- Pagos internacionales
- Apple Pay / Google Pay
- UI muestra desglose de precio

**3. Gestión Manual** (Admin)
- Transferencia bancaria
- Efectivo
- Bizum
- Admin marca como completado → Confirma reserva + envía email

### Arquitectura

```
Usuario → Pago exitoso → Redsys notifica servidor
                              ↓
                    ❌ Si notificación falla
                              ↓
            Frontend detecta pago pending en /pago/exito
                              ↓
            Fallback automático procesa el pago
                              ↓
        Payment: completed | Booking: confirmed | Email: ✉️
```

**Archivos críticos (⛔ NO TOCAR):**
- `src/lib/redsys/crypto.ts` - Firma HMAC-SHA256
- `src/lib/redsys/params.ts` - Parámetros comercio
- `src/app/api/redsys/notification/route.ts` - Notificación servidor
- `src/app/api/redsys/verify-payment/route.ts` - Fallback
- `src/app/pago/exito/page.tsx` - Página éxito con fallback

### Gestión Manual desde Admin

**URL:** `/administrator/pagos/[id]`

**Flujo:**
1. Cliente contacta: "Hice transferencia"
2. Admin busca pago pendiente
3. Clic en ojo 👁️ → Detalle
4. Cambiar método: "Transferencia"
5. Cambiar estado: "Completado"
6. Guardar → **Automáticamente:**
   - ✅ Confirma reserva
   - ✅ Envía email al cliente
   - ✅ Registra en notas

---

## 📸 Gestión de Imágenes - Supabase Storage

### 🎯 REGLA ABSOLUTA: Imágenes Dinámicas SOLO en Supabase Storage

**⚠️ NUNCA subir contenido dinámico a `public/`**

La carpeta `public/` es SOLO para:
- ✅ Logos y favicons
- ✅ Iconos de la interfaz
- ✅ Assets estáticos de diseño que nunca cambian

TODO el contenido dinámico (vehículos, blog, extras, localización) DEBE estar en Supabase Storage.

### 📦 Estructura de Buckets

Supabase Storage tiene **4 buckets públicos**:

```
📦 Supabase Storage
│
├── 🚐 vehicles/          → Imágenes de vehículos
│   └── {slug}/
│       ├── principal.webp        (1200x800, 90%)
│       └── galeria_XX.webp       (1200x800, 85%)
│
├── 📝 blog/             → Imágenes del blog
│   └── YYYY/MM/
│       └── imagen.webp           (1200x630, 90%)
│
├── 🎁 extras/           → Imágenes de extras/equipamiento
│   └── nombre.webp               (400x400, 85%)
│
└── 🌍 media/            → Imágenes generales de la web
    ├── locations/                (800x600, 85%)
    │   └── ciudad.webp
    └── slides/                   (1920x1080, 90%)
        └── ciudad_hero.webp
```

### 🛠️ Panel de Administración de Media

**URL:** `/administrator/media`

**Funcionalidades:**
- ✅ Ver contenido de TODOS los buckets
- ✅ Subir/eliminar archivos
- ✅ Crear carpetas
- ✅ Previsualizar imágenes
- ✅ Copiar URL pública
- ✅ Buscar archivos
- ✅ **Optimización automática a WebP** 🎨

### ⚡ Optimización Automática a WebP

**¡TODAS las imágenes se optimizan automáticamente al subirlas!**

**Cómo funciona:**
1. Subes una imagen JPG, PNG o GIF
2. El sistema la convierte automáticamente a WebP
3. La redimensiona según el bucket
4. La sube optimizada a Supabase Storage

**Configuración por bucket:**
- **vehicles**: 2000x1500px, calidad 90% (alta calidad)
- **blog**: 1920x1080px, calidad 85%
- **extras**: 1200x900px, calidad 85%
- **media**: 1920x1080px, calidad 90%

**Ejemplo:**
```
Subes: foto-camper.jpg (5 MB, 4000x3000px)
      ↓
Resultado: foto-camper.webp (720 KB, 2000x1500px)
Ahorro: -84% de espacio ✨
```

**📖 Más información:** [OPTIMIZACION-IMAGENES-AUTOMATICA.md](./OPTIMIZACION-IMAGENES-AUTOMATICA.md)

### 📋 Tabla de Especificaciones

| Bucket | Contenido | Resolución | Calidad | Peso |
|--------|-----------|-----------|---------|------|
| **vehicles** | Vehículos de la flota | 1200x800 | 85-90% | 150-250 KB |
| **blog** | Artículos del blog | 1200x630 | 85-90% | 150-250 KB |
| **extras** | Extras/equipamiento | 400x400 | 85% | 30-60 KB |
| **media/locations** | Tarjetas de ciudades | 800x600 | 85% | 80-120 KB |
| **media/slides** | Hero de localizaciones | 1920x1080 | 90% | 300-500 KB |

### 🔧 Scripts Disponibles

```bash
# ⭐ Re-traducir artículo del blog (ES → EN, FR, DE) - Uso recurrente tras modificar contenido
node translate-blog-content.js <slug-del-articulo>
# Ejemplo: node translate-blog-content.js ruta-en-camper-por-la-toscana-espanola-los-pueblos-de-guadalajara-en-autocaravana

# Migrar imágenes de blog a Supabase
node scripts/migrate-blog-images-to-supabase.js

# Subir imágenes de tarjetas de destinos
node scripts/upload-location-images.js

# Subir imágenes hero de localizaciones
node scripts/upload-hero-slides.js
```

**Documentación de traducciones del blog**: [`docs/SISTEMA-TRADUCCIONES-BLOG.md`](./docs/SISTEMA-TRADUCCIONES-BLOG.md)

### 📚 Documentación Completa

**👉 [GESTION-IMAGENES-SUPABASE.md](./GESTION-IMAGENES-SUPABASE.md)** - Guía completa de gestión de imágenes

**Incluye:**
- ✅ Reglas absolutas de gestión
- ✅ Estructura detallada de cada bucket
- ✅ Especificaciones técnicas completas
- ✅ Referencias en base de datos
- ✅ Flujos de trabajo recomendados
- ✅ Solución de errores comunes

---

## 📝 Base de Datos

### Tablas principales:
- `vehicles` - Vehículos de la flota
- `vehicle_images` - Galería múltiple
- `vehicle_categories` - Categorías
- `equipment` - Equipamiento disponible
- `vehicle_equipment` - Equipamiento por vehículo
- `locations` - Ubicaciones recogida/devolución
- `seasons` - Temporadas y tarifas
- `extras` - Extras disponibles
- `vehicle_available_extras` - Extras por vehículo
- `bookings` - Reservas ⚠️ Tabla crítica
- `booking_extras` - Extras en reservas
- `customers` - Clientes ⚠️ Tabla crítica
- `payments` - Pagos y transacciones
- `admins` - Administradores ⚠️ Para RLS

### RLS (Row Level Security):

**✅ POLÍTICAS ACTIVAS:**
- Usuarios anónimos: Lectura de vehículos, categorías, extras, ubicaciones, temporadas
- Usuarios anónimos: Crear reservas
- Administradores: Acceso total a TODO (verificado con `admins.user_id = auth.uid()`)

**📖 Ver:** `supabase/fix-all-rls-policies.sql` para todas las políticas

---

## 🚀 Despliegue

### ✅ Producción actual: Vercel

**URL**: https://www.furgocasa.com

### Configuración de variables en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
REDSYS_MERCHANT_CODE
REDSYS_TERMINAL
REDSYS_SECRET_KEY
REDSYS_NOTIFICATION_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_TINYMCE_API_KEY
NEXT_PUBLIC_META_PIXEL_ID (opcional)
NEXT_PUBLIC_GA_ID (opcional)
```

---

## 📚 DOCUMENTACIÓN COMPLETA

### 🔴 DOCUMENTOS CRÍTICOS (Leer PRIMERO)

| Documento | Importancia | Cuándo Leer |
|-----------|-------------|-------------|
| **AUDITORIA-SEGURIDAD-SUPABASE-ABRIL-2026.md** | 🔒 **NUEVO** - CRÍTICO | Antes de tocar policies RLS, buckets storage o funciones SQL |
| **AUDITORIA-SEGURIDAD-2026.md** | 🔒 CRÍTICO | Antes de deployar cambios críticos |
| **PENDIENTES-SEGURIDAD.md** | 🔒 CONSULTA CONTINUA | Plan vivo de hardening |
| **REGLAS-ARQUITECTURA-NEXTJS.md** | 🔴 CRÍTICO | Antes de modificar CUALQUIER página |
| **GUIA-TRADUCCION.md** | 🔴 CRÍTICO | Antes de añadir textos traducibles |
| **REGLAS-SUPABASE-OBLIGATORIAS.md** | 🔴 CRÍTICO | Antes de hacer queries |
| **FLUJO-RESERVAS-CRITICO.md** | 🔴 CRÍTICO | Antes de tocar sistema de reservas |
| **CHECKLIST-PRE-COMMIT.md** | 🔴 USAR SIEMPRE | Antes de cada commit |

### 🟠 Documentación Técnica Principal

#### Autenticación y Datos
- **ESTE README.md** - Arquitectura y reglas absolutas
- **CHANGELOG.md** v1.0.4 - Fix del sistema de autenticación y calendario

#### Base de Datos
- **SUPABASE-SCHEMA-REAL.md** - Schema real y actualizado
- **MIGRACION-CLIENTES-NORMALIZADOS.md** - Sistema de clientes actual
- **supabase/README.md** - Guía de Supabase
- **supabase/SETUP.md** - Configuración paso a paso

#### Sistemas Específicos
- **PROCESO-RESERVA-COMPLETO.md** - Flujo de reserva completo
- **GESTION-CLIENTES-OBLIGATORIO.md** - Sistema de clientes
- **PAGINAS-VEHICULOS-GARANTIA.md** - Páginas de vehículos
- **SISTEMA_TEMPORADAS.md** - Temporadas y tarifas
- **SISTEMA-MEDIA-RESUMEN.md** - Gestión de imágenes
- **GALERIA-MULTIPLE-VEHICULOS.md** - Galería de vehículos

#### Pagos
- **[SISTEMA-PAGOS.md](./SISTEMA-PAGOS.md)** - Sistema completo v2.0
- **[REDSYS-FUNCIONANDO.md](./REDSYS-FUNCIONANDO.md)** - Estado Redsys
- **[REDSYS-CRYPTO-NO-TOCAR.md](./REDSYS-CRYPTO-NO-TOCAR.md)** - Firma protegida
- **REDSYS-CONFIGURACION.md** - Configuración Redsys (legacy)
- **STRIPE-CONFIGURACION.md** - Configuración Stripe (legacy)
- **STRIPE-VERCEL-PRODUCCION.md** - Deploy Stripe (legacy)

#### Admin y Optimización
- **ADMIN_SETUP.md** - Setup administrador
- **BUSCADOR-GLOBAL-ADMIN.md** - Buscador global
- **PWA-ADMIN-GUIA.md** - PWA del admin
- **OPTIMIZACION-ADMIN.md** - Optimizaciones

#### SEO
- **[NORMAS-SEO-OBLIGATORIAS.md](./NORMAS-SEO-OBLIGATORIAS.md)** - Normas SEO
- **[SEO-MULTIIDIOMA-MODELO.md](./SEO-MULTIIDIOMA-MODELO.md)** - Modelo SEO con /es/ obligatorio
- **[PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md](./PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md)** - Páginas "Motorhome Europa" diferenciadas
- **[AUDITORIA-SEO-CRITICA.md](./AUDITORIA-SEO-CRITICA.md)** - Impacto SEO

#### Marketing
- **CONFIGURACION-META-PIXEL.md** - Meta Pixel (Facebook)
- **MIGRACION-NEXT-THIRD-PARTIES.md** - Google Analytics (Librería oficial)
- ~~**CONFIGURACION-GOOGLE-ANALYTICS.md**~~ - (Obsoleto - Implementación manual)

#### Otros
- **I18N_IMPLEMENTATION.md** - Sistema i18n
- **TRADUCCIONES.md** - Traducciones
- **DESIGN_SYSTEM.md** - Sistema de diseño
- **RESPONSIVE_STRATEGY.md** - Responsive
- **TINY_EDITOR_README.md** - Editor TinyMCE

### 📑 ÍNDICE COMPLETO

**👉 [INDICE-DOCUMENTACION.md](./INDICE-DOCUMENTACION.md)** - Navegación de TODA la documentación

---

## ⚠️ LECCIONES APRENDIDAS - ERRORES QUE NO REPETIR

### 1. **NO usar Singleton en Cliente Supabase**
- **Error cometido**: Usar `let browserClient` que se crea una vez
- **Consecuencia**: TODAS las secciones del admin dejaron de funcionar
- **Solución**: `createClient()` retorna nueva instancia siempre
- **Commit fix**: `03a61ec` (20 Enero 2026)

### 2. **NO importar `supabase` estáticamente**
- **Error cometido**: `import { supabase }` en componentes
- **Consecuencia**: Sesión congelada, errores de autenticación
- **Solución**: `const supabase = createClient()` dentro de funciones

### 3. **NO omitir createClient() en hooks**
- **Error cometido**: Hooks usaban `supabase` directamente
- **Consecuencia**: Todos los datos fallan al cargar
- **Solución**: Cada `queryFn` crea su instancia

### 4. **NO cargar demasiados IDs en una query**
- **Error cometido**: `.in('booking_id', [100+ IDs])`
- **Consecuencia**: Error 400 - URL demasiado larga
- **Solución**: Dividir en lotes de 50 IDs

### 5. **NO asumir que los datos no son null**
- **Error cometido**: `vehicles.find()` sin validar que vehicles existe
- **Consecuencia**: `Cannot read properties of null`
- **Solución**: Siempre validar: `if (!vehicles) return;`

### 6. **NO modificar código que funciona "para mejorarlo"**
- **Error cometido**: Cambiar a singleton "para optimizar"
- **Consecuencia**: Todo el admin se rompe
- **Solución**: **SI FUNCIONA, NO LO TOQUES**

---

## 🔧 Troubleshooting Rápido

### Problema: Admin no carga datos

**Solución rápida:**
```bash
# 1. Limpia caché
rm -rf .next

# 2. Verifica client.ts
cat src/lib/supabase/client.ts | grep -A5 "createClient"
# Debe decir: return createBrowserClient(...)
# NO debe tener: if (!browserClient)

# 3. Reinicia
npm run dev

# 4. Hard refresh en navegador (Ctrl+Shift+R)
```

### Problema: Meta Pixel error

Añade a `.env.local`:
```
NEXT_PUBLIC_META_PIXEL_ID=tu-pixel-id
```

O ignora el error - no afecta funcionalidad.

### Problema: RLS policy error

```sql
-- Ejecuta en Supabase SQL Editor:
SELECT * FROM supabase/fix-all-rls-policies.sql
```

---

## 📊 Estado Actual de Producción

### ✅ FUNCIONAL AL 100%

| Área | Estado | Última Verificación |
|------|--------|---------------------|
| Sitio público | ✅ | 22 Enero 2026 |
| **Búsqueda de vehículos** | ✅ | 22 Enero 2026 |
| Sistema de reservas | ✅ | 22 Enero 2026 |
| Dashboard admin | ✅ | 22 Enero 2026 |
| Gestión vehículos | ✅ | 22 Enero 2026 |
| Gestión reservas | ✅ | 22 Enero 2026 |
| Gestión clientes | ✅ | 22 Enero 2026 |
| Gestión pagos | ✅ | 22 Enero 2026 |
| Extras | ✅ | 22 Enero 2026 |
| Equipamiento | ✅ | 22 Enero 2026 |
| Temporadas | ✅ | 22 Enero 2026 |
| Ubicaciones | ✅ | 22 Enero 2026 |
| Calendario | ✅ | 22 Enero 2026 |
| Pagos Redsys | ✅ | 22 Enero 2026 |
| Pagos Stripe | ✅ | 22 Enero 2026 |
| Blog/CMS | ✅ | 22 Enero 2026 |
| i18n (ES/EN/FR/DE) | ✅ | 22 Enero 2026 |
| PWA Admin | ✅ | 22 Enero 2026 |
| Google Analytics | ✅ (Librería oficial) | 25 Enero 2026 |

---

## 📞 Soporte y Contacto

Para consultas: [contacto@furgocasa.com](mailto:contacto@furgocasa.com)

---

## 📜 Historial de Versiones

### v4.4.0 (25 Enero 2026) - Migración Google Analytics + Títulos Admin 📊
- 📊 **MIGRACIÓN ANALYTICS**: Cambio a `@next/third-parties/google` (librería oficial)
- ✅ **Títulos personalizados**: Todas las páginas del admin ahora muestran títulos descriptivos en el navegador
  - Dashboard: "Admin - Dashboard | Furgocasa"
  - Reservas: "Admin - Reservas | Furgocasa"
  - Vehículos: "Admin - Vehículos | Furgocasa"
  - (15 páginas totales actualizadas)
- ✅ **Analytics estable**: Sin race conditions, títulos automáticos, fbclid nativo
- ⚠️ **Trade-off**: Se pierde exclusión del admin (solución: filtro por IP en GA)
- 📚 Documentación: `MIGRACION-NEXT-THIRD-PARTIES.md`

### v4.3.0 (25 Enero 2026) - Páginas Motorhome Europa Multiidioma 🌍
- 🌍 **NUEVAS PÁGINAS**: 4 páginas "Motorhome Europa" diferenciadas por audiencia
- ✅ **ES**: Enfoque LATAM (Argentina, México, Chile...)
- ✅ **EN**: Angloparlantes (Australia, USA, UK, Canada...)
- ✅ **FR**: Francoparlantes (Belgique, Suisse, Canada, Afrique...)
- ✅ **DE**: Germanoparlantes (Deutschland, Österreich, Schweiz...)
- ✅ **Blog dinámico**: "Rutas Sugeridas" con artículos traducidos
- ✅ **SEO optimizado**: Meta títulos sin LATAM en EN/FR/DE
- ✅ **Sitemap completo**: XML + HTML en 4 idiomas
- 📚 Documentación: `PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md`

### v4.2.2 (25 Enero 2026) - Optimización LCP Móvil + SEO Perfecto 🚀
- 🏆 **OPTIMIZACIÓN CRÍTICA**: LCP móvil reducido de 3.9s a **0.83s** (-79%)
- ✅ Fix #1: Eliminado preload duplicado (3.9s → 3.2s)
- ✅ Fix #2: `decoding="sync"` + GTM afterInteractive (retraso 490ms → 60ms)
- ✅ Fix #3: Enlaces descriptivos para SEO (**100/100**)
- 🎯 **Resultado**: Top 5% rendimiento web mundial
- 📚 Documentación: `OPTIMIZACION-LCP-MOVIL.md` actualizada con resultados reales

### v4.1.1 (25 Enero 2026) - Fix Crítico Barra Móvil Reservas 🔧
- 🔴 **FIX CRÍTICO**: Error `price_type` en barra flotante móvil con extras
- ✅ Corregido acceso a propiedades de extras en 4 idiomas (ES/EN/FR/DE)
- ✅ Proceso de reserva funciona correctamente en móvil con extras

### v4.1.0 (24 Enero 2026) - Sistema de Cambio de Idioma Mejorado 🌍
- 🌐 **Blog**: Cambio de idioma con slugs traducidos dinámicos desde Supabase
- 📝 **612 slugs de blog generados** (204 posts × 3 idiomas: EN, FR, DE)
- ✅ **BlogRouteDataProvider**: Inyecta slugs traducidos en páginas de blog
- ✅ **Localizaciones**: Mantienen slugs estáticos (ciudades españolas)
- ✅ **Páginas transaccionales**: Cambio de idioma deshabilitado
- ✅ **Traducciones VehicleCard**: Botón "Reservar" traducido en página de búsqueda
- 📚 Documentación: `I18N_IMPLEMENTATION.md`, `GUIA-TRADUCCION.md`

### v4.0.0 (24 Enero 2026) - Arquitectura Carpetas Fijas 🏗️
- 🏗️ **ARQUITECTURA NUEVA**: Migración completa a carpetas fijas por idioma
- ✅ **116 páginas migradas**: 108 estáticas + 8 dinámicas `[location]`
- ✅ **Código simplificado**: -8,419 líneas eliminadas
- ✅ **Middleware**: 540 → 200 líneas (-63%)
- ✅ **Rewrites**: 80 → 40 líneas (-50%)
- ✅ **Carpetas físicas**: `/es/`, `/en/`, `/fr/`, `/de/`
- ✅ **URLs traducidas**: Cada idioma con sus propias URLs
- ✅ **Páginas [location]**: Adaptadas para usar `params` directo
- 📚 Documentación: `MIGRACION-CARPETAS-FIJAS-COMPLETADA.md`

### v3.0.0 (24 Enero 2026) - Arquitectura [locale] Dinámica ⚠️ OBSOLETA
- ⚠️ **REEMPLAZADA POR v4.0.0** - Arquitectura `[locale]` dinámica
- Esta versión fue completamente migrada a carpetas fijas en v4.0.0

### v2.0.1 (24 Enero 2026) - Fix Crítico Schema.org 🔧
- 🔴 **FIX CRÍTICO**: Errores de Schema.org en Google Search Console
- ✅ Páginas de alquiler: Cambio de `Product` a `Service`
- ✅ Páginas de venta: Corrección de `Vehicle` schema
- ✅ Validación correcta en Google Rich Results Test
- 📚 Documentación: `FIX-SCHEMA-PRODUCTO-GOOGLE.md`

### v2.0.0 (24 Enero 2026) - Sistema de Pagos Completo 💳
- ✅ Pagos Redsys + Stripe completamente operativos
- ✅ Fallback automático si notificación falla
- ✅ Gestión manual de pagos desde admin
- ✅ Comisión 2% solo en Stripe (Redsys sin comisión)
- ✅ Emails de confirmación automáticos
- 📚 Documentación: `SISTEMA-PAGOS.md`, `REDSYS-FUNCIONANDO.md`

### v1.0.10 (23 Enero 2026) - Optimización Rendimiento 🔥
- 🔥 **PageSpeed 98/100** en escritorio, **90/100** en móvil
- ✅ Imágenes hero optimizadas: 530KB → 58KB (-89%)
- ✅ Formato AVIF/WebP con caché 1 año
- ✅ Preconnect a Supabase y Google Fonts
- ✅ CSS crítico inline con `critters`
- ✅ Compresión Gzip/Brotli habilitada

### v1.0.9 (22 Enero 2026) - Mejoras SEO Masivas 🚀
- 🔥 **SEO CRÍTICO**: Pre-generación estática de ~320 páginas con `generateStaticParams`
- ✅ Localizaciones: 232 rutas pre-generadas (alquiler + venta × 4 idiomas)
- ✅ Blog: Todos los posts pre-generados (sin límite)
- ✅ Vehículos venta: Cambio de `force-dynamic` a ISR
- ✅ Títulos páginas venta: Meta títulos desde Supabase
- ✅ Traducciones páginas venta: FR/DE completas
- ✅ Hero image por localización: Imagen personalizada desde `location_targets.hero_image`

### v1.0.8 (22 Enero 2026) - Fix Crítico Búsqueda y SEO
- 🔴 **FIX CRÍTICO**: Página `/buscar` restaurada (VehicleCard props incorrectas)
- ✅ SearchSummary con fondo azul y cálculo de días
- ✅ CSP actualizado para Google Analytics
- ✅ Campos de fecha iOS Safari con ancho correcto

### v1.0.7 (21 Enero 2026) - Layout Condicional
- ✅ ConditionalLayout para admin vs público
- ✅ Imágenes hero migradas a Supabase Storage
- ✅ Eliminado PublicLayout duplicado

### v1.0.6 (20 Enero 2026) - Refactorización Layout
- ✅ Header/Footer global en layout.tsx
- ✅ Header sticky en lugar de fixed
- ✅ 40+ páginas limpiadas

### v1.0.5 (20 Enero 2026) - Unificación Vehículos Home
- ✅ Imágenes funcionando en Home
- ✅ Diseño consistente toda la web

### v1.0.4 (20 Enero 2026) - Fix Crítico Autenticación
- 🔴 **FIX CRÍTICO**: Eliminado singleton en cliente Supabase
- ✅ Todas las secciones del administrador funcionando

### v1.0.3 (19 Enero 2026) - Sistema Dual de Pagos
- ✅ Integración completa de Stripe + Redsys

### v1.0.0 (16 Enero 2026) - Deploy Inicial
- ✅ Primera versión en producción

**📋 Ver [CHANGELOG.md](./CHANGELOG.md) para historial completo**

---

Desarrollado con ❤️ para Furgocasa

**Versión**: 4.4.0 - Migración Google Analytics + Títulos Admin  
**Estado**: ✅ Producción Estable  
**URL**: https://www.furgocasa.com  
**PageSpeed Desktop**: 99/100 (LCP: 0.9s)  
**PageSpeed Mobile**: 92/100 (LCP: **0.83s**) 🏆  
**SEO**: 100/100 ✅  
**Última actualización**: 23 de marzo de 2026 (cron recordatorio devolución; i18n tarifas completa; cupones por fecha recogida)  

---

## ⚡ Quick Start

```bash
# 1. Instalar
npm install

# 2. Configurar
cp .env.example .env.local
# Edita .env.local con tus credenciales

# 3. Base de datos
# Ejecuta scripts SQL en Supabase (ver sección Instalación)

# 4. Crear admin
# Ejecuta SQL para crear primer usuario admin

# 5. Iniciar
npm run dev

# 6. Acceder
# Público: http://localhost:3000
# Admin: http://localhost:3000/administrator
```

**¿Problemas?** → Revisa sección "Troubleshooting Rápido" arriba
