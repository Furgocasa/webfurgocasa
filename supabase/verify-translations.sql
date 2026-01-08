-- Verificar que las columnas existen
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name LIKE '%_en'
ORDER BY column_name;

-- Ver el contenido actual de las columnas en inglés
SELECT 
  id,
  title,
  title_en,
  CASE WHEN title_en IS NOT NULL THEN '✅' ELSE '❌' END as tiene_traduccion,
  status
FROM posts
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;
