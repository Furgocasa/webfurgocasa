-- ============================================================
-- PLANTILLA GENÉRICA DE INSERCIÓN DE VEHÍCULOS
-- ============================================================
-- Usa esta plantilla para crear scripts de otros vehículos
-- Reemplaza los valores [PLACEHOLDER] con la información real
-- ============================================================

BEGIN;

INSERT INTO vehicles (
    id,
    internal_code,              -- [CÓDIGO INTERNO] ej: FU0011
    name,                       -- [NOMBRE] ej: Dreamer D55 Fun
    slug,                       -- [SLUG] ej: dreamer-d55-fun-2024
    brand,                      -- [MARCA] ej: Dreamer
    model,                      -- [MODELO] ej: D55 Fun
    year,                       -- [AÑO] ej: 2024
    description,                -- [DESCRIPCIÓN LARGA]
    short_description,          -- [DESCRIPCIÓN CORTA]
    
    -- Precios
    base_price_per_day,         -- [PRECIO BASE] ej: 255.00
    
    -- Especificaciones técnicas
    seats,                      -- [ASIENTOS] ej: 4
    beds,                       -- [CAMAS] ej: 2
    transmission,               -- [TRANSMISIÓN] 'manual' o 'automatic'
    fuel_type,                  -- [COMBUSTIBLE] 'diesel' o 'gasoline'
    fuel_consumption,           -- [CONSUMO] ej: '11 l/100km'
    engine_power,               -- [POTENCIA CV] ej: 140
    gears,                      -- [MARCHAS] ej: 6
    drive_type,                 -- [TRACCIÓN] ej: '2x4' o '4x4'
    
    -- Dimensiones (en metros)
    length,                     -- [LONGITUD M] ej: 5.99
    width,                      -- [ANCHO M] ej: 2.05
    height,                     -- [ALTURA M] ej: 2.58
    weight_empty,               -- [PESO VACÍO KG] ej: 2840
    weight_max,                 -- [PESO MÁXIMO KG] ej: 3500
    
    -- Estado
    status,                     -- 'available', 'maintenance', 'inactive'
    is_for_rent,                -- true/false
    is_for_sale,                -- true/false
    
    -- Ubicación
    location,                   -- [UBICACIÓN] 'Murcia' o 'Madrid'
    
    -- Timestamps
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '[CÓDIGO]',                 -- ej: 'FU0011'
    '[NOMBRE COMPLETO]',        -- ej: 'Dreamer D55 Fun'
    '[slug-del-vehiculo]',      -- ej: 'dreamer-d55-fun-2024'
    '[MARCA]',                  -- ej: 'Dreamer'
    '[MODELO]',                 -- ej: 'D55 Fun'
    [AÑO],                      -- ej: 2024
    
    -- Descripción larga (copia de la web)
    '[DESCRIPCIÓN COMPLETA DEL VEHÍCULO...]',
    
    -- Descripción corta (resumen)
    '[RESUMEN CORTO DEL VEHÍCULO...]',
    
    -- Precio
    [PRECIO],                   -- ej: 255.00
    
    -- Especificaciones
    [ASIENTOS],                 -- ej: 4
    [CAMAS],                    -- ej: 2
    '[TRANSMISIÓN]',            -- 'manual' o 'automatic'
    '[COMBUSTIBLE]',            -- 'diesel' o 'gasoline'
    '[CONSUMO]',                -- ej: '11 l/100km'
    [POTENCIA],                 -- ej: 140
    [MARCHAS],                  -- ej: 6
    '[TRACCIÓN]',               -- ej: '2x4'
    
    -- Dimensiones
    [LONGITUD],                 -- ej: 5.99 (en metros)
    [ANCHO],                    -- ej: 2.05
    [ALTURA],                   -- ej: 2.58
    [PESO_VACIO],               -- ej: 2840
    [PESO_MAXIMO],              -- ej: 3500
    
    -- Estado
    'available',
    true,                       -- is_for_rent
    false,                      -- is_for_sale
    
    -- Ubicación
    '[UBICACIÓN]',              -- 'Murcia' o 'Madrid'
    
    NOW(),
    NOW()
);

-- Características y equipamiento
DO $$
DECLARE
    v_vehicle_id UUID;
BEGIN
    SELECT id INTO v_vehicle_id 
    FROM vehicles 
    WHERE internal_code = '[CÓDIGO]';
    
    -- Características generales
    INSERT INTO vehicle_features (vehicle_id, feature_name, feature_value) VALUES
    (v_vehicle_id, 'Plazas de día', '[X] personas'),
    (v_vehicle_id, 'Plazas de noche', '[X] adultos ([X] niños)'),
    (v_vehicle_id, 'Peso máximo autorizado', '[X] kg');
    
    -- Equipamiento destacado (marca is_highlighted = true)
    INSERT INTO vehicle_features (vehicle_id, feature_name, feature_value, is_highlighted) VALUES
    (v_vehicle_id, '[CARACTERÍSTICA 1]', 'Sí', true),
    (v_vehicle_id, '[CARACTERÍSTICA 2]', 'Sí', true),
    (v_vehicle_id, '[CARACTERÍSTICA 3]', 'Sí', true);
    -- Añade más según el vehículo
    
    -- Imágenes
    INSERT INTO vehicle_images (vehicle_id, image_url, alt_text, sort_order, is_primary) VALUES
    (v_vehicle_id, '/images/vehicles/[carpeta]/imagen1.jpg', '[ALT TEXT]', 1, true),
    (v_vehicle_id, '/images/vehicles/[carpeta]/imagen2.jpg', '[ALT TEXT]', 2, false);
    -- Añade más imágenes
    
    RAISE NOTICE 'Vehículo [CÓDIGO] insertado correctamente';
END $$;

COMMIT;

-- ============================================================
-- CHECKLIST DE INFORMACIÓN A EXTRAER DE LA WEB
-- ============================================================
--
-- 📋 DATOS BÁSICOS:
-- ☐ Código interno (ej: FU0010)
-- ☐ Nombre del vehículo
-- ☐ Marca
-- ☐ Modelo
-- ☐ Año de matriculación
-- ☐ Precio base por día (€)
--
-- 📐 ESPECIFICACIONES TÉCNICAS:
-- ☐ Plazas de día (asientos)
-- ☐ Plazas de noche (camas)
-- ☐ Transmisión (Manual/Automática)
-- ☐ Combustible (Diésel/Gasolina)
-- ☐ Consumo (l/100km)
-- ☐ Potencia del motor (CV)
-- ☐ Número de marchas
-- ☐ Sistema de tracción (2x4, 4x4)
--
-- 📏 DIMENSIONES Y PESOS:
-- ☐ Longitud (cm → convertir a m)
-- ☐ Ancho (cm → convertir a m)
-- ☐ Altura (cm → convertir a m)
-- ☐ Masa en orden de marcha (kg)
-- ☐ Peso máximo autorizado (kg)
--
-- ⚙️ EQUIPAMIENTO:
-- ☐ Lista de características destacadas con iconos
-- ☐ Equipamiento estándar (ej: Isofix, Radio multimedia)
-- ☐ Sistemas (ej: Placa solar, Batería litio, Calefacción)
-- ☐ Instalaciones (ej: Cocina gas, Agua caliente, Nevera)
--
-- 🖼️ IMÁGENES:
-- ☐ URLs de todas las imágenes (generalmente 10-20)
-- ☐ Orden de las imágenes
-- ☐ Identificar imagen principal
--
-- 📍 UBICACIÓN:
-- ☐ Sede principal (Murcia/Madrid)
-- ☐ Disponibilidad en otras ubicaciones
--
-- 📝 TEXTOS:
-- ☐ Descripción larga/completa
-- ☐ Descripción corta/resumen
--
-- ============================================================
-- EJEMPLO DE EXTRACCIÓN DE URL
-- ============================================================
--
-- URL: https://www.furgocasa.com/es/reservar/madrid/dreamer-d55-fun-2024
--
-- De la URL se extrae:
-- - Slug: dreamer-d55-fun-2024
-- - Ubicación principal: madrid (aunque en la tabla pones 'Murcia' o 'Madrid')
--
-- Del HTML se extrae:
-- - Código: buscar "FU" seguido de números
-- - Precio: buscar "Desde €" o similar
-- - Tabla de especificaciones: normalmente en un <table> o lista
-- - Características: iconos con texto asociado
-- - Imágenes: en galería de fotos
--
-- ============================================================

