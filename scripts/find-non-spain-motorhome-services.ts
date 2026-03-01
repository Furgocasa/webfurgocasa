/**
 * Busca motorhome_services que NO estén en España.
 * Por campo country o por provincias/regiones que indican otro país.
 *
 * Uso: npx tsx scripts/find-non-spain-motorhome-services.ts
 *       npx tsx scripts/find-non-spain-motorhome-services.ts --delete
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Por campo country explícito
  const { data: byCountry, error: err1 } = await supabase
    .from('motorhome_services')
    .select('id, name, category, province, region, country, address')
    .neq('country', 'España')
    .not('country', 'is', null);

  // 2. Provincias/regiones que indican Portugal, Francia, Andorra...
  const { data: allData } = await supabase
    .from('motorhome_services')
    .select('id, name, category, province, region, country, address')
    .eq('status', 'active')
    .eq('operational_status', 'OPERATIONAL');

  const nonSpainProvinces = [
    'Barcelos', 'Tábua', 'Porto', 'Lisboa', 'Faro', 'Braga', 'Coimbra', 'Leiria',
    'La Massana', 'Andorra la Vella', 'Escaldes-Engordany', 'Andorra',
    'Hautes-Pyrénées', 'Pyrénées-Atlantiques', 'Ariège', 'Haute-Garonne',
    'Portugal', 'France', 'Andorra', 'Maroc', 'Morocco',
  ];

  const byProvince = (allData || []).filter(
    (r) => nonSpainProvinces.some(
      (p) => (r.province || '').toLowerCase().includes(p.toLowerCase()) ||
             (r.region || '').toLowerCase().includes(p.toLowerCase())
    )
  );

  const byCountryList = byCountry || [];
  const combined = new Map<string, typeof byCountryList[0] & { reason: string }>();
  byCountryList.forEach((r) => combined.set(r.id, { ...r, reason: `country="${r.country}"` }));
  byProvince.forEach((r) => {
    if (!combined.has(r.id)) {
      combined.set(r.id, { ...r, reason: `province/region: ${r.province || ''} / ${r.region || ''}` });
    }
  });

  const results = Array.from(combined.values());
  const doDelete = process.argv.includes('--delete');

  console.log(`\n🔍 Registros FUERA de España (${results.length}):\n`);
  if (results.length === 0) {
    console.log('✅ No se encontraron registros fuera de España.');
    return;
  }

  for (const r of results) {
    console.log(`   • ${r.name}`);
    console.log(`     Provincia: ${r.province || '-'} | Región: ${r.region || '-'} | País: ${r.country || '-'}`);
    console.log(`     Motivo: ${r.reason}`);
    if (r.address) console.log(`     Dirección: ${r.address.slice(0, 80)}...`);
  }

  console.log(`\n📊 Total: ${results.length}`);

  if (doDelete && results.length > 0) {
    const ids = results.map((r) => r.id);
    const { error } = await supabase.from('motorhome_services').delete().in('id', ids);
    if (error) {
      console.error('\n❌ Error al eliminar:', error.message);
      process.exit(1);
    }
    console.log(`\n✅ ${ids.length} registros eliminados.`);
  }
}

main().catch(console.error);
