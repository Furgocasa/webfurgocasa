-- ============================================================================
-- Storytellers · Aumentar file_size_limit del bucket storyteller-uploads
-- ============================================================================
--
-- Contexto (mayo 2026)
-- --------------------
-- Los clientes suben vídeos desde iPhone (QuickTime / HEVC / 4K). Clips de
-- ~30–60 s pueden pesar >500 MB u ocupar más que el límite por defecto del
-- bucket si éste se creó desde el dashboard sin migración (50 MB típico).
--
-- El error en inglés del Storage API es del tipo:
--   "The object exceeded the maximum allowed size"
--
-- IMPORTANTE: hay DOS límites en Supabase Storage:
--   1) Límite GLOBAL del proyecto (Dashboard → Storage → Settings / Configuración).
--      En plan Free no puede superar ~50 MB. El del bucket NUNCA puede ser mayor
--      que este global: si el global sigue en 50 MB, verás este error aunque el
--      bucket muestre 3 GB en la tabla de buckets.
--   2) file_size_limit por bucket (storage.buckets / pantalla del bucket).
--
-- Este SQL solo ajusta (2). Si tras ejecutarlo sigue el error, sube plan Pro (o
-- superior) y aumenta el «Global file size limit» en Storage Settings, luego el
-- bucket hasta el mismo techo (p. ej. 3 GiB).
--
-- Este script alinea el bucket con MAX_VIDEO_SIZE_BYTES en la app (3 GiB).
--
-- Ejecutar en Supabase SQL Editor (rol postgres).
-- ============================================================================

UPDATE storage.buckets
SET
  file_size_limit = 3221225472 -- 3 * 1024^3 bytes (3 GiB)
WHERE id = 'storyteller-uploads';

-- Si el bucket no existe aún, no hace nada (0 rows). Créalo antes o ejecuta
-- la migración 20260508-storytellers-program.sql que inserta el bucket.
