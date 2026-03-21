# Configuración de Stripe para Furgocasa

## 📋 Variables de Entorno Necesarias

Añade estas variables a tu archivo `.env.local`:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXX  # Clave pública (empieza con pk_test_ o pk_live_)
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXX                    # Clave secreta (empieza con sk_test_ o sk_live_)
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXX                  # Secret del webhook (empieza con whsec_)

# URL pública de tu aplicación
NEXT_PUBLIC_URL=https://furgocasa.com  # Sin barra final
```

## 🧪 Entorno de Pruebas

Stripe proporciona claves de prueba que puedes usar sin costo:

### Tarjetas de Prueba

#### Pago Exitoso
- **Número**: 4242 4242 4242 4242
- **Caducidad**: Cualquier fecha futura (ej: 12/28)
- **CVV**: Cualquier 3 dígitos (ej: 123)
- **Código Postal**: Cualquiera (ej: 12345)

#### Requiere Autenticación 3D Secure
- **Número**: 4000 0025 0000 3155
- **Resto igual**

#### Pago Denegado (Fondos Insuficientes)
- **Número**: 4000 0000 0000 9995
- **Resto igual**

#### Tarjeta Declinada (Genérico)
- **Número**: 4000 0000 0000 0002
- **Resto igual**

[Más tarjetas de prueba aquí](https://stripe.com/docs/testing#cards)

## 🔧 Obtener las Claves de Stripe

1. **Crear cuenta**: https://dashboard.stripe.com/register
2. **Activar modo de pruebas** (toggle en la esquina superior izquierda)
3. **Obtener claves**:
   - Ve a **Developers** → **API keys**
   - Copia la **Publishable key** (comienza con `pk_test_`)
   - Copia la **Secret key** (comienza con `sk_test_`)

## 🪝 Configurar Webhook

El webhook permite que Stripe notifique a tu aplicación cuando cambia el estado de un pago.

### Desarrollo Local (con Stripe CLI)

1. **Instalar Stripe CLI**: https://stripe.com/docs/stripe-cli#install

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
# Descargar desde https://github.com/stripe/stripe-cli/releases
```

2. **Login en Stripe**:
```bash
stripe login
```

3. **Forward webhooks a localhost**:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copia el **webhook signing secret** que aparece (comienza con `whsec_`) y añádelo a `.env.local`

### Producción (Vercel/Deploy)

1. Ve a **Developers** → **Webhooks** en el dashboard de Stripe
2. Haz clic en **Add endpoint**
3. **URL del endpoint**: `https://tusitioweb.com/api/stripe/webhook`
4. **Eventos a escuchar**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copia el **Signing secret** y añádelo a las variables de entorno de producción

## 📁 Archivos del Sistema de Pagos con Stripe

```
src/
├── lib/stripe/
│   └── index.ts          # Cliente de Stripe y funciones helper
│
├── app/api/stripe/
│   ├── initiate/route.ts     # POST - Iniciar sesión de Checkout
│   └── webhook/route.ts      # POST - Recibir notificaciones de Stripe
│
└── app/pago/
    ├── exito/page.tsx        # Página de pago exitoso
    ├── error/page.tsx        # Página de pago fallido
    └── cancelado/page.tsx    # Página de pago cancelado
```

## 🔄 Flujo de Pago con Stripe

```
1. Usuario hace clic en "Pagar con Stripe"
        ↓
2. Frontend → POST /api/stripe/initiate
        ↓
3. Backend crea Checkout Session en Stripe
   - Se crea registro en tabla "payments" (status: pending)
        ↓
4. Frontend redirige a Stripe Checkout (URL externa)
        ↓
5. Usuario paga en la pasarela de Stripe (hosted)
        ↓
6. Stripe → POST /api/stripe/webhook (CRÍTICO)
   - Evento: checkout.session.completed
   - Se valida firma del webhook
   - Se actualiza "payments" (status: authorized/error)
   - Se actualiza "bookings" (payment_status, status)
        ↓
7. Usuario es redirigido a /pago/exito o /pago/cancelado
```

## 💳 Diferencias vs Redsys

| Característica | Redsys | Stripe |
|---------------|--------|--------|
| **Comisión** | 0.3% 🎯 | ~1.5% + 0.25€ |
| **Formulario** | En tu sitio (iframe/redirect) | Hosted por Stripe |
| **Implementación** | Más compleja (firmas, 3DES) | Más simple (SDK) |
| **Testing** | Necesitas credenciales de banco | Inmediato con claves de test |
| **Soporte** | Español | Inglés (buena docs) |
| **Webhooks** | Notificación URL | Webhook firmado |

## 🗄️ Tabla de Pagos (Supabase)

Para soportar ambos métodos de pago, la tabla `payments` necesita:

```sql
-- Añadir columnas para Stripe
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'redsys',  -- 'redsys' o 'stripe'
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255),                -- ID de sesión de Stripe
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);         -- ID del PaymentIntent

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session 
ON payments(stripe_session_id) 
WHERE stripe_session_id IS NOT NULL;
```

## 🧾 PVP y columnas de comisión Stripe (marzo 2026)

La comisión de la pasarela que **se repercute al cliente** debe figurar en el precio total de la reserva (PVP / facturación). El código actual:

- En **`/api/stripe/initiate`**: el registro en `payments` guarda en **`amount`** el importe total cobrado al cliente (base de alquiler de ese cobro + comisión) y en **`stripe_fee`** solo la parte de comisión de ese cobro.
- En **`/api/stripe/webhook`** (pago completado): se suma **`payment.amount`** a **`bookings.amount_paid`**, y **`payment.stripe_fee`** a **`bookings.total_price`** y a **`bookings.stripe_fee_total`** (acumulado de comisiones Stripe de esa reserva).

**Migración SQL en Supabase** (ejecutar una vez si la base aún no las tiene):

```sql
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_fee_total numeric DEFAULT 0 NOT NULL;

COMMENT ON COLUMN public.bookings.stripe_fee_total IS
  'Total acumulado de comisiones Stripe cobradas al cliente. Se suma a total_price en cada pago con Stripe.';

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS stripe_fee numeric DEFAULT 0 NOT NULL;

COMMENT ON COLUMN public.payments.stripe_fee IS
  'Parte de comisión Stripe incluida en amount de este pago. 0 para Redsys/transferencia/efectivo.';
```

**Resumen contable:** `total_price` de la reserva = precio del servicio (base + extras + traslado, etc.) **más** comisiones Stripe ya integradas; `stripe_fee_total` permite desglosarlas en admin y en la ficha de reserva del cliente.

## ✅ Checklist de Implementación

### Desarrollo Local

- [x] Instalar dependencias: `npm install stripe @stripe/stripe-js`
- [ ] Obtener claves de prueba de Stripe Dashboard
- [ ] Configurar variables de entorno en `.env.local`
- [ ] Instalar Stripe CLI
- [ ] Configurar webhook local con `stripe listen`
- [ ] Probar flujo completo con tarjeta de prueba
- [ ] Verificar que webhooks llegan correctamente
- [ ] Verificar actualización de base de datos

### Producción

- [ ] Obtener claves de **producción** de Stripe (activar cuenta)
- [ ] Configurar variables de entorno en Vercel/hosting
- [ ] Crear endpoint de webhook en Stripe Dashboard
- [ ] Probar con tarjeta real (pequeño monto)
- [ ] Verificar emails de confirmación
- [ ] Configurar límites y reglas de fraude en Stripe
- [ ] Activar 3D Secure / SCA

## 🔒 Seguridad

### Validación de Webhook

Cada notificación de Stripe se valida con su firma:

```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);

// Si la firma es inválida, lanza excepción
// NUNCA procesar pagos sin validar firma
```

### Claves Secretas

- ❌ NUNCA expongas `STRIPE_SECRET_KEY` en el frontend
- ❌ NUNCA comitees las claves en Git
- ✅ Usa variables de entorno
- ✅ La clave secreta solo debe usarse en el servidor

## 🐛 Troubleshooting

### "Webhook signature verification failed"
- Verificar `STRIPE_WEBHOOK_SECRET`
- En local: debe ser el que te da `stripe listen`
- En producción: debe ser el del Dashboard

### Pago queda en "pending"
- El webhook no llegó o falló
- Revisar logs de Stripe Dashboard: **Developers** → **Webhooks** → Ver eventos
- Verificar que la URL del webhook es accesible públicamente

### "No such customer"
- No es necesario crear clientes en Stripe
- Stripe Checkout maneja esto automáticamente

### Testing local sin ngrok
- Usa Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Los eventos llegarán en tiempo real

## 🔄 Migración Gradual (Redsys → Stripe)

### Estrategia Recomendada

1. **Fase 1: Testing** (Actual)
   - Mantener Redsys como método principal
   - Stripe disponible para pruebas internas
   - Monitorear comisiones reales

2. **Fase 2: A/B Testing**
   - Ofrecer ambos métodos al usuario
   - Recopilar datos de conversión
   - Comparar costos reales (0.3% vs 1.5%)

3. **Fase 3: Decisión Final**
   - Basándose en datos de conversión y costos
   - Considerar: comisiones, facilidad de uso, tasa de éxito
   - Mantener el método con mejor ROI

## 📊 Selector de Método de Pago

Implementar en la página de pago:

```typescript
// Estado para método seleccionado
const [paymentMethod, setPaymentMethod] = useState<'redsys' | 'stripe'>('redsys');

// Al hacer clic en "Pagar"
if (paymentMethod === 'stripe') {
  // Llamar a /api/stripe/initiate
} else {
  // Llamar a /api/redsys/initiate
}
```

## 📞 Soporte

### Stripe
- **Dashboard**: https://dashboard.stripe.com
- **Docs**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Discord**: https://stripe.com/discord

### Contacto Técnico
- Support desde el Dashboard
- Twitter: @StripeDev
- Email: support@stripe.com (si tienes cuenta activa)

## 📚 Recursos Útiles

- [Stripe Checkout Quick Start](https://stripe.com/docs/checkout/quickstart)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)
- [Security Best Practices](https://stripe.com/docs/security)

---

## 🎯 Comparativa de Costos Real

### Ejemplo: Reserva de 1,000€

| Método | Comisión | Costo | Neto |
|--------|----------|-------|------|
| **Redsys** | 0.3% | 3€ | 997€ |
| **Stripe** | 1.4% + 0.25€ | 14.25€ | 985.75€ |
| **Diferencia** | | **+11.25€** | |

### Punto de Equilibrio

Para una reserva de 1,000€:
- **Coste extra con Stripe**: ~11€ por transacción
- Si la tasa de conversión con Stripe es >1.1% mejor, compensa
- Stripe tiene mejor UX → Potencialmente mayor conversión

### Recomendación

1. **Mantener Redsys** si funciona (comisión 0.3%)
2. **Usar Stripe** como alternativa:
   - Clientes internacionales
   - Si Redsys falla
   - Para probar A/B testing
3. **Analizar datos** después de 1-2 meses:
   - ¿Qué método tiene mayor tasa de éxito?
   - ¿El extra 1% en Stripe se compensa con menos abandonos?

---

**Última actualización:** marzo 2026 (PVP + columnas `stripe_fee` / `stripe_fee_total`)  
**Versión de Stripe API:** 2024-12-18.acacia
