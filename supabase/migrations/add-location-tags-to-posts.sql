-- Añadir location_tags a posts para mostrar artículos relevantes por destino
-- Array de slugs de location_targets: ["murcia", "cartagena", "lorca"]
-- En la landing de Murcia se mostrarán artículos con "murcia" en location_tags
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS location_tags JSONB DEFAULT '[]';

COMMENT ON COLUMN posts.location_tags IS 'Slugs de location_targets relacionados (ej: murcia, cartagena). Para mostrar rutas relevantes en cada destino.';
