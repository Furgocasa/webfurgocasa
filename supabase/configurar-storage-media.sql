-- ================================================
-- Configurar Supabase Storage para gestión de media
-- Buckets: vehicles (imágenes de vehículos), blog (imágenes del blog)
-- ================================================

-- 1. Crear bucket para imágenes de vehículos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'vehicles',
    'vehicles',
    true, -- Público para que se puedan ver en el frontend
    10485760, -- 10MB máximo por archivo
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Crear bucket para imágenes del blog
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog',
    'blog',
    true, -- Público para que se puedan ver en el frontend
    10485760, -- 10MB máximo por archivo
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Políticas de seguridad para el bucket 'vehicles'

-- Permitir a cualquiera ver las imágenes (público)
DROP POLICY IF EXISTS "vehicles_public_read" ON storage.objects;
CREATE POLICY "vehicles_public_read" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'vehicles');

-- Permitir a administradores subir imágenes
DROP POLICY IF EXISTS "vehicles_admin_insert" ON storage.objects;
CREATE POLICY "vehicles_admin_insert" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'vehicles' 
        AND EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
        )
    );

-- Permitir a administradores actualizar imágenes
DROP POLICY IF EXISTS "vehicles_admin_update" ON storage.objects;
CREATE POLICY "vehicles_admin_update" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'vehicles'
        AND EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
        )
    );

-- Permitir a administradores eliminar imágenes
DROP POLICY IF EXISTS "vehicles_admin_delete" ON storage.objects;
CREATE POLICY "vehicles_admin_delete" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'vehicles'
        AND EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
        )
    );

-- 4. Políticas de seguridad para el bucket 'blog'

-- Permitir a cualquiera ver las imágenes (público)
DROP POLICY IF EXISTS "blog_public_read" ON storage.objects;
CREATE POLICY "blog_public_read" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'blog');

-- Permitir a administradores subir imágenes
DROP POLICY IF EXISTS "blog_admin_insert" ON storage.objects;
CREATE POLICY "blog_admin_insert" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'blog' 
        AND EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
        )
    );

-- Permitir a administradores actualizar imágenes
DROP POLICY IF EXISTS "blog_admin_update" ON storage.objects;
CREATE POLICY "blog_admin_update" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'blog'
        AND EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
        )
    );

-- Permitir a administradores eliminar imágenes
DROP POLICY IF EXISTS "blog_admin_delete" ON storage.objects;
CREATE POLICY "blog_admin_delete" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'blog'
        AND EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.user_id = auth.uid() 
            AND admins.is_active = true
        )
    );

-- 5. Verificar la configuración
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id IN ('vehicles', 'blog');

-- 6. Ver políticas aplicadas
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%vehicles%' OR policyname LIKE '%blog%'
ORDER BY policyname;

-- Comentarios
COMMENT ON SCHEMA storage IS 'Storage de Supabase para archivos multimedia';

