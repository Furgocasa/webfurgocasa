-- ============================================
-- OPTIMIZACIÓN ESTRUCTURA CLIENTES Y RESERVAS
-- ============================================
-- 
-- Este script optimiza la gestión de datos entre customers y bookings
-- Ejecutar DESPUÉS de migrar los datos con migrate-customer-data.ts
--

-- ============================================
-- 1. ANÁLISIS PREVIO (opcional - solo para verificar)
-- ============================================

-- Ver cuántos clientes tienen datos vacíos
-- SELECT 
--   COUNT(*) as total_clientes,
--   COUNT(phone) as con_telefono,
--   COUNT(dni) as con_dni,
--   COUNT(address) as con_direccion,
--   COUNT(date_of_birth) as con_fecha_nacimiento,
--   COUNT(driver_license) as con_carnet
-- FROM customers;


-- ============================================
-- 2. OPTIMIZACIÓN DE TABLA BOOKINGS
-- ============================================

-- OPCIÓN A: Mantener campos snapshot en bookings (RECOMENDADO)
-- Esto permite tener un histórico de cómo estaban los datos del cliente
-- en el momento de la reserva
COMMENT ON COLUMN bookings.customer_name IS 'Snapshot: Nombre del cliente en el momento de la reserva';
COMMENT ON COLUMN bookings.customer_email IS 'Snapshot: Email del cliente en el momento de la reserva';
COMMENT ON COLUMN bookings.customer_phone IS 'Snapshot OPCIONAL: Teléfono del cliente en el momento de la reserva (puede ser NULL)';
COMMENT ON COLUMN bookings.customer_dni IS 'Snapshot: DNI del cliente en el momento de la reserva';
COMMENT ON COLUMN bookings.customer_address IS 'Snapshot: Dirección del cliente en el momento de la reserva';
COMMENT ON COLUMN bookings.customer_city IS 'Snapshot: Ciudad del cliente en el momento de la reserva';
COMMENT ON COLUMN bookings.customer_postal_code IS 'Snapshot: Código postal del cliente en el momento de la reserva';


-- OPCIÓN B: Eliminar campos duplicados de bookings (NO RECOMENDADO)
-- Solo ejecutar si estás seguro de que NO necesitas histórico
-- ⚠️ CUIDADO: Esto elimina datos permanentemente
/*
ALTER TABLE bookings 
  DROP COLUMN IF EXISTS customer_dni,
  DROP COLUMN IF EXISTS customer_address,
  DROP COLUMN IF EXISTS customer_city,
  DROP COLUMN IF EXISTS customer_postal_code;
  
-- Nota: Mantener customer_name y customer_email (obligatorios)
-- customer_phone es opcional - se usa si está disponible para emails y facturación
*/


-- ============================================
-- 3. ÍNDICES PARA OPTIMIZAR BÚSQUEDAS
-- ============================================

-- Índice compuesto para búsquedas de clientes
CREATE INDEX IF NOT EXISTS idx_customers_search 
ON customers(email, dni, phone);

-- Índice para búsqueda por país (útil para estadísticas)
CREATE INDEX IF NOT EXISTS idx_customers_country 
ON customers(country) WHERE country IS NOT NULL;

-- Índice para fecha de nacimiento (útil para verificaciones de edad)
CREATE INDEX IF NOT EXISTS idx_customers_dob 
ON customers(date_of_birth) WHERE date_of_birth IS NOT NULL;


-- ============================================
-- 4. FUNCIÓN PARA SINCRONIZAR DATOS
-- ============================================

-- Crear función que se ejecuta automáticamente al crear/actualizar booking
-- para asegurar que los datos del cliente estén actualizados
CREATE OR REPLACE FUNCTION sync_customer_data_from_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si el customer_id existe
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET
      -- Actualizar solo si los datos en booking son más recientes/completos
      phone = COALESCE(NEW.customer_phone, customers.phone),
      dni = COALESCE(NEW.customer_dni, customers.dni),
      address = COALESCE(NEW.customer_address, customers.address),
      city = COALESCE(NEW.customer_city, customers.city),
      postal_code = COALESCE(NEW.customer_postal_code, customers.postal_code),
      updated_at = NOW()
    WHERE id = NEW.customer_id
      AND (
        -- Solo actualizar si realmente hay cambios
        customers.phone IS NULL AND NEW.customer_phone IS NOT NULL
        OR customers.dni IS NULL AND NEW.customer_dni IS NOT NULL
        OR customers.address IS NULL AND NEW.customer_address IS NOT NULL
        OR customers.city IS NULL AND NEW.customer_city IS NOT NULL
        OR customers.postal_code IS NULL AND NEW.customer_postal_code IS NOT NULL
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger (eliminar si ya existe)
DROP TRIGGER IF EXISTS trigger_sync_customer_data ON bookings;

-- Crear nuevo trigger
CREATE TRIGGER trigger_sync_customer_data
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_customer_data_from_booking();


-- ============================================
-- 5. VISTA PARA CONSULTAS UNIFICADAS
-- ============================================

-- Vista que combina datos actuales del cliente con snapshot de la reserva
CREATE OR REPLACE VIEW bookings_with_customer_details AS
SELECT 
  b.*,
  c.phone as customer_current_phone,
  c.dni as customer_current_dni,
  c.date_of_birth as customer_date_of_birth,
  c.address as customer_current_address,
  c.city as customer_current_city,
  c.postal_code as customer_current_postal_code,
  c.country as customer_country,
  c.driver_license as customer_driver_license,
  c.driver_license_expiry as customer_driver_license_expiry,
  c.total_bookings as customer_total_bookings,
  c.total_spent as customer_total_spent
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id;

-- Comentario en la vista
COMMENT ON VIEW bookings_with_customer_details IS 
'Vista unificada de reservas con datos actuales del cliente. Usar esta vista en lugar de hacer JOINs manuales.';


-- ============================================
-- 6. FUNCIÓN PARA LIMPIAR DATOS DUPLICADOS (opcional)
-- ============================================

-- Esta función elimina clientes duplicados manteniendo el más completo
CREATE OR REPLACE FUNCTION merge_duplicate_customers()
RETURNS TABLE(merged_count INTEGER) AS $$
DECLARE
  dup_record RECORD;
  keep_id UUID;
  merge_id UUID;
  total_merged INTEGER := 0;
BEGIN
  -- Encontrar duplicados por email
  FOR dup_record IN (
    SELECT email, array_agg(id ORDER BY 
      CASE 
        WHEN driver_license IS NOT NULL THEN 3
        WHEN address IS NOT NULL THEN 2
        WHEN phone IS NOT NULL THEN 1
        ELSE 0
      END DESC,
      created_at ASC
    ) as customer_ids
    FROM customers
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
  )
  LOOP
    -- El primero del array es el más completo/antiguo (keep)
    keep_id := dup_record.customer_ids[1];
    
    -- Los demás se fusionan
    FOR i IN 2..array_length(dup_record.customer_ids, 1)
    LOOP
      merge_id := dup_record.customer_ids[i];
      
      -- Actualizar bookings para que apunten al cliente principal
      UPDATE bookings 
      SET customer_id = keep_id 
      WHERE customer_id = merge_id;
      
      -- Actualizar estadísticas del cliente principal
      UPDATE customers
      SET 
        total_bookings = total_bookings + (SELECT COALESCE(total_bookings, 0) FROM customers WHERE id = merge_id),
        total_spent = total_spent + (SELECT COALESCE(total_spent, 0) FROM customers WHERE id = merge_id)
      WHERE id = keep_id;
      
      -- Eliminar cliente duplicado
      DELETE FROM customers WHERE id = merge_id;
      
      total_merged := total_merged + 1;
    END LOOP;
  END LOOP;
  
  RETURN QUERY SELECT total_merged;
END;
$$ LANGUAGE plpgsql;

-- Para ejecutar la limpieza:
-- SELECT merge_duplicate_customers();


-- ============================================
-- 7. VERIFICACIÓN FINAL
-- ============================================

-- Contar registros actualizados
SELECT 
  'Clientes totales' as metrica,
  COUNT(*) as cantidad
FROM customers
UNION ALL
SELECT 
  'Clientes con teléfono' as metrica,
  COUNT(*) as cantidad
FROM customers
WHERE phone IS NOT NULL
UNION ALL
SELECT 
  'Clientes con DNI' as metrica,
  COUNT(*) as cantidad
FROM customers
WHERE dni IS NOT NULL
UNION ALL
SELECT 
  'Clientes con dirección' as metrica,
  COUNT(*) as cantidad
FROM customers
WHERE address IS NOT NULL
UNION ALL
SELECT 
  'Clientes con fecha nacimiento' as metrica,
  COUNT(*) as cantidad
FROM customers
WHERE date_of_birth IS NOT NULL
UNION ALL
SELECT 
  'Clientes con carnet' as metrica,
  COUNT(*) as cantidad
FROM customers
WHERE driver_license IS NOT NULL;


-- ============================================
-- 8. GRANTS Y PERMISOS (si es necesario)
-- ============================================

-- Asegurar que la vista sea accesible
GRANT SELECT ON bookings_with_customer_details TO authenticated;
GRANT SELECT ON bookings_with_customer_details TO anon;


-- ============================================
-- RESUMEN DE CAMBIOS:
-- ============================================
-- 
-- ✅ Índices optimizados para búsquedas de clientes
-- ✅ Función y trigger para sincronización automática
-- ✅ Vista unificada para consultas simplificadas
-- ✅ Función para fusionar clientes duplicados
-- ✅ Comentarios en campos para documentación
-- 
-- PRÓXIMOS PASOS:
-- 1. Ejecutar migrate-customer-data.ts para migrar datos
-- 2. Ejecutar este SQL en Supabase
-- 3. Verificar con las consultas de verificación
-- 4. Opcional: ejecutar merge_duplicate_customers() si hay duplicados
-- 
-- ============================================
