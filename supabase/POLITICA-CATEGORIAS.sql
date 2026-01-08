-- ============================================================
-- POLÍTICA DE CATEGORÍAS FURGOCASA
-- ============================================================
-- IMPORTANTE: Solo existe UNA categoría en el sistema
-- NO crear nuevas categorías sin autorización explícita
-- ============================================================

-- CATEGORÍA OFICIAL DE FURGOCASA
-- ===============================
-- ID:          c5bc538e-9d91-43ba-907d-b75bd4aab56d
-- Nombre:      Campers Gran Volumen
-- Slug:        campers-gran-volumen
-- Descripción: Vehículos camperizados de gran volumen

-- ============================================================
-- VERIFICAR CATEGORÍAS ACTUALES
-- ============================================================

SELECT 
    id,
    name,
    slug,
    description,
    is_active,
    created_at,
    updated_at
FROM vehicle_categories
ORDER BY sort_order;

-- ============================================================
-- VERIFICAR ASIGNACIÓN DE VEHÍCULOS
-- ============================================================

SELECT 
    v.internal_code,
    v.name,
    v.brand,
    v.category_id,
    vc.name AS categoria
FROM vehicles v
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
ORDER BY v.internal_code;

-- ============================================================
-- POLÍTICA DE GESTIÓN
-- ============================================================
-- 
-- ✓ Todos los vehículos deben tener:
--   category_id = 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'
--
-- ✓ NO crear nuevas categorías sin aprobación
--
-- ✓ Si un vehículo nuevo no tiene categoría, ejecutar:
--   UPDATE vehicles 
--   SET category_id = 'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid
--   WHERE category_id IS NULL;
--
-- ✓ Si se necesita una categoría diferente en el futuro,
--   primero se debe:
--   1. Discutir y aprobar con el equipo
--   2. Crear la categoría manualmente
--   3. Documentar aquí el cambio
--
-- ============================================================
-- HISTORIAL DE CAMBIOS
-- ============================================================
-- 2026-01-07: Establecida política de categoría única
--             ID: c5bc538e-9d91-43ba-907d-b75bd4aab56d
--             Categoría: "Campers Gran Volumen"
-- ============================================================

