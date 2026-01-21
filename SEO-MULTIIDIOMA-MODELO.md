# SEO Multiidioma - Modelo Correcto

> ⚠️ **IMPORTANTE: NO CAMBIAR ESTA CONFIGURACIÓN** ⚠️
> 
> Este documento describe el modelo SEO multiidioma definitivo para Furgocasa.
> Cualquier cambio debe ser consultado y documentado aquí.

## Resumen Ejecutivo

**Todas las URLs deben llevar prefijo de idioma, incluyendo español (`/es/`).**

```
✅ CORRECTO:  https://www.furgocasa.com/es/blog/rutas
❌ INCORRECTO: https://www.furgocasa.com/blog/rutas
```

## ¿Por qué /es/ es obligatorio?

1. **Compatibilidad con Joomla**: El sitio anterior usaba `/es/` y Google ya tiene indexadas esas URLs
2. **Conservación del SEO**: Cambiar las URLs perdería todo el posicionamiento acumulado
3. **Modelo correcto multiidioma**: Cada idioma debe tener su propio prefijo
4. **hreflang funciona correctamente**: Permite conectar versiones de idioma entre sí

## Estructura de URLs

| Idioma  | Prefijo | Ejemplo |
|---------|---------|---------|
| Español | `/es/`  | `https://www.furgocasa.com/es/blog/rutas` |
| Inglés  | `/en/`  | `https://www.furgocasa.com/en/blog/routes` |
| Francés | `/fr/`  | `https://www.furgocasa.com/fr/blog/itineraires` |
| Alemán  | `/de/`  | `https://www.furgocasa.com/de/blog/routen` |

## Configuración de hreflang

En cada página debe haber etiquetas hreflang que conecten todas las versiones:

```html
<link rel="alternate" hreflang="es" href="https://www.furgocasa.com/es/blog/rutas" />
<link rel="alternate" hreflang="en" href="https://www.furgocasa.com/en/blog/routes" />
<link rel="alternate" hreflang="fr" href="https://www.furgocasa.com/fr/blog/itineraires" />
<link rel="alternate" hreflang="de" href="https://www.furgocasa.com/de/blog/routen" />
<link rel="alternate" hreflang="x-default" href="https://www.furgocasa.com/es/blog/rutas" />
```

- `x-default` siempre apunta a la versión española (idioma principal)

## Configuración en Next.js

### 1. Sitemap (`src/app/sitemap.ts`)

El sitemap genera URLs CON prefijo `/es/`:

```typescript
const addEntry = (path: string, options) => {
  entries.push({
    url: `${baseUrl}/es${path}`,  // ✅ SIEMPRE con /es/
    ...options
  });
};
```

### 2. Metadata en páginas

Cada página debe tener:

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.furgocasa.com/es/pagina",
    languages: {
      'es': 'https://www.furgocasa.com/es/pagina',
      'en': 'https://www.furgocasa.com/en/page',
      'fr': 'https://www.furgocasa.com/fr/page',
      'de': 'https://www.furgocasa.com/de/seite',
      'x-default': 'https://www.furgocasa.com/es/pagina',
    },
  },
};
```

### 3. Middleware (`src/middleware.ts`)

El middleware maneja dos casos:

1. **URL con locale** (`/es/blog/rutas`): Hace rewrite interno a la página física
2. **URL sin locale** (`/blog/rutas`): Redirige añadiendo el locale detectado

```typescript
if (locale) {
  // Tiene locale, hacer rewrite a la ruta sin locale
  const spanishPath = translatePathToSpanish(pathnameWithoutLocale);
  request.nextUrl.pathname = spanishPath;
  return NextResponse.rewrite(request.nextUrl);
} else {
  // No tiene locale, redirigir añadiendo el locale
  request.nextUrl.pathname = `/${detectedLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}
```

### 4. Traducciones de rutas (`src/lib/route-translations.ts`)

La función `getTranslatedRoute` genera URLs con prefijo de idioma:

```typescript
// Entrada: /blog/rutas, targetLang: 'en'
// Salida: /en/blog/routes
```

## Helper para metadatos multiidioma

Usar el helper `generateMultilingualMetadata` de `@/lib/seo/multilingual-metadata.ts`:

```typescript
import { generateMultilingualMetadata } from "@/lib/seo/multilingual-metadata";

export const metadata = generateMultilingualMetadata('/vehiculos', 'es', {
  es: { title: 'Vehículos', description: 'Nuestra flota' },
  en: { title: 'Vehicles', description: 'Our fleet' },
  // ...
});
```

## Checklist para nuevas páginas

- [ ] URL canónica con `/es/` para español
- [ ] hreflang alternates para todos los idiomas
- [ ] x-default apuntando a versión española
- [ ] Añadir entrada en sitemap con `/es/`
- [ ] Añadir traducciones de ruta en `route-translations.ts` si es necesario

## Archivos relacionados

| Archivo | Descripción |
|---------|-------------|
| `src/app/sitemap.ts` | Generación del sitemap con URLs `/es/` |
| `src/middleware.ts` | Manejo de redirecciones y rewrites |
| `src/lib/route-translations.ts` | Traducciones de rutas por idioma |
| `src/lib/seo/multilingual-metadata.ts` | Helper para generar metadatos |
| `next.config.js` | Rewrites para rutas traducidas |

## Historial de cambios

| Fecha | Cambio |
|-------|--------|
| 2026-01-21 | Implementación del modelo correcto con `/es/` obligatorio |

---

**Última actualización**: 21 de enero de 2026
