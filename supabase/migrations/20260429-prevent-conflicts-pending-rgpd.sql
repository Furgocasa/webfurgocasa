-- ============================================================
-- 2026-04-29 — Trigger prevent_booking_conflicts: regla "última
-- pending gana" + eliminación de PII en mensajes (RGPD).
-- ------------------------------------------------------------
-- CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR:
--
--   1) Las reservas en `status = 'pending'` ya NO disparan
--      conflicto. Solo bloquean las activas:
--        confirmed / in_progress / completed.
--      La aplicación (`/api/bookings/create`) cancela
--      automáticamente las pendings solapantes ANTES del INSERT
--      ("última pending gana"). Si una `pending` se intentase
--      crear sin esa cancelación previa, el trigger ya no
--      la rechaza: es responsabilidad de la app cuidar la
--      coherencia.
--
--   2) El mensaje de RAISE EXCEPTION ya NO incluye
--      `customer_name`. Antes el mensaje exponía el nombre
--      del otro cliente al usuario final → brecha de RGPD.
--
-- IDEMPOTENTE: redefine la función con CREATE OR REPLACE.
-- El trigger se mantiene apuntando a la misma función
-- (no es necesario tocarlo si ya existe).
--
-- VERIFICACIÓN previa recomendada:
--   SELECT tgname, tgenabled FROM pg_trigger
--   WHERE tgname = 'prevent_booking_conflicts';
-- Si no existe, ejecuta antes:
--   supabase/migrations/prevent-booking-conflicts.sql
-- ============================================================

CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
  conflict_booking_number TEXT;
  vehicle_code TEXT;
BEGIN
  -- Las reservas canceladas NO se validan.
  -- Las pendientes tampoco se validan contra otras (pueden coexistir;
  -- la API se encarga de la regla "última pending gana"). Aun así
  -- comprobamos la coherencia de sus fechas.
  IF NEW.status IN ('cancelled', 'pending') THEN
    IF NEW.dropoff_date < NEW.pickup_date THEN
      RAISE EXCEPTION 'FECHA_INVALIDA: La fecha de devolución debe ser posterior o igual a la de recogida.';
    END IF;
    RETURN NEW;
  END IF;

  -- Obtener código del vehículo (mensaje sin datos personales)
  SELECT internal_code INTO vehicle_code
  FROM vehicles
  WHERE id = NEW.vehicle_id;

  -- Buscar SOLO reservas ACTIVAS conflictivas
  SELECT COUNT(*), MIN(booking_number)
  INTO conflict_count, conflict_booking_number
  FROM bookings
  WHERE
    id != NEW.id
    AND vehicle_id = NEW.vehicle_id
    AND status IN ('confirmed', 'in_progress', 'completed')
    AND pickup_date <= NEW.dropoff_date
    AND dropoff_date >= NEW.pickup_date;

  IF conflict_count > 0 THEN
    -- ⚠️ RGPD: NO incluir customer_name ni customer_email aquí.
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

-- Asegurar que el trigger está enlazado y activo
DROP TRIGGER IF EXISTS prevent_booking_conflicts ON bookings;
CREATE TRIGGER prevent_booking_conflicts
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_conflicts();

COMMENT ON FUNCTION check_booking_conflicts() IS
  'Bloquea solapamientos con reservas activas (confirmed/in_progress/completed). Las pending pueden coexistir; la API aplica la regla última-pending-gana. No expone PII.';

-- Verificación posterior
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'prevent_booking_conflicts';
