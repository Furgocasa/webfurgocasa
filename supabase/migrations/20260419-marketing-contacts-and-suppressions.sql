-- 20260419 · Sistema de mailing marketing · Fase 1/2
--
-- Crea las dos tablas "de dominio" del sistema de mailing:
--   · marketing_contacts  → destinatarios potenciales (clientes + newsletter + manual + leads)
--   · email_suppressions  → lista global de bajas (opt-out) por email
--
-- NOTA: todo lo que toque estas tablas debe hacerse desde service_role
-- (`createAdminClient()`). RLS deny-all para anon/auth.

-- ──────────────────────────────────────────────────────────────────────
-- 1) marketing_contacts · base de destinatarios
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS marketing_contacts (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                     TEXT NOT NULL,
  name                      TEXT,
  city                      TEXT,
  source                    TEXT NOT NULL DEFAULT 'manual',
  locale                    TEXT NOT NULL DEFAULT 'es',
  notes                     TEXT,

  -- Consentimiento y baja
  marketing_opt_in_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  marketing_opt_out_at      TIMESTAMPTZ,
  marketing_opt_out_token   UUID NOT NULL DEFAULT gen_random_uuid(),
  marketing_opt_out_reason  TEXT,

  -- Enlace opcional con cliente (si el contacto vino de una reserva)
  customer_id               UUID REFERENCES customers(id) ON DELETE SET NULL,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_contacts_source_chk') THEN
    ALTER TABLE marketing_contacts ADD CONSTRAINT marketing_contacts_source_chk
      CHECK (source IN ('customer','newsletter','manual','lead','import'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketing_contacts_locale_chk') THEN
    ALTER TABLE marketing_contacts ADD CONSTRAINT marketing_contacts_locale_chk
      CHECK (locale IN ('es','en','fr','de'));
  END IF;
END $$;

-- Email único (case-insensitive, trimmed)
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketing_contacts_email_lower
  ON marketing_contacts (LOWER(TRIM(email)));

CREATE UNIQUE INDEX IF NOT EXISTS idx_marketing_contacts_opt_out_token
  ON marketing_contacts (marketing_opt_out_token);

CREATE INDEX IF NOT EXISTS idx_marketing_contacts_source
  ON marketing_contacts (source);

CREATE INDEX IF NOT EXISTS idx_marketing_contacts_opt_out_at
  ON marketing_contacts (marketing_opt_out_at) WHERE marketing_opt_out_at IS NOT NULL;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION tg_marketing_contacts_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_updated_at ON marketing_contacts;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON marketing_contacts
  FOR EACH ROW EXECUTE FUNCTION tg_marketing_contacts_set_updated_at();

ALTER TABLE marketing_contacts ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE marketing_contacts IS
  'Destinatarios de marketing de Furgocasa (clientes, suscriptores de la web, leads, imports). '
  'Solo service_role puede leer/escribir. El flag marketing_opt_out_at bloquea el envío.';

-- ──────────────────────────────────────────────────────────────────────
-- 2) email_suppressions · lista global de bajas (independiente del contacto)
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_suppressions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL,
  reason      TEXT,
  source      TEXT        NOT NULL DEFAULT 'self',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='email_suppressions_source_chk') THEN
    ALTER TABLE email_suppressions ADD CONSTRAINT email_suppressions_source_chk
      CHECK (source IN ('self','admin','bounce','complaint'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_suppressions_email_lower
  ON email_suppressions (LOWER(TRIM(email)));

ALTER TABLE email_suppressions ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE email_suppressions IS
  'Lista global de emails dados de baja. El selector de destinatarios descarta cualquier '
  'marketing_contacts.email que aparezca aquí (LOWER/TRIM). Independiente de marketing_contacts '
  'para que una baja por formulario público funcione aunque el email NO esté en nuestra lista.';
