-- Script de diagnóstico para verificar el estado actual
-- Ejecutar en Supabase SQL Editor

-- 1. ¿Existe la tabla?
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'sale_location_targets'
) AS table_exists;

-- 2. ¿Cuántas filas tiene?
SELECT COUNT(*) AS total_rows FROM sale_location_targets;

-- 3. ¿Cuántas están activas?
SELECT COUNT(*) AS active_rows FROM sale_location_targets WHERE is_active = true;

-- 4. Mostrar las primeras 5 filas
SELECT slug, name, province, is_active FROM sale_location_targets LIMIT 5;

-- 5. Verificar si existen locations (sedes físicas)
SELECT id, name, city FROM locations WHERE city IN ('Murcia', 'Madrid');
