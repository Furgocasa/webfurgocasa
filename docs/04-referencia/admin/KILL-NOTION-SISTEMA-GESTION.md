# KILL NOTION — Sistema de gestión de alquileres en el panel admin

> Guía maestra de implementación. Si el trabajo se corta, aquí está TODO lo
> acordado y lo que falta por hacer. Objetivo: **eliminar la dependencia de
> Notion** replicando dentro de la app el checklist de gestión de cada alquiler
> y los emails automáticos/manuales que hoy dispara n8n contra Notion.

- **Estado:** IMPLEMENTADO Y EN PRODUCCIÓN (emails, SQL, sección admin, subida de
  docs + IA, crons). Pendiente: retirar n8n/Notion tras validación operativa.
- **Fecha inicio:** 01/07/2026
- **Ámbito:** nueva sección `administrator/administracion` + emails + subida de
  documentación del cliente con validación por IA.

**Documentación relacionada (índice general):**
- [`docs/INDICE-DOCUMENTACION.md`](../../INDICE-DOCUMENTACION.md) — sección *Julio 2026 — KILL NOTION*
- [`docs/04-referencia/emails/SISTEMA-EMAILS.md`](../emails/SISTEMA-EMAILS.md) — sección 5 (resumen emails)
- [`README.md`](../../../README.md) — sección *Julio 2026 — Gestión de alquileres KILL NOTION*
- [`docs/README.md`](../../README.md) — áreas `admin/` y `emails/`

---

## 1. Contexto: qué hacía Notion (y n8n) hasta ahora

Notion tenía una base de datos `ALQUILER RESERVAS` (id `27759c62-8f77-805b-8bbd-f00c62372789`)
que era una **copia manual** de las reservas de Supabase, con un **checklist**
por reserva. Dos automatizaciones n8n operaban sobre ella (ver carpeta
`kill_notion/`):

1. **`FURGOCASA - Actualización alquileres NOTION + SUPABASE`**
   - Lee reservas de Supabase, con GPT extrae/normaliza datos y rellena Notion.
   - Envía el **primer email** (gestión de reserva) firmado por Narciso, en
     texto plano. Marca la casilla `Primer mail`.

2. **`FURGOCASA - Avisos MAIL pendientes NOTION`** (se ejecutaba a diario)
   - Recorre todas las reservas y, según checks + fechas, envía recordatorios:

   | Condición | Email |
   |---|---|
   | `Vencimiento ≤ hoy` **y** `2º Pago` = false | Recordatorio 2º pago (VENCIDO) |
   | `Vencimiento ≤ hoy` **y** `Contrato` = false | Recordatorio firmar contrato |
   | `Vencimiento ≤ hoy` **y** `Doc` = false | Recordatorio documentación |
   | `Límite FIANZA ≤ hoy` **y** `Fianza` = false | Recordatorio fianza |
   | `2ºPago + Doc + Contrato + Fianza` = true **y** `Cita` = false | Email de CITA |

   - `Vencimiento` = fecha de inicio − 15 días.
   - `Límite FIANZA` = fecha de inicio − 8 días.

### Columnas/checks de Notion y su equivalente en la app

| Check Notion | Significado | Origen en la app |
|---|---|---|
| `Primer mail` | Se envió el email de gestión inicial | `booking_email_dispatches` (auto) |
| `1º Pago` | **He hecho la factura** del 1er pago | `booking_admin_checklist` (manual) |
| `2º Pago` | **He hecho la factura** del 2º pago | `booking_admin_checklist` (manual) |
| `Doc` | Documentación de conductores recibida | `rental_documents` + IA (auto con revisión) |
| `Contrato` | Contrato firmado | `signed_contracts` (auto, solo lectura) |
| `Fianza (3 días)` | Fianza recibida (visto en banco) | `booking_admin_checklist` (manual) |
| `Cita` | Cita de recogida confirmada al cliente | `booking_email_dispatches` (auto) |
| `ESTADO DEL ALQUILER` | EN PREPARACIÓN / EN RUTA / FINALIZADO… | `bookings.status` |
| `Daños` / `Limpieza` / `Finalizado` | Post-alquiler | `booking_admin_checklist` + `bookings.status` |

---

## 2. Decisiones tomadas (cerradas con el cliente)

- **Contrato firmado:** 100% automático desde `signed_contracts` (solo lectura).
- **Email de cita:** automático desde el cron en cuanto se completan los checks.
- **1º y 2º pago:** casillas **manuales** (marcan "factura hecha", no "pagado";
  el pago ya lo sabe la web vía `payment_status` / `amount_paid`).
- **Fianza:** casilla **manual** (se ve en el banco).
- **Documentación:** el cliente **sube** DNI (anverso/reverso) y carnet
  (anverso/reverso) desde el link de su reserva; **GPT-4o Vision** extrae y
  coteja los datos. El check se marca **automáticamente si la IA valida OK,
  con revisión/override manual**.
- **Varios conductores** por reserva (cada uno con sus 4 imágenes).
- **Borrado de documentos:** **solo manual** desde el panel admin (no hay cron
  de borrado automático por ahora; nota RGPD: valorar retención futura).

---

## 3. Modelo de datos (a ejecutar en Supabase)

Fichero SQL: `supabase/migrations/20260701-kill-notion-gestion.sql`.

### 3.1. `booking_admin_checklist` (checks manuales + post-alquiler)

Relación 1-a-1 con `bookings`. NO se tocan columnas de `bookings`.

```
booking_id (PK, FK bookings ON DELETE CASCADE)
first_invoice_done      boolean  -- factura 1er pago (manual)
second_invoice_done     boolean  -- factura 2º pago (manual)
documentation_received  boolean  -- override manual del check de docs
deposit_received        boolean  -- fianza vista en banco (manual)
appointment_confirmed   boolean  -- cita enviada (lo marca el cron)
management_email_due_at timestamptz -- programación email 1 (20 min tras 1er pago)
damages_checked         boolean  -- post-alquiler (manual)
cleaning_done           boolean  -- post-alquiler (manual)
updated_by (FK admins), updated_at
```

### 3.2. Ampliar `booking_email_dispatches.email_type`

Añadir al CHECK los nuevos tipos:
`second_payment_reminder`, `contract_reminder`, `documentation_reminder`,
`deposit_reminder`, `appointment`, `booking_management` (email manual inicial).

### 3.3. `rental_documents` (subida + validación IA) — FASE 4

```
id (PK)
booking_id (FK bookings ON DELETE CASCADE)
driver_index int          -- 0 = titular, 1 = 2º conductor, ...
driver_label text         -- nombre mostrado
doc_kind text CHECK IN ('dni_front','dni_back','license_front','license_back')
storage_path text         -- bucket privado rental-documents
mime_type, size_bytes, sha256
uploaded_at
-- Resultado IA (JSON): nombre, número doc, fecha nac, categorías, caducidades…
ai_extracted jsonb
ai_status text CHECK IN ('pending','ok','warning','error')
ai_notes text
verified_by (FK admins), verified_at   -- override manual
```

Bucket privado `rental-documents` (mismo patrón RLS que `signed-contracts`).

Bucket privado `rental-documents` (mismo patrón RLS que `signed-contracts`).

### 3.4. Programación email de gestión (email 1)

Fichero SQL: `supabase/migrations/20260702-management-email-schedule.sql`.

```
management_email_due_at TIMESTAMPTZ  -- cuándo debe enviarse booking_management
```

Se rellena automáticamente al confirmar la reserva con el **1er pago** (Redsys,
Stripe o pago manual en admin). El cron `/api/cron/booking-management-email`
(com cada 5 min) envía cuando `management_email_due_at ≤ now`.

---

## 4. Los 6 emails de gestión — cronograma completo

Plantillas en `src/lib/email/templates.ts` (sección "GESTIÓN / KILL NOTION").
Estilo **texto plano** (como los `.msg` de Notion). CC a `reservas@furgocasa.com`.

Asuntos unificados: `{prefijo} FURGOCASA {code} - {vehículo} del {ini} al {fin}`.

Envío compartido: `src/lib/rental-admin/dispatch.ts` → `sendGestionEmail()`.
Registro en `booking_email_dispatches`.

### 4.1. Tabla resumen

| # | Tipo (`email_type`) | Asunto (prefijo) | ¿Automático? | Cuándo | ¿Se repite? |
|---|---|---|---|---|---|
| **1** | `booking_management` | `Alquiler` | Sí | **20 min** tras 1er pago + reserva `pending`→`confirmed` | **No** (una vez) |
| **2** | `second_payment_reminder` | `VENCIDO 2º pago` | Sí (cron diario) | Desde **inicio − 15 días** si hay importe pendiente | **Sí, cada día** hasta pagar |
| **3** | `contract_reminder` | `Contrato pendiente` | Sí (cron diario) | Desde **inicio − 15 días** si no firmó contrato | **Sí, cada día** hasta firmar |
| **4** | `documentation_reminder` | `Documentación pendiente` | Sí (cron diario) | Desde **inicio − 15 días** si docs incompletas | **Sí, cada día** hasta completar |
| **5** | `deposit_reminder` | `Fianza pendiente` | Sí (cron diario) | Desde **inicio − 8 días** si fianza sin marcar | **Sí, cada día** hasta marcar fianza |
| **6** | `appointment` | `Cita` | Sí (cron diario) | Cuando 2ª factura + contrato + docs + fianza OK | **No** (una vez) |

> **Nota:** el email de **confirmación de 1er pago** (al pagar la señal) es otro
> sistema (`sendFirstPaymentConfirmedEmail`), no es uno de estos 6.

### 4.2. Fechas clave (respecto a `pickup_date` = inicio del alquiler)

| Concepto | Cálculo | Usado por |
|---|---|---|
| **Vencimiento 2º pago** | inicio − **15 días** | Emails 2, 3 y 4 |
| **Límite fianza** | inicio − **8 días** | Email 5 |

**Ejemplo:** alquiler que empieza el **30/06/2026**:
- **15/06** → pueden empezar recordatorios de 2º pago, contrato y documentación.
- **22/06** → puede empezar recordatorio de fianza.
- Si el cliente no paga el 2º pago el 15/06, recibe otro recordatorio el 16/06,
  17/06… **cada mañana** hasta que pague.

### 4.3. Email 1 — Gestión inicial (`booking_management`)

**Disparador:** primer pago confirmado **y** la reserva estaba en `pending`.

**Flujo:**
1. Redsys notification, Redsys verify-payment, Stripe webhook o pago manual en
   admin detectan `isFirstPayment` (`amount_paid` era 0) + `status === 'pending'`.
2. Se llama `scheduleBookingManagementEmail()` → guarda
   `management_email_due_at = now + 20 min` en `booking_admin_checklist`.
3. Cron `/api/cron/booking-management-email` (cada **5 min**) envía si ya tocó.
4. Idempotencia: **solo se envía una vez** (`onlyIfNotSent: true`).

**Reenvío manual:** panel admin → Emails / Docs → "Email de gestión (inicial)".

### 4.4. Emails 2–5 — Recordatorios diarios

**Cron:** `/api/cron/booking-admin-reminders` — **`0 6 * * *` UTC**
→ **08:00** hora peninsular (verano) / **07:00** (invierno).

**Alcance:** reservas no canceladas con inicio entre **hoy** y **+45 días**.

**Condiciones por email:**

| Email | Condición para enviar hoy |
|---|---|
| **2 – 2º pago** | `hoy ≥ inicio − 15` **y** `amount_paid < total_price` (importe pendiente) |
| **3 – Contrato** | `hoy ≥ inicio − 15` **y** no hay fila en `signed_contracts` |
| **4 – Documentación** | `hoy ≥ inicio − 15` **y** docs incompletas (IA titular OK **o** check manual) |
| **5 – Fianza** | `hoy ≥ inicio − 8` **y** `deposit_received = false` en checklist |

**Repetición:** mientras la condición siga cumpliéndose, el cron **reenvía cada
día** (`onlyIfNotSentToday: true` → máximo 1 envío por tipo y por día). Al
resolver el asunto (paga, firma, sube docs, marcas fianza), deja de enviarse.

**Reenvío manual:** desde el panel admin (siempre envía, sin idempotencia).

### 4.5. Email 6 — Cita (`appointment`)

**Condición (las 4 a la vez):**
- `second_invoice_done = true` (check manual: factura 2º pago hecha)
- Contrato firmado (`signed_contracts`)
- Documentación completa (IA o override manual)
- `deposit_received = true` (check manual: fianza vista en banco)
- `appointment_confirmed = false` (aún no enviada)

**Comportamiento:** se envía **una sola vez** (`onlyIfNotSent: true`). Tras el
envío se marca `appointment_confirmed = true` en el checklist.

**Reenvío manual:** panel admin → "Enviar / Reenviar email de cita".

### 4.6. Diferencias importantes pago vs factura

| Concepto | Origen | Usado en |
|---|---|---|
| **Pago real del cliente** | `bookings.amount_paid`, `payment_status` | Recordatorio **2º pago** (email 2) |
| **Factura hecha (admin)** | `booking_admin_checklist.second_invoice_done` | Email de **cita** (email 6) |

El cliente puede haber pagado el 2º pago en la web, pero la cita no sale hasta
que tú marques la casilla **2ª fact.** (como en Notion).

### 4.7. Plantillas y contenido especial

| Función | Base original |
|---|---|
| `getBookingManagementEmail` | `kill_notion/1 - Alquiler…msg` |
| `getSecondPaymentReminderEmail` | n8n "Pedir 2º Pago" |
| `getContractReminderEmail` | n8n "Pedir firmar contrato" |
| `getDocumentationReminderEmail` | n8n "Pedir documentación" |
| `getDepositReminderEmail` | n8n "Pedir fianza" |
| `getAppointmentEmail` | `kill_notion/5 - Cita…msg` |

- Emails **1** y **4** dirigen a subir documentación en
  `www.furgocasa.com/es/documentacion-alquiler` (no por respuesta al email).
- Email **6** incluye enlace al chat: `https://www.furgocasa.com/?chat=open`
  (abre el chatbot automáticamente).

**Script de prueba:** `scripts/send-kill-notion-test-emails.ts` — envía los 6 a
`reservas@furgocasa.com` con prefijo `[TEST]`, espaciados 5 s:

```
npx tsx scripts/send-kill-notion-test-emails.ts
npx tsx scripts/send-kill-notion-test-emails.ts FG12345678
```

---

## 5. Sección `administrator/administracion`

**URL:** `/administrator/administracion`

### 5.1. Tabla principal

Columnas:
- **Reserva** — estilo Notion: cliente + vehículo + ubicación (no el nº reserva).
- **Estado** — Pendiente / Confirmada / En curso / Completada (badge de color).
- **Inicio** / **Fin** — fechas ordenables.
- **Devuelta** — check automático (verde si `dropoff_date ≤ hoy`).
- **Venc. 2º pago** — fecha límite (inicio − 15) + importe pendiente (verde si pagado).
- **Checks:** 1ª fact., 2ª fact., Contrato (auto), Docs. (auto IA), Fianza, Cita (auto).
- **Acciones** — iconos: Emails/Docs, Editar reserva, Ver en front.

**Alquileres ya iniciados** (en curso / completados / fecha inicio pasada): todos
los checks se muestran en verde (incluida cita), sin editar manualmente.

### 5.2. Filtros y ordenación (por defecto al entrar)

| Control | Valor por defecto |
|---|---|
| **Estado** | Confirmada + En curso |
| **Ver** | Todos (sin paginar) |
| **Orden** | Inicio ascendente (más antigua arriba, más futura abajo) |

Opciones adicionales: filtro por estado individual, paginación 10/50/100/500,
ordenación clic en cabeceras (Reserva, Estado, Inicio, Fin, Venc. 2º pago).

### 5.3. Panel lateral Emails / Docs

Por reserva: reenvío manual de cualquiera de los 6 emails, estado de envíos,
documentos subidos (preview + borrado manual), enlace a página cliente.

### 5.4. Endpoints API

| Ruta | Método | Función |
|---|---|---|
| `/api/admin/administracion` | GET | Tabla con JOINs (checklist, contrato, emails, docs) |
| `/api/admin/administracion` | PATCH | Marca/desmarca check manual |
| `/api/admin/administracion/send-email` | POST | Reenvío manual de un email |
| `/api/admin/administracion/documents` | GET/DELETE | Ver / eliminar docs subidos |

---

## 6. Crons (Vercel)

Configuración en `vercel.json`. Autenticación: header `Authorization: Bearer CRON_SECRET`.

| Cron | Schedule (UTC) | Hora Madrid (aprox.) | Función |
|---|---|---|---|
| `booking-management-email` | `*/5 * * * *` | cada 5 min | Envía email **1** cuando `management_email_due_at ≤ now` |
| `booking-admin-reminders` | `0 6 * * *` | 08:00 verano / 07:00 invierno | Recordatorios **2–5** (diarios) + cita **6** (una vez) |

**Lógica compartida:** `src/lib/rental-admin/dispatch.ts`.

| Opción en `sendGestionEmail` | Emails | Efecto |
|---|---|---|
| `onlyIfNotSent: true` | 1 (cron), 6 | Nunca reenvía si ya hay registro `sent` |
| `onlyIfNotSentToday: true` | 2, 3, 4, 5 (cron) | Máx. 1 envío al día; repite al día siguiente si sigue pendiente |
| Sin idempotencia | Reenvío manual (admin) | Siempre envía |

**Programación email 1:** `src/lib/rental-admin/schedule-management-email.ts`
(hook en Redsys, Stripe, pago manual).

---

## 7. Subida de documentación del cliente + IA

- Identidad sin login: reutilizar `contracts/validate-booking` (nº reserva + email).
- Subida directa a bucket privado `rental-documents` (patrón Storytellers
  `upload-init` → signed URL → confirm), pero simple: 4 slots por conductor.
- Validación con **GPT-4o Vision** (OpenAI ya integrado, `src/lib/chatbot/server.ts`):
  extrae nombre, nº documento, fecha nacimiento → edad, categoría B, antigüedad
  del carnet (≥ 2 años, apartado 2.1), caducidades; coteja contra `customers`.
- UI de subida dentro de `es/documentacion-alquiler` (junto a la firma).
- El recordatorio de documentación pasará a enlazar al link de subida.

---

## 8. Plan por fases

1. **BD:** `20260701-kill-notion-gestion.sql` + `20260702-management-email-schedule.sql` + `20260701b-rental-documents.sql`. ✅
2. **Emails:** plantillas + script de prueba, asuntos unificados, envío espaciado. ✅
3. **Sección `administracion`:** página + endpoints + UI (filtros, paginación, Devuelta). ✅
4. **Subida docs + IA:** endpoints + UI cliente + validación GPT-4o Vision. ✅
5. **Crons:** email 1 (cada 5 min) + recordatorios/cita (diario 06:00 UTC). ✅
6. **Retirar** automatizaciones n8n + base de datos de Notion. ← PENDIENTE

### Variables de entorno usadas
- `OPENAI_API_KEY` (validación IA; opcional `OPENAI_VISION_MODEL`, por defecto `gpt-4o`).
- `CONTRACTS_HMAC_SECRET` (o `STORYTELLERS_HMAC_SECRET`) para el token de sesión de subida.
- `NEXT_PUBLIC_SITE_URL` (por defecto `https://www.furgocasa.com`).
- `CRON_SECRET` (autenticación crons Vercel).
- `COMPANY_EMAIL` (por defecto `reservas@furgocasa.com`, CC en emails de gestión).

---

## 9. Archivos implicados (referencia rápida)

### Emails y envío
- Plantillas: `src/lib/email/templates.ts`
- SMTP: `src/lib/email/smtp-client.ts`
- Dispatch compartido: `src/lib/rental-admin/dispatch.ts`
- Programación email 1: `src/lib/rental-admin/schedule-management-email.ts`
- Prueba: `scripts/send-kill-notion-test-emails.ts`

### Crons
- Email 1 (20 min): `src/app/api/cron/booking-management-email/route.ts`
- Recordatorios 2–5 + cita 6: `src/app/api/cron/booking-admin-reminders/route.ts`
- Config: `vercel.json`

### Admin UI + API
- Página: `src/app/administrator/(protected)/administracion/page.tsx`
- API: `src/app/api/admin/administracion/{route,send-email,documents}/route.ts`
- Sidebar: `src/components/admin/sidebar.tsx`

### Subida documentación cliente
- Config/IA: `src/lib/rental-docs/{config,ai-validate}.ts`
- API: `src/app/api/rental-docs/{validate-booking,upload}/route.ts`
- UI: `src/components/rental-docs/rental-docs-upload.tsx`
- Página cliente: `src/app/es/documentacion-alquiler/`

### SQL (ejecutar en Supabase en este orden)
1. `supabase/migrations/20260701-kill-notion-gestion.sql`
2. `supabase/migrations/20260701b-rental-documents.sql`
3. `supabase/migrations/20260702-management-email-schedule.sql`

### Hooks de pago (programan email 1)
- `src/app/api/redsys/notification/route.ts`
- `src/app/api/redsys/verify-payment/route.ts`
- `src/app/api/stripe/webhook/route.ts`
- `src/app/api/payments/update-manual/route.ts`

### Datos existentes reutilizados
- `bookings`, `customers`, `vehicles`, `locations`
- `signed_contracts`, `booking_email_dispatches`
- `booking_admin_checklist`, `rental_documents`

### Material original Notion/n8n
- Carpeta `kill_notion/` (`.msg`, `.json` n8n, CSV Notion)

---

## 10. Diagrama de flujo (emails)

```
Cliente paga señal (1er pago)
        │
        ▼
Reserva pending → confirmed
        │
        ├──► Email confirmación 1er pago (instantáneo, otro sistema)
        │
        └──► Programa email 1 (+20 min en checklist)
                    │
                    ▼ (cron cada 5 min)
              Email 1: Gestión (Alquiler…)

        … días antes del viaje …

Cron diario 08:00 Madrid
        │
        ├── inicio−15 ≤ hoy + pendiente 2º pago  ──► Email 2 (cada día hasta pagar)
        ├── inicio−15 ≤ hoy + sin contrato       ──► Email 3 (cada día hasta firmar)
        ├── inicio−15 ≤ hoy + docs incompletas ──► Email 4 (cada día hasta subir)
        ├── inicio−8  ≤ hoy + fianza sin marcar  ──► Email 5 (cada día hasta marcar)
        │
        └── 2ª fact + contrato + docs + fianza OK ──► Email 6: Cita (UNA vez)
```
