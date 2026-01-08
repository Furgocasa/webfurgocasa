-- ================================================
-- Crear y configurar tabla vehicle_available_extras
-- Script completo para ejecutar en Supabase SQL Editor
-- ================================================

-- 1. Crear la tabla de relación vehículos-extras
CREATE TABLE IF NOT EXISTS vehicle_available_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    extra_id UUID NOT NULL REFERENCES extras(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vehicle_id, extra_id)
);

-- 2. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_vehicle_extras_vehicle ON vehicle_available_extras(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_extras_extra ON vehicle_available_extras(extra_id);

-- 3. Habilitar RLS
ALTER TABLE vehicle_available_extras ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "admin_vehicle_extras_all" ON vehicle_available_extras;
DROP POLICY IF EXISTS "public_vehicle_extras_select" ON vehicle_available_extras;

-- 5. Crear política para administradores: acceso completo
CREATE POLICY "admin_vehicle_extras_all" ON vehicle_available_extras 
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

-- 6. Crear política para público: solo lectura
CREATE POLICY "public_vehicle_extras_select" ON vehicle_available_extras 
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- 7. Verificar que se creó correctamente
SELECT 
    'Tabla creada correctamente' as status,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'vehicle_available_extras';

-- 8. Mostrar las políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'vehicle_available_extras'
ORDER BY policyname;

-- 9. Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicle_available_extras'
ORDER BY ordinal_position;

