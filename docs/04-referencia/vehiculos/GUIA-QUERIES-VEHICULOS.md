# 🚗 GUÍA DEFINITIVA - QUERIES DE VEHÍCULOS

**Última actualización:** 2026-02-12  
**Basado en:** SUPABASE-SCHEMA-REAL.md

---

## ⚠️ REGLA DE ORO

**SIEMPRE usar `*` en las relaciones. NUNCA especificar campos manualmente.**

```typescript
// ✅ CORRECTO
.select('*, images:vehicle_images(*)')

// ❌ INCORRECTO
.select('*, images:vehicle_images(image_url, alt_text, is_primary)')
```

---

## 📋 LAS 3 PÁGINAS PRINCIPALES DE VEHÍCULOS

### 1️⃣ Página: `/vehiculos/[slug]` - Detalle de vehículo (ALQUILER)

**Archivo:** `src/app/vehiculos/[slug]/page.tsx`  
**Función:** `getVehicleBySlug()` en `src/lib/supabase/queries.ts`

**Query:**
```typescript
const { data, error } = await supabase
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

**Uso:**
- Muestra detalles completos del vehículo
- Incluye galería de imágenes
- Muestra equipamiento
- NO incluye selección de extras

---

### 2️⃣ Página: `/ventas/[slug]` - Detalle de vehículo (VENTA)

**Archivo:** `src/app/ventas/[slug]/page.tsx`  
**Función:** `getVehicle()` (local en el archivo)

**Query:**
```typescript
const { data: vehicle, error } = await supabase
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

**Diferencias con página de alquiler:**
- ✅ Añade `.eq('is_for_sale', true)`
- ✅ Añade `.eq('sale_status', 'available')`
- Muestra precio de venta en lugar de alquiler
- Muestra información de estado (km, ITV, etc.)

---

### 3️⃣ Página: `/reservar/vehiculo` - Detalle + Extras (RESERVA)

**Archivo:** `src/app/reservar/vehiculo/page.tsx`  
**Función:** `loadData()` (local, Client Component)

**Query de vehículo:**
```typescript
const { data: vehicleData, error: vehicleError } = await supabase
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
```

**Query de extras:**
```typescript
const { data: extrasData, error: extrasError } = await supabase
  .from('extras')
  .select('*')
  .eq('is_active', true)
  .order('sort_order', { ascending: true })
  .order('name', { ascending: true })
```

**Diferencias con otras páginas:**
- ✅ Busca por `id` en lugar de `slug`
- ✅ Carga extras disponibles
- ✅ Permite añadir extras con cantidad
- ✅ Calcula precio total con extras
- ⚠️ Es Client Component (usa `"use client"`)

---

## 🔧 COMPONENTES COMUNES

### VehicleGallery

**Archivo:** `src/components/vehicle/vehicle-gallery.tsx`

**Props esperados:**
```typescript
interface VehicleImage {
  image_url: string;      // ⚠️ Nombre real en BD
  alt_text: string | null; // ⚠️ Nombre real en BD
  sort_order: number;
  is_primary: boolean;     // ⚠️ Nombre real en BD
}

interface VehicleGalleryProps {
  images: VehicleImage[];
  vehicleName: string;
}
```

**Uso:**
```typescript
<VehicleGallery 
  images={vehicle.images || []} 
  vehicleName={vehicle.name} 
/>
```

⚠️ **IMPORTANTE:** El componente espera `is_primary`, NO `is_main`.

---

### VehicleEquipmentDisplay

**Archivo:** `src/components/vehicle/equipment-display.tsx`

**Props:**
```typescript
<VehicleEquipmentDisplay
  equipment={vehicle.vehicle_equipment?.map(ve => ve.equipment) || []}
  variant="grid"
  groupByCategory={true}
  title="Equipamiento incluido"
/>
```

**Renderizado condicional:**
```typescript
{vehicle.vehicle_equipment && vehicle.vehicle_equipment.length > 0 && (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <VehicleEquipmentDisplay ... />
  </div>
)}
```

---

## 📊 CAMPOS IMPORTANTES DE LA TABLA `vehicles`

### Campos de disponibilidad (ALQUILER):
```typescript
is_for_rent: boolean     // true para mostrar en alquiler
status: string          // 'available', 'rented', 'maintenance', 'inactive'
base_price_per_day: number
```

### Campos de venta:
```typescript
is_for_sale: boolean
sale_status: string     // 'available', 'sold', 'reserved'
sale_price: number
sale_price_negotiable: boolean
```

### ⚠️ Vehículos vendidos (sale_status = 'sold')

Cuando un vehículo está vendido, debe **excluirse** de operaciones activas (calendario, disponibilidad, nueva reserva):

```typescript
// Para excluir vehículos vendidos:
.or('sale_status.neq.sold,sale_status.is.null')
```

Los **informes** incluyen TODOS los vehículos (incluidos vendidos) para mantener histórico completo.

**Ver:** [SISTEMA-VEHICULOS-VENDIDOS.md](./SISTEMA-VEHICULOS-VENDIDOS.md)

### Campos comunes:
```typescript
id, slug, name, brand, model, year,
seats, beds, fuel_type, transmission,
description, short_description,
category_id  // Relación con vehicle_categories
```

---

## 📸 CAMPOS DE LA TABLA `vehicle_images`

**Nombres REALES en la base de datos:**
```typescript
id: UUID
vehicle_id: UUID
image_url: string        // ⚠️ NO 'url'
alt_text: string         // ⚠️ NO 'alt'
is_primary: boolean      // ⚠️ NO 'is_main'
sort_order: number
created_at: timestamp
updated_at: timestamp
```

**Ordenamiento correcto:**
```typescript
vehicleData.images.sort((a, b) => {
  if (a.is_primary) return -1;
  if (b.is_primary) return 1;
  return (a.sort_order || 999) - (b.sort_order || 999);
});
```

---

## 🛠️ RELACIÓN `vehicle_equipment`

**Estructura:**
```
vehicles (1) ←→ (N) vehicle_equipment (N) ←→ (1) equipment
```

**Query correcta:**
```typescript
vehicle_equipment(
  id,
  notes,
  equipment(*)  // ⚠️ Usar * para obtener todos los campos de equipment
)
```

**Uso en el componente:**
```typescript
const equipmentList = vehicle.vehicle_equipment?.map(ve => ve.equipment) || []
```

---

## ❌ ERRORES COMUNES

### Error 1: Usar nombres de campos incorrectos
```typescript
// ❌ INCORRECTO
images.map(img => img.url)          // Campo NO EXISTE
images.map(img => img.alt)          // Campo NO EXISTE
images.map(img => img.is_main)      // Campo NO EXISTE

// ✅ CORRECTO
images.map(img => img.image_url)
images.map(img => img.alt_text)
images.map(img => img.is_primary)
```

### Error 2: Especificar campos manualmente
```typescript
// ❌ INCORRECTO - Puede causar errores
.select('*, images:vehicle_images(image_url, alt_text)')

// ✅ CORRECTO - Siempre usar *
.select('*, images:vehicle_images(*)')
```

### Error 3: Usar is_available
```typescript
// ❌ INCORRECTO - Campo NO EXISTE
.eq('is_available', true)

// ✅ CORRECTO
.eq('is_for_rent', true)
.neq('status', 'inactive')
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de modificar cualquier página de vehículos:

- [ ] ¿Estás usando `*` en todas las relaciones?
- [ ] ¿Usas `is_primary` en lugar de `is_main`?
- [ ] ¿Usas `image_url` en lugar de `url`?
- [ ] ¿Usas `alt_text` en lugar de `alt`?
- [ ] ¿Usas `is_for_rent` en lugar de `is_available`?
- [ ] ¿Incluyes `vehicle_equipment` si necesitas equipamiento?
- [ ] ¿Ordenas las imágenes por `is_primary` primero?

---

## 🔗 DOCUMENTOS RELACIONADOS

- **[SISTEMA-VEHICULOS-VENDIDOS.md](./SISTEMA-VEHICULOS-VENDIDOS.md)** - Estado vendido y filtros
- **[REGLAS-SUPABASE-OBLIGATORIAS.md](./REGLAS-SUPABASE-OBLIGATORIAS.md)** - Reglas generales
- **[SUPABASE-SCHEMA-REAL.md](./SUPABASE-SCHEMA-REAL.md)** - Schema completo
- **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** - Flujo de reservas

---

**Última verificación:** 2026-02-12  
**Estado:** ✅ Todas las páginas actualizadas y verificadas
