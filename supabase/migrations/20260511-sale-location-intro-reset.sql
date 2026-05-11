-- Landings venta por ciudad: el intro del hero pasa a generarse en código (sale-location-seo-copy.ts),
-- con mensaje alineado al modelo de negocio (flota de alquiler renovada, venta ~2 años).
-- Ejecutar en Supabase si el intro_text antiguo sigue mostrando copy genérico en producción.

UPDATE sale_location_targets
SET intro_text = NULL
WHERE is_active = true;

DELETE FROM content_translations
WHERE source_table = 'sale_location_targets'
  AND source_field = 'intro_text';
