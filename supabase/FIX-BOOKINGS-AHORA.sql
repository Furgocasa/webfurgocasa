-- ============================================
-- SOLUCIÓN RÁPIDA: PERMITIR CREACIÓN DE BOOKINGS
-- ============================================
-- Ejecuta este script EN SUPABASE SQL EDITOR
-- Copia TODO el contenido y pégalo en el SQL Editor

-- PASO 1: Eliminar políticas conflictivas
DROP POLICY IF EXISTS "Clientes pueden crear reservas" ON bookings;
DROP POLICY IF EXISTS "Clientes pueden actualizar sus reservas" ON bookings;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear reservas" ON bookings;
DROP POLICY IF EXISTS "Cualquiera puede crear reservas" ON bookings;
DROP POLICY IF EXISTS "Admins pueden actualizar reservas" ON bookings;

-- PASO 2: Crear política que permite a CUALQUIERA crear bookings
CREATE POLICY "Cualquiera puede crear reservas" 
ON bookings 
FOR INSERT 
WITH CHECK (true);

-- PASO 3: Crear política que permite a admins actualizar bookings
CREATE POLICY "Admins pueden actualizar reservas" 
ON bookings 
FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
    )
);

-- VERIFICACIÓN: Ver las políticas creadas
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'bookings';
