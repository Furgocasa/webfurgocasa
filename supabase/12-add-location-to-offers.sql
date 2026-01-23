-- ============================================
-- AÑADIR UBICACIÓN A OFERTAS DE ÚLTIMA HORA
-- ============================================
-- Las ofertas tienen una ubicación fija que el admin define
-- y el cliente NO puede cambiar

-- Añadir columnas de ubicación
ALTER TABLE last_minute_offers
ADD COLUMN IF NOT EXISTS pickup_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS dropoff_location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- Comentarios
COMMENT ON COLUMN last_minute_offers.pickup_location_id IS 'Ubicación de recogida fija para esta oferta';
COMMENT ON COLUMN last_minute_offers.dropoff_location_id IS 'Ubicación de devolución fija para esta oferta';

-- Actualizar ofertas existentes con la ubicación principal (Murcia)
UPDATE last_minute_offers
SET pickup_location_id = (SELECT id FROM locations WHERE slug = 'murcia' LIMIT 1),
    dropoff_location_id = (SELECT id FROM locations WHERE slug = 'murcia' LIMIT 1)
WHERE pickup_location_id IS NULL;

-- ============================================
-- ACTUALIZAR FUNCIÓN get_active_last_minute_offers
-- ============================================

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
    savings DECIMAL,
    pickup_location_id UUID,
    pickup_location_name TEXT,
    pickup_location_address TEXT,
    dropoff_location_id UUID,
    dropoff_location_name TEXT,
    dropoff_location_address TEXT
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
        ((lmo.original_price_per_day - lmo.final_price_per_day) * lmo.offer_days) as savings,
        lmo.pickup_location_id,
        pl.name::TEXT as pickup_location_name,
        pl.address::TEXT as pickup_location_address,
        lmo.dropoff_location_id,
        dl.name::TEXT as dropoff_location_name,
        dl.address::TEXT as dropoff_location_address
    FROM last_minute_offers lmo
    JOIN vehicles v ON v.id = lmo.vehicle_id
    LEFT JOIN locations pl ON pl.id = lmo.pickup_location_id
    LEFT JOIN locations dl ON dl.id = lmo.dropoff_location_id
    WHERE lmo.status = 'published'
      AND lmo.offer_start_date >= CURRENT_DATE
    ORDER BY lmo.offer_start_date ASC;
END;
$$;

COMMENT ON FUNCTION get_active_last_minute_offers() IS 
'Obtiene ofertas de última hora publicadas y activas para mostrar en la web. 
Incluye detalles del vehículo y ubicación de recogida/devolución.';

-- ============================================
-- VERIFICACIÓN
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'last_minute_offers' AND column_name = 'pickup_location_id'
    ) THEN
        RAISE NOTICE '✅ Columna pickup_location_id añadida correctamente';
    END IF;
END $$;
