-- ================================================
-- FIX DEFINITIVO: Permisos RLS completos para administradores
-- ================================================
-- Este script elimina todas las políticas existentes y crea
-- políticas simples que permiten a los administradores
-- autenticados hacer TODAS las operaciones (SELECT, INSERT, UPDATE, DELETE)

-- ==========================================
-- EXTRAS
-- ==========================================
DROP POLICY IF EXISTS "Extras activos visibles" ON extras;
DROP POLICY IF EXISTS "public_extras_select" ON extras;
DROP POLICY IF EXISTS "admin_extras_all" ON extras;
DROP POLICY IF EXISTS "admin_extras_select" ON extras;
DROP POLICY IF EXISTS "admin_extras_insert" ON extras;
DROP POLICY IF EXISTS "admin_extras_update" ON extras;
DROP POLICY IF EXISTS "admin_extras_delete" ON extras;

-- Público puede ver extras activos
CREATE POLICY "public_extras_select" ON extras 
  FOR SELECT 
  USING (is_active = true);

-- Admins pueden hacer TODO con extras
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
DROP POLICY IF EXISTS "admin_locations_select" ON locations;
DROP POLICY IF EXISTS "admin_locations_insert" ON locations;
DROP POLICY IF EXISTS "admin_locations_update" ON locations;
DROP POLICY IF EXISTS "admin_locations_delete" ON locations;

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
DROP POLICY IF EXISTS "admin_vehicles_select" ON vehicles;
DROP POLICY IF EXISTS "admin_vehicles_insert" ON vehicles;
DROP POLICY IF EXISTS "admin_vehicles_update" ON vehicles;
DROP POLICY IF EXISTS "admin_vehicles_delete" ON vehicles;

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
-- VEHICLE_AVAILABLE_EXTRAS (solo si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vehicle_available_extras') THEN
    DROP POLICY IF EXISTS "public_vehicle_extras_select" ON vehicle_available_extras;
    DROP POLICY IF EXISTS "admin_vehicle_extras_all" ON vehicle_available_extras;
    DROP POLICY IF EXISTS "admin_vehicle_extras_select" ON vehicle_available_extras;
    DROP POLICY IF EXISTS "admin_vehicle_extras_insert" ON vehicle_available_extras;
    DROP POLICY IF EXISTS "admin_vehicle_extras_update" ON vehicle_available_extras;
    DROP POLICY IF EXISTS "admin_vehicle_extras_delete" ON vehicle_available_extras;

    EXECUTE 'CREATE POLICY "public_vehicle_extras_select" ON vehicle_available_extras FOR SELECT USING (true)';
    
    EXECUTE 'CREATE POLICY "admin_vehicle_extras_all" ON vehicle_available_extras FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE 'Políticas creadas para vehicle_available_extras';
  ELSE
    RAISE NOTICE 'Tabla vehicle_available_extras no existe, saltando...';
  END IF;
END $$;

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
-- VEHICLE_IMAGES (solo si existe)
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vehicle_images') THEN
    DROP POLICY IF EXISTS "public_vehicle_images_select" ON vehicle_images;
    DROP POLICY IF EXISTS "admin_vehicle_images_all" ON vehicle_images;

    EXECUTE 'CREATE POLICY "public_vehicle_images_select" ON vehicle_images FOR SELECT USING (true)';
    
    EXECUTE 'CREATE POLICY "admin_vehicle_images_all" ON vehicle_images FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE 'Políticas creadas para vehicle_images';
  ELSE
    RAISE NOTICE 'Tabla vehicle_images no existe, saltando...';
  END IF;
END $$;

-- ==========================================
-- CUSTOMERS
-- ==========================================
DROP POLICY IF EXISTS "admin_customers_all" ON customers;
DROP POLICY IF EXISTS "admin_customers_select" ON customers;
DROP POLICY IF EXISTS "admin_customers_insert" ON customers;
DROP POLICY IF EXISTS "admin_customers_update" ON customers;
DROP POLICY IF EXISTS "admin_customers_delete" ON customers;

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
-- CONTENT_CATEGORIES (BLOG)
-- ==========================================
DROP POLICY IF EXISTS "Categorías activas visibles" ON content_categories;
DROP POLICY IF EXISTS "public_categories_select" ON content_categories;
DROP POLICY IF EXISTS "admin_categories_all" ON content_categories;

CREATE POLICY "public_categories_select" ON content_categories 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "admin_categories_all" ON content_categories 
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
-- CONTENT_TAGS (BLOG)
-- ==========================================
DROP POLICY IF EXISTS "Tags visibles" ON content_tags;
DROP POLICY IF EXISTS "public_tags_select" ON content_tags;
DROP POLICY IF EXISTS "admin_tags_all" ON content_tags;

CREATE POLICY "public_tags_select" ON content_tags 
  FOR SELECT 
  USING (true);

CREATE POLICY "admin_tags_all" ON content_tags 
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
-- POSTS (BLOG) - solo si existe
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'posts') THEN
    DROP POLICY IF EXISTS "Posts publicados visibles" ON posts;
    DROP POLICY IF EXISTS "public_posts_select" ON posts;
    DROP POLICY IF EXISTS "admin_posts_all" ON posts;

    EXECUTE 'CREATE POLICY "public_posts_select" ON posts FOR SELECT USING (status = ''published'' AND published_at <= NOW())';
    
    EXECUTE 'CREATE POLICY "admin_posts_all" ON posts FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE 'Políticas creadas para posts';
  ELSE
    RAISE NOTICE 'Tabla posts no existe, saltando...';
  END IF;
END $$;

-- ==========================================
-- COMMENTS (BLOG) - solo si existe
-- ==========================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
    DROP POLICY IF EXISTS "Comentarios aprobados visibles" ON comments;
    DROP POLICY IF EXISTS "public_comments_select" ON comments;
    DROP POLICY IF EXISTS "admin_comments_all" ON comments;

    EXECUTE 'CREATE POLICY "public_comments_select" ON comments FOR SELECT USING (status = ''approved'')';
    
    EXECUTE 'CREATE POLICY "admin_comments_all" ON comments FOR ALL TO authenticated USING (
      EXISTS (
        SELECT 1 FROM admins 
        WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
      )
    )';
    
    RAISE NOTICE 'Políticas creadas para comments';
  ELSE
    RAISE NOTICE 'Tabla comments no existe, saltando...';
  END IF;
END $$;

-- ==========================================
-- Verificar todas las políticas creadas
-- ==========================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN (
    'extras', 'locations', 'vehicles', 'vehicle_categories',
    'customers', 'bookings', 'payments', 'seasons', 
    'content_categories', 'content_tags', 'posts', 'comments'
)
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ==========================================
-- Verificar que el RLS está habilitado
-- ==========================================
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'extras', 'locations', 'vehicles', 'vehicle_categories',
    'customers', 'bookings', 'payments', 'seasons', 
    'content_categories', 'content_tags', 'posts', 'comments'
)
ORDER BY tablename;

