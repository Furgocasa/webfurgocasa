-- ============================================
-- ACTUALIZACIÓN: Añadir detalles del vehículo a las ofertas
-- ============================================
-- Añade seats, beds, brand, model a la función get_active_last_minute_offers
-- para mostrar más información en las cards de ofertas

DROP FUNCTION IF EXISTS get_active_last_minute_offers();

CREATE OR REPLACE FUNCTION get_active_last_minute_offers()
RETURNS TABLE (
    id UUID,
    vehicle_id UUID,
    vehicle_name TEXT,
    vehicle_slug TEXT,
    vehicle_image_url TEXT,
    vehicle_brand TEXT,
    vehicle_model TEXT,
    vehicle_seats INTEGER,
    vehicle_beds INTEGER,
    vehicle_internal_code TEXT,
    offer_start_date DATE,
    offer_end_date DATE,
    offer_days INTEGER,
    original_price_per_day DECIMAL,
    discount_percentage INTEGER,
    final_price_per_day DECIMAL,
    total_original_price DECIMAL,
    total_final_price DECIMAL,
    savings DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Primero expirar ofertas pasadas
    PERFORM expire_past_offers();
    
    RETURN QUERY
    SELECT 
        lmo.id,
        lmo.vehicle_id,
        v.name::TEXT as vehicle_name,
        v.slug::TEXT as vehicle_slug,
        (
            SELECT vi.image_url::TEXT 
            FROM vehicle_images vi 
            WHERE vi.vehicle_id = v.id 
            ORDER BY vi.is_primary DESC, vi.sort_order ASC 
            LIMIT 1
        ) as vehicle_image_url,
        v.brand::TEXT as vehicle_brand,
        v.model::TEXT as vehicle_model,
        v.seats as vehicle_seats,
        v.beds as vehicle_beds,
        v.internal_code::TEXT as vehicle_internal_code,
        lmo.offer_start_date,
        lmo.offer_end_date,
        lmo.offer_days,
        lmo.original_price_per_day,
        lmo.discount_percentage,
        lmo.final_price_per_day,
        (lmo.original_price_per_day * lmo.offer_days) as total_original_price,
        (lmo.final_price_per_day * lmo.offer_days) as total_final_price,
        ((lmo.original_price_per_day - lmo.final_price_per_day) * lmo.offer_days) as savings
    FROM last_minute_offers lmo
    JOIN vehicles v ON v.id = lmo.vehicle_id
    WHERE lmo.status = 'published'
      AND lmo.offer_start_date >= CURRENT_DATE
    ORDER BY lmo.offer_start_date ASC;
END;
$$;

COMMENT ON FUNCTION get_active_last_minute_offers() IS 
'Obtiene ofertas de última hora publicadas y activas para mostrar en la web. 
Incluye detalles del vehículo: seats, beds, brand, model.';
