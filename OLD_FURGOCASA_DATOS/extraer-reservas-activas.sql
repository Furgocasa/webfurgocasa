-- ========================================
-- SCRIPT PARA EXTRAER SOLO RESERVAS ACTIVAS Y FUTURAS
-- Base de datos antigua: Furgocasa
-- Destino: Nueva aplicación en Supabase
-- ========================================
-- 
-- IMPORTANTE: Solo extrae reservas que:
-- 1. AÚN NO HAN COMENZADO (fecha de recogida en el futuro)
-- 2. ESTÁN EN CURSO (ya recogida pero no devuelta)
-- 
-- NO extrae reservas completadas (ambas fechas en el pasado)
-- ========================================


-- ========================================
-- 1. RESUMEN: CONTAR RESERVAS ACTIVAS Y FUTURAS
-- ========================================

SELECT 
    'Total Activas y Futuras' as tipo,
    COUNT(*) as cantidad
FROM fur_vikrentcar_orders
WHERE consegna >= UNIX_TIMESTAMP(NOW())

UNION ALL

SELECT 
    'Solo Futuras (aún no recogidas)' as tipo,
    COUNT(*) as cantidad
FROM fur_vikrentcar_orders
WHERE ritiro > UNIX_TIMESTAMP(NOW())

UNION ALL

SELECT 
    'En Curso (ya recogidas, no devueltas)' as tipo,
    COUNT(*) as cantidad
FROM fur_vikrentcar_orders
WHERE ritiro <= UNIX_TIMESTAMP(NOW()) 
  AND consegna >= UNIX_TIMESTAMP(NOW());


-- ========================================
-- 2. EXTRAER RESERVAS FUTURAS (AÚN NO COMENZADAS)
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
    
    -- Información de la reserva
    o.idcar as vehicle_id,
    c.name as vehicle_name,
    c.alias as vehicle_slug,
    FROM_UNIXTIME(o.ritiro) as pickup_datetime,
    FROM_UNIXTIME(o.consegna) as return_datetime,
    o.days as rental_days,
    
    -- Ubicaciones
    o.idplace as pickup_location_id,
    o.idreturnplace as return_location_id,
    
    -- Información financiera
    o.order_total as total_amount,
    o.totpaid as paid_amount,
    o.locationvat as vat_amount,
    o.tot_taxes as total_taxes,
    
    -- Extras
    o.optionals as optional_extras,
    o.coupon as coupon_code,
    
    -- Notas
    o.adminnotes as admin_notes,
    o.lang as language,
    
    -- Días hasta la recogida
    DATEDIFF(FROM_UNIXTIME(o.ritiro), NOW()) as days_until_pickup
    
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id

-- FILTRO: Solo reservas que aún no han comenzado
WHERE o.ritiro > UNIX_TIMESTAMP(NOW())

-- Ordenar por fecha de recogida (próximas primero)
ORDER BY o.ritiro ASC;


-- ========================================
-- 3. EXTRAER RESERVAS EN CURSO (YA RECOGIDAS, NO DEVUELTAS)
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
    
    -- Información de la reserva
    o.idcar as vehicle_id,
    c.name as vehicle_name,
    FROM_UNIXTIME(o.ritiro) as pickup_datetime,
    FROM_UNIXTIME(o.consegna) as return_datetime,
    o.days as rental_days,
    
    -- Información financiera
    o.order_total as total_amount,
    o.totpaid as paid_amount,
    
    -- Días que lleva alquilado
    DATEDIFF(NOW(), FROM_UNIXTIME(o.ritiro)) as days_rented,
    
    -- Días hasta la devolución
    DATEDIFF(FROM_UNIXTIME(o.consegna), NOW()) as days_until_return
    
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id

-- FILTRO: Solo reservas en curso
WHERE o.ritiro <= UNIX_TIMESTAMP(NOW()) 
  AND o.consegna >= UNIX_TIMESTAMP(NOW())

-- Ordenar por fecha de devolución (próximas primero)
ORDER BY o.consegna ASC;


-- ========================================
-- 4. TODAS LAS RESERVAS ACTIVAS (FUTURAS + EN CURSO)
-- Esta es la consulta principal para la migración
-- ========================================

SELECT 
    -- Identificación
    o.id as old_reservation_id,
    FROM_UNIXTIME(o.ts) as created_at,
    o.status,
    
    -- Cliente
    o.nominative as customer_name,
    o.custmail as customer_email,
    o.phone as customer_phone,
    o.country as customer_country,
    
    -- Reserva
    o.idcar as old_vehicle_id,
    c.name as vehicle_name,
    c.alias as vehicle_slug,
    FROM_UNIXTIME(o.ritiro) as pickup_date,
    FROM_UNIXTIME(o.consegna) as return_date,
    o.days as rental_days,
    
    -- Ubicaciones
    o.idplace as pickup_location_id,
    o.idreturnplace as return_location_id,
    
    -- Financiero
    o.order_total as total_price,
    o.totpaid as paid_amount,
    o.locationvat as vat,
    o.tot_taxes as taxes,
    o.car_cost as vehicle_cost,
    
    -- Extras
    o.optionals as extras,
    o.coupon as coupon_code,
    o.extracosts as extra_costs,
    
    -- Método de pago
    o.idpayment as payment_method_id,
    o.paymentlog as payment_log,
    
    -- Notas
    o.adminnotes as notes,
    o.lang as language,
    
    -- Estado del viaje
    CASE 
        WHEN o.ritiro > UNIX_TIMESTAMP(NOW()) THEN 'FUTURA'
        WHEN o.ritiro <= UNIX_TIMESTAMP(NOW()) AND o.consegna >= UNIX_TIMESTAMP(NOW()) THEN 'EN_CURSO'
        ELSE 'COMPLETADA'
    END as trip_status,
    
    -- Días relativos
    DATEDIFF(FROM_UNIXTIME(o.ritiro), NOW()) as days_until_pickup,
    DATEDIFF(FROM_UNIXTIME(o.consegna), NOW()) as days_until_return
    
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id

-- FILTRO PRINCIPAL: Solo reservas activas (fecha de devolución en el futuro)
WHERE o.consegna >= UNIX_TIMESTAMP(NOW())

-- Ordenar por fecha de recogida
ORDER BY o.ritiro ASC;


-- ========================================
-- 5. ESTADÍSTICAS DE RESERVAS ACTIVAS
-- ========================================

-- Por estado de viaje
SELECT 
    CASE 
        WHEN o.ritiro > UNIX_TIMESTAMP(NOW()) THEN 'FUTURA (no comenzada)'
        WHEN o.ritiro <= UNIX_TIMESTAMP(NOW()) AND o.consegna >= UNIX_TIMESTAMP(NOW()) THEN 'EN CURSO (activa)'
    END as estado_viaje,
    COUNT(*) as total,
    SUM(o.order_total) as ingresos_totales,
    SUM(o.totpaid) as ya_pagado,
    SUM(o.order_total - o.totpaid) as pendiente_cobro
FROM fur_vikrentcar_orders o
WHERE o.consegna >= UNIX_TIMESTAMP(NOW())
GROUP BY estado_viaje;

-- Por vehículo
SELECT 
    c.name as vehiculo,
    COUNT(*) as reservas_activas,
    SUM(o.order_total) as ingresos_esperados
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id
WHERE o.consegna >= UNIX_TIMESTAMP(NOW())
GROUP BY c.name
ORDER BY reservas_activas DESC;

-- Por mes de recogida
SELECT 
    DATE_FORMAT(FROM_UNIXTIME(o.ritiro), '%Y-%m') as mes_recogida,
    COUNT(*) as total_reservas,
    SUM(o.order_total) as ingresos
FROM fur_vikrentcar_orders o
WHERE o.consegna >= UNIX_TIMESTAMP(NOW())
GROUP BY mes_recogida
ORDER BY mes_recogida ASC;


-- ========================================
-- 6. RESERVAS ACTIVAS CON INFORMACIÓN COMPLETA PARA CSV
-- (Optimizado para exportar y revisar en Excel)
-- ========================================

SELECT 
    o.id,
    o.status,
    
    -- Estado del viaje
    CASE 
        WHEN o.ritiro > UNIX_TIMESTAMP(NOW()) THEN 'Pendiente'
        WHEN o.ritiro <= UNIX_TIMESTAMP(NOW()) AND o.consegna >= UNIX_TIMESTAMP(NOW()) THEN 'En Curso'
    END as estado,
    
    -- Fechas formato legible
    DATE_FORMAT(FROM_UNIXTIME(o.ts), '%Y-%m-%d %H:%i') as fecha_reserva,
    DATE_FORMAT(FROM_UNIXTIME(o.ritiro), '%Y-%m-%d %H:%i') as fecha_recogida,
    DATE_FORMAT(FROM_UNIXTIME(o.consegna), '%Y-%m-%d %H:%i') as fecha_devolucion,
    o.days as dias,
    
    -- Cliente
    o.nominative as cliente,
    o.custmail as email,
    o.phone as telefono,
    o.country as pais,
    
    -- Vehículo
    c.name as furgoneta,
    
    -- Precios
    o.order_total as total,
    o.totpaid as pagado,
    (o.order_total - o.totpaid) as pendiente,
    
    -- Extras
    o.coupon as cupon,
    o.adminnotes as notas
    
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id
WHERE o.consegna >= UNIX_TIMESTAMP(NOW())
ORDER BY o.ritiro ASC;


-- ========================================
-- 7. FORMATO JSON PARA MIGRACIÓN A SUPABASE
-- Solo reservas activas y futuras
-- ========================================

SELECT JSON_OBJECT(
    'old_id', o.id,
    'created_at', FROM_UNIXTIME(o.ts),
    'status', o.status,
    'trip_status', CASE 
        WHEN o.ritiro > UNIX_TIMESTAMP(NOW()) THEN 'pending'
        WHEN o.ritiro <= UNIX_TIMESTAMP(NOW()) AND o.consegna >= UNIX_TIMESTAMP(NOW()) THEN 'in_progress'
    END,
    'customer', JSON_OBJECT(
        'name', o.nominative,
        'email', o.custmail,
        'phone', o.phone,
        'country', o.country
    ),
    'booking', JSON_OBJECT(
        'old_vehicle_id', o.idcar,
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
        'pending', o.order_total - o.totpaid,
        'vat', o.locationvat,
        'taxes', o.tot_taxes
    ),
    'extras', JSON_OBJECT(
        'optionals', o.optionals,
        'coupon', o.coupon,
        'extra_costs', o.extracosts
    ),
    'notes', JSON_OBJECT(
        'admin', o.adminnotes
    )
) as booking_json
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id

-- FILTRO: Solo reservas activas
WHERE o.consegna >= UNIX_TIMESTAMP(NOW())

ORDER BY o.ritiro ASC;


-- ========================================
-- 8. VERIFICAR FECHAS SOSPECHOSAS
-- (Por si hay reservas con fechas erróneas)
-- ========================================

SELECT 
    o.id,
    o.nominative as cliente,
    FROM_UNIXTIME(o.ritiro) as recogida,
    FROM_UNIXTIME(o.consegna) as devolucion,
    o.days as dias_reservados,
    DATEDIFF(FROM_UNIXTIME(o.consegna), FROM_UNIXTIME(o.ritiro)) as dias_reales,
    CASE
        WHEN o.consegna <= o.ritiro THEN 'ERROR: Devolución antes de recogida'
        WHEN o.days != DATEDIFF(FROM_UNIXTIME(o.consegna), FROM_UNIXTIME(o.ritiro)) THEN 'ADVERTENCIA: Días no coinciden'
        ELSE 'OK'
    END as validacion
FROM fur_vikrentcar_orders o
WHERE o.consegna >= UNIX_TIMESTAMP(NOW())
ORDER BY o.ritiro ASC;
