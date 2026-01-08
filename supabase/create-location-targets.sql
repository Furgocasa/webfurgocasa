-- ============================================
-- LOCATION TARGETS para SEO Local
-- ============================================
-- Esta tabla almacena las ubicaciones objetivo para SEO
-- (ciudades/zonas donde queremos posicionar pero no tenemos sede física)

CREATE TABLE location_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificación
  slug TEXT UNIQUE NOT NULL, -- 'cartagena', 'alicante', 'valencia'
  name TEXT NOT NULL, -- 'Cartagena', 'Alicante', 'Valencia'
  province TEXT, -- 'Murcia', 'Alicante', 'Valencia'
  region TEXT, -- 'Región de Murcia', 'Comunidad Valenciana', etc.
  
  -- Relación con sede física más cercana
  nearest_location_id UUID NOT NULL REFERENCES locations(id),
  distance_km INTEGER, -- Distancia en kilómetros a la sede
  travel_time_minutes INTEGER, -- Tiempo estimado de viaje
  
  -- SEO Meta Tags
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1_title TEXT NOT NULL,
  canonical_url TEXT, -- URL canónica si es necesaria
  
  -- Coordenadas (para calcular distancias, mostrar mapas)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contenido del Hero
  hero_content JSONB DEFAULT '{
    "title": "",
    "subtitle": "",
    "has_office": false,
    "office_notice": ""
  }'::jsonb,
  
  -- Contenido introductorio
  intro_text TEXT,
  
  -- Contenido local específico (flexible con JSONB)
  local_content JSONB DEFAULT '[]'::jsonb,
  -- Estructura ejemplo:
  -- [
  --   {
  --     "type": "section",
  --     "title": "Visitar Cartagena en autocaravana",
  --     "content": "La ciudad de Cartagena...",
  --     "order": 1
  --   },
  --   {
  --     "type": "areas",
  --     "title": "Áreas de autocaravanas cerca de Cartagena",
  --     "areas": [...],
  --     "order": 2
  --   }
  -- ]
  
  -- Información turística
  tourism_info JSONB DEFAULT '{
    "attractions": [],
    "routes": [],
    "camping_areas": [],
    "parking_info": {}
  }'::jsonb,
  
  -- FAQs específicas de la ubicación
  faqs JSONB DEFAULT '[]'::jsonb,
  -- Estructura:
  -- [
  --   {
  --     "question": "¿Tenéis sede en Cartagena?",
  --     "answer": "No, pero estamos muy cerca..."
  --   }
  -- ]
  
  -- Control y visibilidad
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Estadísticas (opcional, para tracking)
  page_views INTEGER DEFAULT 0,
  last_updated_content TIMESTAMPTZ,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para performance
-- ============================================
CREATE INDEX idx_location_targets_slug ON location_targets(slug);
CREATE INDEX idx_location_targets_active ON location_targets(is_active);
CREATE INDEX idx_location_targets_region ON location_targets(region);
CREATE INDEX idx_location_targets_province ON location_targets(province);
CREATE INDEX idx_location_targets_nearest_location ON location_targets(nearest_location_id);
CREATE INDEX idx_location_targets_display_order ON location_targets(display_order);

-- ============================================
-- TRIGGER para updated_at
-- ============================================
CREATE TRIGGER update_location_targets_updated_at
  BEFORE UPDATE ON location_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE location_targets IS 'Ubicaciones objetivo para SEO local (sin sede física)';
COMMENT ON COLUMN location_targets.slug IS 'Slug para la URL: /es/alquiler-autocaravanas-campervans-{slug}';
COMMENT ON COLUMN location_targets.nearest_location_id IS 'Referencia a la sede física más cercana';
COMMENT ON COLUMN location_targets.hero_content IS 'Contenido del hero section personalizado';
COMMENT ON COLUMN location_targets.local_content IS 'Array de secciones de contenido local (flexible)';
COMMENT ON COLUMN location_targets.tourism_info IS 'Información turística: atracciones, rutas, áreas AC';
