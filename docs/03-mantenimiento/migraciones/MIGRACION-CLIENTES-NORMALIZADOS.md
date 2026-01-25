# 🔄 Migración a Arquitectura Normalizada - Datos de Clientes

**Fecha:** 2026-01-20  
**Objetivo:** Eliminar redundancia de datos de clientes en la tabla `bookings`, manteniendo un único punto de verdad en la tabla `customers`.

---

## 📋 Cambios Implementados

### 1. Base de Datos (`supabase/migrate-bookings-to-normalized-customers.sql`)

**Columnas ELIMINADAS de `bookings`:**
- ❌ `customer_phone`
- ❌ `customer_dni`
- ❌ `customer_address`
- ❌ `customer_city`
- ❌ `customer_postal_code`
- ❌ `customer_country`

**Columnas CONSERVADAS en `bookings` (snapshot básico para GDPR/auditoría):**
- ✅ `customer_id` (referencia a `customers`)
- ✅ `customer_name`
- ✅ `customer_email`

**Migración:**
- Crea backup temporal de datos antes de eliminar columnas
- Sincroniza datos faltantes de `bookings` → `customers`
- Elimina columnas redundantes
- Agrega comentarios descriptivos

---

### 2. Formulario de Edición de Reservas

**Archivo:** `src/app/administrator/(protected)/reservas/[id]/editar/page.tsx`

**Cambios:**
- ✅ Carga datos del cliente desde `customers` mediante JOIN
- ✅ Edita datos del cliente directamente en la tabla `customers`
- ✅ Actualiza snapshot básico (`customer_name`, `customer_email`) en `bookings`
- ✅ Incluye campo de país con lista de países predefinidos
- ✅ Incluye todos los campos del cliente: DNI, dirección, código postal, país, fecha de nacimiento, permiso de conducir
- ✅ Muestra mensaje informativo indicando que los cambios afectan a todas las reservas del cliente

**Interfaz `Customer`:**
```typescript
interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  dni: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  date_of_birth: string | null;
  driver_license: string | null;
  driver_license_expiry: string | null;
}
```

---

### 3. Creación de Reservas

**Archivo:** `src/app/reservar/nueva/page.tsx`

**Cambios:**
- ✅ Elimina envío de campos redundantes a la API (`customer_phone`, `customer_dni`, etc.)
- ✅ Solo envía `customer_name` y `customer_email` como snapshot
- ✅ Todos los datos se guardan en `customers`, la reserva solo mantiene referencia

---

### 4. Vista de Detalle de Reserva (Admin)

**Archivo:** `src/app/administrator/(protected)/reservas/[id]/page.tsx`

**Cambios:**
- ✅ Carga datos del cliente mediante JOIN con `customers`
- ✅ Muestra todos los datos del cliente desde la relación
- ✅ Incluye campo de país en la visualización
- ✅ Maneja caso de cliente eliminado (muestra snapshot de `customer_name` y `customer_email`)

**Query actualizada:**
```typescript
const { data, error } = await supabase
  .from('bookings')
  .select(`
    *,
    customer:customers(
      id, name, email, phone, dni, 
      address, city, postal_code, country, 
      total_bookings
    ),
    ...
  `)
```

---

### 5. Página de Nuevo Cliente

**Archivo:** `src/app/administrator/(protected)/clientes/nuevo/page.tsx`

**Características:**
- ✅ Formulario completo para crear nuevos clientes
- ✅ Validación de email único
- ✅ Campos organizados en secciones:
  - Datos Personales (nombre, email, teléfono, DNI, fecha de nacimiento)
  - Dirección (dirección completa, ciudad, código postal, país)
  - Datos de Conducción (permiso, fecha de vencimiento)
  - Notas Internas
- ✅ Selector de país con lista extensa de países
- ✅ Validación de campos obligatorios
- ✅ Mensajes de error y éxito
- ✅ Redirección automática tras crear el cliente

---

## 🎯 Beneficios de la Nueva Arquitectura

### 1. **Único Punto de Verdad**
- Los datos del cliente se editan solo en `customers`
- Cambios se reflejan automáticamente en todas las reservas

### 2. **Reducción de Redundancia**
- Menos datos duplicados
- Menor riesgo de inconsistencias
- Base de datos más limpia y eficiente

### 3. **Facilidad de Mantenimiento**
- Un solo lugar para actualizar información del cliente
- Queries más simples y comprensibles
- Menos propenso a errores

### 4. **Cumplimiento GDPR**
- Snapshot básico (`customer_name`, `customer_email`) para auditoría
- Si se elimina un cliente, las reservas mantienen datos mínimos
- Fácil localizar y modificar todos los datos de un cliente

### 5. **Mejor UX**
- Cliente corrige su teléfono → se actualiza en todas sus reservas
- Datos siempre actualizados sin intervención manual
- Menos confusión sobre dónde editar los datos

---

## 📝 Cómo Usar el Nuevo Sistema

### Para Editar Datos de un Cliente:

**Opción 1 - Desde una Reserva:**
1. Ve a la reserva en `/administrator/reservas/[id]/editar`
2. Edita los datos del cliente en la sección "Datos del Cliente"
3. Los cambios se guardan en `customers` y afectan a todas sus reservas

**Opción 2 - Directamente desde Clientes:**
1. Ve a `/administrator/clientes`
2. Busca el cliente
3. (Futura funcionalidad: editar directamente desde el listado)

### Para Crear un Nuevo Cliente:
1. Ve a `/administrator/clientes`
2. Haz clic en "Añadir cliente"
3. Completa el formulario
4. El cliente estará disponible para futuras reservas

---

## 🔧 Queries de Ejemplo

### Obtener Reserva con Datos del Cliente:
```typescript
const { data } = await supabase
  .from('bookings')
  .select(`
    *,
    customer:customers(
      id, name, email, phone, dni,
      address, city, postal_code, country,
      date_of_birth, driver_license, driver_license_expiry
    )
  `)
  .eq('id', bookingId)
  .single();

// Acceder a datos del cliente:
const customerPhone = data.customer.phone;
const customerCountry = data.customer.country;
```

### Actualizar Datos del Cliente:
```typescript
// ✅ CORRECTO - Actualizar en customers
await supabase
  .from('customers')
  .update({
    phone: '+34 600 123 456',
    country: 'España'
  })
  .eq('id', customerId);

// ❌ INCORRECTO - Ya no existen estos campos en bookings
await supabase
  .from('bookings')
  .update({
    customer_phone: '+34 600 123 456',  // ❌ Campo eliminado
    customer_country: 'España'          // ❌ Campo eliminado
  })
  .eq('id', bookingId);
```

---

## ⚠️ Importante

### Ejecutar la Migración SQL
Antes de usar el código actualizado, debes ejecutar el script de migración:

```bash
# En Supabase SQL Editor, ejecuta:
supabase/migrate-bookings-to-normalized-customers.sql
```

Este script:
1. Crea backup de datos
2. Sincroniza datos faltantes
3. Elimina columnas redundantes
4. Agrega documentación

### Revisar Código Existente
Si tienes otros archivos que usan los campos eliminados (`customer_phone`, `customer_dni`, etc.), deberás actualizarlos para:
1. Hacer JOIN con `customers`
2. Acceder a los datos mediante `booking.customer.phone` en lugar de `booking.customer_phone`

---

## 📂 Archivos Modificados

```
✅ supabase/migrate-bookings-to-normalized-customers.sql (nuevo)
✅ src/app/administrator/(protected)/reservas/[id]/editar/page.tsx
✅ src/app/administrator/(protected)/reservas/[id]/page.tsx
✅ src/app/reservar/nueva/page.tsx
✅ src/app/administrator/(protected)/clientes/nuevo/page.tsx (nuevo)
```

---

## 🚀 Próximos Pasos

1. **Ejecutar migración SQL** en producción
2. **Probar** la edición de clientes desde reservas
3. **Verificar** que las reservas existentes cargan correctamente
4. **Implementar** página de edición directa de clientes (opcional)
5. **Actualizar** cualquier otro código que use campos eliminados

---

**¿Preguntas o Problemas?**  
Revisa el script SQL de migración para más detalles técnicos.
