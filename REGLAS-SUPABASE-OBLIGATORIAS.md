# ⚠️ REGLAS OBLIGATORIAS - QUERIES A SUPABASE

**LEER ANTES DE HACER CUALQUIER QUERY A SUPABASE**

---

## 🚨 REGLA #1: SIEMPRE usar `*` en relaciones

```typescript
// ✅ CORRECTO - SIEMPRE usar asterisco
.select('*, images:vehicle_images(*)')
.select('*, category:vehicle_categories(*)')
.select('*, vehicle_equipment(id, notes, equipment(*))')

// ❌ INCORRECTO - NO especificar campos manualmente
.select('*, images:vehicle_images(url, alt, is_main)')
.select('*, category:vehicle_categories(name)')
```

**Por qué:** Los nombres de campos en Supabase no siempre coinciden con `schema.sql`. Usar `*` evita errores.

---

## 🚨 REGLA #2: Nombres de tablas EXACTOS

### Tablas que existen:
- ✅ `vehicle_categories` (NO `categories`)
- ✅ `vehicle_images`
- ✅ `vehicle_equipment`
- ✅ `equipment`
- ✅ `extras`
- ✅ `seasons`
- ✅ `locations`
- ✅ `bookings`
- ✅ `booking_extras`

---

## 🚨 REGLA #3: Campos de disponibilidad en `vehicles`

```typescript
// ✅ CORRECTO
.eq('is_for_rent', true)
.eq('status', 'available')

// ❌ INCORRECTO
.eq('is_available', true)  // ❌ Este campo NO EXISTE
```

---

## 🚨 REGLA #4: Campos en `vehicle_images`

Los nombres REALES son:
- ✅ `image_url` (NO `url`)
- ✅ `alt_text` (NO `alt`)
- ✅ `is_primary` (NO `is_main`)

**PERO:** Usa `select('*')` y ya está, no los especifiques manualmente.

---

## 🚨 REGLA #5: Campo `category` NO existe en `extras`

```typescript
// ✅ CORRECTO
const { data } = await supabase
  .from('extras')
  .select('*')
  .eq('is_active', true)
  .order('sort_order', { ascending: true })

// ❌ INCORRECTO
.order('category', { ascending: true })  // ❌ Este campo NO EXISTE
```

**Nota:** El campo `category` SÍ existe en `equipment`, pero NO en `extras`.

---

## 🚨 REGLA #6: Lógica de precios por temporada

La tabla `seasons` tiene precios FIJOS por día según duración:

```typescript
// Campos de la tabla seasons:
price_less_than_week   // < 7 días: ej. 125€/día
price_one_week         // 7-13 días: ej. 115€/día
price_two_weeks        // 14-20 días: ej. 105€/día
price_three_weeks      // 21+ días: ej. 95€/día
```

**Cálculo correcto:**
```typescript
function getPricePerDay(days: number, season: Season): number {
  if (days >= 21) return season.price_three_weeks;
  if (days >= 14) return season.price_two_weeks;
  if (days >= 7) return season.price_one_week;
  return season.price_less_than_week;
}

const pricePerDay = getPricePerDay(days, season);
const totalPrice = pricePerDay * days;
```

❌ **NO** usar multiplicadores o porcentajes.  
✅ **SÍ** usar los precios directamente de la tabla.

---

## 🚨 REGLA #7: Query completa de vehículos

### Para ALQUILER (`/buscar`, `/reservar`):
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

### Para VENTA (`/ventas`):
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
  .eq('is_for_sale', true)
  .eq('sale_status', 'available')
```

---

## 🚨 REGLA #8: ANTES de modificar una query

1. **Lee** `SUPABASE-SCHEMA-REAL.md` para ver los campos exactos
2. **Verifica** que la tabla existe
3. **Usa** `select('*')` en lugar de especificar campos
4. **Prueba** en la consola del navegador primero

---

## ✅ CHECKLIST antes de hacer un PR

- [ ] Todas las queries usan `*` en relaciones
- [ ] No se usa `.eq('is_available', ...)` en ninguna parte
- [ ] No se ordena por `category` en la tabla `extras`
- [ ] La tabla correcta es `vehicle_categories`, no `categories`
- [ ] La relación `vehicle_equipment` está incluida donde se necesita equipamiento

---

**Última actualización:** 2026-01-08  
**Ver también:** `SUPABASE-SCHEMA-REAL.md` para el schema completo
