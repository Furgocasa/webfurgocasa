-- Roles según RD 933/2021 (Anexo II): distinguir arrendatario (quien contrata)
-- de los conductores. Convención: driver_index = 0 es SIEMPRE el arrendatario
-- (la persona que hizo la reserva), conduzca o no. `is_driver` indica si esa
-- persona va a conducir el vehículo.
ALTER TABLE rental_documents
  ADD COLUMN IF NOT EXISTS is_driver BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN rental_documents.is_driver IS
  'TRUE si esta persona va a conducir. El arrendatario (driver_index=0) puede no conducir (FALSE).';
