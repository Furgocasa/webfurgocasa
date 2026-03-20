# 📸 Sistema de Imágenes Hero para Páginas de Localización

## ✅ Implementación Completada

**Marzo 2026:** El mapeo de héroes en código (`src/lib/locationImages.ts`) incluye también el **anillo** (22 slugs) y localidades nuevas (p. ej. Hellín); el listado de Storage puede no coincidir 1:1 con todos los slugs — hay **fallback** a imagen de sede o genérica.

### 🎯 Objetivo
Usar imágenes de **alta calidad** (1920x1080, WebP 90%) en las secciones hero de las páginas de localización, diferentes a las imágenes pequeñas de las tarjetas de destinos.

---

## 📁 Estructura en Supabase Storage

### Bucket `media`:

```
media/
├── locations/          # Imágenes para tarjetas pequeñas (800x600)
│   ├── furgocasa_alquiler_autocaravanas_campervan_murcia.webp
│   ├── furgocasa_alquiler_autocaravanas_campervan_alicante.webp
│   └── ... (6 ciudades principales)
│
└── slides/            # Imágenes HERO de alta calidad (1920x1080) ✨ NUEVO
    ├── furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_murcia.webp
    ├── furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_alicante.webp
    ├── furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_cartagena.webp
    └── ... (31 ciudades total)
```

---

## 🚀 Imágenes Subidas

**Total**: 31 imágenes de ciudades
**Resolución**: 1920x1080 (optimizadas para pantallas Full HD)
**Formato**: WebP
**Calidad**: 90% (alta calidad para heros)
**Tamaño promedio**: ~300-500 KB

### Ciudades incluidas:
- Murcia, Alicante, Cartagena, Albacete
- Almería, Lorca, Mazarrón, Águilas
- Cieza, Jumilla, Yecla, Caravaca de la Cruz
- Molina de Segura, Alcantarilla, Archena
- Totana, Alhama de Murcia, Elche
- Altea, Elda, Cabo de Gata, Ceuta
- Cehegín, Campoamor, El Algar
- A Coruña, Andalucía, Castilla-La Mancha
- España (imagen genérica de fallback)

---

## 🔧 Implementación Técnica

### Script de subida: `scripts/upload-hero-slides.js`

**Características**:
- Lee imágenes de `furgocasa_images/slides/`
- Optimiza a 1920x1080, WebP 90%
- Sube a `media/slides/` en Supabase Storage
- Genera log JSON con URLs
- Muestra código para copiar/pegar

### Función en `src/app/[location]/page.tsx`

```typescript
// Mapeo de imágenes hero por ciudad
const LOCATION_HERO_IMAGES: Record<string, string> = {
  "Murcia": "https://.../media/slides/furgocasa_..._murcia.webp",
  "Alicante": "https://.../media/slides/furgocasa_..._alicante.webp",
  // ... 31 ciudades
};

const getLocationHeroImage = (cityName: string): string => {
  // Buscar imagen específica
  if (LOCATION_HERO_IMAGES[cityName]) {
    return LOCATION_HERO_IMAGES[cityName];
  }
  
  // Fallback: imagen de Murcia o España
  return LOCATION_HERO_IMAGES["Murcia"] || LOCATION_HERO_IMAGES["España"];
};
```

---

## 📊 Diferencias entre Imágenes

| Ubicación | Propósito | Resolución | Calidad | Bucket/Carpeta |
|-----------|-----------|------------|---------|----------------|
| **Tarjetas pequeñas** | Grid "Principales destinos" | 800x600 | 85% | `media/locations/` |
| **Hero de páginas** | Imagen principal full-screen | 1920x1080 | 90% | `media/slides/` |

---

## 🎨 Resultado Visual

### Antes:
- Hero usaba las mismas imágenes pequeñas de las tarjetas
- Baja calidad al ampliar

### Ahora:
- Hero usa imágenes de **alta calidad** específicas
- Perfecta resolución en pantallas Full HD
- Cada ciudad tiene su imagen única y de calidad

---

## 📝 Uso

Cuando creas una nueva página de localización:

1. **Añadir imagen hero**: Sube la imagen a `media/slides/` vía panel admin
2. **Actualizar mapeo**: Añade la ciudad y URL en `LOCATION_HERO_IMAGES`
3. **Fallback automático**: Si no hay imagen específica, usa Murcia o España

---

## ✨ Comandos útiles

```bash
# Subir nuevas imágenes de slides
node scripts/upload-hero-slides.js

# Ver log de imágenes subidas
cat scripts/uploaded-slides-log.json
```

---

**Fecha de implementación**: 21 de enero de 2026  
**Script creado**: `scripts/upload-hero-slides.js`  
**Total imágenes**: 31 ciudades en alta calidad
