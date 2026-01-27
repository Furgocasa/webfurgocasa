# Fix: Cálculo automático de días en reservas

## Problema detectado

**Fecha:** 27 de enero de 2026  
**Reportado por:** Usuario administrador

### Descripción
En la página de detalle de reservas del administrador (`/administrator/reservas/[id]`), **no se mostraba el recuento de días** en la sección de "Fechas y ubicación", a diferencia de la página del cliente donde sí aparece.

Además, se detectó que cuando se modifican las fechas de una reserva existente (por ejemplo, el cliente amplía la reserva), **el campo `days` en la base de datos no se actualiza automáticamente**, causando una desincronización entre:
- Las fechas reales (pickup_date y dropoff_date)
- El campo `days` almacenado

**Ejemplo concreto:** Reserva con fechas del 23/05/2026 al 09/06/2026 = 17 días reales, pero el campo `days` mostraba 14 días (los días originales antes de la ampliación).

## Causa raíz

1. **No había un indicador visual de días** en la sección de fechas del panel de administración
2. **No existía un trigger en Supabase** que recalculara automáticamente el campo `days` cuando se modifican las fechas

## Solución implementada

### 1. Actualización de interfaz (Frontend)

**Archivo:** `src/app/administrator/(protected)/reservas/[id]/page.tsx`

Se agregó una tarjeta visual que muestra la duración en días, calculada en tiempo real desde las fechas, con dos características:

- **Cálculo dinámico:** Siempre muestra los días correctos basándose en las fechas actuales
- **Detección de desincronización:** Si el campo `days` en base de datos no coincide con el cálculo real, muestra una advertencia en naranja

```typescript
<div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
  <p className="text-sm text-gray-500 uppercase font-medium mb-1">Duración</p>
  <p className="font-bold text-furgocasa-blue text-xl">
    {(() => {
      const pickup = new Date(booking.pickup_date);
      const dropoff = new Date(booking.dropoff_date);
      const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
      return days;
    })()} días
  </p>
  {booking.days !== Math.ceil((new Date(booking.dropoff_date).getTime() - new Date(booking.pickup_date).getTime()) / (1000 * 60 * 60 * 24)) && (
    <p className="text-xs text-orange-600 mt-1">
      ⚠️ Base de datos: {booking.days} días (desincronizado)
    </p>
  )}
</div>
```

### 2. Trigger automático en Supabase (Backend)

**Archivo:** `supabase/auto-update-booking-days.sql`

Se creó un trigger que actualiza automáticamente el campo `days` cuando:
- Se crea una nueva reserva (INSERT)
- Se modifican las fechas de una reserva existente (UPDATE de pickup_date o dropoff_date)

```sql
CREATE OR REPLACE FUNCTION calculate_booking_days()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular días basándose en la diferencia entre fechas
  NEW.days := EXTRACT(DAY FROM (NEW.dropoff_date - NEW.pickup_date))::INTEGER;
  
  -- Asegurar que sea al menos 1 día
  IF NEW.days < 1 THEN
    NEW.days := 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_booking_days
  BEFORE INSERT OR UPDATE OF pickup_date, dropoff_date ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_booking_days();
```

### 3. Script de corrección para datos existentes

**Archivo:** `supabase/fix-booking-days.sql`

Script SQL que:
1. Identifica todas las reservas con el campo `days` desincronizado
2. Las actualiza con el valor correcto calculado desde las fechas
3. Verifica que la corrección fue exitosa

## Instrucciones de aplicación

### Paso 1: Aplicar el trigger en Supabase

1. Conectarse al dashboard de Supabase: https://supabase.com/dashboard
2. Ir a **SQL Editor**
3. Ejecutar el contenido del archivo `supabase/auto-update-booking-days.sql`

### Paso 2: Corregir datos existentes

1. En **SQL Editor** de Supabase
2. Ejecutar el contenido del archivo `supabase/fix-booking-days.sql`
3. Verificar que todas las reservas quedan sincronizadas

### Paso 3: Desplegar cambios de frontend

Los cambios en la interfaz ya están aplicados en el código. Al hacer el próximo deploy, estarán disponibles.

## Verificación

### Para verificar el trigger:

```sql
-- 1. Ver el trigger instalado
SELECT * FROM pg_trigger WHERE tgname = 'trigger_calculate_booking_days';

-- 2. Probar modificando una reserva
UPDATE bookings 
SET dropoff_date = pickup_date + INTERVAL '20 days' 
WHERE id = 'algún-id-de-prueba';

-- 3. Verificar que 'days' se actualizó automáticamente a 20
SELECT id, pickup_date, dropoff_date, days FROM bookings WHERE id = 'algún-id-de-prueba';
```

### Para verificar la interfaz:

1. Acceder a `/administrator/reservas/[id]` de cualquier reserva
2. Verificar que en la sección "Fechas y ubicación" aparece una tarjeta azul con "Duración: X días"
3. Si hay desincronización, aparecerá texto naranja indicándolo

## Beneficios

✅ **Consistencia de datos:** El campo `days` siempre coincide con las fechas reales  
✅ **Mantenimiento automático:** No requiere actualización manual al modificar fechas  
✅ **Visibilidad mejorada:** Los administradores ven claramente la duración de cada reserva  
✅ **Detección proactiva:** Alerta visual si hay desincronización (útil durante migración)  

## Archivos modificados

- ✅ `src/app/administrator/(protected)/reservas/[id]/page.tsx` - Añadido indicador de duración
- ✅ `supabase/auto-update-booking-days.sql` - Trigger para actualización automática (nuevo)
- ✅ `supabase/fix-booking-days.sql` - Script de corrección de datos (nuevo)
- ✅ `supabase/README-FIX-BOOKING-DAYS.md` - Esta documentación (nuevo)

## Notas adicionales

- El cálculo de días usa `EXTRACT(DAY FROM (dropoff_date - pickup_date))` que devuelve la diferencia exacta en días
- En el frontend se usa `Math.ceil()` para redondear hacia arriba y ser coherente con la lógica de negocio
- El trigger solo se ejecuta cuando cambian las fechas, no en cualquier UPDATE de la reserva (optimización)
