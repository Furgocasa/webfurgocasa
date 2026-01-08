-- ================================================
-- DIAGNÓSTICO: Verificar permisos de administrador
-- ================================================

-- 1. Ver el usuario autenticado actual
SELECT 
    'Usuario actual' as info,
    auth.uid() as user_id,
    auth.email() as email;

-- 2. Verificar si el usuario actual es administrador
SELECT 
    'Es administrador?' as check_type,
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid() 
        AND is_active = true
    ) as is_admin,
    (SELECT id FROM admins WHERE user_id = auth.uid()) as admin_id,
    (SELECT is_active FROM admins WHERE user_id = auth.uid()) as admin_active,
    (SELECT role FROM admins WHERE user_id = auth.uid()) as admin_role;

-- 3. Ver todos los administradores
SELECT 
    'Administradores registrados' as info,
    id,
    user_id,
    email,
    name,
    role,
    is_active,
    created_at
FROM admins
ORDER BY created_at;

-- 4. Ver todas las políticas de la tabla extras
SELECT 
    'Políticas de EXTRAS' as tabla,
    policyname,
    permissive,
    roles,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'extras';

-- 5. Verificar RLS habilitado en extras
SELECT 
    'RLS Status' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename = 'extras';

-- 6. Ver políticas de todas las tablas admin
SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    CASE 
        WHEN qual::text LIKE '%admins%' THEN 'Verifica admin'
        WHEN qual::text LIKE '%is_active%' THEN 'Verifica activo'
        ELSE 'Otra condición'
    END as tipo_politica
FROM pg_policies 
WHERE tablename IN (
    'extras', 'locations', 'vehicles', 'customers',
    'content_categories', 'content_tags', 'comments',
    'seasons', 'bookings', 'payments'
)
ORDER BY tablename, cmd, policyname;

-- 7. Test: Intentar contar extras (debería funcionar)
SELECT 
    'Test COUNT extras' as test,
    COUNT(*) as total_extras
FROM extras;

-- 8. Test: Ver el primer extra (debería funcionar)
SELECT 
    'Test SELECT primer extra' as test,
    id,
    name,
    is_active
FROM extras
LIMIT 1;

-- 9. Ver usuarios de Supabase Auth
SELECT 
    'Usuarios Auth' as info,
    id as user_id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at;


