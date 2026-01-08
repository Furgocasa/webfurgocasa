-- ================================================
-- AÑADIR TODAS LAS COLUMNAS FALTANTES
-- ================================================
-- Este script añade TODAS las columnas necesarias para el admin

-- ==========================================
-- LOCATIONS: columnas faltantes
-- ==========================================
DO $$ 
BEGIN
  -- sort_order
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE locations ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE '✓ sort_order añadida a locations';
  END IF;
  
  -- is_pickup
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'is_pickup'
  ) THEN
    ALTER TABLE locations ADD COLUMN is_pickup BOOLEAN DEFAULT true NOT NULL;
    RAISE NOTICE '✓ is_pickup añadida a locations';
  END IF;
  
  -- is_dropoff
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'locations' AND column_name = 'is_dropoff'
  ) THEN
    ALTER TABLE locations ADD COLUMN is_dropoff BOOLEAN DEFAULT true NOT NULL;
    RAISE NOTICE '✓ is_dropoff añadida a locations';
  END IF;
END $$;

-- ==========================================
-- EXTRAS: columnas faltantes
-- ==========================================
DO $$ 
BEGIN
  -- sort_order
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'extras' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE extras ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE '✓ sort_order añadida a extras';
  END IF;
  
  -- icon
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'extras' AND column_name = 'icon'
  ) THEN
    ALTER TABLE extras ADD COLUMN icon VARCHAR(100);
    RAISE NOTICE '✓ icon añadida a extras';
  END IF;
  
  -- max_quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'extras' AND column_name = 'max_quantity'
  ) THEN
    ALTER TABLE extras ADD COLUMN max_quantity INTEGER;
    RAISE NOTICE '✓ max_quantity añadida a extras';
  END IF;
  
  -- price_per_day
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'extras' AND column_name = 'price_per_day'
  ) THEN
    ALTER TABLE extras ADD COLUMN price_per_day DECIMAL(10,2);
    RAISE NOTICE '✓ price_per_day añadida a extras';
  END IF;
  
  -- price_per_unit
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'extras' AND column_name = 'price_per_unit'
  ) THEN
    ALTER TABLE extras ADD COLUMN price_per_unit DECIMAL(10,2);
    RAISE NOTICE '✓ price_per_unit añadida a extras';
  END IF;
  
  -- price_type (sin constraint primero)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'extras' AND column_name = 'price_type'
  ) THEN
    ALTER TABLE extras ADD COLUMN price_type VARCHAR(20) DEFAULT 'per_day';
    RAISE NOTICE '✓ price_type añadida a extras';
  END IF;
  
  -- description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'extras' AND column_name = 'description'
  ) THEN
    ALTER TABLE extras ADD COLUMN description TEXT;
    RAISE NOTICE '✓ description añadida a extras';
  END IF;
END $$;

-- ==========================================
-- VEHICLE_CATEGORIES: columnas faltantes
-- ==========================================
DO $$ 
BEGIN
  -- sort_order
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'vehicle_categories' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE vehicle_categories ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE '✓ sort_order añadida a vehicle_categories';
  END IF;
  
  -- is_active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'vehicle_categories' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE vehicle_categories ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
    RAISE NOTICE '✓ is_active añadida a vehicle_categories';
  END IF;
END $$;

-- ==========================================
-- VEHICLES: columnas faltantes
-- ==========================================
DO $$ 
BEGIN
  -- sort_order
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE '✓ sort_order añadida a vehicles';
  END IF;
  
  -- features (si no existe)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'features'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN features JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE '✓ features añadida a vehicles';
  END IF;
END $$;

-- ==========================================
-- CONTENT_CATEGORIES: columnas faltantes (si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_categories') THEN
    -- is_active
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'content_categories' AND column_name = 'is_active'
    ) THEN
      ALTER TABLE content_categories ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
      RAISE NOTICE '✓ is_active añadida a content_categories';
    END IF;
    
    -- sort_order
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'content_categories' AND column_name = 'sort_order'
    ) THEN
      ALTER TABLE content_categories ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
      RAISE NOTICE '✓ sort_order añadida a content_categories';
    END IF;
  END IF;
END $$;

-- ==========================================
-- CONTENT_TAGS: columnas faltantes (si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_tags') THEN
    -- sort_order
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'content_tags' AND column_name = 'sort_order'
    ) THEN
      ALTER TABLE content_tags ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
      RAISE NOTICE '✓ sort_order añadida a content_tags';
    END IF;
  END IF;
END $$;

-- ==========================================
-- ADMINS: verificar is_active
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'admins' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE admins ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
    RAISE NOTICE '✓ is_active añadida a admins';
  END IF;
END $$;

-- ==========================================
-- Actualizar valores por defecto y limpiar datos
-- ==========================================

-- Asegurar que todos los admins están activos
UPDATE admins SET is_active = true WHERE is_active IS NULL;

-- Limpiar price_type inválidos en extras (antes de añadir constraint)
UPDATE extras 
SET price_type = 'per_day' 
WHERE price_type IS NULL 
   OR price_type NOT IN ('per_day', 'per_unit', 'fixed');

-- Establecer sort_order inicial basado en created_at
UPDATE locations SET sort_order = subquery.row_num 
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num FROM locations) as subquery
WHERE locations.id = subquery.id AND locations.sort_order = 0;

UPDATE extras SET sort_order = subquery.row_num 
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num FROM extras) as subquery
WHERE extras.id = subquery.id AND extras.sort_order = 0;

UPDATE vehicles SET sort_order = subquery.row_num 
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num FROM vehicles) as subquery
WHERE vehicles.id = subquery.id AND vehicles.sort_order = 0;

UPDATE vehicle_categories SET sort_order = subquery.row_num 
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num FROM vehicle_categories) as subquery
WHERE vehicle_categories.id = subquery.id AND vehicle_categories.sort_order = 0;

-- ==========================================
-- Añadir constraints después de limpiar datos
-- ==========================================

-- Añadir constraint CHECK para price_type si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'extras_price_type_check'
  ) THEN
    ALTER TABLE extras 
    ADD CONSTRAINT extras_price_type_check 
    CHECK (price_type IN ('per_day', 'per_unit', 'fixed'));
    RAISE NOTICE '✓ Constraint extras_price_type_check añadido';
  END IF;
END $$;

-- ==========================================
-- Verificar todas las columnas añadidas
-- ==========================================
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
AND (
    column_name IN ('sort_order', 'is_active', 'icon', 'max_quantity', 'is_pickup', 'is_dropoff', 'features', 
                    'price_per_day', 'price_per_unit', 'price_type', 'description')
)
AND table_name IN ('locations', 'extras', 'vehicles', 'vehicle_categories', 'content_categories', 'content_tags', 'admins')
ORDER BY table_name, column_name;

