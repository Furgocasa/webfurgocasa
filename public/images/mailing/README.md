# `public/images/mailing/` · Assets para mailings de marketing

Esta carpeta contiene las imágenes que se referencian **con URL absoluta**
(`https://www.furgocasa.com/images/mailing/...`) en los HTML de las campañas
de marketing generadas desde `/administrator/mails` y también en los emails
transaccionales (`src/lib/email/templates.ts`).

## ⚠️ Por qué URL absoluta

Los clientes de correo (Gmail, Outlook, iOS Mail) **no resuelven rutas
relativas**. Toda imagen en los HTML debe estar publicada en el dominio
(`https://www.furgocasa.com/...`) y, por eso, aquí.

## Archivos disponibles

### Logos (regla unificada en todos los mails)

| Archivo                                    | Uso                                               |
| ------------------------------------------ | ------------------------------------------------- |
| `LOGO AZUL.png`                            | Cabeceras / footers con **fondo claro**           |
| `../brand/LOGO BLANCO.png` (carpeta brand) | Cabeceras / footers con **fondo oscuro**          |

> **Regla de oro**:
>
> - Fondo claro  → `https://www.furgocasa.com/images/mailing/LOGO%20AZUL.png`
> - Fondo oscuro → `https://www.furgocasa.com/images/brand/LOGO%20BLANCO.png`
>
> No se deben usar otras variantes (`logo-blanco_500.png`, etc.). Esta regla
> está también codificada en el system prompt del generador IA
> (`src/app/api/admin/mailing/campaigns/[slug]/generate/route.ts`).

### Iconos redes sociales (azul corporativo #063971, 56×56 retina de 28×28)

| Archivo          | URL pública                                                    |
| ---------------- | -------------------------------------------------------------- |
| `instagram.png`  | `https://www.furgocasa.com/images/mailing/instagram.png`       |
| `facebook.png`   | `https://www.furgocasa.com/images/mailing/facebook.png`        |

Uso recomendado en HTML:

```html
<img src="https://www.furgocasa.com/images/mailing/instagram.png"
     alt="Instagram" width="28" height="28"
     style="display:block;border:0;width:28px;height:28px;" />
```

### Fotos carátula de vehículos (`vehicles/`)

Todas las fotos primarias de los vehículos activos e inactivos, en JPEG
optimizado (máx. 1200 px ancho, calidad 85%, ~60-200 KB cada una).

```
public/images/mailing/vehicles/fu0006-dreamer-fun-d55.jpg
public/images/mailing/vehicles/fu0010-knaus-boxstar-street.jpg
public/images/mailing/vehicles/fu0011-weinsberg-caratour-mq.jpg
public/images/mailing/vehicles/fu0012-knaus-boxstar-family.jpg
public/images/mailing/vehicles/fu0013-livingstone-sport-5.jpg
public/images/mailing/vehicles/fu0014-sunlight-cliff-adventure.jpg
public/images/mailing/vehicles/fu0015-adria-twin-family.jpg
public/images/mailing/vehicles/fu0016-challenger-v114-max.jpg
public/images/mailing/vehicles/fu0017-knaus-boxstar-street-aut.jpg
public/images/mailing/vehicles/fu0018-knaus-boxlife-dq.jpg
public/images/mailing/vehicles/fu0019-weinsberg-carabus-600-mq.jpg
public/images/mailing/vehicles/fu0020-weinsberg-carabus-540-mq.jpg
public/images/mailing/vehicles/fu0021-dethleffs-globetrail-600-ds.jpg
```

Uso en HTML de campaña:

```html
<img src="https://www.furgocasa.com/images/mailing/vehicles/fu0015-adria-twin-family.jpg"
     alt="Adria Twin Family" width="560"
     style="display:block;width:100%;max-width:560px;height:auto;" />
```

Convención de nombres: `<código-interno-en-minúsculas>-<slug-del-vehículo>.jpg`.
Siempre `.jpg` aunque la fuente original sea PNG/WEBP (máxima compatibilidad
con Gmail/Outlook/iOS Mail).

## Cómo actualizar (añadir vehículo nuevo, cambiar carátula, etc.)

Hay un script idempotente que:

1. Regenera los iconos Instagram/Facebook desde Simple Icons.
2. Consulta Supabase (`vehicles` + `vehicle_images WHERE is_primary = true`).
3. Descarga la carátula de cada vehículo y la re-comprime a 1200 px / JPEG 85.
4. **Borra el contenido previo de `vehicles/`** antes de volcar, para evitar
   archivos huérfanos de vehículos dados de baja.

```bash
# Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
node --env-file=.env.local scripts/download-mailing-assets.mjs
```

Después haz commit + push para que Vercel despliegue los assets nuevos:

```bash
git add public/images/mailing/
git commit -m "chore(mailing): regenerar assets de marketing"
git push
```

## Convenciones generales

- **Formato**: PNG con transparencia para iconos y logos; JPG para fotos.
  Evita SVG y WEBP en `<img src="…">` (Gmail los bloquea o renderiza mal).
- **Peso**: idealmente < 200 KB por imagen para evitar que Gmail "recorte"
  el mensaje.
- **Dimensiones dobles (retina)**: si muestras una imagen a 300 px, súbela
  a 600 px. Los iconos sociales son 56×56 (2×).
- **Nombrado**: `kebab-case` sin espacios ni acentos. Si hay espacios, la URL
  del email debe usar `%20`, lo cual suele dar problemas en algunos clientes.
