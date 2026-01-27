# Sistema de Traducciones del Blog

> **Última actualización**: 27 de Enero 2026 - Fix Language Switcher con slugs traducidos

## 📋 Resumen

El blog tiene un sistema **híbrido** de traducciones:

### Contenido (título, excerpt, content)

- **Inglés**: Columnas directas en tabla `posts` (`title_en`, `excerpt_en`, `content_en`)
- **Francés y Alemán**: Tabla `content_translations` (sistema flexible)

### Slugs (URLs)

- **Todos los idiomas**: Columnas en tabla `posts`:
  - `slug` (español - original)
  - `slug_en` (inglés)
  - `slug_fr` (francés)
  - `slug_de` (alemán)

## 🌐 URLs Multiidioma del Blog

Las URLs del blog son completamente traducidas:

| Idioma | URL |
|--------|-----|
| 🇪🇸 Español | `/es/blog/rutas/navidades-diferentes-viajar-en-camper...` |
| 🇬🇧 Inglés | `/en/blog/routes/different-christmas-traveling-in-a-camper...` |
| 🇫🇷 Francés | `/fr/blog/itineraires/noels-differents-voyager-en-van...` |
| 🇩🇪 Alemán | `/de/blog/routen/andere-weihnachten-mit-dem-camper...` |

### Categorías traducidas

| Español | Inglés | Francés | Alemán |
|---------|--------|---------|--------|
| rutas | routes | itineraires | routen |
| noticias | news | actualites | nachrichten |
| consejos | tips | conseils | tipps |
| destinos | destinations | destinations | reiseziele |
| vehiculos | vehicles | vehicules | fahrzeuge |
| equipamiento | equipment | equipement | ausrustung |

## 🔍 Por qué no ves columnas `title_fr`, `content_fr`, etc.

**No existen** porque las traducciones a francés y alemán se almacenan en la tabla `content_translations`, que es un sistema más flexible que permite traducir cualquier tabla y cualquier campo.

## 📊 Verificar el Estado de las Traducciones

Ejecuta el script SQL:
```sql
-- Ver archivo: supabase/verificar-traducciones-blog.sql
```

Este script te mostrará:
1. Cuántos posts tienen traducciones al inglés
2. Cuántos posts tienen traducciones a francés y alemán
3. Qué posts faltan por traducir

## 🔧 Generar Traducciones Faltantes

### Para Inglés (columnas en `posts`)

Usa el script existente:
```bash
node translate-blog-content.js
```

Este script traduce y guarda en las columnas `title_en`, `excerpt_en`, `content_en`.

### Para Francés y Alemán (tabla `content_translations`)

Hay dos opciones:

#### Opción 1: Usar el sistema automático de cola de traducciones

1. Encolar contenido para traducción:
```sql
-- Ver: supabase/historicos/encolar-contenido-existente.sql
-- Este script encola todos los posts para traducción automática
```

2. Procesar la cola usando la función de Supabase:
```bash
# La función process-translations procesa la cola automáticamente
# Ver: supabase/functions/process-translations/index.ts
```

#### Opción 2: Script manual de traducción

Crear un script similar a `translate-blog-content.js` pero que guarde en `content_translations`:

```javascript
// Ejemplo de cómo guardar traducción en content_translations
const { data, error } = await supabase
  .from('content_translations')
  .upsert({
    source_table: 'posts',
    source_id: post.id,
    source_field: 'title',
    locale: 'fr',
    translated_text: titleFr,
    is_auto_translated: true,
    translation_model: 'gpt-4o-mini'
  }, {
    onConflict: 'source_table,source_id,source_field,locale'
  });
```

## 🎯 Cómo Funciona el Código

Cuando visitas `/fr/blog/...` o `/de/blog/...`, el código:

1. Obtiene el post desde `posts` (contenido en español)
2. Llama a `getTranslatedContent()` que busca en `content_translations`
3. Si encuentra traducciones, las usa; si no, muestra el español

Ver código en:
- `src/lib/translations/get-translations.ts` - Función que obtiene traducciones
- `src/app/fr/blog/[category]/[slug]/page.tsx` - Página en francés
- `src/app/de/blog/[category]/[slug]/page.tsx` - Página en alemán

## ⚠️ Problema Actual

Según la imagen que compartiste:
- Muchos posts tienen `title_en`, `excerpt_en`, `content_en` en **NULL**
- Probablemente tampoco hay traducciones en `content_translations` para francés y alemán

## ✅ Solución Recomendada

1. **Ejecutar el script de verificación** para ver el estado exacto
2. **Generar traducciones al inglés** usando `translate-blog-content.js`
3. **Generar traducciones a francés y alemán** usando el sistema de cola o un script manual

## 🔄 Language Switcher en el Blog

### Cómo funciona

Cuando el usuario cambia de idioma en un artículo del blog:

1. **`BlogRouteDataProvider`** inyecta los slugs traducidos en el DOM (Server Component)
2. **`getBlogRouteData()`** lee estos datos desde el cliente
3. **`setLanguage()`** en `language-context.tsx` construye la URL correcta con el slug traducido
4. Navegación a la URL traducida con `window.location.replace()`

### Archivos clave

| Archivo | Función |
|---------|---------|
| `src/components/blog/blog-route-data.tsx` | Inyecta slugs en DOM, función `getBlogRouteData()` |
| `src/contexts/language-context.tsx` | Lógica de cambio de idioma con slugs del blog |
| `src/lib/blog-translations.ts` | `getAllPostSlugTranslations()` obtiene slugs de Supabase |

### Fix importante (27/01/2026)

**Problema**: El Language Switcher navegaba a URLs con slugs españoles en lugar de traducidos.

**Causa**: En `header.tsx` había **dos navegaciones en carrera**:
1. `setLanguage(lang)` - construía URL correcta pero usaba `setTimeout`
2. `window.location.href = getTranslatedRoute(pathname, lang)` - se ejecutaba inmediatamente pero NO conocía los slugs del blog

**Solución**: Eliminada la navegación duplicada del header. Ahora solo el contexto (`setLanguage`) maneja la navegación.

### Lugares donde se usan slugs traducidos

Los siguientes componentes usan slugs traducidos para evitar URLs incorrectas:

1. **Páginas de categoría** (`blog-category-client.tsx`): Enlaces a artículos
2. **Páginas de artículo** (`[slug]/page.tsx`): Enlaces a artículos relacionados
3. **Language Switcher** (`language-context.tsx`): Cambio de idioma

## 🛠️ Scripts Útiles

| Script | Descripción |
|--------|-------------|
| `scripts/verificar-traducciones-blog.js` | Verifica estado de traducciones |
| `scripts/traducir-blog-completo.js` | Traduce contenido con OpenAI |
| `scripts/verificar-slugs-traducidos.js` | Verifica slugs traducidos |
| `scripts/generar-slugs-traducidos.js` | Genera slugs desde títulos traducidos |

## 📝 Notas Técnicas

- El sistema usa OpenAI (gpt-4o-mini) para traducir automáticamente
- Las traducciones se pueden marcar como automáticas (`is_auto_translated = true`) o manuales
- El sistema tiene un fallback: si no hay traducción, muestra el español
- Los slugs traducidos están en `slug_en`, `slug_fr`, `slug_de` en la tabla `posts`
- `getPostBySlug()` solo busca por el slug correcto según el idioma (no permite combinaciones incorrectas)
