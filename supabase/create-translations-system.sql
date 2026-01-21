-- =====================================================
-- SISTEMA DE TRADUCCIONES DINÁMICAS CON IA
-- =====================================================
-- Tabla flexible para almacenar traducciones de cualquier
-- contenido de cualquier tabla, generadas con OpenAI
-- Fecha: 21 de Enero, 2026
-- =====================================================

-- 1. CREAR TABLA PRINCIPAL DE TRADUCCIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referencia al contenido original
  source_table TEXT NOT NULL,           -- 'posts', 'vehicles', 'location_targets', etc.
  source_id UUID NOT NULL,              -- ID del registro original
  source_field TEXT NOT NULL,           -- 'title', 'content', 'description', 'meta_title', etc.
  
  -- Idioma y traducción
  locale TEXT NOT NULL CHECK (locale IN ('en', 'fr', 'de')),  -- No incluimos 'es' (es el original)
  translated_text TEXT NOT NULL,
  
  -- Metadata
  is_auto_translated BOOLEAN DEFAULT TRUE,  -- TRUE = IA, FALSE = manual
  translation_model TEXT,                   -- 'gpt-4o-mini', 'gpt-4', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint único: solo una traducción por campo/registro/idioma
  UNIQUE(source_table, source_id, source_field, locale)
);

-- 2. ÍNDICES PARA BÚSQUEDAS RÁPIDAS
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_translations_source 
  ON content_translations(source_table, source_id);

CREATE INDEX IF NOT EXISTS idx_translations_locale 
  ON content_translations(locale);

CREATE INDEX IF NOT EXISTS idx_translations_lookup 
  ON content_translations(source_table, source_id, source_field, locale);

-- 3. TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_translations_updated_at ON content_translations;
CREATE TRIGGER trigger_translations_updated_at
  BEFORE UPDATE ON content_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_translations_updated_at();

-- 4. TABLA DE COLA DE TRADUCCIONES PENDIENTES
-- =====================================================
-- Para procesar traducciones en batch o con triggers
CREATE TABLE IF NOT EXISTS translation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  source_field TEXT NOT NULL,
  source_text TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'fr', 'de')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  UNIQUE(source_table, source_id, source_field, locale)
);

CREATE INDEX IF NOT EXISTS idx_queue_status 
  ON translation_queue(status);

CREATE INDEX IF NOT EXISTS idx_queue_pending 
  ON translation_queue(status, created_at) 
  WHERE status = 'pending';

-- 5. FUNCIÓN PARA ENCOLAR TRADUCCIONES
-- =====================================================
-- Llamar esta función cuando se crea/actualiza contenido
CREATE OR REPLACE FUNCTION queue_translation(
  p_source_table TEXT,
  p_source_id UUID,
  p_source_field TEXT,
  p_source_text TEXT
) RETURNS VOID AS $$
DECLARE
  v_locale TEXT;
BEGIN
  -- Encolar para cada idioma (en, fr, de)
  FOREACH v_locale IN ARRAY ARRAY['en', 'fr', 'de']
  LOOP
    INSERT INTO translation_queue (
      source_table, source_id, source_field, source_text, locale
    ) VALUES (
      p_source_table, p_source_id, p_source_field, p_source_text, v_locale
    )
    ON CONFLICT (source_table, source_id, source_field, locale) 
    DO UPDATE SET 
      source_text = EXCLUDED.source_text,
      status = 'pending',
      attempts = 0,
      error_message = NULL,
      created_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCIÓN HELPER PARA OBTENER TRADUCCIÓN
-- =====================================================
-- Devuelve la traducción o el texto original si no existe
CREATE OR REPLACE FUNCTION get_translation(
  p_source_table TEXT,
  p_source_id UUID,
  p_source_field TEXT,
  p_locale TEXT,
  p_original_text TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_translation TEXT;
BEGIN
  -- Si es español, devolver el original
  IF p_locale = 'es' OR p_locale IS NULL THEN
    RETURN p_original_text;
  END IF;
  
  -- Buscar traducción
  SELECT translated_text INTO v_translation
  FROM content_translations
  WHERE source_table = p_source_table
    AND source_id = p_source_id
    AND source_field = p_source_field
    AND locale = p_locale;
  
  -- Devolver traducción o original
  RETURN COALESCE(v_translation, p_original_text);
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER AUTOMÁTICO PARA POSTS
-- =====================================================
-- Cuando se crea/actualiza un post, encolar traducciones
CREATE OR REPLACE FUNCTION trigger_queue_post_translations()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si el contenido cambió
  IF TG_OP = 'INSERT' OR 
     (TG_OP = 'UPDATE' AND (
       OLD.title IS DISTINCT FROM NEW.title OR
       OLD.excerpt IS DISTINCT FROM NEW.excerpt OR
       OLD.content IS DISTINCT FROM NEW.content OR
       OLD.meta_title IS DISTINCT FROM NEW.meta_title OR
       OLD.meta_description IS DISTINCT FROM NEW.meta_description
     )) 
  THEN
    -- Encolar título
    IF NEW.title IS NOT NULL AND NEW.title != '' THEN
      PERFORM queue_translation('posts', NEW.id, 'title', NEW.title);
    END IF;
    
    -- Encolar excerpt
    IF NEW.excerpt IS NOT NULL AND NEW.excerpt != '' THEN
      PERFORM queue_translation('posts', NEW.id, 'excerpt', NEW.excerpt);
    END IF;
    
    -- Encolar contenido
    IF NEW.content IS NOT NULL AND NEW.content != '' THEN
      PERFORM queue_translation('posts', NEW.id, 'content', NEW.content);
    END IF;
    
    -- Encolar meta_title
    IF NEW.meta_title IS NOT NULL AND NEW.meta_title != '' THEN
      PERFORM queue_translation('posts', NEW.id, 'meta_title', NEW.meta_title);
    END IF;
    
    -- Encolar meta_description
    IF NEW.meta_description IS NOT NULL AND NEW.meta_description != '' THEN
      PERFORM queue_translation('posts', NEW.id, 'meta_description', NEW.meta_description);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_posts_queue_translations ON posts;
CREATE TRIGGER trigger_posts_queue_translations
  AFTER INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_queue_post_translations();

-- 8. TRIGGER AUTOMÁTICO PARA VEHICLES
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_queue_vehicle_translations()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR 
     (TG_OP = 'UPDATE' AND (
       OLD.name IS DISTINCT FROM NEW.name OR
       OLD.description IS DISTINCT FROM NEW.description OR
       OLD.short_description IS DISTINCT FROM NEW.short_description
     )) 
  THEN
    IF NEW.name IS NOT NULL AND NEW.name != '' THEN
      PERFORM queue_translation('vehicles', NEW.id, 'name', NEW.name);
    END IF;
    
    IF NEW.description IS NOT NULL AND NEW.description != '' THEN
      PERFORM queue_translation('vehicles', NEW.id, 'description', NEW.description);
    END IF;
    
    IF NEW.short_description IS NOT NULL AND NEW.short_description != '' THEN
      PERFORM queue_translation('vehicles', NEW.id, 'short_description', NEW.short_description);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_vehicles_queue_translations ON vehicles;
CREATE TRIGGER trigger_vehicles_queue_translations
  AFTER INSERT OR UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_queue_vehicle_translations();

-- 9. TRIGGER PARA LOCATION_TARGETS
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_queue_location_translations()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR 
     (TG_OP = 'UPDATE' AND (
       OLD.name IS DISTINCT FROM NEW.name OR
       OLD.meta_title IS DISTINCT FROM NEW.meta_title OR
       OLD.meta_description IS DISTINCT FROM NEW.meta_description OR
       OLD.h1_title IS DISTINCT FROM NEW.h1_title OR
       OLD.intro_text IS DISTINCT FROM NEW.intro_text
     )) 
  THEN
    IF NEW.name IS NOT NULL THEN
      PERFORM queue_translation('location_targets', NEW.id, 'name', NEW.name);
    END IF;
    IF NEW.meta_title IS NOT NULL THEN
      PERFORM queue_translation('location_targets', NEW.id, 'meta_title', NEW.meta_title);
    END IF;
    IF NEW.meta_description IS NOT NULL THEN
      PERFORM queue_translation('location_targets', NEW.id, 'meta_description', NEW.meta_description);
    END IF;
    IF NEW.h1_title IS NOT NULL THEN
      PERFORM queue_translation('location_targets', NEW.id, 'h1_title', NEW.h1_title);
    END IF;
    IF NEW.intro_text IS NOT NULL THEN
      PERFORM queue_translation('location_targets', NEW.id, 'intro_text', NEW.intro_text);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_locations_queue_translations ON location_targets;
CREATE TRIGGER trigger_locations_queue_translations
  AFTER INSERT OR UPDATE ON location_targets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_queue_location_translations();

-- 10. RLS POLICIES
-- =====================================================
ALTER TABLE content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_queue ENABLE ROW LEVEL SECURITY;

-- Traducciones: lectura pública, escritura solo autenticados
CREATE POLICY "Traducciones públicas para lectura"
  ON content_translations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Traducciones: admin puede todo"
  ON content_translations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Cola: solo acceso para service_role (Edge Functions)
CREATE POLICY "Cola: solo service_role"
  ON translation_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Cola: admin puede leer"
  ON translation_queue FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 11. VISTA ÚTIL: Estado de traducciones por tabla
-- =====================================================
CREATE OR REPLACE VIEW translation_stats AS
SELECT 
  source_table,
  locale,
  COUNT(*) as total_translations,
  COUNT(*) FILTER (WHERE is_auto_translated = true) as auto_translated,
  COUNT(*) FILTER (WHERE is_auto_translated = false) as manual_translations
FROM content_translations
GROUP BY source_table, locale
ORDER BY source_table, locale;

-- =====================================================
-- 12. VISTA: Cola de traducciones pendientes
-- =====================================================
CREATE OR REPLACE VIEW pending_translations AS
SELECT 
  source_table,
  locale,
  COUNT(*) as pending_count
FROM translation_queue
WHERE status = 'pending'
GROUP BY source_table, locale
ORDER BY pending_count DESC;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 
  'content_translations' as tabla,
  COUNT(*) as registros
FROM content_translations
UNION ALL
SELECT 
  'translation_queue' as tabla,
  COUNT(*) as registros
FROM translation_queue;

-- =====================================================
-- RESUMEN DEL SISTEMA
-- =====================================================
-- 
-- TABLAS CREADAS:
-- - content_translations: Almacena traducciones finales
-- - translation_queue: Cola para procesar con IA
--
-- TRIGGERS ACTIVOS:
-- - posts: Encola título, excerpt, contenido, meta_title, meta_description
-- - vehicles: Encola name, description, short_description
-- - location_targets: Encola name, meta_*, h1_title, intro_text
--
-- FUNCIONES ÚTILES:
-- - queue_translation(): Encola manualmente una traducción
-- - get_translation(): Obtiene traducción o texto original
--
-- PRÓXIMO PASO:
-- Crear Edge Function que procese la cola con OpenAI
-- =====================================================
