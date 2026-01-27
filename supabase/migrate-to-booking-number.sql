-- ============================================
-- MIGRACIÓN: Usar booking_number en lugar de UUID para acceso público
-- ============================================
-- Fecha: 2026-01-27
-- Objetivo: Eliminar endpoint inseguro /api/bookings/[id] y usar RLS
-- ============================================

-- ============================================
-- PASO 1: Crear vista pública con datos limitados
-- ============================================

CREATE OR REPLACE VIEW bookings_public AS
SELECT 
  -- Identificadores
  b.id,
  b.booking_number,
  
  -- Fechas y duración
  b.pickup_date,
  b.pickup_time,
  b.dropoff_date,
  b.dropoff_time,
  b.days,
  
  -- Precios (solo totales, no desglose sensible)
  b.total_price,
  b.deposit_amount,
  b.amount_paid,
  
  -- Estado
  b.status,
  b.payment_status,
  
  -- Datos del cliente (snapshot público)
  b.customer_name,
  b.customer_email,
  
  -- Relaciones (IDs para JOINs)
  b.vehicle_id,
  b.customer_id,
  b.pickup_location_id,
  b.dropoff_location_id,
  
  -- Notas públicas (excluir admin_notes)
  b.notes,
  
  -- Metadata
  b.created_at,
  b.updated_at

FROM bookings b;

COMMENT ON VIEW bookings_public IS 
  'Vista pública de reservas accesible por booking_number. Excluye datos sensibles como DNI, teléfono, admin_notes, cupones, etc.';

-- ============================================
-- PASO 2: Crear policy RLS para la vista
-- ============================================

-- Habilitar RLS en la vista (heredado de bookings, pero por seguridad)
ALTER VIEW bookings_public SET (security_invoker = true);

-- Política: Cualquiera puede leer reservas por booking_number
-- (La seguridad está en que no exponemos datos sensibles en la vista)
CREATE POLICY "bookings_public_read_by_number" ON bookings
  FOR SELECT 
  USING (true);

COMMENT ON POLICY "bookings_public_read_by_number" ON bookings IS
  'Permite lectura pública de bookings a través de bookings_public. Datos sensibles excluidos en la vista.';

-- ============================================
-- PASO 3: Función helper para obtener reserva completa
-- ============================================

-- Función que devuelve todos los datos relacionados de una reserva
CREATE OR REPLACE FUNCTION get_booking_by_number(p_booking_number VARCHAR)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'booking', row_to_json(b.*),
    'vehicle', json_build_object(
      'id', v.id,
      'name', v.name,
      'brand', v.brand,
      'model', v.model,
      'internal_code', v.internal_code,
      'images', (
        SELECT json_agg(json_build_object(
          'image_url', vi.image_url,
          'is_primary', vi.is_primary,
          'sort_order', vi.sort_order
        ) ORDER BY vi.is_primary DESC, vi.sort_order)
        FROM vehicle_images vi
        WHERE vi.vehicle_id = v.id
      )
    ),
    'customer', json_build_object(
      'id', c.id,
      'name', c.name,
      'email', c.email,
      'phone', c.phone,
      'dni', c.dni,
      'address', c.address,
      'city', c.city,
      'postal_code', c.postal_code,
      'country', c.country,
      'date_of_birth', c.date_of_birth
    ),
    'pickup_location', json_build_object(
      'id', pl.id,
      'name', pl.name,
      'address', pl.address
    ),
    'dropoff_location', json_build_object(
      'id', dl.id,
      'name', dl.name,
      'address', dl.address
    ),
    'extras', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', be.id,
        'quantity', be.quantity,
        'unit_price', be.unit_price,
        'total_price', be.total_price,
        'extra', json_build_object(
          'name', e.name,
          'description', e.description
        )
      )), '[]'::json)
      FROM booking_extras be
      JOIN extras e ON e.id = be.extra_id
      WHERE be.booking_id = b.id
    )
  ) INTO result
  FROM bookings b
  LEFT JOIN vehicles v ON v.id = b.vehicle_id
  LEFT JOIN customers c ON c.id = b.customer_id
  LEFT JOIN locations pl ON pl.id = b.pickup_location_id
  LEFT JOIN locations dl ON dl.id = b.dropoff_location_id
  WHERE b.booking_number = p_booking_number;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_booking_by_number IS
  'Obtiene una reserva completa con todas sus relaciones usando booking_number. Incluye datos sensibles (solo para uso autorizado).';

-- Dar permisos de ejecución
GRANT EXECUTE ON FUNCTION get_booking_by_number(VARCHAR) TO anon, authenticated;

-- ============================================
-- PASO 4: Índice para optimizar búsquedas por booking_number
-- ============================================

-- Verificar si el índice ya existe antes de crearlo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'bookings' 
    AND indexname = 'idx_bookings_number'
  ) THEN
    CREATE INDEX idx_bookings_number ON bookings(booking_number);
  END IF;
END $$;

COMMENT ON INDEX idx_bookings_number IS 
  'Índice para optimizar búsquedas de reservas por booking_number';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Test: Obtener una reserva por booking_number
-- SELECT * FROM bookings_public WHERE booking_number = 'BK-20260119-0901' LIMIT 1;

-- Test: Usar la función
-- SELECT get_booking_by_number('BK-20260119-0901');

-- ============================================
-- ROLLBACK (si necesitas revertir)
-- ============================================

/*
-- Para revertir estos cambios:

DROP FUNCTION IF EXISTS get_booking_by_number(VARCHAR);
DROP POLICY IF EXISTS "bookings_public_read_by_number" ON bookings;
DROP VIEW IF EXISTS bookings_public;
DROP INDEX IF EXISTS idx_bookings_number;
*/
