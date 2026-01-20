# Regla de Cálculo de Días de Alquiler - CRÍTICA

## Reglas de Negocio

### 1. Períodos Completos de 24 Horas

**Los precios en Furgocasa se devengan por períodos completos de 24 horas, NO siendo posible su prorrateo.**

#### Ejemplos

- **Alquiler del 12 al 15:**
  - Recogida: 10:00, Devolución: 10:00 → **3 días**
  - Recogida: 10:00, Devolución: 10:01 → **4 días** (un minuto de exceso = día completo adicional)
  - Recogida: 10:00, Devolución: 10:30 → **4 días**

- **Alquiler del 10 al 12:**
  - Recogida: 14:00, Devolución: 14:00 → **2 días**
  - Recogida: 14:00, Devolución: 14:01 → **3 días**

### 2. Mínimo de Cobro: 2 Días = 3 Días

**En temporada baja, los alquileres de 2 días se cobran como 3 días.**

Esta es una regla de negocio crítica: aunque el cliente alquile el vehículo por 48 horas (2 días exactos), se le cobrará el equivalente a 72 horas (3 días).

#### Ejemplos de Pricing

- **1 día:** Cobra 1 día ✅
- **2 días:** Cobra 3 días ⚠️ (regla especial)
- **3 días:** Cobra 3 días ✅
- **4 días:** Cobra 4 días ✅
- **7+ días:** Cobra días reales + descuentos por duración ✅

#### Razón de Negocio

El mínimo de cobro compensa los costes operativos de preparación, limpieza y mantenimiento del vehículo, que son los mismos independientemente de si el alquiler es de 2 o 3 días.

## Implementación

### Funciones Centralizadas

Se han creado dos funciones en `src/lib/utils.ts`:

#### 1. calculateRentalDays()

Calcula los días reales del alquiler considerando fechas y horas.

```typescript
export function calculateRentalDays(
  pickupDate: string,      // YYYY-MM-DD
  pickupTime: string,      // HH:MM
  dropoffDate: string,     // YYYY-MM-DD
  dropoffTime: string      // HH:MM
): number
```

**Lógica:**
1. Combina fecha y hora en timestamps completos
2. Calcula diferencia en milisegundos
3. Convierte a días (con decimales)
4. Usa `Math.ceil()` para redondear SIEMPRE hacia arriba
5. Retorna mínimo 1 día

#### 2. calculatePricingDays()

Aplica la regla de negocio: 2 días se cobran como 3.

```typescript
export function calculatePricingDays(
  actualDays: number       // Días calculados con calculateRentalDays()
): number
```

**Lógica:**
- Si `actualDays === 2` → retorna `3`
- En cualquier otro caso → retorna `actualDays`

### Lugares Actualizados

Estas funciones se usan ahora en todos los lugares donde se calcula la duración y el precio del alquiler:

1. **API de disponibilidad** (`/api/availability/route.ts`)
   - Calcula días reales con `calculateRentalDays()`
   - Calcula días de pricing con `calculatePricingDays()`
   - Muestra aviso si `hasTwoDayPricing === true`

2. **Componente VehicleCard** (`components/booking/vehicle-card.tsx`)
   - Muestra aviso destacado si son 2 días
   - Indica "2 días (cobra 3)" en el desglose

3. **Página de selección de vehículo** (`reservar/vehiculo/page.tsx`)
   - Calcula precio base y extras con `pricingDays`
   - Muestra aviso en resumen móvil y desktop

4. **Página de nueva reserva** (`reservar/nueva/page.tsx`)
   - Calcula precio total con `pricingDays`
   - Guarda días reales en BD (`days`)

5. **Componente de resumen de búsqueda** (`components/booking/search-summary.tsx`)
   - Muestra días reales del alquiler

6. **Widget de búsqueda** (`components/booking/search-widget.tsx`)
   - Valida mínimo de días según ubicación

7. **Editor de reservas admin** (`administrator/reservas/[id]/editar/page.tsx`)
   - Recalcula días cuando se modifican fechas/horas

8. **Listado de reservas admin** (`administrator/reservas/page.tsx`)
   - Muestra días almacenados en BD

9. **Informes** (`administrator/informes/informes-client.tsx`)
   - Usa `booking.days` de la BD para estadísticas

## Campos de Base de Datos

### Tabla `bookings`

Los siguientes campos son OBLIGATORIOS para cada reserva:

- `pickup_date` (date) - Fecha de recogida
- `pickup_time` (text) - Hora de recogida (formato HH:MM)
- `dropoff_date` (date) - Fecha de devolución
- `dropoff_time` (text) - Hora de devolución (formato HH:MM)
- `days` (integer) - **Número de días calculado con la función `calculateRentalDays()`**

El campo `days` debe calcularse SIEMPRE usando la función `calculateRentalDays()` y guardarse al crear/actualizar la reserva.

## IMPORTANTE - Reglas de Cálculo

- ❌ **NUNCA** dividir el precio diario proporcionalmente por horas
- ❌ **NUNCA** usar solo las fechas sin considerar las horas
- ❌ **NUNCA** cobrar 2 días como 2 días (debe ser 3)
- ✅ **SIEMPRE** usar `calculateRentalDays()` para obtener días reales
- ✅ **SIEMPRE** usar `calculatePricingDays()` para calcular precios
- ✅ **SIEMPRE** cobrar días completos, redondeando hacia arriba
- ✅ **SIEMPRE** mostrar aviso cuando `hasTwoDayPricing === true`

## Testing

Para verificar que funciona correctamente:

```typescript
import { calculateRentalDays, calculatePricingDays } from '@/lib/utils';

// Test 1: Mismo horario = días exactos
console.assert(
  calculateRentalDays('2024-01-12', '10:00', '2024-01-15', '10:00') === 3,
  'Error: 3 días exactos'
);

// Test 2: Un minuto de exceso = día completo más
console.assert(
  calculateRentalDays('2024-01-12', '10:00', '2024-01-15', '10:01') === 4,
  'Error: 3 días + 1 minuto = 4 días'
);

// Test 3: Media hora de exceso = día completo más
console.assert(
  calculateRentalDays('2024-01-12', '10:00', '2024-01-15', '10:30') === 4,
  'Error: 3 días + 30 minutos = 4 días'
);

// Test 4: Recogida tarde, devolución temprano
console.assert(
  calculateRentalDays('2024-01-10', '18:00', '2024-01-12', '09:00') === 2,
  'Error: 1 día + 15 horas = 2 días'
);

// Test 5: Regla de pricing - 2 días se cobran como 3
console.assert(
  calculatePricingDays(1) === 1,
  'Error: 1 día cobra 1 día'
);

console.assert(
  calculatePricingDays(2) === 3,
  'Error: 2 días cobran 3 días'
);

console.assert(
  calculatePricingDays(3) === 3,
  'Error: 3 días cobran 3 días'
);

console.assert(
  calculatePricingDays(4) === 4,
  'Error: 4 días cobran 4 días'
);
```

### Ejecutar Suite Completa de Tests

```bash
npx tsx scripts/test-rental-days.ts
```

**Tests incluidos:**
- 12 tests de `calculateRentalDays()` ✅
- 6 tests de `calculatePricingDays()` ✅
- **Total: 18 tests** ✅

## Migración de Datos Antiguos

Si hay reservas antiguas sin `dropoff_time`:
- Usar valor por defecto `'10:00'` (hora estándar de devolución)
- Recalcular el campo `days` usando `calculateRentalDays()`
- Actualizar precios si es necesario

## Documentación para Clientes

Esta regla debe estar claramente documentada en:
- Términos y condiciones
- Política de precios
- Email de confirmación de reserva
- Página de preguntas frecuentes
- Aviso destacado en búsqueda de 2 días

### Textos sugeridos

#### Cálculo de días de alquiler

> **Períodos completos de 24 horas**
>
> El alquiler se cobra por períodos completos de 24 horas. Si supera el horario de devolución, aunque sea por un minuto, se cobrará un día adicional completo.
>
> *Ejemplo:* Si recoge el vehículo el día 10 a las 10:00 y lo devuelve el día 13 a las 10:00, son 3 días. Si lo devuelve el día 13 a las 10:01, son 4 días.

#### Mínimo de alquiler 2 días

> **Alquileres de 2 días**
>
> Por razones operativas, los alquileres de 2 días tienen el mismo precio que los de 3 días. Esto cubre los costes de preparación, limpieza y mantenimiento del vehículo.
>
> *Recomendación:* Si vas a alquilar 2 días, aprovecha para quedarte 3 días al mismo precio.

## Changelog

- **2024-01-20**: Implementación inicial de `calculateRentalDays()` y actualización de todos los puntos del sistema
- **2024-01-20**: Añadida función `calculatePricingDays()` y regla de negocio: 2 días = 3 días de cobro. Añadido aviso visual en interfaces.
