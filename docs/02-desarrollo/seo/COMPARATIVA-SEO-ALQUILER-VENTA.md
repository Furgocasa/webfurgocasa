# 🔄 COMPARATIVA: PÁGINAS DE ALQUILER vs VENTA (SEO)

**Fecha**: 2026-01-20  
**Objetivo**: Verificar que ambas páginas tienen el **mismo nivel de calidad SEO**

**Marzo 2026:** Landings de **alquiler** en `location_targets`: **~59** activas (antes ~36). **Venta** sigue en `sale_location_targets` (catálogo independiente). Paridad técnica página a página se mantiene.

---

## ✅ RESULTADO: PARIDAD 100%

Las páginas de **venta** por ciudad tienen **exactamente el mismo nivel SEO** que las páginas de **alquiler**.

---

## 📊 COMPARATIVA DETALLADA

| Característica | Alquiler | Venta | Estado |
|----------------|----------|-------|--------|
| **Server Component** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **generateStaticParams** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **generateMetadata** | ✅ Completo | ✅ Completo | ✅ IGUAL |
| **ISR (revalidate)** | ✅ 86400s | ✅ 86400s | ✅ IGUAL |
| **Open Graph** | ✅ 2 imágenes | ✅ 2 imágenes | ✅ IGUAL |
| **Twitter Cards** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Canonical URLs** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Hreflang** | ✅ 4 idiomas | ✅ 4 idiomas | ✅ IGUAL |
| **Keywords meta** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Authors meta** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Schema: AutoDealer/LocalBusiness** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Schema: Breadcrumbs** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Schema: FAQPage** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **FAQs visibles** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Next/Image** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Alt text optimizado** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **H1→H2→H3 jerarquía** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Mobile-first** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Anchor text descriptivo** | ✅ Sí | ✅ Sí | ✅ IGUAL |
| **Robots index/follow** | ✅ Sí | ✅ Sí | ✅ IGUAL |

---

## 🔍 ANÁLISIS POR SECCIÓN

### 1. Metadata (generateMetadata)

#### Alquiler
```typescript
title: "Alquiler de Campers en Murcia | Desde 95€/día | Furgocasa"
description: "Alquiler de autocaravanas... 150-160 chars"
keywords: "alquiler camper murcia, autocaravana murcia..."
authors: [{ name: "Furgocasa" }]
openGraph: { ... 2 imágenes 1200×630 }
twitter: { card: "summary_large_image", ... }
alternates: { canonical: "..." }
robots: { index: true, follow: true }
```

#### Venta
```typescript
title: "Venta de Autocaravanas en Murcia | Furgocasa"
description: "Compra tu autocaravana... 150-160 chars"
keywords: "venta autocaravanas murcia, comprar camper murcia..."
authors: [{ name: "Furgocasa" }]
openGraph: { ... 2 imágenes 1200×630 }
twitter: { card: "summary_large_image", ... }
alternates: { canonical: "...", languages: {...} }
robots: { index: true, follow: true, googleBot: {...} }
```

**Resultado**: ✅ **MISMA CALIDAD** (incluso venta tiene más detalle en robots)

---

### 2. Schema.org JSON-LD

#### Alquiler
- ✅ LocalBusiness (con componente `LocalBusinessJsonLd`)
- ✅ BreadcrumbList
- ✅ FAQPage (5 preguntas)
- ✅ hasOfferCatalog con precios
- ✅ aggregateRating
- ✅ openingHours

#### Venta
- ✅ AutoDealer (con componente `SaleLocationJsonLd`)
- ✅ BreadcrumbList
- ✅ FAQPage (5 preguntas)
- ✅ hasOfferCatalog con precios
- ✅ aggregateRating
- ✅ openingHours

**Resultado**: ✅ **MISMA CALIDAD** (AutoDealer es incluso más específico)

---

### 3. Contenido Visible

#### Alquiler
- Hero con título principal
- SearchWidget (formulario reserva)
- Sección vehículos destacados
- Sección beneficios (3 columnas)
- FAQs visibles
- CTA contacto

#### Venta
- Hero con título principal
- Sección vehículos en venta
- Sección beneficios (3 columnas)
- FAQs visibles (5 preguntas)
- CTA contacto

**Resultado**: ✅ **MISMA ESTRUCTURA** (adaptada a venta vs alquiler)

---

### 4. Jerarquía HTML

#### Alquiler
```html
<main>
  <h1>Alquiler de Autocaravanas en Murcia</h1>
  <section><h2>Campers Disponibles</h2></section>
  <section><h2>Por Qué Alquilar</h2></section>
  <section><h2>Preguntas Frecuentes</h2></section>
  <section><h2>Contacta</h2></section>
</main>
```

#### Venta
```html
<main>
  <h1>Venta de Autocaravanas en Murcia</h1>
  <section><h2>Autocaravanas Disponibles</h2></section>
  <section><h2>Por Qué Comprar</h2></section>
  <section><h2>Preguntas Frecuentes</h2></section>
  <section><h2>¿Listo para Comprar?</h2></section>
</main>
```

**Resultado**: ✅ **MISMA ESTRUCTURA SEMÁNTICA**

---

### 5. Optimizaciones de Imágenes

#### Alquiler
```typescript
<Image
  src={vehicle.main_image}
  alt="Descripción con keywords"
  fill
  sizes="(max-width: 768px) 100vw, ..."
  quality={85}
/>
```

#### Venta
```typescript
<Image
  src={vehicle.main_image}
  alt="Descripción con keywords + ciudad"
  fill
  sizes="(max-width: 768px) 100vw, ..."
  quality={85}
/>
```

**Resultado**: ✅ **MISMA OPTIMIZACIÓN**

---

### 6. URLs y Traducciones

#### Alquiler
```
🇪🇸 /es/alquiler-autocaravanas-campervans-murcia
🇬🇧 /en/rent-campervan-motorhome-murcia
🇫🇷 /fr/location-camping-car-murcia
🇩🇪 /de/wohnmobil-mieten-murcia
```

#### Venta
```
🇪🇸 /es/venta-autocaravanas-camper-murcia
🇬🇧 /en/campervans-for-sale-in-murcia
🇫🇷 /fr/camping-cars-a-vendre-murcia
🇩🇪 /de/wohnmobile-zu-verkaufen-murcia
```

**Resultado**: ✅ **MISMO PATRÓN MULTIIDIOMA**

---

## 🏆 DIFERENCIAS (MEJORAS EN VENTA)

Las páginas de venta tienen algunas **mejoras adicionales**:

### 1. Robots más completo
```typescript
// Venta incluye configuración específica de googleBot
robots: {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
}
```

### 2. Hreflang en alternates
```typescript
// Venta incluye languages en alternates (mejor para multi-idioma)
alternates: {
  canonical: pageUrl,
  languages: {
    'es-ES': '...',
    'en-US': '...',
    'fr-FR': '...',
    'de-DE': '...',
  },
}
```

### 3. Componente JSON-LD separado
- Alquiler: usa componente `LocalBusinessJsonLd`
- Venta: usa componente `SaleLocationJsonLd` (más específico)

**Ventaja**: Código más mantenible y reutilizable

---

## 📈 LIGHTHOUSE SCORE ESPERADO

| Métrica | Alquiler | Venta | Target |
|---------|----------|-------|--------|
| **Performance** | 95-100 | 95-100 | >90 |
| **Accessibility** | 95-100 | 95-100 | >90 |
| **Best Practices** | 95-100 | 95-100 | >90 |
| **SEO** | 100 | 100 | 100 |

---

## ✅ CONCLUSIÓN

### Paridad SEO: 100%

Las páginas de **venta** por ciudad tienen:
- ✅ **Mismo nivel de optimización** que alquiler
- ✅ **Mismas técnicas SEO** aplicadas
- ✅ **Mismo cumplimiento** de NORMAS-SEO-OBLIGATORIAS.md
- ✅ **Algunas mejoras adicionales** (robots, hreflang)

### No hay Diferencias Negativas

- ✅ Ambas son Server Components
- ✅ Ambas tienen Schema.org completo
- ✅ Ambas tienen FAQs visibles + Schema
- ✅ Ambas tienen Next/Image optimizado
- ✅ Ambas tienen Open Graph completo
- ✅ Ambas tienen jerarquía HTML correcta

### Código Consistente

- ✅ Mismos patrones de código
- ✅ Misma estructura de componentes
- ✅ Mismos comentarios explicativos
- ✅ Misma calidad de documentación

---

## 🎯 PRÓXIMO PASO

**Deploy con confianza**: Las páginas de venta están al **mismo nivel** (o superior) que las de alquiler que ya están funcionando correctamente en producción.

**Lighthouse esperado**: 100 en SEO, 95-100 en Performance

---

**Verificado**: 2026-01-20 21:30 UTC  
**Estado**: ✅ **APROBADO** - Paridad SEO confirmada
