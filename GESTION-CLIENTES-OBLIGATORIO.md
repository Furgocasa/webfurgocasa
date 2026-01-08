# 👥 GESTIÓN DE CLIENTES - REGLAS OBLIGATORIAS

**Fecha creación:** 2026-01-08  
**Estado:** ✅ IMPLEMENTADO Y VERIFICADO

---

## 🎯 OBJETIVO

Este documento garantiza que **TODOS** los datos de clientes se manejan correctamente, usando la tabla `customers` como fuente única de verdad y manteniendo un snapshot histórico en cada reserva.

---

## 📊 ARQUITECTURA DE DATOS

### Dos tablas, dos propósitos:

```
┌─────────────────────────────────────────────────────────────┐
│                    TABLA: customers                         │
│  - Datos ACTUALES del cliente                              │
│  - Se ACTUALIZAN con cada reserva                          │
│  - Incluyen estadísticas (total_bookings, total_spent)     │
│  - UN cliente = UN registro (identificado por email)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ customer_id (FK)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    TABLA: bookings                          │
│  - Incluye customer_id (relación)                          │
│  - SNAPSHOT de datos del cliente en ese momento            │
│  - NO se modifican si el cliente cambia sus datos          │
│  - Garantiza histórico preciso de cada reserva             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 REGLAS OBLIGATORIAS

### Regla #1: SIEMPRE usar la tabla `customers`

✅ **CORRECTO:**
```typescript
// 1. Buscar o crear cliente
const { data: existingCustomers } = await supabase
  .from('customers')
  .select('id, total_bookings, total_spent')
  .eq('email', customerEmail);

let customerId;
if (existingCustomers && existingCustomers.length > 0) {
  // Cliente existe → Actualizar
  customerId = existingCustomers[0].id;
  await supabase.from('customers').update({...}).eq('id', customerId);
} else {
  // Cliente nuevo → Crear
  const { data: newCustomer } = await supabase
    .from('customers')
    .insert({...})
    .select('id')
    .single();
  customerId = newCustomer.id;
}

// 2. Crear reserva con customer_id
await supabase.from('bookings').insert({
  customer_id: customerId,  // ⚠️ CRÍTICO
  // ... resto de datos ...
});
```

❌ **INCORRECTO:**
```typescript
// NO hacer esto: guardar solo en bookings sin customer_id
await supabase.from('bookings').insert({
  customer_name: '...',
  customer_email: '...',
  // ❌ Falta customer_id
  // ❌ No se crea registro en customers
});
```

### Regla #2: Email es el identificador único

```typescript
// ✅ SIEMPRE buscar por email (único y obligatorio)
const { data: existingCustomers } = await supabase
  .from('customers')
  .select('*')
  .eq('email', customerEmail)  // ⚠️ Email es UNIQUE en la BD
  .limit(1);
```

### Regla #3: Actualizar estadísticas automáticamente

```typescript
// ✅ Incrementar total_bookings y total_spent
if (existingCustomers && existingCustomers.length > 0) {
  await supabase.from('customers').update({
    total_bookings: (existingCustomers[0].total_bookings || 0) + 1,
    total_spent: (existingCustomers[0].total_spent || 0) + totalPrice,
    updated_at: new Date().toISOString(),
  }).eq('id', customerId);
}
```

### Regla #4: Guardar snapshot en bookings

```typescript
// ✅ Copiar datos del cliente a bookings (snapshot)
await supabase.from('bookings').insert({
  customer_id: customerId,           // FK a customers
  // Snapshot (datos en ese momento):
  customer_name: customerName,
  customer_email: customerEmail,
  customer_phone: customerPhone,
  customer_dni: customerDni,
  customer_address: customerAddress,
  customer_city: customerCity,       // ⚠️ Obligatorio
  customer_postal_code: customerPostalCode,  // ⚠️ Obligatorio
  // ...
});
```

---

## 📋 CAMPOS OBLIGATORIOS EN FORMULARIO

### Datos Personales:
- ✅ `name` - Nombre completo (VARCHAR 200)
- ✅ `email` - Email (VARCHAR 255, UNIQUE)
- ✅ `phone` - Teléfono (VARCHAR 50)
- ✅ `dni` - DNI/NIE/Pasaporte (VARCHAR 20)
- ✅ `date_of_birth` - Fecha de nacimiento (DATE)

### Dirección Completa:
- ✅ `address` - Dirección (TEXT)
- ✅ `city` - Ciudad (VARCHAR 100)
- ✅ `postal_code` - Código postal (VARCHAR 20)
- ✅ `country` - País (VARCHAR 100, default: 'España')

### Datos del Carnet de Conducir:
- ✅ `driver_license` - Número de carnet (VARCHAR 50)
- ✅ `driver_license_expiry` - Fecha de caducidad (DATE)

### Campos Opcionales:
- ⭕ `notes` - Notas del cliente (TEXT)

### Campos Automáticos (NO en formulario):
- 🤖 `user_id` - FK a auth.users (si tiene cuenta)
- 🤖 `total_bookings` - Se calcula automáticamente
- 🤖 `total_spent` - Se calcula automáticamente
- 🤖 `created_at` - Timestamp de creación
- 🤖 `updated_at` - Timestamp de última actualización

---

## 🚨 ERRORES COMUNES Y SOLUCIONES

### ❌ Error: "payment_method does not exist"

**Causa:** Intentar guardar `payment_method` en `bookings`.

**Solución:** 
```typescript
// ❌ INCORRECTO
await supabase.from('bookings').insert({
  payment_method: 'bank_transfer',  // ❌ No existe en bookings
});

// ✅ CORRECTO
// payment_method está en la tabla 'payments', no en 'bookings'
await supabase.from('payments').insert({
  booking_id: bookingId,
  payment_method: 'bank_transfer',  // ✅ Aquí sí existe
});
```

### ❌ Error: "amount_paid does not exist"

**Causa:** Intentar guardar `amount_paid` en `bookings`.

**Solución:**
```typescript
// ❌ INCORRECTO
await supabase.from('bookings').insert({
  amount_paid: 0,  // ❌ No existe en bookings
});

// ✅ CORRECTO
// amount_paid se calcula desde la tabla 'payments'
const { data: payments } = await supabase
  .from('payments')
  .select('amount')
  .eq('booking_id', bookingId)
  .eq('status', 'authorized');

const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
```

### ❌ Error: Cliente duplicado

**Causa:** No buscar cliente existente antes de crear uno nuevo.

**Solución:**
```typescript
// ✅ SIEMPRE verificar primero
const { data: existing } = await supabase
  .from('customers')
  .select('id')
  .eq('email', customerEmail);

if (existing && existing.length > 0) {
  // Usar existente
  customerId = existing[0].id;
} else {
  // Crear nuevo
  const { data: newCustomer } = await supabase
    .from('customers')
    .insert({...});
  customerId = newCustomer.id;
}
```

---

## 🔍 QUERIES DE VERIFICACIÓN

### Verificar cliente creado:
```sql
SELECT 
  id,
  email,
  name,
  total_bookings,
  total_spent,
  created_at
FROM customers
WHERE email = 'cliente@example.com';
```

### Verificar relación booking → customer:
```sql
SELECT 
  b.booking_number,
  b.customer_id,
  c.name as customer_name,
  c.email as customer_email,
  b.customer_name as snapshot_name,
  b.total_price
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id
WHERE b.booking_number = 'FG12345678';
```

### Verificar estadísticas del cliente:
```sql
SELECT 
  c.name,
  c.email,
  c.total_bookings,
  c.total_spent,
  COUNT(b.id) as actual_bookings,
  SUM(b.total_price) as actual_spent
FROM customers c
LEFT JOIN bookings b ON c.id = b.customer_id
WHERE c.email = 'cliente@example.com'
GROUP BY c.id;

-- total_bookings debe coincidir con actual_bookings
-- total_spent debe coincidir con actual_spent
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

Cuando implementes o modifiques el formulario de reserva, verifica:

### Formulario:
- [ ] ¿Captura TODOS los campos obligatorios?
- [ ] ¿Fecha de nacimiento < Hoy?
- [ ] ¿Caducidad del carnet > Hoy?
- [ ] ¿Validación de email correcta?
- [ ] ¿Formato de teléfono aceptable?

### Lógica de Backend:
- [ ] ¿Busca cliente por email?
- [ ] ¿Actualiza si existe?
- [ ] ¿Crea si no existe?
- [ ] ¿Guarda customer_id en bookings?
- [ ] ¿Guarda snapshot completo en bookings?
- [ ] ¿Actualiza total_bookings y total_spent?
- [ ] ¿Maneja errores correctamente?

### Verificación:
- [ ] ¿Cliente aparece en tabla customers?
- [ ] ¿Reserva tiene customer_id?
- [ ] ¿Snapshot de datos en bookings?
- [ ] ¿Estadísticas correctas?

---

## 📁 ARCHIVOS INVOLUCRADOS

### Formulario de Cliente:
- `src/app/reservar/nueva/page.tsx` - **CRÍTICO**
  - Líneas ~68-83: Estados del formulario
  - Líneas ~175-280: Función `handleSubmit`
  - Líneas ~342-500: Campos del formulario

### Páginas que usan datos del cliente:
- `src/app/reservar/[id]/page.tsx` - Muestra datos de la reserva
- `src/app/administrator/(protected)/clientes/page.tsx` - Lista de clientes
- `src/app/administrator/(protected)/reservas/page.tsx` - Lista de reservas

---

## 🔄 FLUJO COMPLETO (Diagrama)

```
Usuario llena formulario
         │
         ↓
    [BUSCAR CLIENTE]
    SELECT * FROM customers 
    WHERE email = ?
         │
         ├─→ [EXISTE] ─→ UPDATE customers
         │                SET name=?, phone=?, ...
         │                    total_bookings = total_bookings + 1,
         │                    total_spent = total_spent + ?
         │
         └─→ [NO EXISTE] ─→ INSERT INTO customers
                            VALUES (...)
                            RETURNING id
         │
         ↓
    Obtener customer_id
         │
         ↓
    INSERT INTO bookings
    (customer_id, customer_name, customer_email, ...)
         │
         ↓
    INSERT INTO booking_extras (si hay)
         │
         ↓
    Redirigir a /reservar/[booking_id]
```

---

## 📞 CONTACTO EN CASO DE PROBLEMAS

Si encuentras errores relacionados con clientes:

1. ✅ Verifica que usas `customers` como tabla principal
2. ✅ Verifica que guardas `customer_id` en bookings
3. ✅ Verifica que NO intentas guardar `payment_method` o `amount_paid` en bookings
4. ✅ Consulta este documento
5. ✅ Revisa `FLUJO-RESERVAS-CRITICO.md`
6. ✅ Verifica el schema real en `SUPABASE-SCHEMA-REAL.md`

---

**Última actualización:** 2026-01-08  
**Verificado por:** Assistant (Claude)  
**Estado:** ✅ IMPLEMENTADO Y FUNCIONAL
