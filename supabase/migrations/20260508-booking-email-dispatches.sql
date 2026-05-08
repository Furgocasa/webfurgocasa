-- ============================================
-- TABLA UNIFICADA DE MAILS TRANSACCIONALES POR RESERVA
-- ============================================
-- Fecha: 08/05/2026
--
-- Sustituye a los mecanismos actuales:
--   1) bookings.return_reminder_sent (boolean)        -> mails de devolucion
--   2) bookings.admin_notes con tag                  -> mails Storytellers post-viaje
--      "[storyteller-reminder-sent]"
--
-- Razon: ambos son fragiles
--   - El boolean no guarda timestamp ni message_id ni status.
--   - El tag en admin_notes ensucia un campo de operador y se rompe si se edita.
--
-- A partir de ahora, TODO email transaccional ligado a una reserva (storytellers
-- 05/06/07, recordatorio devolucion 04, reserva creada 01, magic link, etc.) se
-- registra aqui con idempotencia robusta via UNIQUE parcial.
--
-- Esta migracion NO toca bookings.return_reminder_sent ni bookings.admin_notes
-- por compatibilidad: los crons existentes siguen funcionando con sus mecanismos
-- antiguos. La fase 2 sera refactorizar los crons para que lean/escriban aqui.
-- ============================================

BEGIN;

-- ============================================
-- 1. TABLA: booking_email_dispatches
-- ============================================
CREATE TABLE IF NOT EXISTS booking_email_dispatches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- A que reserva pertenece (cascade: si se borra la reserva, se borra su historial de mails)
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Email del destinatario en el momento del envio (denormalizado).
  -- Si el cliente cambia su email despues, el historico queda intacto.
  customer_email  VARCHAR(255) NOT NULL,

  -- Tipo de mail. Cuando se anada un nuevo template hay que ampliar este CHECK.
  email_type      VARCHAR(40) NOT NULL CHECK (email_type IN (
    'booking_created',           -- 01-reserva-creada
    'pickup_reminder',           -- futuro: dia antes del pickup
    'storyteller_pickup_night',  -- 05-storytellers-dia-salida-noche
    'storyteller_mid_trip',      -- 06-storytellers-mitad-viaje
    'return_reminder',           -- 04-recordatorio-devolucion
    'storyteller_post_trip',     -- 07-storytellers-dia-despues-vuelta
    'magic_link',                -- portal Storytellers (a demanda)
    'upload_confirmation'        -- tras subir contenido (a demanda)
  )),

  -- Estado del envio
  status          VARCHAR(20) NOT NULL DEFAULT 'sent'
                  CHECK (status IN ('sent', 'failed', 'bounced', 'skipped')),

  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ID que devuelve el SMTP/API (para correlar bounces o consultas posteriores)
  smtp_message_id TEXT,

  -- En caso de fallo, mensaje de error (para diagnostico).
  error_message   TEXT,

  -- Metadata libre (template usado, locale, asunto, backfill flag, etc.)
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE booking_email_dispatches IS
  'Registro de todos los emails transaccionales asociados a una reserva (storytellers 05/06/07, recordatorio devolucion 04, reserva creada 01, magic link, etc). '
  'Centraliza la idempotencia (no reenviar) y la trazabilidad (cuando, a quien, OK/fail).';

COMMENT ON COLUMN booking_email_dispatches.email_type IS
  'Tipo de email enviado. Para anadir un nuevo template, ampliar el CHECK constraint.';
COMMENT ON COLUMN booking_email_dispatches.status IS
  'sent=enviado OK, failed=fallo SMTP, bounced=devuelto, skipped=no enviado a proposito (ej: cliente sin email)';
COMMENT ON COLUMN booking_email_dispatches.smtp_message_id IS
  'Message-ID devuelto por el servidor SMTP. Util para correlar bounces tardios.';
COMMENT ON COLUMN booking_email_dispatches.metadata IS
  'Datos auxiliares: template_file, locale, asunto, backfilled (true si vino de migracion), etc.';

-- ============================================
-- 2. INDICES E IDEMPOTENCIA
-- ============================================

-- IDEMPOTENCIA: misma reserva + mismo tipo de email + status='sent' = una sola fila.
-- Esto impide que un cron envie dos veces el mismo mail al mismo cliente para la
-- misma reserva. Si el envio falla (status='failed'), permite reintentar (no
-- entra en el unique).
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_dispatches_unique_sent
  ON booking_email_dispatches (booking_id, email_type)
  WHERE status = 'sent';

-- Listado de mails de una reserva concreta (panel admin)
CREATE INDEX IF NOT EXISTS idx_email_dispatches_booking
  ON booking_email_dispatches (booking_id, sent_at DESC);

-- Historial por cliente (cross-reservas)
CREATE INDEX IF NOT EXISTS idx_email_dispatches_email
  ON booking_email_dispatches (customer_email);

-- Estadisticas: cuantos de cada tipo se mandan al dia
CREATE INDEX IF NOT EXISTS idx_email_dispatches_type_date
  ON booking_email_dispatches (email_type, sent_at DESC);

-- Para depurar fallos rapidamente
CREATE INDEX IF NOT EXISTS idx_email_dispatches_failed
  ON booking_email_dispatches (sent_at DESC)
  WHERE status IN ('failed', 'bounced');

-- ============================================
-- 3. TRIGGER: updated_at automatico
-- ============================================
CREATE OR REPLACE FUNCTION tg_booking_email_dispatches_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON booking_email_dispatches;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON booking_email_dispatches
  FOR EACH ROW EXECUTE FUNCTION tg_booking_email_dispatches_set_updated_at();

-- ============================================
-- 4. RLS · denegado por defecto, solo admin lectura
-- ============================================
-- Misma politica que el resto de tablas Storytellers:
--   - service_role (endpoints API) hace bypass total: no necesita policy.
--   - admins autenticados pueden leer para diagnosticar/auditar.
--   - Nadie mas puede ver nada.

ALTER TABLE booking_email_dispatches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS booking_email_dispatches_admin_select ON booking_email_dispatches;
CREATE POLICY booking_email_dispatches_admin_select ON booking_email_dispatches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
        AND admins.is_active = TRUE
    )
  );

-- ============================================
-- 5. BACKFILL · no perder historico de los mecanismos antiguos
-- ============================================
-- 5.1 · Mails de "manana devuelves" ya enviados (bookings.return_reminder_sent)
--      Los registramos como dispatches existentes para que el futuro cron
--      refactorizado no los vuelva a enviar.
--      sent_at no lo conocemos exactamente -> usamos dropoff_date - 1 dia (mejor
--      aproximacion segun la logica del cron actual).

INSERT INTO booking_email_dispatches (
  booking_id,
  customer_email,
  email_type,
  status,
  sent_at,
  metadata
)
SELECT
  b.id,
  COALESCE(NULLIF(TRIM(b.customer_email), ''), 'unknown@furgocasa.local'),
  'return_reminder',
  'sent',
  -- Aproximacion: el cron envia el dia antes del dropoff a las 18:00 UTC
  COALESCE(b.dropoff_date::timestamptz, NOW()) - INTERVAL '6 hours',
  jsonb_build_object('backfilled', true, 'source', 'bookings.return_reminder_sent')
FROM bookings b
WHERE b.return_reminder_sent = TRUE
  AND b.id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5.2 · Mails post-viaje Storytellers ya enviados (tag en admin_notes)
--      sent_at: aproximamos a dropoff_date + 7 dias (logica actual del cron).

INSERT INTO booking_email_dispatches (
  booking_id,
  customer_email,
  email_type,
  status,
  sent_at,
  metadata
)
SELECT
  b.id,
  COALESCE(NULLIF(TRIM(b.customer_email), ''), 'unknown@furgocasa.local'),
  'storyteller_post_trip',
  'sent',
  COALESCE(b.dropoff_date::timestamptz, NOW()) + INTERVAL '7 days',
  jsonb_build_object('backfilled', true, 'source', 'bookings.admin_notes tag')
FROM bookings b
WHERE COALESCE(b.admin_notes, '') LIKE '%[storyteller-reminder-sent]%'
  AND b.id IS NOT NULL
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================
-- VERIFICACION POST-MIGRACION (ejecutar a mano si quieres)
-- ============================================
-- SELECT email_type, status, COUNT(*) AS total
-- FROM booking_email_dispatches
-- GROUP BY email_type, status
-- ORDER BY email_type, status;
--
-- SELECT b.booking_number, d.email_type, d.status, d.sent_at
-- FROM booking_email_dispatches d
-- JOIN bookings b ON b.id = d.booking_id
-- ORDER BY d.sent_at DESC
-- LIMIT 20;
