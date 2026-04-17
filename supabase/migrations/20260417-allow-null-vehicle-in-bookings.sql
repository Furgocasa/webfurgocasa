-- =====================================================
-- Permitir reservas "sin vehículo asignado" (vehicle_id NULL)
-- =====================================================
-- Motivo: Facilitar reasignaciones de vehículos en el calendario.
-- Cuando la flota está completa y hay que reorganizar alquileres
-- (ej: swap de FU0020 a FU0014 y viceversa), se necesita un estado
-- intermedio donde un alquiler pueda quedar momentáneamente "sin
-- vehículo" para poder reubicar los otros sin conflictos.
--
-- Antes: vehicle_id UUID NOT NULL REFERENCES vehicles(id)
-- Ahora: vehicle_id UUID NULL     REFERENCES vehicles(id)
--
-- Impacto:
--   - La FK sigue existiendo: si se asigna un vehículo, debe existir
--   - Si vehicle_id = NULL, el alquiler aparece en "Pendientes de asignar"
--     en el calendario del admin
--   - La API pública de disponibilidad no se ve afectada: una reserva
--     sin vehículo no bloquea a ningún vehículo concreto
-- =====================================================

ALTER TABLE bookings
  ALTER COLUMN vehicle_id DROP NOT NULL;

COMMENT ON COLUMN bookings.vehicle_id IS
  'Vehículo asignado al alquiler. Puede ser NULL temporalmente cuando se está reasignando la flota (estado "pendiente de asignar").';
