-- ================================================
-- RECREAR TABLA vehicle_images COMPLETAMENTE
-- ================================================

-- 1. Eliminar tabla existente (si existe)
DROP TABLE IF EXISTS vehicle_images CASCADE;

-- 2. Crear tabla desde cero
CREATE TABLE vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices
CREATE INDEX idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_images_sort_order ON vehicle_images(vehicle_id, sort_order);
CREATE INDEX idx_vehicle_images_primary ON vehicle_images(vehicle_id) WHERE is_primary = TRUE;

-- 4. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_vehicle_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_images_updated_at
    BEFORE UPDATE ON vehicle_images
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_images_updated_at();

-- 5. Trigger para asegurar solo una imagen principal
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        UPDATE vehicle_images 
        SET is_primary = FALSE 
        WHERE vehicle_id = NEW.vehicle_id 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicle_images_primary_check
    BEFORE INSERT OR UPDATE ON vehicle_images
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_image();

-- 6. Habilitar RLS
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;

-- 7. Políticas RLS

-- Administradores: acceso completo
DROP POLICY IF EXISTS "admin_vehicle_images_all" ON vehicle_images;
CREATE POLICY "admin_vehicle_images_all" ON vehicle_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    );

-- Público: solo lectura
DROP POLICY IF EXISTS "public_vehicle_images_select" ON vehicle_images;
CREATE POLICY "public_vehicle_images_select" ON vehicle_images
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 8. Comentarios
COMMENT ON TABLE vehicle_images IS 'Galería de imágenes para cada vehículo (máximo 20 por vehículo)';
COMMENT ON COLUMN vehicle_images.vehicle_id IS 'Referencia al vehículo';
COMMENT ON COLUMN vehicle_images.image_url IS 'URL de la imagen desde Supabase Storage';
COMMENT ON COLUMN vehicle_images.alt_text IS 'Texto alternativo para SEO y accesibilidad';
COMMENT ON COLUMN vehicle_images.sort_order IS 'Orden de visualización (0 = primera)';
COMMENT ON COLUMN vehicle_images.is_primary IS 'Si es la imagen principal (solo una por vehículo)';

-- 9. Verificar que todo está correcto
SELECT 
    'Tabla creada correctamente' AS status,
    COUNT(*) AS total_columnas
FROM information_schema.columns
WHERE table_name = 'vehicle_images';

-- 10. Mostrar todas las columnas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicle_images'
ORDER BY ordinal_position;

