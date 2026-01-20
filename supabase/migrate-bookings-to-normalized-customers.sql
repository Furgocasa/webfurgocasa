-- ============================================
-- MIGRACIÓN: Normalizar datos de clientes en bookings
-- ============================================
-- Objetivo: Eliminar redundancia, mantener solo customer_id como referencia
-- Conservar: customer_name, customer_email (por GDPR/auditoría)
-- Eliminar: phone, dni, address, city, postal_code, country
-- ============================================

-- PASO 1: Verificar estado actual
SELECT 
    COUNT(*) as total_bookings,
    COUNT(customer_id) as with_customer_id,
    COUNT(customer_phone) as with_phone,
    COUNT(customer_dni) as with_dni
FROM bookings;

-- PASO 2: Backup de datos antes de eliminar (guardar en tabla temporal)
CREATE TEMP TABLE bookings_customer_data_backup AS
SELECT 
    id as booking_id,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    customer_dni,
    customer_address,
    customer_city,
    customer_postal_code
FROM bookings;

SELECT COUNT(*) as rows_backed_up FROM bookings_customer_data_backup;

-- PASO 3: Sincronizar datos faltantes de customers antes de eliminar
-- Si hay datos en bookings que no están en customers, actualizarlos
UPDATE customers c
SET 
    phone = COALESCE(c.phone, b.customer_phone),
    dni = COALESCE(c.dni, b.customer_dni),
    address = COALESCE(c.address, b.customer_address),
    city = COALESCE(c.city, b.customer_city),
    postal_code = COALESCE(c.postal_code, b.customer_postal_code)
FROM bookings b
WHERE c.id = b.customer_id
  AND b.customer_id IS NOT NULL
  AND (
    (c.phone IS NULL AND b.customer_phone IS NOT NULL)
    OR (c.dni IS NULL AND b.customer_dni IS NOT NULL)
    OR (c.address IS NULL AND b.customer_address IS NOT NULL)
    OR (c.city IS NULL AND b.customer_city IS NOT NULL)
    OR (c.postal_code IS NULL AND b.customer_postal_code IS NOT NULL)
  );

-- PASO 4: Eliminar columnas redundantes de bookings
ALTER TABLE bookings DROP COLUMN IF EXISTS customer_phone;
ALTER TABLE bookings DROP COLUMN IF EXISTS customer_dni;
ALTER TABLE bookings DROP COLUMN IF EXISTS customer_address;
ALTER TABLE bookings DROP COLUMN IF EXISTS customer_city;
ALTER TABLE bookings DROP COLUMN IF EXISTS customer_postal_code;
ALTER TABLE bookings DROP COLUMN IF EXISTS customer_country;

-- PASO 5: Agregar comentarios descriptivos
COMMENT ON COLUMN bookings.customer_id IS 'Referencia al cliente - todos los demás datos se obtienen por JOIN';
COMMENT ON COLUMN bookings.customer_name IS 'Snapshot del nombre (por GDPR/auditoría)';
COMMENT ON COLUMN bookings.customer_email IS 'Snapshot del email (por GDPR/auditoría)';

-- PASO 6: Verificar resultado
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND column_name LIKE 'customer%'
ORDER BY ordinal_position;

-- PASO 7: Mostrar ejemplo de cómo hacer queries ahora
-- ============================================
-- EJEMPLO DE QUERY CORRECTO POST-MIGRACIÓN:
-- ============================================
/*
SELECT 
    b.*,
    c.phone as customer_phone,
    c.dni as customer_dni,
    c.address as customer_address,
    c.city as customer_city,
    c.postal_code as customer_postal_code,
    c.country as customer_country,
    c.date_of_birth as customer_date_of_birth,
    c.driver_license as customer_driver_license,
    c.driver_license_expiry as customer_driver_license_expiry
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id
WHERE b.id = 'booking-uuid-here';
*/

-- PASO 8: Estadísticas finales
SELECT 
    'Migración completada' as status,
    COUNT(*) as total_bookings,
    COUNT(customer_id) as bookings_with_customer_link,
    COUNT(*) - COUNT(customer_id) as bookings_without_customer
FROM bookings;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Los datos del cliente ahora se editan SOLO en la tabla customers
-- 2. Para mostrar datos del cliente en reservas, siempre hacer JOIN
-- 3. customer_name y customer_email se mantienen por si el cliente se elimina
-- 4. Los datos de backup se guardan en bookings_customer_data_backup (temporal)
-- 5. Si necesitas restaurar datos, usa la tabla temporal antes de cerrar sesión
