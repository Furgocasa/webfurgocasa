# Configuración de Meta Pixel (Facebook Pixel)

## Problema Resuelto

Se ha corregido el error `[Meta Pixel] - Invalid PixelID: null` que aparecía en la consola del navegador.

## Cambios Realizados

### 1. Layout Principal (`src/app/layout.tsx`)

El Meta Pixel ahora solo se carga si está configurada la variable de entorno `NEXT_PUBLIC_META_PIXEL_ID`:

```tsx
{process.env.NEXT_PUBLIC_META_PIXEL_ID && (
  <Script
    id="facebook-pixel"
    strategy="afterInteractive"
    dangerouslySetInnerHTML={{
      __html: `
        // ... código del pixel ...
        fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
      `,
    }}
  />
)}
```

## Configuración

### Añadir a `.env.local`

Para habilitar Meta Pixel, añade la siguiente variable de entorno:

```bash
# Meta Pixel (Facebook Pixel) - Opcional
# Si no se configura, el pixel no se cargará y no habrá errores
NEXT_PUBLIC_META_PIXEL_ID=tu-pixel-id-aqui
```

### Dónde Obtener el Pixel ID

1. Accede a [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Selecciona tu píxel o crea uno nuevo
3. En "Configuración del píxel", encontrarás tu ID de píxel (es un número)
4. Copia ese número y pégalo en la variable de entorno

### Ejemplo

```bash
NEXT_PUBLIC_META_PIXEL_ID=1234567890123456
```

## Características

- **Carga Condicional**: Si no está configurada la variable, el pixel no se carga y no genera errores
- **GDPR Compliant**: El consentimiento está denegado por defecto (`fbq('consent', 'revoke')`)
- **Gestión de Cookies**: El consentimiento se actualiza cuando el usuario acepta cookies de marketing en el banner

## Verificación

Para verificar que el pixel está funcionando correctamente:

1. Abre las DevTools del navegador
2. En la consola, ejecuta: `fbq('track', 'ViewContent')`
3. Ve a la pestaña "Network" y busca peticiones a `facebook.com`
4. También puedes usar la [extensión Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)

## Estado Actual

✅ **Sin configurar**: El pixel no se carga, no hay errores en consola
⚠️ **Pendiente**: Añadir `NEXT_PUBLIC_META_PIXEL_ID` al archivo `.env.local` cuando tengas el ID real

## Notas

- Este cambio también afecta a Google Analytics que usa un ID de placeholder `G-XXXXXXXXXX`
- Se recomienda configurar también `NEXT_PUBLIC_GA_ID` para Google Analytics
- Ambos IDs son opcionales y la aplicación funciona sin ellos
