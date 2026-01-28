# Verificación del Sistema de Tracking de Búsquedas

## 📅 Fecha: 28 de enero de 2026

## 🎯 Objetivo

Verificar que las búsquedas que llevan a la página `/es/buscar` (sin seleccionar vehículo ni hacer reserva) se están registrando correctamente en la tabla `search_queries` de Supabase.

## ✅ Análisis del Código

### Flujo Actual

1. **Usuario visita**: `https://www.furgocasa.com/es/buscar?pickup_date=2026-04-23&dropoff_date=2026-04-30&...`
2. **Página carga**: `src/app/es/buscar/page.tsx` → `BuscarClient`
3. **Componente ejecuta**: `SearchResultsContent` usa `useQuery` para llamar a `/api/availability`
4. **Endpoint procesa**: `src/app/api/availability/route.ts`:
   - Valida parámetros (líneas 44-49)
   - Busca vehículos disponibles (líneas 54-117)
   - Calcula precios (líneas 119-168)
   - **REGISTRA BÚSQUEDA** (líneas 194-311)

### Código de Tracking (Líneas 194-311)

```typescript
// 1. Genera o recupera session_id
let sessionId: string = request.cookies.get('furgocasa_session_id')?.value || crypto.randomUUID();

// 2. Prepara datos de búsqueda
const searchData = {
  session_id: sessionId,
  pickup_date: pickupDate,
  dropoff_date: dropoffDate,
  pickup_time: pickupTime,
  dropoff_time: dropoffTime,
  rental_days: days,
  advance_days: Math.max(0, advanceDays),
  pickup_location: pickupLocation,
  dropoff_location: dropoffLocation,
  pickup_location_id: pickupLocationId,
  dropoff_location_id: dropoffLocationId,
  same_location: pickupLocation === dropoffLocation,
  category_slug: category,
  vehicles_available_count: vehiclesWithPrices?.length || 0,
  season_applied: priceResult.dominantSeason,
  avg_price_shown: finalPricePerDay,
  had_availability: (vehiclesWithPrices?.length || 0) > 0,
  funnel_stage: "search_only", // ← Siempre "search_only" para búsquedas sin selección
  locale: detectedLocale,
  user_agent_type: detectDeviceType(request.headers.get("user-agent")),
};

// 3. Inserta en search_queries
const { data: searchQuery, error: searchError } = await supabase
  .from("search_queries")
  .insert(searchData)
  .select("id")
  .single();
```

### ✅ Confirmaciones

1. **El código SÍ registra búsquedas**: El bloque de tracking (líneas 194-311) se ejecuta SIEMPRE que se llama a `/api/availability` con fechas válidas.

2. **No hay filtros de bots activos**: Según `docs/06-archivos-temporales/REVERSION-FILTRO-BOTS.md`, el filtro de bots fue revertido. Solo está activo el Vercel Firewall.

3. **Los errores no bloquean la búsqueda**: Si el tracking falla, solo se registra en consola pero la búsqueda continúa funcionando (líneas 303-304, 306-310).

4. **La página SÍ llama al endpoint**: `buscar-client.tsx` línea 42-46 usa `useQuery` que llama a `/api/availability` cuando hay `pickup_date` y `dropoff_date` en los parámetros.

## 🔧 Mejoras Implementadas

### 1. Logging Mejorado

Se ha mejorado el logging en `src/app/api/availability/route.ts` para que sea más visible:

- ✅ Logs más detallados antes de insertar
- ✅ Logs de éxito más visibles con separadores
- ✅ Logs de error más completos con toda la información del error
- ✅ Logs de excepciones mejorados

**Antes:**
```typescript
console.log("🔍 [TRACKING] Registrando búsqueda:", {...});
```

**Ahora:**
```typescript
console.log("🔍 [TRACKING] ========================================");
console.log("🔍 [TRACKING] INICIANDO REGISTRO DE BÚSQUEDA");
console.log("🔍 [TRACKING] ========================================");
console.log("🔍 [TRACKING] Datos a insertar:", JSON.stringify({...}, null, 2));
```

### 2. Script de Verificación

Se ha creado `scripts/verificar-busquedas-registradas.js` para verificar directamente en Supabase:

**Funcionalidades:**
- ✅ Total de búsquedas registradas
- ✅ Búsquedas de últimas 24 horas y 7 días
- ✅ Últimas 10 búsquedas con detalles completos
- ✅ Estadísticas por fase del funnel
- ✅ Búsquedas específicas (ej: Murcia)
- ✅ Verificación de problemas comunes (sin session_id, sin locale, etc.)

**Uso:**
```bash
node scripts/verificar-busquedas-registradas.js
```

## 🔍 Cómo Verificar Manualmente

### Opción 1: Verificar en Supabase Dashboard

1. Ir a Supabase Dashboard → SQL Editor
2. Ejecutar:

```sql
-- Ver últimas 10 búsquedas
SELECT 
  id,
  searched_at,
  pickup_date,
  dropoff_date,
  pickup_location,
  vehicles_available_count,
  locale,
  funnel_stage,
  session_id
FROM search_queries
ORDER BY searched_at DESC
LIMIT 10;

-- Contar búsquedas de hoy
SELECT COUNT(*) as busquedas_hoy
FROM search_queries
WHERE DATE(searched_at) = CURRENT_DATE;

-- Verificar búsquedas específicas de Murcia
SELECT 
  searched_at,
  pickup_date,
  dropoff_date,
  vehicles_available_count
FROM search_queries
WHERE pickup_location ILIKE '%murcia%'
ORDER BY searched_at DESC
LIMIT 10;
```

### Opción 2: Usar el Script de Verificación

```bash
node scripts/verificar-busquedas-registradas.js
```

### Opción 3: Verificar Logs en Vercel

1. Ir a Vercel Dashboard → Tu proyecto → Logs
2. Buscar por `[TRACKING]`
3. Deberías ver:
   - `🔍 [TRACKING] INICIANDO REGISTRO DE BÚSQUEDA`
   - `✅ [TRACKING] BÚSQUEDA REGISTRADA EXITOSAMENTE` (si funciona)
   - `❌ [TRACKING] ERROR REGISTRANDO BÚSQUEDA` (si hay error)

## ⚠️ Posibles Problemas

### 1. Errores Silenciosos

Si hay errores en Supabase (permisos, estructura de tabla, etc.), solo se registran en consola pero no fallan la búsqueda. **Solución**: Revisar logs de Vercel.

### 2. Problemas de Permisos en Supabase

Si la tabla `search_queries` no tiene los permisos correctos para el `anon` key, las inserciones fallarán silenciosamente.

**Verificar:**
```sql
-- En Supabase SQL Editor
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'search_queries';
```

**Debería tener:**
- `anon`: INSERT, SELECT
- `authenticated`: INSERT, SELECT

### 3. Problemas con Session ID

Si las cookies no se están estableciendo correctamente, cada búsqueda generará un nuevo `session_id`, lo cual es aceptable pero no ideal para tracking.

## 📊 Próximos Pasos Recomendados

1. **Ejecutar el script de verificación** para ver el estado actual
2. **Revisar logs de Vercel** después de hacer una búsqueda de prueba
3. **Verificar permisos de Supabase** si no se están registrando búsquedas
4. **Hacer una búsqueda de prueba** y verificar que aparece en `search_queries`

## 📝 Conclusión

**El código SÍ debería estar registrando las búsquedas correctamente.** El flujo está bien implementado y el tracking se ejecuta en cada llamada a `/api/availability`.

Si no se están registrando búsquedas, el problema más probable es:
1. **Permisos de Supabase** (más probable)
2. **Errores silenciosos** que solo aparecen en logs
3. **Problemas con la estructura de la tabla** `search_queries`

Usa el script de verificación y los logs mejorados para identificar el problema específico.
