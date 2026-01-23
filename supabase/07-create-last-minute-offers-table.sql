-- ============================================
-- SISTEMA DE OFERTAS DE ÚLTIMA HORA - FURGOCASA
-- Archivo 1 de 2: Crear tabla principal
-- ============================================
-- Ejecutar PRIMERO
-- ============================================

-- Crear tabla de ofertas de última hora
CREATE TABLE IF NOT EXISTS last_minute_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Vehículo asociado
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    
    -- Hueco original detectado por el sistema
    detected_start_date DATE NOT NULL,
    detected_end_date DATE NOT NULL,
    detected_days INTEGER GENERATED ALWAYS AS (detected_end_date - detected_start_date) STORED,
    
    -- Fechas publicadas (puede ser menor si admin ajusta)
    offer_start_date DATE NOT NULL,
    offer_end_date DATE NOT NULL,
    offer_days INTEGER GENERATED ALWAYS AS (offer_end_date - offer_start_date) STORED,
    
    -- Precios
    original_price_per_day DECIMAL(10,2) NOT NULL,      -- Precio normal de temporada
    discount_percentage INTEGER NOT NULL DEFAULT 15,     -- % de descuento (15, 20, 25...)
    final_price_per_day DECIMAL(10,2) GENERATED ALWAYS AS (
        ROUND(original_price_per_day * (100 - discount_percentage) / 100, 2)
    ) STORED,
    
    -- Estado de la oferta
    status VARCHAR(20) NOT NULL DEFAULT 'detected' CHECK (status IN (
        'detected',    -- Propuesta pendiente de revisión
        'published',   -- Visible en la web pública
        'reserved',    -- Alguien la reservó
        'expired',     -- Pasó la fecha sin reserva
        'ignored'      -- Admin la descartó
    )),
    
    -- Referencias
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,  -- Si se reservó
    
    -- Reservas adyacentes (para contexto)
    previous_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    next_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Notas del admin
    admin_notes TEXT,
    
    -- Timestamps
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    reserved_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentario de tabla
COMMENT ON TABLE last_minute_offers IS 'Ofertas de última hora para huecos entre reservas';

-- Comentarios de columnas importantes
COMMENT ON COLUMN last_minute_offers.detected_start_date IS 'Fecha inicio del hueco original detectado';
COMMENT ON COLUMN last_minute_offers.detected_end_date IS 'Fecha fin del hueco original detectado';
COMMENT ON COLUMN last_minute_offers.offer_start_date IS 'Fecha inicio de la oferta publicada (puede ser diferente)';
COMMENT ON COLUMN last_minute_offers.offer_end_date IS 'Fecha fin de la oferta publicada';
COMMENT ON COLUMN last_minute_offers.discount_percentage IS 'Porcentaje de descuento (ej: 15 para -15%)';
COMMENT ON COLUMN last_minute_offers.status IS 'detected=pendiente, published=visible, reserved=vendida, expired=caducada, ignored=descartada';

-- Índices para rendimiento
CREATE INDEX idx_last_minute_offers_vehicle ON last_minute_offers(vehicle_id);
CREATE INDEX idx_last_minute_offers_status ON last_minute_offers(status);
CREATE INDEX idx_last_minute_offers_dates ON last_minute_offers(offer_start_date, offer_end_date);
CREATE INDEX idx_last_minute_offers_published ON last_minute_offers(status, offer_start_date) 
    WHERE status = 'published';

-- Índice único para evitar duplicados del mismo hueco
CREATE UNIQUE INDEX idx_last_minute_offers_unique_gap ON last_minute_offers(
    vehicle_id, detected_start_date, detected_end_date
) WHERE status NOT IN ('ignored', 'expired');

-- Trigger para actualizar updated_at
CREATE TRIGGER update_last_minute_offers_updated_at
    BEFORE UPDATE ON last_minute_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICACIÓN
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'last_minute_offers') THEN
        RAISE NOTICE '✅ Tabla last_minute_offers creada correctamente';
    END IF;
END $$;
