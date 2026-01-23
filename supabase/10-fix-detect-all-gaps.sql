-- ============================================
-- FIX: Detectar TODOS los huecos entre reservas
-- ============================================
-- Cambios:
-- 1. Mostrar TODOS los huecos, no solo los menores al mínimo
-- 2. Ordenar por vehículo (internal_code) y luego por fecha
-- 3. El admin decide si hacer oferta o no
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
            v.name::TEXT as vehicle_name,
            v.internal_code::TEXT as vehicle_internal_code,
            b.id as booking_id,
            b.pickup_date,
            b.dropoff_date,
            ROW_NUMBER() OVER (PARTITION BY b.vehicle_id ORDER BY b.pickup_date) as rn
        FROM bookings b
        JOIN vehicles v ON v.id = b.vehicle_id
        WHERE b.status IN ('confirmed', 'completed', 'in_progress')
          AND b.dropoff_date >= CURRENT_DATE  -- Solo futuras o en curso
    ),
    gaps AS (
        -- Encontrar huecos entre reservas consecutivas del mismo vehículo
        SELECT 
            curr.vehicle_id,
            curr.vehicle_name,
            curr.vehicle_internal_code,
            curr.dropoff_date AS gap_start,
            nxt.pickup_date AS gap_end,
            (nxt.pickup_date - curr.dropoff_date)::INTEGER AS days_gap,
            curr.booking_id as prev_booking,
            nxt.booking_id as next_booking
        FROM vehicle_bookings curr
        JOIN vehicle_bookings nxt 
            ON curr.vehicle_id = nxt.vehicle_id 
            AND curr.rn + 1 = nxt.rn
        WHERE nxt.pickup_date > curr.dropoff_date  -- Hay un hueco (más de 0 días)
    )
    SELECT 
        g.vehicle_id,
        g.vehicle_name::TEXT,
        g.vehicle_internal_code::TEXT,
        g.gap_start AS gap_start_date,
        g.gap_end AS gap_end_date,
        g.days_gap::INTEGER AS gap_days,
        COALESCE(s.name::TEXT, 'Sin temporada definida'::TEXT) AS season_name,
        COALESCE(s.min_days, 1)::INTEGER AS season_min_days,
        -- Calcular precio según duración del hueco
        CASE 
            WHEN g.days_gap >= 21 THEN COALESCE(s.price_three_weeks, s.price_less_than_week, 100::DECIMAL)
            WHEN g.days_gap >= 14 THEN COALESCE(s.price_two_weeks, s.price_less_than_week, 100::DECIMAL)
            WHEN g.days_gap >= 7 THEN COALESCE(s.price_one_week, s.price_less_than_week, 100::DECIMAL)
            ELSE COALESCE(s.price_less_than_week, 100::DECIMAL)
        END AS season_price_per_day,
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
    WHERE g.days_gap > 0              -- Cualquier hueco positivo
      AND g.gap_start >= CURRENT_DATE -- Solo huecos futuros
    ORDER BY 
        g.vehicle_internal_code ASC,  -- Primero por código de vehículo (FU0001, FU0002...)
        g.gap_start ASC;              -- Luego por fecha de inicio
END;
$$;

-- Verificación
DO $$
BEGIN
    RAISE NOTICE '✅ Función detect_booking_gaps() actualizada - muestra TODOS los huecos ordenados por vehículo';
END $$;
