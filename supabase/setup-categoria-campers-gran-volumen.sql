-- ============================================================
-- CREAR CATEGORÍA "CAMPERS GRAN VOLUMEN" PARA FURGOCASA
-- ============================================================
-- Todos los vehículos de Furgocasa pertenecen a esta categoría única
-- ============================================================

BEGIN;

-- 1. Eliminar categorías por defecto que no se usan
DELETE FROM vehicle_categories 
WHERE slug IN ('campers-compactas', 'campers-familiares', 'autocaravanas', 'furgonetas-camper');

-- 2. Crear/actualizar la categoría única de Furgocasa
INSERT INTO vehicle_categories (
    id,
    name,
    slug,
    description,
    icon,
    sort_order,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Campers Gran Volumen',
    'campers-gran-volumen',
    'Vehículos camperizados de gran volumen, perfectos para familias y viajes largos. Todos nuestros modelos ofrecen el máximo confort y equipamiento.',
    'truck',
    1,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

COMMIT;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT 
    id,
    name,
    slug,
    description,
    is_active
FROM vehicle_categories
WHERE is_active = true
ORDER BY sort_order;

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- Solo debe existir 1 categoría activa: "Campers Gran Volumen"
-- ============================================================

