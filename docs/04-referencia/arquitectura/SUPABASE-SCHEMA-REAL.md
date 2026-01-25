# 📊 SCHEMA REAL DE SUPABASE - FURGOCASA

**Generado:** 2026-01-08 19:08:11 UTC  
**⚠️ ESTE ES EL SCHEMA REAL - USAR COMO REFERENCIA DEFINITIVA**

---

## ⚠️ REGLAS OBLIGATORIAS PARA QUERIES

### 1. SIEMPRE usar `*` en relaciones
```typescript
// ✅ CORRECTO
.select('*, images:vehicle_images(*)')

// ❌ INCORRECTO - Puede fallar
.select('*, images:vehicle_images(url, alt)')
```

### 2. Nombres de tablas EXACTOS
- ✅ `vehicle_categories` (NO `categories`)
- ✅ `vehicle_images` (NO `images`)
- ✅ `vehicle_equipment` (relación válida)

### 3. Nombres de columnas por tabla

---

## 📋 TABLA: `vehicles`

**Total de columnas: 98**

### Columnas principales:
```
id, name, slug, category_id, brand, model, year, 
plate_number, description, short_description, 
seats, beds, length_m, width_m, height_m,
fuel_type, transmission, engine_power, engine_displacement,
has_bathroom, has_kitchen, has_ac, has_heating, 
has_solar_panel, has_awning, features,
is_for_rent, base_price_per_day, status,
is_for_sale, sale_price, sale_price_negotiable, sale_status,
mileage, condition, sort_order, created_at, updated_at,
internal_code, length, width, height, location
```

### ⚠️ Campos críticos para disponibilidad:
```sql
is_for_rent BOOLEAN      -- Para alquiler
status VARCHAR           -- 'available', 'rented', 'maintenance', 'inactive'
is_for_sale BOOLEAN      -- Para venta
sale_status VARCHAR      -- 'available', 'sold', 'reserved'
```

### Query correcta para alquiler:
```typescript
const { data } = await supabase
  .from('vehicles')
  .select(`
    *,
    category:vehicle_categories(*),
    images:vehicle_images(*),
    vehicle_equipment(
      id,
      notes,
      equipment(*)
    )
  `)
  .eq('is_for_rent', true)
  .eq('status', 'available')
```

---

## 📋 TABLA: `vehicle_categories`

**Total de columnas: 8**

```
id, name, slug, description, image_url, 
sort_order, created_at, updated_at, is_active
```

### Query correcta:
```typescript
const { data } = await supabase
  .from('vehicle_categories')
  .select('*')
  .eq('is_active', true)
  .order('sort_order', { ascending: true })
```

---

## 📋 TABLA: `vehicle_images`

**Total de columnas: 8**

```
id, vehicle_id, image_url, alt_text, sort_order, 
is_primary, created_at, updated_at
```

### ⚠️ IMPORTANTE: Nombres reales de campos
- ✅ `image_url` (NO `url`)
- ✅ `alt_text` (NO `alt`)
- ✅ `is_primary` (NO `is_main`)

### Query correcta:
```typescript
const { data } = await supabase
  .from('vehicle_images')
  .select('*')
  .eq('vehicle_id', vehicleId)
  .order('is_primary', { ascending: false })
  .order('sort_order', { ascending: true })
```

---

## 📋 TABLA: `vehicle_equipment`

**Total de columnas: 5**

```
id, vehicle_id, equipment_id, notes, created_at
```

### Relación: Muchos a Muchos
- `vehicles` ←→ `vehicle_equipment` ←→ `equipment`

### Query correcta (desde vehicles):
```typescript
const { data } = await supabase
  .from('vehicles')
  .select(`
    *,
    vehicle_equipment(
      id,
      notes,
      equipment(*)
    )
  `)
```

---

## 📋 TABLA: `equipment`

**Total de columnas: 11**

```
id, name, slug, description, icon, category,
is_active, is_standard, sort_order, created_at, updated_at
```

### ⚠️ Campo `category` EXISTE en equipment
Valores: `confort`, `energia`, `exterior`, `multimedia`, `seguridad`, `agua`

### Query correcta:
```typescript
const { data } = await supabase
  .from('equipment')
  .select('*')
  .eq('is_active', true)
  .order('category', { ascending: true })
  .order('sort_order', { ascending: true })
```

---

## 📋 TABLA: `extras`

**Total de columnas: 14**

```
id, name, description, price_per_day, price_per_rental,
price_type, max_quantity, image_url, is_active, sort_order,
created_at, updated_at, icon, price_per_unit
```

### ⚠️ IMPORTANTE: Esta tabla NO tiene columna `category`

### Query correcta:
```typescript
const { data } = await supabase
  .from('extras')
  .select('*')
  .eq('is_active', true)
  .order('sort_order', { ascending: true })
```

---

## 📋 TABLA: `bookings`

**Tabla vacía actualmente**

### Columnas esperadas (según schema.sql):
```
id, customer_id, vehicle_id, pickup_date, dropoff_date,
pickup_time, dropoff_time, pickup_location_id, dropoff_location_id,
total_days, base_price, extras_price, location_fee,
total_price, status, payment_status, payment_method,
created_at, updated_at
```

---

## 📋 TABLA: `booking_extras`

**Tabla vacía actualmente**

### Columnas esperadas (según schema.sql):
```
id, booking_id, extra_id, quantity, 
price_per_unit, total_price, created_at
```

---

## 📋 TABLA: `seasons`

**Total de columnas: 15**

```
id, name, slug, start_date, end_date, min_days, is_active,
created_at, updated_at, base_price_per_day, year,
price_less_than_week, price_one_week, price_two_weeks, price_three_weeks
```

### ⚠️ LÓGICA DE PRECIOS:

Los campos de precio son **valores fijos en euros** por día:
- `price_less_than_week` (< 7 días): Precio por día
- `price_one_week` (7-13 días): Precio por día
- `price_two_weeks` (14-20 días): Precio por día  
- `price_three_weeks` (21+ días): Precio por día

**Ejemplo real de la BD:**
```json
{
  "name": "Temporada Media - Fin Diciembre 2025",
  "base_price_per_day": 95,
  "price_less_than_week": 125,  // Alquiler < 7 días: 125€/día
  "price_one_week": 115,         // Alquiler 7-13 días: 115€/día
  "price_two_weeks": 105,        // Alquiler 14-20 días: 105€/día
  "price_three_weeks": 95        // Alquiler 21+ días: 95€/día
}
```

### Query correcta para obtener temporada activa:
```typescript
const { data: season } = await supabase
  .from('seasons')
  .select('*')
  .eq('is_active', true)
  .lte('start_date', pickupDate)
  .gte('end_date', pickupDate)
  .single()
```

### Cálculo de precio correcto:
```typescript
function getPricePerDay(days: number, season: Season) {
  if (days >= 21) return season.price_three_weeks;
  if (days >= 14) return season.price_two_weeks;
  if (days >= 7) return season.price_one_week;
  return season.price_less_than_week;
}
```

---

## 📋 TABLA: `locations`

**Total de columnas: 20**

```
id, name, slug, address, city, postal_code,
latitude, longitude, phone, email,
opening_time, closing_time, is_pickup, is_dropoff,
extra_fee, notes, is_active, created_at, updated_at, sort_order
```

### Query correcta:
```typescript
const { data } = await supabase
  .from('locations')
  .select('*')
  .eq('is_active', true)
  .eq('is_pickup', true)
  .order('sort_order', { ascending: true })
```

---

## 🔍 ERRORES COMUNES Y SOLUCIONES

### ❌ Error: "column extras.category does not exist"
**Solución:** La tabla `extras` NO tiene columna `category`. Usar `sort_order` para ordenar.

### ❌ Error: "Could not find a relationship between 'vehicles' and 'categories'"
**Solución:** La tabla correcta es `vehicle_categories`, no `categories`.

### ❌ Error: "column vehicle_images_1.url does not exist"
**Solución:** El campo correcto es `image_url`, no `url`. Mejor usar `select('*')`.

### ❌ Error: "column vehicles.is_available does not exist"
**Solución:** Los campos correctos son `is_for_rent` y `status`.

---

## ✅ QUERIES DEFINITIVAS POR PÁGINA

### Página: `/buscar` (resultados de búsqueda)
```typescript
// API: /api/availability
const { data: vehicles } = await supabase
  .from('vehicles')
  .select(`
    *,
    category:vehicle_categories(*),
    images:vehicle_images(*)
  `)
  .eq('is_for_rent', true)
  .eq('status', 'available')
```

### Página: `/reservar/vehiculo` (detalles antes de reservar)
```typescript
const { data: vehicle } = await supabase
  .from('vehicles')
  .select(`
    *,
    category:vehicle_categories(*),
    images:vehicle_images(*),
    vehicle_equipment(
      id,
      notes,
      equipment(*)
    )
  `)
  .eq('id', vehicleId)
  .eq('is_for_rent', true)
  .neq('status', 'inactive')
  .single()

const { data: extras } = await supabase
  .from('extras')
  .select('*')
  .eq('is_active', true)
  .order('sort_order', { ascending: true })
```

### Página: `/vehiculos/[slug]` (detalle de vehículo)
```typescript
const { data: vehicle } = await supabase
  .from('vehicles')
  .select(`
    *,
    category:vehicle_categories(*),
    images:vehicle_images(*),
    vehicle_equipment(
      id,
      notes,
      equipment(*)
    )
  `)
  .eq('slug', slug)
  .single()
```

### Página: `/ventas/[slug]` (vehículo en venta)
```typescript
const { data: vehicle } = await supabase
  .from('vehicles')
  .select(`
    *,
    category:vehicle_categories(*),
    images:vehicle_images(*),
    vehicle_equipment(
      id,
      notes,
      equipment(*)
    )
  `)
  .eq('slug', slug)
  .eq('is_for_sale', true)
  .eq('sale_status', 'available')
  .single()
```

---

## 📝 RESUMEN DE CAMPOS CRÍTICOS

| Tabla | Campo Correcto | ❌ Error Común |
|-------|---------------|----------------|
| vehicles | `is_for_rent` | `is_available` |
| vehicles | `status` | - |
| vehicle_categories | `vehicle_categories` | `categories` |
| vehicle_images | `image_url` | `url` |
| vehicle_images | `alt_text` | `alt` |
| vehicle_images | `is_primary` | `is_main` |
| extras | `is_active` | `is_available` |
| extras | ❌ NO tiene `category` | `category` |
| equipment | ✅ SÍ tiene `category` | - |

---

**Última actualización:** 2026-01-08  
**Fuente:** Consulta directa a Supabase desde `/api/debug/schema`
