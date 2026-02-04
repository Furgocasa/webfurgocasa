-- ===================================================================
-- CONFIGURACIÓN DE STORAGE PARA BLOG
-- ===================================================================
-- Este script configura el bucket 'blog' para almacenar imágenes
-- de artículos del blog (featured images e imágenes del contenido)
-- ===================================================================

-- 1. Crear bucket 'blog' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Allow public read access to blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete blog images" ON storage.objects;

-- 3. Política: Permitir lectura pública de imágenes del blog
CREATE POLICY "Allow public read access to blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog');

-- 4. Política: Permitir a usuarios autenticados subir imágenes
-- (Los admins están autenticados, así que pueden subir)
CREATE POLICY "Allow authenticated users to upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog');

-- 5. Política: Permitir a usuarios autenticados actualizar sus propias imágenes
CREATE POLICY "Allow authenticated users to update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog')
WITH CHECK (bucket_id = 'blog');

-- 6. Política: Permitir a usuarios autenticados eliminar imágenes
-- (Solo admins deberían estar autenticados en el panel)
CREATE POLICY "Allow authenticated users to delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog');

-- ===================================================================
-- VERIFICACIÓN
-- ===================================================================
-- Ejecuta estas consultas para verificar la configuración:

-- Ver configuración del bucket
SELECT * FROM storage.buckets WHERE id = 'blog';

-- Ver políticas del bucket
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%blog%';

-- ===================================================================
-- NOTAS
-- ===================================================================
-- - El bucket es PÚBLICO para permitir acceso directo a las imágenes desde el blog
-- - Solo usuarios AUTENTICADOS (admins) pueden subir/modificar/eliminar
-- - Las imágenes se organizan en carpetas:
--   * blog-content/    -> Imágenes insertadas en el contenido de artículos (TinyMCE)
--   * featured/        -> Imágenes destacadas de artículos (opcional)
-- - TinyMCE subirá automáticamente las imágenes a 'blog-content/'
-- ===================================================================
