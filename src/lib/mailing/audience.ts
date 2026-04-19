/**
 * Poblado de destinatarios de una campaña a partir de marketing_contacts.
 *
 * Preselecciones fijas (audience):
 *   · all        → todos los contactos con opt-in, sin filtrar por source.
 *   · customers  → solo source = 'customer' (clientes con reserva previa).
 *   · newsletter → solo source = 'newsletter' (alta voluntaria en la web).
 *
 * Lógica:
 *   1. Carga contactos con opt-in (marketing_opt_out_at IS NULL).
 *   2. Descarta los emails presentes en email_suppressions (LOWER/TRIM).
 *   3. Filtra por preselección.
 *   4. Deduplica contra los recipients ya existentes en la campaña.
 *   5. Inserta en lotes de 500.
 *
 * Para envíos de prueba admite `test_emails` (comma-separated): descarta
 * los contactos y solo crea filas para esos emails literales (sin contact_id).
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type AudienceType = 'all' | 'customers' | 'newsletter';

export type PopulateAudienceFilter = {
  audience?: AudienceType;
  test_emails?: string | null;
};

export type PopulateResult = {
  candidates: number;
  skippedOptOut: number;
  skippedAudience: number;
  skippedDuplicates: number;
  inserted: number;
  total: number;
};

type Cand = {
  campaign_id: string;
  contact_id: string | null;
  email: string;
  nombre: string | null;
  ciudad: string | null;
  status: 'pending';
};

export async function populateRecipients(
  sb: SupabaseClient,
  campaignId: string,
  filter: PopulateAudienceFilter,
): Promise<PopulateResult> {
  const audience: AudienceType = filter.audience || 'all';
  const testEmails = filter.test_emails || null;
  const result: PopulateResult = {
    candidates: 0,
    skippedOptOut: 0,
    skippedAudience: 0,
    skippedDuplicates: 0,
    inserted: 0,
    total: 0,
  };

  const recipients: Cand[] = [];

  if (testEmails) {
    for (const raw of testEmails.split(',')) {
      const email = raw.trim();
      if (!email) continue;
      recipients.push({
        campaign_id: campaignId,
        contact_id: null,
        email,
        nombre: 'Test',
        ciudad: '',
        status: 'pending',
      });
    }
  } else {
    const { data: contacts, error } = await sb
      .from('marketing_contacts')
      .select('id,email,name,city,source,marketing_opt_out_at')
      .is('marketing_opt_out_at', null)
      .not('email', 'is', null)
      .neq('email', '');
    if (error) throw new Error(`Error cargando contactos: ${error.message}`);

    const { data: suppressions } = await sb.from('email_suppressions').select('email');
    const suppressedSet = new Set(
      (suppressions || [])
        .map((s: { email: string | null }) => (s.email || '').trim().toLowerCase())
        .filter(Boolean),
    );

    result.candidates = (contacts || []).length;
    type Contact = {
      id: string;
      email: string | null;
      name: string | null;
      city: string | null;
      source: string | null;
      marketing_opt_out_at: string | null;
    };
    for (const c of (contacts || []) as Contact[]) {
      if (c.marketing_opt_out_at) {
        result.skippedOptOut++;
        continue;
      }
      if (suppressedSet.has((c.email || '').trim().toLowerCase())) {
        result.skippedOptOut++;
        continue;
      }
      if (audience === 'customers' && c.source !== 'customer') {
        result.skippedAudience++;
        continue;
      }
      if (audience === 'newsletter' && c.source !== 'newsletter') {
        result.skippedAudience++;
        continue;
      }
      if (!c.email) continue;
      recipients.push({
        campaign_id: campaignId,
        contact_id: c.id,
        email: c.email,
        nombre: c.name,
        ciudad: c.city,
        status: 'pending',
      });
    }
  }

  if (recipients.length === 0) {
    const { count } = await sb
      .from('mailing_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'pending');
    result.total = count || 0;
    return result;
  }

  // Deduplicado manual (índice único parcial no sirve para ON CONFLICT).
  const { data: existing } = await sb
    .from('mailing_recipients')
    .select('contact_id,email')
    .eq('campaign_id', campaignId);
  const byContact = new Set(
    (existing || [])
      .filter((r: { contact_id: string | null }) => r.contact_id)
      .map((r: { contact_id: string }) => r.contact_id),
  );
  const byEmail = new Set(
    (existing || [])
      .filter((r: { contact_id: string | null }) => !r.contact_id)
      .map((r: { email: string }) => r.email),
  );

  // Si recargamos solo test-emails, limpiamos los previos sin contact_id.
  const withoutContact = recipients.filter((r) => !r.contact_id);
  if (withoutContact.length > 0) {
    await sb
      .from('mailing_recipients')
      .delete()
      .eq('campaign_id', campaignId)
      .is('contact_id', null);
    byEmail.clear();
  }

  const fresh = recipients.filter((r) =>
    r.contact_id ? !byContact.has(r.contact_id) : !byEmail.has(r.email),
  );
  result.skippedDuplicates = recipients.length - fresh.length;

  const CHUNK = 500;
  for (let i = 0; i < fresh.length; i += CHUNK) {
    const chunk = fresh.slice(i, i + CHUNK);
    const { error } = await sb.from('mailing_recipients').insert(chunk);
    if (error) {
      throw new Error(`Error insertando lote ${Math.floor(i / CHUNK) + 1}: ${error.message}`);
    }
    result.inserted += chunk.length;
  }

  const { count } = await sb
    .from('mailing_recipients')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('status', 'pending');
  result.total = count || 0;

  await sb
    .from('mailing_campaigns')
    .update({
      total_recipients: result.total,
      audience_filter: { audience, test_emails: testEmails },
    })
    .eq('id', campaignId);

  return result;
}
