-- Script para insertar ubicaciones iniciales de Furgocasa

-- Primero, verificar si ya existen ubicaciones
SELECT COUNT(*) as total_locations FROM locations;

-- Eliminar ubicaciones de ejemplo si existen (opcional, comentar si quieres conservarlas)
-- DELETE FROM locations WHERE slug IN ('cartagena', 'ejemplo');

-- Insertar las ubicaciones oficiales de Furgocasa
INSERT INTO locations (name, slug, address, city, postal_code, phone, email, is_active)
VALUES 
(
  'Murcia',
  'murcia',
  'Calle Principal, 123',  -- Reemplazar con la dirección real
  'Murcia',
  '30001',  -- Reemplazar con el código postal real
  '+34 968 000 000',  -- Reemplazar con el teléfono real
  'murcia@furgocasa.com',  -- Reemplazar con el email real
  true
),
(
  'Madrid',
  'madrid',
  'Calle Secundaria, 456',  -- Reemplazar con la dirección real
  'Madrid',
  '28001',  -- Reemplazar con el código postal real
  '+34 91 000 0000',  -- Reemplazar con el teléfono real
  'madrid@furgocasa.com',  -- Reemplazar con el email real
  true
)
ON CONFLICT (slug) 
DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  postal_code = EXCLUDED.postal_code,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verificar que se insertaron correctamente
SELECT 
    id,
    name,
    slug,
    city,
    is_active
FROM locations
ORDER BY name;

-- Nota: Actualizar las direcciones, teléfonos y emails con los datos reales de Furgocasa

