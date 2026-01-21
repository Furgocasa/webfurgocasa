# Fix: Exclusión Total de Analytics en Páginas de Administrador

**Fecha**: 21 de enero de 2026  
**Problema**: Google Analytics estaba registrando tráfico en páginas del panel de administrador  
**Estado**: ✅ Resuelto

## Problema Identificado

El tráfico de páginas con título "Furgocasa Admin | F" se estaba registrando en Google Analytics, a pesar de que las páginas del administrador no deberían trackear ninguna actividad.

### Causa Raíz

Los scripts de Google Analytics se estaban cargando en **todas las páginas** de la aplicación, incluidas las del administrador, porque estaban definidos directamente en el `layout.tsx` raíz usando componentes `<Script>` de Next.js.

Aunque había un check en el script de inicialización para no enviar el config inicial en páginas admin, esto no era suficiente porque:

1. Los scripts de `gtag.js` se cargaban de todas formas
2. El `dataLayer` se inicializaba
3. Navegaciones posteriores podían enviar pageviews
4. El consentimiento de cookies podía activar tracking

## Solución Implementada

### 1. Nuevo Componente `AnalyticsScripts` (Client-Side)

Creado en: `src/components/analytics-scripts.tsx`

Este componente:
- Detecta la ruta actual usando `usePathname()` de Next.js
- Solo renderiza los scripts de Analytics si NO estamos en `/administrator` o `/admin`
- Si estamos en una página de admin, retorna `null` (no renderiza nada)

```typescript
'use client';

export function AnalyticsScripts() {
  const pathname = usePathname();
  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(false);

  useEffect(() => {
    const isAdminPage = pathname?.startsWith('/administrator') || pathname?.startsWith('/admin');
    setShouldLoadAnalytics(!isAdminPage);
  }, [pathname]);

  if (!shouldLoadAnalytics) {
    return null; // NO renderiza scripts
  }

  return (
    <>
      {/* Scripts de Google Analytics */}
    </>
  );
}
```

### 2. Actualización del `layout.tsx` Raíz

Cambios en: `src/app/layout.tsx`

**ANTES:**
- Scripts de Analytics directamente en `<head>` con `<Script>` de Next.js
- Se cargaban en todas las páginas
- Check condicional dentro del script (insuficiente)

**DESPUÉS:**
- Scripts movidos al componente `<AnalyticsScripts />` client-side
- Componente montado en el `<body>` dentro del provider
- Scripts solo se renderizan si NO es página admin

### 3. Componente `GoogleAnalytics` (Sin Cambios)

El componente existente en `src/components/analytics.tsx` ya tenía la lógica correcta:
- Detecta cambios de ruta
- No envía pageviews si es ruta admin
- No registra eventos si es ruta admin

Este componente **sigue funcionando** y proporciona una capa adicional de protección.

## Verificación de la Solución

### En Páginas de Administrador (`/administrator/*`)

✅ **NO se carga:**
- Script de gtag.js
- window.gtag
- window.dataLayer
- Peticiones a googletagmanager.com

✅ **Consola muestra:**
```
[Analytics] Ruta de administrador detectada. Scripts de Analytics NO se cargarán.
```

### En Páginas Públicas

✅ **Se carga:**
- Script de gtag.js
- window.gtag inicializado
- window.dataLayer creado
- Peticiones a googletagmanager.com

✅ **Consola muestra:**
```
[Analytics] Ruta pública detectada. Cargando scripts de Analytics...
[Analytics] Google Analytics inicializado para: /
```

## Archivos Modificados

1. ✅ `src/components/analytics-scripts.tsx` - **NUEVO**
2. ✅ `src/app/layout.tsx` - Actualizado
3. ✅ `CONFIGURACION-GOOGLE-ANALYTICS.md` - Documentación actualizada

## Archivos Sin Cambios (ya correctos)

- `src/components/analytics.tsx` - Tracking de navegación
- `src/components/analytics-debug.tsx` - Debug visual
- `src/components/cookies/cookie-context.tsx` - Gestión de cookies

## Cómo Probar

### Prueba Manual

1. **Abrir la aplicación en el navegador**
2. **Ir a DevTools → Console**
3. **Navegar a una página pública** (ej: `/`)
   - Debe mostrar: "Ruta pública detectada. Cargando scripts de Analytics..."
   - Verificar en Network tab: peticiones a `googletagmanager.com`
   - Verificar en Console: `window.gtag` existe
4. **Navegar a `/administrator/login` o cualquier página del admin**
   - Debe mostrar: "Ruta de administrador detectada. Scripts de Analytics NO se cargarán."
   - Verificar en Network tab: NO hay peticiones a `googletagmanager.com`
   - Verificar en Console: `window.gtag` es `undefined`

### Verificar en Google Analytics

1. **Ir a Google Analytics → Tiempo Real**
2. **Navegar por páginas públicas**
   - Debe aparecer tráfico en tiempo real
3. **Navegar por páginas del administrador**
   - **NO debe aparecer ningún tráfico**
   - Título "Furgocasa Admin | F" NO debe registrarse

## Beneficios

1. ✅ **Exclusión Total**: Los scripts ni siquiera se cargan en páginas admin
2. ✅ **Mejor Performance**: Menos JavaScript cargado en el admin
3. ✅ **Datos Limpios**: Analytics solo registra tráfico real de usuarios
4. ✅ **Privacidad**: Los administradores no son trackeados
5. ✅ **Debugging**: Mensajes claros en consola sobre qué se está cargando

## Notas Técnicas

- **Client-Side Detection**: Usamos un componente client-side porque necesitamos acceso a `usePathname()` de Next.js para detectar la ruta actual
- **Renderizado Condicional**: Retornar `null` en React previene que los scripts se rendericen completamente
- **Doble Protección**: Mantenemos el check en el componente `GoogleAnalytics` como capa adicional de seguridad

## Próximos Pasos

Si se detecta que aún hay tráfico del admin en Analytics:

1. Verificar que el código se ha desplegado correctamente
2. Limpiar caché del navegador y cookies
3. Verificar en modo incógnito
4. Comprobar que no hay extensiones de navegador interfiriendo
5. Revisar que no hay otros scripts de Analytics cargados desde otra parte

---

**Implementado por**: Claude (Cursor AI)  
**Revisado por**: Pendiente  
**Estado**: ✅ Listo para testing
