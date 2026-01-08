-- ============================================
-- CORRECCIÓN DE TRANSMISIÓN Y CAMAS EN VEHÍCULOS
-- ============================================
-- 
-- Reglas:
-- - Todos los vehículos son MANUALES excepto FU0020
-- - FU0020 es AUTOMÁTICO
--
-- ============================================

-- 1. Establecer TODOS los vehículos como manuales
UPDATE vehicles
SET transmission = 'Manual'
WHERE transmission IS NULL OR transmission != 'Manual';

-- 2. Establecer FU0020 como automático
UPDATE vehicles
SET transmission = 'Automático'
WHERE internal_code = 'FU0020';

-- ============================================
-- VERIFICAR DATOS DE CAMAS
-- ============================================

-- Ver el estado actual
SELECT 
    internal_code,
    name,
    beds,
    transmission,
    seats
FROM vehicles
ORDER BY internal_code;

-- ============================================
-- ESTABLECER CAMAS POR DEFECTO SI FALTAN
-- ============================================
-- Por defecto, si no hay datos de camas, asumimos 4 camas

UPDATE vehicles
SET beds = 4
WHERE beds IS NULL OR beds = 0;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT 
    internal_code AS "Código",
    name AS "Vehículo",
    beds AS "Camas",
    transmission AS "Transmisión",
    seats AS "Plazas"
FROM vehicles
ORDER BY internal_code;

-- ============================================
-- RESUMEN
-- ============================================
SELECT 
    'Total vehículos' AS "Métrica",
    COUNT(*) AS "Valor"
FROM vehicles
UNION ALL
SELECT 
    'Manuales',
    COUNT(*)
FROM vehicles
WHERE transmission = 'Manual'
UNION ALL
SELECT 
    'Automáticos',
    COUNT(*)
FROM vehicles
WHERE transmission = 'Automático'
UNION ALL
SELECT 
    '2 camas',
    COUNT(*)
FROM vehicles
WHERE beds = 2
UNION ALL
SELECT 
    '4 camas',
    COUNT(*)
FROM vehicles
WHERE beds = 4;
