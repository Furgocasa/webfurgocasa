-- ============================================
-- CREAR PRIMER ADMINISTRADOR
-- ============================================
-- Este script te ayuda a crear el primer usuario administrador en Furgocasa
--
-- PASOS:
-- 1. Primero, crea un usuario en Supabase Auth (Dashboard > Authentication > Users > Add User)
--    - Email: tu-email@furgocasa.com
--    - Password: (elige una contraseña segura)
--    - Confirma el email automáticamente
--
-- 2. Copia el UUID del usuario que acabas de crear
--
-- 3. Ejecuta este script reemplazando 'UUID_DEL_USUARIO_AUTH' con el UUID real
-- ============================================

-- Insertar el administrador
INSERT INTO admins (
  user_id,
  email,
  name,
  role,
  is_active
) VALUES (
  'UUID_DEL_USUARIO_AUTH', -- Reemplaza con el UUID del usuario de auth.users
  'admin@furgocasa.com',   -- El mismo email que usaste en Authentication
  'Administrador',          -- Nombre del administrador
  'superadmin',            -- Rol: 'superadmin', 'admin', o 'editor'
  TRUE                     -- Activo
);

-- Verificar que se creó correctamente
SELECT 
  a.id,
  a.email,
  a.name,
  a.role,
  a.is_active,
  u.email as auth_email,
  u.created_at
FROM admins a
JOIN auth.users u ON u.id = a.user_id
WHERE a.email = 'admin@furgocasa.com';

-- ============================================
-- IMPORTANTE: Habilitar RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en la tabla admins si no está habilitado
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Política: Los administradores pueden ver sus propios datos
CREATE POLICY "Admins can view their own data" ON admins
  FOR SELECT
  USING (user_id = auth.uid());

-- Política: Los super admins pueden ver todos los administradores
CREATE POLICY "Superadmins can view all admins" ON admins
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
      AND is_active = TRUE
    )
  );

-- Política: Los super admins pueden insertar nuevos administradores
CREATE POLICY "Superadmins can insert admins" ON admins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
      AND is_active = TRUE
    )
  );

-- Política: Los super admins pueden actualizar administradores
CREATE POLICY "Superadmins can update admins" ON admins
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE user_id = auth.uid()
      AND role = 'superadmin'
      AND is_active = TRUE
    )
  );

-- Política: Los administradores pueden actualizar su propio perfil
CREATE POLICY "Admins can update own profile" ON admins
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- CONSULTAS ÚTILES
-- ============================================

-- Ver todos los usuarios de authentication
-- SELECT id, email, created_at, confirmed_at FROM auth.users;

-- Ver todos los administradores
-- SELECT * FROM admins ORDER BY created_at DESC;

-- Eliminar un administrador (si es necesario)
-- DELETE FROM admins WHERE email = 'email-a-eliminar@furgocasa.com';

-- Desactivar un administrador
-- UPDATE admins SET is_active = FALSE WHERE email = 'email@furgocasa.com';

-- Cambiar rol de un administrador
-- UPDATE admins SET role = 'admin' WHERE email = 'email@furgocasa.com';




