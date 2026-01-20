# Script de Recálculo de Días de Reservas

Este script recalcula los días de todas las reservas existentes aplicando la regla de **períodos completos de 24 horas sin prorrateo**.

## 🎯 Propósito

Actualizar reservas antiguas que puedan tener mal calculada la duración porque:
- Se calcularon solo con fechas (ignorando horas)
- No tenían `dropoff_time` definido
- Se calcularon antes de implementar la regla de 24h completas

## ⚠️ Regla Aplicada

**Los alquileres se cobran por períodos completos de 24 horas:**
- Recogida 12/01 10:00 → Devolución 15/01 10:00 = **3 días**
- Recogida 12/01 10:00 → Devolución 15/01 10:01 = **4 días** (1 minuto de exceso = día completo)

## 🚀 Uso

### 1. Modo DRY-RUN (Recomendado primero)

Muestra qué cambios se harían **SIN aplicarlos**:

```bash
npx tsx scripts/fix-booking-days.ts
```

o explícitamente:

```bash
npx tsx scripts/fix-booking-days.ts --dry-run
```

### 2. Aplicar Cambios

Una vez revisados los cambios, aplícalos realmente:

```bash
npx tsx scripts/fix-booking-days.ts --apply
```

## 📋 Qué Hace el Script

1. **Consulta** todas las reservas de la base de datos
2. **Recalcula** los días usando `calculateRentalDays()` con fechas y horas
3. **Compara** el valor calculado con el almacenado en `booking.days`
4. **Identifica** reservas que necesitan actualización
5. **Muestra** un resumen detallado de cambios
6. **Aplica** cambios solo si se usa `--apply`

## 🔍 Casos Especiales

### Reservas sin `dropoff_time`

Si una reserva no tiene hora de devolución:
- Se usa `10:00` por defecto (hora estándar)
- Se actualiza el campo `dropoff_time` con este valor

### Reservas sin `pickup_time`

Si una reserva no tiene hora de recogida:
- Se usa `10:00` por defecto

## 📊 Ejemplo de Salida

```
🔍 Script de Recálculo de Días de Reservas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  MODO DRY-RUN: Solo se mostrarán los cambios sin aplicarlos
   Para aplicar cambios realmente, ejecuta con: --apply

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Consultando reservas...

✅ Encontradas 45 reservas

📈 RESUMEN DE ANÁLISIS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total reservas analizadas:      45
Reservas correctas:             38 ✅
Reservas a actualizar:          7 ⚠️
Reservas sin hora devolución:   3 (se usará 10:00)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 DETALLE DE CAMBIOS A REALIZAR:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Reserva: FC-2024-001
   Cliente: Juan García
   Recogida:  2024-01-12 10:00
   Devolución: 2024-01-15 10:30
   Días: 3 → 4 (+1)

2. Reserva: FC-2024-015
   Cliente: María López
   Recogida:  2024-02-20 14:00
   Devolución: 2024-02-22 13:00
   Días: 2 → 2 (+0)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Modo DRY-RUN: No se han aplicado cambios
   Para aplicar los cambios, ejecuta:
   npx tsx scripts/fix-booking-days.ts --apply
```

## ⚠️ Precauciones

1. **Siempre ejecuta primero en modo dry-run**
2. **Revisa cuidadosamente** los cambios propuestos
3. **Haz backup** de la base de datos antes de aplicar (recomendado)
4. **Verifica** que tienes las variables de entorno configuradas

## 🔐 Variables de Entorno Requeridas

El script necesita acceso a Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

Estas variables deben estar en tu archivo `.env.local`

## 📝 Notas Importantes

- El script **NO modifica precios**, solo actualiza el campo `days`
- Los precios ya cobrados a clientes **NO se recalculan**
- Este script es para **corregir datos históricos** únicamente
- Para reservas futuras, el sistema ya calcula correctamente desde el frontend

## 🐛 Troubleshooting

### Error: Variables de entorno no encontradas

```bash
❌ Error: Variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY requeridas
```

**Solución:** Verifica que tienes `.env.local` con las variables correctas

### Error: No se puede conectar a Supabase

**Solución:** Verifica que las credenciales en `.env.local` son correctas y que tienes conexión a internet

### El script no encuentra reservas

**Solución:** Verifica que existen reservas en la tabla `bookings` con `pickup_date` y `dropoff_date`

## 📚 Referencias

- Ver: `REGLA-CALCULO-DIAS-ALQUILER.md` para detalles de la regla de negocio
- Ver: `src/lib/utils.ts` para la implementación de `calculateRentalDays()`

---

**Fecha de creación:** 2026-01-20  
**Versión:** 1.0.0
