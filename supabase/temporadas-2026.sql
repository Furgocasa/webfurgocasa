-- ============================================
-- TEMPORADAS 2026 - FURGOCASA
-- ============================================
-- Script para insertar las temporadas del año 2026
-- 
-- IMPORTANTE: 
-- - Las temporadas MEDIA y ALTA se registran con sobrecoste
-- - Temporada BAJA (por defecto) NO se registra, aplica automáticamente
-- - Los precios siguen el sistema de descuentos por duración

-- Limpiar temporadas de 2026 existentes (si las hay)
DELETE FROM seasons WHERE year = 2026;

-- ============================================
-- TEMPORADAS 2026
-- ============================================

-- TEMPORADA MEDIA - Comienzo Enero
INSERT INTO seasons (
  name, 
  slug, 
  start_date, 
  end_date, 
  price_less_than_week,  -- < 7 días
  price_one_week,         -- 7-13 días
  price_two_weeks,        -- 14-20 días
  price_three_weeks,      -- 21+ días
  min_days,
  year,
  is_active
) VALUES (
  'Temporada Media - Comienzo Enero',
  '2026-enero-media',
  '2026-01-01',
  '2026-01-11',
  125,  -- +30€ sobre BAJA (95€)
  115,  -- +30€ sobre BAJA (85€)
  105,  -- +30€ sobre BAJA (75€)
  95,   -- +30€ sobre BAJA (65€)
  3,    -- Mínimo 3 días
  2026,
  true
);

-- TEMPORADA MEDIA - San José
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
  is_active
) VALUES (
  'Temporada Media - San José',
  '2026-marzo-san-jose',
  '2026-03-13',
  '2026-03-22',
  125,
  115,
  105,
  95,
  2,
  2026,
  true
);

-- TEMPORADA MEDIA - Semana Santa
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
  is_active
) VALUES (
  'Temporada Media - Semana Santa',
  '2026-semana-santa',
  '2026-03-29',
  '2026-04-12',
  125,
  115,
  105,
  95,
  7,    -- Mínimo 7 días en Semana Santa
  2026,
  true
);

-- TEMPORADA MEDIA - Mediados Junio
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
  is_active
) VALUES (
  'Temporada Media - Mediados Junio',
  '2026-junio-media',
  '2026-06-08',
  '2026-06-21',
  125,
  115,
  105,
  95,
  2,
  2026,
  true
);

-- TEMPORADA ALTA - VERANO (Julio y Agosto completos)
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
  is_active
) VALUES (
  'Temporada Alta - Verano',
  '2026-verano-alta',
  '2026-06-22',
  '2026-09-20',
  155,  -- +60€ sobre BAJA (95€)
  145,  -- +60€ sobre BAJA (85€)
  135,  -- +60€ sobre BAJA (75€)
  125,  -- +60€ sobre BAJA (65€)
  7,    -- Mínimo 7 días en TEMPORADA ALTA de verano
  2026,
  true
);

-- TEMPORADA MEDIA - Septiembre y Octubre
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
  is_active
) VALUES (
  'Temporada Media - Septiembre y Octubre',
  '2026-septiembre-octubre',
  '2026-09-21',
  '2026-10-18',
  125,
  115,
  105,
  95,
  2,
  2026,
  true
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Consultar todas las temporadas de 2026
SELECT 
  name,
  slug,
  start_date,
  end_date,
  price_less_than_week as "precio_<7días",
  min_days as "mín_días",
  is_active as "activa"
FROM seasons 
WHERE year = 2026 
ORDER BY start_date;

-- ============================================
-- NOTAS
-- ============================================
-- * Temporada BAJA aplica por defecto para cualquier día que NO esté cubierto por una temporada registrada
-- * Precios BAJA: 95€ (<7d), 85€ (7-13d), 75€ (14-20d), 65€ (21+d)
-- * La temporada ALTA de verano (22 jun - 20 sep) requiere MÍNIMO 7 DÍAS
-- * Semana Santa también requiere MÍNIMO 7 DÍAS
