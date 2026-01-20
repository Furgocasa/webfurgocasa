# Fix Crítico: Triggers Faltantes para Estadísticas de Clientes

**Fecha**: 20 de Enero 2026 - v1.0.5  
**Prioridad**: 🔴 **CRÍTICA**  
**Estado**: ⏳ **PENDIENTE DE APLICAR EN SUPABASE**

---

## 🚨 PROBLEMA CRÍTICO DESCUBIERTO

Los campos `total_bookings` y `total_spent` en la tabla `customers` **NO se están actualizando automáticamente** porque **FALTAN LOS TRIGGERS** en la base de datos.

### Síntomas

1. En todas las páginas que muestran datos de clientes:
   - `total_bookings` siempre muestra **0**
   - `total_spent` siempre muestra **0.00€**
   
2. Afecta a:
   - `/administrator/clientes` - Lista de clientes
   - `/administrator/clientes/[id]` - Detalle del cliente
   - `/administrator/reservas/[id]` - Detalle de reserva (sección del cliente)
   - `/administrator/reservas/[id]/editar` - Edición de reserva

### Causa Raíz

La tabla `customers` tiene las columnas `total_bookings` y `total_spent` definidas:

```sql
CREATE TABLE customers (
    ...
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    ...
);
```

**PERO NO HAY TRIGGERS** que actualicen estos valores cuando:
- Se crea una nueva reserva
- Se actualiza una reserva (precio o estado)
- Se elimina una reserva
- Se cambia el `customer_id` de una reserva

---

## ✅ SOLUCIÓN CREADA

He creado el archivo **`supabase/create-customer-stats-triggers.sql`** con:

### 1. Función Principal: `update_customer_stats()`

Calcula y actualiza las estadísticas del cliente:
- `total_bookings`: Cuenta TODAS las reservas del cliente
- `total_spent`: Suma el `total_price` de reservas NO canceladas

```sql
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_customer_id UUID;
    v_total_bookings INTEGER;
    v_total_spent DECIMAL(12,2);
BEGIN
    -- Determinar customer_id
    IF TG_OP = 'DELETE' THEN
        v_customer_id := OLD.customer_id;
    ELSE
        v_customer_id := NEW.customer_id;
    END IF;

    -- Calcular estadísticas
    SELECT 
        COUNT(*) as total,
        COALESCE(SUM(CASE 
            WHEN status != 'cancelled' THEN total_price 
            ELSE 0 
        END), 0) as spent
    INTO v_total_bookings, v_total_spent
    FROM bookings
    WHERE customer_id = v_customer_id;

    -- Actualizar customers
    UPDATE customers
    SET 
        total_bookings = v_total_bookings,
        total_spent = v_total_spent,
        updated_at = NOW()
    WHERE id = v_customer_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### 2. Tres Triggers

1. **`trigger_update_customer_stats_on_insert`**
   - Se ejecuta DESPUÉS de insertar una reserva
   - Actualiza stats del cliente de la nueva reserva

2. **`trigger_update_customer_stats_on_update`**
   - Se ejecuta DESPUÉS de actualizar status, total_price o customer_id
   - Actualiza stats del cliente afectado
   - Optimizado: solo se ejecuta si cambian campos relevantes

3. **`trigger_update_customer_stats_on_delete`**
   - Se ejecuta DESPUÉS de eliminar una reserva
   - Actualiza stats del cliente (restando la reserva eliminada)

### 3. Query de Recalculación Masiva

El script incluye un **UPDATE masivo** que recalcula las stats de **TODOS los clientes existentes**:

```sql
UPDATE customers c
SET 
    total_bookings = (
        SELECT COUNT(*)
        FROM bookings b
        WHERE b.customer_id = c.id
    ),
    total_spent = (
        SELECT COALESCE(SUM(b.total_price), 0)
        FROM bookings b
        WHERE b.customer_id = c.id
          AND b.status != 'cancelled'
    ),
    updated_at = NOW();
```

---

## 📋 PASOS PARA APLICAR EL FIX

### Opción A: Desde Supabase Dashboard (Recomendado)

1. Ir a https://supabase.com/dashboard
2. Seleccionar el proyecto Furgocasa
3. Ir a **SQL Editor**
4. Copiar TODO el contenido de `supabase/create-customer-stats-triggers.sql`
5. Pegar y hacer clic en **Run**
6. Verificar que aparece "Success" y no hay errores

### Opción B: Desde CLI de Supabase

```bash
# Si tienes Supabase CLI instalado
cd "e:\Acttax Dropbox\Narciso Pardo\Eskala IA\W - NUEVA FURGOCASA\furgocasa-app"
supabase db push --db-url "postgresql://..."
```

---

## 🧪 TESTING DESPUÉS DE APLICAR

### Test 1: Verificar que los triggers existen

```sql
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%customer_stats%'
ORDER BY trigger_name;
```

**Resultado esperado**: 3 triggers (`on_insert`, `on_update`, `on_delete`)

### Test 2: Verificar un cliente específico

Buscar un cliente que tenga reservas (ejemplo: Manuel Angel Galiano Gomis):

```sql
SELECT 
    c.id,
    c.name,
    c.email,
    c.total_bookings,
    c.total_spent,
    COUNT(b.id) as actual_bookings,
    COALESCE(SUM(CASE WHEN b.status != 'cancelled' THEN b.total_price ELSE 0 END), 0) as actual_spent
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id
WHERE c.email = 'manuel-galiano@hotmail.com'
GROUP BY c.id, c.name, c.email, c.total_bookings, c.total_spent;
```

**Resultado esperado**: 
- `total_bookings` > 0
- `total_spent` > 0
- `total_bookings` = `actual_bookings`
- `total_spent` = `actual_spent`

### Test 3: Verificar en la aplicación

1. Ir a https://webfurgocasa.vercel.app/administrator/clientes
2. Verificar que la columna "Total gastado" muestra valores > 0
3. Hacer clic en un cliente que tenga reservas
4. Verificar que las estadísticas muestran valores correctos
5. Ir a una reserva de ese cliente
6. Verificar que en la sección "Cliente" aparecen:
   - "Reservas totales: X" (X > 0)
   - "Total gastado: Y€" (Y > 0)

---

## 🎯 IMPACTO DEL FIX

### Antes (SIN triggers)
- ❌ `total_bookings` siempre 0
- ❌ `total_spent` siempre 0.00€
- ❌ No hay forma de ver cuántas reservas tiene un cliente
- ❌ No hay forma de ver cuánto ha gastado un cliente
- ❌ Columna "Total gastado" en lista de clientes inútil

### Después (CON triggers)
- ✅ `total_bookings` actualizado automáticamente
- ✅ `total_spent` calculado correctamente
- ✅ Stats actualizadas en tiempo real
- ✅ Columnas y tarjetas muestran datos reales
- ✅ Se puede identificar clientes VIP por gasto total
- ✅ Análisis de valor del cliente (CLV) posible

---

## ⚠️ IMPORTANTE

1. **EJECUTAR EL SCRIPT COMPLETO**: No solo crear los triggers, sino también el UPDATE masivo para recalcular stats existentes

2. **BACKUP ANTES**: Aunque el script solo hace UPDATE (no DELETE), siempre es buena práctica:
   ```sql
   -- Backup de customers
   CREATE TABLE customers_backup_20260120 AS 
   SELECT * FROM customers;
   ```

3. **VERIFICAR PERMISOS**: Asegurarse de que los triggers tienen permisos para ejecutarse

4. **MONITOREAR PERFORMANCE**: Los triggers se ejecutan en cada INSERT/UPDATE/DELETE de bookings. Normalmente esto es muy rápido, pero con miles de operaciones simultáneas podría haber impacto.

---

## 📚 Documentación Relacionada

- **[CORRECCION-CLIENTES-TOTALES.md](./CORRECCION-CLIENTES-TOTALES.md)** - Fix de visualización (frontend)
- **[MIGRACION-CLIENTES-NORMALIZADOS.md](./MIGRACION-CLIENTES-NORMALIZADOS.md)** - Estructura de customers
- **[README.md](./README.md)** - Arquitectura general
- **[supabase/create-customer-stats-triggers.sql](./supabase/create-customer-stats-triggers.sql)** - Script completo

---

## 🔄 HISTORIAL DE CAMBIOS

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 20 Ene 2026 | 1.0.5 | Identificado problema y creado script de triggers |

---

**🚨 ACCIÓN REQUERIDA**: 
Este script **DEBE ejecutarse en Supabase** para que los datos de clientes se muestren correctamente.

**Estado**: ⏳ Pendiente de aplicar  
**Archivo**: `supabase/create-customer-stats-triggers.sql`  
**Prioridad**: CRÍTICA
