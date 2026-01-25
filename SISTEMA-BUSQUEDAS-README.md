# Sistema de Análisis de Búsquedas - Furgocasa

## 📊 Descripción

Sistema completo de tracking y análisis del funnel de conversión de búsquedas de vehículos. Permite medir:

1. **Búsquedas realizadas** - Usuarios que buscan vehículos
2. **Vehículos seleccionados** - Usuarios que hacen clic en "Reservar"
3. **Reservas creadas** - Usuarios que completan el proceso

## 🗄️ Base de Datos

### 1. Ejecutar SQL en Supabase

**⚠️ IMPORTANTE:** Ejecuta el archivo SQL definitivo en tu dashboard de Supabase:

```bash
# Archivo: supabase/search-queries-DEFINITIVO.sql
```

Este archivo SQL definitivo:
- ✅ **DROP y CREATE limpio** - Elimina tabla anterior si existe
- ✅ **33 columnas completas** - Todos los campos necesarios incluidos:
  - `pickup_time` y `dropoff_time` (TIME)
  - `pickup_location` y `dropoff_location` (TEXT para slugs)
  - `pickup_location_id` y `dropoff_location_id` (UUID FK a locations)
  - `same_location` (BOOLEAN)
- ✅ **7 índices optimizados** para consultas rápidas
- ✅ **Triggers automáticos** para calcular tiempos de conversión
- ✅ **3 vistas analíticas** (search_conversion_stats, top_searched_dates, vehicle_search_performance)
- ✅ **4 políticas RLS** (Row Level Security)
- ✅ **Función de limpieza** automática de datos antiguos

**Estado actual:** ✅ SQL definitivo creado y listo para ejecutar (commit `da8e0cf`)

### 2. Verificar instalación

```sql
-- Verificar que la tabla existe
SELECT * FROM search_queries LIMIT 1;

-- Ver índices
SELECT indexname FROM pg_indexes WHERE tablename = 'search_queries';

-- Insertar dato de prueba
INSERT INTO search_queries (
  session_id,
  pickup_date,
  dropoff_date,
  rental_days,
  advance_days,
  vehicles_available_count,
  had_availability,
  funnel_stage
) VALUES (
  'test-session',
  CURRENT_DATE + 30,
  CURRENT_DATE + 37,
  7,
  30,
  5,
  true,
  'search_only'
);
```

## 🔧 Componentes del Sistema

### Backend

1. **`/api/availability/route.ts`** - Registra búsquedas automáticamente
2. **`/api/search-tracking/route.ts`** - Actualiza selecciones de vehículos
3. **`/api/bookings/create/route.ts`** - Marca conversiones completadas
4. **`/api/admin/search-analytics/route.ts`** - Endpoint de análisis para el admin

### Frontend

1. **`/administrator/busquedas`** - Dashboard de análisis (nueva página)
2. **VehicleCard** - Trackea clicks en vehículos
3. **Clientes de búsqueda** (es/en/fr/de) - Guardan searchQueryId
4. **Sidebar del admin** - Nuevo enlace "Búsquedas"

### Utilidades

1. **`src/lib/search-tracking/session.ts`** - Gestión de sesiones y detección de dispositivos
2. **`src/types/database.ts`** - Tipos TypeScript actualizados

## 📈 Uso del Dashboard

### Acceso

1. Ir a `/administrator/busquedas`
2. Seleccionar rango de fechas
3. Ver estadísticas en tiempo real

### Métricas Principales

**KPIs:**
- Total de búsquedas
- Vehículos seleccionados
- Reservas creadas
- Tasa de conversión global

**Análisis disponibles:**
- 🎯 Embudo de conversión
- 📅 Fechas más buscadas
- 🚐 Rendimiento por vehículo
- 🌞 Análisis por temporada
- ⏱️ Distribución por duración
- 🎲 **Demanda vs Disponibilidad** ⭐ NUEVO

### Filtros

- Rango de fechas personalizado
- Por defecto: últimos 30 días

## 🔍 Cómo Funciona

### Nivel 1: Búsqueda

Cuando un usuario busca vehículos en `/buscar`, `/search`, `/recherche` o `/suche`:

1. La API `/api/availability` registra automáticamente la búsqueda
2. Se guarda:
   - Fechas y duración solicitadas
   - Ubicaciones
   - Vehículos disponibles
   - Precio promedio
   - Temporada aplicada
   - Dispositivo (móvil/desktop/tablet)
   - Locale

3. Se devuelve un `searchQueryId` que se guarda en `sessionStorage`

### Nivel 2: Selección

Cuando el usuario hace clic en "Reservar" en un vehículo:

1. `VehicleCard` llama a `/api/search-tracking`
2. Se actualiza el registro con:
   - `vehicle_selected = true`
   - `selected_vehicle_id`
   - `selected_vehicle_price`
   - `vehicle_selected_at` (timestamp)
   - `funnel_stage = 'vehicle_selected'`

3. El trigger SQL calcula automáticamente `time_to_select_seconds`

### Nivel 3: Conversión

Cuando se crea una reserva en `/api/bookings/create`:

1. Se busca la búsqueda asociada (por `session_id` y `vehicle_id`)
2. Se actualiza con:
   - `booking_created = true`
   - `booking_id`
   - `booking_created_at` (timestamp)
   - `funnel_stage = 'booking_created'`

3. Los triggers SQL calculan:
   - `time_to_booking_seconds` (desde selección)
   - `total_conversion_seconds` (desde búsqueda)

## 🎲 Demanda vs Disponibilidad (Revenue Management)

### ⭐ Nueva Funcionalidad: Optimización de Precios por Demanda

Esta sección correlaciona **búsquedas (demanda)** con **ocupación real (disponibilidad)** para identificar oportunidades de ajuste de precios.

### Métricas Calculadas:

1. **Búsquedas por Semana**: Cuántas veces se busca cada semana
2. **% Ocupación**: Porcentaje de días-vehículo reservados
3. **% Disponibilidad**: Espacio libre (100 - ocupación)
4. **Índice de Demanda**: Búsquedas / Vehículos disponibles

### Algoritmo de Recomendación:

```typescript
if (ocupación >= 80% && índiceDemanda >= 2.0) {
  → 🔥 OPORTUNIDAD ALTA: Subir precio +15-20%
}
else if (ocupación >= 60% && índiceDemanda >= 1.5) {
  → 💡 OPORTUNIDAD MEDIA: Subir precio +10%
}
else if (ocupación < 40% && índiceDemanda < 0.5) {
  → 📉 BAJA DEMANDA: Aplicar descuentos/promociones
}
else if (ocupación >= 70% && índiceDemanda < 1.0) {
  → ✅ Ocupación alta pero pocas búsquedas: Precio adecuado
}
else if (ocupación < 50% && índiceDemanda >= 2.0) {
  → 🎯 Alta demanda pero baja ocupación: Revisar UX/proceso
}
```

### Ejemplo Real:

```
Semana 10-17 Agosto:
- 🔍 Búsquedas: 45
- 📊 Ocupación: 90%
- 🚐 Vehículos: 5
- 📈 Índice: 9.0 (45/5)

→ 🔥 OPORTUNIDAD ALTA
→ Recomendación: "Considera subir precios +15-20%"
```

### Visualización en el Dashboard:

La tabla muestra **cada semana** con:
- Rango de fechas
- Número de búsquedas
- Barra visual de ocupación (roja >80%, amarilla 60-80%, verde <60%)
- Índice de demanda (color según intensidad)
- Badge de oportunidad (ALTA/MEDIA/BAJA/Normal)
- Recomendación específica con emoji

### Consulta SQL para Análisis Manual:

```sql
-- Ver semanas con alta demanda y alta ocupación
WITH weekly_searches AS (
  SELECT 
    DATE_TRUNC('week', pickup_date) as week_start,
    COUNT(*) as search_count
  FROM search_queries
  WHERE searched_at >= NOW() - INTERVAL '90 days'
  GROUP BY DATE_TRUNC('week', pickup_date)
),
weekly_bookings AS (
  SELECT 
    DATE_TRUNC('week', pickup_date) as week_start,
    COUNT(DISTINCT vehicle_id) as vehicles_booked,
    SUM(days) as total_days_booked
  FROM bookings
  WHERE status != 'cancelled'
    AND payment_status IN ('partial', 'paid')
  GROUP BY DATE_TRUNC('week', pickup_date)
)
SELECT 
  ws.week_start,
  ws.search_count,
  COALESCE(wb.vehicles_booked, 0) as vehicles_booked,
  COALESCE(wb.total_days_booked, 0) as days_booked,
  ROUND(ws.search_count::numeric / (SELECT COUNT(*) FROM vehicles WHERE is_for_rent = true), 2) as demand_index
FROM weekly_searches ws
LEFT JOIN weekly_bookings wb ON ws.week_start = wb.week_start
ORDER BY ws.week_start DESC;
```

## 📊 Consultas SQL Útiles

### Ver búsquedas recientes

```sql
SELECT 
  searched_at,
  pickup_date,
  rental_days,
  funnel_stage,
  season_applied,
  vehicles_available_count
FROM search_queries
ORDER BY searched_at DESC
LIMIT 20;
```

### Tasa de conversión por día

```sql
SELECT 
  DATE(searched_at) as fecha,
  COUNT(*) as busquedas,
  COUNT(*) FILTER (WHERE vehicle_selected) as selecciones,
  COUNT(*) FILTER (WHERE booking_created) as reservas,
  ROUND(100.0 * COUNT(*) FILTER (WHERE booking_created) / COUNT(*), 2) as conversion_pct
FROM search_queries
WHERE searched_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(searched_at)
ORDER BY fecha DESC;
```

### Top vehículos más seleccionados

```sql
SELECT 
  v.name,
  COUNT(*) as veces_seleccionado,
  COUNT(*) FILTER (WHERE sq.booking_created) as veces_reservado,
  ROUND(100.0 * COUNT(*) FILTER (WHERE sq.booking_created) / COUNT(*), 2) as conversion_pct
FROM search_queries sq
JOIN vehicles v ON sq.selected_vehicle_id = v.id
WHERE sq.vehicle_selected = true
  AND sq.searched_at >= NOW() - INTERVAL '30 days'
GROUP BY v.name
ORDER BY veces_seleccionado DESC;
```

### Búsquedas sin disponibilidad

```sql
SELECT 
  pickup_date,
  dropoff_date,
  rental_days,
  COUNT(*) as veces_buscado
FROM search_queries
WHERE had_availability = false
  AND searched_at >= NOW() - INTERVAL '30 days'
GROUP BY pickup_date, dropoff_date, rental_days
ORDER BY veces_buscado DESC
LIMIT 10;
```

## 🧹 Mantenimiento

### Limpieza automática

El sistema incluye una función para limpiar búsquedas antiguas:

```sql
-- Elimina búsquedas sin conversión de hace +12 meses
SELECT cleanup_old_search_queries();
```

### Espacio en disco

```sql
-- Ver tamaño de la tabla
SELECT 
  pg_size_pretty(pg_total_relation_size('search_queries')) as tamaño,
  COUNT(*) as registros
FROM search_queries;
```

## 🔐 Seguridad

- **RLS activado**: Solo administradores pueden leer datos
- **API pública**: Puede insertar/actualizar (necesario para tracking)
- **Sin datos personales**: Se anonimiza IP, no se guarda info del usuario
- **RGPD compliant**: Solo datos agregados de comportamiento

## 🚀 Próximas Mejoras

Ideas para futuras versiones:

1. **Alertas automáticas**: Email cuando hay picos de demanda
2. **Precio dinámico**: Aplicar modificadores automáticamente basados en demanda ✅ IMPLEMENTADO
3. **Comparativa histórica**: Año anterior vs actual
4. **Export a Excel**: Descargar reportes
5. **Heatmap visual**: Mapa de calor de fechas
6. **Segmentación**: Por país/idioma del usuario
7. **A/B testing**: Trackear diferentes variantes de precios
8. **Machine Learning**: Predecir demanda futura basada en históricos

## 🐛 Troubleshooting

### No se registran búsquedas

1. Verificar que la tabla existe: `SELECT * FROM search_queries LIMIT 1;`
2. Revisar logs de Supabase en el dashboard
3. Verificar que las políticas RLS permiten inserts

### No se actualizan selecciones

1. Verificar que `searchQueryId` se guarda en sessionStorage
2. Abrir DevTools → Application → Session Storage
3. Buscar clave `furgocasa_search_query_id`

### No se marcan conversiones

1. Verificar que la cookie `furgocasa_session_id` existe
2. Revisar logs del endpoint `/api/bookings/create`

## 📝 Changelog

### v1.2.0 (2026-01-25) ⭐ SQL DEFINITIVO

- ✅ **SQL Definitivo Creado** (`supabase/search-queries-DEFINITIVO.sql`)
  - DROP y CREATE limpio de la tabla `search_queries`
  - 33 columnas completas con todos los campos requeridos
  - Incluye `pickup_time`, `dropoff_time`, `pickup_location_id`, `dropoff_location_id`, `same_location`
  - Conversión automática de slugs → UUIDs en `/api/availability`
  - 7 índices optimizados
  - Triggers automáticos de tiempos
  - 3 vistas analíticas
  - RLS con 4 políticas
- ✅ **Tracking Reactivado** en `/api/availability/route.ts`
  - Ya no está deshabilitado (`if (false)` eliminado)
  - Inserta todos los campos correctamente
  - Manejo robusto de errores (no rompe búsqueda si falla tracking)
- ✅ **Fix Bugs Informes** (`/administrator/informes`)
  - Gráfico "Ingresos por mes" ahora muestra correctamente reservas creadas en año seleccionado
  - Filtrado condicional por `created_at` o `pickup_date` según modo

### v1.1.0 (2026-01-25) ⭐ NUEVO

- ✅ **Análisis Demanda vs Disponibilidad**
  - Correlación búsquedas con ocupación por semana
  - Índice de demanda (búsquedas/vehículos)
  - Algoritmo de recomendación de precios
  - 4 niveles de oportunidad (ALTA/MEDIA/BAJA/Normal)
  - Visualización con tabla interactiva y códigos de color
  - Leyenda explicativa de métricas

### v1.0.0 (2026-01-25)

- ✅ Sistema completo de tracking de funnel
- ✅ Dashboard de análisis con 6 vistas diferentes
- ✅ Triggers automáticos para tiempos de conversión
- ✅ Políticas RLS para seguridad
- ✅ Soporte multiidioma (es/en/fr/de)

---

**Desarrollado para Furgocasa** 🚐
