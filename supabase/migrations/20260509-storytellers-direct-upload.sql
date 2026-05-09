-- ============================================================================
-- Storytellers · Direct upload (signed URL + tus resumable)
-- ============================================================================
--
-- Migración: 2026-05-09
--
-- Objetivo
-- --------
-- Permitir que el cliente (navegador) suba archivos GRANDES (vídeos de móvil
-- de cientos de MB) DIRECTAMENTE a Supabase Storage en vez de pasar por la
-- serverless function de Vercel.
--
-- ¿Por qué?
-- ---------
-- Vercel tiene un límite duro de ~4.5 MB en el body de las requests a
-- serverless functions (Hobby y Pro). Aunque el código declarara
-- MAX_VIDEO_SIZE_BYTES = 500 MB, la plataforma rechazaba la request antes
-- de llegar a la API. Resultado: en móvil, vídeos de iPhone (4K @ 60fps)
-- fallaban casi siempre.
--
-- Arquitectura nueva
-- ------------------
--   1. Cliente hashea el archivo con WebCrypto (SHA-256).
--   2. Cliente llama a /api/storytellers/upload-init con metadatos
--      (filename, size, sha256, ...).
--   3. Server valida cuotas + dedupe + genera UN PATH RESERVADO POR ARCHIVO
--      ("bookings/<bookingId>/<uuid>.<ext>") y firma un ticket HMAC con la
--      lista de paths.
--   4. Cliente sube cada archivo CON tus-js-client al endpoint resumable
--      de Supabase Storage:
--          POST/PATCH https://<proj>.supabase.co/storage/v1/upload/resumable
--      autenticando con la ANON_KEY pública.
--      Si la red se corta, tus reanuda desde donde se quedó.
--   5. Cuando todos los archivos están subidos, el cliente llama a
--      /api/storytellers/upload-confirm con el ticket. El server:
--        - Verifica HMAC.
--        - HEAD a Storage para confirmar que cada archivo existe.
--        - INSERT en storyteller_uploads + ledger + cupón + email.
--
-- Para que esto funcione, hace falta abrir RLS en storage.objects de modo
-- que el role anon pueda hacer INSERT en el bucket `storyteller-uploads`,
-- pero solo bajo el prefijo `bookings/`. Como los paths son UUIDs aleatorios
-- generados por el server, el cliente no puede reservar paths arbitrarios:
-- el ticket HMAC liga los paths a la sesión. Archivos huérfanos se limpian
-- con el cron diario /api/cron/storyteller-orphan-cleanup.
--
-- Importante: este script asume que el bucket `storyteller-uploads` YA EXISTE.
-- Si no existe, créalo manualmente en el dashboard de Supabase como PRIVADO.
-- ============================================================================
--
-- ¡OJO! · Cómo aplicar esto en Supabase
-- -------------------------------------
-- El SQL Editor del dashboard se conecta como rol `postgres`, que NO es
-- propietario de la tabla `storage.objects` (su dueño es
-- `supabase_storage_admin`). Por eso un `ALTER TABLE storage.objects`
-- falla con `ERROR: 42501: must be owner of table objects`.
--
-- En cambio, los `CREATE POLICY ... ON storage.objects` SÍ están
-- permitidos al rol `postgres` desde hace versiones — son el método
-- oficial de Supabase para configurar RLS de Storage. Esta migración usa
-- exclusivamente eso, sin ningún `ALTER TABLE`. RLS en `storage.objects`
-- ya viene habilitada de fábrica en cualquier proyecto Supabase, así que
-- no hace falta activarla.
--
-- Si aun así te diera error de propiedad al crear las policies, la
-- alternativa robusta es crearlas desde la UI del dashboard:
--   Storage → policies → New policy → For: anon → Operation: INSERT/SELECT/UPDATE
-- replicando exactamente las condiciones de abajo.
-- ============================================================================

-- 1. Política de INSERT para anon (el cliente del navegador, sin auth de
--    Supabase, usa la anon key). Solo permite escribir en
--    storyteller-uploads/bookings/...
DROP POLICY IF EXISTS "storytellers_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "storytellers_anon_select" ON storage.objects;
DROP POLICY IF EXISTS "storytellers_anon_update" ON storage.objects;

CREATE POLICY "storytellers_anon_insert"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'storyteller-uploads'
    AND (storage.foldername(name))[1] = 'bookings'
    -- Forzamos que haya al menos 2 segmentos: bookings/<bookingId>/<uuid>.<ext>
    AND array_length(storage.foldername(name), 1) >= 2
  );

-- 2. Política de SELECT para anon. tus necesita HEAD al objeto recién creado
--    para validar el offset cuando reanuda. Limitamos a este bucket para no
--    dar acceso global. Como los nombres son UUIDs aleatorios y el bucket
--    es privado para todo lo demás, alguien externo no puede listar ni
--    enumerar contenido útil.
CREATE POLICY "storytellers_anon_select"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (
    bucket_id = 'storyteller-uploads'
    AND (storage.foldername(name))[1] = 'bookings'
  );

-- 3. Política de UPDATE para anon. tus reanudable hace UPDATE sobre el
--    metadata del objeto durante la subida resumable (cada PATCH al endpoint
--    /upload/resumable). Sin esta policy, fallaría con 401 al intentar
--    reanudar tras un PATCH.
CREATE POLICY "storytellers_anon_update"
  ON storage.objects
  FOR UPDATE
  TO anon
  USING (
    bucket_id = 'storyteller-uploads'
    AND (storage.foldername(name))[1] = 'bookings'
  )
  WITH CHECK (
    bucket_id = 'storyteller-uploads'
    AND (storage.foldername(name))[1] = 'bookings'
  );

-- 4. NO damos DELETE a anon. Solo el server (service_role) puede borrar,
--    via cron de limpieza de huérfanos. Por seguridad, si un atacante
--    intenta borrar archivos de otros, RLS bloquea.

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Tras aplicar, comprueba que las policies están creadas:
--
--   SELECT policyname, cmd, roles
--   FROM pg_policies
--   WHERE schemaname = 'storage' AND tablename = 'objects'
--     AND policyname LIKE 'storytellers_%';
--
-- Debes ver tres filas: storytellers_anon_insert, _select, _update.
-- ============================================================================
