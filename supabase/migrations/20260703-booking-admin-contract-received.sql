-- Contrato recibido/firmado manualmente (email, papel…) — complementa signed_contracts.
ALTER TABLE booking_admin_checklist
  ADD COLUMN IF NOT EXISTS contract_received BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN booking_admin_checklist.contract_received IS
  'Override manual: contrato recibido o firmado fuera de la firma online (p. ej. por email).';
