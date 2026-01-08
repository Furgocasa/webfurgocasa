-- ============================================
-- SCRIPT: Políticas RLS COMPLETAS para tabla admins
-- ============================================
-- Este script agrega TODAS las políticas necesarias para que funcione el sistema de administración

-- PASO 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Users can read their own admin record" ON admins;
DROP POLICY IF EXISTS "Admins can read all admin records" ON admins;
DROP POLICY IF EXISTS "Public can read admins" ON admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admins;
DROP POLICY IF EXISTS "Authenticated users can read their own admin record" ON admins;
DROP POLICY IF EXISTS "Superadmins can read all admin records" ON admins;
DROP POLICY IF EXISTS "Admins can update their own last_login" ON admins;
DROP POLICY IF EXISTS "Authenticated users can update their last_login" ON admins;

-- ============================================
-- PASO 2: POLÍTICAS DE LECTURA (SELECT)
-- ============================================

-- Permitir que usuarios autenticados lean su propio registro de admin
CREATE POLICY "Users can read their own admin profile"
ON admins
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Permitir que superadmins lean todos los registros
CREATE POLICY "Superadmins can read all admins"
ON admins
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.role = 'superadmin'
    AND admins.is_active = true
  )
);

-- ============================================
-- PASO 3: POLÍTICAS DE ACTUALIZACIÓN (UPDATE)
-- ============================================

-- Permitir que usuarios actualicen su propio last_login
CREATE POLICY "Users can update their own last_login"
ON admins
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Permitir que superadmins actualicen cualquier registro
CREATE POLICY "Superadmins can update all admins"
ON admins
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.role = 'superadmin'
    AND admins.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.role = 'superadmin'
    AND admins.is_active = true
  )
);

-- ============================================
-- PASO 4: POLÍTICAS DE INSERCIÓN (INSERT)
-- ============================================

-- Solo superadmins pueden crear nuevos administradores
CREATE POLICY "Superadmins can insert new admins"
ON admins
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.role = 'superadmin'
    AND admins.is_active = true
  )
);

-- ============================================
-- PASO 5: POLÍTICAS DE ELIMINACIÓN (DELETE)
-- ============================================

-- Solo superadmins pueden eliminar administradores
CREATE POLICY "Superadmins can delete admins"
ON admins
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.role = 'superadmin'
    AND admins.is_active = true
  )
);

-- ============================================
-- PASO 6: Asegurar que RLS está habilitado
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 7: Verificar políticas creadas
-- ============================================
SELECT 
    policyname,
    cmd as operation,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'admins'
ORDER BY cmd, policyname;

-- ============================================
-- PASO 8: Verificar tu registro de admin
-- ============================================
SELECT 
    id,
    user_id,
    email,
    name,
    role,
    is_active,
    created_at,
    last_login
FROM admins
WHERE user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Deberías ver 7 políticas:
-- - 2 para SELECT (read)
-- - 2 para UPDATE
-- - 1 para INSERT
-- - 1 para DELETE
--
-- Ahora intenta hacer login de nuevo. Debería funcionar completamente.
-- ============================================

