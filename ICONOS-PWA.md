# Generación de Iconos PWA

Para generar los iconos necesarios para la PWA, puedes usar el archivo `favicon.png` existente.

## Tamaños Necesarios

Para una PWA completa, necesitas estos tamaños:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

## Opciones de Generación

### Opción 1: Usar un Generador Online
1. Accede a: https://realfavicongenerator.net/
2. Sube `public/images/brand/favicon.png`
3. Descarga el paquete de iconos
4. Colócalos en `public/icons/`

### Opción 2: Usar Sharp (Node.js)
Instala sharp:
```bash
npm install --save-dev sharp
```

Crea un script `scripts/generate-pwa-icons.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/images/brand/favicon.png');
const outputDir = path.join(__dirname, '../public/icons');

// Crear directorio si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar iconos
sizes.forEach(size => {
  sharp(inputFile)
    .resize(size, size)
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`✓ icon-${size}x${size}.png`))
    .catch(err => console.error(`✗ Error con ${size}x${size}:`, err));
});
```

Ejecuta:
```bash
node scripts/generate-pwa-icons.js
```

### Opción 3: PWA Asset Generator
```bash
npx pwa-asset-generator public/images/brand/favicon.png public/icons --icon-only
```

## Actualizar el Manifest

Una vez generados los iconos, actualiza `public/admin-manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Por Ahora

Mientras tanto, el manifest actual usa `favicon.png` para todos los tamaños, lo cual funciona pero no es óptimo. Los navegadores redimensionarán la imagen según sea necesario.
