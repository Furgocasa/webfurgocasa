-- ============================================
-- Script para identificar imágenes del blog con URLs antiguas (rotas)
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Ver todos los artículos con imágenes que apuntan a rutas locales antiguas
SELECT 
    id,
    title,
    slug,
    featured_image,
    CASE 
        WHEN featured_image LIKE '/images/furgocasa/%' THEN '❌ URL LOCAL ANTIGUA'
        WHEN featured_image LIKE '/images/%' THEN '⚠️ URL LOCAL'
        WHEN featured_image LIKE 'https://%.supabase.co/%' THEN '✅ SUPABASE'
        WHEN featured_image IS NULL THEN '⚪ SIN IMAGEN'
        ELSE '❓ OTRO'
    END as estado_imagen
FROM content_posts
WHERE featured_image IS NOT NULL
ORDER BY 
    CASE 
        WHEN featured_image LIKE '/images/furgocasa/%' THEN 1
        WHEN featured_image LIKE '/images/%' THEN 2
        ELSE 3
    END,
    title;

-- ============================================
-- Resumen por tipo de URL
-- ============================================
SELECT 
    CASE 
        WHEN featured_image LIKE '/images/furgocasa/%' THEN '❌ URL LOCAL ANTIGUA'
        WHEN featured_image LIKE '/images/%' THEN '⚠️ URL LOCAL'
        WHEN featured_image LIKE 'https://%.supabase.co/%' THEN '✅ SUPABASE'
        WHEN featured_image IS NULL THEN '⚪ SIN IMAGEN'
        ELSE '❓ OTRO'
    END as tipo_url,
    COUNT(*) as total
FROM content_posts
GROUP BY 1
ORDER BY 2 DESC;

-- ============================================
-- PARA ACTUALIZAR: Reemplazar URLs locales por URLs de Supabase
-- ============================================
-- Primero, sube las imágenes al bucket 'blog' de Supabase Storage
-- Luego ejecuta este script adaptando las rutas:

/*
-- Ejemplo de actualización masiva:
UPDATE content_posts
SET featured_image = REPLACE(
    featured_image, 
    '/images/furgocasa/blog/', 
    'https://TU_PROYECTO.supabase.co/storage/v1/object/public/blog/'
)
WHERE featured_image LIKE '/images/furgocasa/blog/%';
*/

-- ============================================
-- VER TODOS LOS NOMBRES DE ARCHIVO ÚNICOS
-- (para saber qué imágenes necesitas subir)
-- ============================================
SELECT DISTINCT
    REGEXP_REPLACE(featured_image, '^.*/([^/]+)$', '\1') as nombre_archivo,
    featured_image as url_completa
FROM content_posts
WHERE featured_image LIKE '/images/furgocasa/blog/%'
ORDER BY nombre_archivo;
