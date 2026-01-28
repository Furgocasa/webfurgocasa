# Solución: RLS Bloqueando Inserciones en search_queries

## 📅 Fecha: 28 de enero de 2026

## ❌ Problema Identificado

**Error en logs de Vercel:**
```
code: '42501'
message: 'new row violates row-level security policy for table "search_queries"'
```

**Causa:** Las políticas RLS están bloqueando las inserciones desde la API porque la política de INSERT no especifica correctamente los roles permitidos.

## ✅ Solución

### Paso 1: Ejecutar Script SQL en Supabase

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta el script: `supabase/fix-rls-search-queries.sql`

Este script:
- ✅ Elimina políticas de INSERT existentes que puedan estar mal configuradas
- ✅ Crea una nueva política que permite INSERT a `anon`, `authenticated` y `public`
- ✅ Prueba la inserción para verificar que funciona

### Paso 2: Verificar que Funciona

Después de ejecutar el script:

1. **Haz una búsqueda de prueba** en el sitio web
2. **Verifica en Supabase** que aparece en `search_queries`
3. **Revisa los logs de Vercel** - deberías ver `✅ [TRACKING] BÚSQUEDA REGISTRADA EXITOSAMENTE` en lugar del error

## 🔍 Explicación Técnica

### Problema

La política original en `search-queries-DEFINITIVO.sql` era:
```sql
CREATE POLICY "API puede insertar búsquedas"
  ON public.search_queries
  FOR INSERT
  WITH CHECK (true);
```

**Problema:** No especifica los roles (`TO public, anon, authenticated`), por lo que Supabase puede no aplicarla correctamente al rol `anon` que usa la API.

### Solución

La política corregida es:
```sql
CREATE POLICY "API puede insertar búsquedas"
  ON public.search_queries
  FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (true);
```

**Mejora:** Especifica explícitamente que los roles `anon`, `authenticated` y `public` pueden insertar.

## 📋 Verificación Post-Fix

Después de aplicar el fix, ejecuta:

```sql
-- Verificar políticas de INSERT
SELECT 
  policyname,
  cmd as command,
  roles,
  with_check
FROM pg_policies
WHERE tablename = 'search_queries'
  AND cmd = 'INSERT';
```

Deberías ver la política con `roles` incluyendo `{anon,authenticated,public}`.

## 🎯 Resultado Esperado

Después del fix:
- ✅ Las búsquedas se registrarán automáticamente
- ✅ No habrá más errores `42501` en los logs
- ✅ El tracking funcionará correctamente para todas las búsquedas

## 📝 Notas

- El cliente de Supabase usa `NEXT_PUBLIC_SUPABASE_ANON_KEY` (correcto)
- La política permite INSERT sin autenticación (correcto para tracking)
- Solo los administradores pueden leer las búsquedas (seguridad correcta)
