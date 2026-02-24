-- ============================================
-- MIGRACIÓN: Renumerar daños por tipo (exterior/interior independientes)
-- Fecha: 24 Febrero 2026
-- ============================================
--
-- PROBLEMA:
-- Los damage_number eran secuenciales globales (1-15 sin importar tipo).
-- El daño interior #15 debería ser interior #1.
--
-- SOLUCIÓN:
-- Renumerar cada tipo (exterior e interior) con su propia secuencia 1, 2, 3...
-- ============================================

-- Renumerar EXTERIORES: 1, 2, 3...
WITH numbered_ext AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY vehicle_id
    ORDER BY damage_number ASC NULLS LAST, created_at ASC
  ) AS new_num
  FROM vehicle_damages
  WHERE damage_type = 'exterior' OR damage_type IS NULL
)
UPDATE vehicle_damages
SET damage_number = numbered_ext.new_num
FROM numbered_ext
WHERE vehicle_damages.id = numbered_ext.id;

-- Renumerar INTERIORES: 1, 2, 3...
WITH numbered_int AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY vehicle_id
    ORDER BY damage_number ASC NULLS LAST, created_at ASC
  ) AS new_num
  FROM vehicle_damages
  WHERE damage_type = 'interior'
)
UPDATE vehicle_damages
SET damage_number = numbered_int.new_num
FROM numbered_int
WHERE vehicle_damages.id = numbered_int.id;
