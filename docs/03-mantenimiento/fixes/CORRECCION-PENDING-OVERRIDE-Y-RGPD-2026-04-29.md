# Fix: Regla "última pending gana" + mensajes sin datos personales (RGPD)

**Fecha**: 29 de abril de 2026  
**Severidad**: 🔴 ALTA — bloqueaba reservas legítimas y filtraba datos personales de terceros (RGPD).  
**Estado**: ✅ Resuelto y desplegado en producción  
**Continúa**: este fix amplía y completa el del [27/04/2026](./CORRECCION-DOBLE-RESERVA-2026-04-27.md).

---

## 🚨 Resumen ejecutivo

Tras el fix del 27/04 (filtros por `status` en lugar de `payment_status`), aparecieron dos problemas nuevos al intentar crear reservas:

1. **El cliente nuevo no podía reservar** un vehículo que el buscador le mostraba como disponible si existía una reserva *pending* anterior de otro cliente. El trigger SQL `prevent_booking_conflicts` lo bloqueaba al hacer el INSERT, aunque la regla de negocio explícita es que las pendings **no deben bloquear**.
2. **Se filtraban datos personales de otros clientes**: el mensaje de conflicto del trigger incluía el `customer_name` de la reserva anterior, ese mensaje viajaba hasta el frontend y se mostraba al cliente final → **brecha de RGPD**.

Ambos problemas se han resuelto a nivel de código (API), trigger SQL y documentación.

---

## 🧬 Detalle técnico

### Problema 1 — pendings que bloqueaban INSERT

- `/api/availability` filtraba correctamente por `status IN ('confirmed','in_progress','completed')` y NO mostraba los vehículos con reservas activas.
- `/api/bookings/create` también filtraba correctamente.
- **Pero el trigger SQL `prevent_booking_conflicts` bloqueaba con `status != 'cancelled'`**, por lo que cuando una segunda reserva *pending* intentaba insertarse en fechas donde ya había otra *pending*, el trigger lanzaba `RAISE EXCEPTION` y la transacción se revertía.

### Problema 2 — RGPD

El trigger devolvía un mensaje del tipo:

```
CONFLICTO DE RESERVA: El vehículo FUR0820 ya tiene 1 reserva(s) activa(s) en
ese período. Primera reserva conflictiva: BK-20260427-1234 (Pepe Pérez García).
Fechas solicitadas: 2026-08-12 al 2026-08-19. Por favor, selecciona otras
fechas o un vehículo diferente.
```

Ese mensaje viajaba como `error.message` hasta `/api/bookings/create`, que lo devolvía sin filtrar al frontend, y el frontend (`/reservar/nueva`) lo pintaba con `setError(error.message)`. Resultado: el nuevo cliente B podía leer el **nombre completo del cliente A**.

---

## ✅ Solución aplicada

### Regla nueva — "última pending gana"

> Si al crear una reserva existen pendings solapantes del mismo vehículo y fechas, **se cancelan automáticamente** antes del INSERT.
> Solo puede haber **una pending viva** por vehículo+fechas en cada momento.

Implementación en `src/app/api/bookings/create/route.ts`, justo después de validar conflictos activos:

```ts
const { data: cancelledPendings } = await supabase
  .from("bookings")
  .update({
    status: "cancelled",
    notes: `❌ CANCELADA AUTOMÁTICAMENTE: el vehículo fue solicitado por otro cliente con una nueva reserva pendiente para fechas solapadas. ...`,
    updated_at: new Date().toISOString(),
  })
  .eq("vehicle_id", booking.vehicle_id)
  .eq("status", "pending")
  .lte("pickup_date", booking.dropoff_date)
  .gte("dropoff_date", booking.pickup_date)
  .select("id, booking_number");
```

Comportamiento resultante:

- Cliente A reserva → su reserva queda en `pending`. No paga aún.
- Cliente B busca esas mismas fechas → el vehículo le sale disponible (regla 27/04).
- Cliente B reserva → la pending de A pasa a `cancelled` con motivo en `notes` y el INSERT de B entra correctamente como nueva `pending`.
- Si A paga primero (vía Redsys), su pending pasa a `confirmed` y el sistema cancela las pendings de cualquier B (este flujo ya existía en `/api/redsys/notification`).
- Si nadie paga, el último pending sigue siendo el "candidato" y el vehículo aparece disponible para nuevos clientes.

### Trigger SQL — bloqueo solo de activas + sin PII

Migración: `supabase/migrations/20260429-prevent-conflicts-pending-rgpd.sql`.

Cambios clave:

1. **Filtro alineado con la API**: `status IN ('confirmed','in_progress','completed')`. Las pendings **NO disparan conflicto**.
2. **Mensaje sin datos personales**: solo `vehicle.internal_code` + `booking_number` + fechas. Nunca `customer_name`/`customer_email`.

```sql
RAISE EXCEPTION 'CONFLICTO_RESERVA: El vehículo % ya tiene una reserva
activa que solapa con las fechas % a %. Reserva conflictiva: %. Selecciona
otras fechas o un vehículo diferente.',
  COALESCE(vehicle_code, 'seleccionado'),
  NEW.pickup_date,
  NEW.dropoff_date,
  COALESCE(conflict_booking_number, 'desconocida');
```

### Endpoint — saneamiento de mensajes (defensa en profundidad)

`/api/bookings/create` ya nunca devuelve el `bookingError.message` crudo:

```ts
if (bookingError || !createdBooking) {
  const rawMessage = (bookingError?.message || "").toLowerCase();
  const isConflict = rawMessage.includes("conflicto") || rawMessage.includes("conflict");
  if (isConflict) {
    return NextResponse.json({ error: "El vehículo no está disponible …" }, { status: 409 });
  }
  return NextResponse.json({ error: "No hemos podido crear la reserva …" }, { status: 500 });
}
```

Mismo tratamiento en el `catch` general del endpoint. Esto protege incluso si en el futuro se introduce algún otro trigger o servicio que devuelva mensajes con PII.

---

## 🧪 Pruebas de verificación

1. **Doble pending sin pago**:
   - Cliente A crea reserva → queda `pending`.
   - Cliente B busca mismas fechas → vehículo disponible.
   - Cliente B reserva → INSERT exitoso. A queda `cancelled` con motivo claro en `notes`.

2. **Pending vs confirmada**:
   - Cliente A tiene `confirmed` (con o sin pago).
   - Cliente B busca → vehículo NO aparece. Si fuerza la URL → INSERT rechazado con HTTP 409 y mensaje genérico ("El vehículo no está disponible…"). Sin nombre del cliente A.

3. **Pago tras pending**:
   - Cliente A crea pending → cliente B también → A pasa a cancelada → A llega tarde a pagar → la pasarela debe ver que A está `cancelled` y rechazar el pago. El `/api/redsys/notification` ya valida este caso.

4. **Trigger directo en BD**:
   - INSERT manual en `bookings` con `status='pending'` solapando otra pending → debe **funcionar** (no lanza excepción).
   - INSERT manual con `status='confirmed'` solapando otra `confirmed` → debe lanzar `CONFLICTO_RESERVA: ...` SIN incluir `customer_name`.

---

## 📁 Archivos modificados / creados

### Modificados
- `src/app/api/bookings/create/route.ts` — cancelación de pendings + saneamiento de mensajes.
- `supabase/migrations/prevent-booking-conflicts.sql` — versión actualizada para mantener el repo coherente.
- `docs/04-referencia/sistemas/SISTEMA-PREVENCION-CONFLICTOS.md` — regla "última pending gana" + RGPD.
- `docs/INDICE-DOCUMENTACION.md` — entrada del 29/04.
- `README.md` raíz — sección *Abril 2026 — Última pending gana + RGPD*.
- `CHANGELOG.md` — entrada del 29/04.

### Creados
- `supabase/migrations/20260429-prevent-conflicts-pending-rgpd.sql` — migración versionada para Supabase.
- `docs/03-mantenimiento/fixes/CORRECCION-PENDING-OVERRIDE-Y-RGPD-2026-04-29.md` — este documento.

---

## 📚 Lecciones aprendidas

1. **Las cuatro capas deben aplicar el mismo criterio de "reserva activa"**. El 27/04 alineamos buscador/API/RPC, pero el trigger seguía usando `status != 'cancelled'`. Lección: cuando se modifica el criterio de bloqueo, **revisar también triggers, RPCs y vistas materializadas**.
2. **Nunca devolver `error.message` crudo al cliente**. Triggers, librerías y servicios externos pueden incluir información sensible o de terceros. Sanear siempre.
3. **RAISE EXCEPTION sin PII**: en cualquier mensaje de error de la BD, evitar nombres, emails, teléfonos. Identificar la entidad solo por su clave técnica (`booking_number`, `id`, `internal_code`).
4. **"Última pending gana"** es una regla de negocio que evita el "limbo": un carrito que no paga no debe congelar inventario eternamente.

---

## 🔗 Documentación relacionada

- [Sistema de prevención de conflictos](../../04-referencia/sistemas/SISTEMA-PREVENCION-CONFLICTOS.md)
- [Fix doble reserva 27/04/2026](./CORRECCION-DOBLE-RESERVA-2026-04-27.md)
- [Flujo de reservas crítico](../../04-referencia/sistema-reservas/FLUJO-RESERVAS-CRITICO.md)
- [Sistema de pagos](../../02-desarrollo/pagos/SISTEMA-PAGOS.md)

---

**Autor**: Sistema de IA — Cursor (en colaboración con Narciso Pardo)
