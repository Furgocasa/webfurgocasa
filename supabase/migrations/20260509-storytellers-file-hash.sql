-- ============================================
-- STORYTELLERS — Detección de subidas duplicadas
-- ============================================
-- Fecha: 09/05/2026
--
-- Añade `file_hash` (SHA-256 hex, 64 chars) a `storyteller_uploads`
-- para detectar y rechazar archivos duplicados subidos por el mismo
-- cliente (mismo email canónico).
--
-- Estrategia:
--  - El endpoint POST /api/storytellers/upload calcula sha256 del buffer
--    antes de subirlo a Storage y lo compara contra subidas ya existentes
--    del mismo `customer_email`.
--  - Si hay match, rechaza ese archivo concreto del lote (los demás siguen).
--
-- Por qué a nivel `customer_email` y no `booking_id`:
--  - Un cliente con varias reservas no debería ganar puntos dos veces por
--    la misma foto subida en reservas distintas.
--  - El email es la identidad maestra del programa Storytellers.
--
-- ============================================

BEGIN;

ALTER TABLE storyteller_uploads
  ADD COLUMN IF NOT EXISTS file_hash CHAR(64);

COMMENT ON COLUMN storyteller_uploads.file_hash IS
  'SHA-256 (hex) del contenido del archivo subido. Usado para deduplicar por customer_email.';

-- Índice para lookup rápido por (email, hash) al validar duplicados.
-- NO es UNIQUE estricto porque:
--   1. Las filas previas a esta migración no tienen hash (NULL) y queremos
--      poder convivir.
--   2. Si se quisiera bloquear a nivel de BD se haría con un partial index;
--      lo dejamos preparado para futuro endurecimiento.
CREATE INDEX IF NOT EXISTS idx_storyteller_uploads_email_hash
  ON storyteller_uploads(customer_email, file_hash)
  WHERE file_hash IS NOT NULL;

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT
  COUNT(*) AS total_uploads,
  COUNT(file_hash) AS con_hash,
  COUNT(*) - COUNT(file_hash) AS sin_hash_legacy
FROM storyteller_uploads;
