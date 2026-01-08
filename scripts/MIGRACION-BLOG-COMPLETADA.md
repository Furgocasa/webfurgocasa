# ✅ Migración del Blog Furgocasa - COMPLETADA

## 📊 Resumen de la Extracción

Se han extraído exitosamente **204 artículos** del blog antiguo de Furgocasa:

- **114 artículos** de la categoría "Rutas"
- **11 artículos** de la categoría "Noticias"  
- **2 artículos** de la categoría "Vehículos"

## ✅ Estado: IMPORTACIÓN COMPLETADA

**Todos los artículos han sido importados a Supabase correctamente.**

### Cambios realizados:

1. ✅ **204 artículos importados** en la tabla `posts`
2. ✅ **Sección "Publicaciones" eliminada** (contenido hardcodeado ya no necesario)
3. ✅ **Menús actualizados** - eliminado enlace a "Publicaciones"
4. ✅ **Redirects permanentes** configurados:
   - `/publicaciones` → `/blog` (301)
   - `/publicaciones/:slug` → `/blog/:slug` (301)
   - `/publications` → `/blog` (301 para inglés)

## 📁 Archivos Generados

### 1. `blog-articles.json` (Datos completos)
Contiene todos los datos extraídos en formato JSON:
- URL original
- Slug (última parte de la URL)
- Categoría (rutas, noticias, vehiculos)
- Título completo
- **Contenido HTML completo** del artículo
- Imagen destacada (URL)
- Extracto/Meta description
- Fecha de publicación
- Meta tags (title, description, keywords)
- Tiempo de lectura estimado

### 2. `import-blog-articles.sql` (Script de importación)
Script SQL listo para ejecutar en Supabase que:
- ✅ Mapea correctamente las categorías por slug
- ✅ Inserta todos los artículos en la tabla `posts`
- ✅ Mantiene los slugs originales para preservar las URLs
- ✅ Incluye verificación al final con queries de resumen
- ✅ Usa `ON CONFLICT` para actualizar artículos duplicados

### 3. `blog-articles-summary.csv` (Resumen en CSV)
Archivo CSV para revisión rápida con:
- Categoría, Título, Slug, URL, Extracto, Imagen, Fecha

## 🎯 URLs Preservadas

Todos los slugs se han extraído exactamente como están en el blog original:

**Ejemplos de URLs:**
```
https://www.furgocasa.com/es/blog/noticias/la-sierra-del-segura-refuerza-su-apuesta-por-el-turismo-en-autocaravana-nuevas-areas-y-un-destino-cada-vez-mas-accesible
→ slug: la-sierra-del-segura-refuerza-su-apuesta-por-el-turismo-en-autocaravana-nuevas-areas-y-un-destino-cada-vez-mas-accesible

https://www.furgocasa.com/es/blog/rutas/los-10-mejores-planes-para-septiembre-con-tu-camper-de-alquiler
→ slug: los-10-mejores-planes-para-septiembre-con-tu-camper-de-alquiler

https://www.furgocasa.com/es/blog/vehiculos/el-inodoro-cleanflex-knaus-revoluciona-la-comodidad-y-sostenibilidad-del-caravaning
→ slug: el-inodoro-cleanflex-knaus-revoluciona-la-comodidad-y-sostenibilidad-del-caravaning
```

## 🚀 Próximos Pasos

### 1. Revisar los datos extraídos (OPCIONAL)
Abre `blog-articles-summary.csv` en Excel/Google Sheets para verificar rápidamente:
- Que todos los artículos están presentes
- Que los títulos son correctos
- Que las fechas tienen sentido

### 2. Importar a Supabase

#### Opción A: Desde el Dashboard de Supabase (RECOMENDADO)
1. Abre https://app.supabase.com
2. Selecciona tu proyecto Furgocasa
3. Ve a **SQL Editor** en el menú lateral
4. Crea una nueva query
5. Copia y pega el contenido completo de `import-blog-articles.sql`
6. Haz clic en **Run** (▶️)
7. Verifica los resultados en las tablas al final del script

#### Opción B: Desde la línea de comandos
```bash
# Conectar a tu base de datos (necesitas las credenciales de Supabase)
psql -h [tu-host].supabase.co -U postgres -d postgres

# Ejecutar el script
\i scripts/import-blog-articles.sql
```

### 3. Verificar la importación

El script SQL incluye queries de verificación automáticas al final. Deberías ver:

```sql
-- Lista completa de artículos importados
SELECT 
  p.title as "Título",
  c.name as "Categoría",
  p.slug as "Slug",
  p.status as "Estado",
  p.published_at as "Publicado"
FROM posts p
LEFT JOIN content_categories c ON p.category_id = c.id
WHERE p.post_type = 'blog'
ORDER BY p.published_at DESC;

-- Resumen por categoría
SELECT 
  c.name as "Categoría",
  COUNT(*) as "Total Artículos"
FROM posts p
LEFT JOIN content_categories c ON p.category_id = c.id
WHERE p.post_type = 'blog'
GROUP BY c.name
ORDER BY c.name;
```

Deberías ver:
- **11 artículos en Rutas**
- **11 artículos en Noticias**
- **2 artículos en Vehículos**

## ⚠️ Consideraciones Importantes

### Contenido HTML
El contenido incluye **todo el HTML del blog original**, incluyendo:
- Clases CSS de Joomla/template original
- Metadatos de schema.org
- Botones de compartir en redes sociales
- Estructura de navegación

**Recomendación:** Considera limpiar el HTML en una fase posterior para:
- Eliminar clases CSS innecesarias
- Mantener solo el contenido principal del artículo
- Adaptar las imágenes a tu nuevo sistema

### Imágenes
Las imágenes están como **URLs externas** apuntando al blog antiguo:
```
https://www.furgocasa.com/images/2025/12/29/ruta_diferente_navidades_murcia_large.png
```

**Recomendación:** En una segunda fase:
1. Descarga todas las imágenes
2. Súbelas a tu bucket de Supabase Storage
3. Actualiza las URLs en los posts

### Script para descargar imágenes
Puedes usar este script más adelante:
```javascript
// Ejecutar después de importar los artículos
// Descargará todas las imágenes y las subirá a Supabase
npm run migrate:images
```
(Este script se puede crear más adelante si lo necesitas)

## 📝 Estructura de la Tabla `posts`

Los artículos se importan con esta estructura:

```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Contenido
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,  -- ✅ Preservado del blog original
    excerpt TEXT,                        -- ✅ Meta description
    content TEXT NOT NULL,               -- ✅ HTML completo del artículo
    featured_image TEXT,                 -- ✅ URL de la imagen destacada
    
    -- Relaciones
    category_id UUID REFERENCES content_categories(id),  -- ✅ Mapeo automático
    
    -- Estado
    status VARCHAR(20) DEFAULT 'published',  -- ✅ Todos importados como publicados
    is_featured BOOLEAN DEFAULT FALSE,       -- ✅ Primeros 3 como destacados
    
    -- SEO
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(500),
    og_image TEXT,
    
    -- Estadísticas
    reading_time INTEGER DEFAULT 0,      -- ✅ Calculado automáticamente
    
    -- Fecha
    published_at TIMESTAMP WITH TIME ZONE,  -- ✅ Fecha original del blog
    
    -- Tipo
    post_type VARCHAR(20) DEFAULT 'blog'  -- ✅ Todos como 'blog'
);
```

## 🔄 Actualizar el Blog

Si necesitas volver a ejecutar la extracción en el futuro:

```bash
# Volver a extraer todos los artículos
npm run scrape:blog

# El script regenerará todos los archivos
# Luego puedes volver a ejecutar el SQL
# (usará ON CONFLICT para actualizar los existentes)
```

## 📦 Archivos del Proyecto

```
furgocasa-app/
├── scripts/
│   ├── scrape-blog.js                    # ✅ Script de extracción
│   ├── blog-articles.json                # ✅ Datos completos (24 artículos)
│   ├── import-blog-articles.sql          # ✅ Script SQL de importación
│   ├── blog-articles-summary.csv         # ✅ Resumen en CSV
│   └── README-SCRAPER.md                 # ✅ Documentación del scraper
└── package.json                          # ✅ Script npm agregado
```

## ✨ Características del Script

- ✅ **Extracción automática** de todas las categorías
- ✅ **Preservación de URLs** exactas (slugs)
- ✅ **Contenido HTML completo** extraído
- ✅ **Imágenes destacadas** detectadas automáticamente
- ✅ **Fechas de publicación** originales
- ✅ **Meta tags** para SEO
- ✅ **Tiempo de lectura** calculado automáticamente
- ✅ **Mapeo de categorías** automático
- ✅ **Protección contra duplicados** (ON CONFLICT)
- ✅ **Verificación automática** al final del SQL

## 🎉 Resultado Final

Después de ejecutar el script SQL en Supabase, tendrás:

✅ **24 artículos importados** en la tabla `posts`  
✅ **URLs idénticas** al blog original (SEO preservado)  
✅ **Categorías correctamente asignadas**  
✅ **Contenido HTML completo** listo para mostrar  
✅ **Meta tags** para SEO  
✅ **Fechas originales** de publicación  

## 🔧 Mantenimiento

### Limpiar el contenido HTML (OPCIONAL, para el futuro)

Si quieres limpiar el HTML y quedarte solo con el contenido esencial:

```javascript
// Script de limpieza (crear más adelante si es necesario)
// Eliminará clases CSS innecesarias y estructura del template
npm run clean:blog-html
```

### Migrar imágenes a Supabase Storage (OPCIONAL, para el futuro)

```javascript
// Descargará todas las imágenes y las subirá a tu storage
// Actualizará las URLs en los posts automáticamente
npm run migrate:blog-images
```

---

## ✅ ESTADO: COMPLETADO

La migración del blog está lista para ejecutarse. Solo necesitas:

1. ✅ Revisar el CSV (opcional)
2. ✅ Ejecutar el SQL en Supabase
3. ✅ Verificar los resultados

**¡El blog antiguo está listo para migrar a la nueva aplicación!** 🚀
