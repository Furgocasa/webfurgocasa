-- Programación del email de gestión inicial (20 min tras 1er pago + confirmación)
ALTER TABLE booking_admin_checklist
  ADD COLUMN IF NOT EXISTS management_email_due_at TIMESTAMPTZ;

COMMENT ON COLUMN booking_admin_checklist.management_email_due_at IS
  'Hora programada para enviar booking_management (20 min después del 1er pago cuando la reserva pasa a confirmed).';

CREATE INDEX IF NOT EXISTS idx_booking_admin_checklist_mgmt_email_due
  ON booking_admin_checklist (management_email_due_at)
  WHERE management_email_due_at IS NOT NULL;
