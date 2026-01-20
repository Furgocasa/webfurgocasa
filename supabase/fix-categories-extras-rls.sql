-- ============================================================
-- FIX RLS PARA VEHICLE_CATEGORIES Y EXTRAS
-- ============================================================
-- Asegura que las políticas RLS permitan lectura pública
-- y escritura para administradores
-- ============================================================

-- ============================================================
-- 1. VERIFICAR ESTADO ACTUAL
-- ============================================================

-- Verificar RLS en vehicle_categories
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('vehicle_categories', 'extras');

-- Ver políticas actuales de vehicle_categories
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'vehicle_categories';

-- Ver políticas actuales de extras
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'extras';

-- ============================================================
-- 2. LIMPIAR POLÍTICAS EXISTENTES
-- ============================================================

-- Eliminar políticas antiguas de vehicle_categories
DROP POLICY IF EXISTS "Categorías visibles públicamente" ON vehicle_categories;
DROP POLICY IF EXISTS "public_vehicle_categories_select" ON vehicle_categories;
DROP POLICY IF EXISTS "admin_vehicle_categories_all" ON vehicle_categories;
DROP POLICY IF EXISTS "public_read_categories" ON vehicle_categories;
DROP POLICY IF EXISTS "admin_all_categories" ON vehicle_categories;

-- Eliminar políticas antiguas de extras
DROP POLICY IF EXISTS "Extras visibles públicamente" ON extras;
DROP POLICY IF EXISTS "public_extras_select" ON extras;
DROP POLICY IF EXISTS "admin_extras_all" ON extras;
DROP POLICY IF EXISTS "public_read_extras" ON extras;
DROP POLICY IF EXISTS "admin_all_extras" ON extras;

-- ============================================================
-- 3. ACTIVAR RLS EN AMBAS TABLAS
-- ============================================================

ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. CREAR POLÍTICAS PARA VEHICLE_CATEGORIES
-- ============================================================

-- Lectura pública de categorías activas
CREATE POLICY "public_select_categories"
ON vehicle_categories
FOR SELECT
USING (is_active = true);

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_categories"
ON vehicle_categories
FOR ALL
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

-- ============================================================
-- 5. CREAR POLÍTICAS PARA EXTRAS
-- ============================================================

-- Lectura pública de extras activos
CREATE POLICY "public_select_extras"
ON extras
FOR SELECT
USING (is_active = true);

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_extras"
ON extras
FOR ALL
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

-- ============================================================
-- 6. VERIFICAR POLÍTICAS CREADAS
-- ============================================================

-- Ver políticas de vehicle_categories
SELECT policyname, cmd, qual::text 
FROM pg_policies 
WHERE tablename = 'vehicle_categories';

-- Ver políticas de extras
SELECT policyname, cmd, qual::text 
FROM pg_policies 
WHERE tablename = 'extras';

-- ============================================================
-- 7. PROBAR ACCESO PÚBLICO
-- ============================================================

-- Probar lectura de categorías (debería funcionar sin autenticación)
SELECT id, name, slug FROM vehicle_categories WHERE is_active = true;

-- Probar lectura de extras (debería funcionar sin autenticación)
SELECT id, name, price_per_day FROM extras WHERE is_active = true;

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- ✓ Los usuarios anónimos pueden leer categorías y extras activos
-- ✓ Los administradores pueden crear/editar/eliminar
-- ✓ El formulario de vehículos carga sin errores
-- ============================================================
