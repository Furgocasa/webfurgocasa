-- =====================================================
-- ENCOLAR TODO EL CONTENIDO EXISTENTE PARA TRADUCCIÓN
-- =====================================================
-- Ejecutar DESPUÉS de create-translations-system.sql
-- Esto llena la cola translation_queue con todo el contenido
-- =====================================================

-- 1. ENCOLAR POSTS (usa status = 'published', no is_published)
-- =====================================================
INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'posts', id, 'title', title, locale
FROM posts CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE status = 'published' AND title IS NOT NULL AND title != ''
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'posts', id, 'excerpt', excerpt, locale
FROM posts CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE status = 'published' AND excerpt IS NOT NULL AND excerpt != ''
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'posts', id, 'content', content, locale
FROM posts CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE status = 'published' AND content IS NOT NULL AND content != ''
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'posts', id, 'meta_title', meta_title, locale
FROM posts CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE status = 'published' AND meta_title IS NOT NULL AND meta_title != ''
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'posts', id, 'meta_description', meta_description, locale
FROM posts CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE status = 'published' AND meta_description IS NOT NULL AND meta_description != ''
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

-- 2. ENCOLAR VEHICLES
-- =====================================================
INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'vehicles', id, 'name', name, locale
FROM vehicles CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND name IS NOT NULL AND name != ''
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'vehicles', id, 'description', description, locale
FROM vehicles CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND description IS NOT NULL AND description != ''
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'vehicles', id, 'short_description', short_description, locale
FROM vehicles CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND short_description IS NOT NULL AND short_description != ''
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

-- 3. ENCOLAR LOCATION_TARGETS
-- =====================================================
INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'location_targets', id, 'name', name, locale
FROM location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND name IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'location_targets', id, 'meta_title', meta_title, locale
FROM location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND meta_title IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'location_targets', id, 'meta_description', meta_description, locale
FROM location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND meta_description IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'location_targets', id, 'h1_title', h1_title, locale
FROM location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND h1_title IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'location_targets', id, 'intro_text', intro_text, locale
FROM location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND intro_text IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

-- 4. ENCOLAR SALE_LOCATION_TARGETS
-- =====================================================
INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'sale_location_targets', id, 'name', name, locale
FROM sale_location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND name IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'sale_location_targets', id, 'meta_title', meta_title, locale
FROM sale_location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND meta_title IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'sale_location_targets', id, 'meta_description', meta_description, locale
FROM sale_location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND meta_description IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'sale_location_targets', id, 'h1_title', h1_title, locale
FROM sale_location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND h1_title IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'sale_location_targets', id, 'intro_text', intro_text, locale
FROM sale_location_targets CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND intro_text IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

-- 5. ENCOLAR VEHICLE_CATEGORIES
-- =====================================================
INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'vehicle_categories', id, 'name', name, locale
FROM vehicle_categories CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND name IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'vehicle_categories', id, 'description', description, locale
FROM vehicle_categories CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE is_active = true AND description IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

-- 6. ENCOLAR CONTENT_CATEGORIES (Blog)
-- =====================================================
INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'content_categories', id, 'name', name, locale
FROM content_categories CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE name IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'content_categories', id, 'description', description, locale
FROM content_categories CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE description IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

-- 7. ENCOLAR EXTRAS
-- =====================================================
INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'extras', id, 'name', name, locale
FROM extras CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE name IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

INSERT INTO translation_queue (source_table, source_id, source_field, source_text, locale)
SELECT 'extras', id, 'description', description, locale
FROM extras CROSS JOIN (SELECT unnest(ARRAY['en', 'fr', 'de']) as locale) l
WHERE description IS NOT NULL
ON CONFLICT (source_table, source_id, source_field, locale) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN: Resumen de lo encolado
-- =====================================================
SELECT 
  source_table,
  locale,
  COUNT(*) as pending_count
FROM translation_queue
WHERE status = 'pending'
GROUP BY source_table, locale
ORDER BY source_table, locale;

-- Total general
SELECT 
  'TOTAL PENDIENTES' as info,
  COUNT(*) as cantidad
FROM translation_queue
WHERE status = 'pending';
