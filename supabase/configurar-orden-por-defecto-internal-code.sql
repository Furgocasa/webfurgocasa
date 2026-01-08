-- ============================================================
-- CONFIGURAR ORDEN POR DEFECTO: CÓDIGO INTERNO
-- ============================================================
-- Este script documenta y aplica el orden por defecto
-- por internal_code en consultas de vehículos
-- ============================================================

-- 1. VERIFICAR ÍNDICE EN internal_code
-- =====================================
-- Asegurar que existe un índice para búsquedas rápidas

CREATE INDEX IF NOT EXISTS idx_vehicles_internal_code_sort 
ON vehicles(internal_code ASC NULLS LAST);

-- 2. VISTA PARA CONSULTAS COMUNES (OPCIONAL)
-- ===========================================
-- Vista que devuelve vehículos siempre ordenados por código interno

CREATE OR REPLACE VIEW vehicles_ordered AS
SELECT 
    v.*,
    vc.name AS category_name,
    vc.slug AS category_slug
FROM vehicles v
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
ORDER BY v.internal_code ASC NULLS LAST;

-- 3. FUNCIÓN HELPER PARA OBTENER VEHÍCULOS ORDENADOS
-- ===================================================
-- Función que devuelve vehículos de alquiler ordenados por código

CREATE OR REPLACE FUNCTION get_rental_vehicles_ordered()
RETURNS TABLE (
    id UUID,
    internal_code VARCHAR,
    name VARCHAR,
    slug VARCHAR,
    brand VARCHAR,
    model VARCHAR,
    year INTEGER,
    base_price_per_day DECIMAL,
    status VARCHAR,
    category_id UUID,
    category_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.internal_code,
        v.name,
        v.slug,
        v.brand,
        v.model,
        v.year,
        v.base_price_per_day,
        v.status,
        v.category_id,
        vc.name AS category_name
    FROM vehicles v
    LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
    WHERE v.is_for_rent = true
    ORDER BY v.internal_code ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- 4. VERIFICACIÓN
-- ===============

-- Ver vehículos ordenados por código interno
SELECT 
    internal_code,
    name,
    brand,
    year,
    status,
    is_for_rent
FROM vehicles
ORDER BY internal_code ASC NULLS LAST;

-- Usar la función helper
SELECT * FROM get_rental_vehicles_ordered();

-- Usar la vista
SELECT 
    internal_code,
    name,
    category_name
FROM vehicles_ordered
WHERE is_for_rent = true
LIMIT 10;

-- ============================================================
-- NOTAS DE USO
-- ============================================================
-- 
-- 1. EN CONSULTAS SQL DIRECTAS:
--    SELECT * FROM vehicles 
--    ORDER BY internal_code ASC NULLS LAST;
--
-- 2. EN SUPABASE (JavaScript/TypeScript):
--    .order('internal_code', { ascending: true, nullsFirst: false })
--
-- 3. USAR LA VISTA:
--    SELECT * FROM vehicles_ordered WHERE is_for_rent = true;
--
-- 4. USAR LA FUNCIÓN:
--    SELECT * FROM get_rental_vehicles_ordered();
--
-- ============================================================
-- APLICADO EN:
-- ============================================================
-- ✓ src/lib/supabase/queries.ts
--   - getAllVehicles()
--   - getAvailableVehicles()
--   - getVehiclesForSale()
--
-- ✓ src/app/administrator/(protected)/calendario/page.tsx
--   - loadData() - orden inicial y por defecto
--
-- ✓ src/app/administrator/(protected)/vehiculos/page.tsx
--   - loadData() - orden inicial por defecto
--   - sortField inicial = 'internal_code'
--
-- ✓ src/app/administrator/(protected)/reservas/page.tsx
--   - Mantiene orden por fecha (más reciente primero)
--   - Los vehículos se muestran con internal_code
--
-- ============================================================

