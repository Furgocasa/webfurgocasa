-- ============================================
-- POLÍTICAS RLS PARA blocked_dates
-- ============================================
-- Estas políticas permiten acceso completo a los administradores

-- Política de SELECT: Solo admins pueden ver bloqueos
CREATE POLICY "Admins pueden ver bloqueos" ON blocked_dates 
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM admins)
    );

-- Política de INSERT: Solo admins pueden crear bloqueos
CREATE POLICY "Admins pueden crear bloqueos" ON blocked_dates 
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM admins)
    );

-- Política de UPDATE: Solo admins pueden actualizar bloqueos
CREATE POLICY "Admins pueden actualizar bloqueos" ON blocked_dates 
    FOR UPDATE USING (
        auth.uid() IN (SELECT user_id FROM admins)
    );

-- Política de DELETE: Solo admins pueden eliminar bloqueos
CREATE POLICY "Admins pueden eliminar bloqueos" ON blocked_dates 
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM admins)
    );
