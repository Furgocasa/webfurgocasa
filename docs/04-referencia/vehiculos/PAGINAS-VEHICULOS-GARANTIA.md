# 🚗 GARANTÍA DE CALIDAD - PÁGINAS DE VEHÍCULOS

**Fecha creación:** 2026-01-08  
**Última actualización:** 2026-03-22 (listados flota/venta/búsqueda + transmisión)  
**Estado:** ✅ VERIFICADO Y FUNCIONAL

---

## 📋 Listados en grid (flota, ventas, búsqueda) — marzo 2026

| Contexto | Componente / rutas | Notas |
|----------|-------------------|--------|
| Flota alquiler | `src/components/vehicle/vehicle-list-client.tsx` usado por `src/app/{es,en,fr,de}/vehiculos|vehicles|vehicules|fahrzeuge/page.tsx` | Solo **nombre** (`vehicle.name`) como título principal; sin repetir `brand` + `model` debajo. Plazas, plazas noche, combustible, transmisión en una fila. |
| Ventas | `src/components/vehicle/sale-vehicle-card.tsx` + grids en `ventas-client` (es/en/fr/de) | Cabecera: badges **marca**, **año**, **km**; fila de specs sin kilometraje. |
| Búsqueda disponibilidad | `src/components/booking/vehicle-card.tsx` | Incluye transmisión (Manual/Automática) en la fila de iconos. |
| Transmisión en UI | `isAutomaticTransmission()` en `src/lib/utils.ts` | El admin guarda `Manual` / `Automática`; en BD pueden coexistir `manual` / `automatic`. La función unifica la detección para etiquetas y filtros. |
| Caché | Páginas de listado con `revalidate` (p. ej. 3600 s) | Tras un deploy, la CDN puede servir HTML cacheado hasta la siguiente revalidación. |

---

## 📌 RELACIÓN CON VEHÍCULOS VENDIDOS

Los vehículos con `sale_status = 'sold'` están excluidos de búsqueda de disponibilidad, calendario y nueva reserva. Las páginas públicas de alquiler no los mostrarán. Ver [SISTEMA-VEHICULOS-VENDIDOS.md](./SISTEMA-VEHICULOS-VENDIDOS.md).

---

## 🎯 OBJETIVO

Este documento garantiza que **TODAS** las páginas del frontend que muestran información de vehículos están completas, correctas y muestran **TODOS** los campos disponibles en la base de datos.

---

## 📍 PÁGINAS CRÍTICAS

### 1. `/vehiculos/[slug]` - Detalle de vehículo para alquiler
**Archivo:** `src/app/vehiculos/[slug]/page.tsx`

### 2. `/ventas/[slug]` - Detalle de vehículo para venta
**Archivo:** `src/app/ventas/[slug]/page.tsx`

### 3. `/reservar/vehiculo` - Detalle de vehículo en proceso de reserva
**Archivo:** `src/app/reservar/vehiculo/page.tsx`

---

## ✅ CHECKLIST DE CAMPOS OBLIGATORIOS

### 📋 Información Básica
- [x] **name** - Nombre del vehículo
- [x] **brand** - Marca
- [x] **model** - Modelo
- [x] **year** - Año
- [x] **short_description** - Descripción corta
- [x] **description** - Descripción completa (HTML)
- [x] **category** - Categoría (desde `vehicle_categories`)

### 👥 Capacidad
- [x] **seats** - Plazas homologadas
- [x] **beds** - Plazas para dormir

### 📏 Dimensiones
- [x] **length_m** - Largo en metros
- [x] **width_m** - Ancho en metros
- [x] **height_m** - Alto en metros
- [x] **Sección visual de dimensiones** - Con iconos Ruler

### 🔧 Motor y Mecánica
- [x] **fuel_type** - Tipo de combustible
- [x] **transmission** - Tipo de cambio
- [x] **engine_power** - Potencia del motor
- [x] **engine_displacement** - Cilindrada

### 🛠️ Equipamiento
- [x] **vehicle_equipment** - Relación con tabla `equipment`
- [x] **VehicleEquipmentDisplay** - Componente que muestra el equipamiento
- [x] **Agrupado por categorías** - confort, energía, exterior, multimedia, seguridad, agua
- [x] **Iconos dinámicos** - Según campo `icon` de cada equipment

### 🖼️ Imágenes
- [x] **vehicle_images** - Galería de imágenes
- [x] **VehicleGallery** - Componente de galería
- [x] **Orden correcto** - `is_primary` primero, luego `sort_order`

### 💰 Extras (solo `/reservar/vehiculo`)
- [x] **Lista de extras disponibles** - Desde tabla `extras`
- [x] **price_type** - Muestra si es por día o por reserva
- [x] **min_quantity** - Mínimo de días (per_day) o unidades (per_unit); ej. parking 4 días mín.
- [x] **max_quantity** - Respeta cantidad máxima
- [x] **Selector de cantidad** - Para extras con max_quantity > 1
- [x] **Cálculo correcto de precio** - Según tipo de precio, cantidad y min_quantity

### 🚗 Campos específicos de VENTA (solo `/ventas/[slug]`)
- [x] **mileage** - Kilometraje
- [x] **condition** - Estado del vehículo (nuevo, como nuevo, excelente, bueno, aceptable)
- [x] **registration_date** - Fecha de matriculación
- [x] **next_itv_date** - Próxima ITV
- [x] **warranty_until** - Garantía hasta
- [x] **previous_owners** - Propietarios anteriores
- [x] **sale_price** - Precio de venta
- [x] **sale_price_negotiable** - Si es negociable

---

## 🔍 QUERY CORRECTA DE SUPABASE

### Query para cargar un vehículo completo:

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
  .single();
```

### ⚠️ REGLAS IMPORTANTES:

1. **SIEMPRE usar `*`** en las relaciones:
   - ✅ `images:vehicle_images(*)`
   - ❌ `images:vehicle_images(image_url, alt_text)` ← Puede fallar

2. **Nombres de tablas exactos:**
   - ✅ `vehicle_categories`
   - ❌ `categories`

3. **Campos de disponibilidad:**
   - Para alquiler: `is_for_rent = true` y `status != 'inactive'`
   - Para venta: `is_for_sale = true` y `sale_status = 'available'`

4. **Ordenar imágenes:**
   ```typescript
   if (vehicle.images) {
     vehicle.images.sort((a, b) => {
       if (a.is_primary) return -1;
       if (b.is_primary) return 1;
       return (a.sort_order || 999) - (b.sort_order || 999);
     });
   }
   ```

---

## 📐 ESTRUCTURA DE SECCIONES (Orden obligatorio)

### En TODAS las páginas:

1. **Galería de imágenes** (`VehicleGallery`)
2. **Información principal**
   - Categoría (badge)
   - Nombre del vehículo
   - Descripción corta (brand · model · year)
   - Grid de features (seats, beds, fuel, transmission)
3. **Descripción completa** (HTML)
4. **Equipamiento** (`VehicleEquipmentDisplay`)
5. **Especificaciones técnicas** (tabla con habitabilidad y motor)
6. **Dimensiones** (visual con iconos)

### Solo en `/reservar/vehiculo`:
7. **Extras disponibles** (con selectores de cantidad)

---

## 🎨 COMPONENTES OBLIGATORIOS

### `VehicleGallery`
**Ubicación:** `src/components/vehicle/vehicle-gallery.tsx`

**Props:**
```typescript
interface VehicleGalleryProps {
  images: Array<{
    image_url: string;
    alt_text: string;
    is_primary: boolean;
    sort_order: number;
  }>;
  vehicleName: string;
}
```

### `VehicleEquipmentDisplay`
**Ubicación:** `src/components/vehicle/equipment-display.tsx`

**Props:**
```typescript
interface VehicleEquipmentDisplayProps {
  equipment: Array<{
    id: string;
    name: string;
    icon: string;
    category: string;
  }>;
  variant: 'grid' | 'list';
  groupByCategory: boolean;
  title?: string;
}
```

**Categorías de equipamiento:**
- `confort` - Confort (cocina, baño, nevera, calefacción)
- `energia` - Energía (panel solar, batería de litio)
- `exterior` - Exterior (toldo)
- `multimedia` - Multimedia (radio)
- `seguridad` - Conducción y Seguridad (cámara marcha atrás)
- `agua` - Agua (depósitos, calentador)

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### ❌ Error: "No se muestra el equipamiento"
**Causas:**
1. El vehículo no tiene equipamiento asignado en la BD
2. La query no incluye `vehicle_equipment`
3. Falta el componente `VehicleEquipmentDisplay`

**Solución:**
- Verificar en administrador que el vehículo tenga equipamiento asignado
- Asegurarse de que la query incluye la relación completa
- Importar y usar el componente correctamente

### ❌ Error: "Faltan campos de motor o dimensiones"
**Causa:** Los campos están en la BD pero no se muestran en el frontend

**Solución:** Verificar que existen las secciones:
- "Especificaciones técnicas" con `engine_power` y `engine_displacement`
- "Dimensiones" visual con iconos

### ❌ Error: "Las imágenes no se cargan"
**Causa:** Nombres de campos incorrectos

**Solución:** Usar siempre `image_url`, `alt_text`, `is_primary` (NO `url`, `alt`, `is_main`)

---

## 🔄 PROCESO DE VERIFICACIÓN

### Antes de modificar cualquier página de vehículos:

1. **Leer este documento completo**
2. **Verificar SUPABASE-SCHEMA-REAL.md** para nombres exactos de campos
3. **Revisar REGLAS-SUPABASE-OBLIGATORIAS.md** para queries correctas
4. **Comparar con página de administrador** (`/administrator/vehiculos/[id]/editar`)
5. **Probar en las 3 páginas del frontend** después de cualquier cambio

### Después de cualquier modificación:

1. ✅ Verificar que la galería de imágenes se muestra
2. ✅ Verificar que el equipamiento aparece (si el vehículo lo tiene)
3. ✅ Verificar que las especificaciones técnicas son completas
4. ✅ Verificar que las dimensiones se muestran visualmente
5. ✅ Verificar que NO hay errores en la consola del navegador
6. ✅ Comparar con la página de ventas (referencia correcta)

---

## 📚 DOCUMENTOS RELACIONADOS (LEER OBLIGATORIAMENTE)

1. **SUPABASE-SCHEMA-REAL.md** - Schema real de la base de datos
2. **REGLAS-SUPABASE-OBLIGATORIAS.md** - Reglas para queries
3. **FLUJO-RESERVAS-CRITICO.md** - Flujo completo de reservas
4. **GUIA-QUERIES-VEHICULOS.md** - Queries específicas para vehículos

---

## 🎯 REGLA DE ORO

> **Si la página del ADMINISTRADOR muestra un campo,  
> las páginas del FRONTEND también deben mostrarlo.**

La página del administrador (`/administrator/vehiculos/[id]/editar`) es la **fuente de verdad** de qué campos existen y deben mostrarse.

---

## ✅ ESTADO ACTUAL (2026-01-08)

- ✅ `/vehiculos/[slug]` - **COMPLETO Y VERIFICADO**
- ✅ `/ventas/[slug]` - **COMPLETO Y VERIFICADO**
- ✅ `/reservar/vehiculo` - **COMPLETO Y VERIFICADO**

**Todos los campos están presentes y funcionando correctamente.**

---

## 🔒 COMPROMISO DE MANTENIMIENTO

**ANTES de modificar cualquiera de estas 3 páginas:**
1. Lee este documento completo
2. Verifica que tu cambio no rompe ningún campo existente
3. Prueba en las 3 páginas después del cambio
4. Actualiza este documento si añades nuevos campos

**NUNCA:**
- ❌ Elimines campos sin documentar el motivo
- ❌ Cambies la estructura de las queries sin verificar
- ❌ Modifiques componentes compartidos sin probar en todas las páginas
- ❌ Ignores errores de la consola del navegador

---

**Última verificación:** 2026-01-08  
**Verificado por:** Assistant (Claude)  
**Estado:** ✅ TODAS LAS PÁGINAS FUNCIONAN CORRECTAMENTE
