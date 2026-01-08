-- ================================================
-- FIX SIMPLE: Permisos RLS para administradores
-- ================================================
-- Ejecutar DESPUÉS de add-missing-columns.sql
-- Este script crea políticas simples para las tablas existentes

-- ==========================================
-- EXTRAS
-- ==========================================
DROP POLICY IF EXISTS "Extras activos visibles" ON extras;
DROP POLICY IF EXISTS "public_extras_select" ON extras;
DROP POLICY IF EXISTS "admin_extras_all" ON extras;

-- Público puede ver extras activos
CREATE POLICY "public_extras_select" ON extras 
  FOR SELECT 
  USING (is_active = true);

-- Admins autenticados pueden hacer TODO
CREATE POLICY "admin_extras_all" ON extras 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ==========================================
-- LOCATIONS
-- ==========================================
DROP POLICY IF EXISTS "Ubicaciones activas visibles" ON locations;
DROP POLICY IF EXISTS "public_locations_select" ON locations;
DROP POLICY IF EXISTS "admin_locations_all" ON locations;

CREATE POLICY "public_locations_select" ON locations 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "admin_locations_all" ON locations 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ==========================================
-- VEHICLES
-- ==========================================
DROP POLICY IF EXISTS "Vehículos activos visibles" ON vehicles;
DROP POLICY IF EXISTS "public_vehicles_select" ON vehicles;
DROP POLICY IF EXISTS "admin_vehicles_all" ON vehicles;

CREATE POLICY "public_vehicles_select" ON vehicles 
  FOR SELECT 
  USING (status != 'inactive');

CREATE POLICY "admin_vehicles_all" ON vehicles 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ==========================================
-- VEHICLE_CATEGORIES
-- ==========================================
DROP POLICY IF EXISTS "public_vehicle_categories_select" ON vehicle_categories;
DROP POLICY IF EXISTS "admin_vehicle_categories_all" ON vehicle_categories;

CREATE POLICY "public_vehicle_categories_select" ON vehicle_categories 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "admin_vehicle_categories_all" ON vehicle_categories 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ==========================================
-- CUSTOMERS
-- ==========================================
DROP POLICY IF EXISTS "admin_customers_all" ON customers;

CREATE POLICY "admin_customers_all" ON customers 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ==========================================
-- BOOKINGS
-- ==========================================
DROP POLICY IF EXISTS "admin_bookings_all" ON bookings;

CREATE POLICY "admin_bookings_all" ON bookings 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ==========================================
-- PAYMENTS
-- ==========================================
DROP POLICY IF EXISTS "admin_payments_all" ON payments;

CREATE POLICY "admin_payments_all" ON payments 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ==========================================
-- SEASONS
-- ==========================================
DROP POLICY IF EXISTS "public_seasons_select" ON seasons;
DROP POLICY IF EXISTS "admin_seasons_all" ON seasons;

CREATE POLICY "public_seasons_select" ON seasons 
  FOR SELECT 
  USING (true);

CREATE POLICY "admin_seasons_all" ON seasons 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.user_id = auth.uid() 
      AND admins.is_active = true
    )
  );

-- ==========================================
-- CONTENT_CATEGORIES (solo si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_categories') THEN
    DROP POLICY IF EXISTS "Categorías activas visibles" ON content_categories;
    DROP POLICY IF EXISTS "public_categories_select" ON content_categories;
    DROP POLICY IF EXISTS "admin_categories_all" ON content_categories;

    EXECUTE 'CREATE POLICY "public_categories_select" ON content_categories FOR SELECT USING (is_active = true)';
    EXECUTE 'CREATE POLICY "admin_categories_all" ON content_categories FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE 'Políticas creadas para content_categories';
  END IF;
END $$;

-- ==========================================
-- CONTENT_TAGS (solo si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'content_tags') THEN
    DROP POLICY IF EXISTS "Tags visibles" ON content_tags;
    DROP POLICY IF EXISTS "public_tags_select" ON content_tags;
    DROP POLICY IF EXISTS "admin_tags_all" ON content_tags;

    EXECUTE 'CREATE POLICY "public_tags_select" ON content_tags FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "admin_tags_all" ON content_tags FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE 'Políticas creadas para content_tags';
  END IF;
END $$;

-- ==========================================
-- Verificar políticas creadas
-- ==========================================
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'extras', 'locations', 'vehicles', 'vehicle_categories',
    'customers', 'bookings', 'payments', 'seasons',
    'content_categories', 'content_tags'
)
ORDER BY tablename, policyname;


