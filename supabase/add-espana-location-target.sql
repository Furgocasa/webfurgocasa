-- ============================================
-- AÑADIR location_target para ESPAÑA (país completo)
-- ============================================
-- Esta página está orientada a atraer clientes de Latinoamérica
-- que quieran visitar España o Europa en autocaravana
-- URL: /es/alquiler-autocaravanas-campervans-espana

-- IMPORTANTE: Primero obtener el ID de la sede de Murcia
-- SELECT id FROM locations WHERE city = 'Murcia' LIMIT 1;
-- Reemplazar el UUID abajo con el real si es diferente

DO $$
DECLARE
  murcia_location_id UUID;
BEGIN
  -- Obtener ID de la sede de Murcia
  SELECT id INTO murcia_location_id FROM locations WHERE city = 'Murcia' LIMIT 1;
  
  -- Si no existe, usar el UUID conocido
  IF murcia_location_id IS NULL THEN
    murcia_location_id := '65416e82-2f98-40bd-a90f-7ab54e59942e';
  END IF;

  -- Insertar registro para España
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
    hero_image,
    is_active, 
    display_order
  ) VALUES (
    'espana',
    'España',
    NULL, -- País completo, no tiene provincia específica
    'España',
    murcia_location_id,
    0, -- No aplica distancia para país completo
    0,
    'Alquiler de Autocaravanas y Motorhomes en España para Viajeros de Latinoamérica | Furgocasa',
    'Alquila tu autocaravana o motorhome en España y explora toda Europa. Ideal para viajeros de Argentina, México, Chile, Colombia y otros países de Latinoamérica. Vehículos premium con kilómetros ilimitados.',
    'Alquiler de Autocaravanas y Motorhomes en España (Casas Rodantes)',
    40.4637, -- Coordenadas geográficas del centro de España
    -3.7492,
    '{"title": "ALQUILER MOTORHOME ESPAÑA", "subtitle": "Tu punto de partida para explorar Europa", "has_office": true, "office_notice": "Recoge tu camper en nuestras sedes de Murcia o Madrid"}'::jsonb,
    'Si venís desde **Argentina, México, Chile, Colombia o cualquier país de Latinoamérica** y querés alquilar una **casa rodante o motorhome en España** para recorrer Europa, en Furgocasa te ofrecemos las mejores autocaravanas de Gran Volumen, totalmente equipadas. Reservá online y recogé tu vehículo en nuestras sedes de Murcia o Madrid.',
    -- Contenido específico inicial (estructura JSONB)
    '{
      "introduction": "<p>España es el destino perfecto para comenzar tu aventura en autocaravana por Europa. Con nuestras sedes en <strong>Murcia</strong> y <strong>Madrid</strong>, podés recoger tu motorhome y partir hacia cualquier rincón del continente. España ofrece una red de carreteras excelente, miles de áreas de autocaravanas (áreas de servicio) y una cultura acogedora para los viajeros en casa rodante.</p><p>Desde España podés explorar fácilmente <strong>Francia, Portugal, Italia, Alemania</strong> y otros países europeos. Nuestros vehículos tienen <strong>kilómetros ilimitados</strong>, así que podés viajar sin preocupaciones por toda Europa.</p>",
      "attractions": [
        {
          "title": "La Alhambra de Granada",
          "description": "<p>Uno de los monumentos más impresionantes de España y Patrimonio de la Humanidad. La Alhambra es un complejo palaciego nazarí que combina arquitectura islámica, jardines y vistas espectaculares. Podés visitarla en autocaravana y encontrar áreas de pernocta cercanas. Recomendamos reservar entradas con anticipación, especialmente en temporada alta.</p>",
          "type": "historical"
        },
        {
          "title": "Sagrada Familia (Barcelona)",
          "description": "<p>La obra maestra inacabada de Antoni Gaudí es uno de los símbolos más reconocidos de España. Barcelona es una ciudad muy amigable para autocaravanas, con varias áreas de servicio bien equipadas en las afueras. Desde Barcelona podés continuar hacia Francia por la costa mediterránea.</p>",
          "type": "cultural"
        },
        {
          "title": "Camino de Santiago",
          "description": "<p>Una de las rutas de peregrinación más famosas del mundo. Podés hacer el Camino de Santiago en autocaravana, visitando las ciudades históricas como León, Burgos, Pamplona y Santiago de Compostela. Hay numerosas áreas de autocaravanas a lo largo de la ruta.</p>",
          "type": "cultural"
        },
        {
          "title": "Costa Brava y Costa del Sol",
          "description": "<p>España tiene algunas de las mejores playas de Europa. La Costa Brava (Cataluña) y la Costa del Sol (Andalucía) ofrecen playas paradisíacas, pueblos costeros encantadores y excelente infraestructura para autocaravanas. Muchas playas tienen áreas de pernocta cercanas.</p>",
          "type": "leisure"
        },
        {
          "title": "Parque Nacional de Doñana",
          "description": "<p>Uno de los espacios naturales más importantes de Europa, ideal para observar aves y fauna silvestre. Está en Andalucía, cerca de nuestra sede de Murcia. Hay áreas de autocaravanas en los pueblos cercanos como Matalascañas.</p>",
          "type": "natural"
        },
        {
          "title": "Museo del Prado (Madrid)",
          "description": "<p>Una de las pinacotecas más importantes del mundo, con obras de Goya, Velázquez, El Greco y otros maestros. Madrid es perfecta para recoger tu autocaravana si venís desde Latinoamérica, ya que tiene excelente conectividad aérea. Hay áreas de autocaravanas en las afueras de la ciudad.</p>",
          "type": "cultural"
        }
      ],
      "parking_areas": [
        {
          "name": "Áreas de Autocaravanas en España",
          "description": "<p>España tiene una excelente red de <strong>áreas de autocaravanas</strong> (áreas de servicio) distribuidas por todo el país. Estas áreas suelen ofrecer servicios básicos como agua, electricidad, vaciado de aguas residuales y a veces duchas. Muchas son gratuitas o tienen un coste muy bajo (2-5€ por noche). Podés encontrar áreas en casi todas las ciudades y pueblos turísticos.</p>",
          "services": ["agua", "electricidad", "vaciado", "wifi", "duchas"],
          "approximate_location": "Distribuidas por toda España"
        },
        {
          "name": "Campings en España",
          "description": "<p>España cuenta con más de 1.200 campings oficiales, muchos de los cuales aceptan autocaravanas. Los campings ofrecen más servicios (piscina, restaurante, supermercado) pero son más caros (15-40€ por noche). Son ideales si buscás más comodidades durante tu viaje.</p>",
          "services": ["agua", "electricidad", "vaciado", "wifi", "duchas", "piscina", "restaurante"],
          "approximate_location": "En todas las regiones de España"
        },
        {
          "name": "Aparcamiento en Ciudades",
          "description": "<p>En las ciudades grandes como Madrid, Barcelona, Valencia o Sevilla, podés aparcar en zonas específicas para autocaravanas o en parkings públicos. Recomendamos usar <strong>Mapa Furgocasa</strong> (www.mapafurgocasa.com) para encontrar los mejores lugares. Muchas ciudades tienen restricciones, así que informate antes de entrar al centro.</p>",
          "services": ["aparcamiento", "seguridad"],
          "approximate_location": "Centros urbanos de las principales ciudades"
        }
      ],
      "routes": [
        {
          "title": "Ruta del Sol: Costa Mediterránea Completa",
          "description": "<p>Una ruta espectacular que recorre toda la costa mediterránea española desde la <strong>Costa Brava</strong> (Cataluña) hasta <strong>Almería</strong> (Andalucía). Podés empezar en Barcelona, pasar por Valencia, Alicante, Murcia (donde está nuestra sede), y continuar hacia Málaga y la Costa del Sol. Esta ruta tiene excelente infraestructura para autocaravanas y playas increíbles. Duración recomendada: <strong>2-3 semanas</strong> para disfrutarla completamente.</p>",
          "duration": "2-3 semanas / 1.200 km",
          "difficulty": "Fácil"
        },
        {
          "title": "Ruta del Norte: De Galicia al País Vasco",
          "description": "<p>Recorrido por la <strong>Costa Verde</strong> española, desde Santiago de Compostela (Galicia) hasta San Sebastián (País Vasco). Esta ruta ofrece paisajes verdes, playas salvajes, pueblos pesqueros y una gastronomía excepcional. Pasás por ciudades como A Coruña, Santander, Bilbao. Es una ruta menos turística pero igualmente hermosa. Duración recomendada: <strong>10-14 días</strong>.</p>",
          "duration": "10-14 días / 800 km",
          "difficulty": "Media"
        },
        {
          "title": "Ruta Interior: De Madrid a Andalucía",
          "description": "<p>Desde <strong>Madrid</strong> (nuestra segunda sede) podés bajar hacia <strong>Andalucía</strong> visitando ciudades históricas como Toledo, Córdoba, Sevilla y Granada. Esta ruta combina patrimonio histórico, arquitectura árabe y flamenco. Es perfecta si querés conocer la España más auténtica. Duración recomendada: <strong>1-2 semanas</strong>.</p>",
          "duration": "1-2 semanas / 600 km",
          "difficulty": "Fácil"
        },
        {
          "title": "Ruta Trans-Pirenaica: De España a Francia",
          "description": "<p>Desde España podés cruzar los <strong>Pirineos</strong> hacia Francia por varios pasos de montaña. La ruta más popular va desde Barcelona hacia Perpiñán (Francia), pero también podés cruzar desde Navarra o el País Vasco. Los Pirineos ofrecen paisajes de montaña espectaculares. Duración recomendada: <strong>5-7 días</strong> solo para cruzar, más si querés explorar la zona.</p>",
          "duration": "5-7 días / 400 km",
          "difficulty": "Media"
        }
      ],
      "gastronomy": "<h2>Gastronomía Española</h2><p>España es uno de los países con la gastronomía más rica y variada de Europa. Cada región tiene sus especialidades, y viajar en autocaravana te permite probarlas todas.</p><h3>Platos Típicos por Región</h3><ul><li><strong>Paella Valenciana:</strong> El plato más conocido de España, originario de Valencia. Arroz con azafrán, pollo, conejo y verduras.</li><li><strong>Gazpacho y Salmorejo:</strong> Sopas frías típicas de Andalucía, perfectas para el verano.</li><li><strong>Pulpo a la Gallega:</strong> Especialidad de Galicia, pulpo cocido con aceite de oliva, pimentón y sal.</li><li><strong>Fabada Asturiana:</strong> Guiso de alubias blancas con embutidos, típico de Asturias.</li><li><strong>Cocido Madrileño:</strong> Guiso completo de garbanzos, verduras y carnes, típico de Madrid.</li><li><strong>Tapas:</strong> Pequeñas porciones de comida que se toman con bebida. Cada región tiene sus tapas típicas.</li></ul><h3>Productos Locales</h3><p>España es famosa por sus <strong>jamones ibéricos</strong> (especialmente de Jabugo y Teruel), <strong>quesos</strong> (Manchego, Cabrales, Idiazábal), <strong>aceite de oliva</strong> (el mejor del mundo), y <strong>vinos</strong> (Rioja, Ribera del Duero, Cava).</p><h3>Dónde Comer</h3><p>En autocaravana podés cocinar vos mismo con los productos frescos de los <strong>mercados locales</strong> (mercadillos), que encontrarás en casi todos los pueblos. También hay excelentes <strong>restaurantes</strong> en todas las ciudades, desde pequeños bares de tapas hasta restaurantes con estrella Michelin. Los <strong>menús del día</strong> (almuerzo completo por 10-15€) son una excelente opción económica.</p>",
      "practical_tips": "<h2>Consejos Prácticos para Viajar en Autocaravana por España</h2><h3>Mejor Época para Visitar</h3><p>España tiene un <strong>clima mediterráneo</strong> en la costa y continental en el interior. La mejor época es de <strong>abril a junio</strong> y de <strong>septiembre a octubre</strong>, cuando el clima es agradable y hay menos turistas. El verano (julio-agosto) puede ser muy caluroso, especialmente en el sur, pero las playas compensan. El invierno es suave en la costa mediterránea y más frío en el interior y norte.</p><h3>Normativas y Restricciones</h3><p>En España está <strong>prohibido pernoctar en lugares no autorizados</strong> en muchas ciudades. Sin embargo, hay miles de <strong>áreas de autocaravanas</strong> oficiales donde sí está permitido. Usá <strong>Mapa Furgocasa</strong> (www.mapafurgocasa.com) para encontrar lugares legales. Algunas ciudades tienen <strong>Zonas de Bajas Emisiones (ZBE)</strong> que pueden restringir el acceso a vehículos grandes, especialmente en Madrid y Barcelona.</p><h3>Cómo Llegar y Moverse</h3><p>Si venís desde Latinoamérica, podés volar a <strong>Madrid</strong> o <strong>Barcelona</strong> (los aeropuertos más grandes). Desde ahí, podés tomar un tren o bus hasta Murcia o Madrid para recoger tu autocaravana. España tiene una <strong>excelente red de carreteras</strong>: autopistas de peaje (AP) y autovías gratuitas (A). Las carreteras secundarias también están en muy buen estado.</p><h3>Servicios para Autocaravanas</h3><p>España tiene una <strong>excelente infraestructura</strong> para autocaravanas: áreas de servicio en casi todos los pueblos, gasolineras con espacio para vehículos grandes, talleres especializados, y supermercados con parking amplio. Los <strong>centros comerciales</strong> suelen tener parking gratuito y son ideales para hacer compras.</p><h3>Documentación Necesaria</h3><p>Si tenés licencia de conducir de tu país de origen, podés conducir en España durante los primeros 6 meses. Después necesitás obtener una licencia española o una internacional. El <strong>seguro</strong> de la autocaravana está incluido en el alquiler con Furgocasa.</p><h3>Conectividad y Comunicación</h3><p>España tiene excelente cobertura de <strong>internet móvil</strong>. Podés comprar una tarjeta SIM prepaga en cualquier operador (Movistar, Vodafone, Orange) por unos 10-20€ al mes con datos ilimitados. Muchas áreas de autocaravanas también ofrecen WiFi gratuito.</p>"
    }'::jsonb,
    'https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_espana.webp',
    true,
    0 -- Prioridad alta (display_order = 0)
  )
  ON CONFLICT (slug) DO UPDATE SET
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    h1_title = EXCLUDED.h1_title,
    intro_text = EXCLUDED.intro_text,
    content_sections = EXCLUDED.content_sections,
    hero_image = EXCLUDED.hero_image,
    updated_at = NOW();

  RAISE NOTICE 'Registro de España creado/actualizado exitosamente';
END $$;

-- Verificar que se creó correctamente
SELECT 
  slug, 
  name, 
  meta_title,
  CASE 
    WHEN content_sections IS NOT NULL THEN 'Con contenido'
    ELSE 'Sin contenido'
  END as contenido,
  is_active
FROM location_targets 
WHERE slug = 'espana';
