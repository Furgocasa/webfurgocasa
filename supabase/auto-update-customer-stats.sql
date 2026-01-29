-- ============================================
-- AUTO-ACTUALIZAR ESTADÍSTICAS DE CLIENTES
-- ============================================
-- Este script crea triggers que mantienen sincronizados
-- automáticamente los campos total_bookings y total_spent
-- de la tabla customers cada vez que se crea, modifica
-- o elimina una reserva.
--
-- PROBLEMA RESUELTO:
-- - Evita condiciones de carrera (race conditions)
-- - Elimina duplicación de lógica entre API y DB
-- - Garantiza consistencia atómica de datos
-- - Actualiza contadores incluso si se crean reservas
--   desde admin, scripts o cualquier otro lugar
-- ============================================

-- ============================================
-- PASO 1: Crear función de recálculo
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id UUID;
  v_total_bookings INTEGER;
  v_total_spent NUMERIC;
BEGIN
  -- Determinar el customer_id según la operación
  IF TG_OP = 'DELETE' THEN
    v_customer_id := OLD.customer_id;
  ELSE
    v_customer_id := NEW.customer_id;
  END IF;
  
  -- Si no hay customer_id, salir
  IF v_customer_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;
  
  -- Calcular estadísticas reales desde bookings
  -- Solo contamos reservas NO canceladas
  SELECT 
    COUNT(*),
    COALESCE(SUM(total_price), 0)
  INTO 
    v_total_bookings,
    v_total_spent
  FROM bookings
  WHERE customer_id = v_customer_id
    AND status != 'cancelled';
  
  -- Actualizar la tabla customers
  UPDATE customers
  SET 
    total_bookings = v_total_bookings,
    total_spent = v_total_spent,
    updated_at = NOW()
  WHERE id = v_customer_id;
  
  -- Devolver el registro apropiado
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 2: Crear triggers
-- ============================================

-- Eliminar triggers anteriores si existen
DROP TRIGGER IF EXISTS trigger_update_customer_stats_insert ON bookings;
DROP TRIGGER IF EXISTS trigger_update_customer_stats_update ON bookings;
DROP TRIGGER IF EXISTS trigger_update_customer_stats_delete ON bookings;

-- Trigger para INSERT: Nueva reserva creada
CREATE TRIGGER trigger_update_customer_stats_insert
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_customer_stats();

-- Trigger para UPDATE: Reserva modificada
-- Solo se dispara si cambia customer_id, status o total_price
CREATE TRIGGER trigger_update_customer_stats_update
  AFTER UPDATE ON bookings
  FOR EACH ROW
  WHEN (
    OLD.customer_id IS DISTINCT FROM NEW.customer_id OR
    OLD.status IS DISTINCT FROM NEW.status OR
    OLD.total_price IS DISTINCT FROM NEW.total_price
  )
  EXECUTE FUNCTION recalculate_customer_stats();

-- Trigger para DELETE: Reserva eliminada
CREATE TRIGGER trigger_update_customer_stats_delete
  AFTER DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_customer_stats();

-- ============================================
-- PASO 3: Corregir inconsistencias actuales
-- ============================================
-- Este UPDATE corrige todos los contadores que
-- estén desincronizados. Ejecutar una sola vez.

DO $$
DECLARE
  v_rows_updated INTEGER;
BEGIN
  -- Actualizar clientes con inconsistencias
  WITH real_stats AS (
    SELECT 
      customer_id,
      COUNT(*) as real_bookings,
      COALESCE(SUM(total_price), 0) as real_spent
    FROM bookings
    WHERE status != 'cancelled'
    GROUP BY customer_id
  )
  UPDATE customers c
  SET 
    total_bookings = COALESCE(rs.real_bookings, 0),
    total_spent = COALESCE(rs.real_spent, 0),
    updated_at = NOW()
  FROM real_stats rs
  WHERE c.id = rs.customer_id
    AND (
      c.total_bookings != rs.real_bookings 
      OR c.total_spent != rs.real_spent
    );
  
  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
  
  -- También actualizar clientes que tienen contadores pero no tienen reservas
  UPDATE customers
  SET 
    total_bookings = 0,
    total_spent = 0,
    updated_at = NOW()
  WHERE (total_bookings > 0 OR total_spent > 0)
    AND id NOT IN (
      SELECT DISTINCT customer_id 
      FROM bookings 
      WHERE status != 'cancelled' AND customer_id IS NOT NULL
    );
  
  RAISE NOTICE 'Corrección completada. % clientes actualizados.', v_rows_updated;
END $$;

-- ============================================
-- PASO 4: Verificación
-- ============================================
-- Script para verificar que no quedan inconsistencias

SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ ÉXITO: No hay inconsistencias en los contadores de clientes'
    ELSE '⚠️ ADVERTENCIA: Hay ' || COUNT(*) || ' clientes con inconsistencias'
  END as verificacion
FROM (
  SELECT c.id
  FROM customers c
  LEFT JOIN bookings b ON b.customer_id = c.id AND b.status != 'cancelled'
  GROUP BY c.id, c.total_bookings, c.total_spent
  HAVING 
    COUNT(b.id) != c.total_bookings 
    OR COALESCE(SUM(b.total_price), 0) != c.total_spent
) as inconsistencias;

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================
COMMENT ON FUNCTION recalculate_customer_stats() IS 
'Recalcula automáticamente total_bookings y total_spent de un cliente cuando se crea, modifica o elimina una reserva. Solo cuenta reservas con status != cancelled.';

COMMENT ON TRIGGER trigger_update_customer_stats_insert ON bookings IS
'Actualiza estadísticas del cliente cuando se crea una nueva reserva';

COMMENT ON TRIGGER trigger_update_customer_stats_update ON bookings IS
'Actualiza estadísticas del cliente cuando cambia customer_id, status o total_price de una reserva';

COMMENT ON TRIGGER trigger_update_customer_stats_delete ON bookings IS
'Actualiza estadísticas del cliente cuando se elimina una reserva';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
SELECT 'Triggers de actualización de estadísticas de clientes instalados correctamente' as status;
