-- ============================================
-- AÑADIR location_targets para sedes físicas (Murcia y Madrid)
-- ============================================
-- Estas son ubicaciones que SÍ tienen sede física, pero también 
-- necesitan aparecer en location_targets para tener su página SEO

-- Murcia (tiene sede física)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  hero_content,
  intro_text,
  is_active, display_order
) VALUES (
  'murcia',
  'Murcia',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e', -- Apunta a sí misma
  0,
  0,
  'Alquiler de Autocaravanas Camper en Murcia - Furgocasa Campervans',
  'Alquila las mejores autocaravanas camper en Murcia. Vehículos nuevos, totalmente equipados. Nuestra sede en Murcia.',
  'Alquiler de Autocaravanas en Murcia (casas rodantes / motorhomes)',
  37.9922, -1.1307,
  '{"title": "ALQUILER CAMPER MURCIA", "subtitle": "Nuestra sede en Casillas, Murcia", "has_office": true, "office_notice": "Recoge tu camper directamente en nuestra sede"}'::jsonb,
  'Si buscas **alquiler de casa rodante en Murcia**, en Furgocasa te ofrecemos las mejores campers de Gran Volumen, equipadas con todo lo necesario para viajar con todas las comodidades. Reserva online, confirma tu vehículo y recoge en nuestra sede de Murcia (Casillas) con un proceso rápido y sencillo.',
  true, 100
)
ON CONFLICT (slug) DO NOTHING;

-- Madrid (tiene sede física - pero solo mínimo 10 días)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  hero_content,
  intro_text,
  is_active, display_order
) VALUES (
  'madrid',
  'Madrid',
  'Madrid',
  'Comunidad de Madrid',
  '704bcc62-a0e4-4629-88f3-a55b70d6a174', -- Apunta a sí misma
  0,
  0,
  'Alquiler de Autocaravanas Camper en Madrid - Furgocasa Campervans',
  'Alquila autocaravanas camper en Madrid. Duración mínima 10 días. Las mejores campers para explorar Madrid y alrededores.',
  'Alquiler de Autocaravanas en Madrid (casas rodantes / motorhomes)',
  40.4168, -3.7038,
  '{"title": "ALQUILER CAMPER MADRID", "subtitle": "Duración mínima del alquiler en Madrid: 10 días", "has_office": true, "office_notice": "Recoge tu camper en nuestra ubicación de Madrid"}'::jsonb,
  'Si buscas **alquiler de casa rodante en Madrid**, en Furgocasa te ofrecemos campers y autocaravanas equipadas con todo lo necesario. Reserva online, confirma tu vehículo y recoge con un proceso rápido y sencillo. **Duración mínima de alquiler: 10 días**.',
  true, 101
)
ON CONFLICT (slug) DO NOTHING;
