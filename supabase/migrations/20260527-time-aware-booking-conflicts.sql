-- ============================================================
-- 2026-05-27 — Trigger prevent_booking_conflicts: comparación
-- con TIMESTAMP (fecha+hora) en lugar de solo DATE.
-- ------------------------------------------------------------
-- PROBLEMA:
--   Cuando un vehículo devuelve el mismo día que otro alquiler
--   recoge (ej: devuelve 3/8 a 10:00, recoge 3/8 a 19:00),
--   el trigger rechazaba la operación porque solo comparaba
--   pickup_date/dropoff_date sin considerar las horas.
--
-- CORRECCIÓN:
--   Se construyen timestamps completos (fecha + hora) y se usa
--   comparación estricta (< / >) para que dos alquileres puedan
--   compartir el mismo día si las horas no se solapan.
--
--   Ejemplo válido: devuelve 3/8 10:00, recoge 3/8 19:00 → OK
--   Ejemplo conflicto: devuelve 3/8 20:00, recoge 3/8 19:00 → BLOQUEA
--
-- IDEMPOTENTE: redefine la función con CREATE OR REPLACE.
-- ============================================================

CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
  conflict_booking_number TEXT;
  vehicle_code TEXT;
BEGIN
  IF NEW.status IN ('cancelled', 'pending') THEN
    IF NEW.dropoff_date < NEW.pickup_date THEN
      RAISE EXCEPTION 'FECHA_INVALIDA: La fecha de devolución debe ser posterior o igual a la de recogida.';
    END IF;
    RETURN NEW;
  END IF;

  SELECT internal_code INTO vehicle_code
  FROM vehicles
  WHERE id = NEW.vehicle_id;

  SELECT COUNT(*), MIN(booking_number)
  INTO conflict_count, conflict_booking_number
  FROM bookings
  WHERE
    id != NEW.id
    AND vehicle_id = NEW.vehicle_id
    AND status IN ('confirmed', 'in_progress', 'completed')
    AND (pickup_date::text || ' ' || COALESCE(pickup_time, '10:00'))::timestamp
        < (NEW.dropoff_date::text || ' ' || COALESCE(NEW.dropoff_time, '10:00'))::timestamp
    AND (dropoff_date::text || ' ' || COALESCE(dropoff_time, '10:00'))::timestamp
        > (NEW.pickup_date::text || ' ' || COALESCE(NEW.pickup_time, '10:00'))::timestamp;

  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'CONFLICTO_RESERVA: El vehículo % ya tiene una reserva activa que solapa con las fechas % a %. Reserva conflictiva: %. Selecciona otras fechas o un vehículo diferente.',
      COALESCE(vehicle_code, 'seleccionado'),
      NEW.pickup_date,
      NEW.dropoff_date,
      COALESCE(conflict_booking_number, 'desconocida');
  END IF;

  IF NEW.dropoff_date < NEW.pickup_date THEN
    RAISE EXCEPTION 'FECHA_INVALIDA: La fecha de devolución (%) debe ser posterior o igual a la de recogida (%).',
      NEW.dropoff_date,
      NEW.pickup_date;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_booking_conflicts ON bookings;
CREATE TRIGGER prevent_booking_conflicts
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_conflicts();

COMMENT ON FUNCTION check_booking_conflicts() IS
  'Bloquea solapamientos con reservas activas (confirmed/in_progress/completed) usando fecha+hora. Las pending pueden coexistir. No expone PII.';

-- Verificación posterior
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'prevent_booking_conflicts';
