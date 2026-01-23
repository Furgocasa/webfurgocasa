-- ============================================
-- SISTEMA DE CUPONES DE DESCUENTO
-- Paso 3: Añadir columnas de cupones a la tabla bookings
-- ============================================

-- Añadir columnas para cupones en bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2) DEFAULT 0;

-- Índice para búsquedas por cupón
CREATE INDEX IF NOT EXISTS idx_bookings_coupon ON bookings(coupon_id);

-- Comentarios para documentación
COMMENT ON COLUMN bookings.coupon_id IS 'ID del cupón aplicado a esta reserva';
COMMENT ON COLUMN bookings.coupon_code IS 'Código del cupón aplicado (snapshot para auditoría)';
COMMENT ON COLUMN bookings.coupon_discount IS 'Descuento aplicado por el cupón';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Columnas de cupones añadidas a bookings exitosamente';
END $$;

-- Verificar que las columnas se crearon correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings' 
AND column_name IN ('coupon_id', 'coupon_code', 'coupon_discount')
ORDER BY column_name;
