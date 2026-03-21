-- =============================================================================
-- Corrección puntual: reserva 16bf1a08-8f76-4a2c-9718-23005751863a
-- 1) Extra sábanas/almohadas: total línea = 40 € (p. ej. 2 × 20 €)
-- 2) Recalcular extras_price y total_price del booking
-- 3) OPCIONAL: alinear total y amount_paid con comisión Stripe (leer comentarios)
--
-- Ejecutar en Supabase → SQL Editor. Revisa los SELECT antes de los UPDATE.
-- =============================================================================

-- --- Diagnóstico inicial ---
SELECT id, booking_number, base_price, extras_price, location_fee, discount, coupon_discount,
       total_price, amount_paid, payment_status,
       (total_price - COALESCE(amount_paid, 0)) AS pendiente
FROM bookings
WHERE id = '16bf1a08-8f76-4a2c-9718-23005751863a';

SELECT be.id, be.quantity, be.unit_price, be.total_price, e.name
FROM booking_extras be
JOIN extras e ON e.id = be.extra_id
WHERE be.booking_id = '16bf1a08-8f76-4a2c-9718-23005751863a';

SELECT id, amount, payment_method, status, notes, created_at
FROM payments
WHERE booking_id = '16bf1a08-8f76-4a2c-9718-23005751863a'
ORDER BY created_at;

-- =============================================================================
-- PASO 1: Corregir línea de sábanas y almohadas → total 40 €
-- (Ajusta el ILIKE si el nombre en BD es distinto)
-- =============================================================================
UPDATE booking_extras be
SET
  unit_price = ROUND((40.0 / NULLIF(be.quantity, 0))::numeric, 2),
  total_price = 40.00,
  updated_at = NOW()
FROM extras e
WHERE be.booking_id = '16bf1a08-8f76-4a2c-9718-23005751863a'
  AND be.extra_id = e.id
  AND (
    e.name ILIKE '%sában%'
    OR e.name ILIKE '%sabana%'
    OR e.name ILIKE '%almohad%'
  );

-- Si no actualizó filas, localiza el extra_id correcto con el SELECT de booking_extras y usa:
-- UPDATE booking_extras SET unit_price = 20, total_price = 40, updated_at = NOW()
-- WHERE booking_id = '16bf1a08-8f76-4a2c-9718-23005751863a' AND id = '<uuid_fila_booking_extras>';

-- =============================================================================
-- PASO 2: Recalcular extras_price y total_price
-- Fórmula alineada con el panel admin (base + extras + ubicación - descuentos)
-- =============================================================================
WITH sums AS (
  SELECT booking_id, COALESCE(SUM(total_price), 0)::numeric AS sum_extras
  FROM booking_extras
  WHERE booking_id = '16bf1a08-8f76-4a2c-9718-23005751863a'
  GROUP BY booking_id
)
UPDATE bookings b
SET
  extras_price = sums.sum_extras,
  total_price = ROUND(
    (
      b.base_price
      + sums.sum_extras
      + COALESCE(b.location_fee, 0)
      - COALESCE(b.discount, 0)
      - COALESCE(b.coupon_discount, 0)
    )::numeric,
    2
  ),
  updated_at = NOW()
FROM sums
WHERE b.id = sums.booking_id;

-- --- Comprobar pendiente tras paso 2 ---
SELECT total_price, amount_paid,
       ROUND((total_price - COALESCE(amount_paid, 0))::numeric, 2) AS pendiente
FROM bookings
WHERE id = '16bf1a08-8f76-4a2c-9718-23005751863a';

-- =============================================================================
-- PASO 3 (OPCIONAL): Comisión Stripe “dentro” del total y del pagado
--
-- Política en app (desde el fix): payments.amount = solo alquiler; la comisión
-- la paga el cliente pero no debería inflar amount_paid del alquiler.
--
-- Si en ESTA reserva antigua quieres que el “contrato” refleje también la
-- comisión como importe total a satisfacer Y que lo ya pagado cuente el cargo
-- bruto de Stripe, suma la MISMA cantidad a total_price y a amount_paid:
--   → el pendiente (total - paid) NO cambia.
--
-- Ejemplo: primer pago 50 % alquiler 1615 € + 2 % Stripe = 32,30 € de comisión
--   fee_to_add := 32.30;
--
-- Descomenta y ajusta fee_to_add tras mirar el cargo real en Stripe o en notes:
--
-- UPDATE bookings
-- SET
--   total_price = ROUND((total_price + 32.30)::numeric, 2),
--   amount_paid = ROUND((COALESCE(amount_paid, 0) + 32.30)::numeric, 2),
--   updated_at = NOW()
-- WHERE id = '16bf1a08-8f76-4a2c-9718-23005751863a';
--
-- Si lo que buscas es que el PENDIENTE sea exactamente la “mitad de 1615” (807,50 €)
-- respecto al alquiler sin comisión, normalmente basta con paso 1+2: el total
-- baja 20 € (60→40 en sábanas) y el pendiente se recalcula solo.
-- Si tras eso el pendiente no coincide con lo esperado, revisa amount_paid
-- frente al extracto de Stripe y ajusta amount_paid manualmente (o usa PASO 3).
-- =============================================================================
