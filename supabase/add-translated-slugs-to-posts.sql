-- ============================================================================
-- MIGRACIÓN: Añadir slugs traducidos a la tabla posts
-- Fecha: 2026-01-24
-- Descripción: Añade campos slug_en, slug_fr, slug_de para URLs multiidioma
-- ============================================================================

-- 1. Añadir columnas para slugs traducidos
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS slug_en VARCHAR(300),
ADD COLUMN IF NOT EXISTS slug_fr VARCHAR(300),
ADD COLUMN IF NOT EXISTS slug_de VARCHAR(300);

-- 2. Crear índices únicos para cada slug traducido (permitiendo nulls)
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug_en ON posts(slug_en) WHERE slug_en IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug_fr ON posts(slug_fr) WHERE slug_fr IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug_de ON posts(slug_de) WHERE slug_de IS NOT NULL;

-- 3. Añadir comentarios descriptivos
COMMENT ON COLUMN posts.slug_en IS 'Slug traducido al inglés para URLs /en/blog/...';
COMMENT ON COLUMN posts.slug_fr IS 'Slug traducido al francés para URLs /fr/blog/...';
COMMENT ON COLUMN posts.slug_de IS 'Slug traducido al alemán para URLs /de/blog/...';

-- 4. Verificar que las columnas se crearon correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('slug', 'slug_en', 'slug_fr', 'slug_de')
ORDER BY column_name;

-- ============================================================================
-- NOTAS DE USO:
-- ============================================================================
-- 
-- 1. El slug principal (campo 'slug') sigue siendo el español
-- 2. Los slugs traducidos son OPCIONALES (pueden ser NULL)
-- 3. Si un slug traducido es NULL, el sistema usará el slug español
-- 
-- Ejemplo de uso en el código:
--   const slugToUse = post.slug_fr || post.slug; // Francés o fallback a español
--
-- Para rellenar los slugs traducidos manualmente desde el panel admin:
--   UPDATE posts SET slug_en = 'my-english-slug' WHERE slug = 'mi-slug-espanol';
--
-- ============================================================================
