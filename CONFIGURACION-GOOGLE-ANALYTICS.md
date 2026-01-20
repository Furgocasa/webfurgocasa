# Configuración de Google Analytics

## ID de Medición
**G-G5YLBN5XXZ**

## ⚠️ IMPORTANTE - Exclusión de Páginas de Administrador

**CRÍTICO**: Google Analytics está configurado para **NO registrar ningún tráfico** en las páginas de administrador.

### Rutas Excluidas del Tracking
- `/administrator/*` - Todas las páginas del panel de administración
- `/admin/*` - Rutas alternativas de administración

### ¿Cómo Funciona?

1. **Componente Client-Side**: `src/components/analytics.tsx`
   - Usa `usePathname()` de Next.js para detectar la ruta actual
   - Verifica si la ruta comienza con `/administrator` o `/admin`
   - Si es una página de administrador:
     - NO carga el script de Google Analytics
     - NO envía pageviews
     - NO registra eventos
     - Imprime un mensaje en consola para debugging

2. **Verificación en Tiempo Real**
   ```typescript
   function isAdminPath(pathname: string | null): boolean {
     if (!pathname) return false;
     return pathname.startsWith('/administrator') || pathname.startsWith('/admin');
   }
   ```

3. **Doble Protección**
   - Al inicializar: No carga el script si estás en una página admin
   - En cada cambio de ruta: No envía pageview si navegas a una página admin

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
│   ├── analytics.tsx              # Componente principal de Analytics
│   └── cookies/
│       ├── cookie-context.tsx     # Provider de gestión de cookies
│       ├── cookie-banner.tsx      # Banner de consentimiento
│       └── index.ts
└── app/
    └── layout.tsx                 # Layout raíz con GoogleAnalytics
```

## Mantenimiento

### Cambiar el ID de Google Analytics
Edita `src/components/analytics.tsx`:
```typescript
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
```

### Añadir Más Rutas Excluidas
Modifica la función `isAdminPath()`:
```typescript
function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/administrator') 
      || pathname.startsWith('/admin')
      || pathname.startsWith('/dashboard'); // Nueva ruta
}
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
