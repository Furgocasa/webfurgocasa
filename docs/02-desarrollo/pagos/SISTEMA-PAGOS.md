# 💳 Sistema de Pagos Furgocasa

**Versión:** 2.4  
**Última actualización:** 18/05/2026 (*Tracking GTM ecommerce*: solo eventos en página de éxito tras pasarela)

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
- **POST** `/api/stripe/webhook` - Notificación servidor-a-servidor (actualiza pago, reserva y **envía email**)
- **GET** `/api/stripe/session-status` - Verificar estado

#### Admin
- **POST** `/api/payments/update-manual` - Actualizar pago manualmente
- **GET** `/api/payments/by-order` - Buscar por orderNumber

### Sistema de Fallback

**Problema:** La notificación servidor-a-servidor puede fallar o llegar tarde.

**Redsys — fallback en `/pago/exito`:**

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

**Stripe — sin fallback de email en `/pago/exito`:**

El envío del email de confirmación depende del webhook `checkout.session.completed` en `/api/stripe/webhook`. La página `/pago/exito` solo muestra el resumen al cliente; **no** reenvía ni dispara emails. Si el webhook falla, hay que reenviar desde admin (`/administrator/reservas/[id]` → botón de confirmación de pago) o marcar el pago manualmente.

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

**Automáticos (pasarelas):**
- **Redsys:** `/api/redsys/notification` (+ fallback `/api/redsys/verify-payment`)
- **Stripe:** `/api/stripe/webhook` (`checkout.session.completed`, desde 21/05/2026)

**Automáticos (admin):**
- Payment → "completed" (Manual desde admin → `/api/payments/update-manual`)

**Manual (admin):**
- Botones "Confirmación 1º Pago" / "Confirmación 2º Pago" en `/administrator/reservas/[id]` → `/api/bookings/send-email`

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
- [ ] Payment está en "completed" / "authorized" (Stripe)
- [ ] Booking tiene `customer_email`
- [ ] Logs muestran envío de email en el webhook correspondiente
- [ ] Revisar spam del cliente

**Logs esperados (Vercel):**
```bash
# Redsys
📧 [7/7] Enviando email de PRIMER PAGO
📧 [7/7] Enviando email de SEGUNDO PAGO

# Stripe
📧 [Stripe] Enviando email de PRIMER PAGO
📧 [Stripe] Enviando email de SEGUNDO PAGO
```

**Solución:**
- **Redsys:** si el webhook no llegó, el fallback en `/pago/exito` debería procesarlo vía `/api/redsys/verify-payment`
- **Stripe:** si el webhook no llegó, reenviar desde admin (`/administrator/reservas/[id]`) o verificar eventos en Stripe Dashboard → Webhooks
- **Cualquier método:** marcar pago como completado manualmente desde admin (también envía email)

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

Desde mayo de 2026, los únicos `sendGTMEvent` del flujo de reserva están en las **páginas de éxito** tras Redsys/Stripe (`…/{pago,payment,paiement,zahlung}/exito`). **No** se envían eventos al abrir la ficha `/reservar/[id]`, la pantalla de pago ni la confirmación por transferencia; así las métricas de conversión en Ads no se inflan por visitas repetidas o enlaces compartidos.

| Momento | Evento GTM | Notas |
|---|---|---|
| Primer cobro autorizado (50 % o 100 %) | `purchase`, `value = total_price` (LTV) | Conversión principal recomendada en Google Ads |
| Cobros posteriores (segundo 50 %, etc.) | `additional_payment_received`, `value = payment.amount` | No usar como conversión en Ads |

### ⚠️ Regla anti-doble-conteo (50 % + 50 %)

Solo el **primer** cobro dispara `purchase`; los siguientes usan `additional_payment_received`. Detección: `payment.booking.amount_paid - payment.amount <= 0.01`.

**En GTM/Google Ads, la conversión debe ir ligada solo a `purchase`.**

📖 **Detalle:** [`docs/02-desarrollo/analytics/CONFIGURACION-GOOGLE-ANALYTICS.md`](../analytics/CONFIGURACION-GOOGLE-ANALYTICS.md) — sección *Eventos Ecommerce GTM*.

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
- `../analytics/CONFIGURACION-GOOGLE-ANALYTICS.md` - Eventos ecommerce GTM (`purchase`, `additional_payment_received`; mayo 2026)

**Última revisión:** 18/05/2026 (*Tracking GTM*: solo página éxito pasarela)  
**Versión:** 2.4
