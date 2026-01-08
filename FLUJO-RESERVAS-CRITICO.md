# ⚠️ FLUJO DE RESERVAS CRÍTICO - NO MODIFICAR SIN DOCUMENTAR

> **ÚLTIMA ACTUALIZACIÓN**: 8 de enero de 2026
> 
> **MOTIVO DE ESTE DOCUMENTO**: En enero de 2026 se perdieron dos páginas críticas del flujo de reservas (`/reservar/vehiculo` y `/reservar/nueva`), lo que rompió completamente el sistema de reservas. Este documento garantiza que esto NO vuelva a suceder.

## 🚨 ADVERTENCIA CRÍTICA

Este flujo representa el **CORE DEL NEGOCIO**. Sin este flujo funcionando, **NO SE PUEDEN HACER RESERVAS** = **NO HAY INGRESOS**.

### Páginas que NO PUEDEN ELIMINARSE BAJO NINGUNA CIRCUNSTANCIA:

- ✅ `src/app/reservar/page.tsx` - Búsqueda inicial
- ✅ `src/app/buscar/page.tsx` - Resultados de búsqueda
- ✅ `src/app/reservar/vehiculo/page.tsx` - **SE PERDIÓ EN ENE-2026** - Detalle + Extras
- ✅ `src/app/reservar/nueva/page.tsx` - **SE PERDIÓ EN ENE-2026** - Formulario cliente
- ✅ `src/app/reservar/[id]/page.tsx` - Detalle de reserva
- ✅ `src/app/reservar/[id]/pago/page.tsx` - Pasarela de pago
- ✅ `src/app/reservar/[id]/confirmacion/page.tsx` - Confirmación

## 📊 Flujo Visual Completo

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE RESERVA                               │
│                   (Usuario → Pago Completado)                         │
└──────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════╗
║  PASO 1: BÚSQUEDA                                                   ║
║  /reservar                                                          ║
║  Archivo: src/app/reservar/page.tsx                                ║
╚════════════════════════════════════════════════════════════════════╝
                               │
                               │ Usuario introduce:
                               │ - Fechas (pickup/dropoff)
                               │ - Ubicación
                               │ - Horarios
                               ↓
╔════════════════════════════════════════════════════════════════════╗
║  PASO 2: RESULTADOS DE BÚSQUEDA                                    ║
║  /buscar?pickup_date=X&dropoff_date=Y&...                         ║
║  Archivo: src/app/buscar/page.tsx                                 ║
║  Componente: VehicleCard (src/components/booking/vehicle-card.tsx)║
╚════════════════════════════════════════════════════════════════════╝
                               │
                               │ Usuario hace click en
                               │ "Reservar" de un vehículo
                               ↓
╔════════════════════════════════════════════════════════════════════╗
║  ⚠️ PASO 3: DETALLE DEL VEHÍCULO + SELECCIÓN DE EXTRAS           ║
║  /reservar/vehiculo?vehicle_id=X&pickup_date=Y&...                ║
║  Archivo: src/app/reservar/vehiculo/page.tsx                      ║
║                                                                     ║
║  ⚠️ ESTA PÁGINA SE PERDIÓ EN ENERO 2026 ⚠️                       ║
║                                                                     ║
║  Muestra:                                                          ║
║  - Galería completa de imágenes                                   ║
║  - Descripción detallada del vehículo                             ║
║  - Equipamiento incluido (iconos)                                 ║
║  - Lista de extras disponibles (agrupados por categoría)          ║
║  - Selector de cantidad para cada extra                           ║
║  - Resumen lateral con precio total                               ║
║                                                                     ║
║  Usuario añade extras (opcional) y continúa                       ║
╚════════════════════════════════════════════════════════════════════╝
                               │
                               │ Click en "Continuar con la reserva"
                               │ URL incluye: vehicle_id, dates, locations
                               │ + extra_0_id, extra_0_quantity
                               │ + extra_1_id, extra_1_quantity ...
                               ↓
╔════════════════════════════════════════════════════════════════════╗
║  ⚠️ PASO 4: FORMULARIO DE DATOS DEL CLIENTE                       ║
║  /reservar/nueva?vehicle_id=X&extra_0_id=Y&...                    ║
║  Archivo: src/app/reservar/nueva/page.tsx                         ║
║                                                                     ║
║  ⚠️ ESTA PÁGINA SE PERDIÓ EN ENERO 2026 ⚠️                       ║
║  ✅ RESTAURADA Y MEJORADA EN ENERO 2026                           ║
║                                                                     ║
║  Captura DATOS COMPLETOS del cliente:                             ║
║  PERSONALES:                                                       ║
║  - Nombre completo (required)                                     ║
║  - Email (required)                                               ║
║  - Teléfono (required)                                            ║
║  - DNI/NIE (required)                                             ║
║  - Fecha de nacimiento (required)                                 ║
║                                                                     ║
║  DIRECCIÓN COMPLETA:                                              ║
║  - Dirección (calle, número...) (required)                        ║
║  - Ciudad (required)                                              ║
║  - Código Postal (required)                                       ║
║  - País (required, default: España)                               ║
║                                                                     ║
║  CARNET DE CONDUCIR:                                              ║
║  - Número de carnet (required)                                    ║
║  - Fecha de caducidad (required)                                  ║
║                                                                     ║
║  OPCIONAL:                                                         ║
║  - Notas adicionales (optional)                                   ║
║                                                                     ║
║  Procesa:                                                          ║
║  - Lee extras desde URL (extra_N_id, extra_N_quantity)           ║
║  - Carga datos de extras desde Supabase                          ║
║  - Calcula precio total (base + extras)                          ║
║  - Muestra resumen lateral completo                              ║
║                                                                     ║
║  Al enviar (PROCESO MEJORADO 2026-01-08):                        ║
║  1. BUSCA cliente existente por email en 'customers'             ║
║  2. Si existe: ACTUALIZA datos + incrementa estadísticas         ║
║  3. Si NO existe: CREA nuevo cliente en 'customers'              ║
║  4. INSERT en tabla 'bookings' con customer_id                   ║
║  5. Guarda snapshot de datos del cliente en 'bookings'           ║
║  6. INSERT múltiple en tabla 'booking_extras'                    ║
║  7. Actualiza total_bookings y total_spent del cliente           ║
║  8. Redirige a /reservar/[booking_id]                            ║
╚════════════════════════════════════════════════════════════════════╝
                               │
                               │ Reserva creada (status: pending)
                               │
                               ↓
╔════════════════════════════════════════════════════════════════════╗
║  PASO 5: DETALLES DE LA RESERVA                                    ║
║  /reservar/[id]                                                    ║
║  Archivo: src/app/reservar/[id]/page.tsx                          ║
║                                                                     ║
║  Muestra:                                                          ║
║  - Número de reserva (booking_number)                             ║
║  - Estado actual (pending/confirmed/completed/cancelled)          ║
║  - Datos del vehículo                                             ║
║  - Fechas y ubicaciones                                           ║
║  - Extras incluidos                                               ║
║  - Resumen de pagos (50%-50%)                                     ║
║  - Botones de pago activos según estado                           ║
╚════════════════════════════════════════════════════════════════════╝
                               │
                               │ Usuario hace click en
                               │ "Pagar" (primer 50% o segundo 50%)
                               ↓
╔════════════════════════════════════════════════════════════════════╗
║  PASO 6: PASARELA DE PAGO                                          ║
║  /reservar/[id]/pago?amount=X                                     ║
║  Archivo: src/app/reservar/[id]/pago/page.tsx                     ║
║                                                                     ║
║  Integración con Redsys TPV:                                       ║
║  - Prepara parámetros de pago                                     ║
║  - Genera firma HMAC-SHA256                                       ║
║  - Redirección a TPV de Redsys                                    ║
║  - Recibe respuesta y valida firma                                ║
║  - Actualiza amount_paid en booking                               ║
╚════════════════════════════════════════════════════════════════════╝
                               │
                               │ Pago exitoso
                               │
                               ↓
╔════════════════════════════════════════════════════════════════════╗
║  PASO 7: CONFIRMACIÓN                                              ║
║  /reservar/[id]/confirmacion                                       ║
║  Archivo: src/app/reservar/[id]/confirmacion/page.tsx             ║
║                                                                     ║
║  Muestra:                                                          ║
║  - Confirmación de pago exitoso                                   ║
║  - Resumen completo de la reserva                                 ║
║  - Instrucciones para el día de recogida                          ║
║  - Email de confirmación enviado                                  ║
╚════════════════════════════════════════════════════════════════════╝
```

## 🔗 Conexiones Entre Páginas (CRÍTICO)

### 1. VehicleCard → /reservar/vehiculo

**Archivo**: `src/components/booking/vehicle-card.tsx`

```typescript
// ⚠️ LÍNEAS CRÍTICAS (aprox. 38-50)
const bookingParams = new URLSearchParams({
  vehicle_id: vehicle.id,
  pickup_date: searchParams.pickup_date,
  dropoff_date: searchParams.dropoff_date,
  pickup_time: searchParams.pickup_time,
  dropoff_time: searchParams.dropoff_time,
  pickup_location: searchParams.pickup_location,
  dropoff_location: searchParams.dropoff_location,
});

// ⚠️ DEBE APUNTAR A /reservar/vehiculo, NO A /reservar/nueva
const reservationUrl = `/reservar/vehiculo?${bookingParams.toString()}`;
```

**NUNCA cambiar esto a `/reservar/nueva`** - Se saltaría el paso de selección de extras.

### 2. /reservar/vehiculo → /reservar/nueva

**Archivo**: `src/app/reservar/vehiculo/page.tsx`

```typescript
// ⚠️ Función handleContinue (aprox. línea 145-165)
const handleContinue = () => {
  const params = new URLSearchParams({
    vehicle_id: vehicleId!,
    pickup_date: pickupDate!,
    dropoff_date: dropoffDate!,
    pickup_time: pickupTime || '11:00',
    dropoff_time: dropoffTime || '11:00',
    pickup_location: pickupLocation || '',
    dropoff_location: dropoffLocation || '',
  });

  // ⚠️ AÑADIR EXTRAS A LA URL
  selectedExtras.forEach((item, index) => {
    params.append(`extra_${index}_id`, item.extra.id);
    params.append(`extra_${index}_quantity`, item.quantity.toString());
  });

  router.push(`/reservar/nueva?${params.toString()}`);
};
```

**Los extras SE DEBEN pasar por URL** - No hay otro mecanismo de persistencia.

### 3. /reservar/nueva → Crea reserva → /reservar/[id]

**Archivo**: `src/app/reservar/nueva/page.tsx`

```typescript
// ⚠️ Función handleSubmit (aprox. línea 181-260)

// 1. Crear booking
const { data: booking, error: bookingError } = await supabase
  .from('bookings')
  .insert({
    // ... datos del cliente ...
    base_price: basePrice,
    extras_price: extrasPrice,  // ⚠️ IMPORTANTE
    total_price: totalPrice,     // ⚠️ base + extras
    // ...
  })
  .select()
  .single();

// 2. ⚠️ CREAR BOOKING_EXTRAS (CRÍTICO)
if (selectedExtras.length > 0) {
  const bookingExtrasData = selectedExtras.map(extra => ({
    booking_id: booking.id,
    extra_id: extra.id,
    quantity: extra.quantity,
    unit_price: /* precio calculado */,
    total_price: /* precio * cantidad */,
  }));

  await supabase
    .from('booking_extras')
    .insert(bookingExtrasData);
}

// 3. Redirigir
router.push(`/reservar/${booking.id}`);
```

## 📦 Tablas de Base de Datos Involucradas

### Tabla: `customers` ⭐ **ACTUALIZADO 2026-01-08**

⚠️ **TABLA CRÍTICA PARA CLIENTES**:

```sql
id UUID PRIMARY KEY
user_id UUID                    -- FK a auth.users (si tiene cuenta)

-- Datos personales
email VARCHAR(255) NOT NULL     -- ⚠️ ÚNICO - Se usa para buscar cliente existente
name VARCHAR(200) NOT NULL
phone VARCHAR(50)
dni VARCHAR(20)
date_of_birth DATE              -- ⚠️ NUEVO: Obligatorio en formulario

-- Dirección completa
address TEXT
city VARCHAR(100)               -- ⚠️ NUEVO: Obligatorio en formulario
postal_code VARCHAR(20)         -- ⚠️ NUEVO: Obligatorio en formulario
country VARCHAR(100)            -- ⚠️ NUEVO: Default 'España'

-- Datos de conducción
driver_license VARCHAR(50)      -- ⚠️ NUEVO: Obligatorio en formulario
driver_license_expiry DATE      -- ⚠️ NUEVO: Obligatorio en formulario

-- Estadísticas (se actualizan automáticamente)
total_bookings INTEGER DEFAULT 0    -- ⚠️ Se incrementa con cada reserva
total_spent DECIMAL(12,2) DEFAULT 0 -- ⚠️ Se suma el total de cada reserva
notes TEXT

created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ

-- ⚠️ LÓGICA DE CREACIÓN/ACTUALIZACIÓN:
-- 1. Buscar cliente por email:
SELECT id, total_bookings, total_spent 
FROM customers 
WHERE email = 'cliente@email.com';

-- 2a. Si EXISTE: Actualizar datos + estadísticas
UPDATE customers SET
  name = '...',
  phone = '...',
  -- ... resto de campos ...
  total_bookings = total_bookings + 1,
  total_spent = total_spent + {{total_price}},
  updated_at = NOW()
WHERE id = '...';

-- 2b. Si NO EXISTE: Crear nuevo cliente
INSERT INTO customers (
  email, name, phone, dni, date_of_birth,
  address, city, postal_code, country,
  driver_license, driver_license_expiry,
  total_bookings, total_spent
) VALUES (
  'cliente@email.com', 'Nombre Cliente', '+34600000000', '12345678A', '1990-01-01',
  'Calle Ejemplo 1', 'Murcia', '30001', 'España',
  '12345678', '2030-12-31',
  0, 0
) RETURNING id;

-- 3. Usar el customer_id en la reserva
```

### Tabla: `bookings` ⭐ **ACTUALIZADO 2026-01-08**

⚠️ **SNAPSHOT DE DATOS DEL CLIENTE**:

```sql
id UUID PRIMARY KEY
booking_number VARCHAR(20) UNIQUE
vehicle_id UUID REFERENCES vehicles(id)
customer_id UUID REFERENCES customers(id)  -- ⚠️ FK a customers

-- ... fechas, precios, etc ...

-- ⚠️ SNAPSHOT de datos del cliente (para histórico)
-- Estos campos se copian de 'customers' en el momento de crear la reserva
-- NO se actualizan si el cliente cambia sus datos posteriormente
customer_name VARCHAR(200)
customer_email VARCHAR(255)
customer_phone VARCHAR(50)
customer_dni VARCHAR(20)
customer_address TEXT
customer_city VARCHAR(100)          -- ⚠️ NUEVO
customer_postal_code VARCHAR(20)    -- ⚠️ NUEVO

-- ⚠️ IMPORTANTE: payment_method NO existe aquí
-- Los métodos de pago están en la tabla 'payments'

-- Estados
status VARCHAR(20)           -- pending, confirmed, in_progress, completed, cancelled
payment_status VARCHAR(20)   -- pending, partial, paid, refunded

notes TEXT
admin_notes TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**⚠️ ¿POR QUÉ DUPLICAR DATOS DEL CLIENTE?**

1. **Tabla `customers`**: Datos **actuales** del cliente
   - Se actualizan con cada reserva
   - Sirven para futuras reservas
   - Incluyen estadísticas (total_bookings, total_spent)

2. **Tabla `bookings` (snapshot)**: Datos del cliente **en ese momento**
   - NO se modifican si el cliente actualiza sus datos
   - Garantizan tener la info correcta para esa reserva específica
   - Útil para auditorías e historial

### Tabla: `seasons`

⚠️ **LÓGICA DE PRECIOS CRÍTICA**:

```sql
id UUID
name VARCHAR(100)
slug VARCHAR(100)
start_date DATE
end_date DATE
price_modifier DECIMAL(4,2)  -- ⚠️ VALOR FIJO EN EUROS QUE SE SUMA (ver abajo)
min_days INTEGER
is_active BOOLEAN

-- ⚠️ IMPORTANTE: Lógica de cálculo de precios
-- 1. Precio BASE siempre según duración (temporada baja):
--    < 7 días:  95€/día
--    7-13 días: 85€/día
--    14-20 días: 75€/día
--    21+ días:  65€/día
--
-- 2. El price_modifier es un VALOR FIJO EN EUROS que se SUMA al precio base
--    EJEMPLO 1 - Temporada baja:
--      price_modifier = 0 (o 1.00)
--      Precio final (7 días) = 85€ + 0€ = 85€/día
--
--    EJEMPLO 2 - Temporada media:
--      price_modifier = 30
--      Precio final (7 días) = 85€ + 30€ = 115€/día
--      Precio final (14 días) = 75€ + 30€ = 105€/día
--
--    EJEMPLO 3 - Temporada alta:
--      price_modifier = 50
--      Precio final (7 días) = 85€ + 50€ = 135€/día
--
-- 3. NOTA: Si en la BD el valor está como 1.00, 1.30, etc. (formato decimal),
--    se debe convertir: (price_modifier - 1.00) * 100 = euros a sumar
--    Ejemplo: 1.30 → (1.30 - 1.00) * 100 = 30€
--
-- Query correcta para obtener temporada activa:
SELECT * FROM seasons 
WHERE is_active = true 
  AND start_date <= '2026-01-18' 
  AND end_date >= '2026-01-18'
LIMIT 1;
```

### Tabla: `vehicle_images`

⚠️ **CAMPOS CRÍTICOS**:

```sql
id UUID
vehicle_id UUID
url TEXT              -- ⚠️ En migraciones puede ser "image_url"
alt VARCHAR(255)      -- ⚠️ En migraciones puede ser "alt_text"
is_main BOOLEAN       -- ⚠️ En migraciones puede ser "is_primary"
sort_order INTEGER

-- ⚠️ IMPORTANTE: Usar * (asterisco) en las queries para evitar conflictos
-- Query CORRECTA (recomendada):
SELECT *, images:vehicle_images(*) FROM vehicles

-- Query INCORRECTA (puede fallar según la versión de la BD):
SELECT images:vehicle_images(url, alt, is_main) FROM vehicles
```

### Tabla: `vehicle_equipment` (relación muchos a muchos)

⚠️ **RELACIÓN CRÍTICA**:

```sql
id UUID
vehicle_id UUID REFERENCES vehicles(id)
equipment_id UUID REFERENCES equipment(id)
notes TEXT

-- Query correcta para obtener equipamiento de un vehículo:
SELECT 
  *,
  vehicle_equipment(
    id,
    notes,
    equipment(*)
  )
FROM vehicles
WHERE id = '...';

-- ⚠️ Esta relación es ESENCIAL para mostrar el equipamiento en:
-- - /vehiculos/[slug] (página de detalle de vehículo)
-- - /ventas/[slug] (página de detalle de venta)
-- - /reservar/vehiculo (página de detalles antes de reservar)
```

### Tabla: `vehicles`

⚠️ **CAMPOS CRÍTICOS** - Usar exactamente estos nombres:

```sql
-- Campos principales
id UUID
name VARCHAR(200)
slug VARCHAR(200)
category_id UUID  -- ⚠️ FK a vehicle_categories, NO categories
brand VARCHAR(100)
model VARCHAR(100)
year INTEGER
seats INTEGER
beds INTEGER
fuel_type VARCHAR(50)
transmission VARCHAR(50)
base_price_per_day DECIMAL(10,2)
description TEXT

-- Estados
is_for_rent BOOLEAN  -- ⚠️ NO is_available
status VARCHAR(20)   -- available, maintenance, rented, inactive

-- Query correcta para vehicle con categoría:
SELECT 
  vehicles.*,
  category:vehicle_categories(name)  -- ⚠️ vehicle_categories, NO categories
FROM vehicles
WHERE is_for_rent = true             -- ⚠️ is_for_rent, NO is_available
  AND status != 'inactive'
```

### Tabla: `vehicle_categories`

⚠️ **NOMBRE CORRECTO**: `vehicle_categories`, **NO** `categories`

```sql
id UUID
name VARCHAR(100)
slug VARCHAR(100)
description TEXT
```

### Tabla: `extras`

⚠️ **CAMPOS CRÍTICOS**:

```sql
id UUID
name VARCHAR(200)
description TEXT
price_per_day DECIMAL(10,2)
price_per_rental DECIMAL(10,2)
price_type VARCHAR(20)
max_quantity INTEGER
image_url TEXT
is_active BOOLEAN  -- ⚠️ NO is_available
sort_order INTEGER

-- ⚠️ IMPORTANTE: Esta tabla NO tiene columna "category"
-- Query correcta:
SELECT * FROM extras 
WHERE is_active = true
ORDER BY sort_order ASC, name ASC;
```

-- Query correcta:
SELECT * FROM extras 
WHERE is_active = true  -- ⚠️ is_active, NO is_available
```

### Tabla: `bookings`

Campos críticos relacionados con extras:
- `base_price` (NUMERIC) - Precio del vehículo sin extras
- `extras_price` (NUMERIC) - Suma total de todos los extras
- `total_price` (NUMERIC) - base_price + extras_price
- `status` (TEXT) - pending, confirmed, in_progress, completed, cancelled
- `payment_status` (TEXT) - pending, paid, partially_paid

### Tabla: `booking_extras`

```sql
CREATE TABLE booking_extras (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  extra_id UUID REFERENCES extras(id),
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**⚠️ ESTA TABLA ES CRÍTICA** - Almacena los extras de cada reserva.

## ⚠️ ERRORES COMUNES CON NOMBRES DE CAMPOS/TABLAS

### ❌ ERROR: Usar `categories`
```typescript
// ❌ INCORRECTO
.select('*, category:categories(name)')
```

### ✅ CORRECTO: Usar `vehicle_categories`
```typescript
// ✅ CORRECTO
.select('*, category:vehicle_categories(name)')
```

### ❌ ERROR: Usar `is_available` en vehicles
```typescript
// ❌ INCORRECTO  
.eq('is_available', true)
```

### ✅ CORRECTO: Usar `is_for_rent` y `status`
```typescript
// ✅ CORRECTO
.eq('is_for_rent', true)
.neq('status', 'inactive')
```

### ❌ ERROR: Usar `is_available` en extras
```typescript
// ❌ INCORRECTO
.from('extras').eq('is_available', true)
```

### ✅ CORRECTO: Usar `is_active` en extras
```typescript
// ✅ CORRECTO
.from('extras').eq('is_active', true)
```

### ❌ ERROR: Usar `category` en extras
```typescript
// ❌ INCORRECTO - La tabla extras NO tiene columna category
.from('extras')
  .order('category', { ascending: true })
```

### ✅ CORRECTO: Usar `sort_order` en extras
```typescript
// ✅ CORRECTO - Ordenar por sort_order
.from('extras')
  .order('sort_order', { ascending: true })
  .order('name', { ascending: true })
```

### ❌ ERROR: Especificar campos individuales en vehicle_images
```typescript
// ❌ INCORRECTO - Puede fallar por conflictos de nombres
images:vehicle_images(url, alt, is_main, sort_order)
```

### ✅ CORRECTO: Usar * para vehicle_images
```typescript
// ✅ CORRECTO - Evita problemas con nombres de campos
images:vehicle_images(*)
```

## 🧪 Cómo Probar el Flujo Completo

### Test Manual (Paso a Paso):

1. **Ir a `/reservar`**
   - Seleccionar fechas futuras
   - Seleccionar ubicación "Murcia"
   - Click en "Buscar"

2. **En `/buscar?params`**
   - Verificar que aparecen vehículos
   - Verificar que cada tarjeta tiene botón "Reservar"
   - Click en "Reservar" de cualquier vehículo

3. **⚠️ En `/reservar/vehiculo?params`**
   - Verificar que carga el vehículo correctamente
   - Verificar galería de imágenes
   - Verificar descripción y equipamiento
   - **Añadir al menos 2 extras diferentes**
   - Verificar que el precio total se actualiza
   - Click en "Continuar con la reserva"

4. **⚠️ En `/reservar/nueva?params`**
   - Verificar que aparecen los extras seleccionados en el resumen
   - Verificar que el precio total incluye los extras
   - Rellenar formulario completo
   - Click en "Crear reserva"

5. **En `/reservar/[id]`**
   - Verificar que la reserva se creó
   - Verificar que aparecen los extras en la sección "Extras incluidos"
   - Verificar que el precio total es correcto
   - Verificar botón de pago activo

### Verificación en Base de Datos:

```sql
-- 1. Verificar que la reserva se creó
SELECT * FROM bookings 
WHERE booking_number = 'FG...';

-- 2. Verificar que los extras se guardaron
SELECT be.*, e.name, e.price_per_day, e.price_per_rental
FROM booking_extras be
JOIN extras e ON be.extra_id = e.id
WHERE be.booking_id = '...';

-- 3. Verificar precios
SELECT 
  base_price,
  extras_price,
  total_price,
  (base_price + extras_price) as calculated_total
FROM bookings
WHERE id = '...';
```

## 🚫 Errores Comunes y Cómo Evitarlos

### Error 1: Saltarse la página de extras

**MAL**:
```typescript
// En vehicle-card.tsx
const reservationUrl = `/reservar/nueva?${params}`;  // ❌ INCORRECTO
```

**BIEN**:
```typescript
// En vehicle-card.tsx
const reservationUrl = `/reservar/vehiculo?${params}`;  // ✅ CORRECTO
```

### Error 2: No procesar extras en /reservar/nueva

**MAL**:
```typescript
// En nueva/page.tsx
const totalPrice = basePrice;  // ❌ Falta sumar extras
```

**BIEN**:
```typescript
// En nueva/page.tsx
const extrasPrice = selectedExtras.reduce(...);
const totalPrice = basePrice + extrasPrice;  // ✅ CORRECTO
```

### Error 3: No guardar booking_extras

**MAL**:
```typescript
// Solo guardar booking, sin extras
await supabase.from('bookings').insert({...});
router.push(`/reservar/${booking.id}`);  // ❌ Faltan los extras
```

**BIEN**:
```typescript
// Guardar booking Y extras
const booking = await supabase.from('bookings').insert({...});

if (selectedExtras.length > 0) {
  await supabase.from('booking_extras').insert([...]);  // ✅ CORRECTO
}

router.push(`/reservar/${booking.id}`);
```

## 📋 Checklist de Verificación

Antes de hacer commit/deploy de cambios al flujo de reservas, verificar:

### Páginas y Navegación:
- [ ] ¿Todas las 7 páginas críticas existen?
- [ ] ¿VehicleCard apunta a `/reservar/vehiculo`?
- [ ] ¿La página `/reservar/vehiculo` permite seleccionar extras?
- [ ] ¿Los extras se pasan correctamente por URL a `/reservar/nueva`?

### Formulario de Cliente (ACTUALIZADO 2026-01-08):
- [ ] ¿El formulario captura TODOS los campos obligatorios?
  - [ ] Nombre completo
  - [ ] Email
  - [ ] Teléfono
  - [ ] DNI/NIE
  - [ ] Fecha de nacimiento
  - [ ] Dirección completa
  - [ ] Ciudad
  - [ ] Código postal
  - [ ] País
  - [ ] Número de carnet de conducir
  - [ ] Fecha de caducidad del carnet

### Lógica de Base de Datos:
- [ ] ¿Se busca cliente existente por email en `customers`?
- [ ] ¿Se actualiza cliente si existe, o se crea si no existe?
- [ ] ¿Se guarda el `customer_id` en `bookings`?
- [ ] ¿Se guardan los datos snapshot del cliente en `bookings`?
- [ ] ¿Se incrementan `total_bookings` y `total_spent` del cliente?
- [ ] ¿Se crean registros en `booking_extras` al crear la reserva?
- [ ] ¿El precio total incluye base + extras?

### Verificación Final:
- [ ] ¿La página `/reservar/nueva` procesa los extras desde la URL?
- [ ] ¿El resumen en `/reservar/[id]` muestra los extras?
- [ ] ¿Has probado el flujo completo de inicio a fin?
- [ ] ¿Has verificado en la BD que:
  - [ ] El cliente se creó/actualizó en `customers`
  - [ ] La reserva tiene `customer_id`
  - [ ] Los datos snapshot están en `bookings`
  - [ ] Los extras se guardaron en `booking_extras`
  - [ ] Las estadísticas del cliente se actualizaron

## 🔄 Historial de Cambios Críticos

### 2026-01-08: RECUPERACIÓN DE PÁGINAS PERDIDAS + MEJORA TABLA CUSTOMERS

**Problema 1**: Las páginas `/reservar/vehiculo` y `/reservar/nueva` se perdieron, rompiendo completamente el flujo de reservas.

**Causa**: No estaban documentadas como críticas. No había registro de su existencia.

**Solución**: 
- ✅ Recreadas ambas páginas desde cero
- ✅ Creado este documento para evitar futuros incidentes
- ✅ Actualizado README con flujo detallado
- ✅ Añadidas advertencias en múltiples documentos

**Problema 2**: Los datos del cliente se guardaban solo en `bookings`, sin usar la tabla `customers`.

**Causa**: Implementación incompleta. La tabla `customers` existía pero no se usaba.

**Solución**:
- ✅ Añadidos campos adicionales al formulario:
  - `date_of_birth` (fecha de nacimiento)
  - `city` (ciudad)
  - `postal_code` (código postal)
  - `country` (país, default España)
  - `driver_license` (número de carnet)
  - `driver_license_expiry` (caducidad del carnet)

- ✅ Implementada lógica completa de clientes:
  1. Buscar cliente existente por email
  2. Si existe: actualizar datos + incrementar estadísticas
  3. Si no existe: crear nuevo cliente
  4. Guardar `customer_id` en la reserva
  5. Guardar snapshot de datos en `bookings`
  6. Actualizar `total_bookings` y `total_spent`

- ✅ Corregidos errores de sintaxis en `/reservar/[id]/page.tsx`
  - Eliminadas llaves extra en operadores ternarios
  - Corregida sintaxis JSX en traducciones

- ✅ Eliminados campos inexistentes de `bookings`:
  - ❌ `payment_method` (está en tabla `payments`)
  - ❌ `amount_paid` (se calcula desde tabla `payments`)

**Lecciones aprendidas**:
1. NUNCA asumir que "eso no se va a tocar"
2. Documentar TODO lo que sea crítico
3. Tener diagramas visuales del flujo
4. Mantener checklist de verificación actualizado
5. **USAR TABLAS EXISTENTES** - No duplicar lógica
6. Verificar el schema real antes de hacer queries
7. Los datos de clientes son CRÍTICOS - manejar con cuidado

**Archivos modificados**:
- `src/app/reservar/nueva/page.tsx` - Formulario completo + lógica customers
- `src/app/reservar/[id]/page.tsx` - Corrección sintaxis JSX
- `FLUJO-RESERVAS-CRITICO.md` - Documentación actualizada
- `PAGINAS-VEHICULOS-GARANTIA.md` - Nuevo documento de garantía

---

## 📞 Contacto en Caso de Emergencia

Si este flujo se rompe y no funciona:

1. **PRIMERO**: Consultar este documento
2. **SEGUNDO**: Verificar que existen todos los archivos listados arriba
3. **TERCERO**: Revisar el README.md para el flujo actualizado
4. **CUARTO**: Verificar las conexiones entre páginas (sección "Conexiones Entre Páginas")

**NO ELIMINAR ESTE DOCUMENTO BAJO NINGUNA CIRCUNSTANCIA**
