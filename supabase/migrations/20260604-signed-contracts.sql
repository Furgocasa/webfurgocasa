-- ============================================
-- FIRMA DE CONTRATOS ONLINE — Registro de contratos firmados
-- ============================================
-- Fecha: 04/06/2026
--
-- Permite que un cliente (sin login) firme online el contrato de alquiler y
-- el anexo de protección de datos asociados a su reserva. Identidad del
-- cliente: booking_number + customer_email (igual que el programa Storytellers).
--
-- Cada firma genera UN PDF combinado (condiciones + protección de datos +
-- página de firma con ambas rúbricas, sello, nº de reserva, nombre, fecha/hora
-- e IP) que se guarda en el bucket privado `signed-contracts` y se envía por
-- email al cliente y a reservas@furgocasa.com.
--
-- El acceso a la tabla y al bucket es SIEMPRE vía endpoints API (service_role)
-- o panel admin autenticado. RLS deniega por defecto al público.
-- ============================================

BEGIN;

-- ============================================
-- 1. TABLA: signed_contracts
-- ============================================
-- Un registro por firma de contrato completada.
CREATE TABLE IF NOT EXISTS signed_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  booking_number VARCHAR(40) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(200),

  -- Aceptaciones explícitas (ambas deben ser TRUE para poder firmar)
  accepted_conditions BOOLEAN NOT NULL DEFAULT FALSE,
  accepted_data_protection BOOLEAN NOT NULL DEFAULT FALSE,

  -- Versión de los documentos firmados (para trazabilidad legal si cambian)
  contract_version VARCHAR(40) NOT NULL DEFAULT 'v1',

  -- PDF combinado firmado guardado en bucket `signed-contracts`
  signed_pdf_path TEXT NOT NULL,

  -- Evidencia de la firma
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(64),
  user_agent TEXT,

  notes TEXT,

  CONSTRAINT chk_both_accepted CHECK (
    accepted_conditions = TRUE AND accepted_data_protection = TRUE
  )
);

CREATE INDEX IF NOT EXISTS idx_signed_contracts_booking
  ON signed_contracts(booking_id);
CREATE INDEX IF NOT EXISTS idx_signed_contracts_email
  ON signed_contracts(customer_email);
CREATE INDEX IF NOT EXISTS idx_signed_contracts_booking_number
  ON signed_contracts(booking_number);
CREATE INDEX IF NOT EXISTS idx_signed_contracts_signed_at
  ON signed_contracts(signed_at DESC);

COMMENT ON TABLE signed_contracts IS
  'Contratos de alquiler firmados online. Cliente sin login: booking_number + customer_email. Un PDF combinado firmado por registro.';

-- ============================================
-- 2. STORAGE BUCKET (privado)
-- ============================================
-- Bucket name: signed-contracts
-- Acceso: privado. Subidas/lecturas vía endpoint API con service_role.
-- Estructura interna: {booking_id}/{contract_id}.pdf
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signed-contracts',
  'signed-contracts',
  FALSE,
  20971520,  -- 20 MiB por PDF firmado (margen de sobra)
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 3. RLS — Row Level Security
-- ============================================
ALTER TABLE signed_contracts ENABLE ROW LEVEL SECURITY;

-- Solo admins autenticados pueden leer (panel admin).
-- El service_role (endpoints API) hace bypass total de RLS.
DROP POLICY IF EXISTS signed_contracts_admin_select ON signed_contracts;
CREATE POLICY signed_contracts_admin_select ON signed_contracts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = TRUE
    )
  );

-- Storage: solo admins autenticados leen directamente (panel admin lee vía
-- URLs firmadas generadas por endpoint admin con service_role).
DROP POLICY IF EXISTS signed_contracts_storage_admin ON storage.objects;
CREATE POLICY signed_contracts_storage_admin ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'signed-contracts'
    AND EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = TRUE
    )
  );

COMMIT;
