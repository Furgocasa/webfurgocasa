# Páginas "Motorhome Europa" Multiidioma

**Estado**: ✅ Completadas y funcionando  
**Fecha**: 25 de Enero 2026  
**Versión**: 1.0.0

## 📋 Resumen Ejecutivo

Páginas estáticas especiales para viajeros internacionales que buscan alquilar una motorhome en Europa. Cada idioma está **diferenciado** por audiencia geográfica.

## 🌍 URLs y Audiencia

| Idioma | URL | Audiencia Principal |
|--------|-----|---------------------|
| 🇪🇸 **Español** | `/es/alquiler-motorhome-europa-desde-espana` | **LATAM** (Argentina, México, Chile, Colombia, Brasil, Perú) |
| 🇬🇧 **Inglés** | `/en/motorhome-rental-europe-from-spain` | **Angloparlantes** (Australia, USA, UK, Canada, New Zealand, Ireland) |
| 🇫🇷 **Francés** | `/fr/camping-car-europe-depuis-espagne` | **Francoparlantes** (Belgique, Suisse, Canada, Afrique) |
| 🇩🇪 **Alemán** | `/de/wohnmobil-miete-europa-von-spanien` | **Germanoparlantes** (Deutschland, Österreich, Schweiz) |

## 🎯 Diferenciación por Idioma

### 🇪🇸 Página Española (LATAM)

**Badge Hero:**
```
🌎 Viajeros desde LATAM
```

**Sección Descuento:**
```
🌎 Descuento Especial LATAM 🌎
¿Venís desde Latinoamérica?
```

**Países destacados:**
- 🇦🇷 Argentina
- 🇲🇽 México
- 🇨🇱 Chile
- 🇨🇴 Colombia
- 🇧🇷 Brasil
- 🇵🇪 Perú
- 🇺🇾 Uruguay
- 🇻🇪 Venezuela

**Link descuento:** Apunta a artículo específico de LATAM:
```
/es/blog/noticias/visitas-espana-o-la-ue-desde-america-latina-alquila-tu-mortohome-con-un-15-de-descuento
```

⚠️ **IMPORTANTE:** Esta sección de descuento **SOLO EXISTE EN LA PÁGINA ESPAÑOLA**. Las páginas EN/FR/DE **NO tienen descuento** porque es exclusivo para LATAM.

---

### 🇬🇧 Página Inglesa (Angloparlantes)

**Badge Hero:**
```
For travelers from Australia, USA, UK, Canada...
```

**Países destacados:**
- 🇦🇺 Australia
- 🇺🇸 USA
- 🇬🇧 UK
- 🇨🇦 Canada
- 🇳🇿 New Zealand
- 🇮🇪 Ireland
- 🇯🇵 Japan
- 🇰🇷 South Korea

⚠️ **NO tiene sección de descuento** (exclusivo LATAM)

---

### 🇫🇷 Página Francesa (Francoparlantes)

**Badge Hero:**
```
Pour voyageurs de Belgique, Suisse, Canada, Afrique...
```

**Países destacados:**
- 🇧🇪 Belgique
- 🇨🇭 Suisse
- 🇨🇦 Canada
- Afrique francophone

⚠️ **NO tiene sección de descuento** (exclusivo LATAM)

---

### 🇩🇪 Página Alemana (Germanoparlantes)

**Badge Hero:**
```
Für Reisende aus Deutschland, Österreich, Schweiz...
```

**Países destacados:**
- 🇩🇪 Deutschland
- 🇦🇹 Österreich
- 🇨🇭 Schweiz

⚠️ **NO tiene sección de descuento** (exclusivo LATAM)

## 📊 Estructura de Contenido

Cada página incluye:

### 1. Hero Section
- Badge diferenciado por audiencia
- Título: "Motorhome Europa" / "Camping-Car Europe" / "Wohnmobil Europa"
- Subtítulo: "Your home on wheels to explore Europe"
- SearchWidget para buscar vehículos

### 2. Sección de Descuento (-15%) ⚠️ **SOLO PÁGINA ES (LATAM)**

**IMPORTANTE:** El descuento es **exclusivo para viajeros LATAM**. Las páginas EN, FR, DE **NO tienen esta sección**.

**Solo en página española:**
- Título: "🌎 Descuento Especial LATAM 🌎"
- Subtítulo: "¿Venís desde Latinoamérica?"
- Países destacados con banderas (Argentina, México, Chile, Colombia, Brasil, Perú, Uruguay, Venezuela)
- Ejemplos de ahorro (21 días: €285, 14 días: €210)
- Botón link al artículo de blog específico LATAM
- Botón WhatsApp con texto preformateado
- Nota: Válido para alquileres 14+ días en temporada baja/media

**Páginas EN/FR/DE:** Esta sección **NO EXISTE** - van directo de "Ventajas" a "Flota de Vehículos"

### 3. Ventajas del Servicio
- ✅ Kilometraje Ilimitado
- ✅ Sin Fianza
- ✅ Seguro Europeo
- ✅ Asistencia 24/7
- ✅ Cancelación Flexible
- ✅ Base en Murcia, España

### 4. Rutas Sugeridas (Blog Dinámico)
**Carga 4 artículos de la categoría `rutas` con URLs y contenido totalmente traducidos**

**Funcionamiento Completo:**

#### Backend (`getRoutesArticles`)
```typescript
// 1. Consulta SIEMPRE la categoría 'rutas' (español) en Supabase
const routesArticles = await getRoutesArticles(4, 'fr');

// 2. SELECT incluye slugs traducidos
SELECT id, title, slug, slug_en, slug_fr, slug_de, excerpt, ...

// 3. Si locale !== 'es', busca traducciones en content_translations
SELECT source_id, source_field, translated_text
FROM content_translations
WHERE source_table = 'posts'
  AND locale = 'fr'
  AND source_field IN ('title', 'excerpt')

// 4. Aplica traducciones
article.title = translatedTitle (francés)
article.excerpt = translatedExcerpt (francés)
```

#### Frontend (`BlogArticleLink`)
```typescript
// Elige el slug según el idioma
switch (language) {
  case 'fr': finalSlug = article.slug_fr || article.slug;
  case 'en': finalSlug = article.slug_en || article.slug;
  case 'de': finalSlug = article.slug_de || article.slug;
  default:   finalSlug = article.slug;
}

// Genera URL con categorySlug traducido + slug traducido
🇪🇸 ES: /es/blog/rutas/navidades-diferentes-viajar-en-camper...
🇬🇧 EN: /en/blog/routes/christmas-different-travel-in-camper...
🇫🇷 FR: /fr/blog/itineraires/noels-differents-voyager-en-van...
🇩🇪 DE: /de/blog/routen/weihnachten-anders-reisen-in-camper...
```

**URLs Generadas (ejemplo real):**
```
🇪🇸 /es/blog/rutas/navidades-diferentes-viajar-en-camper-por-la-region-de-murcia-en-invierno
🇬🇧 /en/blog/routes/different-christmas-travel-camper-murcia-region-winter
🇫🇷 /fr/blog/itineraires/noels-differents-voyager-en-van-dans-la-region-de-murcie-en-hiver
🇩🇪 /de/blog/routen/andere-weihnachten-wohnmobil-reise-murcia-region-winter
```

**Contenido Mostrado:**
- ✅ **Títulos:** Traducidos desde `content_translations` (source_field='title')
- ✅ **Excerpts:** Traducidos desde `content_translations` (source_field='excerpt')
- ✅ **URLs:** Con slugs traducidos desde columnas `slug_fr`, `slug_en`, `slug_de`

**Sistema de Fallback:**
- Si no hay `slug_fr` → usa `slug` (español)
- Si no hay traducción en `content_translations` → usa título/excerpt original
- Las páginas de artículo aceptan slugs en cualquier idioma y cargan contenido traducido

### 5. Flota de Vehículos
- Muestra 3 vehículos destacados
- Slider de imágenes por vehículo
- Especificaciones (pasajeros, camas)
- Botón "Ver detalles" traducido

### 6. Estadísticas de la Empresa
- 500+ Reservas completadas
- 8+ Vehículos disponibles
- 4.9⭐ Valoración promedio
- 14+ Años de experiencia

### 7. Por Qué Furgocasa para Viajeros Internacionales
- 💬 Asistencia 24/7 Multilingüe
- 📞 WhatsApp Directo
- ✈️ Recogida en Aeropuerto
- 🔧 Asistencia Técnica
- 🌍 Experiencia Internacional
- 💶 Mejor Precio Garantizado

### 8. Por Qué España Como Punto de Partida
- ✈️ Vuelos Directos (ejemplos por idioma)
- 🗣️ Soporte Multilingüe
- 💶 30-40% Más Económico
- 🌍 Ubicación Estratégica
- ☀️ Clima Perfecto
- 🎨 Cultura y Gastronomía

### 9. Proceso de Reserva (3 pasos)
1. Selecciona fechas y vehículo
2. Pago del 50% inicial
3. Recoge tu motorhome

### 10. CTA Final
Botón para iniciar búsqueda

## 🎨 SEO y Metadata

### Meta Títulos (SIN mención de LATAM/España en EN/FR/DE)

```typescript
ES: "Alquiler Motorhome Europa | LATAM | Explora Francia, Italia, Portugal"
EN: "Motorhome Rental Europe | Explore France, Italy, Portugal"
FR: "Location Camping-Car Europe | France, Italie, Portugal"
DE: "Wohnmobil Miete Europa | Frankreich, Italien, Portugal"
```

**Razón:** Los títulos EN/FR/DE **no mencionan España** porque hay páginas específicas por ciudad (ej: `/en/rent-campervan-motorhome/murcia`).

### Meta Descriptions

Todas enfatizan:
- "Europa" como destino principal
- Kilometraje ilimitado
- Seguro europeo
- Asistencia 24/7
- Base en Murcia, España

### Keywords

```typescript
ES: "alquiler motorhome europa, motorhome europa desde españa, camper europa latam"
EN: "motorhome rental europe, rv rental europe, campervan europe travel"
FR: "location camping-car europe, camping-car voyage europe"
DE: "wohnmobil miete europa, wohnmobil europa reise"
```

### Open Graph

- Imágenes: Slides de calidad (1920x1080)
- Título y descripción específicos por idioma
- `type: website`
- `locale`: `es_ES`, `en_US`, `fr_FR`, `de_DE`

### Canonical URLs

```
ES: https://www.furgocasa.com/es/alquiler-motorhome-europa-desde-espana
EN: https://www.furgocasa.com/en/motorhome-rental-europe-from-spain
FR: https://www.furgocasa.com/fr/camping-car-europe-depuis-espagne
DE: https://www.furgocasa.com/de/wohnmobil-miete-europa-von-spanien
```

### Hreflang Alternates

Todas las páginas tienen **hreflang** correcto conectando las 4 versiones:

```html
<link rel="alternate" hreflang="es" href="https://www.furgocasa.com/es/alquiler-motorhome-europa-desde-espana" />
<link rel="alternate" hreflang="en" href="https://www.furgocasa.com/en/motorhome-rental-europe-from-spain" />
<link rel="alternate" hreflang="fr" href="https://www.furgocasa.com/fr/camping-car-europe-depuis-espagne" />
<link rel="alternate" hreflang="de" href="https://www.furgocasa.com/de/wohnmobil-miete-europa-von-spanien" />
<link rel="alternate" hreflang="x-default" href="https://www.furgocasa.com/es/alquiler-motorhome-europa-desde-espana" />
```

## 📁 Archivos Implicados

### Páginas
```
src/app/es/alquiler-motorhome-europa-desde-espana/page.tsx
src/app/en/motorhome-rental-europe-from-spain/page.tsx
src/app/fr/camping-car-europe-depuis-espagne/page.tsx
src/app/de/wohnmobil-miete-europa-von-spanien/page.tsx
```

### Server Actions
```
src/lib/home/server-actions.ts
  └── getRoutesArticles(limit: number, locale: Locale)
      ✅ SIEMPRE consulta categoría 'rutas' (español)
      ✅ Fetch slug_en, slug_fr, slug_de desde tabla posts
      ✅ Consulta content_translations para title/excerpt traducidos
      ✅ Usa: source_table='posts', source_field IN ('title','excerpt'), locale
```

### Componentes
```
src/components/blog/blog-article-link.tsx
  └── Lógica de selección de slug traducido:
      switch(language) {
        'fr': usa slug_fr || slug
        'en': usa slug_en || slug  
        'de': usa slug_de || slug
      }
      └── Genera URL: /{language}/blog/{categorySlug}/{finalSlug}
```

### Traducciones
```
src/lib/blog-translations.ts
  └── blogCategoryTranslations
      rutas: { es: 'rutas', en: 'routes', fr: 'itineraires', de: 'routen' }
```

### Rutas
```
src/lib/route-translations.ts
  └── Mapeo de URLs traducidas
      '/alquiler-motorhome-europa-desde-espana': {
        en: '/motorhome-rental-europe-from-spain',
        fr: '/camping-car-europe-depuis-espagne',
        de: '/wohnmobil-miete-europa-von-spanien'
      }
```

### Sitemap
```
src/app/sitemap.ts
  └── staticPages.push({
        path: '/alquiler-motorhome-europa-desde-espana',
        priority: 0.9,
        changeFrequency: 'monthly'
      })
```

### HTML Sitemap
```
src/app/es/sitemap-html/page.tsx
src/app/en/sitemap-html/page.tsx
src/app/fr/sitemap-html/page.tsx
src/app/de/sitemap-html/page.tsx
  └── staticPages array con traducción correcta
```

## ⚙️ Configuración Técnica

### ISR (Incremental Static Regeneration)
```typescript
export const revalidate = 86400; // 24 horas
```

### Rendering
- **Server Component** (SSR/ISR)
- Pre-generación de rutas de blog en build time
- Cache de queries con React `cache()`

### Imágenes
- Hero Slider: 5 slides de Supabase Storage
- Formato: WebP/AVIF con fallback
- Loading: Lazy (excepto primera imagen)
- Sizes responsive: `(max-width: 768px) 100vw, 50vw`

## 🔍 SEO Avanzado

### Sitemap Inclusion
✅ Incluida en `sitemap.xml` con:
- Priority: 0.9 (alta)
- Change Frequency: monthly
- Hreflang alternates para 4 idiomas

### Robots.txt
✅ **NO está bloqueada** (no aparece en `disallowedPaths`)

### HTML Sitemap
✅ Incluida en los sitemaps HTML de cada idioma con etiqueta traducida:
- ES: "Alquiler Motorhome Europa"
- EN: "Motorhome Rental Europe"
- FR: "Location Camping-Car Europe"
- DE: "Wohnmobil Miete Europa"

### Schema.org
- `WebSite` schema en layout principal
- `Organization` schema para empresa
- `BreadcrumbList` potencial (pendiente implementar)

## 🚨 Errores Resueltos

### ❌ Error 1: French 404 (Conflicto de routing)
**Problema:** URL `/fr/location-camping-car/europe-depuis-espagne` daba 404

**Causa:** Colisión entre static route y dynamic `[location]`

**Solución:** 
```bash
mv src/app/fr/location-camping-car-europe-depuis-espagne \
   src/app/fr/camping-car-europe-depuis-espagne
```

**Resultado:** ✅ Funciona correctamente

### ❌ Error 2: Blog Articles No Cargaban EN/FR/DE
**Problema:** Sección "Rutas Sugeridas" vacía en páginas traducidas

**Causa:** `getRoutesArticles` buscaba categorías inexistentes (`routes`, `itineraires`, `routen`)

**Solución:**
1. Modificar `getRoutesArticles` para **siempre buscar categoría `'rutas'`** (español)
2. Fetch columnas `slug_en`, `slug_fr`, `slug_de` desde tabla `posts`
3. Usar `categorySlug` traducido + `article.slug` (español) en las páginas

**Resultado:** ✅ Los 4 artículos aparecen en todos los idiomas

### ❌ Error 3: Títulos de Artículos en Español en Páginas FR/EN/DE
**Problema:** Los artículos mostraban títulos/excerpts en español en todas las páginas

**Causa:** 
1. `getRoutesArticles` consultaba columnas inexistentes: `translated_title`, `translated_excerpt`, `language`
2. La tabla real `content_translations` usa: `source_field`, `translated_text`, `locale`

**Solución:**
```typescript
// Consulta corregida
.select('source_id, source_field, translated_text')
.eq('source_table', 'posts')
.eq('locale', locale)  // NO 'language'
.in('source_field', ['title', 'excerpt'])

// Agrupar por source_id y aplicar traducciones
```

**Resultado:** ✅ Títulos y excerpts traducidos correctamente

### ❌ Error 4: URLs del Blog con Slugs en Español
**Problema:** Links generaban URLs como `/fr/blog/itineraires/navidades-diferentes...`

**Causa:** `BlogArticleLink` solo usaba `article.slug` (español) en todos los idiomas

**Solución:**
```typescript
// Selección de slug según idioma
const finalSlug = language === 'fr' ? (article.slug_fr || article.slug) : article.slug;
```

**Resultado:** ✅ URLs con slugs traducidos: `/fr/blog/itineraires/noels-differents...`

## 📝 Mantenimiento

### Añadir Nuevo Artículo a "Rutas Sugeridas"

1. **Crear artículo** en categoría `rutas` (español) en el admin
2. **Rellenar slugs traducidos** en la tabla `posts`:
   - `slug` (español - obligatorio)
   - `slug_en` (inglés - opcional, usa español si no existe)
   - `slug_fr` (francés - opcional, usa español si no existe)
   - `slug_de` (alemán - opcional, usa español si no existe)
3. **Añadir traducciones** en `content_translations`:
   ```sql
   INSERT INTO content_translations (source_table, source_id, source_field, locale, translated_text)
   VALUES 
     ('posts', 'article-id', 'title', 'fr', 'Titre en français'),
     ('posts', 'article-id', 'excerpt', 'fr', 'Extrait en français'),
     ('posts', 'article-id', 'title', 'en', 'Title in English'),
     ('posts', 'article-id', 'excerpt', 'en', 'Excerpt in English');
   ```
4. **El artículo aparecerá automáticamente** en las 4 páginas con:
   - ✅ Título traducido
   - ✅ Excerpt traducido
   - ✅ URL con slug traducido

### Cambiar Países en Badge/Descuento

Editar directamente cada página:
```typescript
// src/app/en/motorhome-rental-europe-from-spain/page.tsx
<span>For travelers from Australia, USA, UK, Canada...</span>

{['🇦🇺 Australia', '🇺🇸 USA', ...].map((country) => (
  <span>{country}</span>
))}
```

### Actualizar Descuento

**⚠️ IMPORTANTE:** El descuento es **exclusivo para LATAM** (página ES).

**Solo en página ES:**
```tsx
// src/app/es/alquiler-motorhome-europa-desde-espana/page.tsx
<LocalizedLink href="/blog/noticias/visitas-espana-o-la-ue-desde-america-latina-alquila-tu-mortohome-con-un-15-de-descuento">
  Leer más sobre el descuento LATAM
</LocalizedLink>
```

**Páginas EN/FR/DE:** NO tienen sección de descuento. Si se necesita añadir, debe ser un descuento diferente (no LATAM).

## 📊 Métricas Esperadas

### SEO
- **Target Keywords:**
  - ES: "alquiler motorhome europa", "motorhome europa latam"
  - EN: "motorhome rental europe", "rv rental europe"
  - FR: "location camping-car europe"
  - DE: "wohnmobil miete europa"

### Conversión
- **Público objetivo:** Viajeros internacionales con estancia larga (14-21 días)
- **Ventaja competitiva:** Base en España (30-40% más barato que Alemania/Francia)
- **Incentivo:** -15% descuento en alquileres 14+ días

## ✅ Checklist de Implementación

- [x] Página ES creada y diferenciada (LATAM + Descuento -15%)
- [x] Página EN creada y diferenciada (Angloparlantes, SIN descuento)
- [x] Página FR creada y diferenciada (Francoparlantes, SIN descuento)
- [x] Página DE creada y diferenciada (Germanoparlantes, SIN descuento)
- [x] ⚠️ Descuento EXCLUSIVO para página ES (LATAM)
- [x] Metadata SEO optimizada (sin LATAM en EN/FR/DE)
- [x] Canonical URLs correctas
- [x] Hreflang alternates configurados
- [x] Blog routes dinámicos funcionando
- [x] getRoutesArticles usando categoría 'rutas'
- [x] getRoutesArticles consultando content_translations correctamente
- [x] Blog article links con slugs traducidos (slug_fr, slug_en, slug_de)
- [x] Títulos de artículos traducidos desde content_translations
- [x] Excerpts de artículos traducidos desde content_translations
- [x] URLs de blog con slugs traducidos (SEO-friendly)
- [x] Incluida en sitemap.xml
- [x] Incluida en robots.txt (permitida)
- [x] Incluida en HTML sitemaps (4 idiomas)
- [x] Conflicto de routing FR resuelto
- [x] Imágenes optimizadas (WebP/AVIF)
- [x] ISR configurado (24h)
- [x] SearchWidget integrado
- [x] WhatsApp links con texto preformateado

## 🔗 Referencias

- [SEO-MULTIIDIOMA-MODELO.md](./SEO-MULTIIDIOMA-MODELO.md) - Modelo SEO general
- [BLOG-TRANSLATIONS.md](./src/lib/blog-translations.ts) - Traducciones de categorías
- [ROUTE-TRANSLATIONS.md](./src/lib/route-translations.ts) - Traducciones de rutas

---

**Última actualización:** 25 de Enero 2026  
**Versión:** 1.1.0 (URLs y Contenido Blog Totalmente Traducidos)  
**Autor:** Sistema IA  
**Estado:** ✅ Producción
