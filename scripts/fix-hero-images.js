/**
 * Script para corregir las URLs de hero_image en location_targets
 * Usa las imágenes WebP que SÍ existen en Supabase Storage
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Imágenes que EXISTEN en Supabase media/slides (verificado)
// Formato: slug -> nombre del archivo webp
const HERO_IMAGE_MAP = {
  'murcia': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_murcia.webp',
  'cartagena': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_cartagena.webp',
  'alicante': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_alicante.webp',
  'almeria': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_almeria.webp',
  'elche': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_elche.webp',
  'lorca': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_lorca.webp',
  'aguilas': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_aguilas.webp',
  'jumilla': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_jumilla.webp',
  'yecla': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_yecla.webp',
  'cieza': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_cieza.webp',
  'archena': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_archena.webp',
  'alhama-de-murcia': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_alhama_de_murcia.webp',
  'mazarron': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_mazarron.webp',
  'cabo-de-gata': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_cabo_de_gata.webp',
  'caravaca-de-la-cruz': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_caravaca_de_la_cruz.webp',
  'espana': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_espana.webp',
  'albacete': 'furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_albacete.webp',
};

// Default para las que no tienen imagen específica - USA JPG que SÍ existe
const DEFAULT_IMAGE = 'hero-location-mediterraneo.jpg';

async function fixHeroImages() {
  console.log('🔧 Corrigiendo URLs de hero_image en location_targets...\n');

  // Obtener todas las localizaciones
  const { data: locations, error } = await supabase
    .from('location_targets')
    .select('id, slug, name, hero_image')
    .eq('is_active', true);

  if (error) {
    console.error('Error obteniendo localizaciones:', error);
    return;
  }

  const baseUrl = 'https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/';
  let updated = 0;
  let errors = 0;

  for (const loc of locations) {
    const imageName = HERO_IMAGE_MAP[loc.slug] || DEFAULT_IMAGE;
    const newHeroUrl = baseUrl + imageName;

    // Solo actualizar si es diferente
    if (loc.hero_image !== newHeroUrl) {
      const { error: updateError } = await supabase
        .from('location_targets')
        .update({ hero_image: newHeroUrl })
        .eq('id', loc.id);

      if (updateError) {
        console.error(`❌ Error actualizando ${loc.name}:`, updateError.message);
        errors++;
      } else {
        console.log(`✅ ${loc.name}: ${imageName}`);
        updated++;
      }
    } else {
      console.log(`⏭️  ${loc.name}: ya tiene la imagen correcta`);
    }
  }

  console.log(`\n📊 Resumen: ${updated} actualizadas, ${errors} errores`);
}

fixHeroImages();
