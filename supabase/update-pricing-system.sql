-- ============================================
-- SISTEMA DE PRECIOS SIMPLE
-- Una tabla con temporadas y 4 precios según duración
-- ============================================

-- 1. Agregar columnas de precios a la tabla seasons
ALTER TABLE seasons 
ADD COLUMN IF NOT EXISTS price_less_than_week DECIMAL(10,2) DEFAULT 95.00,
ADD COLUMN IF NOT EXISTS price_one_week DECIMAL(10,2) DEFAULT 85.00,
ADD COLUMN IF NOT EXISTS price_two_weeks DECIMAL(10,2) DEFAULT 75.00,
ADD COLUMN IF NOT EXISTS price_three_weeks DECIMAL(10,2) DEFAULT 65.00,
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Actualizar year basándose en start_date para registros existentes
UPDATE seasons 
SET year = EXTRACT(YEAR FROM start_date)::INTEGER 
WHERE year IS NULL;

COMMENT ON COLUMN seasons.price_less_than_week IS 'Precio/día para alquileres de menos de 7 días';
COMMENT ON COLUMN seasons.price_one_week IS 'Precio/día para alquileres de 7-13 días';
COMMENT ON COLUMN seasons.price_two_weeks IS 'Precio/día para alquileres de 14-20 días';
COMMENT ON COLUMN seasons.price_three_weeks IS 'Precio/día para alquileres de 21+ días';

-- 2. Actualizar precios de las temporadas existentes
-- Según la página /tarifas

-- TEMPORADA BAJA
UPDATE seasons SET 
    price_less_than_week = 95.00,
    price_one_week = 85.00,
    price_two_weeks = 75.00,
    price_three_weeks = 65.00
WHERE slug = 'baja';

-- TEMPORADA MEDIA
UPDATE seasons SET 
    price_less_than_week = 125.00,
    price_one_week = 115.00,
    price_two_weeks = 105.00,
    price_three_weeks = 95.00
WHERE slug = 'media';

-- TEMPORADA ALTA
UPDATE seasons SET 
    price_less_than_week = 155.00,
    price_one_week = 145.00,
    price_two_weeks = 135.00,
    price_three_weeks = 125.00
WHERE slug = 'alta';

-- NAVIDAD (asumimos temporada alta)
UPDATE seasons SET 
    price_less_than_week = 155.00,
    price_one_week = 145.00,
    price_two_weeks = 135.00,
    price_three_weeks = 125.00
WHERE slug = 'navidad';

-- SEMANA SANTA (asumimos temporada alta)
UPDATE seasons SET 
    price_less_than_week = 155.00,
    price_one_week = 145.00,
    price_two_weeks = 135.00,
    price_three_weeks = 125.00
WHERE slug = 'semana-santa';

-- 3. Eliminar base_price_per_day de vehicles (no se usa)
UPDATE vehicles 
SET base_price_per_day = NULL 
WHERE is_for_rent = TRUE;

-- 4. Crear índice para búsquedas por año
CREATE INDEX IF NOT EXISTS idx_seasons_year ON seasons(year);

-- Mostrar resumen
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ SISTEMA DE PRECIOS CONFIGURADO';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '📊 TABLA DE PRECIOS POR TEMPORADA (€/día):';
    RAISE NOTICE '';
    RAISE NOTICE '┌─────────────┬──────────┬──────────┬──────────┬──────────┐';
    RAISE NOTICE '│ Temporada   │ < 7 días │ 7-13 días│ 14-20 dí │ 21+ días │';
    RAISE NOTICE '├─────────────┼──────────┼──────────┼──────────┼──────────┤';
    RAISE NOTICE '│ BAJA        │   95€    │   85€    │   75€    │   65€    │';
    RAISE NOTICE '│ MEDIA       │  125€    │  115€    │  105€    │   95€    │';
    RAISE NOTICE '│ ALTA        │  155€    │  145€    │  135€    │  125€    │';
    RAISE NOTICE '└─────────────┴──────────┴──────────┴──────────┴──────────┘';
    RAISE NOTICE '';
    RAISE NOTICE '💡 TODOS los vehículos usan estos precios';
    RAISE NOTICE '   El precio se calcula automáticamente según:';
    RAISE NOTICE '   1. Fechas del alquiler → Temporada';
    RAISE NOTICE '   2. Número de días → Columna de precio';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Extras se suman al precio base';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
