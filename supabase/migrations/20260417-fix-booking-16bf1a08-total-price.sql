-- =====================================================
-- Arreglo de la reserva 16bf1a08-8f76-4a2c-9718-23005751863a
-- =====================================================
-- Motivo:
-- Al intentar editar la reserva para dejarla "sin vehículo asignado",
-- el formulario guardaba un total_price recalculado SIN incluir la
-- stripe_fee_total acumulada (comisión de la pasarela que se repercute
-- al cliente cuando paga con tarjeta). Eso provocaba:
--   - amount_paid > total_price (el navegador rechaza el guardado por
--     el atributo max del input "monto pagado")
--   - al saltarse la validación, el total_price quedaba corrupto
--
-- El bug en el código ya está corregido (el formulario ahora incluye
-- stripe_fee_total en el cálculo y lo envía en el UPDATE).
--
-- Este script deja la reserva en estado coherente:
--   total_price = base_price + extras_price + location_fee
--                 - discount + stripe_fee_total
--
-- Ejecutar primero el SELECT de diagnóstico para verificar los valores
-- actuales. Después lanzar el UPDATE si todo cuadra.
-- =====================================================

-- 1) Diagnóstico: ver el estado actual de la reserva
SELECT
  id,
  booking_number,
  base_price,
  extras_price,
  location_fee,
  COALESCE(discount, 0)           AS discount,
  COALESCE(stripe_fee_total, 0)   AS stripe_fee_total,
  total_price                     AS total_price_actual,
  amount_paid,
  payment_status,
  status,
  vehicle_id,
  (
    COALESCE(base_price, 0)
    + COALESCE(extras_price, 0)
    + COALESCE(location_fee, 0)
    - COALESCE(discount, 0)
    + COALESCE(stripe_fee_total, 0)
  ) AS total_price_calculado,
  (
    COALESCE(base_price, 0)
    + COALESCE(extras_price, 0)
    + COALESCE(location_fee, 0)
    - COALESCE(discount, 0)
    + COALESCE(stripe_fee_total, 0)
    - total_price
  ) AS diferencia
FROM bookings
WHERE id = '16bf1a08-8f76-4a2c-9718-23005751863a';

-- 2) (Opcional) Ver los pagos realizados por esta reserva
SELECT
  id,
  amount,
  stripe_fee,
  payment_method,
  payment_type,
  status,
  created_at
FROM payments
WHERE booking_id = '16bf1a08-8f76-4a2c-9718-23005751863a'
ORDER BY created_at ASC;

-- 3) Arreglo: recalcular total_price sumando la comisión Stripe
-- IMPORTANTE: solo ejecutar si el diagnóstico muestra que total_price_actual
-- NO incluye stripe_fee_total (diferencia > 0).
--
-- UPDATE bookings
-- SET
--   total_price = ROUND(
--     (
--       COALESCE(base_price, 0)
--       + COALESCE(extras_price, 0)
--       + COALESCE(location_fee, 0)
--       - COALESCE(discount, 0)
--       + COALESCE(stripe_fee_total, 0)
--     )::numeric,
--     2
--   ),
--   updated_at = NOW()
-- WHERE id = '16bf1a08-8f76-4a2c-9718-23005751863a';

-- 4) Verificación post-update
-- SELECT id, booking_number, total_price, amount_paid, stripe_fee_total, payment_status
-- FROM bookings
-- WHERE id = '16bf1a08-8f76-4a2c-9718-23005751863a';
