-- ============================================
-- FIRMA DE CONTRATOS — Confirmaciones de puntos delicados
-- ============================================
-- Fecha: 04/06/2026
--
-- Añade el detalle de los "puntos delicados" que el cliente confirmó haber
-- leído al firmar (fianza 1.000 €, franquicia 900 €, limpieza/depósitos,
-- combustible, retrasos, prohibido fumar, requisitos del conductor y
-- geolocalización GPS). Se guarda como JSONB con los textos exactos mostrados,
-- como evidencia legal de qué confirmó cada cliente.
-- ============================================

BEGIN;

ALTER TABLE signed_contracts
  ADD COLUMN IF NOT EXISTS confirmations JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN signed_contracts.confirmations IS
  'Array JSON de puntos delicados confirmados por el cliente: [{id, label}]. Evidencia legal de la lectura de cláusulas clave.';

COMMIT;
