-- ========================================
-- SCRIPT PARA EXTRAER RESERVAS DE VIKRENTCAR
-- Base de datos antigua: Furgocasa
-- Destino: Nueva aplicación en Supabase
-- ========================================

-- ========================================
-- 1. EXTRAER RESERVAS CON INFORMACIÓN COMPLETA
-- ========================================

SELECT 
    -- Identificación de la reserva
    o.id as reservation_id,
    FROM_UNIXTIME(o.ts) as created_at,
    o.status as reservation_status,
    
    -- Información del cliente
    o.nominative as customer_full_name,
    o.custmail as customer_email,
    o.phone as customer_phone,
    o.country as customer_country,
    o.custdata as customer_raw_data,
    
    -- Información de la reserva
    o.idcar as vehicle_id,
    c.name as vehicle_name,
    c.alias as vehicle_alias,
    FROM_UNIXTIME(o.ritiro) as pickup_datetime,
    FROM_UNIXTIME(o.consegna) as return_datetime,
    o.days as rental_days,
    
    -- Ubicaciones
    o.idplace as pickup_location_id,
    pl_pickup.name as pickup_location_name,
    o.idreturnplace as return_location_id,
    pl_return.name as return_location_name,
    
    -- Información financiera
    o.order_total as total_amount,
    o.totpaid as paid_amount,
    o.car_cost as vehicle_cost,
    o.locationvat as vat_amount,
    o.tot_taxes as total_taxes,
    o.cust_cost as additional_customer_costs,
    o.payable as amount_payable,
    
    -- Extras y descuentos
    o.optionals as optional_extras,
    o.coupon as coupon_code,
    o.extracosts as extra_costs_json,
    
    -- Método de pago
    o.idpayment as payment_method_id,
    gp.name as payment_method_name,
    o.paymentlog as payment_log,
    
    -- Información adicional
    o.lang as language,
    o.adminnotes as admin_notes,
    o.hourly as is_hourly_rental,
    o.seen as is_seen_by_admin,
    
    -- Relación con busy (calendario)
    o.idbusy as busy_calendar_id,
    b.realback as actual_return_datetime
    
FROM fur_vikrentcar_orders o

-- JOIN con vehículos
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id

-- JOIN con lugares de recogida
LEFT JOIN fur_vikrentcar_places pl_pickup ON o.idplace = pl_pickup.id

-- JOIN con lugares de devolución  
LEFT JOIN fur_vikrentcar_places pl_return ON o.idreturnplace = pl_return.id

-- JOIN con métodos de pago
LEFT JOIN fur_vikrentcar_gpayments gp ON o.idpayment = gp.id

-- JOIN con calendario de ocupación
LEFT JOIN fur_vikrentcar_busy b ON o.idbusy = b.id

-- Ordenar por fecha de creación (más recientes primero)
ORDER BY o.ts DESC;


-- ========================================
-- 2. EXTRAER SOLO RESERVAS CONFIRMADAS
-- ========================================

SELECT 
    o.id,
    FROM_UNIXTIME(o.ts) as created_at,
    o.nominative as customer_name,
    o.custmail as email,
    o.phone,
    c.name as vehicle,
    FROM_UNIXTIME(o.ritiro) as pickup_date,
    FROM_UNIXTIME(o.consegna) as return_date,
    o.days,
    o.order_total as total,
    o.totpaid as paid
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id
WHERE o.status = 'confirmed'
ORDER BY o.ritiro DESC;


-- ========================================
-- 3. EXTRAER CLIENTES ÚNICOS
-- ========================================

SELECT DISTINCT
    o.custmail as email,
    o.nominative as full_name,
    o.phone,
    o.country,
    MIN(FROM_UNIXTIME(o.ts)) as first_reservation,
    MAX(FROM_UNIXTIME(o.ts)) as last_reservation,
    COUNT(*) as total_reservations,
    SUM(o.order_total) as total_spent
FROM fur_vikrentcar_orders o
WHERE o.custmail IS NOT NULL AND o.custmail != ''
GROUP BY o.custmail, o.nominative, o.phone, o.country
ORDER BY total_reservations DESC;


-- ========================================
-- 4. EXTRAER INFORMACIÓN DE VEHÍCULOS
-- ========================================

SELECT 
    c.id as vehicle_id,
    c.name as vehicle_name,
    c.alias as vehicle_slug,
    c.short_info as description,
    c.img as main_image,
    c.moreimgs as additional_images,
    c.avail as is_available,
    c.units as units_available,
    c.startfrom as price_from,
    COUNT(o.id) as total_bookings,
    MAX(FROM_UNIXTIME(o.ritiro)) as last_booking_date
FROM fur_vikrentcar_cars c
LEFT JOIN fur_vikrentcar_orders o ON c.id = o.idcar
GROUP BY c.id
ORDER BY total_bookings DESC;


-- ========================================
-- 5. EXTRAER RESERVAS POR RANGO DE FECHAS
-- (Últimos 2 años como ejemplo)
-- ========================================

SELECT 
    o.id,
    FROM_UNIXTIME(o.ts) as created_at,
    o.nominative as customer,
    o.custmail as email,
    c.name as vehicle,
    FROM_UNIXTIME(o.ritiro) as pickup,
    FROM_UNIXTIME(o.consegna) as return_date,
    o.status,
    o.order_total as total
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id
WHERE o.ritiro >= UNIX_TIMESTAMP('2024-01-01')
ORDER BY o.ritiro DESC;


-- ========================================
-- 6. ESTADÍSTICAS GENERALES
-- ========================================

-- Total de reservas por estado
SELECT 
    status,
    COUNT(*) as total,
    SUM(order_total) as revenue
FROM fur_vikrentcar_orders
GROUP BY status;

-- Total de reservas por vehículo
SELECT 
    c.name as vehicle,
    COUNT(o.id) as total_bookings,
    AVG(o.days) as avg_rental_days,
    SUM(o.order_total) as total_revenue
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id
GROUP BY c.name
ORDER BY total_bookings DESC;

-- Reservas por mes (último año)
SELECT 
    DATE_FORMAT(FROM_UNIXTIME(ritiro), '%Y-%m') as month,
    COUNT(*) as total_reservations,
    SUM(order_total) as monthly_revenue
FROM fur_vikrentcar_orders
WHERE ritiro >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 YEAR))
GROUP BY month
ORDER BY month DESC;


-- ========================================
-- 7. EXTRAER LUGARES DE RECOGIDA/DEVOLUCIÓN
-- ========================================

SELECT 
    id,
    name as location_name,
    lat as latitude,
    lng as longitude
FROM fur_vikrentcar_places
ORDER BY name;


-- ========================================
-- 8. EXTRAER OPCIONALES/EXTRAS
-- ========================================

SELECT 
    id,
    name as extra_name,
    img as image,
    cost as price,
    perday as is_per_day
FROM fur_vikrentcar_optionals
ORDER BY name;


-- ========================================
-- 9. EXTRAER CUPONES USADOS
-- ========================================

SELECT DISTINCT
    o.coupon as coupon_code,
    COUNT(*) as times_used,
    SUM(o.order_total) as total_with_coupon
FROM fur_vikrentcar_orders o
WHERE o.coupon IS NOT NULL AND o.coupon != ''
GROUP BY o.coupon
ORDER BY times_used DESC;


-- ========================================
-- 10. PREPARAR DATOS PARA MIGRACIÓN A SUPABASE
-- Formato JSON-like para facilitar la importación
-- ========================================

SELECT JSON_OBJECT(
    'old_id', o.id,
    'created_at', FROM_UNIXTIME(o.ts),
    'status', o.status,
    'customer', JSON_OBJECT(
        'name', o.nominative,
        'email', o.custmail,
        'phone', o.phone,
        'country', o.country
    ),
    'booking', JSON_OBJECT(
        'vehicle_id', o.idcar,
        'vehicle_name', c.name,
        'pickup_date', FROM_UNIXTIME(o.ritiro),
        'return_date', FROM_UNIXTIME(o.consegna),
        'days', o.days,
        'pickup_location_id', o.idplace,
        'return_location_id', o.idreturnplace
    ),
    'pricing', JSON_OBJECT(
        'total', o.order_total,
        'paid', o.totpaid,
        'vat', o.locationvat,
        'taxes', o.tot_taxes
    ),
    'extras', JSON_OBJECT(
        'optionals', o.optionals,
        'coupon', o.coupon
    ),
    'notes', JSON_OBJECT(
        'admin', o.adminnotes,
        'customer', ''
    )
) as booking_json
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id
ORDER BY o.ts DESC;
