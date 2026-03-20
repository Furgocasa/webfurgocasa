-- Landing SEO alquiler: Hellín (prov. Albacete). Recogida en sede Albacete.
INSERT INTO location_targets (
  slug,
  name,
  province,
  region,
  nearest_location_id,
  distance_km,
  travel_time_minutes,
  meta_title,
  meta_description,
  h1_title,
  latitude,
  longitude,
  hero_content,
  intro_text,
  is_active,
  display_order
)
SELECT
  'hellin',
  'Hellín',
  'Albacete',
  'Castilla-La Mancha',
  loc.id,
  54,
  45,
  'Alquiler de Autocaravanas Camper en Hellín - Furgocasa',
  'Alquiler de autocaravanas y campers en Hellín. Recogida en Albacete. Kilómetros ilimitados, asistencia 24/7 y cancelación gratuita. Paga el 50% al reservar.',
  'Alquiler de Autocaravanas en Hellín (casas rodantes / motorhomes)',
  38.5106,
  -1.7015,
  jsonb_build_object(
    'title', 'ALQUILER CAMPER HELLÍN',
    'subtitle', 'Recogida en nuestra sede de Albacete',
    'has_office', false,
    'office_notice', 'Nuestra sede de recogida en Albacete queda a unos 54 km (≈45 min) en coche desde Hellín.'
  ),
  'Si buscas **alquiler de camper o autocaravana en Hellín**, en Furgocasa tienes furgonetas camper de gran volumen, totalmente equipadas. Reserva online y **recoge el vehículo en nuestra sede de Albacete**, muy cercana a Hellín.',
  true,
  43
FROM locations loc
WHERE loc.slug = 'albacete'
  AND loc.is_active = true
LIMIT 1
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  province = EXCLUDED.province,
  region = EXCLUDED.region,
  nearest_location_id = EXCLUDED.nearest_location_id,
  distance_km = EXCLUDED.distance_km,
  travel_time_minutes = EXCLUDED.travel_time_minutes,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  h1_title = EXCLUDED.h1_title,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  hero_content = EXCLUDED.hero_content,
  intro_text = EXCLUDED.intro_text,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
