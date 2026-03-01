/**
 * Script para identificar empresas de alquiler exclusivo en motorhome_services.
 * Analiza nombre, google_types y otros campos para detectar negocios
 * que se dedican principalmente o exclusivamente al alquiler de autocaravanas.
 *
 * Uso: npx tsx scripts/identify-rental-businesses.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Palabras clave que sugieren alquiler (en nombre)
const RENTAL_KEYWORDS = [
  'alquiler', 'rental', 'rent', 'renta', 'hire', 'hiring',
  'verhuur', 'vermietung', 'location', 'louer', 'mieten',
  'campervan hire', 'motorhome hire', 'van rental'
];

// Tipos de Google que suelen indicar negocio de alquiler (sin taller/concesionario)
const RENTAL_GOOGLE_TYPES = ['real_estate_agency', 'lodging'];
const DEALER_GOOGLE_TYPES = ['car_dealer', 'car_repair', 'store', 'shopping_mall'];

interface MotorhomeService {
  id: string;
  name: string;
  slug: string;
  category: string;
  address: string | null;
  province: string | null;
  region: string | null;
  website: string | null;
  phone: string | null;
  rating: number | null;
  review_count: number;
  google_types: string[] | null;
  search_query: string | null;
}

function isLikelyRentalExclusive(service: MotorhomeService): { score: number; reasons: string[] } {
  const nameLower = service.name.toLowerCase();
  const reasons: string[] = [];
  let score = 0;

  // 1. Nombre contiene palabra de alquiler
  const hasRentalKeyword = RENTAL_KEYWORDS.some(kw => nameLower.includes(kw.toLowerCase()));
  if (hasRentalKeyword) {
    score += 3;
    const found = RENTAL_KEYWORDS.find(kw => nameLower.includes(kw.toLowerCase()));
    reasons.push(`Nombre contiene "${found}"`);
  }

  // 2. Nombre NO contiene palabras de taller/venta
  const dealerKeywords = ['taller', 'concesionario', 'venta', 'venda', 'sale', 'garage', 'mecánico', 'repair', 'tienda', 'store'];
  const hasDealerKeyword = dealerKeywords.some(kw => nameLower.includes(kw));
  if (!hasDealerKeyword && hasRentalKeyword) {
    score += 2;
    reasons.push('Sin palabras de taller/venta en nombre');
  }

  // 3. Google types: real_estate_agency o lodging sin car_dealer/car_repair
  const gtypes = service.google_types || [];
  const hasRentalType = gtypes.some(t => RENTAL_GOOGLE_TYPES.includes(t));
  const hasDealerType = gtypes.some(t => DEALER_GOOGLE_TYPES.includes(t));

  if (hasRentalType && !hasDealerType) {
    score += 2;
    reasons.push(`Google: ${gtypes.filter(t => RENTAL_GOOGLE_TYPES.includes(t)).join(', ')} (sin car_dealer/repair)`);
  } else if (hasRentalType) {
    score += 1;
    reasons.push(`Google: incluye ${gtypes.filter(t => RENTAL_GOOGLE_TYPES.includes(t)).join(', ')}`);
  }

  // 4. search_query menciona alquiler
  const sq = (service.search_query || '').toLowerCase();
  if (sq.includes('alquiler') || sq.includes('rental') || sq.includes('rent')) {
    score += 1;
    reasons.push('Búsqueda asociada a alquiler');
  }

  // 5. Categoría actual es concesionario pero todo apunta a alquiler
  if (service.category === 'concesionario_autocaravanas' && score >= 3) {
    reasons.push('⚠️ Catalogado como concesionario pero parece alquiler');
  }

  return { score, reasons };
}

async function main() {
  console.log('📂 Cargando motorhome_services...\n');

  const { data: services, error } = await supabase
    .from('motorhome_services')
    .select('id, name, slug, category, address, province, region, website, phone, rating, review_count, google_types, search_query')
    .eq('status', 'active')
    .eq('operational_status', 'OPERATIONAL');

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  const results: Array<{
    name: string;
    slug: string;
    category: string;
    province: string | null;
    score: number;
    reasons: string;
    website: string | null;
    rating: number | null;
    review_count: number;
  }> = [];

  for (const s of (services || []) as MotorhomeService[]) {
    const { score, reasons } = isLikelyRentalExclusive(s);
    if (score >= 2) {
      results.push({
        name: s.name,
        slug: s.slug,
        category: s.category,
        province: s.province,
        score,
        reasons: reasons.join(' | '),
        website: s.website,
        rating: s.rating,
        review_count: s.review_count,
      });
    }
  }

  // Ordenar por score descendente
  results.sort((a, b) => b.score - a.score);

  console.log(`✅ Encontrados ${results.length} posibles empresas de alquiler (score >= 2)\n`);
  console.log('═'.repeat(100));

  for (const r of results) {
    console.log(`\n📌 ${r.name}`);
    console.log(`   Provincia: ${r.province || '-'} | Categoría actual: ${r.category}`);
    console.log(`   Score: ${r.score} | Rating: ${r.rating || '-'} (${r.review_count} reseñas)`);
    console.log(`   Razones: ${r.reasons}`);
    if (r.website) console.log(`   Web: ${r.website}`);
  }

  // Exportar CSV
  const csvPath = resolve(process.cwd(), 'scripts', 'rental-businesses-candidates.csv');
  const csvHeader = 'name,slug,category,province,score,reasons,website,rating,review_count';
  const csvRows = results.map(r =>
    `"${(r.name || '').replace(/"/g, '""')}","${r.slug}","${r.category}","${r.province || ''}",${r.score},"${(r.reasons || '').replace(/"/g, '""')}","${r.website || ''}",${r.rating || ''},${r.review_count}`
  ).join('\n');
  writeFileSync(csvPath, '\ufeff' + csvHeader + '\n' + csvRows, 'utf-8');

  console.log('\n' + '═'.repeat(100));
  console.log(`\n📄 CSV exportado: ${csvPath}`);
  console.log(`\n📊 Resumen: ${results.length} candidatos de ${services?.length || 0} total`);
}

main().catch(console.error);
