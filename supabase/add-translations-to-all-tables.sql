-- =====================================================
-- MIGRACIÓN COMPLETA: Agregar campos de traducción
-- a todas las tablas relevantes
-- =====================================================
-- Ejecutar este SQL en Supabase SQL Editor
-- Fecha: 21 de Enero, 2026

-- =====================================================
-- 1. TABLA: vehicles
-- =====================================================
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS short_description_en TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vehicles_name_en ON vehicles(name_en);
CREATE INDEX IF NOT EXISTS idx_vehicles_slug_en ON vehicles(slug_en);

-- Comentarios
COMMENT ON COLUMN vehicles.name_en IS 'Nombre del vehículo en inglés';
COMMENT ON COLUMN vehicles.description_en IS 'Descripción completa del vehículo en inglés';
COMMENT ON COLUMN vehicles.short_description_en IS 'Descripción corta del vehículo en inglés';
COMMENT ON COLUMN vehicles.slug_en IS 'Slug URL del vehículo en inglés';

-- =====================================================
-- 2. TABLA: vehicle_categories
-- =====================================================
ALTER TABLE vehicle_categories 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vehicle_categories_name_en ON vehicle_categories(name_en);
CREATE INDEX IF NOT EXISTS idx_vehicle_categories_slug_en ON vehicle_categories(slug_en);

-- Comentarios
COMMENT ON COLUMN vehicle_categories.name_en IS 'Nombre de la categoría en inglés';
COMMENT ON COLUMN vehicle_categories.description_en IS 'Descripción de la categoría en inglés';
COMMENT ON COLUMN vehicle_categories.slug_en IS 'Slug URL de la categoría en inglés';

-- =====================================================
-- 3. TABLA: extras
-- =====================================================
ALTER TABLE extras 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_extras_name_en ON extras(name_en);

-- Comentarios
COMMENT ON COLUMN extras.name_en IS 'Nombre del extra en inglés';
COMMENT ON COLUMN extras.description_en IS 'Descripción del extra en inglés';

-- =====================================================
-- 4. TABLA: equipment
-- =====================================================
ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_equipment_name_en ON equipment(name_en);
CREATE INDEX IF NOT EXISTS idx_equipment_slug_en ON equipment(slug_en);

-- Comentarios
COMMENT ON COLUMN equipment.name_en IS 'Nombre del equipamiento en inglés';
COMMENT ON COLUMN equipment.description_en IS 'Descripción del equipamiento en inglés';
COMMENT ON COLUMN equipment.slug_en IS 'Slug URL del equipamiento en inglés';

-- =====================================================
-- 5. TABLA: content_categories (categorías de blog)
-- =====================================================
ALTER TABLE content_categories 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_content_categories_name_en ON content_categories(name_en);
CREATE INDEX IF NOT EXISTS idx_content_categories_slug_en ON content_categories(slug_en);

-- Comentarios
COMMENT ON COLUMN content_categories.name_en IS 'Nombre de la categoría de blog en inglés';
COMMENT ON COLUMN content_categories.description_en IS 'Descripción de la categoría de blog en inglés';
COMMENT ON COLUMN content_categories.slug_en IS 'Slug URL de la categoría de blog en inglés';

-- =====================================================
-- 6. TABLA: location_targets
-- =====================================================
ALTER TABLE location_targets 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
ADD COLUMN IF NOT EXISTS meta_description_en TEXT,
ADD COLUMN IF NOT EXISTS h1_title_en TEXT,
ADD COLUMN IF NOT EXISTS intro_text_en TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_location_targets_name_en ON location_targets(name_en);
CREATE INDEX IF NOT EXISTS idx_location_targets_slug_en ON location_targets(slug_en);

-- Comentarios
COMMENT ON COLUMN location_targets.name_en IS 'Nombre de la ubicación en inglés';
COMMENT ON COLUMN location_targets.meta_title_en IS 'Meta título SEO en inglés';
COMMENT ON COLUMN location_targets.meta_description_en IS 'Meta descripción SEO en inglés';
COMMENT ON COLUMN location_targets.h1_title_en IS 'Título H1 de la página en inglés';
COMMENT ON COLUMN location_targets.intro_text_en IS 'Texto introductorio en inglés';
COMMENT ON COLUMN location_targets.slug_en IS 'Slug URL de la ubicación en inglés';

-- =====================================================
-- 7. TABLA: sale_location_targets
-- =====================================================
ALTER TABLE sale_location_targets 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
ADD COLUMN IF NOT EXISTS meta_description_en TEXT,
ADD COLUMN IF NOT EXISTS h1_title_en TEXT,
ADD COLUMN IF NOT EXISTS intro_text_en TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sale_location_targets_name_en ON sale_location_targets(name_en);
CREATE INDEX IF NOT EXISTS idx_sale_location_targets_slug_en ON sale_location_targets(slug_en);

-- Comentarios
COMMENT ON COLUMN sale_location_targets.name_en IS 'Nombre de la ubicación de venta en inglés';
COMMENT ON COLUMN sale_location_targets.meta_title_en IS 'Meta título SEO en inglés';
COMMENT ON COLUMN sale_location_targets.meta_description_en IS 'Meta descripción SEO en inglés';
COMMENT ON COLUMN sale_location_targets.h1_title_en IS 'Título H1 de la página en inglés';
COMMENT ON COLUMN sale_location_targets.intro_text_en IS 'Texto introductorio en inglés';
COMMENT ON COLUMN sale_location_targets.slug_en IS 'Slug URL de la ubicación de venta en inglés';

-- =====================================================
-- 8. VERIFICACIÓN FINAL
-- =====================================================
-- Verificar que todos los campos se crearon correctamente:

SELECT 
  'vehicles' as tabla, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
AND column_name LIKE '%_en'
UNION ALL
SELECT 
  'vehicle_categories' as tabla, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicle_categories' 
AND column_name LIKE '%_en'
UNION ALL
SELECT 
  'extras' as tabla, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'extras' 
AND column_name LIKE '%_en'
UNION ALL
SELECT 
  'equipment' as tabla, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'equipment' 
AND column_name LIKE '%_en'
UNION ALL
SELECT 
  'content_categories' as tabla, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'content_categories' 
AND column_name LIKE '%_en'
UNION ALL
SELECT 
  'location_targets' as tabla, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'location_targets' 
AND column_name LIKE '%_en'
UNION ALL
SELECT 
  'sale_location_targets' as tabla, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'sale_location_targets' 
AND column_name LIKE '%_en'
ORDER BY tabla, column_name;

-- =====================================================
-- 9. SCRIPT PARA TRADUCIR CONTENIDO EXISTENTE
-- =====================================================
-- NOTA: Este script solo marca los campos como NULL inicialmente.
-- Las traducciones se pueden añadir:
-- 1. Manualmente desde el panel de administración
-- 2. Automáticamente usando IA (OpenAI API)
-- 3. Mediante un script de migración de datos

-- Ejemplo para marcar que los nombres de categorías necesitan traducción:
SELECT 
  id, 
  name, 
  name_en,
  CASE 
    WHEN name_en IS NULL THEN '❌ Necesita traducción'
    ELSE '✅ Traducido'
  END as estado_traduccion
FROM vehicle_categories
WHERE is_active = true;

-- =====================================================
-- RESUMEN
-- =====================================================
-- Campos añadidos:
-- - vehicles: name_en, description_en, short_description_en, slug_en
-- - vehicle_categories: name_en, description_en, slug_en
-- - extras: name_en, description_en
-- - equipment: name_en, description_en, slug_en
-- - content_categories: name_en, description_en, slug_en
-- - location_targets: name_en, meta_title_en, meta_description_en, h1_title_en, intro_text_en, slug_en
-- - sale_location_targets: name_en, meta_title_en, meta_description_en, h1_title_en, intro_text_en, slug_en
--
-- Total de columnas de traducción añadidas: 30+
-- =====================================================
