-- ============================================
-- AÑADIR POLÍTICAS INSERT/UPDATE PARA BOOKINGS
-- ============================================
-- Fecha: Enero 2026
-- Propósito: Permitir que usuarios autenticados puedan crear y actualizar reservas
-- Problema: Los clientes no pueden crear reservas porque falta política de INSERT

-- 1. Eliminar políticas existentes conflictivas (si existen)
DROP POLICY IF EXISTS "Clientes pueden crear reservas" ON bookings;
DROP POLICY IF EXISTS "Clientes pueden actualizar sus reservas" ON bookings;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear reservas" ON bookings;
DROP POLICY IF EXISTS "Cualquiera puede crear reservas" ON bookings;

-- 2. Permitir que CUALQUIER USUARIO (anónimo o autenticado) pueda crear reservas
-- Los clientes NO necesitan estar autenticados para reservar
CREATE POLICY "Cualquiera puede crear reservas" 
ON bookings 
FOR INSERT 
WITH CHECK (true);

-- 3. Permitir que los admins actualicen cualquier reserva
-- Los clientes anónimos no pueden actualizar (no tienen auth.uid())
-- Solo admins podrán modificar reservas
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

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver todas las políticas actuales de bookings
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
WHERE tablename = 'bookings'
ORDER BY cmd, policyname;
