# Fix: Implementación completa del cargo extra por ubicación (location_fee)

**Branch:** `feature/fix-location-fee`  
**Fecha:** 29 de enero de 2026

## 🎯 Objetivo

Corregir la implementación incompleta del campo `extra_fee` de ubicaciones para que el cargo extra se calcule y aplique correctamente en TODAS las reservas.

---

## 🐛 Problemas detectados

### 1. API de Availability (CRÍTICO)
**Archivo:** `src/app/api/availability/route.ts`

**Problema:**
- Solo sumaba el cargo de la ubicación de dropoff
- Solo lo aplicaba si las ubicaciones eran diferentes
- Ignoraba completamente el cargo de la ubicación de pickup

**Código anterior:**
```typescript
let locationFee = 0;
if (pickupLocation !== dropoffLocation) {
  const dropoffLoc = locations?.find((l) => l.id === dropoffLocation);
  locationFee = dropoffLoc?.extra_fee || 0;  // ❌ SOLO dropoff
}
```

**Corrección:**
```typescript
let locationFee = 0;
const pickupLoc = locations?.find((l) => l.id === pickupLocation);
const dropoffLoc = locations?.find((l) => l.id === dropoffLocation);
locationFee = (pickupLoc?.extra_fee || 0) + (dropoffLoc?.extra_fee || 0);  // ✅ SUMA AMBOS
```

---

### 2. Páginas de reserva normales (CRÍTICO)
**Archivos:**
- `src/app/es/reservar/nueva/page.tsx` (Español)
- `src/app/en/book/new/page.tsx` (English)
- `src/app/de/buchen/neu/page.tsx` (Deutsch)
- `src/app/fr/reserver/nouvelle/page.tsx` (Français)

**Problema:** El `location_fee` NO estaba implementado en absoluto

**Cambios realizados en cada archivo:**

#### a) Interfaz LocationData
```typescript
// ❌ Antes
interface LocationData {
  id: string;
  name: string;
  address: string;
}

// ✅ Después
interface LocationData {
  id: string;
  name: string;
  address: string;
  extra_fee: number;  // ✅ Añadido
}
```

#### b) Carga de ubicaciones
```typescript
// ❌ Antes
.select('id, name, address')

// ✅ Después
.select('id, name, address, extra_fee')  // ✅ Añadido extra_fee
```

#### c) Cálculo del cargo extra
```typescript
// ✅ Nueva función
const calculateLocationFee = () => {
  const pickupFee = pickupLocation?.extra_fee || 0;
  const dropoffFee = dropoffLocation?.extra_fee || 0;
  return pickupFee + dropoffFee;
};

const locationFee = calculateLocationFee();
```

#### d) Suma al precio total
```typescript
// ❌ Antes
const subtotalBeforeCoupon = basePrice + extrasPrice;

// ✅ Después
const subtotalBeforeCoupon = basePrice + extrasPrice + locationFee;  // ✅ Añadido locationFee
```

#### e) Envío a la API
```typescript
// ✅ Añadido al objeto booking
booking: {
  // ... otros campos ...
  extras_price: extrasPrice,
  location_fee: locationFee,  // ✅ Añadido
  total_price: totalPrice,
  // ...
}
```

#### f) Visualización en el resumen
```typescript
// ✅ Nueva sección en el resumen de precios
{locationFee > 0 && (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">{t("Cargo extra por ubicación")}</span>
    <span className="font-semibold">{formatPrice(locationFee)}</span>
  </div>
)}
```

---

## ✅ Estado después de la corrección

### Funcionalidad correcta:
1. ✅ **API de Availability**: Suma correctamente pickup + dropoff
2. ✅ **Páginas de reserva ES/EN/DE/FR**: Calculan y muestran location_fee
3. ✅ **API de Bookings**: Acepta y guarda location_fee
4. ✅ **Ofertas de última hora**: Ya funcionaban correctamente (sin cambios)
5. ✅ **Panel de Admin**: Permite editar extra_fee de ubicaciones

---

## 📋 Archivos modificados

1. `src/app/api/availability/route.ts` - Corrección lógica cálculo
2. `src/app/es/reservar/nueva/page.tsx` - Implementación completa ES
3. `src/app/en/book/new/page.tsx` - Implementación completa EN
4. `src/app/de/buchen/neu/page.tsx` - Implementación completa DE
5. `src/app/fr/reserver/nouvelle/page.tsx` - Implementación completa FR

**Total:** 5 archivos modificados

---

## 🧪 Casos de prueba

Para verificar que funciona correctamente:

### Escenario 1: Ubicación con cargo extra
1. En Admin, configurar Madrid con `extra_fee = 50.00`
2. Hacer búsqueda: Madrid → Madrid, 3 días
3. **Resultado esperado:** `location_fee = 100.00` (50 pickup + 50 dropoff)
4. Debe aparecer en el resumen como "Cargo extra por ubicación: 100.00 €"

### Escenario 2: Ubicaciones diferentes
1. En Admin: Madrid `extra_fee = 50.00`, Murcia `extra_fee = 0.00`
2. Hacer búsqueda: Madrid → Murcia, 3 días
3. **Resultado esperado:** `location_fee = 50.00` (50 pickup + 0 dropoff)

### Escenario 3: Sin cargos extra
1. Ambas ubicaciones con `extra_fee = 0.00`
2. **Resultado esperado:** `location_fee = 0.00`, no se muestra la línea en el resumen

---

## 🔄 Flujo de datos

```
1. Usuario busca disponibilidad
   ↓
2. API /api/availability calcula locationFee (pickup + dropoff)
   ↓
3. Página de reserva obtiene extra_fee de ubicaciones
   ↓
4. Calcula locationFee local (pickup + dropoff)
   ↓
5. Suma al total: basePrice + extrasPrice + locationFee - couponDiscount
   ↓
6. Muestra en resumen si locationFee > 0
   ↓
7. Envía location_fee a API /api/bookings/create
   ↓
8. Se guarda en bookings.location_fee
```

---

## 📝 Notas importantes

- El cargo extra se aplica **POR UBICACIÓN**, no por distancia
- Se suma **tanto pickup como dropoff** (pueden ser la misma ubicación)
- Si una ubicación tiene `extra_fee = 0`, no aporta al cargo total
- El campo es visible y editable en el panel de administración
- Compatible con cupones de descuento (se aplica después del location_fee)

---

## 🚀 Próximos pasos

1. ✅ Hacer commit de estos cambios en el branch `feature/fix-location-fee`
2. ⏳ Probar en desarrollo local o staging
3. ⏳ Configurar cargos extra en ubicaciones según necesidad del negocio
4. ⏳ Fusionar con `main` cuando esté validado

---

## 📊 Impacto

- **Usuarios:** Verán el cargo extra claramente desglosado en el resumen
- **Administradores:** Pueden configurar cargos por ubicación desde el panel
- **Negocio:** Permite monetizar ubicaciones premium (ej: aeropuertos, centros urbanos)
- **Facturación:** El location_fee se guarda correctamente en cada reserva

---

**Estado:** ✅ Implementado y listo para testing  
**Requiere validación:** Sí, antes de merge a main
