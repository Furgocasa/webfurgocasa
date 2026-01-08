-- ============================================
-- SCRIPT PERSONALIZADO: Asignar Permisos de Administrador
-- UUID: d7086624-23fc-40e6-9d21-31631d0b916b
-- ============================================

-- Paso 1: Verificar el usuario en Auth
SELECT 
    id as user_id,
    email,
    created_at,
    confirmed_at
FROM auth.users
WHERE id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

-- Paso 2: Verificar si ya existe en la tabla admins
SELECT * FROM admins WHERE user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

-- Paso 3: Insertar o actualizar el administrador
-- Este INSERT intentará crear el registro, y si ya existe lo actualizará
INSERT INTO admins (user_id, email, name, role, is_active)
VALUES (
  'd7086624-23fc-40e6-9d21-31631d0b916b',
  (SELECT email FROM auth.users WHERE id = 'd7086624-23fc-40e6-9d21-31631d0b916b'),
  'Administrador Principal',
  'superadmin',
  true
)
ON CONFLICT (user_id) 
DO UPDATE SET 
    is_active = true,
    role = 'superadmin',
    updated_at = NOW();

-- Paso 4: Verificar que todo está correcto
SELECT 
    a.id,
    a.user_id,
    a.email,
    a.name,
    a.role,
    a.is_active,
    a.created_at,
    u.email as auth_email,
    u.confirmed_at
FROM admins a
LEFT JOIN auth.users u ON u.id = a.user_id
WHERE a.user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Deberías ver tu registro con:
-- - is_active: true
-- - role: superadmin
-- - email coincide con auth_email
-- 
-- Ahora puedes iniciar sesión en /administrator/login
-- ============================================

