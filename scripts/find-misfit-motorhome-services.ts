/**
 * Busca motorhome_services cuyo nombre claramente NO encaja
 * (negocios que no son talleres, concesionarios, campings, etc. de autocaravanas)
 *
 * Uso: npx tsx scripts/find-misfit-motorhome-services.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

// Palabras que indican negocios que NO encajan (evitar falsos positivos: España, Chispas, VanSpace...)
const MISFIT_KEYWORDS = [
  'fisioterapia', 'osteopatía', 'clínica', 'médico', 'odontolog', 'dentista',
  'restaurante', ' bar ', 'hotel', 'hostal', 'pensión', 'apartamento',
  'abogado', 'notaría', 'gestoría', 'asesoría',
  'peluquería', 'estética', 'masaje',
  'inmobiliaria', 'agencia inmobiliaria',
  'supermercado', 'farmacia', 'óptica',
  'gimnasio', 'yoga', ' pilates', 'pilates ', // pilates como palabra, evita "Bonpilates" si es marca
  'escuela', 'academia', 'colegio',
  'iglesia', 'parroquia',
  'funeraria', 'cementerio',
  'ferretería', 'fontanería',
  'seguridad', 'vigilancia',
  'abogacía', 'abogados',
  'parking', 'aparcamiento',
];

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('motorhome_services')
    .select('id, name, category, province')
    .eq('status', 'active')
    .eq('operational_status', 'OPERATIONAL');

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  const misfits: Array<{ name: string; category: string; province: string | null; keyword: string }> = [];

  for (const r of data || []) {
    const nameLower = r.name.toLowerCase();
    for (const kw of MISFIT_KEYWORDS) {
      if (nameLower.includes(kw)) {
        misfits.push({
          name: r.name,
          category: r.category,
          province: r.province,
          keyword: kw,
        });
        break;
      }
    }
  }

  console.log(`\n🔍 Registros que por nombre NO encajan (${misfits.length}):\n`);
  if (misfits.length === 0) {
    console.log('✅ No se encontraron registros sospechosos.');
    return;
  }

  for (const m of misfits) {
    console.log(`   • ${m.name}`);
    console.log(`     Categoría: ${m.category} | Provincia: ${m.province || '-'} | Palabra: "${m.keyword}"`);
  }

  console.log(`\n📊 Total: ${misfits.length} de ${data?.length || 0}`);
}

main().catch(console.error);
