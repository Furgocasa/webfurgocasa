-- Añadir campo de código interno a los vehículos
-- Este código identifica de forma única cada vehículo (ej: FU0010, FU0011)

-- 1. Añadir columna internal_code
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS internal_code VARCHAR(20) UNIQUE;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_vehicles_internal_code ON vehicles(internal_code);

-- 3. Añadir comentario a la columna
COMMENT ON COLUMN vehicles.internal_code IS 'Código interno único del vehículo (ej: FU0010, FU0011)';

-- 4. Actualizar vehículos existentes con códigos temporales (OPCIONAL - ajustar según necesidad)
-- Puedes ejecutar esto o asignar los códigos manualmente desde el admin

-- Ejemplo de cómo generar códigos automáticos:
-- UPDATE vehicles 
-- SET internal_code = 'FU' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
-- WHERE internal_code IS NULL;

-- 5. Verificar que se ha creado correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
AND column_name = 'internal_code';

-- Resultado exitoso:
-- ✅ Campo internal_code añadido a la tabla vehicles
-- ✅ Índice creado para búsquedas rápidas
-- ✅ Los códigos pueden ser NULL inicialmente (se asignarán desde el admin)

