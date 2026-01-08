-- ============================================
-- SCRIPT SIMPLE: Asignar Permisos de Administrador
-- UUID: d7086624-23fc-40e6-9d21-31631d0b916b
-- ============================================

-- PASO 1: Ver tu usuario en Auth
SELECT 
    id as user_id,
    email,
    created_at,
    confirmed_at
FROM auth.users
WHERE id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

-- PASO 2: Ver todos los admins actuales
SELECT * FROM admins;

-- ============================================
-- PASO 3: Ejecuta SOLO UNO de estos comandos
-- ============================================

-- OPCIÓN A: Si NO estás en la tabla admins (ejecuta este)
INSERT INTO admins (user_id, email, name, role, is_active)
SELECT 
    'd7086624-23fc-40e6-9d21-31631d0b916b',
    email,
    'Administrador Principal',
    'superadmin',
    true
FROM auth.users
WHERE id = 'd7086624-23fc-40e6-9d21-31631d0b916b'
AND NOT EXISTS (
    SELECT 1 FROM admins WHERE user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b'
);

-- OPCIÓN B: Si YA estás en admins pero sin permisos (ejecuta este)
UPDATE admins 
SET 
    is_active = true,
    role = 'superadmin',
    updated_at = NOW()
WHERE user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

-- ============================================
-- PASO 4: Verificar el resultado final
-- ============================================
SELECT 
    a.id,
    a.user_id,
    a.email,
    a.name,
    a.role,
    a.is_active,
    a.created_at,
    u.email as auth_email
FROM admins a
LEFT JOIN auth.users u ON u.id = a.user_id
WHERE a.user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

-- ============================================
-- INSTRUCCIONES
-- ============================================
-- 1. Ejecuta PASO 1 (deberías ver tu usuario)
-- 2. Ejecuta PASO 2 (para ver si ya estás en admins)
-- 3. Si NO apareces en PASO 2: Ejecuta OPCIÓN A
--    Si SÍ apareces en PASO 2: Ejecuta OPCIÓN B
-- 4. Ejecuta PASO 4 para verificar
-- 5. Ve a /administrator/login e inicia sesión
-- ============================================

