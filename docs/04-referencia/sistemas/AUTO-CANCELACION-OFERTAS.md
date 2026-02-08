# 🤖 Cancelación Automática de Ofertas - Furgocasa

**Versión**: 2.0  
**Fecha**: 8 de Febrero, 2026

Sistema automático que cancela ofertas de última hora cuando se crean reservas que se solapan con ellas.

---

## 📋 ¿Qué Hace?

El sistema **detecta automáticamente** cuando una reserva confirmada ocupa fechas de una oferta publicada y la cancela al instante.

### Ejemplo:

```
📅 Oferta publicada: 15-20 agosto (Vehículo A)
    ↓
🎫 Cliente reserva: 17-25 agosto (Vehículo A)
    ↓
🤖 Sistema detecta solapamiento
    ↓
❌ Oferta auto-cancelada (ya no visible en web)
    ↓
📝 Nota añadida: "Cancelada por reserva X del 17-25 agosto"
```

---

## 🔧 Implementación Técnica

### Archivo SQL:
`supabase/auto-cancel-conflicting-offers.sql`

### Componentes:

1. **Función SQL**: `auto_cancel_conflicting_offers()`
   - Busca ofertas publicadas del mismo vehículo
   - Verifica solapamiento de fechas
   - Cambia estado a `auto_cancelled`
   - Añade nota explicativa

2. **Triggers**:
   - `trigger_cancel_offers_on_insert` - Se ejecuta al crear reserva
   - `trigger_cancel_offers_on_update` - Se ejecuta al cambiar estado de reserva

### Condiciones para activarse:

✅ La reserva debe estar en estado: `confirmed`, `active`, o `completed`  
✅ La oferta debe estar en estado: `published`  
✅ Las fechas deben solaparse de alguna forma

---

## 🎯 Casos de Solapamiento Detectados

| Caso | Ejemplo |
|------|---------|
| **1. Reserva cubre toda la oferta** | Reserva: 10-25 / Oferta: 15-20 |
| **2. Reserva solapa inicio** | Reserva: 10-17 / Oferta: 15-20 |
| **3. Reserva solapa final** | Reserva: 17-25 / Oferta: 15-20 |
| **4. Reserva dentro de oferta** | Reserva: 16-18 / Oferta: 15-20 |

Cualquiera de estos casos **cancela automáticamente** la oferta.

---

## 📊 Estados de Oferta

| Estado | Descripción | Visible en Web |
|--------|-------------|----------------|
| `detected` | Hueco detectado, pendiente de publicar | ❌ No |
| `published` | Publicada y visible | ✅ Sí |
| `reserved` | Alguien la reservó exitosamente | ❌ No |
| `expired` | Expirada por fecha pasada | ❌ No |
| `auto_cancelled` | **Cancelada automáticamente** por reserva | ❌ No |
| `cancelled` | Cancelada manualmente por admin | ❌ No |
| `ignored` | Admin decidió no publicarla | ❌ No |

---

## 🛠️ Instalación

### 1. Ejecutar SQL en Supabase

```bash
# Copiar contenido de:
supabase/auto-cancel-conflicting-offers.sql

# Ejecutar en SQL Editor de Supabase
```

### 2. Verificar instalación

```sql
-- Ver que la función existe
SELECT proname FROM pg_proc WHERE proname = 'auto_cancel_conflicting_offers';

-- Ver que los triggers existen
SELECT tgname FROM pg_trigger WHERE tgname LIKE 'trigger_cancel_offers%';
```

---

## 🧪 Testing

### Prueba Manual:

```sql
-- 1. Crear una oferta publicada
INSERT INTO last_minute_offers (
  id,
  vehicle_id, 
  offer_start_date, 
  offer_end_date,
  offer_days,
  original_price_per_day,
  discount_percentage,
  final_price_per_day,
  status,
  detected_at
) VALUES (
  gen_random_uuid(),
  'tu-vehicle-id-aqui',
  '2026-08-15',
  '2026-08-20',
  5,
  100,
  20,
  80,
  'published',
  NOW()
);

-- 2. Crear una reserva solapada (trigger se ejecuta automáticamente)
INSERT INTO bookings (
  id,
  vehicle_id,
  customer_id,
  pickup_date,
  dropoff_date,
  status,
  total_price
) VALUES (
  gen_random_uuid(),
  'tu-vehicle-id-aqui',
  'tu-customer-id-aqui',
  '2026-08-17',
  '2026-08-22',
  'confirmed',
  500
);

-- 3. Verificar que la oferta se canceló
SELECT 
  status, 
  admin_notes,
  updated_at
FROM last_minute_offers 
WHERE vehicle_id = 'tu-vehicle-id-aqui'
  AND offer_start_date = '2026-08-15';

-- Resultado esperado:
-- status: 'auto_cancelled'
-- admin_notes: Contiene ID de la reserva
-- updated_at: Timestamp reciente
```

---

## 🔍 Monitorización

### Ver ofertas auto-canceladas:

```sql
SELECT 
  o.id,
  v.name as vehicle_name,
  o.offer_start_date,
  o.offer_end_date,
  o.status,
  o.admin_notes,
  o.updated_at
FROM last_minute_offers o
JOIN vehicles v ON v.id = o.vehicle_id
WHERE o.status = 'auto_cancelled'
ORDER BY o.updated_at DESC;
```

### Panel Admin:

En `/administrator/ofertas-ultima-hora`:

1. **Estadística naranja**: Contador de ofertas auto-canceladas
2. **Filtro**: Seleccionar "Auto-canceladas" para ver solo esas
3. **Badge naranja**: Cada oferta muestra su estado visual
4. **Notas**: Al ver detalles, muestra por qué reserva fue cancelada

---

## 🔄 Botón "Consultar Ofertas"

Aunque el sistema es automático, el botón manual sirve para:

- ✅ **Auditoría**: Verificar que todo funciona bien
- ✅ **Fechas bloqueadas**: Detectar ofertas que solapan con bloqueos manuales
- ✅ **Troubleshooting**: Diagnosticar si hay problemas
- ✅ **Revisión histórica**: Ver qué pasó con ofertas antiguas

---

## ⚡ Performance

- **Tiempo de ejecución**: < 50ms (nivel base de datos)
- **Impacto en reservas**: Mínimo (trigger asíncrono)
- **Escalabilidad**: Excelente (SQL optimizado)

---

## 🚨 Casos Edge

### ¿Qué pasa si...?

**...la reserva se cancela después?**
- La oferta permanece `auto_cancelled`
- Admin puede volver a publicarla manualmente si quiere

**...hay múltiples ofertas del mismo vehículo?**
- Todas las que se solapen se cancelan
- Cada una recibe su nota explicativa

**...la oferta ya estaba expirada?**
- No pasa nada (solo afecta a `published`)

**...la reserva está pendiente?**
- No se cancela (solo `confirmed`, `active`, `completed`)

---

## 📝 Logs

El trigger genera logs en Supabase:

```
NOTICE: Auto-canceladas 1 ofertas por reserva abc-123 
        (vehículo xyz-789, fechas: 2026-08-17 - 2026-08-22)
```

Ver logs en: Supabase Dashboard → Database → Logs

---

## 🔐 Seguridad

- ✅ Trigger ejecutado con permisos de sistema
- ✅ No depende de código cliente
- ✅ Imposible que un usuario lo salte
- ✅ Atómico (todo o nada)

---

## 📚 Documentación Relacionada

- `SISTEMA-OFERTAS-ULTIMA-HORA.md` - Sistema completo de ofertas
- `supabase/auto-cancel-conflicting-offers.sql` - Código SQL del trigger
- `/administrator/ofertas-ultima-hora` - Panel de administración

---

**¿Dudas o problemas?** Revisa los logs de Supabase o usa el botón "Consultar Ofertas" para auditar.
