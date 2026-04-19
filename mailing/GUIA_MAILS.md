# GUIA_MAILS · Prompt maestro para replicar el sistema de mailing de Retiru

> ## ⚠️ ESTADO ACTUAL EN FURGOCASA
>
> **Este prompt YA SE HA EJECUTADO en Furgocasa** (abril 2026) y produjo el sistema de mailing marketing que hay actualmente integrado en la app. **No hay que volver a ejecutarlo.**
>
> Durante la ejecución se adaptaron nombres, dominios, tabla de destinatarios y placeholders a Furgocasa. Los archivos resultantes viven en:
>
> - `src/lib/mailing/` · librerías (transport, render, audience, send, auth, **context** [grounding IA], **footer**, **outlook-safe** [saneado HTML])
> - `src/app/api/admin/mailing/*` · rutas admin (campaigns CRUD + generate SSE + preview + send-test + populate-recipients + start/pause/resume/retry-failed/archive + recipients + **tick-now** [diagnóstico] + references + contacts-search + suppressions)
> - `src/app/api/cron/mailing-tick/route.ts` · cron cada minuto (con **lock atómico** `tick_lock_at` y watchdog de 5 min)
> - `src/app/api/unsubscribe/route.ts` · endpoint público RGPD (3 modos, bilingüe)
> - `src/app/administrator/(protected)/mails/*` · panel admin (4 pestañas + **botón "Forzar tick ahora"** para diagnóstico)
> - `supabase/migrations/20260419-*.sql` + `20260420-mailing-tick-lock.sql` (columna `tick_lock_at`) + **`20260421-mailing-tick-lock-rpc.sql`** (funciones `mailing_claim_campaign_tick` / `mailing_release_campaign_tick` para tomar/soltar el lock vía `rpc()` y evitar fallos REST de PostgREST sobre columnas nuevas).
> - Tablas `marketing_contacts`, `email_suppressions`, `mailing_campaigns` (+ `tick_lock_at`), `mailing_recipients` + vista `mailing_campaigns_stats`
>
> ### 📖 Para usar el sistema en Furgocasa, lee:
>
> **[`README-SISTEMA-MARKETING.md`](./README-SISTEMA-MARKETING.md)** — es la documentación operativa actualizada: variables de entorno, workflow admin, rate-limits, opt-out, security checklist.
>
> ### 🔁 Diferencias de Furgocasa respecto al prompt original (Retiru)
>
> - Tabla de destinatarios: **`marketing_contacts`** (nueva, no `centers`). Fuentes: `customer`, `newsletter`, `manual`, `lead`, `import`.
> - Audiencias: **`all` | `by_source`** (no `claimed / not_claimed`).
> - Rol admin: tabla **`admins(user_id, is_active)`**, no `user_roles`.
> - Placeholders: **`{{NOMBRE}}`, `{{CIUDAD}}`, `{{UNSUBSCRIBE_URL}}`** (sin `{{FIN_MEMBRESIA}}` ni `{{LOCATION}}`).
> - Color corporativo: **`#063971`** (azul Furgocasa).
> - Dominio: **`https://www.furgocasa.com`**. Remitente: **`reservas@furgocasa.com`**.
> - Imágenes en `public/images/mailing/` (iconos sociales) y `public/images/brand/` (logo).
> - Prefijo de migraciones por fecha: `supabase/migrations/YYYYMMDD-*.sql`.
> - **IA generadora:** selector en el panel con `gpt-4.1` (default) · `gpt-4o` · `gpt-5.4`. Configurable también vía `OPENAI_MAILING_MODEL`. El `SYSTEM_PROMPT` incluye "Manifiesto" (6 reglas de oro), grounding con `CONTEXTO_BD` (ofertas/posts/flota reales + precios pre-calculados en €), reglas de clicabilidad, formato europeo `1.111,11 €`, patrón Outlook-safe de tarjetas, presupuesto de densidad visual y auto-generación de `<!--FURGOCASA_DESCRIPTION-->` para el listado admin.
> - **Cron con lock atómico** (`tick_lock_at`): el tick llama a `mailing_claim_campaign_tick(uuid)` (RPC) que hace el UPDATE condicional en Postgres; al terminar, `mailing_release_campaign_tick(uuid)`. Watchdog 5 min. Requiere `20260420` + `20260421`.
> - **Botón "Forzar tick ahora"** en la pestaña Envío: dispara manualmente `runTickOnce()` bajo guard admin y muestra la respuesta cruda del servidor (summary + estado antes/después) para diagnosticar por qué una campaña no avanza sin tener que mirar los logs de Vercel.
>
> ### 💡 Para qué sirve ahora este archivo
>
> Se conserva como **prompt exportable**: si algún día se quiere replicar este sistema en otro proyecto (Acttax, Eskala, cliente nuevo, etc.), se puede copiar este documento y adaptar solo el bloque `STACK Y NOMBRES DEL PROYECTO DESTINO`. El contenido a partir de aquí está en español "Retiru" porque así nació; no tiene sentido reescribirlo a "Furgocasa" ya que rompería su utilidad como plantilla neutra.

---

> Este documento es un **prompt único y auto-contenido** que puedes copiar y pegar a otra IA (ChatGPT, Claude, Cursor agent, Gemini, etc.) para que reconstruya, en otro proyecto, EXACTAMENTE el mismo sistema de mailing masivo + unsubscribe RGPD + panel admin + cron que tenemos en Retiru.
>
> **Cómo usarlo para un proyecto NUEVO:**
>
> 1. Abre la IA que vayas a usar.
> 2. Adapta solo el bloque `STACK Y NOMBRES DEL PROYECTO DESTINO` (al principio de la sección "CONTEXTO") con los valores de tu nuevo proyecto.
> 3. Pega TODO el resto del documento tal cual.
> 4. Ejecuta paso por paso las 10 fases. La IA ya tiene las migraciones SQL completas, las firmas exactas de los módulos TypeScript y los prompts del sub-sistema de IA.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT PARA LA IA (copiar desde aquí)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ROL

Eres un/a ingeniero/a full-stack senior. Tu tarea es implementar, en el proyecto que te indico, un **sistema completo de mailing masivo B2B con CRM administrativo, envío gradual con rate-limit del SMTP, gestión de bajas RGPD y panel de administración**. Ya existe una implementación probada de referencia (la de Retiru). Debes reproducirla fielmente, adaptando solo nombres de dominio, rutas y campos de la tabla de destinatarios.

Trabaja en pasos numerados (fases 1 a 10). En cada paso: primero explica brevemente qué vas a hacer, luego entrega el código/SQL completo. No resumas, no dejes funciones a medias, no uses `// ...`.

## CONTEXTO

### Stack original (Retiru)

- **Framework:** Next.js App Router 15+ (TypeScript, Route Handlers).
- **DB/Backend:** Supabase (Postgres + RLS + service_role). Cliente admin bypassa RLS.
- **Deploy:** Vercel (Vercel Cron para el tick del mailing).
- **Envío:** SMTP (OVH Zimbra, ~200 correos/h por buzón), vía `nodemailer`.
- **IA:** OpenAI `gpt-4o-mini` para generar HTML de campañas a partir de referencias previas + briefing (SSE).
- **UI:** Tailwind + iconos `lucide-react`.

### STACK Y NOMBRES DEL PROYECTO DESTINO  ← RELLENA ESTO

```
Nombre de marca:            RETIRU
Dominio público:            https://www.retiru.com
Email remitente operativo:  contacto@retiru.com
Color corporativo:          #c85a30 (naranja terracota)
Tabla de destinatarios:     centers                     (contiene id, name, email, city, province, created_at, status)
Filtro "todos activos":     status='active'
Audiencias soportadas:      all | claimed | not_claimed  (claimed = tiene fila en center_claims status='approved')
Rol admin:                  tabla user_roles(user_id, role) con role='admin'
Prefijo de migraciones:     supabase/migrations/NNN_*.sql
Base de plantillas:         placeholders {{NOMBRE_CENTRO}}, {{LOCATION}}, {{FIN_MEMBRESIA}}, {{UNSUBSCRIBE_URL}}
```

> Cuando el proyecto destino tenga otra "entidad" (p. ej. `users`, `contacts`, `companies`), sustituye `centers` por esa tabla manteniendo los mismos 3 campos clave: un `id` UUID, un `email` TEXT y un `name`/`display_name`. Añade también `marketing_opt_out_at`, `marketing_opt_out_token UUID UNIQUE`, `marketing_opt_out_reason TEXT` a esa entidad.

### Principios innegociables

1. **Service-role only** para todo lo que toque `mailing_campaigns`, `mailing_recipients` y `email_suppressions`. RLS deny-all (`ENABLE ROW LEVEL SECURITY` sin policies para anon/auth).
2. **La verdad vive en BD.** Vercel no tiene filesystem persistente, así que el HTML de cada campaña se guarda en `mailing_campaigns.html_content`. La carpeta local `mailing/` es copia/backup, no fuente.
3. **Cron en micro-lotes.** Cada minuto, máximo `batch_size_per_tick` (default 3) por campaña activa, respetando `max_per_hour` contado desde la BD (no en memoria). ≈ 180/h por defecto.
4. **Doble check de opt-out** inmediatamente antes de enviar cada correo: (a) flag en el registro de la entidad (`centers.marketing_opt_out_at`), (b) lista global `email_suppressions` (LOWER/TRIM).
5. **Rate-limit del SMTP** detectado por heurística; al dispararse, **pausar la campaña** (`is_paused=true`) y anotar `last_tick_note`. El admin reanuda desde el panel cuando considere.
6. **RGPD:** `/api/unsubscribe` acepta token (one-click) Y email (formulario bilingüe ES/EN). La respuesta a la baja por email es **siempre genérica** ("si estaba en nuestra lista…"), para no revelar si el email existía.
7. **`List-Unsubscribe` + `List-Unsubscribe-Post: One-Click`** en TODAS las cabeceras de envío, para que Gmail y Outlook muestren el botón nativo "Darse de baja".
8. **Nunca mostrar al anon/auth** los contadores ni listados de campañas: todo pasa por `requireAdmin()`.

---

## FASE 1 · Migraciones SQL (tres archivos)

Crea los tres archivos tal cual. Aplícalos en orden en Supabase (SQL Editor).

### 1.1 `supabase/migrations/038_mailing_system.sql`

```sql
-- 038 · Sistema de envíos de mailings con trazabilidad y opt-out
--
-- Motivación: llevar control de cada oleada de mailing (plantilla HTML) y de
-- cada destinatario (centro). Registrar quién recibió qué, cuándo, con qué
-- estado, y permitir que un centro se dé de baja.

-- 1) Opt-out de marketing en la tabla de destinatarios (centers).
ALTER TABLE centers
  ADD COLUMN IF NOT EXISTS marketing_opt_out_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS marketing_opt_out_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS marketing_opt_out_reason TEXT;

UPDATE centers SET marketing_opt_out_token = gen_random_uuid()
 WHERE marketing_opt_out_token IS NULL;

ALTER TABLE centers ALTER COLUMN marketing_opt_out_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_centers_marketing_opt_out_token
  ON centers (marketing_opt_out_token);

CREATE INDEX IF NOT EXISTS idx_centers_marketing_opt_out_at
  ON centers (marketing_opt_out_at) WHERE marketing_opt_out_at IS NOT NULL;

-- 2) Campañas de mailing.
CREATE TABLE IF NOT EXISTS mailing_campaigns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,
  number           INTEGER,
  template_file    TEXT,                               -- opcional (queda null si se genera desde panel)
  subject          TEXT NOT NULL,
  description      TEXT,
  status           TEXT NOT NULL DEFAULT 'draft',       -- draft|sending|sent|archived
  audience_filter  JSONB DEFAULT '{}'::jsonb,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count       INTEGER NOT NULL DEFAULT 0,
  failed_count     INTEGER NOT NULL DEFAULT 0,
  skipped_count    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  archived_at      TIMESTAMPTZ
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='mailing_campaigns_status_chk') THEN
    ALTER TABLE mailing_campaigns ADD CONSTRAINT mailing_campaigns_status_chk
      CHECK (status IN ('draft','sending','sent','archived'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mailing_campaigns_status     ON mailing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_mailing_campaigns_created_at ON mailing_campaigns(created_at DESC);

-- 3) Destinatarios por campaña.
CREATE TABLE IF NOT EXISTS mailing_recipients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    UUID NOT NULL REFERENCES mailing_campaigns(id) ON DELETE CASCADE,
  center_id      UUID REFERENCES centers(id) ON DELETE SET NULL,
  email          TEXT NOT NULL,
  nombre_centro  TEXT,
  location       TEXT,
  fin_membresia  TEXT,
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

-- Deduplicación: misma campaña + mismo centro = 1 sola fila.
CREATE UNIQUE INDEX IF NOT EXISTS idx_mailing_recipients_campaign_center
  ON mailing_recipients(campaign_id, center_id) WHERE center_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mailing_recipients_status ON mailing_recipients(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_mailing_recipients_email  ON mailing_recipients(email);

CREATE OR REPLACE FUNCTION tg_mailing_recipients_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_updated_at ON mailing_recipients;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON mailing_recipients
  FOR EACH ROW EXECUTE FUNCTION tg_mailing_recipients_set_updated_at();

-- 4) RLS deny-all (solo service_role opera).
ALTER TABLE mailing_campaigns  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailing_recipients ENABLE ROW LEVEL SECURITY;

-- 5) Vista de stats (se rehace en la 039; la dejamos aquí como fallback).
CREATE OR REPLACE VIEW mailing_campaigns_stats AS
SELECT c.id, c.slug, c.number, c.template_file, c.subject, c.status,
       c.created_at, c.started_at, c.completed_at, c.archived_at,
       c.total_recipients,
       COUNT(r.*)                                         AS recipients,
       COUNT(*) FILTER (WHERE r.status='pending')         AS pending,
       COUNT(*) FILTER (WHERE r.status='sent')            AS sent,
       COUNT(*) FILTER (WHERE r.status='failed')          AS failed,
       COUNT(*) FILTER (WHERE r.status='skipped_opt_out') AS skipped_opt_out,
       COUNT(*) FILTER (WHERE r.status='skipped_no_email')AS skipped_no_email,
       COUNT(*) FILTER (WHERE r.status='bounced')         AS bounced
FROM mailing_campaigns c
LEFT JOIN mailing_recipients r ON r.campaign_id = c.id
GROUP BY c.id;
```

### 1.2 `supabase/migrations/039_mailing_campaigns_extended.sql`

```sql
-- 039 · Columnas para el CRM admin + rehacer vista (no se puede REPLACE con reordenado).

ALTER TABLE mailing_campaigns
  ADD COLUMN IF NOT EXISTS html_content             TEXT,
  ADD COLUMN IF NOT EXISTS is_paused                BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_per_hour             INTEGER NOT NULL DEFAULT 150,
  ADD COLUMN IF NOT EXISTS batch_size_per_tick      INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS generation_prompt        TEXT,
  ADD COLUMN IF NOT EXISTS generation_reference_ids UUID[],
  ADD COLUMN IF NOT EXISTS last_tick_at             TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_tick_note           TEXT;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='mailing_campaigns_max_per_hour_chk') THEN
    ALTER TABLE mailing_campaigns ADD CONSTRAINT mailing_campaigns_max_per_hour_chk
      CHECK (max_per_hour BETWEEN 1 AND 5000);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='mailing_campaigns_batch_size_chk') THEN
    ALTER TABLE mailing_campaigns ADD CONSTRAINT mailing_campaigns_batch_size_chk
      CHECK (batch_size_per_tick BETWEEN 1 AND 50);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mailing_campaigns_sending_active
  ON mailing_campaigns(status) WHERE status='sending' AND is_paused=FALSE;

DROP VIEW IF EXISTS mailing_campaigns_stats;
CREATE VIEW mailing_campaigns_stats AS
SELECT c.id, c.slug, c.number, c.template_file, c.subject, c.description,
       c.status, c.is_paused, c.max_per_hour, c.batch_size_per_tick, c.audience_filter,
       c.total_recipients, c.sent_count, c.failed_count, c.skipped_count,
       c.generation_prompt, c.generation_reference_ids, c.last_tick_at, c.last_tick_note,
       c.created_at, c.started_at, c.completed_at, c.archived_at,
       (c.html_content IS NOT NULL AND length(c.html_content) > 0) AS has_html,
       COUNT(r.*)                                         AS recipients,
       COUNT(*) FILTER (WHERE r.status='pending')         AS pending,
       COUNT(*) FILTER (WHERE r.status='sent')            AS sent,
       COUNT(*) FILTER (WHERE r.status='failed')          AS failed,
       COUNT(*) FILTER (WHERE r.status='skipped_opt_out') AS skipped_opt_out,
       COUNT(*) FILTER (WHERE r.status='skipped_no_email')AS skipped_no_email,
       COUNT(*) FILTER (WHERE r.status='bounced')         AS bounced
FROM mailing_campaigns c
LEFT JOIN mailing_recipients r ON r.campaign_id = c.id
GROUP BY c.id;
```

### 1.3 `supabase/migrations/041_email_suppressions.sql`

```sql
-- 041 · Lista global de bajas por email (independiente de centers).

CREATE TABLE IF NOT EXISTS email_suppressions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL,
  reason      TEXT,
  source      TEXT        NOT NULL DEFAULT 'self',  -- self|admin|bounce|complaint
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
  'Emails dados de baja de marketing. El selector de destinatarios descarta '
  'cualquier centers.email que aparezca aquí (LOWER/TRIM).';
```

---

## FASE 2 · Librería compartida en `src/lib/mailing/`

Son 5 módulos TypeScript. Usa `nodemailer` (dep: `npm i nodemailer` + `@types/nodemailer -D`).

### 2.1 `src/lib/mailing/transport.ts`

```ts
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export type SmtpConfig = {
  host: string; port: number; secure: boolean; user: string;
  fromEmail: string; fromName: string; from: string; strictTls: boolean;
};

export function loadSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST || '';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASSWORD || '';
  if (!host || !user || !pass) throw new Error('Faltan SMTP_HOST / SMTP_USER / SMTP_PASSWORD');
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = port === 465;
  const fromEmail = process.env.SMTP_FROM_EMAIL || user;
  const fromName  = process.env.SMTP_FROM_NAME  || 'Retiru';
  const strictTls = (process.env.SMTP_STRICT_TLS || '').toLowerCase() === 'true';
  return { host, port, secure, user, fromEmail, fromName, from: `${fromName} <${fromEmail}>`, strictTls };
}

export function buildTransport(cfg: SmtpConfig = loadSmtpConfig()): Transporter {
  const pass = process.env.SMTP_PASSWORD || '';
  return nodemailer.createTransport({
    host: cfg.host, port: cfg.port, secure: cfg.secure,
    auth: { user: cfg.user, pass },
    tls: cfg.strictTls ? undefined : { rejectUnauthorized: false },
  });
}

// Heurística común SMTP OVH / Postfix / Office.
export function looksLikeRateLimitError(msg: string): boolean {
  const m = (msg || '').toLowerCase();
  return m.includes('421') || m.includes('451 4.7') || m.includes('550 5.7')
      || m.includes('rate limit') || m.includes('too many')
      || m.includes('sending limit') || m.includes('quota')
      || m.includes('try again later');
}
```

### 2.2 `src/lib/mailing/render.ts`

```ts
const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'] as const;

export function formatFechaLargaEs(d: Date): string {
  return `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
}
export function defaultFinMembresia(from: Date = new Date()): string {
  const d = new Date(from); d.setMonth(d.getMonth()+6); return formatFechaLargaEs(d);
}
export function finMembresiaFromCenterCreatedAt(createdAt: string | Date | null | undefined): string | null {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  d.setMonth(d.getMonth()+6); return formatFechaLargaEs(d);
}

export type RenderVars = {
  NOMBRE_CENTRO?: string | null; LOCATION?: string | null;
  FIN_MEMBRESIA?: string | null; UNSUBSCRIBE_URL?: string | null;
  [key: string]: string | null | undefined;
};

export function renderTemplate(html: string, vars: RenderVars): string {
  let out = html;
  for (const [k,v] of Object.entries(vars)) out = out.split(`{{${k}}}`).join(v ?? '');
  return out;
}

export function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.retiru.com').replace(/\/$/,'');
}
export function unsubscribeUrlFor(token: string | null | undefined): string {
  return token ? `${baseUrl()}/api/unsubscribe?t=${token}` : `${baseUrl()}/api/unsubscribe`;
}
```

### 2.3 `src/lib/mailing/audience.ts`

Lógica: leer `centers` activos con email; descartar opt-out (por flag del centro o por `email_suppressions`); filtrar por audiencia; deduplicar por índice parcial; insertar en lotes de 500.

```ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { finMembresiaFromCenterCreatedAt } from './render';

export type AudienceType = 'all' | 'claimed' | 'not_claimed';
export type PopulateAudienceFilter = { audience?: AudienceType; test_emails?: string | null };
export type PopulateResult = {
  candidates: number; skippedOptOut: number; skippedAudience: number;
  skippedDuplicates: number; inserted: number; total: number;
};

export async function populateRecipients(
  sb: SupabaseClient, campaignId: string, filter: PopulateAudienceFilter
): Promise<PopulateResult> {
  const audience: AudienceType = filter.audience || 'all';
  const testEmails = filter.test_emails || null;
  const result: PopulateResult = { candidates:0, skippedOptOut:0, skippedAudience:0, skippedDuplicates:0, inserted:0, total:0 };

  type Cand = { campaign_id:string; center_id:string|null; email:string; nombre_centro:string|null; location:string|null; fin_membresia:string|null; status:'pending' };
  const recipients: Cand[] = [];

  if (testEmails) {
    for (const raw of testEmails.split(',')) {
      const email = raw.trim(); if (!email) continue;
      recipients.push({ campaign_id: campaignId, center_id:null, email, nombre_centro:'Test', location:'', fin_membresia:null, status:'pending' });
    }
  } else {
    const { data: centers, error } = await sb
      .from('centers')
      .select('id,name,email,city,province,created_at,marketing_opt_out_at')
      .eq('status','active').not('email','is',null).neq('email','');
    if (error) throw new Error(`Error cargando centros: ${error.message}`);

    let claimedIds: Set<string> | null = null;
    if (audience !== 'all') {
      const { data: claims } = await sb.from('center_claims').select('center_id').eq('status','approved');
      claimedIds = new Set((claims || []).map((c: { center_id: string }) => c.center_id));
    }

    const { data: suppressions } = await sb.from('email_suppressions').select('email');
    const suppressedSet = new Set(
      (suppressions || []).map((s: { email:string|null }) => (s.email||'').trim().toLowerCase()).filter(Boolean)
    );

    result.candidates = (centers || []).length;
    for (const c of (centers || []) as Array<{ id:string; name:string|null; email:string|null; city:string|null; province:string|null; created_at:string|null; marketing_opt_out_at:string|null }>) {
      if (c.marketing_opt_out_at) { result.skippedOptOut++; continue; }
      if (suppressedSet.has((c.email||'').trim().toLowerCase())) { result.skippedOptOut++; continue; }
      if (audience==='claimed' && !claimedIds!.has(c.id))     { result.skippedAudience++; continue; }
      if (audience==='not_claimed' && claimedIds!.has(c.id))  { result.skippedAudience++; continue; }
      if (!c.email) continue;
      recipients.push({
        campaign_id: campaignId, center_id: c.id, email: c.email,
        nombre_centro: c.name,
        location: [c.city, c.province].filter(Boolean).join(', ') || null,
        fin_membresia: finMembresiaFromCenterCreatedAt(c.created_at),
        status: 'pending',
      });
    }
  }

  if (recipients.length === 0) {
    const { count } = await sb.from('mailing_recipients').select('*',{ count:'exact', head:true })
      .eq('campaign_id',campaignId).eq('status','pending');
    result.total = count || 0; return result;
  }

  // Deduplicado manual (el índice parcial no sirve para ON CONFLICT).
  const { data: existing } = await sb.from('mailing_recipients').select('center_id,email').eq('campaign_id',campaignId);
  const byCenter = new Set((existing||[]).filter((r: { center_id:string|null }) => r.center_id).map((r: { center_id:string }) => r.center_id));
  const byEmail  = new Set((existing||[]).filter((r: { center_id:string|null }) => !r.center_id).map((r: { email:string }) => r.email));

  // Si re-cargamos solo test-emails, limpiamos los previos sin center_id.
  const withoutCenter = recipients.filter(r => !r.center_id);
  if (withoutCenter.length > 0) {
    await sb.from('mailing_recipients').delete().eq('campaign_id',campaignId).is('center_id',null);
    byEmail.clear();
  }

  const fresh = recipients.filter(r => r.center_id ? !byCenter.has(r.center_id) : !byEmail.has(r.email));
  result.skippedDuplicates = recipients.length - fresh.length;

  const CHUNK = 500;
  for (let i=0; i<fresh.length; i+=CHUNK) {
    const chunk = fresh.slice(i, i+CHUNK);
    const { error } = await sb.from('mailing_recipients').insert(chunk);
    if (error) throw new Error(`Error insertando lote ${Math.floor(i/CHUNK)+1}: ${error.message}`);
    result.inserted += chunk.length;
  }

  const { count } = await sb.from('mailing_recipients').select('*',{ count:'exact', head:true })
    .eq('campaign_id',campaignId).eq('status','pending');
  result.total = count || 0;

  await sb.from('mailing_campaigns').update({
    total_recipients: result.total,
    audience_filter: { audience, test_emails: testEmails },
  }).eq('id', campaignId);

  return result;
}
```

### 2.4 `src/lib/mailing/send.ts`

```ts
import type { Transporter } from 'nodemailer';
import type { SupabaseClient } from '@supabase/supabase-js';
import { looksLikeRateLimitError, loadSmtpConfig } from './transport';
import { renderTemplate, unsubscribeUrlFor } from './render';

export type CampaignForSend = { id:string; slug:string; subject:string; html_content:string };
export type RecipientForSend = {
  id:string; center_id:string|null; email:string;
  nombre_centro:string|null; location:string|null; fin_membresia:string|null;
};
export type SendResult =
  | { kind:'sent'; messageId:string|null }
  | { kind:'skipped_opt_out'; reason:string }
  | { kind:'failed'; reason:string; rateLimit:boolean }
  | { kind:'rate_limited'; reason:string };

export async function resolveCenterOptOut(sb: SupabaseClient, centerId: string | null) {
  if (!centerId) return { optedOut:false, token:null as string|null };
  const { data } = await sb.from('centers')
    .select('marketing_opt_out_token, marketing_opt_out_at')
    .eq('id', centerId).maybeSingle();
  if (!data) return { optedOut:false, token:null };
  return { optedOut: !!data.marketing_opt_out_at, token: data.marketing_opt_out_token || null };
}

export async function renderCampaignHtmlFor(
  sb: SupabaseClient,
  campaign: Pick<CampaignForSend,'html_content'>,
  r: Pick<RecipientForSend,'center_id'|'nombre_centro'|'location'|'fin_membresia'>
) {
  const { token } = await resolveCenterOptOut(sb, r.center_id);
  const unsubscribeUrl = unsubscribeUrlFor(token);
  const html = renderTemplate(campaign.html_content, {
    NOMBRE_CENTRO: r.nombre_centro || 'tu centro',
    LOCATION: r.location || 'tu zona',
    FIN_MEMBRESIA: r.fin_membresia || '',
    UNSUBSCRIBE_URL: unsubscribeUrl,
  });
  return { html, unsubscribeUrl };
}

export async function sendOneRecipient(
  sb: SupabaseClient, transport: Transporter,
  campaign: CampaignForSend, recipient: RecipientForSend
): Promise<SendResult> {
  // Seguridad 1/2: releer opt-out del centro justo antes de enviar.
  const { optedOut, token } = await resolveCenterOptOut(sb, recipient.center_id);
  if (optedOut) {
    await sb.from('mailing_recipients').update({
      status:'skipped_opt_out', failed_reason:'opt-out detectado antes de enviar',
    }).eq('id', recipient.id);
    return { kind:'skipped_opt_out', reason:'opt-out' };
  }

  // Seguridad 2/2: lista global por email.
  const cleanEmail = (recipient.email || '').trim().toLowerCase();
  if (cleanEmail) {
    const { data: suppression } = await sb.from('email_suppressions')
      .select('email').ilike('email', cleanEmail).limit(1).maybeSingle();
    if (suppression) {
      await sb.from('mailing_recipients').update({
        status:'skipped_opt_out', failed_reason:'email en email_suppressions',
      }).eq('id', recipient.id);
      return { kind:'skipped_opt_out', reason:'suppression' };
    }
  }

  const unsubscribeUrl = unsubscribeUrlFor(token);
  const html = renderTemplate(campaign.html_content, {
    NOMBRE_CENTRO: recipient.nombre_centro || 'tu centro',
    LOCATION: recipient.location || 'tu zona',
    FIN_MEMBRESIA: recipient.fin_membresia || '',
    UNSUBSCRIBE_URL: unsubscribeUrl,
  });

  const cfg = loadSmtpConfig();
  try {
    const info = await transport.sendMail({
      from: cfg.from, to: recipient.email, subject: campaign.subject, html,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:contacto@retiru.com?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
    await sb.from('mailing_recipients').update({
      status:'sent', sent_at: new Date().toISOString(),
      message_id: info.messageId || null, failed_reason:null,
    }).eq('id', recipient.id);
    return { kind:'sent', messageId: info.messageId || null };
  } catch (e) {
    const reason = String((e as Error)?.message || e).slice(0, 500);
    if (looksLikeRateLimitError(reason)) {
      // Deja la fila en pending → se reintentará cuando se reanude la campaña.
      return { kind:'rate_limited', reason };
    }
    await sb.from('mailing_recipients').update({ status:'failed', failed_reason:reason }).eq('id', recipient.id);
    return { kind:'failed', reason, rateLimit:false };
  }
}

export async function sendTestEmail(sb: SupabaseClient, transport: Transporter, opts:{
  to:string; subject:string; html_content:string;
  centerId?:string|null; nombreCentro?:string|null; location?:string|null; finMembresia?:string|null;
}) {
  const cfg = loadSmtpConfig();
  const { token } = await resolveCenterOptOut(sb, opts.centerId || null);
  const unsubscribeUrl = unsubscribeUrlFor(token);
  const html = renderTemplate(opts.html_content, {
    NOMBRE_CENTRO: opts.nombreCentro || 'tu centro',
    LOCATION: opts.location || 'tu zona',
    FIN_MEMBRESIA: opts.finMembresia || '',
    UNSUBSCRIBE_URL: unsubscribeUrl,
  });
  const info = await transport.sendMail({
    from: cfg.from, to: opts.to, subject: opts.subject, html,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:contacto@retiru.com?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
  return { messageId: info.messageId || null };
}
```

### 2.5 `src/lib/mailing/auth.ts` — guard admin

```ts
import { NextResponse } from 'next/server';
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AdminCtx = { userId:string; sb:SupabaseClient };
export type AdminGuardResult = { ok:true; ctx:AdminCtx } | { ok:false; response:NextResponse };

export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok:false, response: NextResponse.json({ error:'No autorizado' }, { status:401 }) };
  const { data: role } = await supabase.from('user_roles')
    .select('role').eq('user_id', user.id).eq('role','admin').maybeSingle();
  if (!role) return { ok:false, response: NextResponse.json({ error:'Solo administradores' }, { status:403 }) };
  return { ok:true, ctx: { userId: user.id, sb: createAdminSupabase() } };
}
```

---

## FASE 3 · API admin en `src/app/api/admin/mailing/`

Todos los handlers usan `requireAdmin()` y `guard.ctx.sb` (service_role).

| Método | Ruta | Qué hace |
|---|---|---|
| GET / POST | `campaigns/route.ts` | Listar (vista `mailing_campaigns_stats`) / crear borrador con subject + slug + description. Auto-numera (`MAX(number)+1`). |
| GET / PATCH / DELETE | `campaigns/[slug]/route.ts` | Detalle (campaign + stats) / editar (subject, description, max_per_hour, batch_size_per_tick, audience_filter, html_content) / borrar (solo `draft`). |
| POST | `campaigns/[slug]/generate/route.ts` | **SSE**: llamada a OpenAI `gpt-4o-mini` con `SYSTEM_PROMPT` (ver Fase 7) + briefing del admin + 1–2 campañas pasadas como referencia. Stream incremental de tokens. Al final: `UPDATE mailing_campaigns SET html_content=…, generation_prompt=…, generation_reference_ids=…`. |
| GET | `campaigns/[slug]/preview/route.ts` | Devuelve `html_content` ya renderizado con un destinatario ficticio (nombre="Yoga Sala Demo", location="Madrid") para iframe. |
| POST | `campaigns/[slug]/send-test/route.ts` | Body `{ to, centerId? }`. Usa `sendTestEmail`. No toca `mailing_recipients`. |
| POST | `campaigns/[slug]/populate-recipients/route.ts` | Body `{ audience: 'all'\|'claimed'\|'not_claimed', test_emails?: 'a@b.com,c@d.com' }` → llama `populateRecipients`. |
| POST | `campaigns/[slug]/start/route.ts` | Valida `html_content` y `pending > 0`; pone `status='sending', started_at=NOW(), is_paused=false`. |
| POST | `campaigns/[slug]/pause/route.ts` | `is_paused=true`. |
| POST | `campaigns/[slug]/resume/route.ts` | `is_paused=false` (si está en `draft` lo pasa a `sending`). |
| POST | `campaigns/[slug]/retry-failed/route.ts` | `UPDATE mailing_recipients SET status='pending', failed_reason=null WHERE status='failed' AND campaign_id=...`. |
| POST | `campaigns/[slug]/archive/route.ts` | `status='archived', archived_at=NOW()`. |
| GET | `campaigns/[slug]/recipients/route.ts` | Paginado `?status=&page=&pageSize=`. |
| GET | `references/route.ts` | Campañas con `has_html=true` ordenadas desc para el selector de referencias de la IA. |
| GET | `centers-search/route.ts` | `?q=` para el selector "quiero usar los datos de este centro en el preview / test". |
| GET / POST / DELETE | `suppressions/route.ts` | **Panel de bajas** (fase 3.b). |

### 3.a Ejemplo completo: `campaigns/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';

function slugify(s:string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
}

export async function GET() {
  const g = await requireAdmin(); if (!g.ok) return g.response;
  const { data, error } = await g.ctx.sb.from('mailing_campaigns_stats')
    .select('*').order('created_at',{ ascending:false });
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ campaigns: data || [] });
}

export async function POST(req: NextRequest) {
  const g = await requireAdmin(); if (!g.ok) return g.response;
  const body = await req.json().catch(() => ({}));
  const subject = (body.subject||'').trim();
  const description = (body.description||'').trim();
  let slug = (body.slug||'').trim();
  if (!subject) return NextResponse.json({ error:'El asunto es obligatorio' }, { status:400 });
  if (!slug) slug = slugify(subject);
  slug = slugify(slug);
  if (!slug) return NextResponse.json({ error:'Slug vacío' }, { status:400 });

  const { data: existing } = await g.ctx.sb.from('mailing_campaigns').select('id').eq('slug',slug).maybeSingle();
  if (existing) return NextResponse.json({ error:`Ya existe "${slug}"` }, { status:409 });

  const { data: maxRow } = await g.ctx.sb.from('mailing_campaigns')
    .select('number').order('number',{ ascending:false, nullsFirst:false }).limit(1).maybeSingle();
  const number = ((maxRow?.number as number|null) || 0) + 1;

  const { data, error } = await g.ctx.sb.from('mailing_campaigns').insert({
    slug, number, subject, description: description || null,
    template_file: null, status:'draft', audience_filter: {},
  }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ campaign: data }, { status:201 });
}
```

### 3.b `suppressions/route.ts` — panel de bajas

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/mailing/auth';

export const dynamic = 'force-dynamic';
function isValidEmail(s:string){ return !!s && s.length<=320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

export async function GET(req: NextRequest) {
  const g = await requireAdmin(); if (!g.ok) return g.response;
  const q = (new URL(req.url).searchParams.get('q') || '').trim().toLowerCase();
  let query = g.ctx.sb.from('email_suppressions')
    .select('id,email,reason,source,created_at').order('created_at',{ ascending:false }).limit(500);
  if (q) query = query.ilike('email', `%${q}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ suppressions: data || [] });
}

export async function POST(req: NextRequest) {
  const g = await requireAdmin(); if (!g.ok) return g.response;
  const body = await req.json().catch(() => ({}));
  const email = (body?.email || '').toString().trim().toLowerCase();
  const reason = body?.reason ? String(body.reason).slice(0,500) : null;
  if (!isValidEmail(email)) return NextResponse.json({ error:'Email no válido' }, { status:400 });

  const { data: dup } = await g.ctx.sb.from('email_suppressions').select('id').ilike('email',email).maybeSingle();
  if (dup) return NextResponse.json({ error:'Ya está en la lista' }, { status:409 });

  // También marcamos los centros con ese email como opt-out (coherencia).
  const { data: centers } = await g.ctx.sb.from('centers').select('id,marketing_opt_out_at').ilike('email',email);
  const ids = (centers||[]).filter(c => !c.marketing_opt_out_at).map(c => c.id);
  if (ids.length) await g.ctx.sb.from('centers').update({
    marketing_opt_out_at: new Date().toISOString(),
    marketing_opt_out_reason: reason || 'Añadido manualmente por admin',
  }).in('id', ids);

  const { data, error } = await g.ctx.sb.from('email_suppressions')
    .insert({ email, reason, source:'admin' })
    .select('id,email,reason,source,created_at').single();
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  return NextResponse.json({ suppression:data, centersMarkedOptOut: ids.length }, { status:201 });
}

export async function DELETE(req: NextRequest) {
  const g = await requireAdmin(); if (!g.ok) return g.response;
  let id = new URL(req.url).searchParams.get('id') || '';
  if (!id) { const b = await req.json().catch(()=>({})); id = b?.id || ''; }
  if (!id) return NextResponse.json({ error:'Falta id' }, { status:400 });

  // Solo quitamos de email_suppressions. No tocamos centers.marketing_opt_out_at:
  // el flag del centro puede venir de otras fuentes (bounce, admin manual, etc.).
  const { data, error } = await g.ctx.sb.from('email_suppressions')
    .delete().eq('id', id).select('id,email').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  if (!data) return NextResponse.json({ error:'No encontrada' }, { status:404 });
  return NextResponse.json({ ok:true, removed:data });
}
```

---

## FASE 4 · Cron en `src/app/api/cron/mailing-tick/route.ts`

Disparado cada minuto por Vercel Cron. Proceso: tomar campañas `status='sending' AND is_paused=false`, por cada una comprobar cupo horario (contar `sent` con `sent_at >= now()-1h`), enviar hasta `batch_size_per_tick` correos, pausar si `rate_limited`, marcar `sent` si no quedan `pending`.

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';
import { buildTransport, loadSmtpConfig } from '@/lib/mailing/transport';
import { sendOneRecipient, type CampaignForSend, type RecipientForSend } from '@/lib/mailing/send';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type CampaignRow = {
  id:string; slug:string; subject:string; html_content:string|null;
  status:string; is_paused:boolean;
  max_per_hour:number; batch_size_per_tick:number; started_at:string|null;
};

async function processCampaign(sb: ReturnType<typeof createAdminSupabase>, t: ReturnType<typeof buildTransport>, c: CampaignRow) {
  const res = { slug:c.slug, attempted:0, sent:0, failed:0, skipped:0, rateLimited:false, note:'' };

  if (!c.html_content) {
    res.note = 'sin html_content';
    await sb.from('mailing_campaigns').update({
      is_paused:true, last_tick_at:new Date().toISOString(),
      last_tick_note:'Pausada: sin html_content. Genera el HTML antes de continuar.',
    }).eq('id', c.id);
    return res;
  }

  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { count: used } = await sb.from('mailing_recipients')
    .select('*',{ count:'exact', head:true })
    .eq('campaign_id',c.id).eq('status','sent').gte('sent_at', oneHourAgo);
  const remaining = Math.max(0, c.max_per_hour - (used||0));
  if (remaining === 0) {
    res.note = `cupo horario lleno: ${used}/${c.max_per_hour}`;
    await sb.from('mailing_campaigns').update({
      last_tick_at:new Date().toISOString(),
      last_tick_note:`Tope horario (${used}/${c.max_per_hour}). Reanuda auto en próximos ticks.`,
    }).eq('id', c.id);
    return res;
  }

  const batchSize = Math.min(c.batch_size_per_tick, remaining);
  const { data: queue } = await sb.from('mailing_recipients')
    .select('id,center_id,email,nombre_centro,location,fin_membresia')
    .eq('campaign_id',c.id).eq('status','pending').order('created_at',{ ascending:true }).limit(batchSize);

  if (!queue || queue.length === 0) {
    const { count: pendingLeft } = await sb.from('mailing_recipients')
      .select('*',{ count:'exact', head:true }).eq('campaign_id',c.id).eq('status','pending');
    if ((pendingLeft||0) === 0) {
      await sb.from('mailing_campaigns').update({
        status:'sent', completed_at:new Date().toISOString(),
        last_tick_at:new Date().toISOString(), last_tick_note:'Campaña enviada (0 pending).',
      }).eq('id', c.id);
      res.note = 'enviada';
    } else res.note = 'sin pending ahora mismo';
    await recomputeCounters(sb, c.id); return res;
  }

  const forSend: CampaignForSend = { id:c.id, slug:c.slug, subject:c.subject, html_content:c.html_content };
  for (const row of queue as RecipientForSend[]) {
    res.attempted++;
    const out = await sendOneRecipient(sb, t, forSend, row);
    if (out.kind==='sent') res.sent++;
    else if (out.kind==='skipped_opt_out') res.skipped++;
    else if (out.kind==='failed') res.failed++;
    else if (out.kind==='rate_limited') {
      res.rateLimited = true;
      res.note = `rate-limit SMTP: ${out.reason.slice(0,160)}`;
      await sb.from('mailing_campaigns').update({
        is_paused:true, last_tick_at:new Date().toISOString(),
        last_tick_note:`Pausada por rate-limit: "${out.reason.slice(0,200)}". Reanuda manualmente tras ≥ 60 min.`,
      }).eq('id', c.id);
      break;
    }
  }

  await recomputeCounters(sb, c.id);
  if (!res.rateLimited) {
    res.note = `batch: ${res.sent} ok · ${res.failed} fail · ${res.skipped} skip · ${(used||0)+res.sent}/${c.max_per_hour} en la última hora`;
    await sb.from('mailing_campaigns').update({ last_tick_at:new Date().toISOString(), last_tick_note:res.note }).eq('id', c.id);
  }
  return res;
}

async function recomputeCounters(sb: ReturnType<typeof createAdminSupabase>, id: string) {
  const { data: rows } = await sb.from('mailing_recipients').select('status').eq('campaign_id', id);
  const n = (s:string) => (rows||[]).filter((r: { status:string }) => r.status === s).length;
  await sb.from('mailing_campaigns').update({
    sent_count: n('sent'), failed_count: n('failed'),
    skipped_count: n('skipped_opt_out') + n('skipped_no_email') + n('bounced'),
  }).eq('id', id);
}

async function handleTick(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  }
  try { loadSmtpConfig(); } catch (e) {
    return NextResponse.json({ error:(e as Error).message, hint:'Faltan SMTP_* en Vercel' }, { status:500 });
  }
  const sb = createAdminSupabase();
  const { data: campaigns, error } = await sb.from('mailing_campaigns')
    .select('id,slug,subject,html_content,status,is_paused,max_per_hour,batch_size_per_tick,started_at')
    .eq('status','sending').eq('is_paused',false).order('started_at',{ ascending:true });
  if (error) return NextResponse.json({ error: error.message }, { status:500 });
  if (!campaigns?.length) return NextResponse.json({ ok:true, active:0, results:[] });

  const t = buildTransport();
  const results = [];
  for (const c of campaigns as CampaignRow[]) {
    try { results.push(await processCampaign(sb, t, c)); }
    catch (e) {
      const msg = (e as Error).message || String(e);
      results.push({ slug:c.slug, attempted:0, sent:0, failed:0, skipped:0, rateLimited:false, note:`error: ${msg}` });
      await sb.from('mailing_campaigns').update({
        last_tick_at:new Date().toISOString(),
        last_tick_note:`Excepción en tick: ${msg.slice(0,200)}`,
      }).eq('id', c.id);
    }
  }
  return NextResponse.json({ ok:true, active: campaigns.length, results });
}

export async function GET(req: NextRequest) { return handleTick(req); }
export async function POST(req: NextRequest) { return handleTick(req); }
```

### 4.bis `vercel.json` — registrar el cron

```json
{
  "crons": [
    { "path": "/api/cron/mailing-tick", "schedule": "* * * * *" }
  ]
}
```

---

## FASE 5 · Endpoint público `/api/unsubscribe` (bilingüe + 3 modos)

**3 modos en un solo archivo `src/app/api/unsubscribe/route.ts`:**

1. `GET ?t=<token>` → busca `centers.marketing_opt_out_token=<token>`, marca `marketing_opt_out_at=NOW()`. Devuelve HTML de confirmación.
2. `POST` con token en la query (compatible con cabecera `List-Unsubscribe-Post: One-Click` de Gmail/Outlook) → mismo efecto.
3. `GET` sin token → formulario bilingüe (ES/EN, selección por `?lang=` o `Accept-Language`).
4. `POST` sin token + body `application/x-www-form-urlencoded` con `email` (+ opcional `reason`):
   - Marcar todos los `centers` con ese email como opt-out.
   - Insertar en `email_suppressions` (source='self'; ignorar `23505` si ya existía).
   - Respuesta **genérica** ("si estaba en nuestra lista…"): nunca confirmar/negar que el email existía.

**Copia este archivo completo** (nota: el `body` del `pageForm` y los textos I18N están en el código fuente de Retiru; para la versión completa, mira abajo el snippet exhaustivo o reproduce el mismo patrón):

> Ver archivo fuente de referencia: `src/app/api/unsubscribe/route.ts` del repo Retiru (incluye `BASE_STYLES`, `I18N` con todos los textos ES/EN, `pageForm`, `pageOk`, `pageError`, `applyTokenOptOut`, `applyEmailOptOut`, `readPostBody`). El prompt te proporciona esos bloques literalmente en el Anexo A al final de este documento.

**Puntos críticos a respetar:**

- `Content-Type: text/html; charset=utf-8` y `Cache-Control: no-store` en todas las respuestas HTML.
- Formulario `<form method="POST" action="/api/unsubscribe?lang=es" accept-charset="utf-8">`.
- Validación `^[^\s@]+@[^\s@]+\.[^\s@]+$` + longitud ≤ 320.
- Botón de cambio de idioma en la misma página (ES ↔ EN).
- En el éxito vía formulario, mostrar "**Si** este email estaba en nuestra lista, ya no recibirá…" (NO "ya lo hemos dado de baja"). GDPR-friendly.

---

## FASE 6 · Panel admin en `src/app/administrator/mails/`

Estructura:

```
src/app/administrator/mails/
├── page.tsx                       # Listado de campañas
├── CampaignsTable.tsx             # Client: tabla con sort por columna
├── nueva/page.tsx                 # Form "crear borrador"
├── [slug]/
│   ├── page.tsx                   # Server: carga campaña full
│   └── CampaignDetailClient.tsx   # Client: 4 pestañas
└── bajas/
    ├── page.tsx                   # Server: carga email_suppressions
    └── SuppressionsClient.tsx     # Client: búsqueda + alta manual + revertir
```

### 6.1 Listado `page.tsx`

- `createAdminSupabase().from('mailing_campaigns_stats').select('*').order('created_at', desc)`.
- En el header: dos botones — **"Bajas de marketing"** (secundario, enlaza a `/administrator/mails/bajas`) y **"+ Nueva campaña"** (primario terracota).
- Tabla con orden: `#`, `Campaña` (subject + slug + description), `Estado` (badge por status + "pausada" / "sin HTML"), `Progreso` (barra `sent / total`), `Creada`, `Enviada` (completed_at o started_at), `Acciones`.

### 6.2 Detalle `[slug]/CampaignDetailClient.tsx` — 4 pestañas

1. **Contenido:** botón "Generar con IA" → abre modal con `<textarea>` (briefing) + checkboxes de hasta 2 referencias previas. Dispara `POST /generate` y muestra SSE logs en una consola ASCII. Al terminar, renderiza el HTML en `<iframe srcDoc={html}>`. Permite pegar HTML manual.
2. **Preview:** selector de centro (`/api/admin/mailing/centers-search`) + iframe con `/preview` renderizado con datos reales + botón **"Enviar test a…"**.
3. **Audiencia:** radio `all / claimed / not_claimed` + input para `test_emails` + botón "Cargar destinatarios". Resumen: `candidates · skippedOptOut · skippedAudience · inserted · total pending`.
4. **Envío:** `Play` / `Pausa` / `Reanudar` / `Reintentar fallidos` / `Archivar`. Config inline de `max_per_hour` y `batch_size_per_tick`. Listado paginado de destinatarios filtrable por status. Muestra `last_tick_at` y `last_tick_note` en vivo (polling cada 5-10 s mientras status=`sending`).

### 6.3 Bajas `bajas/page.tsx` + `SuppressionsClient.tsx`

- Formulario "añadir baja manual" (email + reason) → `POST /api/admin/mailing/suppressions` (marca `source='admin'` y opt-out los centros con ese email).
- Tabla: email, origen (badge `Usuario`/`Admin`/`Rebote`/`Queja`), motivo, fecha, acción **"Quitar baja"** (confirmación + `DELETE ?id=`).
- Búsqueda en memoria por email o motivo.
- Aclarar en el `window.confirm`: "Al revertir, el email podrá volver a recibir mails. NO se limpia automáticamente el flag de los centros".

---

## FASE 7 · Prompts de la IA generadora de HTML

En `POST /api/admin/mailing/campaigns/[slug]/generate` se llama a OpenAI `gpt-4o-mini` vía streaming. Usa exactamente este `SYSTEM_PROMPT`:

```
Eres la Inteligencia Artificial editora de mailings de Retiru (plataforma de retiros y bienestar en España).
Tu tarea: generar el HTML COMPLETO de un email de marketing para los centros de la plataforma, basándote en los ejemplos de estilo que se te proporcionen y en el briefing que describe la campaña.

REGLA DE ORO: NO resumas, NO entregues una versión "mini". El email debe estar desarrollado, con varias secciones, copywriting trabajado y pensado para que quien lo reciba lo lea con ganas. Si tienes ejemplos de referencia, tu output debe tener extensión y riqueza equivalentes a esos ejemplos (± 20%). Prefiere pasarte que quedarte corto.

ESTRUCTURA MÍNIMA OBLIGATORIA (en este orden):
1. Preheader oculto (hidden preview text, 80-120 caracteres).
2. Cabecera con el logo principal.
3. Hero: titular serif largo + subtítulo empático de 1-2 frases.
4. Saludo personalizado con {{NOMBRE_CENTRO}} y/o {{LOCATION}}.
5. Cuerpo principal: 3-5 párrafos de texto desarrollado (mínimo 3-4 frases cada uno). Empática, cercana, en segunda persona del singular.
6. Al menos UN bloque destacado (caja de color, tipo "Lo que Retiru hace por ti"): sub-sección con 3-5 ítems en lista/checklist, cada ítem con icono/emoji y 1 frase de desarrollo.
7. CTA principal: botón grande con href absoluto a https://www.retiru.com/... (según briefing). 1-2 frases de contexto debajo.
8. Sección secundaria (p. ej. "Por qué Retiru", "Cómo funciona", "Testimonio", "Qué incluye tu membresía"): otro bloque con 2-3 puntos más.
9. Cierre cálido firmado por "El equipo de Retiru".
10. Footer: logo transparente, redes sociales como imágenes, enlace de baja con {{UNSUBSCRIBE_URL}}, dirección postal y copyright.

REQUISITOS TÉCNICOS OBLIGATORIOS DEL HTML:
1. <!doctype html>, estructura con tablas (no flex/grid), CSS inline.
2. Ancho máximo 600px. Responsive: móvil apilado.
3. UTF-8. <meta charset="utf-8">, <meta name="viewport">, <meta name="color-scheme" content="light dark">.
4. Paleta coherente con los ejemplos (tierra / crema / terracota / sage). Titulares serif.
5. Cabecera con logo: <img src="https://www.retiru.com/Logo_retiru.png" alt="Retiru" width="140" style="display:block;max-width:140px;height:auto;">.
6. Footer con logo transparente: <img src="https://www.retiru.com/Logo_retiru_transparente.png" alt="Retiru" width="120" style="display:block;max-width:120px;height:auto;">.
7. Enlace de baja con EXACTAMENTE el placeholder {{UNSUBSCRIBE_URL}}: <a href="{{UNSUBSCRIBE_URL}}">Darme de baja</a>.
8. Iconos redes como <img> (no texto, no SVG inline), EXACTAMENTE estas URLs:
   Instagram → https://www.retiru.com/email/instagram.png  (28x28)
   Facebook  → https://www.retiru.com/email/facebook.png   (28x28)
   style="display:block;border:0;width:28px;height:28px;" envueltos en celdas de tabla con padding.
9. Placeholders dinámicos — EXACTAMENTE estos literales:
   {{NOMBRE_CENTRO}}  · nombre del centro destinatario
   {{LOCATION}}       · "Ciudad, Provincia"
   {{FIN_MEMBRESIA}}  · fecha en "DD de mes de AAAA" (solo si el briefing lo menciona)
   {{UNSUBSCRIBE_URL}}· URL de baja
10. Todos los href de www.retiru.com en https absoluto.
11. NO incluyas explicaciones, comentarios de JSON ni markdown. Devuelve SOLO el HTML.
12. Longitud mínima 400 líneas si no hay referencias. Con referencias, iguala su extensión (±20%).

TONO: cercano, empático, profesional. Español de España. Evita anglicismos. Tuteo a los centros (profesionales del bienestar). Debe sonar a persona escribiendo, no a plantilla.

Si los ejemplos incluyen componentes (cajas destacadas, checklist, "regalo", CTA, cita, testimonio), REUSA esos componentes adaptando el contenido: no los omitas para "ahorrar".
```

**User prompt** (ejemplo del template que construye el endpoint al llamar a OpenAI):

```
Briefing del admin:
"""
<briefing pegado por el admin en el modal>
"""

Campañas de referencia (úsalas como estilo, extensión y estructura):

--- Referencia 1 ---
Subject: {reference1.subject}
Descripción: {reference1.description}
HTML:
{reference1.html_content}

--- Referencia 2 ---
(idéntico formato si el admin seleccionó 2)

Genera AHORA el HTML completo de la nueva campaña respetando todas las reglas del sistema. Devuelve SOLO el HTML sin comentarios.
```

---

## FASE 8 · Plantillas de email (convenciones)

Las HTML generadas (o manuales) deben cumplir:

- **Layout con tablas anidadas**, ancho base 600 px, `@media (max-width:600px)` para apilar en móvil.
- **Estilos inline** en cada etiqueta. Nada crítico en `<style>` (Gmail limpia estilos en `<style>` en algunos casos).
- **Bloques condicionales MSO** para Outlook Desktop:
  ```html
  <!--[if mso]><table role="presentation" width="600" ...><![endif]-->
  ```
- **Imágenes PNG** servidas desde el dominio público (nunca SVG en `<img>`). `alt` siempre presente.
- **CTA como `<a>` con background** sólido (nunca una imagen sola), por si el cliente bloquea imágenes.
- **Placeholders** solo los 4 aprobados (`{{NOMBRE_CENTRO}}`, `{{LOCATION}}`, `{{FIN_MEMBRESIA}}`, `{{UNSUBSCRIBE_URL}}`). Cualquier otro debe sustituirse en código antes de render.
- **Links absolutos `https://`** a dominios del proyecto (nunca `localhost`, nunca relativos).

Transaccionales (confirmaciones, avisos operativos) van **sin** enlace de baja (no son marketing). Solo marketing lo incluye.

---

## FASE 9 · Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sitio
NEXT_PUBLIC_SITE_URL=https://www.retiru.com

# SMTP (OVH Zimbra típico)
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=contacto@retiru.com
SMTP_PASSWORD=
SMTP_FROM_EMAIL=contacto@retiru.com     # opcional
SMTP_FROM_NAME=Retiru                   # opcional
SMTP_STRICT_TLS=false                   # 'true' si la red tiene proxy AV

# Cron auth
CRON_SECRET=

# OpenAI (solo si usas IA generadora)
OPENAI_API_KEY=
```

---

## FASE 10 · Documentación y pruebas

### 10.1 En `README.md` del proyecto, añadir secciones:

- **Mailing marketing**: descripción del flujo admin, campañas, cron, rate-limit, enlace a `mailing/GUIA_MAILS.md`.
- **Bajas (unsubscribe, RGPD)**: explicar los 3 modos y la tabla `email_suppressions`; mencionar el panel `/administrator/mails/bajas`.

### 10.2 En `docs/ROUTES.md` registrar:

- `/administrator/mails`, `/administrator/mails/nueva`, `/administrator/mails/[slug]`, `/administrator/mails/bajas`.
- `/api/unsubscribe` (GET/POST, con y sin token).
- Todos los endpoints bajo `/api/admin/mailing/*`.
- `/api/cron/mailing-tick` (indicar schedule `* * * * *` y header `Authorization: Bearer CRON_SECRET`).

### 10.3 Checklist final de pruebas manuales

- [ ] Migraciones 038, 039, 041 aplicadas sin errores.
- [ ] `/administrator/mails` carga el listado (vacío inicialmente).
- [ ] Crear borrador desde `/nueva` → redirige al detalle.
- [ ] Generar HTML con IA → SSE fluye → campo `html_content` queda poblado.
- [ ] Preview con datos reales en iframe.
- [ ] Enviar test → llega al inbox con logo e iconos correctamente.
- [ ] Popular audiencia `claimed` y `not_claimed` → contadores coherentes.
- [ ] Play → status pasa a `sending` → cron envía 3 mails cada minuto.
- [ ] Pausar → el siguiente tick no envía nada.
- [ ] Simular rate-limit devolviendo 421 en nodemailer fake → campaña queda pausada con `last_tick_note` explicativo.
- [ ] `GET /api/unsubscribe?t=<token>` → página de éxito + `marketing_opt_out_at` rellenado.
- [ ] `GET /api/unsubscribe` → formulario ES. `?lang=en` → EN.
- [ ] `POST /api/unsubscribe` con email no registrado → respuesta genérica de éxito, pero se inserta en `email_suppressions`.
- [ ] `POST /api/unsubscribe` con email registrado → marca centros opt-out + suppression.
- [ ] Panel `/administrator/mails/bajas`: busca, añade manual, revierte.
- [ ] Enviar una nueva campaña: los emails de `email_suppressions` **no** aparecen en `mailing_recipients` (skippedOptOut+1).
- [ ] Header `List-Unsubscribe-Post` funciona en Gmail (icono nativo "Darse de baja").

---

## ANEXO A · Código íntegro de `/api/unsubscribe/route.ts` (Retiru)

> Pégalo tal cual; no hay nada sensible. Ajusta dominio, color y email en `BASE_STYLES` / `I18N` si cambian de marca.

```ts
import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
type Locale = 'es' | 'en';

function pickLocale(req: Request, fromQuery?: string | null): Locale {
  const q = (fromQuery || '').toLowerCase();
  if (q === 'en') return 'en'; if (q === 'es') return 'es';
  const accept = (req.headers.get('accept-language') || '').toLowerCase();
  return accept.startsWith('en') ? 'en' : 'es';
}
function htmlResponse(body: string, status = 200): NextResponse {
  return new NextResponse(body, { status, headers: { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' } });
}

const BASE_STYLES = `
  body { margin:0; font-family:system-ui,Arial,sans-serif; background:#f7f7f7; color:#222; }
  main { max-width:560px; margin:80px auto; padding:40px 32px; background:#fff; border-radius:16px; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
  main.center { text-align:center; } img.logo { max-width:140px; margin-bottom:24px; }
  h1 { font-family:Georgia,serif; font-size:26px; margin:0 0 12px; text-align:center; }
  p  { color:#555; line-height:1.6; font-size:15px; } a { color:#c85a30; }
  label { display:block; font-size:14px; color:#333; margin:18px 0 6px; font-weight:500; }
  input[type=email], textarea { width:100%; box-sizing:border-box; padding:12px 14px; border:1px solid #d8d8d8; border-radius:10px; font-size:15px; font-family:inherit; }
  input[type=email]:focus, textarea:focus { outline:none; border-color:#c85a30; box-shadow:0 0 0 3px rgba(200,90,48,0.15); }
  textarea { min-height:84px; resize:vertical; }
  button { margin-top:24px; width:100%; padding:14px 18px; border:none; cursor:pointer; background:#c85a30; color:#fff; border-radius:12px; font-size:15px; font-weight:600; }
  button:hover { background:#a94a26; }
  .lang { text-align:center; margin-top:24px; font-size:13px; color:#888; }
  .note { margin-top:24px; font-size:13px; color:#888; text-align:center; }
`;

const I18N = {
  es: {
    formTitle:'Darse de baja de los correos de Retiru',
    formIntro:'Introduce el email con el que recibes nuestras comunicaciones y pulsa el botón para dejar de recibir correos comerciales de Retiru.',
    emailLabel:'Email', reasonLabel:'Motivo (opcional)',
    reasonPlaceholder:'Cuéntanos brevemente por qué te das de baja',
    submit:'Darme de baja', emailError:'Introduce un email válido.',
    okTitle:'Listo, te hemos dado de baja',
    okByCenter:(n:string)=>`No volveremos a enviar comunicaciones comerciales a <strong>${n}</strong>.`,
    okByEmail:(e:string)=>`Si <strong>${e}</strong> figuraba en nuestra lista, ya no recibirá más correos comerciales de Retiru.`,
    okFallback:'No volveremos a enviarte comunicaciones comerciales.',
    okTail:'Los correos imprescindibles sobre reservas, pagos o gestión seguirán llegando, porque son necesarios para usar el servicio.',
    okContact:(e:string)=>`¿Te has dado de baja sin querer? Escríbenos a <a href="mailto:${e}">${e}</a> y lo revertimos.`,
    errorTitle:'Enlace no válido',
    errorBody:'Este enlace de baja no es correcto o ha caducado. Si quieres dejar de recibir nuestros mails, escríbenos a <a href="mailto:contacto@retiru.com">contacto@retiru.com</a> y lo hacemos manualmente.',
    langSwitch:'English',
  },
  en: {
    formTitle:'Unsubscribe from Retiru emails',
    formIntro:'Enter the email address you receive our communications on and click the button to stop receiving marketing emails from Retiru.',
    emailLabel:'Email', reasonLabel:'Reason (optional)',
    reasonPlaceholder:'Briefly tell us why you are unsubscribing',
    submit:'Unsubscribe', emailError:'Please enter a valid email address.',
    okTitle:'You have been unsubscribed',
    okByCenter:(n:string)=>`We will no longer send marketing emails to <strong>${n}</strong>.`,
    okByEmail:(e:string)=>`If <strong>${e}</strong> was on our list, it will no longer receive marketing emails from Retiru.`,
    okFallback:'We will no longer send you marketing communications.',
    okTail:'Essential emails about bookings, payments or account management will keep arriving, as they are required to use the service.',
    okContact:(e:string)=>`Did you unsubscribe by mistake? Write to <a href="mailto:${e}">${e}</a> and we will revert it.`,
    errorTitle:'Invalid link',
    errorBody:'This unsubscribe link is not valid or has expired. If you want to stop receiving our emails, write to <a href="mailto:contacto@retiru.com">contacto@retiru.com</a> and we will handle it manually.',
    langSwitch:'Español',
  },
} as const;

function pageForm(loc: Locale, opts?: { email?: string; error?: string }): string {
  const i = I18N[loc]; const other: Locale = loc==='es'?'en':'es';
  const otherLabel = I18N[other].langSwitch;
  const email = (opts?.email || '').replace(/"/g,'&quot;');
  const err = opts?.error ? `<p style="color:#b54124;margin:0 0 12px;font-size:14px;">${opts.error}</p>` : '';
  return `<!doctype html>
<html lang="${loc}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${i.formTitle} · Retiru</title><style>${BASE_STYLES}</style></head><body><main>
<div style="text-align:center"><img class="logo" src="/Logo_retiru.png" alt="Retiru"/></div>
<h1>${i.formTitle}</h1><p style="text-align:center">${i.formIntro}</p>${err}
<form method="POST" action="/api/unsubscribe?lang=${loc}" accept-charset="utf-8">
  <label for="email">${i.emailLabel}</label>
  <input type="email" id="email" name="email" required value="${email}" autocomplete="email"/>
  <label for="reason">${i.reasonLabel}</label>
  <textarea id="reason" name="reason" placeholder="${i.reasonPlaceholder}" maxlength="500"></textarea>
  <button type="submit">${i.submit}</button>
</form>
<p class="lang"><a href="/api/unsubscribe?lang=${other}">${otherLabel}</a></p>
</main></body></html>`;
}
function pageOk(loc: Locale, opts:{ centerName?: string|null; email?: string|null }): string {
  const i = I18N[loc]; const other: Locale = loc==='es'?'en':'es';
  const main = opts.centerName ? i.okByCenter(opts.centerName) : opts.email ? i.okByEmail(opts.email) : i.okFallback;
  return `<!doctype html>
<html lang="${loc}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${i.okTitle} · Retiru</title><style>${BASE_STYLES}</style></head><body><main class="center">
<img class="logo" src="/Logo_retiru.png" alt="Retiru"/><h1>${i.okTitle}</h1>
<p>${main}</p><p>${i.okTail}</p>
<p class="note">${i.okContact('contacto@retiru.com')}</p>
<p class="lang"><a href="/api/unsubscribe?lang=${other}">${I18N[other].langSwitch}</a></p>
</main></body></html>`;
}
function pageError(loc: Locale): string {
  const i = I18N[loc];
  return `<!doctype html>
<html lang="${loc}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${i.errorTitle} · Retiru</title><style>${BASE_STYLES}</style></head><body><main class="center">
<h1>${i.errorTitle}</h1><p>${i.errorBody}</p></main></body></html>`;
}
function isValidEmail(s:string){ return !!s && s.length<=320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

async function applyTokenOptOut(token: string, reason: string | null) {
  const sb = createAdminSupabase();
  const { data: center } = await sb.from('centers')
    .select('id,name,marketing_opt_out_at').eq('marketing_opt_out_token',token).maybeSingle();
  if (!center) return { ok:false as const };
  if (!center.marketing_opt_out_at) {
    await sb.from('centers').update({
      marketing_opt_out_at:new Date().toISOString(), marketing_opt_out_reason: reason || null,
    }).eq('id', center.id);
  }
  return { ok:true as const, center };
}

async function applyEmailOptOut(emailRaw: string, reason: string | null) {
  const email = emailRaw.trim().toLowerCase();
  const sb = createAdminSupabase();
  const { data: centers } = await sb.from('centers').select('id,marketing_opt_out_at').ilike('email',email);
  type R = { id:string; marketing_opt_out_at:string|null };
  const ids = ((centers ?? []) as R[]).filter(c=>!c.marketing_opt_out_at).map(c=>c.id);
  if (ids.length) await sb.from('centers').update({
    marketing_opt_out_at:new Date().toISOString(), marketing_opt_out_reason: reason || null,
  }).in('id', ids);
  try {
    const { error } = await sb.from('email_suppressions').insert({ email, reason: reason || null, source:'self' });
    if (error && error.code !== '23505') console.error('suppressions insert failed', error);
  } catch (e) { console.error('suppressions unexpected', e); }
}

async function readPostBody(req: Request): Promise<URLSearchParams> {
  const ct = (req.headers.get('content-type') || '').toLowerCase();
  if (ct.includes('application/x-www-form-urlencoded')) return new URLSearchParams(await req.text());
  if (ct.includes('multipart/form-data')) {
    const fd = await req.formData(); const p = new URLSearchParams();
    for (const [k,v] of fd.entries()) if (typeof v === 'string') p.append(k,v);
    return p;
  }
  if (ct.includes('application/json')) {
    const b = (await req.json().catch(()=>({}))) as Record<string,unknown>;
    const p = new URLSearchParams();
    for (const [k,v] of Object.entries(b)) if (typeof v === 'string') p.append(k,v);
    return p;
  }
  return new URLSearchParams(await req.text().catch(()=> ''));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('t') || url.searchParams.get('token');
  const reason = (url.searchParams.get('reason') || '').slice(0,500);
  const loc = pickLocale(req, url.searchParams.get('lang'));
  if (token) {
    const r = await applyTokenOptOut(token, reason || null);
    if (!r.ok) return htmlResponse(pageError(loc), 404);
    return htmlResponse(pageOk(loc, { centerName: r.center.name || null, email: null }));
  }
  return htmlResponse(pageForm(loc));
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const loc = pickLocale(req, url.searchParams.get('lang'));
  const token = url.searchParams.get('t') || url.searchParams.get('token');
  if (token) {
    const reason = (url.searchParams.get('reason') || '').slice(0,500);
    const r = await applyTokenOptOut(token, reason || null);
    if (!r.ok) return htmlResponse(pageError(loc), 404);
    return htmlResponse(pageOk(loc, { centerName: r.center.name || null, email: null }));
  }
  const body = await readPostBody(req);
  const email = (body.get('email') || '').trim();
  const reason = (body.get('reason') || '').slice(0,500);
  if (!isValidEmail(email)) return htmlResponse(pageForm(loc, { email, error: I18N[loc].emailError }), 400);
  await applyEmailOptOut(email, reason || null);
  // Respuesta genérica (GDPR-safe).
  return htmlResponse(pageOk(loc, { centerName: null, email }));
}
```

---

## ANEXO B · Mapa mental del flujo completo

```
 ┌─ Admin crea borrador ──► /administrator/mails/nueva ──► POST /api/admin/mailing/campaigns
 │
 │   [Contenido]   POST .../generate       ──► OpenAI SSE ──► UPDATE mailing_campaigns.html_content
 │   [Preview]     GET  .../preview        ──► render con datos reales (iframe)
 │   [Preview]     POST .../send-test      ──► sendTestEmail (no toca recipients)
 │   [Audiencia]   POST .../populate-recipients ──► populateRecipients() ──► mailing_recipients (pending)
 │   [Envío]       POST .../start          ──► status='sending', started_at=NOW(), is_paused=false
 │
 └─► cron cada minuto (vercel.json "* * * * *")
     GET /api/cron/mailing-tick
     ├─ Campañas status='sending' AND is_paused=false
     ├─ Para cada una:
     │   · ¿cupo horario? (count sent last 60min >= max_per_hour ? skip)
     │   · toma batch_size_per_tick pending
     │   · para cada recipient:
     │       - doble check opt-out (centers + email_suppressions)
     │       - render placeholders
     │       - nodemailer.sendMail con List-Unsubscribe(-Post)
     │       - resultado → UPDATE mailing_recipients
     │       - si rate-limit → PAUSAR campaña, break
     │   · recalcular sent/failed/skipped_count
     │   · si pending==0 → status='sent', completed_at=NOW()
     │
 ┌── Usuario recibe el mail
 │
 ├─► hace clic en botón nativo "Darse de baja"   ──► POST /api/unsubscribe?t=<token>   (one-click)
 ├─► hace clic en "Darme de baja" del footer     ──► GET  /api/unsubscribe?t=<token>
 │     · UPDATE centers SET marketing_opt_out_at=NOW()
 │     · insert en email_suppressions (source='self')
 │
 └─► entra a /api/unsubscribe sin token  ──► formulario ES/EN  ──► POST con email
       · UPDATE centers ILIKE email
       · INSERT INTO email_suppressions (email, source='self')  [23505 OK]

 Admin revisa bajas
   /administrator/mails/bajas
   ├─ listado con busqueda
   ├─ POST /api/admin/mailing/suppressions   (alta manual, source='admin')
   └─ DELETE /api/admin/mailing/suppressions?id=<uuid>  (revertir)
```

---

## ANEXO C · Errores típicos y cómo los resolvimos

1. **"Email sale sin logo ni iconos"** → asegurarse de que las imágenes están servidas en `public/` del deploy y con URL absoluta `https://<dominio>/...`, nunca relativa.
2. **"Outlook rompe el botón"** → envolver el `<a>` CTA con `<!--[if mso]><v:roundrect>...</v:roundrect><![endif]-->` (MSO VML). La IA lo incluye si se lo recuerdas en el system prompt.
3. **"Gmail no muestra botón Darse de baja"** → faltaba `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (la cabecera sola con `List-Unsubscribe: <mailto:>` no basta).
4. **"OVH me corta los envíos a mitad"** → subir `batch_size_per_tick` a 3 y `max_per_hour` a 150–180. Nunca pasar de 200 por buzón.
5. **"El cron da 401"** → configurar `CRON_SECRET` en Vercel y, en Vercel Cron, ir a Settings > Cron Jobs y pegarlo como header.
6. **"RLS me impide leer mailing_campaigns desde el panel"** → las route handlers deben usar `createAdminSupabase()` (service_role), nunca el cliente normal de Supabase.
7. **"ON CONFLICT no me funciona en mailing_recipients"** → el índice único es **parcial** (`WHERE center_id IS NOT NULL`). No sirve para `ON CONFLICT`. Dedupe manual en `populateRecipients`.
8. **"El admin se está mensajeando a sí mismo en el chat de soporte"** → ocultar el widget público para usuarios con role='admin'. (Fuera de scope de este prompt, pero es el patrón general: rol al shell, render condicional.)
9. **"column tick_lock_at does not exist" en REST pero el SELECT en SQL Editor sí la ve** → PostgREST desfasado o bug de capa REST: aplicar `20260421-mailing-tick-lock-rpc.sql` y usar `rpc()` en el cron (ver ANEXO E.3).

---

## ANEXO E · Gotchas de Vercel Cron (lecciones aprendidas)

Apartado añadido en abril 2026 tras ver en producción cómo un `* * * * *` puede no enviar un solo correo. Guarda esto junto al prompt porque te evitará horas de debugging la próxima vez que repliques el sistema.

### E.1 · Plan Hobby → los crons NO corren cada minuto

Vercel limita la frecuencia de los crons según el plan:

- **Hobby**: máximo **1 ejecución al día** por cron job. Aunque pongas `* * * * *`, Vercel lo trata como si fuera `0 0 * * *` (o directamente no lo dispara).
- **Pro**: permite granularidad por minuto.

Síntoma: campaña en `status='sending'`, 760 pending, 0 enviados, nunca cambia.

Opciones:

1. **Pasar a Pro** (~20 $/mes). Recomendado si el negocio depende del mailing.
2. **Cron externo gratuito**: crear una cuenta en [cron-job.org](https://cron-job.org) o [EasyCron](https://www.easycron.com) y programar una petición HTTPS cada minuto:
   - URL: `https://<tu-dominio>/api/cron/mailing-tick`
   - Método: `GET` o `POST`
   - Header: `Authorization: Bearer <CRON_SECRET>`
   - Tiempo máximo de ejecución: 60 s
3. **Empujar manualmente** con el botón "Forzar tick ahora" del panel cuando lances una campaña (aceptable para volúmenes puntuales).

Cómo verificar qué plan tienes y si el cron corre: Vercel → proyecto → **Observability / Logs** → filtro `mailing-tick` en la última hora. Si no ves invocaciones, no está corriendo.

### E.2 · `CRON_SECRET` debe estar en Vercel Production, no solo en `.env.local`

El `.env.local` solo aplica al servidor de desarrollo. En producción, el valor tiene que estar dado de alta en **Settings → Environment Variables → Production**.

Después de añadirlo (o cambiarlo) **necesitas redeploy** — las env vars no se inyectan caliente al deployment existente. Vercel → Deployments → último deploy → "Redeploy".

Además, nuestro handler solo exige el header `Authorization: Bearer $CRON_SECRET` si la env var está definida. Un `CRON_SECRET` vacío en Vercel + llamadas desde Vercel Cron → 200 sin auth (funciona, pero inseguro). Un `CRON_SECRET` definido + llamadas externas sin el header → 401 y el cron no hace nada.

### E.3 · Lock atómico `tick_lock_at` — dos migraciones (columna + RPC)

Cuando una campaña grande tarda >60 s en procesarse, el siguiente tick arranca antes de que termine el anterior → dos procesos envían la misma fila `pending` → correo duplicado.

1. **`20260420-mailing-tick-lock.sql`**: añade la columna `tick_lock_at TIMESTAMPTZ NULL` + índice parcial.
2. **`20260421-mailing-tick-lock-rpc.sql`**: crea `mailing_claim_campaign_tick(uuid)` → `boolean` y `mailing_release_campaign_tick(uuid)` → `void` (`SECURITY DEFINER`, `GRANT` solo a `service_role`). El cron las invoca con `supabase.rpc()` en lugar de `UPDATE ... .or(...)` por REST.

**Por qué el paso 2 existe:** en producción vimos el error REST `column mailing_campaigns.tick_lock_at does not exist` **aunque** `information_schema` y el SQL Editor mostraban la columna en Postgres. Suele ser caché / capa REST de PostgREST. Las funciones ejecutan SQL puro en el servidor y el problema desaparece.

**Si falta la 20260420**, el RPC fallará al compilar o al ejecutar (columna inexistente en la tabla).

**Si falta la 20260421**, el código desplegado devolverá algo tipo *function public.mailing_claim_campaign_tick does not exist* → aplicar esa migración en Supabase y redeploy si hace falta.

### E.4 · Botón "Forzar tick ahora" — salida de emergencia y diagnóstico

Endpoint admin `POST /api/admin/mailing/campaigns/[slug]/tick-now` que invoca `runTickOnce()` bajo guard admin (exportado desde `src/app/api/cron/mailing-tick/route.ts`). Devuelve:

```json
{
  "ok": true,
  "summary": { "active": N, "results": [{ slug, attempted, sent, failed, skipped, rateLimited, note }] },
  "forThisCampaign": { ... },
  "stateBefore": { status, is_paused, tick_lock_at, last_tick_at, last_tick_note, ... },
  "stateAfter":  { ... }
}
```

Leer el campo `results[].note` o los `error` del summary diagnostica casi cualquier problema en ≤ 5 segundos:

| Mensaje en `note` / `error` | Causa | Solución |
|---|---|---|
| `Faltan SMTP_HOST / SMTP_USER / SMTP_PASSWORD` | SMTP no configurado en Vercel Production | Añadir vars + redeploy |
| `column ... tick_lock_at does not exist` (REST antiguo) | PostgREST desfasado o migración 20260420 no aplicada | Aplicar `20260420` + `20260421` en Supabase; el código actual usa RPC |
| `mailing_claim_campaign_tick ... does not exist` | Falta migración 20260421 | Ejecutar `20260421-mailing-tick-lock-rpc.sql` en el SQL Editor |
| `active: 0, results: []` | Campaña no en `status='sending'` o `is_paused=true` | Pulsar "Lanzar" o "Reanudar" |
| `cupo horario lleno: X/Y` | Tope `max_per_hour` consumido en la última hora | Esperar o subir `max_per_hour` |
| `sin html_content` | Se lanzó una campaña sin generar el HTML | Ir a Contenido y generar |
| `rate-limit SMTP: ...` | OVH / proveedor cortó el envío | Esperar ≥60 min y Reanudar |

### E.5 · Verificación rápida de salud del mailing

Checklist express en Supabase SQL Editor cuando algo no va:

```sql
-- 1. ¿Está la columna del lock?
SELECT column_name FROM information_schema.columns
WHERE table_name='mailing_campaigns' AND column_name='tick_lock_at';

-- 2. Estado de la campaña problemática
SELECT slug, status, is_paused, tick_lock_at, last_tick_at, last_tick_note,
       sent_count, failed_count, skipped_count, total_recipients
FROM mailing_campaigns ORDER BY created_at DESC LIMIT 5;

-- 3. ¿Hay pending reales?
SELECT status, COUNT(*) FROM mailing_recipients
WHERE campaign_id='<id>' GROUP BY status;

-- 4. ¿Se han enviado correos en los últimos 5 min (señal de que el cron tira)?
SELECT COUNT(*) FROM mailing_recipients
WHERE status='sent' AND sent_at > now() - interval '5 minutes';
```

### E.6 · Timings realistas de envío

Con la config por defecto `max_per_hour=150` y `batch_size_per_tick=3`:

- Ritmo efectivo: **~150 correos/hora** (≈ 2,5/min) aunque el cron corra por minuto (el tope horario se impone).
- 760 destinatarios → **~5 h 4 min** para completarse.
- 2.000 destinatarios → **~13 h 20 min**.

Si necesitas ir más rápido: subir `max_per_hour` (hasta el límite que soporte tu SMTP — OVH: NO pasar de 200/h por buzón o te cortará), y subir `batch_size_per_tick` hasta 10-20 para aprovechar cada tick. Nunca lanzar en un solo buzón >200/h: habilita un segundo buzón si necesitas más volumen.

---

## ANEXO D · Checklist resumen (entregable)

- [ ] 3 migraciones SQL aplicadas.
- [ ] `src/lib/mailing/{transport,render,audience,send,auth}.ts`.
- [ ] `src/app/api/admin/mailing/*` (14 rutas).
- [ ] `src/app/api/cron/mailing-tick/route.ts` + `vercel.json`.
- [ ] `src/app/api/unsubscribe/route.ts` (3 modos + bilingüe).
- [ ] `src/app/administrator/mails/{page,nueva/page,[slug]/page,[slug]/CampaignDetailClient,CampaignsTable,bajas/page,bajas/SuppressionsClient}.tsx`.
- [ ] Variables de entorno (`SMTP_*`, `CRON_SECRET`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SITE_URL`, Supabase).
- [ ] `README.md` + `docs/ROUTES.md` actualizados.
- [ ] Pruebas manuales completadas (ver Fase 10.3).

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FIN DEL PROMPT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Una vez entregado todo lo anterior, responde con:**

> `Implementación completa. Para probar, ejecuta las 13 tareas del checklist de la Fase 10.3 en orden. Si algo falla, revisa el Anexo C.`
