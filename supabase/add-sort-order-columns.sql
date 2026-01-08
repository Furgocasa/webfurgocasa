-- ================================================
-- AÑADIR COLUMNAS SORT_ORDER FALTANTES
-- ================================================
-- Este script añade la columna sort_order a las tablas que la necesitan

-- ==========================================
-- LOCATIONS: añadir sort_order
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'locations' 
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE locations ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Columna sort_order añadida a locations';
  ELSE
    RAISE NOTICE 'Columna sort_order ya existe en locations';
  END IF;
END $$;

-- ==========================================
-- EXTRAS: verificar sort_order
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'extras' 
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE extras ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Columna sort_order añadida a extras';
  ELSE
    RAISE NOTICE 'Columna sort_order ya existe en extras';
  END IF;
END $$;

-- ==========================================
-- VEHICLE_CATEGORIES: verificar sort_order
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicle_categories' 
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE vehicle_categories ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Columna sort_order añadida a vehicle_categories';
  ELSE
    RAISE NOTICE 'Columna sort_order ya existe en vehicle_categories';
  END IF;
END $$;

-- ==========================================
-- VEHICLES: verificar sort_order
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicles' 
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Columna sort_order añadida a vehicles';
  ELSE
    RAISE NOTICE 'Columna sort_order ya existe en vehicles';
  END IF;
END $$;

-- ==========================================
-- CONTENT_CATEGORIES: verificar sort_order (si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_categories') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'content_categories' 
      AND column_name = 'sort_order'
    ) THEN
      ALTER TABLE content_categories ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
      RAISE NOTICE 'Columna sort_order añadida a content_categories';
    ELSE
      RAISE NOTICE 'Columna sort_order ya existe en content_categories';
    END IF;
  END IF;
END $$;

-- ==========================================
-- CONTENT_TAGS: verificar sort_order (si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_tags') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'content_tags' 
      AND column_name = 'sort_order'
    ) THEN
      ALTER TABLE content_tags ADD COLUMN sort_order INTEGER DEFAULT 0 NOT NULL;
      RAISE NOTICE 'Columna sort_order añadida a content_tags';
    ELSE
      RAISE NOTICE 'Columna sort_order ya existe en content_tags';
    END IF;
  END IF;
END $$;

-- ==========================================
-- Actualizar sort_order basado en created_at
-- ==========================================
-- Esto establece un orden inicial basado en la fecha de creación

-- Locations
UPDATE locations 
SET sort_order = row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num 
  FROM locations
) as numbered
WHERE locations.id = numbered.id;

-- Extras
UPDATE extras 
SET sort_order = row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num 
  FROM extras
) as numbered
WHERE extras.id = numbered.id;

-- Vehicles
UPDATE vehicles 
SET sort_order = row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num 
  FROM vehicles
) as numbered
WHERE vehicles.id = numbered.id;

-- Vehicle Categories
UPDATE vehicle_categories 
SET sort_order = row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as row_num 
  FROM vehicle_categories
) as numbered
WHERE vehicle_categories.id = numbered.id;

-- ==========================================
-- Verificar columnas sort_order
-- ==========================================
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND column_name = 'sort_order'
ORDER BY table_name;

RAISE NOTICE 'Columnas sort_order añadidas y valores iniciales establecidos correctamente';


