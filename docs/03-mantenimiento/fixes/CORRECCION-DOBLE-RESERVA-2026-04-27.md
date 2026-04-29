# Fix Crítico: Doble Reserva por filtro incorrecto de `payment_status`

**Fecha**: 27 de abril de 2026  
**Severidad**: 🔴 CRÍTICA — afecta directamente al core del negocio (alquileres)  
**Estado**: ✅ Resuelto y desplegado en producción

---

## 🚨 Resumen ejecutivo

Un cliente externo realizó una búsqueda en el buscador público y **el sistema le mostró como disponible un vehículo que ya estaba reservado**. El cliente completó la reserva y el pago por Redsys, generando una **segunda reserva sobre el mismo vehículo en las mismas fechas** (agosto 2026).

La reserva original era una reserva **confirmada manualmente por el administrador** para un amigo, sin pago registrado en el sistema (`status = 'confirmed'`, `payment_status = 'pending'`).

El bug estaba en que toda la lógica de disponibilidad filtraba reservas activas por `payment_status IN ('partial','paid')`, ignorando las reservas confirmadas pero sin pago.

---

## 🔎 Cronología del incidente

1. El admin crea manualmente una reserva (`status = 'confirmed'`, `payment_status = 'pending'`) para un amigo en agosto 2026.
2. Días después, un cliente externo busca disponibilidad en esas mismas fechas.
3. El endpoint `/api/availability` filtra solo reservas con `payment_status IN ('partial','paid')`, por lo que la reserva del amigo **no se cuenta** y el vehículo aparece como disponible.
4. El cliente reserva, paga por Redsys y queda confirmado → **dos reservas sobre el mismo vehículo en las mismas fechas**.
5. El admin detecta la duplicación al revisar el calendario y abre el incidente.

---

## 🧬 Causa raíz

Una "optimización" anterior había cambiado el filtro de disponibilidad de `status` a `payment_status` con la lógica errónea de que "una reserva sin pago no debe bloquear el inventario". Este planteamiento es incorrecto porque:

- Una reserva **confirmada** representa un compromiso comercial firme.
- El admin puede confirmar reservas pagadas en **efectivo** o por **transferencia bancaria** sin registrar el pago todavía en el sistema.
- El estado de pago es una información financiera, no un indicador operativo de disponibilidad.

A esto se sumó que el trigger SQL `prevent_booking_conflicts` (última línea de defensa a nivel de base de datos) **no estaba instalado en producción**, eliminando la red de seguridad que habría bloqueado el INSERT.

---

## ✅ Solución aplicada

### Regla unificada (nueva)

> Una reserva bloquea el vehículo si su `status` es operativo —**`confirmed`**, **`in_progress`** o **`completed`**— **independientemente del `payment_status`**.
>
> Las reservas en `status = 'pending'` (carrito) y `status = 'cancelled'` **NO bloquean**.

### Cambios en código (7 endpoints)

Todos los endpoints que consultaban disponibilidad fueron actualizados para filtrar por `status` en lugar de `payment_status`:

| Endpoint | Rol |
|----------|-----|
| `src/app/api/availability/route.ts` | Buscador público de vehículos disponibles |
| `src/app/api/availability/alternatives/route.ts` | Sugerencia de fechas alternativas |
| `src/app/api/bookings/create/route.ts` | Validación pre-creación de reserva |
| `src/app/api/redsys/notification/route.ts` | Webhook de notificación de pago Redsys |
| `src/app/api/redsys/verify-payment/route.ts` | Verificación post-pago Redsys |
| `src/app/api/admin/search-analytics/route.ts` | Informe de ocupación de búsquedas |
| `src/app/api/admin/last-minute-offers/check-availability/route.ts` | Disponibilidad para ofertas de última hora (también corregía un typo: `'active'` → `'in_progress'`) |

Patrón aplicado en todos los casos:

```typescript
const { data: conflictingBookings } = await supabaseAdmin
  .from("bookings")
  .select("vehicle_id")
  .in("status", ["confirmed", "in_progress", "completed"])
  .or(`and(pickup_date.lte.${dropoffDate},dropoff_date.gte.${pickupDate})`);
```

### Migración SQL — RPC `check_vehicle_availability`

Archivo: `supabase/migrations/20260427-fix-availability-by-status.sql`

La función RPC que usa Supabase también se ajustó para mirar `status` y no `payment_status`:

```sql
CREATE OR REPLACE FUNCTION check_vehicle_availability(
    p_vehicle_id UUID,
    p_pickup_date DATE,
    p_dropoff_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    -- Activa = status operativo. NO mira payment_status.
    SELECT NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE vehicle_id = p_vehicle_id
          AND status IN ('confirmed', 'in_progress', 'completed')
          AND pickup_date <= p_dropoff_date
          AND dropoff_date >= p_pickup_date
    ) INTO is_available;

    IF is_available THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM blocked_dates
            WHERE vehicle_id = p_vehicle_id
              AND start_date <= p_dropoff_date
              AND end_date >= p_pickup_date
        ) INTO is_available;
    END IF;

    RETURN is_available;
END;
$$ LANGUAGE plpgsql;
```

### Trigger de base de datos — instalado en producción

Como medida de seguridad, se reinstaló el trigger `prevent_booking_conflicts` (archivo `supabase/migrations/prevent-booking-conflicts.sql`) en el entorno de producción de Supabase. Verificación:

```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'prevent_booking_conflicts';
-- Debe devolver una fila con tgenabled = 'O' (enabled)
```

---

## 🛡️ Capas de protección resultantes

Con este fix, el sistema queda con **4 capas coherentes** que aplican el mismo criterio:

1. **Capa 1 — Buscador público**: filtra `status` operativo en `/api/availability` y `/api/availability/alternatives`. El usuario nunca ve un vehículo ya reservado.
2. **Capa 2 — Validación pre-creación**: `/api/bookings/create` rechaza con HTTP 409 cualquier intento de crear una reserva en conflicto.
3. **Capa 3 — RPC + trigger en BD**: `check_vehicle_availability` y `prevent_booking_conflicts` bloquean a nivel de base de datos.
4. **Capa 4 — Webhooks de pago Redsys**: `/api/redsys/notification` y `/api/redsys/verify-payment` revalidan antes de confirmar la reserva tras un pago.

> **Importante**: las 4 capas comparten ahora **el mismo filtro** (`status IN ('confirmed','in_progress','completed')`). Si en el futuro se modifica una, deben modificarse todas para mantener la coherencia.

---

## ⚠️ Riesgo identificado y cómo se mitiga

**Riesgo**: si solo el trigger de BD bloquea (porque la Capa 1 está mal), un cliente puede pagar en Redsys y luego ver fallar la creación de la reserva → **cobro sin reserva**.

**Mitigación**: la Capa 1 (búsqueda) y la Capa 2 (pre-creación) ahora aplican exactamente el mismo criterio que la Capa 3, así que el caso anterior solo se dispararía en escenarios de carrera (race conditions) entre dos clientes simultáneos. En esos casos, los webhooks Redsys (Capa 4) detectan el conflicto y permiten emitir un reembolso manual.

---

## 🧪 Pruebas de verificación recomendadas

1. **Búsqueda con reserva confirmada sin pago**: crear manualmente una reserva `status = 'confirmed'`, `payment_status = 'pending'` y comprobar que el vehículo **NO** aparece en el buscador público para esas fechas.
2. **Creación de reserva en conflicto**: intentar crear una reserva (vía API o admin) sobre un vehículo con reserva confirmada → debe responder HTTP 409 con mensaje claro.
3. **RPC directo**: ejecutar en Supabase `SELECT check_vehicle_availability('<vehicle_id>', '<pickup>', '<dropoff>');` para un vehículo con reserva `confirmed`/`pending` → debe devolver `false`.
4. **Trigger activo**: comprobar `pg_trigger` y forzar un INSERT directo en `bookings` que entre en conflicto → debe lanzar `RAISE EXCEPTION`.

---

## 📁 Archivos modificados / creados

### Modificados
- `src/app/api/availability/route.ts`
- `src/app/api/availability/alternatives/route.ts`
- `src/app/api/bookings/create/route.ts`
- `src/app/api/redsys/notification/route.ts`
- `src/app/api/redsys/verify-payment/route.ts`
- `src/app/api/admin/search-analytics/route.ts`
- `src/app/api/admin/last-minute-offers/check-availability/route.ts`
- `docs/04-referencia/sistemas/SISTEMA-PREVENCION-CONFLICTOS.md` (regla actualizada)
- `docs/INDICE-DOCUMENTACION.md` (entrada de abril 2026)

### Creados
- `supabase/migrations/20260427-fix-availability-by-status.sql`
- `docs/03-mantenimiento/fixes/CORRECCION-DOBLE-RESERVA-2026-04-27.md` (este documento)

---

## 📚 Lecciones aprendidas

1. **Disponibilidad operativa ≠ estado financiero**. El criterio de bloqueo debe ser siempre el `status` de la reserva, no el de pago. El admin tiene canales de cobro (efectivo, transferencia) que el sistema no controla.
2. **Coherencia entre capas obligatoria**. Las 4 capas (buscador, validación, RPC/trigger, webhook) deben aplicar la **misma** definición de "reserva activa". Cualquier divergencia genera la posibilidad de doble reserva o cobro fantasma.
3. **Verificar instalación de triggers en producción**. Tener un trigger en el repositorio no garantiza que esté instalado en Supabase. Añadir a la rutina de despliegue una verificación de `pg_trigger`.
4. **Documentar cualquier cambio de criterio**. El cambio que introdujo el bug (filtrar por `payment_status`) no estaba documentado, por eso pasó desapercibido durante meses.

---

## 🔗 Documentación relacionada

- [Sistema de prevención de conflictos](../../04-referencia/sistemas/SISTEMA-PREVENCION-CONFLICTOS.md)
- [Corrección calendario duplicados (20/01/2026)](./CORRECCION-CALENDARIO-DUPLICADOS.md)
- [Flujo de reservas crítico](../../04-referencia/sistema-reservas/FLUJO-RESERVAS-CRITICO.md)
- [Sistema de pagos](../../02-desarrollo/pagos/SISTEMA-PAGOS.md)

---

**Autor**: Sistema de IA — Cursor (en colaboración con Narciso Pardo)  
**Commit de referencia**: `fix(disponibilidad): reservas confirmadas sin pago tambien bloquean vehiculo`
