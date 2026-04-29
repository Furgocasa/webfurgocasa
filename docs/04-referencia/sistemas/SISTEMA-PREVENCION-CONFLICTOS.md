# Guía: Sistema de Prevención de Conflictos de Reservas

## Objetivo

Garantizar que **NUNCA** se asignen dos reservas al mismo vehículo en fechas solapadas, manteniendo la integridad del sistema de alquiler.

## Principio Fundamental

> **Un vehículo, un cliente, una fecha**: Ningún vehículo puede estar en dos lugares al mismo tiempo.

## ⚠️ Regla Clave (actualizada 29/04/2026)

> 1. Una reserva **bloquea el vehículo** en cuanto su `status` operativo es **`confirmed`**, **`in_progress`** o **`completed`**, **independientemente del `payment_status`**.
>
> 2. Las reservas en `status = 'pending'` (carrito sin pagar) **NO bloquean** el vehículo. Pueden coexistir múltiples *pending*… pero solo durante un instante: aplica la **regla "última pending gana"** (ver más abajo).
>
> 3. Las reservas en `status = 'cancelled'` **NO bloquean**.

Esto incluye en el caso de las activas:

- ✅ Reservas confirmadas manualmente por el admin **sin pago registrado** (p. ej. reserva para un amigo).
- ✅ Reservas con **pago en efectivo a la entrega** (`payment_status = 'pending'`).
- ✅ Reservas con **pago por transferencia** aún sin registrar.
- ✅ Reservas en curso o ya completadas.

> **¿Por qué?** Una reserva confirmada por el administrador es un compromiso comercial firme; el sistema no puede saber si el dinero está en efectivo, en una transferencia bancaria pendiente de registro o en cualquier otro canal. **Si está confirmada, el vehículo está reservado**.

### 🔁 Regla "última pending gana" (29/04/2026)

> Si un cliente B intenta crear una reserva sobre fechas/vehículo donde ya hay una reserva en `pending` del cliente A (que aún no ha pagado), **la pending de A se cancela automáticamente** justo antes de crear la de B. Solo puede haber una *pending* viva por vehículo+fechas.

Razones:

- Una *pending* es solo "intención": el cliente puede no pagar nunca.
- Bloquear nuevos clientes por una pending sin pagar congelaría inventario sin compromiso real.
- La pending cancelada queda registrada con motivo y `updated_at`, así puede recuperarse si el cliente A llama y todavía está disponible.
- Si A paga, gana A (la confirma); si llega B antes que A pague, la de A se cancela y B se convierte en la nueva pending.

Implementación: en `src/app/api/bookings/create/route.ts`, antes del `INSERT`, se hace un `UPDATE … SET status='cancelled'` sobre las pendings solapantes del mismo vehículo.

### 🔒 Mensajes de error sin PII (RGPD)

> En ningún caso un mensaje de error visible para el usuario final debe contener datos personales de **otro** cliente (nombre, email, teléfono…).

- El **trigger SQL** `prevent_booking_conflicts` ya no incluye `customer_name` en `RAISE EXCEPTION` (solo `booking_number` y código de vehículo).
- El **endpoint `/api/bookings/create`** nunca devuelve el `error.message` crudo de un trigger o servicio interno: detecta si es conflicto y responde con un mensaje genérico, o con un 500 neutro.

### Histórico

- **27/04/2026**: se corrigió el filtro `payment_status IN ('partial','paid')` por `status IN ('confirmed','in_progress','completed')` en 7 endpoints + RPC. Ver [fix completo](../../03-mantenimiento/fixes/CORRECCION-DOBLE-RESERVA-2026-04-27.md).
- **29/04/2026**: se introduce la regla "última pending gana" y se elimina la filtración de datos personales en mensajes de conflicto. Ver [fix completo](../../03-mantenimiento/fixes/CORRECCION-PENDING-OVERRIDE-Y-RGPD-2026-04-29.md).

## Capas de Protección

### 🔍 Capa 1: Filtrado en Búsqueda (Prevención Temprana)

**Ubicación**: Formulario de búsqueda de vehículos (frontend público) y todos los endpoints de disponibilidad.

**Función**: Los vehículos con reservas activas **no aparecen** en los resultados de búsqueda.

**Tecnologías**:
- Función RPC `check_vehicle_availability` en Supabase (consultas server-side).
- Filtro directo en los 7 endpoints de la API (ver lista abajo).

**Endpoints alineados con la regla** (todos filtran por `status IN ('confirmed','in_progress','completed')`):
- `/api/availability` (buscador público).
- `/api/availability/alternatives` (sugerencias de fechas alternativas).
- `/api/bookings/create` (validación pre-creación).
- `/api/redsys/notification` (webhook de Redsys).
- `/api/redsys/verify-payment` (verificación de pago).
- `/api/admin/search-analytics` (informes de ocupación).
- `/api/admin/last-minute-offers/check-availability` (disponibilidad de ofertas de última hora).

**Beneficio**: El usuario solo ve opciones reales, evitando frustración y dobles reservas.

---

### ⚠️ Capa 2: Validación en Edición (Prevención en Admin)

**Ubicación**: `/administrator/reservas/[id]/editar`

**Función**: Antes de guardar cambios, valida que:
- El vehículo seleccionado esté disponible en las fechas elegidas
- No se solape con otras reservas activas
- Se excluya la reserva actual (para permitir editarla)

**Comportamiento**:
```typescript
if (conflictingBookings.length > 0) {
  // BLOQUEA el guardado
  // MUESTRA información del conflicto
  // PERMITE al usuario corregir
}
```

**Mensaje de error ejemplo**:
```
⚠️ CONFLICTO DE RESERVA: El vehículo ya tiene 1 reserva(s) en esas fechas:

BK-20260115-0362 (Nadalia Aguiar Vega) del 2026-03-27 al 2026-04-03

Por favor, selecciona otras fechas o un vehículo diferente.
```

---

### 🛡️ Capa 3: Trigger de Base de Datos (Protección Absoluta)

**Ubicación**: Base de datos PostgreSQL (Supabase)

**Función**: Trigger automático (`prevent_booking_conflicts`) que se ejecuta en **TODA** operación INSERT/UPDATE en la tabla `bookings`.

**Validaciones automáticas**:
1. ¿Hay otras reservas del mismo vehículo con fechas solapadas?
2. ¿La fecha de devolución es posterior a la de recogida?
3. ¿La reserva está cancelada? (si está cancelada, no valida)

**Comportamiento**:
```sql
-- Si hay conflicto:
RAISE EXCEPTION 'CONFLICTO DE RESERVA: ...'
-- La transacción se CANCELA automáticamente
```

**Ventajas**:
- ✅ **Funciona siempre**: Incluso si hay un bug en el frontend
- ✅ **Protege contra scripts**: No se puede saltear con código manual
- ✅ **Protege contra APIs**: Cualquier fuente de datos está protegida
- ✅ **Mensajes útiles**: Incluye información del conflicto

**Instalación**:
```sql
-- Ejecutar en Supabase SQL Editor:
-- Archivo: supabase/migrations/prevent-booking-conflicts.sql
```

> **⚠️ Importante (lección aprendida 27/04/2026)**: este trigger **debe estar instalado en el entorno de producción**. Durante la auditoría del incidente del 27/04/2026 se descubrió que el trigger **no estaba activo** en Supabase, dejando como única defensa la validación a nivel de aplicación. Verificar siempre con:
>
> ```sql
> SELECT tgname, tgrelid::regclass, tgenabled
> FROM pg_trigger
> WHERE tgname = 'prevent_booking_conflicts';
> ```
>
> Si la consulta devuelve 0 filas, **reinstalar inmediatamente** ejecutando `supabase/migrations/prevent-booking-conflicts.sql`.

**⚠️ Riesgo si solo confías en el trigger sin la Capa 1 alineada**: si el trigger bloquea el INSERT pero el cliente ya pagó por Redsys, se generaría un **cobro sin reserva**. Por eso las Capas 1 y 2 deben estar siempre coherentes con la Capa 3 (mismo criterio de "reserva activa").

---

### 📊 Capa 4: Detección y Diagnóstico (Auditoría)

**Ubicación**: Scripts SQL de diagnóstico

**Función**: Detectar conflictos existentes en los datos (si los hay).

**Uso**:
```sql
-- Ejecutar en Supabase SQL Editor:
-- Archivo: supabase/check-booking-conflicts.sql
```

**Qué detecta**:
1. Reservas con fechas solapadas
2. Duplicados exactos (mismas fechas)
3. Errores de integridad (dropoff < pickup)
4. Resumen por vehículo

**Cuándo usarlo**:
- 🔧 Después de migraciones de datos
- 🔍 Si sospechas de problemas en los datos
- 📋 Auditorías periódicas de calidad de datos
- 🚨 Si el calendario muestra indicadores de conflicto (⚠️)

---

## Flujo de Trabajo: Editar una Reserva

### Escenario Normal (Sin Conflictos)

1. Admin abre formulario de edición
2. Cambia fechas o vehículo
3. Click en "Guardar cambios"
4. ✅ **Validación frontend**: Verifica disponibilidad
5. ✅ **Validación backend (trigger)**: Verifica conflictos
6. ✅ Guardado exitoso
7. Redirección a página de detalles

### Escenario con Conflicto

1. Admin abre formulario de edición
2. Cambia a vehículo ya reservado
3. Click en "Guardar cambios"
4. ⚠️ **Validación frontend**: Detecta conflicto
5. ❌ **Bloquea el guardado**
6. 📋 Muestra mensaje con detalles del conflicto:
   - Número de reserva conflictiva
   - Nombre del cliente
   - Fechas del conflicto
7. Admin puede:
   - Cambiar a otro vehículo
   - Cambiar las fechas
   - Cancelar la edición

**Importante**: Si por algún motivo pasa la validación frontend, el **trigger de base de datos** bloqueará la operación como última línea de defensa.

---

## Mensajes de Error

### En Frontend (Formulario de Edición)

```
⚠️ CONFLICTO DE RESERVA: El vehículo ya tiene 2 reserva(s) en esas fechas:

BK-20260115-0362 (Nadalia Aguiar Vega) del 2026-03-27 al 2026-04-03
BK-20260120-0405 (Juan Pérez) del 2026-04-01 al 2026-04-05

Por favor, selecciona otras fechas o un vehículo diferente.
```

### En Backend (Trigger de Base de Datos)

```
CONFLICTO DE RESERVA: El vehículo FUR0820 ya tiene 1 reserva(s) activa(s) en ese período. Primera reserva conflictiva: BK-20260115-0362 (Nadalia Aguiar Vega). Fechas solicitadas: 2026-03-28 al 2026-04-02. Por favor, selecciona otras fechas o un vehículo diferente.
```

---

## Mantenimiento

### Verificación Periódica (Mensual)

```sql
-- Ejecutar en Supabase SQL Editor
-- Debería devolver 0 resultados si todo está bien

-- Archivo: supabase/check-booking-conflicts.sql
```

### Si se Detectan Conflictos

1. **Identificar el origen**:
   - ¿Migración de datos?
   - ¿Bug en código antiguo?
   - ¿Operación manual directa en BD?

2. **Corregir manualmente**:
   - Revisar cada reserva conflictiva
   - Decidir cuál es la correcta
   - Cancelar o modificar la incorrecta

3. **Verificar que no vuelva a pasar**:
   - Confirmar que el trigger está activo
   - Ejecutar pruebas de validación
   - Revisar logs de errores

### Desactivar Trigger Temporalmente (Emergencia)

```sql
-- SOLO en caso de emergencia
-- Por ejemplo, durante una migración masiva de datos

ALTER TABLE bookings DISABLE TRIGGER prevent_booking_conflicts;

-- ... realizar operaciones de emergencia ...

-- REACTIVAR INMEDIATAMENTE
ALTER TABLE bookings ENABLE TRIGGER prevent_booking_conflicts;
```

⚠️ **ADVERTENCIA**: Con el trigger desactivado, el sistema NO protege contra conflictos. Usar solo en emergencias y reactivar inmediatamente.

---

## Preguntas Frecuentes

### ¿Puedo editar una reserva sin cambiar el vehículo?
✅ Sí, puedes cambiar fechas, precios, cliente, etc. sin problemas mientras no haya conflictos.

### ¿Puedo cambiar el vehículo de una reserva?
✅ Sí, pero el nuevo vehículo debe estar disponible en las fechas de la reserva.

### ¿Qué pasa si intento guardar una reserva conflictiva?
❌ El formulario bloquea el guardado y muestra un error explicativo con los detalles del conflicto.

### ¿Y si salteo la validación del frontend?
🛡️ El trigger de base de datos bloquea la operación automáticamente.

### ¿Puedo crear una reserva manualmente en la base de datos?
⚠️ Sí, pero el trigger validará igualmente. Si hay conflicto, la operación falla.

### ¿Cómo sé si hay conflictos en mis datos actuales?
🔍 Ejecuta el script `check-booking-conflicts.sql` en Supabase. Si devuelve resultados, hay conflictos.

### ¿El trigger afecta el rendimiento?
⏱️ Impacto mínimo. Solo se ejecuta en INSERT/UPDATE de reservas (operaciones poco frecuentes).

### ¿Qué pasa con las reservas canceladas?
✅ Las reservas canceladas NO cuentan para la validación de conflictos. Puedes tener múltiples reservas canceladas solapadas.

### ¿Y las reservas en estado `pending`?
✅ Una reserva `pending` (carrito creado pero aún no confirmado/pagado) **NO bloquea** el vehículo. Se considera "intención" hasta que se confirme o se pague.

Además, desde 29/04/2026 aplica la regla **"última pending gana"**: si un cliente B intenta crear una reserva en fechas/vehículo donde había una pending de A, la de A se cancela automáticamente al crear la de B. Si A paga antes de que B llegue, gana A y se confirma. Si llega B antes, A queda cancelada (con motivo registrado en `notes`).

### ¿Qué pasa con una reserva `confirmed` con `payment_status = 'pending'`?
🚫 **BLOQUEA** el vehículo. Desde el 27/04/2026, el sistema considera reservada cualquier reserva con `status` operativo, sin importar el estado de pago. Esto cubre los casos de pago en efectivo, transferencia pendiente o reservas creadas manualmente por el admin.

### ¿Puedo crear dos reservas del mismo vehículo en fechas contiguas?
✅ Sí, siempre que no se solapen. Por ejemplo:
- Reserva 1: 01/03 al 10/03
- Reserva 2: 11/03 al 20/03
- ✅ Permitido (no se solapan)

### ¿Qué pasa si las fechas son exactamente contiguas (mismo día fin/inicio)?
⚠️ Depende de la lógica de negocio. Actualmente:
- Reserva 1: 01/03 al 10/03
- Reserva 2: 10/03 al 20/03
- ❌ **Bloqueado** (el día 10 está en ambas)

Si quieres permitir esto (entrega/recogida el mismo día), necesitas ajustar la lógica del trigger.

---

## Conclusión

Con estas 4 capas de protección, el sistema garantiza que:

1. ✅ Los usuarios solo ven vehículos disponibles
2. ✅ El admin es avisado antes de cometer un error
3. ✅ La base de datos bloquea cualquier conflicto automáticamente
4. ✅ Se pueden detectar y corregir problemas existentes

**Resultado**: Es prácticamente imposible asignar el mismo vehículo a dos clientes en las mismas fechas.

---

**Última actualización**: 2026-04-29  
**Versión del sistema**: 1.2 — Regla "última pending gana" + mensajes sin PII (RGPD)  
**Estado**: ✅ Implementado y activo en las 4 capas

**Documentos relacionados**:
- [Fix pending override + RGPD 29/04/2026](../../03-mantenimiento/fixes/CORRECCION-PENDING-OVERRIDE-Y-RGPD-2026-04-29.md)
- [Fix doble reserva 27/04/2026](../../03-mantenimiento/fixes/CORRECCION-DOBLE-RESERVA-2026-04-27.md)
- [Corrección calendario duplicados (20/01/2026)](../../03-mantenimiento/fixes/CORRECCION-CALENDARIO-DUPLICADOS.md)
- Migración SQL: `supabase/migrations/20260429-prevent-conflicts-pending-rgpd.sql`
- Migración SQL: `supabase/migrations/20260427-fix-availability-by-status.sql`
- Migración SQL: `supabase/migrations/prevent-booking-conflicts.sql`
