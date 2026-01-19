-- ========================================
-- SCRIPT SQL PARA EXPORTAR RESERVAS ACTIVAS
-- Ejecutar en MySQL y exportar resultado como JSON
-- ========================================

SELECT 
    o.id,
    o.ts,
    o.status,
    o.nominative,
    o.custmail,
    o.phone,
    o.country,
    o.idcar,
    c.name as vehicle_name,
    o.ritiro,
    o.consegna,
    o.days,
    o.order_total,
    o.totpaid,
    o.locationvat,
    o.adminnotes,
    o.optionals,
    o.coupon,
    o.idplace,
    o.idreturnplace
FROM fur_vikrentcar_orders o
LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id
WHERE o.consegna >= UNIX_TIMESTAMP(NOW())
ORDER BY o.ritiro ASC;
