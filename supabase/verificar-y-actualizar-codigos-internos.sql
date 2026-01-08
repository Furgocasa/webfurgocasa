-- ============================================================
-- VERIFICAR Y ACTUALIZAR CÓDIGOS INTERNOS DE VEHÍCULOS
-- ============================================================
-- Este script verifica qué vehículos existen y les asigna
-- sus códigos internos correctos
-- ============================================================

-- 1. VER ESTRUCTURA DE LA TABLA VEHICLES
-- =======================================
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'vehicles'
ORDER BY ordinal_position;

-- 2. VER VEHÍCULOS ACTUALES (con o sin internal_code)
-- ====================================================
SELECT 
    id,
    name,
    slug,
    brand,
    model,
    year,
    internal_code,
    base_price_per_day,
    status
FROM vehicles
ORDER BY name;

-- 3. ACTUALIZAR CÓDIGOS INTERNOS SEGÚN EL SLUG
-- =============================================
-- Si la columna internal_code existe, actualizar los vehículos existentes

-- Weinsberg Carabus 600 MQ (existente)
UPDATE vehicles
SET internal_code = 'FU0001'
WHERE slug = 'weinsberg-carabus-600-mq' AND internal_code IS NULL;

-- Knaus Boxstar 600 Street
UPDATE vehicles
SET internal_code = 'FU0010'
WHERE slug = 'knaus-boxstar-600-street-2023' AND internal_code IS NULL;

-- Knaus Boxstar 600 Family
UPDATE vehicles
SET internal_code = 'FU0012'
WHERE (slug = 'fu0012-knaus-boxstar-600-family' OR slug = 'knaus-boxstar-600-family') AND internal_code IS NULL;

-- Dreamer D55 Fun (existente)
UPDATE vehicles
SET internal_code = 'FU0013'
WHERE slug = 'dreamer-d55-fun' AND internal_code IS NULL;

-- Adria Twin Plus 600 SP Family
UPDATE vehicles
SET internal_code = 'FU0015'
WHERE (slug = 'fu0015-adria-twin-family' OR slug = 'adria-twin-plus-600-sp-family') AND internal_code IS NULL;

-- 4. VERIFICAR RESULTADO
-- ======================
SELECT 
    internal_code,
    name,
    brand,
    model,
    year,
    slug,
    base_price_per_day
FROM vehicles
ORDER BY internal_code;

-- 5. VER VEHÍCULOS SIN CÓDIGO INTERNO
-- ====================================
SELECT 
    id,
    name,
    slug,
    brand,
    year
FROM vehicles
WHERE internal_code IS NULL
ORDER BY name;

-- ============================================================
-- NOTAS
-- ============================================================
-- Si la columna internal_code NO existe, primero ejecuta:
-- supabase/migrate-vehicles-add-all-columns.sql
-- o específicamente:
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS internal_code VARCHAR(20) UNIQUE;
-- ============================================================

