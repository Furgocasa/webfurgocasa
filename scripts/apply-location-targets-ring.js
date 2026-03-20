/**
 * Aplica en Supabase las 22 localidades del "anillo" Madrid / Alicante / Albacete.
 * Equivale a: supabase/migrations/20260323-location-targets-ring-madrid-alicante-albacete.sql
 * Tras ejecutar: node scripts/update-location-targets-rent-meta.js (EN/FR/DE).
 *
 *   node scripts/apply-location-targets-ring.js
 */
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const ROWS = [
  ['mostoles', 'Móstoles', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 20, 25, 40.3228, -3.8647, 110],
  ['alcala-de-henares', 'Alcalá de Henares', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 35, 35, 40.482, -3.3635, 111],
  ['fuenlabrada', 'Fuenlabrada', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 22, 25, 40.2846, -3.7942, 112],
  ['leganes', 'Leganés', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 12, 20, 40.3265, -3.7635, 113],
  ['getafe', 'Getafe', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 16, 22, 40.3083, -3.7327, 114],
  ['alcorcon', 'Alcorcón', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 15, 20, 40.3458, -3.8247, 115],
  ['las-rozas-de-madrid', 'Las Rozas de Madrid', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 22, 28, 40.4936, -3.8737, 116],
  ['alcobendas', 'Alcobendas', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 18, 25, 40.5475, -3.642, 117],
  ['gandia', 'Gandía', 'Valencia', 'Comunidad Valenciana', 'alicante', 'Alicante', 95, 60, 38.9672, -0.1823, 118],
  ['denia', 'Dénia', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 95, 65, 38.8408, 0.1057, 119],
  ['alcoy', 'Alcoy', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 62, 45, 38.6984, -0.4735, 120],
  ['san-vicente-del-raspeig', 'San Vicente del Raspeig', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 12, 15, 38.3964, -0.5255, 121],
  ['elda', 'Elda', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 35, 30, 38.4776, -0.7956, 122],
  ['villena', 'Villena', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 58, 40, 38.635, -0.8656, 123],
  ['xativa', 'Xàtiva', 'Valencia', 'Comunidad Valenciana', 'alicante', 'Alicante', 105, 70, 38.9886, -0.519, 124],
  ['tomelloso', 'Tomelloso', 'Ciudad Real', 'Castilla-La Mancha', 'albacete', 'Albacete', 115, 70, 39.157, -3.024, 125],
  ['alcazar-de-san-juan', 'Alcázar de San Juan', 'Ciudad Real', 'Castilla-La Mancha', 'albacete', 'Albacete', 72, 48, 39.3901, -3.2076, 126],
  ['valdepenas', 'Valdepeñas', 'Ciudad Real', 'Castilla-La Mancha', 'albacete', 'Albacete', 102, 65, 38.7621, -3.3956, 127],
  ['villarrobledo', 'Villarrobledo', 'Albacete', 'Castilla-La Mancha', 'albacete', 'Albacete', 82, 55, 39.2692, -2.605, 128],
  ['almansa', 'Almansa', 'Albacete', 'Castilla-La Mancha', 'albacete', 'Albacete', 70, 50, 38.868, -1.097, 129],
  ['manzanares', 'Manzanares', 'Ciudad Real', 'Castilla-La Mancha', 'albacete', 'Albacete', 105, 70, 38.9991, -3.37, 130],
  ['la-roda', 'La Roda', 'Albacete', 'Castilla-La Mancha', 'albacete', 'Albacete', 48, 35, 39.204, -2.158, 131],
];

function heroTitleFromSlug(slug) {
  return 'ALQUILER CAMPER ' + slug.replace(/-/g, ' ').toUpperCase();
}

function buildRow(locId, r) {
  const [
    slug,
    name,
    province,
    region,
    ,
    sedeLabel,
    distKm,
    travelMin,
    lat,
    lon,
    disp,
  ] = r;
  const introHtml = `<p>Explora <strong>${name}</strong> y alrededores en autocaravana o camper. La recogida del vehículo se realiza en nuestra sede de <strong>${sedeLabel}</strong> (aprox. ${distKm} km, ${travelMin} min en coche). Con Furgocasa disfrutas de <strong>kilómetros ilimitados</strong>, asistencia 24/7 y cancelación flexible. Planifica pernocta y servicios con <a href="https://www.mapafurgocasa.com" rel="noopener noreferrer">Mapa Furgocasa</a>.</p>`;
  return {
    slug,
    name,
    province,
    region,
    nearest_location_id: locId,
    distance_km: distKm,
    travel_time_minutes: travelMin,
    meta_title: `Alquiler de Autocaravanas Camper en ${name} - Furgocasa`,
    meta_description: `Alquiler de autocaravanas y campers en ${name}. Recogida en ${sedeLabel}. Kilómetros ilimitados, asistencia 24/7 y cancelación gratuita. Paga el 50% al reservar.`,
    h1_title: `Alquiler de Autocaravanas en ${name} (casas rodantes / motorhomes)`,
    latitude: lat,
    longitude: lon,
    hero_content: {
      title: heroTitleFromSlug(slug),
      subtitle: `Recogida en sede ${sedeLabel}`,
      has_office: false,
      office_notice: `Recoge tu camper en nuestra sede de ${sedeLabel}. Desde ${name} son aprox. ${distKm} km (${travelMin} min en coche).`,
    },
    intro_text: `Si buscas **alquiler de camper o autocaravana** cerca de **${name}**, en Furgocasa tienes furgonetas de gran volumen con equipamiento completo. Reserva online y **recoge en nuestra sede de ${sedeLabel}**.`,
    content_sections: {
      introduction: introHtml,
      attractions: [],
      parking_areas: [],
      routes: [],
      gastronomy:
        '<p>Descubre la gastronomía local al planificar tu viaje: mercados, productos de temporada y buena cocina de la zona son el complemento ideal a tu ruta en camper.</p>',
      practical_tips:
        '<p>Respeta la normativa municipal sobre estacionamiento y pernocta; usa áreas autorizadas. En temporada alta, reserva con margen y revisa el itinerario con antelación.</p>',
    },
    is_active: true,
    display_order: disp,
  };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Faltan credenciales en .env.local');
    process.exit(1);
  }
  const supabase = createClient(url, key);
  const sedes = ['madrid', 'alicante', 'albacete'];
  const locMap = {};
  for (const s of sedes) {
    const { data, error } = await supabase.from('locations').select('id').eq('slug', s).eq('is_active', true).single();
    if (error || !data) {
      console.error('No se encuentra sede locations.slug =', s, error?.message);
      process.exit(1);
    }
    locMap[s] = data.id;
  }
  let ok = 0;
  for (const r of ROWS) {
    const sedeSlug = r[4];
    const locId = locMap[sedeSlug];
    const row = buildRow(locId, r);
    const { error } = await supabase.from('location_targets').upsert(row, { onConflict: 'slug' });
    if (error) {
      console.error('Error', r[0], error.message);
    } else {
      ok++;
      console.log('OK', r[0]);
    }
  }
  console.log('\nListo:', ok, '/', ROWS.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
