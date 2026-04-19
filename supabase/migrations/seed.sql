-- ============================================
-- FURGOCASA - DATOS INICIALES (SEED DATA)
-- Datos de ejemplo para desarrollo y testing
-- ============================================

-- ============================================
-- CONFIGURACIÓN GENERAL
-- ============================================
INSERT INTO settings (key, value, description) VALUES
    ('company', '{"name": "Furgocasa", "email": "info@furgocasa.com", "phone": "+34 678 081 261", "address": "Murcia, España"}', 'Datos de la empresa'),
    ('booking', '{"min_days": 2, "max_days": 30, "advance_days": 1, "deposit_percentage": 30, "cancellation_free_days": 60}', 'Configuración de reservas'),
    ('payment', '{"currency": "EUR", "deposit_default": 500, "full_payment_days_before": 7}', 'Configuración de pagos'),
    ('notifications', '{"send_confirmation": true, "send_reminder": true, "reminder_days_before": 3}', 'Configuración de notificaciones');

-- ============================================
-- CATEGORÍAS DE VEHÍCULOS
-- ============================================
INSERT INTO vehicle_categories (name, slug, description, sort_order) VALUES
    ('Furgoneta Camper', 'furgoneta-camper', 'Furgonetas convertidas en camper, ideales para parejas', 1),
    ('Camper Grande', 'camper-grande', 'Campers más espaciosos para familias pequeñas', 2),
    ('Autocaravana', 'autocaravana', 'Autocaravanas completas con todas las comodidades', 3),
    ('Autocaravana Premium', 'autocaravana-premium', 'Autocaravanas de lujo con equipamiento de alta gama', 4);

-- ============================================
-- UBICACIONES
-- ============================================
INSERT INTO locations (name, slug, address, city, postal_code, is_pickup, is_dropoff, extra_fee) VALUES
    ('Sede Central Murcia', 'murcia-central', 'Murcia, España', 'Murcia', '30001', TRUE, TRUE, 0),
    ('Cartagena', 'cartagena', 'Av. del Puerto, 45', 'Cartagena', '30201', TRUE, TRUE, 25),
    ('Aeropuerto Región de Murcia', 'aeropuerto-murcia', 'Aeropuerto Internacional Región de Murcia', 'Corvera', '30153', TRUE, TRUE, 35);

-- ============================================
-- EXTRAS / ACCESORIOS
-- ============================================
INSERT INTO extras (name, description, price_per_day, price_type, max_quantity, sort_order) VALUES
    ('Sillas de camping', 'Pack de 2 sillas plegables de camping', 5.00, 'per_day', 4, 1),
    ('Mesa plegable', 'Mesa de camping plegable', 4.00, 'per_day', 2, 2),
    ('Juego de sábanas', 'Juego completo de sábanas y almohadas', 15.00, 'per_rental', 3, 3),
    ('Toldo adicional', 'Toldo lateral con protección UV', 10.00, 'per_day', 1, 4),
    ('Bicicletas', 'Bicicleta de paseo', 8.00, 'per_day', 4, 5),
    ('Silla de bebé', 'Silla de seguridad para bebé homologada', 6.00, 'per_day', 2, 6),
    ('GPS navegador', 'Navegador GPS con mapas de Europa', 5.00, 'per_day', 1, 7),
    ('Kit de limpieza', 'Kit completo de limpieza interior', 20.00, 'per_rental', 1, 8),
    ('Generador portátil', 'Generador eléctrico portátil', 15.00, 'per_day', 1, 9),
    ('WiFi portátil', 'Router WiFi 4G con datos incluidos', 8.00, 'per_day', 1, 10);

-- ============================================
-- TEMPORADAS
-- ============================================
INSERT INTO seasons (name, slug, start_date, end_date, price_modifier, min_days) VALUES
    ('Temporada Baja', 'baja', '2025-11-01', '2025-12-14', 0.85, 2),
    ('Temporada Media', 'media', '2025-03-01', '2025-06-14', 1.00, 3),
    ('Temporada Alta', 'alta', '2025-06-15', '2025-09-15', 1.30, 5),
    ('Navidad', 'navidad', '2025-12-15', '2026-01-06', 1.20, 4),
    ('Semana Santa', 'semana-santa', '2026-04-05', '2026-04-12', 1.25, 5);

-- ============================================
-- CATEGORÍAS DE CONTENIDO (BLOG/PUBLICACIONES)
-- ============================================
INSERT INTO content_categories (name, slug, description, sort_order) VALUES
    ('Destinos', 'destinos', 'Guías y recomendaciones de destinos para viajar en camper', 1),
    ('Consejos', 'consejos', 'Tips y consejos para viajar en autocaravana', 2),
    ('Rutas', 'rutas', 'Rutas recomendadas por España y Europa', 3),
    ('Noticias', 'noticias', 'Novedades y noticias de Furgocasa', 4),
    ('Equipamiento', 'equipamiento', 'Todo sobre equipamiento y accesorios para campers', 5),
    ('Publicaciones del Sector', 'publicaciones-sector', 'Noticias del sector camper de las que nos hacemos eco', 6);

-- ============================================
-- EJEMPLO DE VEHÍCULO (DESCOMENTAR SI NECESITAS DATOS DE PRUEBA)
-- ============================================
/*
DO $$
DECLARE
    cat_id UUID;
    veh_id UUID;
BEGIN
    -- Obtener ID de categoría
    SELECT id INTO cat_id FROM vehicle_categories WHERE slug = 'furgoneta-camper' LIMIT 1;
    
    -- Insertar vehículo de ejemplo
    INSERT INTO vehicles (
        name, slug, category_id, brand, model, year, seats, beds,
        description, short_description,
        fuel_type, transmission, has_bathroom, has_kitchen, has_ac, has_heating,
        is_for_rent, base_price_per_day, status,
        features
    ) VALUES (
        'Adria Twin Plus 600 SP Family',
        'adria-twin-plus-600-sp-family',
        cat_id,
        'Adria',
        'Twin Plus 600 SP',
        2023,
        4,
        4,
        '<p>La Adria Twin Plus 600 SP Family es la furgoneta camper perfecta para familias que buscan comodidad sin renunciar a la agilidad de una furgoneta.</p><p>Con 4 plazas homologadas y 4 camas, ofrece espacio para toda la familia. Su cocina equipada, baño completo y calefacción estacionaria garantizan el confort en cualquier época del año.</p>',
        'Furgoneta camper ideal para familias, 4 plazas y 4 camas con todas las comodidades',
        'Diesel',
        'Manual',
        true,
        true,
        true,
        true,
        true,
        120.00,
        'available',
        '["Cama trasera abatible", "Cama elevable eléctrica", "Cocina con 2 fuegos", "Nevera 90L", "Baño con ducha", "Calefacción Truma", "Toldo 3.5m", "Placas solares 140W", "Portabicicletas", "TV 22 pulgadas"]'::jsonb
    ) RETURNING id INTO veh_id;
    
    -- Insertar imagen de ejemplo
    INSERT INTO vehicle_images (vehicle_id, url, alt, is_main, sort_order) VALUES
        (veh_id, '/images/vehicles/adria-twin-plus.jpg', 'Adria Twin Plus 600 SP Family', true, 1);
    
    RAISE NOTICE 'Vehículo de ejemplo creado con ID: %', veh_id;
END $$;
*/

-- ============================================
-- NOTAS
-- ============================================
-- Este archivo contiene datos iniciales mínimos
-- Los vehículos, clientes y reservas se crearán desde el panel admin
-- Para datos de prueba, descomenta el bloque de ejemplo de vehículo arriba





