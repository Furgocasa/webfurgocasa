-- Campo para idempotencia del cron de recordatorio de devolución.
-- Evita enviar el mismo email dos veces si el cron se ejecuta más de una vez.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS return_reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN bookings.return_reminder_sent
  IS 'True si ya se envió el email de recordatorio de devolución al cliente';
