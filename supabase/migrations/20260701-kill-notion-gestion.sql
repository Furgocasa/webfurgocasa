-- ============================================================================
-- KILL NOTION — Sistema de gestión de alquileres en el panel admin
-- ============================================================================
-- Fecha: 01/07/2026
--
-- Sustituye el checklist que hasta ahora se llevaba en Notion (tabla
-- ALQUILER RESERVAS) por datos nativos en Supabase.
--
-- Contenido:
--   1) TABLA booking_admin_checklist  (checks manuales + post-alquiler)
--   2) ALTER booking_email_dispatches (nuevos email_type de gestión)
--   3) [FASE 4 · OPCIONAL] TABLA rental_documents + bucket rental-documents
--      (subida de DNI/carnet por el cliente + validación IA). Ejecutar SOLO
--      cuando arranquemos la fase de documentación con IA.
--
-- Documentación: docs/04-referencia/admin/KILL-NOTION-SISTEMA-GESTION.md
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLA: booking_admin_checklist
-- ============================================================================
-- Relación 1-a-1 con bookings. No se modifica la tabla bookings.
-- Los checks de pago marcan "he hecho la FACTURA" (el pago del cliente ya lo
-- conoce la web vía bookings.payment_status / amount_paid).
CREATE TABLE IF NOT EXISTS booking_admin_checklist (
  booking_id UUID PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,

  -- Checks MANUALES (los marca el administrador)
  first_invoice_done      BOOLEAN NOT NULL DEFAULT FALSE, -- factura 1er pago
  second_invoice_done     BOOLEAN NOT NULL DEFAULT FALSE, -- factura 2º pago
  documentation_received  BOOLEAN NOT NULL DEFAULT FALSE, -- override manual del check de docs
  deposit_received        BOOLEAN NOT NULL DEFAULT FALSE, -- fianza vista en el banco

  -- Marcado por el cron cuando se envía el email de cita
  appointment_confirmed   BOOLEAN NOT NULL DEFAULT FALSE,

  -- Post-alquiler
  damages_checked         BOOLEAN NOT NULL DEFAULT FALSE,
  cleaning_done           BOOLEAN NOT NULL DEFAULT FALSE,

  -- Auditoría
  updated_by  UUID REFERENCES admins(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE booking_admin_checklist IS
  'Checklist de gestión por reserva (sustituye a Notion). Checks manuales de facturación y fianza + estados post-alquiler. El contrato firmado se deriva de signed_contracts y los emails de booking_email_dispatches.';

-- Trigger updated_at
CREATE OR REPLACE FUNCTION tg_booking_admin_checklist_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON booking_admin_checklist;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON booking_admin_checklist
  FOR EACH ROW EXECUTE FUNCTION tg_booking_admin_checklist_set_updated_at();

-- RLS: solo admins autenticados (service_role hace bypass).
ALTER TABLE booking_admin_checklist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS booking_admin_checklist_admin_select ON booking_admin_checklist;
CREATE POLICY booking_admin_checklist_admin_select ON booking_admin_checklist
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = TRUE));

DROP POLICY IF EXISTS booking_admin_checklist_admin_insert ON booking_admin_checklist;
CREATE POLICY booking_admin_checklist_admin_insert ON booking_admin_checklist
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = TRUE));

DROP POLICY IF EXISTS booking_admin_checklist_admin_update ON booking_admin_checklist;
CREATE POLICY booking_admin_checklist_admin_update ON booking_admin_checklist
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = TRUE));

-- ============================================================================
-- 2. ALTER: booking_email_dispatches — nuevos tipos de email de gestión
-- ============================================================================
-- Añade los email_type de este sistema para poder registrar e idempotenciar
-- los envíos (manual + recordatorios + cita).
ALTER TABLE booking_email_dispatches
  DROP CONSTRAINT IF EXISTS booking_email_dispatches_email_type_check;

ALTER TABLE booking_email_dispatches
  ADD CONSTRAINT booking_email_dispatches_email_type_check CHECK (email_type IN (
    -- tipos previos
    'booking_created',
    'pickup_reminder',
    'storyteller_pickup_night',
    'storyteller_mid_trip',
    'return_reminder',
    'storyteller_post_trip',
    'magic_link',
    'upload_confirmation',
    -- nuevos tipos KILL NOTION
    'booking_management',        -- email de gestión inicial (manual)
    'second_payment_reminder',   -- recordatorio 2º pago (VENCIDO)
    'contract_reminder',         -- recordatorio firmar contrato
    'documentation_reminder',    -- recordatorio documentación
    'deposit_reminder',          -- recordatorio fianza
    'appointment'                -- email de cita
  ));

COMMIT;


-- ============================================================================
-- 3. [FASE 4 · OPCIONAL] rental_documents + bucket rental-documents
-- ============================================================================
-- Subida de DNI (anverso/reverso) y carnet (anverso/reverso) por el cliente
-- desde el link de su reserva + validación con GPT-4o Vision. Varios
-- conductores por reserva. Bucket PRIVADO (mismo patrón que signed-contracts).
--
-- ⚠️ NO ejecutar todavía si aún no estamos en la fase de documentación con IA.
-- Descomentar el bloque cuando toque.
-- ----------------------------------------------------------------------------
--
-- BEGIN;
--
-- CREATE TABLE IF NOT EXISTS rental_documents (
--   id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
--   driver_index  INT NOT NULL DEFAULT 0,           -- 0 = titular, 1 = 2º conductor…
--   driver_label  TEXT,                             -- nombre mostrado
--   doc_kind      TEXT NOT NULL CHECK (doc_kind IN (
--                   'dni_front','dni_back','license_front','license_back')),
--   storage_path  TEXT NOT NULL,                    -- bucket rental-documents
--   mime_type     TEXT,
--   size_bytes    BIGINT,
--   sha256        VARCHAR(64),
--   uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--   -- Resultado de la validación IA
--   ai_extracted  JSONB NOT NULL DEFAULT '{}'::jsonb,
--   ai_status     TEXT NOT NULL DEFAULT 'pending'
--                 CHECK (ai_status IN ('pending','ok','warning','error')),
--   ai_notes      TEXT,
--   verified_by   UUID REFERENCES admins(id),       -- override manual del admin
--   verified_at   TIMESTAMPTZ
-- );
--
-- CREATE INDEX IF NOT EXISTS idx_rental_documents_booking
--   ON rental_documents(booking_id, driver_index);
-- CREATE INDEX IF NOT EXISTS idx_rental_documents_status
--   ON rental_documents(ai_status);
--
-- -- Un documento por (reserva, conductor, tipo)
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_rental_documents_unique
--   ON rental_documents(booking_id, driver_index, doc_kind);
--
-- -- Bucket privado
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'rental-documents', 'rental-documents', FALSE,
--   15728640, -- 15 MiB por imagen
--   ARRAY['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf']
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   public = EXCLUDED.public,
--   file_size_limit = EXCLUDED.file_size_limit,
--   allowed_mime_types = EXCLUDED.allowed_mime_types;
--
-- ALTER TABLE rental_documents ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS rental_documents_admin_select ON rental_documents;
-- CREATE POLICY rental_documents_admin_select ON rental_documents
--   FOR SELECT TO authenticated
--   USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = TRUE));
--
-- DROP POLICY IF EXISTS rental_documents_storage_admin ON storage.objects;
-- CREATE POLICY rental_documents_storage_admin ON storage.objects
--   FOR SELECT TO authenticated
--   USING (
--     bucket_id = 'rental-documents'
--     AND EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid() AND admins.is_active = TRUE)
--   );
--
-- COMMIT;
-- ============================================================================

-- ============================================================================
-- VERIFICACIÓN (ejecutar a mano si quieres)
-- ============================================================================
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'booking_admin_checklist' ORDER BY ordinal_position;
--
-- SELECT pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conname = 'booking_email_dispatches_email_type_check';
