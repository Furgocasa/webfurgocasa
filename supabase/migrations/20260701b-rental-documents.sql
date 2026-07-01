-- ============================================================================
-- KILL NOTION — FASE 4: subida de documentación del cliente + validación IA
-- ============================================================================
-- Fecha: 01/07/2026
--
-- El cliente sube desde el link de su reserva (página documentacion-alquiler):
--   · DNI (anverso + reverso)
--   · Carnet de conducir (anverso + reverso)
-- de cada conductor (varios conductores por reserva). GPT-4o Vision extrae y
-- coteja los datos. El check "Documentación" del panel admin se marca solo si la
-- IA valida OK, con override manual (booking_admin_checklist.documentation_received).
--
-- Bucket PRIVADO `rental-documents` (mismo patrón RLS que signed-contracts).
-- Acceso siempre vía endpoints API (service_role) o panel admin autenticado.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. TABLA rental_documents
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rental_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  driver_index  INT  NOT NULL DEFAULT 0,           -- 0 = titular, 1 = 2º conductor…
  driver_label  TEXT,                              -- nombre mostrado por el cliente
  doc_kind      TEXT NOT NULL CHECK (doc_kind IN (
                  'dni_front','dni_back','license_front','license_back')),
  storage_path  TEXT NOT NULL,                     -- bucket rental-documents
  mime_type     TEXT,
  size_bytes    BIGINT,
  sha256        VARCHAR(64),
  original_filename TEXT,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Resultado de la validación IA
  ai_extracted  JSONB NOT NULL DEFAULT '{}'::jsonb,
  ai_status     TEXT  NOT NULL DEFAULT 'pending'
                CHECK (ai_status IN ('pending','ok','warning','error')),
  ai_notes      TEXT,

  -- Override / revisión manual del admin
  verified_by   UUID REFERENCES admins(id),
  verified_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rental_documents_booking
  ON rental_documents(booking_id, driver_index);
CREATE INDEX IF NOT EXISTS idx_rental_documents_status
  ON rental_documents(ai_status);

-- Un documento por (reserva, conductor, tipo): re-subir reemplaza.
CREATE UNIQUE INDEX IF NOT EXISTS idx_rental_documents_unique
  ON rental_documents(booking_id, driver_index, doc_kind);

COMMENT ON TABLE rental_documents IS
  'Documentación de conductores (DNI + carnet, anverso/reverso) subida por el cliente desde el link de su reserva. Validación con GPT-4o Vision. Borrado solo manual desde el panel admin.';

-- ----------------------------------------------------------------------------
-- 2. BUCKET privado rental-documents
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rental-documents', 'rental-documents', FALSE,
  15728640,  -- 15 MiB por imagen
  ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 3. RLS — solo admins autenticados (service_role hace bypass)
-- ----------------------------------------------------------------------------
ALTER TABLE rental_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rental_documents_admin_select ON rental_documents;
CREATE POLICY rental_documents_admin_select ON rental_documents
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = TRUE));

DROP POLICY IF EXISTS rental_documents_storage_admin ON storage.objects;
CREATE POLICY rental_documents_storage_admin ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'rental-documents'
    AND EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = TRUE)
  );

COMMIT;

-- ============================================================================
-- VERIFICACIÓN (opcional)
-- ============================================================================
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'rental_documents' ORDER BY ordinal_position;
-- SELECT id, public FROM storage.buckets WHERE id = 'rental-documents';
