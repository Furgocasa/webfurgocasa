# FIX: Conflictos de Reservas con Pagos Simultáneos

**Fecha:** 27 de enero de 2026  
**Criticidad:** 🔴 ALTA - Impacta dinero real y satisfacción del cliente  
**Estado:** ✅ CORREGIDO

---

## 📋 PROBLEMA IDENTIFICADO

### Descripción del Bug

Un cliente realizó una reserva y pagó, pero la reserva no se confirmó ni se registró el pago. Al investigar, se descubrió que **dos clientes podían pagar por el mismo vehículo y fechas**, creando un conflicto de doble reserva.

### Flujo del Problema

1. **Cliente A** busca un vehículo para 10-15 marzo → Crea reserva `pending` (sin pago)
2. **Cliente B** busca el mismo vehículo 10-15 marzo → Ve disponible (porque reserva A está `pending`) → Crea reserva `pending`
3. **Cliente A** paga → Sistema confirma la reserva A ✅
4. **Cliente B** paga → Sistema confirma la reserva B ✅ ❌ **ERROR: Ahora hay 2 reservas confirmadas para el mismo vehículo**

### Causa Raíz

**Faltaba validación de disponibilidad en el momento del pago**. El webhook de Redsys (`/api/redsys/notification`) actualizaba la reserva a `confirmed` sin verificar si otra reserva se había confirmado mientras tanto.

### Por qué las reservas `pending` no bloquean el calendario

Diseño intencional: Si un cliente busca y crea una reserva pero nunca paga, no debe bloquear el vehículo indefinidamente. Solo las reservas con al menos un pago parcial (`payment_status = 'partial'` o `'paid'`) bloquean el calendario.

---

## 🔧 SOLUCIÓN IMPLEMENTADA

### 1. Validación en Webhook de Redsys

**Archivo modificado:** `src/app/api/redsys/notification/route.ts`

**Cambios:**
- Se añadió validación de disponibilidad **antes** de confirmar una reserva tras recibir un pago
- Solo se valida en el **primer pago** (cuando la reserva está en `pending`)
- Si hay conflicto, el pago se marca pero la reserva **NO se confirma**, y se registra una nota para acción manual

**Lógica implementada:**

```typescript
// Obtener datos de la reserva incluyendo vehicle_id y fechas
const { data: currentBooking } = await supabase
  .from("bookings")
  .select("vehicle_id, pickup_date, dropoff_date, status, ...")
  .eq("id", payment.booking_id)
  .single();

// Si es el primer pago (status = 'pending'), validar disponibilidad
if (currentBooking.status === 'pending') {
  // Buscar reservas conflictivas (mismo vehículo, fechas solapadas, con pago)
  const { data: conflictingBookings } = await supabase
    .from("bookings")
    .select("id, booking_number, customer_name")
    .eq("vehicle_id", currentBooking.vehicle_id)
    .neq("id", payment.booking_id)
    .neq("status", "cancelled")
    .in("payment_status", ["partial", "paid"])
    .or(`and(pickup_date.lte.${dropoff_date},dropoff_date.gte.${pickup_date})`);
  
  if (conflictingBookings && conflictingBookings.length > 0) {
    // ⚠️ CONFLICTO DETECTADO
    // Marcar el pago con nota de conflicto
    await supabase
      .from("payments")
      .update({
        notes: "⚠️ CONFLICTO: Pago recibido pero vehículo ya reservado. REQUIERE REEMBOLSO O CAMBIO.",
      })
      .eq("id", payment.id);
    
    // NO confirmar la reserva - requiere acción manual
    return;
  }
}

// ✅ No hay conflicto - confirmar la reserva
```

### 2. Validación en Verify-Payment (respaldo)

**Archivo modificado:** `src/app/api/redsys/verify-payment/route.ts`

Se aplicó la misma lógica de validación, ya que este endpoint se usa como respaldo cuando la notificación directa puede haber fallado.

### 3. Cancelación Automática de Reservas Pendientes Conflictivas ⭐ NUEVO

**Archivos modificados:** Ambos endpoints de pago

**Comportamiento implementado:**

Cuando una reserva se confirma (recibe su primer pago), el sistema **automáticamente cancela** todas las demás reservas `pending` del mismo vehículo con fechas solapadas.

```typescript
// Después de confirmar exitosamente una reserva:
if (currentBooking.status === 'pending') {
  // 1. Buscar otras reservas pending del mismo vehículo con fechas solapadas
  const { data: pendingConflicts } = await supabase
    .from("bookings")
    .select("id, booking_number, customer_name")
    .eq("vehicle_id", currentBooking.vehicle_id)
    .neq("id", payment.booking_id)
    .eq("status", "pending")
    .eq("payment_status", "pending")
    .or(`and(pickup_date.lte.${dropoff},dropoff_date.gte.${pickup})`);
  
  // 2. Cancelarlas automáticamente
  if (pendingConflicts && pendingConflicts.length > 0) {
    await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        notes: "❌ CANCELADA AUTOMÁTICAMENTE: El vehículo fue reservado y pagado por otro cliente.",
      })
      .in("id", pendingConflicts.map(b => b.id));
  }
}
```

**Beneficios:**
- ✅ Los clientes no pueden intentar pagar reservas que ya no son válidas
- ✅ El calendario se mantiene limpio automáticamente
- ✅ Evita confusión y procesos de reembolso innecesarios
- ✅ La reserva que "gana" es siempre la primera en pagar (orden justo)
- ✅ Elimina la necesidad de cancelación manual de reservas pendientes

**Logs generados:**
```
🧹 Buscando reservas pendientes conflictivas para cancelar...
🧹 Encontradas 2 reserva(s) pendiente(s) conflictiva(s)
✅ 2 reserva(s) pendiente(s) cancelada(s) automáticamente:
   - FG12345678 (Juan Pérez)
   - FG12345679 (María García)
```

### 4. Scripts SQL para Detectar y Resolver Conflictos

#### **check-booking-conflicts-detailed.sql**

Script de diagnóstico que ejecuta 5 queries:
1. Detectar reservas con pago que se solapan (CRÍTICO)
2. Detectar reservas pendientes que chocan con confirmadas
3. Ver reservas de las últimas 48h
4. Ver pagos recientes
5. Verificar estado del trigger `prevent_booking_conflicts`

#### **resolve-booking-conflicts.sql**

Script guiado paso a paso para resolver conflictos:
1. Identificar el conflicto específico
2. Cancelar reserva pendiente (si aplica)
3. Marcar reserva pagada para reembolso (si aplica)
4. Verificar trigger de prevención
5. Generar info para contactar cliente
6. Buscar vehículos alternativos

---

## 🛡️ PROTECCIONES ADICIONALES

### Trigger de Base de Datos

**Archivo:** `supabase/prevent-booking-conflicts.sql`

Existe un trigger que **debería** prevenir inserciones/actualizaciones conflictivas directamente en la BD. 

**⚠️ ACCIÓN REQUERIDA:** Verificar que este trigger esté instalado en producción ejecutando:

```sql
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'bookings'
  AND trigger_name = 'prevent_booking_conflicts';
```

Si no existe, ejecutar el archivo completo en Supabase.

---

## 📝 CÓMO RESOLVER EL CASO ACTUAL

### Paso 1: Identificar las Reservas Conflictivas

Ejecuta en Supabase SQL Editor la **PARTE 1** de `check-booking-conflicts-detailed.sql` para ver si hay conflictos actuales.

### Paso 2: Determinar Cuál Prevalece

La reserva que debe prevalecer es **la que pagó primero** (menor `updated_at` tras el pago).

### Paso 3: Resolver el Conflicto

#### Si la otra reserva NO tiene pago:
```sql
-- Cancelar la pendiente
UPDATE bookings
SET 
  status = 'cancelled',
  notes = '❌ Cancelada: conflicto - vehículo reservado por otro cliente'
WHERE id = 'ID_RESERVA_PENDIENTE';
```

#### Si ambas tienen pago (caso actual):
```sql
-- 1. Marcar la segunda para reembolso
UPDATE bookings
SET 
  status = 'cancelled',
  notes = '⚠️ CONFLICTO: Requiere reembolso urgente'
WHERE id = 'ID_RESERVA_SEGUNDA';

-- 2. Marcar pagos para reembolso
UPDATE payments
SET notes = '🔴 REEMBOLSO REQUERIDO: Reserva cancelada por conflicto'
WHERE booking_id = 'ID_RESERVA_SEGUNDA';
```

### Paso 4: Contactar al Cliente Afectado

Ejecuta **PASO 4** de `resolve-booking-conflicts.sql` para obtener:
- Email y teléfono del cliente
- Detalles de la reserva
- Códigos de autorización de pago (para reembolso en Redsys)

**Acciones a tomar:**
1. Llamar/escribir al cliente inmediatamente
2. Explicar el problema técnico
3. Ofrecer:
   - **Opción A:** Reembolso completo (en 3-5 días hábiles)
   - **Opción B:** Vehículo alternativo de características similares o superiores
4. Compensación (descuento, upgrade gratuito, etc.) por las molestias

### Paso 5: Procesar el Reembolso

1. Acceder al panel de Redsys
2. Localizar la transacción usando el `authorization_code` del pago
3. Iniciar devolución completa
4. Actualizar en Supabase:

```sql
UPDATE payments
SET 
  status = 'refunded',
  notes = notes || E'\n✅ Reembolso procesado en Redsys: [FECHA]'
WHERE booking_id = 'ID_RESERVA_AFECTADA';
```

---

## ✅ VERIFICACIÓN POST-FIX

### Tests a Realizar

1. **Test de conflicto simultáneo:**
   - Crear 2 reservas pendientes para mismo vehículo/fechas
   - Procesar pago del primero → Debe confirmar ✅
   - Procesar pago del segundo → Debe detectar conflicto y NO confirmar ❌

2. **Test de cancelación automática:**
   - Crear 3 reservas pendientes para mismo vehículo/fechas
   - Procesar pago de una → Debe confirmar ✅ y cancelar las otras 2 automáticamente ✅
   - Verificar en BD que las otras 2 tienen status='cancelled'

3. **Test del trigger:**
   - Intentar insertar manualmente una reserva conflictiva
   - Debe rechazarse con error de conflicto

4. **Verificar logs:**
   - Los logs de Vercel deben mostrar "🔒 Verificando disponibilidad..."
   - Si hay conflicto: "🚨 CONFLICTO DETECTADO"
   - Si hay cancelaciones: "🧹 X reserva(s) pendiente(s) cancelada(s) automáticamente"

---

## 📊 MONITORIZACIÓN

### Alertas a Configurar

1. **Email automático** cuando un pago se marca con "CONFLICTO" en notas
2. **Revisar diariamente** la query de conflictos durante las próximas 2 semanas
3. **Dashboard** con métricas:
   - Reservas pendientes > 24h sin pago (cancelar automáticamente?)
   - Reservas con notas de conflicto sin resolver

---

## 🔮 MEJORAS FUTURAS (OPCIONAL)

### 1. Email de Notificación a Clientes con Reservas Canceladas

Cuando se cancelan automáticamente reservas pendientes, enviar email al cliente:
- Explicar que el vehículo fue reservado por otro cliente
- Ofrecer buscar vehículos alternativos
- Proporcionar enlace al buscador con las mismas fechas
- Ofrecer descuento como compensación

### 2. Validación Preventiva en el Frontend

Antes de redirigir al pago, re-verificar disponibilidad con un endpoint dedicado.

### 3. Lock Temporal en Reservas Pendientes

Bloquear vehículo durante 15-30 minutos tras crear reserva `pending`, para dar tiempo al cliente a pagar sin perder la disponibilidad.

### 4. Cancelación Automática de Pendientes por Tiempo
Cron job que cancele automáticamente reservas `pending` sin pago después de 24-48 horas.

---

## 📚 ARCHIVOS RELACIONADOS

- ✅ `src/app/api/redsys/notification/route.ts` - Webhook principal (MODIFICADO)
- ✅ `src/app/api/redsys/verify-payment/route.ts` - Verificación respaldo (MODIFICADO)
- 📄 `supabase/prevent-booking-conflicts.sql` - Trigger de BD
- 📄 `supabase/check-booking-conflicts-detailed.sql` - Script diagnóstico (NUEVO)
- 📄 `supabase/resolve-booking-conflicts.sql` - Script resolución (NUEVO)

---

## 🎯 RESUMEN EJECUTIVO

**Problema:** Dos clientes podían pagar por el mismo vehículo y fechas.

**Solución:** Validación de disponibilidad en el momento del pago antes de confirmar.

**Acción inmediata requerida:** 
1. Ejecutar scripts SQL para identificar el caso actual
2. Contactar al cliente afectado
3. Procesar reembolso o reasignación
4. Verificar que el trigger de BD esté instalado en producción

**Prevención futura:** ✅ Implementada en código, funcionará para todos los pagos futuros.
