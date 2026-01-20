-- ============================================
-- POBLAR sale_location_targets con ciudades principales
-- ============================================
-- Ciudades que aparecen en el CSV de Google Search Console

-- IMPORTANTE: Primero obtén los IDs de locations (Murcia y Madrid)
-- SELECT id, name FROM locations WHERE city IN ('Murcia', 'Madrid');
-- Reemplaza los UUIDs abajo con los reales

-- Variable temporal (reemplazar con IDs reales)
DO $$
DECLARE
  murcia_location_id UUID;
  madrid_location_id UUID;
BEGIN
  -- Obtener IDs de las sedes físicas
  SELECT id INTO murcia_location_id FROM locations WHERE city = 'Murcia' LIMIT 1;
  SELECT id INTO madrid_location_id FROM locations WHERE city = 'Madrid' LIMIT 1;

  -- ============================================
  -- REGIÓN DE MURCIA (cerca de Murcia)
  -- ============================================
  
  -- Murcia (sede física)
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'murcia',
    'Murcia',
    'Murcia',
    'Región de Murcia',
    murcia_location_id,
    0,
    0,
    'Venta de Autocaravanas y Campers en Murcia | Furgocasa',
    'Compra tu autocaravana o camper en Murcia. Vehículos premium, garantía y financiación. Entrega inmediata en nuestra sede.',
    'Venta de Autocaravanas y Campers en Murcia',
    'En Furgocasa Murcia encontrarás la mejor selección de autocaravanas y campers en venta. Contamos con stock disponible y entrega inmediata.',
    1,
    true
  ) ON CONFLICT (slug) DO UPDATE SET
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = NOW();
  
  -- Cartagena
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'cartagena',
    'Cartagena',
    'Murcia',
    'Región de Murcia',
    murcia_location_id,
    45,
    35,
    'Venta de Autocaravanas en Cartagena | Entrega en Murcia | Furgocasa',
    'Compra tu autocaravana en Cartagena. Entrega desde nuestra sede en Murcia a solo 35 minutos. Vehículos premium con garantía.',
    'Venta de Autocaravanas en Cartagena',
    'Encuentra tu autocaravana perfecta para Cartagena y su increíble litoral. Entrega desde Murcia a solo 45 km.',
    10,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Lorca
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'lorca',
    'Lorca',
    'Murcia',
    'Región de Murcia',
    murcia_location_id,
    65,
    50,
    'Venta de Autocaravanas en Lorca | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana o camper en Lorca. Entrega desde Murcia en menos de 1 hora. Stock disponible y financiación.',
    'Venta de Autocaravanas en Lorca',
    'Descubre nuestra selección de autocaravanas y campers disponibles para Lorca. Entrega desde Murcia a 65 km.',
    11,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Torrevieja
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'torrevieja',
    'Torrevieja',
    'Alicante',
    'Comunidad Valenciana',
    murcia_location_id,
    50,
    40,
    'Venta de Autocaravanas en Torrevieja | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Torrevieja. Entrega desde nuestra sede en Murcia. Vehículos premium con garantía y financiación.',
    'Venta de Autocaravanas en Torrevieja',
    'Encuentra tu autocaravana ideal en Torrevieja. Entrega desde Murcia a solo 50 km.',
    12,
    true
  ) ON CONFLICT (slug) DO NOTHING;

  -- San Javier
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'san-javier',
    'San Javier',
    'Murcia',
    'Región de Murcia',
    murcia_location_id,
    35,
    30,
    'Venta de Autocaravanas en San Javier | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en San Javier y Mar Menor. Entrega desde Murcia. Stock disponible.',
    'Venta de Autocaravanas en San Javier',
    'Encuentra la autocaravana perfecta para explorar San Javier y el Mar Menor. Entrega desde Murcia.',
    13,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- ============================================
  -- COMUNIDAD VALENCIANA
  -- ============================================
  
  -- Alicante
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'alicante',
    'Alicante',
    'Alicante',
    'Comunidad Valenciana',
    murcia_location_id,
    80,
    60,
    'Venta de Autocaravanas en Alicante | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Alicante. Entrega desde Murcia. Vehículos premium, garantía y financiación disponible.',
    'Venta de Autocaravanas en Alicante',
    'Encuentra tu autocaravana ideal en Alicante. Amplia selección de vehículos y entrega desde Murcia.',
    20,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Benidorm
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'benidorm',
    'Benidorm',
    'Alicante',
    'Comunidad Valenciana',
    murcia_location_id,
    130,
    90,
    'Venta de Autocaravanas en Benidorm | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Benidorm. Entrega desde Murcia. Stock disponible y financiación.',
    'Venta de Autocaravanas en Benidorm',
    'Descubre nuestra selección de autocaravanas para disfrutar de Benidorm y la Costa Blanca.',
    21,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Elche
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'elche',
    'Elche',
    'Alicante',
    'Comunidad Valenciana',
    murcia_location_id,
    60,
    45,
    'Venta de Autocaravanas en Elche | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Elche. Entrega desde Murcia a menos de 1 hora. Vehículos premium con garantía.',
    'Venta de Autocaravanas en Elche',
    'Encuentra tu autocaravana ideal en Elche. Entrega rápida desde nuestra sede en Murcia.',
    22,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Orihuela
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'orihuela',
    'Orihuela',
    'Alicante',
    'Comunidad Valenciana',
    murcia_location_id,
    40,
    35,
    'Venta de Autocaravanas en Orihuela | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Orihuela. Entrega desde Murcia. Stock disponible y garantía.',
    'Venta de Autocaravanas en Orihuela',
    'Descubre nuestra selección de autocaravanas para Orihuela y la Vega Baja.',
    23,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Denia
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'denia',
    'Denia',
    'Alicante',
    'Comunidad Valenciana',
    murcia_location_id,
    160,
    120,
    'Venta de Autocaravanas en Denia | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Denia. Entrega desde Murcia. Vehículos premium y financiación.',
    'Venta de Autocaravanas en Denia',
    'Encuentra tu autocaravana perfecta para Denia y la Marina Alta.',
    24,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Calpe
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'calpe',
    'Calpe',
    'Alicante',
    'Comunidad Valenciana',
    murcia_location_id,
    145,
    105,
    'Venta de Autocaravanas en Calpe | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Calpe. Entrega desde Murcia. Stock disponible.',
    'Venta de Autocaravanas en Calpe',
    'Descubre nuestra selección de autocaravanas para Calpe y la Marina Alta.',
    25,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Valencia
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'valencia',
    'Valencia',
    'Valencia',
    'Comunidad Valenciana',
    murcia_location_id,
    280,
    180,
    'Venta de Autocaravanas en Valencia | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Valencia. Entrega desde nuestra sede en Murcia. Vehículos premium con garantía.',
    'Venta de Autocaravanas en Valencia',
    'Encuentra tu autocaravana ideal en Valencia. Amplia selección y entrega desde Murcia.',
    26,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- ============================================
  -- ANDALUCÍA
  -- ============================================
  
  -- Málaga
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'malaga',
    'Málaga',
    'Málaga',
    'Andalucía',
    murcia_location_id,
    450,
    300,
    'Venta de Autocaravanas en Málaga | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Málaga. Entrega desde Murcia. Vehículos premium con garantía y financiación.',
    'Venta de Autocaravanas en Málaga',
    'Descubre nuestra selección de autocaravanas para Málaga y la Costa del Sol.',
    30,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Granada
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'granada',
    'Granada',
    'Granada',
    'Andalucía',
    murcia_location_id,
    370,
    240,
    'Venta de Autocaravanas en Granada | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Granada. Entrega desde Murcia. Stock disponible y financiación.',
    'Venta de Autocaravanas en Granada',
    'Encuentra tu autocaravana ideal para Granada y Sierra Nevada.',
    31,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Almería
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'almeria',
    'Almería',
    'Almería',
    'Andalucía',
    murcia_location_id,
    220,
    150,
    'Venta de Autocaravanas en Almería | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Almería. Entrega desde Murcia. Vehículos premium con garantía.',
    'Venta de Autocaravanas en Almería',
    'Descubre nuestra selección de autocaravanas para Almería y Cabo de Gata.',
    32,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Jaén
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'jaen',
    'Jaén',
    'Jaén',
    'Andalucía',
    murcia_location_id,
    260,
    180,
    'Venta de Autocaravanas en Jaén | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Jaén. Entrega desde Murcia. Stock disponible.',
    'Venta de Autocaravanas en Jaén',
    'Encuentra tu autocaravana perfecta para Jaén y la Sierra de Cazorla.',
    33,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Vera
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'vera',
    'Vera',
    'Almería',
    'Andalucía',
    murcia_location_id,
    120,
    90,
    'Venta de Autocaravanas en Vera | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Vera. Entrega desde Murcia. Vehículos premium y garantía.',
    'Venta de Autocaravanas en Vera',
    'Descubre nuestra selección de autocaravanas para Vera y el Levante Almeriense.',
    34,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- ============================================
  -- CASTILLA-LA MANCHA
  -- ============================================
  
  -- Albacete
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'albacete',
    'Albacete',
    'Albacete',
    'Castilla-La Mancha',
    murcia_location_id,
    150,
    100,
    'Venta de Autocaravanas en Albacete | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Albacete. Entrega desde Murcia. Stock disponible y financiación.',
    'Venta de Autocaravanas en Albacete',
    'Encuentra tu autocaravana ideal en Albacete. Entrega desde Murcia.',
    40,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- ============================================
  -- MADRID
  -- ============================================
  
  -- Madrid
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'madrid',
    'Madrid',
    'Madrid',
    'Comunidad de Madrid',
    madrid_location_id,
    0,
    0,
    'Venta de Autocaravanas en Madrid | Furgocasa',
    'Compra tu autocaravana en Madrid. Vehículos premium con garantía y financiación. Entrega disponible.',
    'Venta de Autocaravanas en Madrid',
    'En Furgocasa Madrid encontrarás una selección de autocaravanas premium disponibles para entrega.',
    50,
    true
  ) ON CONFLICT (slug) DO UPDATE SET
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    updated_at = NOW();
  
  -- Alcorcón
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'alcorcon',
    'Alcorcón',
    'Madrid',
    'Comunidad de Madrid',
    madrid_location_id,
    15,
    20,
    'Venta de Autocaravanas en Alcorcón | Entrega desde Madrid | Furgocasa',
    'Compra tu autocaravana en Alcorcón. Entrega desde Madrid. Stock disponible.',
    'Venta de Autocaravanas en Alcorcón',
    'Descubre nuestra selección de autocaravanas para Alcorcón y alrededores.',
    51,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Getafe
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'getafe',
    'Getafe',
    'Madrid',
    'Comunidad de Madrid',
    madrid_location_id,
    15,
    25,
    'Venta de Autocaravanas en Getafe | Entrega desde Madrid | Furgocasa',
    'Compra tu autocaravana en Getafe. Entrega desde Madrid. Vehículos premium.',
    'Venta de Autocaravanas en Getafe',
    'Encuentra tu autocaravana ideal en Getafe. Entrega desde Madrid.',
    52,
    true
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Yecla
  INSERT INTO sale_location_targets (
    slug, name, province, region,
    nearest_location_id, distance_km, travel_time_minutes,
    meta_title, meta_description, h1_title,
    intro_text, display_order, is_active
  ) VALUES (
    'yecla',
    'Yecla',
    'Murcia',
    'Región de Murcia',
    murcia_location_id,
    95,
    70,
    'Venta de Autocaravanas en Yecla | Entrega desde Murcia | Furgocasa',
    'Compra tu autocaravana en Yecla. Entrega desde Murcia. Stock disponible.',
    'Venta de Autocaravanas en Yecla',
    'Descubre nuestra selección de autocaravanas para Yecla y la Ruta del Vino.',
    14,
    true
  ) ON CONFLICT (slug) DO NOTHING;

END $$;
