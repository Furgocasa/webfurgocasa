-- ================================================
-- DIAGNÓSTICO: Verificar qué tablas existen
-- ================================================

-- Ver todas las tablas en el esquema public
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('locations', 'extras', 'customers', 'payments', 'seasons', 
                           'vehicles', 'vehicle_categories', 'vehicle_images', 'bookings',
                           'comments', 'posts', 'content_categories', 'content_tags') 
        THEN '✓ Esperada'
        ELSE '  Otra'
    END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Ver si existe la tabla admins y tiene datos
SELECT 
    COUNT(*) as total_admins,
    COUNT(CASE WHEN is_active = true THEN 1 END) as admins_activos
FROM admins;

-- Ver políticas RLS existentes para las tablas principales
SELECT 
    tablename,
    COUNT(*) as num_policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;


