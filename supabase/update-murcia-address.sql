-- Actualizar dirección de la sede de Murcia
-- Ejecutar en Supabase SQL Editor

UPDATE locations
SET address = 'Avenida Puente Tocinos, 4, 30007 Casillas - Murcia'
WHERE city = 'Murcia'
AND id = '65416e82-2f98-40bd-a90f-7ab54e59942e';

-- Verificar el cambio
SELECT id, name, city, address 
FROM locations 
WHERE city IN ('Murcia', 'Madrid');
