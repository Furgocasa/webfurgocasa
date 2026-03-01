-- ============================================
-- MOTORHOME SERVICES - Directorio de servicios de autocaravanas
-- Talleres camper y concesionarios de autocaravanas
-- ============================================

CREATE TABLE IF NOT EXISTS motorhome_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Información básica
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN (
        'taller_camper',
        'concesionario_autocaravanas',
        'area_servicio',
        'camping',
        'tienda_accesorios',
        'alquiler',
        'homologador',
        'itv',
        'aseguradora',
        'otro'
    )),

    -- Contacto
    address TEXT,
    phone TEXT,
    phone_secondary TEXT,
    website TEXT,
    email TEXT,

    -- Valoración (de Google)
    rating DECIMAL(2, 1),
    review_count INTEGER DEFAULT 0,
    price_level TEXT,

    -- Google Places
    google_types TEXT[],
    place_id TEXT UNIQUE,
    google_maps_url TEXT,

    -- Ubicación
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    province TEXT,
    region TEXT,
    country TEXT DEFAULT 'España',

    -- Horarios (formato texto de Google: "Monday: 9:00 AM - 6:00 PM | Tuesday: ...")
    opening_hours TEXT,

    -- Estado operativo (de Google)
    operational_status TEXT DEFAULT 'OPERATIONAL' CHECK (operational_status IN (
        'OPERATIONAL',
        'CLOSED_TEMPORARILY',
        'CLOSED_PERMANENTLY'
    )),

    -- Validación IA
    website_valid BOOLEAN DEFAULT false,
    quality_score INTEGER DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 5),
    search_query TEXT,

    -- SEO
    meta_title TEXT,
    meta_description TEXT,

    -- Estado de publicación
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX idx_ms_category ON motorhome_services(category);
CREATE INDEX idx_ms_province ON motorhome_services(province);
CREATE INDEX idx_ms_region ON motorhome_services(region);
CREATE INDEX idx_ms_status ON motorhome_services(status);
CREATE INDEX idx_ms_slug ON motorhome_services(slug);
CREATE INDEX idx_ms_place_id ON motorhome_services(place_id);
CREATE INDEX idx_ms_quality ON motorhome_services(quality_score);
CREATE INDEX idx_ms_rating ON motorhome_services(rating DESC NULLS LAST);
CREATE INDEX idx_ms_location ON motorhome_services(latitude, longitude);
CREATE INDEX idx_ms_operational ON motorhome_services(operational_status);

-- Búsqueda full-text en español
ALTER TABLE motorhome_services ADD COLUMN fts tsvector
    GENERATED ALWAYS AS (
        to_tsvector('spanish',
            coalesce(name, '') || ' ' ||
            coalesce(address, '') || ' ' ||
            coalesce(province, '') || ' ' ||
            coalesce(region, '')
        )
    ) STORED;
CREATE INDEX idx_ms_fts ON motorhome_services USING GIN(fts);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_motorhome_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_motorhome_services_updated_at
    BEFORE UPDATE ON motorhome_services
    FOR EACH ROW
    EXECUTE FUNCTION update_motorhome_services_updated_at();

-- RLS: lectura pública, escritura solo admins
ALTER TABLE motorhome_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "motorhome_services_public_read"
    ON motorhome_services
    FOR SELECT
    USING (true);

CREATE POLICY "motorhome_services_admin_all"
    ON motorhome_services
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.id = auth.uid()
        )
    );
