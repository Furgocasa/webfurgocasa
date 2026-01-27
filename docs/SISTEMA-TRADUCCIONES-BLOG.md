# Sistema de Traducciones del Blog

## 📋 Resumen

El blog tiene un sistema **híbrido** de traducciones:

- **Inglés**: Las traducciones están en **columnas directas** de la tabla `posts`:
  - `title_en`
  - `excerpt_en`
  - `content_en`
  - `slug_en`

- **Francés y Alemán**: Las traducciones están en la **tabla `content_translations`** (NO en columnas de `posts`):
  - `source_table = 'posts'`
  - `source_field = 'title'`, `'excerpt'`, `'content'`, etc.
  - `locale = 'fr'` o `'de'`

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

## 📝 Notas Técnicas

- El sistema usa OpenAI para traducir automáticamente
- Las traducciones se pueden marcar como automáticas (`is_auto_translated = true`) o manuales
- El sistema tiene un fallback: si no hay traducción, muestra el español
- Los slugs traducidos están en `slug_en`, `slug_fr`, `slug_de` en la tabla `posts`
