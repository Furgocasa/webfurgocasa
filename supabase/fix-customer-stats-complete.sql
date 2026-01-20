-- ============================================
-- FIX COMPLETO: ESTADÍSTICAS DE CLIENTES
-- ============================================
-- Fecha: 20 Enero 2026
-- Versión: 1.1 - MEJORADA
-- Propósito: 
--   1. Recalcular total_bookings y total_spent desde las reservas existentes
--   2. Crear/actualizar triggers para mantener estos datos sincronizados
--   3. Validar que todo funciona correctamente
-- ============================================

-- ============================================
-- PARTE 1: REPORTE INICIAL
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'INICIANDO FIX DE ESTADÍSTICAS DE CLIENTES';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- Ver estado actual ANTES del fix
SELECT 
    'ESTADO ANTES DEL FIX' as reporte,
    COUNT(*) as total_customers,
    COUNT(*) FILTER (WHERE total_bookings > 0) as customers_with_bookings_stored,
    SUM(total_bookings) as total_bookings_stored,
    ROUND(SUM(total_spent)::numeric, 2) as total_spent_stored
FROM customers;

-- Ver cuántas reservas reales hay
SELECT 
    'RESERVAS EN LA BASE DE DATOS' as reporte,
    COUNT(*) as total_bookings_real,
    COUNT(DISTINCT customer_id) as unique_customers_with_bookings,
    ROUND(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END)::numeric, 2) as total_revenue_real
FROM bookings
WHERE customer_id IS NOT NULL;

-- ============================================
-- PARTE 2: CREAR/ACTUALIZAR LA FUNCIÓN
-- ============================================
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_old_customer_id UUID;
    v_total_bookings INTEGER;
    v_total_spent DECIMAL(12,2);
BEGIN
    -- Determinar el customer_id según el tipo de operación
    IF TG_OP = 'DELETE' THEN
        v_customer_id := OLD.customer_id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_customer_id := NEW.customer_id;
        v_old_customer_id := OLD.customer_id;
        
        -- Si cambió el customer_id, actualizar ambos clientes
        IF v_old_customer_id IS NOT NULL AND v_old_customer_id != v_customer_id THEN
            -- Actualizar el cliente antiguo
            SELECT 
                COUNT(*),
                COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0)
            INTO v_total_bookings, v_total_spent
            FROM bookings
            WHERE customer_id = v_old_customer_id;
            
            UPDATE customers
            SET 
                total_bookings = v_total_bookings,
                total_spent = v_total_spent,
                updated_at = NOW()
            WHERE id = v_old_customer_id;
        END IF;
    ELSE
        v_customer_id := NEW.customer_id;
    END IF;

    -- Si no hay customer_id, salir
    IF v_customer_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Calcular estadísticas del cliente actual
    SELECT 
        COUNT(*),
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0)
    INTO v_total_bookings, v_total_spent
    FROM bookings
    WHERE customer_id = v_customer_id;

    -- Actualizar la tabla customers
    UPDATE customers
    SET 
        total_bookings = v_total_bookings,
        total_spent = v_total_spent,
        updated_at = NOW()
    WHERE id = v_customer_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_customer_stats() IS 
    'v1.1 - Actualiza total_bookings y total_spent en customers. Maneja INSERT, UPDATE (incluso cambio de customer_id), DELETE';

-- ============================================
-- PARTE 3: CREAR/RECREAR LOS TRIGGERS
-- ============================================

-- TRIGGER 1: Al insertar una nueva reserva
DROP TRIGGER IF EXISTS trigger_update_customer_stats_on_insert ON bookings;
CREATE TRIGGER trigger_update_customer_stats_on_insert
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();

COMMENT ON TRIGGER trigger_update_customer_stats_on_insert ON bookings IS 
    'Actualiza estadísticas del cliente cuando se crea una reserva';

-- TRIGGER 2: Al actualizar una reserva
DROP TRIGGER IF EXISTS trigger_update_customer_stats_on_update ON bookings;
CREATE TRIGGER trigger_update_customer_stats_on_update
    AFTER UPDATE ON bookings
    FOR EACH ROW
    WHEN (
        OLD.status IS DISTINCT FROM NEW.status OR
        OLD.total_price IS DISTINCT FROM NEW.total_price OR
        OLD.customer_id IS DISTINCT FROM NEW.customer_id
    )
    EXECUTE FUNCTION update_customer_stats();

COMMENT ON TRIGGER trigger_update_customer_stats_on_update ON bookings IS 
    'Actualiza estadísticas cuando cambia status, precio o customer_id de una reserva';

-- TRIGGER 3: Al eliminar una reserva
DROP TRIGGER IF EXISTS trigger_update_customer_stats_on_delete ON bookings;
CREATE TRIGGER trigger_update_customer_stats_on_delete
    AFTER DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();

COMMENT ON TRIGGER trigger_update_customer_stats_on_delete ON bookings IS 
    'Actualiza estadísticas del cliente cuando se elimina una reserva';

-- ============================================
-- PARTE 4: RECALCULAR TODAS LAS ESTADÍSTICAS
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RECALCULANDO ESTADÍSTICAS PARA TODOS LOS CLIENTES...';
    RAISE NOTICE '========================================';
END $$;

-- Actualizar TODOS los clientes con sus estadísticas correctas
UPDATE customers c
SET 
    total_bookings = COALESCE((
        SELECT COUNT(*)
        FROM bookings b
        WHERE b.customer_id = c.id
    ), 0),
    total_spent = COALESCE((
        SELECT SUM(b.total_price)
        FROM bookings b
        WHERE b.customer_id = c.id
          AND b.status != 'cancelled'
    ), 0),
    updated_at = NOW();

-- ============================================
-- PARTE 5: VALIDACIÓN Y REPORTES FINALES
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ PROCESO COMPLETADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- Verificar que los triggers están activos
SELECT 
    '1️⃣  TRIGGERS ACTIVOS' as seccion,
    trigger_name,
    event_manipulation as evento,
    action_timing as timing
FROM information_schema.triggers
WHERE trigger_name LIKE '%customer_stats%'
  AND event_object_table = 'bookings'
ORDER BY trigger_name;

-- Estado DESPUÉS del fix
SELECT 
    '2️⃣  ESTADO DESPUÉS DEL FIX' as seccion,
    COUNT(*) as total_customers,
    COUNT(*) FILTER (WHERE total_bookings > 0) as customers_with_bookings,
    SUM(total_bookings) as total_bookings_count,
    ROUND(SUM(total_spent)::numeric, 2) as total_revenue
FROM customers;

-- Top 10 clientes por gasto
SELECT 
    '3️⃣  TOP 10 CLIENTES POR GASTO' as seccion,
    name,
    email,
    total_bookings,
    ROUND(total_spent::numeric, 2) as total_spent
FROM customers
WHERE total_bookings > 0
ORDER BY total_spent DESC
LIMIT 10;

-- Validación: Verificar que no hay discrepancias
WITH calculated_stats AS (
    SELECT 
        customer_id,
        COUNT(*) as calc_bookings,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0) as calc_spent
    FROM bookings
    WHERE customer_id IS NOT NULL
    GROUP BY customer_id
)
SELECT 
    '4️⃣  VALIDACIÓN: DISCREPANCIAS' as seccion,
    COUNT(*) as customers_checked,
    COUNT(*) FILTER (WHERE c.total_bookings != cs.calc_bookings) as bookings_mismatches,
    COUNT(*) FILTER (WHERE ABS(c.total_spent - cs.calc_spent) > 0.01) as spent_mismatches
FROM customers c
INNER JOIN calculated_stats cs ON c.id = cs.customer_id;

-- Clientes sin customer_id en sus reservas (dato importante)
SELECT 
    '5️⃣  RESERVAS SIN CUSTOMER_ID' as seccion,
    COUNT(*) as bookings_sin_customer,
    ROUND(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END)::numeric, 2) as revenue_perdido
FROM bookings
WHERE customer_id IS NULL;

-- ============================================
-- PARTE 6: NOTAS Y RECOMENDACIONES
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'NOTAS IMPORTANTES:';
    RAISE NOTICE '========================================';
    RAISE NOTICE '1. Los triggers están activos y funcionarán automáticamente';
    RAISE NOTICE '2. Todas las estadísticas han sido recalculadas';
    RAISE NOTICE '3. Los cambios futuros en bookings actualizarán automáticamente las stats';
    RAISE NOTICE '4. Si hay reservas sin customer_id, considera asignarles un cliente';
    RAISE NOTICE '';
    RAISE NOTICE 'PRÓXIMOS PASOS:';
    RAISE NOTICE '- Verificar los resultados en el panel de administración';
    RAISE NOTICE '- Revisar el reporte "RESERVAS SIN CUSTOMER_ID" si hay datos';
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
