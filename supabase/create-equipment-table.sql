-- =============================================
-- SISTEMA DE EQUIPAMIENTO PARA VEHÍCULOS
-- Permite gestionar equipamientos dinámicamente
-- =============================================

-- Tabla principal de equipamientos
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) NOT NULL DEFAULT 'CheckCircle', -- Nombre del icono de Lucide
    category VARCHAR(50) DEFAULT 'general', -- Categorías: general, confort, exterior, seguridad, multimedia
    is_active BOOLEAN DEFAULT true,
    is_standard BOOLEAN DEFAULT false, -- Si viene de serie en todas las campers
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_equipment_active ON equipment(is_active);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);
CREATE INDEX IF NOT EXISTS idx_equipment_sort ON equipment(sort_order);

-- Tabla de relación vehículos-equipamiento (muchos a muchos)
CREATE TABLE IF NOT EXISTS vehicle_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    notes TEXT, -- Notas específicas para este vehículo (ej: "Webasto 2kW")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vehicle_id, equipment_id)
);

-- Índices para la tabla de relación
CREATE INDEX IF NOT EXISTS idx_vehicle_equipment_vehicle ON vehicle_equipment(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_equipment_equipment ON vehicle_equipment(equipment_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_equipment_updated_at ON equipment;
CREATE TRIGGER trigger_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_updated_at();

-- =============================================
-- DATOS INICIALES - Equipamientos comunes
-- =============================================

INSERT INTO equipment (name, slug, icon, category, is_standard, sort_order) VALUES
-- Confort interior (estándar en todas las campers de Furgocasa)
('Cocina a gas', 'cocina-gas', 'UtensilsCrossed', 'confort', true, 1),
('Baño completo', 'bano-completo', 'Bath', 'confort', true, 2),
('Nevera', 'nevera', 'Refrigerator', 'confort', true, 3),
('Calefacción estacionaria', 'calefaccion', 'ThermometerSun', 'confort', true, 4),

-- Energía (muy comunes)
('Panel solar', 'panel-solar', 'Sun', 'energia', false, 10),
('Batería de litio', 'bateria-litio', 'Battery', 'energia', false, 11),
('Inversor', 'inversor', 'Zap', 'energia', false, 12),
('Toma 220V exterior', 'toma-220v', 'Plug', 'energia', false, 13),

-- Exterior
('Toldo', 'toldo', 'Tent', 'exterior', false, 20),
('Portabicicletas', 'portabicicletas', 'Bike', 'exterior', false, 21),
('Escalera exterior', 'escalera', 'ArrowUpFromLine', 'exterior', false, 22),
('Baca/Cofre techo', 'baca-techo', 'Package', 'exterior', false, 23),

-- Multimedia
('Radio multimedia', 'radio-multimedia', 'Radio', 'multimedia', false, 30),
('TV', 'tv', 'Tv', 'multimedia', false, 31),
('WiFi/Router 4G', 'wifi-router', 'Wifi', 'multimedia', false, 32),

-- Seguridad/Conducción
('Cámara marcha atrás', 'camara-trasera', 'Camera', 'seguridad', false, 40),
('Sensores aparcamiento', 'sensores-parking', 'CircleDot', 'seguridad', false, 41),
('Control crucero', 'control-crucero', 'Gauge', 'seguridad', false, 42),
('Aire acondicionado cabina', 'aire-acondicionado', 'Snowflake', 'seguridad', false, 43),

-- Agua
('Depósito agua limpia', 'deposito-agua-limpia', 'Droplets', 'agua', false, 50),
('Depósito aguas grises', 'deposito-aguas-grises', 'Droplet', 'agua', false, 51),
('Ducha exterior', 'ducha-exterior', 'ShowerHead', 'agua', false, 52),
('Calentador agua', 'calentador-agua', 'Flame', 'agua', false, 53),

-- Otros equipamientos comunes
('Asientos giratorios', 'asientos-giratorios', 'RotateCcw', 'confort', false, 60),
('Mesa interior', 'mesa-interior', 'Table', 'confort', false, 61),
('Armarios', 'armarios', 'DoorOpen', 'confort', false, 62),
('Iluminación LED', 'iluminacion-led', 'Lightbulb', 'confort', false, 63),
('USB en todas las zonas', 'usb-zonas', 'Usb', 'confort', false, 64),
('Suelo aislado', 'suelo-aislado', 'Layers', 'confort', false, 65),
('Ventanas con mosquitera', 'ventanas-mosquitera', 'Grid3X3', 'confort', false, 66),
('Claraboya', 'claraboya', 'CloudSun', 'confort', false, 67)

ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    is_standard = EXCLUDED.is_standard,
    sort_order = EXCLUDED.sort_order;

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================

-- Habilitar RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_equipment ENABLE ROW LEVEL SECURITY;

-- Políticas para equipment
DROP POLICY IF EXISTS "Equipment visible públicamente" ON equipment;
CREATE POLICY "Equipment visible públicamente" ON equipment
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins pueden gestionar equipment" ON equipment;
CREATE POLICY "Admins pueden gestionar equipment" ON equipment
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM admins WHERE is_active = true)
    );

-- Políticas para vehicle_equipment
DROP POLICY IF EXISTS "Vehicle equipment visible públicamente" ON vehicle_equipment;
CREATE POLICY "Vehicle equipment visible públicamente" ON vehicle_equipment
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins pueden gestionar vehicle equipment" ON vehicle_equipment;
CREATE POLICY "Admins pueden gestionar vehicle equipment" ON vehicle_equipment
    FOR ALL USING (
        auth.uid() IN (SELECT user_id FROM admins WHERE is_active = true)
    );

-- =============================================
-- GRANTS
-- =============================================
GRANT SELECT ON equipment TO anon;
GRANT SELECT ON equipment TO authenticated;
GRANT ALL ON equipment TO service_role;

GRANT SELECT ON vehicle_equipment TO anon;
GRANT SELECT ON vehicle_equipment TO authenticated;
GRANT ALL ON vehicle_equipment TO service_role;
