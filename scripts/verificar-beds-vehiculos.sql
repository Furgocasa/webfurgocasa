-- ====================================================
-- VERIFICAR Y CORREGIR VALORES DE TRANSMISIÓN
-- ====================================================
-- Ejecutar en Supabase SQL Editor
-- ====================================================

-- 🔴 PROBLEMA ENCONTRADO: Valores inconsistentes de "transmission"
-- Algunos tienen "Manual" (mayúscula) y otros "manual" (minúscula)
-- Esto causa que el filtro no funcione correctamente

-- 1️⃣ VER EL PROBLEMA - Valores actuales de transmission
SELECT 
    transmission AS "Valor actual",
    COUNT(*) AS "Cantidad",
    STRING_AGG(name, ', ' ORDER BY internal_code) AS "Vehículos"
FROM vehicles
WHERE is_for_rent = TRUE
  AND status != 'inactive'
GROUP BY transmission
ORDER BY transmission;

-- 2️⃣ VER TODOS LOS VEHÍCULOS DE ALQUILER CON SUS VALORES
SELECT 
    internal_code AS "Código",
    name AS "Nombre",
    seats AS "Plazas viaje",
    beds AS "Camas/Plazas noche",
    transmission AS "Transmisión",
    CASE 
        WHEN transmission = 'manual' THEN '✅ OK'
        WHEN transmission = 'Manual' THEN '⚠️ Mayúscula - CORREGIR'
        WHEN transmission = 'automatic' THEN '✅ OK'
        WHEN transmission = 'Automatic' THEN '⚠️ Mayúscula - CORREGIR'
        ELSE '❌ Valor inesperado'
    END AS "Estado transmisión"
FROM vehicles
WHERE is_for_rent = TRUE
  AND status != 'inactive'
ORDER BY internal_code;

-- 2️⃣ RESUMEN DE VEHÍCULOS POR NÚMERO DE CAMAS
SELECT 
    'RESUMEN POR CAMAS' AS tipo,
    COUNT(*) FILTER (WHERE beds = 2) AS "Vehículos con 2 camas",
    COUNT(*) FILTER (WHERE beds = 4) AS "Vehículos con 4 camas",
    COUNT(*) FILTER (WHERE beds IS NULL) AS "Vehículos sin beds definido",
    COUNT(*) FILTER (WHERE beds NOT IN (2, 4)) AS "Vehículos con otros valores"
FROM vehicles
WHERE is_for_rent = TRUE
  AND status != 'inactive';

-- 3️⃣ VERIFICAR SI HAY VEHÍCULOS CON VALORES INCORRECTOS DE BEDS
SELECT 
    internal_code AS "Código",
    name AS "Nombre",
    seats AS "Plazas (asientos)",
    beds AS "Camas (valor actual)",
    '❌ Verificar este valor' AS "Problema"
FROM vehicles
WHERE is_for_rent = TRUE 
  AND status != 'inactive'
  AND (beds IS NULL OR beds NOT IN (2, 4))
ORDER BY internal_code;

-- 4️⃣ SIMULAR EL FILTRO "2 plazas" (debe mostrar vehículos con beds = 2)
SELECT 
    'FILTRO 2 PLAZAS' AS tipo,
    COUNT(*) AS "Total que mostraría",
    STRING_AGG(name, ', ' ORDER BY internal_code) AS "Vehículos"
FROM vehicles
WHERE is_for_rent = TRUE
  AND status != 'inactive'
  AND beds = 2;

-- 5️⃣ SIMULAR EL FILTRO "4 plazas" (debe mostrar vehículos con beds = 4)
SELECT 
    'FILTRO 4 PLAZAS' AS tipo,
    COUNT(*) AS "Total que mostraría",
    STRING_AGG(name, ', ' ORDER BY internal_code) AS "Vehículos"
FROM vehicles
WHERE is_for_rent = TRUE
  AND status != 'inactive'
  AND beds = 4;

-- 6️⃣ SIMULAR FILTRO "2 plazas" + "Manual" (con case-insensitive)
SELECT 
    'FILTRO 2 PLAZAS + MANUAL' AS tipo,
    COUNT(*) AS "Total que mostraría",
    STRING_AGG(name, ', ' ORDER BY internal_code) AS "Vehículos"
FROM vehicles
WHERE is_for_rent = TRUE
  AND status != 'inactive'
  AND beds = 2
  AND LOWER(transmission) = 'manual';

-- ====================================================
-- 🔧 CORRECCIÓN: NORMALIZAR VALORES DE TRANSMISSION
-- ====================================================
-- Descomenta y ejecuta para corregir los datos:

/*
-- Normalizar "Manual" -> "manual"
UPDATE vehicles
SET transmission = 'manual'
WHERE transmission = 'Manual';

-- Normalizar "Automatic" -> "automatic" (si existiera)
UPDATE vehicles
SET transmission = 'automatic'
WHERE transmission = 'Automatic';

-- Verificar resultado
SELECT transmission, COUNT(*) 
FROM vehicles 
WHERE is_for_rent = TRUE 
GROUP BY transmission;
*/
