-- ============================================
-- ACTUALIZAR TABLA PAYMENTS PARA SOPORTAR STRIPE
-- ============================================
-- Fecha: Enero 2026
-- Propósito: Añadir soporte para pagos con Stripe manteniendo compatibilidad con Redsys

-- 1. Añadir columna para identificar el método de pago
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'redsys';

COMMENT ON COLUMN payments.payment_method IS 'Método de pago utilizado: redsys o stripe';

-- 2. Añadir columnas específicas de Stripe
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

COMMENT ON COLUMN payments.stripe_session_id IS 'ID de la sesión de Stripe Checkout';
COMMENT ON COLUMN payments.stripe_payment_intent_id IS 'ID del PaymentIntent de Stripe';

-- 3. Crear índices para mejorar rendimiento de búsquedas
CREATE INDEX IF NOT EXISTS idx_payments_payment_method 
ON payments(payment_method);

CREATE INDEX IF NOT EXISTS idx_payments_stripe_session 
ON payments(stripe_session_id) 
WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent 
ON payments(stripe_payment_intent_id) 
WHERE stripe_payment_intent_id IS NOT NULL;

-- 4. Actualizar registros existentes (si los hay) para marcarlos como Redsys
UPDATE payments 
SET payment_method = 'redsys' 
WHERE payment_method IS NULL;

-- 5. Verificar la estructura actualizada
-- Ejecutar para confirmar cambios:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'payments' 
-- ORDER BY ordinal_position;

-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================

-- Ver todos los pagos con su método
-- SELECT 
--   id, 
--   booking_id, 
--   order_number, 
--   amount, 
--   status, 
--   payment_method,
--   stripe_session_id,
--   created_at
-- FROM payments
-- ORDER BY created_at DESC
-- LIMIT 10;
