-- Asegurar que vehicle_available_extras tiene RLS habilitado con lectura pública
-- Necesario para que la página de reservar pueda filtrar extras por vehículo

ALTER TABLE vehicle_available_extras ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'vehicle_available_extras' 
    AND policyname = 'vehicle_available_extras_public_read'
  ) THEN
    CREATE POLICY "vehicle_available_extras_public_read" 
      ON vehicle_available_extras 
      FOR SELECT 
      USING (true);
  END IF;
END $$;
