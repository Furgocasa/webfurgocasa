-- ============================================================
-- SCRIPT DE INSERCIÓN: Weinsberg Carabus 600 MQ FIRE 2025
-- ============================================================
-- Extraído de: https://www.furgocasa.com/es/reservar/madrid/fu0019-weinsberg-carabus-600-mq?pickup=-1
-- Código interno: FU0019
-- Fecha de creación: 2026-01-07
-- Tour 360º: https://my.matterport.com/show/?m=cNXzVHDFb3Y&brand=0
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
    
    -- Metadatos adicionales
    meta_description,
    
    -- Timestamps
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'FU0019',
    'Weinsberg Carabus 600 MQ',
    'fu0019-weinsberg-carabus-600-mq',
    'Weinsberg',
    'Carabus 600 Mq FIRE',
    2025,
    
    -- Descripción completa
    'La Weinsberg Carabus 600 MQ FIRE es nuestra camper más moderna y reciente (2025). Con un diseño innovador y funcional, ofrece la configuración perfecta para parejas o familias pequeñas. Con 2 plazas de noche para adultos y espacio adicional para 1-2 niños, combina confort y versatilidad. Motor de 130 CV, 5,99 metros de longitud, equipada con todas las comodidades: batería de litio, placa solar, calefacción, agua caliente, cocina de gas y sistema Isofix. Incluye tour virtual 360º para explorar cada detalle del interior antes de tu reserva. Ideal para quienes buscan lo último en tecnología camper.',
    
    -- Descripción corta
    'Camper premium 2025 con 4 plazas de día y 2+2 de noche. Motor 130 CV. Tour 360º disponible. Equipamiento completo: Isofix, placa solar, batería litio, calefacción.',
    
    -- Precio base (más alto que otros modelos)
    285.00,
    
    -- Categoría fija: "Campers Gran Volumen"
    'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid,
    
    -- Especificaciones
    4,                          -- seats (asientos)
    2,                          -- beds (plazas de noche - 2 adultos + 1-2 niños)
    'manual',                   -- transmission
    'diesel',                   -- fuel_type
    '11 l/100km',              -- fuel_consumption
    130,                        -- engine_power (CV)
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
    
    -- Meta descripción (para SEO)
    'Alquila la Weinsberg Carabus 600 MQ FIRE 2025, nuestra camper más moderna. Tour virtual 360º disponible. Desde €285/día en Furgocasa.',
    
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
    WHERE internal_code = 'FU0019';
    
    -- 2. INSERTAR CARACTERÍSTICAS/EQUIPAMIENTO
    -- =========================================
    
    -- Características generales
    INSERT INTO vehicle_features (vehicle_id, feature_name, feature_value) VALUES
    (v_vehicle_id, 'Plazas de día', '4 personas'),
    (v_vehicle_id, 'Plazas de noche', '2 adultos (1-2 niños)'),
    (v_vehicle_id, 'Tour virtual 360º', 'Disponible en https://my.matterport.com/show/?m=cNXzVHDFb3Y&brand=0'),
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
    -- 17 imágenes detectadas
    
    INSERT INTO vehicle_images (vehicle_id, image_url, alt_text, sort_order, is_primary) VALUES
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/1_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Exterior', 1, true),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/2_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Vista lateral', 2, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/3_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Interior salón', 3, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/4_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Cocina', 4, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/5_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Zona comedor', 5, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/6_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Cama', 6, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/7_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Baño', 7, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/8_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Almacenamiento', 8, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/9_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Panel control', 9, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/10_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Equipamiento', 10, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/11_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Detalle 1', 11, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/12_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Detalle 2', 12, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/13_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Detalle 3', 13, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/14_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Detalle 4', 14, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/15_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Detalle 5', 15, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/16_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Detalle 6', 16, false),
    (v_vehicle_id, '/images/vehicles/weinsberg-carabus-fu0019/17_-_weinsberg_caraus_mq.jpg', 'Weinsberg Carabus 600 MQ - Vista completa', 17, false);
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
        'Vehículo FU0019 - Weinsberg Carabus 600 MQ FIRE 2025 creado desde script de importación',
        v_vehicle_id::text,
        NOW()
    );
    
    RAISE NOTICE 'Vehículo FU0019 - Weinsberg Carabus 600 MQ insertado correctamente con ID: %', v_vehicle_id;
    
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
    beds,
    engine_power,
    category_id
FROM vehicles
WHERE internal_code = 'FU0019';

-- Ver características
SELECT 
    v.internal_code,
    v.name,
    vf.feature_name,
    vf.feature_value,
    vf.is_highlighted
FROM vehicles v
INNER JOIN vehicle_features vf ON v.id = vf.vehicle_id
WHERE v.internal_code = 'FU0019'
ORDER BY vf.is_highlighted DESC, vf.feature_name;

-- Ver categoría asignada
SELECT 
    v.internal_code,
    v.name,
    vc.name AS categoria,
    vc.slug AS categoria_slug
FROM vehicles v
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
WHERE v.internal_code = 'FU0019';

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
WHERE v.internal_code = 'FU0019'
ORDER BY vi.sort_order;
*/

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 
-- 1. VEHÍCULO PREMIUM - CARACTERÍSTICAS DESTACADAS:
--    - Año 2025: El más nuevo de la flota
--    - Precio €285/día (€30 más que otros modelos)
--    - Tour virtual 360º disponible
--    - Motor 130 CV (Weinsberg)
--    - Modelo FIRE (edición especial)
--
-- 2. DIFERENCIAS CON OTROS VEHÍCULOS:
--    - Más caro: €285 vs €255 de otros modelos
--    - Más nuevo: 2025 (vs 2022-2023 de otros)
--    - Motor 130 CV (vs 140 CV de Knaus)
--    - Tour 360º incluido
--
-- 3. CONFIGURACIÓN PLAZAS:
--    - 4 plazas de día
--    - 2 adultos + 1-2 niños de noche
--    - Similar a FU0010 (Knaus Boxstar Street)
--
-- 4. TOUR VIRTUAL 360º:
--    URL: https://my.matterport.com/show/?m=cNXzVHDFb3Y&brand=0
--    Puede integrarse en la página del vehículo
--
-- 5. IMÁGENES:
--    17 imágenes detectadas (1_-_weinsberg_caraus_mq.jpg ... 17_)
--    Se habilitarán cuando se configure vehicle_images
--
-- 6. CATEGORÍA:
--    Asignada directamente: "Campers Gran Volumen"
--    ID: c5bc538e-9d91-43ba-907d-b75bd4aab56d
--
-- 7. EXTRAS DISPONIBLES:
--    Para asignar extras específicos:
--
--    INSERT INTO vehicle_available_extras (vehicle_id, extra_id)
--    SELECT v.id, e.id
--    FROM vehicles v, extras e
--    WHERE v.internal_code = 'FU0019'
--      AND e.name IN ('GPS', 'Sillas infantiles', etc);
--
-- ============================================================

