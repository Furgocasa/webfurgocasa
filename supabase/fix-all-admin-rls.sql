-- ================================================
-- FIX COMPLETO: Permisos RLS para todas las tablas del administrador
-- ================================================

-- ==========================================
-- LOCATIONS
-- ==========================================
DROP POLICY IF EXISTS "Ubicaciones activas visibles" ON locations;
DROP POLICY IF EXISTS "public_locations_select" ON locations;
DROP POLICY IF EXISTS "admin_locations_select_all" ON locations;
DROP POLICY IF EXISTS "admin_locations_insert" ON locations;
DROP POLICY IF EXISTS "admin_locations_update" ON locations;
DROP POLICY IF EXISTS "admin_locations_delete" ON locations;

CREATE POLICY "public_locations_select" ON locations FOR SELECT USING (is_active = true);
CREATE POLICY "admin_locations_all" ON locations FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- EXTRAS
-- ==========================================
DROP POLICY IF EXISTS "Extras activos visibles" ON extras;
DROP POLICY IF EXISTS "public_extras_select" ON extras;
DROP POLICY IF EXISTS "admin_extras_all" ON extras;

CREATE POLICY "public_extras_select" ON extras FOR SELECT USING (is_active = true);
CREATE POLICY "admin_extras_all" ON extras FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- CUSTOMERS
-- ==========================================
DROP POLICY IF EXISTS "admin_customers_all" ON customers;

CREATE POLICY "admin_customers_all" ON customers FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- PAYMENTS
-- ==========================================
DROP POLICY IF EXISTS "admin_payments_all" ON payments;

CREATE POLICY "admin_payments_all" ON payments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- COMMENTS
-- ==========================================
DROP POLICY IF EXISTS "Comentarios aprobados visibles" ON comments;
DROP POLICY IF EXISTS "public_comments_select" ON comments;
DROP POLICY IF EXISTS "admin_comments_all" ON comments;

CREATE POLICY "public_comments_select" ON comments FOR SELECT USING (status = 'approved');
CREATE POLICY "admin_comments_all" ON comments FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- CONTENT_CATEGORIES
-- ==========================================
DROP POLICY IF EXISTS "Categorías activas visibles" ON content_categories;
DROP POLICY IF EXISTS "public_categories_select" ON content_categories;
DROP POLICY IF EXISTS "admin_categories_all" ON content_categories;

CREATE POLICY "public_categories_select" ON content_categories FOR SELECT USING (is_active = true);
CREATE POLICY "admin_categories_all" ON content_categories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- CONTENT_TAGS
-- ==========================================
DROP POLICY IF EXISTS "Tags visibles" ON content_tags;
DROP POLICY IF EXISTS "public_tags_select" ON content_tags;
DROP POLICY IF EXISTS "admin_tags_all" ON content_tags;

CREATE POLICY "public_tags_select" ON content_tags FOR SELECT USING (true);
CREATE POLICY "admin_tags_all" ON content_tags FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- SEASONS
-- ==========================================
DROP POLICY IF EXISTS "admin_seasons_all" ON seasons;

CREATE POLICY "public_seasons_select" ON seasons FOR SELECT USING (true);
CREATE POLICY "admin_seasons_all" ON seasons FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- VEHICLES
-- ==========================================
DROP POLICY IF EXISTS "Vehículos activos visibles" ON vehicles;
DROP POLICY IF EXISTS "public_vehicles_select" ON vehicles;
DROP POLICY IF EXISTS "admin_vehicles_all" ON vehicles;

CREATE POLICY "public_vehicles_select" ON vehicles FOR SELECT USING (status != 'inactive');
CREATE POLICY "admin_vehicles_all" ON vehicles FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- BOOKINGS
-- ==========================================
DROP POLICY IF EXISTS "admin_bookings_all" ON bookings;

CREATE POLICY "admin_bookings_all" ON bookings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- POSTS
-- ==========================================
DROP POLICY IF EXISTS "Posts publicados visibles" ON posts;
DROP POLICY IF EXISTS "public_posts_select" ON posts;
DROP POLICY IF EXISTS "admin_posts_all" ON posts;

CREATE POLICY "public_posts_select" ON posts FOR SELECT USING (status = 'published' AND published_at <= NOW());
CREATE POLICY "admin_posts_all" ON posts FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- Verificar todas las políticas
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
    'locations', 'extras', 'customers', 'payments', 'comments',
    'content_categories', 'content_tags', 'seasons', 'vehicles', 
    'bookings', 'posts'
)
ORDER BY tablename, policyname;


