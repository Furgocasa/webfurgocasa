# Configuración de Google Analytics

## ID de Medición
**G-G5YLBN5XXZ**

## ⚠️ IMPORTANTE - Exclusión Total de Páginas de Administrador

**CRÍTICO**: Los scripts de Google Analytics **NO SE CARGAN** en las páginas de administrador.

### Cómo Funciona la Exclusión

1. **Componente `AnalyticsScripts` (Client-Side)**:
   - Detecta la ruta actual usando `usePathname()`
   - Si la ruta comienza con `/administrator` o `/admin`:
     - NO renderiza ningún script de Google Analytics
     - NO carga gtag.js
     - NO inicializa dataLayer
   - Solo en páginas públicas se cargan los scripts

2. **Componente `GoogleAnalytics` (Tracking de Navegación)**:
   - Detecta cambios de ruta
   - Si es una ruta de admin, NO envía pageviews
   - Solo trackea navegación en páginas públicas

### Verificación de la Exclusión

**En páginas de administrador:**
- ✅ NO se carga el script de gtag.js
- ✅ NO existe `window.gtag`
- ✅ NO existe `window.dataLayer` (o está vacío)
- ✅ NO hay peticiones a googletagmanager.com
- ✅ Consola muestra: "Ruta de administrador detectada. Scripts de Analytics NO se cargarán."

**En páginas públicas:**
- ✅ Se carga gtag.js
- ✅ Se inicializa Analytics
- ✅ Se envían pageviews
- ✅ Consola muestra: "Ruta pública detectada. Cargando scripts de Analytics..."

## Cumplimiento GDPR

El sistema incluye gestión de consentimiento:

### Modo por Defecto (Sin Consentimiento)
```javascript
gtag('consent', 'default', {
  'analytics_storage': 'denied',      // No almacenar cookies de analytics
  'ad_storage': 'denied',             // No almacenar cookies de publicidad
  'ad_user_data': 'denied',           // No usar datos de usuario para ads
  'ad_personalization': 'denied',     // No personalizar ads
  'functionality_storage': 'denied',  // No cookies funcionales
  'personalization_storage': 'denied',// No cookies de personalización
  'security_storage': 'granted'       // Solo cookies de seguridad
});
```

### Cuando el Usuario Acepta
El componente `CookieProvider` actualiza el consentimiento:
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

## Eventos Personalizados

Hook disponible para trackear eventos:

```typescript
import { useAnalyticsEvent } from '@/components/analytics';

function MiComponente() {
  const { trackEvent } = useAnalyticsEvent();
  
  const handleReserva = () => {
    trackEvent('click', 'reservas', 'boton_reservar');
  };
  
  return <button onClick={handleReserva}>Reservar</button>;
}
```

**Nota**: Los eventos también son bloqueados automáticamente en páginas de administrador.

## Verificación de Funcionamiento

### En el Navegador (Chrome DevTools)

1. **Consola del Navegador**:
   - Páginas públicas: `[Analytics] Enviando pageview: /`
   - Páginas admin: `[Analytics] Página de administrador detectada. Analytics NO se cargará.`

2. **Network Tab**:
   - Páginas públicas: Verás peticiones a `googletagmanager.com`
   - Páginas admin: NO debe haber peticiones a Google Analytics

3. **Verificar dataLayer**:
   ```javascript
   // En la consola de páginas públicas
   window.dataLayer
   // Debe mostrar un array con eventos
   
   // En la consola de páginas admin
   window.dataLayer
   // Debe ser undefined o vacío
   ```

### En Google Analytics

1. **Tiempo Real**:
   - Ve a Analytics → Informes → Tiempo Real
   - Navega por páginas públicas: Verás tráfico
   - Navega por `/administrator/*`: NO debe aparecer tráfico

2. **Debug Mode** (opcional):
   ```javascript
   gtag('config', 'G-G5YLBN5XXZ', {
     'debug_mode': true
   });
   ```

## Estructura de Archivos

```
src/
├── components/
│   ├── analytics-scripts.tsx      # Scripts de GA (solo páginas públicas)
│   ├── analytics.tsx              # Tracking de navegación
│   ├── analytics-debug.tsx        # Debug visual (desarrollo)
│   └── cookies/
│       ├── cookie-context.tsx     # Provider de gestión de cookies
│       ├── cookie-banner.tsx      # Banner de consentimiento
│       └── index.ts
└── app/
    └── layout.tsx                 # Layout raíz con AnalyticsScripts
```

## Mantenimiento

### Cambiar el ID de Google Analytics
Edita `src/components/analytics.tsx`:
```typescript
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
```

### Añadir Más Rutas Excluidas
Modifica el componente `AnalyticsScripts`:
```typescript
const isAdminPage = pathname?.startsWith('/administrator') 
                 || pathname?.startsWith('/admin')
                 || pathname?.startsWith('/dashboard'); // Nueva ruta
```

### Deshabilitar Logs de Consola (Producción)
Quita o comenta los `console.log()` en `src/components/analytics.tsx`.

## Solución de Problemas

### Problema: Analytics no funciona en ninguna página
- Verifica el ID de medición `G-G5YLBN5XXZ`
- Revisa las cookies aceptadas en `localStorage`
- Comprueba que no hay bloqueadores de ads activos

### Problema: Analytics funciona en páginas admin
- Revisa que `pathname` devuelve la ruta correcta
- Verifica los logs de consola
- Comprueba que el componente `GoogleAnalytics` está montado correctamente

### Problema: Las cookies no se actualizan
- Limpia localStorage: `localStorage.clear()`
- Borra las cookies del navegador
- Recarga la página

## Seguridad

✅ **Implementado**:
- Exclusión total de páginas admin del tracking
- Modo de consentimiento GDPR por defecto (denied)
- Gestión de preferencias de usuario
- Eliminación de cookies cuando se deniega consentimiento

❌ **NO se trackea**:
- Ninguna actividad en `/administrator/*`
- Ninguna actividad en `/admin/*`
- Datos personales sin consentimiento
- Eventos antes de aceptar cookies

## Testing

### Test Manual
1. Navega a `https://www.furgocasa.com`
2. Abre DevTools → Console
3. Acepta cookies de analytics
4. Navega por varias páginas públicas → Ver logs de pageview
5. Navega a `/administrator/login`
6. Verifica: "Página de administrador detectada. Analytics NO se cargará."
7. En Google Analytics → Tiempo Real → NO debe aparecer la visita admin

### Test en Google Tag Assistant
1. Instala [Tag Assistant](https://tagassistant.google.com/)
2. Activa el debugging
3. Navega por el sitio
4. Verifica que GA se activa solo en páginas públicas

## Recursos

- [Google Analytics 4 - Consent Mode](https://support.google.com/analytics/answer/9976101)
- [Next.js Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [GDPR Compliance](https://support.google.com/analytics/answer/9019185)

---

**Última actualización**: 20 de enero de 2026  
**ID de Medición**: G-G5YLBN5XXZ  
**Estado**: ✅ Implementado y probado
