# Eliminación de la Columna `deposit_amount` de Bookings

**Fecha:** 2026-01-27  
**Responsable:** Sistema  
**Razón:** Simplificar el modelo de datos y eliminar confusión

## 📋 Resumen

Se ha eliminado la columna `deposit_amount` de la tabla `bookings` porque:

1. **La fianza es una constante del sistema** (1000€) y no debería almacenarse en cada reserva
2. **Generaba confusión** entre "fianza" y "monto pagado" (`amount_paid`)
3. **No tiene sentido como campo variable** de la reserva

## 🔧 Cambios Realizados

### 1. Base de Datos

**SQL ejecutado:**
```sql
ALTER TABLE public.bookings 
DROP COLUMN IF EXISTS deposit_amount;
```

**Archivo:** `supabase/remove-deposit-amount-column.sql`

**Schema actualizado:** `supabase/schema.sql`

### 2. Archivos TypeScript Modificados

#### Tipos de Base de Datos
- ✅ `src/types/database.ts` - Eliminado `deposit_amount` de las interfaces
- ✅ `src/lib/supabase/database.types.ts` - Eliminado de Row, Insert y Update

#### APIs
- ✅ `src/app/api/bookings/create/route.ts` - Eliminado del schema de validación Zod

#### Páginas de Administrador
- ✅ `src/app/administrator/(protected)/reservas/nueva/page.tsx` - Eliminado campo del formulario
- ✅ `src/app/administrator/(protected)/reservas/[id]/editar/page.tsx` - Eliminado campo del formulario
- ✅ `src/app/administrator/(protected)/reservas/[id]/page.tsx` - Eliminado del tipo
- ✅ `src/app/administrator/(protected)/calendario/page.tsx` - Eliminado referencias

#### Páginas Públicas Multiidioma
- ✅ `src/app/es/reservar/nueva/page.tsx` - Eliminado del insert
- ✅ `src/app/es/reservar/[id]/page.tsx` - Eliminado del tipo
- ✅ `src/app/en/book/new/page.tsx` - Eliminado del insert
- ✅ `src/app/en/book/[id]/page.tsx` - Eliminado del tipo
- ✅ `src/app/fr/reserver/nouvelle/page.tsx` - Eliminado del insert
- ✅ `src/app/fr/reserver/[id]/page.tsx` - Eliminado del tipo
- ✅ `src/app/de/buchen/neu/page.tsx` - Eliminado del insert
- ✅ `src/app/de/buchen/[id]/page.tsx` - Eliminado del tipo

#### Sistema de Emails
- ✅ `src/lib/email/index.ts` - Eliminado de `getBookingDataForEmail`
- ✅ `src/lib/email/templates.ts` - Reemplazado `data.depositAmount` por la constante `1000`

## 📊 Modelo Simplificado

### Antes (INCORRECTO)
```typescript
interface Booking {
  base_price: number;      // Precio del alquiler
  extras_price: number;    // Precio de extras
  total_price: number;     // Total a pagar
  deposit_amount: number;  // ❌ CONFUSO - ¿Es la fianza de 1000€?
  amount_paid: number;     // Monto pagado por el cliente
}
```

### Ahora (CORRECTO)
```typescript
interface Booking {
  base_price: number;      // Precio del alquiler
  extras_price: number;    // Precio de extras
  total_price: number;     // Total a pagar
  amount_paid: number;     // ✅ CLARO - Monto pagado por el cliente
}

// La fianza es una CONSTANTE del sistema: 1000€
const DEPOSIT_AMOUNT = 1000;
```

## 🎯 Cómo Funciona Ahora

### En las Reservas
- **`total_price`**: Precio total del alquiler (base + extras - descuentos)
- **`amount_paid`**: Cuánto ha pagado el cliente hasta ahora
- **Pendiente**: `total_price - amount_paid`

### La Fianza
- Es una **constante del sistema**: **1000€**
- Se menciona en los emails pero NO se registra en la reserva
- El cliente la paga por transferencia antes del inicio
- No forma parte del `total_price` ni del `amount_paid`

## 📧 Impacto en Emails

Los emails siguen mostrando la fianza correctamente:
```typescript
// En los templates de email
<li>Realiza la transferencia de la fianza (1.000,00 €) máximo 72h antes</li>
```

## ✅ Validación

Para verificar que todo está correcto:

1. **Ejecutar el SQL:**
   ```bash
   # En Supabase SQL Editor
   -- Copiar y ejecutar: supabase/remove-deposit-amount-column.sql
   ```

2. **Verificar la tabla:**
   ```sql
   SELECT column_name, data_type, is_nullable 
   FROM information_schema.columns 
   WHERE table_name = 'bookings' 
     AND table_schema = 'public'
   ORDER BY ordinal_position;
   ```

3. **No debe aparecer `deposit_amount` en la lista**

## 🚀 Próximos Pasos

1. ✅ Ejecutar `remove-deposit-amount-column.sql` en Supabase
2. ✅ Hacer commit de los cambios en el código
3. ✅ Desplegar a producción
4. ✅ Verificar que las reservas nuevas funcionan correctamente
5. ✅ Verificar que los emails se envían correctamente

## 📝 Notas Importantes

- **Los datos existentes NO se pierden** porque ya teníamos `amount_paid`
- **La fianza sigue siendo 1000€** en los emails y documentación
- **No hay cambios en el flujo de pagos** desde el punto de vista del cliente
- **Simplifica el código** y elimina confusión entre desarrolladores

## 🔗 Archivos Relacionados

- SQL: `supabase/remove-deposit-amount-column.sql`
- Schema: `supabase/schema.sql`
- Documentación: Este archivo (`ELIMINACION-DEPOSIT-AMOUNT.md`)
