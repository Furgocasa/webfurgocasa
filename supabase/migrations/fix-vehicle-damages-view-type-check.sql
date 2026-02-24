-- ============================================
-- MIGRACIÓN: Incluir 'interior' en vehicle_damages_view_type_check
-- Fecha: 24 Febrero 2026
-- ============================================
-- 
-- PROBLEMA:
-- El constraint vehicle_damages_view_type_check solo permite vistas exteriores:
-- 'front', 'back', 'left', 'right', 'top'
-- Al añadir un daño interior (view_type = 'interior') falla con error 23514
-- 
-- SOLUCIÓN:
-- Recrear el constraint incluyendo 'interior'
-- ============================================

-- 1. Eliminar el constraint antiguo
ALTER TABLE vehicle_damages 
DROP CONSTRAINT IF EXISTS vehicle_damages_view_type_check;

-- 2. Crear el nuevo constraint con todos los valores (exterior + interior)
ALTER TABLE vehicle_damages 
ADD CONSTRAINT vehicle_damages_view_type_check 
CHECK (view_type IS NULL OR view_type IN (
  'front',     -- Frontal
  'back',      -- Trasera
  'left',      -- Lateral Izquierdo
  'right',     -- Lateral Derecho
  'top',       -- Superior
  'interior'   -- Interior
));
