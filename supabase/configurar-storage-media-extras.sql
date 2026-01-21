-- ================================================
-- Configurar políticas RLS para buckets MEDIA y EXTRAS
-- Ejecutar en SQL Editor de Supabase
-- ================================================

-- ================================================
-- POLÍTICAS PARA BUCKET: media
-- ================================================

-- 1. Permitir lectura pública (ver imágenes)
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
CREATE POLICY "media_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- 2. Permitir a administradores INSERTAR (subir)
DROP POLICY IF EXISTS "media_admin_insert" ON storage.objects;
CREATE POLICY "media_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'media' 
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- 3. Permitir a administradores ACTUALIZAR
DROP POLICY IF EXISTS "media_admin_update" ON storage.objects;
CREATE POLICY "media_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'media'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
)
WITH CHECK (
    bucket_id = 'media'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- 4. Permitir a administradores ELIMINAR
DROP POLICY IF EXISTS "media_admin_delete" ON storage.objects;
CREATE POLICY "media_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'media'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- ================================================
-- POLÍTICAS PARA BUCKET: extras
-- ================================================

-- 1. Permitir lectura pública (ver imágenes)
DROP POLICY IF EXISTS "extras_public_read" ON storage.objects;
CREATE POLICY "extras_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'extras');

-- 2. Permitir a administradores INSERTAR (subir)
DROP POLICY IF EXISTS "extras_admin_insert" ON storage.objects;
CREATE POLICY "extras_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'extras' 
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- 3. Permitir a administradores ACTUALIZAR
DROP POLICY IF EXISTS "extras_admin_update" ON storage.objects;
CREATE POLICY "extras_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'extras'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
)
WITH CHECK (
    bucket_id = 'extras'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- 4. Permitir a administradores ELIMINAR
DROP POLICY IF EXISTS "extras_admin_delete" ON storage.objects;
CREATE POLICY "extras_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'extras'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- ================================================
-- Verificar políticas creadas
-- ================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND (policyname LIKE '%media%' OR policyname LIKE '%extras%')
ORDER BY policyname;

-- ================================================
-- Verificar todos los buckets y sus políticas
-- ================================================
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
WHERE b.id IN ('media', 'blog', 'extras', 'vehicles')
GROUP BY b.id, b.name, b.public
ORDER BY b.id;
