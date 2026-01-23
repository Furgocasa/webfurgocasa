-- ============================================
-- SISTEMA DE CUPONES DE DESCUENTO
-- Paso 6: Insertar cupón promocional INV2026
-- ============================================
-- Cupón de la promoción "INVIERNO MÁGICO 2026"
-- Según https://www.furgocasa.com/es/ofertas

INSERT INTO coupons (
    code,
    name,
    description,
    coupon_type,
    discount_type,
    discount_value,
    min_rental_days,
    min_rental_amount,
    valid_from,
    valid_until,
    max_uses,
    is_active
) VALUES (
    'INV2026',
    'INVIERNO MÁGICO 2026',
    'Promoción especial de invierno con 15% de descuento. Válida del 5 de enero hasta el inicio de la primavera 2026. Reserva mínima de 10 días.',
    'permanent', -- Múltiples usos
    'percentage', -- Descuento en porcentaje
    15, -- 15% de descuento
    10, -- Mínimo 10 días de alquiler
    0, -- Sin importe mínimo (solo mínimo de días)
    '2026-01-05 00:00:00+00', -- Desde 5 de enero 2026
    '2026-03-20 23:59:59+00', -- Hasta inicio de primavera (20 marzo)
    NULL, -- Usos ilimitados
    true -- Activo
) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    discount_value = EXCLUDED.discount_value,
    min_rental_days = EXCLUDED.min_rental_days,
    valid_from = EXCLUDED.valid_from,
    valid_until = EXCLUDED.valid_until,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Cupón INV2026 (Invierno Mágico) creado exitosamente';
END $$;

-- Verificar cupón creado
SELECT 
    code,
    name,
    coupon_type,
    discount_type,
    discount_value,
    min_rental_days,
    min_rental_amount,
    max_uses,
    current_uses,
    is_active,
    valid_from,
    valid_until
FROM coupons
WHERE code = 'INV2026';
