-- ============================================================
-- ASIGNAR CATEGORÍA ÚNICA A TODOS LOS VEHÍCULOS
-- ============================================================
-- ID de la categoría "Campers Gran Volumen": c5bc538e-9d91-43ba-907d-b75bd4aab56d
-- Este script:
-- 1. Elimina todas las asignaciones de categorías existentes
-- 2. Asigna la categoría correcta a todos los vehículos
-- 3. Elimina las categorías que no se usan
-- ============================================================

BEGIN;

-- 1. ELIMINAR TODAS LAS ASIGNACIONES EXISTENTES
-- ==============================================
DELETE FROM vehicle_category_assignments;

-- 2. ASIGNAR LA CATEGORÍA "CAMPERS GRAN VOLUMEN" A TODOS LOS VEHÍCULOS
-- =====================================================================
INSERT INTO vehicle_category_assignments (vehicle_id, category_id, created_at)
SELECT 
    id AS vehicle_id,
    'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid AS category_id,
    NOW() AS created_at
FROM vehicles
WHERE is_for_rent = true
ON CONFLICT (vehicle_id, category_id) DO NOTHING;

-- 3. ELIMINAR CATEGORÍAS NO UTILIZADAS
-- =====================================
-- Mantener solo la categoría con ID c5bc538e-9d91-43ba-907d-b75bd4aab56d
DELETE FROM vehicle_categories 
WHERE id != 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid;

-- 4. ACTUALIZAR LA CATEGORÍA PARA ASEGURAR QUE TIENE LOS DATOS CORRECTOS
-- =======================================================================
UPDATE vehicle_categories
SET 
    name = 'Campers Gran Volumen',
    slug = 'campers-gran-volumen',
    description = 'Vehículos camperizados de gran volumen, perfectos para familias y viajes largos. Todos nuestros modelos ofrecen el máximo confort y equipamiento.',
    is_active = true,
    sort_order = 1,
    updated_at = NOW()
WHERE id = 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid;

COMMIT;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Ver la categoría principal
SELECT 
    id,
    name,
    slug,
    description,
    is_active
FROM vehicle_categories;

-- Ver todos los vehículos con su categoría asignada
SELECT 
    v.internal_code,
    v.name AS vehiculo,
    v.brand,
    v.year,
    vc.name AS categoria,
    vc.slug AS categoria_slug
FROM vehicles v
LEFT JOIN vehicle_category_assignments vca ON v.id = vca.vehicle_id
LEFT JOIN vehicle_categories vc ON vca.category_id = vc.id
WHERE v.is_for_rent = true
ORDER BY v.internal_code;

-- Contar vehículos por categoría
SELECT 
    vc.name AS categoria,
    COUNT(vca.vehicle_id) AS total_vehiculos
FROM vehicle_categories vc
LEFT JOIN vehicle_category_assignments vca ON vc.id = vca.category_id
GROUP BY vc.id, vc.name;

-- Ver vehículos sin categoría (debería estar vacío)
SELECT 
    v.id,
    v.internal_code,
    v.name
FROM vehicles v
LEFT JOIN vehicle_category_assignments vca ON v.id = vca.vehicle_id
WHERE v.is_for_rent = true
  AND vca.id IS NULL;

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- ✓ 1 categoría: "Campers Gran Volumen" (ID: c5bc538e-9d91-43ba-907d-b75bd4aab56d)
-- ✓ Todos los vehículos asignados a esta categoría
-- ✓ Ninguna otra categoría en el sistema
-- ============================================================

