-- 20260422 · Rellenar marketing_contacts.name (y city si falta) desde datos reales
--
-- Caso típico: contactos importados o creados sin nombre; en customers/bookings
-- sí consta el nombre completo del cliente.
--
-- Orden:
--   1) customers vía marketing_contacts.customer_id
--   2) customers vía mismo email (normalizado lower+trim); enlaza customer_id si estaba NULL
--   3) última reserva (bookings) por email si aún falta nombre (ciudad solo vía customers.customer_id;
--      no se usa customer_city en bookings: no existe en todas las BDs)
--   4) sincroniza mailing_recipients en pending con el contacto actualizado
--
-- Idempotente: solo toca filas donde name está NULL o en blanco.

-- 1) Por FK explícita
UPDATE marketing_contacts mc
SET
  name = NULLIF(btrim(c.name), ''),
  city = COALESCE(NULLIF(btrim(mc.city), ''), NULLIF(btrim(c.city), ''))
FROM customers c
WHERE mc.customer_id = c.id
  AND (mc.name IS NULL OR btrim(mc.name) = '')
  AND NULLIF(btrim(c.name), '') IS NOT NULL;

-- 2) Por email coincidente con customers (un registro por email: el más reciente)
UPDATE marketing_contacts mc
SET
  name = NULLIF(btrim(v.full_name), ''),
  city = COALESCE(NULLIF(btrim(mc.city), ''), NULLIF(btrim(v.city), '')),
  customer_id = COALESCE(mc.customer_id, v.customer_id)
FROM (
  SELECT DISTINCT ON (lower(btrim(c.email)))
    c.id AS customer_id,
    lower(btrim(c.email)) AS norm_email,
    btrim(c.name) AS full_name,
    btrim(c.city) AS city
  FROM customers c
  WHERE NULLIF(btrim(c.email), '') IS NOT NULL
    AND NULLIF(btrim(c.name), '') IS NOT NULL
  ORDER BY
    lower(btrim(c.email)),
    c.updated_at DESC NULLS LAST,
    c.created_at DESC NULLS LAST
) v
WHERE lower(btrim(mc.email)) = v.norm_email
  AND (mc.name IS NULL OR btrim(mc.name) = '');

-- 3) Respaldo: última reserva por email (nombre en la reserva; ciudad desde customers si la reserva lleva customer_id)
UPDATE marketing_contacts mc
SET
  name = NULLIF(btrim(b.customer_name), ''),
  city = COALESCE(NULLIF(btrim(mc.city), ''), NULLIF(btrim(b.city_from_customer), ''))
FROM (
  SELECT DISTINCT ON (lower(btrim(bk.customer_email)))
    lower(btrim(bk.customer_email)) AS norm_email,
    bk.customer_name,
    btrim(cust.city) AS city_from_customer
  FROM bookings bk
  LEFT JOIN customers cust ON cust.id = bk.customer_id
  WHERE NULLIF(btrim(bk.customer_email), '') IS NOT NULL
    AND NULLIF(btrim(bk.customer_name), '') IS NOT NULL
  ORDER BY
    lower(btrim(bk.customer_email)),
    bk.created_at DESC NULLS LAST
) b
WHERE lower(btrim(mc.email)) = b.norm_email
  AND (mc.name IS NULL OR btrim(mc.name) = '');

-- 4) Destinatarios pendientes: alinear nombre/ciudad con el contacto (corrige listas ya cargadas)
UPDATE mailing_recipients mr
SET
  nombre = NULLIF(btrim(mc.name), ''),
  ciudad = COALESCE(NULLIF(btrim(mc.city), ''), NULLIF(btrim(mr.ciudad), ''))
FROM marketing_contacts mc
WHERE mr.contact_id = mc.id
  AND mr.status = 'pending'
  AND NULLIF(btrim(mc.name), '') IS NOT NULL
  AND (mr.nombre IS DISTINCT FROM NULLIF(btrim(mc.name), ''));
