# 📚 ÍNDICE MAESTRO DE DOCUMENTACIÓN - Furgocasa

**Versión**: 1.0.25 ✅ PRODUCCIÓN — tracking GTM ecommerce sin doble conteo + funnel completo  
**URL**: https://www.furgocasa.com  
**Última actualización**: 29 de abril, 2026

Este documento es tu punto de partida para encontrar cualquier documentación del proyecto.

---

## 📊 ACTUALIZACIÓN ABRIL 2026 — TRACKING GTM ECOMMERCE: FIX DOBLE CONTEO + FUNNEL COMPLETO

| Tema | Dónde leer |
|------|------------|
| Esquema completo de eventos GA4 (`generate_lead`, `begin_checkout`, `add_payment_info`, `purchase`, `additional_payment_received`), payload `ecommerce`, dedup en `localStorage`, regla anti-doble-conteo en flujo 50 % + 50 % | **[CONFIGURACION-GOOGLE-ANALYTICS.md](./02-desarrollo/analytics/CONFIGURACION-GOOGLE-ANALYTICS.md)** — sección *Eventos Ecommerce GTM* |
| Referencia cruzada en el índice analytics (estado, fecha, lista de eventos disparados) | **[INDICE-DOCUMENTACION-ANALYTICS.md](./02-desarrollo/analytics/INDICE-DOCUMENTACION-ANALYTICS.md)** |
| Mención en el sistema de pagos (qué evento se dispara en cada paso del flujo) | **[SISTEMA-PAGOS.md](./02-desarrollo/pagos/SISTEMA-PAGOS.md)** — sección *Tracking GTM ecommerce* |
| Archivos modificados (16 en 4 idiomas), motivación, regla GTM container (Ads conv. SOLO en `purchase`) | **CHANGELOG** (entrada 29 abr 2026 📊) · **[README raíz](../README.md)** — sección *Abril 2026 — Tracking GTM ecommerce…* |

---

## ✉️ ACTUALIZACIÓN ABRIL 2026 — AVISO DE HORA FLEXIBLE EN EL RECORDATORIO DE DEVOLUCIÓN

| Tema | Dónde leer |
|------|------------|
| Asterisco rojo `(*)` junto a la hora + nota explicativa en rojo bajo la tabla "Tu devolución" para evitar que los clientes se asusten cuando se les ha ampliado verbalmente el margen de devolución | **[SISTEMA-EMAILS.md](./04-referencia/emails/SISTEMA-EMAILS.md)** — sección *4. Recordatorio de Devolución* |
| Plantilla actualizada (`getReturnReminderTemplate`) y maqueta espejo sincronizada | `src/lib/email/templates.ts` (líneas ~782-797) · `mailing/app/04-recordatorio-devolucion.html` |
| Script de prueba sin admin (envía solo a `reservas@furgocasa.com`) | `scripts/test-return-reminder-email.ts` — uso: `npx tsx scripts/test-return-reminder-email.ts [BOOKING_NUMBER]` |
| Resumen en README raíz | **[README raíz](../README.md)** — sección *Abril 2026 — Aviso de hora flexible…* · **CHANGELOG** (entrada 29 abr 2026, ✉️) |

---

## 🔴 ACTUALIZACIÓN ABRIL 2026 — REGLA "ÚLTIMA PENDING GANA" + RGPD EN MENSAJES

| Tema | Dónde leer |
|------|------------|
| Regla de negocio (las pendings no bloquean; al crear una nueva reserva, las pendings solapantes se auto-cancelan) | **[SISTEMA-PREVENCION-CONFLICTOS.md](./04-referencia/sistemas/SISTEMA-PREVENCION-CONFLICTOS.md)** — sección *Regla "última pending gana"* |
| Cronología, causa raíz, archivos modificados, pruebas | **[CORRECCION-PENDING-OVERRIDE-Y-RGPD-2026-04-29.md](./03-mantenimiento/fixes/CORRECCION-PENDING-OVERRIDE-Y-RGPD-2026-04-29.md)** |
| Trigger SQL: ya no bloquea pendings, ya no expone `customer_name` (RGPD) | `supabase/migrations/20260429-prevent-conflicts-pending-rgpd.sql` + `supabase/migrations/prevent-booking-conflicts.sql` |
| Endpoint: cancelación automática + mensajes genéricos | `src/app/api/bookings/create/route.ts` |

---

## 🔴 ACTUALIZACIÓN ABRIL 2026 — FIX CRÍTICO DOBLE RESERVA (FILTRO `payment_status`)

| Tema | Dónde leer |
|------|------------|
| Resumen ejecutivo del incidente, causa raíz y solución (7 endpoints + RPC + trigger) | **[CORRECCION-DOBLE-RESERVA-2026-04-27.md](./03-mantenimiento/fixes/CORRECCION-DOBLE-RESERVA-2026-04-27.md)** |
| Regla unificada (`status IN ('confirmed','in_progress','completed')` bloquea, sin importar `payment_status`); 4 capas de protección coherentes | **[SISTEMA-PREVENCION-CONFLICTOS.md](./04-referencia/sistemas/SISTEMA-PREVENCION-CONFLICTOS.md)** — sección *Regla Clave (actualizada 29/04/2026)* |
| Migración SQL de la RPC `check_vehicle_availability` | `supabase/migrations/20260427-fix-availability-by-status.sql` |
| Migración SQL: policies RLS en `booking_price_changes` (auditoría de cambios de precio) | `supabase/migrations/20260427-fix-rls-booking-price-changes.sql` |
| Trigger `prevent_booking_conflicts` (verificación e instalación en producción) | `supabase/migrations/prevent-booking-conflicts.sql` + sección *Capa 3* en SISTEMA-PREVENCION-CONFLICTOS.md |

---

## 📅 ACTUALIZACIÓN ABRIL 2026 — CALENDARIO ADMIN: REASIGNACIÓN ÁGIL + EDICIÓN INLINE

| Tema | Dónde leer |
|------|------------|
| Reservas sin vehículo asignado (`bookings.vehicle_id` nullable), filas «Sin asignar N» en el Gantt, banner de pendientes, edición inline del modal (estado, vehículo, fechas, horas, ubicaciones), detección de conflictos al reasignar, safeguards por estado | **[CALENDARIO-ADMIN-EDICION.md](./04-referencia/admin/CALENDARIO-ADMIN-EDICION.md)** |
| Fix `total_price` al editar: debía incluir `stripe_fee_total` acumulado (bloqueaba guardado con `max` del input) + script de reparación puntual | **[CALENDARIO-ADMIN-EDICION.md](./04-referencia/admin/CALENDARIO-ADMIN-EDICION.md)** — sección *Fix: `total_price` debe incluir `stripe_fee_total`* |
| Migraciones SQL: `supabase/migrations/20260417-allow-null-vehicle-in-bookings.sql`, `supabase/migrations/20260417-fix-booking-16bf1a08-total-price.sql` | Mismo doc, sección *Migración SQL* |
| Resumen en README raíz | **[README raíz](../README.md)** — sección *Abril 2026 — Calendario admin* · **CHANGELOG** (entrada 17 abr 2026 tarde) |

---

## 🖼️ ACTUALIZACIÓN ABRIL 2026 — PORTADAS IA DEL BLOG (WEBP + REFERENCIAS)

| Tema | Dónde leer |
|------|------------|
| Flujo técnico (`gpt-5.4`, `gpt-image-2`, `sharp` → WebP, bucket `blog/ai-covers/`, `images/IA_blog/`, reglas toldo, CLI y variables `.env`) | **[GESTION-MEDIA-STORAGE.md](./02-desarrollo/media/GESTION-MEDIA-STORAGE.md)** — sección *Portadas del blog generadas por IA* |
| Organización en FAQ | **[FAQ-MEDIA-STORAGE.md](./02-desarrollo/media/FAQ-MEDIA-STORAGE.md)** — *¿Cómo organizo las imágenes del blog?* |
| Resumen ejecutivo y comandos | **[README raíz](../README.md)** — sección *Abril 2026 — Portadas IA del blog* · **`agente generador de imágenes.txt`** (raíz del repo) |

---

## 💳 ACTUALIZACIÓN ABRIL 2026 — PAGO INICIAL 50 % DESHABILITADO SI LA RECOGIDA ES EN MENOS DE 15 DÍAS

| Tema | Dónde leer |
|------|------------|
| Regla de negocio, rutas por idioma (`es`/`en`/`de`/`fr`), referencia `COMPANY.rentalPolicy.bookingPayment` | **[SISTEMA-PAGOS.md](./02-desarrollo/pagos/SISTEMA-PAGOS.md)** — sección *Política contractual y excepción (menos de 15 días)* |
| Misma política en contexto Redsys | **[REDSYS-CONFIGURACION.md](./02-desarrollo/pagos/REDSYS-CONFIGURACION.md)** |
| Paso pasarela en el flujo de reserva | **[FLUJO-RESERVAS-CRITICO.md](./04-referencia/sistema-reservas/FLUJO-RESERVAS-CRITICO.md)** |
| Resumen en README raíz | **[README raíz](../README.md)** — sección *Abril 2026 — Pago 100 % obligatorio…* · **CHANGELOG** (entrada 9 abr 2026) |

---

## 🚐 ACTUALIZACIÓN MARZO 2026 — LISTADOS DE VEHÍCULOS (UI)

| Tema | Dónde leer |
|------|------------|
| Grid flota (un solo título, sin duplicar marca/modelo), ventas (badges año/km), búsqueda (transmisión en tarjeta), `isAutomaticTransmission()` | **[PAGINAS-VEHICULOS-GARANTIA.md](./04-referencia/vehiculos/PAGINAS-VEHICULOS-GARANTIA.md)** (sección *Listados en grid*) |
| Resumen en README raíz | Sección *Marzo 2026 — Listados de vehículos* |

---

## 🔍 ACTUALIZACIÓN MARZO 2026 — BÚSQUEDA SIN RESULTADOS (FECHAS ALTERNATIVAS)

| Tema | Dónde leer |
|------|------------|
| API `/api/availability/alternatives`, `no-results-with-alternatives.tsx`, precios `rental-search-pricing`, i18n, orden bloque tarifas «Puntualidad», `emails/mailing/` en `.gitignore` | **[README raíz](../README.md)** — sección *Marzo 2026 — Búsqueda sin resultados: fechas alternativas* · **CHANGELOG** (entrada 22 mar 2026) |

---

## 🧾 ACTUALIZACIÓN MARZO 2026 — STRIPE (PVP) Y EXTRAS EN ADMIN

| Tema | Dónde leer |
|------|------------|
| Comisión Stripe como parte del PVP total (`bookings.total_price`, `stripe_fee_total`, `payments.stripe_fee`) | **[SISTEMA-PAGOS.md](./02-desarrollo/pagos/SISTEMA-PAGOS.md)** · **[STRIPE-CONFIGURACION.md](./02-desarrollo/pagos/STRIPE-CONFIGURACION.md)** |
| SQL columnas Supabase (`stripe_fee_total`, `stripe_fee`) | Sección *PVP y columnas de comisión* en **STRIPE-CONFIGURACION.md** |
| Cálculo de precio de extras (`extraLineUnitPriceEuros`, `price_type` vs `price_per_unit`) | **README** (raíz del repo), sección *Marzo 2026* · **SUPABASE-SCHEMA-REAL.md** (`extras`, `booking_extras`) |

---

## 🗺️ ACTUALIZACIÓN MARZO 2026 — LANDINGS ALQUILER (`location_targets`)

**Estado documentado en código y docs** (comprobar tu BD: `npm run check:location-targets-db`):

| Dato | Valor |
|------|--------|
| Targets activos | **59** |
| Provincia Murcia | **14** slugs |
| Anillo Madrid / Alicante / Albacete | **22** slugs |
| Hellín | slug `hellin` (recogida Albacete) |
| Contenido IA | `npm run generate-content:all` / `:ring` / `:thin` — ver **[GENERACION-CONTENIDO-IA.md](./04-referencia/otros/GENERACION-CONTENIDO-IA.md)** |
| Metas rent ES + i18n | `node scripts/update-location-targets-rent-meta.js` |
| Migraciones SQL (ej.) | `20260321-location-targets-nearest-pickup-sync.sql`, `20260322-location-target-hellin.sql`, `20260323-location-targets-ring-madrid-alicante-albacete.sql` |

---

## 🚗 VERSIÓN 1.0.16 - SISTEMA DE VEHÍCULOS VENDIDOS (12 Feb 2026)

**✅ ESTADO: COMPLETADO** - Estado definitivo para vehículos vendidos con exclusión de operaciones activas.

**NUEVA FUNCIONALIDAD**: Marcar vehículos como vendidos de forma independiente (no requiere estar "en venta").
- **Modal de confirmación** detallado al marcar vendido
- **Botón "Revertir venta"** para casos excepcionales (arras canceladas)
- **Toggle "Mostrar vendidos"** en lista vehículos y daños
- **Informes**: Muestran TODOS los vehículos (incluidos vendidos) para histórico completo

Ver **[SISTEMA-VEHICULOS-VENDIDOS.md](./04-referencia/vehiculos/SISTEMA-VEHICULOS-VENDIDOS.md)** para detalles completos.

### 🎯 Highlights v1.0.16:
- ✅ Estado vendido independiente de "en venta"
- ✅ Exclusión automática: calendario, disponibilidad, nueva reserva
- ✅ Informes con histórico completo + indicadores visuales rojos
- ✅ Daños: vendidos ocultos por defecto con toggle

---

## 🇲🇦 VERSIÓN 1.0.15 - PÁGINAS MOTORHOME MARRUECOS MULTIIDIOMA

**✅ ESTADO: COMPLETADO** - 4 nuevas páginas SEO para captar viajeros a Marruecos.

**NUEVA FUNCIONALIDAD**: Páginas específicas para alquiler motorhome a Marruecos desde España.
- **Audiencia**: Internacional (europeos, americanos, australianos)
- **Destino**: Marruecos (Tánger, Marrakech, Desierto del Sahara)
- **Diferencia clave**: SIN descuento LATAM (exclusivo páginas Europa)

Ver **[PAGINAS-MOTORHOME-MARRUECOS-MULTIIDIOMA.md](./PAGINAS-MOTORHOME-MARRUECOS-MULTIIDIOMA.md)** (v1.0.0) para detalles completos.

### 🎯 Highlights v1.0.15:
- ✅ **4 páginas nuevas**: ES/EN/FR/DE específicas para Marruecos
- ✅ **Información ferry**: 3 opciones (Tarifa 35min, Algeciras 1h, Almería 3-4h)
- ✅ **Documentación incluida**: Carta Verde, autorización, docs aduana
- ✅ **Rutas por Marruecos**: Norte, Imperial, Costa, Desierto
- ✅ **Sin descuento LATAM**: Diferenciador clave vs páginas Europa
- ✅ **SEO optimizado**: Canonical + hreflang configurados, sitemap priority 0.9

### 🌐 URLs Creadas:
```
/es/alquiler-motorhome-marruecos-desde-espana
/en/motorhome-rental-morocco-from-spain
/fr/camping-car-maroc-depuis-espagne
/de/wohnmobil-miete-marokko-von-spanien
```

### 🔧 Archivos Creados/Modificados:
```
src/app/es/alquiler-motorhome-marruecos-desde-espana/page.tsx (683 líneas)
src/app/en/motorhome-rental-morocco-from-spain/page.tsx (681 líneas)
src/app/fr/camping-car-maroc-depuis-espagne/page.tsx (681 líneas)
src/app/de/wohnmobil-miete-marokko-von-spanien/page.tsx (681 líneas)
src/lib/route-translations.ts                            (rutas Marruecos añadidas)
src/app/sitemap.ts                                       (entrada con priority 0.9)
```

### 📈 Impacto SEO Esperado:
- **Keywords objetivo**: "motorhome rental morocco", "camping-car maroc", "wohnmobil marokko"
- **Volumen búsqueda**: ~700 búsquedas/mes (total 4 idiomas)
- **ROI esperado**: +20-30% tráfico internacional en 3-6 meses (8 páginas: 4 Europa + 4 Marruecos)

### 🔗 Commit:
- `8c54fb2` - feat(seo): añadir páginas multiidioma Motorhome Marruecos

---

## 🌍 VERSIÓN 1.0.14 - BLOG MULTIIDIOMA TOTALMENTE FUNCIONAL

**✅ ESTADO: COMPLETADO** - URLs, títulos y excerpts traducidos en todo el blog.

**MEJORAS IMPLEMENTADAS**: Sistema completo de traducción para el blog.
- **URLs traducidas**: Slugs específicos por idioma (`slug_fr`, `slug_en`, `slug_de`)
- **Contenido traducido**: Títulos y excerpts desde `content_translations`
- **Páginas afectadas**: Blog principal (`/blog`) + Páginas Motorhome Europa
- **Fallback inteligente**: Usa español si no hay traducción disponible

Ver **[PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md](./PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md)** (v1.1.0) para detalles completos.

### 🎯 Highlights v1.0.14:
- ✅ **URLs SEO-friendly**: `/fr/blog/itineraires/noels-differents...` (no español)
- ✅ **Títulos traducidos**: Desde `content_translations` con `source_field='title'`
- ✅ **Excerpts traducidos**: Desde `content_translations` con `source_field='excerpt'`
- ✅ **4 errores críticos corregidos**: Queries incorrectas, columnas inexistentes
- ✅ **Sistema unificado**: Misma lógica en blog principal y páginas especiales

### 🔧 Archivos Modificados:
```
src/lib/home/server-actions.ts          - Query content_translations corregida
src/components/blog/blog-article-link.tsx - Selección slug traducido
src/components/blog/blog-list-client.tsx  - URLs con slugs traducidos
src/components/blog/blog-content.tsx      - Fetch slugs + traducciones
```

### 🐛 Errores Corregidos:
1. **Query incorrecta**: Usaba `language` en vez de `locale`
2. **Columnas inexistentes**: Buscaba `translated_title` en vez de `source_field + translated_text`
3. **Slugs en español**: Links usaban `article.slug` en todos los idiomas
4. **Títulos sin traducir**: No consultaba `content_translations`

---

## 🌍 VERSIÓN 1.0.13 - PÁGINAS MOTORHOME EUROPA MULTIIDIOMA

**✅ ESTADO: TOTALMENTE FUNCIONAL** - 4 páginas diferenciadas por audiencia.

**NUEVA FUNCIONALIDAD**: Páginas estáticas para viajeros internacionales.
- **ES**: Enfoque LATAM (Argentina, México, Chile, Colombia...)
- **EN**: Angloparlantes (Australia, USA, UK, Canada...)
- **FR**: Francoparlantes (Belgique, Suisse, Canada, Afrique...)
- **DE**: Germanoparlantes (Deutschland, Österreich, Schweiz...)

Ver **[PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md](./PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md)** para detalles completos.

### 🎯 Highlights v1.0.13:
- ✅ **4 páginas diferenciadas**: ES/EN/FR/DE con audiencias específicas
- ✅ **Blog dinámico integrado**: "Rutas Sugeridas" carga artículos traducidos
- ✅ **SEO optimizado**: Meta títulos sin "LATAM" en EN/FR/DE
- ✅ **Descuento -15%**: Exclusivo para LATAM (solo página ES)
- ✅ **Sitemap completo**: XML + HTML en 4 idiomas

---

## 🎟️ VERSIÓN 1.0.12 - SISTEMA DE CUPONES DE DESCUENTO

**✅ ESTADO: TOTALMENTE FUNCIONAL** - Sistema completo de cupones implementado.

**NUEVA FUNCIONALIDAD**: Cupones de descuento para el proceso de reserva.
- **gift**: Un solo uso, personalizados (ej: `RAMON20`)
- **permanent**: Múltiples usos, promociones (ej: `INV2026`)

Ver **[SISTEMA-CUPONES.md](./SISTEMA-CUPONES.md)** para detalles completos.

### 🎯 Highlights v1.0.12:
- ✅ **Panel Admin**: Nueva sección `/administrator/cupones`
- ✅ **Validación en tiempo real**: API `/api/coupons/validate`
- ✅ **Integración reservas**: Campo de cupón en `/reservar/nueva`
- ✅ **Cupón INV2026 activo**: 15% descuento, mín 10 días, hasta 20 marzo

### 📦 SQL a ejecutar:
```
01-create-coupons-table.sql
02-create-coupon-usage-table.sql
03-add-coupon-columns-to-bookings.sql
04-create-coupon-validation-function.sql
05-setup-coupon-rls-policies.sql
06-insert-sample-coupons.sql
```

---

## 🔴 VERSIÓN 1.0.11 - FIX CRÍTICO ERROR 500 VEHÍCULOS

**✅ ESTADO: TOTALMENTE FUNCIONAL** - Páginas de detalle de vehículos restauradas.

**PROBLEMA RESUELTO**: Las páginas `/vehiculos/[slug]` y `/ventas/[slug]` devolvían error 500. Múltiples causas: cliente Supabase incorrecto, problemas de ISR/caché, headers() fallando.

**SOLUCIÓN**: Renderizado 100% dinámico + cliente Supabase universal.

Ver **[FIX-ERROR-500-VEHICULOS.md](./FIX-ERROR-500-VEHICULOS.md)** para detalles completos.

### 🎯 Highlights v1.0.11:
- ✅ **Cliente Supabase universal**: `@supabase/supabase-js` en lugar de `createBrowserClient`
- ✅ **Renderizado dinámico**: `force-dynamic` para evitar problemas de caché
- ✅ **Middleware actualizado**: Exclusiones para sw-admin.js, workbox, manifests
- ✅ **Try-catch headers()**: Fallback cuando no está disponible

### ⚠️ Lección Aprendida:
- **NO usar `createBrowserClient`** en Server Components
- **Páginas con middleware i18n** funcionan mejor con `force-dynamic`
- **Service Workers no toleran redirecciones** - excluir del middleware

---

## 🔧 VERSIÓN 1.0.8 - FIX CRÍTICO BÚSQUEDA Y SEO

**✅ ESTADO: TOTALMENTE FUNCIONAL** - Página de búsqueda y Analytics restaurados.

**PROBLEMA RESUELTO**: La página `/buscar` dejó de funcionar tras la auditoría SEO de metatítulos. Al separar componentes client/server, se simplificaron incorrectamente las props del `VehicleCard`. **AHORA FUNCIONA CORRECTAMENTE**.

Ver **[CHANGELOG.md](./CHANGELOG.md)** para:
- 🔧 **v1.0.8 (ACTUAL)**: Fix crítico búsqueda + CSP Google Analytics
- 🎨 **v1.0.7**: Layout condicional admin vs público
- 🏗️ **v1.0.6**: Refactorización layout global
- 🎨 **v1.0.5**: Unificación visualización vehículos Home
- 🔴 **v1.0.4**: Fix crítico sistema autenticación - Eliminado singleton
- ✅ **v1.0.3**: Sistema dual de pagos (Redsys + Stripe)

### 🎯 Highlights v1.0.8:
- ✅ **VehicleCard restaurado**: Props `pricing` y `searchParams` correctas
- ✅ **SearchSummary completo**: Fondo azul, cálculo de días funcional
- ✅ **CSP actualizado**: Google Analytics sin errores de bloqueo
- ✅ **iOS Safari fix**: Campos de fecha con ancho correcto en formulario de reserva

### ⚠️ Lección Aprendida:
Al refactorizar código para SEO (separar client/server), **copiar exactamente** el código original. No simplificar ni "mejorar" durante la refactorización.

---

## 🔴 VERSIÓN 1.0.4 - FIX CRÍTICO AUTENTICACIÓN

**✅ ESTADO: TOTALMENTE FUNCIONAL** - Fix crítico del sistema de autenticación aplicado.

**PROBLEMA RESUELTO**: TODAS las secciones del administrador dejaron de funcionar debido a un patrón singleton en el cliente Supabase. **AHORA TODAS FUNCIONAN**.

### 🚨 Highlights v1.0.4:
- 🔴 **FIX CRÍTICO**: Eliminado singleton en `src/lib/supabase/client.ts`
- ✅ **TODAS las secciones del admin funcionando**: Vehículos, Reservas, Clientes, Pagos, Extras, Equipamiento, Temporadas, Ubicaciones, Calendario
- ✅ **Calendario optimizado**: Carga en lotes de booking_extras
- ✅ **Meta Pixel**: Carga condicional sin errores
- ✅ **Validaciones**: Checks de null antes de usar datos

**⚠️ LECCIÓN APRENDIDA**: SI ALGO FUNCIONA, NO LO TOQUES. Ver `README.md` sección "Reglas Absolutas".

---

## 🚨 DOCUMENTOS CRÍTICOS - LEER PRIMERO

**⚠️ OBLIGATORIO leer antes de modificar cualquier código**

| Documento | Descripción | Cuándo leer |
|-----------|-------------|-------------|
| **[README.md](./README.md)** | Punto de entrada principal, arquitectura completa | **SIEMPRE PRIMERO** |
| **[CHANGELOG.md](./CHANGELOG.md)** | Historial versiones, **v1.0.11 FIX ERROR 500** | Al debuggear o deployar |
| **[AUDITORIA-SEGURIDAD-2026.md](./03-mantenimiento/AUDITORIA-SEGURIDAD-2026.md)** | 🔒 **NUEVO** - Auditoría completa de seguridad | Antes de deployar cambios críticos |
| **[ATAQUES-EXTERNOS-AMENAZAS.md](./03-mantenimiento/ATAQUES-EXTERNOS-AMENAZAS.md)** | 🔒 **NUEVO** - Análisis de amenazas externas | Para entender riesgos de seguridad |
| **[FIX-ERROR-500-VEHICULOS.md](./FIX-ERROR-500-VEHICULOS.md)** | 🔴 **FIX CRÍTICO** - Error 500 páginas vehículos | Si falla `/vehiculos/[slug]` o `/ventas/[slug]` |
| **[REGLAS-ARQUITECTURA-NEXTJS.md](./REGLAS-ARQUITECTURA-NEXTJS.md)** | ⚠️ **INCLUYE REGLAS DE SUPABASE CLIENT** | Antes de tocar CUALQUIER código |
| **[REGLAS-SUPABASE-OBLIGATORIAS.md](./REGLAS-SUPABASE-OBLIGATORIAS.md)** | ⚠️ **REGLAS OBLIGATORIAS** - Queries a Supabase | ANTES de hacer ANY query |
| **[SUPABASE-SCHEMA-REAL.md](./SUPABASE-SCHEMA-REAL.md)** | Schema real con campos exactos | Al consultar tablas |
| **[PAGINAS-VEHICULOS-GARANTIA.md](./PAGINAS-VEHICULOS-GARANTIA.md)** | ⚠️ Garantía páginas vehículos | Antes de tocar `/vehiculos/**`, `/ventas/**` o `/reservar/vehiculo` |
| **[SISTEMA-VEHICULOS-VENDIDOS.md](./04-referencia/vehiculos/SISTEMA-VEHICULOS-VENDIDOS.md)** | 🚗 **NUEVO** - Estado vendido e informes | Admin vehículos, calendario, informes, daños |
| **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** | ⚠️ Gestión de clientes | Antes de tocar `/reservar/nueva` o formularios de cliente |
| **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** | ⚠️ **CORE DEL NEGOCIO** - Flujo de reservas | Antes de tocar /reservar/** |
| **[SISTEMA-CUPONES.md](./SISTEMA-CUPONES.md)** | 🎟️ Sistema de cupones de descuento | Antes de tocar cupones o `/reservar/nueva` |
| **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** | Sistema de traducción dual | Cuando uses `t()` |
| **[CHECKLIST-PRE-COMMIT.md](./CHECKLIST-PRE-COMMIT.md)** | Verificación pre-commit | Antes de cada commit |

---

## 📖 DOCUMENTACIÓN POR ÁREA

### 🔐 **Autenticación y Sistema de Datos (CRÍTICO)**

| Documento | Descripción |
|-----------|-------------|
| **[CHANGELOG.md](./CHANGELOG.md)** | Fix crítico sistema autenticación v1.0.4 (ver sección v1.0.4) |
| **[CONFIGURACION-META-PIXEL.md](./CONFIGURACION-META-PIXEL.md)** | Configuración Meta Pixel con carga condicional |
| **[CONFIGURACION-GOOGLE-ANALYTICS.md](./CONFIGURACION-GOOGLE-ANALYTICS.md)** | Configuración Google Analytics (G-G5YLBN5XXZ) con exclusión de páginas admin |
| **README.md** | Sección "Sistema de Autenticación - CÓMO FUNCIONA" |

### 🔒 **Seguridad (NUEVO - Febrero 2026)**

| Documento | Descripción |
|-----------|-------------|
| **[AUDITORIA-SEGURIDAD-2026.md](./03-mantenimiento/AUDITORIA-SEGURIDAD-2026.md)** | ⚠️ **NUEVO** - Auditoría completa de seguridad con vulnerabilidades identificadas |
| **[ATAQUES-EXTERNOS-AMENAZAS.md](./03-mantenimiento/ATAQUES-EXTERNOS-AMENAZAS.md)** | ⚠️ **NUEVO** - Análisis detallado de amenazas externas y vectores de ataque |
| **[CORRECCIONES-SEGURAS-SIN-AFECTAR.md](./03-mantenimiento/CORRECCIONES-SEGURAS-SIN-AFECTAR.md)** | ⚠️ **NUEVO** - Estrategia de correcciones de seguridad sin afectar funcionalidad |
| **[GUIA-CAMBIAR-TOKEN-CALENDARIO.md](./03-mantenimiento/GUIA-CAMBIAR-TOKEN-CALENDARIO.md)** | ⚠️ **NUEVO** - Guía paso a paso para cambiar tokens de calendario en Vercel |

### 🌍 Internacionalización (i18n)

| Documento | Descripción |
|-----------|-------------|
| **[I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md)** | Sistema de URLs localizadas, middleware |
| **[TRADUCCIONES.md](./TRADUCCIONES.md)** | Traducciones estáticas, diccionario |
| **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** | Sistema dual translateServer vs useLanguage |

### 🔍 SEO

| Documento | Descripción |
|-----------|-------------|
| **[SEO-MULTIIDIOMA-MODELO.md](./SEO-MULTIIDIOMA-MODELO.md)** | ⚠️ **CRÍTICO** - Modelo SEO multiidioma con /es/ obligatorio |
| **[PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md](./PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md)** | ⚠️ **NUEVO** - Páginas "Motorhome Europa" diferenciadas por audiencia |
| **[AUDITORIA-SEO-CRITICA.md](./AUDITORIA-SEO-CRITICA.md)** | Por qué Server Components son críticos |
| **[NORMAS-SEO-OBLIGATORIAS.md](./NORMAS-SEO-OBLIGATORIAS.md)** | Normas SEO del proyecto |

### 👨‍💼 Administración

| Documento | Descripción |
|-----------|-------------|
| **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** | Configuración inicial, roles |
| **[BUSCADOR-GLOBAL-ADMIN.md](./BUSCADOR-GLOBAL-ADMIN.md)** | Buscador global inteligente |
| **[PWA-ADMIN-GUIA.md](./PWA-ADMIN-GUIA.md)** | ⚠️ **NUEVO** - PWA para panel de administrador |
| **[ICONOS-PWA.md](./ICONOS-PWA.md)** | Generación de iconos para PWA |

### 🖼️ Sistema de Medios y Storage

| Documento | Descripción |
|-----------|-------------|
| **[GESTION-IMAGENES-SUPABASE.md](./GESTION-IMAGENES-SUPABASE.md)** | ⚠️ **GUÍA MAESTRA** - Reglas absolutas, estructura de buckets, especificaciones técnicas |
| **[RESUMEN-FINAL-SISTEMA-COMPLETO.md](./RESUMEN-FINAL-SISTEMA-COMPLETO.md)** | ⚠️ Resumen ejecutivo de toda la integración |
| **[GALERIA-VEHICULOS-STORAGE-INTEGRADO.md](./GALERIA-VEHICULOS-STORAGE-INTEGRADO.md)** | ⚠️ Galería de vehículos integrada con storage |
| **[GESTION-MEDIA-STORAGE.md](./02-desarrollo/media/GESTION-MEDIA-STORAGE.md)** | ⚠️ Documentación completa del sistema de media storage (incl. **portadas blog IA**, WebP en `blog/ai-covers/`, scripts npm) |
| **[SOLUCION-RAPIDA-MEDIA.md](./SOLUCION-RAPIDA-MEDIA.md)** | ⚠️ Solución rápida en 3 pasos (4 minutos) |
| **[FAQ-MEDIA-STORAGE.md](./FAQ-MEDIA-STORAGE.md)** | ⚠️ Preguntas frecuentes sobre storage |
| **[RESUMEN-CAMBIOS-MEDIA.md](./RESUMEN-CAMBIOS-MEDIA.md)** | ⚠️ Resumen de cambios implementados |
| **[SISTEMA-MEDIA-RESUMEN.md](./SISTEMA-MEDIA-RESUMEN.md)** | Gestión de medios y Storage (referencia anterior) |
| **[GALERIA-MULTIPLE-VEHICULOS.md](./GALERIA-MULTIPLE-VEHICULOS.md)** | Galería múltiple con drag & drop (documentación original) |
| **[SLIDER-IMAGENES-VEHICULOS.md](./SLIDER-IMAGENES-VEHICULOS.md)** | Slider de 2-3 imágenes en tarjetas de vehículos |
| **[IMAGENES-HERO-SLIDES.md](./IMAGENES-HERO-SLIDES.md)** | Imágenes hero de la homepage |
| **[IMAGENES-HERO-LOCALIZACIONES.md](./IMAGENES-HERO-LOCALIZACIONES.md)** | Imágenes hero de páginas de localización |
| **[MIGRACION-IMAGENES-BLOG-RESUMEN.md](./MIGRACION-IMAGENES-BLOG-RESUMEN.md)** | Migración de imágenes del blog a Supabase Storage |

### 💼 Reservas

| Documento | Descripción |
|-----------|-------------|
| **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** | ⚠️ **CORE DEL NEGOCIO** - Flujo completo paso a paso |
| **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** | ⚠️ **NUEVO** - Reglas gestión de clientes |
| **[REGLA-CALCULO-DIAS-ALQUILER.md](./REGLA-CALCULO-DIAS-ALQUILER.md)** | ⚠️ **CRÍTICO** - Cálculo de días con períodos de 24h |
| **[RESUMEN-IMPLEMENTACION-DIAS.md](./RESUMEN-IMPLEMENTACION-DIAS.md)** | Resumen técnico de la implementación del cálculo de días |

### 💳 Pagos y Notificaciones

| Documento | Descripción |
|-----------|-------------|
| **[REDSYS-CONFIGURACION.md](./REDSYS-CONFIGURACION.md)** | Integración con TPV Redsys (0.3% comisión) |
| **[STRIPE-CONFIGURACION.md](./STRIPE-CONFIGURACION.md)** | ⚠️ **NUEVO** - Integración con Stripe (alternativa) |
| **[STRIPE-VERCEL-PRODUCCION.md](./STRIPE-VERCEL-PRODUCCION.md)** | ⚠️ **NUEVO** - 🚀 Configurar Stripe en Vercel (USAR ESTE) |
| **[STRIPE-SETUP-RAPIDO.md](./STRIPE-SETUP-RAPIDO.md)** | Guía para desarrollo local (localhost) |
| **[METODOS-PAGO-RESUMEN.md](./METODOS-PAGO-RESUMEN.md)** | ⚠️ **NUEVO** - Comparativa y decisiones de métodos de pago |
| **[SISTEMA-EMAILS.md](./SISTEMA-EMAILS.md)** | Sistema completo de envío de emails |
| **[PRUEBAS-EMAILS.md](./PRUEBAS-EMAILS.md)** | Guía de testing del sistema de emails |
| **[IMPLEMENTACION-EMAILS-RESUMEN.md](./IMPLEMENTACION-EMAILS-RESUMEN.md)** | Resumen técnico de la implementación |

### 📅 Temporadas

| Documento | Descripción |
|-----------|-------------|
| **[SISTEMA_TEMPORADAS.md](./SISTEMA_TEMPORADAS.md)** | Gestión de temporadas y tarifas |

### 🎨 Diseño

| Documento | Descripción |
|-----------|-------------|
| **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** | Sistema de diseño, colores, tipografía |
| **[RESPONSIVE_STRATEGY.md](./RESPONSIVE_STRATEGY.md)** | Estrategia responsive, breakpoints |

### ✍️ Contenido y Blog

| Documento | Descripción |
|-----------|-------------|
| **[TINY_EDITOR_README.md](./TINY_EDITOR_README.md)** | Configuración de TinyMCE |
| **[GENERACION-CONTENIDO-IA.md](./GENERACION-CONTENIDO-IA.md)** | Herramientas IA para clientes |
| **[SOLUCION-BLOG-FRONTEND.md](./SOLUCION-BLOG-FRONTEND.md)** | ⚠️ Solución: Blog no carga en frontend (RLS) |

### 🗄️ Base de Datos

⚠️ **DOCUMENTOS CRÍTICOS:**
- **[REGLAS-SUPABASE-OBLIGATORIAS.md](./REGLAS-SUPABASE-OBLIGATORIAS.md)** - ⚠️ LEER ANTES DE QUERIES
- **[SUPABASE-SCHEMA-REAL.md](./SUPABASE-SCHEMA-REAL.md)** - Schema real con campos exactos
- **[PAGINAS-VEHICULOS-GARANTIA.md](./PAGINAS-VEHICULOS-GARANTIA.md)** - ⚠️ Garantía de calidad páginas vehículos
- **[SISTEMA-VEHICULOS-VENDIDOS.md](./04-referencia/vehiculos/SISTEMA-VEHICULOS-VENDIDOS.md)** - 🚗 Estado vendido, informes, calendario
- **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** - ⚠️ **NUEVO** - Gestión de clientes

Ver carpeta `supabase/`:
- **[supabase/README.md](./supabase/README.md)** - Documentación Supabase
- **[supabase/SETUP.md](./supabase/SETUP.md)** - Configuración paso a paso
- **[supabase/schema.sql](./supabase/schema.sql)** - Esquema completo (⚠️ puede no coincidir con la realidad)
- **[supabase/create-first-admin.sql](./supabase/create-first-admin.sql)** - Crear admin

### 🔄 Migración de Datos Antiguos

⚠️ **DOCUMENTOS PARA MIGRACIÓN DESDE BASE DATOS ANTIGUA:**
- **[OLD_FURGOCASA_DATOS/README-MIGRACION.md](./OLD_FURGOCASA_DATOS/README-MIGRACION.md)** - Guía principal de migración
- **[OLD_FURGOCASA_DATOS/PROBLEMA-VINCULACION-CLIENTES.md](./OLD_FURGOCASA_DATOS/PROBLEMA-VINCULACION-CLIENTES.md)** - ⚠️ Problema y solución: reservas sin vincular
- **[OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md](./OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md)** - ⚠️ Guía completa de scripts de vinculación

Ver carpeta `scripts/`:
- **`migrate-old-data.ts`** - Script principal de migración (mejorado)
- **`fix-customer-links.ts`** - Reparación automática post-migración
- **`link-bookings-interactive.ts`** - Vinculación interactiva manual

---

## 🎯 GUÍAS RÁPIDAS

### Estoy empezando
1. Lee **[README.md](./README.md)** - **SECCIÓN "REGLAS ABSOLUTAS"** ⚠️
2. Lee **[CHANGELOG.md](./CHANGELOG.md)** v1.0.4 - Ver qué se rompió antes
3. Configura con **[supabase/SETUP.md](./supabase/SETUP.md)**
4. Crea admin con **[ADMIN_SETUP.md](./ADMIN_SETUP.md)**

### Voy a trabajar con autenticación o datos
1. Lee **[README.md](./README.md)** sección "Sistema de Autenticación" ⚠️ **OBLIGATORIO**
2. Lee **[CHANGELOG.md](./CHANGELOG.md)** v1.0.4 ⚠️
3. Lee **[REGLAS-SUPABASE-OBLIGATORIAS.md](./REGLAS-SUPABASE-OBLIGATORIAS.md)** ⚠️
4. **NO TOQUES** `src/lib/supabase/client.ts` ni `server.ts`
5. **NO TOQUES** los hooks `use-paginated-data.ts`, `use-admin-data.ts`, `use-all-data-progressive.ts`

### Voy a trabajar con reservas o clientes
1. Lee **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** ⚠️ **OBLIGATORIO**
2. Lee **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** ⚠️ **NUEVO**
3. Lee **[REGLA-CALCULO-DIAS-ALQUILER.md](./REGLA-CALCULO-DIAS-ALQUILER.md)** ⚠️ **CRÍTICO**
4. Verifica que existen todas las páginas listadas
5. NO modifiques el flujo sin documentar

### Voy a modificar una página pública
1. Lee **[REGLAS-ARQUITECTURA-NEXTJS.md](./REGLAS-ARQUITECTURA-NEXTJS.md)** ⚠️
2. Lee **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** ⚠️
3. Antes de commit: **[CHECKLIST-PRE-COMMIT.md](./CHECKLIST-PRE-COMMIT.md)** ⚠️

### Voy a trabajar con traducciones
1. Lee **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** ⚠️
2. Consulta **[TRADUCCIONES.md](./TRADUCCIONES.md)**
3. Revisa **[I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md)**

### Voy a trabajar con SEO
1. Lee **[AUDITORIA-SEO-CRITICA.md](./AUDITORIA-SEO-CRITICA.md)**
2. Aplica **[NORMAS-SEO-OBLIGATORIAS.md](./NORMAS-SEO-OBLIGATORIAS.md)**
3. Verifica con **[CHECKLIST-PRE-COMMIT.md](./CHECKLIST-PRE-COMMIT.md)**

### Voy a configurar pagos o emails
1. Lee **[METODOS-PAGO-RESUMEN.md](./METODOS-PAGO-RESUMEN.md)** ⚠️ **NUEVO** - Ver estado actual
2. Para Redsys: **[REDSYS-CONFIGURACION.md](./REDSYS-CONFIGURACION.md)**
3. Para Stripe EN PRODUCCIÓN: **[STRIPE-VERCEL-PRODUCCION.md](./STRIPE-VERCEL-PRODUCCION.md)** ⚠️ **NUEVO** 🚀
4. Para Stripe en local: **[STRIPE-SETUP-RAPIDO.md](./STRIPE-SETUP-RAPIDO.md)**
5. Para emails: **[SISTEMA-EMAILS.md](./SISTEMA-EMAILS.md)**
6. Testing de emails: **[PRUEBAS-EMAILS.md](./PRUEBAS-EMAILS.md)**

### Voy a trabajar con imágenes, storage o gestión de media
1. Lee **[RESUMEN-FINAL-SISTEMA-COMPLETO.md](./RESUMEN-FINAL-SISTEMA-COMPLETO.md)** ⚠️ **NUEVO** - Visión general
2. Para setup rápido: **[SOLUCION-RAPIDA-MEDIA.md](./SOLUCION-RAPIDA-MEDIA.md)** ⚠️ - Solución en 4 minutos
3. Para entender storage: **[GESTION-MEDIA-STORAGE.md](./02-desarrollo/media/GESTION-MEDIA-STORAGE.md)** ⚠️ - Documentación completa
4. Para galería de vehículos: **[GALERIA-VEHICULOS-STORAGE-INTEGRADO.md](./GALERIA-VEHICULOS-STORAGE-INTEGRADO.md)** ⚠️ **NUEVO**
5. Consulta dudas en: **[FAQ-MEDIA-STORAGE.md](./FAQ-MEDIA-STORAGE.md)** ⚠️ **NUEVO**
6. Ejecuta script SQL: `supabase/configurar-storage-media-extras.sql`
7. Verifica con diagnóstico: `supabase/diagnostico-storage-completo.sql`

### Voy a trabajar con vehículos en Home
1. Lee **[SOLUCION-VEHICULOS-HOME.md](./SOLUCION-VEHICULOS-HOME.md)** ⚠️ - Problema y solución vehículos
2. Lee **[SISTEMA-MEDIA-RESUMEN.md](./SISTEMA-MEDIA-RESUMEN.md)**
3. Para galería múltiple: **[GALERIA-MULTIPLE-VEHICULOS.md](./GALERIA-MULTIPLE-VEHICULOS.md)**
4. NO uses `VehicleImageSlider` - usa `<img>` directo

---

## 🗂️ ARCHIVOS DE DOCUMENTACIÓN ACTIVOS

```
📁 furgocasa-app/
├── 🚨 README.md                           ← Punto de entrada + REGLAS ABSOLUTAS
├── 📋 CHANGELOG.md                        ← Historial (v1.0.5 VEHÍCULOS + v1.0.4 FIX CRÍTICO)
├── 🎨 SOLUCION-VEHICULOS-HOME.md          ← ⚠️ NUEVO v1.0.5 - Problema y solución completa
├── 🎨 PROBLEMA-VEHICULOS-HOME.md          ← ⚠️ ACTUALIZADO - Estado resuelto
├── 🔴 REGLAS-ARQUITECTURA-NEXTJS.md       ← INCLUYE REGLAS SUPABASE CLIENT
├── 🔴 REGLAS-SUPABASE-OBLIGATORIAS.md     ← ⚠️ LEER ANTES DE QUERIES
├── 🔴 CONFIGURACION-META-PIXEL.md         ← Meta Pixel condicional
├── 🔴 CONFIGURACION-GOOGLE-ANALYTICS.md   ← ⚠️ NUEVO - Google Analytics con exclusión admin
├── 🚨 SUPABASE-SCHEMA-REAL.md             ← Schema real con campos exactos
├── 🚨 PAGINAS-VEHICULOS-GARANTIA.md       ← ⚠️ Garantía páginas vehículos
├── 🚨 GESTION-CLIENTES-OBLIGATORIO.md     ← ⚠️ Gestión de clientes
├── 🚨 FLUJO-RESERVAS-CRITICO.md           ← CORE DEL NEGOCIO
├── 🚨 REGLA-CALCULO-DIAS-ALQUILER.md      ← ⚠️ CRÍTICO - Cálculo días 24h
├── 📖 RESUMEN-IMPLEMENTACION-DIAS.md      ← Resumen técnico días
├── 🚨 GUIA-TRADUCCION.md                  ← CRÍTICO
├── 🚨 CHECKLIST-PRE-COMMIT.md             ← Usar antes de commit
├── 🚨 AUDITORIA-SEO-CRITICA.md            ← Leer antes de cambios
├── 🚨 NORMAS-SEO-OBLIGATORIAS.md          ← Normas SEO
├── 📖 I18N_IMPLEMENTATION.md              ← i18n técnico
├── 📖 TRADUCCIONES.md                     ← Traducciones
├── 📖 GUIA-QUERIES-VEHICULOS.md           ← Queries vehículos
├── 📖 ADMIN_SETUP.md                      ← Setup admin
├── 📖 BUSCADOR-GLOBAL-ADMIN.md            ← Buscador
├── 📖 PWA-ADMIN-GUIA.md                   ← ⚠️ NUEVO - PWA panel administrador
├── 📖 ICONOS-PWA.md                       ← Generación iconos PWA
├── 📖 RESUMEN-FINAL-SISTEMA-COMPLETO.md  ← ⚠️ NUEVO - Resumen ejecutivo integración completa
├── 📖 GALERIA-VEHICULOS-STORAGE-INTEGRADO.md ← ⚠️ NUEVO - Galería + Storage integrados
├── 📖 SISTEMA-MEDIA-RESUMEN.md            ← Medios (referencia anterior)
├── 📖 GESTION-MEDIA-STORAGE.md            ← ⚠️ NUEVO - Gestión completa de storage
├── 📖 SOLUCION-RAPIDA-MEDIA.md            ← ⚠️ NUEVO - Solución rápida en 4 minutos
├── 📖 FAQ-MEDIA-STORAGE.md                ← ⚠️ NUEVO - Preguntas frecuentes storage
├── 📖 RESUMEN-CAMBIOS-MEDIA.md            ← ⚠️ NUEVO - Resumen cambios media
├── 📖 GALERIA-MULTIPLE-VEHICULOS.md       ← Galería vehículos (doc original)
├── 📖 SISTEMA_TEMPORADAS.md               ← Temporadas
├── 📖 REDSYS-CONFIGURACION.md             ← Pagos Redsys
├── 📖 STRIPE-CONFIGURACION.md             ← ⚠️ NUEVO - Pagos Stripe (referencia)
├── 📖 STRIPE-VERCEL-PRODUCCION.md         ← ⚠️ NUEVO - 🚀 Setup Stripe EN PRODUCCIÓN
├── 📖 STRIPE-SETUP-RAPIDO.md              ← Setup Stripe en localhost
├── 📖 METODOS-PAGO-RESUMEN.md             ← ⚠️ NUEVO - Comparativa pagos
├── 📖 SISTEMA-EMAILS.md                   ← Sistema de emails
├── 📖 PRUEBAS-EMAILS.md                   ← ⚠️ NUEVO - Testing de emails
├── 📖 IMPLEMENTACION-EMAILS-RESUMEN.md    ← ⚠️ NUEVO - Resumen implementación
├── 📖 TINY_EDITOR_README.md               ← TinyMCE
├── 📖 GENERACION-CONTENIDO-IA.md          ← IA tools
├── 📖 SOLUCION-BLOG-FRONTEND.md           ← ⚠️ Blog no carga (RLS)
├── 📖 DESIGN_SYSTEM.md                    ← Diseño
├── 📖 RESPONSIVE_STRATEGY.md              ← Responsive
└── 📁 supabase/
    ├── README.md
    ├── SETUP.md
    └── *.sql
```

---

## 🔍 BUSCAR INFORMACIÓN

### Por Tema

- **Autenticación y datos**: `CHANGELOG.md` v1.0.4, `REGLAS-SUPABASE-OBLIGATORIAS.md`
- **Cliente Supabase**: `README.md` sección "Sistema de Autenticación", `REGLAS-ARQUITECTURA-NEXTJS.md`
- **Calendario admin**: `CHANGELOG.md` v1.0.4 (sección calendario)
- **Meta Pixel**: `CONFIGURACION-META-PIXEL.md`
- **Google Analytics**: `CONFIGURACION-GOOGLE-ANALYTICS.md` ⚠️ **NUEVO**
- **Reservas**: `FLUJO-RESERVAS-CRITICO.md` ⚠️ **CORE DEL NEGOCIO**
- **Clientes**: `GESTION-CLIENTES-OBLIGATORIO.md` ⚠️ **NUEVO**
- **Cálculo de días**: `REGLA-CALCULO-DIAS-ALQUILER.md` ⚠️ **CRÍTICO**
- **Arquitectura y reglas**: `REGLAS-ARQUITECTURA-NEXTJS.md`
- **Traducciones**: `GUIA-TRADUCCION.md`, `TRADUCCIONES.md`
- **SEO**: `SEO-MULTIIDIOMA-MODELO.md`, `PAGINAS-MOTORHOME-EUROPA-MULTIIDIOMA.md`, `AUDITORIA-SEO-CRITICA.md`, `NORMAS-SEO-OBLIGATORIAS.md`
- **i18n**: `I18N_IMPLEMENTATION.md`
- **Admin**: `ADMIN_SETUP.md`, `BUSCADOR-GLOBAL-ADMIN.md`, `PWA-ADMIN-GUIA.md` ⚠️ **NUEVO**
- **Medios**: `GESTION-MEDIA-STORAGE.md` ⚠️ **NUEVO**, `SOLUCION-RAPIDA-MEDIA.md` ⚠️ **NUEVO**, `FAQ-MEDIA-STORAGE.md` ⚠️ **NUEVO**, `SISTEMA-MEDIA-RESUMEN.md`, `GALERIA-MULTIPLE-VEHICULOS.md`
- **Pagos**: `METODOS-PAGO-RESUMEN.md` ⚠️ **NUEVO**, `REDSYS-CONFIGURACION.md`, `STRIPE-CONFIGURACION.md` ⚠️ **NUEVO**
- **Emails**: `SISTEMA-EMAILS.md`, `PRUEBAS-EMAILS.md`
- **Blog**: `SOLUCION-BLOG-FRONTEND.md` ⚠️ Si no cargan artículos
- **Base de datos**: `supabase/README.md`, `supabase/schema.sql`
- **Migración datos**: `OLD_FURGOCASA_DATOS/README-MIGRACION.md` ⚠️ **NUEVO**, `OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md` ⚠️ **NUEVO**

### Por Pregunta

| Pregunta | Documento |
|----------|-----------|
| ¿Por qué el admin dejó de funcionar? | `CHANGELOG.md` v1.0.4 |
| ¿Cómo uso correctamente el cliente Supabase? | `README.md` + `REGLAS-ARQUITECTURA-NEXTJS.md` |
| ¿Puedo modificar `client.ts` o `server.ts`? | **NO** - Ver `README.md` sección "Reglas Absolutas" |
| ¿Por qué el calendario no carga? | `CHANGELOG.md` v1.0.4 (sección calendario) |
| ¿Cómo configuro Meta Pixel? | `CONFIGURACION-META-PIXEL.md` |
| ¿Cómo configuro Google Analytics? | `CONFIGURACION-GOOGLE-ANALYTICS.md` ⚠️ **NUEVO** |
| ¿Puedo usar `"use client"` en esta página? | `REGLAS-ARQUITECTURA-NEXTJS.md` |
| ¿Cómo traduzco en Server Component? | `GUIA-TRADUCCION.md` |
| ¿Por qué no puedo usar useLanguage()? | `GUIA-TRADUCCION.md` |
| ¿Cómo configuro SEO? | `NORMAS-SEO-OBLIGATORIAS.md` |
| ¿Cómo creo un admin? | `ADMIN_SETUP.md` |
| ¿Cómo subo imágenes? | `SISTEMA-MEDIA-RESUMEN.md` |
| ¿Cómo funciona el pago? | `METODOS-PAGO-RESUMEN.md`, `REDSYS-CONFIGURACION.md` |
| ¿Cómo configurar Stripe EN PRODUCCIÓN? | `STRIPE-VERCEL-PRODUCCION.md` ⚠️ **NUEVO** 🚀 |
| ¿Cómo configurar Stripe en local? | `STRIPE-SETUP-RAPIDO.md` |
| ¿Qué método de pago usar? | `METODOS-PAGO-RESUMEN.md` ⚠️ **NUEVO** |
| ¿Cómo configurar emails automáticos? | `SISTEMA-EMAILS.md` |
| ¿Cómo probar el sistema de emails? | `PRUEBAS-EMAILS.md` ⚠️ **NUEVO** |
| ¿Cómo subo imágenes? | `02-desarrollo/media/GESTION-MEDIA-STORAGE.md`, `SOLUCION-RAPIDA-MEDIA.md` ⚠️ **NUEVO** |
| ¿Cómo creo carpetas en storage? | `SOLUCION-RAPIDA-MEDIA.md` ⚠️ **NUEVO** |
| ¿Por qué "Nueva Carpeta" no funciona? | `SOLUCION-RAPIDA-MEDIA.md` ⚠️ **NUEVO** |
| ¿Cómo organizo imágenes por buckets? | `02-desarrollo/media/GESTION-MEDIA-STORAGE.md`, `02-desarrollo/media/FAQ-MEDIA-STORAGE.md` ⚠️ **NUEVO** |
| ¿Cómo funcionan las temporadas? | `SISTEMA_TEMPORADAS.md` |
| ¿Por qué no cargan los artículos del blog? | `SOLUCION-BLOG-FRONTEND.md` |
| ¿Cómo migro datos desde MySQL/VikRentCar? | `OLD_FURGOCASA_DATOS/README-MIGRACION.md` ⚠️ **NUEVO** |
| ¿Por qué hay reservas sin cliente vinculado? | `OLD_FURGOCASA_DATOS/PROBLEMA-VINCULACION-CLIENTES.md` ⚠️ **NUEVO** |
| ¿Cómo vincular reservas a clientes? | `OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md` ⚠️ **NUEVO** |
| ¿Cómo se calculan los días de alquiler? | `REGLA-CALCULO-DIAS-ALQUILER.md` ⚠️ **CRÍTICO** |
| ¿Por qué cobran día completo si excedo 1 minuto? | `REGLA-CALCULO-DIAS-ALQUILER.md` ⚠️ **CRÍTICO** |
| ¿Cómo instalar el panel de admin como PWA? | `PWA-ADMIN-GUIA.md` ⚠️ **NUEVO** |
| ¿Qué vulnerabilidades de seguridad se encontraron? | `AUDITORIA-SEGURIDAD-2026.md` ⚠️ **NUEVO** |
| ¿Qué amenazas externas existen? | `ATAQUES-EXTERNOS-AMENAZAS.md` ⚠️ **NUEVO** |
| ¿Cómo cambiar el token del calendario? | `GUIA-CAMBIAR-TOKEN-CALENDARIO.md` ⚠️ **NUEVO** |

---

## ✅ DOCUMENTOS OBSOLETOS ELIMINADOS

Estos documentos ya NO existen (fueron eliminados):

### Eliminados el 8 de Enero, 2026:
- ❌ `MULTIIDIOMA-AUDIT.md` - Obsoleto
- ❌ `MULTIIDIOMA-INFORME-COMPLETO.md` - Obsoleto
- ❌ `CORRECCION-ENLACES-MULTIIDIOMA.md` - Obsoleto
- ❌ `CORRECCION-NAVEGACION.md` - Obsoleto
- ❌ `OPTIMIZACION-NAVEGACION.md` - Obsoleto
- ❌ `AUDITORIA-SEO-ENLACES-COMPLETA.md` - Obsoleto
- ❌ `OPTIMIZACION-SEO-COMPLETADA.md` - Obsoleto
- ❌ `JERARQUIA-SEO-LOCATIONS.md` - Obsoleto
- ❌ `SEO-LOCATIONS-IMPLEMENTATION.md` - Obsoleto
- ❌ `SEO-LOCATIONS-MULTILANG.md` - Obsoleto
- ❌ `ESTADO-ACTUAL-MEDIA.md` - Obsoleto
- ❌ `SELECTOR-CON-CARPETAS-COMPLETO.md` - Obsoleto
- ❌ `SELECTOR-IMAGENES-INTEGRADO.md` - Obsoleto
- ❌ `SISTEMA-CARPETAS-MEDIA.md` - Obsoleto
- ❌ `SISTEMA-IMAGENES-VEHICULOS.md` - Obsoleto
- ❌ `ORGANIZACION-BLOG-CARPETAS.md` - Obsoleto
- ❌ `RESUMEN-MIGRACION-BLOG.md` - Obsoleto
- ❌ `BLOG-TRANSLATION-README.md` - Obsoleto

### Eliminados el 20 de Enero, 2026:
- ❌ `DOCUMENTACION-COMPLETA-v1.0.4.md` - Resumen temporal de auditoría (información ya está en README.md y CHANGELOG.md)
- ❌ `FIX-SINGLETON-PENDIENTE.md` - Lista de archivos pendientes de corrección (ya completado)
- ❌ `CORRECCION-ERRORES-ADMIN.md` - Fix crítico v1.0.4 (información completa en CHANGELOG.md v1.0.4)
- ❌ `CORRECCION-CALENDARIO.md` - Fix calendario v1.0.4 (información completa en CHANGELOG.md v1.0.4)
- ❌ `CORRECCION-CLIENTES-TOTALES.md` - Fix simple ya aplicado (información en CHANGELOG.md)
- ❌ `CORRECCION-CUSTOMER-PHONE-OBLIGATORIO.md` - Fix simple ya aplicado (información en CHANGELOG.md)
- ❌ `FIX-CRITICO-TRIGGERS-CLIENTES.md` - Redundante con CORRECCION-STATS-CLIENTES.md (más completo)
- ❌ `FIX-VALIDACION-HORAS-RESERVAS.md` - Fix ya aplicado (información técnica en código y SISTEMA-PREVENCION-CONFLICTOS.md)
- ❌ `FIX-EDICION-RESERVAS.md` - Fix ya aplicado (información técnica en código)

---

## 🔄 MANTENIMIENTO DE DOCUMENTACIÓN

### Reglas

1. **Nunca duplicar** - Si existe doc similar, actualizar el existente
2. **Nombres descriptivos** - Usar nombres claros y específicos
3. **Fecha al pie** - Incluir fecha de última actualización
4. **Eliminar obsoletos** - Borrar docs que ya no aplican
5. **Actualizar índice** - Mantener este archivo actualizado

### Proceso para nuevo documento

1. ¿Es crítico? → Agregar a sección CRÍTICOS del README
2. ¿Es técnico? → Agregar a sección correspondiente
3. Actualizar este índice
4. Agregar link en README principal

---

**Total de documentos activos**: ver carpeta `docs/` (índice revisado mar. 2026)  
**Última actualización crítica**: Landings alquiler + docs alineadas (20 marzo 2026)  
**Última actualización anterior**: Auditoría de Seguridad (5 Febrero 2026)  
**Última limpieza de obsoletos**: 20 Enero 2026
