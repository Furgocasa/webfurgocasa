-- Referencia directa reserva → oferta de última hora (trazabilidad y UI)
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS last_minute_offer_id UUID REFERENCES last_minute_offers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_last_minute_offer_id
  ON bookings(last_minute_offer_id)
  WHERE last_minute_offer_id IS NOT NULL;

COMMENT ON COLUMN bookings.last_minute_offer_id IS
  'Oferta de última hora aplicada. El descuento (bookings.discount) documenta el ahorro pero ya está incluido en base_price.';

-- Enlace existente vía last_minute_offers.booking_id
UPDATE bookings b
SET last_minute_offer_id = o.id
FROM last_minute_offers o
WHERE b.last_minute_offer_id IS NULL
  AND o.booking_id = b.id;

-- Reservas con ahorro de oferta pero sin enlace (p. ej. PATCH fallido al crear)
UPDATE bookings b
SET last_minute_offer_id = o.id
FROM last_minute_offers o
WHERE b.last_minute_offer_id IS NULL
  AND b.discount > 0
  AND COALESCE(b.coupon_discount, 0) = 0
  AND b.coupon_code IS NULL
  AND o.vehicle_id = b.vehicle_id
  AND o.offer_start_date = b.pickup_date
  AND o.offer_end_date = b.dropoff_date
  AND ROUND((o.original_price_per_day - o.final_price_per_day) * o.offer_days, 2) = b.discount;

-- No cancelar la oferta vinculada a la propia reserva al confirmar
CREATE OR REPLACE FUNCTION auto_cancel_conflicting_offers()
RETURNS TRIGGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  IF NEW.status IN ('confirmed', 'active', 'completed') THEN
    UPDATE last_minute_offers
    SET
      status = 'auto_cancelled',
      updated_at = NOW(),
      admin_notes = COALESCE(admin_notes || E'\n\n', '') ||
        'Cancelada automáticamente por reserva ' || NEW.id ||
        ' del ' || NEW.pickup_date || ' al ' || NEW.dropoff_date
    WHERE
      vehicle_id = NEW.vehicle_id
      AND status = 'published'
      AND booking_id IS DISTINCT FROM NEW.id
      AND (offer_start_date <= NEW.dropoff_date AND offer_end_date >= NEW.pickup_date);

    GET DIAGNOSTICS affected_count = ROW_COUNT;

    IF affected_count > 0 THEN
      RAISE NOTICE 'Auto-canceladas % ofertas por reserva % (vehículo %, fechas: % - %)',
        affected_count, NEW.id, NEW.vehicle_id, NEW.pickup_date, NEW.dropoff_date;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
