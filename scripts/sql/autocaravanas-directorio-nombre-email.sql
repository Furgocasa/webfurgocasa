-- Directorio /es/autocaravanas: mismos criterios que getMotorhomeServices (activos y operativos).
-- Categorías en la página: Talleres (taller_camper) y Concesionarios (concesionario_autocaravanas).

SELECT
  name AS nombre,
  COALESCE(NULLIF(trim(email), ''), '(sin email)') AS email,
  category AS categoria,
  province AS provincia
FROM motorhome_services
WHERE status = 'active'
  AND operational_status = 'OPERATIONAL'
  AND category IN ('taller_camper', 'concesionario_autocaravanas')
ORDER BY
  category,
  province NULLS LAST,
  name;

-- Resumen por categoría y disponibilidad de email
-- SELECT category,
--        count(*) AS total,
--        count(*) FILTER (WHERE email IS NOT NULL AND trim(email) <> '') AS con_email
-- FROM motorhome_services
-- WHERE status = 'active'
--   AND operational_status = 'OPERATIONAL'
--   AND category IN ('taller_camper', 'concesionario_autocaravanas')
-- GROUP BY category;
