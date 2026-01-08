-- ================================================
-- AÑADIR COLUMNAS FALTANTES
-- ================================================
-- Este script añade columnas is_active y otras columnas
-- necesarias para el correcto funcionamiento del admin

-- ==========================================
-- VEHICLE_CATEGORIES: añadir is_active
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicle_categories' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE vehicle_categories ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
    RAISE NOTICE 'Columna is_active añadida a vehicle_categories';
  ELSE
    RAISE NOTICE 'Columna is_active ya existe en vehicle_categories';
  END IF;
END $$;

-- ==========================================
-- CONTENT_CATEGORIES: verificar is_active
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'content_categories' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE content_categories ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
    RAISE NOTICE 'Columna is_active añadida a content_categories';
  ELSE
    RAISE NOTICE 'Columna is_active ya existe en content_categories';
  END IF;
END $$;

-- ==========================================
-- ADMINS: verificar is_active
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'admins' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE admins ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
    RAISE NOTICE 'Columna is_active añadida a admins';
  ELSE
    RAISE NOTICE 'Columna is_active ya existe en admins';
  END IF;
END $$;

-- ==========================================
-- Actualizar admins existentes a activos
-- ==========================================
UPDATE admins SET is_active = true WHERE is_active IS NULL;

-- ==========================================
-- Verificar todas las columnas is_active
-- ==========================================
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND column_name = 'is_active'
ORDER BY table_name;


