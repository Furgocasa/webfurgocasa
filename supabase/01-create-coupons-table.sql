-- ============================================
-- SISTEMA DE CUPONES DE DESCUENTO
-- Paso 1: Crear tabla de cupones
-- ============================================

-- Crear tabla de cupones
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificación
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Tipo: 'gift' (un solo uso) o 'permanent' (múltiples usos)
    coupon_type VARCHAR(20) NOT NULL CHECK (coupon_type IN ('gift', 'permanent')),
    
    -- Descuento
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    
    -- Condiciones
    min_rental_days INTEGER DEFAULT 1,
    min_rental_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Validez temporal (opcional)
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    
    -- Control de uso
    -- Para gift: max_uses = 1
    -- Para permanent: max_uses = NULL (ilimitado)
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    
    -- Estado
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Control
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_type ON coupons(coupon_type);
CREATE INDEX IF NOT EXISTS idx_coupons_validity ON coupons(valid_from, valid_until);

-- Comentarios para documentación
COMMENT ON TABLE coupons IS 'Cupones de descuento para aplicar en reservas';
COMMENT ON COLUMN coupons.code IS 'Código único del cupón (ej: RAMON20, BLACK2026)';
COMMENT ON COLUMN coupons.coupon_type IS 'gift = un solo uso, permanent = múltiples usos';
COMMENT ON COLUMN coupons.discount_type IS 'percentage = porcentaje, fixed = cantidad fija en euros';
COMMENT ON COLUMN coupons.discount_value IS 'Valor del descuento: 20 para 20% o 150 para 150€';
COMMENT ON COLUMN coupons.max_uses IS '1 para gift, NULL para permanent (ilimitado)';
COMMENT ON COLUMN coupons.current_uses IS 'Contador de usos actuales del cupón';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_coupons_updated_at 
    BEFORE UPDATE ON coupons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Tabla coupons creada exitosamente';
END $$;
