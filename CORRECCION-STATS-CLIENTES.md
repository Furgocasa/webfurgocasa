# CORRECCIÓN: Estadísticas de Clientes (Total Bookings y Total Spent)

**Fecha:** 20 Enero 2026  
**Versión:** 1.1  
**Criticidad:** ⚠️ MEDIA - Afecta visualización de datos, no funcionalidad crítica

---

## 📋 PROBLEMA IDENTIFICADO

En la sección de **Administrador > Clientes** (`/administrator/clientes`), las columnas "Reservas" y "Total gastado" muestran **CEROS para todos los clientes**, incluso cuando tienen reservas reales en el sistema.

### Causa raíz

Los campos `total_bookings` y `total_spent` en la tabla `customers`:

1. ❌ **No se calcularon inicialmente** con los datos históricos de reservas existentes
2. ❌ **No se actualizan automáticamente** cuando se crean/modifican/eliminan reservas

---

## ✅ SOLUCIÓN IMPLEMENTADA

He creado el script SQL **`fix-customer-stats-complete.sql`** que:

### 1. **Recalcula datos históricos**
- Extrae todas las reservas de cada cliente desde la tabla `bookings`
- Calcula el número total de reservas (incluyendo canceladas)
- Calcula el total gastado (excluyendo reservas canceladas)
- Actualiza los campos `total_bookings` y `total_spent` en `customers`

### 2. **Crea triggers automáticos**
Tres triggers que mantienen las estadísticas sincronizadas:

- **Al insertar una reserva**: Suma +1 al contador y actualiza el gasto
- **Al actualizar una reserva**: Recalcula si cambia el precio, estado o cliente
- **Al eliminar una reserva**: Resta del contador y actualiza el gasto

### 3. **Valida todo el proceso**
- Reportes antes/después
- Verificación de triggers activos
- Detección de discrepancias
- Top 10 clientes por gasto
- Identificación de reservas sin cliente asignado

---

## 🚀 CÓMO EJECUTAR EL SCRIPT

### Opción A: Desde Supabase Dashboard (RECOMENDADO)

1. **Accede a tu proyecto Supabase**
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto Furgocasa

2. **Abre el SQL Editor**
   - En el menú lateral, click en **SQL Editor**
   - Click en **New query**

3. **Copia y pega el script**
   - Abre el archivo: `supabase/fix-customer-stats-complete.sql`
   - Copia TODO el contenido
   - Pégalo en el editor SQL

4. **Ejecuta el script**
   - Click en el botón **RUN** (o presiona Ctrl+Enter)
   - Espera a que termine (debería tomar 1-2 segundos)

5. **Revisa los reportes**
   - Verás varios reportes en la parte inferior:
     - ✅ Triggers activos (debe mostrar 3)
     - ✅ Estado antes/después
     - ✅ Top 10 clientes
     - ✅ Validación de discrepancias (debe ser 0)

### Opción B: Desde CLI de Supabase

```bash
cd "e:\Acttax Dropbox\Narciso Pardo\Eskala IA\W - NUEVA FURGOCASA\furgocasa-app"
supabase db execute --file supabase/fix-customer-stats-complete.sql
```

---

## 📊 QUÉ ESPERAR

### Antes de ejecutar

```
╔═══════════════════════════════════════╗
║  Total Clientes: 50                   ║
║  Con reservas (stored): 0             ║
║  Total bookings: 0                    ║
║  Total spent: 0.00€                   ║
╚═══════════════════════════════════════╝
```

### Después de ejecutar

```
╔═══════════════════════════════════════╗
║  Total Clientes: 50                   ║
║  Con reservas: 28                     ║
║  Total bookings: 147                  ║
║  Total spent: 125,430.50€             ║
╚═══════════════════════════════════════╝
```

*(Los números exactos dependerán de tus datos reales)*

---

## 🔍 VERIFICACIÓN EN LA WEB

1. **Accede al panel de administración**
   ```
   https://www.furgocasa.com/administrator/clientes
   ```

2. **Verifica que las columnas ahora muestran datos:**
   - ✅ Columna "Reservas" debe mostrar números > 0 para clientes con reservas
   - ✅ Columna "Total gastado" debe mostrar importes en euros
   - ✅ Las estadísticas superiores deben actualizarse:
     - "Con reservas" debe ser > 0
     - Los totales deben coincidir

3. **Prueba crear una nueva reserva**
   - Ve a `Reservas > Nueva reserva`
   - Crea una reserva de prueba con un cliente existente
   - Vuelve a la sección de Clientes
   - ✅ Los contadores del cliente deben haberse actualizado automáticamente

---

## 🧪 VALIDACIONES ADICIONALES (OPCIONAL)

### Verificar que los triggers están activos

```sql
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE trigger_name LIKE '%customer_stats%'
  AND event_object_table = 'bookings'
ORDER BY trigger_name;
```

**Resultado esperado:** 3 filas (INSERT, UPDATE, DELETE)

---

### Comparar datos calculados vs almacenados

```sql
WITH calculated AS (
    SELECT 
        customer_id,
        COUNT(*) as real_bookings,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END), 0) as real_spent
    FROM bookings
    WHERE customer_id IS NOT NULL
    GROUP BY customer_id
)
SELECT 
    c.name,
    c.email,
    c.total_bookings as stored,
    calc.real_bookings as calculated,
    (c.total_bookings = calc.real_bookings) as match
FROM customers c
INNER JOIN calculated calc ON c.id = calc.customer_id
WHERE c.total_bookings != calc.real_bookings  -- Solo mostrar discrepancias
LIMIT 10;
```

**Resultado esperado:** Sin filas (todas coinciden)

---

### Ver clientes sin reservas asignadas

```sql
-- Identifica reservas que no tienen customer_id asignado
SELECT 
    booking_number,
    customer_name,
    customer_email,
    total_price,
    status,
    created_at
FROM bookings
WHERE customer_id IS NULL
ORDER BY created_at DESC
LIMIT 10;
```

**Acción requerida:** Si hay reservas sin `customer_id`, deberías asignarlas manualmente a clientes existentes o crear los clientes correspondientes.

---

## 🔧 MANTENIMIENTO FUTURO

### Los triggers se ejecutan automáticamente en estos casos:

✅ **Nueva reserva creada** → Incrementa `total_bookings` y suma `total_price`  
✅ **Reserva actualizada** (cambio de precio) → Recalcula `total_spent`  
✅ **Reserva actualizada** (cambio de estado a cancelada) → Resta del `total_spent`  
✅ **Reserva eliminada** → Decrementa `total_bookings` y resta del `total_spent`  
✅ **Reserva reasignada a otro cliente** → Actualiza ambos clientes

### ⚠️ Casos especiales a tener en cuenta:

1. **Reservas sin customer_id**  
   - Las reservas sin cliente asignado NO cuentan para las estadísticas
   - Asegúrate de que todas las reservas tengan un `customer_id` válido

2. **Reservas canceladas**  
   - Se cuentan en `total_bookings` (para historial)
   - NO se cuentan en `total_spent` (solo ingresos reales)

3. **Eliminación de clientes con reservas**  
   - Si eliminas un cliente, sus reservas quedan sin `customer_id`
   - Recomendación: Mejor marcar clientes como "inactivos" en lugar de eliminarlos

---

## 📝 CAMBIOS EN EL CÓDIGO

El script **NO requiere cambios en el código de la aplicación**. Todo funciona a nivel de base de datos mediante triggers.

### Archivos afectados:

- ✅ `supabase/fix-customer-stats-complete.sql` (NUEVO)
- ✅ `supabase/create-customer-stats-triggers.sql` (Ya existía, mejorado)
- ✅ `CORRECCION-STATS-CLIENTES.md` (Este documento)

### Archivos que NO necesitan modificación:

- ❌ `src/app/administrator/(protected)/clientes/page.tsx` - Lee los campos directamente de la BD
- ❌ Cualquier otro código de frontend/backend

---

## 🐛 TROUBLESHOOTING

### Problema: Los números siguen en cero después de ejecutar

**Causa:** El script no se ejecutó correctamente o hubo un error

**Solución:**
1. Revisa los mensajes de error en el SQL Editor de Supabase
2. Verifica que tienes permisos de administrador en la BD
3. Ejecuta manualmente solo la parte de UPDATE:

```sql
UPDATE customers c
SET 
    total_bookings = (SELECT COUNT(*) FROM bookings WHERE customer_id = c.id),
    total_spent = (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE customer_id = c.id AND status != 'cancelled'),
    updated_at = NOW();
```

---

### Problema: Los triggers no se actualizan automáticamente

**Causa:** Los triggers no se crearon correctamente

**Solución:**
1. Verifica que existen:
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name LIKE '%customer_stats%';
```

2. Si no aparecen 3 triggers, recrea solo esa parte del script (líneas 52-115 del archivo SQL)

---

### Problema: Hay discrepancias entre datos calculados y almacenados

**Causa:** Se modificaron reservas directamente en la BD sin pasar por los triggers

**Solución:**
Vuelve a ejecutar solo la parte de recálculo:

```sql
UPDATE customers c
SET 
    total_bookings = (SELECT COUNT(*) FROM bookings WHERE customer_id = c.id),
    total_spent = (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE customer_id = c.id AND status != 'cancelled'),
    updated_at = NOW();
```

---

## 📞 SOPORTE

Si tienes problemas ejecutando el script o los datos no se actualizan correctamente:

1. **Copia los mensajes de error** del SQL Editor
2. **Ejecuta el query de validación** (sección "Verificar triggers")
3. **Revisa los logs** de Supabase en Dashboard > Logs

---

## ✅ CHECKLIST FINAL

Después de ejecutar el script, verifica:

- [ ] Los 3 triggers están activos (`trigger_update_customer_stats_on_*`)
- [ ] La columna "Reservas" en `/administrator/clientes` muestra números > 0
- [ ] La columna "Total gastado" muestra importes correctos
- [ ] Las estadísticas superiores se actualizaron
- [ ] Al crear una nueva reserva de prueba, los contadores se actualizan automáticamente
- [ ] Los reportes de validación muestran 0 discrepancias

---

**Estado:** ✅ LISTO PARA EJECUTAR  
**Tiempo estimado:** 2-3 minutos  
**Riesgo:** BAJO (solo lectura y actualización de campos calculados)  
**Rollback:** No necesario (no modifica datos críticos)
