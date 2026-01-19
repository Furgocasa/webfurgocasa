-- ============================================
-- NORMALIZAR CÓDIGOS DE PAÍS A NOMBRES COMPLETOS
-- ============================================
-- Este script actualiza todos los códigos ISO de país (ESP, ARG, etc.)
-- a sus nombres completos en español (España, Argentina, etc.)
-- 
-- IMPORTANTE: Ejecutar en Supabase SQL Editor
-- ============================================

BEGIN;

-- Actualizar códigos de España
UPDATE customers
SET country = 'España'
WHERE country IN ('ESP', 'ES', 'esp', 'es', 'españa', 'ESPAÑA')
  AND country != 'España';

-- Actualizar códigos de Argentina
UPDATE customers
SET country = 'Argentina'
WHERE country IN ('ARG', 'AR', 'arg', 'ar', 'argentina', 'ARGENTINA')
  AND country != 'Argentina';

-- Actualizar códigos de México
UPDATE customers
SET country = 'México'
WHERE country IN ('MEX', 'MX', 'mex', 'mx', 'mexico', 'MEXICO', 'méxico', 'MÉXICO')
  AND country != 'México';

-- Actualizar códigos de Colombia
UPDATE customers
SET country = 'Colombia'
WHERE country IN ('COL', 'CO', 'col', 'co', 'colombia', 'COLOMBIA')
  AND country != 'Colombia';

-- Actualizar códigos de Chile
UPDATE customers
SET country = 'Chile'
WHERE country IN ('CHI', 'CL', 'chi', 'cl', 'chile', 'CHILE')
  AND country != 'Chile';

-- Actualizar códigos de Perú
UPDATE customers
SET country = 'Perú'
WHERE country IN ('PER', 'PE', 'per', 'pe', 'peru', 'PERU', 'perú', 'PERÚ')
  AND country != 'Perú';

-- Actualizar códigos de Venezuela
UPDATE customers
SET country = 'Venezuela'
WHERE country IN ('VEN', 'VE', 'ven', 've', 'venezuela', 'VENEZUELA')
  AND country != 'Venezuela';

-- Actualizar códigos de Ecuador
UPDATE customers
SET country = 'Ecuador'
WHERE country IN ('ECU', 'EC', 'ecu', 'ec', 'ecuador', 'ECUADOR')
  AND country != 'Ecuador';

-- Actualizar códigos de Uruguay
UPDATE customers
SET country = 'Uruguay'
WHERE country IN ('URY', 'UY', 'ury', 'uy', 'uruguay', 'URUGUAY')
  AND country != 'Uruguay';

-- Actualizar códigos de Paraguay
UPDATE customers
SET country = 'Paraguay'
WHERE country IN ('PRY', 'PY', 'pry', 'py', 'paraguay', 'PARAGUAY')
  AND country != 'Paraguay';

-- Actualizar códigos de Bolivia
UPDATE customers
SET country = 'Bolivia'
WHERE country IN ('BOL', 'BO', 'bol', 'bo', 'bolivia', 'BOLIVIA')
  AND country != 'Bolivia';

-- Actualizar códigos de Brasil
UPDATE customers
SET country = 'Brasil'
WHERE country IN ('BRA', 'BR', 'bra', 'br', 'brasil', 'BRASIL')
  AND country != 'Brasil';

-- Actualizar códigos de Portugal
UPDATE customers
SET country = 'Portugal'
WHERE country IN ('PRT', 'PT', 'prt', 'pt', 'portugal', 'PORTUGAL')
  AND country != 'Portugal';

-- Actualizar códigos de Francia
UPDATE customers
SET country = 'Francia'
WHERE country IN ('FRA', 'FR', 'fra', 'fr', 'francia', 'FRANCIA')
  AND country != 'Francia';

-- Actualizar códigos de Italia
UPDATE customers
SET country = 'Italia'
WHERE country IN ('ITA', 'IT', 'ita', 'it', 'italia', 'ITALIA')
  AND country != 'Italia';

-- Actualizar códigos de Alemania
UPDATE customers
SET country = 'Alemania'
WHERE country IN ('DEU', 'DE', 'deu', 'de', 'alemania', 'ALEMANIA')
  AND country != 'Alemania';

-- Actualizar códigos de Reino Unido
UPDATE customers
SET country = 'Reino Unido'
WHERE country IN ('GBR', 'GB', 'UK', 'gbr', 'gb', 'uk', 'reino unido', 'REINO UNIDO')
  AND country != 'Reino Unido';

-- Actualizar códigos de Estados Unidos
UPDATE customers
SET country = 'Estados Unidos'
WHERE country IN ('USA', 'US', 'usa', 'us', 'estados unidos', 'ESTADOS UNIDOS')
  AND country != 'Estados Unidos';

-- Actualizar códigos de Canadá
UPDATE customers
SET country = 'Canadá'
WHERE country IN ('CAN', 'CA', 'can', 'ca', 'canada', 'CANADA', 'canadá', 'CANADÁ')
  AND country != 'Canadá';

-- Actualizar el campo updated_at para todos los registros modificados
UPDATE customers
SET updated_at = NOW()
WHERE country IN (
  'España', 'Argentina', 'México', 'Colombia', 'Chile', 'Perú',
  'Venezuela', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia', 'Brasil',
  'Portugal', 'Francia', 'Italia', 'Alemania', 'Reino Unido',
  'Estados Unidos', 'Canadá'
)
AND updated_at < NOW() - INTERVAL '1 minute';

COMMIT;

-- Verificar los resultados
SELECT 
  country,
  COUNT(*) as total_clientes
FROM customers
WHERE country IS NOT NULL
GROUP BY country
ORDER BY total_clientes DESC;

-- Mostrar resumen de la normalización
SELECT 
  CASE 
    WHEN country IN ('España', 'Argentina', 'México', 'Colombia', 'Chile', 'Perú',
                     'Venezuela', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia', 'Brasil',
                     'Portugal', 'Francia', 'Italia', 'Alemania', 'Reino Unido',
                     'Estados Unidos', 'Canadá') THEN '✅ Normalizado'
    WHEN country IS NULL THEN '⚠️ Sin país'
    ELSE '⚠️ Revisar manualmente'
  END as estado,
  country,
  COUNT(*) as total
FROM customers
GROUP BY country
ORDER BY total DESC;
