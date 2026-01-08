-- ============================================================
-- POLÍTICA DE PAGOS FRACCIONADOS DE FURGOCASA
-- ============================================================
-- 
-- REGLA GENERAL:
-- --------------
-- 1. PRIMER PAGO (50%): Al hacer la reserva
--    - Se paga el 50% del total
--    - La reserva pasa de 'pending' a 'confirmed'
--    - Se registra en amount_paid
--
-- 2. SEGUNDO PAGO (Saldo pendiente): Máximo 15 días antes del inicio
--    - Se paga el 50% restante (o el total pendiente si hubo modificaciones)
--    - Debe completarse antes de los 15 días previos al pickup_date
--    - Se actualiza amount_paid sumando el segundo pago
--    - payment_status pasa a 'paid'
--
-- ⚠️ IMPORTANTE - MODIFICACIONES DE RESERVA:
-- ------------------------------------------
-- Si el cliente MODIFICA la reserva después del primer pago:
--   - Añade extras
--   - Amplía fechas
--   - Cualquier cambio que aumente el total
--
-- El SEGUNDO PAGO será por el TOTAL PENDIENTE, NO el 50% original.
--
-- EJEMPLO:
-- --------
-- Reserva inicial:     680€
-- Primer pago (50%):   340€ ✓
-- ────────────────────────
-- Cliente amplía 2 días más
-- Nuevo total:         900€
-- Ya pagado:           340€
-- ────────────────────────
-- Segundo pago:        560€ ← (900€ - 340€)
--
-- CAMPOS IMPORTANTES:
-- -------------------
-- - total_price: Precio total de la reserva (base + extras) - PUEDE CAMBIAR
-- - amount_paid: Monto total pagado (acumulado de todos los pagos) - FIJO hasta nuevo pago
-- - payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
-- - status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
--
-- ESTADOS DE PAGO:
-- ----------------
-- pending:  amount_paid = 0
-- partial:  0 < amount_paid < total_price
-- paid:     amount_paid >= total_price
--
-- CÁLCULO DE PAGOS (DINÁMICO):
-- -----------------------------
-- Primer pago:    total_price * 0.50
-- Segundo pago:   total_price - amount_paid  ← SIEMPRE EL SALDO PENDIENTE
--
-- NOTA: El segundo pago se calcula DINÁMICAMENTE basándose en el total_price 
--       ACTUAL, no en el total_price original al momento del primer pago.
--
-- VERIFICACIÓN DE 15 DÍAS:
-- ------------------------
SELECT 
    id,
    booking_number,
    pickup_date,
    total_price,
    amount_paid,
    (total_price - amount_paid) as pending_amount,
    CASE 
        WHEN amount_paid = 0 THEN '⚠️ Esperando primer pago (50%)'
        WHEN amount_paid >= (total_price * 0.5) AND amount_paid < total_price THEN 
            CASE 
                WHEN (pickup_date - CURRENT_DATE) <= 15 THEN '❗ Segundo pago disponible'
                ELSE CONCAT('⏳ Segundo pago en ', (pickup_date - CURRENT_DATE - 15), ' días')
            END
        WHEN amount_paid >= total_price THEN '✅ Pago completado'
        ELSE '❓ Estado irregular'
    END as payment_message,
    status
FROM bookings
WHERE status IN ('pending', 'confirmed')
ORDER BY pickup_date ASC;

-- TRIGGER PARA ACTUALIZAR PAYMENT_STATUS AUTOMÁTICAMENTE:
-- --------------------------------------------------------
-- (Ya implementado en add-payment-tracking.sql)
-- Este trigger actualiza payment_status basándose en amount_paid:
--   - Si amount_paid = 0 → 'pending'
--   - Si amount_paid >= total_price → 'paid'
--   - Si 0 < amount_paid < total_price → 'partial'

-- CONSULTA PARA RECORDATORIOS DE SEGUNDO PAGO:
-- ---------------------------------------------
-- Identificar reservas que necesitan el segundo pago en los próximos 15 días
SELECT 
    b.id,
    b.booking_number,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.pickup_date,
    b.total_price,
    b.amount_paid,
    (b.total_price - b.amount_paid) as pending_amount,
    (b.pickup_date - CURRENT_DATE) as days_until_pickup,
    v.name as vehicle_name
FROM bookings b
INNER JOIN vehicles v ON b.vehicle_id = v.id
WHERE 
    b.status = 'confirmed'
    AND b.amount_paid >= (b.total_price * 0.5)  -- Ya pagaron el primer 50%
    AND b.amount_paid < b.total_price            -- No han completado el pago
    AND (b.pickup_date - CURRENT_DATE) <= 15     -- Faltan 15 días o menos
    AND (b.pickup_date - CURRENT_DATE) > 0       -- El pickup_date no ha pasado
ORDER BY b.pickup_date ASC;

-- FUNCIONES ÚTILES:
-- -----------------

-- Función para calcular el primer pago (50%)
CREATE OR REPLACE FUNCTION get_first_payment(p_total_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(p_total_price * 0.5, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para calcular el segundo pago (50%)
CREATE OR REPLACE FUNCTION get_second_payment(p_total_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(p_total_price * 0.5, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para verificar si el segundo pago está disponible
CREATE OR REPLACE FUNCTION is_second_payment_due(p_pickup_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (p_pickup_date - CURRENT_DATE) <= 15 AND (p_pickup_date - CURRENT_DATE) > 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- EJEMPLOS DE USO:
-- ----------------

-- Ver estado de pagos de una reserva específica
SELECT 
    booking_number,
    total_price,
    get_first_payment(total_price) as first_payment,
    get_second_payment(total_price) as second_payment,
    amount_paid,
    (total_price - amount_paid) as pending,
    is_second_payment_due(pickup_date) as second_payment_available,
    payment_status,
    status
FROM bookings
WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- ACTUALIZAR MANUALMENTE EL ESTADO DE PAGO:
-- ------------------------------------------
-- (Normalmente esto lo hace el trigger automáticamente)

UPDATE bookings 
SET 
    amount_paid = amount_paid + 340.00,  -- Sumar el pago recibido
    payment_status = CASE 
        WHEN (amount_paid + 340.00) >= total_price THEN 'paid'
        WHEN (amount_paid + 340.00) > 0 THEN 'partial'
        ELSE 'pending'
    END,
    status = CASE 
        WHEN status = 'pending' AND (amount_paid + 340.00) >= (total_price * 0.5) THEN 'confirmed'
        ELSE status
    END
WHERE id = '123e4567-e89b-12d3-a456-426614174000';

-- RESUMEN DE FLUJO:
-- ------------------
-- 1. Cliente crea reserva → status='pending', amount_paid=0
-- 2. Cliente paga 50% → amount_paid=(total*0.5), status='confirmed', payment_status='partial'
-- 3. Pasan días... cuando faltan ≤15 días para pickup_date
-- 4. Cliente paga 50% restante → amount_paid=total, payment_status='paid'
-- 5. Día de recogida → status='in_progress'
-- 6. Día de devolución → status='completed'
--
-- FLUJO CON MODIFICACIÓN:
-- -----------------------
-- 1. Cliente crea reserva (680€) → status='pending', amount_paid=0
-- 2. Cliente paga 50% (340€) → amount_paid=340, status='confirmed'
-- 3. Cliente MODIFICA reserva (amplía fechas, añade extras) → total_price=900€
-- 4. Sistema recalcula: pendiente = 900€ - 340€ = 560€
-- 5. Cuando faltan ≤15 días, cliente paga 560€ → amount_paid=900, payment_status='paid'
--
-- CONSULTA PARA AUDITAR MODIFICACIONES:
-- --------------------------------------
-- Identificar reservas donde el total cambió después del primer pago
SELECT 
    b.id,
    b.booking_number,
    b.customer_name,
    b.total_price as current_total,
    b.amount_paid,
    (b.total_price - b.amount_paid) as pending_amount,
    CASE 
        WHEN b.amount_paid = (b.total_price * 0.5) THEN '✓ Pago estándar 50%'
        WHEN b.amount_paid > 0 AND b.amount_paid < (b.total_price * 0.5) THEN '⚠️ Pago menor al 50% - posible ampliación'
        WHEN b.amount_paid > (b.total_price * 0.5) AND b.amount_paid < b.total_price THEN '⚠️ Pago mayor al 50% - posible reducción o pago extra'
        ELSE '❓ Revisar'
    END as payment_notes,
    b.pickup_date,
    (b.pickup_date - CURRENT_DATE) as days_until_pickup
FROM bookings b
WHERE 
    b.status = 'confirmed'
    AND b.amount_paid > 0
    AND b.amount_paid < b.total_price
ORDER BY b.pickup_date ASC;

-- TRIGGER PARA NOTIFICAR CAMBIOS EN TOTAL_PRICE:
-- -----------------------------------------------
-- Este trigger detecta cuando total_price cambia en una reserva ya pagada parcialmente
-- y puede enviar una notificación o actualizar un log

CREATE OR REPLACE FUNCTION notify_booking_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el total cambió y ya hay un pago parcial
    IF NEW.total_price != OLD.total_price 
       AND NEW.amount_paid > 0 
       AND NEW.amount_paid < NEW.total_price THEN
        
        -- Insertar en tabla de logs (crear si no existe)
        INSERT INTO booking_price_changes (
            booking_id,
            booking_number,
            old_total,
            new_total,
            amount_paid,
            new_pending,
            changed_at,
            changed_by
        ) VALUES (
            NEW.id,
            NEW.booking_number,
            OLD.total_price,
            NEW.total_price,
            NEW.amount_paid,
            (NEW.total_price - NEW.amount_paid),
            NOW(),
            current_user
        );
        
        -- Opcional: Enviar notificación al cliente
        -- PERFORM pg_notify('booking_modified', json_build_object(
        --     'booking_id', NEW.id,
        --     'new_pending', (NEW.total_price - NEW.amount_paid)
        -- )::text);
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger
DROP TRIGGER IF EXISTS booking_price_change_trigger ON bookings;
CREATE TRIGGER booking_price_change_trigger
    AFTER UPDATE OF total_price ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_booking_price_change();

-- TABLA PARA LOG DE CAMBIOS DE PRECIO (opcional):
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS booking_price_changes (
    id SERIAL PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    booking_number VARCHAR(50),
    old_total DECIMAL(10,2),
    new_total DECIMAL(10,2),
    amount_paid DECIMAL(10,2),
    new_pending DECIMAL(10,2),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by TEXT,
    notes TEXT
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_price_changes_booking ON booking_price_changes(booking_id);
CREATE INDEX IF NOT EXISTS idx_price_changes_date ON booking_price_changes(changed_at);

