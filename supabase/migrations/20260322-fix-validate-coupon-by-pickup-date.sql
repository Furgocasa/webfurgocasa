-- Ventana valid_from / valid_until según la fecha de recogida de la reserva
-- (reserva anticipada permitida). Alineado con /api/coupons/validate.

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
    SELECT * INTO v_coupon
    FROM coupons
    WHERE code = UPPER(TRIM(p_code))
    AND is_active = TRUE;

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

    IF v_coupon.valid_from IS NOT NULL AND p_pickup_date < (v_coupon.valid_from::date) THEN
        RETURN QUERY SELECT
            FALSE,
            'Este cupón no es válido para las fechas seleccionadas'::TEXT,
            0::DECIMAL,
            NULL::UUID,
            NULL::VARCHAR,
            NULL::DECIMAL;
        RETURN;
    END IF;

    IF v_coupon.valid_until IS NOT NULL AND p_pickup_date > (v_coupon.valid_until::date) THEN
        RETURN QUERY SELECT
            FALSE,
            'Este cupón no es válido para las fechas seleccionadas'::TEXT,
            0::DECIMAL,
            NULL::UUID,
            NULL::VARCHAR,
            NULL::DECIMAL;
        RETURN;
    END IF;

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

    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := ROUND((p_rental_amount * v_coupon.discount_value / 100)::NUMERIC, 2);
    ELSE
        v_discount := v_coupon.discount_value;
        IF v_discount > p_rental_amount THEN
            v_discount := p_rental_amount;
        END IF;
    END IF;

    RETURN QUERY SELECT
        TRUE,
        NULL::TEXT,
        v_discount,
        v_coupon.id,
        v_coupon.discount_type,
        v_coupon.discount_value;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_coupon(character varying, uuid, date, date, numeric)
IS 'Valida cupón según fecha de recogida (valid_from/until), no según NOW()';
