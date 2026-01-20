-- ============================================
-- SCRIPT: Detectar conflictos de reservas
-- ============================================
-- Objetivo: Identificar vehículos con múltiples reservas simultáneas
-- (dos o más reservas para el mismo vehículo con fechas solapadas)
-- ============================================

-- PASO 1: Buscar reservas con fechas solapadas para el mismo vehículo
-- Dos reservas se solapan si:
-- - La fecha de inicio de una está dentro del rango de la otra
-- - O la fecha de fin de una está dentro del rango de la otra
-- - O una reserva engloba completamente a la otra

WITH conflicts AS (
  SELECT 
    b1.id as booking1_id,
    b1.booking_number as booking1_number,
    b1.vehicle_id,
    b1.pickup_date as booking1_pickup,
    b1.dropoff_date as booking1_dropoff,
    b1.status as booking1_status,
    b1.customer_name as booking1_customer,
    b2.id as booking2_id,
    b2.booking_number as booking2_number,
    b2.pickup_date as booking2_pickup,
    b2.dropoff_date as booking2_dropoff,
    b2.status as booking2_status,
    b2.customer_name as booking2_customer,
    v.internal_code as vehicle_code,
    v.name as vehicle_name
  FROM bookings b1
  JOIN bookings b2 ON b1.vehicle_id = b2.vehicle_id AND b1.id < b2.id
  JOIN vehicles v ON b1.vehicle_id = v.id
  WHERE 
    b1.status != 'cancelled' 
    AND b2.status != 'cancelled'
    AND (
      -- Caso 1: b1 empieza dentro del rango de b2
      (b1.pickup_date >= b2.pickup_date AND b1.pickup_date <= b2.dropoff_date)
      -- Caso 2: b1 termina dentro del rango de b2
      OR (b1.dropoff_date >= b2.pickup_date AND b1.dropoff_date <= b2.dropoff_date)
      -- Caso 3: b1 engloba completamente a b2
      OR (b1.pickup_date <= b2.pickup_date AND b1.dropoff_date >= b2.dropoff_date)
      -- Caso 4: b2 engloba completamente a b1 (redundante pero explícito)
      OR (b2.pickup_date <= b1.pickup_date AND b2.dropoff_date >= b1.dropoff_date)
    )
  ORDER BY v.internal_code, b1.pickup_date
)
SELECT 
  vehicle_code as "Código Vehículo",
  vehicle_name as "Nombre Vehículo",
  booking1_number as "Reserva 1",
  booking1_customer as "Cliente 1",
  booking1_pickup as "Recogida 1",
  booking1_dropoff as "Devolución 1",
  booking1_status as "Estado 1",
  booking2_number as "Reserva 2",
  booking2_customer as "Cliente 2",
  booking2_pickup as "Recogida 2",
  booking2_dropoff as "Devolución 2",
  booking2_status as "Estado 2"
FROM conflicts;

-- PASO 2: Resumen de vehículos con conflictos
SELECT 
  v.internal_code as "Código",
  v.name as "Vehículo",
  COUNT(DISTINCT b1.id) as "Reservas con conflictos"
FROM bookings b1
JOIN bookings b2 ON b1.vehicle_id = b2.vehicle_id AND b1.id < b2.id
JOIN vehicles v ON b1.vehicle_id = v.id
WHERE 
  b1.status != 'cancelled' 
  AND b2.status != 'cancelled'
  AND (
    (b1.pickup_date >= b2.pickup_date AND b1.pickup_date <= b2.dropoff_date)
    OR (b1.dropoff_date >= b2.pickup_date AND b1.dropoff_date <= b2.dropoff_date)
    OR (b1.pickup_date <= b2.pickup_date AND b1.dropoff_date >= b2.dropoff_date)
    OR (b2.pickup_date <= b1.pickup_date AND b2.dropoff_date >= b1.dropoff_date)
  )
GROUP BY v.internal_code, v.name
ORDER BY v.internal_code;

-- PASO 3: Buscar reservas duplicadas (mismo vehículo, mismas fechas exactas)
-- Esto podría indicar un error de inserción duplicada
SELECT 
  v.internal_code as "Código Vehículo",
  v.name as "Nombre Vehículo",
  b.vehicle_id,
  b.pickup_date as "Fecha Recogida",
  b.dropoff_date as "Fecha Devolución",
  COUNT(*) as "Número de duplicados",
  STRING_AGG(b.booking_number, ', ') as "Números de reserva",
  STRING_AGG(b.customer_name, ', ') as "Clientes"
FROM bookings b
JOIN vehicles v ON b.vehicle_id = v.id
WHERE b.status != 'cancelled'
GROUP BY v.internal_code, v.name, b.vehicle_id, b.pickup_date, b.dropoff_date
HAVING COUNT(*) > 1
ORDER BY v.internal_code, b.pickup_date;

-- PASO 4: Verificar integridad de fechas (dropoff debe ser >= pickup)
SELECT 
  booking_number as "Reserva",
  customer_name as "Cliente",
  v.internal_code as "Vehículo",
  pickup_date as "Recogida",
  dropoff_date as "Devolución",
  'ERROR: Fecha devolución anterior a recogida' as "Problema"
FROM bookings b
JOIN vehicles v ON b.vehicle_id = v.id
WHERE dropoff_date < pickup_date
  AND status != 'cancelled'
ORDER BY pickup_date;

-- ============================================
-- NOTAS:
-- ============================================
-- Si este script muestra conflictos, significa que hay un problema 
-- en la base de datos que debe resolverse antes de confiar en el calendario.
-- 
-- Las reservas conflictivas deben ser revisadas manualmente y corregidas:
-- - Verificar si son reservas legítimas con fechas incorrectas
-- - Verificar si son duplicados accidentales que deben eliminarse
-- - Ajustar fechas para evitar solapamientos
-- ============================================
