-- Script para verificar y diagnosticar los datos de las reservas

-- 1. Ver todas las ubicaciones disponibles
SELECT 
    id,
    name,
    slug,
    city,
    address,
    is_active
FROM locations
ORDER BY name;

-- 2. Ver las reservas existentes con sus ubicaciones
SELECT 
    b.booking_number,
    b.status,
    b.deposit_amount,
    v.name as vehicle_name,
    v.internal_code,
    pl.name as pickup_location_name,
    pl.city as pickup_city,
    dl.name as dropoff_location_name,
    dl.city as dropoff_city,
    b.pickup_date,
    b.dropoff_date,
    b.days,
    b.base_price,
    b.extras_price,
    b.total_price,
    b.customer_name,
    b.customer_email,
    b.created_at
FROM bookings b
LEFT JOIN vehicles v ON b.vehicle_id = v.id
LEFT JOIN locations pl ON b.pickup_location_id = pl.id
LEFT JOIN locations dl ON b.dropoff_location_id = dl.id
ORDER BY b.created_at DESC
LIMIT 10;

-- 3. Ver los extras de las reservas
SELECT 
    b.booking_number,
    e.name as extra_name,
    be.quantity,
    be.unit_price,
    be.total_price
FROM booking_extras be
JOIN bookings b ON be.booking_id = b.id
JOIN extras e ON be.extra_id = e.id
ORDER BY b.created_at DESC;

-- 4. Verificar si hay pickup_location_id o dropoff_location_id NULL
SELECT 
    COUNT(*) as reservas_sin_ubicacion
FROM bookings 
WHERE pickup_location_id IS NULL 
   OR dropoff_location_id IS NULL;

-- 5. Verificar si hay referencias a ubicaciones que no existen
SELECT 
    b.booking_number,
    b.pickup_location_id,
    b.dropoff_location_id
FROM bookings b
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE id = b.pickup_location_id)
   OR NOT EXISTS (SELECT 1 FROM locations WHERE id = b.dropoff_location_id);

