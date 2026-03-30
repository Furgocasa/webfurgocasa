-- Tipo de temporada explícito (baja / media / alta). En la aplicación el tipo NO se deduce del precio.
-- Este UPDATE es solo relleno inicial único; revisa en admin los tipos que quieras antes de confiar en informes.

ALTER TABLE seasons ADD COLUMN season_type text;

UPDATE seasons
SET season_type = CASE
  WHEN lower(COALESCE(slug, '')) LIKE '%alta%' THEN 'alta'
  WHEN COALESCE(price_less_than_week, 95) - 95 >= 60 THEN 'alta'
  WHEN COALESCE(price_less_than_week, 95) - 95 >= 30 THEN 'media'
  ELSE 'baja'
END;

ALTER TABLE seasons
  ALTER COLUMN season_type SET NOT NULL,
  ALTER COLUMN season_type SET DEFAULT 'media';

ALTER TABLE seasons
  ADD CONSTRAINT seasons_season_type_check CHECK (season_type IN ('baja', 'media', 'alta'));
