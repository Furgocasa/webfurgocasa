-- Añadir status 'reserved_pending_payment' a last_minute_offers
-- La oferta pasa a este estado cuando un cliente crea reserva pero aún no ha pagado.
-- Solo pasa a 'reserved' cuando el pago está completado (Redsys/Stripe/Manual).
-- Ejecutar solo si la tabla tiene CHECK constraint en status y da error al insertar.

DO $$
BEGIN
  ALTER TABLE last_minute_offers DROP CONSTRAINT IF EXISTS last_minute_offers_status_check;
  ALTER TABLE last_minute_offers ADD CONSTRAINT last_minute_offers_status_check 
  CHECK (status IN (
    'detected', 'published', 'reserved', 'reserved_pending_payment', 
    'expired', 'ignored', 'auto_cancelled'
  ));
EXCEPTION
  WHEN duplicate_object THEN NULL; -- Constraint ya existe
END $$;
