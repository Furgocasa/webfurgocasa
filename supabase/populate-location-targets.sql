-- ============================================
-- POBLAR location_targets con ciudades objetivo SEO
-- ============================================
-- IMPORTANTE: Ejecutar DESPUÉS de tener datos en la tabla locations
-- Necesitas conocer los IDs de Murcia y Madrid primero

-- IDs de las sedes físicas (obtenidos de la tabla locations):
-- Murcia: 65416e82-2f98-40bd-a90f-7ab54e59942e
-- Madrid: 704bcc62-a0e4-4629-88f3-a55b70d6a174

-- ============================================
-- REGIÓN DE MURCIA (cerca de sede Murcia)
-- ============================================

-- Cartagena (45 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  hero_content,
  intro_text,
  is_active, display_order
) VALUES (
  'cartagena',
  'Cartagena',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e', -- UUID de Murcia
  55,
  45,
  'Alquiler de Autocaravanas Camper en Cartagena - Furgocasa Campervans',
  'Alquila las mejores autocaravanas camper en Cartagena. Recogida en nuestra sede de Murcia, a solo 45 minutos. Vehículos nuevos y totalmente equipados.',
  'Alquiler de Autocaravanas en Cartagena (casas rodantes / motorhomes)',
  37.6256, -0.9965,
  '{"title": "ALQUILER CAMPER CARTAGENA", "subtitle": "No estamos en Cartagena ¡¡Pero estamos muy cerca!!", "has_office": false, "office_notice": "Nuestra sede en Casillas, Murcia, está a apenas 55 kilómetros; 45 minutos en coche. ¡¡Te merecerá la pena venir!!"}'::jsonb,
  'Si buscas **alquiler de casa rodante en Cartagena**, en Furgocasa te ofrecemos las mejores campers de Gran Volumen, equipadas con todo lo necesario para viajar con todas las comodidades. Reserva online, confirma tu vehículo y recoge en nuestra sede de Murcia (Casillas) con un proceso rápido y sencillo.',
  true, 1
);

-- Lorca (65 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'lorca',
  'Lorca',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  65,
  55,
  'Alquiler de Autocaravanas Camper en Lorca - Furgocasa Campervans',
  'Alquila autocaravanas camper en Lorca. Recogida en Murcia capital. Las mejores campers para explorar Lorca y el Valle del Guadalentín.',
  'Alquiler de Autocaravanas en Lorca',
  37.6761, -1.7006,
  true, 2
);

-- Águilas (105 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'aguilas',
  'Águilas',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  105,
  90,
  'Alquiler de Autocaravanas Camper en Águilas - Furgocasa Campervans',
  'Alquila campers en Águilas. Recogida en Murcia. Explora las playas vírgenes de Águilas en autocaravana.',
  'Alquiler de Autocaravanas en Águilas',
  37.4067, -1.5833,
  true, 3
);

-- Mazarrón (70 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'mazarron',
  'Mazarrón',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  70,
  60,
  'Alquiler de Autocaravanas Camper en Mazarrón - Furgocasa Campervans',
  'Alquila autocaravanas en Mazarrón. Recoge tu camper en Murcia y disfruta de las playas de Mazarrón.',
  'Alquiler de Autocaravanas en Mazarrón',
  37.5997, -1.3139,
  true, 4
);

-- La Manga del Mar Menor (75 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'la-manga-del-mar-menor',
  'La Manga del Mar Menor',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  75,
  60,
  'Alquiler de Autocaravanas Camper en La Manga - Furgocasa Campervans',
  'Alquila campers para La Manga del Mar Menor. Recogida en Murcia. Dos mares en una sola costa.',
  'Alquiler de Autocaravanas en La Manga del Mar Menor',
  37.6436, -0.7406,
  true, 5
);

-- Caravaca de la Cruz (70 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'caravaca-de-la-cruz',
  'Caravaca de la Cruz',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  70,
  65,
  'Alquiler de Autocaravanas Camper en Caravaca - Furgocasa Campervans',
  'Alquila autocaravanas en Caravaca de la Cruz. Ciudad Santa y naturaleza. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Caravaca de la Cruz',
  38.1076, -1.8603,
  true, 6
);

-- Jumilla (75 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'jumilla',
  'Jumilla',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  75,
  60,
  'Alquiler de Autocaravanas Camper en Jumilla - Furgocasa Campervans',
  'Alquila campers en Jumilla. Ruta del vino en autocaravana. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Jumilla',
  38.4750, -1.3256,
  true, 7
);

-- Yecla (95 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'yecla',
  'Yecla',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  95,
  75,
  'Alquiler de Autocaravanas Camper en Yecla - Furgocasa Campervans',
  'Alquila autocaravanas en Yecla. Vinos y naturaleza. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Yecla',
  38.6167, -1.1167,
  true, 8
);

-- Cieza (45 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'cieza',
  'Cieza',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  45,
  40,
  'Alquiler de Autocaravanas Camper en Cieza - Furgocasa Campervans',
  'Alquila campers en Cieza. Floración de melocotoneros en primavera. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Cieza',
  38.2394, -1.4208,
  true, 9
);

-- Las Torres de Cotillas (10 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'las-torres-de-cotillas',
  'Las Torres de Cotillas',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  10,
  15,
  'Alquiler de Autocaravanas Camper en Las Torres de Cotillas - Furgocasa',
  'Alquila autocaravanas en Las Torres de Cotillas. A solo 15 minutos de nuestra sede en Murcia.',
  'Alquiler de Autocaravanas en Las Torres de Cotillas',
  38.0192, -1.2339,
  true, 10
);

-- Archena (25 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'archena',
  'Archena',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  25,
  25,
  'Alquiler de Autocaravanas Camper en Archena - Furgocasa Campervans',
  'Alquila campers en Archena. Balnearios termales y naturaleza. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Archena',
  38.1167, -1.3000,
  true, 11
);

-- Alhama de Murcia (35 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'alhama',
  'Alhama de Murcia',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  35,
  30,
  'Alquiler de Autocaravanas Camper en Alhama - Furgocasa Campervans',
  'Alquila autocaravanas en Alhama de Murcia. Sierra Espuña y patrimonio. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Alhama de Murcia',
  37.8508, -1.4253,
  true, 12
);

-- Sierra Espuña (55 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'sierra-espuna',
  'Sierra Espuña',
  'Murcia',
  'Región de Murcia',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  55,
  50,
  'Alquiler de Autocaravanas Camper en Sierra Espuña - Furgocasa',
  'Alquila campers para Sierra Espuña. Naturaleza y senderismo. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Sierra Espuña',
  37.8833, -1.5500,
  true, 13
);

-- ============================================
-- COMUNIDAD VALENCIANA (cerca de Murcia o Madrid según distancia)
-- ============================================

-- Alicante (80 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'alicante',
  'Alicante',
  'Alicante',
  'Comunidad Valenciana',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  80,
  65,
  'Alquiler de Autocaravanas Camper en Alicante - Furgocasa Campervans',
  'Alquila las mejores autocaravanas camper en Alicante. Recogida en Murcia. Costa Blanca y playas paradisíacas.',
  'Alquiler de Autocaravanas en Alicante',
  38.3460, -0.4907,
  true, 20
);

-- Elche (60 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'elche',
  'Elche',
  'Alicante',
  'Comunidad Valenciana',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  60,
  50,
  'Alquiler de Autocaravanas Camper en Elche - Furgocasa Campervans',
  'Alquila campers en Elche. Palmeral y playas. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Elche',
  38.2621, -0.7017,
  true, 21
);

-- Torrevieja (50 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'torrevieja',
  'Torrevieja',
  'Alicante',
  'Comunidad Valenciana',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  50,
  45,
  'Alquiler de Autocaravanas Camper en Torrevieja - Furgocasa Campervans',
  'Alquila autocaravanas en Torrevieja. Lagunas rosas y playas. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Torrevieja',
  37.9788, -0.6920,
  true, 22
);

-- Orihuela (40 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'orihuela',
  'Orihuela',
  'Alicante',
  'Comunidad Valenciana',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  40,
  35,
  'Alquiler de Autocaravanas Camper en Orihuela - Furgocasa Campervans',
  'Alquila campers en Orihuela. Costa y patrimonio. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Orihuela',
  38.0850, -0.9456,
  true, 23
);

-- Benidorm (130 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'benidorm',
  'Benidorm',
  'Alicante',
  'Comunidad Valenciana',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  130,
  100,
  'Alquiler de Autocaravanas Camper en Benidorm - Furgocasa Campervans',
  'Alquila autocaravanas en Benidorm. Playas y ocio. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Benidorm',
  38.5387, -0.1312,
  true, 24
);

-- Valencia (280 km de Murcia, 340 km de Madrid - más cerca de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'valencia',
  'Valencia',
  'Valencia',
  'Comunidad Valenciana',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  280,
  180,
  'Alquiler de Autocaravanas Camper en Valencia - Furgocasa Campervans',
  'Alquila las mejores campers en Valencia. Ciudad de las Artes y las Ciencias. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Valencia',
  39.4699, -0.3763,
  true, 25
);

-- ============================================
-- ANDALUCÍA (cerca de Murcia)
-- ============================================

-- Almería (220 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'almeria',
  'Almería',
  'Almería',
  'Andalucía',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  220,
  140,
  'Alquiler de Autocaravanas Camper en Almería - Furgocasa Campervans',
  'Alquila campers en Almería. Cabo de Gata y desierto. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Almería',
  36.8381, -2.4597,
  true, 30
);

-- Cabo de Gata (250 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'cabo-de-gata',
  'Cabo de Gata',
  'Almería',
  'Andalucía',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  250,
  160,
  'Alquiler de Autocaravanas Camper en Cabo de Gata - Furgocasa',
  'Alquila autocaravanas para Cabo de Gata. Playas vírgenes. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Cabo de Gata',
  36.7500, -2.2167,
  true, 31
);

-- Granada (370 km de Murcia, 420 km de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'granada',
  'Granada',
  'Granada',
  'Andalucía',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  370,
  240,
  'Alquiler de Autocaravanas Camper en Granada - Furgocasa Campervans',
  'Alquila campers en Granada. Alhambra y Sierra Nevada. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Granada',
  37.1773, -3.5986,
  true, 32
);

-- Jaén (260 km de Murcia, 330 km de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'jaen',
  'Jaén',
  'Jaén',
  'Andalucía',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  260,
  170,
  'Alquiler de Autocaravanas Camper en Jaén - Furgocasa Campervans',
  'Alquila autocaravanas en Jaén. Ruta del aceite de oliva. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Jaén',
  37.7796, -3.7849,
  true, 33
);

-- Málaga (450 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'malaga',
  'Málaga',
  'Málaga',
  'Andalucía',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  450,
  280,
  'Alquiler de Autocaravanas Camper en Málaga - Furgocasa Campervans',
  'Alquila campers en Málaga. Costa del Sol. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Málaga',
  36.7213, -4.4214,
  true, 34
);

-- Marbella (500 km de Murcia)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'marbella',
  'Marbella',
  'Málaga',
  'Andalucía',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  500,
  300,
  'Alquiler de Autocaravanas Camper en Marbella - Furgocasa Campervans',
  'Alquila autocaravanas en Marbella. Lujo y playas. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Marbella',
  36.5115, -4.8826,
  true, 35
);

-- ============================================
-- CASTILLA-LA MANCHA (cerca de Madrid o Murcia según distancia)
-- ============================================

-- Albacete (150 km de Murcia, 250 km de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'albacete',
  'Albacete',
  'Albacete',
  'Castilla-La Mancha',
  '65416e82-2f98-40bd-a90f-7ab54e59942e',
  150,
  100,
  'Alquiler de Autocaravanas Camper en Albacete - Furgocasa Campervans',
  'Alquila campers en Albacete. Naturaleza manchega. Recogida en Murcia.',
  'Alquiler de Autocaravanas en Albacete',
  38.9943, -1.8585,
  true, 40
);

-- Cuenca (220 km de Murcia, 160 km de Madrid - más cerca de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'cuenca',
  'Cuenca',
  'Cuenca',
  'Castilla-La Mancha',
  '704bcc62-a0e4-4629-88f3-a55b70d6a174',  160,
  110,
  'Alquiler de Autocaravanas Camper en Cuenca - Furgocasa Campervans',
  'Alquila autocaravanas en Cuenca. Casas colgadas y naturaleza. Recogida en Madrid.',
  'Alquiler de Autocaravanas en Cuenca',
  40.0704, -2.1374,
  true, 41
);

-- Toledo (85 km de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'toledo',
  'Toledo',
  'Toledo',
  'Castilla-La Mancha',
  '704bcc62-a0e4-4629-88f3-a55b70d6a174',  85,
  60,
  'Alquiler de Autocaravanas Camper en Toledo - Furgocasa Campervans',
  'Alquila campers en Toledo. Ciudad imperial. Recogida en Madrid.',
  'Alquiler de Autocaravanas en Toledo',
  39.8628, -4.0273,
  true, 42
);

-- ============================================
-- CASTILLA Y LEÓN (cerca de Madrid)
-- ============================================

-- Salamanca (220 km de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'salamanca',
  'Salamanca',
  'Salamanca',
  'Castilla y León',
  '704bcc62-a0e4-4629-88f3-a55b70d6a174',  220,
  140,
  'Alquiler de Autocaravanas Camper en Salamanca - Furgocasa Campervans',
  'Alquila autocaravanas en Salamanca. Universidad histórica. Recogida en Madrid.',
  'Alquiler de Autocaravanas en Salamanca',
  40.9701, -5.6635,
  true, 50
);

-- Segovia (95 km de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'segovia',
  'Segovia',
  'Segovia',
  'Castilla y León',
  '704bcc62-a0e4-4629-88f3-a55b70d6a174',  95,
  65,
  'Alquiler de Autocaravanas Camper en Segovia - Furgocasa Campervans',
  'Alquila campers en Segovia. Acueducto romano y Alcázar. Recogida en Madrid.',
  'Alquiler de Autocaravanas en Segovia',
  40.9429, -4.1088,
  true, 51
);

-- Ávila (115 km de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'avila',
  'Ávila',
  'Ávila',
  'Castilla y León',
  '704bcc62-a0e4-4629-88f3-a55b70d6a174',  115,
  75,
  'Alquiler de Autocaravanas Camper en Ávila - Furgocasa Campervans',
  'Alquila autocaravanas en Ávila. Murallas medievales. Recogida en Madrid.',
  'Alquiler de Autocaravanas en Ávila',
  40.6561, -4.6812,
  true, 52
);

-- Valladolid (200 km de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'valladolid',
  'Valladolid',
  'Valladolid',
  'Castilla y León',
  '704bcc62-a0e4-4629-88f3-a55b70d6a174',  200,
  130,
  'Alquiler de Autocaravanas Camper en Valladolid - Furgocasa Campervans',
  'Alquila campers en Valladolid. Ribera del Duero. Recogida en Madrid.',
  'Alquiler de Autocaravanas en Valladolid',
  41.6528, -4.7245,
  true, 53
);

-- Burgos (240 km de Madrid)
INSERT INTO location_targets (
  slug, name, province, region,
  nearest_location_id, distance_km, travel_time_minutes,
  meta_title, meta_description, h1_title,
  latitude, longitude,
  is_active, display_order
) VALUES (
  'burgos',
  'Burgos',
  'Burgos',
  'Castilla y León',
  '704bcc62-a0e4-4629-88f3-a55b70d6a174',  240,
  160,
  'Alquiler de Autocaravanas Camper en Burgos - Furgocasa Campervans',
  'Alquila autocaravanas en Burgos. Catedral gótica y Camino de Santiago. Recogida en Madrid.',
  'Alquiler de Autocaravanas en Burgos',
  42.3439, -3.6969,
  true, 54
);

-- ============================================
-- NOTA: Script actualizado con los UUIDs reales de las sedes
-- Ya puedes ejecutar este script completo en Supabase SQL Editor
-- ============================================
