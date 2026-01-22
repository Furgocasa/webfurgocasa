-- ===================================================================
-- VERIFICACIÓN RÁPIDA: Estado de sale_location_targets
-- ===================================================================
-- Este script solo lee datos, NO hace cambios
-- Útil para verificar el estado antes y después de correcciones
-- ===================================================================

-- 1. Resumen general
SELECT 
  '=== RESUMEN GENERAL ===' as informe,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE is_active = true) as activos,
  COUNT(*) FILTER (WHERE is_active = false) as inactivos,
  COUNT(*) FILTER (WHERE meta_title IS NULL OR meta_title = '') as sin_meta_title,
  COUNT(*) FILTER (WHERE meta_title LIKE '%| Furgocasa%' OR meta_title LIKE '%- Furgocasa%') as con_sufijo_furgocasa,
  COUNT(*) FILTER (WHERE slug != LOWER(TRIM(slug))) as slugs_sin_normalizar
FROM sale_location_targets;

-- 2. Granada específicamente
SELECT 
  '=== GRANADA ===' as informe,
  slug,
  name,
  province,
  region,
  meta_title,
  h1_title,
  is_active,
  display_order,
  CASE 
    WHEN slug = 'granada' AND is_active = true AND meta_title IS NOT NULL THEN '✅ Existe y está activa'
    WHEN slug != 'granada' THEN '❌ Slug incorrecto: ' || slug
    WHEN is_active = false THEN '❌ Está inactiva'
    WHEN meta_title IS NULL OR meta_title = '' THEN '❌ Meta title vacío'
    ELSE '⚠️ Revisar'
  END as estado
FROM sale_location_targets
WHERE slug = 'granada' OR name ILIKE '%granada%';

-- 3. Todas las ciudades activas con sus meta_titles
SELECT 
  '=== TODAS LAS CIUDADES ACTIVAS ===' as informe,
  slug,
  name,
  province,
  meta_title,
  CASE 
    WHEN meta_title LIKE '%| Furgocasa%' OR meta_title LIKE '%- Furgocasa%' THEN '❌ Tiene sufijo Furgocasa'
    WHEN meta_title IS NULL OR meta_title = '' THEN '❌ Vacío'
    ELSE '✅ OK'
  END as meta_title_estado,
  is_active
FROM sale_location_targets
WHERE is_active = true
ORDER BY display_order, name;

-- 4. Ciudades problemáticas (las más visitadas según analytics)
SELECT 
  '=== CIUDADES PRINCIPALES ===' as informe,
  slug,
  name,
  meta_title,
  is_active,
  CASE 
    WHEN slug IN ('granada', 'malaga', 'almeria', 'valencia', 'madrid', 'alicante', 'murcia', 'cartagena')
         AND is_active = true 
         AND meta_title IS NOT NULL 
         AND meta_title NOT LIKE '%| Furgocasa%'
         AND meta_title NOT LIKE '%- Furgocasa%'
    THEN '✅ OK'
    ELSE '❌ Revisar'
  END as estado
FROM sale_location_targets
WHERE slug IN ('granada', 'malaga', 'almeria', 'valencia', 'madrid', 'alicante', 'murcia', 'cartagena')
ORDER BY 
  CASE slug
    WHEN 'granada' THEN 1
    WHEN 'malaga' THEN 2
    WHEN 'almeria' THEN 3
    WHEN 'valencia' THEN 4
    WHEN 'madrid' THEN 5
    WHEN 'alicante' THEN 6
    WHEN 'murcia' THEN 7
    WHEN 'cartagena' THEN 8
  END;

-- 5. Registros con problemas detectados
SELECT 
  '=== REGISTROS CON PROBLEMAS ===' as informe,
  slug,
  name,
  meta_title,
  CASE 
    WHEN meta_title LIKE '%| Furgocasa%' OR meta_title LIKE '%- Furgocasa%' THEN 'Tiene sufijo Furgocasa'
    WHEN meta_title IS NULL OR meta_title = '' THEN 'Meta title vacío'
    WHEN slug != LOWER(TRIM(slug)) THEN 'Slug sin normalizar'
    WHEN is_active = false THEN 'Inactivo'
    ELSE 'Otro problema'
  END as problema
FROM sale_location_targets
WHERE 
  meta_title LIKE '%| Furgocasa%' 
  OR meta_title LIKE '%- Furgocasa%'
  OR meta_title IS NULL 
  OR meta_title = ''
  OR slug != LOWER(TRIM(slug))
  OR is_active = false
ORDER BY name;
