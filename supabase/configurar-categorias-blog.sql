-- ============================================
-- CONFIGURACIÓN DE CATEGORÍAS DEL BLOG
-- Replicando estructura de furgocasa.com
-- ============================================
-- 
-- URLs a replicar:
-- /es/blog/rutas     → Rutas en camper
-- /es/blog/noticias  → Noticias del sector
-- /es/blog/vehiculos → Vehículos y equipamiento
--
-- ============================================

-- Limpiar categorías existentes (opcional, descomentar si es necesario)
-- DELETE FROM content_categories;

-- Insertar las 3 categorías principales del blog
INSERT INTO content_categories (
    name,
    slug,
    description,
    meta_title,
    meta_description,
    sort_order,
    is_active
) VALUES 
(
    'Rutas',
    'rutas',
    'Las mejores rutas en camper por España y Europa. Descubre destinos increíbles, consejos de viaje y experiencias únicas para tus aventuras sobre ruedas.',
    'Rutas en Camper - Blog Furgocasa',
    'Descubre las mejores rutas en camper por España y Europa. Guías detalladas, consejos de viaje y recomendaciones para tu próxima aventura en autocaravana.',
    1,
    TRUE
),
(
    'Noticias',
    'noticias',
    'Mantente al día con las últimas novedades del mundo camper, eventos, ferias, legislación y actualidad del sector de las autocaravanas.',
    'Noticias Camper - Blog Furgocasa',
    'Las últimas noticias del mundo camper y autocaravanas. Eventos, ferias, novedades del sector y actualidad para los amantes de viajar sobre ruedas.',
    2,
    TRUE
),
(
    'Vehículos',
    'vehiculos',
    'Conoce los mejores vehículos para viajar, comparativas de modelos, análisis de autocaravanas y campers, y recomendaciones de expertos.',
    'Vehículos Camper - Blog Furgocasa',
    'Análisis y comparativas de campers y autocaravanas. Descubre los mejores vehículos para viajar, sus características y cuál es el ideal para ti.',
    3,
    TRUE
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- CATEGORÍAS ADICIONALES (Opcional)
-- Para futuro crecimiento del blog
-- ============================================

INSERT INTO content_categories (
    name,
    slug,
    description,
    meta_title,
    meta_description,
    sort_order,
    is_active
) VALUES 
(
    'Consejos',
    'consejos',
    'Guías prácticas y consejos para sacar el máximo partido a tu experiencia camper. Desde principiantes hasta expertos.',
    'Consejos Camper - Blog Furgocasa',
    'Consejos prácticos para viajar en camper. Guías para principiantes, trucos de expertos y todo lo que necesitas saber para tu viaje en autocaravana.',
    4,
    TRUE
),
(
    'Destinos',
    'destinos',
    'Descubre los mejores destinos para viajar en camper, desde playas paradisíacas hasta montañas espectaculares.',
    'Destinos Camper - Blog Furgocasa',
    'Los mejores destinos para viajar en camper. Playas, montañas, pueblos con encanto y lugares únicos para explorar en tu autocaravana.',
    5,
    TRUE
),
(
    'Equipamiento',
    'equipamiento',
    'Todo sobre accesorios, equipamiento, gadgets y mejoras para tu camper. Reseñas y recomendaciones.',
    'Equipamiento Camper - Blog Furgocasa',
    'Guías de equipamiento para tu camper. Accesorios esenciales, gadgets útiles y mejoras para hacer tu viaje más cómodo y seguro.',
    6,
    TRUE
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT 
    name as "Categoría",
    slug as "Slug (URL)",
    sort_order as "Orden",
    is_active as "Activa"
FROM content_categories
ORDER BY sort_order;

-- ============================================
-- ESTRUCTURA DE URLs
-- ============================================
-- 
-- Con esta configuración, las URLs serán:
-- 
-- LISTADOS POR CATEGORÍA:
--   /es/blog/rutas           → Lista de artículos de rutas
--   /es/blog/noticias        → Lista de artículos de noticias
--   /es/blog/vehiculos       → Lista de artículos de vehículos
--   /es/blog/consejos        → Lista de artículos de consejos
--   /es/blog/destinos        → Lista de artículos de destinos
--   /es/blog/equipamiento    → Lista de artículos de equipamiento
--
-- ARTÍCULOS INDIVIDUALES:
--   /es/blog/rutas/nombre-del-articulo
--   /es/blog/noticias/nombre-del-articulo
--   /es/blog/vehiculos/nombre-del-articulo
--   etc.
--
-- Esto replica EXACTAMENTE la estructura de:
--   https://www.furgocasa.com/es/blog/rutas
--   https://www.furgocasa.com/es/blog/noticias
--   https://www.furgocasa.com/es/blog/vehiculos
--
-- ============================================

