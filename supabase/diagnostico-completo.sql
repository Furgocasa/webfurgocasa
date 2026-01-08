-- ============================================
-- DIAGNÓSTICO COMPLETO: Sistema de Administración
-- ============================================
-- Este script verifica TODO y te dice exactamente qué está mal

-- ========================================
-- 1. VERIFICAR USUARIO EN AUTH
-- ========================================
SELECT 
    '1. USUARIO EN AUTH' as paso,
    id,
    email,
    confirmed_at,
    email_confirmed_at,
    CASE 
        WHEN confirmed_at IS NOT NULL THEN '✅ Usuario confirmado'
        ELSE '❌ Usuario NO confirmado'
    END as estado
FROM auth.users
WHERE email = 'info@furgocasa.com';

-- ========================================
-- 2. VERIFICAR USUARIO EN ADMINS
-- ========================================
SELECT 
    '2. USUARIO EN ADMINS' as paso,
    user_id,
    email,
    role,
    is_active,
    CASE 
        WHEN is_active = true THEN '✅ Usuario activo'
        ELSE '❌ Usuario inactivo'
    END as estado
FROM admins
WHERE email = 'info@furgocasa.com';

-- ========================================
-- 3. VERIFICAR POLÍTICAS RLS
-- ========================================
SELECT 
    '3. POLÍTICAS RLS' as paso,
    COUNT(*) as total_politicas,
    CASE 
        WHEN COUNT(*) >= 6 THEN '✅ Políticas configuradas'
        ELSE '❌ Faltan políticas'
    END as estado
FROM pg_policies 
WHERE tablename = 'admins';

-- Ver detalle de políticas
SELECT 
    '3b. DETALLE POLÍTICAS' as info,
    policyname,
    cmd as operacion
FROM pg_policies 
WHERE tablename = 'admins'
ORDER BY cmd;

-- ========================================
-- 4. VERIFICAR RLS HABILITADO
-- ========================================
SELECT 
    '4. RLS HABILITADO' as paso,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS está habilitado'
        ELSE '❌ RLS NO está habilitado'
    END as estado
FROM pg_tables 
WHERE tablename = 'admins';

-- ========================================
-- 5. PROBAR CONSULTA COMO USUARIO
-- ========================================
-- Esta es la consulta exacta que hace tu aplicación
-- Si falla aquí, es un problema de RLS

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "d7086624-23fc-40e6-9d21-31631d0b916b"}';

SELECT 
    '5. PRUEBA DE CONSULTA' as paso,
    id,
    is_active,
    role,
    CASE 
        WHEN is_active = true AND role = 'superadmin' THEN '✅ Consulta exitosa'
        ELSE '⚠️ Usuario encontrado pero puede tener problemas'
    END as estado
FROM admins
WHERE user_id = 'd7086624-23fc-40e6-9d21-31631d0b916b';

RESET ROLE;

-- ========================================
-- RESUMEN
-- ========================================
-- Si todos los pasos muestran ✅, el problema es en el frontend
-- Si alguno muestra ❌, ese es el problema que hay que arreglar

-- PRÓXIMOS PASOS SEGÚN RESULTADO:
-- 
-- Si PASO 1 es ❌: El usuario no existe o no está confirmado
-- Si PASO 2 es ❌: El usuario no está en la tabla admins o está inactivo
-- Si PASO 3 es ❌: Faltan políticas RLS
-- Si PASO 4 es ❌: RLS no está habilitado
-- Si PASO 5 FALLA: Las políticas RLS están mal configuradas

