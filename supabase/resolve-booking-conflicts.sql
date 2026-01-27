-- ============================================
-- SCRIPT: Resolver Reservas Conflictivas
-- ============================================
-- Este script ayuda a resolver conflictos de reservas
-- detectados por check-booking-conflicts-detailed.sql
-- ============================================

-- ⚠️ IMPORTANTE: 
-- Este script contiene queries de ACTUALIZACIÓN y CANCELACIÓN
-- Lee cuidadosamente y ejecuta solo las secciones necesarias
-- ============================================

-- ============================================
-- PASO 1: IDENTIFICAR EL CONFLICTO ESPECÍFICO
-- ============================================
-- Ejecuta esta query con los IDs de las reservas conflictivas
-- para ver toda la información relevante

SELECT 
  b.id,
  b.booking_number,
  b.customer_name,
  b.customer_email,
  b.customer_phone,
  b.status,
  b.payment_status,
  b.amount_paid,
  b.total_price,
  (b.total_price - b.amount_paid) as pendiente_cobrar,
  b.pickup_date,
  b.dropoff_date,
  b.created_at,
  b.updated_at,
  v.internal_code as vehiculo,
  v.name as vehiculo_nombre,
  -- Ver pagos asociados
  (
    SELECT json_agg(json_build_object(
      'order_number', p.order_number,
      'amount', p.amount,
      'status', p.status,
      'created_at', p.created_at,
      'authorization_code', p.authorization_code
    ))
    FROM payments p
    WHERE p.booking_id = b.id
  ) as pagos
FROM bookings b
INNER JOIN vehicles v ON b.vehicle_id = v.id
WHERE b.id IN (
  'ID_RESERVA_1',  -- ⚠️ REEMPLAZAR con ID real
  'ID_RESERVA_2'   -- ⚠️ REEMPLAZAR con ID real
)
ORDER BY b.updated_at;

-- ============================================
-- PASO 2A: CANCELAR RESERVA PENDIENTE (sin pago)
-- ============================================
-- Usa esto si una de las reservas NO tiene pagos
-- y debe cancelarse porque otra se confirmó primero

-- ⚠️ REEMPLAZAR 'ID_RESERVA_PENDIENTE' con el ID real
/*
UPDATE bookings
SET 
  status = 'cancelled',
  notes = COALESCE(notes || E'\n\n', '') || 
    '❌ CANCELADA AUTOMÁTICAMENTE: Conflicto detectado - el vehículo fue reservado por otro cliente que pagó primero. Fecha cancelación: ' || NOW()::text,
  updated_at = NOW()
WHERE id = 'ID_RESERVA_PENDIENTE'
  AND status = 'pending'
  AND payment_status = 'pending'
  AND amount_paid = 0;

-- Verificar la cancelación
SELECT 
  id, 
  booking_number, 
  status, 
  customer_email, 
  notes 
FROM bookings 
WHERE id = 'ID_RESERVA_PENDIENTE';
*/

-- ============================================
-- PASO 2B: MARCAR RESERVA PAGADA PARA REEMBOLSO
-- ============================================
-- Usa esto si ambas reservas tienen pago
-- La que pagó SEGUNDO debe reembolsarse

-- ⚠️ REEMPLAZAR 'ID_RESERVA_PARA_REEMBOLSO' con el ID real
/*
UPDATE bookings
SET 
  status = 'cancelled',
  notes = COALESCE(notes || E'\n\n', '') || 
    '⚠️ CONFLICTO DE RESERVA: Dos clientes pagaron por el mismo vehículo y fechas. ' ||
    'Esta reserva pagó en segundo lugar. ' ||
    '🔴 REQUIERE REEMBOLSO URGENTE o reasignación a otro vehículo. ' ||
    'Fecha detección: ' || NOW()::text,
  updated_at = NOW()
WHERE id = 'ID_RESERVA_PARA_REEMBOLSO';

-- Marcar los pagos de esta reserva para reembolso
UPDATE payments
SET 
  notes = COALESCE(notes || E'\n\n', '') || 
    '🔴 REEMBOLSO REQUERIDO: Reserva cancelada por conflicto de fechas. ' ||
    'Contactar cliente urgentemente. Fecha: ' || NOW()::text,
  updated_at = NOW()
WHERE booking_id = 'ID_RESERVA_PARA_REEMBOLSO'
  AND status = 'completed';

-- Verificar las actualizaciones
SELECT 
  b.id,
  b.booking_number, 
  b.status,
  b.customer_name,
  b.customer_email,
  b.customer_phone,
  b.amount_paid,
  b.notes,
  p.order_number,
  p.amount as pago_amount,
  p.status as pago_status,
  p.authorization_code,
  p.notes as pago_notes
FROM bookings b
LEFT JOIN payments p ON p.booking_id = b.id
WHERE b.id = 'ID_RESERVA_PARA_REEMBOLSO';
*/

-- ============================================
-- PASO 3: VERIFICAR QUE EL TRIGGER ESTÁ ACTIVO
-- ============================================
-- Verifica si el trigger prevent_booking_conflicts existe

SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'bookings'
  AND trigger_name = 'prevent_booking_conflicts';

-- Si no existe, ejecuta el archivo: prevent-booking-conflicts.sql

-- ============================================
-- PASO 4: NOTIFICAR AL CLIENTE (genera info para email)
-- ============================================
-- Ejecuta esto para obtener todos los datos necesarios
-- para contactar al cliente afectado

-- ⚠️ REEMPLAZAR 'ID_RESERVA_AFECTADA' con el ID real
/*
SELECT 
  '=== INFORMACIÓN PARA CONTACTAR CLIENTE ===' as titulo,
  b.booking_number as numero_reserva,
  b.customer_name as nombre_cliente,
  b.customer_email as email_cliente,
  b.customer_phone as telefono_cliente,
  b.pickup_date as fecha_inicio,
  b.dropoff_date as fecha_fin,
  b.days as dias_alquiler,
  b.total_price as precio_total,
  b.amount_paid as cantidad_pagada,
  (b.total_price - b.amount_paid) as pendiente,
  v.name as vehiculo_nombre,
  v.internal_code as vehiculo_codigo,
  pl.name as ubicacion_recogida,
  dl.name as ubicacion_devolucion,
  -- Información de pagos
  (
    SELECT json_agg(json_build_object(
      'order_number', p.order_number,
      'amount', p.amount,
      'authorization_code', p.authorization_code,
      'transaction_date', p.transaction_date
    ))
    FROM payments p
    WHERE p.booking_id = b.id
  ) as detalles_pagos
FROM bookings b
INNER JOIN vehicles v ON b.vehicle_id = v.id
INNER JOIN locations pl ON b.pickup_location_id = pl.id
INNER JOIN locations dl ON b.dropoff_location_id = dl.id
WHERE b.id = 'ID_RESERVA_AFECTADA';
*/

-- ============================================
-- PASO 5: BUSCAR VEHÍCULOS ALTERNATIVOS
-- ============================================
-- Para reasignar al cliente afectado

-- ⚠️ REEMPLAZAR las fechas con las de la reserva afectada
/*
SELECT 
  v.id,
  v.internal_code,
  v.name,
  v.brand,
  v.model,
  v.seats,
  v.beds,
  v.transmission,
  v.base_price_per_day,
  v.status,
  -- Verificar disponibilidad
  (
    SELECT COUNT(*)
    FROM bookings b2
    WHERE b2.vehicle_id = v.id
      AND b2.status != 'cancelled'
      AND b2.payment_status IN ('partial', 'paid')
      AND (
        (b2.pickup_date <= 'FECHA_FIN'::date AND b2.dropoff_date >= 'FECHA_INICIO'::date)
      )
  ) as reservas_conflictivas
FROM vehicles v
WHERE v.is_for_rent = true
  AND v.status = 'available'
ORDER BY v.beds DESC, v.base_price_per_day;
*/

-- ============================================
-- RESUMEN DE ACCIONES NECESARIAS:
-- ============================================
-- 1. Ejecuta PASO 1 para ver detalles de las reservas conflictivas
-- 2. Determina cuál reserva debe prevalecer (la que pagó primero)
-- 3. Ejecuta PASO 2A o 2B según corresponda
-- 4. Ejecuta PASO 3 para verificar/instalar el trigger
-- 5. Ejecuta PASO 4 para obtener info del cliente afectado
-- 6. Ejecuta PASO 5 para buscar vehículos alternativos
-- 7. Contacta al cliente para:
--    a) Informar del problema
--    b) Ofrecer reembolso O vehículo alternativo
--    c) Disculparse por las molestias
-- ============================================
