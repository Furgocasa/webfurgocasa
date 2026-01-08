-- ============================================================
-- SCRIPT DE INSERCIÓN: Adria Twin Plus 600 SPB Family 2023
-- ============================================================
-- Extraído de: https://www.furgocasa.com/es/reservar/madrid/fu0015-adria-twin-family?pickup=-1
-- Código interno: FU0015
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
    'FU0015',
    'Adria Twin Plus 600 SP Family',
    'fu0015-adria-twin-family',
    'Adria',
    'Twin Plus 600 SPB',
    2023,
    
    -- Descripción completa
    'La Adria Twin Plus 600 SP Family es una camper familiar moderna y elegante. Con capacidad para 4 personas tanto de día como de noche, ofrece un diseño inteligente y funcional perfecto para familias. Con sus 5,99 metros de longitud, combina maniobrabilidad urbana con un interior espacioso y confortable. Equipada con batería de litio, placa solar, calefacción, agua caliente, cocina de gas y sistema Isofix para sillas infantiles. Motor de 130 CV que garantiza un excelente rendimiento. Su configuración permite 4 plazas cómodas, ideal para familias que buscan aventuras sin comprometer la comodidad.',
    
    -- Descripción corta
    'Camper familiar moderna con 4 plazas de día y 4 de noche. Motor 130 CV. Equipamiento completo: Isofix, placa solar, batería litio, calefacción.',
    
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
    130,                        -- engine_power (CV) ← Diferente a los Knaus (140 CV)
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
    WHERE internal_code = 'FU0015';
    
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
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_1.png', 'Adria Twin Family - Exterior', 1, true),
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_1a.png', 'Adria Twin Family - Vista lateral', 2, false),
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_2.png', 'Adria Twin Family - Interior salón', 3, false),
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_3.png', 'Adria Twin Family - Zona comedor', 4, false),
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_4.png', 'Adria Twin Family - Cocina', 5, false),
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_5.png', 'Adria Twin Family - Zona de descanso', 6, false),
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_6.png', 'Adria Twin Family - Baño', 7, false),
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_8.png', 'Adria Twin Family - Almacenamiento', 8, false),
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_11.png', 'Adria Twin Family - Panel control', 9, false),
    (v_vehicle_id, '/images/vehicles/adria-twin-family/furgocasa_adria_twin_plus_600spb_family_13.png', 'Adria Twin Family - Zona exterior', 10, false);
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
        'Vehículo FU0015 - Adria Twin Plus 600 SP Family 2023 creado desde script de importación',
        v_vehicle_id::text,
        NOW()
    );
    
    RAISE NOTICE 'Vehículo FU0015 - Adria Twin Family insertado correctamente con ID: %', v_vehicle_id;
    
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
    engine_power
FROM vehicles
WHERE internal_code = 'FU0015';

-- Ver características
SELECT 
    v.internal_code,
    v.name,
    vf.feature_name,
    vf.feature_value,
    vf.is_highlighted
FROM vehicles v
INNER JOIN vehicle_features vf ON v.id = vf.vehicle_id
WHERE v.internal_code = 'FU0015'
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
WHERE v.internal_code = 'FU0015';

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
WHERE v.internal_code = 'FU0015'
ORDER BY vi.sort_order;
*/

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 
-- 1. DIFERENCIAS CON KNAUS:
--    - Motor 130 CV (vs 140 CV de Knaus)
--    - Marca Adria (marca eslovena)
--    - Año 2023 (como FU0010)
--
-- 2. CARACTERÍSTICAS FAMILIARES:
--    - 4 plazas completas para adultos
--    - Sistema Isofix para sillas infantiles
--    - Mismo precio (€255/día)
--
-- 3. CATEGORÍA:
--    Todos los vehículos pertenecen a "Campers Gran Volumen"
--
-- 4. IMÁGENES:
--    Las imágenes están comentadas por ahora.
--    Se habilitarán cuando se configure la tabla vehicle_images.
--
-- ============================================================

