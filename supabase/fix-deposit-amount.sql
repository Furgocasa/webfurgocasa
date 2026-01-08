-- Script para corregir el valor por defecto de la fianza y actualizar registros existentes

-- 1. Cambiar el valor por defecto de deposit_amount de 500 a 1000
ALTER TABLE bookings 
ALTER COLUMN deposit_amount SET DEFAULT 1000;

-- 2. Actualizar las reservas existentes que tengan 500 a 1000
UPDATE bookings 
SET deposit_amount = 1000 
WHERE deposit_amount = 500;

-- 3. Verificar el cambio
SELECT 
    column_name,
    column_default,
    data_type
FROM information_schema.columns
WHERE table_name = 'bookings' 
  AND column_name = 'deposit_amount';

-- 4. Ver las reservas actualizadas
SELECT 
    booking_number,
    deposit_amount,
    total_price,
    status
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

