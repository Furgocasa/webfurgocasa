-- ====================================================
-- CONFIGURAR VEHÍCULOS PARA VENTA
-- ====================================================

-- 1. Ver cuántos vehículos hay en total
SELECT 
    COUNT(*) AS total_vehiculos,
    COUNT(CASE WHEN is_for_sale = TRUE THEN 1 END) AS vehiculos_en_venta,
    COUNT(CASE WHEN is_for_rent = TRUE THEN 1 END) AS vehiculos_en_alquiler
FROM vehicles;

-- 2. Ver vehículos que están en venta
SELECT 
    id,
    name,
    internal_code,
    is_for_sale,
    sale_status,
    sale_price,
    sale_price_negotiable
FROM vehicles
WHERE is_for_sale = TRUE
ORDER BY name;

-- 3. MARCAR UN VEHÍCULO PARA VENTA (ejemplo)
-- Descomenta y modifica según necesites:

/*
UPDATE vehicles
SET 
    is_for_sale = TRUE,
    sale_status = 'available',
    sale_price = 45000,  -- Precio de venta
    sale_price_negotiable = TRUE,
    condition = 'excellent',  -- Condición: 'new', 'like_new', 'excellent', 'good', 'fair'
    previous_owners = 1,
    sale_highlights = ARRAY['Mantenimiento completo', 'ITV al día', 'Libro de revisiones']
WHERE internal_code = 'FU0010';  -- Cambia por el código del vehículo que quieras vender
*/

-- 4. EJEMPLO: Marcar varios vehículos para venta
/*
UPDATE vehicles
SET 
    is_for_sale = TRUE,
    sale_status = 'available',
    sale_price = 
        CASE 
            WHEN year >= 2023 THEN 55000
            WHEN year >= 2020 THEN 45000
            ELSE 35000
        END,
    sale_price_negotiable = TRUE,
    condition = 'excellent',
    previous_owners = 1,
    sale_highlights = ARRAY['Mantenimiento al día', 'ITV vigente', 'Un solo propietario']
WHERE internal_code IN ('FU0010', 'FU0011', 'FU0015');  -- Cambia por tus códigos
*/

-- 5. Verificar los cambios
SELECT 
    internal_code,
    name,
    year,
    is_for_sale,
    sale_status,
    sale_price,
    sale_price_negotiable,
    condition
FROM vehicles
WHERE is_for_sale = TRUE
ORDER BY internal_code;

