-- ============================================
-- TRIGGER: Prevenir conflictos de reservas
-- ============================================
-- Objetivo: Evitar que se creen o actualicen reservas con fechas
-- que se solapen con otras reservas del mismo vehículo
-- ============================================

-- PASO 1: Crear función que verifica conflictos
CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
DECLARE
  conflict_count INTEGER;
  conflict_booking_number TEXT;
  conflict_customer TEXT;
  vehicle_code TEXT;
BEGIN
  -- Solo verificar si la reserva no está cancelada
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  -- Obtener código del vehículo para mensajes más claros
  SELECT internal_code INTO vehicle_code
  FROM vehicles
  WHERE id = NEW.vehicle_id;

  -- Buscar reservas conflictivas
  -- (otras reservas del mismo vehículo con fechas solapadas)
  SELECT COUNT(*), MIN(booking_number), MIN(customer_name)
  INTO conflict_count, conflict_booking_number, conflict_customer
  FROM bookings
  WHERE 
    id != NEW.id  -- Excluir la reserva actual (para UPDATE)
    AND vehicle_id = NEW.vehicle_id
    AND status != 'cancelled'
    AND (
      -- Caso 1: La nueva reserva empieza dentro de una reserva existente
      (NEW.pickup_date >= pickup_date AND NEW.pickup_date <= dropoff_date)
      -- Caso 2: La nueva reserva termina dentro de una reserva existente
      OR (NEW.dropoff_date >= pickup_date AND NEW.dropoff_date <= dropoff_date)
      -- Caso 3: La nueva reserva engloba completamente una reserva existente
      OR (NEW.pickup_date <= pickup_date AND NEW.dropoff_date >= dropoff_date)
    );

  -- Si hay conflictos, lanzar error con información detallada
  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'CONFLICTO DE RESERVA: El vehículo % ya tiene % reserva(s) activa(s) en ese período. Primera reserva conflictiva: % (%). Fechas solicitadas: % al %. Por favor, selecciona otras fechas o un vehículo diferente.',
      COALESCE(vehicle_code, 'seleccionado'),
      conflict_count,
      conflict_booking_number,
      COALESCE(conflict_customer, 'Sin cliente'),
      NEW.pickup_date,
      NEW.dropoff_date;
  END IF;

  -- Verificar que la fecha de devolución sea posterior a la de recogida
  IF NEW.dropoff_date < NEW.pickup_date THEN
    RAISE EXCEPTION 'FECHA INVÁLIDA: La fecha de devolución (%) debe ser posterior o igual a la fecha de recogida (%)',
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
