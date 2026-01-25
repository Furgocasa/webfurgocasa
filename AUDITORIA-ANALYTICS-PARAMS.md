# Auditoría V4: Tracking de URLs con Parámetros (Facebook)

**Fecha**: 25 de enero de 2026
**Estado**: ✅ Implementado (V4)

## Problema Detectado
El usuario reportó que las visitas desde Facebook (con `fbclid`) no se estaban registrando correctamente en los informes de Analytics.

### Diagnóstico Técnico
1. **Next.js `usePathname()`**: Devuelve la ruta limpia (ej: `/blog`), eliminando los query parameters (`?fbclid=...`).
2. **Analytics `page_path`**: Estábamos enviando solo el `pathname` limpio.
3. **Consecuencia**: 
   - GA4 perdía la visibilidad explícita de los parámetros en el informe de "Páginas".
   - Si la navegación solo cambiaba los parámetros (ej: filtros o campañas), no se disparaba un nuevo evento `page_view`.

## Solución V4 Implementada

Se ha actualizado `src/components/analytics.tsx` para incluir el manejo completo de URLs:

### 1. Inclusión de `useSearchParams`
Ahora escuchamos tanto `pathname` como `searchParams`.
- **Antes**: Solo detectaba cambios de ruta base (`/blog` -> `/vehiculos`).
- **Ahora**: Detecta cambios de parámetros (`/vehiculos` -> `/vehiculos?tipo=camper`).

### 2. Construcción de URL Completa
Enviamos a Google Analytics la URL real completa:
```javascript
const fullPath = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');
// Resultado: /blog/articulo?fbclid=IwY2...
```

### 3. Configuración Explícita de GA4
En cada evento de navegación enviamos:
- `page_path`: Ruta completa con parámetros (para que aparezca en informes).
- `page_location`: URL absoluta del navegador (para atribución de fuente/medio).

### 4. Protección con `Suspense`
Dado que `useSearchParams` requiere renderizado en cliente en Next.js App Router, hemos envuelto el componente en `<Suspense fallback={null}>` para evitar errores de compilación o deoptimizaciones en el `RootLayout`.

## Verificación

Para comprobar que funciona:
1. Abre la consola del navegador.
2. Añade un parámetro a la URL actual, ej: `?prueba=123` y pulsa Enter.
3. Busca el log:
   `[Analytics] 📡 Enviando (...) | URL: /tu-ruta?prueba=123 | Title: ...`

Si ves los parámetros en el log "URL", entonces Analytics los está recibiendo correctamente.
