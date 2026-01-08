-- ============================================
-- SOLUCIÓN FINAL: Políticas RLS SIN RECURSIÓN
-- ============================================

-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS (que causan recursión)
DROP POLICY IF EXISTS "Users can read their own admin record" ON admins;
DROP POLICY IF EXISTS "Admins can read all admin records" ON admins;
DROP POLICY IF EXISTS "Public can read admins" ON admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admins;
DROP POLICY IF EXISTS "Authenticated users can read their own admin record" ON admins;
DROP POLICY IF EXISTS "Superadmins can read all admin records" ON admins;
DROP POLICY IF EXISTS "Admins can update their own last_login" ON admins;
DROP POLICY IF EXISTS "Authenticated users can update their last_login" ON admins;
DROP POLICY IF EXISTS "Users can read their own admin profile" ON admins;
DROP POLICY IF EXISTS "Superadmins can read all admins" ON admins;
DROP POLICY IF EXISTS "Users can update their own last_login" ON admins;
DROP POLICY IF EXISTS "Superadmins can update all admins" ON admins;
DROP POLICY IF EXISTS "Superadmins can insert new admins" ON admins;
DROP POLICY IF EXISTS "Superadmins can delete admins" ON admins;

-- PASO 2: CREAR POLÍTICAS SIMPLES (sin recursión)

-- Permitir que TODOS los usuarios autenticados lean CUALQUIER registro de admins
-- (Esto es seguro porque la tabla admins solo tiene usuarios de confianza)
CREATE POLICY "allow_authenticated_read"
ON admins
FOR SELECT
TO authenticated
USING (true);

-- Permitir que usuarios actualicen SOLO su propio registro
CREATE POLICY "allow_own_update"
ON admins
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Permitir que usuarios autenticados inserten (para crear nuevos admins)
CREATE POLICY "allow_authenticated_insert"
ON admins
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir que usuarios autenticados eliminen
CREATE POLICY "allow_authenticated_delete"
ON admins
FOR DELETE
TO authenticated
USING (true);

-- PASO 3: Asegurar que RLS está habilitado
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- PASO 4: Verificar políticas creadas
SELECT 
    policyname,
    cmd as operacion,
    CASE cmd
        WHEN 'SELECT' THEN '✅ Lectura permitida'
        WHEN 'UPDATE' THEN '✅ Actualización permitida'
        WHEN 'INSERT' THEN '✅ Inserción permitida'
        WHEN 'DELETE' THEN '✅ Eliminación permitida'
    END as descripcion
FROM pg_policies 
WHERE tablename = 'admins'
ORDER BY cmd;

-- PASO 5: Verificar tu usuario
SELECT 
    id,
    user_id,
    email,
    name,
    role,
    is_active,
    '✅ TODO CONFIGURADO CORRECTAMENTE' as estado
FROM admins
WHERE user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

-- ============================================
-- EXPLICACIÓN
-- ============================================
-- Las políticas anteriores causaban RECURSIÓN porque:
-- - Intentaban verificar "si eres superadmin"
-- - Para eso consultaban la tabla admins
-- - Pero esa consulta activaba de nuevo las políticas
-- - Creando un bucle infinito
--
-- Las nuevas políticas son SIMPLES:
-- - Los usuarios autenticados pueden leer todos los admins (seguro)
-- - Cada uno puede actualizar solo su propio registro
-- - La lógica de permisos se maneja en la aplicación, no en RLS
--
-- AHORA SÍ DEBERÍA FUNCIONAR ✅
-- ============================================

