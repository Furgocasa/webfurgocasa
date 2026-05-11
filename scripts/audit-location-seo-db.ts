/**
 * Auditoría SEO: landings por ciudad (alquiler + venta) vs plantillas en código.
 *
 * - Cuenta filas con h1_title / meta_title / meta_description rellenados en BD.
 * - Cuenta content_translations para esos campos (si hay ES mezclado con base, ver notas en salida).
 *
 * Uso:
 *   npm run audit:location-seo-db
 *   npx tsx scripts/audit-location-seo-db.ts --insecure
 *
 * Requiere .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import https from 'https';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    '❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local'
  );
  process.exit(1);
}

const supabase = createClient(url, key);

/** Diagnóstico cuando `fetch` de Node falla pero las credenciales están bien (TLS, proxy, antivirus, DNS). */
function probeTlsAndRest(): Promise<{ ok: boolean; statusCode?: number; error?: string }> {
  return new Promise((resolvePromise) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        port: 443,
        path: '/rest/v1/',
        method: 'GET',
        timeout: 15_000,
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
      (res) => {
        res.resume();
        resolvePromise({ ok: true, statusCode: res.statusCode });
      }
    );
    req.on('timeout', () => {
      req.destroy();
      resolvePromise({ ok: false, error: 'timeout (>15s)' });
    });
    req.on('error', (err: NodeJS.ErrnoException) => {
      resolvePromise({
        ok: false,
        error: [err.message, err.code, err.syscall].filter(Boolean).join(' | '),
      });
    });
    req.end();
  });
}

function logErrChain(e: unknown): void {
  let cur: unknown = e;
  let depth = 0;
  while (cur && depth < 5) {
    if (cur instanceof Error) {
      console.error(`   ↳ ${cur.name}: ${cur.message}`);
      const c = (cur as Error & { cause?: unknown }).cause;
      cur = c ?? null;
    } else {
      console.error('   ↳', cur);
      break;
    }
    depth += 1;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function countFilter(table: string, apply: (q: any) => any): Promise<number> {
  let q = supabase.from(table).select('id', { count: 'exact', head: true });
  q = apply(q);
  const { count, error } = await q;
  if (error) throw new Error(`${table}: ${error.message}`);
  return count ?? 0;
}

async function auditRent(): Promise<void> {
  console.log('\n═══ location_targets (alquiler) ═══\n');

  const active = await countFilter('location_targets', (q) => q.eq('is_active', true));
  console.log(`Activos: ${active}`);

  const withH1 = await countFilter('location_targets', (q) =>
    q.eq('is_active', true).not('h1_title', 'is', null)
  );
  const withMetaT = await countFilter('location_targets', (q) =>
    q.eq('is_active', true).not('meta_title', 'is', null)
  );
  const withMetaD = await countFilter('location_targets', (q) =>
    q.eq('is_active', true).not('meta_description', 'is', null)
  );

  console.log(`Con h1_title NOT NULL:        ${withH1}`);
  console.log(`Con meta_title NOT NULL:     ${withMetaT}`);
  console.log(`Con meta_description NOT NULL: ${withMetaD}`);

  const anySeo = await countFilter('location_targets', (q) =>
    q
      .eq('is_active', true)
      .or('h1_title.not.is.null,meta_title.not.is.null,meta_description.not.is.null')
  );
  console.log(`Con al menos uno de los tres: ${anySeo}`);

  if (anySeo > 0 && active > 0) {
    const { data: sample, error } = await supabase
      .from('location_targets')
      .select('slug, name, h1_title, meta_title')
      .eq('is_active', true)
      .or('h1_title.not.is.null,meta_title.not.is.null,meta_description.not.is.null')
      .order('slug')
      .limit(8);

    if (error) {
      console.log('⚠️ No se pudo cargar muestra:', error.message);
    } else {
      console.log('\nMuestra (máx. 8 slugs con SEO en BD):');
      for (const r of sample ?? []) {
        const h1 = r.h1_title ? `${String(r.h1_title).slice(0, 60)}…` : '—';
        const mt = r.meta_title ? `${String(r.meta_title).slice(0, 60)}…` : '—';
        console.log(`  • ${r.slug} (${r.name})\n    h1: ${h1}\n    meta_title: ${mt}`);
      }
    }
  }
}

async function auditSale(): Promise<void> {
  console.log('\n═══ sale_location_targets (venta) ═══\n');

  const { count: active, error: e1 } = await supabase
    .from('sale_location_targets')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  if (e1) {
    console.log('⚠️ Tabla sale_location_targets:', e1.message);
    return;
  }

  console.log(`Activos: ${active ?? 0}`);

  const withH1 = await countFilter('sale_location_targets', (q) =>
    q.eq('is_active', true).not('h1_title', 'is', null)
  );
  const withMetaT = await countFilter('sale_location_targets', (q) =>
    q.eq('is_active', true).not('meta_title', 'is', null)
  );
  const withMetaD = await countFilter('sale_location_targets', (q) =>
    q.eq('is_active', true).not('meta_description', 'is', null)
  );

  console.log(`Con h1_title NOT NULL:        ${withH1}`);
  console.log(`Con meta_title NOT NULL:     ${withMetaT}`);
  console.log(`Con meta_description NOT NULL: ${withMetaD}`);
}

async function auditTranslations(): Promise<void> {
  console.log('\n═══ content_translations (h1 / meta, por locale) ═══\n');

  const tables = ['location_targets', 'sale_location_targets'] as const;
  const locales = ['en', 'fr', 'de'] as const;
  const fields = ['h1_title', 'meta_title', 'meta_description'] as const;

  for (const table of tables) {
    console.log(`${table}:`);
    for (const locale of locales) {
      const parts: string[] = [];
      for (const source_field of fields) {
        const { count, error } = await supabase
          .from('content_translations')
          .select('id', { count: 'exact', head: true })
          .eq('source_table', table)
          .eq('locale', locale)
          .eq('source_field', source_field);

        if (error) {
          parts.push(`${source_field}=?`);
          continue;
        }
        if ((count ?? 0) > 0) {
          parts.push(`${source_field}=${count}`);
        }
      }
      console.log(
        `  ${locale}: ${parts.length ? parts.join(', ') : '(ninguna de esas filas)'}`
      );
    }
  }
}

async function main() {
  if (process.argv.includes('--insecure')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    console.warn(
      '⚠️  --insecure: se desactiva la verificación TLS (solo diagnóstico). Corrige CA/proxy en producción.\n'
    );
  }

  const host = new URL(url).host;
  console.log(`🔗 Supabase: ${host}`);
  console.log('📌 Objetivo: ver si BD pisa las plantillas SEO del código (ES + EN/FR/DE).');

  console.log('\n🔌 Prueba HTTPS módulo `https` de Node (sin fetch) → /rest/v1/');
  const probe = await probeTlsAndRest();
  if (probe.ok) {
    console.log(`   ✅ Respuesta HTTP ${probe.statusCode} (conexión TLS y REST alcanzables)`);
  } else {
    console.log(`   ❌ No se pudo conectar: ${probe.error ?? 'desconocido'}`);
    console.log(
      '   → Revisa proxy HTTP(S) de Windows, antivirus (inspección SSL), firewall, o prueba otra red.'
    );
    process.exit(1);
  }

  await auditRent();
  await auditSale();
  await auditTranslations();

  console.log(
    '\n── Recomendación ──\n' +
      'Si hay meta/h1 en location_targets o sale_location_targets y EN muestra español, ' +
      'revisa supabase/migrations/20260512-location-seo-reset-code-fallbacks.sql\n'
  );

  console.log('✅ Auditoría terminada.\n');
}

main().catch((e) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('❌', msg);
  logErrChain(e);
  if (/fetch failed/i.test(msg)) {
    console.error(
      '\n💡 `fetch failed` suele ser red/TLS en Windows (proxy, antivirus, DNS), no la URL en sí. ' +
        'El script ya hace una prueba con `https`; si esa prueba pasó y esto falla, prueba actualizar Node (LTS) o ejecutar fuera de VPN.\n'
    );
  }
  process.exit(1);
});
