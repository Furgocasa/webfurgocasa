-- ============================================
-- ELIMINAR COLUMNA deposit_amount DE bookings
-- ============================================
-- La columna deposit_amount no tiene sentido en la tabla bookings
-- porque la fianza es una constante del sistema (1000€) y no un dato variable de cada reserva.
-- Solo necesitamos amount_paid para registrar cuánto ha pagado el cliente.
--
-- Fecha: 2026-01-27
-- Razón: La fianza no es un campo de la reserva, es una constante del sistema
-- ============================================

-- PASO 1: Obtener las definiciones de las vistas antes de eliminarlas
-- (Para poder recrearlas después sin deposit_amount)
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE viewname IN ('bookings_with_customer_details', 'bookings_public')
    AND schemaname = 'public';

-- PASO 2: Eliminar la columna usando CASCADE
-- Esto eliminará automáticamente las vistas que dependen de ella
ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS deposit_amount CASCADE;

-- PASO 3: Recrear las vistas SIN deposit_amount
-- Vista: bookings_with_customer_details
CREATE OR REPLACE VIEW public.bookings_with_customer_details AS
SELECT 
    b.id,
    b.booking_number,
    b.vehicle_id,
    b.customer_id,
    b.pickup_location_id,
    b.dropoff_location_id,
    b.pickup_date,
    b.pickup_time,
    b.dropoff_date,
    b.dropoff_time,
    b.days,
    b.base_price,
    b.extras_price,
    b.location_fee,
    b.discount,
    b.total_price,
    b.amount_paid,
    b.status,
    b.payment_status,
    b.customer_name,
    b.customer_email,
    b.notes,
    b.admin_notes,
    b.created_at,
    b.updated_at,
    -- Datos completos del cliente desde la tabla customers
    c.name as customer_full_name,
    c.email as customer_full_email,
    c.phone as customer_full_phone,
    c.dni as customer_full_dni,
    c.address as customer_full_address,
    c.city as customer_full_city,
    c.postal_code as customer_full_postal_code,
    c.country as customer_country,
    c.date_of_birth as customer_date_of_birth,
    c.driver_license as customer_driver_license,
    c.driver_license_expiry as customer_driver_license_expiry
FROM public.bookings b
LEFT JOIN public.customers c ON b.customer_id = c.id;

-- Vista: bookings_public (para clientes - datos limitados)
CREATE OR REPLACE VIEW public.bookings_public AS
SELECT 
    b.id,
    b.booking_number,
    b.vehicle_id,
    b.pickup_location_id,
    b.dropoff_location_id,
    b.pickup_date,
    b.pickup_time,
    b.dropoff_date,
    b.dropoff_time,
    b.days,
    b.base_price,
    b.extras_price,
    b.total_price,
    b.amount_paid,
    b.status,
    b.payment_status,
    b.customer_email,
    b.notes,
    b.created_at
FROM public.bookings b;

-- PASO 4: Verificación - Listar las columnas restantes de la tabla bookings
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- ✅ La columna deposit_amount debe haber desaparecido
-- ✅ Las vistas bookings_with_customer_details y bookings_public están recreadas sin deposit_amount
-- ✅ El resto de la aplicación ya está actualizado y no usa deposit_amount
-- ============================================
