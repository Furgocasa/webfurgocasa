-- ============================================
-- STORYTELLERS — Descartar subidas pendientes
-- ============================================
-- Fecha: 09/05/2026
--
-- Añade el "estado descartada" para subidas que el admin no quiere
-- archivar pero tampoco bloquear el flujo de curación. La fila NO se
-- borra de la tabla y los puntos por SUBIDA del ledger se conservan
-- (no toca discount/coupon del cliente).
--
-- Reglas:
--   - Una subida puede estar PENDIENTE, SELECCIONADA, o DESCARTADA
--     (estados mutuamente excluyentes para selected_at vs discarded_at).
--   - El cliente NO recibe email cuando se descarta. Lo notará por
--     ausencia de los emails "tu foto/vídeo ha sido seleccionado".
--   - El admin puede revertir (POST /discard DELETE) y la subida vuelve
--     a "pendiente" sin ningún efecto secundario.
-- ============================================

BEGIN;

ALTER TABLE storyteller_uploads
  ADD COLUMN IF NOT EXISTS discarded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS discarded_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS discarded_reason TEXT;

COMMENT ON COLUMN storyteller_uploads.discarded_at IS
  'Marca temporal de descarte por admin (no archivable). NO toca puntos del ledger.';
COMMENT ON COLUMN storyteller_uploads.discarded_by IS
  'Email del admin que descartó la subida.';
COMMENT ON COLUMN storyteller_uploads.discarded_reason IS
  'Motivo opcional del descarte (notas internas).';

-- Una subida no puede estar simultáneamente seleccionada y descartada.
ALTER TABLE storyteller_uploads
  DROP CONSTRAINT IF EXISTS chk_selected_or_discarded;
ALTER TABLE storyteller_uploads
  ADD CONSTRAINT chk_selected_or_discarded
  CHECK (selected_at IS NULL OR discarded_at IS NULL);

-- Coherencia entre los 3 campos del descarte (todo o nada).
ALTER TABLE storyteller_uploads
  DROP CONSTRAINT IF EXISTS chk_discarded_consistency;
ALTER TABLE storyteller_uploads
  ADD CONSTRAINT chk_discarded_consistency
  CHECK (
    (discarded_at IS NULL AND discarded_by IS NULL)
    OR
    (discarded_at IS NOT NULL AND discarded_by IS NOT NULL)
  );

-- Reescribimos el índice de pendientes para excluir también las descartadas.
DROP INDEX IF EXISTS idx_storyteller_uploads_pending;
CREATE INDEX idx_storyteller_uploads_pending
  ON storyteller_uploads(uploaded_at DESC)
  WHERE selected_at IS NULL AND discarded_at IS NULL;

-- Índice para listar descartadas (uso poco frecuente, pero evita seq-scan).
CREATE INDEX IF NOT EXISTS idx_storyteller_uploads_discarded
  ON storyteller_uploads(discarded_at DESC)
  WHERE discarded_at IS NOT NULL;

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE selected_at IS NULL AND discarded_at IS NULL) AS pending,
  COUNT(*) FILTER (WHERE selected_at IS NOT NULL) AS selected,
  COUNT(*) FILTER (WHERE discarded_at IS NOT NULL) AS discarded
FROM storyteller_uploads;
