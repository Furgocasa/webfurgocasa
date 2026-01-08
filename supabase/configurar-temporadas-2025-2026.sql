-- ============================================
-- CONFIGURACIÓN DE TEMPORADAS 2025-2026
-- Sistema de precios con sobrecostes según período
-- ============================================

-- Por defecto TODO EL AÑO es TEMPORADA BAJA
-- Los períodos definidos aquí son los que tienen sobrecostes adicionales

-- ============================================
-- 1. LIMPIAR DATOS EXISTENTES
-- ============================================
DELETE FROM seasons WHERE year IN (2025, 2026);

-- ============================================
-- 2. TEMPORADA BAJA (Por defecto - no necesita registros)
-- ============================================
-- La temporada baja NO se registra en la tabla.
-- Cualquier día que NO esté en un período MEDIA o ALTA
-- se considera automáticamente TEMPORADA BAJA.
-- 
-- Precios base TEMPORADA BAJA:
-- - Menos de 1 semana: 95€/día
-- - 1 semana (7-13 días): 85€/día  
-- - 2 semanas (14-20 días): 75€/día
-- - 3+ semanas (21+ días): 65€/día

-- ============================================
-- 3. PERÍODOS TEMPORADA MEDIA Y ALTA 2025
-- ============================================

-- 2025 - Fin de diciembre (MEDIA +30€)
INSERT INTO seasons (
    id,
    name,
    slug,
    start_date,
    end_date,
    price_less_than_week,
    price_one_week,
    price_two_weeks,
    price_three_weeks,
    year,
    min_days,
    is_active
) VALUES (
    uuid_generate_v4(),
    'Temporada Media - Fin Diciembre 2025',
    '2025-diciembre-media',
    '2025-12-19',
    '2025-12-31',
    125.00,  -- 95 + 30
    115.00,  -- 85 + 30
    105.00,  -- 75 + 30
    95.00,   -- 65 + 30
    2025,
    2,
    true
);

-- ============================================
-- 4. PERÍODOS TEMPORADA MEDIA Y ALTA 2026
-- ============================================

-- 2026 - Comienzo Enero (MEDIA +30€)
INSERT INTO seasons (
    id,
    name,
    slug,
    start_date,
    end_date,
    price_less_than_week,
    price_one_week,
    price_two_weeks,
    price_three_weeks,
    year,
    min_days,
    is_active
) VALUES (
    uuid_generate_v4(),
    'Temporada Media - Comienzo Enero',
    '2026-enero-media',
    '2026-01-01',
    '2026-01-11',
    125.00,  -- 95 + 30
    115.00,  -- 85 + 30
    105.00,  -- 75 + 30
    95.00,   -- 65 + 30
    2026,
    2,
    true
);

-- 2026 - Marzo San José (MEDIA +30€)
INSERT INTO seasons (
    id,
    name,
    slug,
    start_date,
    end_date,
    price_less_than_week,
    price_one_week,
    price_two_weeks,
    price_three_weeks,
    year,
    min_days,
    is_active
) VALUES (
    uuid_generate_v4(),
    'Temporada Media - San José',
    '2026-marzo-san-jose',
    '2026-03-13',
    '2026-03-22',
    125.00,  -- 95 + 30
    115.00,  -- 85 + 30
    105.00,  -- 75 + 30
    95.00,   -- 65 + 30
    2026,
    2,
    true
);

-- 2026 - Semana Santa (MEDIA +40€)
INSERT INTO seasons (
    id,
    name,
    slug,
    start_date,
    end_date,
    price_less_than_week,
    price_one_week,
    price_two_weeks,
    price_three_weeks,
    year,
    min_days,
    is_active
) VALUES (
    uuid_generate_v4(),
    'Temporada Media - Semana Santa',
    '2026-semana-santa',
    '2026-03-29',
    '2026-04-12',
    135.00,  -- 95 + 40
    125.00,  -- 85 + 40
    115.00,  -- 75 + 40
    105.00,  -- 65 + 40
    2026,
    7,  -- Mínimo 7 días en Semana Santa
    true
);

-- 2026 - Junio Mediados (MEDIA +30€)
INSERT INTO seasons (
    id,
    name,
    slug,
    start_date,
    end_date,
    price_less_than_week,
    price_one_week,
    price_two_weeks,
    price_three_weeks,
    year,
    min_days,
    is_active
) VALUES (
    uuid_generate_v4(),
    'Temporada Media - Mediados Junio',
    '2026-junio-media',
    '2026-06-08',
    '2026-06-21',
    125.00,  -- 95 + 30
    115.00,  -- 85 + 30
    105.00,  -- 75 + 30
    95.00,   -- 65 + 30
    2026,
    2,
    true
);

-- 2026 - VERANO (ALTA +60€)
INSERT INTO seasons (
    id,
    name,
    slug,
    start_date,
    end_date,
    price_less_than_week,
    price_one_week,
    price_two_weeks,
    price_three_weeks,
    year,
    min_days,
    is_active
) VALUES (
    uuid_generate_v4(),
    'Temporada Alta - Verano',
    '2026-verano-alta',
    '2026-06-22',
    '2026-09-20',
    155.00,  -- 95 + 60
    145.00,  -- 85 + 60
    135.00,  -- 75 + 60
    125.00,  -- 65 + 60
    2026,
    7,  -- Mínimo 7 días en verano
    true
);

-- 2026 - Septiembre y Octubre (MEDIA +30€)
INSERT INTO seasons (
    id,
    name,
    slug,
    start_date,
    end_date,
    price_less_than_week,
    price_one_week,
    price_two_weeks,
    price_three_weeks,
    year,
    min_days,
    is_active
) VALUES (
    uuid_generate_v4(),
    'Temporada Media - Septiembre y Octubre',
    '2026-septiembre-octubre',
    '2026-09-21',
    '2026-10-18',
    125.00,  -- 95 + 30
    115.00,  -- 85 + 30
    105.00,  -- 75 + 30
    95.00,   -- 65 + 30
    2026,
    2,
    true
);

-- ============================================
-- 5. VERIFICACIÓN
-- ============================================
-- Ver todas las temporadas ordenadas por fecha
SELECT 
    name,
    start_date,
    end_date,
    price_less_than_week AS "< 1 sem",
    price_one_week AS "1 sem",
    price_two_weeks AS "2 sem",
    price_three_weeks AS "3+ sem",
    min_days,
    (end_date - start_date + 1) AS "días"
FROM seasons 
WHERE year IN (2025, 2026)
ORDER BY start_date;

-- ============================================
-- 6. COMENTARIOS EXPLICATIVOS
-- ============================================
COMMENT ON TABLE seasons IS 'Períodos de temporada con sobrecostes. Los días NO listados aquí se consideran TEMPORADA BAJA por defecto.';
COMMENT ON COLUMN seasons.price_less_than_week IS 'Precio/día para alquileres de menos de 7 días (incluye sobrecoste de temporada)';
COMMENT ON COLUMN seasons.price_one_week IS 'Precio/día para alquileres de 7-13 días (incluye sobrecoste de temporada)';
COMMENT ON COLUMN seasons.price_two_weeks IS 'Precio/día para alquileres de 14-20 días (incluye sobrecoste de temporada)';
COMMENT ON COLUMN seasons.price_three_weeks IS 'Precio/día para alquileres de 21+ días (incluye sobrecoste de temporada)';
COMMENT ON COLUMN seasons.min_days IS 'Mínimo de días requerido para reservar en esta temporada';

-- ============================================
-- 7. RESUMEN DEL SISTEMA
-- ============================================
/*

⚠️ IMPORTANTE: CÁLCULO DÍA A DÍA

Las temporadas se calculan DÍA POR DÍA, NO por el período completo del alquiler.

Si un alquiler cruza varias temporadas, cada día se cobra según la temporada 
que le corresponde individualmente.

EJEMPLO CÁLCULO DÍA A DÍA:
- Alquiler del 15 al 25 de junio 2026 (11 días total)
  * Del 15 al 21 jun → 7 días en "Mediados Junio" (MEDIA) → 7 × 115€ = 805€
  * Del 22 al 25 jun → 4 días en "Verano" (ALTA) → 4 × 155€ = 620€
  * TOTAL = 805€ + 620€ = 1,425€

NO SE CALCULA: 11 días × precio único
SÍ SE CALCULA: Cada día según su temporada

─────────────────────────────────────────────────────────────────

LÓGICA DE CÁLCULO DE PRECIOS:

Para cada día del alquiler:
  1. Se verifica si ese día específico cae dentro de algún período registrado en `seasons`
  
  2. Si SÍ está en un período registrado:
     - Se usa el precio de ese período según la duración TOTAL del alquiler:
       * < 7 días totales: price_less_than_week
       * 7-13 días totales: price_one_week
       * 14-20 días totales: price_two_weeks
       * 21+ días totales: price_three_weeks

  3. Si NO está en ningún período (TEMPORADA BAJA por defecto):
     - Se usa el precio base según la duración TOTAL del alquiler:
       * < 7 días totales: 95€/día
       * 7-13 días totales: 85€/día
       * 14-20 días totales: 75€/día
       * 21+ días totales: 65€/día

Luego se suma el precio de cada día individual.

─────────────────────────────────────────────────────────────────

EJEMPLOS DETALLADOS:

📌 Ejemplo 1: Alquiler completo en una sola temporada
   Fechas: 1-7 mayo 2026 (7 días)
   Temporada: BAJA (ningún día está en períodos registrados)
   Cálculo: 7 días × 85€/día (precio para 7-13 días) = 595€

📌 Ejemplo 2: Alquiler completo en otra temporada
   Fechas: 15-21 junio 2026 (7 días)
   Temporada: MEDIA "Mediados Junio" (todos los días en este período)
   Cálculo: 7 días × 115€/día (precio MEDIA para 7-13 días) = 805€

📌 Ejemplo 3: Alquiler que cruza dos temporadas
   Fechas: 18-28 junio 2026 (11 días total)
   
   Día por día:
   - 18, 19, 20, 21 jun → MEDIA "Mediados Junio" → 4 días × 115€ = 460€
   - 22, 23, 24, 25, 26, 27, 28 jun → ALTA "Verano" → 7 días × 145€ = 1,015€
   
   TOTAL = 460€ + 1,015€ = 1,475€
   
   Nota: Se usa el precio para "7-13 días" (115€ MEDIA, 145€ ALTA) porque 
   la duración TOTAL del alquiler es 11 días.

📌 Ejemplo 4: Alquiler largo que cruza tres temporadas
   Fechas: 10 junio - 10 julio 2026 (31 días total)
   
   Día por día:
   - 10-21 jun (12 días) → MEDIA "Mediados Junio" → 12 × 95€ = 1,140€
   - 22 jun-10 jul (19 días) → ALTA "Verano" → 19 × 125€ = 2,375€
   
   TOTAL = 1,140€ + 2,375€ = 3,515€
   
   Nota: Se usa el precio para "21+ días" (95€ MEDIA, 125€ ALTA) porque 
   la duración TOTAL del alquiler es 31 días.

*/

