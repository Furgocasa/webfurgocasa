# FIX: Error de Schema de Productos en Google Search Console

**Fecha:** 24/01/2026  
**Problema:** Google Search Console reportaba error en "Fragmentos de productos" por campos obligatorios faltantes  
**Estado:** ✅ RESUELTO

---

## 🔴 Problema Detectado

Google Search Console mostraba el siguiente error:

```
Se ha detectado 1 elemento no válido
Debe especificarse 'offers', 'review' o 'aggregateRating'
```

**Causa:** Las páginas de localización (alquiler) usaban un schema `Product` incompleto dentro de `hasOfferCatalog`, lo cual es **incorrecto** para una empresa de **servicios de alquiler**.

---

## ✅ Solución Aplicada

### 1. **Página de Localización (Alquiler) - LocalBusinessJsonLd**

**Archivo:** `src/components/locations/local-business-jsonld.tsx`

**ANTES** ❌:
```typescript
"itemOffered": {
  "@type": "Product",  // ❌ Incorrecto para un SERVICIO
  "name": "Camper Van de Gran Volumen",
  "description": "Furgonetas campers de 4-6 plazas..."
}
```

**AHORA** ✅:
```typescript
"itemOffered": {
  "@type": "Service",  // ✅ Correcto para ALQUILER
  "name": "Alquiler de Camper Van de Gran Volumen",
  "description": "Servicio de alquiler de furgonetas campers...",
  "provider": {
    "@type": "Organization",
    "name": "Furgocasa"
  }
}
```

---

### 2. **Página de Venta - SaleLocationJsonLd**

**Archivo:** `src/components/locations/sale-location-jsonld.tsx`

**ANTES** ❌:
```typescript
"itemOffered": {
  "@type": "Vehicle",
  "@type": "Car",  // ❌ Doble @type es inválido
  "vehicleType": "Motorhome",
  "name": "Autocaravana Premium"
}
```

**AHORA** ✅:
```typescript
"itemOffered": {
  "@type": "Vehicle",  // ✅ Solo un @type
  "vehicleModelDate": "2020",
  "name": "Autocaravana Premium",
  "description": "...",
  "bodyType": "Motorhome"
}
```

---

## 📊 Archivos NO Modificados (Correctos)

### `src/components/home/organization-jsonld.tsx` - ProductJsonLd

Este componente **SÍ está correcto** porque:

✅ Usa `@type: "Product"` para vehículos individuales  
✅ Incluye `offers` con `AggregateOffer` (precio, disponibilidad)  
✅ Incluye información completa (imagen, marca, propiedades)

**No requiere cambios.**

---

## 🎯 Diferencia Clave: Product vs Service

| Tipo | Cuándo usar | Requiere |
|------|-------------|----------|
| **Service** | Alquiler, servicios, suscripciones | `provider` |
| **Product** | Venta de productos físicos | `offers` con precio O `review`/`aggregateRating` |
| **Vehicle** | Vehículos en venta | Propiedades del vehículo (`bodyType`, `vehicleModelDate`) |

---

## 📝 Páginas Afectadas

Las siguientes URL ya NO generarán error:

- ✅ `/es/alquiler-autocaravanas-campervans-murcia`
- ✅ `/es/alquiler-autocaravanas-campervans-valencia`
- ✅ `/es/alquiler-autocaravanas-campervans-alicante`
- ✅ ... (todas las páginas de localización de alquiler)
- ✅ `/es/venta-autocaravanas-camper-murcia`
- ✅ `/es/venta-autocaravanas-camper-valencia`
- ✅ ... (todas las páginas de localización de venta)

---

## 🚀 Próximos Pasos

1. **Deploy a producción:** Los cambios se aplicarán automáticamente en el próximo deploy
2. **Esperar rastreo de Google:** Google tardará unos días en volver a rastrear las páginas
3. **Validar en Search Console:**
   - Ir a: https://search.google.com/search-console
   - Inspeccionar una URL de ejemplo
   - Verificar que el error ya no aparece

---

## 🔍 Verificación Manual

Puedes validar el schema en:
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/

---

## 📌 Resumen

- ❌ **Problema:** Schema de `Product` incorrecto en páginas de alquiler
- ✅ **Solución:** Cambiar a `Service` (alquiler) y `Vehicle` (venta)
- ⏱️ **Tiempo:** Google tardará 1-3 días en re-indexar
- 🎯 **Impacto SEO:** Mejora la indexación y evita warnings en Search Console
