-- =============================================================================
-- Localidades SEO Costa Blanca (Alicante) y Costa Cálida (Murcia)
-- Alta y media prioridad (Santa Pola, Calpe, San Pedro del Pinatar, 
-- Guardamar del Segura, Altea, Los Alcázares)
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
    -- Costa Blanca Sur y Norte (Sede: Alicante)
    ('santa-pola', 'Santa Pola', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 20, 25, 38.1917::numeric, -0.5658::numeric, 140),
    ('calpe', 'Calpe', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 65, 50, 38.6447::numeric, 0.0445::numeric, 141),
    ('guardamar-del-segura', 'Guardamar del Segura', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 35, 35, 38.0903::numeric, -0.6558::numeric, 142),
    ('altea', 'Altea', 'Alicante', 'Comunidad Valenciana', 'alicante', 'Alicante', 55, 45, 38.5989::numeric, -0.0514::numeric, 143),
    
    -- Costa Cálida Mar Menor (Sede: Murcia)
    ('san-pedro-del-pinatar', 'San Pedro del Pinatar', 'Murcia', 'Región de Murcia', 'murcia', 'Murcia', 45, 35, 37.8356::numeric, -0.7917::numeric, 144),
    ('los-alcazares', 'Los Alcázares', 'Murcia', 'Región de Murcia', 'murcia', 'Murcia', 50, 40, 37.7441::numeric, -0.8505::numeric, 145)
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
    '<p>Explora <strong>' || replace(c.name, '''', '') || '</strong> y los mejores rincones de la costa en autocaravana o camper. La recogida del vehículo se realiza en nuestra sede de <strong>' || c.sede_label || '</strong> (aprox. ' || c.dist_km || ' km, ' || c.travel_min || ' min en coche). Con Furgocasa disfrutas de <strong>kilómetros ilimitados</strong>, asistencia 24/7 y cancelación flexible. Planifica pernocta y servicios con <a href="https://www.mapafurgocasa.com" rel="noopener noreferrer">Mapa Furgocasa</a>.</p>',
    'attractions', '[]'::jsonb,
    'parking_areas', '[]'::jsonb,
    'routes', '[]'::jsonb,
    'gastronomy',
    '<p>Descubre la gastronomía local al planificar tu viaje: productos frescos del mar, arroces típicos de la costa y buena cocina de la zona son el complemento ideal a tu ruta en camper.</p>',
    'practical_tips',
    '<p>Respeta la normativa municipal sobre estacionamiento y pernocta; usa áreas de autocaravanas o campings autorizados cerca de la costa. En temporada alta, reserva con margen y revisa el itinerario con antelación.</p>'
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
