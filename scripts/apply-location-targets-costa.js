const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const ROWS = [
  // ['slug', 'name', 'province', 'region', 'sede_slug', 'sede_label', dist_km, travel_min, lat, lon, disp]
  // Costa Blanca Sur y Norte (Sede: Alicante)
  ['santa-pola', 'Santa Pola', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 20, 25, 38.1917, -0.5658, 140],
  ['calpe', 'Calpe', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 65, 50, 38.6447, 0.0445, 141],
  ['guardamar-del-segura', 'Guardamar del Segura', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 35, 35, 38.0903, -0.6558, 142],
  ['altea', 'Altea', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 55, 45, 38.5989, -0.0514, 143],
  // Costa Cálida Mar Menor (Sede: Murcia)
  ['san-pedro-del-pinatar', 'San Pedro del Pinatar', 'Murcia', 'Región de Murcia', 'murcia', 'Murcia', 45, 35, 37.8356, -0.7917, 144],
  ['los-alcazares', 'Los Alcázares', 'Murcia', 'Región de Murcia', 'murcia', 'Murcia', 50, 40, 37.7441, -0.8505, 145]
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
  const introHtml = `<p>Explora <strong>${name.replace(/'/g, '')}</strong> y los mejores rincones de la costa en autocaravana o camper. La recogida del vehículo se realiza en nuestra sede de <strong>${sedeLabel}</strong> (aprox. ${distKm} km, ${travelMin} min en coche). Con Furgocasa disfrutas de <strong>kilómetros ilimitados</strong>, asistencia 24/7 y cancelación flexible. Planifica pernocta y servicios con <a href="https://www.mapafurgocasa.com" rel="noopener noreferrer">Mapa Furgocasa</a>.</p>`;
  
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
        '<p>Descubre la gastronomía local al planificar tu viaje: productos frescos del mar, arroces típicos de la costa y buena cocina de la zona son el complemento ideal a tu ruta en camper.</p>',
      practical_tips:
        '<p>Respeta la normativa municipal sobre estacionamiento y pernocta; usa áreas de autocaravanas o campings autorizados cerca de la costa. En temporada alta, reserva con margen y revisa el itinerario con antelación.</p>',
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
  const sedes = ['murcia', 'alicante'];
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