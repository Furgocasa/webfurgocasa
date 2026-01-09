# Imágenes de Furgocasa

## Slides / Hero Section

Las imágenes en `/public/images/slides/` están optimizadas en formato WebP para mejor rendimiento.

### Imágenes disponibles:

- `hero-01.webp` - `hero-08.webp`: 8 imágenes de campers para el slider principal

### Especificaciones:

- **Formato**: WebP
- **Calidad**: 85%
- **Reducción de tamaño**: 38-58% vs. JPEG original
- **Uso**: Hero slider en la página de inicio

### Conversión de nuevas imágenes:

Si necesitas añadir más imágenes, sigue estos pasos:

1. Coloca las imágenes JPG originales en `images/slides web/`
2. Cópialas a `public/images/slides/` con nombres descriptivos
3. Convierte a WebP usando sharp:

```javascript
const sharp = require('sharp');

sharp('input.jpg')
  .webp({ quality: 85 })
  .toFile('output.webp');
```

### Uso en el código:

```tsx
import { HeroSlider } from "@/components/hero-slider";

const images = [
  "/images/slides/hero-01.webp",
  "/images/slides/hero-02.webp",
  // ...
];

<HeroSlider images={images} autoPlayInterval={5000} />
```

## Imágenes de vehículos

Las imágenes específicas de cada modelo de vehículo deben colocarse en:
- `/public/images/vehicles/`

## Imágenes de destinos

Las imágenes de destinos turísticos deben colocarse en:
- `/public/images/destinations/`

---

**Nota**: Todas las imágenes públicas deben optimizarse a WebP antes de subir a producción para mejorar el tiempo de carga.






