# 🔧 Problema de Vinculación de Clientes en Migración

## 📋 Resumen del Problema

Durante la migración de datos desde la antigua base de datos de FurgoCasa (VikRentCar + MySQL) a Supabase, se detectó que **las reservas no se están vinculando correctamente con los clientes** en la tabla `customers`.

### ¿Por qué ocurre esto?

La estructura de la base de datos antigua **NO tiene una relación directa** entre:
- Tabla `fur_vikrentcar_orders` (reservas)
- Tabla `fur_vikrentcar_customers` (clientes)

Las reservas solo almacenan:
- `nominative` - Nombre del cliente (string)
- `custmail` - Email del cliente (string)
- `phone` - Teléfono del cliente (string)

**NO hay un campo `customer_id` o similar** que vincule directamente la reserva con un registro de cliente.

---

## 🔍 Causas Específicas

### 1. **Emails No Coinciden**
```
Cliente en tabla customers:
  email: "juan.perez@gmail.com"

Reserva en tabla orders:
  custmail: "juanperez@gmail.com"  ← SIN PUNTO

❌ No coincide → reserva queda sin vincular
```

### 2. **Emails Generados Automáticamente**
Durante la migración, si un cliente no tenía email, se le asigna:
```
email: "cliente123@legacy.furgocasa.com"
```

Pero la reserva puede tener el email real del cliente:
```
custmail: "cliente.real@gmail.com"
```

❌ No coincide → reserva queda sin vincular

### 3. **Nombres con Diferencias Ortográficas**
```
Cliente:
  name: "José María García López"

Reserva:
  nominative: "Jose Maria Garcia Lopez"  ← Sin acentos

❌ No coincide exactamente
```

### 4. **Clientes que Hicieron Reservas pero No Están Registrados**
Algunos clientes pueden haber hecho reservas como "invitados" sin registrarse completamente en el sistema antiguo.

---

## ✅ Solución Implementada

He mejorado el script de migración con una **estrategia de vinculación en cascada**:

### Script Principal: `migrate-old-data.ts` (Mejorado)

**Estrategia de búsqueda (en orden de prioridad):**

1. **Por email exacto** (normalizado a minúsculas)
   ```typescript
   customerEmailMap.get(booking.custmail.toLowerCase().trim())
   ```

2. **Por nombre completo normalizado** (sin acentos, minúsculas)
   ```typescript
   customerNameMap.get(normalizeCustomerName(booking.nominative))
   ```
   - Solo para nombres únicos (si hay duplicados, se ignoran para evitar errores)

3. **Por teléfono** (sin espacios ni prefijo +)
   ```typescript
   customerPhoneMap.get(booking.phone.replace(/\s+/g, '').replace(/^\+/, ''))
   ```

**Mejoras implementadas:**

✅ Normalización de emails (lowercase, trim)
✅ Normalización de nombres (sin acentos, sin espacios extra)
✅ Mapeo por teléfono como último recurso
✅ Logs detallados de cada vinculación/no vinculación
✅ Estadísticas al final del proceso

---

### Script de Reparación: `fix-customer-links.ts` (Nuevo)

Este script adicional se ejecuta **DESPUÉS** de la migración para intentar vincular las reservas que quedaron sin cliente.

**Características:**

✅ Busca solo reservas con `customer_id = NULL`
✅ Usa la misma estrategia de vinculación mejorada
✅ Ignora emails `@legacy.furgocasa.com`
✅ Actualiza solo las que encuentra coincidencias
✅ No modifica reservas ya vinculadas

---

## 🚀 Cómo Usar la Solución

### Paso 1: Ejecutar Migración Mejorada

```bash
npx tsx scripts/migrate-old-data.ts
```

**Salida esperada:**
```
✅ 26 reservas activas migradas exitosamente
   ✓ 20 reservas vinculadas a clientes
   ⚠️  6 reservas SIN vincular a clientes
```

El script mostrará para cada reserva:
- ✓ Si se vinculó (y por qué método: email/nombre/teléfono)
- ⚠️ Si NO se vinculó (con nombre y email para revisión)

### Paso 2: Ejecutar Script de Reparación (Opcional)

Si quedaron reservas sin vincular:

```bash
npx tsx scripts/fix-customer-links.ts
```

Este script intentará una segunda pasada más exhaustiva.

### Paso 3: Vincular Manualmente (Si es necesario)

Para las reservas que aún queden sin vincular:

1. Ve al panel de Supabase → Tabla `bookings`
2. Filtra por `customer_id IS NULL`
3. Busca manualmente el cliente en la tabla `customers` por email/nombre
4. Actualiza el campo `customer_id` con el UUID correcto

---

## 📊 Datos de Ejemplo del Problema

### Ejemplo Real de Reserva Sin Vincular

```json
{
  "customer_name": "Henning Pedersen",
  "customer_email": "hepe@mail.tele.dk",
  "customer_phone": ""
}
```

**¿Por qué no se vincula?**
- Email es danés (`.dk`) y poco común
- Puede no existir en tabla `customers`
- Puede haber sido registrado con otro email
- El teléfono está vacío

**Solución:**
1. Buscar en `customers` si existe "Henning Pedersen"
2. Si existe con otro email → actualizar `customer_id`
3. Si no existe → crear cliente nuevo desde reserva

---

## 🔬 Verificación Post-Migración

### Consulta SQL para Revisar Estado

```sql
-- Ver cuántas reservas están sin vincular
SELECT COUNT(*) as sin_vincular
FROM bookings
WHERE customer_id IS NULL;

-- Ver detalles de reservas sin vincular
SELECT 
  id,
  booking_number,
  customer_name,
  customer_email,
  customer_phone,
  pickup_date
FROM bookings
WHERE customer_id IS NULL
ORDER BY pickup_date;

-- Ver clientes con más reservas
SELECT 
  c.name,
  c.email,
  COUNT(b.id) as total_reservas
FROM customers c
LEFT JOIN bookings b ON b.customer_id = c.id
GROUP BY c.id, c.name, c.email
ORDER BY total_reservas DESC
LIMIT 20;
```

### Consulta para Actualizar Estadísticas

Después de vincular reservas, ejecutar:

```sql
UPDATE customers SET
  total_bookings = (
    SELECT COUNT(*) 
    FROM bookings 
    WHERE bookings.customer_id = customers.id
  ),
  total_spent = (
    SELECT COALESCE(SUM(total_price), 0) 
    FROM bookings 
    WHERE bookings.customer_id = customers.id 
    AND status != 'cancelled'
  )
WHERE id IN (
  SELECT DISTINCT customer_id 
  FROM bookings 
  WHERE customer_id IS NOT NULL
);
```

---

## 🎯 Recomendaciones Futuras

### Para el Sistema Nuevo

En Supabase, las reservas **sí tienen `customer_id` como UUID**, lo cual resuelve este problema.

**Tabla `bookings` actual:**
```typescript
customer_id: string | null;  // ← UUID que apunta a customers.id
customer_name: string;        // ← Guardado como backup
customer_email: string;       // ← Guardado como backup
customer_phone: string;       // ← Guardado como backup
```

Ventajas:
✅ Relación directa con `customers`
✅ Datos del cliente replicados como backup
✅ Si cliente se borra, datos quedan en reserva
✅ Foreign key garantiza integridad

### Mejora para Migraciones Futuras

Si tienes que hacer otra migración similar:

1. **Pre-procesar emails**: Normalizar todos antes de importar
2. **Crear mapeo manual**: Para clientes problemáticos
3. **Importar en dos pasadas**:
   - Primera: Con vinculación automática
   - Segunda: Manual para casos edge
4. **Guardar logs detallados**: De todas las decisiones de vinculación

---

## 📞 Soporte

Si después de ejecutar ambos scripts aún hay reservas sin vincular:

1. **Revisa los logs** del script para ver qué datos tienen esas reservas
2. **Busca manualmente** en la tabla `customers` si existen con otro nombre/email
3. **Verifica** si son clientes nuevos que no estaban en la tabla antigua
4. **Crea clientes nuevos** si es necesario desde el panel de administración

---

## 📝 Resumen Ejecutivo

| Concepto | Valor |
|----------|-------|
| **Problema** | Reservas sin vincular a clientes |
| **Causa raíz** | Base de datos antigua sin relación directa |
| **Solución principal** | Script mejorado con vinculación en cascada |
| **Solución secundaria** | Script de reparación post-migración |
| **Tasa de éxito esperada** | ~80-90% automático, resto manual |
| **Tiempo de reparación** | 5-10 minutos |

---

**Última actualización:** 2026-01-19
