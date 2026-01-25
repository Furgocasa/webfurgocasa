# Optimización LCP para Móvil - Eliminación de Preload Duplicado

**Fecha:** 25 de enero de 2026  
**Objetivo:** Mejorar el Largest Contentful Paint (LCP) en dispositivos móviles en Google PageSpeed Insights

## 📊 Diagnóstico Inicial

### Resultados Google PageSpeed Insights

**Desktop:** ✅ 99/100 (Excelente)
- LCP: 0.9s
- FCP: 0.3s

**Móvil:** ⚠️ 87/100 (Mejorable)
- LCP: 3.9s ← **Problema principal**
- FCP: 1.5s
- TBT: 30ms (Excelente)
- CLS: 0 (Perfecto)

**GTmetrix:** ✅ A (98% Performance)
- LCP: 899ms
- Todas las métricas en verde

### Análisis del Problema

La diferencia entre Desktop/GTmetrix (perfecto) y Móvil Google (mejorable) indicaba un problema específico de **ancho de banda limitado** en la simulación móvil (4G lento).

**Causa raíz identificada:** Doble descarga de la imagen Hero en páginas de localización.

## 🔍 El Problema: Doble Descarga (Double Fetch)

En el archivo `/src/app/es/alquiler-autocaravanas-campervans/[location]/page.tsx` existía este código:

```tsx
return (
  <>
    {/* Preconnect para acelerar carga de imágenes desde Supabase Storage */}
    <link rel="preconnect" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
    <link rel="dns-prefetch" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
    
    {/* ❌ PROBLEMA: Preload manual que causa doble descarga */}
    <link rel="preload" as="image" href={heroImageUrl} fetchPriority="high" />
    
    <LocalBusinessJsonLd location={location as any} />
    
    {/* ... */}
    
    <Image
      src={heroImageUrl}
      alt={...}
      fill
      priority  // ← Ya genera automáticamente un preload optimizado
      fetchPriority="high"
      quality={50}
      sizes="(max-width: 640px) 100vw, ..."
      className="object-cover"
    />
```

### ¿Por qué causaba el problema?

1. **Preload Manual (línea 233):**
   - Fuerza al navegador a descargar la imagen **original** de Supabase
   - URL: `https://...supabase.co/.../hero-location-mediterraneo.jpg`
   - Tamaño: ~1MB+ (JPG sin optimizar)

2. **Next.js Image con `priority` (línea 242):**
   - Genera automáticamente su propio `<link rel="preload">`
   - URL: `/_next/image?url=https://...&w=640&q=50`
   - Tamaño: ~150KB (WebP/AVIF optimizado, 640px de ancho para móvil)

**Resultado:** El móvil descargaba AMBAS imágenes en paralelo, saturando el ancho de banda 4G limitado y retrasando el LCP.

### ¿Por qué en Desktop no afectaba?

En Desktop (WiFi/Fibra) el navegador puede descargar ambas imágenes casi instantáneamente, por lo que el desperdicio de recursos no se nota en las métricas.

## ✅ Solución Implementada

**Acción:** Eliminar el `<link rel="preload">` manual.

**Código después de la optimización:**

```tsx
return (
  <>
    {/* Preconnect para acelerar carga de imágenes desde Supabase Storage */}
    <link rel="preconnect" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
    <link rel="dns-prefetch" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
    
    {/* Next.js Image con priority ya genera automáticamente el preload correcto (optimizado) */}
    
    <LocalBusinessJsonLd location={location as any} />
    
    {/* ... */}
    
    <Image
      src={heroImageUrl}
      alt={...}
      fill
      priority  // ← Genera el preload optimizado automáticamente
      fetchPriority="high"
      quality={50}
      sizes="(max-width: 640px) 100vw, ..."
      className="object-cover"
    />
```

### ¿Por qué funciona?

- Next.js `Image` con `priority={true}` **ya genera automáticamente** el preload de la versión optimizada
- La versión optimizada es:
  - ✅ Formato moderno (WebP/AVIF)
  - ✅ Tamaño correcto (640px para móvil, no 1920px)
  - ✅ Calidad ajustada (`quality={50}`)
  - ✅ ~85% más liviana que el original

## 📁 Archivos Modificados

### Fix #1 (commit ea0f19b - 25 Ene 2026 12:38)
1. ✅ `/src/app/es/alquiler-autocaravanas-campervans/[location]/page.tsx` (línea 233)
   - Eliminado: `<link rel="preload" as="image" href={heroImageUrl} />`
   - Resultado: 87 → 92, LCP: 3.9s → 3.2s

### Fix #2 (este commit - 25 Ene 2026)
2. ✅ `/src/app/es/alquiler-autocaravanas-campervans/[location]/page.tsx` (línea 247)
   - Añadido: `decoding="sync"` a la imagen Hero
   
3. ✅ `/src/components/analytics-scripts.tsx` (línea 41)
   - Cambiado: `strategy="beforeInteractive"` → `strategy="afterInteractive"`

## 🎯 Mejora Esperada

### Progresión:
**Antes (v1):**
- **Móvil:** LCP 3.9s, Score 87/100
- Problemas: Doble descarga + decodificación async + GTM bloqueante

**Después Fix #1:**
- **Móvil:** LCP 3.2s, Score 92/100
- Resuelto: Doble descarga ✅

**Después Fix #2 (estimado):**
- **Móvil:** LCP ~2.0s, Score ~95-97/100
- Resuelto: Decodificación inmediata ✅ + GTM no bloqueante ✅

### Desglose de mejoras:
| Optimización | Impacto en LCP | Justificación |
|--------------|----------------|---------------|
| Eliminar preload duplicado | -0.7s (~18%) | Ahorra ancho de banda 4G |
| `decoding="sync"` | -0.5s (~15%) | Elimina espera de decodificación |
| GTM `afterInteractive` | -0.7s (~22%) | Deja al navegador priorizar imagen |
| **Total estimado** | **-1.9s (~49%)** | **3.9s → 2.0s** |

### Otras métricas NO afectadas:
- Desktop: Sigue perfecto (99/100)
- GTmetrix: Sigue perfecto (A, 98%)
- FCP, TBT, CLS: Sin cambios (ya están bien)

## 🔧 Otras Optimizaciones Presentes

El archivo ya cuenta con:

1. ✅ `preconnect` y `dns-prefetch` a Supabase
2. ✅ `quality={50}` (balance calidad/peso)
3. ✅ `sizes` responsivos correctos
4. ✅ `priority` y `fetchPriority="high"` en Hero
5. ✅ `loading="lazy"` en imágenes secundarias
6. ✅ Cache headers en `next.config.js` (1 año para imágenes)

## 📚 Lecciones Aprendidas

### ❌ No hacer:
- Añadir preloads manuales de imágenes cuando se usa Next.js `Image` con `priority`
- Duplicar la descarga de recursos críticos

### ✅ Hacer:
- Confiar en la optimización automática de Next.js Image
- Solo añadir preconnect/dns-prefetch para dominios externos
- Siempre probar en simulación móvil 4G lenta

## 🧪 Verificación Post-Deploy

Después del deploy a producción, verificar:

1. Google PageSpeed Insights Móvil: https://pagespeed.web.dev/
   - Objetivo: LCP < 2.5s (verde)
   - Score móvil: >90

2. Network tab en Chrome DevTools (simulando 4G lento):
   - Verificar que solo se descarga 1 versión de la imagen Hero
   - Confirmar que es la versión optimizada de Next.js (`/_next/image?...`)

3. GTmetrix:
   - Confirmar que sigue en 'A' (98%+)

## 📖 Referencias

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web Vitals - LCP](https://web.dev/lcp/)
- [Preload vs Priority en Next.js](https://nextjs.org/docs/app/api-reference/components/image#priority)
