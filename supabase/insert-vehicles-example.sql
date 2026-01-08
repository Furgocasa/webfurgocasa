-- ============================================
-- VEHÍCULOS DE EJEMPLO PARA FURGOCASA
-- Ejecutar este SQL en el SQL Editor de Supabase
-- ============================================

DO $$
DECLARE
    cat_camper_id UUID;
    cat_grande_id UUID;
    veh1_id UUID;
    veh2_id UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_camper_id FROM vehicle_categories WHERE slug = 'furgoneta-camper' LIMIT 1;
    SELECT id INTO cat_grande_id FROM vehicle_categories WHERE slug = 'camper-grande' LIMIT 1;
    
    -- ============================================
    -- VEHÍCULO 1: Weinsberg CaraBus 600 MQ
    -- Disponible para ALQUILER y VENTA
    -- ============================================
    INSERT INTO vehicles (
        name, 
        slug, 
        category_id, 
        brand, 
        model, 
        year, 
        seats, 
        beds,
        description, 
        short_description,
        fuel_type, 
        transmission, 
        engine_power,
        engine_displacement,
        mileage,
        mileage_unit,
        -- Dimensiones
        length_m,
        width_m,
        height_m,
        -- Comodidades
        has_bathroom, 
        has_kitchen, 
        has_ac, 
        has_heating,
        has_solar_panel,
        has_awning,
        -- Alquiler
        is_for_rent, 
        base_price_per_day,
        status,
        -- Venta
        is_for_sale,
        sale_price,
        sale_price_negotiable,
        sale_status,
        sale_description,
        condition,
        previous_owners,
        registration_date,
        -- Características
        features,
        sale_highlights
    ) VALUES (
        'Weinsberg CaraBus 600 MQ',
        'weinsberg-carabus-600-mq',
        cat_camper_id,
        'Weinsberg',
        'CaraBus 600 MQ',
        2023,
        4,
        4,
        '<h3>Descripción General</h3><p>La Weinsberg CaraBus 600 MQ es una furgoneta camper de gran volumen perfecta para familias. Con sus 4 plazas homologadas y 4 camas, ofrece espacio y confort para todos.</p><h3>Características Destacadas</h3><p>Equipada con cocina completa, baño interior con ducha, calefacción estacionaria y todo lo necesario para disfrutar de tus vacaciones en cualquier época del año.</p><h3>Ideal para</h3><p>Familias pequeñas, parejas que buscan espacio extra, o grupos de amigos que quieren viajar con comodidad.</p>',
        'Furgoneta camper espaciosa con 4 plazas y 4 camas, perfecta para familias',
        'Diesel',
        'Manual',
        '140 CV',
        '2.0 TDI',
        25000,
        'km',
        -- Dimensiones
        5.99,
        2.05,
        2.64,
        -- Comodidades
        true,
        true,
        true,
        true,
        true,
        true,
        -- Alquiler
        true,
        'available',
        -- Venta
        true,
        68000.00,
        true,
        'available',
        '<p>Weinsberg CaraBus 600 MQ del 2023 en perfecto estado. Solo 25.000 km. Un único propietario que la ha cuidado al detalle.</p><p>Todos los mantenimientos realizados en concesionario oficial. Completamente revisada y lista para usar.</p><p>Ideal para familias o parejas que buscan calidad y espacio.</p>',
        'excellent',
        1,
        '2023-03-15',
        -- Características
        '[
            "Cama trasera permanente 140x200cm",
            "Cama elevable eléctrica 150x200cm",
            "Cocina con 3 fuegos + fregadero",
            "Nevera compresor 90L",
            "Baño completo con ducha",
            "WC cassette portátil",
            "Calefacción Truma Combi 6",
            "Depósito agua limpia 110L",
            "Depósito aguas grises 90L",
            "Toldo lateral Thule 3.5m",
            "Portabicicletas trasero",
            "Mesa y sillas exterior",
            "Placa solar 140W",
            "Batería auxiliar 95Ah",
            "Inversor 12V-220V",
            "Toma 220V exterior",
            "Sistema audio Bluetooth",
            "Control de clima",
            "Cortinas oscurecimiento",
            "Mosquiteras ventanas",
            "Asientos giratorios",
            "Iluminación LED",
            "USB en cabina"
        ]'::jsonb,
        '[
            "Como nuevo - Solo 25.000 km",
            "1 solo propietario",
            "Mantenimientos al día",
            "Revisión completa reciente",
            "Garantía disponible",
            "Precio negociable"
        ]'::jsonb
    ) RETURNING id INTO veh1_id;
    
    -- Insertar imágenes del vehículo 1
    INSERT INTO vehicle_images (vehicle_id, url, alt, is_main, sort_order) VALUES
        (veh1_id, '/images/vehicles/weinsberg-carabus-exterior.jpg', 'Weinsberg CaraBus 600 MQ - Vista exterior', true, 1),
        (veh1_id, '/images/vehicles/weinsberg-carabus-interior.jpg', 'Weinsberg CaraBus 600 MQ - Interior salón', false, 2),
        (veh1_id, '/images/vehicles/weinsberg-carabus-cocina.jpg', 'Weinsberg CaraBus 600 MQ - Cocina equipada', false, 3),
        (veh1_id, '/images/vehicles/weinsberg-carabus-bano.jpg', 'Weinsberg CaraBus 600 MQ - Baño completo', false, 4),
        (veh1_id, '/images/vehicles/weinsberg-carabus-cama.jpg', 'Weinsberg CaraBus 600 MQ - Cama trasera', false, 5);
    
    RAISE NOTICE '✅ Vehículo 1 creado: Weinsberg CaraBus 600 MQ (ID: %)', veh1_id;
    RAISE NOTICE '   📍 Alquiler: 125€/día | Venta: 68.000€ | 25.000 km';
    
    -- ============================================
    -- VEHÍCULO 2: Dreamer D55 Fun
    -- Disponible solo para ALQUILER
    -- ============================================
    INSERT INTO vehicles (
        name, 
        slug, 
        category_id, 
        brand, 
        model, 
        year, 
        seats, 
        beds,
        description, 
        short_description,
        fuel_type, 
        transmission, 
        engine_power,
        engine_displacement,
        mileage,
        mileage_unit,
        -- Dimensiones
        length_m,
        width_m,
        height_m,
        -- Comodidades
        has_bathroom, 
        has_kitchen, 
        has_ac, 
        has_heating,
        has_solar_panel,
        has_awning,
        -- Alquiler
        is_for_rent, 
        base_price_per_day,
        status,
        -- Venta
        is_for_sale,
        -- Características
        features
    ) VALUES (
        'Dreamer D55 Fun',
        'dreamer-d55-fun',
        cat_grande_id,
        'Dreamer',
        'D55 Fun',
        2024,
        5,
        5,
        '<h3>Descripción General</h3><p>La Dreamer D55 Fun es una camper de gran volumen diseñada para familias numerosas o grupos de amigos. Con 5 plazas homologadas y 5 camas, nadie se queda fuera de la aventura.</p><h3>Características Destacadas</h3><p>Cuenta con un diseño moderno, cocina amplia con nevera de 120L, baño completo separado con ducha, y un salón espacioso que se convierte en cama adicional. La calefacción diesel garantiza confort incluso en invierno.</p><h3>Ideal para</h3><p>Familias grandes, grupos de hasta 5 personas que buscan espacio y todas las comodidades de casa sobre ruedas.</p>',
        'Camper grande con 5 plazas y 5 camas, ideal para grupos y familias numerosas',
        'Diesel',
        'Manual',
        '140 CV',
        '2.3 Multijet',
        18000,
        'km',
        -- Dimensiones
        5.99,
        2.08,
        2.88,
        -- Comodidades
        true,
        true,
        true,
        true,
        true,
        true,
        -- Alquiler
        true,
        'available',
        -- Venta
        false,
        -- Características
        '[
            "Cama trasera permanente 160x200cm",
            "Cama capuchina 140x200cm",
            "Cama dinette convertible",
            "Cocina con 3 fuegos + horno",
            "Nevera compresor 120L",
            "Baño completo separado",
            "Ducha independiente",
            "WC cassette",
            "Calefacción diesel Webasto",
            "Depósito agua limpia 130L",
            "Depósito aguas grises 110L",
            "Toldo eléctrico Thule 4m",
            "Portabicicletas 4 unidades",
            "Mesa interior extensible",
            "Placas solares 200W",
            "Batería Litio 100Ah",
            "Inversor 1500W",
            "Toma 220V exterior",
            "TV Smart 24 pulgadas",
            "Radio DAB+ Bluetooth",
            "Cámara marcha atrás",
            "Sensores aparcamiento",
            "Control crucero",
            "Asientos giratorios cabina",
            "Iluminación LED total",
            "USB en todas las zonas",
            "Armarios amplios",
            "Suelo aislado"
        ]'::jsonb
    ) RETURNING id INTO veh2_id;
    
    -- Insertar imágenes del vehículo 2
    INSERT INTO vehicle_images (vehicle_id, url, alt, is_main, sort_order) VALUES
        (veh2_id, '/images/vehicles/dreamer-d55-exterior.jpg', 'Dreamer D55 Fun - Vista exterior', true, 1),
        (veh2_id, '/images/vehicles/dreamer-d55-interior.jpg', 'Dreamer D55 Fun - Interior salón', false, 2),
        (veh2_id, '/images/vehicles/dreamer-d55-cocina.jpg', 'Dreamer D55 Fun - Cocina equipada', false, 3),
        (veh2_id, '/images/vehicles/dreamer-d55-cama.jpg', 'Dreamer D55 Fun - Cama trasera', false, 4),
        (veh2_id, '/images/vehicles/dreamer-d55-bano.jpg', 'Dreamer D55 Fun - Baño completo', false, 5),
        (veh2_id, '/images/vehicles/dreamer-d55-capuchina.jpg', 'Dreamer D55 Fun - Cama capuchina', false, 6);
    
    RAISE NOTICE '✅ Vehículo 2 creado: Dreamer D55 Fun (ID: %)', veh2_id;
    RAISE NOTICE '   📍 Alquiler: 145€/día | 18.000 km';
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ¡2 vehículos de ejemplo creados exitosamente!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📦 Weinsberg CaraBus 600 MQ:';
    RAISE NOTICE '   • Disponible para alquiler (precio según temporada)';
    RAISE NOTICE '   • Venta: 68.000€ (negociable)';
    RAISE NOTICE '   • Kilometraje: 25.000 km';
    RAISE NOTICE '   • Estado: Excelente';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Dreamer D55 Fun:';
    RAISE NOTICE '   • Disponible para alquiler (precio según temporada)';
    RAISE NOTICE '   • Solo alquiler (no en venta)';
    RAISE NOTICE '   • Kilometraje: 18.000 km';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Los precios de alquiler están definidos en la tabla seasons';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;
