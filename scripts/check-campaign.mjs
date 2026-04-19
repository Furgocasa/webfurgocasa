#!/usr/bin/env node
// Consulta el estado de una campaña concreta en Supabase.
// Uso: node --env-file=.env.local scripts/check-campaign.mjs <slug>

import { createClient } from '@supabase/supabase-js';

const slug = process.argv[2] || 'ofertas-en-mayo';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await sb
  .from('mailing_campaigns')
  .select(
    'id, slug, number, subject, status, is_paused, html_content, generation_prompt, audience_filter, total_recipients, created_at, started_at, completed_at',
  )
  .eq('slug', slug)
  .maybeSingle();

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
if (!data) {
  console.log(`(no existe ninguna campaña con slug="${slug}")`);
  process.exit(0);
}

const html = data.html_content || '';
console.log(JSON.stringify(
  {
    id: data.id,
    slug: data.slug,
    number: data.number,
    subject: data.subject,
    status: data.status,
    is_paused: data.is_paused,
    audience_filter: data.audience_filter,
    total_recipients: data.total_recipients,
    has_html: Boolean(html),
    html_length: html.length,
    generation_prompt_excerpt: (data.generation_prompt || '').slice(0, 200),
    created_at: data.created_at,
    started_at: data.started_at,
    completed_at: data.completed_at,
  },
  null,
  2,
));
