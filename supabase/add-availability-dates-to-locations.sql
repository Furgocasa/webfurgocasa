-- ============================================
-- MIGRACIÓN: Añadir disponibilidad temporal a locations
-- ============================================
-- Permite configurar fechas de disponibilidad por ubicación.
-- NULL + NULL = disponible siempre (ej: Murcia)
-- Con fechas + recurring = false → solo ese periodo concreto (ej: 10-20 oct 2026)
-- Con fechas + recurring = true → se repite cada año (ej: 1 feb - 30 mayo, todos los años)
-- ============================================

-- Añadir columnas de disponibilidad temporal
ALTER TABLE locations ADD COLUMN IF NOT EXISTS active_from DATE DEFAULT NULL;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS active_until DATE DEFAULT NULL;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS active_recurring BOOLEAN DEFAULT FALSE;

-- Verificar resultado
SELECT name, slug, is_active, active_from, active_until, active_recurring, min_days
FROM locations ORDER BY name;
