-- ================================================
-- Crear categoría por defecto para Furgocasa
-- ================================================

-- Insertar categoría "Camper Gran Volumen"
INSERT INTO vehicle_categories (
    name,
    slug,
    description,
    is_active,
    sort_order
) VALUES (
    'Camper Gran Volumen',
    'camper-gran-volumen',
    'Campers y furgonetas camperizadas de gran capacidad',
    true,
    1
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = true;

-- Verificar que se creó correctamente
SELECT * FROM vehicle_categories;


