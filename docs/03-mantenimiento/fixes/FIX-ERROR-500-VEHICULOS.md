# FIX CRÍTICO: Error 500 en Páginas de Vehículos

**Fecha:** 2026-01-23
**Estado:** ✅ RESUELTO
**Prioridad:** 🔴 CRÍTICA

## 🚨 Problema Identificado

Las páginas de detalle de vehículos de **alquiler** (`/es/vehiculos/[slug]`) y de **venta** (`/es/ventas/[slug]`) devolvían error 500 en producción.

**URLs afectadas:**
- https://www.furgocasa.com/es/vehiculos/dreamer-d55-fun
- https://www.furgocasa.com/es/ventas/sunlight-cliff-600-adventure

## 🔍 Causas Identificadas (múltiples)

### 1. Cliente Supabase incorrecto para Server Components

El archivo `queries.ts` importaba `supabase` de `./client.ts`, que usa `createBrowserClient` de `@supabase/ssr`. Este cliente está diseñado **solo para el navegador** y falla en Server Components.

```typescript
// ❌ ANTES - client.ts usaba createBrowserClient (solo navegador)
import { createBrowserClient } from '@supabase/ssr';
export const supabase = createBrowserClient(...);

// ❌ queries.ts importaba el cliente incorrecto
import { supabase } from './client';
```

### 2. Función headers() fallando en generación estática

En Next.js 15, `headers()` puede fallar durante la generación estática (ISR/SSG) porque los headers HTTP no existen en ese contexto.

### 3. Problemas de caché ISR

La configuración de ISR (`revalidate = 3600`) junto con `generateStaticParams` causaba conflictos con el middleware de i18n.

## ✅ Solución Final Implementada

### 1. Cliente Supabase universal en queries.ts

```typescript
// ✅ AHORA - queries.ts crea su propio cliente universal
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 2. Try-catch para headers()

```typescript
// ✅ Fallback para cuando headers() no está disponible
let locale: Locale = 'es';
try {
  const headersList = await headers();
  locale = (headersList.get('x-detected-locale') || 'es') as Locale;
} catch {
  locale = 'es';
}
```

### 3. Renderizado 100% dinámico (solución definitiva)

```typescript
// ✅ Forzar renderizado dinámico - sin caché, sin ISR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// generateStaticParams deshabilitado
```

### 4. Middleware actualizado

Añadidas exclusiones para archivos estáticos que causaban redirecciones:
- `/sw-admin.js`
- `/workbox-*`
- `/manifest.json`
- `/icon-*`
- etc.

## 📝 Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `src/lib/supabase/queries.ts` | Cliente universal `@supabase/supabase-js` |
| `src/app/vehiculos/[slug]/page.tsx` | `dynamic = 'force-dynamic'`, try-catch headers |
| `src/app/ventas/[slug]/page.tsx` | `dynamic = 'force-dynamic'`, try-catch headers |
| `src/middleware.ts` | Exclusiones para archivos estáticos |

## 🚀 Commits

| Commit | Descripción |
|--------|-------------|
| `8cd137f` | Fix inicial queries.ts |
| `f65d844` | Fix ventas cliente público |
| `2478d07` | Cliente supabase-js universal |
| `8361e91` | Excluir sw-admin.js, añadir dynamicParams |
| `99017d9` | Excluir workbox, manifests, iconos |
| `dfe7b04` | Try-catch para headers() |
| `07b0026` | **Solución final: force-dynamic** |

## 📚 Lecciones Aprendidas

### Next.js 15 + Supabase SSR

1. **NO usar `createBrowserClient`** en Server Components
2. **Usar `createClient` de `@supabase/supabase-js`** para queries públicas
3. **Envolver `headers()` en try-catch** si la página puede ser estática

### ISR vs Dynamic

- **ISR** (`revalidate > 0`): Mejor para páginas que no dependen de headers/cookies
- **Dynamic** (`force-dynamic`): Necesario cuando se usan headers del middleware

### Middleware i18n

- Excluir **todos** los archivos estáticos: SW, workbox, manifests, iconos
- Los Service Workers **no toleran redirecciones**

## ✅ Estado Final

- ✅ `/es/vehiculos/[slug]` - Funciona (renderizado dinámico)
- ✅ `/es/ventas/[slug]` - Funciona (renderizado dinámico)
- ✅ Service Worker admin - Sin errores de redirect
- ✅ Workbox - Sin errores de precaching

## 🎯 Impacto en Performance

Las páginas de detalle ahora son **dinámicas** (no cacheadas). Esto significa:
- **Pros:** Siempre datos frescos, sin problemas de caché
- **Contras:** Ligeramente más lentas (~100-200ms más)

Las páginas importantes para SEO (home, lista vehículos, blog, localizaciones) **siguen siendo estáticas/ISR** para máximo rendimiento.

---

**Verificado:** 2026-01-23 13:30
**URLs de prueba:**
- https://www.furgocasa.com/es/vehiculos/dreamer-d55-fun ✅
- https://www.furgocasa.com/es/ventas/sunlight-cliff-600-adventure ✅
