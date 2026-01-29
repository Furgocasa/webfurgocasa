# Fix: Sincronización Automática de Estadísticas de Clientes

**Fecha:** 29 de enero de 2026  
**Problema resuelto:** Contadores `total_bookings` y `total_spent` duplicados o inconsistentes

## 🔴 Problema Identificado

Un cliente nuevo hacía una reserva y su contador `total_bookings` mostraba 2 en lugar de 1, aunque solo existía una reserva real en la base de datos.

### Causa Raíz

El código en `src/app/api/bookings/create/route.ts` actualizaba manualmente las estadísticas del cliente usando un patrón read-modify-write:

```typescript
// ❌ CÓDIGO ANTERIOR (PROBLEMÁTICO)
const { data: currentCustomer } = await supabase
  .from("customers")
  .select("total_bookings,total_spent")
  .eq("id", customerStats.customer_id)
  .single();

if (currentCustomer) {
  await supabase
    .from("customers")
    .update({
      total_bookings: (currentCustomer.total_bookings || 0) + 1,
      total_spent: (currentCustomer.total_spent || 0) + customerStats.total_price,
    })
    .eq("id", customerStats.customer_id);
}
```

**Problemas de este enfoque:**

1. **Condiciones de carrera**: Si dos reservas se crean simultáneamente, ambas pueden leer el mismo valor inicial y sobrescribirse mutuamente
2. **No es atómico**: Entre la lectura y la escritura puede cambiar el valor
3. **Duplicación de lógica**: Si se crean reservas desde admin u otros lugares, hay que recordar actualizar los contadores
4. **Difícil de mantener**: Propenso a errores y olvidos

## ✅ Solución Implementada

### 1. Triggers de Base de Datos

Se crearon triggers automáticos en PostgreSQL que mantienen sincronizados los contadores:

- `trigger_update_customer_stats_insert`: Se dispara al crear una reserva
- `trigger_update_customer_stats_update`: Se dispara al modificar una reserva (status, precio o cliente)
- `trigger_update_customer_stats_delete`: Se dispara al eliminar una reserva

**Archivo:** `supabase/auto-update-customer-stats.sql`

### 2. Eliminación de Código Manual

Se eliminó el código manual de actualización en:

- ✅ `src/app/api/bookings/create/route.ts` (líneas 120-140)
- ✅ `src/app/es/reservar/nueva/page.tsx` (parámetro `customerStats`)
- ✅ `src/app/en/book/new/page.tsx` (parámetro `customerStats`)
- ✅ `src/app/fr/reserver/nouvelle/page.tsx` (parámetro `customerStats`)
- ✅ `src/app/de/buchen/neu/page.tsx` (parámetro `customerStats`)

## 📊 Ventajas de la Nueva Solución

| Característica | Código Manual | Triggers DB |
|----------------|---------------|-------------|
| **Atomicidad** | ❌ No | ✅ Sí |
| **Condiciones de carrera** | ❌ Vulnerables | ✅ Inmunes |
| **Consistencia garantizada** | ❌ No | ✅ Sí |
| **Funciona desde cualquier lugar** | ❌ Solo si recuerdas llamarlo | ✅ Automático |
| **Mantenimiento** | ❌ Alto (duplicado) | ✅ Bajo (centralizado) |
| **Maneja cancelaciones** | ⚠️ Hay que implementarlo | ✅ Ya implementado |

## 🔧 Cómo Funciona

```sql
-- Cuando se crea/modifica/elimina una reserva:
CREATE TRIGGER trigger_update_customer_stats_insert
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_customer_stats();
```

La función `recalculate_customer_stats()`:

1. Identifica el `customer_id` afectado
2. Cuenta las reservas reales (excluyendo canceladas)
3. Suma el total gastado
4. Actualiza `customers.total_bookings` y `customers.total_spent`

**Todo esto ocurre en la misma transacción de base de datos**, garantizando consistencia.

## 📝 Script de Verificación

Para verificar que no hay inconsistencias:

```sql
-- Ver clientes con contadores incorrectos
SELECT 
  c.id,
  c.name,
  c.total_bookings AS contador_guardado,
  COUNT(b.id) AS reservas_reales,
  (COUNT(b.id) - c.total_bookings) AS diferencia
FROM customers c
LEFT JOIN bookings b ON b.customer_id = c.id AND b.status != 'cancelled'
GROUP BY c.id, c.name, c.total_bookings
HAVING COUNT(b.id) != c.total_bookings
ORDER BY diferencia DESC;
```

## 🚀 Implementación

1. ✅ Ejecutado script SQL de triggers: `supabase/auto-update-customer-stats.sql`
2. ✅ Corregidas inconsistencias existentes (1 cliente afectado)
3. ✅ Eliminado código manual del API
4. ✅ Eliminado parámetro `customerStats` del frontend (4 archivos)
5. ✅ Verificado que no hay errores de lint

## 🧪 Testing

Para probar que funciona:

1. Crear una reserva nueva desde el frontend
2. Verificar en Supabase que `total_bookings` se incrementa automáticamente
3. Cancelar la reserva (cambiar `status` a `cancelled`)
4. Verificar que `total_bookings` se decrementa automáticamente
5. Modificar `total_price` de una reserva existente
6. Verificar que `total_spent` se actualiza automáticamente

## 📚 Referencias

- Script SQL: `supabase/auto-update-customer-stats.sql`
- Esquema de BD: `supabase/schema.sql` (líneas 209-237 - tabla `customers`)
- API modificada: `src/app/api/bookings/create/route.ts`

## 🔮 Futuras Mejoras

Este mismo patrón se puede aplicar a otros contadores si es necesario:

- Estadísticas de vehículos (número de reservas por vehículo)
- Contadores de uso de cupones
- Métricas agregadas para analytics

---

**Estado:** ✅ Completado y desplegado  
**Impacto:** Alto - Evita inconsistencias críticas en datos de clientes
