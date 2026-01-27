# ✅ Verificar Registro de Búsquedas por Idioma

## 📊 Cómo Verificar que se Registran TODAS las Búsquedas

### 1. Consulta SQL en Supabase

Ejecuta esta consulta en el **SQL Editor** de Supabase:

```sql
-- Ver búsquedas de las últimas 24 horas por idioma
SELECT 
  locale,
  COUNT(*) as total_busquedas,
  COUNT(*) FILTER (WHERE had_availability) as con_disponibilidad,
  COUNT(*) FILTER (WHERE vehicle_selected) as con_vehiculo_seleccionado,
  COUNT(*) FILTER (WHERE booking_created) as con_reserva_creada,
  MIN(searched_at) as primera_busqueda,
  MAX(searched_at) as ultima_busqueda
FROM search_queries
WHERE searched_at >= NOW() - INTERVAL '24 hours'
GROUP BY locale
ORDER BY total_busquedas DESC;
```

**Resultado esperado:** Deberías ver filas para `es`, `en`, `fr`, `de` si ha habido búsquedas en esos idiomas.

---

### 2. Ver Últimas 20 Búsquedas con Detalles

```sql
SELECT 
  id,
  searched_at,
  locale,
  pickup_date,
  dropoff_date,
  rental_days,
  vehicles_available_count,
  had_availability,
  funnel_stage,
  user_agent_type
FROM search_queries
ORDER BY searched_at DESC
LIMIT 20;
```

**Qué verificar:**
- ✅ Que aparecen búsquedas en todos los idiomas (es, en, fr, de)
- ✅ Que `locale` NO es siempre `es`
- ✅ Que `searched_at` está actualizado (búsquedas recientes)

---

### 3. Prueba Manual en Cada Idioma

Realiza una búsqueda en cada idioma y verifica que se registra:

#### Español (`/es/buscar`)
```
https://furgocasa.com/es/buscar?pickup_date=2026-03-01&dropoff_date=2026-03-08
```

#### Inglés (`/en/search`)
```
https://furgocasa.com/en/search?pickup_date=2026-03-01&dropoff_date=2026-03-08
```

#### Francés (`/fr/recherche`)
```
https://furgocasa.com/fr/recherche?pickup_date=2026-03-01&dropoff_date=2026-03-08
```

#### Alemán (`/de/suche`)
```
https://furgocasa.com/de/suche?pickup_date=2026-03-01&dropoff_date=2026-03-08
```

**Después de cada búsqueda, ejecuta:**

```sql
SELECT 
  searched_at,
  locale,
  pickup_date,
  vehicles_available_count
FROM search_queries
ORDER BY searched_at DESC
LIMIT 1;
```

Deberías ver que `locale` cambia según el idioma de la página.

---

### 4. Ver Logs en Vercel (Detección de Errores)

1. Ve a **Vercel Dashboard** → Tu proyecto → **Logs**
2. Busca por: `[TRACKING]`

Verás mensajes como:
- `🔍 [TRACKING] Registrando búsqueda` - Se intenta registrar
- `✅ [TRACKING] Búsqueda registrada exitosamente` - Éxito
- `❌ [TRACKING] Error registrando búsqueda` - Error (ver detalles)

---

## 🔍 Mejoras Implementadas

### Cambio 1: Detección de Locale Mejorada

**ANTES:**
```typescript
locale: request.headers.get("accept-language")?.split(",")[0]?.split("-")[0] || null
```
- ❌ Problema: Usaba el idioma del navegador, no de la página

**AHORA:**
```typescript
// Detectar locale desde el referer o accept-language
let detectedLocale = null;
const referer = request.headers.get("referer");
if (referer) {
  // Extraer locale de la URL: /es/, /en/, /fr/, /de/
  const localeMatch = referer.match(/\/(es|en|fr|de)\//);
  if (localeMatch) {
    detectedLocale = localeMatch[1];
  }
}
// Fallback a accept-language si no se detecta desde referer
if (!detectedLocale) {
  detectedLocale = request.headers.get("accept-language")?.split(",")[0]?.split("-")[0] || null;
}
```
- ✅ Solución: Extrae el idioma desde la URL del referer (`/es/buscar`, `/en/search`, etc.)
- ✅ Fallback: Si no hay referer, usa `accept-language` como antes

### Cambio 2: Logs Detallados

Ahora se registran logs con:
- 🔍 Datos antes de insertar (locale detectado, referer, fecha, vehículos)
- ✅ Confirmación de éxito con el ID generado
- ❌ Errores completos con detalles, mensaje, hint y datos intentados

---

## 🚨 Qué Hacer si No se Registran Búsquedas

### Problema 1: No aparecen búsquedas en algunos idiomas

**Causa posible:** El referer no se está enviando correctamente

**Solución alternativa:** Pasar el locale como parámetro en la URL:

```typescript
// En buscar-client.tsx (de cada idioma)
const response = await fetch(
  `/api/availability?${params.toString()}&locale=es`, // <-- Añadir locale
  { cache: "no-store" }
);
```

### Problema 2: Errores en logs de Vercel

**Si ves:** `❌ [TRACKING] Error registrando búsqueda`

1. Copia el mensaje de error completo
2. Verifica que la tabla `search_queries` existe:
   ```sql
   SELECT COUNT(*) FROM search_queries;
   ```
3. Verifica las políticas RLS:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'search_queries';
   ```

### Problema 3: Búsquedas registradas pero locale siempre NULL

**Causa:** Ni referer ni accept-language están disponibles

**Solución:** Pasar locale explícitamente desde el cliente (ver Problema 1)

---

## 📈 Estadísticas Útiles

### Búsquedas por Idioma (Últimos 30 días)

```sql
SELECT 
  COALESCE(locale, 'desconocido') as idioma,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as porcentaje
FROM search_queries
WHERE searched_at >= NOW() - INTERVAL '30 days'
GROUP BY locale
ORDER BY total DESC;
```

### Tasa de Registro (Comparar con Analytics)

Si tienes Google Analytics o Vercel Analytics, compara:
- **Analytics:** Visitas a `/es/buscar`, `/en/search`, etc.
- **Base de datos:** Registros en `search_queries`

Deberían ser muy similares (puede haber pequeña diferencia por errores de red).

---

## ✅ Checklist de Verificación

- [ ] Ejecutar consulta SQL de búsquedas por idioma
- [ ] Ver que aparecen los 4 idiomas (si ha habido tráfico)
- [ ] Hacer búsqueda manual en español → verificar registro
- [ ] Hacer búsqueda manual en inglés → verificar registro
- [ ] Hacer búsqueda manual en francés → verificar registro
- [ ] Hacer búsqueda manual en alemán → verificar registro
- [ ] Revisar logs de Vercel para ver tracking exitoso
- [ ] Verificar que no hay errores `❌ [TRACKING]` en logs

---

## 🎯 Resumen

Con los cambios implementados:

1. ✅ **Mejor detección de idioma**: Extrae desde URL del referer
2. ✅ **Logs detallados**: Fácil de debuggear en Vercel
3. ✅ **No rompe búsquedas**: Si falla tracking, la búsqueda sigue funcionando
4. ✅ **RLS correcto**: Políticas permiten inserts sin autenticación

**Estado:** Sistema preparado para registrar búsquedas en los 4 idiomas correctamente.
