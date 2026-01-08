-- ================================================
-- Añadir columna main_image_url solo para blog/extras
-- NOTA: Los vehículos usan la tabla vehicle_images para galería múltiple
-- ================================================

-- NO añadir a vehicles (se eliminará si existe)
ALTER TABLE vehicles DROP COLUMN IF EXISTS main_image_url;

-- Comentario: Los vehículos usan vehicle_images para galería
COMMENT ON TABLE vehicles IS 'Tabla de vehículos. Las imágenes se gestionan en la tabla vehicle_images (galería múltiple)';

-- Verificar que NO existe
SELECT 
    column_name
FROM information_schema.columns
WHERE table_name = 'vehicles' 
AND column_name = 'main_image_url';

-- Si en el futuro necesitas para blog o extras:
-- ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS main_image_url TEXT;
-- ALTER TABLE extras ADD COLUMN IF NOT EXISTS image_url TEXT;

