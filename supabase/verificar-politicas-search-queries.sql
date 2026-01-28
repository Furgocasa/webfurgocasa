-- ============================================
-- VERIFICAR POLÍTICAS RLS DE search_queries
-- ============================================
-- Ejecuta este script en Supabase SQL Editor para verificar
-- que las políticas RLS están correctamente configuradas

-- 1. Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'search_queries';

-- 2. Ver todas las políticas de search_queries
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'search_queries'
ORDER BY policyname;

-- 3. Verificar permisos de la tabla
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'search_queries'
ORDER BY grantee, privilege_type;

-- 4. Intentar insertar un registro de prueba como anon
-- (Esto debería funcionar si las políticas están bien)
INSERT INTO public.search_queries (
  session_id,
  pickup_date,
  dropoff_date,
  pickup_time,
  dropoff_time,
  rental_days,
  advance_days,
  pickup_location,
  dropoff_location,
  same_location,
  vehicles_available_count,
  avg_price_shown,
  had_availability,
  funnel_stage,
  locale,
  user_agent_type
) VALUES (
  'test-verificacion-' || extract(epoch from now()),
  CURRENT_DATE + 30,
  CURRENT_DATE + 37,
  '11:00:00',
  '11:00:00',
  7,
  30,
  'murcia',
  'murcia',
  true,
  5,
  100.00,
  true,
  'search_only',
  'es',
  'desktop'
)
RETURNING id, searched_at;

-- 5. Si la inserción anterior funcionó, eliminar el registro de prueba
-- DELETE FROM public.search_queries 
-- WHERE session_id LIKE 'test-verificacion-%'
-- AND searched_at > NOW() - INTERVAL '1 minute';

-- ============================================
-- SOLUCIÓN SI LAS POLÍTICAS NO ESTÁN BIEN
-- ============================================

-- Si no existe la política de INSERT, créala:
-- DROP POLICY IF EXISTS "API puede insertar búsquedas" ON public.search_queries;
-- CREATE POLICY "API puede insertar búsquedas"
--   ON public.search_queries
--   FOR INSERT
--   WITH CHECK (true);

-- Si RLS está deshabilitado pero debería estar habilitado:
-- ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
