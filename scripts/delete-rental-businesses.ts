/**
 * Script para ELIMINAR las empresas de alquiler identificadas en motorhome_services.
 * Usa la misma lógica que identify-rental-businesses.ts (score >= 2).
 *
 * Uso: npx tsx scripts/delete-rental-businesses.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const RENTAL_KEYWORDS = [
  'alquiler', 'rental', 'rent', 'renta', 'hire', 'hiring',
  'verhuur', 'vermietung', 'location', 'louer', 'mieten',
  'campervan hire', 'motorhome hire', 'van rental'
];

const RENTAL_GOOGLE_TYPES = ['real_estate_agency', 'lodging'];
const DEALER_GOOGLE_TYPES = ['car_dealer', 'car_repair', 'store', 'shopping_mall'];

interface MotorhomeService {
  id: string;
  name: string;
  slug: string;
  category: string;
  google_types: string[] | null;
  search_query: string | null;
}

function isLikelyRentalExclusive(service: MotorhomeService): number {
  const nameLower = service.name.toLowerCase();
  let score = 0;

  const hasRentalKeyword = RENTAL_KEYWORDS.some(kw => nameLower.includes(kw.toLowerCase()));
  if (hasRentalKeyword) score += 3;

  const dealerKeywords = ['taller', 'concesionario', 'venta', 'venda', 'sale', 'garage', 'mecánico', 'repair', 'tienda', 'store'];
  const hasDealerKeyword = dealerKeywords.some(kw => nameLower.includes(kw));
  if (!hasDealerKeyword && hasRentalKeyword) score += 2;

  const gtypes = service.google_types || [];
  const hasRentalType = gtypes.some(t => RENTAL_GOOGLE_TYPES.includes(t));
  const hasDealerType = gtypes.some(t => DEALER_GOOGLE_TYPES.includes(t));
  if (hasRentalType && !hasDealerType) score += 2;
  else if (hasRentalType) score += 1;

  const sq = (service.search_query || '').toLowerCase();
  if (sq.includes('alquiler') || sq.includes('rental') || sq.includes('rent')) score += 1;

  return score;
}

async function main() {
  console.log('📂 Cargando motorhome_services...\n');

  const { data: services, error } = await supabase
    .from('motorhome_services')
    .select('id, name, slug, category, google_types, search_query');

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  const toDelete = (services || []).filter((s: MotorhomeService) => isLikelyRentalExclusive(s) >= 2);
  const ids = toDelete.map((s: MotorhomeService) => s.id);

  console.log(`🗑️  Se eliminarán ${ids.length} registros (empresas de alquiler identificadas)\n`);

  if (ids.length === 0) {
    console.log('No hay registros que eliminar.');
    return;
  }

  const { error: deleteError } = await supabase
    .from('motorhome_services')
    .delete()
    .in('id', ids);

  if (deleteError) {
    console.error('❌ Error al eliminar:', deleteError.message);
    process.exit(1);
  }

  console.log(`✅ ${ids.length} registros eliminados correctamente.`);
}

main().catch(console.error);
