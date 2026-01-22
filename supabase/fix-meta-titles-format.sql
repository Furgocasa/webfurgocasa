-- ===================================================================
-- FIX: Meta títulos con formato correcto
-- ===================================================================
-- PROBLEMA: Los meta_title en location_targets tienen formato incorrecto
-- FORMATO CORRECTO: "Alquiler de autocaravanas camper en [Ciudad]"
-- NOTA: El " - Furgocasa" se agrega automáticamente a nivel de layout
-- ===================================================================

-- ✅ Actualizar TODOS los meta_title con el formato correcto
UPDATE location_targets
SET meta_title = 'Alquiler de autocaravanas camper en ' || name
WHERE meta_title IS NOT NULL 
  OR meta_title != 'Alquiler de autocaravanas camper en ' || name;

-- ✅ Verificar los cambios
SELECT 
  slug,
  name,
  meta_title,
  LENGTH(meta_title) as title_length
FROM location_targets
WHERE is_active = true
ORDER BY name;

-- ===================================================================
-- RESULTADO ESPERADO:
-- Cartagena: "Alquiler de autocaravanas camper en Cartagena"
-- Madrid: "Alquiler de autocaravanas camper en Madrid"
-- Barcelona: "Alquiler de autocaravanas camper en Barcelona"
-- etc.
-- ===================================================================
