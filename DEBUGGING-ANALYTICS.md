# Debugging Google Analytics - No Aparece Tráfico

## Problema
No aparece tráfico en Google Analytics en tiempo real cuando visitas el sitio.

## Causas Posibles y Soluciones

### 1. ⚠️ **Consentimiento de Cookies NO Aceptado** (MÁS PROBABLE)

Por defecto, Google Analytics está configurado en modo GDPR compliant con consentimiento **DENEGADO**. Esto significa que NO enviará datos hasta que el usuario acepte las cookies.

**Solución:**
1. Ve al sitio web
2. Busca el banner de cookies en la parte inferior
3. Haz clic en **"Aceptar todas"**
4. Recarga la página
5. Verifica en Google Analytics → Tiempo Real

**Verificar en consola del navegador:**
```javascript
// Verifica el estado de consentimiento
localStorage.getItem('furgocasa_cookie_consent')
// Debe devolver: "true"

localStorage.getItem('furgocasa_cookie_preferences')
// Debe devolver algo como: {"necessary":true,"analytics":true,...}

// Si devuelve null o analytics es false, debes aceptar las cookies
```

**Aceptar cookies manualmente (para testing):**
```javascript
localStorage.setItem('furgocasa_cookie_consent', 'true');
localStorage.setItem('furgocasa_cookie_preferences', JSON.stringify({
  necessary: true,
  analytics: true,
  functional: true,
  marketing: true
}));
// Luego recarga la página
window.location.reload();
```

### 2. 🔍 **Verificar que gtag Está Cargado**

Abre la consola del navegador (F12) y busca estos logs:

```
[Analytics] Inicializando Google Analytics: G-G5YLBN5XXZ
[Analytics] Script cargado correctamente
[Analytics] Enviando pageview: /
```

Si NO ves estos logs:
- Verifica que estás en una página pública (no /administrator)
- Verifica que no hay errores en la consola
- Verifica que el componente GoogleAnalytics está montado

**Comando de verificación:**
```javascript
// En la consola del navegador
window.gtag
// Debe devolver: function gtag(){...}

window.dataLayer
// Debe devolver: Array con eventos

// Si window.gtag es undefined, Analytics no se cargó
```

### 3. 🚫 **Bloqueadores de Anuncios**

Los bloqueadores de anuncios (AdBlock, uBlock Origin, etc.) bloquean Google Analytics.

**Solución:**
- Desactiva temporalmente el bloqueador de anuncios
- Añade el sitio a la lista blanca
- O prueba en modo incógnito sin extensiones

### 4. ⏰ **Google Analytics Tarda en Procesar**

A veces Google Analytics puede tardar hasta 5-10 minutos en mostrar datos en tiempo real, aunque normalmente es instantáneo.

**Solución:**
- Espera 5-10 minutos
- Navega por varias páginas
- Realiza varias acciones (clicks, scroll, etc.)

### 5. 🆔 **ID de Medición Incorrecto**

Verifica que el ID de Google Analytics sea correcto.

**Verificar:**
```javascript
// En la consola
window.dataLayer.find(event => event[0] === 'config')
// Debe incluir: G-G5YLBN5XXZ
```

**Código actual:**
```typescript
const GA_MEASUREMENT_ID = 'G-G5YLBN5XXZ';
```

Si el ID es incorrecto, edita `src/components/analytics.tsx` línea 7.

### 6. 🌐 **Propiedad de Analytics No Configurada**

Verifica en Google Analytics que:
- La propiedad `G-G5YLBN5XXZ` existe
- Está correctamente configurada
- No tiene filtros que excluyan tráfico

### 7. 🔧 **Script No Se Está Cargando**

Verifica en el Network tab de DevTools:

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Filtra por "gtag"
4. Recarga la página
5. Deberías ver peticiones a:
   - `https://www.googletagmanager.com/gtag/js?id=G-G5YLBN5XXZ`
   - `https://www.google-analytics.com/g/collect?...`

Si NO ves estas peticiones:
- El script no se está cargando
- Hay un bloqueador activo
- El consentimiento no está aceptado

## Script de Verificación Completa

Copia y pega esto en la consola del navegador:

```javascript
console.log('=== DEBUG GOOGLE ANALYTICS ===');
console.log('1. Pathname:', window.location.pathname);
console.log('2. ¿Es admin?:', window.location.pathname.startsWith('/administrator'));
console.log('3. gtag cargado:', !!window.gtag);
console.log('4. dataLayer:', window.dataLayer?.length || 0, 'eventos');
console.log('5. Cookie consent:', localStorage.getItem('furgocasa_cookie_consent'));
console.log('6. Cookie prefs:', localStorage.getItem('furgocasa_cookie_preferences'));

// Ver todo el dataLayer
console.log('7. dataLayer completo:');
console.table(window.dataLayer);

// Ver si hay eventos de Google Analytics
const gaEvents = window.dataLayer?.filter(e => 
  Array.isArray(e) && (e[0] === 'config' || e[0] === 'event')
);
console.log('8. Eventos GA:', gaEvents);

// Verificar consentimiento
const consentEvent = window.dataLayer?.find(e => 
  Array.isArray(e) && e[0] === 'consent'
);
console.log('9. Estado consentimiento:', consentEvent);

console.log('=== FIN DEBUG ===');
```

## Solución Rápida (Testing)

Si necesitas verificar que Analytics funciona **AHORA MISMO** sin esperar a que el usuario acepte cookies:

### Opción A: Aceptar Cookies Manualmente

```javascript
// 1. Ejecuta esto en la consola
localStorage.setItem('furgocasa_cookie_consent', 'true');
localStorage.setItem('furgocasa_cookie_preferences', JSON.stringify({
  necessary: true,
  analytics: true,
  functional: true,
  marketing: true
}));

// 2. Recarga la página
window.location.reload();

// 3. Verifica que gtag se carga
console.log('gtag:', window.gtag);
console.log('dataLayer:', window.dataLayer);
```

### Opción B: Modificar Temporalmente el Consentimiento por Defecto

**⚠️ SOLO PARA TESTING - NO DEJAR EN PRODUCCIÓN**

Edita `src/components/analytics.tsx` línea 52-60:

```typescript
// Cambiar de 'denied' a 'granted' TEMPORALMENTE
(window as any).gtag('consent', 'default', {
  'analytics_storage': 'granted', // ← Cambiar a 'granted'
  'ad_storage': 'granted',       // ← Cambiar a 'granted'
  // ... resto del código
});
```

**IMPORTANTE**: Después de verificar, vuelve a cambiar a `'denied'` para cumplir con GDPR.

## Verificar en Google Analytics

1. Ve a Google Analytics
2. Click en **Informes** → **Tiempo real** → **Visión general**
3. Debería aparecer "1 usuario activo en los últimos 30 minutos"
4. En el mapa debe aparecer tu ubicación
5. En "Vistas por Título de página" debe aparecer la página que estás visitando

## Checklist Final

- [ ] Banner de cookies visible en el sitio
- [ ] Cookies aceptadas (verifica localStorage)
- [ ] No hay bloqueadores de anuncios activos
- [ ] Estás en una página pública (NO /administrator)
- [ ] Consola muestra logs `[Analytics] ...`
- [ ] `window.gtag` está definido
- [ ] `window.dataLayer` tiene eventos
- [ ] Network tab muestra peticiones a googletagmanager.com
- [ ] ID de medición es correcto: G-G5YLBN5XXZ
- [ ] Esperado al menos 2-3 minutos

## Contacto con Soporte

Si después de todo esto no funciona:

1. Captura de pantalla de:
   - La consola del navegador (con logs de Analytics)
   - Network tab (mostrando peticiones a Google)
   - LocalStorage (furgocasa_cookie_consent y furgocasa_cookie_preferences)
   
2. Verifica en Google Analytics → Admin → Información de la propiedad:
   - ID de medición correcto
   - Flujo de datos configurado
   - Sin filtros activos

---

**Última actualización**: 20 de enero de 2026
