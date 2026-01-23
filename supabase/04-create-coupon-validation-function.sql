-- ============================================
-- SISTEMA DE CUPONES DE DESCUENTO
-- Paso 4: Crear función de validación de cupones
-- ============================================

-- Función para validar si un cupón es válido
CREATE OR REPLACE FUNCTION validate_coupon(
    p_code VARCHAR(50),
    p_customer_id UUID,
    p_pickup_date DATE,
    p_dropoff_date DATE,
    p_rental_amount DECIMAL
) RETURNS TABLE (
    is_valid BOOLEAN,
    error_message TEXT,
    discount_amount DECIMAL,
    coupon_id UUID,
    discount_type VARCHAR,
    discount_value DECIMAL
) AS $$
DECLARE
    v_coupon RECORD;
    v_days INTEGER;
    v_discount DECIMAL;
BEGIN
    -- Buscar cupón activo
    SELECT * INTO v_coupon 
    FROM coupons 
    WHERE code = UPPER(p_code) 
    AND is_active = TRUE;
    
    -- Verificar que existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            FALSE, 
            'Cupón no válido o inactivo'::TEXT, 
            0::DECIMAL, 
            NULL::UUID,
            NULL::VARCHAR,
            NULL::DECIMAL;
        RETURN;
    END IF;
    
    -- Validar fecha de inicio
    IF v_coupon.valid_from IS NOT NULL AND NOW() < v_coupon.valid_from THEN
        RETURN QUERY SELECT 
            FALSE, 
            'El cupón aún no está activo'::TEXT, 
            0::DECIMAL, 
            NULL::UUID,
            NULL::VARCHAR,
            NULL::DECIMAL;
        RETURN;
    END IF;
    
    -- Validar fecha de expiración
    IF v_coupon.valid_until IS NOT NULL AND NOW() > v_coupon.valid_until THEN
        RETURN QUERY SELECT 
            FALSE, 
            'El cupón ha expirado'::TEXT, 
            0::DECIMAL, 
            NULL::UUID,
            NULL::VARCHAR,
            NULL::DECIMAL;
        RETURN;
    END IF;
    
    -- Validar usos máximos (solo aplica a cupones gift)
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
        RETURN QUERY SELECT 
            FALSE, 
            'El cupón ya ha sido utilizado'::TEXT, 
            0::DECIMAL, 
            NULL::UUID,
            NULL::VARCHAR,
            NULL::DECIMAL;
        RETURN;
    END IF;
    
    -- Validar días mínimos de alquiler
    v_days := p_dropoff_date - p_pickup_date;
    IF v_days < v_coupon.min_rental_days THEN
        RETURN QUERY SELECT 
            FALSE, 
            ('El alquiler debe ser de al menos ' || v_coupon.min_rental_days || ' días')::TEXT, 
            0::DECIMAL, 
            NULL::UUID,
            NULL::VARCHAR,
            NULL::DECIMAL;
        RETURN;
    END IF;
    
    -- Validar importe mínimo
    IF p_rental_amount < v_coupon.min_rental_amount THEN
        RETURN QUERY SELECT 
            FALSE, 
            ('El importe mínimo es ' || v_coupon.min_rental_amount || '€')::TEXT, 
            0::DECIMAL, 
            NULL::UUID,
            NULL::VARCHAR,
            NULL::DECIMAL;
        RETURN;
    END IF;
    
    -- Calcular descuento
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := ROUND((p_rental_amount * v_coupon.discount_value / 100)::NUMERIC, 2);
    ELSE -- fixed
        v_discount := v_coupon.discount_value;
        -- El descuento no puede ser mayor que el importe total
        IF v_discount > p_rental_amount THEN
            v_discount := p_rental_amount;
        END IF;
    END IF;
    
    -- Cupón válido
    RETURN QUERY SELECT 
        TRUE, 
        NULL::TEXT, 
        v_discount, 
        v_coupon.id,
        v_coupon.discount_type,
        v_coupon.discount_value;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION validate_coupon IS 'Valida si un cupón es aplicable y calcula el descuento';

-- ============================================
-- Función para incrementar el contador de usos de un cupón
-- ============================================
CREATE OR REPLACE FUNCTION increment_coupon_uses(coupon_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE coupons 
    SET current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_coupon_uses IS 'Incrementa el contador de usos de un cupón';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Funciones de cupones creadas exitosamente';
END $$;
