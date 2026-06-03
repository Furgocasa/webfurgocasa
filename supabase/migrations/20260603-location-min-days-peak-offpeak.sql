-- Mínimos de alquiler por ubicación: pico (jul–sep) vs resto del año.
-- Murcia: NULL en todo → sigue usando temporadas (seasons.min_days).
-- Madrid, Alicante, Albacete: min_days_peak + min_days_off_peak; min_days legacy se deja NULL.

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS min_days_peak INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS min_days_off_peak INTEGER DEFAULT NULL;

COMMENT ON COLUMN locations.min_days_peak IS
  'Mínimo días si la recogida cae en jul, ago o sep. NULL = no aplica (Murcia usa temporadas).';
COMMENT ON COLUMN locations.min_days_off_peak IS
  'Mínimo días si la recogida cae en oct–jun. NULL = no aplica (Murcia usa temporadas).';

-- Madrid: 20 días en verano, 12 el resto (política jun 2026)
UPDATE locations
SET min_days_peak = 20, min_days_off_peak = 12, min_days = NULL
WHERE slug = 'madrid';

-- Alicante / Albacete: mismo mínimo en ambos tramos hasta ajuste en admin
UPDATE locations
SET min_days_peak = 7, min_days_off_peak = 7, min_days = NULL
WHERE slug IN ('alicante', 'albacete');

-- Murcia: solo temporadas
UPDATE locations
SET min_days = NULL, min_days_peak = NULL, min_days_off_peak = NULL
WHERE slug = 'murcia';
