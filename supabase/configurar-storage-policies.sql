-- ================================================
-- Configurar políticas RLS para Storage
-- Ejecutar en SQL Editor de Supabase
-- ================================================

-- IMPORTANTE: Las políticas de storage se gestionan en la tabla storage.objects
-- y necesitan permisos especiales. Si este script falla, configura las políticas
-- manualmente desde la interfaz web de Supabase (Storage > [bucket] > Policies)

-- ================================================
-- POLÍTICAS PARA BUCKET: vehicles
-- ================================================

-- 1. Permitir lectura pública (ver imágenes)
DROP POLICY IF EXISTS "vehicles_public_read" ON storage.objects;
CREATE POLICY "vehicles_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vehicles');

-- 2. Permitir a administradores INSERTAR (subir)
DROP POLICY IF EXISTS "vehicles_admin_insert" ON storage.objects;
CREATE POLICY "vehicles_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'vehicles' 
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- 3. Permitir a administradores ACTUALIZAR
DROP POLICY IF EXISTS "vehicles_admin_update" ON storage.objects;
CREATE POLICY "vehicles_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'vehicles'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
)
WITH CHECK (
    bucket_id = 'vehicles'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- 4. Permitir a administradores ELIMINAR
DROP POLICY IF EXISTS "vehicles_admin_delete" ON storage.objects;
CREATE POLICY "vehicles_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'vehicles'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- ================================================
-- POLÍTICAS PARA BUCKET: blog
-- ================================================

-- 1. Permitir lectura pública (ver imágenes)
DROP POLICY IF EXISTS "blog_public_read" ON storage.objects;
CREATE POLICY "blog_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog');

-- 2. Permitir a administradores INSERTAR (subir)
DROP POLICY IF EXISTS "blog_admin_insert" ON storage.objects;
CREATE POLICY "blog_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'blog' 
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- 3. Permitir a administradores ACTUALIZAR
DROP POLICY IF EXISTS "blog_admin_update" ON storage.objects;
CREATE POLICY "blog_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'blog'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
)
WITH CHECK (
    bucket_id = 'blog'
    AND EXISTS (
        SELECT 1 FROM public.admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- 4. Permitir a administradores ELIMINAR
DROP POLICY IF EXISTS "blog_admin_delete" ON storage.objects;
CREATE POLICY "blog_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'blog'
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
AND (policyname LIKE '%vehicles%' OR policyname LIKE '%blog%')
ORDER BY policyname;

