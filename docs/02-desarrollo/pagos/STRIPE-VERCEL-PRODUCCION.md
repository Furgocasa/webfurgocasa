# 🚀 Configurar Stripe en PRODUCCIÓN (Vercel)

**Tu app está en**: https://www.furgocasa.com  
**Estado**: Desplegada y funcionando  
**Objetivo**: Añadir Stripe como método de pago en producción

**Marzo 2026:** Tras actualizar la app, aplica en Supabase el SQL de columnas `stripe_fee` / `stripe_fee_total` descrito en **[STRIPE-CONFIGURACION.md](./STRIPE-CONFIGURACION.md)** (*PVP y columnas de comisión Stripe*), para que el total de reserva y los pagos cuadren con facturación.

---

## ⚡ Configuración Rápida (15 minutos)

### Paso 1: Crear Cuenta de Stripe (5 min)

1. Ve a: **https://dashboard.stripe.com/register**
2. Regístrate con tu email
3. **Activa modo de pruebas** (toggle arriba a la izquierda dice "Test mode")

> 💡 Empezaremos con claves de **test** para probar sin riesgo. Luego migraremos a producción.

---

### Paso 2: Obtener Claves de Stripe (2 min)

1. En Stripe Dashboard, ve a: **Developers** → **API keys**
2. Verás dos claves en modo test:
   - **Publishable key**: `pk_test_...` (visible)
   - **Secret key**: Haz clic en "Reveal test key" → `sk_test_...`

✅ Copia ambas claves, las necesitarás en el siguiente paso.

---

### Paso 3: Configurar Variables de Entorno en Vercel (3 min)

1. Ve a tu proyecto en Vercel: **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **furgocasa-app**
3. Ve a **Settings** → **Environment Variables**
4. Añade estas **3 nuevas variables**:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_XXXXX
STRIPE_SECRET_KEY = sk_test_XXXXX
STRIPE_WEBHOOK_SECRET = (dejar vacío por ahora)
```

> ⚠️ Importante: 
> - Aplícalas a **Production** (y también Preview si quieres)
> - NO comitees estas claves a Git

5. **Guarda** las variables

---

### Paso 4: Redesplegar la Aplicación (1 min)

Para que Vercel tome las nuevas variables de entorno:

1. Ve a **Deployments** en Vercel
2. En el último deployment exitoso, haz clic en los **3 puntos** (⋯)
3. Selecciona **Redeploy**
4. Espera 1-2 minutos a que complete

✅ Ahora tu app tiene las claves de Stripe cargadas.

---

### Paso 5: Configurar Webhook en Stripe (5 min)

El webhook permite que Stripe notifique a tu app cuando se completa un pago.

1. En Stripe Dashboard, ve a: **Developers** → **Webhooks**
2. Haz clic en **Add endpoint**
3. Configura así:

**Endpoint URL**:
```
https://www.furgocasa.com/api/stripe/webhook
```

**Events to send** (selecciona estos 4):
- ✅ `checkout.session.completed`
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `charge.refunded`

4. Haz clic en **Add endpoint**

5. Una vez creado, verás el **Signing secret**: `whsec_...`
   - Haz clic en **Reveal** para verlo
   - ✅ Cópialo

---

### Paso 6: Añadir Webhook Secret a Vercel (2 min)

1. Vuelve a Vercel → **Settings** → **Environment Variables**
2. **Edita** la variable `STRIPE_WEBHOOK_SECRET` que dejamos vacía
3. Pega el `whsec_...` que acabas de copiar
4. **Guarda**

5. **Redesplegar** de nuevo (como en Paso 4)

---

### Paso 7: Actualizar Base de Datos en Supabase (2 min)

1. Ve a tu proyecto en **Supabase**: https://app.supabase.com
2. Selecciona tu proyecto de Furgocasa
3. Ve a **SQL Editor** (panel izquierdo)
4. Haz clic en **New query**
5. Copia y pega el contenido de: `supabase/add-stripe-support.sql`
6. Haz clic en **Run** (o Ctrl+Enter)

✅ Verás mensaje de éxito. Esto añade las columnas necesarias para Stripe.

---

## 🧪 Probar en Producción

Ahora puedes probar el flujo completo:

### 1. Crear una Reserva de Prueba

1. Ve a: **https://www.furgocasa.com**
2. Crea una reserva (cualquier vehículo, fechas futuras)
3. Completa el formulario de cliente
4. Llegarás a la página de pago

### 2. Seleccionar Stripe

En la página de pago verás:

```
○ Redsys
  Pasarela bancaria española

○ Stripe  ← SELECCIONA ESTE
  Pago internacional seguro
```

Selecciona **Stripe**

### 3. Hacer el Pago de Prueba

1. Haz clic en **"Pagar 50% ahora"**
2. Serás redirigido a Stripe Checkout
3. Usa esta **tarjeta de prueba**:

```
Número: 4242 4242 4242 4242
Fecha: 12/28 (cualquier fecha futura)
CVV: 123
Código postal: 12345
Email: tu email
```

4. Haz clic en **Pay**

### 4. Verificar que Funcionó

✅ **Deberías**:
- Ser redirigido a `/pago/exito`
- Ver confirmación de pago

✅ **En Supabase** (tabla `payments`):
- Debe haber un registro con `status: "authorized"`
- `payment_method: "stripe"`
- `stripe_session_id: "cs_test_..."`

✅ **En Stripe Dashboard** → **Payments**:
- Verás el pago de prueba
- Estado: Succeeded

---

## 🎉 ¡Listo!

Ahora tienes **Stripe funcionando en producción** con claves de test.

### ¿Qué puedes hacer ahora?

1. ✅ **Recibir reservas reales** (con pagos de prueba)
2. ✅ **Probar el flujo completo** sin riesgo
3. ✅ **Trabajar en resolver Redsys** sin prisa

---

## 🔄 Migrar a Claves de Producción (Cuando estés listo)

Cuando quieras empezar a cobrar pagos reales:

### 1. Activar tu cuenta de Stripe

1. En Stripe Dashboard, verás un banner para "Activate your account"
2. Completa la información:
   - Datos de tu negocio (Furgocasa)
   - CIF/NIF
   - Cuenta bancaria donde recibirás los pagos
   - Información legal

### 2. Obtener Claves de Producción

1. **Desactiva** el modo de pruebas (toggle arriba a la izquierda)
2. Ve a **Developers** → **API keys**
3. Copia las claves de **producción**:
   - `pk_live_...` (publishable key)
   - `sk_live_...` (secret key)

### 3. Actualizar Variables en Vercel

Actualiza las 3 variables con las claves de producción:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_XXXXX
STRIPE_SECRET_KEY = sk_live_XXXXX
STRIPE_WEBHOOK_SECRET = whsec_XXXXX (crear nuevo webhook)
```

### 4. Crear Nuevo Webhook de Producción

1. En Stripe (modo producción), crea un nuevo webhook
2. Misma URL: `https://www.furgocasa.com/api/stripe/webhook`
3. Mismos eventos
4. Copia el nuevo `whsec_...` de producción

### 5. Redesplegar

Redesplegar en Vercel para que tome las nuevas claves.

### 6. Probar con Pago Real

Haz una reserva de prueba con tarjeta real (bajo monto, ej: 10€) para verificar.

---

## 🔍 Verificar Estado del Sistema

### Logs de Webhook en Stripe

Si algo no funciona, revisa los logs:

1. Stripe Dashboard → **Developers** → **Webhooks**
2. Haz clic en tu webhook
3. Ve a **Events** → Verás todos los eventos enviados
4. Si alguno falló, verás el error

### Logs en Vercel

Para ver si el webhook llegó a tu API:

1. Vercel Dashboard → Tu proyecto
2. **Functions** (o **Runtime Logs**)
3. Busca logs de `/api/stripe/webhook`

---

## 💰 Costos en Producción

### Con Claves de Test (Ahora)
- ✅ **Gratis** - Puedes hacer infinitas pruebas
- ✅ No se cobra nada
- ✅ No necesitas activar cuenta

### Con Claves de Producción (Cuando migres)
- 💳 **1.4% + 0.25€** por transacción europea
- 💳 **2.9% + 0.25€** por transacción internacional
- 📊 Sin cuota mensual, solo pagas por transacción

---

## 🆘 Troubleshooting

### "Error: STRIPE_SECRET_KEY no está configurado"

**Solución**: 
1. Verifica que la variable existe en Vercel
2. Redesplegar la aplicación

### El webhook no llega (pago queda en "pending")

**Solución**:
1. Ve a Stripe → Webhooks → Tu webhook
2. Verifica que la URL es: `https://www.furgocasa.com/api/stripe/webhook` (sin espacios)
3. Verifica que el signing secret está en Vercel
4. Revisa los logs de eventos en Stripe para ver el error

### "Webhook signature verification failed"

**Solución**:
1. Verifica que `STRIPE_WEBHOOK_SECRET` en Vercel coincide con el de Stripe
2. Cuidado con copiar espacios extra
3. Redesplegar

---

## 📞 Soporte

- **Documentación de Stripe**: https://stripe.com/docs
- **Dashboard de Stripe**: https://dashboard.stripe.com
- **Support de Stripe**: Desde el dashboard (chat)

---

## ✅ Checklist Final

### Configuración Completada
- [ ] Cuenta de Stripe creada
- [ ] Claves de test obtenidas
- [ ] Variables de entorno en Vercel configuradas
- [ ] Aplicación redesplegada
- [ ] Webhook configurado en Stripe
- [ ] Webhook secret añadido a Vercel
- [ ] Aplicación redesplegada de nuevo
- [ ] Script SQL ejecutado en Supabase

### Prueba Realizada
- [ ] Reserva de prueba creada
- [ ] Stripe seleccionado como método de pago
- [ ] Pago completado con tarjeta 4242...
- [ ] Redirección a /pago/exito exitosa
- [ ] Pago visible en Supabase
- [ ] Pago visible en Stripe Dashboard

### Listo para Producción (Opcional - cuando quieras)
- [ ] Cuenta de Stripe activada
- [ ] Claves de producción obtenidas
- [ ] Variables actualizadas en Vercel
- [ ] Webhook de producción creado
- [ ] Prueba con pago real realizada

---

**¿Listo para empezar?** Sigue los pasos desde el principio. En 15 minutos tendrás Stripe funcionando en producción. 🚀
