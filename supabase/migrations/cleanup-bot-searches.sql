-- ============================================
-- LIMPIEZA DE BÚSQUEDAS DE BOTS
-- ============================================
-- Este script identifica y elimina búsquedas probablemente hechas por bots
-- basándose en patrones sospechosos de comportamiento

-- ============================================
-- PASO 1: ANÁLISIS - Ver qué se va a eliminar
-- ============================================
-- Ejecuta esto primero para ver qué datos se identifican como bots

-- 1.1 Sesiones con demasiadas búsquedas en poco tiempo (comportamiento no humano)
SELECT 
  'Sesiones sospechosas (>10 búsquedas)' as tipo,
  COUNT(DISTINCT session_id) as sesiones_afectadas,
  COUNT(*) as busquedas_totales
FROM search_queries
WHERE session_id IN (
  SELECT session_id
  FROM search_queries
  GROUP BY session_id
  HAVING COUNT(*) > 10
);

-- 1.2 Búsquedas con patrones temporales sospechosos (muchas búsquedas en <1 minuto)
WITH rapid_searches AS (
  SELECT 
    session_id,
    COUNT(*) as search_count,
    MAX(searched_at) - MIN(searched_at) as time_span,
    EXTRACT(EPOCH FROM (MAX(searched_at) - MIN(searched_at))) / COUNT(*) as avg_seconds_between
  FROM search_queries
  GROUP BY session_id
  HAVING COUNT(*) >= 5 
    AND EXTRACT(EPOCH FROM (MAX(searched_at) - MIN(searched_at))) / COUNT(*) < 5
)
SELECT 
  'Sesiones con búsquedas muy rápidas (<5s entre búsquedas)' as tipo,
  COUNT(*) as sesiones_afectadas,
  SUM(search_count) as busquedas_totales
FROM rapid_searches;

-- 1.3 Búsquedas sin conversión en sesiones muy activas
SELECT 
  'Sesiones activas sin conversiones' as tipo,
  COUNT(DISTINCT session_id) as sesiones_afectadas,
  COUNT(*) as busquedas_totales
FROM search_queries
WHERE session_id IN (
  SELECT session_id
  FROM search_queries
  GROUP BY session_id
  HAVING COUNT(*) >= 5
    AND COUNT(*) FILTER (WHERE booking_created = true) = 0
    AND COUNT(*) FILTER (WHERE vehicle_selected = true) = 0
);

-- ============================================
-- PASO 2: VISTA PREVIA - Ver ejemplos específicos
-- ============================================

-- Ver las 20 sesiones más sospechosas
SELECT 
  session_id,
  COUNT(*) as total_searches,
  MIN(searched_at) as first_search,
  MAX(searched_at) as last_search,
  EXTRACT(EPOCH FROM (MAX(searched_at) - MIN(searched_at))) as duration_seconds,
  ROUND(EXTRACT(EPOCH FROM (MAX(searched_at) - MIN(searched_at))) / COUNT(*), 2) as avg_seconds_between,
  COUNT(DISTINCT pickup_date) as unique_dates,
  COUNT(*) FILTER (WHERE vehicle_selected = true) as selections,
  COUNT(*) FILTER (WHERE booking_created = true) as bookings
FROM search_queries
GROUP BY session_id
HAVING COUNT(*) >= 5
ORDER BY COUNT(*) DESC
LIMIT 20;

-- ============================================
-- PASO 3: LIMPIEZA (CUIDADO - ESTO ELIMINA DATOS)
-- ============================================
-- Solo ejecuta esto después de revisar los pasos 1 y 2

-- OPCIÓN A: Eliminar solo sesiones obviamente no humanas (>20 búsquedas)
-- DELETE FROM search_queries
-- WHERE session_id IN (
--   SELECT session_id
--   FROM search_queries
--   GROUP BY session_id
--   HAVING COUNT(*) > 20
-- );

-- OPCIÓN B: Eliminar sesiones con comportamiento automatizado (<3 segundos entre búsquedas)
-- DELETE FROM search_queries
-- WHERE session_id IN (
--   SELECT session_id
--   FROM search_queries
--   GROUP BY session_id
--   HAVING COUNT(*) >= 5 
--     AND EXTRACT(EPOCH FROM (MAX(searched_at) - MIN(searched_at))) / COUNT(*) < 3
-- );

-- OPCIÓN C: Eliminar sesiones muy activas sin ninguna interacción real
-- DELETE FROM search_queries
-- WHERE session_id IN (
--   SELECT session_id
--   FROM search_queries
--   GROUP BY session_id
--   HAVING COUNT(*) >= 8
--     AND COUNT(*) FILTER (WHERE booking_created = true) = 0
--     AND COUNT(*) FILTER (WHERE vehicle_selected = true) = 0
-- );

-- ============================================
-- PASO 4: VERIFICACIÓN POST-LIMPIEZA
-- ============================================
-- Ejecuta esto después de la limpieza para ver las estadísticas actualizadas

SELECT 
  COUNT(*) as total_searches,
  COUNT(DISTINCT session_id) as unique_sessions,
  ROUND(COUNT(*)::numeric / COUNT(DISTINCT session_id), 2) as avg_searches_per_session,
  COUNT(*) FILTER (WHERE vehicle_selected = true) as selections,
  COUNT(*) FILTER (WHERE booking_created = true) as bookings,
  ROUND(100.0 * COUNT(*) FILTER (WHERE vehicle_selected = true) / COUNT(*), 2) as selection_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE booking_created = true) / COUNT(*), 2) as conversion_rate
FROM search_queries
WHERE searched_at >= CURRENT_DATE - INTERVAL '30 days';

-- ============================================
-- RECOMENDACIÓN DE USO:
-- ============================================
-- 1. Ejecuta los queries de análisis (PASO 1 y 2) para ver qué datos hay
-- 2. Revisa manualmente algunos ejemplos para confirmar que son bots
-- 3. Descomenta y ejecuta UNA de las opciones del PASO 3
-- 4. Ejecuta el PASO 4 para verificar que las estadísticas mejoraron
-- 5. A partir de ahora, el código actualizado evitará que se registren nuevos bots
