-- Fix: Las reservas pendientes sin pago NO deben bloquear la disponibilidad
-- Problema: Un cliente veía un vehículo disponible en la búsqueda pero al intentar
-- reservar obtenía "no disponible" porque existía una reserva pendiente sin pago.
-- Solución: Alinear la función RPC con la lógica de la API de disponibilidad,
-- solo las reservas con pago (partial/paid) bloquean.

CREATE OR REPLACE FUNCTION check_vehicle_availability(
    p_vehicle_id UUID,
    p_pickup_date DATE,
    p_dropoff_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    SELECT NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE vehicle_id = p_vehicle_id
        AND status NOT IN ('cancelled')
        AND payment_status IN ('partial', 'paid')
        AND (
            (pickup_date <= p_dropoff_date AND dropoff_date >= p_pickup_date)
        )
    ) INTO is_available;
    
    IF is_available THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM blocked_dates
            WHERE vehicle_id = p_vehicle_id
            AND (
                (start_date <= p_dropoff_date AND end_date >= p_pickup_date)
            )
        ) INTO is_available;
    END IF;
    
    RETURN is_available;
END;
$$ LANGUAGE plpgsql;
