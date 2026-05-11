# 🗺️ Estructura de Sitemaps Multiidioma - Mejores Prácticas

## ✅ Resumen Ejecutivo

Se ha implementado la estructura de sitemaps recomendada por Google para sitios multiidioma:

- ✅ **Sitemap principal** (`/sitemap.xml`) - Incluye todas las URLs con hreflang alternates
- ✅ **Sitemaps por idioma** (`/sitemap-[locale].xml`) - Opción avanzada disponible
- ✅ **Cada URL solo aparece una vez** (en su idioma correspondiente)
- ✅ **Hreflang alternates** incluidos en cada entrada
- ✅ **NO separación por dispositivo** (mobile-first de Google)

---

## 📋 Estructura Implementada

### Opción 1: Sitemap Único con Hreflang (Implementación Actual)

**Archivo:** `src/app/sitemap.ts`

**Estructura:**
```
/sitemap.xml
  ├── /es/blog/rutas (con hreflang: es, en, fr, de)
  ├── /en/blog/routes (con hreflang: es, en, fr, de)
  ├── /fr/blog/itineraires (con hreflang: es, en, fr, de)
  └── /de/blog/routen (con hreflang: es, en, fr, de)
```

**Ventajas:**
- ✅ Simple y fácil de mantener
- ✅ Compatible con Next.js App Router
- ✅ Hreflang correctamente implementado
- ✅ Google entiende la estructura multiidioma

**Cuándo usar:**
- Sitios medianos (< 50,000 URLs)
- Estructura simple multiidioma
- Mantenimiento sencillo

---

### Opción 2: Sitemap Índice + Sitemaps por Idioma (Disponible)

**Archivos:**
- `src/app/sitemap.ts` - Sitemap índice
- `src/app/sitemap-[locale]/route.ts` - Sitemaps por idioma

**Estructura:**
```
/sitemap.xml (índice)
  ├── /sitemap-es.xml
  ├── /sitemap-en.xml
  ├── /sitemap-fr.xml
  └── /sitemap-de.xml

/sitemap-es.xml
  └── Solo URLs en español (/es/...)

/sitemap-en.xml
  └── Solo URLs en inglés (/en/...)
```

**Ventajas:**
- ✅ Mejor organización para sitios grandes
- ✅ Cada URL solo aparece en su sitemap de idioma
- ✅ Más fácil de escalar
- ✅ Google recomienda esta estructura para sitios grandes

**Cuándo usar:**
- Sitios grandes (> 50,000 URLs)
- Necesidad de mejor organización
- Múltiples equipos trabajando en diferentes idiomas

---

## 🎯 Mejores Prácticas Implementadas

### ✅ 1. Un Sitemap por Idioma (Recomendado)

**Regla:** Cada idioma debe tener su propio sitemap o al menos estar claramente separado.

**Implementación:**
- ✅ Opción 1: Sitemap único con hreflang (actual)
- ✅ Opción 2: Sitemaps separados por idioma (disponible)

**Ejemplo:**
```xml
<!-- sitemap-es.xml -->
<url>
  <loc>https://www.furgocasa.com/es/blog/rutas</loc>
  <xhtml:link rel="alternate" hreflang="es" href="https://www.furgocasa.com/es/blog/rutas" />
  <xhtml:link rel="alternate" hreflang="en" href="https://www.furgocasa.com/en/blog/routes" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://www.furgocasa.com/es/blog/rutas" />
</url>
```

---

### ✅ 2. NO Separar por Dispositivo

**Regla:** Google indexa mobile-first, no necesitas sitemaps separados por dispositivo.

**Implementación:**
- ✅ NO hay sitemap-mobile.xml
- ✅ NO hay sitemap-desktop.xml
- ✅ Diseño responsive = misma URL para todos los dispositivos

**Razón:**
- Google usa mobile-first indexing desde 2019
- Diseño responsive es la práctica estándar
- Separar por dispositivo es obsoleto (excepto AMP legacy)

---

### ✅ 3. Sitemap Índice para Sitios Grandes

**Regla:** Para sitios grandes, usar un sitemap índice que referencia sitemaps especializados.

**Implementación:**
- ✅ Sitemap índice disponible en `src/app/sitemap.ts`
- ✅ Sitemaps por idioma disponibles en `src/app/sitemap-[locale]/route.ts`

**Estructura del índice:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.furgocasa.com/sitemap-es.xml</loc>
    <lastmod>2026-01-21T...</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.furgocasa.com/sitemap-en.xml</loc>
    <lastmod>2026-01-21T...</lastmod>
  </sitemap>
</sitemapindex>
```

---

### ✅ 4. Coherencia con Canonical URLs

**Regla:** Cada URL del sitemap debe ser canónica de sí misma.

**Implementación:**
- ✅ URLs del sitemap coinciden exactamente con canonical URLs
- ✅ No se incluyen URLs con parámetros de query
- ✅ No se incluyen páginas noindex

**Verificación:**
```typescript
// Sitemap genera:
url: "https://www.furgocasa.com/es/blog/rutas"

// Metadata genera:
canonical: "https://www.furgocasa.com/es/blog/rutas"

// ✅ Coinciden exactamente
```

---

### ✅ 5. Hreflang Alternates en Cada Entrada

**Regla:** Cada URL del sitemap debe incluir hreflang alternates para todas las versiones de idioma.

**Implementación:**
- ✅ Cada entrada incluye hreflang para todos los idiomas
- ✅ `x-default` siempre apunta a español
- ✅ URLs absolutas en hreflang

**Ejemplo:**
```xml
<url>
  <loc>https://www.furgocasa.com/es/blog/rutas</loc>
  <xhtml:link rel="alternate" hreflang="es" href="https://www.furgocasa.com/es/blog/rutas" />
  <xhtml:link rel="alternate" hreflang="en" href="https://www.furgocasa.com/en/blog/routes" />
  <xhtml:link rel="alternate" hreflang="fr" href="https://www.furgocasa.com/fr/blog/itineraires" />
  <xhtml:link rel="alternate" hreflang="de" href="https://www.furgocasa.com/de/blog/routen" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://www.furgocasa.com/es/blog/rutas" />
</url>
```

---

## 🔧 Configuración Técnica

### Archivos Implementados

1. **`src/app/sitemap.ts`** - Sitemap principal
   - Genera todas las URLs con hreflang alternates
   - Compatible con Next.js MetadataRoute.Sitemap

**Prioridades destacadas:** las landings **por ciudad** (alquiler y venta) llevan **`priority: 1.0`** y **`changefreq: daily`**, al mismo nivel que la home, en `src/app/sitemap.ts` y duplicado en `src/lib/seo/sitemap.ts` para los XML por idioma (`/sitemap-[locale].xml`).

2. **`src/app/sitemap-[locale]/route.ts`** - Sitemaps por idioma (opcional)
   - Genera sitemaps separados por idioma
   - Cada URL solo aparece en su sitemap de idioma
   - Incluye hreflang alternates

3. **`src/app/robots.ts`** - Robots.txt
   - Apunta al sitemap principal: `https://www.furgocasa.com/sitemap.xml`

---

## 📊 Comparativa: Antes vs Ahora

### Antes (Joomla - Obsoleto)

```
❌ sitemap-mobile.xml
❌ sitemap-desktop.xml
❌ sitemap-es-mobile.xml
❌ sitemap-es-desktop.xml
❌ sitemap-en-mobile.xml
❌ sitemap-en-desktop.xml
... (10-12 sitemaps sin sentido funcional)
```

**Problemas:**
- Separación innecesaria por dispositivo
- Duplicación de URLs
- Mantenimiento complejo
- Google ya no necesita esta estructura

---

### Ahora (Next.js - Mejores Prácticas)

```
✅ /sitemap.xml (único con hreflang)
   O
✅ /sitemap.xml (índice)
   ├── /sitemap-es.xml
   ├── /sitemap-en.xml
   ├── /sitemap-fr.xml
   └── /sitemap-de.xml
```

**Ventajas:**
- ✅ Estructura limpia y organizada
- ✅ Sin duplicación innecesaria
- ✅ Fácil de mantener
- ✅ Google entiende mejor la estructura

---

## ✅ Checklist de Verificación

### Sitemap Principal
- [x] ✅ Incluye todas las URLs indexables
- [x] ✅ Hreflang alternates en cada entrada
- [x] ✅ URLs absolutas con https://www
- [x] ✅ Sin parámetros de query
- [x] ✅ Sin páginas noindex
- [x] ✅ Coherente con canonical URLs

### Sitemaps por Idioma (Opcional)
- [x] ✅ Cada URL solo aparece en su sitemap de idioma
- [x] ✅ Hreflang alternates incluidos
- [x] ✅ Sitemap índice referencia todos los sitemaps

### Robots.txt
- [x] ✅ Apunta al sitemap principal
- [x] ✅ URL absoluta correcta

### NO Implementado (Correcto)
- [x] ✅ NO sitemap móvil
- [x] ✅ NO sitemap desktop
- [x] ✅ NO separación por dispositivo

---

## 🎯 Recomendación Final

### Para Este Proyecto

**Estructura recomendada:** Sitemap único con hreflang (Opción 1)

**Razones:**
1. ✅ Sitio de tamaño medio (< 50,000 URLs)
2. ✅ Estructura simple y fácil de mantener
3. ✅ Compatible con Next.js App Router
4. ✅ Google entiende perfectamente la estructura
5. ✅ Hreflang correctamente implementado

**Si el sitio crece:**
- Migrar a sitemap índice + sitemaps por idioma (Opción 2)
- Ya está preparado con `src/app/sitemap-[locale]/route.ts`

---

## 📚 Referencias

- [Google: Sitemaps Multiidioma](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: Sitemap Index](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Next.js: Sitemap Metadata](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [CANONICAL-URLS-BEST-PRACTICES.md](./CANONICAL-URLS-BEST-PRACTICES.md)

---

**Última actualización:** 2026-01-21  
**Estado:** ✅ Implementación completa según mejores prácticas de Google
