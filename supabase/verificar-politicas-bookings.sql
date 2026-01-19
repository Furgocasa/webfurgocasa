-- ============================================
-- DIAGNÓSTICO: POLÍTICAS RLS DE BOOKINGS
-- ============================================
-- Ejecuta este script para ver las políticas actuales de la tabla bookings

-- 1. Ver si RLS está habilitado en bookings
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'bookings' AND schemaname = 'public';

-- 2. Ver todas las políticas de bookings
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
FROM pg_policies 
WHERE tablename = 'bookings'
ORDER BY cmd, policyname;

-- 3. Contar cuántas políticas tiene bookings
SELECT 
    cmd as command,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'bookings'
GROUP BY cmd
ORDER BY cmd;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Debería mostrar al menos:
-- - 1 política de SELECT (la que ya existía)
-- - 1 política de INSERT (la nueva que permite a todos crear bookings)
-- - 1 política de UPDATE (la nueva para admins)
