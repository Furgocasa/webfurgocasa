-- ====================================================
-- VERIFICAR Y CORREGIR VEHÍCULOS EN VENTA
-- ====================================================
-- Ejecutar en Supabase SQL Editor
-- ====================================================

-- 1️⃣ VER EL ESTADO ACTUAL DE TODOS LOS VEHÍCULOS EN VENTA
SELECT 
    internal_code AS "Código",
    name AS "Nombre",
    is_for_sale AS "En Venta?",
    sale_status AS "Estado Venta",
    sale_price AS "Precio",
    status AS "Estado General",
    CASE 
        WHEN sale_status = 'available' THEN '✅ Aparecerá en /ventas'
        WHEN sale_status IS NULL THEN '❌ NULL - NO aparecerá'
        WHEN sale_status = 'sold' THEN '🔴 VENDIDO - NO aparecerá'
        WHEN sale_status = 'reserved' THEN '🟡 RESERVADO - NO aparecerá'
        ELSE '⚠️  Valor desconocido: ' || sale_status
    END AS "Resultado"
FROM vehicles
WHERE is_for_sale = TRUE
ORDER BY internal_code;

-- 2️⃣ CONTAR POR ESTADO
SELECT 
    'RESUMEN' AS tipo,
    COUNT(*) FILTER (WHERE is_for_sale = TRUE) AS "Total marcados en venta",
    COUNT(*) FILTER (WHERE is_for_sale = TRUE AND sale_status = 'available') AS "Con status available",
    COUNT(*) FILTER (WHERE is_for_sale = TRUE AND sale_status IS NULL) AS "Con status NULL",
    COUNT(*) FILTER (WHERE is_for_sale = TRUE AND sale_status = 'sold') AS "Vendidos",
    COUNT(*) FILTER (WHERE is_for_sale = TRUE AND sale_status = 'reserved') AS "Reservados"
FROM vehicles;

-- 3️⃣ MOSTRAR LOS QUE TIENEN PROBLEMAS
SELECT 
    internal_code AS "Código",
    name AS "Nombre",
    sale_status AS "Estado Venta (Problema)",
    sale_price AS "Precio",
    '❌ Este vehículo NO aparece en /ventas' AS "Problema"
FROM vehicles
WHERE is_for_sale = TRUE 
  AND (sale_status IS NULL OR sale_status != 'available')
ORDER BY internal_code;

-- ====================================================
-- 4️⃣ SOLUCIÓN: CORREGIR LOS VEHÍCULOS
-- ====================================================
-- Descomenta las siguientes líneas para aplicar la corrección:

/*
-- Actualizar todos los vehículos marcados para venta
-- que tienen sale_status NULL o diferente de 'available'
UPDATE vehicles
SET sale_status = 'available'
WHERE is_for_sale = TRUE 
  AND (sale_status IS NULL OR sale_status NOT IN ('sold', 'reserved'));

-- Ver cuántos se actualizaron
SELECT 
    COUNT(*) AS "Vehículos actualizados",
    'Ahora deberían aparecer en /ventas' AS "Resultado"
FROM vehicles
WHERE is_for_sale = TRUE 
  AND sale_status = 'available';
*/

-- 5️⃣ VERIFICAR DESPUÉS DE LA CORRECCIÓN
-- Ejecutar esto después de descomentar y ejecutar el punto 4:
/*
SELECT 
    internal_code AS "Código",
    name AS "Nombre",
    sale_status AS "Estado",
    sale_price AS "Precio",
    '✅ Aparecerá en /ventas' AS "Status"
FROM vehicles
WHERE is_for_sale = TRUE 
  AND sale_status = 'available'
ORDER BY internal_code;
*/
