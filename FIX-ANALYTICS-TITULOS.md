# Fix: Títulos de Página Ausentes en Analytics

**Fecha**: 25 de enero de 2026
**Estado**: ✅ Resuelto

## Problema
Aunque se solucionó el problema de duplicados, Analytics no estaba recibiendo los **Títulos de Página** (Page Titles) correctamente. En los informes aparecía "(not set)" o el título de la página anterior.

## Causa Técnica
En aplicaciones Next.js (Single Page Application), cuando el usuario navega a una nueva página:
1. La ruta (`pathname`) cambia inmediatamente.
2. Google Analytics disparaba el evento `page_view` al detectar el cambio de ruta.
3. **PERO** el `document.title` (metadatos) se actualiza de forma asíncrona unos milisegundos *después*.

Resultado: Analytics enviaba el evento antes de que el nuevo título estuviera listo.

## Solución Implementada

Se modificó `src/components/analytics.tsx` para:

1. **Añadir un retraso intencional** (`setTimeout` de 100ms) al detectar el cambio de ruta.
2. **Capturar explícitamente** el `document.title` después de ese retraso.
3. **Enviar el parámetro `page_title`** manualmente en la configuración de Analytics.

### Código Modificado

```typescript
// src/components/analytics.tsx

if (typeof window !== 'undefined' && (window as any).gtag && pathname) {
  // Esperar 100ms para asegurar que Next.js ha actualizado el <title>
  setTimeout(() => {
    const currentTitle = document.title;
    console.log('[Analytics] Enviando pageview:', pathname, 'Title:', currentTitle);
    
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname,
      page_title: currentTitle || 'Furgocasa', // Fallback
    });
  }, 100);
}
```

## Verificación

1. Abre la consola del navegador (F12).
2. Navega entre páginas públicas.
3. Busca el log: `[Analytics] Enviando pageview: /ruta Title: Título Correcto`.
4. En Google Analytics > Tiempo Real > "Vistas por Título de página", ahora deberían aparecer los nombres correctos (ej: "Alquiler de Autocaravanas...", "Contacto", etc.).

## ¿Envía "Toda" la información?

Sí. Al usar el comando `config`, Google Analytics envía automáticamente:
- `page_location` (URL completa)
- `page_path` (Ruta, que ahora forzamos)
- `page_title` (Título, que ahora forzamos)
- `language` (Idioma del navegador)
- `screen_resolution` (Resolución)
- `user_agent` (Dispositivo/Navegador)
- Referrer (Origen de la visita)

Ahora la captura de datos es completa y sincronizada.
