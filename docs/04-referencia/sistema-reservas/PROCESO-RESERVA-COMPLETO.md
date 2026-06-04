# 📋 PROCESO DE RESERVA COMPLETO - Guía Técnica

**Versión**: 1.1.2  
**Última actualización**: 4 de Junio 2026  
**Estado**: ✅ Producción - TOTALMENTE FUNCIONAL

---

## 📖 Índice

1. [Flujo de usuario](#flujo-de-usuario)
2. [Arquitectura técnica](#arquitectura-técnica)
3. [Páginas del proceso](#páginas-del-proceso)
4. [Componentes clave](#componentes-clave)
5. [Gestión de extras](#gestión-de-extras)
6. [Gestión de clientes](#gestión-de-clientes)
7. [Navegación entre pasos](#navegación-entre-pasos)
8. [Variables de URL](#variables-de-url)
9. [Post-reserva: documentacion y firma online](#post-reserva-documentacion-y-firma-online)
10. [Problemas comunes y soluciones](#problemas-comunes-y-soluciones)

---

## 🔄 Flujo de Usuario

### Paso 1: Búsqueda inicial
**URL**: `/` o `/reservar`

```
Usuario ingresa:
├─ Ubicación de recogida (y devolución, misma ubicación)
├─ Fechas de recogida y devolución (calendario con mínimo por temporada/ubicación)
├─ Hora de recogida (slots generados según franjas horarias de la ubicación)
└─ Hora de devolución (idem)

Acción: Click en "Buscar"
→ Redirige a: /buscar?pickup_date=...&dropoff_date=...&...
```

**Sedes de entrega virtuales (junio 2026)**:

- La flota física está **solo en Murcia**. Madrid, Alicante y Albacete son puntos de recogida/devolución con recargo (`locations.extra_fee`, por trayecto; en reserva: `location_fee = pickup + dropoff`).
- Si el usuario elige una sede con recargo y pulsa «Buscar», se muestra un modal: **«Cambiar a Murcia sin comisión»** o mantener la sede (`src/components/booking/search-widget.tsx`).
- Madrid: **150 €/trayecto** (300 € ida y vuelta); `min_days` override (p. ej. **20** en verano). Política operativa y análisis de rentabilidad 2026: **[SEDES-ENTREGA-Y-RENTABILIDAD.md](./SEDES-ENTREGA-Y-RENTABILIDAD.md)** (Alejandro Paro / Narciso Pardo, sociotrabajadores, cobertura mutua).

**Franjas horarias (v1.1.0)**:
- Cada ubicación tiene franjas horarias configurables en `opening_hours` (JSONB)
- Formato: `[{"open":"10:00","close":"14:00"},{"open":"17:00","close":"19:00"}]`
- El `TimeSelector` genera slots cada 30 min dentro de cada franja
- Default sin configurar: 10:00-14:00 y 17:00-19:00

**Timezone (v1.1.0)**:
- Todas las fechas se procesan en timezone `Europe/Madrid`
- `parseDateString()` evita interpretación UTC de strings `YYYY-MM-DD`
- `getMadridToday()` asegura que el calendario siempre usa la fecha de Madrid
- Resuelve desfase de +1 día para usuarios en zonas horarias negativas (Latinoamérica)

### Paso 2: Resultados de búsqueda
**URL**: `/buscar`

**✅ v1.0.2: DISPONIBILIDAD CORRECTA**

**Componente**: `VehicleListClient`
- Muestra vehículos disponibles
  - ✅ **Solo reservas `confirmed` e `in_progress` bloquean vehículos**
  - ✅ Reservas `pending` NO bloquean disponibilidad (fix v1.0.2)
- Filtros por capacidad, tipo, precio
- Cada vehículo en un `VehicleCard`

**API Availability** (`/api/availability/route.ts`):
```typescript
// ✅ v1.0.2: Solo bloquean reservas activas
const { data: conflictingBookings } = await supabase
  .from("bookings")
  .select("vehicle_id")
  .in("status", ["confirmed", "in_progress"])  // ✅ Correcto
  .or(`and(pickup_date.lte.${dropoffDate},dropoff_date.gte.${pickupDate})`);
```

**Interacciones**:
- ✅ Click en imagen → Continúa reserva
- ✅ Click en título → Continúa reserva
- ✅ Click en "Reservar" → Continúa reserva

```
Usuario selecciona vehículo
→ Redirige a: /reservar/vehiculo?vehicle_id=...&pickup_date=...&...
```

### Paso 3: Detalles del vehículo y selección de extras
**URL**: `/reservar/vehiculo`

**✅ v1.0.2: UX PERFECCIONADA**

**Estructura Visual**:
```
┌────────────────────────────────────┐ 0px
│ Header Principal (sticky, z-50)   │
├────────────────────────────────────┤ 120px
│ Sticky Header - Resumen (z-40)    │
│ ← Volver | 🚗 Vehículo | 💰 Total │
├────────────────────────────────────┤ 230px
│ ↕ Margen: 40px (pt-[150px])       │
├────────────────────────────────────┤ 270px
│ CONTENIDO PRINCIPAL                │
│ ┌───────────┬─────────────────┐   │
│ │ Galería   │ Sidebar PC      │   │
│ │ Detalles  │ (sticky)        │   │
│ │ Extras    │ - Resumen       │   │
│ └───────────┴─────────────────┘   │
└────────────────────────────────────┘
```

**Muestra**:
- **Sticky Header**: Siempre visible con resumen de reserva
  - Link "Volver a la búsqueda" accesible en todo momento ✅
  - Vehículo, fechas y total visible
  - Botón "Continuar" en header móvil
- **Galería de imágenes** del vehículo (`VehicleGallery`)
- **Información técnica** (plazas, camas, equipamiento)
- **Extras disponibles** agrupados por categoría
  - ✅ Diferencia correcta entre "Por día" y "Por unidad"
  - ✅ Precios mostrados correctamente (no más "0€ / día")
  - ✅ Permite seleccionar cantidad de cada extra
  - ✅ Actualiza el total en tiempo real (suma correcta)
- **Resumen de reserva** (sidebar en PC, CTA móvil)

**UX PC (≥768px)**:
- Layout 3 columnas: `grid-cols-1 md:grid-cols-3`
- Sidebar derecho sticky (`top-[230px]`) con resumen completo
- Contenido principal ocupa 2/3 del ancho

**UX Móvil (<768px)**:
- Sticky header con resumen compacto
- CTA "Continuar" en header móvil con total visible

**Extras - Cálculo correcto**:
```typescript
// ✅ Diferenciación correcta
if (extra.price_type === 'per_unit') {
  precio = extra.price_per_unit;  // Precio único
  display = "20.00€ / unidad";
} else {
  precio = extra.price_per_day * días;  // Precio por día
  display = "5.00€ / día";
}

// ✅ Suma al total
totalPrice = basePrice + extrasPrice;
```

**Retry Logic** (v1.0.2):
- 3 reintentos automáticos con backoff (1s, 2s, 3s)
- Manejo especial de AbortError
- Logging detallado: `[ReservarVehiculo] Retry vehicle: {id} (attempt 1/3)`

```
Usuario selecciona extras (opcional)
Click en "Continuar"
→ Redirige a: /reservar/nueva?vehicle_id=...&extras=...&...
```

### Paso 4: Formulario de datos del cliente
**URL**: `/reservar/nueva`

**✅ v1.0.2: DISEÑO CONSISTENTE CON /reservar/vehiculo**

**Estructura Visual**:
```
┌────────────────────────────────────┐ 0px
│ Header Principal (sticky, z-50)   │
├────────────────────────────────────┤ 120px
│ Sticky Header - Resumen (z-40)    │
│ ← Volver al paso anterior          │
│ 🚗 Vehículo | Días | 💰 Total     │
├────────────────────────────────────┤ 230px
│ ↕ Margen: 40px (pt-[150px])       │
├────────────────────────────────────┤ 270px
│ FORMULARIO DE CLIENTE              │
└────────────────────────────────────┘
```

**Formulario**:
- Datos personales (nombre, email, teléfono, DNI)
- Dirección completa
- Fecha de nacimiento
- Licencia de conducir y fecha de expiración
- Aceptación de términos y condiciones

**Proceso** (✅ v1.0.2 - Sin duplicados):
1. **Detección de cliente existente** por email O DNI
   ```typescript
   const { data: existingCustomers } = await supabase
     .from('customers')
     .select('id')
     .or(`email.eq.${email},dni.eq.${dni}`)
     .limit(1);
   ```
2. Si existe → Usa ID del cliente existente ✅
3. Si no existe → Crea nuevo cliente vía API `/api/customers` ✅
4. Crea booking en la tabla `bookings`
5. Vincula extras seleccionados en `booking_extras`

**Navegación**:
- Botón "Volver al paso anterior" → `router.back()` ✅
- Ya NO enlaza estáticamente a home (fix v1.0.2)

```
Usuario completa formulario
Click en "Reservar ahora"
→ Redirige a: /reservar/[booking_id]
```

### Paso 5: Confirmación de reserva
**URL**: `/reservar/[booking_id]`

**✅ v1.0.2: INFORMACIÓN CORRECTA**

**Muestra**:
- Número de reserva
- Resumen completo de la reserva
- Información del vehículo
- Extras seleccionados
- Datos del cliente
- Precio total
- **Depósito**: 1000€ vía transferencia ✅ (corregido desde 500€)
- **Teléfono de contacto**: Correcto desde footer ✅

---

## Post-reserva documentacion y firma online

**URL pública:** `/es/documentacion-alquiler` (EN/DE/FR equivalentes)

Tras pagar / confirmar la reserva, el cliente debe completar (fuera del checkout):

1. Enviar DNI y carnet por email a `reservas@furgocasa.com`
2. **Firmar el contrato online** en la misma página (nº reserva + email → lectura en texto → checks → firma)
3. Transferir la fianza (1000 €, máx. 72 h antes del inicio)
4. Recibir confirmación de cita de recogida por email

**Importante (junio 2026):** los PDF del contrato **no** están enlazados públicamente en esa página; solo se muestran tras validar la reserva. El PDF firmado se envía por email al completar la firma.

Documentación técnica: **[FIRMA-CONTRATOS-ONLINE.md](../../02-desarrollo/contratos/FIRMA-CONTRATOS-ONLINE.md)**

---

## 🏗️ Arquitectura Técnica

### Stack de páginas

```
/
├─ page.tsx (Server Component)
│  └─ HeroSlider (Client)
│     └─ SearchWidget (Client)
│
├─ buscar/
│  └─ page.tsx (Client Component con Suspense)
│     └─ VehicleListClient (Client)
│        └─ VehicleCard (Client) ✅ Imagen y título clicables
│
├─ reservar/
│  ├─ page.tsx (Server Component)
│  │  └─ SearchWidget (Client)
│  │
│  ├─ vehiculo/
│  │  └─ page.tsx (Client Component con Suspense)
│  │     ├─ VehicleGallery (Client)
│  │     ├─ Extras selector (inline)
│  │     └─ Resumen de reserva (inline)
│  │
│  ├─ nueva/
│  │  └─ page.tsx (Client Component con Suspense)
│  │     └─ Formulario de cliente (inline)
│  │
│  └─ [id]/
│     └─ page.tsx (Server Component)
│        └─ Confirmación (inline)
│
└─ api/
   └─ customers/
      └─ route.ts (API Route con service role)
```

---

## 📄 Páginas del Proceso

### `/buscar` - Resultados de búsqueda

**Archivo**: `src/app/buscar/page.tsx`

**Props desde URL**:
```typescript
const pickup_date = searchParams.get('pickup_date');
const dropoff_date = searchParams.get('dropoff_date');
const pickup_time = searchParams.get('pickup_time');
const dropoff_time = searchParams.get('dropoff_time');
const pickup_location = searchParams.get('pickup_location');
const dropoff_location = searchParams.get('dropoff_location');
```

**Lógica**:
1. Calcula días de alquiler
2. Consulta vehículos disponibles
3. Filtra por capacidad, tipo, precio
4. Ordena por precio, capacidad, nombre

**Navegación**:
```tsx
// Volver a búsqueda
<Link href="/reservar">Volver a buscar</Link>

// Continuar con vehículo
const reservationUrl = `/reservar/vehiculo?vehicle_id=${vehicle.id}&${searchParams.toString()}`;
```

---

### `/reservar/vehiculo` - Detalles y extras

**Archivo**: `src/app/reservar/vehiculo/page.tsx`

**Props desde URL**:
```typescript
const vehicleId = searchParams.get('vehicle_id');
// + todos los params de búsqueda (fechas, ubicaciones, horas)
```

**Interfaces críticas**:
```typescript
interface Extra {
  id: string;
  name: string;
  description: string;
  price_per_day: number | null;      // Para extras "Por día"
  price_per_unit: number | null;     // Para extras "Por unidad"
  price_type: 'per_day' | 'per_unit'; // ⚠️ IMPORTANTE: per_unit, NO per_rental
  min_quantity: number | null;       // per_day: mín. días (ej. parking 4); per_unit: mín. unidades
  max_quantity: number;
  icon: string;
}

interface SelectedExtra {
  extra: Extra;
  quantity: number;
}
```

**Cálculo de precios**:
```typescript
// Precio base del vehículo
const basePrice = vehicle.base_price_per_day * days;

// Precio de extras (aplicar min_quantity para per_day: ej. parking 4 días mín.)
const extrasPrice = selectedExtras.reduce((sum, item) => {
  let price = 0;
  if (item.extra.price_type === 'per_unit') {
    price = (item.extra.price_per_unit || 0);
  } else {
    const effectiveDays = item.extra.min_quantity ? Math.max(days, item.extra.min_quantity) : days;
    price = (item.extra.price_per_day || 0) * effectiveDays;
  }
  return sum + (price * item.quantity);
}, 0);

// Total
const totalPrice = basePrice + extrasPrice;
```

**Navegación**:
```tsx
// Volver a resultados (mantiene parámetros de búsqueda)
<Link href={`/buscar?${searchParams.toString()}`}>
  Volver a resultados
</Link>

// Continuar a formulario
const handleContinue = () => {
  const params = new URLSearchParams(searchParams);
  
  // Agregar extras seleccionados
  if (selectedExtras.length > 0) {
    const extrasParam = selectedExtras.map(item => 
      `${item.extra.id}:${item.quantity}`
    ).join(',');
    params.set('extras', extrasParam);
  }
  
  router.push(`/reservar/nueva?${params.toString()}`);
};
```

**Layout móvil**:
```tsx
{/* Arriba: Info simple NO sticky */}
<div className="lg:hidden bg-gray-50 rounded-xl p-3 mb-4">
  <p className="text-sm text-gray-600 text-center">
    {days} días · Total: <span className="font-bold">{formatPrice(totalPrice)}</span>
  </p>
</div>

{/* Contenido: Galería, info, extras */}
<div className="space-y-6">...</div>

{/* Abajo: CTA sticky en bottom */}
<div className="lg:hidden bg-white shadow-lg p-5 sticky bottom-0">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-500">Total ({days} días)</p>
      <p className="text-2xl font-bold">{formatPrice(totalPrice)}</p>
    </div>
    <button onClick={handleContinue}>
      Continuar <ArrowRight />
    </button>
  </div>
</div>
```

---

### `/reservar/nueva` - Formulario de cliente

**Archivo**: `src/app/reservar/nueva/page.tsx`

**Props desde URL**:
```typescript
const vehicleId = searchParams.get('vehicle_id');
const extrasParam = searchParams.get('extras'); // "extra_id:quantity,extra_id:quantity"
// + todos los params de búsqueda
```

**Parseo de extras**:
```typescript
const selectedExtras = extrasParam?.split(',').map(item => {
  const [id, quantity] = item.split(':');
  return {
    extra_id: id,
    quantity: parseInt(quantity)
  };
}) || [];
```

**Proceso de creación de reserva**:

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // PASO 1: Buscar o crear cliente
    let customerId: string;
    
    // Buscar cliente existente por email O DNI
    const { data: existingCustomers } = await supabase
      .from('customers')
      .select('id, total_bookings, total_spent')
      .or(`email.eq.${customerEmail},dni.eq.${customerDni}`)
      .limit(1);

    if (existingCustomers && existingCustomers.length > 0) {
      // Cliente existe - usar ID existente
      customerId = existingCustomers[0].id;
      console.log('Using existing customer:', customerId);
      
      // Intentar actualizar info (opcional, puede fallar por RLS)
      await supabase
        .from('customers')
        .update({ ...customerData })
        .eq('id', customerId);
    } else {
      // Cliente nuevo - crear usando API route
      const createResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          dni: customerDni,
          date_of_birth: customerDateOfBirth || null,
          address: customerAddress,
          city: customerCity,
          postal_code: customerPostalCode,
          country: customerCountry,
          driver_license: customerDriverLicense || null,
          driver_license_expiry: customerDriverLicenseExpiry || null,
        }),
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Error al crear cliente');
      }
      
      const { customer } = await createResponse.json();
      customerId = customer.id;
      console.log('Created new customer:', customerId);
    }

    // PASO 2: Generar número de reserva
    const bookingNumber = `FG${Date.now().toString().slice(-8)}`;

    // PASO 3: Crear booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        customer_id: customerId,
        vehicle_id: vehicleId,
        pickup_date: pickupDate,
        dropoff_date: dropoffDate,
        pickup_time: pickupTime,
        dropoff_time: dropoffTime,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        total_price: totalPrice,
        status: 'pending',
        // Snapshot de datos del cliente (por si cambia en el futuro)
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_dni: customerDni,
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // PASO 4: Vincular extras (si hay)
    if (selectedExtras.length > 0) {
      const bookingExtras = selectedExtras.map(extra => ({
        booking_id: booking.id,
        extra_id: extra.extra_id,
        quantity: extra.quantity,
        price_per_unit: extra.price_per_unit,
        subtotal: extra.price_per_unit * extra.quantity,
      }));

      const { error: extrasError } = await supabase
        .from('booking_extras')
        .insert(bookingExtras);

      if (extrasError) {
        console.error('Error adding extras:', extrasError);
        // No lanzar error, continuar con la reserva
      }
    }

    // PASO 5: Redirigir a confirmación
    router.push(`/reservar/${booking.id}`);
    
  } catch (error: any) {
    console.error('Error creating booking:', error);
    setError(error.message || 'Error al crear la reserva');
  } finally {
    setLoading(false);
  }
};
```

**Navegación**:
```tsx
// Volver al paso anterior (detalles del vehículo)
<button onClick={() => router.back()}>
  <ArrowLeft /> Volver al paso anterior
</button>
```

---

## 🧩 Componentes Clave

### `VehicleCard`

**Archivo**: `src/components/booking/vehicle-card.tsx`

**Props**:
```typescript
interface VehicleCardProps {
  vehicle: any;
  searchParams: URLSearchParams;
  days: number;
  pricing: {
    basePrice: number;
    totalPrice: number;
    pricePerDay: number;
    // ... otros campos de pricing
  };
}
```

**Características**:
- ✅ Imagen clicable → Continúa reserva
- ✅ Título clicable → Continúa reserva
- ✅ Botón "Reservar" → Continúa reserva
- Muestra precio base y precio con descuento
- Muestra características principales (plazas, camas, combustible)
- Muestra descuentos por duración si aplica

**URL de reserva**:
```typescript
const reservationUrl = `/reservar/vehiculo?vehicle_id=${vehicle.id}&${searchParams.toString()}`;
```

**Uso**:
```tsx
<Link href={reservationUrl} className="relative h-48 bg-gray-200 overflow-hidden block">
  <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
</Link>

<Link href={reservationUrl}>
  <h3 className="text-xl font-bold hover:text-furgocasa-orange">
    {vehicle.name}
  </h3>
</Link>
```

---

### `VehicleGallery`

**Archivo**: `src/components/vehicle/vehicle-gallery.tsx`

**Props**:
```typescript
interface VehicleGalleryProps {
  images: Array<{
    id: string;
    image_url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
  }>;
  vehicleName: string;
}
```

**Características**:
- Imagen principal con aspect ratio `16:10`
- Controles de navegación (flechas y dots)
- Miniaturas de todas las imágenes
- Totalmente responsive (móvil y desktop)
- Indicador de imagen actual
- Hover effects

**Responsive**:
```tsx
// Imagen principal
<div className="relative aspect-[16/10] bg-gradient-to-br from-gray-900 to-gray-800">
  <img
    src={currentImage.image_url}
    alt={currentImage.alt_text}
    className="w-full h-full object-cover"
  />
</div>

// Miniaturas con scroll horizontal
<div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
  {sortedImages.map((image, index) => (
    <button className="flex-shrink-0 w-16 sm:w-20 md:w-24 aspect-video">
      <img src={image.image_url} alt={image.alt_text} />
    </button>
  ))}
</div>
```

---

## 🎁 Gestión de Extras

### Esquema en Base de Datos

**Tabla**: `extras`

```sql
CREATE TABLE extras (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price_per_day NUMERIC(10,2),     -- Precio por día (puede ser null)
  price_per_unit NUMERIC(10,2),    -- Precio único (puede ser null)
  price_type VARCHAR NOT NULL,     -- 'per_day' o 'per_unit'
  min_quantity INTEGER,            -- per_day: mín. días (ej. parking 4); per_unit: mín. unidades; NULL=sin mínimo
  max_quantity INTEGER DEFAULT 1,
  icon VARCHAR,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Lógica de Precios

**⚠️ IMPORTANTE**: Los campos son `price_per_unit` y `price_type: 'per_unit'`, **NO** `price_per_rental`.

```typescript
// ✅ CORRECTO
if (extra.price_type === 'per_unit') {
  price = extra.price_per_unit || 0;
}

// ❌ INCORRECTO (versión antigua)
if (extra.price_type === 'per_rental') {
  price = extra.price_per_rental || 0;
}
```

### Ejemplos de Extras

| Extra | price_type | price_per_day | price_per_unit | min_quantity | Descripción |
|-------|------------|---------------|----------------|--------------|-------------|
| Sábanas y almohadas | `per_unit` | `null` | `20.00` | `null` | Se cobra una vez por reserva |
| Edredón de invierno | `per_unit` | `null` | `30.00` | `null` | Se cobra una vez por reserva |
| Aparcamiento en Murcia | `per_day` | `10.00` | `null` | `4` | Mín. 4 días (40€); 7 días = 70€ |
| Bicicletas | `per_day` | `5.00` | `null` | `null` | Se cobra por cada día |

### Display de Precios

```typescript
let priceDisplay = '';
if (extra.price_type === 'per_unit') {
  const price = extra.price_per_unit || 0;
  priceDisplay = `${formatPrice(price)} / unidad`;
} else {
  const price = extra.price_per_day || 0;
  priceDisplay = `${formatPrice(price)} / día`;
}
```

### Cálculo de Subtotales

```typescript
const calculateExtraSubtotal = (extra: Extra, quantity: number, days: number): number => {
  if (extra.price_type === 'per_unit') {
    // Precio único multiplicado por cantidad
    return (extra.price_per_unit || 0) * quantity;
  } else {
    // Precio por día multiplicado por días y cantidad
    return (extra.price_per_day || 0) * days * quantity;
  }
};
```

### Guardar en `booking_extras`

```typescript
const bookingExtras = selectedExtras.map(item => {
  const price_per_unit = item.extra.price_type === 'per_unit'
    ? item.extra.price_per_unit
    : item.extra.price_per_day;
    
  const subtotal = item.extra.price_type === 'per_unit'
    ? (item.extra.price_per_unit || 0) * item.quantity
    : (item.extra.price_per_day || 0) * days * item.quantity;

  return {
    booking_id: booking.id,
    extra_id: item.extra.id,
    quantity: item.quantity,
    price_per_unit: price_per_unit,
    subtotal: subtotal,
  };
});
```

---

## 👤 Gestión de Clientes

### Problema: RLS (Row Level Security)

**Error común**:
```
new row violates row-level security policy for table "customers"
```

**Causa**: Las políticas RLS de Supabase bloquean inserciones desde el frontend para usuarios no autenticados.

### Solución: API Route con Service Role

**Archivo**: `src/app/api/customers/route.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Usar service role para bypasear RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    // Service role client que bypasea RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const body = await request.json();
    const { email, name, phone, dni, ...otherData } = body;

    // Validar campos requeridos
    if (!email || !name || !phone || !dni) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si cliente ya existe por email O DNI
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .or(`email.eq.${email},dni.eq.${dni}`)
      .limit(1)
      .single();

    if (existing) {
      // Cliente ya existe - devolver ID existente
      return NextResponse.json(
        { customer: existing },
        { status: 200 }
      );
    }

    // Crear nuevo cliente (service role bypasea RLS)
    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        email,
        name,
        phone,
        dni,
        ...otherData,
        total_bookings: 0,
        total_spent: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error: any) {
    console.error("Error in customers API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
```

### Configuración en Vercel

**Variable de entorno requerida**:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**⚠️ IMPORTANTE**:
- Esta key tiene acceso **completo** a la base de datos
- **NUNCA** exponerla en el frontend
- Solo usarla en API routes server-side

### Flujo de verificación de clientes

```typescript
// 1. Buscar cliente existente
const { data: existingCustomers } = await supabase
  .from('customers')
  .select('id, total_bookings, total_spent')
  .or(`email.eq.${email},dni.eq.${dni}`)
  .limit(1);

if (existingCustomers && existingCustomers.length > 0) {
  // 2a. Cliente existe - usar ID
  customerId = existingCustomers[0].id;
} else {
  // 2b. Cliente nuevo - crear vía API
  const response = await fetch('/api/customers', {
    method: 'POST',
    body: JSON.stringify({ ...customerData }),
  });
  const { customer } = await response.json();
  customerId = customer.id;
}

// 3. Usar customerId para crear booking
```

---

## 🧭 Navegación entre Pasos

### Principio: Preservar contexto

**Regla**: Cada paso debe poder retroceder al paso anterior **sin perder datos**.

### Implementación

**Paso 1 → Paso 2**: Link con parámetros
```tsx
// De búsqueda a resultados
<Link href={`/buscar?pickup_date=${date}&dropoff_date=${date}&...`}>
  Buscar
</Link>
```

**Paso 2 → Paso 3**: Link preservando searchParams
```tsx
// De resultados a detalles
const reservationUrl = `/reservar/vehiculo?vehicle_id=${id}&${searchParams.toString()}`;
```

**Paso 3 → Paso 4**: Router.push añadiendo extras
```tsx
// De detalles a formulario
const params = new URLSearchParams(searchParams);
params.set('extras', extrasParam);
router.push(`/reservar/nueva?${params.toString()}`);
```

**Retroceder**: router.back()
```tsx
// Volver al paso anterior
<button onClick={() => router.back()}>
  Volver al paso anterior
</button>
```

### Breadcrumbs correctos

```tsx
// En /buscar
<Link href="/reservar">Volver a búsqueda</Link>

// En /reservar/vehiculo
<Link href={`/buscar?${searchParams.toString()}`}>
  Volver a resultados
</Link>

// En /reservar/nueva
<button onClick={() => router.back()}>
  Volver al paso anterior
</button>
```

---

## 🔗 Variables de URL

### Parámetros de búsqueda

Estos parámetros se mantienen en la URL durante todo el flujo:

```typescript
interface SearchParams {
  pickup_date: string;      // "2026-01-14"
  dropoff_date: string;     // "2026-01-18"
  pickup_time: string;      // "11:00"
  dropoff_time: string;     // "11:00"
  pickup_location: string;  // "murcia" | "alicante" | "valencia"
  dropoff_location: string; // "murcia" | "alicante" | "valencia"
}
```

### Parámetros adicionales por paso

**En `/reservar/vehiculo`**:
```typescript
vehicle_id: string; // UUID del vehículo seleccionado
```

**En `/reservar/nueva`**:
```typescript
vehicle_id: string;
extras?: string;    // "extra_id:quantity,extra_id:quantity"
```

### Ejemplo de URL completa

```
/reservar/nueva?
  vehicle_id=4b23e652-2769-49f7-a3f5-500e3f5f63e7
  &pickup_date=2026-01-14
  &dropoff_date=2026-01-31
  &pickup_time=11:00
  &dropoff_time=11:00
  &pickup_location=murcia
  &dropoff_location=murcia
  &extras=abc-123:2,def-456:1
```

---

## 🔧 Problemas Comunes y Soluciones

### 1. Extras muestran "0€ / día"

**Causa**: Campo incorrecto en interfaz o query.

**Solución**:
```typescript
// ✅ CORRECTO
interface Extra {
  price_per_unit: number | null;  // NO price_per_rental
  price_type: 'per_unit';          // NO 'per_rental' o 'one_time'
}
```

### 2. Extras no se suman al total

**Causa**: Falta null coalescing en cálculo.

**Solución**:
```typescript
const price = (item.extra.price_per_unit || 0);  // ← agregar || 0
```

### 3. Error RLS al crear cliente

**Causa**: Frontend intenta insertar directamente en Supabase.

**Solución**: Usar API route `/api/customers` con service role key.

### 4. Botón "Volver" va a home

**Causa**: Link hardcodeado en lugar de `router.back()`.

**Solución**:
```tsx
// ❌ INCORRECTO
<Link href="/reservar">Volver</Link>

// ✅ CORRECTO
<button onClick={() => router.back()}>Volver al paso anterior</button>
```

### 5. Imagen o título no clicable

**Causa**: Solo el botón "Reservar" tiene el link.

**Solución**: Envolver imagen y título en `<Link>`:
```tsx
<Link href={reservationUrl}>
  <Image src={imageUrl} alt={alt} />
</Link>
<Link href={reservationUrl}>
  <h3>{vehicle.name}</h3>
</Link>
```

### 6. CTA móvil impide ver extras

**Causa**: Botón sticky arriba invita a clic antes de explorar.

**Solución**: CTA sticky **abajo**, info simple arriba (no sticky).

---

## ✅ Checklist de Testing

### Test manual del flujo completo

- [ ] Buscar vehículos con fechas y ubicaciones
- [ ] Ver resultados filtrados correctamente
- [ ] Click en imagen de vehículo → Continúa reserva
- [ ] Click en título de vehículo → Continúa reserva
- [ ] Click en "Reservar" → Continúa reserva
- [ ] Ver galería de imágenes funcionando
- [ ] Seleccionar extras "Por día" → Precio correcto
- [ ] Seleccionar extras "Por unidad" → Precio correcto
- [ ] Ver total actualizarse con extras
- [ ] Click en "Continuar" → Va a formulario
- [ ] Completar formulario con cliente existente → No error RLS
- [ ] Completar formulario con cliente nuevo → Crea correctamente
- [ ] Ver confirmación con todos los datos
- [ ] Botones "Volver" funcionan en cada paso

### Test en móvil

- [ ] Búsqueda funciona correctamente
- [ ] Cards de vehículos son clicables
- [ ] Galería de imágenes se adapta
- [ ] Extras se ven correctamente
- [ ] CTA aparece sticky abajo (NO arriba)
- [ ] Formulario es usable
- [ ] Botones "Volver" son accesibles

---

## 📚 Referencias

- **[CHANGELOG.md](./CHANGELOG.md)** - Historial de cambios v1.0.1
- **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** - Flujo crítico de negocio
- **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** - Gestión de clientes
- **[SUPABASE-SCHEMA-REAL.md](./SUPABASE-SCHEMA-REAL.md)** - Schema de tablas

---

**Última actualización**: 9 de Enero 2026 - v1.0.1
