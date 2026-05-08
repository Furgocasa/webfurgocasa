-- ============================================
-- BACKFILL HISTORICO · booking_email_dispatches
-- ============================================
-- Fecha: 08/05/2026
--
-- Ejecutar DESPUES de 20260508-booking-email-dispatches.sql
--
-- POLITICA QUE APLICAMOS (corte temporal en CURRENT_DATE):
--
--   1) Reservas YA TERMINADAS (dropoff_date < HOY):
--      Marcamos los 4 mails (05/06/07 + 04 return_reminder) como 'sent'.
--      Estos clientes ya no recibiran NADA del programa Storytellers.
--
--   2) Reservas EN CURSO (pickup_date <= HOY <= dropoff_date):
--      a) 05 'sent'  -> la noche del pickup ya paso.
--      b) 06 'sent'  -> SOLO si ya paso el midpoint del viaje
--                       Y el viaje es largo (>= 6 dias).
--      c) 06 'skipped' (motivo: short_trip) -> si el viaje es corto (< 6 dias).
--                       Regla de negocio: viajes < 6 dias NO reciben "mitad de viaje".
--      d) 07 SIN MARCAR -> el cron lo enviara el dia despues de la devolucion.
--      e) 04 SIN MARCAR -> el cron lo enviara el dia antes de la devolucion.
--
--   3) Reservas FUTURAS (pickup_date > HOY):
--      a) 06 'skipped' (motivo: short_trip) -> si viaje corto (< 6 dias).
--         El resto se gestiona normalmente cuando llegue el momento.
--
-- Filtros aplicados a todas las inserciones:
--   - status IN ('confirmed', 'in_progress', 'completed')
--     -> ignora 'pending' (RGPD/no pagada) y 'cancelled'.
--   - customer_email IS NOT NULL AND customer_email LIKE '%@%'
--     -> reservas sin email no se marcan ni intentan enviar.
--
-- Idempotencia: ON CONFLICT DO NOTHING en todos los inserts. Se puede ejecutar
-- esta migracion varias veces sin riesgo de duplicar (gracias al UNIQUE parcial
-- de la migracion anterior y al filtrado interno).
-- ============================================

BEGIN;

-- ============================================
-- 1) Reservas YA TERMINADAS (dropoff_date < HOY)
--    Los 4 mails marcados como 'sent' para que NUNCA se envien.
-- ============================================
INSERT INTO booking_email_dispatches (
  booking_id,
  customer_email,
  email_type,
  status,
  sent_at,
  metadata
)
SELECT
  b.id,
  LOWER(TRIM(b.customer_email)),
  t.email_type,
  'sent',
  b.dropoff_date::timestamptz,
  jsonb_build_object(
    'backfilled', true,
    'reason', 'trip_finished_before_program_launch',
    'pickup_date', b.pickup_date,
    'dropoff_date', b.dropoff_date,
    'trip_days', (b.dropoff_date - b.pickup_date)
  )
FROM bookings b
CROSS JOIN (VALUES
  ('storyteller_pickup_night'),
  ('storyteller_mid_trip'),
  ('storyteller_post_trip'),
  ('return_reminder')
) AS t(email_type)
WHERE b.dropoff_date < CURRENT_DATE
  AND b.status IN ('confirmed', 'in_progress', 'completed')
  AND b.customer_email IS NOT NULL
  AND b.customer_email LIKE '%@%'
ON CONFLICT DO NOTHING;

-- ============================================
-- 2a) Reservas EN CURSO -> 05 'sent' (pickup ya paso)
-- ============================================
INSERT INTO booking_email_dispatches (
  booking_id,
  customer_email,
  email_type,
  status,
  sent_at,
  metadata
)
SELECT
  b.id,
  LOWER(TRIM(b.customer_email)),
  'storyteller_pickup_night',
  'sent',
  b.pickup_date::timestamptz + INTERVAL '20 hours',
  jsonb_build_object(
    'backfilled', true,
    'reason', 'in_progress_pickup_already_passed',
    'pickup_date', b.pickup_date,
    'dropoff_date', b.dropoff_date,
    'trip_days', (b.dropoff_date - b.pickup_date)
  )
FROM bookings b
WHERE b.pickup_date <= CURRENT_DATE
  AND b.dropoff_date >= CURRENT_DATE
  AND b.status IN ('confirmed', 'in_progress')
  AND b.customer_email IS NOT NULL
  AND b.customer_email LIKE '%@%'
ON CONFLICT DO NOTHING;

-- ============================================
-- 2b) Reservas EN CURSO con viaje LARGO (>=6 dias)
--     Si ya paso el midpoint -> 06 'sent'
--     midpoint = pickup_date + floor(trip_days / 2)
-- ============================================
INSERT INTO booking_email_dispatches (
  booking_id,
  customer_email,
  email_type,
  status,
  sent_at,
  metadata
)
SELECT
  b.id,
  LOWER(TRIM(b.customer_email)),
  'storyteller_mid_trip',
  'sent',
  (b.pickup_date + ((b.dropoff_date - b.pickup_date) / 2))::timestamptz + INTERVAL '12 hours',
  jsonb_build_object(
    'backfilled', true,
    'reason', 'in_progress_midpoint_already_passed',
    'pickup_date', b.pickup_date,
    'dropoff_date', b.dropoff_date,
    'trip_days', (b.dropoff_date - b.pickup_date),
    'midpoint_day', (b.pickup_date + ((b.dropoff_date - b.pickup_date) / 2))
  )
FROM bookings b
WHERE b.pickup_date <= CURRENT_DATE
  AND b.dropoff_date >= CURRENT_DATE
  AND (b.dropoff_date - b.pickup_date) >= 6
  AND CURRENT_DATE > (b.pickup_date + ((b.dropoff_date - b.pickup_date) / 2))
  AND b.status IN ('confirmed', 'in_progress')
  AND b.customer_email IS NOT NULL
  AND b.customer_email LIKE '%@%'
ON CONFLICT DO NOTHING;

-- ============================================
-- 2c) Reservas EN CURSO con viaje CORTO (< 6 dias)
--     -> 06 'skipped' (regla de negocio: no enviar mitad de viaje)
-- ============================================
INSERT INTO booking_email_dispatches (
  booking_id,
  customer_email,
  email_type,
  status,
  sent_at,
  metadata
)
SELECT
  b.id,
  LOWER(TRIM(b.customer_email)),
  'storyteller_mid_trip',
  'skipped',
  NOW(),
  jsonb_build_object(
    'backfilled', true,
    'reason', 'short_trip_no_mid_email',
    'pickup_date', b.pickup_date,
    'dropoff_date', b.dropoff_date,
    'trip_days', (b.dropoff_date - b.pickup_date),
    'rule', 'short_trips_under_6_days_only_get_05_and_07'
  )
FROM bookings b
WHERE b.pickup_date <= CURRENT_DATE
  AND b.dropoff_date >= CURRENT_DATE
  AND (b.dropoff_date - b.pickup_date) < 6
  AND b.status IN ('confirmed', 'in_progress')
  AND b.customer_email IS NOT NULL
  AND b.customer_email LIKE '%@%'
ON CONFLICT DO NOTHING;

-- ============================================
-- 3) Reservas FUTURAS con viaje CORTO (< 6 dias)
--    -> 06 'skipped' por adelantado.
--    Documenta en BD por que ese cliente NO recibira el mid-trip,
--    y deja la idempotencia ya en su sitio para cuando llegue el momento.
-- ============================================
INSERT INTO booking_email_dispatches (
  booking_id,
  customer_email,
  email_type,
  status,
  sent_at,
  metadata
)
SELECT
  b.id,
  LOWER(TRIM(b.customer_email)),
  'storyteller_mid_trip',
  'skipped',
  NOW(),
  jsonb_build_object(
    'backfilled', true,
    'reason', 'short_trip_no_mid_email',
    'pickup_date', b.pickup_date,
    'dropoff_date', b.dropoff_date,
    'trip_days', (b.dropoff_date - b.pickup_date),
    'rule', 'short_trips_under_6_days_only_get_05_and_07'
  )
FROM bookings b
WHERE b.pickup_date > CURRENT_DATE
  AND (b.dropoff_date - b.pickup_date) < 6
  AND b.status IN ('confirmed', 'in_progress')
  AND b.customer_email IS NOT NULL
  AND b.customer_email LIKE '%@%'
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================
-- VERIFICACION POST-BACKFILL (ejecutar a mano)
-- ============================================
-- 1) Resumen general por tipo y status:
--
-- SELECT
--   email_type,
--   status,
--   COUNT(*) AS total,
--   MIN(sent_at) AS oldest,
--   MAX(sent_at) AS newest
-- FROM booking_email_dispatches
-- GROUP BY email_type, status
-- ORDER BY email_type, status;
--
-- 2) Desglose por motivo del backfill:
--
-- SELECT
--   email_type,
--   status,
--   metadata->>'reason' AS reason,
--   COUNT(*) AS total
-- FROM booking_email_dispatches
-- WHERE (metadata->>'backfilled')::boolean = TRUE
-- GROUP BY email_type, status, metadata->>'reason'
-- ORDER BY email_type, status;
--
-- 3) Lista de reservas EN CURSO con su estado de mails:
--
-- SELECT
--   b.booking_number,
--   b.customer_email,
--   b.pickup_date,
--   b.dropoff_date,
--   (b.dropoff_date - b.pickup_date) AS dias,
--   ARRAY_AGG(d.email_type || '=' || d.status ORDER BY d.email_type) AS mails
-- FROM bookings b
-- LEFT JOIN booking_email_dispatches d ON d.booking_id = b.id
-- WHERE b.pickup_date <= CURRENT_DATE
--   AND b.dropoff_date >= CURRENT_DATE
--   AND b.status IN ('confirmed', 'in_progress')
-- GROUP BY b.id, b.booking_number, b.customer_email, b.pickup_date, b.dropoff_date
-- ORDER BY b.dropoff_date;
