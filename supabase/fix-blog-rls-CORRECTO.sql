-- ============================================================
-- SOLUCIÓN DEFINITIVA: Políticas RLS del Blog
-- ============================================================
-- Este script corrige SOLO las políticas RLS existentes
-- Usa los nombres correctos de las tablas en tu base de datos
-- ============================================================

-- ==========================================
-- POSTS
-- ==========================================
DROP POLICY IF EXISTS "Posts publicados visibles" ON posts;
DROP POLICY IF EXISTS "Posts publicados visibles públicamente" ON posts;
DROP POLICY IF EXISTS "public_posts_select" ON posts;
DROP POLICY IF EXISTS "admin_posts_all" ON posts;

CREATE POLICY "public_posts_select" 
ON posts FOR SELECT TO public
USING (status = 'published');

CREATE POLICY "admin_posts_all" 
ON posts FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);

-- ==========================================
-- CONTENT_CATEGORIES
-- ==========================================
DROP POLICY IF EXISTS "Categorías activas visibles" ON content_categories;
DROP POLICY IF EXISTS "Categorías de contenido visibles públicamente" ON content_categories;
DROP POLICY IF EXISTS "public_categories_select" ON content_categories;
DROP POLICY IF EXISTS "admin_categories_all" ON content_categories;

CREATE POLICY "public_categories_select" 
ON content_categories FOR SELECT TO public
USING (is_active = true);

CREATE POLICY "admin_categories_all" 
ON content_categories FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);

-- ==========================================
-- TAGS (la tabla se llama "tags", no "content_tags")
-- ==========================================
DROP POLICY IF EXISTS "Tags visibles" ON tags;
DROP POLICY IF EXISTS "public_tags_select" ON tags;
DROP POLICY IF EXISTS "admin_tags_all" ON tags;

CREATE POLICY "public_tags_select" 
ON tags FOR SELECT TO public
USING (true);

CREATE POLICY "admin_tags_all" 
ON tags FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);

-- ==========================================
-- POST_TAGS (relación muchos a muchos)
-- ==========================================
DROP POLICY IF EXISTS "public_post_tags_select" ON post_tags;
DROP POLICY IF EXISTS "admin_post_tags_all" ON post_tags;

CREATE POLICY "public_post_tags_select" 
ON post_tags FOR SELECT TO public
USING (true);

CREATE POLICY "admin_post_tags_all" 
ON post_tags FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);

-- ==========================================
-- COMMENTS (si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Comentarios aprobados visibles" ON comments';
    EXECUTE 'DROP POLICY IF EXISTS "public_comments_select" ON comments';
    EXECUTE 'DROP POLICY IF EXISTS "admin_comments_all" ON comments';

    EXECUTE 'CREATE POLICY "public_comments_select" ON comments FOR SELECT TO public USING (status = ''approved'')';
    
    EXECUTE 'CREATE POLICY "admin_comments_all" ON comments FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE '✓ Políticas creadas para comments';
  ELSE
    RAISE NOTICE '⚠ Tabla comments no existe';
  END IF;
END $$;

-- ==========================================
-- MEDIA (si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'media') THEN
    EXECUTE 'DROP POLICY IF EXISTS "public_media_select" ON media';
    EXECUTE 'DROP POLICY IF EXISTS "admin_media_all" ON media';

    EXECUTE 'CREATE POLICY "public_media_select" ON media FOR SELECT TO public USING (true)';
    
    EXECUTE 'CREATE POLICY "admin_media_all" ON media FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE '✓ Políticas creadas para media';
  ELSE
    RAISE NOTICE '⚠ Tabla media no existe';
  END IF;
END $$;

-- ==========================================
-- Verificar políticas creadas
-- ==========================================
SELECT 
    tablename as "Tabla",
    policyname as "Política",
    cmd as "Tipo"
FROM pg_policies 
WHERE tablename IN ('posts', 'content_categories', 'tags', 'post_tags', 'comments', 'media')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- Verificar RLS habilitado
-- ==========================================
SELECT 
    tablename as "Tabla",
    CASE 
        WHEN rowsecurity THEN '✓ RLS Activo' 
        ELSE '✗ RLS Inactivo' 
    END as "Estado"
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('posts', 'content_categories', 'tags', 'post_tags')
ORDER BY tablename;

-- ==========================================
-- Contar posts visibles
-- ==========================================
SELECT 
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE status = 'published') as posts_publicados,
    COUNT(*) FILTER (WHERE status = 'draft') as borradores
FROM posts;

-- ==========================================
-- Ver categorías activas
-- ==========================================
SELECT 
    name,
    slug,
    CASE WHEN is_active THEN '✓ Activa' ELSE '✗ Inactiva' END as estado
FROM content_categories
ORDER BY name;

-- Mensaje final
SELECT '✅ Políticas RLS configuradas correctamente' as resultado;
