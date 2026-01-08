-- ============================================================
-- SCRIPT DE INSERCIÓN: Weinsberg Carabus 540 MQ FIRE 2025
-- ============================================================
-- Extraído de: https://www.furgocasa.com/es/reservar/madrid/fu0020-weinsberg-carabus-540-mq?pickup=-1
-- Código interno: FU0020
-- Fecha de creación: 2026-01-07
-- Tour 360º: https://my.matterport.com/show/?m=GJn4iAtpKXm&brand=0
-- *** VEHÍCULO ESPECIAL: ÚNICO CON CAMBIO AUTOMÁTICO ***
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
    'FU0020',
    'Weinsberg Carabus 540 MQ',
    'fu0020-weinsberg-carabus-540-mq',
    'Weinsberg',
    'Carabus 540 Mq FIRE',
    2025,
    
    -- Descripción completa
    'La Weinsberg Carabus 540 MQ FIRE 2025 es nuestra joya premium más exclusiva: el ÚNICO vehículo de la flota con cambio AUTOMÁTICO. Con 5,40 metros de longitud (más compacta y maniobrable), combina la comodidad de conducción automática con un potente motor de 140 CV. Perfecta para parejas o familias pequeñas que buscan máximo confort. Incluye tour virtual 360º para explorar cada detalle. Equipada con batería de litio, placa solar, calefacción, agua caliente, cocina de gas y sistema Isofix. Para quienes buscan la experiencia de conducción más cómoda sin renunciar a equipamiento.',
    
    -- Descripción corta
    'ÚNICO con cambio AUTOMÁTICO. Camper compacta 540cm. 4 plazas día y 2+2 noche. Motor 140 CV. Tour 360º. Premium 2025 con equipamiento completo.',
    
    -- Precio base (premium por cambio automático)
    285.00,
    
    -- Categoría fija: "Campers Gran Volumen"
    'c5bc538e-9d91-43ba-907d-b75bd4aab56d'::uuid,
    
    -- Especificaciones
    4,                          -- seats (asientos)
    2,                          -- beds (plazas de noche - 2 adultos + 1-2 niños)
    'automatic',                -- transmission *** AUTOMÁTICO ***
    'diesel',                   -- fuel_type
    '11 l/100km',              -- fuel_consumption
    140,                        -- engine_power (CV) - el más potente de los Weinsberg
    6,                          -- gears (velocidades)
    '2x4',                      -- drive_type
    
    -- Dimensiones (en cm convertidos a m para la BD)
    5.40,                       -- length (540 cm) *** MÁS COMPACTA ***
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
    'Alquila la Weinsberg Carabus 540 MQ FIRE 2025, ÚNICO con cambio automático. Más compacta y maniobrable. Tour 360º. Desde €285/día en Furgocasa.',
    
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
    WHERE internal_code = 'FU0020';
    
    -- 2. INSERTAR CARACTERÍSTICAS/EQUIPAMIENTO
    -- =========================================
    
    -- Características generales
    INSERT INTO vehicle_features (vehicle_id, feature_name, feature_value) VALUES
    (v_vehicle_id, 'Plazas de día', '4 personas'),
    (v_vehicle_id, 'Plazas de noche', '2 adultos (1-2 niños)'),
    (v_vehicle_id, 'Tour virtual 360º', 'Disponible en https://my.matterport.com/show/?m=GJn4iAtpKXm&brand=0'),
    (v_vehicle_id, 'Número de marchas', '6 velocidades'),
    (v_vehicle_id, 'Sistema de tracción', '2x4'),
    (v_vehicle_id, 'Masa en orden de marcha', '2,840 kg'),
    (v_vehicle_id, 'Peso máximo autorizado', '3,500 kg'),
    (v_vehicle_id, 'Longitud compacta', '540 cm (más maniobrable)');
    
    -- Equipamiento destacado - CAMBIO AUTOMÁTICO es LA característica estrella
    INSERT INTO vehicle_features (vehicle_id, feature_name, feature_value, is_highlighted) VALUES
    (v_vehicle_id, 'Cambio automático', 'ÚNICO en la flota', true),
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
    -- No se detectaron imágenes específicas en la página
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
        'Vehículo FU0020 - Weinsberg Carabus 540 MQ FIRE 2025 (CAMBIO AUTOMÁTICO) creado desde script de importación',
        v_vehicle_id::text,
        NOW()
    );
    
    RAISE NOTICE 'Vehículo FU0020 - Weinsberg Carabus 540 MQ (AUTOMÁTICO) insertado correctamente con ID: %', v_vehicle_id;
    
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
    transmission,
    status,
    is_for_rent,
    location,
    seats,
    beds,
    engine_power,
    length,
    category_id
FROM vehicles
WHERE internal_code = 'FU0020';

-- Ver características
SELECT 
    v.internal_code,
    v.name,
    vf.feature_name,
    vf.feature_value,
    vf.is_highlighted
FROM vehicles v
INNER JOIN vehicle_features vf ON v.id = vf.vehicle_id
WHERE v.internal_code = 'FU0020'
ORDER BY vf.is_highlighted DESC, vf.feature_name;

-- Ver categoría asignada
SELECT 
    v.internal_code,
    v.name,
    v.transmission,
    vc.name AS categoria,
    vc.slug AS categoria_slug
FROM vehicles v
LEFT JOIN vehicle_categories vc ON v.category_id = vc.id
WHERE v.internal_code = 'FU0020';

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
WHERE v.internal_code = 'FU0020'
ORDER BY vi.sort_order;
*/

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 
-- 1. ⭐ VEHÍCULO ÚNICO - CAMBIO AUTOMÁTICO
--    ¡Este es el ÚNICO vehículo de toda la flota con transmisión automática!
--    Debe destacarse en:
--    - Búsquedas y filtros
--    - Página del vehículo
--    - Comparativas
--    - Marketing (público objetivo: personas que prefieren automático)
--
-- 2. CARACTERÍSTICAS PREMIUM:
--    - Año 2025: El más nuevo
--    - Precio €285/día (premium)
--    - Motor 140 CV (más potente que FU0019)
--    - 540 cm: MÁS COMPACTA (vs 599 cm de otros)
--    - Tour 360º incluido
--    - Edición FIRE
--
-- 3. VENTAJA COMPETITIVA:
--    Longitud 540 cm = más maniobrable en ciudad
--    + Cambio automático = experiencia de conducción superior
--    Ideal para:
--    - Personas no acostumbradas a manuales
--    - Conducción urbana
--    - Mayor comodidad en tráfico
--
-- 4. DIFERENCIAS CON FU0019:
--    FU0019 (Carabus 600):
--    - 599 cm largo
--    - 130 CV
--    - Manual
--    
--    FU0020 (Carabus 540):
--    - 540 cm largo ✓ más compacta
--    - 140 CV ✓ más potente
--    - AUTOMÁTICO ✓✓✓ ÚNICO
--
-- 5. CONFIGURACIÓN PLAZAS:
--    - 4 plazas de día
--    - 2 adultos + 1-2 niños de noche
--    - Similar a FU0010 y FU0019
--
-- 6. TOUR VIRTUAL 360º:
--    URL: https://my.matterport.com/show/?m=GJn4iAtpKXm&brand=0
--    Diferente del FU0019 (tiene su propio tour)
--
-- 7. IMÁGENES:
--    No se detectaron imágenes en la página web.
--    Añadir cuando estén disponibles.
--
-- 8. CATEGORÍA:
--    Asignada directamente: "Campers Gran Volumen"
--    ID: c5bc538e-9d91-43ba-907d-b75bd4aab56d
--
-- 9. MARKETING / SEO:
--    Palabras clave:
--    - "camper cambio automático"
--    - "alquiler autocaravana automática"
--    - "camper sin embrague"
--    - "fácil de conducir"
--
-- 10. EXTRAS DISPONIBLES:
--     Para asignar extras específicos:
--
--     INSERT INTO vehicle_available_extras (vehicle_id, extra_id)
--     SELECT v.id, e.id
--     FROM vehicles v, extras e
--     WHERE v.internal_code = 'FU0020'
--       AND e.name IN ('GPS', 'Sillas infantiles', etc);
--
-- ============================================================
-- COMPARATIVA FLOTA (transmission)
-- ============================================================
-- FU0010, FU0012, FU0015, FU0018, FU0019: Manual
-- FU0020: AUTOMÁTICO ⭐ ← ÚNICO
-- ============================================================

