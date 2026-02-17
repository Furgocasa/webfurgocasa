-- ============================================
-- MIGRACIÓN: Añadir min_days a locations
-- ============================================
-- Permite configurar días mínimos de alquiler por ubicación.
-- NULL = usa el mínimo de la temporada (comportamiento actual de Murcia)
-- Un valor numérico = override fijo (ej: Madrid = 10 días)
-- ============================================

-- Añadir columna min_days (nullable, NULL = usar temporada)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS min_days INTEGER DEFAULT NULL;

-- Configurar valores actuales según el negocio
-- Murcia: NULL (usa temporada) - ya es el default
-- Madrid: 10 días fijo
UPDATE locations SET min_days = 10 WHERE slug = 'madrid';

-- Verificar resultado
SELECT name, slug, min_days, extra_fee FROM locations ORDER BY name;
