-- ============================================
-- MIGRACIÓN: Añadir cantidad mínima a extras
-- ============================================
-- Para extras "per_day": mínimo de días a facturar (ej: parking 4 días = 40€)
-- Para extras "per_unit": cantidad mínima de unidades al seleccionar
-- NULL = sin mínimo
-- ============================================

ALTER TABLE extras ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT NULL;

-- Verificar resultado
SELECT name, price_type, min_quantity, max_quantity FROM extras ORDER BY sort_order;
