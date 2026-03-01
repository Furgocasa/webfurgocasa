/**
 * Script para importar el directorio de servicios (talleres y concesionarios)
 * desde el CSV a la tabla motorhome_services de Supabase.
 *
 * Uso: npx tsx scripts/import-motorhome-services.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { readFileSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- CSV Parser ---

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

// --- Slug generator ---

function generateSlug(name: string, province: string | null): string {
  const base = `${name} ${province || ''}`.trim();
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

// --- Category mapper ---

function mapCategory(raw: string): string {
  const cleaned = raw.replace(/🚐\s*/, '').trim().toLowerCase();
  if (cleaned.includes('taller')) return 'taller_camper';
  if (cleaned.includes('concesionario')) return 'concesionario_autocaravanas';
  if (cleaned.includes('camping')) return 'camping';
  if (cleaned.includes('area') || cleaned.includes('área')) return 'area_servicio';
  if (cleaned.includes('tienda')) return 'tienda_accesorios';
  if (cleaned.includes('alquiler')) return 'alquiler';
  if (cleaned.includes('homolog')) return 'homologador';
  if (cleaned.includes('itv')) return 'itv';
  if (cleaned.includes('segur') || cleaned.includes('asegurad')) return 'aseguradora';
  return 'otro';
}

// --- Google types parser ---

function parseGoogleTypes(raw: string): string[] | null {
  if (!raw) return null;
  return raw.split(',').map(t => t.trim()).filter(Boolean);
}

// --- Main ---

async function main() {
  console.log('📂 Leyendo CSV...');
  const csvPath = resolve(process.cwd(), 'images', 'directorio.csv');
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  // Primera línea es el header
  const headers = parseCSVLine(lines[0]);
  console.log(`📋 Headers (${headers.length}):`, headers);

  const records: Record<string, unknown>[] = [];
  const slugMap = new Map<string, number>();

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 20) {
      console.warn(`⚠️  Línea ${i + 1} tiene solo ${fields.length} campos, saltando...`);
      continue;
    }

    const name = fields[0];
    const categoryRaw = fields[1];
    const address = fields[2] || null;
    const phone = fields[3] || null;
    const website = fields[4] || null;
    const email = fields[5] || null;
    const ratingStr = fields[6];
    const reviewCountStr = fields[7];
    const priceLevel = fields[8] || null;
    const googleTypesRaw = fields[9];
    const latStr = fields[10];
    const lngStr = fields[11];
    const openingHours = fields[12] || null;
    const operationalStatus = fields[13] || 'OPERATIONAL';
    // fields[14] = Google Maps URL (vacío en la mayoría)
    const googleMapsUrl = fields[14] || null;
    const placeId = fields[15] || null;
    const province = fields[16] || null;
    const region = fields[17] || null;
    const country = fields[18] || 'España';
    const webValidRaw = fields[19];
    const qualityScoreStr = fields[20];
    const searchQuery = fields[21] || null;

    if (!name) continue;

    // Generar slug único
    let slug = generateSlug(name, province);
    if (slugMap.has(slug)) {
      const count = slugMap.get(slug)! + 1;
      slugMap.set(slug, count);
      slug = `${slug}-${count}`;
    } else {
      slugMap.set(slug, 1);
    }

    const category = mapCategory(categoryRaw);
    const rating = ratingStr ? parseFloat(ratingStr) : null;
    const reviewCount = reviewCountStr ? parseInt(reviewCountStr, 10) : 0;
    const latitude = latStr ? parseFloat(latStr) : null;
    const longitude = lngStr ? parseFloat(lngStr) : null;

    const validStatus = ['OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY'];
    const status = validStatus.includes(operationalStatus) ? operationalStatus : 'OPERATIONAL';

    const websiteValid = webValidRaw?.toLowerCase() === 'sí' || webValidRaw?.toLowerCase() === 'si';
    const qualityScore = qualityScoreStr ? Math.min(5, Math.max(0, parseInt(qualityScoreStr, 10) || 0)) : 0;

    records.push({
      name,
      slug,
      category,
      address,
      phone,
      website,
      email,
      rating: isNaN(rating as number) ? null : rating,
      review_count: isNaN(reviewCount) ? 0 : reviewCount,
      price_level: priceLevel,
      google_types: parseGoogleTypes(googleTypesRaw),
      place_id: placeId || null,
      google_maps_url: googleMapsUrl,
      latitude: isNaN(latitude as number) ? null : latitude,
      longitude: isNaN(longitude as number) ? null : longitude,
      province,
      region,
      country: country || 'España',
      opening_hours: openingHours,
      operational_status: status,
      website_valid: websiteValid,
      quality_score: qualityScore,
      search_query: searchQuery,
      status: 'active',
    });
  }

  console.log(`\n✅ ${records.length} registros parseados del CSV`);

  // Estadísticas
  const categoryCount = records.reduce((acc, r) => {
    const cat = r.category as string;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log('📊 Categorías:', categoryCount);

  // Insertar en lotes de 100
  const BATCH_SIZE = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(records.length / BATCH_SIZE);

    const { data, error } = await supabase
      .from('motorhome_services')
      .upsert(batch as any[], {
        onConflict: 'slug',
        ignoreDuplicates: false,
      })
      .select('id');

    if (error) {
      console.error(`❌ Error en lote ${batchNum}/${totalBatches}:`, error.message);

      // Insertar uno a uno para identificar los problemáticos
      for (const record of batch) {
        const { error: singleError } = await supabase
          .from('motorhome_services')
          .upsert(record as any, { onConflict: 'slug' });

        if (singleError) {
          console.error(`   ❌ Error insertando "${(record as any).name}":`, singleError.message);
          errors++;
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data?.length || batch.length;
      console.log(`   ✅ Lote ${batchNum}/${totalBatches}: ${batch.length} registros insertados`);
    }
  }

  console.log(`\n🏁 Importación completada:`);
  console.log(`   ✅ Insertados: ${inserted}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📊 Total procesados: ${records.length}`);
}

main().catch(console.error);
