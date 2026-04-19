-- 20260419 · Sistema de mailing marketing · Fase 2/2
--
-- Crea las tablas del "motor" de envíos:
--   · mailing_campaigns   → una fila por oleada (borrador → enviando → enviada)
--   · mailing_recipients  → una fila por (campaña, destinatario), con trazabilidad
--
-- Requiere: 20260419-marketing-contacts-and-suppressions.sql aplicado primero.

-- ──────────────────────────────────────────────────────────────────────
-- 1) mailing_campaigns · cada campaña/oleada de marketing
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mailing_campaigns (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     TEXT NOT NULL UNIQUE,
  number                   INTEGER,
  template_file            TEXT,
  subject                  TEXT NOT NULL,
  description              TEXT,
  status                   TEXT NOT NULL DEFAULT 'draft',   -- draft|sending|sent|archived
  audience_filter          JSONB DEFAULT '{}'::jsonb,
  total_recipients         INTEGER NOT NULL DEFAULT 0,
  sent_count               INTEGER NOT NULL DEFAULT 0,
  failed_count             INTEGER NOT NULL DEFAULT 0,
  skipped_count            INTEGER NOT NULL DEFAULT 0,

  -- Contenido y envío
  html_content             TEXT,
  is_paused                BOOLEAN NOT NULL DEFAULT FALSE,
  max_per_hour             INTEGER NOT NULL DEFAULT 150,
  batch_size_per_tick      INTEGER NOT NULL DEFAULT 3,

  -- IA generadora
  generation_prompt        TEXT,
  generation_reference_ids UUID[],

  -- Telemetría del cron
  last_tick_at             TIMESTAMPTZ,
  last_tick_note           TEXT,

  -- Fechas
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at               TIMESTAMPTZ,
  completed_at             TIMESTAMPTZ,
  archived_at              TIMESTAMPTZ
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='mailing_campaigns_status_chk') THEN
    ALTER TABLE mailing_campaigns ADD CONSTRAINT mailing_campaigns_status_chk
      CHECK (status IN ('draft','sending','sent','archived'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='mailing_campaigns_max_per_hour_chk') THEN
    ALTER TABLE mailing_campaigns ADD CONSTRAINT mailing_campaigns_max_per_hour_chk
      CHECK (max_per_hour BETWEEN 1 AND 5000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='mailing_campaigns_batch_size_chk') THEN
    ALTER TABLE mailing_campaigns ADD CONSTRAINT mailing_campaigns_batch_size_chk
      CHECK (batch_size_per_tick BETWEEN 1 AND 50);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mailing_campaigns_status     ON mailing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_mailing_campaigns_created_at ON mailing_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mailing_campaigns_sending_active
  ON mailing_campaigns(status) WHERE status='sending' AND is_paused=FALSE;

ALTER TABLE mailing_campaigns ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────────────
-- 2) mailing_recipients · trazabilidad por destinatario
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mailing_recipients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    UUID NOT NULL REFERENCES mailing_campaigns(id) ON DELETE CASCADE,
  contact_id     UUID REFERENCES marketing_contacts(id) ON DELETE SET NULL,
  email          TEXT NOT NULL,
  nombre         TEXT,
  ciudad         TEXT,
  status         TEXT NOT NULL DEFAULT 'pending',
  message_id     TEXT,
  failed_reason  TEXT,
  sent_at        TIMESTAMPTZ,
  opened_at      TIMESTAMPTZ,
  clicked_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='mailing_recipients_status_chk') THEN
    ALTER TABLE mailing_recipients ADD CONSTRAINT mailing_recipients_status_chk
      CHECK (status IN ('pending','sent','failed','skipped_opt_out','skipped_no_email','bounced'));
  END IF;
END $$;

-- Deduplicación: misma campaña + mismo contacto = 1 sola fila.
CREATE UNIQUE INDEX IF NOT EXISTS idx_mailing_recipients_campaign_contact
  ON mailing_recipients(campaign_id, contact_id) WHERE contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mailing_recipients_status ON mailing_recipients(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_mailing_recipients_email  ON mailing_recipients(email);

CREATE OR REPLACE FUNCTION tg_mailing_recipients_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_updated_at ON mailing_recipients;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON mailing_recipients
  FOR EACH ROW EXECUTE FUNCTION tg_mailing_recipients_set_updated_at();

ALTER TABLE mailing_recipients ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────────────
-- 3) Vista de stats consolidadas (lo que consume el panel admin)
-- ──────────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS mailing_campaigns_stats;
CREATE VIEW mailing_campaigns_stats AS
SELECT c.id, c.slug, c.number, c.template_file, c.subject, c.description,
       c.status, c.is_paused, c.max_per_hour, c.batch_size_per_tick, c.audience_filter,
       c.total_recipients, c.sent_count, c.failed_count, c.skipped_count,
       c.generation_prompt, c.generation_reference_ids, c.last_tick_at, c.last_tick_note,
       c.created_at, c.started_at, c.completed_at, c.archived_at,
       (c.html_content IS NOT NULL AND length(c.html_content) > 0) AS has_html,
       COUNT(r.*)                                           AS recipients,
       COUNT(*) FILTER (WHERE r.status='pending')           AS pending,
       COUNT(*) FILTER (WHERE r.status='sent')              AS sent,
       COUNT(*) FILTER (WHERE r.status='failed')            AS failed,
       COUNT(*) FILTER (WHERE r.status='skipped_opt_out')   AS skipped_opt_out,
       COUNT(*) FILTER (WHERE r.status='skipped_no_email')  AS skipped_no_email,
       COUNT(*) FILTER (WHERE r.status='bounced')           AS bounced
FROM mailing_campaigns c
LEFT JOIN mailing_recipients r ON r.campaign_id = c.id
GROUP BY c.id;

COMMENT ON VIEW mailing_campaigns_stats IS
  'Vista consolidada de campañas + contadores por status de destinatario. '
  'Se lee siempre desde service_role; RLS-agnostic porque hace JOIN con tablas denegadas por RLS.';
