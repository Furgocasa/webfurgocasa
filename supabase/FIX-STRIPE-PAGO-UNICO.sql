-- ============================================
-- AJUSTE MANUAL: PAGO STRIPE YA COBRADO
-- ============================================
-- Ejecuta este script EN SUPABASE SQL EDITOR
-- Ajusta el pago y la reserva para la sesión indicada

-- Stripe Checkout session (LIVE)
-- Sesion: cs_live_a1wcrtIUlOlLkWJg0jWPfjcfgZuTuZzUfVxsYNE03wTmNpV6LU6lJl1Sfu

WITH target_payment AS (
  SELECT *
  FROM payments
  WHERE stripe_session_id = 'cs_live_a1wcrtIUlOlLkWJg0jWPfjcfgZuTuZzUfVxsYNE03wTmNpV6LU6lJl1Sfu'
  LIMIT 1
),
updated_payment AS (
  UPDATE payments
  SET
    status = 'authorized',
    payment_method = 'stripe',
    notes = CONCAT(COALESCE(notes, ''), ' | Ajuste manual por pago Stripe confirmado'),
    updated_at = NOW()
  FROM target_payment
  WHERE payments.id = target_payment.id
  RETURNING payments.*
),
totals AS (
  SELECT booking_id, SUM(amount) AS total_paid
  FROM payments
  WHERE booking_id = (SELECT booking_id FROM updated_payment)
    AND status IN ('authorized')
  GROUP BY booking_id
)
UPDATE bookings b
SET
  amount_paid = totals.total_paid,
  payment_status = CASE
    WHEN totals.total_paid >= b.total_price THEN 'paid'
    ELSE 'partial'
  END,
  status = 'confirmed',
  updated_at = NOW()
FROM totals
WHERE b.id = totals.booking_id;
