-- ============================================
-- TRIGGER: Auto-actualizar días en reservas
-- ============================================
-- Este trigger calcula automáticamente el número de días
-- cuando se crean o modifican las fechas de una reserva

CREATE OR REPLACE FUNCTION calculate_booking_days()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular días basándose en la diferencia entre fechas
  -- En PostgreSQL, restar dos DATE devuelve directamente el número de días (INTEGER)
  NEW.days := (NEW.dropoff_date - NEW.pickup_date);
  
  -- Asegurar que sea al menos 1 día
  IF NEW.days < 1 THEN
    NEW.days := 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_calculate_booking_days ON public.bookings;

-- Crear trigger que se ejecute ANTES de INSERT o UPDATE
CREATE TRIGGER trigger_calculate_booking_days
  BEFORE INSERT OR UPDATE OF pickup_date, dropoff_date ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_booking_days();

-- Comentario
COMMENT ON FUNCTION calculate_booking_days() IS 'Calcula automáticamente el número de días de una reserva basándose en las fechas de recogida y devolución';
