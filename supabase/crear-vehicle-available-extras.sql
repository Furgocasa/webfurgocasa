-- ================================================
-- Crear tabla de relación vehículos-extras
-- ================================================

-- Tabla para indicar qué extras están disponibles para cada vehículo
CREATE TABLE IF NOT EXISTS vehicle_available_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    extra_id UUID NOT NULL REFERENCES extras(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vehicle_id, extra_id)
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_vehicle_extras_vehicle ON vehicle_available_extras(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_extras_extra ON vehicle_available_extras(extra_id);

-- Política RLS para administradores
DROP POLICY IF EXISTS "admin_vehicle_extras_all" ON vehicle_available_extras;
CREATE POLICY "admin_vehicle_extras_all" ON vehicle_available_extras 
    FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- Política RLS para público (solo lectura)
DROP POLICY IF EXISTS "public_vehicle_extras_select" ON vehicle_available_extras;
CREATE POLICY "public_vehicle_extras_select" ON vehicle_available_extras 
    FOR SELECT USING (true);

-- Habilitar RLS
ALTER TABLE vehicle_available_extras ENABLE ROW LEVEL SECURITY;

-- Verificar que se creó correctamente
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'vehicle_available_extras';


