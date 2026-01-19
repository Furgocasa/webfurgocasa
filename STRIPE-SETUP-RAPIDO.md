# 🚀 Guía Rápida: Configurar Stripe para Pruebas

Esta guía te llevará paso a paso para tener Stripe funcionando en tu aplicación.

## 📦 Paso 1: Dependencias (✅ YA INSTALADAS)

Las dependencias ya están instaladas:
```bash
npm install stripe @stripe/stripe-js
```

## 🔑 Paso 2: Obtener Claves de Stripe

### 2.1 Crear cuenta en Stripe

1. Ve a: https://dashboard.stripe.com/register
2. Regístrate con tu email
3. **Activa el modo de pruebas** (toggle arriba a la izquierda dice "Test mode")

### 2.2 Obtener las claves

1. En el dashboard, ve a: **Developers** → **API keys**
2. Verás dos claves:
   - **Publishable key** (comienza con `pk_test_...`) 
   - **Secret key** (haz clic en "Reveal test key", comienza con `sk_test_...`)

## 🔧 Paso 3: Configurar Variables de Entorno

Añade estas variables a tu archivo `.env.local`:

```env
# Stripe - Claves de PRUEBA
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_COPIA_AQUI_TU_CLAVE_PUBLICA
STRIPE_SECRET_KEY=sk_test_COPIA_AQUI_TU_CLAVE_SECRETA
STRIPE_WEBHOOK_SECRET=whsec_ESTO_LO_OBTENDREMOS_EN_EL_PASO_4

# URL de tu aplicación (debe estar configurada)
NEXT_PUBLIC_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:** 
- Las claves deben empezar con `pk_test_` y `sk_test_` (son las de prueba)
- NO uses las claves de producción (`pk_live_` / `sk_live_`) hasta que estés listo
- NO comitees estas claves a Git

## 🗄️ Paso 4: Actualizar Base de Datos (Supabase)

### 4.1 Conectar a Supabase

Ve a tu proyecto en Supabase: https://app.supabase.com

### 4.2 Ejecutar Script SQL

1. En el panel izquierdo, haz clic en **SQL Editor**
2. Haz clic en **New query**
3. Copia y pega el contenido del archivo `supabase/add-stripe-support.sql`
4. Haz clic en **Run** (o presiona Ctrl+Enter)

Esto añadirá las columnas necesarias para soportar Stripe en la tabla `payments`.

## 🪝 Paso 5: Configurar Webhook Local (Stripe CLI)

Para que Stripe pueda notificar a tu aplicación cuando se completa un pago en **localhost**, necesitas Stripe CLI.

### 5.1 Instalar Stripe CLI

**Windows (con Scoop):**
```bash
scoop install stripe
```

**macOS (con Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
Descarga desde: https://github.com/stripe/stripe-cli/releases

### 5.2 Login en Stripe

```bash
stripe login
```

Esto abrirá tu navegador para autorizar la CLI.

### 5.3 Forward Webhooks a Localhost

En una terminal **SEPARADA** (déjala corriendo), ejecuta:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Verás algo como:

```
> Ready! Your webhook signing secret is whsec_abc123xyz456... (^C to quit)
```

**✅ Copia ese `whsec_...`** y añádelo a tu `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz456...
```

### 5.4 Reiniciar el Servidor de Next.js

Si ya tenías el servidor corriendo, reinícialo para que tome las nuevas variables de entorno:

```bash
# Ctrl+C para detener
npm run dev
```

## 🧪 Paso 6: Probar el Flujo de Pago

### 6.1 Crear una Reserva

1. Ve a tu aplicación: http://localhost:3000
2. Crea una reserva de prueba
3. Serás redirigido a la página de pago

### 6.2 Seleccionar Stripe

1. En la página de pago, verás dos opciones: **Redsys** y **Stripe**
2. Selecciona **Stripe**
3. Haz clic en "Pagar 50% ahora" (o "Pagar total ahora")

### 6.3 Completar el Pago en Stripe Checkout

Serás redirigido a la página de Stripe. Usa esta tarjeta de prueba:

- **Número**: `4242 4242 4242 4242`
- **Fecha**: Cualquier fecha futura (ej: `12/28`)
- **CVV**: Cualquier 3 dígitos (ej: `123`)
- **Código Postal**: Cualquiera (ej: `12345`)
- **Email**: Tu email

Haz clic en **Pay**.

### 6.4 Verificar en la Terminal de Stripe CLI

En la terminal donde ejecutaste `stripe listen`, verás:

```
2026-01-19 10:30:15  --> checkout.session.completed [evt_abc123...]
2026-01-19 10:30:15  <-- [200] POST http://localhost:3000/api/stripe/webhook
```

Esto confirma que el webhook llegó correctamente.

### 6.5 Verificar en Supabase

1. Ve a Supabase → **Table Editor** → **payments**
2. Deberías ver un registro con:
   - `status`: `"authorized"`
   - `payment_method`: `"stripe"`
   - `stripe_session_id`: `"cs_test_..."`
   - `amount`: El monto que pagaste

## ✅ Paso 7: Verificar Toda la Integración

### Checklist de Verificación

- [ ] Claves de Stripe configuradas en `.env.local`
- [ ] Tabla `payments` actualizada con columnas de Stripe
- [ ] Stripe CLI corriendo con `stripe listen`
- [ ] Servidor Next.js corriendo con `npm run dev`
- [ ] Puedes crear una reserva
- [ ] Aparece el selector de método de pago (Redsys / Stripe)
- [ ] Al seleccionar Stripe, te redirige a Stripe Checkout
- [ ] Puedes pagar con tarjeta de prueba `4242 4242 4242 4242`
- [ ] Después del pago, vuelves a `/pago/exito`
- [ ] El pago aparece en Supabase con `status: "authorized"`
- [ ] La reserva se actualiza con `payment_status: "partial"` o `"paid"`

## 🎉 ¡Listo para Probar!

Ahora tienes **dos métodos de pago**:

1. **Redsys** - Tu pasarela principal (0.3% comisión)
2. **Stripe** - Para pruebas y como alternativa

## 🐛 Solución de Problemas

### Error: "STRIPE_SECRET_KEY no está configurado"

**Solución**: Asegúrate de que `.env.local` tiene la variable y reinicia el servidor.

### Error: "Webhook signature verification failed"

**Solución**: 
1. Verifica que `STRIPE_WEBHOOK_SECRET` en `.env.local` coincide con el que te dio `stripe listen`
2. Reinicia el servidor Next.js

### El webhook no llega (pago queda en "pending")

**Solución**:
1. Verifica que `stripe listen` esté corriendo
2. Verifica la URL en el comando: `localhost:3000/api/stripe/webhook`
3. Revisa la consola de `stripe listen` para ver errores

### Página de pago no muestra selector de Stripe

**Solución**: 
1. Limpia cache del navegador (Ctrl+Shift+R)
2. Verifica que el archivo `/reservar/[id]/pago/page.tsx` se actualizó correctamente

## 📞 Necesitas Ayuda?

Si algo no funciona, revisa:

1. **Logs de Next.js** (terminal donde corre `npm run dev`)
2. **Logs de Stripe CLI** (terminal donde corre `stripe listen`)
3. **Supabase Logs** (panel de Supabase → Logs)
4. **Documentación de Stripe**: https://stripe.com/docs/testing

---

## 🚀 Próximo Paso: Producción

Cuando estés listo para ir a producción:

1. Obtén claves de **producción** (`pk_live_` y `sk_live_`)
2. Configura webhook en Stripe Dashboard (no CLI)
3. Actualiza variables de entorno en Vercel
4. Prueba con un pago real de bajo monto

**Documentación**: Ver `STRIPE-CONFIGURACION.md` para más detalles.
