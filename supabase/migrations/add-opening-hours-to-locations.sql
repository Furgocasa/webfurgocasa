-- Añadir columna opening_hours (JSONB) a locations
-- Formato: [{"open": "10:00", "close": "14:00"}, {"open": "17:00", "close": "19:00"}]
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '[{"open":"10:00","close":"14:00"},{"open":"17:00","close":"19:00"}]';
