-- ============================================
-- SCRIPT: Arreglar RLS (Row Level Security) para tabla admins
-- ============================================
-- Este script configura correctamente los permisos de la tabla admins
-- para que los usuarios autenticados puedan verificar si son administradores

-- PASO 1: Verificar si RLS está habilitado en la tabla admins
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'admins';

-- PASO 2: Ver las políticas actuales de la tabla admins
SELECT * FROM pg_policies WHERE tablename = 'admins';

-- ============================================
-- PASO 3: ELIMINAR políticas antiguas si existen
-- ============================================
DROP POLICY IF EXISTS "Users can read their own admin record" ON admins;
DROP POLICY IF EXISTS "Admins can read all admin records" ON admins;
DROP POLICY IF EXISTS "Public can read admins" ON admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admins;

-- ============================================
-- PASO 4: CREAR política nueva que permita a usuarios autenticados
-- leer su propio registro de admin
-- ============================================
CREATE POLICY "Authenticated users can read their own admin record"
ON admins
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- PASO 5: Permitir que los superadmins vean todos los registros
-- ============================================
CREATE POLICY "Superadmins can read all admin records"
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
-- PASO 6: Verificar que las políticas se crearon correctamente
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'admins';

-- ============================================
-- PASO 7: Asegurarse de que RLS está HABILITADO
-- ============================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 8: Verificar que tu usuario está en la tabla admins
-- ============================================
SELECT 
    id,
    user_id,
    email,
    name,
    role,
    is_active,
    created_at
FROM admins
WHERE user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Si el PASO 8 muestra tu registro con:
-- - is_active: true
-- - role: superadmin
-- 
-- Entonces todo debería funcionar. Recarga la página de login e intenta de nuevo.
-- ============================================

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- Si después de esto sigue sin funcionar, ejecuta esto para ver más detalles:
SELECT 
    a.*,
    u.email as auth_email,
    u.confirmed_at,
    u.email_confirmed_at
FROM admins a
JOIN auth.users u ON u.id = a.user_id
WHERE a.user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

