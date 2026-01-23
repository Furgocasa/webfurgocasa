-- ============================================
-- SISTEMA DE OFERTAS DE ÚLTIMA HORA - FURGOCASA
-- Archivo 2 de 2: Políticas RLS y Funciones
-- ============================================
-- Ejecutar DESPUÉS de 07-create-last-minute-offers-table.sql
-- ============================================

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- Habilitar RLS
ALTER TABLE last_minute_offers ENABLE ROW LEVEL SECURITY;

-- Política: Público puede ver ofertas publicadas y no expiradas
CREATE POLICY "public_read_published_offers" ON last_minute_offers
    FOR SELECT
    USING (
        status = 'published' 
        AND offer_start_date >= CURRENT_DATE
    );

-- Política: Admin tiene acceso completo
CREATE POLICY "admin_full_access_offers" ON last_minute_offers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- Política: Service role tiene acceso completo (para API)
CREATE POLICY "service_role_full_access_offers" ON last_minute_offers
    FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- FUNCIÓN: Detectar huecos entre reservas
-- ============================================
-- Esta función analiza las reservas confirmadas y detecta
-- huecos que no cumplen el mínimo de días de la temporada
-- ============================================

CREATE OR REPLACE FUNCTION detect_booking_gaps()
RETURNS TABLE (
    vehicle_id UUID,
    vehicle_name TEXT,
    vehicle_internal_code TEXT,
    gap_start_date DATE,
    gap_end_date DATE,
    gap_days INTEGER,
    season_name TEXT,
    season_min_days INTEGER,
    season_price_per_day DECIMAL,
    previous_booking_id UUID,
    next_booking_id UUID,
    already_exists BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH vehicle_bookings AS (
        -- Obtener todas las reservas confirmadas ordenadas por vehículo y fecha
        SELECT 
            b.vehicle_id,
            v.name as vehicle_name,
            v.internal_code as vehicle_internal_code,
            b.id as booking_id,
            b.pickup_date,
            b.dropoff_date,
            ROW_NUMBER() OVER (PARTITION BY b.vehicle_id ORDER BY b.pickup_date) as rn
        FROM bookings b
        JOIN vehicles v ON v.id = b.vehicle_id
        WHERE b.status IN ('confirmed', 'completed', 'in_progress')
          AND b.dropoff_date >= CURRENT_DATE  -- Solo futuras o en curso
        ORDER BY b.vehicle_id, b.pickup_date
    ),
    gaps AS (
        -- Encontrar huecos entre reservas consecutivas
        SELECT 
            curr.vehicle_id,
            curr.vehicle_name,
            curr.vehicle_internal_code,
            curr.dropoff_date AS gap_start,
            nxt.pickup_date AS gap_end,
            (nxt.pickup_date - curr.dropoff_date) AS days_gap,
            curr.booking_id as prev_booking,
            nxt.booking_id as next_booking
        FROM vehicle_bookings curr
        JOIN vehicle_bookings nxt 
            ON curr.vehicle_id = nxt.vehicle_id 
            AND curr.rn + 1 = nxt.rn
        WHERE nxt.pickup_date > curr.dropoff_date  -- Hay un hueco
    )
    SELECT 
        g.vehicle_id,
        g.vehicle_name,
        g.vehicle_internal_code,
        g.gap_start AS gap_start_date,
        g.gap_end AS gap_end_date,
        g.days_gap AS gap_days,
        COALESCE(s.name, 'Sin temporada') AS season_name,
        COALESCE(s.min_days, 1) AS season_min_days,
        COALESCE(s.price_less_than_week, 100) AS season_price_per_day,
        g.prev_booking AS previous_booking_id,
        g.next_booking AS next_booking_id,
        EXISTS (
            SELECT 1 FROM last_minute_offers lmo
            WHERE lmo.vehicle_id = g.vehicle_id
              AND lmo.detected_start_date = g.gap_start
              AND lmo.detected_end_date = g.gap_end
              AND lmo.status NOT IN ('expired', 'ignored')
        ) AS already_exists
    FROM gaps g
    LEFT JOIN seasons s ON 
        s.is_active = true
        AND g.gap_start >= s.start_date 
        AND g.gap_start <= s.end_date
    WHERE g.days_gap > 0                          -- Hueco positivo
      AND g.days_gap < COALESCE(s.min_days, 999)  -- Menor que el mínimo de temporada
      AND g.gap_start >= CURRENT_DATE             -- Solo huecos futuros
    ORDER BY g.gap_start;
END;
$$;

COMMENT ON FUNCTION detect_booking_gaps() IS 
'Detecta huecos entre reservas que no cumplen el mínimo de días de temporada. 
Útil para crear ofertas de última hora.';

-- ============================================
-- FUNCIÓN: Marcar ofertas expiradas
-- ============================================
-- Llamar periódicamente o antes de mostrar ofertas

CREATE OR REPLACE FUNCTION expire_past_offers()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE last_minute_offers
    SET 
        status = 'expired',
        expired_at = NOW(),
        updated_at = NOW()
    WHERE status = 'published'
      AND offer_start_date < CURRENT_DATE;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$;

COMMENT ON FUNCTION expire_past_offers() IS 
'Marca como expiradas las ofertas publicadas cuya fecha de inicio ya pasó';

-- ============================================
-- FUNCIÓN: Obtener ofertas publicadas activas
-- ============================================

CREATE OR REPLACE FUNCTION get_active_last_minute_offers()
RETURNS TABLE (
    id UUID,
    vehicle_id UUID,
    vehicle_name TEXT,
    vehicle_slug TEXT,
    vehicle_image_url TEXT,
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
'Obtiene ofertas de última hora publicadas y activas para mostrar en la web';

-- ============================================
-- FUNCIÓN: Publicar oferta
-- ============================================

CREATE OR REPLACE FUNCTION publish_last_minute_offer(
    p_offer_id UUID,
    p_offer_start_date DATE DEFAULT NULL,
    p_offer_end_date DATE DEFAULT NULL,
    p_discount_percentage INTEGER DEFAULT NULL,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS last_minute_offers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result last_minute_offers;
BEGIN
    UPDATE last_minute_offers
    SET 
        offer_start_date = COALESCE(p_offer_start_date, offer_start_date),
        offer_end_date = COALESCE(p_offer_end_date, offer_end_date),
        discount_percentage = COALESCE(p_discount_percentage, discount_percentage),
        admin_notes = COALESCE(p_admin_notes, admin_notes),
        status = 'published',
        published_at = NOW(),
        updated_at = NOW()
    WHERE id = p_offer_id
      AND status IN ('detected', 'ignored')  -- Solo se pueden publicar ofertas pendientes o ignoradas
    RETURNING * INTO result;
    
    RETURN result;
END;
$$;

COMMENT ON FUNCTION publish_last_minute_offer IS 
'Publica una oferta de última hora, opcionalmente ajustando fechas y descuento';

-- ============================================
-- FUNCIÓN: Marcar oferta como reservada
-- ============================================

CREATE OR REPLACE FUNCTION mark_offer_as_reserved(
    p_offer_id UUID,
    p_booking_id UUID
)
RETURNS last_minute_offers
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result last_minute_offers;
BEGIN
    UPDATE last_minute_offers
    SET 
        status = 'reserved',
        booking_id = p_booking_id,
        reserved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_offer_id
      AND status = 'published'
    RETURNING * INTO result;
    
    RETURN result;
END;
$$;

COMMENT ON FUNCTION mark_offer_as_reserved IS 
'Marca una oferta como reservada cuando un cliente la reserva';

-- ============================================
-- VERIFICACIÓN
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS creadas para last_minute_offers';
    RAISE NOTICE '✅ Función detect_booking_gaps() creada';
    RAISE NOTICE '✅ Función expire_past_offers() creada';
    RAISE NOTICE '✅ Función get_active_last_minute_offers() creada';
    RAISE NOTICE '✅ Función publish_last_minute_offer() creada';
    RAISE NOTICE '✅ Función mark_offer_as_reserved() creada';
END $$;
