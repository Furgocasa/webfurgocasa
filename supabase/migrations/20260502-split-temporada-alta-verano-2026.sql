-- ============================================
-- DIVIDIR TEMPORADA ALTA - VERANO 2026 EN 3 SUB-TEMPORADAS
-- ============================================
-- Fecha: 02/05/2026
--
-- Antes:
--   - 'Temporada Alta - Verano' (slug: 2026-verano-alta)
--     22/06/2026 -> 20/09/2026 (91 días)  +60€  min 7
--
-- Después (3 tramos contiguos, mismas tarifas y mínimo):
--   1) 22/06/2026 -> 31/07/2026  (Junio + Julio)
--   2) 01/08/2026 -> 23/08/2026  (Agosto Centro - PICO)
--   3) 24/08/2026 -> 20/09/2026  (Final Agosto + Septiembre)
--
-- Todas mantienen por ahora: +60€ de sobrecoste y mínimo 7 días.
-- El precio del tramo central podrá modificarse luego desde el panel.
-- ============================================

BEGIN;

-- 1. Eliminar la temporada alta de verano 2026 existente (cualquier slug previo)
DELETE FROM seasons
WHERE year = 2026
  AND season_type = 'alta'
  AND start_date = '2026-06-22'
  AND end_date   = '2026-09-20';

-- Por seguridad, también eliminar por slug conocido
DELETE FROM seasons
WHERE slug IN (
  '2026-verano-alta',
  '2026-verano-alta-junio-julio',
  '2026-verano-alta-agosto-centro',
  '2026-verano-alta-agosto-septiembre'
);

-- 2. TRAMO 1: Verano Alta - Junio/Julio (22 jun - 31 jul)
INSERT INTO seasons (
  name,
  slug,
  start_date,
  end_date,
  price_less_than_week,
  price_one_week,
  price_two_weeks,
  price_three_weeks,
  min_days,
  year,
  is_active,
  season_type
) VALUES (
  'Temporada Alta - Verano (Jun-Jul)',
  '2026-verano-alta-junio-julio',
  '2026-06-22',
  '2026-07-31',
  155,  -- +60€ sobre BAJA (95€)
  145,  -- +60€ sobre BAJA (85€)
  135,  -- +60€ sobre BAJA (75€)
  125,  -- +60€ sobre BAJA (65€)
  7,
  2026,
  true,
  'alta'
);

-- 3. TRAMO 2: Verano Alta - Agosto Centro (1 ago - 23 ago) [PICO, precio editable]
INSERT INTO seasons (
  name,
  slug,
  start_date,
  end_date,
  price_less_than_week,
  price_one_week,
  price_two_weeks,
  price_three_weeks,
  min_days,
  year,
  is_active,
  season_type
) VALUES (
  'Temporada Alta - Verano (Agosto Centro)',
  '2026-verano-alta-agosto-centro',
  '2026-08-01',
  '2026-08-23',
  155,  -- POR AHORA +60€ (modificar luego según precio pico)
  145,
  135,
  125,
  7,
  2026,
  true,
  'alta'
);

-- 4. TRAMO 3: Verano Alta - Final Agosto/Septiembre (24 ago - 20 sep)
INSERT INTO seasons (
  name,
  slug,
  start_date,
  end_date,
  price_less_than_week,
  price_one_week,
  price_two_weeks,
  price_three_weeks,
  min_days,
  year,
  is_active,
  season_type
) VALUES (
  'Temporada Alta - Verano (Ago-Sep)',
  '2026-verano-alta-agosto-septiembre',
  '2026-08-24',
  '2026-09-20',
  155,  -- +60€ sobre BAJA
  145,
  135,
  125,
  7,
  2026,
  true,
  'alta'
);

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Listar todas las temporadas ALTAS de 2026 después del cambio
SELECT
  name,
  slug,
  start_date,
  end_date,
  (end_date - start_date + 1) AS dias,
  price_less_than_week AS "precio_<7d",
  price_one_week       AS "precio_7-13d",
  price_two_weeks      AS "precio_14-20d",
  price_three_weeks    AS "precio_21+d",
  min_days,
  is_active,
  season_type
FROM seasons
WHERE year = 2026
  AND season_type = 'alta'
ORDER BY start_date;

-- Suma total de días cubiertos por las 3 sub-temporadas (debe dar 91)
SELECT SUM(end_date - start_date + 1) AS total_dias_cubiertos
FROM seasons
WHERE year = 2026
  AND season_type = 'alta'
  AND start_date >= '2026-06-22'
  AND end_date   <= '2026-09-20';
