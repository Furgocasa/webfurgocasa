-- ===================================================================
-- FIX: Verificación y corrección completa de sale_location_targets
-- ===================================================================
-- PROBLEMA: Los meta_title pueden tener formato incorrecto con "| Furgocasa" o " - Furgocasa"
-- FORMATO CORRECTO: "Venta de Autocaravanas en [Ciudad]" o "Venta de Autocaravanas en [Ciudad] | Entrega desde [Ciudad]"
-- NOTA: El " - Furgocasa" se agrega automáticamente a nivel de layout.tsx
-- ===================================================================

-- ===================================================================
-- 1. VERIFICACIÓN INICIAL: Ver todos los registros actuales
-- ===================================================================
SELECT 
  '=== REGISTROS ACTUALES ===' as seccion,
  slug,
  name,
  province,
  region,
  meta_title,
  is_active,
  LENGTH(meta_title) as title_length,
  CASE 
    WHEN meta_title LIKE '%| Furgocasa%' OR meta_title LIKE '%- Furgocasa%' THEN '❌ Tiene sufijo Furgocasa'
    WHEN meta_title IS NULL OR meta_title = '' THEN '❌ Meta title vacío'
    WHEN slug != LOWER(TRIM(slug)) THEN '⚠️ Slug con mayúsculas o espacios'
    ELSE '✅ OK'
  END as estado
FROM sale_location_targets
ORDER BY name;

-- ===================================================================
-- 2. CORRECCIÓN: Eliminar "| Furgocasa" y " - Furgocasa" del final
-- ===================================================================
UPDATE sale_location_targets
SET 
  meta_title = TRIM(
    REGEXP_REPLACE(
      REGEXP_REPLACE(meta_title, '\s*\|\s*Furgocasa\s*$', '', 'g'),
      '\s*-\s*Furgocasa\s*$',
      '',
      'g'
    )
  ),
  updated_at = NOW()
WHERE 
  meta_title IS NOT NULL
  AND (
    meta_title LIKE '%| Furgocasa%' 
    OR meta_title LIKE '%- Furgocasa%'
    OR meta_title LIKE '%|Furgocasa%'
    OR meta_title LIKE '%-Furgocasa%'
  );

-- ===================================================================
-- 3. CORRECCIÓN: Normalizar slugs (minúsculas, sin espacios)
-- ===================================================================
UPDATE sale_location_targets
SET 
  slug = LOWER(TRIM(slug)),
  updated_at = NOW()
WHERE 
  slug != LOWER(TRIM(slug));

-- ===================================================================
-- 4. VERIFICACIÓN ESPECÍFICA: Granada y otras ciudades problemáticas
-- ===================================================================
SELECT 
  '=== VERIFICACIÓN GRANADA ===' as seccion,
  slug,
  name,
  meta_title,
  is_active,
  CASE 
    WHEN slug = 'granada' AND is_active = true AND meta_title IS NOT NULL THEN '✅ OK'
    WHEN slug != 'granada' THEN '❌ Slug incorrecto'
    WHEN is_active = false THEN '❌ Inactivo'
    WHEN meta_title IS NULL OR meta_title = '' THEN '❌ Meta title vacío'
    ELSE '⚠️ Revisar'
  END as estado
FROM sale_location_targets
WHERE slug = 'granada' OR name ILIKE '%granada%';

-- ===================================================================
-- 5. REPORTE FINAL: Todos los registros activos
-- ===================================================================
SELECT 
  '=== REPORTE FINAL ===' as seccion,
  slug,
  name,
  province,
  region,
  meta_title,
  CASE 
    WHEN meta_title LIKE '%| Furgocasa%' OR meta_title LIKE '%- Furgocasa%' THEN '❌ Aún tiene sufijo'
    WHEN meta_title IS NULL OR meta_title = '' THEN '❌ Vacío'
    ELSE '✅ Correcto'
  END as meta_title_estado,
  is_active,
  display_order
FROM sale_location_targets
WHERE is_active = true
ORDER BY display_order, name;

-- ===================================================================
-- 6. CONTEO Y RESUMEN
-- ===================================================================
SELECT 
  '=== RESUMEN ===' as seccion,
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE is_active = true) as activos,
  COUNT(*) FILTER (WHERE is_active = false) as inactivos,
  COUNT(*) FILTER (WHERE meta_title IS NULL OR meta_title = '') as sin_meta_title,
  COUNT(*) FILTER (WHERE meta_title LIKE '%| Furgocasa%' OR meta_title LIKE '%- Furgocasa%') as con_sufijo_furgocasa,
  COUNT(*) FILTER (WHERE slug != LOWER(TRIM(slug))) as slugs_sin_normalizar
FROM sale_location_targets;

-- ===================================================================
-- 7. VERIFICACIÓN ESPECÍFICA: Ciudades mencionadas en el problema
-- ===================================================================
SELECT 
  '=== CIUDADES PROBLEMÁTICAS ===' as seccion,
  slug,
  name,
  meta_title,
  is_active,
  CASE 
    WHEN slug IN ('granada', 'malaga', 'almeria', 'valencia', 'madrid', 'alicante') 
         AND is_active = true 
         AND meta_title IS NOT NULL 
         AND meta_title NOT LIKE '%| Furgocasa%'
         AND meta_title NOT LIKE '%- Furgocasa%'
    THEN '✅ OK'
    ELSE '❌ Revisar'
  END as estado
FROM sale_location_targets
WHERE slug IN ('granada', 'malaga', 'almeria', 'valencia', 'madrid', 'alicante')
ORDER BY slug;

-- ===================================================================
-- RESULTADO ESPERADO DESPUÉS DE LA CORRECCIÓN:
-- Granada: "Venta de Autocaravanas en Granada" o "Venta de Autocaravanas en Granada | Entrega desde Murcia"
-- (SIN "| Furgocasa" o " - Furgocasa" al final)
-- ===================================================================
