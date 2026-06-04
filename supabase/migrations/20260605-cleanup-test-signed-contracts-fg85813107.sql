-- Limpieza puntual: contratos de PRUEBA de la reserva FG85813107
-- Ejecutar en Supabase SQL Editor si aún no está desplegado el botón de eliminar del admin.
--
-- IMPORTANTE: Este SQL solo borra registros en la tabla. Los PDF en el bucket
-- `signed-contracts` deben eliminarse con el panel admin (Eliminar todos) o
-- manualmente en Storage > signed-contracts > carpeta del booking_id.

DELETE FROM signed_contracts
WHERE booking_number = 'FG85813107';
