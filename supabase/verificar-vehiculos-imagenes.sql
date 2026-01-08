-- ====================================================
-- VERIFICAR QUE TODOS LOS VEHÍCULOS SE MUESTRAN
-- ====================================================

-- 1. Ver cuántos vehículos hay en total
SELECT COUNT(*) AS total_vehiculos FROM vehicles;

-- 2. Ver cuántos tienen imágenes
SELECT 
    COUNT(DISTINCT v.id) AS vehiculos_con_imagenes
FROM vehicles v
INNER JOIN vehicle_images vi ON v.id = vi.vehicle_id;

-- 3. Ver cuántos NO tienen imágenes
SELECT 
    COUNT(*) AS vehiculos_sin_imagenes
FROM vehicles v
WHERE NOT EXISTS (
    SELECT 1 FROM vehicle_images vi WHERE vi.vehicle_id = v.id
);

-- 4. Listar vehículos SIN imágenes
SELECT 
    id,
    name,
    slug,
    internal_code,
    is_for_rent,
    status
FROM vehicles v
WHERE NOT EXISTS (
    SELECT 1 FROM vehicle_images vi WHERE vi.vehicle_id = v.id
)
ORDER BY name;

-- 5. Listar vehículos CON imágenes y cuántas tienen
SELECT 
    v.id,
    v.name,
    v.internal_code,
    COUNT(vi.id) AS total_imagenes,
    COUNT(CASE WHEN vi.is_primary THEN 1 END) AS imagenes_principales
FROM vehicles v
INNER JOIN vehicle_images vi ON v.id = vi.vehicle_id
GROUP BY v.id, v.name, v.internal_code
ORDER BY v.name;

-- 6. Query que debería usar el frontend (simulación)
-- Esta query NO debería filtrar vehículos sin imágenes
SELECT 
    v.id,
    v.name,
    v.slug,
    v.base_price_per_day,
    COUNT(vi.id) AS total_imagenes
FROM vehicles v
LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
WHERE v.is_for_rent = TRUE
AND v.status = 'available'
GROUP BY v.id, v.name, v.slug, v.base_price_per_day
ORDER BY v.name;

