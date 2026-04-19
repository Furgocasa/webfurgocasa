-- ============================================
-- SISTEMA DE ANÁLISIS DE BÚSQUEDAS - FURGOCASA
-- ============================================
-- Este script crea toda la infraestructura necesaria para el tracking
-- del funnel de conversión de búsquedas.
--
-- Ejecutar en: Supabase SQL Editor
-- Versión: 1.1.0
-- Fecha: 2026-01-25
-- ============================================

-- ============================================
-- 1. CREAR TABLA search_queries
-- ============================================

CREATE TABLE IF NOT EXISTS public.search_queries (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  
  -- Datos de la búsqueda
  searched_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  pickup_date DATE NOT NULL,
  dropoff_date DATE NOT NULL,
  rental_days INTEGER NOT NULL,
  advance_days INTEGER NOT NULL,
  
  -- Ubicaciones
  pickup_location TEXT,
  dropoff_location TEXT,
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

-- Comentarios para documentación
COMMENT ON TABLE public.search_queries IS 'Tracking del funnel de conversión de búsquedas de vehículos';
COMMENT ON COLUMN public.search_queries.session_id IS 'ID de sesión del usuario (cookie)';
COMMENT ON COLUMN public.search_queries.advance_days IS 'Días de antelación respecto a la fecha de búsqueda';
COMMENT ON COLUMN public.search_queries.funnel_stage IS 'Etapa actual en el funnel: search_only, vehicle_selected, booking_created';
COMMENT ON COLUMN public.search_queries.time_to_select_seconds IS 'Segundos desde búsqueda hasta selección de vehículo (calculado por trigger)';
COMMENT ON COLUMN public.search_queries.time_to_booking_seconds IS 'Segundos desde selección hasta reserva completada (calculado por trigger)';
COMMENT ON COLUMN public.search_queries.total_conversion_seconds IS 'Segundos totales desde búsqueda hasta reserva (calculado por trigger)';

-- ============================================
-- 2. CREAR ÍNDICES PARA OPTIMIZAR CONSULTAS
-- ============================================

-- Índice compuesto para consultas por fecha y stage
CREATE INDEX IF NOT EXISTS idx_search_queries_searched_at_funnel 
  ON public.search_queries(searched_at DESC, funnel_stage);

-- Índice para búsquedas por sesión
CREATE INDEX IF NOT EXISTS idx_search_queries_session_id 
  ON public.search_queries(session_id);

-- Índice para análisis de fechas más buscadas
CREATE INDEX IF NOT EXISTS idx_search_queries_pickup_date 
  ON public.search_queries(pickup_date);

-- Índice para análisis de vehículos seleccionados
CREATE INDEX IF NOT EXISTS idx_search_queries_selected_vehicle 
  ON public.search_queries(selected_vehicle_id) 
  WHERE selected_vehicle_id IS NOT NULL;

-- Índice para análisis de conversiones
CREATE INDEX IF NOT EXISTS idx_search_queries_booking 
  ON public.search_queries(booking_id) 
  WHERE booking_id IS NOT NULL;

-- Índice para análisis por temporada
CREATE INDEX IF NOT EXISTS idx_search_queries_season 
  ON public.search_queries(season_applied) 
  WHERE season_applied IS NOT NULL;

-- Índice para búsquedas sin disponibilidad
CREATE INDEX IF NOT EXISTS idx_search_queries_no_availability 
  ON public.search_queries(pickup_date, dropoff_date) 
  WHERE had_availability = false;

-- ============================================
-- 3. TRIGGER: Calcular tiempos de conversión
-- ============================================

CREATE OR REPLACE FUNCTION calculate_search_conversion_times()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular tiempo desde búsqueda hasta selección de vehículo
  IF NEW.vehicle_selected = true AND NEW.vehicle_selected_at IS NOT NULL THEN
    NEW.time_to_select_seconds := EXTRACT(EPOCH FROM (NEW.vehicle_selected_at - NEW.searched_at))::INTEGER;
  END IF;
  
  -- Calcular tiempo desde selección hasta reserva
  IF NEW.booking_created = true AND NEW.booking_created_at IS NOT NULL AND NEW.vehicle_selected_at IS NOT NULL THEN
    NEW.time_to_booking_seconds := EXTRACT(EPOCH FROM (NEW.booking_created_at - NEW.vehicle_selected_at))::INTEGER;
  END IF;
  
  -- Calcular tiempo total desde búsqueda hasta reserva
  IF NEW.booking_created = true AND NEW.booking_created_at IS NOT NULL THEN
    NEW.total_conversion_seconds := EXTRACT(EPOCH FROM (NEW.booking_created_at - NEW.searched_at))::INTEGER;
  END IF;
  
  -- Actualizar timestamp de modificación
  NEW.updated_at := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asociar el trigger a la tabla
DROP TRIGGER IF EXISTS trigger_calculate_conversion_times ON public.search_queries;
CREATE TRIGGER trigger_calculate_conversion_times
  BEFORE INSERT OR UPDATE ON public.search_queries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_search_conversion_times();

COMMENT ON FUNCTION calculate_search_conversion_times() IS 'Calcula automáticamente los tiempos de conversión en el funnel';

-- ============================================
-- 4. VISTAS PARA ANÁLISIS AGREGADOS
-- ============================================

-- Vista: Estadísticas de conversión por día
CREATE OR REPLACE VIEW search_conversion_stats AS
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

COMMENT ON VIEW search_conversion_stats IS 'Estadísticas diarias de conversión del funnel de búsquedas';

-- Vista: Top fechas más buscadas
CREATE OR REPLACE VIEW top_searched_dates AS
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

COMMENT ON VIEW top_searched_dates IS 'Top 100 rangos de fechas más buscados en los últimos 90 días';

-- Vista: Rendimiento por vehículo
CREATE OR REPLACE VIEW vehicle_search_performance AS
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

COMMENT ON VIEW vehicle_search_performance IS 'Rendimiento de cada vehículo en términos de selecciones y conversiones';

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activar RLS en la tabla
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

-- Política 1: Administradores pueden ver todo
CREATE POLICY "Administradores pueden leer todas las búsquedas"
  ON public.search_queries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Política 2: Permitir INSERT desde API pública (anónimo y autenticado)
CREATE POLICY "API puede insertar búsquedas"
  ON public.search_queries
  FOR INSERT
  WITH CHECK (true);

-- Política 3: Permitir UPDATE desde API pública para tracking
CREATE POLICY "API puede actualizar búsquedas"
  ON public.search_queries
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política 4: Solo administradores pueden eliminar
CREATE POLICY "Solo administradores pueden eliminar búsquedas"
  ON public.search_queries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Administradores pueden leer todas las búsquedas" ON public.search_queries IS 'Solo usuarios admin pueden ver las estadísticas de búsqueda';
COMMENT ON POLICY "API puede insertar búsquedas" ON public.search_queries IS 'Permite que la API registre búsquedas sin autenticación';
COMMENT ON POLICY "API puede actualizar búsquedas" ON public.search_queries IS 'Permite que la API actualice el tracking (selección, conversión)';

-- ============================================
-- 6. FUNCIÓN DE LIMPIEZA AUTOMÁTICA
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_search_queries()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Elimina búsquedas sin conversión de hace más de 12 meses
  DELETE FROM public.search_queries
  WHERE booking_created = false
    AND searched_at < NOW() - INTERVAL '12 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_search_queries() IS 'Limpia búsquedas antiguas sin conversión (>12 meses) para mantener la BD optimizada';

-- ============================================
-- 7. VERIFICACIÓN DE LA INSTALACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tabla search_queries creada correctamente';
  RAISE NOTICE '✅ % índices creados', (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'search_queries');
  RAISE NOTICE '✅ Trigger de conversión instalado';
  RAISE NOTICE '✅ 3 vistas analíticas creadas';
  RAISE NOTICE '✅ RLS activado con 4 políticas';
  RAISE NOTICE '✅ Función de limpieza instalada';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Sistema de análisis de búsquedas instalado correctamente';
  RAISE NOTICE '📊 Accede al dashboard en: /administrator/busquedas';
END $$;

-- ============================================
-- 8. DATOS DE PRUEBA (OPCIONAL - COMENTADO)
-- ============================================

-- Descomenta para insertar datos de prueba:

/*
INSERT INTO public.search_queries (
  session_id,
  pickup_date,
  dropoff_date,
  rental_days,
  advance_days,
  vehicles_available_count,
  avg_price_shown,
  season_applied,
  had_availability,
  funnel_stage,
  locale,
  user_agent_type
) VALUES
  ('test-session-1', CURRENT_DATE + 30, CURRENT_DATE + 37, 7, 30, 5, 450.00, 'Temporada Alta', true, 'search_only', 'es', 'desktop'),
  ('test-session-2', CURRENT_DATE + 45, CURRENT_DATE + 52, 7, 45, 5, 380.00, 'Temporada Media', true, 'vehicle_selected', 'en', 'mobile'),
  ('test-session-3', CURRENT_DATE + 60, CURRENT_DATE + 74, 14, 60, 5, 720.00, 'Temporada Baja', true, 'booking_created', 'fr', 'tablet');

RAISE NOTICE '✅ 3 registros de prueba insertados';
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
