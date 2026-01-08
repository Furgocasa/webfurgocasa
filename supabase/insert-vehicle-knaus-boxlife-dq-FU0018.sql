-- ============================================================
-- SCRIPT DE INSERCIÓN: Knaus Boxlife 600 DQ 2023
-- ============================================================
-- Extraído de: https://www.furgocasa.com/es/reservar/madrid/fu0018-knaus-boxlife-dq?pickup=-1
-- Código interno: FU0018
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
    'FU0018',
    'Knaus Boxlife 600 DQ',
    'fu0018-knaus-boxlife-dq',
    'Knaus',
    'Boxlife DQ',
    2023,
    
    -- Descripción completa
    'La Knaus Boxlife 600 DQ es una camper familiar versátil y moderna. Con capacidad para 4 personas tanto de día como de noche, ofrece una configuración inteligente con cama doble queen (DQ) que maximiza el espacio y el confort. Con sus 5,99 metros de longitud, combina perfectamente maniobrabilidad urbana con un interior espacioso y funcional. Equipada con todas las comodidades: batería de litio, placa solar, calefacción, agua caliente, cocina de gas y sistema Isofix. Motor potente de 140 CV que garantiza excelente rendimiento en carretera. Ideal para familias que buscan aventuras sin renunciar al confort de una cama doble de calidad.',
    
    -- Descripción corta
    'Camper familiar con cama doble queen. 4 plazas día y noche. Motor 140 CV. Equipamiento completo: Isofix, placa solar, batería litio, calefacción.',
    
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
    WHERE internal_code = 'FU0018';
    
    -- 2. INSERTAR CARACTERÍSTICAS/EQUIPAMIENTO
    -- =========================================
    
    -- Características generales
    INSERT INTO vehicle_features (vehicle_id, feature_name, feature_value) VALUES
    (v_vehicle_id, 'Plazas de día', '4 personas'),
    (v_vehicle_id, 'Plazas de noche', '4 adultos'),
    (v_vehicle_id, 'Configuración camas', 'Cama doble queen (DQ)'),
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
    -- Nota: No se detectaron imágenes específicas en la página
    -- Añadir cuando estén disponibles
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
        'Vehículo FU0018 - Knaus Boxlife 600 DQ 2023 creado desde script de importación',
        v_vehicle_id::text,
        NOW()
    );
    
    RAISE NOTICE 'Vehículo FU0018 - Knaus Boxlife DQ insertado correctamente con ID: %', v_vehicle_id;
    
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
WHERE internal_code = 'FU0018';

-- Ver características
SELECT 
    v.internal_code,
    v.name,
    vf.feature_name,
    vf.feature_value,
    vf.is_highlighted
FROM vehicles v
INNER JOIN vehicle_features vf ON v.id = vf.vehicle_id
WHERE v.internal_code = 'FU0018'
ORDER BY vf.is_highlighted DESC, vf.feature_name;

-- Ver categoría asignada
SELECT 
    v.internal_code,
    v.name,
    vc.name AS categoria,
    vc.slug AS categoria_slug
FROM vehicles v
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
WHERE v.internal_code = 'FU0018';

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
WHERE v.internal_code = 'FU0018'
ORDER BY vi.sort_order;
*/

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 
-- 1. DIFERENCIAS CON OTROS KNAUS:
--    - Configuración DQ (Double Queen): cama doble queen
--    - Más espacio para la cama principal
--    - Mismas especificaciones técnicas (140 CV, 599 cm)
--
-- 2. CARACTERÍSTICAS DESTACADAS:
--    - Cama doble queen (DQ) más amplia
--    - 4 plazas completas para adultos
--    - Sistema Isofix para sillas infantiles
--    - Mismo precio (€255/día)
--
-- 3. CATEGORÍA:
--    Asignada directamente: "Campers Gran Volumen"
--    ID: c5bc538e-9d91-43ba-907d-b75bd4aab56d
--
-- 4. IMÁGENES:
--    No se detectaron imágenes en la página web.
--    Añadir cuando estén disponibles.
--
-- 5. EXTRAS DISPONIBLES:
--    Para asignar extras específicos:
--
--    INSERT INTO vehicle_available_extras (vehicle_id, extra_id)
--    SELECT v.id, e.id
--    FROM vehicles v, extras e
--    WHERE v.internal_code = 'FU0018'
--      AND e.name IN ('GPS', 'Sillas infantiles', etc);
--
-- ============================================================

