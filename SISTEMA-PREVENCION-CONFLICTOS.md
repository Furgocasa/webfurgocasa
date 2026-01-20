# Guía: Sistema de Prevención de Conflictos de Reservas

## Objetivo

Garantizar que **NUNCA** se asignen dos reservas al mismo vehículo en fechas solapadas, manteniendo la integridad del sistema de alquiler.

## Principio Fundamental

> **Un vehículo, un cliente, una fecha**: Ningún vehículo puede estar en dos lugares al mismo tiempo.

## Capas de Protección

### 🔍 Capa 1: Filtrado en Búsqueda (Prevención Temprana)

**Ubicación**: Formulario de búsqueda de vehículos (frontend público)

**Función**: Los vehículos ya reservados **no aparecen** en los resultados de búsqueda.

**Tecnología**: Función RPC `check_vehicle_availability` en Supabase

**Beneficio**: El usuario solo ve opciones reales, evitando frustración.

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

**Función**: Trigger automático que se ejecuta en **TODA** operación INSERT/UPDATE en la tabla `bookings`.

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
-- Archivo: supabase/prevent-booking-conflicts.sql
```

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

**Última actualización**: 2026-01-20  
**Versión del sistema**: 1.0  
**Estado**: ✅ Implementado y activo
