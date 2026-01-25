-- ============================================
-- ANÁLISIS DE RESERVAS CREADAS EN 2025
-- ============================================
-- Script para verificar cuántas reservas se crearon cada mes
-- y por qué importe total, agrupadas por MES DE CREACIÓN
-- ============================================

-- ============================================
-- 1. RESUMEN POR MES DE CREACIÓN
-- ============================================

SELECT 
  TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as mes_creacion,
  TO_CHAR(DATE_TRUNC('month', created_at), 'Month YYYY') as mes_nombre,
  COUNT(*) as num_reservas,
  SUM(total_price) as importe_total,
  ROUND(AVG(total_price), 2) as precio_medio,
  MIN(total_price) as precio_min,
  MAX(total_price) as precio_max,
  COUNT(DISTINCT vehicle_id) as vehiculos_distintos,
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmadas,
  COUNT(*) FILTER (WHERE status = 'pending') as pendientes,
  COUNT(*) FILTER (WHERE status = 'in_progress') as en_curso,
  COUNT(*) FILTER (WHERE status = 'cancelled') as canceladas,
  COUNT(*) FILTER (WHERE payment_status = 'paid') as pagadas_completo,
  COUNT(*) FILTER (WHERE payment_status = 'partial') as pagadas_parcial,
  COUNT(*) FILTER (WHERE payment_status = 'pending') as sin_pagar
FROM public.bookings
WHERE EXTRACT(YEAR FROM created_at) = 2025
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes_creacion ASC;

-- ============================================
-- 2. DETALLE DE CADA RESERVA DE 2025
-- ============================================

SELECT 
  id,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as fecha_creacion,
  TO_CHAR(pickup_date, 'DD/MM/YYYY') as fecha_recogida,
  TO_CHAR(dropoff_date, 'DD/MM/YYYY') as fecha_devolucion,
  days as dias_alquiler,
  total_price as precio,
  status as estado,
  payment_status as estado_pago,
  customer_name as cliente,
  customer_email as email
FROM public.bookings
WHERE EXTRACT(YEAR FROM created_at) = 2025
ORDER BY created_at ASC;

-- ============================================
-- 3. COMPARACIÓN: CREACIÓN vs EJECUCIÓN
-- ============================================
-- Este query muestra cómo se distribuyen las reservas:
-- - Por mes de creación (cuándo se hizo la reserva)
-- - Por mes de ejecución (cuándo empieza el alquiler)

WITH reservas_por_mes_creacion AS (
  SELECT 
    TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as mes,
    COUNT(*) as reservas,
    SUM(total_price) as ingresos
  FROM public.bookings
  WHERE EXTRACT(YEAR FROM created_at) = 2025
  GROUP BY DATE_TRUNC('month', created_at)
),
reservas_por_mes_ejecucion AS (
  SELECT 
    TO_CHAR(DATE_TRUNC('month', pickup_date), 'Mon') as mes,
    COUNT(*) as reservas,
    SUM(total_price) as ingresos
  FROM public.bookings
  WHERE EXTRACT(YEAR FROM pickup_date) = 2025
  GROUP BY DATE_TRUNC('month', pickup_date)
)
SELECT 
  COALESCE(c.mes, e.mes) as mes,
  COALESCE(c.reservas, 0) as creadas_en_mes,
  COALESCE(c.ingresos, 0) as ingresos_creacion,
  COALESCE(e.reservas, 0) as ejecutadas_en_mes,
  COALESCE(e.ingresos, 0) as ingresos_ejecucion,
  COALESCE(c.reservas, 0) - COALESCE(e.reservas, 0) as diferencia_reservas
FROM reservas_por_mes_creacion c
FULL OUTER JOIN reservas_por_mes_ejecucion e ON c.mes = e.mes
ORDER BY mes;

-- ============================================
-- 4. TOP 10 RESERVAS MÁS CARAS DE 2025
-- ============================================

SELECT 
  TO_CHAR(created_at, 'DD/MM/YYYY') as fecha_creacion,
  customer_name as cliente,
  TO_CHAR(pickup_date, 'DD/MM/YYYY') || ' - ' || TO_CHAR(dropoff_date, 'DD/MM/YYYY') as periodo_alquiler,
  days as dias,
  total_price as precio,
  status as estado,
  payment_status as pago
FROM public.bookings
WHERE EXTRACT(YEAR FROM created_at) = 2025
ORDER BY total_price DESC
LIMIT 10;

-- ============================================
-- 5. RESERVAS ANÓMALAS (sin created_at)
-- ============================================

SELECT 
  COUNT(*) as reservas_sin_created_at,
  MIN(pickup_date) as primera_fecha_alquiler,
  MAX(pickup_date) as ultima_fecha_alquiler,
  SUM(total_price) as importe_total
FROM public.bookings
WHERE created_at IS NULL;

-- ============================================
-- 6. ESTADÍSTICAS GLOBALES 2025
-- ============================================

SELECT 
  COUNT(*) as total_reservas_2025,
  COUNT(DISTINCT vehicle_id) as vehiculos_usados,
  COUNT(DISTINCT customer_email) as clientes_unicos,
  SUM(total_price) as facturacion_total_2025,
  ROUND(AVG(total_price), 2) as ticket_medio,
  ROUND(AVG(days), 1) as dias_medio_alquiler,
  COUNT(*) FILTER (WHERE status != 'cancelled') as reservas_validas,
  COUNT(*) FILTER (WHERE status = 'cancelled') as reservas_canceladas,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cancelled') / COUNT(*), 2) as tasa_cancelacion_pct
FROM public.bookings
WHERE EXTRACT(YEAR FROM created_at) = 2025;

-- ============================================
-- 7. GRÁFICO DE EVOLUCIÓN MENSUAL
-- ============================================
-- Datos preparados para copiar/pegar en Excel o Google Sheets

SELECT 
  EXTRACT(MONTH FROM created_at) as mes_numero,
  TO_CHAR(created_at, 'Month') as mes_nombre,
  COUNT(*) as reservas,
  SUM(total_price) as ingresos
FROM public.bookings
WHERE EXTRACT(YEAR FROM created_at) = 2025
GROUP BY EXTRACT(MONTH FROM created_at), TO_CHAR(created_at, 'Month')
ORDER BY mes_numero ASC;

-- ============================================
-- 8. ANÁLISIS POR VEHÍCULO
-- ============================================

SELECT 
  v.name as vehiculo,
  v.internal_code as codigo,
  COUNT(b.id) as num_reservas_2025,
  SUM(b.total_price) as ingresos_2025,
  ROUND(AVG(b.total_price), 2) as precio_medio,
  SUM(b.days) as dias_alquilados,
  COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelaciones
FROM public.bookings b
JOIN public.vehicles v ON b.vehicle_id = v.id
WHERE EXTRACT(YEAR FROM b.created_at) = 2025
GROUP BY v.id, v.name, v.internal_code
ORDER BY ingresos_2025 DESC;

-- ============================================
-- NOTAS DE USO
-- ============================================
-- 
-- Este script se puede ejecutar en:
-- 1. Supabase SQL Editor (recomendado)
-- 2. pgAdmin
-- 3. Cualquier cliente PostgreSQL
--
-- Para mejores resultados:
-- - Ejecuta cada query por separado (están separados por comentarios)
-- - El query #1 es el más útil para entender la distribución mensual
-- - El query #3 muestra la diferencia entre creación y ejecución
--
-- ============================================
