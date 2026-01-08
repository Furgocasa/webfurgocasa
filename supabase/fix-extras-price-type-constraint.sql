-- ================================================
-- FIX: Eliminar y recrear constraint de price_type
-- ================================================

-- 1. Eliminar el constraint existente
ALTER TABLE extras DROP CONSTRAINT IF EXISTS extras_price_type_check;

-- 2. Ver qué valores hay actualmente en price_type
SELECT DISTINCT price_type, COUNT(*) as total
FROM extras
GROUP BY price_type
ORDER BY total DESC;

-- 3. Actualizar valores inválidos o NULL a 'per_unit'
UPDATE extras 
SET price_type = CASE
  WHEN price_type IS NULL THEN 'per_unit'
  WHEN price_type NOT IN ('per_day', 'per_unit', 'fixed') THEN 'per_unit'
  ELSE price_type
END;

-- 4. Verificar que ya no hay valores inválidos
SELECT DISTINCT price_type, COUNT(*) as total
FROM extras
GROUP BY price_type
ORDER BY total DESC;

-- 5. Recrear el constraint
ALTER TABLE extras 
ADD CONSTRAINT extras_price_type_check 
CHECK (price_type IN ('per_day', 'per_unit', 'fixed'));

-- 6. Verificar el constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'extras'::regclass
AND conname = 'extras_price_type_check';


