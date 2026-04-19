-- ============================================
-- CANCELACIÓN AUTOMÁTICA DE OFERTAS EN CONFLICTO
-- ============================================
-- Cuando se crea o confirma una reserva, este trigger automáticamente
-- cancela cualquier oferta de última hora que se solape con esas fechas
-- 
-- Autor: Sistema Furgocasa
-- Fecha: Febrero 2026
-- ============================================

-- Función que cancela ofertas en conflicto
CREATE OR REPLACE FUNCTION auto_cancel_conflicting_offers()
RETURNS TRIGGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  -- Solo actuar si la reserva está confirmada/activa/completada
  IF NEW.status IN ('confirmed', 'active', 'completed') THEN
    
    -- Cancelar ofertas publicadas que se solapen con esta reserva
    UPDATE last_minute_offers
    SET 
      status = 'auto_cancelled',
      updated_at = NOW(),
      admin_notes = COALESCE(admin_notes || E'\n\n', '') || 
        'Cancelada automáticamente por reserva ' || NEW.id || 
        ' del ' || NEW.pickup_date || ' al ' || NEW.dropoff_date
    WHERE 
      vehicle_id = NEW.vehicle_id
      AND status = 'published'
      AND (
        -- La oferta se solapa con la reserva
        (offer_start_date <= NEW.dropoff_date AND offer_end_date >= NEW.pickup_date)
      );
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    
    -- Log para debug (opcional)
    IF affected_count > 0 THEN
      RAISE NOTICE 'Auto-canceladas % ofertas por reserva % (vehículo %, fechas: % - %)',
        affected_count, NEW.id, NEW.vehicle_id, NEW.pickup_date, NEW.dropoff_date;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger AFTER INSERT (cuando se crea una reserva)
DROP TRIGGER IF EXISTS trigger_cancel_offers_on_insert ON bookings;
CREATE TRIGGER trigger_cancel_offers_on_insert
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_cancel_conflicting_offers();

-- Crear trigger AFTER UPDATE (cuando se actualiza el estado de una reserva)
DROP TRIGGER IF EXISTS trigger_cancel_offers_on_update ON bookings;
CREATE TRIGGER trigger_cancel_offers_on_update
  AFTER UPDATE ON bookings
  FOR EACH ROW
  WHEN (
    -- Solo si cambió el estado a confirmada/activa/completada
    NEW.status IN ('confirmed', 'active', 'completed') 
    AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.pickup_date IS DISTINCT FROM NEW.pickup_date OR OLD.dropoff_date IS DISTINCT FROM NEW.dropoff_date)
  )
  EXECUTE FUNCTION auto_cancel_conflicting_offers();

-- ============================================
-- COMENTARIOS Y NOTAS
-- ============================================
-- 
-- ¿Qué hace este trigger?
-- ------------------------
-- Cuando se crea o actualiza una reserva con estado confirmado/activo/completado:
-- 1. Busca ofertas de última hora del mismo vehículo con estado 'published'
-- 2. Verifica si las fechas se solapan
-- 3. Cambia el estado a 'auto_cancelled'
-- 4. Añade una nota automática explicando por qué se canceló
--
-- Estados de oferta:
-- -------------------
-- - published: Visible en la web, disponible
-- - auto_cancelled: Cancelada automáticamente por solapamiento con reserva
-- - cancelled: Cancelada manualmente por el admin
-- - expired: Expirada por fecha pasada
-- - reserved: Alguien la reservó exitosamente
-- - ignored: Admin decidió no publicarla
--
-- Casos que detecta:
-- ------------------
-- 1. Reserva cubre toda la oferta: pickup <= offer_start AND dropoff >= offer_end
-- 2. Reserva solapa inicio: pickup <= offer_start AND dropoff entre offer_start y offer_end
-- 3. Reserva solapa final: pickup entre offer_start y offer_end AND dropoff >= offer_end
-- 4. Reserva está dentro: pickup >= offer_start AND dropoff <= offer_end
--
-- Testing:
-- --------
-- Para probar manualmente:
-- 
-- 1. Crear una oferta:
-- INSERT INTO last_minute_offers (
--   vehicle_id, 
--   offer_start_date, 
--   offer_end_date, 
--   status
-- ) VALUES (
--   'uuid-del-vehiculo',
--   '2026-08-15',
--   '2026-08-20',
--   'published'
-- );
--
-- 2. Crear una reserva solapada:
-- INSERT INTO bookings (
--   vehicle_id,
--   pickup_date,
--   dropoff_date,
--   status
-- ) VALUES (
--   'uuid-del-vehiculo',
--   '2026-08-17',
--   '2026-08-22',
--   'confirmed'
-- );
--
-- 3. Verificar que la oferta se canceló:
-- SELECT status, admin_notes FROM last_minute_offers WHERE id = 'uuid-de-la-oferta';
-- -- Debería mostrar status = 'auto_cancelled'
--
-- ============================================
