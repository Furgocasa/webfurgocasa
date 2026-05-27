-- ============================================================================
-- 2026-05-27 — check_vehicle_availability: comparación con TIMESTAMP
-- ============================================================================
-- Alinea la función RPC con el trigger check_booking_conflicts() para que
-- ambos usen fecha+hora al detectar solapamientos.
-- Permite que un vehículo se devuelva y recoja el mismo día si las horas
-- no se solapan (ej: devuelve 10:00, recoge 19:00 → disponible).
-- ============================================================================

CREATE OR REPLACE FUNCTION check_vehicle_availability(
    p_vehicle_id UUID,
    p_pickup_date DATE,
    p_dropoff_date DATE,
    p_pickup_time TEXT DEFAULT '10:00',
    p_dropoff_time TEXT DEFAULT '10:00'
) RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    SELECT NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE vehicle_id = p_vehicle_id
          AND status IN ('confirmed', 'in_progress', 'completed')
          AND (pickup_date::text || ' ' || COALESCE(pickup_time, '10:00'))::timestamp
              < (p_dropoff_date::text || ' ' || COALESCE(p_dropoff_time, '10:00'))::timestamp
          AND (dropoff_date::text || ' ' || COALESCE(dropoff_time, '10:00'))::timestamp
              > (p_pickup_date::text || ' ' || COALESCE(p_pickup_time, '10:00'))::timestamp
    ) INTO is_available;

    IF is_available THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM blocked_dates
            WHERE vehicle_id = p_vehicle_id
              AND start_date <= p_dropoff_date
              AND end_date >= p_pickup_date
        ) INTO is_available;
    END IF;

    RETURN is_available;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_vehicle_availability(UUID, DATE, DATE, TEXT, TEXT) IS
'Devuelve TRUE si el vehículo está disponible en el rango fecha+hora. Reservas confirmed/in_progress/completed bloquean. Las pending y cancelled no bloquean.';
