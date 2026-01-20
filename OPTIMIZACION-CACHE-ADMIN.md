# Optimización de Caché del Panel de Administrador

## Resumen de Cambios

Se ha implementado un sistema de caché más agresivo y adaptativo para optimizar los tiempos de carga del panel de administrador, basado en la frecuencia de cambio de cada tipo de dato.

## 📊 Tabla Resumen de Tiempos de Caché

| Sección | Antes | Ahora | Razón |
|---------|-------|-------|-------|
| **Layout Admin** | 5 min | 30 min | Datos estructurales |
| **Extras** | 5 min | 60 min | Casi nunca cambian |
| **Equipamiento** | 5 min | 60 min | Muy estables |
| **Vehículos** | 5 min | 30 min | Cambian poco |
| **Clientes** | 5 min | 15 min | Actualizaciones moderadas |
| **Pagos** | 5 min | 15 min | Actualizaciones moderadas |
| **Reservas** | 5 min | 10 min | Más dinámicas |
| **Calendario (vehículos)** | 5 min | 30 min | Lista estable |
| **Calendario (reservas)** | 5 min | 10 min | Depende de fecha vista |
| **Global (default)** | 5 min | 30 min | Nuevas tablas |

## 🎯 Beneficios Esperados

### Antes de la optimización
- ⏱️ Cada navegación = nueva consulta a BD
- 🔄 Spinners de carga constantes
- 🌐 Alto uso de ancho de banda
- ⚡ Experiencia lenta

### Después de la optimización
- ⚡ Navegación instantánea (datos en caché)
- ✨ Sin spinners innecesarios
- 💾 Menor consumo de recursos
- 🎯 Sincronización automática al editar

## Estrategia de Caché

### 1. Configuración Global (QueryProvider)

**Antes:**
- `staleTime`: 5 minutos
- `gcTime`: 10 minutos

**Ahora:**
- `staleTime`: 30 minutos (datos cambian poco)
- `gcTime`: 1 hora (mantener en memoria más tiempo)
- `refetchOnWindowFocus`: `false` (no recargar al hacer focus)

### 2. Layout del Admin

**Antes:**
- `revalidate`: 300 segundos (5 minutos)

**Ahora:**
- `revalidate`: 1800 segundos (30 minutos)

### 3. Caché Adaptativo por Tipo de Datos

Se ha implementado un sistema de caché inteligente que ajusta automáticamente el tiempo de caché según el tipo de datos:

#### Datos de Configuración (1 hora)
- **Extras** - Casi nunca cambian
- **Equipamiento** - Casi nunca cambian
- **Categorías de vehículos** - Muy estables

#### Datos Semi-Estáticos (30 minutos)
- **Vehículos** - Cambian poco frecuentemente
- **Datos generales** - Default para otras tablas

#### Datos Moderados (15 minutos)
- **Clientes** - Se actualizan ocasionalmente
- **Pagos** - Actualizaciones moderadas

#### Datos Dinámicos (10 minutos)
- **Reservas** - Más activas pero no críticas

## Implementación Técnica

### Hook `usePaginatedData`

Se ha añadido la función `getStaleTime()` que determina automáticamente el tiempo de caché según la tabla:

```typescript
const getStaleTime = () => {
  // Extras y equipamiento casi nunca cambian - 1 hora
  if (table === 'extras' || table === 'equipment') {
    return 1000 * 60 * 60;
  }
  // Vehículos cambian poco - 30 minutos
  if (table === 'vehicles' || table === 'vehicle_categories') {
    return 1000 * 60 * 30;
  }
  // Clientes y pagos - 15 minutos
  if (table === 'customers' || table === 'payments') {
    return 1000 * 60 * 15;
  }
  // Reservas más dinámicas - 10 minutos
  if (table === 'bookings') {
    return 1000 * 60 * 10;
  }
  // Default: 30 minutos
  return 1000 * 60 * 30;
};
```

### Hook `useAdminData`

Se ha migrado de un sistema manual de estado a React Query para aprovechar:
- Caché automático
- Deduplicación de requests
- Retry inteligente
- Garbage collection automático

**Características:**
- `staleTime`: 1 hora por defecto (datos de configuración)
- `gcTime`: 2 horas (el doble del staleTime)
- Retry exponencial con límite de 3 segundos
- `refetchOnWindowFocus`: `false`

### Hook `useCachedData`

Se ha actualizado para aceptar `staleTime` personalizado:
- Extras y Equipamiento: 1 hora
- Categorías de vehículos: 1 hora

## Ventajas de Esta Implementación

### 1. Reducción de Llamadas a la API
- **Antes**: Cada navegación = nueva consulta
- **Ahora**: Datos en caché durante 10-60 minutos según tipo

### 2. Carga Instantánea
- Los datos cacheados se muestran inmediatamente
- No hay spinner de carga para datos recientes

### 3. Sincronización Automática
- Cuando se crea/edita un registro, se invalida la caché automáticamente
- El sistema recarga solo los datos necesarios

### 4. Menor Consumo de Recursos
- Menos queries a Supabase
- Menor uso de ancho de banda
- Mejor experiencia incluso con conexión lenta

### 5. Adaptativo y Escalable
- Cada tipo de dato tiene su tiempo óptimo de caché
- Fácil añadir nuevas tablas con configuración personalizada

## Invalidación de Caché

La caché se invalida automáticamente en estos casos:

1. **Creación de nuevos registros**: `refetch()` después de crear
2. **Edición de registros**: `refetch()` después de actualizar
3. **Eliminación de registros**: `refetch()` después de borrar
4. **Cambio de estado**: `refetch()` después de toggles (activo/inactivo, etc.)

## Páginas Optimizadas

### Con `usePaginatedData` (caché adaptativo)
- ✅ Vehículos (30 min)
- ✅ Reservas (10 min)
- ✅ Clientes (15 min)
- ✅ Pagos (15 min)

### Con `useAdminData` (1 hora)
- ✅ Extras
- ✅ Equipamiento

### Con `useAdminData` (30 minutos)
- ✅ Vehículos del calendario

### Con `useAdminData` (10 minutos, con dependencies)
- ✅ Reservas del calendario (se recarga al cambiar mes/vista)

### Con `useCachedData` (1 hora)
- ✅ Categorías de vehículos

## Caché Especial: Calendario

El calendario tiene una implementación especial porque depende de parámetros dinámicos (`startDate` y `monthsToShow`):

```typescript
useAdminData({
  queryKey: ['bookings-calendar'],
  dependencies: [startDate, monthsToShow], // Se recarga al cambiar
  staleTime: 1000 * 60 * 10, // 10 minutos
  // ...
})
```

- **Comportamiento**: La caché se invalida automáticamente cuando el usuario cambia de mes o ajusta la vista
- **Ventaja**: Si el usuario vuelve al mes anterior, los datos se cargan desde caché (durante 10 min)
- **Balance**: Suficientemente fresco para reservas dinámicas, pero evita recargas innecesarias

## Monitorización

Se mantienen los logs en consola para monitorizar el comportamiento de la caché:

```
[usePaginatedData] Loading page 0...
[usePaginatedData] Loaded 30 items
[useAdminData] Loading data...
[useAdminData] Data loaded successfully
```

## Configuración Personalizada

Para ajustar los tiempos de caché por necesidad:

### En `usePaginatedData`:
Modificar la función `getStaleTime()` en `src/hooks/use-paginated-data.ts`

### En `useAdminData`:
Pasar el parámetro `staleTime`:
```typescript
useAdminData({
  queryKey: ['mi-tabla'],
  queryFn: async () => { ... },
  staleTime: 1000 * 60 * 45, // 45 minutos
})
```

### En `useCachedData`:
```typescript
useCachedData({
  queryKey: ['mi-dato'],
  queryFn: async () => { ... },
  staleTime: 1000 * 60 * 20, // 20 minutos
})
```

## Consideraciones

### Datos en Tiempo Real
Si alguna sección necesita datos más actualizados:
1. Reducir el `staleTime` en la configuración
2. Implementar polling: `refetchInterval: 60000` (cada minuto)
3. Implementar websockets para actualizaciones en tiempo real

### Datos Críticos
Para datos que requieren estar siempre actualizados:
- Usar `staleTime: 0` (sin caché)
- Implementar validación en tiempo real
- Considerar `refetchOnWindowFocus: true`

## Resultados Esperados

### Tiempos de Carga
- **Primera carga**: Normal (igual que antes)
- **Navegaciones posteriores**: Instantáneo (datos en caché)
- **Actualización de datos**: Solo cuando sea necesario

### Experiencia de Usuario
- ⚡ Navegación mucho más rápida entre secciones
- 🎯 Sin spinners innecesarios
- 💾 Menor consumo de datos
- 🔄 Sincronización automática cuando se modifica algo

## Próximos Pasos (Opcional)

Si se necesita optimización adicional:

1. **Prefetching**: Precargar datos de secciones relacionadas
2. **Optimistic Updates**: Actualizar UI antes de confirmar en servidor
3. **Infinite Scroll Mejorado**: Para tablas muy grandes
4. **Service Worker**: Para caché offline completo
5. **GraphQL/tRPC**: Para queries más eficientes y tipadas

---

**Fecha de implementación**: Enero 2026
**Versión**: 1.0
**Estado**: ✅ Implementado y probado

## 🧪 Pruebas Recomendadas

Para verificar que la optimización funciona correctamente, sigue estos pasos:

### 1. Prueba de Caché Básica

1. **Abrir el admin** y navegar a Vehículos
2. **Observar en la consola** del navegador: `[usePaginatedData] Loading page 0...`
3. **Navegar a Reservas** y volver a Vehículos
4. **Resultado esperado**: Los datos de vehículos aparecen instantáneamente, sin mensaje de carga en consola

### 2. Prueba de Invalidación Automática

1. **Navegar a Extras**
2. **Crear un nuevo extra**
3. **Resultado esperado**: La tabla se actualiza inmediatamente mostrando el nuevo extra
4. **Verificar en consola**: Debe aparecer un nuevo `[useAdminData] Loading data...`

### 3. Prueba de Caché con Dependencies (Calendario)

1. **Abrir el Calendario** - Se cargan las reservas del mes actual
2. **Cambiar al mes siguiente** usando los botones
3. **Observar consola**: Debe cargar las nuevas reservas
4. **Volver al mes anterior**
5. **Resultado esperado**: Las reservas aparecen desde caché (sin loading en consola)
6. **Esperar 10 minutos y volver a cambiar de mes**
7. **Resultado esperado**: Ahora sí debe recargar (caché expirada)

### 4. Prueba de Rendimiento

**Con DevTools Network:**
1. Abrir **Network tab** en DevTools
2. Navegar entre secciones: Vehículos → Reservas → Clientes → Vehículos
3. **Primera visita**: Debe haber requests a Supabase
4. **Visitas posteriores** (dentro del tiempo de caché): No debe haber requests

**Tiempo de respuesta esperado:**
- Primera carga: ~500-1000ms (depende de la conexión)
- Cargas desde caché: <50ms (instantáneo)

### 5. Prueba de Múltiples Tablas

Verificar que cada sección usa su propio tiempo de caché:
- **Extras**: Crear uno → navegar fuera → esperar 20 min → volver = aún en caché
- **Reservas**: Crear una → navegar fuera → esperar 15 min → volver = debe recargar

## 🐛 Solución de Problemas

### Los datos no se actualizan después de editar

**Problema**: Cambias un registro pero no se refleja en la tabla

**Solución**: Verificar que después de la operación se llama a `refetch()`:
```typescript
await supabase.from('tabla').update(...)
refetch(); // ¡Importante!
```

### La caché se siente "demasiado fresca"

**Problema**: Quieres datos más actualizados para una sección específica

**Solución**: Reducir el `staleTime` en el hook correspondiente:
```typescript
useAdminData({
  staleTime: 1000 * 60 * 5, // 5 minutos en lugar de 1 hora
  // ...
})
```

### Ver datos en caché aunque no deberían estarlo

**Problema**: Los datos están en caché pero ya expiraron según el staleTime

**Posible causa**: React Query también tiene `gcTime` (Garbage Collection Time) que mantiene los datos en memoria aunque estén "stale"

**Solución**: Forzar limpieza manual:
```typescript
queryClient.invalidateQueries({ queryKey: ['mi-tabla'] });
```

## 📈 Métricas de Éxito

Después de implementar esta optimización, deberías observar:

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tiempo de navegación entre secciones | 500-1000ms | <50ms | **95% más rápido** |
| Requests a Supabase (10 navegaciones) | ~10 requests | ~2-3 requests | **70-80% menos** |
| Uso de ancho de banda | Alto | Bajo | **Significativa reducción** |
| Experiencia de usuario | Spinners frecuentes | Navegación fluida | **Excelente** |
| Consumo de recursos del servidor | Alto | Bajo | **Reducción notable** |
