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
-- Eso viene de storage.buckets.file_size_limit, NO del código Next.js.
--
-- Este script alinea el bucket con MAX_VIDEO_SIZE_BYTES en la app (3 GiB).
-- Supabase Pro permite hasta 5 GB por objeto; 3 GB es un compromiso seguro.
--
-- Ejecutar en Supabase SQL Editor (rol postgres).
-- ============================================================================

UPDATE storage.buckets
SET
  file_size_limit = 3221225472 -- 3 * 1024^3 bytes (3 GiB)
WHERE id = 'storyteller-uploads';

-- Si el bucket no existe aún, no hace nada (0 rows). Créalo antes o ejecuta
-- la migración 20260508-storytellers-program.sql que inserta el bucket.
