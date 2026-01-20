-- ============================================
-- ELIMINAR TRIGGERS OBSOLETOS DE SINCRONIZACIÓN
-- ============================================
-- Objetivo: Eliminar triggers que intentan sincronizar campos
--          que ya no existen tras la normalización
-- ============================================

-- 1. Eliminar trigger de sincronización obsoleto
DROP TRIGGER IF EXISTS trigger_sync_customer_data ON bookings;

-- 2. Eliminar función asociada
DROP FUNCTION IF EXISTS sync_customer_data_from_booking() CASCADE;

-- 3. Verificar que se eliminaron
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'bookings'
  AND trigger_name LIKE '%customer%';

-- Si el resultado está vacío, los triggers se eliminaron correctamente

-- ============================================
-- EXPLICACIÓN:
-- ============================================
-- El trigger intentaba sincronizar customer_phone, customer_dni, etc.
-- de bookings hacia customers cuando se creaba/actualizaba una reserva.
-- 
-- Tras la normalización, estos campos ya NO existen en bookings,
-- por lo que el trigger genera errores.
--
-- La nueva arquitectura es más simple:
-- - customers = fuente única de verdad
-- - bookings = solo customer_id + snapshot mínimo (name, email)
-- - Los datos se obtienen via JOIN, no via triggers
-- ============================================
