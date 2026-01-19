-- ============================================================
-- CORREGIR POLÍTICAS RLS PARA TABLAS DEL BLOG
-- ============================================================
-- Este script corrige las políticas de Row Level Security (RLS) 
-- para permitir el acceso público a los artículos del blog
-- ============================================================

-- ==========================================
-- POSTS (BLOG)
-- ==========================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Posts publicados visibles" ON posts;
DROP POLICY IF EXISTS "Posts publicados visibles públicamente" ON posts;
DROP POLICY IF EXISTS "public_posts_select" ON posts;
DROP POLICY IF EXISTS "admin_posts_all" ON posts;

-- Política para lectura pública: posts con status 'published'
-- IMPORTANTE: Removemos la condición de published_at <= NOW() 
-- ya que puede causar problemas si las fechas están en el futuro
CREATE POLICY "public_posts_select" 
ON posts 
FOR SELECT 
TO public
USING (status = 'published');

-- Política para administradores: acceso completo
CREATE POLICY "admin_posts_all" 
ON posts 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);

-- ==========================================
-- CONTENT_CATEGORIES (Categorías del blog)
-- ==========================================

DROP POLICY IF EXISTS "Categorías activas visibles" ON content_categories;
DROP POLICY IF EXISTS "Categorías de contenido visibles públicamente" ON content_categories;
DROP POLICY IF EXISTS "public_categories_select" ON content_categories;
DROP POLICY IF EXISTS "admin_categories_all" ON content_categories;

-- Política para lectura pública
CREATE POLICY "public_categories_select" 
ON content_categories 
FOR SELECT 
TO public
USING (is_active = true);

-- Política para administradores
CREATE POLICY "admin_categories_all" 
ON content_categories 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);

-- ==========================================
-- CONTENT_TAGS (Etiquetas del blog)
-- ==========================================

DROP POLICY IF EXISTS "Tags visibles" ON content_tags;
DROP POLICY IF EXISTS "public_tags_select" ON content_tags;
DROP POLICY IF EXISTS "admin_tags_all" ON content_tags;

-- Política para lectura pública: todas las tags
CREATE POLICY "public_tags_select" 
ON content_tags 
FOR SELECT 
TO public
USING (true);

-- Política para administradores
CREATE POLICY "admin_tags_all" 
ON content_tags 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);

-- ==========================================
-- POST_TAGS (Relación posts-tags) - solo si existe
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'post_tags') THEN
    EXECUTE 'DROP POLICY IF EXISTS "public_post_tags_select" ON post_tags';
    EXECUTE 'DROP POLICY IF EXISTS "admin_post_tags_all" ON post_tags';

    -- Política para lectura pública
    EXECUTE 'CREATE POLICY "public_post_tags_select" ON post_tags FOR SELECT TO public USING (true)';
    
    -- Política para administradores
    EXECUTE 'CREATE POLICY "admin_post_tags_all" ON post_tags FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE '✓ Políticas creadas para post_tags';
  ELSE
    RAISE NOTICE '⚠ Tabla post_tags no existe, saltando...';
  END IF;
END $$;

-- ==========================================
-- COMMENTS (Comentarios del blog) - solo si existe
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Comentarios aprobados visibles" ON comments';
    EXECUTE 'DROP POLICY IF EXISTS "public_comments_select" ON comments';
    EXECUTE 'DROP POLICY IF EXISTS "admin_comments_all" ON comments';

    -- Política para lectura pública: solo comentarios aprobados
    EXECUTE 'CREATE POLICY "public_comments_select" ON comments FOR SELECT TO public USING (status = ''approved'')';
    
    -- Política para administradores
    EXECUTE 'CREATE POLICY "admin_comments_all" ON comments FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE '✓ Políticas creadas para comments';
  ELSE
    RAISE NOTICE '⚠ Tabla comments no existe, saltando...';
  END IF;
END $$;

-- ==========================================
-- MEDIA (Archivos multimedia) - solo si existe
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'media') THEN
    EXECUTE 'DROP POLICY IF EXISTS "public_media_select" ON media';
    EXECUTE 'DROP POLICY IF EXISTS "admin_media_all" ON media';

    -- Política para lectura pública: todos los archivos
    EXECUTE 'CREATE POLICY "public_media_select" ON media FOR SELECT TO public USING (true)';
    
    -- Política para administradores
    EXECUTE 'CREATE POLICY "admin_media_all" ON media FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE '✓ Políticas creadas para media';
  ELSE
    RAISE NOTICE '⚠ Tabla media no existe, saltando...';
  END IF;
END $$;

-- ==========================================
-- Verificar políticas creadas
-- ==========================================
SELECT 
    '✓ Política activa: ' || tablename || '.' || policyname as "Políticas RLS del Blog",
    'Comando: ' || cmd as "Tipo",
    'Roles: ' || array_to_string(roles, ', ') as "Para"
FROM pg_policies 
WHERE tablename IN ('posts', 'content_categories', 'content_tags', 'post_tags', 'comments', 'media')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- Verificar que RLS está habilitado
-- ==========================================
SELECT 
    tablename as "Tabla",
    CASE 
        WHEN rowsecurity THEN '✓ Habilitado' 
        ELSE '✗ Deshabilitado' 
    END as "RLS"
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('posts', 'content_categories', 'content_tags', 'post_tags', 'comments', 'media')
ORDER BY tablename;

-- ==========================================
-- Contar posts disponibles
-- ==========================================
SELECT 
    COUNT(*) as "Total Posts",
    COUNT(*) FILTER (WHERE status = 'published') as "Posts Publicados",
    COUNT(*) FILTER (WHERE status = 'draft') as "Borradores"
FROM posts;

-- ==========================================
-- Verificar categorías activas
-- ==========================================
SELECT 
    name as "Categoría",
    slug as "Slug",
    CASE 
        WHEN is_active THEN '✓ Activa' 
        ELSE '✗ Inactiva' 
    END as "Estado"
FROM content_categories
ORDER BY name;

-- ==========================================
-- Mensaje final
-- ==========================================
DO $$ 
BEGIN
    RAISE NOTICE '
============================================================
✓ POLÍTICAS RLS DEL BLOG ACTUALIZADAS CORRECTAMENTE
============================================================
Las políticas ahora permiten:
  • Acceso público a posts con status = ''published''
  • Acceso público a categorías activas (is_active = true)
  • Acceso público a todas las etiquetas
  • Acceso completo para administradores autenticados

IMPORTANTE: Si aún no ves los posts en el frontend:
  1. Verifica que los posts tengan status = ''published''
  2. Verifica que las categorías tengan is_active = true
  3. Revisa la consola del navegador para ver errores
============================================================
    ';
END $$;
