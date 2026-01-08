-- ============================================================
-- SCRIPT DE INSERCIÓN: Knaus Boxstar 600 Family 2022
-- ============================================================
-- Extraído de: https://www.furgocasa.com/es/reservar/madrid/fu0011-knaus-boxstar-600-family?pickup=-1
-- Código interno: FU0012
-- Fecha de creación: 2026-01-07
-- ============================================================

BEGIN;

-- 1. INSERTAR VEHÍCULO PRINCIPAL
-- ================================
INSERT INTO vehicles (
    id,
    internal_code,
    name,
    slug,
    brand,
    model,
    year,
    description,
    short_description,
    
    -- Precios
    base_price_per_day,
    
    -- Categoría
    category_id,
    
    -- Especificaciones técnicas
    seats,
    beds,
    transmission,
    fuel_type,
    fuel_consumption,
    engine_power,
    gears,
    drive_type,
    
    -- Dimensiones y pesos
    length,
    width,
    height,
    weight_empty,
    weight_max,
    
    -- Estado y disponibilidad
    status,
    is_for_rent,
    is_for_sale,
    
    -- Ubicación
    location,
    
    -- Metadatos
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'FU0012',
    'Knaus Boxstar 600 Family',
    'fu0012-knaus-boxstar-600-family',
    'Knaus',
    'Boxstar 600 Family',
    2022,
    
    -- Descripción completa
    'La Knaus Boxstar 600 Family es la camper familiar por excelencia. Con capacidad para 4 personas tanto de día como de noche, ofrece el espacio y la comodidad perfectos para familias. Con sus 5,99 metros de longitud, combina maniobrabilidad con un interior espacioso y funcional. Equipada con todas las comodidades: batería de litio, placa solar, calefacción, agua caliente, cocina de gas y sistema Isofix para sillas infantiles. Su configuración permite 4 plazas cómodas para adultos, ideal para familias que buscan aventuras sin renunciar al confort.',
    
    -- Descripción corta
    'Camper familiar con 4 plazas de día y 4 de noche. Equipamiento completo con Isofix, placa solar, batería litio, calefacción y más.',
    
    -- Precio base
    255.00,
    
    -- Categoría fija: "Campers Gran Volumen"
    'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid,
    
    -- Especificaciones
    4,                          -- seats (asientos)
    4,                          -- beds (plazas de noche - 4 adultos)
    'manual',                   -- transmission
    'diesel',                   -- fuel_type
    '11 l/100km',              -- fuel_consumption
    140,                        -- engine_power (CV)
    6,                          -- gears (velocidades)
    '2x4',                      -- drive_type
    
    -- Dimensiones (en cm convertidos a m para la BD)
    5.99,                       -- length (599 cm)
    2.05,                       -- width (205 cm)
    2.58,                       -- height (258 cm)
    2840,                       -- weight_empty (kg)
    3500,                       -- weight_max (kg)
    
    -- Estado
    'available',
    true,                       -- is_for_rent
    false,                      -- is_for_sale
    
    -- Ubicación
    'Murcia',
    
    -- Timestamps
    NOW(),
    NOW()
);

-- Guardar el ID del vehículo para referencias posteriores
DO $$
DECLARE
    v_vehicle_id UUID;
BEGIN
    -- Obtener el ID del vehículo recién insertado
    SELECT id INTO v_vehicle_id 
    FROM vehicles 
    WHERE internal_code = 'FU0012';
    
    -- 2. INSERTAR CARACTERÍSTICAS/EQUIPAMIENTO
    -- =========================================
    
    -- Características generales
    INSERT INTO vehicle_features (vehicle_id, feature_name, feature_value) VALUES
    (v_vehicle_id, 'Plazas de día', '4 personas'),
    (v_vehicle_id, 'Plazas de noche', '4 adultos'),
    (v_vehicle_id, 'Número de marchas', '6 velocidades'),
    (v_vehicle_id, 'Sistema de tracción', '2x4'),
    (v_vehicle_id, 'Masa en orden de marcha', '2,840 kg'),
    (v_vehicle_id, 'Peso máximo autorizado', '3,500 kg');
    
    -- Equipamiento destacado
    INSERT INTO vehicle_features (vehicle_id, feature_name, feature_value, is_highlighted) VALUES
    (v_vehicle_id, 'Cambio manual', 'Sí', true),
    (v_vehicle_id, 'Isofix', 'Sí', true),
    (v_vehicle_id, 'Radio multimedia', 'Sí', true),
    (v_vehicle_id, 'Toldo', 'Sí', true),
    (v_vehicle_id, 'Placa solar', 'Sí', true),
    (v_vehicle_id, 'Batería litio', 'Sí', true),
    (v_vehicle_id, 'Nevera eléctrica', 'Sí', true),
    (v_vehicle_id, 'Cocina gas', 'Sí', true),
    (v_vehicle_id, 'Calefacción', 'Sí', true),
    (v_vehicle_id, 'Agua caliente', 'Sí', true);
    
    -- 3. INSERTAR IMÁGENES (DESHABILITADO - Se hará después)
    -- =====================
    /*
    -- Nota: Ajusta las rutas según tu estructura de archivos
    
    INSERT INTO vehicle_images (vehicle_id, image_url, alt_text, sort_order, is_primary) VALUES
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_42_33.jpg', 'Knaus Boxstar Family - Exterior', 1, true),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_42_56.jpg', 'Knaus Boxstar Family - Vista lateral', 2, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_42_44.jpg', 'Knaus Boxstar Family - Interior salón', 3, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_44_43.jpg', 'Knaus Boxstar Family - Zona comedor', 4, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_44_58.jpg', 'Knaus Boxstar Family - Cocina', 5, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_45_11.jpg', 'Knaus Boxstar Family - Zona de descanso', 6, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_45_29.jpg', 'Knaus Boxstar Family - Baño', 7, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_45_16.jpg', 'Knaus Boxstar Family - Almacenamiento', 8, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_46_16.jpg', 'Knaus Boxstar Family - Detalle equipamiento', 9, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_45_48_1.jpg', 'Knaus Boxstar Family - Panel control', 10, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/foto_8-6-22_13_46_37.jpg', 'Knaus Boxstar Family - Zona exterior', 11, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/knaus_bosxtar_family_600_2022_day.webp', 'Knaus Boxstar Family - Configuración día', 12, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-family/knaus_bosxtar_family_600_2022_night.webp', 'Knaus Boxstar Family - Configuración noche', 13, false);
    */
    
    -- 4. ASIGNAR A CATEGORÍA
    -- ======================
    -- La categoría ya está asignada directamente en la columna category_id
    -- ID fijo: c5bc538e-9d91-43ba-907d-b75bd4aab56d ("Campers Gran Volumen")
    
    -- 5. REGISTRAR EN LOG (opcional)
    -- ===============================
    
    INSERT INTO system_logs (
        log_type,
        message,
        reference_id,
        created_at
    ) VALUES (
        'vehicle_creation',
        'Vehículo FU0012 - Knaus Boxstar 600 Family 2022 creado desde script de importación',
        v_vehicle_id::text,
        NOW()
    );
    
    RAISE NOTICE 'Vehículo FU0012 - Knaus Boxstar 600 Family insertado correctamente con ID: %', v_vehicle_id;
    
END $$;

COMMIT;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

SELECT 
    internal_code,
    name,
    brand,
    model,
    year,
    base_price_per_day,
    status,
    is_for_rent,
    location,
    seats,
    beds
FROM vehicles
WHERE internal_code = 'FU0012';

-- Ver características
SELECT 
    v.internal_code,
    v.name,
    vf.feature_name,
    vf.feature_value,
    vf.is_highlighted
FROM vehicles v
INNER JOIN vehicle_features vf ON v.id = vf.vehicle_id
WHERE v.internal_code = 'FU0012'
ORDER BY vf.is_highlighted DESC, vf.feature_name;

-- Ver categoría asignada
SELECT 
    v.internal_code,
    v.name,
    vc.name AS categoria,
    vc.slug AS categoria_slug
FROM vehicles v
INNER JOIN vehicle_category_assignments vca ON v.id = vca.vehicle_id
INNER JOIN vehicle_categories vc ON vca.category_id = vc.id
WHERE v.internal_code = 'FU0012';

-- Ver imágenes (deshabilitado por ahora)
/*
SELECT 
    v.internal_code,
    v.name,
    vi.image_url,
    vi.sort_order,
    vi.is_primary
FROM vehicles v
INNER JOIN vehicle_images vi ON v.id = vi.vehicle_id
WHERE v.internal_code = 'FU0012'
ORDER BY vi.sort_order;
*/

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 
-- 1. DIFERENCIAS CON FU0010 (Boxstar Street):
--    - FU0012 tiene 4 plazas de noche vs 2+2 de FU0010
--    - Mismo precio base (€255/día)
--    - Mismas dimensiones y especificaciones técnicas
--    - Orientada a familias con más capacidad nocturna
--
-- 2. CARACTERÍSTICAS FAMILIARES:
--    - 4 plazas completas para adultos
--    - Sistema Isofix para sillas infantiles
--    - Más espacio de almacenamiento
--
-- 3. IMÁGENES:
--    Las imágenes están comentadas por ahora.
--    Se habilitarán cuando se configure la tabla vehicle_images.
--
-- 4. CATEGORÍA:
--    Asignada a "Campers Familiares" por su orientación.
--
-- 5. EXTRAS DISPONIBLES:
--    Para asignar extras específicos a este vehículo:
--
--    INSERT INTO vehicle_available_extras (vehicle_id, extra_id)
--    SELECT v.id, e.id
--    FROM vehicles v, extras e
--    WHERE v.internal_code = 'FU0012'
--      AND e.name IN ('GPS', 'Sillas infantiles', 'Bicicletas', etc);
--
-- ============================================================

