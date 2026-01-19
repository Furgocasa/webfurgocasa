-- ============================================================
-- SCRIPT DE DIAGNÓSTICO: VINCULACIÓN DE RESERVAS Y CLIENTES
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. ESTADO GENERAL DE RESERVAS
-- ============================================================

SELECT 
  '📊 ESTADO GENERAL DE RESERVAS' as seccion,
  '' as detalle,
  0 as valor;

SELECT 
  'Total de reservas' as metrica,
  COUNT(*) as valor
FROM bookings;

SELECT 
  'Reservas vinculadas a clientes' as metrica,
  COUNT(*) as valor
FROM bookings
WHERE customer_id IS NOT NULL;

SELECT 
  'Reservas SIN vincular (HUÉRFANAS)' as metrica,
  COUNT(*) as valor
FROM bookings
WHERE customer_id IS NULL;

SELECT 
  'Porcentaje vinculado' as metrica,
  ROUND(
    (COUNT(*) FILTER (WHERE customer_id IS NOT NULL)::numeric / 
     NULLIF(COUNT(*), 0)::numeric) * 100, 
    2
  ) as valor
FROM bookings;

-- ============================================================
-- 2. DETALLES DE RESERVAS HUÉRFANAS
-- ============================================================

SELECT 
  '' as separador,
  '🔍 RESERVAS SIN VINCULAR (Detalles)' as seccion;

SELECT 
  id,
  booking_number as numero_reserva,
  customer_name as nombre_cliente,
  customer_email as email_cliente,
  customer_phone as telefono_cliente,
  pickup_date as fecha_recogida,
  total_price as precio_total,
  status as estado,
  payment_status as estado_pago
FROM bookings
WHERE customer_id IS NULL
ORDER BY pickup_date DESC;

-- ============================================================
-- 3. INTENTAR ENCONTRAR COINCIDENCIAS POSIBLES
-- ============================================================

SELECT 
  '' as separador,
  '🔎 POSIBLES COINCIDENCIAS POR EMAIL' as seccion;

-- Reservas sin vincular que PODRÍAN tener coincidencia por email
SELECT 
  b.booking_number as reserva,
  b.customer_name as nombre_reserva,
  b.customer_email as email_reserva,
  c.id as customer_id_posible,
  c.name as nombre_cliente,
  c.email as email_cliente,
  'Email coincide parcialmente' as tipo_coincidencia
FROM bookings b
LEFT JOIN customers c ON LOWER(TRIM(b.customer_email)) = LOWER(TRIM(c.email))
WHERE b.customer_id IS NULL
  AND c.id IS NOT NULL
  AND NOT c.email LIKE '%@legacy.furgocasa.com';

-- ============================================================
-- 4. BUSCAR COINCIDENCIAS POR NOMBRE (Fuzzy)
-- ============================================================

SELECT 
  '' as separador,
  '👤 POSIBLES COINCIDENCIAS POR NOMBRE' as seccion;

SELECT 
  b.booking_number as reserva,
  b.customer_name as nombre_reserva,
  b.customer_email as email_reserva,
  c.id as customer_id_posible,
  c.name as nombre_cliente,
  c.email as email_cliente,
  'Nombre similar' as tipo_coincidencia
FROM bookings b
CROSS JOIN customers c
WHERE b.customer_id IS NULL
  AND similarity(LOWER(b.customer_name), LOWER(c.name)) > 0.6
  -- Solo si no es email legacy
  AND NOT c.email LIKE '%@legacy.furgocasa.com'
ORDER BY similarity(LOWER(b.customer_name), LOWER(c.name)) DESC
LIMIT 20;

-- NOTA: Si la función similarity() no está disponible, instala la extensión pg_trgm:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 5. ESTADÍSTICAS DE CLIENTES
-- ============================================================

SELECT 
  '' as separador,
  '👥 ESTADÍSTICAS DE CLIENTES' as seccion;

SELECT 
  'Total de clientes' as metrica,
  COUNT(*) as valor
FROM customers;

SELECT 
  'Clientes con al menos 1 reserva' as metrica,
  COUNT(DISTINCT customer_id) as valor
FROM bookings
WHERE customer_id IS NOT NULL;

SELECT 
  'Clientes sin reservas vinculadas' as metrica,
  COUNT(*) as valor
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM bookings b WHERE b.customer_id = c.id
);

SELECT 
  'Clientes con emails legacy' as metrica,
  COUNT(*) as valor
FROM customers
WHERE email LIKE '%@legacy.furgocasa.com';

-- ============================================================
-- 6. TOP 10 CLIENTES POR RESERVAS
-- ============================================================

SELECT 
  '' as separador,
  '🏆 TOP 10 CLIENTES CON MÁS RESERVAS' as seccion;

SELECT 
  c.name as nombre,
  c.email as email,
  COUNT(b.id) as total_reservas,
  COALESCE(SUM(b.total_price), 0) as total_gastado
FROM customers c
LEFT JOIN bookings b ON b.customer_id = c.id
GROUP BY c.id, c.name, c.email
HAVING COUNT(b.id) > 0
ORDER BY total_reservas DESC, total_gastado DESC
LIMIT 10;

-- ============================================================
-- 7. EMAILS DUPLICADOS (Posible problema)
-- ============================================================

SELECT 
  '' as separador,
  '⚠️  EMAILS DUPLICADOS EN CLIENTES' as seccion;

SELECT 
  email,
  COUNT(*) as veces_repetido,
  STRING_AGG(name, ' | ') as nombres
FROM customers
WHERE NOT email LIKE '%@legacy.furgocasa.com'
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY veces_repetido DESC;

-- ============================================================
-- 8. RESERVAS POR ESTADO Y VINCULACIÓN
-- ============================================================

SELECT 
  '' as separador,
  '📊 RESERVAS POR ESTADO Y VINCULACIÓN' as seccion;

SELECT 
  status as estado,
  COUNT(*) FILTER (WHERE customer_id IS NOT NULL) as vinculadas,
  COUNT(*) FILTER (WHERE customer_id IS NULL) as sin_vincular,
  COUNT(*) as total
FROM bookings
GROUP BY status
ORDER BY total DESC;

-- ============================================================
-- 9. RECOMENDACIONES
-- ============================================================

SELECT 
  '' as separador,
  '💡 RECOMENDACIONES' as seccion;

SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM bookings WHERE customer_id IS NULL) = 0 
    THEN '✅ ¡Perfecto! Todas las reservas están vinculadas.'
    WHEN (SELECT COUNT(*) FROM bookings WHERE customer_id IS NULL) < 5 
    THEN '⚠️  Hay algunas reservas sin vincular. Revisa manualmente.'
    ELSE '❌ Muchas reservas sin vincular. Ejecuta script fix-customer-links.ts'
  END as recomendacion;

-- ============================================================
-- FIN DEL DIAGNÓSTICO
-- ============================================================
