-- ================================================
-- Tabla para galería de imágenes de vehículos
-- Permite hasta 20 imágenes por vehículo
-- ================================================

-- Crear tabla vehicle_images si no existe
CREATE TABLE IF NOT EXISTS vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_sort_order ON vehicle_images(vehicle_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_primary ON vehicle_images(vehicle_id) WHERE is_primary = TRUE;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_vehicle_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicle_images_updated_at ON vehicle_images;
CREATE TRIGGER vehicle_images_updated_at
    BEFORE UPDATE ON vehicle_images
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_images_updated_at();

-- Trigger para asegurar que solo haya una imagen principal por vehículo
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        -- Quitar is_primary de las demás imágenes del mismo vehículo
        UPDATE vehicle_images 
        SET is_primary = FALSE 
        WHERE vehicle_id = NEW.vehicle_id 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vehicle_images_primary_check ON vehicle_images;
CREATE TRIGGER vehicle_images_primary_check
    BEFORE INSERT OR UPDATE ON vehicle_images
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_image();

-- Habilitar RLS
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;

-- Política para administradores: acceso completo
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

-- Política para público: solo lectura
DROP POLICY IF EXISTS "public_vehicle_images_select" ON vehicle_images;
CREATE POLICY "public_vehicle_images_select" ON vehicle_images
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Comentarios
COMMENT ON TABLE vehicle_images IS 'Galería de imágenes para cada vehículo (máximo 20 por vehículo)';
COMMENT ON COLUMN vehicle_images.vehicle_id IS 'Referencia al vehículo';
COMMENT ON COLUMN vehicle_images.image_url IS 'URL de la imagen desde Supabase Storage';
COMMENT ON COLUMN vehicle_images.alt_text IS 'Texto alternativo para SEO y accesibilidad';
COMMENT ON COLUMN vehicle_images.sort_order IS 'Orden de visualización (0 = primera)';
COMMENT ON COLUMN vehicle_images.is_primary IS 'Si es la imagen principal (solo una por vehículo)';

-- Verificar
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'vehicle_images'
ORDER BY ordinal_position;

