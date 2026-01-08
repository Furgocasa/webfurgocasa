-- =====================================================
-- MIGRACIÓN: Agregar columnas de traducción a posts
-- =====================================================
-- Ejecutar este SQL en Supabase SQL Editor

-- 1. Agregar columnas de traducción al inglés
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS excerpt_en TEXT,
ADD COLUMN IF NOT EXISTS content_en TEXT,
ADD COLUMN IF NOT EXISTS slug_en TEXT;

-- 2. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_posts_title_en ON posts(title_en);
CREATE INDEX IF NOT EXISTS idx_posts_slug_en ON posts(slug_en);

-- 3. Comentarios para documentación
COMMENT ON COLUMN posts.title_en IS 'Título del post en inglés';
COMMENT ON COLUMN posts.excerpt_en IS 'Extracto del post en inglés';
COMMENT ON COLUMN posts.content_en IS 'Contenido completo del post en inglés';
COMMENT ON COLUMN posts.slug_en IS 'Slug URL del post en inglés';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Ejecuta esto para verificar que las columnas se crearon:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name LIKE '%_en';
