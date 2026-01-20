-- =====================================================
-- HACER CUSTOMER_PHONE OPCIONAL EN BOOKINGS
-- =====================================================
-- El teléfono del cliente en el snapshot de la reserva
-- no debería ser obligatorio. Solo nombre y email son
-- realmente necesarios para auditoría.
-- =====================================================

-- Paso 1: Hacer que customer_phone sea nullable
ALTER TABLE bookings 
ALTER COLUMN customer_phone DROP NOT NULL;

-- Paso 2: Actualizar reservas sin teléfono para poner NULL en lugar de vacío
UPDATE bookings 
SET customer_phone = NULL 
WHERE customer_phone = '' OR customer_phone = '-';

-- Paso 3: Verificar cambios
SELECT 
  COUNT(*) as total_reservas,
  COUNT(customer_phone) as con_telefono,
  COUNT(*) - COUNT(customer_phone) as sin_telefono
FROM bookings;

-- Nota: Los campos customer_name y customer_email siguen siendo obligatorios
-- ya que son esenciales para auditoría y GDPR
