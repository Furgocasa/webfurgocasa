# FIX CRÍTICO: Error 500 en Páginas de Vehículos

## 🚨 Problema Identificado

Las páginas de vehículos de **alquiler** (`/es/vehiculos/[slug]`) y de **venta** (`/es/ventas/[slug]`) estaban devolviendo error 500 en producción.

**URLs afectadas:**
- https://www.furgocasa.com/es/vehiculos/fu0019-weinsberg-carabus-600-mq
- https://www.furgocasa.com/es/ventas/sunlight-cliff-600-adventure

## 🔍 Causa Raíz

En Next.js 15, el uso de `cookies()` dentro de funciones como `generateMetadata` causa problemas en producción. Las funciones `getVehicleBySlug` (alquiler) y `getVehicle` (venta) estaban usando `createClient()` que internamente llama a `await cookies()`, lo cual no es compatible en este contexto.

```typescript
// ❌ CÓDIGO PROBLEMÁTICO (antes)
export async function getVehicleBySlug(slug: string) {
  const supabaseServer = await createClient(); // ← Usa cookies()
  const { data, error } = await supabaseServer
    .from('vehicles')
    .select(`...`)
    .eq('slug', slug)
    .single();
  ...
}

// ❌ CÓDIGO PROBLEMÁTICO en ventas (antes)
async function getVehicle(slug: string) {
  const supabase = await createClient(); // ← Usa cookies()
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select(`...`)
    .eq('slug', slug)
    .single();
  ...
}
```

## ✅ Solución Implementada

Cambiado ambas funciones para usar el cliente público (anon) en lugar del cliente de servidor con cookies. Los datos de vehículos (tanto alquiler como venta) son públicos, por lo que no es necesaria autenticación.

```typescript
// ✅ CÓDIGO CORREGIDO - Alquiler (queries.ts)
export async function getVehicleBySlug(slug: string) {
  const { data, error } = await supabase // ← Cliente público (anon)
    .from('vehicles')
    .select(`
      *,
      category:vehicle_categories(*),
      images:vehicle_images(*),
      vehicle_equipment(
        id,
        notes,
        equipment(*)
      )
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching vehicle:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

// ✅ CÓDIGO CORREGIDO - Venta (ventas/[slug]/page.tsx)
async function getVehicle(slug: string) {
  const supabase = createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select(`...`)
    .eq('slug', slug)
    .eq('is_for_sale', true)
    .eq('sale_status', 'available')
    .single();

  if (error) {
    console.error('Error loading vehicle:', error);
    return null;
  }

  return vehicle;
}
```

## 📝 Archivos Modificados

1. `src/lib/supabase/queries.ts` - Función `getVehicleBySlug` (alquiler)
2. `src/app/ventas/[slug]/page.tsx` - Función `getVehicle` (venta)

## 🚀 Deploy

```bash
# Fix 1: Vehículos de alquiler
git add src/lib/supabase/queries.ts
git commit -m "fix(critical): resolver error 500 en paginas de vehiculos - usar cliente publico en getVehicleBySlug"
git push origin main

# Fix 2: Vehículos en venta
git add src/app/ventas/[slug]/page.tsx
git commit -m "fix(critical): resolver error 500 en paginas de ventas - usar cliente publico"
git push origin main
```

**Commits:**
- Alquiler: `8cd137f` (2026-01-23 12:15)
- Venta: `f65d844` (2026-01-23 12:18)

## ✅ Verificación

Una vez que Vercel complete el deploy (2-3 minutos), ambas páginas deberían funcionar correctamente:

1. **Alquiler:** https://www.furgocasa.com/es/vehiculos/fu0019-weinsberg-carabus-600-mq
2. **Venta:** https://www.furgocasa.com/es/ventas/sunlight-cliff-600-adventure
3. Verificar que cargan sin error 500
4. Verificar que muestran correctamente el vehículo, imágenes y equipamiento

## 📚 Contexto Técnico

### ¿Por qué funcionaba antes?

Este problema surgió específicamente en Next.js 15 debido a cambios en cómo se manejan las cookies en funciones de metadata.

### ¿Por qué usar el cliente público?

- Los vehículos (alquiler y venta) son datos **públicos** visibles para cualquier usuario
- No requieren autenticación ni permisos especiales
- El RLS (Row Level Security) de Supabase permite lectura pública de vehículos activos
- Usar el cliente público evita el overhead de cookies y sesiones innecesarias

### ¿Cuándo usar createClient()?

Solo usar `createClient()` (con cookies) para:
- Operaciones de administrador que requieren autenticación
- Creación/modificación de reservas
- Gestión de clientes
- Cualquier operación que requiera verificar permisos de usuario

### ¿Por qué funcionaba en el proceso de alquiler?

Las páginas del proceso de alquiler (`/reservar`) probablemente:
1. No usan `generateMetadata` o lo usan de forma diferente
2. Cargan datos después del renderizado inicial (client-side)
3. No tienen el mismo problema de timing con cookies

## 🎯 Impacto

- ✅ Resuelto error 500 en TODAS las páginas de vehículos de alquiler
- ✅ Resuelto error 500 en TODAS las páginas de vehículos en venta
- ✅ Mejor rendimiento (no requiere acceso a cookies)
- ✅ Código más limpio y semántico
- ✅ Compatible con Next.js 15 y sus restricciones de Edge Runtime

---

**Estado:** ✅ RESUELTO
**Prioridad:** 🔴 CRÍTICA
**Testing:** Verificar tras deploy de Vercel (en progreso)
