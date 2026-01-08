-- ================================================
-- FIX: Permisos RLS solo para tablas existentes
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
DROP POLICY IF EXISTS "admin_locations_all" ON locations;

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
-- SEASONS
-- ==========================================
DROP POLICY IF EXISTS "admin_seasons_all" ON seasons;
DROP POLICY IF EXISTS "public_seasons_select" ON seasons;

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
-- VEHICLE_CATEGORIES
-- ==========================================
DROP POLICY IF EXISTS "public_vehicle_categories_select" ON vehicle_categories;
DROP POLICY IF EXISTS "admin_vehicle_categories_all" ON vehicle_categories;

CREATE POLICY "public_vehicle_categories_select" ON vehicle_categories FOR SELECT USING (is_active = true);
CREATE POLICY "admin_vehicle_categories_all" ON vehicle_categories FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- VEHICLE_IMAGES
-- ==========================================
DROP POLICY IF EXISTS "public_vehicle_images_select" ON vehicle_images;
DROP POLICY IF EXISTS "admin_vehicle_images_all" ON vehicle_images;

CREATE POLICY "public_vehicle_images_select" ON vehicle_images FOR SELECT USING (true);
CREATE POLICY "admin_vehicle_images_all" ON vehicle_images FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- BOOKINGS
-- ==========================================
DROP POLICY IF EXISTS "admin_bookings_all" ON bookings;

CREATE POLICY "admin_bookings_all" ON bookings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = true));

-- ==========================================
-- Verificar políticas creadas
-- ==========================================
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename IN (
    'locations', 'extras', 'customers', 'payments', 'seasons',
    'vehicles', 'vehicle_categories', 'vehicle_images', 'bookings'
)
ORDER BY tablename, policyname;


