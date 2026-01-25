-- ============================================
-- SISTEMA DE ANÁLISIS DE BÚSQUEDAS - FURGOCASA
-- VERSIÓN DEFINITIVA - TODOS LOS CAMPOS
-- ============================================

-- ============================================
-- 0. LIMPIAR TODO LO ANTERIOR
-- ============================================

DROP VIEW IF EXISTS public.search_conversion_stats CASCADE;
DROP VIEW IF EXISTS public.top_searched_dates CASCADE;
DROP VIEW IF EXISTS public.vehicle_search_performance CASCADE;
DROP TABLE IF EXISTS public.search_queries CASCADE;

-- ============================================
-- 1. CREAR TABLA search_queries COMPLETA
-- ============================================

CREATE TABLE public.search_queries (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  
  -- Datos de la búsqueda
  searched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  pickup_date DATE NOT NULL,
  dropoff_date DATE NOT NULL,
  pickup_time TIME,
  dropoff_time TIME,
  rental_days INTEGER NOT NULL,
  advance_days INTEGER NOT NULL,
  
  -- Ubicaciones
  pickup_location TEXT,
  dropoff_location TEXT,
  pickup_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  dropoff_location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  same_location BOOLEAN DEFAULT true,
  category_slug TEXT,
  
  -- Resultados de la búsqueda
  vehicles_available_count INTEGER DEFAULT 0,
  avg_price_shown NUMERIC(10,2),
  season_applied TEXT,
  had_availability BOOLEAN DEFAULT false,
  
  -- Tracking de selección de vehículo
  vehicle_selected BOOLEAN DEFAULT false,
  selected_vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  selected_vehicle_price NUMERIC(10,2),
  vehicle_selected_at TIMESTAMPTZ,
  
  -- Tracking de conversión a reserva
  booking_created BOOLEAN DEFAULT false,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  booking_created_at TIMESTAMPTZ,
  
  -- Métricas de tiempo (calculadas automáticamente por triggers)
  time_to_select_seconds INTEGER,
  time_to_booking_seconds INTEGER,
  total_conversion_seconds INTEGER,
  
  -- Estado del funnel
  funnel_stage TEXT DEFAULT 'search_only' CHECK (funnel_stage IN ('search_only', 'vehicle_selected', 'booking_created')),
  
  -- Contexto del usuario (anonimizado)
  locale TEXT,
  user_agent_type TEXT CHECK (user_agent_type IN ('mobile', 'desktop', 'tablet', 'unknown')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- 2. CREAR ÍNDICES OPTIMIZADOS
-- ============================================

CREATE INDEX idx_search_queries_searched_at_funnel 
  ON public.search_queries(searched_at DESC, funnel_stage);

CREATE INDEX idx_search_queries_session_id 
  ON public.search_queries(session_id);

CREATE INDEX idx_search_queries_pickup_date 
  ON public.search_queries(pickup_date);

CREATE INDEX idx_search_queries_selected_vehicle 
  ON public.search_queries(selected_vehicle_id) 
  WHERE selected_vehicle_id IS NOT NULL;

CREATE INDEX idx_search_queries_booking 
  ON public.search_queries(booking_id) 
  WHERE booking_id IS NOT NULL;

CREATE INDEX idx_search_queries_season 
  ON public.search_queries(season_applied) 
  WHERE season_applied IS NOT NULL;

CREATE INDEX idx_search_queries_no_availability 
  ON public.search_queries(pickup_date, dropoff_date) 
  WHERE had_availability = false;

-- ============================================
-- 3. TRIGGER: Calcular tiempos de conversión
-- ============================================

CREATE OR REPLACE FUNCTION calculate_search_conversion_times()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vehicle_selected = true AND NEW.vehicle_selected_at IS NOT NULL THEN
    NEW.time_to_select_seconds := EXTRACT(EPOCH FROM (NEW.vehicle_selected_at - NEW.searched_at))::INTEGER;
  END IF;
  
  IF NEW.booking_created = true AND NEW.booking_created_at IS NOT NULL AND NEW.vehicle_selected_at IS NOT NULL THEN
    NEW.time_to_booking_seconds := EXTRACT(EPOCH FROM (NEW.booking_created_at - NEW.vehicle_selected_at))::INTEGER;
  END IF;
  
  IF NEW.booking_created = true AND NEW.booking_created_at IS NOT NULL THEN
    NEW.total_conversion_seconds := EXTRACT(EPOCH FROM (NEW.booking_created_at - NEW.searched_at))::INTEGER;
  END IF;
  
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_conversion_times
  BEFORE INSERT OR UPDATE ON public.search_queries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_search_conversion_times();

-- ============================================
-- 4. VISTAS PARA ANÁLISIS
-- ============================================

CREATE VIEW public.search_conversion_stats AS
SELECT 
  DATE(searched_at) as date,
  COUNT(*) as total_searches,
  COUNT(*) FILTER (WHERE had_availability) as searches_with_availability,
  COUNT(*) FILTER (WHERE vehicle_selected) as vehicle_selections,
  COUNT(*) FILTER (WHERE booking_created) as bookings_created,
  ROUND(100.0 * COUNT(*) FILTER (WHERE vehicle_selected) / NULLIF(COUNT(*), 0), 2) as selection_rate,
  ROUND(100.0 * COUNT(*) FILTER (WHERE booking_created) / NULLIF(COUNT(*), 0), 2) as conversion_rate,
  AVG(rental_days) as avg_rental_days,
  AVG(advance_days) as avg_advance_days,
  AVG(time_to_select_seconds) FILTER (WHERE time_to_select_seconds IS NOT NULL) as avg_time_to_select,
  AVG(total_conversion_seconds) FILTER (WHERE total_conversion_seconds IS NOT NULL) as avg_total_conversion
FROM public.search_queries
GROUP BY DATE(searched_at)
ORDER BY date DESC;

CREATE VIEW public.top_searched_dates AS
SELECT 
  pickup_date,
  dropoff_date,
  rental_days,
  COUNT(*) as search_count,
  COUNT(*) FILTER (WHERE booking_created) as bookings_count,
  ROUND(100.0 * COUNT(*) FILTER (WHERE booking_created) / NULLIF(COUNT(*), 0), 2) as conversion_rate,
  AVG(avg_price_shown) as avg_price,
  season_applied
FROM public.search_queries
WHERE searched_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY pickup_date, dropoff_date, rental_days, season_applied
HAVING COUNT(*) >= 2
ORDER BY search_count DESC
LIMIT 100;

CREATE VIEW public.vehicle_search_performance AS
SELECT 
  v.id as vehicle_id,
  v.name as vehicle_name,
  v.slug as vehicle_slug,
  COUNT(*) as times_selected,
  COUNT(*) FILTER (WHERE sq.booking_created) as times_booked,
  ROUND(100.0 * COUNT(*) FILTER (WHERE sq.booking_created) / NULLIF(COUNT(*), 0), 2) as booking_rate,
  AVG(sq.selected_vehicle_price) as avg_price_shown,
  MIN(sq.vehicle_selected_at) as first_selected_at,
  MAX(sq.vehicle_selected_at) as last_selected_at
FROM public.search_queries sq
JOIN public.vehicles v ON sq.selected_vehicle_id = v.id
WHERE sq.vehicle_selected = true
  AND sq.searched_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY v.id, v.name, v.slug
ORDER BY times_selected DESC;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administradores pueden leer todas las búsquedas"
  ON public.search_queries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

CREATE POLICY "API puede insertar búsquedas"
  ON public.search_queries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "API puede actualizar búsquedas"
  ON public.search_queries
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden eliminar búsquedas"
  ON public.search_queries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. FUNCIÓN DE LIMPIEZA AUTOMÁTICA
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_search_queries()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.search_queries
  WHERE booking_created = false
    AND searched_at < NOW() - INTERVAL '12 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ✅ VERIFICACIÓN FINAL
-- ============================================

SELECT 
  '✅ Tabla search_queries creada con ' || COUNT(*) || ' columnas' as status
FROM information_schema.columns 
WHERE table_name = 'search_queries';

SELECT COUNT(*) || ' índices creados' as indices 
FROM pg_indexes 
WHERE tablename = 'search_queries';

SELECT 'Accede a /administrator/busquedas' as dashboard;
