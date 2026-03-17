-- Añadir campo booking_confirmed a search_queries
-- booking_created = se creó una reserva pendiente (no significa nada real)
-- booking_confirmed = la reserva fue pagada y confirmada (conversión REAL)

ALTER TABLE search_queries 
  ADD COLUMN IF NOT EXISTS booking_confirmed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS booking_confirmed_at TIMESTAMPTZ;

-- Retroactivamente marcar como confirmadas las búsquedas cuyo booking ya está confirmado
UPDATE search_queries sq
SET 
  booking_confirmed = TRUE,
  booking_confirmed_at = b.updated_at
FROM bookings b
WHERE sq.booking_id = b.id
  AND sq.booking_created = TRUE
  AND b.status = 'confirmed'
  AND b.payment_status IN ('partial', 'paid');
