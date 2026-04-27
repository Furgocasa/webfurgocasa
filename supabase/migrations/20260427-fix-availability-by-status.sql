-- ============================================================================
-- FIX CRÍTICO: Disponibilidad debe basarse en STATUS, no en payment_status
-- ============================================================================
-- 
-- PROBLEMA DETECTADO (27/04/2026):
-- Una reserva pudo crearse sobre un vehículo que ya estaba reservado.
-- Causa: `check_vehicle_availability` (y los endpoints de la API) solo
-- consideraban ocupado el vehículo si payment_status IN ('partial','paid'),
-- ignorando reservas confirmadas manualmente sin pago registrado
-- (p. ej. reservas creadas por el admin para un amigo, pago en efectivo
-- a la entrega o transferencia bancaria pendiente de registrar).
--
-- CORRECCIÓN:
-- Una reserva bloquea el vehículo cuando su status operativo es
-- confirmed / in_progress / completed, INDEPENDIENTEMENTE de si tiene
-- importe abonado o no. Solo las reservas en estado 'pending' (carrito
-- sin confirmar) y 'cancelled' dejan el vehículo libre.
--
-- Esto reemplaza la migración 20260317-fix-pending-bookings-not-blocking.sql
-- y queda alineado con la lógica de los 6 endpoints de la API que también
-- se han corregido en este mismo fix.
--
-- Defensa en profundidad:
--   Capa 1: API → filtra por status en los 6 endpoints.
--   Capa 2: RPC check_vehicle_availability → este archivo.
--   Capa 3: Trigger prevent_booking_conflicts (BD) → ya activo, no filtra
--           por status para máxima seguridad ante cualquier bug del código.
-- ============================================================================

CREATE OR REPLACE FUNCTION check_vehicle_availability(
    p_vehicle_id UUID,
    p_pickup_date DATE,
    p_dropoff_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    -- 1) ¿Hay alguna reserva activa que se solape?
    --    Activa = status operativo (confirmed/in_progress/completed).
    --    NO mira payment_status: una reserva confirmada sin pagar también bloquea.
    SELECT NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE vehicle_id = p_vehicle_id
          AND status IN ('confirmed', 'in_progress', 'completed')
          AND pickup_date <= p_dropoff_date
          AND dropoff_date >= p_pickup_date
    ) INTO is_available;

    -- 2) Si está disponible por reservas, comprobar bloqueos manuales
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

COMMENT ON FUNCTION check_vehicle_availability(UUID, DATE, DATE) IS
'Devuelve TRUE si el vehículo está disponible en el rango. Una reserva con status confirmed/in_progress/completed bloquea, independientemente del payment_status. Las reservas pending y cancelled no bloquean.';
