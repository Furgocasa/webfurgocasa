# Solución: Búsquedas No Se Registran en search_queries

## 📅 Fecha: 28 de enero de 2026

## 🔍 Problema

Las búsquedas que se realizan en `/es/buscar` no aparecen en la tabla `search_queries` de Supabase, aunque el código debería registrarlas automáticamente.

## ✅ Verificaciones Realizadas

1. **Código de tracking**: ✅ Está correctamente implementado en `src/app/api/availability/route.ts`
2. **Permisos de inserción**: ✅ El script de diagnóstico confirma que las inserciones funcionan
3. **Estructura de tabla**: ✅ La tabla existe y tiene todos los campos necesarios

## 🔧 Pasos para Diagnosticar

### 1. Verificar Logs en Vercel

1. Ve a Vercel Dashboard → Tu proyecto → **Logs**
2. Busca por `[TRACKING]` en los logs recientes
3. Deberías ver:
   - `🔍 [TRACKING] INICIANDO PROCESO DE TRACKING`
   - `🔍 [TRACKING] INICIANDO REGISTRO DE BÚSQUEDA`
   - `✅ [TRACKING] BÚSQUEDA REGISTRADA EXITOSAMENTE` (si funciona)
   - `❌ [TRACKING] ERROR REGISTRANDO BÚSQUEDA` (si hay error)

**Si NO ves ningún log de `[TRACKING]`**: El endpoint no se está ejecutando o hay un problema antes del bloque de tracking.

**Si ves errores**: Copia el mensaje de error completo para diagnosticar.

### 2. Verificar Políticas RLS en Supabase

Ejecuta el script SQL en Supabase SQL Editor:

```bash
# Archivo: supabase/verificar-politicas-search-queries.sql
```

Este script verifica:
- ✅ Si RLS está habilitado
- ✅ Qué políticas existen
- ✅ Si las políticas permiten INSERT sin autenticación
- ✅ Intenta insertar un registro de prueba

**Si la inserción de prueba falla**: Hay un problema con las políticas RLS.

**Solución si falta la política de INSERT**:
```sql
CREATE POLICY "API puede insertar búsquedas"
  ON public.search_queries
  FOR INSERT
  WITH CHECK (true);
```

### 3. Verificar que el Endpoint se Llama Correctamente

Abre la consola del navegador (F12) cuando visites la página de búsqueda y verifica:

1. **Network tab**: Debería haber una llamada a `/api/availability?pickup_date=...`
2. **Response**: Debería incluir `searchQueryId` en la respuesta JSON
3. **Status**: Debería ser `200 OK`

Si no hay llamada al endpoint o falla, el problema está en el cliente.

### 4. Ejecutar Script de Diagnóstico Local

```bash
node scripts/diagnostico-busquedas-no-registradas.js
```

Este script:
- ✅ Verifica que la tabla existe
- ✅ Intenta insertar un registro de prueba
- ✅ Muestra errores detallados si falla
- ✅ Verifica la última búsqueda registrada

## 🐛 Problemas Comunes y Soluciones

### Problema 1: Políticas RLS Bloquean la Inserción

**Síntoma**: Error `42501` (permisos insuficientes) en logs

**Solución**:
```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'search_queries';

-- Crear política de INSERT si no existe
CREATE POLICY "API puede insertar búsquedas"
  ON public.search_queries
  FOR INSERT
  WITH CHECK (true);
```

### Problema 2: El Endpoint No Se Ejecuta

**Síntoma**: No hay logs de `[TRACKING]` en Vercel

**Posibles causas**:
- El componente no está llamando al endpoint
- Hay un error antes del bloque de tracking que detiene la ejecución
- El endpoint está siendo cacheado

**Solución**: Verificar que `buscar-client.tsx` está llamando correctamente a `/api/availability`

### Problema 3: Error Silencioso en el Tracking

**Síntoma**: La búsqueda funciona pero no se registra, sin errores visibles

**Solución**: Los logs mejorados ahora muestran todos los errores. Revisa los logs de Vercel para ver el error específico.

### Problema 4: Cliente de Supabase Incorrecto

**Síntoma**: Inserción funciona en script pero no en producción

**Verificación**: El endpoint usa `createClient()` que usa `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Verifica que esta variable esté correctamente configurada en Vercel.

## 📊 Mejoras Implementadas

1. **Logging Mejorado**: Ahora hay logs detallados en cada paso del proceso de tracking
2. **Script de Diagnóstico**: `scripts/diagnostico-busquedas-no-registradas.js` para verificar permisos
3. **Script SQL de Verificación**: `supabase/verificar-politicas-search-queries.sql` para verificar RLS

## 🎯 Próximos Pasos

1. **Revisar logs de Vercel** después de hacer una búsqueda de prueba
2. **Ejecutar script SQL** para verificar políticas RLS
3. **Verificar Network tab** en el navegador para confirmar que el endpoint se llama
4. **Compartir los logs** si hay errores para diagnosticar el problema específico

## 📝 Notas

- El código de tracking está dentro de un `try-catch` que no falla la búsqueda si el tracking falla
- Los errores se registran en consola pero no afectan la funcionalidad de búsqueda
- El diagnóstico local confirma que los permisos están bien configurados
