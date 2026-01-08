-- Script para añadir control de pagos parciales a las reservas

-- 1. Añadir columna para el monto pagado
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0;

-- 2. Añadir comentario a la columna
COMMENT ON COLUMN bookings.amount_paid IS 'Monto total pagado hasta el momento (puede ser en varios pagos)';

-- 3. Actualizar registros existentes que estén marcados como pagados
UPDATE bookings 
SET amount_paid = total_price 
WHERE payment_status = 'paid' AND (amount_paid IS NULL OR amount_paid = 0);

-- 4. Crear una función para calcular automáticamente el payment_status
CREATE OR REPLACE FUNCTION calculate_payment_status(
    p_amount_paid DECIMAL(10,2),
    p_total_price DECIMAL(10,2)
) RETURNS VARCHAR(20) AS $$
BEGIN
    IF p_amount_paid IS NULL OR p_amount_paid = 0 THEN
        RETURN 'pending';
    ELSIF p_amount_paid >= p_total_price THEN
        RETURN 'paid';
    ELSE
        RETURN 'partial';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para actualizar automáticamente el payment_status cuando cambia amount_paid
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.payment_status := calculate_payment_status(NEW.amount_paid, NEW.total_price);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear el trigger (si no existe)
DROP TRIGGER IF EXISTS set_payment_status ON bookings;
CREATE TRIGGER set_payment_status
    BEFORE INSERT OR UPDATE OF amount_paid, total_price
    ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_status();

-- 7. Verificar el cambio
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings' 
  AND column_name = 'amount_paid';

-- 8. Ver ejemplo de cómo quedarían las reservas con los nuevos campos
SELECT 
    booking_number,
    total_price,
    amount_paid,
    (total_price - COALESCE(amount_paid, 0)) as pending_amount,
    payment_status,
    status
FROM bookings
ORDER BY created_at DESC
LIMIT 5;

