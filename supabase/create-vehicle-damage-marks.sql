-- =============================================
-- Sistema de Registro Visual de Daños de Vehículos
-- =============================================
-- Este script añade los campos necesarios para gestionar
-- daños de vehículos con marcadores visuales posicionados
-- sobre planos del vehículo (exterior e interior)

-- Añadir nuevos campos a la tabla vehicle_damages existente
ALTER TABLE vehicle_damages
ADD COLUMN IF NOT EXISTS damage_number INTEGER,
ADD COLUMN IF NOT EXISTS damage_type VARCHAR(20) DEFAULT 'exterior' CHECK (damage_type IN ('interior', 'exterior')),
ADD COLUMN IF NOT EXISTS view_type VARCHAR(20) CHECK (view_type IN ('front', 'back', 'left', 'right', 'top', 'interior_main', 'interior_rear')),
ADD COLUMN IF NOT EXISTS position_x DECIMAL(5,2) CHECK (position_x >= 0 AND position_x <= 100),
ADD COLUMN IF NOT EXISTS position_y DECIMAL(5,2) CHECK (position_y >= 0 AND position_y <= 100),
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_pre_existing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS photo_urls JSONB DEFAULT '[]'::jsonb;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_vehicle_damages_vehicle_id ON vehicle_damages(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_damages_damage_type ON vehicle_damages(damage_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_damages_view_type ON vehicle_damages(view_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_damages_status ON vehicle_damages(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_damages_booking_id ON vehicle_damages(booking_id);

-- Función para obtener el siguiente número de daño para un vehículo
CREATE OR REPLACE FUNCTION get_next_damage_number(p_vehicle_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(damage_number), 0) + 1 INTO next_number
  FROM vehicle_damages
  WHERE vehicle_id = p_vehicle_id;
  
  RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asignar automáticamente el número de daño
CREATE OR REPLACE FUNCTION assign_damage_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.damage_number IS NULL THEN
    NEW.damage_number := get_next_damage_number(NEW.vehicle_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe y recrearlo
DROP TRIGGER IF EXISTS trigger_assign_damage_number ON vehicle_damages;
CREATE TRIGGER trigger_assign_damage_number
BEFORE INSERT ON vehicle_damages
FOR EACH ROW
EXECUTE FUNCTION assign_damage_number();

-- Actualizar valores por defecto para daños existentes que no tengan número
UPDATE vehicle_damages
SET damage_number = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY vehicle_id ORDER BY created_at) as row_num
  FROM vehicle_damages
  WHERE damage_number IS NULL
) AS subquery
WHERE vehicle_damages.id = subquery.id;

-- Comentarios para documentación
COMMENT ON COLUMN vehicle_damages.damage_number IS 'Número secuencial del daño para este vehículo';
COMMENT ON COLUMN vehicle_damages.damage_type IS 'Tipo de daño: interior o exterior';
COMMENT ON COLUMN vehicle_damages.view_type IS 'Vista del vehículo donde se ubica el daño: front, back, left, right, top, interior_main, interior_rear';
COMMENT ON COLUMN vehicle_damages.position_x IS 'Posición X del marcador en porcentaje (0-100) sobre el plano';
COMMENT ON COLUMN vehicle_damages.position_y IS 'Posición Y del marcador en porcentaje (0-100) sobre el plano';
COMMENT ON COLUMN vehicle_damages.booking_id IS 'Reserva asociada al daño (si fue detectado durante una entrega/recogida)';
COMMENT ON COLUMN vehicle_damages.is_pre_existing IS 'Indica si el daño existía antes de la primera reserva registrada';
COMMENT ON COLUMN vehicle_damages.photo_urls IS 'Array de URLs de fotos del daño';

-- Vista para obtener resumen de daños por vehículo
CREATE OR REPLACE VIEW vehicle_damages_summary AS
SELECT 
  v.id as vehicle_id,
  v.internal_code,
  v.name as vehicle_name,
  v.brand,
  v.model,
  COUNT(vd.id) as total_damages,
  COUNT(CASE WHEN vd.damage_type = 'exterior' THEN 1 END) as exterior_damages,
  COUNT(CASE WHEN vd.damage_type = 'interior' THEN 1 END) as interior_damages,
  COUNT(CASE WHEN vd.status = 'pending' THEN 1 END) as pending_repairs,
  COUNT(CASE WHEN vd.status = 'repaired' THEN 1 END) as repaired_damages,
  MAX(vd.created_at) as last_damage_date
FROM vehicles v
LEFT JOIN vehicle_damages vd ON v.id = vd.vehicle_id
GROUP BY v.id, v.internal_code, v.name, v.brand, v.model;

-- Políticas RLS para vehicle_damages (si no existen)
DO $$ 
BEGIN
  -- Verificar si la tabla tiene RLS habilitado
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'vehicle_damages' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE vehicle_damages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Política para lectura (admins pueden ver todo)
DROP POLICY IF EXISTS "Admins can view all damages" ON vehicle_damages;
CREATE POLICY "Admins can view all damages" ON vehicle_damages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Política para inserción
DROP POLICY IF EXISTS "Admins can insert damages" ON vehicle_damages;
CREATE POLICY "Admins can insert damages" ON vehicle_damages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Política para actualización
DROP POLICY IF EXISTS "Admins can update damages" ON vehicle_damages;
CREATE POLICY "Admins can update damages" ON vehicle_damages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Política para eliminación
DROP POLICY IF EXISTS "Admins can delete damages" ON vehicle_damages;
CREATE POLICY "Admins can delete damages" ON vehicle_damages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.is_active = true
    )
  );

-- =============================================
-- INSTRUCCIONES DE USO:
-- =============================================
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Los daños existentes mantendrán sus datos
-- 3. Se asignarán números automáticos a daños sin número
-- 4. Los nuevos daños obtendrán número automático
-- =============================================
