-- ============================================
-- SISTEMA DE CUPONES DE DESCUENTO
-- Paso 2: Crear tabla de historial de uso de cupones
-- ============================================

-- Crear tabla para registrar el uso de cupones
CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relaciones
    coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Datos del descuento aplicado
    discount_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    
    -- Metadata
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar duplicados: un cupón solo se usa una vez por reserva
    UNIQUE(coupon_id, booking_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_booking ON coupon_usage(booking_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_customer ON coupon_usage(customer_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_date ON coupon_usage(used_at);

-- Comentarios para documentación
COMMENT ON TABLE coupon_usage IS 'Historial de uso de cupones en reservas';
COMMENT ON COLUMN coupon_usage.discount_amount IS 'Cantidad descontada';
COMMENT ON COLUMN coupon_usage.original_amount IS 'Precio original antes del descuento';
COMMENT ON COLUMN coupon_usage.final_amount IS 'Precio final después del descuento';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Tabla coupon_usage creada exitosamente';
END $$;
