-- ============================================================
-- SCRIPT DE INSERCIÓN: Knaus Boxstar 600 Street 2023
-- ============================================================
-- Extraído de: https://www.furgocasa.com/es/reservar/madrid/knaus-boxstar-600-street-2023
-- Código interno: FU0010
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
    'FU0010',
    'Knaus Boxstar 600 Street',
    'knaus-boxstar-600-street-2023',
    'Knaus',
    'Boxstar Street 600 MQ',
    2023,
    
    -- Descripción completa
    'La Knaus Boxstar 600 Street es una camper moderna y versátil, perfecta para parejas o familias pequeñas. Con su diseño compacto de 5,99 metros, ofrece la combinación ideal entre maniobrabilidad urbana y confort en ruta. Equipada con todas las comodidades necesarias: batería de litio, placa solar, calefacción, agua caliente y cocina de gas. Su configuración permite 4 plazas de día y 2 plazas de noche cómodas para adultos, con opción para 1-2 niños adicionales.',
    
    -- Descripción corta
    'Camper compacta y moderna con 4 plazas de día y 2 de noche. Equipamiento completo: placa solar, batería litio, calefacción y más.',
    
    -- Precio base
    255.00,
    
    -- Categoría fija: "Campers Gran Volumen"
    'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid,
    
    -- Especificaciones
    4,                          -- seats (asientos)
    2,                          -- beds (plazas de noche)
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
    WHERE internal_code = 'FU0010';
    
    -- 2. INSERTAR CARACTERÍSTICAS/EQUIPAMIENTO
    -- =========================================
    
    -- Características generales
    INSERT INTO vehicle_features (vehicle_id, feature_name, feature_value) VALUES
    (v_vehicle_id, 'Plazas de día', '4 personas'),
    (v_vehicle_id, 'Plazas de noche', '2 adultos (1-2 niños)'),
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
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_4.jpg', 'Knaus Boxstar Street - Exterior', 1, true),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_3.jpg', 'Knaus Boxstar Street - Vista lateral', 2, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_5.jpg', 'Knaus Boxstar Street - Interior salón', 3, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_6.jpg', 'Knaus Boxstar Street - Cocina', 4, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_7.jpg', 'Knaus Boxstar Street - Zona de descanso', 5, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_8.jpg', 'Knaus Boxstar Street - Baño', 6, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_9.jpg', 'Knaus Boxstar Street - Almacenamiento', 7, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_10.jpg', 'Knaus Boxstar Street - Detalle equipamiento', 8, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_11.jpg', 'Knaus Boxstar Street - Panel control', 9, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_12.jpg', 'Knaus Boxstar Street - Techo elevable', 10, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_13.jpg', 'Knaus Boxstar Street - Zona exterior', 11, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_14.jpg', 'Knaus Boxstar Street - Toldo desplegado', 12, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_15.jpg', 'Knaus Boxstar Street - Placa solar', 13, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_16.jpg', 'Knaus Boxstar Street - Vista frontal', 14, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_17.png', 'Knaus Boxstar Street - Plano interior', 15, false),
    (v_vehicle_id, '/images/vehicles/knaus-boxstar-street/k2_18.png', 'Knaus Boxstar Street - Distribución', 16, false);
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
        'Vehículo FU0010 - Knaus Boxstar 600 Street 2023 creado desde script de importación',
        v_vehicle_id::text,
        NOW()
    );
    
    RAISE NOTICE 'Vehículo FU0010 - Knaus Boxstar 600 Street insertado correctamente con ID: %', v_vehicle_id;
    
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
    location
FROM vehicles
WHERE internal_code = 'FU0010';

-- Ver características
SELECT 
    v.internal_code,
    v.name,
    vf.feature_name,
    vf.feature_value,
    vf.is_highlighted
FROM vehicles v
INNER JOIN vehicle_features vf ON v.id = vf.vehicle_id
WHERE v.internal_code = 'FU0010'
ORDER BY vf.is_highlighted DESC, vf.feature_name;

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
WHERE v.internal_code = 'FU0010'
ORDER BY vi.sort_order;
*/

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 
-- 1. AJUSTAR ESTRUCTURA:
--    Este script asume cierta estructura de tablas.
--    Ajusta los nombres de columnas según tu schema real.
--
-- 2. IMÁGENES:
--    Las rutas de imágenes son ejemplos.
--    Descarga las imágenes de la web actual y súbelas a tu storage.
--
-- 3. CATEGORÍAS:
--    Si usas categorías, descomenta y ajusta la sección 4.
--
-- 4. EXTRAS DISPONIBLES:
--    Si quieres asignar extras específicos a este vehículo,
--    usa la tabla vehicle_available_extras:
--
--    INSERT INTO vehicle_available_extras (vehicle_id, extra_id)
--    SELECT v.id, e.id
--    FROM vehicles v, extras e
--    WHERE v.internal_code = 'FU0010'
--      AND e.name IN ('GPS', 'Sillas infantiles', 'Bicicletas', etc);
--
-- 5. PRECIOS POR TEMPORADA:
--    El precio base es €255/día.
--    Considera crear una tabla de precios por temporada si lo necesitas.
--
-- ============================================================

