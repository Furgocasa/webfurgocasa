# Fix: Visitas Duplicadas en Google Analytics 4

**Fecha**: 27 de enero de 2026  
**Estado**: ✅ Resuelto  
**Versión**: v4.4.0+

---

## Problema Detectado

Después de la migración a `@next/third-parties/google` (v4.4.0), se detectó que las páginas del blog (y todas las páginas públicas) registraban **2 pageviews por cada navegación interna** (SPA).

### Síntomas

| Escenario | Comportamiento Esperado | Comportamiento Real |
|-----------|------------------------|---------------------|
| Landing directo en `/es/blog/rutas/algarve` | 1 pageview | 1 pageview ✅ |
| Navegar de `/es/blog` → `/es/blog/rutas/algarve` | 1 pageview | **2 pageviews** ❌ |
| Navegar entre artículos del blog | 1 pageview por artículo | **2 pageviews por artículo** ❌ |

---

## Causa Raíz

El problema NO estaba en el código de Furgocasa, sino en una **configuración de Google Analytics 4** llamada **"Enhanced Measurement"** (Medición mejorada).

### ¿Por qué ocurría el doble tracking?

```
┌─────────────────────────────────────────────────────────────────┐
│ Usuario navega de /es/blog a /es/blog/rutas/algarve            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Next.js <Link> navega del lado del cliente (SPA)           │
│                              ↓                                  │
│  2. Next.js actualiza la URL usando History API                │
│                              ↓                                  │
│  3. 🔴 GA4 Enhanced Measurement detecta cambio de historial    │
│     → ENVÍA page_view automático (#1)                          │
│                              ↓                                  │
│  4. 🔴 @next/third-parties también detecta navegación          │
│     → ENVÍA page_view (#2)                                     │
│                              ↓                                  │
│  5. RESULTADO: 2 pageviews por 1 visita real                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Configuración problemática

Google Analytics 4 tiene activada por defecto la opción:

> **"La página cambia en función de los eventos del historial de navegación"**  
> (Page changes based on browser history events)

Esta opción hace que GA4 escuche los cambios en `window.history` y envíe pageviews automáticamente, duplicando los que ya envía `@next/third-parties/google`.

---

## Solución: Configuración en Google Analytics 4

### Paso 1: Acceder a la configuración

1. Google Analytics → **Administrador**
2. Sección **"Recogida y modificación de datos"** → **Flujos de datos**
3. Seleccionar el flujo web: **Furgocasa.com** (ID: `G-G5YLBN5XXZ`)

### Paso 2: Configurar Medición mejorada

1. Buscar la sección **"Medición mejorada"** (Enhanced measurement)
2. Hacer click en **"Mostrar configuración avanzada"** (bajo "Vistas de página")
3. Verificar la configuración:

```
☑️ Cargas de página                                    ← DEBE estar ACTIVADO
☐  La página cambia en función de los eventos del      ← DEBE estar DESACTIVADO ✅
   historial de navegación
```

### Paso 3: Guardar

Hacer click en **"Guardar"** en la esquina superior derecha.

---

## Resultado Después del Fix

| Escenario | Antes | Después |
|-----------|-------|---------|
| Landing directo | 1 pageview | 1 pageview ✅ |
| Navegación SPA (blog) | **2 pageviews** ❌ | 1 pageview ✅ |
| Navegación entre páginas | **2 pageviews** ❌ | 1 pageview ✅ |
| Eventos registrados | Correcto | Correcto ✅ |
| Títulos de página | Correcto | Correcto ✅ |

---

## Verificación en Tiempo Real

Para confirmar que funciona correctamente:

1. Ir a **Informes** → **Tiempo real** en Google Analytics
2. Abrir la web en una ventana de incógnito
3. Navegar por varias páginas del blog
4. Verificar en "Vistas por Título de página" que cada página aparece **1 vez** por navegación

### Ejemplo de verificación correcta:

```
Vistas por Título de página:
├── Blog - Furgocasa                        → 1  ✅
├── Rutas - Blog | Furgocasa                → 1  ✅
├── Algarve en Camper - Furgocasa           → 1  ✅
└── Costa Brava en Autocaravana - Furgocasa → 1  ✅

Total: 4 vistas = 4 páginas visitadas ✅
```

---

## Por Qué Esta Solución es Correcta

### Alternativas descartadas

❌ **Desactivar `@next/third-parties/google`**: Perderíamos toda la estabilidad y características de la librería oficial.

❌ **Agregar `send_page_view: false`**: No es posible configurar esto en `@next/third-parties/google` sin perder funcionalidad.

❌ **Implementar tracking manual**: Ya intentamos esto en v1-v7 y fue problemático (títulos, fbclid, race conditions).

### Por qué funciona

✅ **GA4 Enhanced Measurement OFF**: Desactivamos solo el tracking automático por historial.

✅ **@next/third-parties se encarga**: La librería oficial maneja correctamente los pageviews en navegaciones SPA.

✅ **Landing pages siguen funcionando**: "Cargas de página" sigue activo, registrando correctamente las primeras visitas.

---

## Impacto en Otras Mediciones

Esta configuración **NO afecta** a:

| Medición | Estado |
|----------|--------|
| ✅ Cargas de página iniciales (landing) | Funcionando |
| ✅ Eventos personalizados | Funcionando |
| ✅ Desplazamientos (scroll) | Funcionando |
| ✅ Clics salientes | Funcionando |
| ✅ Búsquedas en el sitio | Funcionando |
| ✅ Interacciones con vídeos | Funcionando |
| ✅ Descargas de archivos | Funcionando |

Solo afecta al tracking **duplicado** de navegaciones SPA.

---

## Documentos Relacionados

- `RESUMEN-MIGRACION-ANALYTICS-v4.4.0.md` - Migración a @next/third-parties
- `MIGRACION-NEXT-THIRD-PARTIES.md` - Guía de migración completa
- `docs/02-desarrollo/analytics/CONFIGURACION-GOOGLE-ANALYTICS.md` - Configuración general

---

## Referencias Técnicas

- [Stack Overflow: Getting redundant pageview events with GA4 and NextJS](https://stackoverflow.com/questions/65460306/getting-redundant-pageview-events-with-ga4-and-nextjs)
- [Next.js Third Parties - Google Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics)
- [Google Analytics 4 - Enhanced Measurement](https://support.google.com/analytics/answer/9216061)

---

**Última actualización**: 27 de enero de 2026  
**ID de Medición**: G-G5YLBN5XXZ  
**Estado**: ✅ Resuelto y funcionando correctamente  
**Versión**: v4.4.0+
