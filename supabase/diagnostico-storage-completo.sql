-- ================================================
-- DIAGNÓSTICO COMPLETO DE STORAGE
-- Verificar buckets, políticas y permisos
-- ================================================

-- 1. LISTAR TODOS LOS BUCKETS
SELECT 
    id,
    name,
    public,
    file_size_limit / 1024 / 1024 as max_mb,
    allowed_mime_types,
    created_at
FROM storage.buckets
ORDER BY id;

-- 2. CONTAR POLÍTICAS POR BUCKET
SELECT 
    b.id as bucket_id,
    b.name as bucket_name,
    b.public as is_public,
    COUNT(p.policyname) as policy_count
FROM storage.buckets b
LEFT JOIN pg_policies p ON (
    p.schemaname = 'storage' 
    AND p.tablename = 'objects'
    AND p.policyname LIKE '%' || b.id || '%'
)
GROUP BY b.id, b.name, b.public
ORDER BY b.id;

-- 3. DETALLE DE POLÍTICAS POR BUCKET
SELECT 
    policyname as policy,
    cmd as operation,
    CASE 
        WHEN roles::text LIKE '%public%' THEN 'public'
        WHEN roles::text LIKE '%authenticated%' THEN 'authenticated'
        ELSE roles::text
    END as role_type,
    permissive,
    CASE 
        WHEN policyname LIKE '%vehicles%' THEN 'vehicles'
        WHEN policyname LIKE '%blog%' THEN 'blog'
        WHEN policyname LIKE '%extras%' THEN 'extras'
        WHEN policyname LIKE '%media%' THEN 'media'
        ELSE 'otro'
    END as bucket
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY bucket, operation;

-- 4. VERIFICAR POLÍTICAS FALTANTES
WITH expected_policies AS (
    SELECT bucket, policy_type
    FROM (
        SELECT unnest(ARRAY['vehicles', 'blog', 'extras', 'media']) as bucket
    ) b
    CROSS JOIN (
        SELECT unnest(ARRAY['public_read', 'admin_insert', 'admin_update', 'admin_delete']) as policy_type
    ) p
),
existing_policies AS (
    SELECT 
        CASE 
            WHEN policyname LIKE '%vehicles%' THEN 'vehicles'
            WHEN policyname LIKE '%blog%' THEN 'blog'
            WHEN policyname LIKE '%extras%' THEN 'extras'
            WHEN policyname LIKE '%media%' THEN 'media'
        END as bucket,
        CASE 
            WHEN policyname LIKE '%public_read%' THEN 'public_read'
            WHEN policyname LIKE '%admin_insert%' THEN 'admin_insert'
            WHEN policyname LIKE '%admin_update%' THEN 'admin_update'
            WHEN policyname LIKE '%admin_delete%' THEN 'admin_delete'
        END as policy_type
    FROM pg_policies
    WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND (
        policyname LIKE '%vehicles%' 
        OR policyname LIKE '%blog%'
        OR policyname LIKE '%extras%'
        OR policyname LIKE '%media%'
    )
)
SELECT 
    ep.bucket,
    ep.policy_type,
    CASE 
        WHEN exp.bucket IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ FALTA'
    END as status
FROM expected_policies ep
LEFT JOIN existing_policies exp ON (
    ep.bucket = exp.bucket 
    AND ep.policy_type = exp.policy_type
)
ORDER BY ep.bucket, ep.policy_type;

-- 5. VERIFICAR ARCHIVOS EN CADA BUCKET
SELECT 
    bucket_id,
    COUNT(*) as file_count,
    SUM(metadata->>'size'::text)::bigint / 1024 / 1024 as total_mb,
    MIN(created_at) as oldest_file,
    MAX(created_at) as newest_file
FROM storage.objects
WHERE bucket_id IN ('vehicles', 'blog', 'extras', 'media')
GROUP BY bucket_id
ORDER BY bucket_id;

-- 6. LISTAR ÚLTIMOS 10 ARCHIVOS SUBIDOS
SELECT 
    bucket_id,
    name,
    metadata->>'size' as size_bytes,
    (metadata->>'size')::bigint / 1024 as size_kb,
    created_at,
    updated_at
FROM storage.objects
WHERE bucket_id IN ('vehicles', 'blog', 'extras', 'media')
ORDER BY created_at DESC
LIMIT 10;

-- 7. VERIFICAR PERMISOS DE ADMINISTRADORES
SELECT 
    a.id,
    a.email,
    a.is_active,
    a.is_superadmin,
    a.created_at,
    CASE 
        WHEN a.is_active = true THEN '✅ Puede gestionar storage'
        ELSE '❌ NO puede gestionar storage'
    END as storage_access
FROM admins a
ORDER BY a.is_superadmin DESC, a.created_at DESC;

-- ================================================
-- RESUMEN FINAL
-- ================================================
SELECT 
    'BUCKETS' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN public = true THEN 1 ELSE 0 END) as publicos
FROM storage.buckets
UNION ALL
SELECT 
    'POLÍTICAS' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN cmd = 'SELECT' THEN 1 ELSE 0 END) as publicas
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
UNION ALL
SELECT 
    'ARCHIVOS' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN bucket_id IN ('vehicles', 'blog', 'extras', 'media') THEN 1 ELSE 0 END) as en_buckets
FROM storage.objects
UNION ALL
SELECT 
    'ADMINS' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as activos
FROM admins;

-- ================================================
-- INSTRUCCIONES
-- ================================================
-- Si ves buckets con 0 políticas:
--   1. Ejecuta: configurar-storage-media-extras.sql
--   2. Vuelve a ejecutar este diagnóstico
--
-- Si los archivos no se suben:
--   1. Verifica que tu usuario esté en la tabla admins
--   2. Verifica que is_active = true
--   3. Verifica que las políticas existan
--
-- Si las políticas no se aplican:
--   1. Cierra sesión en el administrador
--   2. Vuelve a iniciar sesión
--   3. Intenta de nuevo
