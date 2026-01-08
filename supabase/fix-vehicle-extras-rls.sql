-- ================================================
-- Corregir políticas RLS de vehicle_available_extras
-- ================================================

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "admin_vehicle_extras_all" ON vehicle_available_extras;
DROP POLICY IF EXISTS "public_vehicle_extras_select" ON vehicle_available_extras;

-- Política para administradores: acceso completo (SELECT, INSERT, UPDATE, DELETE)
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

-- Política para público: solo lectura
CREATE POLICY "public_vehicle_extras_select" ON vehicle_available_extras 
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Asegurar que RLS está habilitado
ALTER TABLE vehicle_available_extras ENABLE ROW LEVEL SECURITY;

-- Verificar las políticas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'vehicle_available_extras'
ORDER BY policyname;

-- Mostrar información sobre la tabla
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'vehicle_available_extras'
ORDER BY ordinal_position;

