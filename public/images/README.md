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

## Imágenes del programa Storytellers

Hay **dos directorios** distintos con propósitos complementarios:

### `/public/images/storytellers/` · Landing pública (`/es/storytellers`)

Imágenes optimizadas en **WebP** generadas por IA para la landing
comercial del programa. Sirven al hero, al mosaico "El tipo de momentos
que nos encantan" y a iconografía menor.

Ejemplos: `showcase-hero.webp`, `showcase-detail-route.webp`,
`showcase-family-fun.webp`, `showcase-pet.webp`, etc.

Reglas:

- Formato WebP (calidad 85), pesos < 200 KB.
- Servidas con `next/image` (responsive automático).
- **No se usan en email**: Outlook no soporta WebP de forma fiable.

### `/public/images/mailing/storytellers/` · Email + landing (set unificado)

Set **doble propósito** con imágenes en JPG progresivo (compatibles con
todos los gestores de correo, incluido Outlook), generadas con `sharp` +
SVG overlay desde imágenes IA fotorealistas:

#### Heros del email · `cover-cta-05/06/07.jpg`

- **Aspect ratio 4:5 vertical** (1024×1536 px, 230–280 KB).
- Texto promocional integrado por `gpt-image-2` + flecha "scroll down" abajo.
- **No clicables** (a propósito): el hero invita a deslizar.
- Generadas con `scripts/generate-storytellers-email-promo-images.ts` (tags `cover-05/06/07`).

#### Banners narrativa del email · `banner-05/06/07.jpg`

- **Aspect ratio 3:2 horizontal** (1536×1024 px, 175–245 KB).
- Texto promocional integrado por `gpt-image-2`: título a dos líneas +
  sublínea + pill naranja `#ea580c`. Una imagen distinta por email.
- Generadas con `scripts/generate-storytellers-email-promo-images.ts` (tags `banner-05/06/07`).

#### Versiones limpias para landing pública · `banner-05/06/07-clean.jpg`

- **Misma foto base, sin texto.** Se reutilizan en la landing pública
  dentro de los 3 bloques `<LifestyleFeature>` (componente zigzag con
  imagen + texto + bullets en lugar de banners full-bleed pelados).
- **Una sola fuente de imágenes** para email y web, dos tratamientos
  visuales distintos.

#### Especificaciones técnicas comunes

- **Formato:** JPG progresivo, `mozjpeg`, `quality: 86`.
- **URL absoluta:** todas se referencian desde el email como
  `https://www.furgocasa.com/images/mailing/storytellers/...` (Outlook
  exige URL absoluta).
- **Clase responsiva:** `.hero-img` para que el media query mobile las
  haga full-bleed (`width: 100% !important`).

⚠️ **Importante:** los HTML de email referencian estas imágenes por
nombre exacto (`banner-05-salida.jpg`, `banner-06-teckel.jpg`,
`banner-07-recuerdos.jpg`). Si se cambia el nombre del archivo, hay que
actualizar también los HTML de `mailing/app/05–07.html`.

#### ⭐ Regla de oro de imágenes promocionales (a futuro)

Cuando haya que crear un banner, hero promocional o cartel con texto
encima de una foto, **se usa SIEMPRE `gpt-image-2`** (vía
`openai.images.edit` pasando la foto base + brief con texto exacto +
paleta + posición). El modelo compone el cartel completo (jerarquía
tipográfica, drop-shadow, gradient sutil para contraste, pill
redondeada, integración con la foto) y los resultados son claramente
más editoriales que un overlay SVG montado a mano.

`sharp` + SVG queda reservado para casos donde necesitas
reproducibilidad pixel-perfect: marcos de blog, watermarks, logos,
plantillas de marketing programáticas con miles de variantes (donde el
coste por imagen del modelo no compensa) o cuando NO hay foto base de
partida y el cartel es 100 % gráfico.

Patrón a copiar al crear nuevos generadores: [`scripts/generate-storytellers-email-promo-images.ts`](../../scripts/generate-storytellers-email-promo-images.ts).

Para detalle completo (cómo regenerar, qué texto lleva cada banner,
posiciones en el HTML, redes con MITM), ver
[`mailing/STORYTELLERS_MAILS.md`](../../mailing/STORYTELLERS_MAILS.md)
sección 9.

---

**Nota**: Todas las imágenes públicas deben optimizarse a WebP antes de subir a producción para mejorar el tiempo de carga. **Excepción:** las imágenes que se usan en email deben ser JPG (Outlook no soporta WebP).






