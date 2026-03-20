-- Cuando existe location_targets.slug = locations.slug con recogida activa,
-- el nearest debe ser esa sede (distance 0). Corrige datos legacy (ej. Alicante → Murcia).
UPDATE location_targets lt
SET
  nearest_location_id = loc.id,
  distance_km = 0,
  travel_time_minutes = 0,
  updated_at = NOW()
FROM locations loc
WHERE loc.slug = lt.slug
  AND loc.is_active = TRUE
  AND loc.is_pickup = TRUE
  AND lt.is_active = TRUE
  AND (lt.nearest_location_id IS DISTINCT FROM loc.id OR lt.distance_km IS DISTINCT FROM 0);
