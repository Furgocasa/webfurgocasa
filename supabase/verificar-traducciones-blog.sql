-- ============================================
-- VERIFICAR ESTADO DE TRADUCCIONES DEL BLOG
-- ============================================
-- Este script muestra el estado de traducciones de los artículos del blog
-- Fecha: 2026-01-27
-- ============================================

-- 1. ESTADO DE TRADUCCIONES AL INGLÉS (columnas en posts)
-- ============================================
SELECT 
    'Inglés (columnas en posts)' as tipo_traduccion,
    COUNT(*) as total_posts,
    COUNT(title_en) as posts_con_titulo_en,
    COUNT(excerpt_en) as posts_con_excerpt_en,
    COUNT(content_en) as posts_con_content_en,
    COUNT(slug_en) as posts_con_slug_en,
    ROUND(COUNT(title_en)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_titulo,
    ROUND(COUNT(content_en)::numeric / COUNT(*)::numeric * 100, 2) as porcentaje_contenido
FROM posts
WHERE status = 'published';

-- 2. ESTADO DE TRADUCCIONES A FRANCÉS Y ALEMÁN (tabla content_translations)
-- ============================================
SELECT 
    locale as idioma,
    source_field as campo,
    COUNT(*) as total_traducciones,
    COUNT(DISTINCT source_id) as posts_con_traduccion
FROM content_translations
WHERE source_table = 'posts'
    AND locale IN ('fr', 'de')
GROUP BY locale, source_field
ORDER BY locale, source_field;

-- 3. POSTS SIN TRADUCCIONES AL INGLÉS
-- ============================================
SELECT 
    id,
    title,
    slug,
    status,
    CASE 
        WHEN title_en IS NULL THEN '❌ Sin título'
        ELSE '✅ Con título'
    END as estado_titulo,
    CASE 
        WHEN content_en IS NULL THEN '❌ Sin contenido'
        ELSE '✅ Con contenido'
    END as estado_contenido
FROM posts
WHERE status = 'published'
    AND (title_en IS NULL OR content_en IS NULL)
ORDER BY created_at DESC
LIMIT 20;

-- 4. POSTS SIN TRADUCCIONES A FRANCÉS O ALEMÁN
-- ============================================
-- Posts que NO tienen traducciones en content_translations para fr/de
SELECT 
    p.id,
    p.title,
    p.slug,
    p.status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM content_translations ct 
            WHERE ct.source_table = 'posts' 
            AND ct.source_id = p.id 
            AND ct.locale = 'fr' 
            AND ct.source_field = 'title'
        ) THEN '✅ Con título FR'
        ELSE '❌ Sin título FR'
    END as estado_titulo_fr,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM content_translations ct 
            WHERE ct.source_table = 'posts' 
            AND ct.source_id = p.id 
            AND ct.locale = 'fr' 
            AND ct.source_field = 'content'
        ) THEN '✅ Con contenido FR'
        ELSE '❌ Sin contenido FR'
    END as estado_contenido_fr,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM content_translations ct 
            WHERE ct.source_table = 'posts' 
            AND ct.source_id = p.id 
            AND ct.locale = 'de' 
            AND ct.source_field = 'title'
        ) THEN '✅ Con título DE'
        ELSE '❌ Sin título DE'
    END as estado_titulo_de,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM content_translations ct 
            WHERE ct.source_table = 'posts' 
            AND ct.source_id = p.id 
            AND ct.locale = 'de' 
            AND ct.source_field = 'content'
        ) THEN '✅ Con contenido DE'
        ELSE '❌ Sin contenido DE'
    END as estado_contenido_de
FROM posts p
WHERE p.status = 'published'
ORDER BY p.created_at DESC
LIMIT 20;

-- 5. RESUMEN GENERAL POR IDIOMA
-- ============================================
WITH stats AS (
    SELECT 
        'en' as idioma,
        COUNT(*) as total_posts,
        COUNT(title_en) as posts_traducidos
    FROM posts
    WHERE status = 'published'
    
    UNION ALL
    
    SELECT 
        locale as idioma,
        COUNT(DISTINCT source_id) as total_posts,
        COUNT(DISTINCT CASE WHEN source_field = 'content' THEN source_id END) as posts_traducidos
    FROM content_translations
    WHERE source_table = 'posts'
        AND locale IN ('fr', 'de')
    GROUP BY locale
)
SELECT 
    idioma,
    total_posts,
    posts_traducidos,
    ROUND(posts_traducidos::numeric / NULLIF(total_posts, 0)::numeric * 100, 2) as porcentaje_traducido
FROM stats
ORDER BY idioma;

-- ============================================
-- CONCLUSIÓN
-- ============================================
-- Las traducciones al inglés están en columnas de la tabla posts
-- Las traducciones a francés y alemán están en la tabla content_translations
-- Si faltan traducciones, hay que generarlas usando los scripts de traducción
-- ============================================
