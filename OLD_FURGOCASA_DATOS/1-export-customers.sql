-- ========================================
-- SCRIPT SQL PARA EXPORTAR TODOS LOS CLIENTES
-- Ejecutar en MySQL y exportar resultado como JSON
-- ========================================

SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.email,
    c.phone,
    c.country,
    c.address,
    c.city,
    c.zip,
    c.docnum,
    c.bdate,
    c.notes
FROM fur_vikrentcar_customers c
ORDER BY c.id ASC;
