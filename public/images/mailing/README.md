# `public/images/mailing/` · Assets para mailings de marketing

Esta carpeta contiene las imágenes que se referencian **con URL absoluta**
(`https://www.furgocasa.com/images/mailing/...`) en los HTML de las campañas
de marketing generadas desde `/administrator/mails`.

## ⚠️ Por qué URL absoluta

Los clientes de correo (Gmail, Outlook, iOS Mail) **no resuelven rutas
relativas**. Toda imagen en los HTML debe estar publicada en el dominio
(`https://www.furgocasa.com/...`) y, por eso, aquí.

## Archivos esperados

El system prompt de la IA generadora y el endpoint de unsubscribe referencian
estas rutas. Si alguna falta, el email se verá roto:

| Archivo                           | Tamaño sugerido | Uso                                                         |
| --------------------------------- | --------------- | ----------------------------------------------------------- |
| `instagram.png`                   | 28×28 px        | Icono de Instagram en el footer del email                   |
| `facebook.png`                    | 28×28 px        | Icono de Facebook en el footer del email                    |
| `logo-mailing-header.png`         | 320×100 px      | (opcional) Variante del logo pensada para cabecera de email |
| `logo-mailing-footer.png`         | 240×80 px       | (opcional) Logo más pequeño y suave para el footer          |
| `hero-furgo-primavera.webp/jpg`   | 1200×600 px     | Hero fotográfico para campañas estacionales (ejemplo)       |

> Para el logo principal ya usamos
> `https://www.furgocasa.com/images/brand/LOGO%20AZUL.png` (carpeta `brand/`),
> no lo dupliques aquí salvo que quieras una versión específicamente retocada
> para mailing.

## Convenciones

- **Formato:** PNG con transparencia para iconos y logos; JPG/WEBP para fotos.
- **Peso:** idealmente < 150 KB por imagen para evitar que Gmail la recorte.
- **Dimensiones dobles:** si vas a mostrar una imagen a 300 px, súbela a
  600 px (retina).
- **Nombrado:** en `kebab-case` y sin espacios. Si hay espacios o acentos, la
  URL del email debe usar `%20` y `%CC...` y suele dar problemas.
- **Sin SVG** en `<img src="…">`: Gmail los bloquea. Exporta a PNG.

## Cómo añadir un asset nuevo

1. Sube el archivo a `public/images/mailing/`.
2. Haz commit + despliegue (la URL no existe hasta que esté en producción).
3. Refer­énciala en el HTML de la campaña con
   `https://www.furgocasa.com/images/mailing/NOMBRE.png`.
4. Envía un **test** desde el panel (Preview → "Enviar test a…") para
   verificar que carga en Gmail, Outlook y Apple Mail.

## Referenciado automáticamente por la IA

El prompt del generador de HTML (`src/app/api/admin/mailing/campaigns/[slug]/generate/route.ts`)
instruye a la IA para que use:

```
Instagram → https://www.furgocasa.com/images/mailing/instagram.png
Facebook  → https://www.furgocasa.com/images/mailing/facebook.png
```

Si decides cambiar el stock de redes sociales (p. ej. añadir TikTok), también
tendrás que actualizar el `SYSTEM_PROMPT` de ese route para que la IA lo sepa.
