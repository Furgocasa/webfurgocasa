# 🌍 SEO LOCAL Y OPEN GRAPH - DOCUMENTACIÓN COMPLETA

## ✅ SOLUCIÓN IMPLEMENTADA PARA SEO LOCAL

### 🎯 EL PROBLEMA

Furgocasa tiene **UNA SOLA SEDE** en Murcia, pero quiere posicionarse para búsquedas en otras ciudades como:
- Alicante
- Valencia  
- Albacete
- Cartagena
- Etc.

### ✅ LA SOLUCIÓN CORRECTA (Según Google)

**No mentimos a Google** sobre nuestra ubicación. Usamos Schema.org **correctamente**:

```json
{
  "@type": "LocalBusiness",
  "name": "Furgocasa",
  "address": {
    // ✅ SIEMPRE la dirección REAL (Murcia)
    "streetAddress": "Avenida Puente Tocinos, 4",
    "addressLocality": "Casillas",
    "addressRegion": "Murcia",
    "postalCode": "30007",
    "addressCountry": "ES"
  },
  // ✅ "areaServed" = áreas que SIRVES desde tu ubicación
  "areaServed": [
    {
      "@type": "City",
      "name": "Alicante"  // Servimos a Alicante
    },
    {
      "@type": "City",
      "name": "Valencia"  // Servimos a Valencia
    },
    {
      "@type": "State",
      "name": "Comunidad Valenciana"
    }
  ]
}
```

---

## 📖 QUÉ DICE GOOGLE SOBRE ESTO

### ✅ Schema.org "areaServed"

**Definición oficial:**
> "The geographic area where a service or offered item is provided."

**Ejemplo de Google:**
> "A plumber based in London that serves all of Greater London should list Greater London as their areaServed, not multiple fake addresses."

### ✅ Nuestra Implementación

```typescript
// src/components/locations/local-business-jsonld.tsx

"address": {
  // ⚠️ IMPORTANTE: Siempre la dirección REAL
  "@type": "PostalAddress",
  "streetAddress": "Avenida Puente Tocinos, 4",
  "addressLocality": "Casillas",
  "addressRegion": "Murcia",
  "postalCode": "30007",
  "addressCountry": "ES"
},

"areaServed": [
  { "@type": "City", "name": "Alicante" },
  { "@type": "City", "name": "Valencia" },
  { "@type": "State", "name": "Comunidad Valenciana" },
  { "@type": "City", "name": "Murcia" }
]
```

---

## 🎨 OPEN GRAPH OPTIMIZADO PARA REDES SOCIALES

### Home Page

```typescript
openGraph: {
  title: "Furgocasa | Alquiler de Campers en Murcia",
  description: "Tu hotel 5⭐ sobre ruedas. Flota premium desde 95€/día...",
  type: "website",
  url: "https://furgocasa.com",
  siteName: "Furgocasa - Alquiler de Autocaravanas",
  images: [
    {
      url: "https://furgocasa.com/images/slides/hero-01.webp",
      width: 1200,
      height: 630,
      alt: "Furgocasa - Alquiler de Campers en Murcia",
      type: "image/webp",
    },
    {
      url: "https://furgocasa.com/images/slides/hero-02.webp",
      width: 1200,
      height: 630,
      alt: "Flota premium Furgocasa",
      type: "image/webp",
    },
    {
      url: "https://furgocasa.com/images/slides/hero-03.webp",
      width: 1200,
      height: 630,
      alt: "Interior camper Furgocasa",
      type: "image/webp",
    }
  ],
  locale: "es_ES",
  countryName: "España",
},
twitter: {
  card: "summary_large_image",
  site: "@furgocasa",
  creator: "@furgocasa",
  title: "Furgocasa | Alquiler Camper Murcia",
  description: "Autocaravanas premium desde 95€/día. Kilómetros ilimitados.",
  images: ["https://furgocasa.com/images/slides/hero-01.webp"],
}
```

### Landing Pages (por ciudad)

```typescript
openGraph: {
  title: `Alquiler de Autocaravanas en ${location.name} | Furgocasa`,
  description: `Alquiler de campers cerca de ${location.name}. A ${location.distance_km} km de Murcia. Flota premium desde 95€/día.`,
  type: "website",
  url: `https://furgocasa.com/alquiler-autocaravanas-campervans-${location.slug}`,
  siteName: "Furgocasa - Alquiler de Autocaravanas",
  images: [
    {
      url: location.hero_image || "https://furgocasa.com/images/slides/hero-01.webp",
      width: 1200,
      height: 630,
      alt: `Alquiler de campers y autocaravanas cerca de ${location.name}`,
      type: "image/webp",
    },
    {
      url: "https://furgocasa.com/images/slides/hero-02.webp",
      width: 1200,
      height: 630,
      alt: "Flota premium Furgocasa",
      type: "image/webp",
    }
  ],
  locale: "es_ES",
  countryName: "España",
},
twitter: {
  card: "summary_large_image",
  site: "@furgocasa",
  creator: "@furgocasa",
  title: `Alquiler Camper ${location.name} | Desde 95€/día`,
  description: `Autocaravanas cerca de ${location.name}. A solo ${location.distance_km} km de Murcia. Kilómetros ilimitados.`,
  images: [location.hero_image || "https://furgocasa.com/images/slides/hero-01.webp"],
}
```

---

## 🎯 CARACTERÍSTICAS IMPLEMENTADAS

### ✅ Open Graph (Facebook, LinkedIn, WhatsApp)
- ✅ Múltiples imágenes (hasta 3)
- ✅ Dimensiones correctas (1200x630px)
- ✅ Alt text descriptivo
- ✅ Tipo de imagen especificado
- ✅ Locale y país
- ✅ URLs canónicas
- ✅ Descripciones optimizadas

### ✅ Twitter Cards
- ✅ Card type: `summary_large_image`
- ✅ Site y creator: `@furgocasa`
- ✅ Imágenes optimizadas
- ✅ Títulos y descripciones específicas

### ✅ Schema.org LocalBusiness
- ✅ Dirección real en Murcia
- ✅ `areaServed` con todas las ciudades/regiones
- ✅ Horarios de apertura
- ✅ Información de contacto
- ✅ Rating agregado
- ✅ Catálogo de ofertas
- ✅ Logo e imágenes
- ✅ Redes sociales (`sameAs`)

---

## 📊 CÓMO SE VE EN REDES SOCIALES

### Facebook / LinkedIn
```
┌─────────────────────────────────────────┐
│ 🖼️ [Imagen 1200x630 del camper]       │
├─────────────────────────────────────────┤
│ Alquiler de Autocaravanas en Alicante  │
│ Furgocasa                               │
├─────────────────────────────────────────┤
│ Alquiler de campers cerca de Alicante. │
│ A 60 km de Murcia. Flota premium desde │
│ 95€/día con kilómetros ilimitados.     │
├─────────────────────────────────────────┤
│ furgocasa.com                           │
└─────────────────────────────────────────┘
```

### Twitter
```
┌─────────────────────────────────────────┐
│ 🖼️ [Imagen grande del camper]         │
├─────────────────────────────────────────┤
│ Alquiler Camper Alicante | Desde 95€/día│
│ @furgocasa                              │
├─────────────────────────────────────────┤
│ Autocaravanas cerca de Alicante.       │
│ A solo 60 km de Murcia. Kilómetros     │
│ ilimitados. Flota premium.              │
└─────────────────────────────────────────┘
```

### WhatsApp
```
┌─────────────────────────────────────────┐
│ 🖼️ [Preview de imagen]                │
│                                         │
│ Alquiler de Autocaravanas en Alicante  │
│ furgocasa.com                           │
└─────────────────────────────────────────┘
```

---

## 🔍 VERIFICACIÓN

### Herramientas para verificar Open Graph:

1. **Facebook Sharing Debugger**
   ```
   https://developers.facebook.com/tools/debug/
   ```

2. **Twitter Card Validator**
   ```
   https://cards-dev.twitter.com/validator
   ```

3. **LinkedIn Post Inspector**
   ```
   https://www.linkedin.com/post-inspector/
   ```

4. **Open Graph Check (General)**
   ```
   https://www.opengraph.xyz/
   ```

---

## ✅ MEJORES PRÁCTICAS APLICADAS

### SEO Local (Google Guidelines)

1. ✅ **Dirección física real y única**
   - No crear múltiples listings falsos
   - Usar solo la ubicación real

2. ✅ **`areaServed` para cobertura**
   - Indicar todas las áreas que sirves
   - Incluir ciudades y regiones completas

3. ✅ **Contenido específico por localización**
   - Landing pages únicas por ciudad
   - Información de distancia y tiempo
   - FAQs específicas de cada localización

4. ✅ **Transparencia**
   - Decir claramente "No estamos en X, pero estamos cerca"
   - Información de distancia visible
   - Llamada a la acción clara

### Open Graph (Meta Guidelines)

1. ✅ **Imágenes de calidad**
   - Mínimo 1200x630px
   - Formato webp para rendimiento
   - Alt text descriptivo

2. ✅ **Títulos y descripciones**
   - Títulos < 60 caracteres
   - Descripciones 150-200 caracteres
   - Específicas y atractivas

3. ✅ **Múltiples imágenes**
   - Hasta 3 imágenes por URL
   - Variedad de contenido visual
   - Primera imagen = principal

4. ✅ **Metadatos completos**
   - type, url, siteName
   - locale, countryName
   - Todas las propiedades opcionales

---

## 📈 BENEFICIOS ESPERADOS

### SEO
- 🎯 Posicionamiento en búsquedas locales de cada ciudad
- 🎯 Rich snippets con información de empresa
- 🎯 Mejor CTR desde resultados de búsqueda
- 🎯 Google entiende tu cobertura geográfica

### Redes Sociales
- 📱 Previews atractivos al compartir
- 📱 Imágenes de alta calidad visibles
- 📱 Mayor engagement en posts
- 📱 Branding consistente

### Conversión
- ✅ Transparencia = Confianza
- ✅ Información clara de distancia
- ✅ CTAs optimizados
- ✅ Experiencia usuario mejorada

---

## 🏆 RESULTADO FINAL

**Estrategia SEO local honesta y efectiva:**
- ✅ Google entiende que estás en Murcia
- ✅ Google sabe que sirves a otras ciudades
- ✅ No penalizaciones por "fake locations"
- ✅ Mejor posicionamiento a largo plazo

**Open Graph perfecto para compartir:**
- ✅ Previews atractivos en todas las plataformas
- ✅ Múltiples imágenes de calidad
- ✅ Metadata completa y optimizada
- ✅ Branding consistente

---

**Fecha de implementación:** 2026-01-20  
**Verificar en producción:** Después del deploy  
**Revisar métricas:** En 30 días
