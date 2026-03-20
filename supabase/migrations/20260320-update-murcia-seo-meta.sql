-- ==============================================================================
-- Meta SEO alquiler: location_targets (ES) + content_translations (EN, FR, DE)
-- ==============================================================================
-- Los cambios reales se aplican con el script (lee sedes Murcia/Madrid desde BD):
--
--   node scripts/update-location-targets-rent-meta.js
--   node scripts/update-location-targets-rent-meta.js --dry-run
--
-- Requiere .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
-- No duplicar aquí SQL estático: las filas y UUIDs de sede deben coincidir con producción.
-- ==============================================================================

SELECT 1;
