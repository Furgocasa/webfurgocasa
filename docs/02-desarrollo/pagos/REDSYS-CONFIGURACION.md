# Configuración de Redsys para Furgocasa

> ⚠️ **NOTA IMPORTANTE**: Furgocasa ahora utiliza un **sistema dual de pagos**:
> - **Redsys** (este documento): Método principal - Comisión 0.3%
> - **Stripe**: Método alternativo - Comisión 1.4% + 0.25€
> 
> El usuario elige su método preferido en la página de pago.
> 
> **Ver también**:
> - **[METODOS-PAGO-RESUMEN.md](./METODOS-PAGO-RESUMEN.md)** - Resumen del sistema dual
> - **[STRIPE-VERCEL-PRODUCCION.md](./STRIPE-VERCEL-PRODUCCION.md)** - Configurar Stripe

---

## 📋 Variables de Entorno Necesarias

Añade estas variables a tu archivo `.env.local`:

```env
# Redsys TPV Virtual
REDSYS_MERCHANT_CODE=XXXXXXXXX        # Número de comercio (FUC) - Proporcionado por tu banco
REDSYS_TERMINAL=001                    # Número de terminal - Normalmente "001"
REDSYS_SECRET_KEY=XXXXXXXXXXXXXXXX     # Clave secreta (Base64) - Proporcionada por tu banco

# URL pública de tu aplicación
NEXT_PUBLIC_URL=https://furgocasa.com  # Sin barra final

# Cifrado de tokens (generar con: openssl rand -hex 32)
ENCRYPTION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🧪 Entorno de Pruebas

Para probar antes de ir a producción, usa las siguientes tarjetas de prueba:

### Tarjeta de Pago Exitoso
- **Número**: 4548812049400004
- **Caducidad**: Cualquier fecha futura (ej: 12/28)
- **CVV**: 123
- **CIP/PIN**: 123456 (si lo pide)

### Tarjeta Denegada (sin fondos)
- **Número**: 4548810000000003
- **Resto igual**

### Tarjeta Caducada
- **Número**: 4548810000000011
- **Resto igual**

## 🔧 URLs de Redsys

El sistema automáticamente usa las URLs correctas según el entorno:

| Entorno | URL de Pago |
|---------|-------------|
| **Pruebas** | https://sis-t.redsys.es:25443/sis/realizarPago |
| **Producción** | https://sis.redsys.es/sis/realizarPago |

## 📁 Archivos del Sistema de Pagos

### Sistema Dual: Redsys + Stripe

```
src/
├── lib/
│   ├── redsys/                   # ← Integración Redsys (0.3%)
│   │   ├── index.ts              # Exportaciones
│   │   ├── crypto.ts             # Cifrado 3DES y firmas HMAC-SHA256
│   │   ├── params.ts             # Construcción de parámetros
│   │   └── types.ts              # Tipos y códigos de respuesta
│   │
│   └── stripe/                   # ← Integración Stripe (1.4% + 0.25€) **NUEVO**
│       └── index.ts              # Cliente Stripe y helpers
│
├── app/api/
│   ├── redsys/
│   │   ├── initiate/route.ts     # POST - Iniciar pago con Redsys
│   │   └── notification/route.ts # POST - Recibir notificación de Redsys
│   │
│   └── stripe/                   # **NUEVO**
│       ├── initiate/route.ts     # POST - Iniciar pago con Stripe
│       └── webhook/route.ts      # POST - Recibir notificación de Stripe
│
└── app/
    ├── reservar/[id]/pago/
    │   └── page.tsx              # ← SELECTOR de método (Redsys/Stripe)
    │
    └── pago/
        ├── exito/page.tsx        # Página de pago exitoso (ambos métodos)
        ├── error/page.tsx        # Página de pago fallido (Redsys)
        └── cancelado/page.tsx    # Página de pago cancelado (Stripe)
```

## 🔄 Flujo de Pago con Selector de Método

```
1. Usuario hace clic en "Pagar"
        ↓
2. Página de pago muestra selector:
   ○ Redsys (Pasarela bancaria española)
   ○ Stripe (Pago internacional seguro)
        ↓
3a. USUARIO SELECCIONA REDSYS:        3b. USUARIO SELECCIONA STRIPE:
    Frontend → POST /api/redsys/initiate   Frontend → POST /api/stripe/initiate
        ↓                                      ↓
    Backend genera parámetros y firma         Backend crea sesión Stripe
    Crea registro en "payments"               Crea registro en "payments"
    (payment_method: 'redsys')                (payment_method: 'stripe')
        ↓                                      ↓
    Redirige a Redsys con formulario          Redirige a Stripe Checkout
        ↓                                      ↓
    Usuario paga en pasarela banco            Usuario paga en Stripe
        ↓                                      ↓
    Redsys → POST /api/redsys/notification    Stripe → POST /api/stripe/webhook
    Se valida firma HMAC-SHA256               Se valida firma webhook
        ↓                                      ↓
    Actualiza "payments" y "bookings"         Actualiza "payments" y "bookings"
        ↓                                      ↓
    Redirige a /pago/exito                    Redirige a /pago/exito
```

## 💳 Política de Pago 50%-50%

El sistema implementa la política de Furgocasa:

1. **Primer pago (50%)**: Al realizar la reserva
2. **Segundo pago (50%)**: Máximo 15 días antes de la recogida

**Excepción en la UI (cliente, abril 2026):** si la recogida es en **menos de 15 días** y el cliente **aún no ha pagado**, las páginas de pago por idioma no ofrecen solo el 50 % inicial: el botón queda deshabilitado y se orienta al **pago del 100 %**. Detalle y rutas de archivo en **[SISTEMA-PAGOS.md](./SISTEMA-PAGOS.md)** (*Política contractual y excepción (menos de 15 días)*).

### Cálculo Automático

```typescript
// Si no se ha pagado nada
firstPayment = Math.ceil(total * 0.5);  // 50% redondeado arriba
secondPayment = total - firstPayment;   // Resto

// Si se modificó la reserva (añadió extras, días)
// El segundo pago es el total pendiente REAL
secondPayment = total - amount_paid;
```

## 🗄️ Tabla de Pagos (Supabase) - Soporta Ambos Métodos

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  order_number VARCHAR(12) UNIQUE NOT NULL,  -- Número único del pago
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',       -- pending, authorized, error, refunded
  payment_type VARCHAR(20),                   -- deposit, full, preauth
  payment_method VARCHAR(20) DEFAULT 'redsys', -- 'redsys' o 'stripe' **NUEVO**
  
  -- Campos específicos de REDSYS:
  response_code VARCHAR(4),                   -- Código respuesta Redsys
  authorization_code VARCHAR(50),
  card_country VARCHAR(3),
  card_type VARCHAR(10),
  transaction_date VARCHAR(10),
  
  -- Campos específicos de STRIPE: **NUEVO**
  stripe_session_id VARCHAR(255),             -- ID de sesión Stripe Checkout
  stripe_payment_intent_id VARCHAR(255),      -- ID del PaymentIntent
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_stripe_session ON payments(stripe_session_id) 
WHERE stripe_session_id IS NOT NULL;
```

**Para actualizar tu base de datos** y añadir soporte para Stripe:
```bash
# Ejecutar en Supabase SQL Editor:
supabase/add-stripe-support.sql
```

## ✅ Checklist de Producción

Antes de ir a producción, verifica:

- [ ] Variables de entorno configuradas con datos REALES del banco
- [ ] `NEXT_PUBLIC_URL` apunta al dominio de producción
- [ ] La URL de notificación es accesible públicamente
- [ ] Has probado pagos en entorno de pruebas
- [ ] Has verificado que las notificaciones llegan correctamente
- [ ] El endpoint de notificación NO tiene autenticación
- [ ] Los emails de confirmación están configurados

## 🔒 Seguridad

### Validación de Firma
Cada notificación de Redsys se valida con HMAC-SHA256:

```typescript
const isValid = validateSignature(
  Ds_MerchantParameters,
  Ds_Signature,
  process.env.REDSYS_SECRET_KEY
);

if (!isValid) {
  // NUNCA procesar pagos con firma inválida
  return { error: "Invalid signature" };
}
```

### Cifrado de Tokens (Pagos Recurrentes)
Si implementas pagos recurrentes, los tokens se cifran con AES-256:

```typescript
// Generar ENCRYPTION_KEY:
// openssl rand -hex 32
```

## 🐛 Troubleshooting

### "Número de pedido repetido" (SIS0051)
- El `orderNumber` ya fue usado
- Se genera automáticamente con timestamp

### "Firma inválida"
- Verificar `REDSYS_SECRET_KEY`
- No debe tener espacios al inicio/final
- Debe estar en Base64

### Notificación no llega
1. Verificar que la URL es accesible desde internet
2. El endpoint debe responder 200 OK siempre
3. No debe tener autenticación
4. Para pruebas locales, usar ngrok:
   ```bash
   ngrok http 3000
   # Configurar URL en .env
   ```

### Pago queda en "pending"
- La notificación no llegó o falló
- Revisar logs del servidor
- Revisar panel de Redsys (backoffice)

---

## 🚨 Historial de Problemas y Soluciones Aplicadas

### Problema 1: Error SIS0042 - "Error en datos enviados"
**Fecha**: Enero 2026  
**Síntoma**: Redsys devuelve página de error técnico con código SIS0042  
**Diagnóstico inicial**: Parecía que `amount` o `terminal` llegaban incorrectos

**Pasos de depuración realizados**:
1. ✅ Agregados logs extensivos en `/api/redsys/initiate/route.ts`:
   - Log de datos recibidos (bookingId, amount, paymentType)
   - Log de configuración Redsys (merchantCode, terminal, URLs)
   - Log de FormData generado
   - Log de parámetros decodificados antes de enviar

2. ✅ Agregados logs en frontend `/reservar/[id]/pago/page.tsx`:
   - Log de respuesta del backend
   - Log de parámetros decodificados en frontend
   - Log de cada campo del formulario antes de enviar
   - Log de URL y método de envío

**Resultado**: Los logs confirmaron que `amount` (9500 para 95€), `terminal` (001), `merchantCode` (347036410) y `order` se generan correctamente.

---

### Problema 2: Duplicate Key Error
**Error**: `duplicate key value violates unique constraint "payments_order_number_key"`  
**Causa**: La función `generateOrderNumber()` generaba números repetidos al no incluir suficiente granularidad temporal.

**Solución aplicada** ✅:
Modificado `src/lib/utils.ts` → `generateOrderNumber()`:
- Añadidos segundos y milisegundos al timestamp
- Añadida parte aleatoria de 4 dígitos
- Formato final: `FC2601181146XXXX` (donde XXXX es aleatorio)

**Estado**: ✅ RESUELTO

---

### Problema 3: Firma HMAC incorrecta
**Causa**: En `src/lib/redsys/crypto.ts`, la función `createSignature()` convertía la clave derivada de base64 a base64 nuevamente, en lugar de usarla como bytes.

**Código incorrecto**:
```typescript
const derivedKey = encrypt3DES(orderNumber, secretKey); // Ya está en base64
const hmac = crypto.createHmac("sha256", derivedKey); // ❌ Usaba string base64
```

**Solución aplicada** ✅:
```typescript
const derivedKeyBase64 = encrypt3DES(orderNumber, secretKey);
const derivedKeyBuffer = Buffer.from(derivedKeyBase64, "base64"); // ✅ Convertir a bytes
const hmac = crypto.createHmac("sha256", derivedKeyBuffer); // ✅ Usar buffer
```

**Estado**: ✅ RESUELTO

---

### Problema 4: Error persistente SIS0042 (ACTUAL)
**Síntoma**: A pesar de todas las correcciones, Redsys sigue rechazando los pagos tanto en:
- Entorno de **producción** (https://sis.redsys.es)
- Entorno de **test** (https://sis-t.redsys.es:25443)

**Errores específicos en navegador**:
```
- Refused to apply style from 'https://sis.redsys.es/sis/estilos/formulario/comercio/-1--ni.css'
- GET https://sis.redsys.es/sis/comercios/img/logotipos/--logo.png 404 (Not Found)
- GET https://sis.redsys.es/sis/javascript/unica/-1-ni.js net::ERR_ABORTED 404
```

**Análisis**:
- Los parámetros enviados desde nuestra aplicación son **CORRECTOS** ✅
- La firma HMAC-SHA256 se calcula **CORRECTAMENTE** ✅
- Los errores 404 sugieren que Redsys no reconoce el `merchantCode` o hay un problema de configuración en su lado
- Las URLs con `-1--ni.css` y `--logo.png` indican que Redsys no encuentra la configuración del comercio

**Posibles causas**:
1. 🔴 El `merchantCode` (347036410) no está dado de alta correctamente en Redsys
2. 🔴 La URL de callback (`https://www.furgocasa.com`) no está autorizada en Redsys
3. 🔴 Falta alguna configuración en el panel de administración de Redsys
4. 🔴 El terminal "001" no está configurado para este comercio
5. 🔴 Las credenciales son de producción pero el comercio no está activado

---

## ⏳ Tareas Pendientes

### 1. Contactar con Soporte Técnico de Redsys 🔴 URGENTE
**Contacto**: soporte.comercios@redsys.es | Tel: 902 33 25 45

**Información a proporcionar**:
- **Merchant Code (FUC)**: 347036410
- **Terminal**: 001
- **Error**: SIS0042 y recursos 404 (CSS, JS, logo)
- **URLs de callback**:
  - Producción: https://www.furgocasa.com
  - Pruebas: https://furgocasa.com (servidor antiguo)
- **Preguntas específicas**:
  1. ¿Está el comercio 347036410 dado de alta correctamente?
  2. ¿Está el terminal 001 activo?
  3. ¿Hay alguna restricción de URLs de callback?
  4. ¿Necesitamos configurar algo más en el panel de administración?
  5. ¿Los recursos 404 indican un problema de configuración del comercio?

### 2. Verificar Panel de Administración de Redsys
- [ ] Acceder al backoffice de Redsys
- [ ] Verificar estado del comercio (activo/inactivo)
- [ ] Revisar URLs autorizadas para callbacks
- [ ] Verificar configuración del terminal
- [ ] Revisar logs de transacciones rechazadas

### 3. Pruebas Alternativas
- [ ] Probar con la herramienta de firma online de Redsys: https://pagosonline.redsys.es/firma-online-redsys.html
  - Comparar nuestra firma con la que genera su herramienta
  - Validar que los parámetros son idénticos

### 4. Considerar Entorno Local con ngrok
Si Redsys requiere autorizar URLs específicas:
```bash
ngrok http 3000
# Obtener URL pública (ej: https://abc123.ngrok.io)
# Actualizar NEXT_PUBLIC_URL en .env.local
# Solicitar a Redsys autorizar esta URL temporalmente
```

---

## 📊 Estado Actual del Código

### ✅ Componentes Funcionando Correctamente
- Generación de parámetros Redsys (amount, order, terminal, merchantCode)
- Cálculo de firma HMAC-SHA256
- Cifrado 3DES para clave derivada
- Endpoint `/api/redsys/initiate` con logs completos
- Frontend con envío correcto de formulario
- Sistema de logging para depuración
- Generación de `orderNumber` único

### 🔴 Bloqueado por Redsys
- Integración completa del flujo de pago
- Testing con tarjetas de prueba
- Recepción de notificaciones
- Actualización de estados de pago

---

## 🔍 Logs de Depuración Disponibles

Para activar logs detallados, revisar la consola del navegador y los logs de Vercel:

**Frontend (Consola del navegador)**:
```
📥 Respuesta del backend
🔍 Parámetros en frontend (amount, order, terminal, merchantCode)
📝 Campo añadido: Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature
📤 Enviando formulario a: [URL de Redsys]
```

**Backend (Vercel Function Logs)**:
```
📥 Redsys Initiate - Datos recibidos
⚙️ Redsys Config
📤 FormData generado
🔍 Parámetros decodificados
```

**Acceder a logs de Vercel**:
```bash
# Desde terminal
vercel logs [deployment-url]

# O desde el dashboard: vercel.com → Proyecto → Functions → Logs
```

## 📚 Recursos y Documentación Relacionada

### Redsys
- [Documentación oficial Redsys](https://pagosonline.redsys.es/desarrolladores.html)
- [Códigos de respuesta](https://pagosonline.redsys.es/rm-codigos-de-respuesta.html)
- [Generador de firma online (testing)](https://pagosonline.redsys.es/firma-online-redsys.html)

### Sistema Dual de Pagos

**Documentación del sistema completo:**
- **[METODOS-PAGO-RESUMEN.md](./METODOS-PAGO-RESUMEN.md)** ← Resumen ejecutivo
- **[STRIPE-VERCEL-PRODUCCION.md](./STRIPE-VERCEL-PRODUCCION.md)** ← Configurar Stripe en Vercel
- **[STRIPE-CONFIGURACION.md](./STRIPE-CONFIGURACION.md)** ← Documentación completa de Stripe
- **[IMPLEMENTACION-STRIPE-COMPLETA.md](./IMPLEMENTACION-STRIPE-COMPLETA.md)** ← Resumen de implementación

### Comparativa de Costos

| Método | Comisión | Ejemplo 1,000€ | Ventajas |
|--------|----------|----------------|----------|
| **Redsys** | 0.3% | 3€ | Económico, banco español |
| **Stripe** | 1.4% + 0.25€ | 14.25€ | Fácil setup, testing inmediato |

**Recomendación**: Usar Redsys como principal (menor comisión), mantener Stripe como alternativa.

## 📞 Soporte Redsys

- **Email**: soporte.comercios@redsys.es
- **Teléfono**: 902 33 25 45

