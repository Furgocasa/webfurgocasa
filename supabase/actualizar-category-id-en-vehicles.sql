-- ============================================================
-- ACTUALIZAR category_id EN LA TABLA VEHICLES
-- ============================================================
-- Asignar la categoría "Campers Gran Volumen" directamente
-- en la columna category_id de cada vehículo
-- ID: c5bc538e-9d91-43ba-907d-b75bd4aab56d
-- ============================================================

BEGIN;

-- 1. ACTUALIZAR category_id EN TODOS LOS VEHÍCULOS
-- =================================================
UPDATE vehicles
SET category_id = 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid
WHERE category_id IS NULL OR category_id != 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid;

-- 2. VERIFICAR QUE NO HAY VEHÍCULOS SIN CATEGORÍA
-- ================================================
-- Esta consulta debería devolver 0 filas
SELECT 
    id,
    internal_code,
    name,
    category_id
FROM vehicles
WHERE category_id IS NULL;

-- 3. ELIMINAR CATEGORÍAS NO UTILIZADAS
-- =====================================
DELETE FROM vehicle_categories 
WHERE id != 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid;

-- 4. ASEGURAR QUE LA CATEGORÍA TIENE LOS DATOS CORRECTOS
-- =======================================================
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
-- VERIFICACIÓN FINAL
-- ============================================================

-- Ver todos los vehículos con su categoría
SELECT 
    v.internal_code,
    v.name AS vehiculo,
    v.brand,
    v.year,
    v.category_id,
    vc.name AS categoria
FROM vehicles v
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
ORDER BY v.internal_code;

-- Contar vehículos por categoría
SELECT 
    vc.name AS categoria,
    vc.slug,
    COUNT(v.id) AS total_vehiculos
FROM vehicle_categories vc
LEFT JOIN vehicles v ON v.category_id = vc.id
GROUP BY vc.id, vc.name, vc.slug;

-- Ver todas las categorías existentes
SELECT 
    id,
    name,
    slug,
    is_active
FROM vehicle_categories
ORDER BY sort_order;

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- ✓ Todos los vehículos tienen category_id = c5bc538e-9d91-43ba-907d-b75bd4aab56d
-- ✓ Solo existe 1 categoría: "Campers Gran Volumen"
-- ✓ No hay vehículos con category_id NULL
-- ============================================================

