# KILL NOTION — Sistema de gestión de alquileres en el panel admin

> Guía maestra de implementación. Si el trabajo se corta, aquí está TODO lo
> acordado y lo que falta por hacer. Objetivo: **eliminar la dependencia de
> Notion** replicando dentro de la app el checklist de gestión de cada alquiler
> y los emails automáticos/manuales que hoy dispara n8n contra Notion.

- **Estado:** IMPLEMENTADO (emails, SQL, sección admin, subida de docs + IA y cron).
  Pendiente solo: ejecutar `20260701b-rental-documents.sql` en Supabase y retirar n8n/Notion.
- **Fecha inicio:** 01/07/2026
- **Ámbito:** nueva sección `administrator/administracion` + emails + subida de
  documentación del cliente con validación por IA.

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

---

## 4. Emails (texto plano, estilo Narciso)

Plantillas nuevas en `src/lib/email/templates.ts` (sección "GESTIÓN / KILL
NOTION"). Todas devuelven `{ subject, html }`, estilo texto plano simple (no la
plantilla HTML corporativa), lo más parecido a los `.msg` originales.

Asuntos UNIFICADOS (formato del primero): `{prefijo} FURGOCASA {code} - {vehículo} del {ini} al {fin}`.

| Función | Uso | Prefijo del asunto | Base |
|---|---|---|---|
| `getBookingManagementEmail` | Auto 20 min tras 1er pago + confirmación (cron cada 5 min) | `Alquiler` | `kill_notion/1 - Alquiler…msg` + n8n |
| `getSecondPaymentReminderEmail` | Recordatorio 2º pago | `VENCIDO 2º pago` | n8n "Pedir 2º Pago" |
| `getContractReminderEmail` | Recordatorio contrato | `Contrato pendiente` | n8n "Pedir firmar contrato" |
| `getDocumentationReminderEmail` | Recordatorio documentación (link de subida) | `Documentación pendiente` | n8n "Pedir documentación" |
| `getDepositReminderEmail` | Recordatorio fianza | `Fianza pendiente` | n8n "Pedir fianza" |
| `getAppointmentEmail` | Cita final | `Cita` | `kill_notion/5 - Cita…msg` |

> Los emails 1 (gestión) y 4 (documentación) piden subir la documentación desde
> `www.furgocasa.com/es/documentacion-alquiler` (ya NO por respuesta al email).
> El envío de prueba está espaciado 5 s entre correos para no saturar el SMTP.

Envío: `sendEmail()` (`src/lib/email/smtp-client.ts`), CC a `reservas@furgocasa.com`.
Registro e idempotencia en `booking_email_dispatches`.

**Script de prueba:** `scripts/send-kill-notion-test-emails.ts` — coge una
reserva real y envía los 6 emails a `reservas@furgocasa.com` con prefijo
`[TEST]` (al cliente NO se le envía). Uso:

```
npx tsx scripts/send-kill-notion-test-emails.ts            # reserva automática
npx tsx scripts/send-kill-notion-test-emails.ts FG12345678 # reserva concreta
```

---

## 5. Sección `administrator/administracion` (FASE 3)

- Entrada nueva en el sidebar (`src/components/admin/sidebar.tsx`).
- Página `src/app/administrator/(protected)/administracion/page.tsx`: tabla con
  una fila por reserva "en gestión" (no canceladas / finalizadas antiguas).
- Por fila: código, cliente, vehículo, inicio, **Vencimiento** y **Límite
  fianza** (con semáforo si vencidos); checkboxes manuales (1º pago, 2º pago,
  fianza), estados de solo lectura (contrato firmado, primer mail, cita,
  documentación IA, estado), y botones: reenviar recordatorio concreto /
  "Enviar cita".
- Endpoints en `src/app/api/admin/administracion/`:
  - `GET` — tabla con JOINs (checklist + contrato + emails enviados + docs).
  - `PATCH` — marca/desmarca un check (guarda `updated_by`).
  - `POST` — reenvío manual de un email concreto.

---

## 6. Cron de recordatorios + cita (FASE 5)

`src/app/api/cron/booking-admin-reminders/route.ts` (patrón `return-reminders`).
Alta en `vercel.json` (p. ej. `0 8 * * *`). Cada mañana aplica las reglas de la
sección 1 leyendo checklist + `signed_contracts` + `rental_documents`, envía y
registra en `booking_email_dispatches` (nunca reenvía lo ya enviado). Cuando
los 4 checks manuales + contrato + documentación están OK y la cita no se ha
enviado → envía `getAppointmentEmail` y marca `appointment_confirmed`.

---

## 7. Subida de documentación del cliente + IA (FASE 4)

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

1. **BD:** `20260701-kill-notion-gestion.sql` ejecutado y verificado. ✅
2. **Emails:** plantillas + script de prueba, asuntos unificados, envío espaciado. ✅
3. **Sección `administracion`:** página + endpoints GET/PATCH + send-email + documents. ✅
   - Página: `src/app/administrator/(protected)/administracion/page.tsx`
   - API: `src/app/api/admin/administracion/{route,send-email,documents}.ts`
   - Sidebar: entrada "Administración".
4. **Subida docs + IA:** ✅ (falta ejecutar `20260701b-rental-documents.sql` en Supabase)
   - Config/IA: `src/lib/rental-docs/{config,ai-validate}.ts`
   - API cliente: `src/app/api/rental-docs/{validate-booking,upload}/route.ts`
   - UI cliente: `src/components/rental-docs/rental-docs-upload.tsx` (en `documentacion-alquiler`).
5. **Cron** `src/app/api/cron/booking-admin-reminders/route.ts` + `vercel.json` (`0 6 * * *`). ✅
   - Lógica de envío compartida: `src/lib/rental-admin/dispatch.ts`.
6. **Retirar** automatizaciones n8n + base de datos de Notion. ← PENDIENTE (tras validar en producción)

### Variables de entorno usadas
- `OPENAI_API_KEY` (validación IA; opcional `OPENAI_VISION_MODEL`, por defecto `gpt-4o`).
- `CONTRACTS_HMAC_SECRET` (o `STORYTELLERS_HMAC_SECRET`) para el token de sesión de subida.
- `NEXT_PUBLIC_SITE_URL` (por defecto `https://www.furgocasa.com`), `CRON_SECRET`.

---

## 9. Archivos implicados (referencia rápida)

- Emails: `src/lib/email/templates.ts`, `src/lib/email/smtp-client.ts`.
- Prueba: `scripts/send-kill-notion-test-emails.ts`.
- SQL: `supabase/migrations/20260701-kill-notion-gestion.sql`.
- Fuentes de datos existentes: `signed_contracts`, `booking_email_dispatches`,
  `bookings`, `customers`, `vehicles`, `locations`.
- Patrones reutilizables: `src/app/api/cron/return-reminders/route.ts`,
  `src/app/api/storytellers/upload-init/route.ts`,
  `src/app/api/contracts/validate-booking/route.ts`.
- Material original: carpeta `kill_notion/` (`.msg` y `.json` de n8n, CSV Notion).
