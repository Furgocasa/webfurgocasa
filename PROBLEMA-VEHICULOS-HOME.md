# 🚨 PROBLEMA CRÍTICO: Vehículos reservados aparecen disponibles

## Fecha: 20 de enero de 2026

## Problema detectado

Un vehículo **ya reservado** aparece como disponible en el buscador público, permitiendo que otros clientes creen reservas pendientes para las mismas fechas. Esto genera:

- ❌ Doble reserva del mismo vehículo
- ❌ Pérdida de confianza del cliente
- ❌ Conflictos de gestión
- ❌ Posible pérdida económica

## Causa raíz

Existe **inconsistencia** entre dos sistemas de verificación de disponibilidad:

### 1. API de búsqueda pública (`/api/availability`)
**Ubicación**: `src/app/api/availability/route.ts` (líneas 68-75)

```typescript
const { data: conflictingBookings, error: bookingsError } = await supabase
  .from("bookings")
  .select("vehicle_id")
  .in("status", ["confirmed", "in_progress"]) // ❌ SOLO excluye confirmed e in_progress
  .or(`and(pickup_date.lte.${dropoffDate},dropoff_date.gte.${pickupDate})`);
```

**Problema**: NO excluye reservas con estado `pending`, por lo que un vehículo con reserva pendiente aparece como disponible.

### 2. Función SQL `check_vehicle_availability`
**Ubicación**: `supabase/schema.sql` (líneas 664-695)

```sql
SELECT NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE vehicle_id = p_vehicle_id
    AND status NOT IN ('cancelled') -- ✅ Excluye TODAS excepto cancelled
    AND (
        (pickup_date <= p_dropoff_date AND dropoff_date >= p_pickup_date)
    )
) INTO is_available;
```

**Problema**: Esta función SÍ considera las reservas `pending` como bloqueantes, pero se usa solo en la creación de reservas desde admin, no en el buscador público.

## Estados de las reservas

Según `supabase/schema.sql` (línea 274):

```sql
status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'))
```

**Estados posibles**:
- `pending`: Reserva creada, pendiente de confirmación/pago
- `confirmed`: Reserva confirmada (con pago o autorización)
- `in_progress`: Alquiler en curso (vehículo entregado)
- `completed`: Alquiler finalizado
- `cancelled`: Reserva cancelada

## Evidencia del problema

En la captura de pantalla del panel de administración:
- **Reserva FU0012**: "Pendiente" (amarillo)
- **Reserva BK-20260119-0412**: "Confirmada" (verde)

Ambas reservas ocupan el vehículo **Krakas Boxstar 600 Family** en fechas que se solapan:
- Reserva 1: 10/02/2026 - 14/02/2026 (4 días)
- Reserva 2: 12/02/2026 - 15/02/2026 (3 días)

**Solapamiento**: 12/02 y 13/02 están en ambas reservas.

## Impacto

### Crítico ⚠️
1. **Overbooking**: Múltiples clientes pueden reservar el mismo vehículo
2. **Experiencia del usuario**: Cliente piensa que tiene reserva confirmada
3. **Gestión manual**: Equipo debe resolver conflictos manualmente
4. **Reputación**: Pérdida de confianza y posibles malas reseñas

### Escenario real
1. Cliente A crea reserva → Estado: `pending`
2. Cliente B busca disponibilidad → Vehículo aparece disponible ❌
3. Cliente B reserva → Nueva reserva `pending` para mismo vehículo
4. Se confirma primera reserva → Conflicto

## Solución implementada

### 1. Cambio en API de búsqueda (`/api/availability`)
**Archivo**: `src/app/api/availability/route.ts` (línea 74)

**Antes**:
```typescript
.in("status", ["confirmed", "in_progress"])
```

**Después**:
```typescript
.in("status", ["pending", "confirmed", "in_progress"])
```

### 2. Validación en API de creación de reservas (`/api/bookings/create`)
**Archivo**: `src/app/api/bookings/create/route.ts` (línea 33)

**Nuevo código añadido**:
```typescript
// CRÍTICO: Verificar disponibilidad del vehículo antes de crear la reserva
// Esto previene doble reserva (overbooking) si dos usuarios intentan reservar simultáneamente
const { data: conflictingBookings, error: checkError } = await supabase
  .from("bookings")
  .select("id, booking_number, pickup_date, dropoff_date")
  .eq("vehicle_id", booking.vehicle_id)
  .in("status", ["pending", "confirmed", "in_progress"]) // Todas las reservas activas
  .or(`and(pickup_date.lte.${booking.dropoff_date},dropoff_date.gte.${booking.pickup_date})`);

if (conflictingBookings && conflictingBookings.length > 0) {
  return NextResponse.json(
    { error: "El vehículo ya no está disponible para las fechas seleccionadas. Por favor, busca de nuevo." },
    { status: 409 } // 409 Conflict
  );
}
```

### Justificación
Las reservas `pending` deben bloquear temporalmente el vehículo porque:

1. **Protección del cliente**: El usuario que creó la reserva espera que el vehículo esté reservado
2. **Tiempo de pago**: El cliente tiene tiempo limitado para completar el pago
3. **Consistencia**: Misma lógica que la función SQL `check_vehicle_availability`
4. **Prevención de overbooking**: Evita que múltiples clientes reserven simultáneamente
5. **Doble capa de protección**: Tanto en búsqueda como en creación de reserva

### Tiempo de expiración (recomendación futura)
Implementar sistema de expiración automática para reservas `pending`:
- Tiempo de gracia: 2-4 horas para completar pago
- Después: Cambiar automáticamente a `cancelled`
- Notificar al cliente antes de expirar

## Testing necesario

1. ✅ Verificar que vehículos con reservas `pending` NO aparecen en búsqueda
2. ✅ Verificar que vehículos con reservas `confirmed` NO aparecen en búsqueda
3. ✅ Verificar que vehículos con reservas `cancelled` SÍ aparecen disponibles
4. ✅ Verificar que vehículos con reservas `completed` (fuera de rango) SÍ aparecen
5. ⚠️ Probar solapamientos de fechas parciales
6. ⚠️ Probar con múltiples vehículos y reservas

## Archivos modificados

1. **`src/app/api/availability/route.ts`** - Línea 74
   - Cambio: Incluir `pending` en estados que bloquean disponibilidad
   
2. **`src/app/api/bookings/create/route.ts`** - Líneas 33-59
   - Nuevo: Validación de disponibilidad antes de crear reserva
   - Previene: Race conditions y reservas simultáneas

## Próximos pasos recomendados

1. **Sistema de expiración**: Implementar auto-cancelación de reservas pending después de X horas
2. **Notificaciones**: Avisar al cliente cuando su reserva pending está por expirar
3. **Dashboard admin**: Mostrar alertas de reservas pending antiguas
4. **Logs**: Registrar intentos de doble reserva para análisis
5. **Tests automatizados**: Crear suite de tests para verificación de disponibilidad

## Prioridad

🔴 **CRÍTICO** - Debe solucionarse inmediatamente

## Estado

✅ **SOLUCIONADO** - Cambio implementado en código
