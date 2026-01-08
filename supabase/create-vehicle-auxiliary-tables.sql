-- ============================================================
-- CREAR TABLAS AUXILIARES PARA SISTEMA DE VEHÍCULOS
-- ============================================================
-- Este script crea todas las tablas relacionadas con vehículos
-- que son necesarias para el sistema completo
-- ============================================================

BEGIN;

-- 1. TABLA: vehicle_features
-- ===========================
-- Almacena características y equipamiento de cada vehículo
CREATE TABLE IF NOT EXISTS vehicle_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value TEXT,
    is_highlighted BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Añadir columnas si no existen (por si la tabla ya existía)
ALTER TABLE vehicle_features ADD COLUMN IF NOT EXISTS feature_value TEXT;
ALTER TABLE vehicle_features ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT false;
ALTER TABLE vehicle_features ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE vehicle_features ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE vehicle_features ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Índices para vehicle_features
CREATE INDEX IF NOT EXISTS idx_vehicle_features_vehicle_id ON vehicle_features(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_features_highlighted ON vehicle_features(is_highlighted);

-- Comentarios
COMMENT ON TABLE vehicle_features IS 'Características y equipamiento de los vehículos';
COMMENT ON COLUMN vehicle_features.vehicle_id IS 'Referencia al vehículo';
COMMENT ON COLUMN vehicle_features.feature_name IS 'Nombre de la característica (ej: "Placa solar")';
COMMENT ON COLUMN vehicle_features.feature_value IS 'Valor de la característica (ej: "Sí", "200W")';
COMMENT ON COLUMN vehicle_features.is_highlighted IS 'Si la característica debe destacarse en la UI';
COMMENT ON COLUMN vehicle_features.sort_order IS 'Orden de visualización';

-- 2. TABLA: vehicle_images (DESHABILITADA - Se hará después)
-- =========================
/*
-- Almacena las imágenes de cada vehículo
CREATE TABLE IF NOT EXISTS vehicle_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    title VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Añadir columnas si no existen (por si la tabla ya existía)
ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS alt_text VARCHAR(255);
ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;
ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE vehicle_images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Índices para vehicle_images
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_primary ON vehicle_images(is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_vehicle_images_sort ON vehicle_images(vehicle_id, sort_order);

-- Comentarios
COMMENT ON TABLE vehicle_images IS 'Galería de imágenes de los vehículos';
COMMENT ON COLUMN vehicle_images.vehicle_id IS 'Referencia al vehículo';
COMMENT ON COLUMN vehicle_images.image_url IS 'URL o path de la imagen';
COMMENT ON COLUMN vehicle_images.alt_text IS 'Texto alternativo para SEO y accesibilidad';
COMMENT ON COLUMN vehicle_images.sort_order IS 'Orden de visualización en la galería';
COMMENT ON COLUMN vehicle_images.is_primary IS 'Imagen principal del vehículo';
*/

-- 3. TABLA: system_logs
-- ======================
-- Log de eventos del sistema
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    reference_id TEXT,
    user_id UUID,
    ip_address INET,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_reference ON system_logs(reference_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON system_logs(user_id) WHERE user_id IS NOT NULL;

-- Comentarios
COMMENT ON TABLE system_logs IS 'Registro de eventos y acciones del sistema';
COMMENT ON COLUMN system_logs.log_type IS 'Tipo de evento (vehicle_creation, booking_created, etc)';
COMMENT ON COLUMN system_logs.message IS 'Descripción del evento';
COMMENT ON COLUMN system_logs.reference_id IS 'ID del objeto relacionado (ej: vehicle_id, booking_id)';
COMMENT ON COLUMN system_logs.metadata IS 'Información adicional en formato JSON';

-- 4. TABLA: vehicle_categories (opcional pero recomendada)
-- =========================================================
CREATE TABLE IF NOT EXISTS vehicle_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para vehicle_categories
CREATE INDEX IF NOT EXISTS idx_vehicle_categories_slug ON vehicle_categories(slug);
CREATE INDEX IF NOT EXISTS idx_vehicle_categories_active ON vehicle_categories(is_active);

-- Comentarios
COMMENT ON TABLE vehicle_categories IS 'Categorías de vehículos (Campers Compactas, Furgonetas Grandes, etc)';

-- NOTA IMPORTANTE: NO SE INSERTAN CATEGORÍAS AUTOMÁTICAMENTE
-- ============================================================
-- La categoría "Campers Gran Volumen" ya existe en la base de datos
-- ID: c5bc538e-9d91-43ba-907d-b75bd4aab56d
-- NO crear nuevas categorías sin autorización explícita
-- ============================================================

/*
-- Inserción de categorías DESHABILITADA hasta nueva orden
INSERT INTO vehicle_categories (name, slug, description, sort_order) VALUES
    ('Campers Gran Volumen', 'campers-gran-volumen', 'Vehículos camperizados de gran volumen, perfectos para familias y viajes largos', 1)
ON CONFLICT (slug) DO NOTHING;
*/

-- 5. TABLA: vehicle_category_assignments
-- =======================================
-- Relación muchos a muchos entre vehículos y categorías
CREATE TABLE IF NOT EXISTS vehicle_category_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES vehicle_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vehicle_id, category_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vca_vehicle ON vehicle_category_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vca_category ON vehicle_category_assignments(category_id);

-- Comentarios
COMMENT ON TABLE vehicle_category_assignments IS 'Asignación de vehículos a categorías';

-- 6. TABLA: vehicle_maintenance_records
-- ======================================
-- Registro de mantenimientos y reparaciones
CREATE TABLE IF NOT EXISTS vehicle_maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL, -- 'service', 'repair', 'inspection', 'cleaning'
    description TEXT NOT NULL,
    cost DECIMAL(10,2),
    mileage INTEGER,
    performed_by VARCHAR(100),
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    next_maintenance_date DATE,
    next_maintenance_mileage INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vmr_vehicle ON vehicle_maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vmr_date ON vehicle_maintenance_records(performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_vmr_type ON vehicle_maintenance_records(maintenance_type);

-- Comentarios
COMMENT ON TABLE vehicle_maintenance_records IS 'Historial de mantenimientos y reparaciones';
COMMENT ON COLUMN vehicle_maintenance_records.maintenance_type IS 'Tipo: service, repair, inspection, cleaning';

-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
-- ======================================

-- vehicle_features: público puede leer, admin puede todo
ALTER TABLE vehicle_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_vehicle_features" ON vehicle_features;
CREATE POLICY "public_read_vehicle_features" ON vehicle_features
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "admin_all_vehicle_features" ON vehicle_features;
CREATE POLICY "admin_all_vehicle_features" ON vehicle_features
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    );

-- vehicle_images: público puede leer, admin puede todo (DESHABILITADO)
/*
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_vehicle_images" ON vehicle_images;
CREATE POLICY "public_read_vehicle_images" ON vehicle_images
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "admin_all_vehicle_images" ON vehicle_images;
CREATE POLICY "admin_all_vehicle_images" ON vehicle_images
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    );
*/

-- vehicle_categories: público puede leer
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON vehicle_categories;
CREATE POLICY "public_read_categories" ON vehicle_categories
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "admin_all_categories" ON vehicle_categories;
CREATE POLICY "admin_all_categories" ON vehicle_categories
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    );

-- system_logs: solo admin puede leer/escribir
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_logs" ON system_logs;
CREATE POLICY "admin_all_logs" ON system_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    );

-- vehicle_maintenance_records: solo admin
ALTER TABLE vehicle_maintenance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_maintenance" ON vehicle_maintenance_records;
CREATE POLICY "admin_all_maintenance" ON vehicle_maintenance_records
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins
            WHERE admins.user_id = auth.uid()
            AND admins.is_active = true
        )
    );

-- 8. TRIGGERS PARA UPDATED_AT
-- ============================

-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas relevantes
DROP TRIGGER IF EXISTS update_vehicle_features_updated_at ON vehicle_features;
CREATE TRIGGER update_vehicle_features_updated_at
    BEFORE UPDATE ON vehicle_features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

/*
-- vehicle_images: deshabilitado por ahora
DROP TRIGGER IF EXISTS update_vehicle_images_updated_at ON vehicle_images;
CREATE TRIGGER update_vehicle_images_updated_at
    BEFORE UPDATE ON vehicle_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
*/

DROP TRIGGER IF EXISTS update_vehicle_categories_updated_at ON vehicle_categories;
CREATE TRIGGER update_vehicle_categories_updated_at
    BEFORE UPDATE ON vehicle_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_records_updated_at ON vehicle_maintenance_records;
CREATE TRIGGER update_maintenance_records_updated_at
    BEFORE UPDATE ON vehicle_maintenance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Ver todas las tablas creadas
SELECT 
    tablename,
    schemaname
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
      'vehicle_features',
      'vehicle_images',
      'system_logs',
      'vehicle_categories',
      'vehicle_category_assignments',
      'vehicle_maintenance_records'
  )
ORDER BY tablename;

-- Ver políticas RLS
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename IN (
    'vehicle_features',
    -- 'vehicle_images', -- deshabilitado
    'system_logs',
    'vehicle_categories',
    'vehicle_maintenance_records'
)
ORDER BY tablename, policyname;

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- ✓ vehicle_features - Características de vehículos
-- ⏸ vehicle_images - Galería de imágenes (DESHABILITADO - Se hará después)
-- ✓ system_logs - Log de eventos
-- ✓ vehicle_categories - Categorías de vehículos
-- ✓ vehicle_category_assignments - Relación vehículos-categorías
-- ✓ vehicle_maintenance_records - Historial de mantenimiento
-- ✓ RLS habilitado en todas las tablas activas
-- ✓ Triggers para updated_at
-- ✓ Índices optimizados
-- ============================================================

