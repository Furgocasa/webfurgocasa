# Corrección: Datos de Clientes - Total Reservas y Total Gastado

**Fecha**: 20 de Enero 2026 - v1.0.5  
**Estado**: ✅ COMPLETADO

---

## 🚨 Problemas Identificados

### 1. Campos `total_bookings` y `total_spent` no se mostraban correctamente

En la lista de clientes (`/administrator/clientes`), no se estaban cargando ni mostrando los campos calculados `total_bookings` y `total_spent` que existen en la tabla `customers`.

**Síntomas**:
- La columna "Reservas" mostraba siempre 0 o valores incorrectos
- No había columna "Total gastado"
- Los totales no coincidían con los datos reales de la base de datos

### 2. No existía página de detalle del cliente

No existía la ruta `/administrator/clientes/[id]/page.tsx`, por lo que al hacer clic en el icono "Ver detalles" (👁️) desde la lista de clientes, la página no cargaba.

---

## ✅ Soluciones Aplicadas

### 1. Corregir consulta de clientes en lista

**Archivo**: `src/app/administrator/(protected)/clientes/page.tsx`

#### Cambio 1: Actualizar interface
```typescript
// ✅ CORRECTO - Interface con campos calculados
interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  dni: string | null;
  city: string | null;
  country: string | null;
  created_at: string | null;
  total_bookings: number;      // ✅ Añadido
  total_spent: number;          // ✅ Añadido
  bookings?: { count: number }[];
}
```

#### Cambio 2: Simplificar query en usePaginatedData
```typescript
// ❌ ANTES - Intentaba hacer join con bookings(count)
select: `
  *,
  bookings:bookings(count)
`,

// ✅ AHORA - Usa directamente los campos calculados de la tabla
select: '*',
```

**Razón**: Los campos `total_bookings` y `total_spent` ya están calculados y mantenidos por triggers en la tabla `customers`, por lo que NO es necesario hacer joins adicionales.

#### Cambio 3: Añadir columna "Total gastado" en la tabla
```tsx
// Añadida nueva columna en thead
<th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Total gastado</th>

// Añadida celda correspondiente en tbody
<td className="px-6 py-4 text-center">
  <span className="font-semibold text-green-600">
    {(customer.total_spent || 0).toFixed(2)}€
  </span>
</td>
```

#### Cambio 4: Actualizar columna "Reservas" para usar `total_bookings`
```tsx
// ❌ ANTES - Contaba desde bookings(count) que no existe
{customer.bookings?.[0]?.count || 0}

// ✅ AHORA - Usa el campo calculado
{customer.total_bookings || 0}
```

#### Cambio 5: Actualizar estadística "Con reservas"
```tsx
// ❌ ANTES - Dependía de bookings join
{customersList.filter(c => c.bookings && c.bookings.length > 0).length}

// ✅ AHORA - Usa total_bookings
{customersList.filter(c => (c.total_bookings || 0) > 0).length}
```

---

### 2. Crear página de detalle del cliente

**Archivo creado**: `src/app/administrator/(protected)/clientes/[id]/page.tsx`

#### Funcionalidades implementadas:

1. **Información completa del cliente**
   - Datos personales (nombre, email, teléfono, DNI)
   - Dirección completa
   - Fecha de nacimiento
   - Permiso de conducir (número y fecha de vencimiento)
   - Notas internas

2. **Estadísticas del cliente**
   - Total de reservas (`total_bookings`)
   - Total gastado (`total_spent`)
   - Reservas activas (pending, confirmed, in_progress)
   - Reservas completadas

3. **Historial de reservas completo**
   - Listado de todas las reservas del cliente
   - Información de cada reserva:
     - Número de reserva
     - Vehículo asignado (con código interno)
     - Fechas de recogida y devolución
     - Días de alquiler
     - Precio total
     - Estado de la reserva
     - Estado del pago
   - Enlace a cada reserva para ver detalles completos

4. **Acciones disponibles**
   - Editar cliente (botón naranja)
   - Eliminar cliente (botón rojo, deshabilitado si tiene reservas activas)
   - Volver a lista de clientes

5. **Resumen por estado de reservas**
   - Tarjeta con reservas activas/pendientes (amarillo)
   - Tarjeta con reservas completadas (gris)
   - Tarjeta con reservas canceladas (rojo)

#### Código destacado:

```typescript
// ✅ Carga datos del cliente directamente
const { data: customerData, error: customerError } = await supabase
  .from('customers')
  .select('*')
  .eq('id', customerId)
  .single();

// ✅ Carga historial de reservas del cliente
const { data: bookingsData, error: bookingsError } = await supabase
  .from('bookings')
  .select(`
    id,
    booking_number,
    pickup_date,
    dropoff_date,
    days,
    total_price,
    status,
    payment_status,
    vehicle:vehicles(name, internal_code)
  `)
  .eq('customer_id', customerId)
  .order('pickup_date', { ascending: false });
```

---

### 3. Corregir importación en ClientActions

**Archivo**: `src/app/administrator/(protected)/clientes/client-actions.tsx`

```typescript
// ❌ ANTES - Importación incorrecta (singleton)
import supabase from "@/lib/supabase/client";

const handleDelete = async () => {
  const { data, error } = await supabase...
}

// ✅ AHORA - Importación correcta y crear instancia
import { createClient } from "@/lib/supabase/client";

const handleDelete = async () => {
  const supabase = createClient(); // Nueva instancia
  const { data, error } = await supabase...
}
```

**Razón**: Consistente con la arquitectura v1.0.4 - NUNCA usar singleton, SIEMPRE crear nueva instancia.

---

## 📋 Archivos Modificados

### Archivos Creados (1)
1. `src/app/administrator/(protected)/clientes/[id]/page.tsx` - Página de detalle del cliente (530 líneas)

### Archivos Modificados (2)
1. `src/app/administrator/(protected)/clientes/page.tsx`
   - Actualizada interface `Customer` (añadidos `total_bookings` y `total_spent`)
   - Simplificado query (de join a `select: '*'`)
   - Añadida columna "Total gastado"
   - Actualizada columna "Reservas" para usar `total_bookings`
   - Actualizada estadística "Con reservas"

2. `src/app/administrator/(protected)/clientes/client-actions.tsx`
   - Corregida importación de `createClient`
   - Creada instancia de Supabase dentro de `handleDelete`

---

## 🎯 Resultado

### Antes
- ❌ Columna "Reservas" mostraba valores incorrectos (0 o vacío)
- ❌ No había columna "Total gastado"
- ❌ No existía página de detalle del cliente
- ❌ Clic en "Ver detalles" (👁️) no funcionaba
- ❌ `client-actions.tsx` usaba singleton (problema arquitectónico)

### Después
- ✅ Columna "Reservas" muestra correctamente `total_bookings` desde la BD
- ✅ Nueva columna "Total gastado" muestra `total_spent` en formato €
- ✅ Página de detalle del cliente completamente funcional
- ✅ Ruta `/administrator/clientes/[id]` funciona correctamente
- ✅ Historial completo de reservas del cliente
- ✅ Estadísticas precisas (activas, completadas, canceladas)
- ✅ `client-actions.tsx` usa correctamente `createClient()` (v1.0.4)

---

## 🧪 Testing Realizado

### 1. Lista de clientes (`/administrator/clientes`)
- [x] Columna "Reservas" muestra el número correcto
- [x] Columna "Total gastado" muestra el total en €
- [x] Estadística "Con reservas" cuenta correctamente
- [x] Botón "Ver detalles" (👁️) redirige correctamente

### 2. Detalle del cliente (`/administrator/clientes/[id]`)
- [x] Página carga correctamente
- [x] Muestra toda la información personal del cliente
- [x] Muestra estadísticas correctas (total_bookings, total_spent)
- [x] Muestra historial completo de reservas
- [x] Enlaces a reservas individuales funcionan
- [x] Botón "Editar cliente" funciona
- [x] Botón "Eliminar" está deshabilitado si hay reservas activas
- [x] Botón "Volver a clientes" funciona

### 3. Consistencia de datos
- [x] Los totales en la lista coinciden con los de la página de detalle
- [x] Los totales en la página de detalle coinciden con los de la página de reservas
- [x] Los datos son consistentes en todas las vistas

---

## 📚 Documentación Relacionada

- **[README.md](./README.md)** - Reglas absolutas de arquitectura
- **[CORRECCION-ERRORES-ADMIN.md](./CORRECCION-ERRORES-ADMIN.md)** - Fix crítico v1.0.4 (singleton)
- **[REGLAS-ARQUITECTURA-NEXTJS.md](./REGLAS-ARQUITECTURA-NEXTJS.md)** - REGLA #0: Cliente Supabase
- **[RESUMEN-FIX-CRITICO-v1.0.4.md](./RESUMEN-FIX-CRITICO-v1.0.4.md)** - Resumen ejecutivo v1.0.4
- **[MIGRACION-CLIENTES-NORMALIZADOS.md](./MIGRACION-CLIENTES-NORMALIZADOS.md)** - Triggers que calculan totales

---

## 🔍 Cómo Funcionan los Totales (Referencia)

Los campos `total_bookings` y `total_spent` en la tabla `customers` son **calculados automáticamente** por triggers de base de datos:

### Trigger 1: `update_customer_stats_on_booking_insert`
Se ejecuta cuando se crea una nueva reserva.

### Trigger 2: `update_customer_stats_on_booking_update`
Se ejecuta cuando se actualiza el precio o estado de una reserva.

### Función: `update_customer_stats()`
Calcula:
- `total_bookings`: `COUNT(*)` de todas las reservas del cliente
- `total_spent`: `SUM(total_price)` de todas las reservas NO canceladas

**Archivo de migración**: `supabase/migrate-bookings-to-normalized-customers.sql`

Por esta razón, NO es necesario hacer joins o cálculos en el frontend. Los campos ya están actualizados en la tabla `customers`.

---

## ⚠️ IMPORTANTE: Mantener Arquitectura v1.0.4

Este fix mantiene la arquitectura establecida en v1.0.4:

1. ✅ Usa `createClient()` (NO singleton)
2. ✅ Crea nueva instancia en cada función async
3. ✅ Usa campos calculados de la BD (no recalcula en frontend)
4. ✅ Sigue las reglas de `REGLAS-ARQUITECTURA-NEXTJS.md`

**Regla de Oro**: SI FUNCIONA, NO LO TOQUES.

---

**Commit**: `fix: corregir visualización de totales de clientes y crear página de detalle`  
**Fecha**: 20 de Enero 2026  
**Versión**: 1.0.5  
**Estado**: ✅ Completado y testeado
