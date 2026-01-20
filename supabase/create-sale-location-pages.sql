-- ============================================
-- CREAR TABLA sale_location_targets
-- ============================================
-- Para páginas SEO de venta de autocaravanas por ciudad
-- Patrón: /es/venta-autocaravanas-camper-{slug}
--         /en/campervans-for-sale-in-{slug}

CREATE TABLE IF NOT EXISTS sale_location_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificación
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  province VARCHAR(100),
  region VARCHAR(100),
  
  -- SEO
  meta_title VARCHAR(255) NOT NULL,
  meta_description TEXT,
  h1_title VARCHAR(255) NOT NULL,
  
  -- Contenido
  intro_text TEXT,
  content_sections JSONB DEFAULT '{}'::jsonb,
  
  -- Hero personalizado
  hero_content JSONB DEFAULT '{
    "title": "",
    "subtitle": "",
    "has_office": false,
    "office_notice": ""
  }'::jsonb,
  
  -- Ubicación geográfica
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  
  -- Referencia a sede física más cercana
  nearest_location_id UUID REFERENCES locations(id),
  distance_km INTEGER,
  travel_time_minutes INTEGER,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 999,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sale_location_targets_slug ON sale_location_targets(slug);
CREATE INDEX IF NOT EXISTS idx_sale_location_targets_active ON sale_location_targets(is_active);
CREATE INDEX IF NOT EXISTS idx_sale_location_targets_region ON sale_location_targets(region);
CREATE INDEX IF NOT EXISTS idx_sale_location_targets_province ON sale_location_targets(province);

-- ============================================
-- TRIGGER para updated_at
-- ============================================
CREATE OR REPLACE TRIGGER update_sale_location_targets_updated_at
  BEFORE UPDATE ON sale_location_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE sale_location_targets IS 'Páginas SEO para venta de autocaravanas por ciudad';
COMMENT ON COLUMN sale_location_targets.slug IS 'Slug para URL: /venta-autocaravanas-camper-{slug}';
COMMENT ON COLUMN sale_location_targets.nearest_location_id IS 'Sede física más cercana para entrega';
