-- ============================================
-- MIGRACIÓN: Añadir columna amount_paid a bookings
-- ============================================
-- Objetivo: Añadir campo para rastrear el monto pagado por el cliente
-- ============================================

-- Verificar si la columna ya existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'amount_paid'
    ) THEN
        -- Añadir columna amount_paid
        ALTER TABLE bookings 
        ADD COLUMN amount_paid DECIMAL(10,2) DEFAULT 0;
        
        RAISE NOTICE 'Columna amount_paid añadida exitosamente';
    ELSE
        RAISE NOTICE 'La columna amount_paid ya existe';
    END IF;
END $$;

-- Comentario descriptivo
COMMENT ON COLUMN bookings.amount_paid IS 'Monto total pagado por el cliente hasta el momento (suma acumulativa de todos los pagos)';

-- Verificación final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bookings' 
AND column_name = 'amount_paid';
