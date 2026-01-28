-- ============================================
-- MIGRACIÓN: Agregar 'completed' y 'failed' al constraint de payments
-- Fecha: 28 Enero 2026
-- ============================================
-- 
-- PROBLEMA:
-- El constraint actual solo permite: 'pending', 'authorized', 'cancelled', 'error', 'refunded'
-- Pero el código usa 'completed' (más semántico para el negocio)
-- 
-- SOLUCIÓN:
-- Agregar 'completed' y 'failed' como valores válidos
-- Mantener 'authorized' por compatibilidad con pagos antiguos
-- ============================================

-- 1. Eliminar el constraint antiguo
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_status_check;

-- 2. Crear el nuevo constraint con todos los valores
ALTER TABLE payments 
ADD CONSTRAINT payments_status_check 
CHECK (status IN (
  'pending',      -- Pago pendiente
  'completed',    -- Pago completado (valor principal)
  'authorized',   -- Alias de completed (compatibilidad)
  'failed',       -- Pago fallido (valor principal)
  'error',        -- Alias de failed (compatibilidad)
  'cancelled',    -- Pago cancelado
  'refunded'      -- Pago reembolsado
));

-- 3. Actualizar pagos antiguos que usan 'authorized' a 'completed' (opcional)
-- Descomenta si quieres normalizar los datos:
-- UPDATE payments SET status = 'completed' WHERE status = 'authorized';
-- UPDATE payments SET status = 'failed' WHERE status = 'error';

-- Verificación
SELECT 
  status, 
  COUNT(*) as count
FROM payments
GROUP BY status
ORDER BY count DESC;
