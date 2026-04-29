-- ============================================
-- TRIGGER: Prevenir conflictos de reservas
-- ============================================
-- Objetivo: Evitar que se creen o actualicen reservas con fechas
-- que se solapen con OTRAS RESERVAS ACTIVAS del mismo vehículo.
--
-- 🆕 ACTUALIZACIÓN 29/04/2026:
--   - Las reservas con `status = 'pending'` (carrito sin pagar) NO
--     bloquean. Solo bloquean las "activas":
--       confirmed / in_progress / completed.
--     Razón: si una pending no paga, debe poder ser desbancada por
--     una pending nueva (lógica "última pending gana"). La aplicación
--     se encarga de cancelar la pending anterior antes del INSERT.
--   - El mensaje de error YA NO incluye `customer_name` (RGPD).
-- ============================================

-- PASO 1: Crear función que verifica conflictos
CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
  conflict_booking_number TEXT;
  vehicle_code TEXT;
BEGIN
  -- No validar reservas canceladas ni pendientes (las pending pueden coexistir;
  -- la lógica de "última pending gana" se aplica desde la API)
  IF NEW.status IN ('cancelled', 'pending') THEN
    -- Aun así validamos coherencia de fechas
    IF NEW.dropoff_date < NEW.pickup_date THEN
      RAISE EXCEPTION 'FECHA_INVALIDA: La fecha de devolución debe ser posterior o igual a la de recogida.';
    END IF;
    RETURN NEW;
  END IF;

  -- Obtener código del vehículo para mensajes más claros (sin datos personales)
  SELECT internal_code INTO vehicle_code
  FROM vehicles
  WHERE id = NEW.vehicle_id;

  -- Buscar SOLO reservas ACTIVAS conflictivas (mismo criterio que la API)
  -- (otras reservas del mismo vehículo con status operativo y fechas solapadas)
  SELECT COUNT(*), MIN(booking_number)
  INTO conflict_count, conflict_booking_number
  FROM bookings
  WHERE
    id != NEW.id  -- Excluir la reserva actual (para UPDATE)
    AND vehicle_id = NEW.vehicle_id
    AND status IN ('confirmed', 'in_progress', 'completed')
    AND pickup_date <= NEW.dropoff_date
    AND dropoff_date >= NEW.pickup_date;

  -- Si hay conflictos, lanzar error SIN datos personales (RGPD)
  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'CONFLICTO_RESERVA: El vehículo % ya tiene una reserva activa que solapa con las fechas % a %. Reserva conflictiva: %. Selecciona otras fechas o un vehículo diferente.',
      COALESCE(vehicle_code, 'seleccionado'),
      NEW.pickup_date,
      NEW.dropoff_date,
      COALESCE(conflict_booking_number, 'desconocida');
  END IF;

  -- Verificar que la fecha de devolución sea posterior a la de recogida
  IF NEW.dropoff_date < NEW.pickup_date THEN
    RAISE EXCEPTION 'FECHA_INVALIDA: La fecha de devolución (%) debe ser posterior o igual a la de recogida (%).',
      NEW.dropoff_date,
      NEW.pickup_date;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 2: Crear trigger para INSERT y UPDATE
DROP TRIGGER IF EXISTS prevent_booking_conflicts ON bookings;

CREATE TRIGGER prevent_booking_conflicts
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_conflicts();

-- PASO 3: Comentarios descriptivos
COMMENT ON FUNCTION check_booking_conflicts() IS 'Valida que no haya reservas solapadas para el mismo vehículo';
COMMENT ON TRIGGER prevent_booking_conflicts ON bookings IS 'Previene la creación de reservas con fechas conflictivas';

-- ============================================
-- VERIFICACIÓN DEL TRIGGER
-- ============================================

-- Para probar el trigger, puedes intentar crear una reserva conflictiva:
/*
-- Esto debería fallar si ya existe una reserva para ese vehículo en esas fechas
INSERT INTO bookings (
  booking_number,
  vehicle_id,
  customer_id,
  pickup_date,
  dropoff_date,
  status
) VALUES (
  'TEST-CONFLICT',
  (SELECT id FROM vehicles LIMIT 1),
  (SELECT id FROM customers LIMIT 1),
  '2026-03-27',
  '2026-04-03',
  'pending'
);
*/

-- ============================================
-- PARA DESACTIVAR EL TRIGGER (temporalmente):
-- ============================================
-- ALTER TABLE bookings DISABLE TRIGGER prevent_booking_conflicts;

-- ============================================
-- PARA REACTIVAR EL TRIGGER:
-- ============================================
-- ALTER TABLE bookings ENABLE TRIGGER prevent_booking_conflicts;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Este trigger previene conflictos en el futuro
-- 2. NO corrige conflictos existentes (usa check-booking-conflicts.sql para detectarlos)
-- 3. El trigger permite actualizar una reserva cancelada a activa solo si no hay conflictos
-- 4. El trigger NO permite crear dos reservas con fechas idénticas
-- 5. El trigger valida que dropoff_date >= pickup_date
-- 6. El mensaje de error incluye información del vehículo y la reserva conflictiva
-- 
-- IMPORTANTE: Si hay conflictos existentes en la base de datos:
-- a) Ejecuta check-booking-conflicts.sql para identificarlos
-- b) Corrige manualmente las reservas conflictivas
-- c) Luego instala este trigger
-- 
-- Si necesitas instalar el trigger aunque haya conflictos (emergencia):
-- 1. Desactiva temporalmente: ALTER TABLE bookings DISABLE TRIGGER prevent_booking_conflicts;
-- 2. Corrige los conflictos manualmente
-- 3. Reactiva el trigger: ALTER TABLE bookings ENABLE TRIGGER prevent_booking_conflicts;
-- ============================================
