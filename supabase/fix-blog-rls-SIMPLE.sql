-- ============================================================
-- SOLUCIÓN SIMPLE: Solo Políticas RLS del Blog
-- ============================================================
-- Este script solo corrige las políticas RLS sin modificar datos
-- Es la opción más segura si solo quieres habilitar el acceso público
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
-- CONTENT_TAGS
-- ==========================================
DROP POLICY IF EXISTS "Tags visibles" ON content_tags;
DROP POLICY IF EXISTS "public_tags_select" ON content_tags;
DROP POLICY IF EXISTS "admin_tags_all" ON content_tags;

CREATE POLICY "public_tags_select" 
ON content_tags FOR SELECT TO public
USING (true);

CREATE POLICY "admin_tags_all" 
ON content_tags FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);

-- ==========================================
-- Verificar políticas creadas
-- ==========================================
SELECT 
    tablename as "Tabla",
    policyname as "Política",
    cmd as "Comando"
FROM pg_policies 
WHERE tablename IN ('posts', 'content_categories', 'content_tags')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- Contar posts que ahora son visibles
-- ==========================================
SELECT 
    COUNT(*) as total_posts,
    COUNT(*) FILTER (WHERE status = 'published') as posts_visibles
FROM posts;

SELECT '✅ Políticas RLS actualizadas correctamente' as resultado;
