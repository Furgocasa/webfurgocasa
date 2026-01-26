# Configuración de Google Analytics

## ⚠️ DOCUMENTO OBSOLETO - Implementación Manual

**Fecha de obsolescencia**: 25 de enero de 2026  
**Razón**: Migración a `@next/third-parties/google` (librería oficial de Next.js)

**👉 Documentos actuales:**
- `MIGRACION-NEXT-THIRD-PARTIES.md` - Guía de migración
- `RESUMEN-MIGRACION-ANALYTICS-v4.4.0.md` - Resumen ejecutivo
- `FIX-ANALYTICS-VISITAS-DUPLICADAS.md` - Fix de visitas duplicadas (27/01/2026)

---

## ID de Medición
**G-G5YLBN5XXZ**

## Nueva Implementación (v4.4.0)

Desde la versión 4.4.0, la aplicación utiliza la librería oficial de Next.js para Google Analytics:

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-G5YLBN5XXZ" />
      </body>
    </html>
  )
}
```

### Ventajas de la Nueva Implementación
- ✅ **Estabilidad garantizada**: Mantenida por Vercel/Google
- ✅ **Sin race conditions**: Gestión automática de carga asíncrona
- ✅ **Captura automática**: Títulos, URLs completas (incluido `fbclid`)
- ✅ **Menos código**: 1 línea vs 300+ líneas custom
- ✅ **Tracking correcto**: Sin visitas duplicadas (tras configuración GA4)

### Configuración Requerida en GA4

**⚠️ IMPORTANTE**: Para evitar visitas duplicadas, debes configurar GA4:

1. **Admin** → **Flujos de datos** → Selecciona tu flujo (G-G5YLBN5XXZ)
2. **Medición mejorada** → **Mostrar configuración avanzada**
3. **Desactivar**: "La página cambia en función de los eventos del historial de navegación"
4. **Mantener activo**: "Cargas de página"

📖 **Ver guía detallada:** `FIX-ANALYTICS-VISITAS-DUPLICADAS.md`

### Desventajas
- ⚠️ **No hay exclusión del admin**: Los scripts se cargan en todas las páginas
- **Solución recomendada**: Configurar filtro por IP en Google Analytics

### Configurar Filtro por IP (Recomendado)
1. Google Analytics → Admin → Flujos de datos → Tu flujo
2. Configuración de etiquetas → Mostrar todo
3. Definir filtro de IP interno
4. Añadir tu IP de oficina/casa

---

## 📜 Documentación Histórica (Implementación Manual)

### ⚠️ IMPORTANTE - Exclusión Total de Páginas de Administrador (YA NO APLICA)

**NOTA**: La exclusión manual del admin ya NO está implementada en la nueva versión.

La siguiente información se mantiene solo como referencia histórica de cómo funcionaba la implementación manual (v1.0.0 - v4.3.0).

### Cómo Funcionaba la Exclusión Manual (Obsoleto)

1. **Componente `AnalyticsScripts` (Client-Side)**:
   - Detectaba la ruta actual usando `usePathname()`
   - Si la ruta comenzaba con `/administrator` o `/admin`:
     - NO renderizaba ningún script de Google Analytics
     - NO cargaba gtag.js
     - NO inicializaba dataLayer
   - Solo en páginas públicas se cargaban los scripts

2. **Componente `GoogleAnalytics` (Tracking de Navegación)**:
   - Detectaba cambios de ruta
   - Si era una ruta de admin, NO enviaba pageviews
   - Solo trackeaba navegación en páginas públicas

### Archivos Obsoletos (Conservados para Historial)

```
src/components/
├── analytics-scripts.tsx      # ❌ Ya NO se usa (exclusión manual)
├── analytics.tsx              # ❌ Ya NO se usa (tracking manual con V1-V7)
└── analytics-debug.tsx        # ✅ Se mantiene (útil en desarrollo)
```

### Documentación Histórica de Iteraciones

Los siguientes documentos explican los problemas que se intentaron resolver con la implementación manual:

- `AUDITORIA-ANALYTICS-TITULOS.md` - V1: Problema de títulos faltantes
- `FIX-ANALYTICS-TITULOS.md` - V2: MutationObserver para títulos
- `AUDITORIA-ANALYTICS-PARAMS.md` - V4: Captura de parámetros `fbclid`
- `AUDITORIA-ANALYTICS-INITIAL-LOAD.md` - V5: Race conditions en carga inicial
- `AUDITORIA-ANALYTICS-URL-TRIMMING.md` - V6: Recorte de URLs largas
- `AUDITORIA-ANALYTICS-URL-TRIMMING-V7.md` - V7: Recorte agresivo de `fbclid`

**Todos estos problemas están ahora resueltos** con la librería oficial `@next/third-parties/google`.

---

## Cumplimiento GDPR

El sistema incluye gestión de consentimiento con `CookieProvider`:

### Modo por Defecto (Sin Consentimiento)
```javascript
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted'
});
```

### Cuando el Usuario Acepta
```javascript
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});
```

## Integración con el Sistema de Cookies

El sistema de cookies (`src/components/cookies/cookie-context.tsx`) gestiona:

1. **Banner de Consentimiento**: Primera visita al sitio
2. **Preferencias Guardadas**: localStorage
3. **Actualización de Consentimiento**: Comunica a Google Analytics

### Funciones Clave
- `acceptAll()`: Acepta todas las cookies incluyendo analytics
- `rejectAll()`: Solo cookies necesarias, analytics denegado
- `updatePreferences()`: Preferencias personalizadas

## Verificación de Funcionamiento

### En el Navegador (Chrome DevTools)

1. **Consola del Navegador**:
   - Debe verse el script de Google Tag Manager cargándose
   - Verifica `window.gtag` existe

2. **Network Tab**:
   - Verás peticiones a `googletagmanager.com`
   - Incluye tanto páginas públicas como admin (nueva implementación)

3. **Verificar dataLayer**:
   ```javascript
   // En la consola
   window.dataLayer
   // Debe mostrar un array con eventos
   ```

### En Google Analytics

1. **Tiempo Real**:
   - Ve a Analytics → Informes → Tiempo Real
   - Navega por el sitio: Verás tráfico en todas las páginas
   - **Nota**: Incluye navegación en admin (filtrar por IP recomendado)

2. **Debug Mode** (opcional):
   ```javascript
   gtag('config', 'G-G5YLBN5XXZ', {
     'debug_mode': true
   });
   ```

## Mantenimiento

### Cambiar el ID de Google Analytics
Edita `src/app/layout.tsx`:
```tsx
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

## Solución de Problemas

### Problema: Analytics no funciona en ninguna página
- Verifica el ID de medición `G-G5YLBN5XXZ`
- Revisa las cookies aceptadas en `localStorage`
- Comprueba que no hay bloqueadores de ads activos

### Problema: Las cookies no se actualizan
- Limpia localStorage: `localStorage.clear()`
- Borra las cookies del navegador
- Recarga la página

## Recursos

- [Google Analytics 4 - Consent Mode](https://support.google.com/analytics/answer/9976101)
- [Next.js Third Parties - Google Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics)
- [@next/third-parties Documentation](https://www.npmjs.com/package/@next/third-parties)
- [GDPR Compliance](https://support.google.com/analytics/answer/9019185)

---

**Última actualización**: 27 de enero de 2026  
**ID de Medición**: G-G5YLBN5XXZ  
**Estado**: ⚠️ Obsoleto (Migrado a @next/third-parties)  
**Versión actual**: v4.4.0+
