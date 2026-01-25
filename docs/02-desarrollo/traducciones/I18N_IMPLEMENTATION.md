# Arquitectura de Internacionalización (i18n) - Carpetas Fijas por Idioma

> **Última actualización**: 24 Enero 2026  
> **Versión**: 4.1.0  
> **Estado**: ✅ Producción

## 📋 Resumen

El sitio web de Furgocasa utiliza una arquitectura de **carpetas físicas por idioma**. Cada idioma tiene su propia carpeta con sus propias páginas, lo que garantiza SEO óptimo y contenido genuino en cada idioma.

---

## 🌍 Idiomas Soportados

| Idioma | Código | Carpeta | Estado |
|--------|--------|---------|--------|
| 🇪🇸 Español | `es` | `/es/` | ✅ Principal |
| 🇬🇧 Inglés | `en` | `/en/` | ✅ Activo |
| 🇫🇷 Francés | `fr` | `/fr/` | ✅ Activo |
| 🇩🇪 Alemán | `de` | `/de/` | ✅ Activo |

---

## 🏗️ Arquitectura de Carpetas

### Estructura Principal

```
src/app/
├── es/                                    # 🇪🇸 ESPAÑOL
│   ├── page.tsx                           # Home ES
│   ├── alquiler-autocaravanas-campervans/
│   │   └── [location]/page.tsx            # Páginas de localización alquiler
│   ├── venta-autocaravanas-camper/
│   │   └── [location]/page.tsx            # Páginas de localización venta
│   ├── vehiculos/page.tsx                 # Listado vehículos
│   ├── ventas/page.tsx                    # Listado ventas
│   ├── blog/                              # Blog completo
│   │   ├── page.tsx
│   │   ├── [category]/page.tsx
│   │   └── [category]/[slug]/page.tsx
│   ├── contacto/page.tsx
│   ├── tarifas/page.tsx
│   ├── ofertas/page.tsx
│   ├── quienes-somos/page.tsx
│   ├── como-funciona/page.tsx
│   ├── guia-camper/page.tsx
│   ├── faqs/page.tsx
│   ├── mapa-areas/page.tsx
│   ├── parking-murcia/page.tsx
│   ├── inteligencia-artificial/page.tsx
│   └── [...más páginas...]
│
├── en/                                    # 🇬🇧 INGLÉS
│   ├── page.tsx                           # Home EN
│   ├── rent-campervan-motorhome/
│   │   └── [location]/page.tsx            # Rent location pages
│   ├── campervans-for-sale-in/
│   │   └── [location]/page.tsx            # Sale location pages
│   ├── vehicles/page.tsx
│   ├── sales/page.tsx
│   ├── blog/
│   ├── contact/page.tsx
│   ├── rates/page.tsx
│   ├── offers/page.tsx
│   ├── about-us/page.tsx
│   └── [...más páginas...]
│
├── fr/                                    # 🇫🇷 FRANCÉS
│   ├── page.tsx                           # Home FR
│   ├── location-camping-car/
│   │   └── [location]/page.tsx
│   ├── camping-cars-a-vendre/
│   │   └── [location]/page.tsx
│   ├── vehicules/page.tsx
│   ├── ventes/page.tsx
│   ├── blog/
│   ├── contact/page.tsx
│   ├── tarifs/page.tsx
│   └── [...más páginas...]
│
└── de/                                    # 🇩🇪 ALEMÁN
    ├── page.tsx                           # Home DE
    ├── wohnmobil-mieten/
    │   └── [location]/page.tsx
    ├── wohnmobile-zu-verkaufen/
    │   └── [location]/page.tsx
    ├── fahrzeuge/page.tsx
    ├── verkauf/page.tsx
    ├── blog/
    ├── kontakt/page.tsx
    ├── preise/page.tsx
    └── [...más páginas...]
```

### Páginas de Localización ([location])

Las páginas de localización usan rutas dinámicas con `[location]`:

| Idioma | Alquiler | Venta |
|--------|----------|-------|
| ES | `/es/alquiler-autocaravanas-campervans/[location]` | `/es/venta-autocaravanas-camper/[location]` |
| EN | `/en/rent-campervan-motorhome/[location]` | `/en/campervans-for-sale-in/[location]` |
| FR | `/fr/location-camping-car/[location]` | `/fr/camping-cars-a-vendre/[location]` |
| DE | `/de/wohnmobil-mieten/[location]` | `/de/wohnmobile-zu-verkaufen/[location]` |

**Ejemplos de URLs**:
- `/es/alquiler-autocaravanas-campervans/murcia`
- `/en/rent-campervan-motorhome/madrid`
- `/fr/location-camping-car/barcelone`
- `/de/wohnmobil-mieten/valencia`

---

## 🔄 Sistema de Cambio de Idioma (Language Switcher)

El sistema de cambio de idioma funciona de dos formas según el tipo de contenido:

### 1. Blog: Slugs Traducidos Dinámicos (desde Supabase)

Los artículos del blog tienen slugs traducidos almacenados en la base de datos (`content_translations`).
Cuando el usuario cambia de idioma en un artículo, el sistema:

1. Lee los slugs traducidos inyectados en la página (`BlogRouteDataProvider`)
2. Construye la URL con el slug traducido correspondiente
3. Navega a la nueva URL

**Ejemplo:**
```
/es/blog/rutas/cabo-de-palos-en-autocaravana
      ↓ Cambio a inglés
/en/blog/routes/cabo-de-palos-in-a-campervan-discover-its-lighthouse-and-pirate-history
```

**Archivos involucrados:**
- `src/lib/blog-translations.ts` → `getAllPostSlugTranslations()`
- `src/components/blog/blog-route-data.tsx` → `BlogRouteDataProvider`
- `src/contexts/language-context.tsx` → Detecta blog y usa slugs dinámicos

### 2. Localizaciones: Slugs Estáticos (ciudades españolas)

Las páginas de localización (alquiler/venta por ciudad) usan el mismo slug en todos los idiomas
porque son nombres de ciudades españolas que no cambian significativamente.

**Ejemplo:**
```
/es/alquiler-autocaravanas-campervans/murcia
/en/rent-campervan-motorhome/murcia        ← Mismo slug "murcia"
/fr/location-camping-car/murcia
/de/wohnmobil-mieten/murcia
```

**¿Por qué estático?**
- Son nombres propios de ciudades españolas (~50 ciudades)
- Los nombres son prácticamente iguales en todos los idiomas
- Menos complejidad de mantener
- Bueno para SEO: usuarios buscan "campervan Murcia" no "campervan Murcie"

**Archivos involucrados:**
- `src/lib/route-translations.ts` → `getTranslatedRoute()`
- `next.config.js` → Redirecciones 301 para URLs legacy

### Resumen

| Tipo de Contenido | Sistema de Slugs | Razón |
|-------------------|------------------|-------|
| **Blog** | Dinámico (Supabase) | 204+ posts, títulos traducidos, URLs SEO-friendly |
| **Localizaciones** | Estático | ~50 ciudades, nombres propios iguales en todos los idiomas |
| **Páginas estáticas** | Estático (route-translations.ts) | Rutas fijas, pocas páginas |

---

## 🔧 Sistema de Traducciones

### Para Server Components (páginas públicas)

```typescript
import { translateServer } from "@/lib/i18n/server-translation";

// El locale está fijo en cada carpeta de idioma
const locale = 'es'; // O 'en', 'fr', 'de' según la carpeta
const t = (key: string) => translateServer(key, locale);

export default function MiPagina() {
  return <h1>{t("Mi título")}</h1>;
}
```

### Para Client Components (interactivos)

```typescript
"use client";
import { useLanguage } from "@/contexts/language-context";

export function MiComponente() {
  const { t, locale } = useLanguage();
  return <div>{t("Mi texto")}</div>;
}
```

### Traducciones desde Base de Datos (Supabase)

```typescript
import { getTranslatedContent, getTranslatedRecords } from "@/lib/translations/get-translations";

// Para un registro específico
const translatedFields = await getTranslatedContent(
  'location_targets',  // tabla
  locationId,          // ID del registro
  ['name', 'h1_title', 'intro_text'],  // campos a traducir
  locale,              // 'es', 'en', 'fr', 'de'
  { name: originalName, ... }  // valores originales como fallback
);

// Para múltiples registros
const translatedVehicles = await getTranslatedRecords(
  'vehicles',
  vehiclesRaw,
  ['name', 'short_description'],
  locale
);
```

---

## 🔗 URLs y Rutas

### Tabla de Rutas por Idioma

| Página | ES | EN | FR | DE |
|--------|----|----|----|----|
| Home | `/es/` | `/en/` | `/fr/` | `/de/` |
| Vehículos | `/es/vehiculos` | `/en/vehicles` | `/fr/vehicules` | `/de/fahrzeuge` |
| Ventas | `/es/ventas` | `/en/sales` | `/fr/ventes` | `/de/verkauf` |
| Blog | `/es/blog` | `/en/blog` | `/fr/blog` | `/de/blog` |
| Contacto | `/es/contacto` | `/en/contact` | `/fr/contact` | `/de/kontakt` |
| Tarifas | `/es/tarifas` | `/en/rates` | `/fr/tarifs` | `/de/preise` |
| Ofertas | `/es/ofertas` | `/en/offers` | `/fr/offres` | `/de/angebote` |
| Quiénes somos | `/es/quienes-somos` | `/en/about-us` | `/fr/a-propos` | `/de/uber-uns` |
| FAQs | `/es/faqs` | `/en/faqs` | `/fr/faqs` | `/de/faqs` |
| Mapa áreas | `/es/mapa-areas` | `/en/areas-map` | `/fr/carte-zones` | `/de/gebietskarte` |

### Componente LocalizedLink

Para navegación entre páginas respetando el idioma actual:

```typescript
import { LocalizedLink } from "@/components/localized-link";

// Automáticamente añade el prefijo de idioma correcto
<LocalizedLink href="/vehiculos">Ver vehículos</LocalizedLink>
// Renderiza: /es/vehiculos, /en/vehicles, /fr/vehicules, /de/fahrzeuge
```

---

## 📄 SEO y Metadata

### Canonical y Alternates

Cada página debe tener canonical y hreflang correctos:

```typescript
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const path = `/alquiler-autocaravanas-campervans/${slug}`;
  const alternates = buildCanonicalAlternates(path, 'es');
  
  return {
    title: "...",
    description: "...",
    alternates, // Incluye canonical y hreflang automáticos
  };
}
```

### Resultado generado

```html
<link rel="canonical" href="https://www.furgocasa.com/es/alquiler-autocaravanas-campervans/murcia" />
<link rel="alternate" hreflang="es" href="https://www.furgocasa.com/es/alquiler-autocaravanas-campervans/murcia" />
<link rel="alternate" hreflang="en" href="https://www.furgocasa.com/en/rent-campervan-motorhome/murcia" />
<link rel="alternate" hreflang="fr" href="https://www.furgocasa.com/fr/location-camping-car/murcia" />
<link rel="alternate" hreflang="de" href="https://www.furgocasa.com/de/wohnmobil-mieten/murcia" />
```

---

## 🛡️ Reglas Críticas

### ✅ CORRECTO

1. **Cada idioma tiene su carpeta física** (`/es/`, `/en/`, `/fr/`, `/de/`)
2. **El locale está fijo en cada página** (no se detecta dinámicamente)
3. **Usar translateServer() en Server Components**
4. **Usar useLanguage() solo en Client Components**
5. **Las traducciones vienen de Supabase** (tabla `content_translations`)

### ❌ PROHIBIDO

1. **NO usar `[locale]` dinámico** - Cada idioma tiene su carpeta
2. **NO usar useLanguage() en Server Components** - Causa errores de hidratación
3. **NO mezclar idiomas en una misma página** - Cada carpeta = un idioma
4. **NO hacer rewrites para traducciones** - Las carpetas son físicas

---

## 🧩 Archivos de Configuración

### `src/lib/i18n/config.ts`

```typescript
export const locales = ['es', 'en', 'fr', 'de'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
};
```

### `src/lib/route-translations.ts`

Mapeo de rutas entre idiomas para navegación y SEO.

### `src/middleware.ts`

- Detecta idioma del navegador para redirección inicial
- Redirige URLs sin prefijo a `/es/` por defecto
- NO hace rewrites para traducciones (las carpetas son físicas)

---

## 📊 Estadísticas

- **Páginas por idioma**: ~30 páginas estáticas + páginas dinámicas [location]
- **Total páginas**: ~120 páginas (30 × 4 idiomas)
- **Páginas [location]**: ~58 ciudades × 2 tipos × 4 idiomas = ~464 páginas
- **Total estimado**: ~580 páginas

---

## ✅ Estado de Traducción de Metadatos y Contenido (Enero 2026)

### Inglés (`/en/`) - COMPLETADO
| Página | Estado |
|--------|--------|
| `/en/vehicles` | ✅ Traducido |
| `/en/sales` + `/en/sales/videos` | ✅ Traducido |
| `/en/video-tutorials` | ✅ Traducido |
| `/en/vip-clients` | ✅ Traducido |
| `/en/weekend-booking` | ✅ Traducido |
| `/en/murcia-parking` | ✅ Traducido |
| `/en/payment/error` | ✅ Traducido |
| `/en/offers` | ✅ Traducido |
| `/en/rental-documentation` | ✅ Traducido |
| `/en/areas-map` | ✅ Traducido |
| `/en/book` | ✅ Traducido |
| `/en/search` | ✅ Traducido |
| `/en/sitemap-html` | ✅ Traducido |
| `/en/faqs` | ✅ Traducido |
| `/en/camper-guide` | ✅ Traducido |
| `/en/artificial-intelligence` | ✅ Traducido |
| `/en/cookies`, `/en/privacy`, `/en/legal-notice` | ✅ noindex + Traducido |

### Francés (`/fr/`) - COMPLETADO
| Página | Estado |
|--------|--------|
| `/fr/ventes` + `/fr/ventes/videos` | ✅ Traducido |
| `/fr/tutoriels-video` | ✅ Traducido |
| `/fr/clients-vip` | ✅ Traducido |
| `/fr/reservation-weekend` | ✅ Traducido |
| `/fr/parking-murcie` | ✅ Traducido |
| `/fr/paiement/error` | ✅ Traducido |
| `/fr/offres` | ✅ Traducido |
| `/fr/documentation-location` | ✅ Traducido |
| `/fr/carte-zones` | ✅ Traducido |
| `/fr/reserver` | ✅ Traducido |
| `/fr/recherche` | ✅ Traducido |
| `/fr/sitemap-html` | ✅ Traducido |
| `/fr/faqs` | ✅ Traducido |
| `/fr/guide-camping-car` | ✅ Traducido |
| `/fr/intelligence-artificielle` | ✅ Traducido |
| `/fr/cookies`, `/fr/confidentialite`, `/fr/mentions-legales` | ✅ noindex + Traducido |

### Alemán (`/de/`) - COMPLETADO
| Página | Estado |
|--------|--------|
| `/de/verkauf` + `/de/verkauf/videos` | ✅ Traducido |
| `/de/video-anleitungen` | ✅ Traducido |
| `/de/vip-kunden` | ✅ Traducido |
| `/de/wochenend-buchung` | ✅ Traducido |
| `/de/parkplatz-murcia` | ✅ Traducido |
| `/de/zahlung/error` | ✅ Traducido |
| `/de/angebote` | ✅ Traducido |
| `/de/mietdokumentation` | ✅ Traducido |
| `/de/gebietskarte` | ✅ Traducido |
| `/de/buchen` | ✅ Traducido |
| `/de/suche` | ✅ Traducido |
| `/de/sitemap-html` | ✅ Traducido |
| `/de/faqs` | ✅ Traducido |
| `/de/wohnmobil-guide` | ✅ Traducido |
| `/de/kunstliche-intelligenz` | ✅ Traducido |
| `/de/cookies`, `/de/datenschutz`, `/de/impressum` | ✅ noindex + Traducido |

---

## 📝 Blog con Slugs Multiidioma (NUEVO - Enero 2026)

### Estructura de URLs del Blog

El blog ahora soporta **slugs traducidos** para cada idioma:

| Idioma | URL Ejemplo |
|--------|-------------|
| 🇪🇸 ES | `/es/blog/noticias/mi-articulo-en-espanol` |
| 🇬🇧 EN | `/en/blog/news/my-article-in-english` |
| 🇫🇷 FR | `/fr/blog/actualites/mon-article-en-francais` |
| 🇩🇪 DE | `/de/blog/nachrichten/mein-artikel-auf-deutsch` |

### Base de Datos (Supabase)

La tabla `posts` tiene columnas para slugs traducidos:

```sql
-- Columnas en tabla posts
slug       VARCHAR(300)  -- Slug principal (español)
slug_en    VARCHAR(300)  -- Slug en inglés
slug_fr    VARCHAR(300)  -- Slug en francés  
slug_de    VARCHAR(300)  -- Slug en alemán
```

### Generación Automática de Slugs

Script para generar slugs traducidos desde títulos:

```bash
npx tsx scripts/generate-blog-slug-translations.ts
```

El script:
1. Lee los títulos traducidos de cada post
2. Genera slugs URL-friendly (sin acentos, minúsculas, guiones)
3. Actualiza las columnas `slug_en`, `slug_fr`, `slug_de`

### Language Switcher para Blog

El selector de idioma detecta automáticamente las páginas del blog y navega al slug traducido correcto:

```typescript
// En LanguageContext
if (isBlogArticlePage) {
  const translatedSlug = blogRouteData.slugs[newLang] || currentSlug;
  const translatedCategory = blogRouteData.categories[newLang] || currentCategory;
  window.location.href = `/${newLang}/blog/${translatedCategory}/${translatedSlug}`;
}
```

### Traducciones Estáticas (Client Components)

Las traducciones de UI están en `src/lib/translations-preload.ts`:

```typescript
// Ejemplo de uso en componentes cliente
const { t } = useLanguage();

// Automáticamente traduce según el idioma actual
<h1>{t("Dos formas de ahorrar en tu alquiler")}</h1>
// EN: "Two ways to save on your rental"
// FR: "Deux façons d'économiser sur votre location"
// DE: "Zwei Möglichkeiten bei Ihrer Miete zu sparen"
```

---

## 📚 Documentación Relacionada

- **[MIGRACION-CARPETAS-FIJAS-COMPLETADA.md](./MIGRACION-CARPETAS-FIJAS-COMPLETADA.md)** - Historial de migración
- **[REGLAS-ARQUITECTURA-NEXTJS.md](./REGLAS-ARQUITECTURA-NEXTJS.md)** - Reglas de arquitectura
- **[NORMAS-SEO-OBLIGATORIAS.md](./NORMAS-SEO-OBLIGATORIAS.md)** - Normas SEO
- **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** - Guía de traducción

---

**✅ Sistema i18n con carpetas fijas por idioma - Producción estable**

Desarrollado para: Furgocasa  
Versión: 4.2.0  
Fecha: 24 Enero 2026
