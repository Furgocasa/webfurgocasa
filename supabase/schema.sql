-- ============================================
-- FURGOCASA - ESQUEMA COMPLETO DE BASE DE DATOS
-- Sistema de Gestión de Alquiler y Venta de Campers
-- Versión: 1.0 - Enero 2025
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas de texto

-- ============================================
-- CATEGORÍAS DE VEHÍCULOS
-- ============================================
CREATE TABLE vehicle_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VEHÍCULOS (ALQUILER Y VENTA)
-- ============================================
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Información básica
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    category_id UUID REFERENCES vehicle_categories(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    plate_number VARCHAR(20),
    
    -- Descripción
    description TEXT,
    short_description VARCHAR(500),
    
    -- Capacidad
    seats INTEGER DEFAULT 2,
    beds INTEGER DEFAULT 2,
    
    -- Dimensiones
    length_m DECIMAL(4,2),
    width_m DECIMAL(4,2),
    height_m DECIMAL(4,2),
    
    -- Motor y mecánica
    fuel_type VARCHAR(50) DEFAULT 'Diesel',
    transmission VARCHAR(50) DEFAULT 'Manual',
    engine_power VARCHAR(50), -- ej: "150 CV"
    engine_displacement VARCHAR(50), -- ej: "2.0 TDI"
    
    -- Comodidades
    has_bathroom BOOLEAN DEFAULT FALSE,
    has_kitchen BOOLEAN DEFAULT TRUE,
    has_ac BOOLEAN DEFAULT TRUE,
    has_heating BOOLEAN DEFAULT TRUE,
    has_solar_panel BOOLEAN DEFAULT FALSE,
    has_awning BOOLEAN DEFAULT FALSE,
    
    -- Características adicionales (JSON)
    features JSONB DEFAULT '[]'::jsonb, -- ["Cama elevable", "Nevera 90L", etc]
    
    -- ALQUILER
    is_for_rent BOOLEAN DEFAULT TRUE,
    base_price_per_day DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'rented', 'inactive')),
    
    -- VENTA
    is_for_sale BOOLEAN DEFAULT FALSE,
    sale_price DECIMAL(12,2),
    sale_price_negotiable BOOLEAN DEFAULT TRUE,
    sale_status VARCHAR(20) DEFAULT 'available' CHECK (sale_status IN ('available', 'reserved', 'sold')),
    sale_description TEXT,
    sale_highlights JSONB DEFAULT '[]'::jsonb, -- Destacados para venta
    
    -- Datos técnicos (útil para alquiler y venta)
    mileage INTEGER DEFAULT 0,
    mileage_unit VARCHAR(10) DEFAULT 'km',
    registration_date DATE,
    next_itv_date DATE,
    warranty_until DATE,
    previous_owners INTEGER DEFAULT 1,
    condition VARCHAR(50) DEFAULT 'excellent' CHECK (condition IN ('new', 'like_new', 'excellent', 'good', 'fair')),
    
    -- SEO para venta
    sale_meta_title VARCHAR(200),
    sale_meta_description VARCHAR(500),
    
    -- Control
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para vehículos
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_category ON vehicles(category_id);
CREATE INDEX idx_vehicles_slug ON vehicles(slug);
CREATE INDEX idx_vehicles_for_rent ON vehicles(is_for_rent) WHERE is_for_rent = TRUE;
CREATE INDEX idx_vehicles_for_sale ON vehicles(is_for_sale) WHERE is_for_sale = TRUE;
CREATE INDEX idx_vehicles_sale_status ON vehicles(sale_status);

-- Índice de búsqueda de texto
CREATE INDEX idx_vehicles_search ON vehicles USING gin(to_tsvector('spanish', name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(model, '')));

COMMENT ON COLUMN vehicles.is_for_rent IS 'Indica si el vehículo está disponible para alquiler';
COMMENT ON COLUMN vehicles.is_for_sale IS 'Indica si el vehículo está a la venta';
COMMENT ON COLUMN vehicles.status IS 'Estado del vehículo para alquiler';
COMMENT ON COLUMN vehicles.sale_status IS 'Estado del vehículo para venta';

-- ============================================
-- IMÁGENES DE VEHÍCULOS
-- ============================================
CREATE TABLE vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt VARCHAR(255),
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);

-- ============================================
-- DAÑOS DE VEHÍCULOS
-- ============================================
CREATE TABLE vehicle_damages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    location VARCHAR(100), -- ej: "Puerta delantera izquierda", "Parachoques trasero"
    severity VARCHAR(20) DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'severe')),
    repair_cost DECIMAL(10,2),
    images JSONB DEFAULT '[]'::jsonb, -- URLs de fotos del daño
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_repair', 'repaired')),
    reported_date DATE DEFAULT CURRENT_DATE,
    repaired_date DATE,
    reported_by UUID, -- ID del admin que reportó
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicle_damages_vehicle ON vehicle_damages(vehicle_id);
CREATE INDEX idx_vehicle_damages_status ON vehicle_damages(status);

COMMENT ON TABLE vehicle_damages IS 'Registro de daños de vehículos, tanto existentes como reparados';

-- ============================================
-- UBICACIONES (Puntos de recogida/entrega)
-- ============================================
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    email VARCHAR(255),
    opening_time TIME DEFAULT '08:00',
    closing_time TIME DEFAULT '20:00',
    is_pickup BOOLEAN DEFAULT TRUE,
    is_dropoff BOOLEAN DEFAULT TRUE,
    extra_fee DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_locations_active ON locations(is_active);

-- ============================================
-- EXTRAS / ACCESORIOS
-- ============================================
CREATE TABLE extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10,2) DEFAULT 0,
    price_per_rental DECIMAL(10,2) DEFAULT 0,
    price_type VARCHAR(20) DEFAULT 'per_day' CHECK (price_type IN ('per_day', 'per_rental', 'one_time')),
    max_quantity INTEGER DEFAULT 1,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_extras_active ON extras(is_active);

-- ============================================
-- CLIENTES
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Datos personales
    email VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    dni VARCHAR(20),
    date_of_birth DATE,
    
    -- Dirección
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'España',
    
    -- Datos de conducción
    driver_license VARCHAR(50),
    driver_license_expiry DATE,
    
    -- Estadísticas y notas
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    
    -- Control
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_dni ON customers(dni);

-- ============================================
-- RESERVAS
-- ============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(20) NOT NULL UNIQUE,
    
    -- Relaciones
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    pickup_location_id UUID NOT NULL REFERENCES locations(id),
    dropoff_location_id UUID NOT NULL REFERENCES locations(id),
    
    -- Fechas y horas
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    dropoff_date DATE NOT NULL,
    dropoff_time TIME NOT NULL,
    days INTEGER NOT NULL,
    
    -- Precios
    base_price DECIMAL(10,2) NOT NULL,
    extras_price DECIMAL(10,2) DEFAULT 0,
    location_fee DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) DEFAULT 500,
    
    -- Estados
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    
    -- Datos del cliente (snapshot)
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_dni VARCHAR(20),
    customer_address TEXT,
    customer_city VARCHAR(100),
    customer_postal_code VARCHAR(20),
    
    -- Notas
    notes TEXT,
    admin_notes TEXT,
    
    -- Control
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para reservas
CREATE INDEX idx_bookings_vehicle ON bookings(vehicle_id);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_dates ON bookings(pickup_date, dropoff_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_number ON bookings(booking_number);

-- ============================================
-- EXTRAS DE RESERVA
-- ============================================
CREATE TABLE booking_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    extra_id UUID NOT NULL REFERENCES extras(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_booking_extras_booking ON booking_extras(booking_id);

-- ============================================
-- PAGOS
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    order_number VARCHAR(20) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'cancelled', 'error', 'refunded')),
    payment_type VARCHAR(20) DEFAULT 'full' CHECK (payment_type IN ('deposit', 'full', 'partial', 'refund')),
    payment_method VARCHAR(50),
    response_code VARCHAR(10),
    authorization_code VARCHAR(50),
    transaction_date VARCHAR(20),
    card_country VARCHAR(10),
    card_type VARCHAR(20),
    refunded_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_order ON payments(order_number);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- TEMPORADAS (Tarifas estacionales)
-- ============================================
CREATE TABLE seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_modifier DECIMAL(4,2) DEFAULT 1.00, -- 1.0 = normal, 1.2 = +20%, 0.85 = -15%
    min_days INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date);
CREATE INDEX idx_seasons_active ON seasons(is_active);

-- ============================================
-- PRECIOS POR VEHÍCULO Y TEMPORADA (opcional)
-- ============================================
CREATE TABLE vehicle_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    price_per_day DECIMAL(10,2) NOT NULL,
    price_per_week DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(vehicle_id, season_id)
);

CREATE INDEX idx_vehicle_prices_vehicle ON vehicle_prices(vehicle_id);
CREATE INDEX idx_vehicle_prices_season ON vehicle_prices(season_id);

-- ============================================
-- FECHAS BLOQUEADAS
-- ============================================
CREATE TABLE blocked_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_blocked_dates_vehicle ON blocked_dates(vehicle_id);
CREATE INDEX idx_blocked_dates_range ON blocked_dates(start_date, end_date);

-- ============================================
-- ADMINISTRADORES
-- ============================================
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'editor')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_admins_email ON admins(email);

-- ============================================
-- CATEGORÍAS DE CONTENIDO (BLOG/PUBLICACIONES)
-- ============================================
CREATE TABLE content_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    parent_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_categories_slug ON content_categories(slug);
CREATE INDEX idx_content_categories_parent ON content_categories(parent_id);

-- ============================================
-- ARTÍCULOS (BLOG Y PUBLICACIONES)
-- ============================================
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tipo de contenido
    post_type VARCHAR(20) DEFAULT 'blog' CHECK (post_type IN ('blog', 'publication', 'news')),
    
    -- Contenido
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    
    -- Relaciones
    category_id UUID REFERENCES content_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    
    -- Estado y visibilidad
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT FALSE,
    allow_comments BOOLEAN DEFAULT TRUE,
    
    -- Estadísticas
    views INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0, -- minutos
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(500),
    og_image TEXT,
    
    -- Publicación
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Control
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_type ON posts(post_type);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published ON posts(published_at);
CREATE INDEX idx_posts_featured ON posts(is_featured) WHERE is_featured = TRUE;

COMMENT ON COLUMN posts.post_type IS 'Tipo de contenido: blog (artículos propios), publication (noticias del sector), news (novedades Furgocasa)';

-- ============================================
-- ETIQUETAS (TAGS)
-- ============================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);

-- Relación posts-tags (muchos a muchos)
CREATE TABLE post_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, tag_id)
);

CREATE INDEX idx_post_tags_post ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON post_tags(tag_id);

-- ============================================
-- COMENTARIOS
-- ============================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_website VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'trash')),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- ============================================
-- BIBLIOTECA DE MEDIOS
-- ============================================
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    mime_type VARCHAR(100),
    size INTEGER, -- bytes
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(255),
    caption TEXT,
    folder VARCHAR(100) DEFAULT 'uploads',
    uploaded_by UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_folder ON media(folder);
CREATE INDEX idx_media_mime ON media(mime_type);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);

-- ============================================
-- REGISTRO DE ACTIVIDAD (AUDIT LOG)
-- ============================================
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- create, update, delete, login, logout
    entity_type VARCHAR(50) NOT NULL, -- vehicle, booking, post, etc.
    entity_id UUID,
    entity_name VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_log_admin ON activity_log(admin_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_created ON activity_log(created_at);

-- ============================================
-- CONFIGURACIÓN GENERAL
-- ============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_categories_updated_at BEFORE UPDATE ON vehicle_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicle_damages_updated_at BEFORE UPDATE ON vehicle_damages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_extras_updated_at BEFORE UPDATE ON extras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_categories_updated_at BEFORE UPDATE ON content_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de reserva
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_number := 'FC' || TO_CHAR(NOW(), 'YYMM') || LPAD(NEXTVAL('booking_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1;

CREATE TRIGGER set_booking_number
    BEFORE INSERT ON bookings
    FOR EACH ROW
    WHEN (NEW.booking_number IS NULL)
    EXECUTE FUNCTION generate_booking_number();

-- Función para calcular tiempo de lectura
CREATE OR REPLACE FUNCTION calculate_reading_time(content TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
    reading_speed INTEGER := 200; -- palabras por minuto
BEGIN
    word_count := array_length(regexp_split_to_array(content, '\s+'), 1);
    RETURN GREATEST(1, CEIL(word_count::DECIMAL / reading_speed));
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-calcular tiempo de lectura
CREATE OR REPLACE FUNCTION update_reading_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reading_time := calculate_reading_time(NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_reading_time
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_reading_time();

-- Función para verificar disponibilidad de un vehículo
CREATE OR REPLACE FUNCTION check_vehicle_availability(
    p_vehicle_id UUID,
    p_pickup_date DATE,
    p_dropoff_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
    is_available BOOLEAN;
BEGIN
    -- Verificar si hay reservas que se solapan
    SELECT NOT EXISTS (
        SELECT 1 FROM bookings
        WHERE vehicle_id = p_vehicle_id
        AND status NOT IN ('cancelled')
        AND (
            (pickup_date <= p_dropoff_date AND dropoff_date >= p_pickup_date)
        )
    ) INTO is_available;
    
    -- Si hay disponibilidad, verificar bloqueos
    IF is_available THEN
        SELECT NOT EXISTS (
            SELECT 1 FROM blocked_dates
            WHERE vehicle_id = p_vehicle_id
            AND (
                (start_date <= p_dropoff_date AND end_date >= p_pickup_date)
            )
        ) INTO is_available;
    END IF;
    
    RETURN is_available;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar vistas de un post
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE posts SET views = views + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_damages ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (lectura para todos)
CREATE POLICY "Vehículos disponibles visibles públicamente" ON vehicles 
    FOR SELECT USING (
        (is_for_rent = TRUE AND status != 'inactive') OR 
        (is_for_sale = TRUE AND sale_status = 'available')
    );

CREATE POLICY "Imágenes visibles públicamente" ON vehicle_images FOR SELECT USING (true);
CREATE POLICY "Categorías visibles públicamente" ON vehicle_categories FOR SELECT USING (true);
CREATE POLICY "Ubicaciones activas visibles" ON locations FOR SELECT USING (is_active = true);
CREATE POLICY "Extras activos visibles" ON extras FOR SELECT USING (is_active = true);
CREATE POLICY "Temporadas activas visibles" ON seasons FOR SELECT USING (is_active = true);

-- Blog/Publicaciones
CREATE POLICY "Categorías de contenido visibles públicamente" ON content_categories 
    FOR SELECT USING (is_active = true);

CREATE POLICY "Posts publicados visibles públicamente" ON posts 
    FOR SELECT USING (status = 'published' AND published_at <= NOW());

CREATE POLICY "Tags visibles públicamente" ON tags FOR SELECT USING (true);
CREATE POLICY "Post-tags visibles públicamente" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Comentarios aprobados visibles" ON comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Cualquiera puede comentar" ON comments FOR INSERT WITH CHECK (true);

-- Políticas para clientes autenticados
CREATE POLICY "Clientes ven sus propios datos" ON customers 
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Clientes ven sus reservas" ON bookings 
    FOR SELECT USING (
        customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    );

-- ============================================
-- FIN DEL ESQUEMA
-- ============================================
