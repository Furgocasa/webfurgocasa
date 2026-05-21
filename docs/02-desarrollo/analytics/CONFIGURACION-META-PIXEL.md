# Configuración de Meta Pixel (Facebook Pixel)

**Última actualización**: 20 de mayo de 2026

> 🆕 **Mayo 2026:** el script de Meta Pixel se ha movido a
> `src/components/deferred-analytics.tsx` y ahora se carga **diferido**
> (primera interacción del usuario o 2,5 s). Además se ha corregido un
> typo de la URL del script (`fbevets.js` → `fbevents.js`) que estaba
> impidiendo que el pixel **funcionara en absoluto** desde su
> implementación original.
>
> Ver también: `CHANGELOG.md` entrada *20 mayo 2026 — perf(home/loc)*.

---

## Problema Resuelto (enero 2026)

Se ha corregido el error `[Meta Pixel] - Invalid PixelID: null` que aparecía en la consola del navegador.

## Cambios Realizados

### 1. Componente `DeferredAnalytics` (`src/components/deferred-analytics.tsx`) — mayo 2026

El Meta Pixel se inyecta desde un componente client que retrasa la
inyección hasta la primera interacción o `setTimeout(2500ms)`:

```tsx
// src/components/deferred-analytics.tsx (extracto)
if (metaPixelId) {
  const script = document.createElement('script');
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.async = true;
  // fbq('init', metaPixelId);
  // fbq('track', 'PageView');
}
```

Sigue siendo condicional a `NEXT_PUBLIC_META_PIXEL_ID`. Si no está
definida, no se monta nada y no hay errores.

### Implementación anterior (enero 2026 — histórica)

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

---

## 📚 Documentación Relacionada

- **[CHANGELOG.md](./CHANGELOG.md)** - v1.0.4 con fix completo del administrador
- **[CHANGELOG.md](./CHANGELOG.md)** - v1.0.4 con todos los cambios

---

**Commit**: `7d2a8e4` - fix: carga condicional de Meta Pixel  
**Fecha**: 20 de Enero 2026  
**Estado**: ✅ En producción
