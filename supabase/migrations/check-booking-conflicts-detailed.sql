-- ============================================
-- SCRIPT: Detectar y Analizar Reservas Conflictivas
-- ============================================
-- Este script identifica reservas que se solapan en fechas
-- para el mismo vehículo, priorizando aquellas con pago
-- ============================================

-- PARTE 1: Buscar reservas con pagos confirmados que se solapan
-- ============================================
SELECT 
  b1.id as reserva_1_id,
  b1.booking_number as reserva_1_numero,
  b1.customer_name as reserva_1_cliente,
  b1.customer_email as reserva_1_email,
  b1.status as reserva_1_status,
  b1.payment_status as reserva_1_pago,
  b1.amount_paid as reserva_1_pagado,
  b1.total_price as reserva_1_total,
  b1.pickup_date as reserva_1_inicio,
  b1.dropoff_date as reserva_1_fin,
  b1.created_at as reserva_1_creada,
  '--' as separador,
  b2.id as reserva_2_id,
  b2.booking_number as reserva_2_numero,
  b2.customer_name as reserva_2_cliente,
  b2.customer_email as reserva_2_email,
  b2.status as reserva_2_status,
  b2.payment_status as reserva_2_pago,
  b2.amount_paid as reserva_2_pagado,
  b2.total_price as reserva_2_total,
  b2.pickup_date as reserva_2_inicio,
  b2.dropoff_date as reserva_2_fin,
  b2.created_at as reserva_2_creada,
  '--' as separador2,
  v.internal_code as vehiculo_codigo,
  v.name as vehiculo_nombre,
  v.brand as vehiculo_marca,
  v.model as vehiculo_modelo,
  CASE 
    WHEN b1.created_at < b2.created_at THEN 'Reserva 1 se creó primero'
    ELSE 'Reserva 2 se creó primero'
  END as quien_primero_creo,
  CASE 
    WHEN b1.updated_at < b2.updated_at THEN 'Reserva 1 se confirmó primero'
    ELSE 'Reserva 2 se confirmó primero'
  END as quien_primero_pago
FROM bookings b1
INNER JOIN bookings b2 
  ON b1.vehicle_id = b2.vehicle_id 
  AND b1.id < b2.id  -- Evita duplicados (solo muestra cada par una vez)
INNER JOIN vehicles v 
  ON b1.vehicle_id = v.id
WHERE 
  -- Ambas reservas no están canceladas
  b1.status != 'cancelled' 
  AND b2.status != 'cancelled'
  -- Al menos una de las dos tiene pago (partial o paid)
  AND (
    b1.payment_status IN ('partial', 'paid')
    OR b2.payment_status IN ('partial', 'paid')
  )
  -- Las fechas se solapan
  AND (
    (b1.pickup_date <= b2.dropoff_date AND b1.dropoff_date >= b2.pickup_date)
  )
ORDER BY 
  v.internal_code,
  b1.pickup_date,
  b1.created_at;

-- ============================================
-- PARTE 2: Buscar reservas pendientes que se solapan con confirmadas
-- ============================================
SELECT 
  'PENDIENTE_vs_CONFIRMADA' as tipo_conflicto,
  b1.id as reserva_pendiente_id,
  b1.booking_number as pendiente_numero,
  b1.customer_name as pendiente_cliente,
  b1.customer_email as pendiente_email,
  b1.status as pendiente_status,
  b1.created_at as pendiente_creada,
  '--' as separador,
  b2.id as reserva_confirmada_id,
  b2.booking_number as confirmada_numero,
  b2.customer_name as confirmada_cliente,
  b2.customer_email as confirmada_email,
  b2.status as confirmada_status,
  b2.payment_status as confirmada_pago,
  b2.amount_paid as confirmada_pagado,
  '--' as separador2,
  v.internal_code as vehiculo,
  b1.pickup_date as inicio_solapado,
  b1.dropoff_date as fin_solapado
FROM bookings b1
INNER JOIN bookings b2 
  ON b1.vehicle_id = b2.vehicle_id 
  AND b1.id != b2.id
INNER JOIN vehicles v 
  ON b1.vehicle_id = v.id
WHERE 
  -- b1 es pendiente (sin pago)
  b1.status = 'pending'
  AND b1.payment_status = 'pending'
  -- b2 tiene pago
  AND b2.status != 'cancelled'
  AND b2.payment_status IN ('partial', 'paid')
  -- Las fechas se solapan
  AND (
    (b1.pickup_date <= b2.dropoff_date AND b1.dropoff_date >= b2.pickup_date)
  )
ORDER BY 
  v.internal_code,
  b2.updated_at DESC;

-- ============================================
-- PARTE 3: Buscar reservas recientes (últimas 48h)
-- ============================================
SELECT 
  b.id,
  b.booking_number,
  b.customer_name,
  b.customer_email,
  b.status,
  b.payment_status,
  b.amount_paid,
  b.total_price,
  b.pickup_date,
  b.dropoff_date,
  b.created_at,
  b.updated_at,
  v.internal_code as vehiculo,
  v.name as vehiculo_nombre,
  CASE 
    WHEN b.amount_paid > 0 THEN '✅ CON PAGO'
    ELSE '⏳ SIN PAGO'
  END as estado_pago,
  -- Verificar si hay conflictos
  (
    SELECT COUNT(*)
    FROM bookings b2
    WHERE b2.vehicle_id = b.vehicle_id
      AND b2.id != b.id
      AND b2.status != 'cancelled'
      AND b2.payment_status IN ('partial', 'paid')
      AND (b2.pickup_date <= b.dropoff_date AND b2.dropoff_date >= b.pickup_date)
  ) as conflictos_detectados
FROM bookings b
INNER JOIN vehicles v ON b.vehicle_id = v.id
WHERE b.created_at >= NOW() - INTERVAL '48 hours'
ORDER BY b.created_at DESC;

-- ============================================
-- PARTE 4: Ver pagos asociados a reservas recientes
-- ============================================
SELECT 
  p.id as payment_id,
  p.order_number,
  p.booking_id,
  b.booking_number,
  b.customer_name,
  b.customer_email,
  v.internal_code as vehiculo,
  p.amount,
  p.status as payment_status,
  p.response_code,
  p.authorization_code,
  p.notes,
  p.created_at as pago_creado,
  p.updated_at as pago_actualizado,
  b.status as booking_status,
  b.payment_status as booking_payment_status,
  b.amount_paid as booking_total_pagado
FROM payments p
INNER JOIN bookings b ON p.booking_id = b.id
INNER JOIN vehicles v ON b.vehicle_id = v.id
WHERE p.created_at >= NOW() - INTERVAL '48 hours'
ORDER BY p.created_at DESC;

-- ============================================
-- PARTE 5: Verificar estado del trigger
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing,
  action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'bookings'
  AND trigger_name = 'prevent_booking_conflicts';

-- ============================================
-- NOTAS DE USO:
-- ============================================
-- 1. Ejecuta cada query por separado para analizar:
--    - PARTE 1: Conflictos entre reservas confirmadas (CRÍTICO)
--    - PARTE 2: Reservas pendientes que chocan con confirmadas
--    - PARTE 3: Reservas recientes para ver qué pasó
--    - PARTE 4: Pagos recientes y su relación con reservas
--    - PARTE 5: Verificar si el trigger está activo
-- 
-- 2. Si encuentras conflictos en PARTE 1:
--    - La reserva que pagó PRIMERO (menor updated_at) debe prevalecer
--    - La otra debe cancelarse y reembolsarse
-- 
-- 3. Si hay reservas pendientes en PARTE 2:
--    - Se pueden cancelar automáticamente (no tienen pago)
-- ============================================
