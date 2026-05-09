-- ============================================
-- PROGRAMA STORYTELLERS — Captación de contenido amateur
-- ============================================
-- Fecha: 08/05/2026
--
-- Crea la infraestructura para que clientes (sin login) puedan subir
-- fotos y vídeos asociados a sus reservas, ganar puntos y canjearlos
-- por descuentos en futuras reservas (techo 15%).
--
-- Identidad maestra del cliente: customer_email (canónico, minúsculas, trim).
-- Cada subida se ata a un booking_id concreto + customer_email denormalizado.
-- Los puntos y cupones se acumulan por customer_email.
--
-- Ver guía: docs/02-desarrollo/contenido/GUIA_CONTENIDO.md
-- ============================================

BEGIN;

-- ============================================
-- 1. TABLA: storyteller_uploads
-- ============================================
-- Un registro por archivo subido (foto o vídeo)
CREATE TABLE IF NOT EXISTS storyteller_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  customer_name VARCHAR(200),

  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('photo', 'video')),
  file_size_bytes BIGINT NOT NULL,
  file_mime_type VARCHAR(80),
  original_filename VARCHAR(300),

  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Curaduría (admin)
  selected_at TIMESTAMPTZ,
  selected_by VARCHAR(255),

  -- Puntos otorgados (snapshot histórico, no cambia aunque se cambien reglas luego)
  points_at_upload INT NOT NULL DEFAULT 0,
  points_at_selection INT,

  notes TEXT,

  CONSTRAINT chk_file_size_positive CHECK (file_size_bytes > 0),
  CONSTRAINT chk_selected_consistency CHECK (
    (selected_at IS NULL AND selected_by IS NULL AND points_at_selection IS NULL)
    OR
    (selected_at IS NOT NULL AND selected_by IS NOT NULL AND points_at_selection IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_storyteller_uploads_booking
  ON storyteller_uploads(booking_id);
CREATE INDEX IF NOT EXISTS idx_storyteller_uploads_email
  ON storyteller_uploads(customer_email);
CREATE INDEX IF NOT EXISTS idx_storyteller_uploads_uploaded_at
  ON storyteller_uploads(uploaded_at DESC);
-- Para listado de pendientes de curar en panel admin
CREATE INDEX IF NOT EXISTS idx_storyteller_uploads_pending
  ON storyteller_uploads(uploaded_at DESC)
  WHERE selected_at IS NULL;

COMMENT ON TABLE storyteller_uploads IS
  'Subidas de fotos/vídeos del programa Storytellers. Cliente sin login: identificado por booking_id + customer_email denormalizado.';

-- ============================================
-- 2. TABLA: storyteller_points_ledger
-- ============================================
-- Movimientos contables de puntos por cliente (acumulación por email)
CREATE TABLE IF NOT EXISTS storyteller_points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email VARCHAR(255) NOT NULL,

  delta INT NOT NULL,
  reason VARCHAR(40) NOT NULL CHECK (reason IN (
    'upload_photo',
    'upload_video',
    'selected_photo',
    'selected_video',
    'redeem',
    'expire',
    'admin_adjust'
  )),

  related_upload_id UUID REFERENCES storyteller_uploads(id) ON DELETE SET NULL,
  related_coupon_id UUID,
  related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_storyteller_points_email
  ON storyteller_points_ledger(customer_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_storyteller_points_upload
  ON storyteller_points_ledger(related_upload_id);

COMMENT ON TABLE storyteller_points_ledger IS
  'Ledger contable de puntos del programa Storytellers. Suma por customer_email para obtener saldo.';

-- ============================================
-- 3. TABLA: storyteller_coupons
-- ============================================
-- Cupones generados al cruzar umbrales de puntos.
-- Regla: solo un cupón ACTIVO por email a la vez (el de mayor %).
-- Al cruzar nuevo umbral, se DESACTIVA el cupón anterior y se genera uno nuevo.
CREATE TABLE IF NOT EXISTS storyteller_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email VARCHAR(255) NOT NULL,

  code VARCHAR(40) NOT NULL UNIQUE,
  discount_pct INT NOT NULL CHECK (discount_pct BETWEEN 1 AND 15),

  -- Reglas de uso (las "5 reglas")
  min_days INT NOT NULL DEFAULT 4,
  is_low_mid_season_only BOOLEAN NOT NULL DEFAULT TRUE,

  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,

  -- Estado del cupón
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  used_at TIMESTAMPTZ,
  used_in_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  superseded_at TIMESTAMPTZ,
  superseded_by_id UUID REFERENCES storyteller_coupons(id) ON DELETE SET NULL,
  expired_at TIMESTAMPTZ,

  -- Origen del cupón
  source VARCHAR(40) NOT NULL DEFAULT 'threshold' CHECK (source IN (
    'instant_upload',
    'threshold',
    'admin_grant'
  )),
  threshold_points INT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_used_consistency CHECK (
    (used_at IS NULL AND used_in_booking_id IS NULL)
    OR
    (used_at IS NOT NULL AND used_in_booking_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_storyteller_coupons_email
  ON storyteller_coupons(customer_email);
CREATE INDEX IF NOT EXISTS idx_storyteller_coupons_code
  ON storyteller_coupons(code);
CREATE INDEX IF NOT EXISTS idx_storyteller_coupons_active
  ON storyteller_coupons(customer_email, is_active)
  WHERE is_active = TRUE AND used_at IS NULL AND expired_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_storyteller_coupons_expiring
  ON storyteller_coupons(valid_until)
  WHERE is_active = TRUE AND used_at IS NULL AND expired_at IS NULL;

COMMENT ON TABLE storyteller_coupons IS
  'Cupones generados por programa Storytellers. Solo uno activo por email a la vez (techo 15%).';

-- ============================================
-- 4. STORAGE BUCKET (privado)
-- ============================================
-- El bucket se crea via Supabase API/CLI, pero registramos la convención.
-- Bucket name: storyteller-uploads
-- Acceso: privado (todas las subidas/lecturas vía endpoint API con service_role)
-- Estructura interna: bookings/{booking_id}/{upload_id}.{ext}

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'storyteller-uploads',
  'storyteller-uploads',
  FALSE,
  3221225472,  -- 3 GiB — alineado con MAX_VIDEO_SIZE_BYTES (vídeos iPhone 4K); ver 20260509-storytellers-bucket-3gb-limit.sql
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/heic',
    'image/heif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 5. RLS — Row Level Security
-- ============================================
-- Las 3 tablas se acceden SIEMPRE vía endpoints API (service_role bypass RLS)
-- o desde panel admin (con auth admin). NO se exponen directamente al cliente
-- desde el frontend público (no hay login). Por seguridad activamos RLS y
-- DENEGAMOS por defecto: solo service_role o admin pueden leer/escribir.

ALTER TABLE storyteller_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyteller_coupons ENABLE ROW LEVEL SECURITY;

-- Política: solo admins autenticados pueden leer (panel admin).
-- El service_role (endpoints API) hace bypass total de RLS, no necesita política.

DROP POLICY IF EXISTS storyteller_uploads_admin_select ON storyteller_uploads;
CREATE POLICY storyteller_uploads_admin_select ON storyteller_uploads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS storyteller_uploads_admin_update ON storyteller_uploads;
CREATE POLICY storyteller_uploads_admin_update ON storyteller_uploads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS storyteller_points_ledger_admin_select ON storyteller_points_ledger;
CREATE POLICY storyteller_points_ledger_admin_select ON storyteller_points_ledger
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS storyteller_coupons_admin_select ON storyteller_coupons;
CREATE POLICY storyteller_coupons_admin_select ON storyteller_coupons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS storyteller_coupons_admin_update ON storyteller_coupons;
CREATE POLICY storyteller_coupons_admin_update ON storyteller_coupons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = TRUE
    )
  );

-- Storage bucket policies: solo service_role (endpoints API) puede subir/leer.
-- Panel admin lee vía URLs firmadas generadas por endpoint admin.
DROP POLICY IF EXISTS storyteller_uploads_storage_admin ON storage.objects;
CREATE POLICY storyteller_uploads_storage_admin ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'storyteller-uploads'
    AND EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = TRUE
    )
  );

-- ============================================
-- 6. FUNCIONES HELPER (saldo, etc.)
-- ============================================

-- Función: obtener saldo de puntos de un email
CREATE OR REPLACE FUNCTION get_storyteller_points_balance(p_email VARCHAR)
RETURNS INT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(delta), 0)::INT
  FROM storyteller_points_ledger
  WHERE customer_email = LOWER(TRIM(p_email));
$$;

COMMENT ON FUNCTION get_storyteller_points_balance(VARCHAR) IS
  'Devuelve el saldo total de puntos Storyteller para un email.';

-- ============================================
-- 7. TRIGGER: timestamp en superseded
-- ============================================
-- (Opcional, mantenido fuera por simplicidad: la lógica de superseded
-- se hace en código del endpoint).

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'storyteller_uploads' AS tabla, COUNT(*) AS filas FROM storyteller_uploads
UNION ALL SELECT 'storyteller_points_ledger', COUNT(*) FROM storyteller_points_ledger
UNION ALL SELECT 'storyteller_coupons', COUNT(*) FROM storyteller_coupons;

SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'storyteller-uploads';
