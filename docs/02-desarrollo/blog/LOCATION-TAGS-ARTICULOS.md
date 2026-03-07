# Location Tags en Artículos del Blog

## Objetivo

Mostrar **contenido cada vez más específico** en cada destino. En la landing de Murcia se muestran rutas sobre Murcia; en Lorca, rutas sobre Lorca o la zona.

## Cómo funciona

1. **Columna `location_tags`** en la tabla `posts` (JSONB array de slugs).
2. En cada landing de ubicación se buscan artículos cuyo `location_tags` contenga el slug de esa ubicación.
3. Si no hay artículos etiquetados, se muestran los últimos 3 del blog (comportamiento anterior).

## Cómo etiquetar artículos

En **Supabase** → tabla `posts` → columna `location_tags`:

- Formato: array JSON de slugs de `location_targets`
- Ejemplo: `["murcia", "cartagena", "lorca"]`

### Slugs de ubicaciones (location_targets)

| Provincia/Región | Slugs |
|------------------|-------|
| Región de Murcia | murcia, lorca, cartagena, mazarron, aguilas, la-manga-del-mar-menor, caravaca-de-la-cruz, yecla, jumilla, cieza, sierra-espuna, alhama, archena, las-torres-de-cotillas |
| Alicante/Valencia | alicante, elche, orihuela, torrevieja, benidorm, valencia |
| Andalucía | almeria, granada, malaga, marbella, jaen, cabo-de-gata |
| Castilla-La Mancha | albacete, cuenca, toledo |
| Madrid | madrid |
| Castilla y León | salamanca, segovia, avila, valladolid, burgos |

### Guía para revisar artículos de RUTAS

1. Abrir el artículo y leer título + contenido.
2. Identificar provincias/lugares mencionados (Murcia, Cartagena, Sierra Espuña, etc.).
3. Añadir los slugs correspondientes a `location_tags`.

**Ejemplos:**

| Artículo | location_tags |
|----------|---------------|
| "Las 10 mejores áreas de autocaravanas de la Región de Murcia" | `["murcia", "lorca", "cartagena", "mazarron"]` |
| "Ruta en Camper por la Toscana Española: Guadalajara" | `["madrid"]` (si hay location para Guadalajara) |
| "Descubre el Parque Natural del Fondó de Elx" | `["elche", "alicante"]` |
| "Ruta por la Sierra de Cazorla" | `["jaen"]` |

## Migración

Ejecutar en Supabase SQL Editor:

```sql
-- Ya incluido en supabase/migrations/add-location-tags-to-posts.sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location_tags JSONB DEFAULT '[]';
```

## Consulta para listar artículos de rutas sin etiquetar

```sql
SELECT p.id, p.title, p.slug, p.published_at, c.slug as category_slug
FROM posts p
LEFT JOIN content_categories c ON c.id = p.category_id
WHERE p.status = 'published'
  AND c.slug = 'rutas'
  AND (p.location_tags IS NULL OR p.location_tags = '[]')
ORDER BY p.published_at DESC;
```

Usa esta consulta para identificar artículos de rutas que aún no tienen `location_tags` y revisarlos.
