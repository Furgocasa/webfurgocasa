-- ============================================================
-- MIGRACIÓN: Ampliar tabla vehicles con información completa
-- ============================================================
-- Este script añade todas las columnas necesarias para almacenar
-- información detallada de vehículos camper/autocaravana
-- ============================================================

BEGIN;

-- 1. ESPECIFICACIONES TÉCNICAS
-- =============================

-- Combustible y consumo
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_consumption VARCHAR(50);
COMMENT ON COLUMN vehicles.fuel_consumption IS 'Consumo de combustible (ej: "11 l/100km")';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_power INTEGER;
COMMENT ON COLUMN vehicles.engine_power IS 'Potencia del motor en CV';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS gears INTEGER;
COMMENT ON COLUMN vehicles.gears IS 'Número de marchas/velocidades';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS drive_type VARCHAR(20);
COMMENT ON COLUMN vehicles.drive_type IS 'Tipo de tracción (ej: "2x4", "4x4")';

-- 2. CAPACIDADES Y PLAZAS
-- ========================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seats INTEGER;
COMMENT ON COLUMN vehicles.seats IS 'Número de asientos/plazas de día';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS beds INTEGER;
COMMENT ON COLUMN vehicles.beds IS 'Número de camas/plazas de noche';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS beds_detail VARCHAR(100);
COMMENT ON COLUMN vehicles.beds_detail IS 'Detalle de camas (ej: "2 adultos (1-2 niños)")';

-- 3. DIMENSIONES Y PESOS
-- =======================

-- Dimensiones en metros
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS length DECIMAL(5,2);
COMMENT ON COLUMN vehicles.length IS 'Longitud del vehículo en metros';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS width DECIMAL(4,2);
COMMENT ON COLUMN vehicles.width IS 'Ancho del vehículo en metros';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS height DECIMAL(4,2);
COMMENT ON COLUMN vehicles.height IS 'Altura del vehículo en metros';

-- Pesos en kilogramos
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS weight_empty INTEGER;
COMMENT ON COLUMN vehicles.weight_empty IS 'Masa en orden de marcha (kg)';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS weight_max INTEGER;
COMMENT ON COLUMN vehicles.weight_max IS 'Peso máximo autorizado (kg)';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS payload INTEGER;
COMMENT ON COLUMN vehicles.payload IS 'Carga útil disponible (kg)';

-- 4. IDENTIFICACIÓN DEL VEHÍCULO
-- ===============================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS license_plate VARCHAR(20);
COMMENT ON COLUMN vehicles.license_plate IS 'Matrícula del vehículo';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vin VARCHAR(17);
COMMENT ON COLUMN vehicles.vin IS 'Número de bastidor/VIN';

-- 5. INFORMACIÓN ADICIONAL
-- =========================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS short_description TEXT;
COMMENT ON COLUMN vehicles.short_description IS 'Descripción corta para listados';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
COMMENT ON COLUMN vehicles.location IS 'Ubicación/sede principal del vehículo';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS features_json JSONB;
COMMENT ON COLUMN vehicles.features_json IS 'Características adicionales en formato JSON';

-- 6. PRECIOS Y DISPONIBILIDAD
-- ============================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS base_price_per_day DECIMAL(10,2);
COMMENT ON COLUMN vehicles.base_price_per_day IS 'Precio base por día en temporada baja';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS high_season_price DECIMAL(10,2);
COMMENT ON COLUMN vehicles.high_season_price IS 'Precio por día en temporada alta';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS min_rental_days INTEGER DEFAULT 2;
COMMENT ON COLUMN vehicles.min_rental_days IS 'Duración mínima de alquiler en días';

-- 7. CAPACIDADES DE DEPÓSITOS
-- ============================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_tank_capacity INTEGER;
COMMENT ON COLUMN vehicles.fuel_tank_capacity IS 'Capacidad del depósito de combustible (litros)';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS water_tank_capacity INTEGER;
COMMENT ON COLUMN vehicles.water_tank_capacity IS 'Capacidad del depósito de agua limpia (litros)';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS waste_water_capacity INTEGER;
COMMENT ON COLUMN vehicles.waste_water_capacity IS 'Capacidad del depósito de aguas grises (litros)';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS toilet_capacity INTEGER;
COMMENT ON COLUMN vehicles.toilet_capacity IS 'Capacidad del WC químico (litros)';

-- 8. SISTEMAS ELÉCTRICOS
-- =======================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS battery_capacity VARCHAR(50);
COMMENT ON COLUMN vehicles.battery_capacity IS 'Capacidad de batería auxiliar (ej: "100Ah litio")';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS solar_panel BOOLEAN DEFAULT false;
COMMENT ON COLUMN vehicles.solar_panel IS 'Tiene placa solar instalada';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS solar_power INTEGER;
COMMENT ON COLUMN vehicles.solar_power IS 'Potencia de placa solar en W';

-- 9. EQUIPAMIENTO BÁSICO
-- =======================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS has_heating BOOLEAN DEFAULT false;
COMMENT ON COLUMN vehicles.has_heating IS 'Tiene calefacción';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS has_ac BOOLEAN DEFAULT false;
COMMENT ON COLUMN vehicles.has_ac IS 'Tiene aire acondicionado';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS has_hot_water BOOLEAN DEFAULT false;
COMMENT ON COLUMN vehicles.has_hot_water IS 'Tiene agua caliente';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS has_toilet BOOLEAN DEFAULT false;
COMMENT ON COLUMN vehicles.has_toilet IS 'Tiene WC/baño';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS has_shower BOOLEAN DEFAULT false;
COMMENT ON COLUMN vehicles.has_shower IS 'Tiene ducha';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS has_kitchen BOOLEAN DEFAULT false;
COMMENT ON COLUMN vehicles.has_kitchen IS 'Tiene cocina';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS has_fridge BOOLEAN DEFAULT false;
COMMENT ON COLUMN vehicles.has_fridge IS 'Tiene nevera';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS has_awning BOOLEAN DEFAULT false;
COMMENT ON COLUMN vehicles.has_awning IS 'Tiene toldo';

-- 10. CERTIFICACIONES Y NORMATIVA
-- ================================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS emission_standard VARCHAR(20);
COMMENT ON COLUMN vehicles.emission_standard IS 'Normativa de emisiones (ej: "Euro 6")';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS insurance_policy VARCHAR(100);
COMMENT ON COLUMN vehicles.insurance_policy IS 'Número de póliza de seguro';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS last_inspection_date DATE;
COMMENT ON COLUMN vehicles.last_inspection_date IS 'Fecha de última ITV/inspección';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS next_inspection_date DATE;
COMMENT ON COLUMN vehicles.next_inspection_date IS 'Fecha de próxima ITV/inspección';

-- 11. MANTENIMIENTO Y CONTROL
-- ============================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS current_mileage INTEGER DEFAULT 0;
COMMENT ON COLUMN vehicles.current_mileage IS 'Kilometraje actual';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS last_service_date DATE;
COMMENT ON COLUMN vehicles.last_service_date IS 'Fecha de último mantenimiento';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS next_service_mileage INTEGER;
COMMENT ON COLUMN vehicles.next_service_mileage IS 'Kilometraje para próximo servicio';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS maintenance_notes TEXT;
COMMENT ON COLUMN vehicles.maintenance_notes IS 'Notas de mantenimiento y reparaciones';

-- 12. METADATA Y SEO
-- ===================

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
COMMENT ON COLUMN vehicles.meta_title IS 'Título para SEO';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS meta_description TEXT;
COMMENT ON COLUMN vehicles.meta_description IS 'Meta descripción para SEO';

ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS meta_keywords TEXT;
COMMENT ON COLUMN vehicles.meta_keywords IS 'Palabras clave para SEO';

-- 13. ÍNDICES PARA MEJORAR PERFORMANCE
-- =====================================

CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles(location);
CREATE INDEX IF NOT EXISTS idx_vehicles_seats ON vehicles(seats);
CREATE INDEX IF NOT EXISTS idx_vehicles_beds ON vehicles(beds);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(base_price_per_day);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type ON vehicles(fuel_type);

-- Índice para búsquedas de texto completo
CREATE INDEX IF NOT EXISTS idx_vehicles_search ON vehicles USING gin(
    to_tsvector('spanish', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, ''))
);

-- 14. VERIFICAR ESTRUCTURA ACTUALIZADA
-- =====================================

-- Ver todas las columnas de la tabla vehicles
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable,
    pg_catalog.col_description(
        (SELECT oid FROM pg_class WHERE relname = 'vehicles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')), 
        ordinal_position
    ) as column_comment
FROM information_schema.columns
WHERE table_name = 'vehicles'
  AND table_schema = 'public'
ORDER BY ordinal_position;

COMMIT;

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- La tabla vehicles ahora tiene:
-- ✓ Especificaciones técnicas completas (motor, consumo, tracción)
-- ✓ Capacidades (asientos, camas)
-- ✓ Dimensiones exactas (largo, ancho, alto)
-- ✓ Pesos (vacío, máximo, carga útil)
-- ✓ Capacidades de depósitos (combustible, agua, grises, WC)
-- ✓ Sistemas eléctricos (batería, solar)
-- ✓ Equipamiento (calefacción, AC, cocina, etc)
-- ✓ Control de mantenimiento (km, revisiones)
-- ✓ Certificaciones (ITV, seguro, emisiones)
-- ✓ SEO y metadata
-- ✓ Índices para búsquedas rápidas
--
-- Total: ~60+ columnas para información completa
-- ============================================================

