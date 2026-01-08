-- Agregar campos para contenido generado por IA
-- Ejecutar en Supabase SQL Editor

-- Agregar campo para contenido largo y estructurado
ALTER TABLE location_targets
ADD COLUMN IF NOT EXISTS content_sections JSONB DEFAULT '{
  "introduction": "",
  "attractions": [],
  "parking_areas": [],
  "routes": [],
  "gastronomy": "",
  "practical_tips": ""
}'::jsonb;

-- Agregar campo para imágenes destacadas
ALTER TABLE location_targets
ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Agregar metadatos de contenido
ALTER TABLE location_targets
ADD COLUMN IF NOT EXISTS content_generated_at TIMESTAMPTZ;

ALTER TABLE location_targets
ADD COLUMN IF NOT EXISTS content_word_count INTEGER DEFAULT 0;

-- Comentarios
COMMENT ON COLUMN location_targets.content_sections IS 'Contenido estructurado generado por IA: introducción, atracciones, áreas de pernocta, rutas, gastronomía, consejos';
COMMENT ON COLUMN location_targets.featured_image IS 'URL de imagen destacada de la ciudad';
COMMENT ON COLUMN location_targets.content_generated_at IS 'Fecha de generación del contenido IA';
COMMENT ON COLUMN location_targets.content_word_count IS 'Número de palabras del contenido total';

-- Verificar
SELECT id, name, slug, 
       intro_text IS NOT NULL as has_intro,
       content_sections::text as content_preview
FROM location_targets 
WHERE is_active = true
LIMIT 5;
