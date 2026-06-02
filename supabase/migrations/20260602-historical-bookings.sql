-- 20260602 · Histórico de alquileres (Análisis de Ocupación 2018-2026)
--
-- Importa el histórico de ocupación que Furgocasa mantenía en Excel
-- ("FURGOCASA - ANALISIS OCUPACION.xlsx", hoja DATOS) para poder visualizarlo
-- en /administrator/informes JUNTO a las reservas reales de la web nueva.
--
-- El Excel es un registro DIARIO (una fila por vehículo y día). El importador
-- (scripts/import-historical-occupancy.ts) agrupa los días ALQUILADA consecutivos
-- del mismo vehículo + cliente en un "alquiler" y los guarda aquí.
--
-- IMPORTANTE: esta tabla NO toca la operativa real (bookings, calendario,
-- disponibilidad). Solo se usa para estadísticas históricas. La deduplicación
-- contra reservas reales (solape vehículo + fechas) se hace al combinar en la UI.

CREATE TABLE IF NOT EXISTS historical_bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Clave determinista para idempotencia del import (vehículo|inicio|fin|cliente)
  external_key  TEXT NOT NULL UNIQUE,

  -- Vehículo (guardado como texto: muchos ya están vendidos y no existen en `vehicles`)
  vehicle_code  TEXT,                 -- p.ej. 'FU0017' o '1' (flota antigua sin código FU)
  vehicle_label TEXT NOT NULL,        -- 'FU0017 - KNAUS BOXSTAR STREET'
  vehicle_name  TEXT,                 -- 'KNAUS BOXSTAR STREET' (sin código)

  -- Datos comerciales
  customer_name TEXT,
  channel       TEXT,                 -- FURGOCASA, YESCAPA, CAMPANDA, INDIE CAMPERS...
  location      TEXT,                 -- MURCIA, MADRID, ALICANTE...
  company       TEXT,                 -- empresa propietaria (FURGOCASA / FURGOCASA MADRID)
  estado        TEXT,                 -- ALQUILADA, PREVENTA... (estado original del Excel)

  -- Temporada
  season_label  TEXT,                 -- '1 - Alta', '4 - Baja'... (etiqueta original)
  season_type   TEXT CHECK (season_type IN ('alta','media','baja')),

  -- Periodo de ocupación (días ocupados inclusive: pickup..dropoff)
  pickup_date   DATE NOT NULL,
  dropoff_date  DATE NOT NULL,
  days          INTEGER NOT NULL,
  total_price   NUMERIC(12,2) NOT NULL DEFAULT 0,

  source        TEXT NOT NULL DEFAULT 'excel-ocupacion',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_historical_bookings_pickup       ON historical_bookings (pickup_date);
CREATE INDEX IF NOT EXISTS idx_historical_bookings_vehicle_code ON historical_bookings (vehicle_code);
CREATE INDEX IF NOT EXISTS idx_historical_bookings_dates        ON historical_bookings (pickup_date, dropoff_date);

ALTER TABLE historical_bookings ENABLE ROW LEVEL SECURITY;

-- Sin políticas públicas: anon/auth no pueden leer ni escribir.
-- La app accede con service_role (createAdminClient) desde rutas admin protegidas.
-- El importador también usa service_role.

COMMENT ON TABLE historical_bookings IS
  'Histórico de alquileres 2018-2026 importado del Excel de Análisis de Ocupación. '
  'Solo para estadísticas en /administrator/informes. Acceso vía service_role en servidor.';
