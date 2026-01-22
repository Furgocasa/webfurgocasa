-- ===================================================================
-- ASEGURAR QUE GRANADA EXISTE Y ESTÁ CORRECTAMENTE CONFIGURADA
-- ===================================================================
-- Este script asegura que Granada existe en sale_location_targets
-- con todos los campos correctos
-- ===================================================================

DO $$
DECLARE
  murcia_location_id UUID;
  granada_exists BOOLEAN;
BEGIN
  -- Obtener ID de Murcia (sede física más cercana)
  SELECT id INTO murcia_location_id 
  FROM locations 
  WHERE city = 'Murcia' 
  LIMIT 1;

  -- Verificar si Granada ya existe
  SELECT EXISTS(
    SELECT 1 FROM sale_location_targets WHERE slug = 'granada'
  ) INTO granada_exists;

  IF granada_exists THEN
    -- Actualizar Granada si ya existe
    UPDATE sale_location_targets
    SET
      name = 'Granada',
      province = 'Granada',
      region = 'Andalucía',
      nearest_location_id = murcia_location_id,
      distance_km = 370,
      travel_time_minutes = 240,
      meta_title = 'Venta de Autocaravanas en Granada',
      meta_description = 'Compra tu autocaravana en Granada. Entrega desde Murcia. Stock disponible y financiación.',
      h1_title = 'Venta de Autocaravanas en Granada',
      intro_text = 'Encuentra tu autocaravana ideal para Granada y Sierra Nevada.',
      is_active = true,
      display_order = 31,
      updated_at = NOW()
    WHERE slug = 'granada';
    
    RAISE NOTICE '✅ Granada actualizada correctamente';
  ELSE
    -- Insertar Granada si no existe
    INSERT INTO sale_location_targets (
      slug, name, province, region,
      nearest_location_id, distance_km, travel_time_minutes,
      meta_title, meta_description, h1_title,
      intro_text, display_order, is_active
    ) VALUES (
      'granada',
      'Granada',
      'Granada',
      'Andalucía',
      murcia_location_id,
      370,
      240,
      'Venta de Autocaravanas en Granada',
      'Compra tu autocaravana en Granada. Entrega desde Murcia. Stock disponible y financiación.',
      'Venta de Autocaravanas en Granada',
      'Encuentra tu autocaravana ideal para Granada y Sierra Nevada.',
      31,
      true
    );
    
    RAISE NOTICE '✅ Granada insertada correctamente';
  END IF;

  -- Verificar el resultado
  IF EXISTS(SELECT 1 FROM sale_location_targets WHERE slug = 'granada' AND is_active = true) THEN
    RAISE NOTICE '✅ Verificación: Granada existe y está activa';
  ELSE
    RAISE EXCEPTION '❌ Error: Granada no se pudo crear o activar';
  END IF;
END $$;

-- Mostrar el resultado final
SELECT 
  '=== GRANADA - ESTADO FINAL ===' as seccion,
  slug,
  name,
  province,
  region,
  meta_title,
  is_active,
  display_order,
  CASE 
    WHEN slug = 'granada' 
         AND is_active = true 
         AND meta_title IS NOT NULL 
         AND meta_title NOT LIKE '%| Furgocasa%'
         AND meta_title NOT LIKE '%- Furgocasa%'
    THEN '✅ TODO CORRECTO'
    ELSE '❌ REVISAR'
  END as estado
FROM sale_location_targets
WHERE slug = 'granada';
