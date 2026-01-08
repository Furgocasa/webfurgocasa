-- ============================================
-- SCRIPT: Verificar y Asignar Permisos de Administrador
-- ============================================
-- Ejecuta este script en Supabase SQL Editor para dar permisos de admin a tu usuario

-- Paso 1: Ver todos los usuarios de Auth (para obtener el UUID)
-- Copia el UUID de tu usuario
SELECT 
    id as user_id,
    email,
    created_at,
    confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- Paso 2: Verificar si el usuario ya está en la tabla admins
-- ============================================
SELECT * FROM admins;

-- ============================================
-- Paso 3: OPCIÓN A - Si el usuario NO existe en admins
-- Reemplaza 'TU-UUID-AQUI' con el UUID de tu usuario del Paso 1
-- ============================================
INSERT INTO admins (user_id, email, name, role, is_active)
VALUES (
  'TU-UUID-AQUI',  -- <-- CAMBIA ESTO por el UUID de tu usuario
  'admin@furgocasa.com',  -- <-- CAMBIA ESTO por tu email
  'Administrador Principal',
  'superadmin',
  true
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- Paso 4: OPCIÓN B - Si el usuario YA existe pero no tiene permisos
-- Activa el usuario existente (reemplaza el email)
-- ============================================
UPDATE admins 
SET 
    is_active = true,
    role = 'superadmin'
WHERE email = 'admin@furgocasa.com';  -- <-- CAMBIA ESTO por tu email

-- ============================================
-- Paso 5: Verificar que todo está correcto
-- Debe mostrar tu usuario con is_active = true
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
WHERE a.email = 'admin@furgocasa.com';  -- <-- CAMBIA ESTO por tu email

-- ============================================
-- GUÍA RÁPIDA
-- ============================================
-- 1. Ejecuta el Paso 1 para ver tu UUID
-- 2. Copia el UUID (columna user_id)
-- 3. Ejecuta el Paso 2 para ver si ya existe en admins
-- 4. Si NO existe: Ejecuta Paso 3 (reemplazando TU-UUID-AQUI y el email)
-- 5. Si SÍ existe: Ejecuta Paso 4 (reemplazando el email)
-- 6. Ejecuta el Paso 5 para verificar
-- 7. Intenta iniciar sesión de nuevo en /administrator/login

-- ============================================
-- ROLES DISPONIBLES
-- ============================================
-- 'superadmin'  → Acceso total al sistema
-- 'admin'       → Acceso completo excepto gestión de usuarios
-- 'editor'      → Solo puede editar contenido (blog, vehículos)
-- 'viewer'      → Solo lectura

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- Si después de esto sigue sin funcionar:
-- 1. Verifica que el email en auth.users coincide con el de admins
-- 2. Verifica que is_active = true
-- 3. Cierra sesión completamente y vuelve a iniciar
-- 4. Limpia las cookies del navegador
-- 5. Prueba en una ventana de incógnito

