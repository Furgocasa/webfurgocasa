/**
 * Elimina un motorhome_service por nombre (búsqueda parcial).
 * Uso: npx tsx scripts/delete-motorhome-by-name.ts "Clínica de Fisioterapia Antonio Díaz"
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

  const search = process.argv[2] || '';
  if (!search) {
    console.error('Uso: npx tsx scripts/delete-motorhome-by-name.ts "nombre a buscar"');
    process.exit(1);
  }

  const term = search.split(' ')[0];
  const { data, error } = await supabase
    .from('motorhome_services')
    .select('id, name')
    .ilike('name', `%${term}%`);

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  const match = (data || []).find((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  ) || data?.[0];

  if (!match) {
    console.log('No encontrado.');
    return;
  }

  const { error: delErr } = await supabase
    .from('motorhome_services')
    .delete()
    .eq('id', match.id);

  if (delErr) {
    console.error('Error al eliminar:', delErr.message);
    process.exit(1);
  }

  console.log('✅ Eliminado:', match.name);
}

main().catch(console.error);
