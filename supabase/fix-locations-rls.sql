-- ================================================
-- FIX: Políticas RLS para tabla locations
-- Permite al administrador gestionar ubicaciones
-- ================================================

-- Eliminar política restrictiva existente si existe
DROP POLICY IF EXISTS "Ubicaciones activas visibles" ON locations;

-- ✅ POLÍTICA 1: SELECT (lectura) - Público puede ver ubicaciones activas
CREATE POLICY "public_locations_select" ON locations
FOR SELECT
USING (is_active = true);

-- ✅ POLÍTICA 2: SELECT (lectura) - Administradores pueden ver todas
CREATE POLICY "admin_locations_select_all" ON locations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.is_active = true
  )
);

-- ✅ POLÍTICA 3: INSERT - Solo administradores pueden crear
CREATE POLICY "admin_locations_insert" ON locations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.is_active = true
  )
);

-- ✅ POLÍTICA 4: UPDATE - Solo administradores pueden actualizar
CREATE POLICY "admin_locations_update" ON locations
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

-- ✅ POLÍTICA 5: DELETE - Solo administradores pueden eliminar
CREATE POLICY "admin_locations_delete" ON locations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
    AND admins.is_active = true
  )
);

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'locations';


