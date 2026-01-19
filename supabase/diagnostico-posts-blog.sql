-- ============================================================
-- VERIFICAR Y CORREGIR DATOS DE POSTS DEL BLOG
-- ============================================================
-- Este script verifica el estado de los posts y corrige
-- problemas comunes que impiden su visualización
-- ============================================================

-- ==========================================
-- 1. DIAGNÓSTICO: Estado actual de los posts
-- ==========================================

SELECT '==========================================';
SELECT '📊 DIAGNÓSTICO DE POSTS';
SELECT '==========================================';

-- Total de posts por status
SELECT 
    status as "Estado",
    COUNT(*) as "Cantidad"
FROM posts
GROUP BY status
ORDER BY status;

-- Posts con fechas futuras
SELECT 
    'Posts con published_at futuro' as "Tipo",
    COUNT(*) as "Cantidad"
FROM posts
WHERE published_at > NOW();

-- Posts sin categoría
SELECT 
    'Posts sin categoría' as "Tipo",
    COUNT(*) as "Cantidad"
FROM posts
WHERE category_id IS NULL;

-- Posts con categoría inactiva
SELECT 
    'Posts con categoría inactiva' as "Tipo",
    COUNT(*) as "Cantidad"
FROM posts p
LEFT JOIN content_categories c ON p.category_id = c.id
WHERE c.is_active = false OR c.id IS NULL;

-- ==========================================
-- 2. MOSTRAR POSTS PROBLEMÁTICOS
-- ==========================================

SELECT '==========================================';
SELECT '⚠️  POSTS CON POSIBLES PROBLEMAS';
SELECT '==========================================';

SELECT 
    id,
    title,
    slug,
    status,
    published_at,
    CASE 
        WHEN status != 'published' THEN '❌ Status no es published'
        WHEN published_at IS NULL THEN '❌ Sin fecha de publicación'
        WHEN published_at > NOW() THEN '⚠️  Fecha futura'
        WHEN category_id IS NULL THEN '⚠️  Sin categoría'
        ELSE '✓ OK'
    END as "Problema"
FROM posts
WHERE 
    status != 'published' 
    OR published_at IS NULL 
    OR published_at > NOW()
    OR category_id IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- ==========================================
-- 3. CORRECCIÓN AUTOMÁTICA (Comentado por seguridad)
-- ==========================================
-- Descomenta estas líneas si quieres aplicar las correcciones

/*
-- Corregir posts con status 'draft' a 'published'
UPDATE posts
SET 
    status = 'published',
    updated_at = NOW()
WHERE status = 'draft';

-- Corregir fechas futuras a la fecha actual
UPDATE posts
SET 
    published_at = NOW(),
    updated_at = NOW()
WHERE published_at > NOW();

-- Corregir posts sin fecha de publicación
UPDATE posts
SET 
    published_at = COALESCE(published_at, created_at, NOW()),
    updated_at = NOW()
WHERE published_at IS NULL;
*/

-- ==========================================
-- 4. VERIFICAR CATEGORÍAS
-- ==========================================

SELECT '==========================================';
SELECT '📁 ESTADO DE CATEGORÍAS';
SELECT '==========================================';

SELECT 
    c.id,
    c.name as "Nombre",
    c.slug as "Slug",
    CASE 
        WHEN c.is_active THEN '✓ Activa' 
        ELSE '✗ Inactiva' 
    END as "Estado",
    COUNT(p.id) as "Posts"
FROM content_categories c
LEFT JOIN posts p ON c.id = p.category_id
GROUP BY c.id, c.name, c.slug, c.is_active
ORDER BY c.name;

-- ==========================================
-- 5. POSTS QUE DEBERÍAN SER VISIBLES
-- ==========================================

SELECT '==========================================';
SELECT '👁️  POSTS QUE DEBERÍAN SER VISIBLES';
SELECT '==========================================';

SELECT 
    p.id,
    p.title as "Título",
    p.slug as "Slug",
    c.name as "Categoría",
    p.published_at as "Fecha Publicación",
    p.views as "Vistas"
FROM posts p
LEFT JOIN content_categories c ON p.category_id = c.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 10;

-- ==========================================
-- 6. SUGERENCIAS
-- ==========================================

SELECT '
============================================================
💡 SUGERENCIAS PARA CORREGIR PROBLEMAS
============================================================

1. Si hay posts con status != ''published'':
   UPDATE posts SET status = ''published'' WHERE status = ''draft'';

2. Si hay posts con fechas futuras:
   UPDATE posts SET published_at = NOW() WHERE published_at > NOW();

3. Si hay posts sin fecha de publicación:
   UPDATE posts SET published_at = created_at WHERE published_at IS NULL;

4. Si hay categorías inactivas:
   UPDATE content_categories SET is_active = true WHERE is_active = false;

5. Para ver todos los posts en el frontend inmediatamente:
   UPDATE posts SET status = ''published'', published_at = NOW();

============================================================
⚠️  IMPORTANTE: Revisa los resultados antes de ejecutar
   las correcciones automáticas.
============================================================
';
