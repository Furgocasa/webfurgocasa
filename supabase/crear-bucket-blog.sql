-- ================================================
-- CREAR BUCKET Y POLÍTICAS PARA BLOG
-- Ejecutar en SQL Editor de Supabase
-- ================================================

-- 1. Crear bucket 'blog' (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog',
  'blog',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

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
-- Verificar que el bucket fue creado
-- ================================================
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE id = 'blog';

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
AND policyname LIKE '%blog%'
ORDER BY policyname;
