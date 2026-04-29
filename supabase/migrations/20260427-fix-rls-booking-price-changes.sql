-- ============================================================
-- FIX RLS: booking_price_changes
-- ------------------------------------------------------------
-- Fecha: 2026-04-27
--
-- PROBLEMA:
--   Al editar una reserva desde /administrator/reservas/[id]/editar
--   y cambiar el precio (base_price / total_price) se obtenía:
--
--     new row violates row-level security policy
--     for table "booking_price_changes"
--
--   Causa: existe un trigger en `bookings` que registra los
--   cambios de precio en la tabla de auditoría
--   `booking_price_changes`. Esa tabla tiene RLS activado pero
--   NO tenía policy de INSERT para admins, así que el trigger
--   fallaba y revertía el UPDATE de la reserva.
--
-- SOLUCIÓN:
--   Crear las 4 policies (SELECT / INSERT / UPDATE / DELETE)
--   para admins activos, siguiendo el mismo patrón que el resto
--   de tablas admin (business_closed_dates, blocked_dates...).
--
-- Ejecutar en: Supabase SQL Editor (proyecto de producción).
-- Idempotente: usa DROP POLICY IF EXISTS antes de crear.
-- ============================================================

-- 0) Diagnóstico previo (informativo, no modifica nada)
SELECT
  policyname,
  cmd,
  roles,
  qual         AS using_expression,
  with_check   AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'booking_price_changes'
ORDER BY policyname;

-- 1) Asegurar que RLS está habilitado
ALTER TABLE public.booking_price_changes ENABLE ROW LEVEL SECURITY;

-- 2) Limpiar policies previas con el mismo nombre (por si reaplicamos)
DROP POLICY IF EXISTS "booking_price_changes_admin_select" ON public.booking_price_changes;
DROP POLICY IF EXISTS "booking_price_changes_admin_insert" ON public.booking_price_changes;
DROP POLICY IF EXISTS "booking_price_changes_admin_update" ON public.booking_price_changes;
DROP POLICY IF EXISTS "booking_price_changes_admin_delete" ON public.booking_price_changes;

-- 3) SELECT: cualquier admin activo puede leer la auditoría
CREATE POLICY "booking_price_changes_admin_select"
  ON public.booking_price_changes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = true
    )
  );

-- 4) INSERT: cualquier admin activo puede generar entradas de auditoría
--    (es lo que dispara el trigger al editar reservas)
CREATE POLICY "booking_price_changes_admin_insert"
  ON public.booking_price_changes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = true
    )
  );

-- 5) UPDATE: solo admins (uso poco habitual, pero coherente)
CREATE POLICY "booking_price_changes_admin_update"
  ON public.booking_price_changes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = true
    )
  );

-- 6) DELETE: solo admins (limpieza puntual)
CREATE POLICY "booking_price_changes_admin_delete"
  ON public.booking_price_changes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = true
    )
  );

-- 7) Verificación posterior
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'booking_price_changes'
ORDER BY policyname;
