# 💳 Sistema de Pagos Furgocasa

**Versión:** 2.3  
**Última actualización:** 29/04/2026 (sección *Tracking GTM ecommerce* añadida; sin doble conteo en flujo 50 %+50 %)

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Política contractual y excepción (menos de 15 días)](#política-contractual-y-excepción-menos-de-15-días)
3. [Métodos de Pago](#métodos-de-pago)
4. [Arquitectura Técnica](#arquitectura-técnica)
5. [Gestión Manual](#gestión-manual)
6. [Emails Automatizados](#emails-automatizados)
7. [Tracking GTM ecommerce](#tracking-gtm-ecommerce)
8. [Troubleshooting](#troubleshooting)

---

## Visión General

El sistema de pagos de Furgocasa soporta múltiples métodos de pago con procesamiento automático y gestión manual:

- ✅ **Redsys** - Pasarela bancaria española (recomendado; sin comisión repercutida al cliente en el PVP)
- ✅ **Stripe** - Pagos internacionales; la comisión repercutida (~2 %) **forma parte del PVP** (`bookings.total_price`), con desglose en `stripe_fee_total` y por cobro en `payments.stripe_fee`
- ✅ **Transferencia** - Gestión manual
- ✅ **Efectivo** - Gestión manual
- ✅ **Bizum** - Gestión manual

---

## Política contractual y excepción (menos de 15 días)

**Fuente de verdad en código:** `src/lib/company.ts` → `COMPANY.rentalPolicy.bookingPayment` (`reservationPercent: 50`, `remainingBalanceDaysBeforePickup: 15`).

**Regla habitual:** el cliente puede pagar el **50 %** al reservar y el **50 %** restante como máximo **15 días antes** de la recogida, u optar por el **100 %** en el primer cobro.

**Excepción en la interfaz (abril 2026):** si la **fecha de recogida** (`pickup_date`) dista **menos de 15 días** desde la fecha actual (cálculo por días calendario) y **`amount_paid` es 0**, la página de pago **deshabilita** la opción de abonar solo la primera mitad y muestra mensajes orientando al **pago del 100 %** del pendiente. Así se alinea la UX con el plazo del segundo pago sin generar cobros parciales imposibles de completar en tiempo.

**Archivos (misma lógica en los cuatro idiomas):**

- `src/app/es/reservar/[id]/pago/page.tsx`
- `src/app/en/book/[id]/payment/page.tsx`
- `src/app/de/buchen/[id]/zahlung/page.tsx`
- `src/app/fr/reserver/[id]/paiement/page.tsx`

**Nota:** si el cliente **ya pagó** el primer 50 % y solo queda el segundo tramo (`isPending50`), el botón principal sigue siendo «Pagar restante»; no aplica la desactivación del depósito inicial.

**Traducciones:** textos del aviso en `src/lib/translations-preload.ts`.

---

## Métodos de Pago

### 1. Redsys (Recomendado)

**Características:**
- Sin comisión adicional
- Tarjetas: Visa, Mastercard, American Express
- Procesamiento inmediato
- 3D Secure integrado

**Flujo usuario:**
1. Cliente selecciona Redsys
2. Completa datos en pasarela segura
3. Recibe confirmación inmediata
4. Email automático de confirmación

**Estado:** ✅ Funcionando perfectamente en producción

### 2. Stripe

**Características:**
- Comisión: +2% sobre importe base
- Tarjetas internacionales
- Apple Pay / Google Pay
- UI muestra desglose del precio

**Cálculo de precio:**
```
Importe base: 142,50 €
Comisión (2%):   2,85 €
-----------------------
Total a pagar: 145,35 €
```

### 3. Métodos Manuales

**Transferencia Bancaria:**
- Cliente realiza transferencia
- Envía comprobante por email/WhatsApp
- Admin marca pago como completado manualmente

**Efectivo/Bizum:**
- Pago presencial o móvil
- Admin registra en sistema manualmente

---

## Arquitectura Técnica

### Estructura de Datos

```typescript
interface Payment {
  id: string;
  booking_id: string;
  amount: number;       // Importe cobrado al cliente en este pago (con Stripe: base + comisión de este cobro)
  stripe_fee?: number;  // Parte de comisión Stripe en este pago; 0 si no aplica
  payment_method: "redsys" | "stripe" | "transfer" | "cash" | "bizum";
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled";
  order_number?: string;          // Redsys
  stripe_session_id?: string;     // Stripe
  response_code?: string;
  authorization_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

En **`bookings`**, además de `total_price` y `amount_paid`, existe **`stripe_fee_total`**: suma de las comisiones Stripe ya integradas en el PVP (ver migración SQL en **STRIPE-CONFIGURACION.md**).

### Precio de extras (admin vs público)

- **Público** (flujo reserva en `/es/reservar/...` y equivalentes): ya usa **`extraLineUnitPriceEuros`** (`src/lib/utils.ts`) según `extras.price_type` (`per_unit` → `price_per_unit`, `per_day` → días de alquiler y `min_quantity`, etc.).
- **Admin** (crear / editar reserva): debe usar la **misma función** al calcular `booking_extras.unit_price` y totales. No usar `price_per_rental` como valor por defecto para todo lo que no sea `per_day`: en catálogo pueden convivir `price_per_unit` y `price_per_rental` con valores distintos (p. ej. edredón 30 €/unidad vs 20 € en otro campo).

### Endpoints Principales

#### Redsys
- **POST** `/api/redsys/initiate` - Iniciar pago
- **POST** `/api/redsys/notification` - Notificación servidor-a-servidor
- **POST** `/api/redsys/verify-payment` - Fallback manual

#### Stripe
- **POST** `/api/stripe/initiate` - Crear Checkout Session
- **GET** `/api/stripe/session-status` - Verificar estado

#### Admin
- **POST** `/api/payments/update-manual` - Actualizar pago manualmente
- **GET** `/api/payments/by-order` - Buscar por orderNumber

### Sistema de Fallback

**Problema:** Notificación servidor-a-servidor puede fallar  
**Solución:** Fallback automático en `/pago/exito`

```
Redsys redirige → /pago/exito
                    ↓
Frontend detecta payment.status === "pending"
                    ↓
Frontend → POST /api/redsys/verify-payment
                    ↓
API procesa: payment → completed, booking → confirmed, envía email
```

**Principio clave:** Redsys SOLO redirige a URLOK si pago fue exitoso.

---

## Gestión Manual

### Acceso
Panel Admin → Pagos → Clic en ojo 👁️ → `/administrator/pagos/[id]`

### Funcionalidades

1. **Ver Detalle Completo**
   - Información del pago
   - Datos de la reserva asociada
   - Histórico (notas)

2. **Editar Pago**
   - Cambiar método de pago
   - Cambiar estado
   - Añadir notas internas

3. **Confirmar Pago Manual**
   - Marcar como "Completado"
   - **Automáticamente:**
     - Actualiza booking → "confirmed"
     - Incrementa amount_paid
     - Envía email de confirmación

### Caso de Uso Real

**Escenario:** Cliente contacta diciendo "hice transferencia"

```
1. Admin busca reserva → ve pago pendiente
2. Clic en ojo 👁️ en tabla de pagos
3. Cambiar:
   - Método: "Transferencia Bancaria"
   - Estado: "Completado"
   - Nota: "Transferencia recibida el 24/01/2026. Ref: 123456"
4. Guardar
5. Sistema automáticamente:
   ✅ Confirma reserva
   ✅ Envía email al cliente
   ✅ Registra en notas
```

---

## Emails Automatizados

### Configuración
- **Proveedor:** Resend
- **Desde:** `reservas@furgocasa.com`
- **Para:** Cliente + CC a `reservas@furgocasa.com`

### Tipos

#### Primer Pago (50% o 100%)
```
Asunto: ✅ Reserva Confirmada - [Booking Number]

Contenido:
- Confirmación de reserva
- Detalles del vehículo
- Fechas y ubicaciones
- Importe pagado: XXX €
- Pendiente de pagar: XXX € (si aplica)
- Datos de contacto
```

#### Segundo Pago (50% restante)
```
Asunto: ✅ Pago Completo - [Booking Number]

Contenido:
- Confirmación de pago final
- Recordatorio de fechas
- Instrucciones de recogida
- Contacto para dudas
```

### Disparadores

**Automáticos:**
- Payment → "completed" (Redsys/Stripe)
- Payment → "completed" (Manual desde admin)

**Manual:** (futuro)
- Botón "Reenviar email" en detalle de pago

---

## Troubleshooting

### Problema: Pago exitoso pero queda "pending"

**Diagnóstico:**
```bash
# 1. Verificar en Supabase
SELECT * FROM payments WHERE order_number = 'XXX';

# 2. Ver logs en Vercel
Functions → Runtime Logs → Buscar orderNumber

# 3. Revisar frontend
Consola navegador → [PAGO-EXITO]
```

**Solución:**
1. Si notificación no llegó pero pago fue exitoso:
   - Fallback automático debería procesarlo
2. Si fallback falló:
   - Admin → Marcar como completado manualmente

### Problema: Email no llega

**Checklist:**
- [ ] Payment está en "completed"
- [ ] Booking tiene customer_email
- [ ] Logs muestran llamada a `/api/bookings/send-email`
- [ ] Verificar Resend dashboard
- [ ] Revisar spam del cliente

**Solución:**
```bash
# Ver logs de envío
Vercel Logs → Buscar "📧 [6/8] Enviando email"
```

### Problema: Stripe no cobra comisión

**Verificar:**
```typescript
// En las páginas de pago del cliente (ej. src/app/es/reservar/[id]/pago/page.tsx)
const STRIPE_FEE_PERCENT = 0.02; // ¿Está definido?
const amount = paymentMethod === 'stripe' 
  ? baseAmount + (baseAmount * STRIPE_FEE_PERCENT)
  : baseAmount;
```

---

## Tracking GTM ecommerce

Cada paso del flujo de pago dispara un evento GA4 enhanced ecommerce vía GTM (`GTM-5QLGH57`) usando `sendGTMEvent` de `@next/third-parties/google`.

| Paso del flujo | Evento GTM | Notas |
|---|---|---|
| Reserva creada (transferencia bancaria) | `generate_lead` | Solo cuando el cliente elige transferencia |
| Llega a `/reservar/[id]` con pago pendiente | `begin_checkout` | `status="pending"` y `amount_paid=0` |
| Pulsa "Pagar" → redirige al gateway | `add_payment_info` | Incluye `payment_type: redsys|stripe` |
| **Primer pago** completado (50 % o 100 %) | `purchase` con `value = total_price` | LTV completo, dispara conversión Google Ads |
| Segundo pago (50 %) o ajustes posteriores | `additional_payment_received` con `value = payment.amount` | **NO** dispara conversión (evita doble conteo) |

### ⚠️ Regla crítica anti-doble-conteo

El flujo 50 % + 50 % crea **dos transacciones Redsys distintas** (`order_number` distinto). Si `purchase` se disparase en ambas con `value = total_price`, GA4 doblaría ingresos. La detección client-side (`payment.booking.amount_paid - payment.amount <= 0.01`) garantiza que solo el primer pago dispara `purchase`; el resto disparan `additional_payment_received`.

**En el contenedor GTM, la etiqueta de conversión de Google Ads debe enchufarse SOLO al evento `purchase`.**

📖 **Detalle completo (payload, dedup, payload `ecommerce`, configuración GTM):** [`docs/02-desarrollo/analytics/CONFIGURACION-GOOGLE-ANALYTICS.md`](../analytics/CONFIGURACION-GOOGLE-ANALYTICS.md) — sección *Eventos Ecommerce GTM*.

---

## Métricas y Monitoreo

### Panel Admin
`/administrator/pagos`

**Estadísticas:**
- Total cobrado
- Pendiente de cobro
- Completados
- Fallidos

**Filtros:**
- Por estado
- Por método de pago
- Búsqueda por cliente/reserva/referencia

### Logs Importantes

**Initiate:**
```
🔴 [1/5] FRONTEND - INICIANDO PROCESO DE PAGO
📡 [2/5] Llamando a /api/redsys/initiate
✅ [3/5] Respuesta exitosa del backend
```

**Notification:**
```
📨 REDSYS NOTIFICATION - RECIBIENDO NOTIFICACIÓN
[1/7] Parámetros recibidos
[7/7] Email de confirmación enviado
```

**Verify-Payment (Fallback):**
```
🔄 REDSYS VERIFY-PAYMENT - VERIFICACIÓN DE RESPALDO
[1/8] Datos recibidos
[8/8] PROCESO COMPLETADO EXITOSAMENTE
```

---

## Seguridad

### Validación de Firmas (Redsys)
- Firma HMAC-SHA256 con 3DES
- Clave secreta almacenada en variables de entorno
- Validación tanto en initiate como en notification

### RLS (Row Level Security)
- Cliente: Solo ve sus propios pagos
- Admin: Ve todos los pagos (createAdminClient)

### Notas de Auditoría
Todos los cambios manuales se registran:
```
"Actualizado manualmente por administrador (2026-01-24T15:30:00.000Z)"
```

---

## Roadmap

### Completado ✅
- [x] Integración Redsys
- [x] Integración Stripe
- [x] Sistema de fallback
- [x] Gestión manual de pagos
- [x] Emails automatizados
- [x] Panel admin de pagos

### Próximas mejoras 🚀
- [ ] Botón "Reenviar email" manualmente
- [ ] Histórico de cambios en payments
- [ ] Dashboard de conversión
- [ ] Exportar pagos a CSV/Excel
- [ ] Webhooks para integraciones externas
- [ ] Reembolsos automatizados
- [ ] Reportes de conciliación bancaria

---

## Soporte

**Documentación relacionada:**
- `REDSYS-FUNCIONANDO.md` - Estado y configuración Redsys
- `REDSYS-CRYPTO-NO-TOCAR.md` - Firma criptográfica
- `emails/README.md` - Sistema de emails
- `../analytics/CONFIGURACION-GOOGLE-ANALYTICS.md` - Eventos ecommerce GTM (purchase, generate_lead, begin_checkout, add_payment_info)

**Última revisión:** 29/04/2026 (sección *Tracking GTM ecommerce* añadida)  
**Versión:** 2.3
