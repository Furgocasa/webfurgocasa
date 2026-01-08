# Script de Migración del Blog Furgocasa

Este script automatiza la extracción de todos los artículos del blog antiguo de Furgocasa (https://www.furgocasa.com/es/blog) y genera archivos para importarlos en la nueva base de datos.

## 📋 Características

El script extrae automáticamente:
- ✅ **Título** del artículo
- ✅ **URL completa** y **slug** (última parte de la URL)
- ✅ **Categoría** (rutas, noticias, vehículos)
- ✅ **Contenido HTML** completo del artículo
- ✅ **Imagen destacada** (og:image o primera imagen)
- ✅ **Extracto/Excerpt** (meta description)
- ✅ **Fecha de publicación**
- ✅ **Meta tags** (title, description, keywords)
- ✅ **Tiempo de lectura** estimado

## 🚀 Uso

### Paso 1: Ejecutar el scraper

```bash
npm run scrape:blog
```

Este comando procesará todas las categorías del blog y extraerá todos los artículos encontrados.

### Paso 2: Archivos generados

El script genera automáticamente 3 archivos en la carpeta `scripts/`:

1. **`blog-articles.json`** - Datos completos en formato JSON
2. **`import-blog-articles.sql`** - Script SQL listo para ejecutar en Supabase
3. **`blog-articles-summary.csv`** - Resumen en formato CSV para revisión

## 📂 Estructura de URLs

El script respeta la estructura de URLs del blog antiguo:

```
https://www.furgocasa.com/es/blog/rutas/nombre-del-articulo
https://www.furgocasa.com/es/blog/noticias/nombre-del-articulo
https://www.furgocasa.com/es/blog/vehiculos/nombre-del-articulo
```

Y las mapea correctamente a las categorías de la nueva base de datos:
- `rutas` → content_categories.slug = 'rutas'
- `noticias` → content_categories.slug = 'noticias'
- `vehiculos` → content_categories.slug = 'vehiculos'

## 💾 Importar a Supabase

Una vez generado el archivo SQL, puedes importarlo de dos formas:

### Opción 1: Desde el dashboard de Supabase
1. Abre el dashboard de Supabase
2. Ve a la sección SQL Editor
3. Copia y pega el contenido de `import-blog-articles.sql`
4. Ejecuta el script

### Opción 2: Desde la línea de comandos
```bash
# Conectar a tu base de datos
psql -h [tu-host] -U postgres -d postgres

# Ejecutar el script
\i scripts/import-blog-articles.sql
```

## 🔍 Verificación

El script SQL incluye queries de verificación al final que mostrarán:
- Lista de todos los artículos importados con su categoría
- Resumen del total de artículos por categoría

## ⚙️ Configuración Avanzada

Si necesitas modificar el comportamiento del script, puedes editar `scripts/scrape-blog.js`:

### Cambiar categorías a procesar
```javascript
const BLOG_CATEGORIES = [
  { slug: 'rutas', url: 'https://www.furgocasa.com/es/blog/rutas' },
  { slug: 'noticias', url: 'https://www.furgocasa.com/es/blog/noticias' },
  { slug: 'vehiculos', url: 'https://www.furgocasa.com/es/blog/vehiculos' }
];
```

### Ajustar selectores CSS
Si la estructura HTML del blog cambia, puedes modificar los selectores:
```javascript
const contentSelectors = [
  'article',
  '.blog-content',
  '.post-content',
  // Añade más selectores aquí
];
```

## 🛠️ Solución de Problemas

### Error: "Cannot find module 'puppeteer'"
```bash
npm install puppeteer --save-dev --legacy-peer-deps
```

### Error de timeout
Si algunos artículos tardan mucho en cargar, aumenta el timeout en `scrape-blog.js`:
```javascript
await page.goto(url, { 
  waitUntil: 'networkidle2',
  timeout: 120000  // 2 minutos
});
```

### El script no encuentra artículos
1. Verifica que las URLs de las categorías sean correctas
2. Inspecciona la estructura HTML del blog para ajustar los selectores
3. Asegúrate de tener conexión a internet estable

## 📊 Ejemplo de Salida

```
🚀 Iniciando extracción del blog de Furgocasa...

📂 Procesando categoría: rutas
   URL: https://www.furgocasa.com/es/blog/rutas
   ✅ Encontrados 25 artículos
   📄 [1/25] Extrayendo: https://www.furgocasa.com/es/blog/rutas/los-10-mejores-planes-para-septiembre...
      ✅ Los 10 mejores planes para Septiembre con tu camper de alquiler
   ...

📂 Procesando categoría: noticias
   ...

✅ Extracción completada: 75 artículos encontrados

💾 Datos guardados en: scripts/blog-articles.json
📝 Archivo SQL generado: scripts/import-blog-articles.sql
📊 Resumen CSV generado: scripts/blog-articles-summary.csv
```

## 📝 Notas Importantes

- El script respeta los slugs originales de las URLs para mantener el SEO
- Las imágenes se mantienen como URLs externas por ahora
- Los tres primeros artículos se marcan automáticamente como "destacados"
- Todo el contenido se importa con estado `published`
- Los artículos duplicados se actualizan en lugar de crear duplicados (usando `ON CONFLICT`)

## 🔄 Actualización del Blog

Si necesitas actualizar el contenido del blog en el futuro, simplemente:
1. Ejecuta nuevamente `npm run scrape:blog`
2. El script regenerará los archivos con el contenido más reciente
3. Ejecuta el SQL nuevamente (actualizará los artículos existentes)

## 💡 Siguientes Pasos

Después de importar los artículos:
1. Revisa que las imágenes se vean correctamente
2. Verifica los meta tags para SEO
3. Considera descargar las imágenes y subirlas a tu propio storage
4. Ajusta los artículos destacados si es necesario
5. Configura las rutas en Next.js para servir los artículos

---

**Desarrollado para Furgocasa** - Sistema de migración del blog
