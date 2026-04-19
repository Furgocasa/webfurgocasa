-- ============================================
-- SCRIPT: Actualizar días de reservas existentes
-- ============================================
-- Este script actualiza el campo 'days' de todas las reservas
-- para sincronizarlo con las fechas reales

-- Ver reservas con días desincronizados
SELECT 
  id,
  booking_number,
  pickup_date,
  dropoff_date,
  days as days_stored,
  (dropoff_date - pickup_date) as days_calculated,
  (dropoff_date - pickup_date) - days as difference
FROM public.bookings
WHERE days != (dropoff_date - pickup_date)
ORDER BY created_at DESC;

-- Actualizar todas las reservas desincronizadas
UPDATE public.bookings
SET days = (dropoff_date - pickup_date),
    updated_at = NOW()
WHERE days != (dropoff_date - pickup_date);

-- Verificar que todo se actualizó correctamente
SELECT 
  COUNT(*) as total_reservas,
  COUNT(*) FILTER (WHERE days = (dropoff_date - pickup_date)) as sincronizadas,
  COUNT(*) FILTER (WHERE days != (dropoff_date - pickup_date)) as desincronizadas
FROM public.bookings;
