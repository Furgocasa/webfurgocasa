-- =============================================================================
-- Localidades SEO "anillo" sedes Madrid, Alicante y Albacete (~22 destinos)
-- Recogida en la sede indicada; content_sections mínimo (ampliable luego)
-- =============================================================================

WITH cities(
  slug,
  name,
  province,
  region,
  sede_slug,
  sede_label,
  dist_km,
  travel_min,
  lat,
  lon,
  disp
) AS (
  VALUES
    -- Madrid (8)
    ('mostoles', 'Móstoles', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 20, 25, 40.3228::numeric, -3.8647::numeric, 110),
    ('alcala-de-henares', 'Alcalá de Henares', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 35, 35, 40.4820::numeric, -3.3635::numeric, 111),
    ('fuenlabrada', 'Fuenlabrada', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 22, 25, 40.2846::numeric, -3.7942::numeric, 112),
    ('leganes', 'Leganés', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 12, 20, 40.3265::numeric, -3.7635::numeric, 113),
    ('getafe', 'Getafe', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 16, 22, 40.3083::numeric, -3.7327::numeric, 114),
    ('alcorcon', 'Alcorcón', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 15, 20, 40.3458::numeric, -3.8247::numeric, 115),
    ('las-rozas-de-madrid', 'Las Rozas de Madrid', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 22, 28, 40.4936::numeric, -3.8737::numeric, 116),
    ('alcobendas', 'Alcobendas', 'Madrid', 'Comunidad de Madrid', 'madrid', 'Madrid', 18, 25, 40.5475::numeric, -3.6420::numeric, 117),
    -- Alicante (7)
    ('gandia', 'Gandía', 'Valencia', 'Comunidad Valenciana', 'alicante', 'Alicante', 95, 60, 38.9672::numeric, -0.1823::numeric, 118),
    ('denia', 'Dénia', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 95, 65, 38.8408::numeric, 0.1057::numeric, 119),
    ('alcoy', 'Alcoy', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 62, 45, 38.6984::numeric, -0.4735::numeric, 120),
    ('san-vicente-del-raspeig', 'San Vicente del Raspeig', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 12, 15, 38.3964::numeric, -0.5255::numeric, 121),
    ('elda', 'Elda', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 35, 30, 38.4776::numeric, -0.7956::numeric, 122),
    ('villena', 'Villena', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 58, 40, 38.6350::numeric, -0.8656::numeric, 123),
    ('xativa', 'Xàtiva', 'Valencia', 'Comunidad Valenciana', 'alicante', 'Alicante', 105, 70, 38.9886::numeric, -0.5190::numeric, 124),
    -- Albacete (7)
    ('tomelloso', 'Tomelloso', 'Ciudad Real', 'Castilla-La Mancha', 'albacete', 'Albacete', 115, 70, 39.1570::numeric, -3.0240::numeric, 125),
    ('alcazar-de-san-juan', 'Alcázar de San Juan', 'Ciudad Real', 'Castilla-La Mancha', 'albacete', 'Albacete', 72, 48, 39.3901::numeric, -3.2076::numeric, 126),
    ('valdepenas', 'Valdepeñas', 'Ciudad Real', 'Castilla-La Mancha', 'albacete', 'Albacete', 102, 65, 38.7621::numeric, -3.3956::numeric, 127),
    ('villarrobledo', 'Villarrobledo', 'Albacete', 'Castilla-La Mancha', 'albacete', 'Albacete', 82, 55, 39.2692::numeric, -2.6050::numeric, 128),
    ('almansa', 'Almansa', 'Albacete', 'Castilla-La Mancha', 'albacete', 'Albacete', 70, 50, 38.8680::numeric, -1.0970::numeric, 129),
    ('manzanares', 'Manzanares', 'Ciudad Real', 'Castilla-La Mancha', 'albacete', 'Albacete', 105, 70, 38.9991::numeric, -3.3700::numeric, 130),
    ('la-roda', 'La Roda', 'Albacete', 'Castilla-La Mancha', 'albacete', 'Albacete', 48, 35, 39.2040::numeric, -2.1580::numeric, 131)
)
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
  content_sections,
  is_active,
  display_order
)
SELECT
  c.slug,
  c.name,
  c.province,
  c.region,
  loc.id,
  c.dist_km,
  c.travel_min,
  'Alquiler de Autocaravanas Camper en ' || c.name || ' - Furgocasa',
  'Alquiler de autocaravanas y campers en ' || c.name || '. Recogida en ' || c.sede_label || '. Kilómetros ilimitados, asistencia 24/7 y cancelación gratuita. Paga el 50% al reservar.',
  'Alquiler de Autocaravanas en ' || c.name || ' (casas rodantes / motorhomes)',
  c.lat,
  c.lon,
  jsonb_build_object(
    'title', 'ALQUILER CAMPER ' || upper(replace(c.slug, '-', ' ')),
    'subtitle', 'Recogida en sede ' || c.sede_label,
    'has_office', false,
    'office_notice',
    'Recoge tu camper en nuestra sede de ' || c.sede_label || '. Desde ' || c.name || ' son aprox. ' || c.dist_km || ' km (' || c.travel_min || ' min en coche).'
  ),
  'Si buscas **alquiler de camper o autocaravana** cerca de **' || c.name || '**, en Furgocasa tienes furgonetas de gran volumen con equipamiento completo. Reserva online y **recoge en nuestra sede de ' || c.sede_label || '**.',
  jsonb_build_object(
    'introduction',
    '<p>Explora <strong>' || replace(c.name, '''', '') || '</strong> y alrededores en autocaravana o camper. La recogida del vehículo se realiza en nuestra sede de <strong>' || c.sede_label || '</strong> (aprox. ' || c.dist_km || ' km, ' || c.travel_min || ' min en coche). Con Furgocasa disfrutas de <strong>kilómetros ilimitados</strong>, asistencia 24/7 y cancelación flexible. Planifica pernocta y servicios con <a href="https://www.mapafurgocasa.com" rel="noopener noreferrer">Mapa Furgocasa</a>.</p>',
    'attractions', '[]'::jsonb,
    'parking_areas', '[]'::jsonb,
    'routes', '[]'::jsonb,
    'gastronomy',
    '<p>Descubre la gastronomía local al planificar tu viaje: mercados, productos de temporada y buena cocina de la zona son el complemento ideal a tu ruta en camper.</p>',
    'practical_tips',
    '<p>Respeta la normativa municipal sobre estacionamiento y pernocta; usa áreas autorizadas. En temporada alta, reserva con margen y revisa el itinerario con antelación.</p>'
  ),
  true,
  c.disp
FROM cities c
INNER JOIN locations loc ON loc.slug = c.sede_slug AND loc.is_active = true
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
  content_sections = EXCLUDED.content_sections,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();
