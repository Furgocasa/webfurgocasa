-- =============================================
-- AÑADIR EQUIPAMIENTO: ISOFIX
-- Fecha: 12 de Febrero 2026
-- Descripción: Añade el equipamiento Isofix en la categoría de Conducción y Seguridad
-- =============================================

-- Insertar el equipamiento Isofix
-- La categoría 'seguridad' se muestra como "Conducción" en el admin (ver equipamiento/page.tsx línea 34)
INSERT INTO equipment (name, slug, icon, category, is_standard, sort_order, description) 
VALUES (
    'Isofix',                           -- Nombre del equipamiento
    'isofix',                           -- Slug único
    'Baby',                             -- Icono de Lucide (icono de bebé)
    'seguridad',                        -- Categoría: Conducción y Seguridad
    false,                              -- No es estándar (no todos los vehículos lo tienen)
    44,                                 -- Sort order (después del último de seguridad que es 43)
    'Anclajes Isofix para sillas de bebé'  -- Descripción
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    is_standard = EXCLUDED.is_standard,
    sort_order = EXCLUDED.sort_order,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Verificar la inserción
SELECT 
    id,
    name,
    slug,
    icon,
    category,
    is_standard,
    sort_order,
    description,
    is_active,
    created_at
FROM equipment 
WHERE slug = 'isofix';

-- =============================================
-- NOTAS:
-- =============================================
-- 1. El equipamiento se añadirá a la categoría "Conducción" (que internamente es 'seguridad')
-- 2. El icono 'Baby' es de la librería Lucide (debe añadirse a AVAILABLE_ICONS si no está)
-- 3. El sort_order 44 lo coloca después del último equipamiento de seguridad actual (43)
-- 4. is_standard = false porque no todos los vehículos tienen Isofix
-- 5. Una vez creado, podrás asignarlo a los vehículos desde:
--    - Panel Admin → Vehículos → [Editar vehículo] → Sección Equipamiento
-- 6. El icono 'Baby' necesita ser añadido a AVAILABLE_ICONS en:
--    src/app/administrator/(protected)/equipamiento/page.tsx
