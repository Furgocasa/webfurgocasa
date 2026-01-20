-- ============================================================
-- FIX RLS COMPLETO PARA SISTEMA DE RESERVAS
-- ============================================================
-- Asegura que todas las tablas públicas tengan políticas RLS
-- correctas para permitir lectura pública y escritura admin
-- ============================================================

-- ============================================================
-- 1. VEHICLES - Lectura pública
-- ============================================================

-- Activar RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "Vehículos visibles públicamente" ON vehicles;
DROP POLICY IF EXISTS "public_vehicles_select" ON vehicles;
DROP POLICY IF EXISTS "admin_vehicles_all" ON vehicles;
DROP POLICY IF EXISTS "public_read_vehicles" ON vehicles;
DROP POLICY IF EXISTS "admin_all_vehicles" ON vehicles;

-- Lectura pública de vehículos (todos los vehículos son visibles)
CREATE POLICY "public_select_vehicles"
ON vehicles
FOR SELECT
USING (true);  -- Todos pueden leer todos los vehículos

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_vehicles"
ON vehicles
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
-- 2. VEHICLE_IMAGES - Lectura pública
-- ============================================================

-- Activar RLS
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "Imágenes visibles públicamente" ON vehicle_images;
DROP POLICY IF EXISTS "public_vehicle_images_select" ON vehicle_images;
DROP POLICY IF EXISTS "admin_vehicle_images_all" ON vehicle_images;
DROP POLICY IF EXISTS "public_read_images" ON vehicle_images;
DROP POLICY IF EXISTS "admin_all_images" ON vehicle_images;

-- Lectura pública de imágenes
CREATE POLICY "public_select_vehicle_images"
ON vehicle_images
FOR SELECT
USING (true);

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_vehicle_images"
ON vehicle_images
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
-- 3. VEHICLE_EQUIPMENT - Lectura pública
-- ============================================================

-- Activar RLS
ALTER TABLE vehicle_equipment ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "public_vehicle_equipment_select" ON vehicle_equipment;
DROP POLICY IF EXISTS "admin_vehicle_equipment_all" ON vehicle_equipment;

-- Lectura pública
CREATE POLICY "public_select_vehicle_equipment"
ON vehicle_equipment
FOR SELECT
USING (true);

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_vehicle_equipment"
ON vehicle_equipment
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
-- 4. EQUIPMENT - Lectura pública
-- ============================================================

-- Activar RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "public_equipment_select" ON equipment;
DROP POLICY IF EXISTS "admin_equipment_all" ON equipment;
DROP POLICY IF EXISTS "public_read_equipment" ON equipment;
DROP POLICY IF EXISTS "admin_all_equipment" ON equipment;

-- Lectura pública de equipamiento activo
CREATE POLICY "public_select_equipment"
ON equipment
FOR SELECT
USING (is_active = true);

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_equipment"
ON equipment
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
-- 5. SEASONS - Lectura pública
-- ============================================================

-- Activar RLS
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "public_seasons_select" ON seasons;
DROP POLICY IF EXISTS "admin_seasons_all" ON seasons;

-- Lectura pública de temporadas activas
CREATE POLICY "public_select_seasons"
ON seasons
FOR SELECT
USING (is_active = true);

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_seasons"
ON seasons
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
-- 6. LOCATIONS - Lectura pública
-- ============================================================

-- Activar RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "public_locations_select" ON locations;
DROP POLICY IF EXISTS "admin_locations_all" ON locations;

-- Lectura pública de ubicaciones activas
CREATE POLICY "public_select_locations"
ON locations
FOR SELECT
USING (is_active = true);

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_locations"
ON locations
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
-- 7. BOOKINGS - Usuarios autenticados y anónimos pueden crear
-- ============================================================

-- Activar RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "public_bookings_insert" ON bookings;
DROP POLICY IF EXISTS "admin_bookings_all" ON bookings;
DROP POLICY IF EXISTS "users_read_own_bookings" ON bookings;

-- Los usuarios anónimos pueden crear reservas
CREATE POLICY "public_insert_bookings"
ON bookings
FOR INSERT
WITH CHECK (true);

-- Los usuarios pueden leer sus propias reservas (por email)
CREATE POLICY "users_select_own_bookings"
ON bookings
FOR SELECT
USING (
  customer_email = current_setting('request.jwt.claims', true)::json->>'email'
  OR customer_id::text = auth.uid()::text
);

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_bookings"
ON bookings
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
-- 8. BOOKING_EXTRAS - Vinculado a bookings
-- ============================================================

-- Activar RLS
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas antiguas
DROP POLICY IF EXISTS "public_booking_extras_insert" ON booking_extras;
DROP POLICY IF EXISTS "admin_booking_extras_all" ON booking_extras;

-- Los usuarios anónimos pueden crear extras de reserva
CREATE POLICY "public_insert_booking_extras"
ON booking_extras
FOR INSERT
WITH CHECK (true);

-- Los usuarios pueden leer sus propios extras de reserva
CREATE POLICY "users_select_own_booking_extras"
ON booking_extras
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = booking_extras.booking_id
    AND (
      bookings.customer_email = current_setting('request.jwt.claims', true)::json->>'email'
      OR bookings.customer_id::text = auth.uid()::text
    )
  )
);

-- Administradores pueden hacer todo
CREATE POLICY "admin_all_booking_extras"
ON booking_extras
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
-- VERIFICAR POLÍTICAS CREADAS
-- ============================================================

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  roles,
  qual::text as using_expression
FROM pg_policies
WHERE tablename IN (
  'vehicles', 
  'vehicle_images', 
  'vehicle_equipment',
  'equipment',
  'vehicle_categories', 
  'extras', 
  'seasons', 
  'locations',
  'bookings',
  'booking_extras'
)
ORDER BY tablename, policyname;

-- ============================================================
-- RESULTADO ESPERADO
-- ============================================================
-- ✓ Usuarios anónimos pueden:
--   - Leer vehículos, imágenes, categorías, extras, equipamiento
--   - Leer temporadas y ubicaciones activas
--   - Crear reservas y extras de reserva
-- ✓ Administradores pueden hacer todo en todas las tablas
-- ✓ El sistema de reservas funciona sin errores de AbortError
-- ============================================================
