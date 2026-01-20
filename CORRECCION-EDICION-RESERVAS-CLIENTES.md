# Corrección: Sistema de Normalización Cliente-Reserva

## Problema Identificado

Al intentar editar una reserva, el sistema intentaba actualizar campos de cliente (como `customer_address`) que ya no existen en la tabla `bookings` tras la normalización a la tabla `customers`, generando un error 400.

## Cambios Realizados

### 1. Página de Edición de Reservas (`src/app/administrator/(protected)/reservas/[id]/editar/page.tsx`)

**Antes:** 
- Permitía editar datos del cliente desde la página de reservas
- Intentaba actualizar la tabla `customers` y la tabla `bookings` con campos redundantes
- Los datos del cliente se mostraban en campos de formulario editables

**Después:**
- Los datos del cliente ahora son **solo lectura** en la página de edición de reservas
- Se muestra un botón "Editar cliente" que redirige a `/administrator/clientes/${customerId}`
- Solo se actualizan campos propios de la reserva:
  - Vehículo, fechas, ubicaciones
  - Precios y pagos
  - Estados (reserva y pago)
  - Extras
  - Notas
  - Snapshot básico del cliente (nombre y email para auditoría)

**Código eliminado:**
```typescript
// ELIMINADO: Ya no se editan datos del cliente aquí
const handleCustomerChange = (field: keyof Customer, value: any) => {
  setCustomerData(prev => prev ? { ...prev, [field]: value } : null);
};

// ELIMINADO: Ya no se actualiza la tabla customers desde aquí
const { error: customerError } = await supabase
  .from('customers')
  .update({ ... })
  .eq('id', customerId);
```

**Código actualizado:**
```typescript
// Solo se actualiza la reserva, no el cliente
const { error: updateError } = await supabase
  .from('bookings')
  .update({
    vehicle_id: formData.vehicle_id,
    pickup_location_id: formData.pickup_location_id,
    dropoff_location_id: formData.dropoff_location_id,
    pickup_date: formData.pickup_date,
    pickup_time: formData.pickup_time,
    dropoff_date: formData.dropoff_date,
    dropoff_time: formData.dropoff_time,
    days: formData.days,
    base_price: formData.base_price,
    extras_price: formData.extras_price,
    total_price: formData.total_price,
    deposit_amount: formData.deposit_amount,
    amount_paid: formData.amount_paid,
    status: formData.status,
    payment_status: formData.payment_status,
    // Snapshot básico del cliente (solo nombre y email para auditoría)
    customer_name: customerData?.name || formData.customer_name,
    customer_email: customerData?.email || formData.customer_email,
    notes: formData.notes,
    admin_notes: formData.admin_notes,
    updated_at: new Date().toISOString(),
  })
  .eq('id', bookingId);
```

**Interfaz actualizada:**
- Los campos de cliente ahora se muestran en cajas de fondo gris (`bg-gray-50`)
- Solo lectura (texto, no inputs)
- Botón destacado "Editar cliente" en la parte superior
- Mensaje informativo: "Los datos del cliente no se pueden editar desde aquí"

### 2. Nueva Página de Edición de Cliente (`src/app/administrator/(protected)/clientes/[id]/editar/page.tsx`)

**Creada nueva página completa para editar clientes** con:

**Secciones:**
1. **Datos Personales**: Nombre, email, teléfono, DNI, fecha de nacimiento
2. **Dirección**: Dirección completa, ciudad, código postal, país
3. **Datos de Conducción**: Número de permiso, fecha de vencimiento
4. **Notas Internas**: Campo de texto libre para notas sobre el cliente

**Sidebar con:**
- Estadísticas del cliente (total de reservas, total gastado, cliente desde)
- Información sobre el impacto de los cambios
- Botones de acción (Guardar/Cancelar)

**Funcionalidades:**
- Carga datos actuales del cliente
- Validación de campos obligatorios (nombre y email)
- Actualización en tabla `customers`
- Opción de eliminar cliente (con doble confirmación)
- Mensajes de éxito/error

### 3. Nueva Página de Creación de Reservas (`src/app/administrator/(protected)/reservas/nueva/page.tsx`)

**Creada nueva página completa para crear reservas desde el administrador** siguiendo el principio de separación de responsabilidades:

**Características principales:**
- **Campo de búsqueda de clientes** con autocompletado
  - Busca por nombre, email o teléfono
  - Dropdown con resultados filtrados en tiempo real
  - Solo permite **seleccionar** clientes existentes
- **NO permite crear clientes** desde aquí
- **Enlace destacado** para crear cliente nuevo (se abre en nueva pestaña)
- Validación de **conflictos de disponibilidad** del vehículo
- Cálculo automático de días y precios
- Gestión de extras y pagos
- Snapshot automático del cliente (nombre y email)

**Código del selector de cliente:**
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
  <input
    type="text"
    value={customerSearch}
    onChange={(e) => {
      setCustomerSearch(e.target.value);
      setShowCustomerDropdown(true);
    }}
    placeholder="Buscar por nombre, email o teléfono..."
    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
    required
  />
</div>

{/* Dropdown con clientes filtrados */}
{showCustomerDropdown && filteredCustomers.length > 0 && (
  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
    {filteredCustomers.map(customer => (
      <button onClick={() => handleCustomerSelect(customer)}>
        {customer.name} • {customer.email}
      </button>
    ))}
  </div>
)}

{/* Enlace para crear nuevo cliente */}
<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
  <Link href="/administrator/clientes/nuevo" target="_blank">
    <Plus /> Crear nuevo cliente (se abrirá en nueva pestaña)
  </Link>
</div>
```

### 4. Integración con Sistema Existente

**Botón "Editar cliente" en página de edición de reservas:**
```tsx
{customerId && (
  <Link
    href={`/administrator/clientes/${customerId}/editar`}
    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-furgocasa-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
  >
    Editar cliente
  </Link>
)}
```

**El componente `ClientActions` ya tenía el enlace correcto:**
- La lista de clientes (`/administrator/clientes`) ya tenía botones de edición
- Estos botones ya apuntaban a `/administrator/clientes/${customerId}/editar`
- Ahora esta ruta existe y funciona correctamente

## Arquitectura de Datos Normalizada

### Tabla `bookings` (después de migración)
```sql
-- Solo campos de reserva y snapshot mínimo del cliente
customer_id UUID REFERENCES customers(id)
customer_name VARCHAR(200)  -- Snapshot para GDPR/auditoría
customer_email VARCHAR(255)  -- Snapshot para GDPR/auditoría

-- YA NO EXISTEN (eliminados por migración):
-- customer_phone
-- customer_dni
-- customer_address
-- customer_city
-- customer_postal_code
-- customer_country
```

### Tabla `customers` (fuente única de verdad)
```sql
-- Todos los datos del cliente
name VARCHAR(200)
email VARCHAR(255)
phone VARCHAR(50)
dni VARCHAR(20)
address TEXT
city VARCHAR(100)
postal_code VARCHAR(20)
country VARCHAR(100)
date_of_birth DATE
driver_license VARCHAR(50)
driver_license_expiry DATE
notes TEXT
total_bookings INTEGER
total_spent DECIMAL(12,2)
```

### Carga de Datos del Cliente en Reservas

**Importante:** Aunque el cliente solo se **edita** en su propia página, cuando **visualizamos** una reserva (admin o frontend), **siempre se cargan TODOS los datos actuales del cliente** mediante JOIN desde la tabla `customers`.

**Query SQL usada en todas las páginas de visualización:**
```sql
SELECT 
  bookings.*,
  customers.id,
  customers.name,
  customers.email,
  customers.phone,
  customers.dni,
  customers.address,
  customers.city,
  customers.postal_code,
  customers.country,
  customers.date_of_birth,
  customers.driver_license,
  customers.driver_license_expiry,
  customers.notes,
  customers.total_bookings,
  customers.total_spent
FROM bookings
LEFT JOIN customers ON bookings.customer_id = customers.id
WHERE bookings.id = 'booking-id';
```

**Páginas actualizadas con carga completa:**
- ✅ `/administrator/reservas/[id]` - Ver reserva (admin)
- ✅ `/administrator/reservas/[id]/editar` - Editar reserva (admin)
- ✅ `/api/bookings/[id]` - API route para frontend
- ✅ `/reservar/[id]/confirmacion` - Confirmación (frontend)

## Flujo de Edición y Creación

### Para crear una nueva reserva:
1. Ir a `/administrator/reservas` → botón "Nueva reserva"
2. **Buscar y seleccionar** un cliente existente
   - Si no existe → clic en "Crear nuevo cliente" (nueva pestaña)
   - Crear el cliente y volver a la reserva
3. Seleccionar vehículo, fechas, ubicaciones
4. Añadir extras si es necesario
5. Configurar precios y pagos
6. Crear la reserva

### Para editar una reserva:
1. Ir a `/administrator/reservas/${id}/editar`
2. Editar: vehículo, fechas, ubicaciones, precios, extras, estados, notas
3. Ver datos del cliente (solo lectura)
4. Si necesitas editar el cliente → clic en "Editar cliente"

### Para editar un cliente:
1. Desde lista de clientes → botón "Editar" (icono lápiz)
2. O desde edición de reserva → botón "Editar cliente"
3. O desde nueva reserva → enlace "Crear nuevo cliente"
4. Editar todos los datos del cliente
5. Los cambios se reflejan en todas las reservas del cliente

## Beneficios

1. **Separación de responsabilidades clara**:
   - Clientes se crean/editan solo en `/administrator/clientes`
   - Reservas solo seleccionan/asignan clientes existentes
   - No hay duplicación de formularios de cliente
2. **Datos consistentes**: El cliente se edita en un solo lugar
3. **Sin redundancia**: No hay datos duplicados que puedan desincronizarse
4. **Auditoría**: El snapshot (nombre/email) se mantiene en bookings para GDPR
5. **UX mejorado**: Flujo claro sobre dónde crear/editar cada cosa
6. **Prevención de errores**: No se pueden crear clientes duplicados desde múltiples lugares
7. **Mantenibilidad**: Cambios en el formulario de cliente se hacen una sola vez

## Próximos Pasos

1. **Ejecutar la migración SQL** (`migrate-bookings-to-normalized-customers.sql`) si aún no se ha hecho
2. **Verificar** que todas las reservas tienen `customer_id` correcto
3. **Probar** el flujo completo de edición de reservas y clientes
4. **Eliminar** campos obsoletos de la base de datos si la migración no los eliminó

## Notas Importantes

- Los datos del cliente ahora **solo se editan en la página de clientes**
- El snapshot (customer_name, customer_email) en bookings se actualiza automáticamente al guardar la reserva
- Si se elimina un cliente, las reservas mantienen el snapshot por GDPR
- Las estadísticas del cliente (total_bookings, total_spent) se actualizan mediante triggers o manualmente
