# 💳 Sistema de Pagos Furgocasa

**Versión:** 2.0  
**Última actualización:** 24/01/2026

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Métodos de Pago](#métodos-de-pago)
3. [Arquitectura Técnica](#arquitectura-técnica)
4. [Gestión Manual](#gestión-manual)
5. [Emails Automatizados](#emails-automatizados)
6. [Troubleshooting](#troubleshooting)

---

## Visión General

El sistema de pagos de Furgocasa soporta múltiples métodos de pago con procesamiento automático y gestión manual:

- ✅ **Redsys** - Pasarela bancaria española (recomendado, sin comisión)
- ✅ **Stripe** - Pagos internacionales (+2% comisión)
- ✅ **Transferencia** - Gestión manual
- ✅ **Efectivo** - Gestión manual
- ✅ **Bizum** - Gestión manual

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
  amount: number;
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
// En src/app/reservar/[id]/pago/page.tsx
const STRIPE_FEE_PERCENT = 0.02; // ¿Está definido?
const amount = paymentMethod === 'stripe' 
  ? baseAmount + (baseAmount * STRIPE_FEE_PERCENT)
  : baseAmount;
```

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

**Última revisión:** 24/01/2026  
**Versión:** 2.0
