-- ================================================
-- Migración: Añadir columna alt_text a vehicle_images
-- Se ejecuta de forma segura (solo añade si no existe)
-- ================================================

-- Añadir columna alt_text si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'vehicle_images' 
        AND column_name = 'alt_text'
    ) THEN
        ALTER TABLE vehicle_images ADD COLUMN alt_text TEXT;
        RAISE NOTICE 'Columna alt_text añadida a vehicle_images';
    ELSE
        RAISE NOTICE 'Columna alt_text ya existe en vehicle_images';
    END IF;
END $$;

-- Verificar que la columna existe
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'vehicle_images'
AND column_name = 'alt_text';

