# 📅 Calendario Admin — Reservas sin vehículo asignado + Edición inline

> **Estado:** ✅ Producción — 17 de abril 2026
> **Rutas afectadas:** `/administrator/calendario`, `/administrator/reservas`, `/administrator/reservas/[id]`, `/administrator/reservas/[id]/editar`
> **Tabla afectada:** `bookings`

Este documento recoge el **nuevo flujo operativo del administrador** para reasignar la flota desde el calendario sin salir de la pantalla, más el **fix de `total_price` con comisión Stripe** que hacía que no se pudiera guardar el cambio.

---

## 🎯 Problema que resuelve

Antes, para reasignar vehículos entre reservas cuando toda la flota estaba ocupada, el admin tenía que:

1. Crear un vehículo temporal ficticio.
2. Mover la reserva a ese vehículo.
3. Recolocar el resto.
4. Volver a mover a la camper real.
5. Borrar el vehículo temporal.

Era el clásico "15-puzzle": sin hueco libre no se puede mover nada, y cada cambio forzaba navegar a `/reservas/[id]/editar`, guardar, volver al calendario, repetir.

Ahora todo el ciclo se hace **desde el propio calendario**, con guardado al vuelo y sin crear vehículos ficticios.

---

## 🗄️ 1. Reservas sin vehículo asignado (`vehicle_id NULL`)

### Migración SQL

`supabase/migrations/20260417-allow-null-vehicle-in-bookings.sql`

```sql
ALTER TABLE bookings
  ALTER COLUMN vehicle_id DROP NOT NULL;

COMMENT ON COLUMN bookings.vehicle_id IS
  'Vehículo asignado al alquiler. Puede ser NULL temporalmente cuando se está reasignando la flota (estado "pendiente de asignar").';
```

La FK sigue existiendo: si hay valor, debe apuntar a un `vehicles.id` real. El `NULL` es el estado intermedio "pendiente de asignar".

### Tipos TypeScript

- `src/lib/supabase/database.types.ts`: `vehicle_id: string | null` en `Row`, `Insert`, `Update`.
- `src/app/administrator/(protected)/calendario/page.tsx` — `Booking.vehicle_id: string | null`.
- `src/app/administrator/(protected)/reservas/[id]/page.tsx` — idem.

### Reglas de negocio

| Estado `bookings.status` | `vehicle_id = NULL` permitido | Motivo |
|---|---|---|
| `pending` | ✅ | Caso original (admin aún no ha asignado) |
| `confirmed` | ✅ | **Reasignación de flota** — caso principal de la feature |
| `cancelled` | ✅ | Da igual, no ocupa |
| `in_progress` | ❌ | Cliente ya tiene físicamente una camper |
| `completed` | ❌ | Cliente ya devolvió una camper |

**Safeguard implementado en dos lugares:**

1. `src/app/administrator/(protected)/reservas/[id]/editar/page.tsx` — `handleSubmit` rechaza guardar con error amable.
2. `src/app/administrator/(protected)/calendario/page.tsx` — `handleQuickAssignVehicle` y `handleQuickChangeStatus` muestran mensaje rojo en el modal.

### Impacto en disponibilidad pública

Una reserva con `vehicle_id = NULL` **no bloquea a ningún vehículo concreto** en la API `/api/availability`, así que no interfiere con el buscador público. Sigue contando internamente para el admin como "pendiente de asignar".

---

## 🖥️ 2. UI del calendario admin

### Banner de pendientes (parte superior)

`src/app/administrator/(protected)/calendario/page.tsx` → `unassignedBookings`

Cuando hay al menos una reserva sin vehículo, aparece un banner ámbar arriba del calendario con el contador y hasta 6 chips con `booking_number` · nombre cliente, clicables.

### Filas "Sin asignar N" en el Gantt (desktop)

En vez de apilar todas las pendientes en una sola fila compartida (antes: `⚠️ S/A`), ahora se renderiza **una fila por cada reserva** sin vehículo, etiquetadas `Sin asignar 1`, `Sin asignar 2`, …, cada una con:

- Código `⚠️ S/A 1`, `⚠️ S/A 2`, … en la columna izquierda.
- Nombre con `booking_number` + cliente.
- Barra ámbar entre `pickup_date` y `dropoff_date` exactas.
- Badges verde (recogida) / rojo (devolución) con **6 primeras letras de la ubicación** (misma lógica que los vehículos normales).
- Click → abre el modal emergente de esa reserva.

Se oculta cuando se filtra por `searchCode`.

### Vista móvil

Los días con pendientes muestran un badge `⚠️S/A` en el número de reservas. No hay filas por vehículo en móvil, así que el banner superior sigue siendo el acceso rápido.

### Listado de reservas (`/administrator/reservas`)

- Banner ámbar arriba con el contador si `unassignedCount > 0`.
- Columna "Cód." con badge `⚠️ S/A` naranja en filas sin vehículo.
- Columna "Vehículo" muestra `Pendiente asignar` en lugar del código.

### Ficha de reserva (`/administrator/reservas/[id]`)

Si `vehicle_id = NULL`, el bloque de "Vehículo" se reemplaza por panel ámbar con botón directo **"Asignar vehículo"** que lleva a `/editar`.

### Suscripción ICS (calendario externo)

`src/lib/calendar/ics-generator.ts` — `vehicleName` cae en `'⚠️ SIN ASIGNAR'` cuando `booking.vehicle` es `null`, de forma que Google Calendar / Outlook también lo marcan visualmente.

---

## ⚡ 3. Modal emergente con editor inline

Se amplió el popup que sale al hacer click en un alquiler del calendario para que sea un **editor inline completo**. Todas las operaciones persisten al vuelo en Supabase vía el helper `patchBookingInline()` y refrescan el estado local (`bookings` + `selectedBooking`) sin recarga.

### Campos editables en el modal

| Campo | Control | Feedback |
|---|---|---|
| **Estado** (cabecera) | `<select>` con 5 opciones: Pendiente · Confirmada · En curso · Completada · Cancelada | La cabecera recolorea al instante |
| **Vehículo** | `<select>` de flota completa con marca `(actual)` / `✓ libre` / `⚠️ OCUPADO` | Mensaje verde/rojo 2,5 s |
| **Fecha de recogida** | `<input type="date">` (picker nativo) | Valida `dropoff ≥ pickup` |
| **Hora de recogida** | `<input type="time">` (picker nativo) | — |
| **Fecha de devolución** | `<input type="date">` con `min = pickup_date` | Valida `dropoff ≥ pickup` |
| **Hora de devolución** | `<input type="time">` | — |
| **Ubicación de origen** | `<select>` con `locations` activas | Nombre + ciudad |
| **Ubicación de destino** | `<select>` con `locations` activas | Nombre + ciudad |

Spinner "Guardando…" en la cabecera de la sección Vehículo (compartido por todos los editores), y mensajes de éxito/error autohide a 2,5 s.

### Detección de conflictos al reasignar vehículo

`hasVehicleConflict(vehicleId, pickup, dropoff, excludeBookingId)` compara con `bookings` cargados del calendario. Marca como `⚠️ OCUPADO` cualquier vehículo con reserva no cancelada que solape fechas. El admin puede **aun así** forzar la asignación (queda bajo su responsabilidad), no es bloqueante.

### Safeguards en el modal

- No permite cambiar estado a `in_progress` / `completed` si `vehicle_id = NULL`.
- No permite dejar sin vehículo reservas `in_progress` / `completed`.
- No permite `dropoff_date < pickup_date`.

### Botones del footer

- **Cerrar** — descarta apertura y limpia `assignMessage`.
- **Ver detalles** — navega a `/administrator/reservas/[id]` (acceso completo).
- **Editar** — navega a `/administrator/reservas/[id]/editar` (precios, extras, notas, etc.).

### Helper central

```ts
patchBookingInline(booking, patch, successText, extraLocalFields?)
```

Centraliza: `supabase.from('bookings').update(patch)` + mutación de `bookings[]` + `selectedBooking` + mensaje. Todas las funciones `handleQuick*` lo usan:

- `handleQuickAssignVehicle`
- `handleQuickChangeStatus`
- `handleQuickChangeDate` (pickup/dropoff)
- `handleQuickChangeTime` (pickup/dropoff)
- `handleQuickChangeLocation` (pickup/dropoff)

### Limitación consciente

Mover fechas inline **no recalcula `total_price`**. Si cambia la duración, hay que pasar por el botón "Editar" completo para recalcular base × días, revisar extras, descuentos y, sobre todo, **comisión Stripe ya pagada**. El modal muestra un aviso recordatorio bajo el bloque de fechas.

---

## 💳 4. Fix: `total_price` debe incluir `stripe_fee_total` al editar

### Síntoma

Al intentar guardar una reserva como *Sin vehículo asignado* (o cualquier cambio) si la reserva tenía pago(s) por Stripe, el navegador bloqueaba el guardado con:

> *"El valor debe ser inferior o igual a 1615…"*

### Causa raíz

El webhook de Stripe (`src/app/api/stripe/webhook/route.ts`) acumula la comisión repercutida al cliente en `bookings.total_price` y `bookings.stripe_fee_total` cada vez que se produce un cobro:

```ts
const newAmountPaid = (booking.amount_paid || 0) + payment.amount;       // incluye fee
const newTotalPrice = (booking.total_price || 0) + fee;                  // incluye fee
const newStripeFeeTotal = (booking.stripe_fee_total || 0) + fee;         // acumulado
```

El formulario de edición (`src/app/administrator/(protected)/reservas/[id]/editar/page.tsx`) recalculaba al vuelo:

```ts
total = base_price + extras_price + location_fee - discount
```

**Sin sumar `stripe_fee_total`**, por lo que `total_price` recalculado < `amount_paid`, y el input de *Monto pagado* (que tenía `max={formData.total_price}`) rechazaba el submit con el mensaje nativo del navegador.

### Solución aplicada

`src/app/administrator/(protected)/reservas/[id]/editar/page.tsx`:

1. `FormData` añade `stripe_fee_total: number`.
2. `loadData()` lo carga desde la reserva.
3. `useEffect` de recálculo lo suma: `total = base + extras + location_fee - discount + stripe_fee_total`.
4. `handleSubmit()` lo envía en el UPDATE para no perderlo.
5. Se muestra en el desglose ("Comisión pasarela Stripe: +X€").
6. Se elimina `max={formData.total_price}` del input de *Monto pagado* y se reemplaza por un aviso textual suave cuando hay descuadre.

### Script de reparación puntual

`supabase/migrations/20260417-fix-booking-16bf1a08-total-price.sql`:

- SELECT de diagnóstico (`total_price_actual` vs `total_price_calculado` vs `diferencia`).
- SELECT de pagos asociados (`payments.amount`, `stripe_fee`).
- UPDATE comentado para recalcular `total_price = base + extras + location_fee - discount + stripe_fee_total`.

Solo ejecutar el UPDATE si el diagnóstico muestra `diferencia > 0`.

---

## 🗺️ Archivos clave

### Migraciones SQL
- `supabase/migrations/20260417-allow-null-vehicle-in-bookings.sql`
- `supabase/migrations/20260417-fix-booking-16bf1a08-total-price.sql`
- `supabase/schema.sql` — `bookings.vehicle_id UUID REFERENCES vehicles(id)` (sin `NOT NULL`).

### Tipos
- `src/lib/supabase/database.types.ts`

### Pantallas admin
- `src/app/administrator/(protected)/calendario/page.tsx` — modal inline, filas "Sin asignar N", banner, helpers `handleQuick*` + `patchBookingInline`.
- `src/app/administrator/(protected)/reservas/page.tsx` — banner + badges.
- `src/app/administrator/(protected)/reservas/[id]/page.tsx` — panel "Asignar vehículo" si null.
- `src/app/administrator/(protected)/reservas/[id]/editar/page.tsx` — opción "— Sin vehículo asignado —", fix `stripe_fee_total`, safeguards.
- `src/app/administrator/(protected)/clientes/[id]/page.tsx` — optional chaining en histórico.

### Integraciones externas
- `src/lib/calendar/ics-generator.ts` — `'⚠️ SIN ASIGNAR'` en eventos ICS.

---

## ✅ Flujo operativo recomendado (reasignación de flota, todo desde el calendario)

1. **Liberar una camper**: click en el alquiler al que le quieres quitar el vehículo → en el modal, `Vehículo` → `— Sin vehículo asignado —` → guarda.
2. **Reubicar los demás**: click en el que quieres mover al hueco → `Vehículo` → elige la camper liberada (marcada `✓ libre`) → guarda.
3. **Asignar al pendiente**: click en la fila `Sin asignar 1` del Gantt → `Vehículo` → elige la camper que ahora ha quedado libre → guarda.

Sin navegar, sin recargar, sin crear vehículos ficticios.

---

**Commits de referencia (17 abril 2026):**
- `66db097` — feat(reservas): permitir reservas sin vehículo asignado para facilitar reasignaciones
- `4f75175` — fix(reservas/editar): incluir stripe_fee_total en el total al editar
- `5f9dbcb` — feat(calendario): fila por cada alquiler sin vehículo asignado
- `5984f2c` — fix(reservas/editar): permitir "Confirmada" sin vehículo asignado
- `4ec83ae` — fix(calendario): mostrar localización en filas "Sin asignar"
- `a8b41be` — feat(calendario): añadir botón Editar en el modal del alquiler
- `5a782a6` — feat(calendario): reasignar vehículo desde el modal emergente
- `0fc2162` — feat(calendario): editar fechas, horas y ubicaciones desde el modal
- `4449589` — feat(calendario): cambiar estado de la reserva desde el modal
