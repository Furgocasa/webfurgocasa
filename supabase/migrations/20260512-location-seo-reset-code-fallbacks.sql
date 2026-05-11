-- =============================================================================
-- SEO landings por ciudad (alquiler + venta): alinear con plantillas del código
-- =============================================================================
--
-- CÓMO RESUELVE LA APP EL TEXTO (resumen):
--
-- 1) Tabla base: location_targets (alquiler) / sale_location_targets (venta)
--    Campos típicos: name, h1_title, meta_title, meta_description, intro_text,
--    content_sections, …
--
-- 2) Para /en, /fr, /de: getTranslatedContent() parte del registro base y
--    SOBRESCRIBE con filas de content_translations (mismo source_id, locale).
--
-- 3) Si meta_title / meta_description / h1_title están rellenados en la tabla
--    base en español, y NO hay traducción en content_translations para EN/FR/DE,
--    esos mismos valores españoles se usan también en inglés/francés/alemán.
--    Las plantillas nuevas del código (fallbacks) solo aplican si esos campos
--    quedan NULL en BD (y no hay traducción que los pise).
--
-- 4) Venta: intro_text del hero ya puede ir a código tras
--    20260511-sale-location-intro-reset.sql. Este script NO toca intro_text ni
--    content_sections (solo títulos/metas cortas).
--
-- QUÉ HACE ESTE SQL:
-- - Pone a NULL h1_title, meta_title, meta_description en destinos activos
--   (alquiler y venta).
-- - Borra traducciones huérfanas o antiguas de esos campos para que no sigan
--   mandando sobre el español base.
--
-- DESPUÉS DE EJECUTAR:
-- - Alquiler ES: H1/meta del código (ej. “Alquiler de campers y autocaravanas…”).
-- - Alquiler EN/FR/DE: plantillas en cada page.tsx (motorhome/campervan, fourgons,
--   Wohnmobil/Campervan, etc.).
-- - Venta ES/EN/FR/DE: defaults de sale-location-seo-copy.ts para meta/H1.
--
-- Si necesitáis conservar SEO manual solo en algunas ciudades, no ejecutéis el
-- UPDATE global; usad WHERE slug IN (...) o NULL solamente las filas deseadas.
--
-- NOTA: Si meta_title (u otros) tienen NOT NULL en BD, el UPDATE falla con 23502.
-- Por eso primero se permite NULL en esas columnas.
--
-- =============================================================================

-- Permitir NULL para que el SEO corto lo genere la app (plantillas por idioma)
ALTER TABLE location_targets
  ALTER COLUMN h1_title DROP NOT NULL,
  ALTER COLUMN meta_title DROP NOT NULL,
  ALTER COLUMN meta_description DROP NOT NULL;

ALTER TABLE sale_location_targets
  ALTER COLUMN h1_title DROP NOT NULL,
  ALTER COLUMN meta_title DROP NOT NULL,
  ALTER COLUMN meta_description DROP NOT NULL;

-- Alquiler por ciudad
UPDATE location_targets
SET
  h1_title = NULL,
  meta_title = NULL,
  meta_description = NULL
WHERE is_active = true;

DELETE FROM content_translations
WHERE source_table = 'location_targets'
  AND source_field IN ('h1_title', 'meta_title', 'meta_description');

-- Venta por ciudad (intro_text: migración aparte si debe ir solo por código)
UPDATE sale_location_targets
SET
  h1_title = NULL,
  meta_title = NULL,
  meta_description = NULL
WHERE is_active = true;

DELETE FROM content_translations
WHERE source_table = 'sale_location_targets'
  AND source_field IN ('h1_title', 'meta_title', 'meta_description');
