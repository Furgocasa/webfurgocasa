-- ============================================
-- FIX: Corregir Políticas RLS de search_queries
-- ============================================
-- Este script corrige las políticas RLS que están bloqueando
-- las inserciones de búsquedas desde la API
--
-- Ejecutar en: Supabase SQL Editor
-- Fecha: 2026-01-28
-- ============================================

-- 1. Verificar políticas actuales
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'search_queries'
ORDER BY policyname;

-- 2. Eliminar políticas existentes de INSERT si existen (para recrearlas)
DROP POLICY IF EXISTS "API puede insertar búsquedas" ON public.search_queries;
DROP POLICY IF EXISTS "Permitir inserción de búsquedas" ON public.search_queries;
DROP POLICY IF EXISTS "Public insert" ON public.search_queries;

-- 3. Crear política de INSERT que permita inserciones sin autenticación
-- Esta política permite que cualquier usuario (incluido anon) inserte búsquedas
CREATE POLICY "API puede insertar búsquedas"
  ON public.search_queries
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);

-- 4. Verificar que la política se creó correctamente
SELECT 
  policyname,
  cmd as command,
  roles,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'search_queries'
  AND cmd = 'INSERT';

-- 5. Probar inserción como usuario anon (simula lo que hace la API)
-- Esto debería funcionar ahora
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
  'test-fix-rls-' || extract(epoch from now()),
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

-- 6. Si la inserción anterior funcionó, eliminar el registro de prueba
-- DELETE FROM public.search_queries 
-- WHERE session_id LIKE 'test-fix-rls-%'
-- AND searched_at > NOW() - INTERVAL '1 minute';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- La política creada permite INSERT a:
-- - public: Todos los roles
-- - anon: Usuarios no autenticados (lo que usa la API)
-- - authenticated: Usuarios autenticados
--
-- WITH CHECK (true) significa que cualquier dato puede ser insertado
-- sin restricciones adicionales.
--
-- Si después de ejecutar este script sigue fallando, verifica:
-- 1. Que RLS esté habilitado: SELECT rowsecurity FROM pg_tables WHERE tablename = 'search_queries';
-- 2. Que no haya otras políticas conflictivas
-- 3. Que el cliente de Supabase use NEXT_PUBLIC_SUPABASE_ANON_KEY (no service_role)
