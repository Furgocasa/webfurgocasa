---
name: redactar-articulo-blog
description: Redacta o reescribe artículos del blog Furgocasa en HTML SEO con GPT-5.5, SerpAPI y Wikipedia. Usar cuando el usuario pida redactar, reescribir, corregir o sustituir el texto de un artículo del blog, o cuando falle la automatización n8n de artículos rutas.
---

# Redactar artículo blog Furgocasa

## Cuándo usar

- "Redacta el texto de este artículo"
- "Reescribe / corrige el contenido del post"
- Sustituir el flujo n8n **FURGOCASA - ARTICULOS RUTAS**

## Configuración

| Parámetro | Valor |
|-----------|-------|
| Modelo | `gpt-5.5` (`OPENAI_BLOG_REDACTOR_MODEL`) |
| Temperature | **0.7** en gpt-4o; en **gpt-5.5** usa temperatura por defecto del modelo |
| Investigación | SerpAPI + Wikipedia |
| Salida | HTML en `posts.content` (Supabase) |

Prompt completo: `src/lib/blog/blog-redactor-prompt.ts`

## Workflow

1. Identificar URL o slug del artículo en furgocasa.com
2. Ejecutar redacción (dry-run primero si el usuario no confirmó sobrescribir):

```bash
npx tsx scripts/redact-blog-article.ts "https://www.furgocasa.com/es/blog/rutas/SLUG" --dry-run
npx tsx scripts/redact-blog-article.ts "https://www.furgocasa.com/es/blog/rutas/SLUG"
```

3. Regenerar **solo metadatos SEO** (sin tocar el HTML) si el contenido ya está bien:

```bash
npx tsx scripts/redact-blog-article.ts "URL" --seo-only
```

4. Opcional pipeline completo tras redactar:

```bash
npx tsx scripts/redact-blog-article.ts "URL" --translate
npm run generate:blog-cover-and-body -- "URL"
```

(`generate:blog-cover-and-body` con `npx tsx` si lleva flags `--scene-type`.)

5. Informar al usuario: palabras, tiempo de lectura, slug y si quiere portada/imágenes/traducción

## Metadatos SEO (automáticos)

Tras redactar (o con `--seo-only`), el agente guarda en Supabase:

| Campo | Uso |
|-------|-----|
| `excerpt` | Lead del artículo + Open Graph / Twitter |
| `meta_title` | `<title>` y og:title (50-60 chars) |
| `meta_description` | Meta description (140-155 chars) |
| `meta_keywords` | Keywords meta + JSON-LD si no hay tags |
| `reading_time` | Calculado por palabras |

Verificar con `--seo-only` antes de traducir. La traducción copia `meta_title` y `meta_description` a EN/FR/DE.

## Reglas del redactor (resumen)

- Artículo extenso, veraz, SEO camper/autocaravana
- CTAs suaves a [reservar](https://www.furgocasa.com/es/reservar)
- Links internos Furgocasa con anclas naturales (no URL cruda)
- Links externos a sitios locales con autoridad; si hay duda → home oficial
- **No repetir el título** como primer `<h1>`/`<h2>` (ya está en la cabecera de la página)
- Empezar con párrafos `<p>` introductorios
- Mapa Furgocasa **mín. 2 veces** cuando hables de áreas/pernocta/servicios
- Links internos repartidos por el artículo, no solo al final
- Solo HTML del artículo; sin listas de keywords al final
- No mencionar revisiones internas

## Errores frecuentes n8n

El nodo **Traduce EN** suele fallar por parámetros del modelo. Aquí la traducción es aparte:

```bash
node translate-blog-content.js SLUG-ES
```

## Variables .env.local

- `OPENAI_API_KEY` (obligatorio)
- `SERPAPI_KEY` (recomendado)
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
