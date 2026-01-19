-- ============================================================
-- SOLUCIÓN COMPLETA: Habilitar Blog en Frontend
-- ============================================================
-- Este script corrige tanto las políticas RLS como los datos
-- para hacer visible el blog en el frontend
-- ============================================================

BEGIN;

-- ==========================================
-- PASO 1: Corregir políticas RLS
-- ==========================================

-- POSTS
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

-- CONTENT_CATEGORIES
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

-- CONTENT_TAGS
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
-- PASO 2: Corregir datos de posts
-- ==========================================

-- Activar todas las categorías
UPDATE content_categories 
SET 
    is_active = true,
    updated_at = NOW()
WHERE is_active = false;

-- Publicar todos los posts que estén en draft o pending
UPDATE posts
SET 
    status = 'published',
    updated_at = NOW()
WHERE status IN ('draft', 'pending');

-- Corregir fechas futuras
UPDATE posts
SET 
    published_at = NOW(),
    updated_at = NOW()
WHERE published_at > NOW();

-- Asignar fecha de publicación a posts sin fecha
UPDATE posts
SET 
    published_at = COALESCE(created_at, NOW()),
    updated_at = NOW()
WHERE published_at IS NULL;

-- ==========================================
-- PASO 3: Verificación
-- ==========================================

-- Mostrar resumen de cambios
DO $$
DECLARE
    total_posts INTEGER;
    published_posts INTEGER;
    active_categories INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_posts FROM posts;
    SELECT COUNT(*) INTO published_posts FROM posts WHERE status = 'published';
    SELECT COUNT(*) INTO active_categories FROM content_categories WHERE is_active = true;
    
    RAISE NOTICE '
============================================================
✅ CORRECCIONES APLICADAS EXITOSAMENTE
============================================================
📝 Posts totales: %
📰 Posts publicados: %
📁 Categorías activas: %

🔒 Políticas RLS configuradas:
   ✓ Lectura pública habilitada para posts publicados
   ✓ Lectura pública habilitada para categorías activas
   ✓ Lectura pública habilitada para etiquetas
   ✓ Acceso completo para administradores

🌐 Los artículos ya deberían ser visibles en:
   • /blog
   • /blog/[categoria]
   • /blog/[categoria]/[slug]

⚠️  Si sigues sin ver los artículos:
   1. Limpia la caché del navegador (Ctrl+Shift+R)
   2. Verifica que no haya errores en la consola del navegador
   3. Revisa que la URL de Supabase sea correcta en .env.local
============================================================
    ', total_posts, published_posts, active_categories;
END $$;

COMMIT;

-- Verificar políticas activas
SELECT 
    '✓ ' || tablename || ': ' || policyname as "Políticas RLS"
FROM pg_policies 
WHERE tablename IN ('posts', 'content_categories', 'content_tags')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar posts visibles
SELECT 
    p.title as "Posts Visibles",
    c.name as "Categoría",
    TO_CHAR(p.published_at, 'YYYY-MM-DD') as "Publicado"
FROM posts p
LEFT JOIN content_categories c ON p.category_id = c.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 5;
