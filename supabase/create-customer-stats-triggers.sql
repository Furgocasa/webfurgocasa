-- ============================================
-- TRIGGERS PARA ACTUALIZAR ESTADÍSTICAS DE CLIENTES
-- ============================================
-- Fecha: 20 Enero 2026
-- Versión: 1.0.5
-- Propósito: Mantener actualizados total_bookings y total_spent en tabla customers
-- ============================================

-- FUNCIÓN: Actualizar estadísticas del cliente
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_total_bookings INTEGER;
    v_total_spent DECIMAL(12,2);
BEGIN
    -- Determinar el customer_id según el tipo de operación
    IF TG_OP = 'DELETE' THEN
        v_customer_id := OLD.customer_id;
    ELSE
        v_customer_id := NEW.customer_id;
    END IF;

    -- Si no hay customer_id, salir
    IF v_customer_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Calcular estadísticas del cliente
    SELECT 
        COUNT(*) as total,
        COALESCE(SUM(CASE 
            WHEN status != 'cancelled' THEN total_price 
            ELSE 0 
        END), 0) as spent
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

    -- Para debugging (opcional, comentar en producción)
    RAISE NOTICE 'Customer % stats updated: bookings=%, spent=%', 
        v_customer_id, v_total_bookings, v_total_spent;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_customer_stats() IS 'Actualiza total_bookings y total_spent en customers basándose en sus reservas';

-- ============================================
-- TRIGGER 1: Al insertar una nueva reserva
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_customer_stats_on_insert ON bookings;

CREATE TRIGGER trigger_update_customer_stats_on_insert
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();

COMMENT ON TRIGGER trigger_update_customer_stats_on_insert ON bookings IS 
    'Actualiza estadísticas del cliente cuando se crea una reserva';

-- ============================================
-- TRIGGER 2: Al actualizar una reserva
-- ============================================
-- Solo si cambian campos relevantes: status, total_price, o customer_id
DROP TRIGGER IF EXISTS trigger_update_customer_stats_on_update ON bookings;

CREATE TRIGGER trigger_update_customer_stats_on_update
    AFTER UPDATE OF status, total_price, customer_id ON bookings
    FOR EACH ROW
    WHEN (
        OLD.status IS DISTINCT FROM NEW.status OR
        OLD.total_price IS DISTINCT FROM NEW.total_price OR
        OLD.customer_id IS DISTINCT FROM NEW.customer_id
    )
    EXECUTE FUNCTION update_customer_stats();

COMMENT ON TRIGGER trigger_update_customer_stats_on_update ON bookings IS 
    'Actualiza estadísticas del cliente cuando cambia status, precio o customer_id de una reserva';

-- ============================================
-- TRIGGER 3: Al eliminar una reserva
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_customer_stats_on_delete ON bookings;

CREATE TRIGGER trigger_update_customer_stats_on_delete
    AFTER DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_stats();

COMMENT ON TRIGGER trigger_update_customer_stats_on_delete ON bookings IS 
    'Actualiza estadísticas del cliente cuando se elimina una reserva';

-- ============================================
-- RECALCULAR ESTADÍSTICAS PARA TODOS LOS CLIENTES EXISTENTES
-- ============================================
-- Este query actualiza TODOS los clientes con sus stats correctas
-- EJECUTAR UNA SOLA VEZ después de crear los triggers

UPDATE customers c
SET 
    total_bookings = (
        SELECT COUNT(*)
        FROM bookings b
        WHERE b.customer_id = c.id
    ),
    total_spent = (
        SELECT COALESCE(SUM(b.total_price), 0)
        FROM bookings b
        WHERE b.customer_id = c.id
          AND b.status != 'cancelled'
    ),
    updated_at = NOW();

-- Verificar resultados
SELECT 
    id,
    name,
    email,
    total_bookings,
    total_spent,
    updated_at
FROM customers
WHERE total_bookings > 0
ORDER BY total_spent DESC
LIMIT 10;

-- ============================================
-- TESTING
-- ============================================
/*
-- TEST 1: Verificar que los triggers existen
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%customer_stats%'
ORDER BY trigger_name;

-- TEST 2: Verificar un cliente específico
SELECT 
    c.id,
    c.name,
    c.email,
    c.total_bookings,
    c.total_spent,
    COUNT(b.id) as actual_bookings,
    COALESCE(SUM(CASE WHEN b.status != 'cancelled' THEN b.total_price ELSE 0 END), 0) as actual_spent
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id
WHERE c.email = 'manuel-galiano@hotmail.com'  -- Ejemplo
GROUP BY c.id, c.name, c.email, c.total_bookings, c.total_spent;

-- TEST 3: Encontrar discrepancias (si las hay después de recalcular)
WITH stats AS (
    SELECT 
        customer_id,
        COUNT(*) as bookings_count,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0) as total_amount
    FROM bookings
    WHERE customer_id IS NOT NULL
    GROUP BY customer_id
)
SELECT 
    c.id,
    c.name,
    c.email,
    c.total_bookings as stored_bookings,
    stats.bookings_count as actual_bookings,
    c.total_spent as stored_spent,
    stats.total_amount as actual_spent,
    (c.total_bookings != stats.bookings_count) as bookings_mismatch,
    (c.total_spent != stats.total_amount) as spent_mismatch
FROM customers c
LEFT JOIN stats ON c.id = stats.customer_id
WHERE c.total_bookings > 0 OR stats.bookings_count > 0
ORDER BY c.total_spent DESC;
*/

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Después de ejecutar este script:
-- 1. Los 3 triggers estarán activos
-- 2. Todas las estadísticas de clientes estarán actualizadas
-- 3. Cualquier cambio futuro en bookings actualizará automáticamente las stats
-- ============================================

-- Estadísticas finales
SELECT 
    'Triggers creados y stats actualizadas' as status,
    COUNT(*) FILTER (WHERE total_bookings > 0) as customers_with_bookings,
    SUM(total_bookings) as total_bookings_all,
    SUM(total_spent) as total_revenue
FROM customers;
