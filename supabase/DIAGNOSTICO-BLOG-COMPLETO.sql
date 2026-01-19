-- ============================================================
-- DIAGNÓSTICO COMPLETO: Estado del Blog en Supabase
-- ============================================================
-- Ejecuta este script para ver EXACTAMENTE qué está pasando
-- ============================================================

-- 1. ¿Existen posts en la tabla?
SELECT 
    'TOTAL DE POSTS' as info,
    COUNT(*) as cantidad
FROM posts;

-- 2. ¿Qué status tienen los posts?
SELECT 
    'POSTS POR STATUS' as info,
    status,
    COUNT(*) as cantidad
FROM posts
GROUP BY status;

-- 3. Ver TODOS los posts con sus detalles
SELECT 
    id,
    title,
    slug,
    status,
    published_at,
    category_id,
    created_at
FROM posts
ORDER BY created_at DESC
LIMIT 10;

-- 4. ¿Las categorías están activas?
SELECT 
    'CATEGORÍAS' as info,
    id,
    name,
    slug,
    is_active
FROM content_categories
ORDER BY name;

-- 5. ¿Qué políticas RLS existen para posts?
SELECT 
    'POLÍTICAS RLS POSTS' as info,
    policyname,
    cmd as tipo_comando,
    qual as condicion
FROM pg_policies 
WHERE tablename = 'posts'
AND schemaname = 'public';

-- 6. ¿RLS está habilitado en posts?
SELECT 
    'RLS HABILITADO' as info,
    tablename,
    rowsecurity as rls_activo
FROM pg_tables 
WHERE tablename = 'posts'
AND schemaname = 'public';

-- 7. Probar la query EXACTA que hace el frontend
-- (como usuario anónimo sin autenticación)
SET LOCAL ROLE anon;

SELECT 
    'POSTS VISIBLES COMO ANON' as info,
    id,
    title,
    status,
    published_at
FROM posts
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 5;

RESET ROLE;

-- 8. Ver si hay posts con fechas futuras o NULL
SELECT 
    'POSTS CON FECHAS PROBLEMÁTICAS' as info,
    COUNT(*) FILTER (WHERE published_at IS NULL) as sin_fecha,
    COUNT(*) FILTER (WHERE published_at > NOW()) as fecha_futura,
    COUNT(*) FILTER (WHERE published_at <= NOW() AND status = 'published') as ok_para_mostrar
FROM posts;
