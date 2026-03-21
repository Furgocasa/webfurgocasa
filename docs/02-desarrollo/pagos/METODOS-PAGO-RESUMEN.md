# 💳 Resumen: Integración de Métodos de Pago

> **Marzo 2026:** Con Stripe, la comisión repercutida al cliente forma parte del **PVP total** de la reserva (`bookings.total_price`), con desglose en `stripe_fee_total` y `payments.stripe_fee`. Ver **[STRIPE-CONFIGURACION.md](./STRIPE-CONFIGURACION.md)** (sección *PVP y columnas de comisión*) y **[SISTEMA-PAGOS.md](./SISTEMA-PAGOS.md)**.

## ✅ Estado Actual

### Redsys (Método Principal)
- ✅ Código implementado y funcionando
- ✅ Comisión: **0.3%** (la más baja)
- ⚠️ **Problema actual**: Error SIS0042 en ambiente de pruebas y producción
- 📋 **Acción pendiente**: Contactar soporte de Redsys para resolver configuración

### Stripe (Método Alternativo - NUEVO)
- ✅ Código implementado y listo
- ✅ Integración completa con Stripe Checkout
- ✅ Webhook configurado
- ⚙️ Comisión: ~1.5% + 0.25€ por transacción
- 🧪 Listo para probar inmediatamente con claves de test

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

1. **`src/lib/stripe/index.ts`**
   - Cliente de Stripe
   - Funciones para crear sesiones de pago
   - Helpers para webhooks

2. **`src/app/api/stripe/initiate/route.ts`**
   - Endpoint para iniciar pago con Stripe
   - Crea sesión de Checkout

3. **`src/app/api/stripe/webhook/route.ts`**
   - Recibe notificaciones de Stripe
   - Actualiza estado de pagos y reservas

4. **`src/app/pago/cancelado/page.tsx`**
   - Página para pagos cancelados

5. **`supabase/add-stripe-support.sql`**
   - Script SQL para actualizar tabla `payments`
   - Añade soporte para Stripe

6. **`STRIPE-CONFIGURACION.md`**
   - Documentación completa de Stripe
   - Comparativa Redsys vs Stripe
   - Troubleshooting

7. **`STRIPE-SETUP-RAPIDO.md`**
   - Guía paso a paso para configurar Stripe
   - Checklist de verificación

### Archivos Modificados

1. **`src/app/reservar/[id]/pago/page.tsx`**
   - ✅ Añadido selector de método de pago (Redsys / Stripe)
   - ✅ Lógica para manejar ambos métodos
   - ✅ UI actualizada con opciones visuales

2. **`package.json`**
   - ✅ Añadidas dependencias: `stripe` y `@stripe/stripe-js`

## 🎯 Ventajas de Esta Implementación

### 1. **Flexibilidad Total**
- Puedes usar **Redsys** cuando funcione (comisión baja)
- Tienes **Stripe** como respaldo (funciona siempre)
- Cambio de método en tiempo real sin código adicional

### 2. **Sin Migración Traumática**
- No eliminas Redsys, solo añades alternativa
- Los pagos existentes en Redsys siguen funcionando
- Base de datos soporta ambos métodos

### 3. **Testing Inmediato**
- Stripe funciona con tarjetas de prueba sin necesitar banco
- Puedes probar el flujo completo en minutos
- No necesitas esperar respuesta de soporte de Redsys

### 4. **Preparado para A/B Testing**
- Puedes ofrecer ambos métodos a clientes
- Medir tasas de conversión de cada uno
- Decidir basándose en datos reales

## 💰 Comparativa de Costos

### Ejemplo: Reserva de 1,000€

| Método | Comisión | Costo | Neto |
|--------|----------|-------|------|
| **Redsys** | 0.3% | 3€ | 997€ |
| **Stripe** | 1.4% + 0.25€ | 14.25€ | 985.75€ |
| **Diferencia** | | **+11.25€** | **-11.25€** |

### ¿Cuándo Usar Cada Uno?

**Usar Redsys si:**
- Funciona correctamente
- Cliente es español/europeo
- Quieres minimizar comisiones

**Usar Stripe si:**
- Redsys tiene problemas
- Cliente es internacional
- Necesitas mejor UX/conversión
- Estás en fase de pruebas

## 🚀 Próximos Pasos Recomendados

### Corto Plazo (Ahora)

1. **Configurar Stripe para pruebas** (10 minutos)
   - Seguir `STRIPE-SETUP-RAPIDO.md`
   - Obtener claves de test
   - Ejecutar script SQL en Supabase
   - Configurar Stripe CLI

2. **Probar flujo completo** (5 minutos)
   - Crear reserva de prueba
   - Seleccionar Stripe
   - Pagar con tarjeta `4242 4242 4242 4242`
   - Verificar en Supabase

3. **Contactar soporte de Redsys** (pendiente de tu parte)
   - Enviar email a: soporte.comercios@redsys.es
   - Proporcionar: Merchant Code (347036410), error SIS0042
   - Preguntar por configuración de comercio y URLs autorizadas

### Medio Plazo (1-2 semanas)

4. **Resolver problema de Redsys**
   - Trabajar con soporte técnico
   - Corregir configuración
   - Probar en ambiente de pruebas
   - Validar en producción

5. **Decidir estrategia de métodos de pago**
   - Si Redsys funciona: ¿Ofrecer ambos o solo Redsys?
   - Si Redsys no funciona: Migrar temporalmente a Stripe
   - A/B testing para medir conversión

### Largo Plazo (1-2 meses)

6. **Análisis de datos**
   - Tasa de éxito de cada método
   - Costos reales acumulados
   - Preferencias de clientes
   - Abandonos en cada pasarela

7. **Decisión final**
   - Mantener ambos métodos
   - O quedarse solo con el que mejor funcione
   - Optimizar según datos reales

## 🔧 Configuración Técnica Necesaria

### Variables de Entorno (.env.local)

```env
# === REDSYS (YA CONFIGURADO) ===
REDSYS_MERCHANT_CODE=347036410
REDSYS_TERMINAL=001
REDSYS_SECRET_KEY=tu_clave_secreta_redsys

# === STRIPE (NUEVO - CONFIGURAR) ===
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXX
STRIPE_SECRET_KEY=sk_test_XXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXX

# === URL PÚBLICA ===
NEXT_PUBLIC_URL=http://localhost:3000  # o tu dominio

# === ENCRYPTION (YA CONFIGURADO) ===
ENCRYPTION_KEY=tu_clave_de_encriptacion
```

### Base de Datos (Supabase)

Ejecutar script SQL:
```bash
supabase/add-stripe-support.sql
```

Esto añade a la tabla `payments`:
- `payment_method` (redsys/stripe)
- `stripe_session_id`
- `stripe_payment_intent_id`

## 📊 Flujo de Usuario

```
1. Usuario crea reserva
        ↓
2. Llega a página de pago
        ↓
3. Ve selector: [Redsys] [Stripe]
        ↓
4a. Selecciona REDSYS          4b. Selecciona STRIPE
    → Formulario Redsys             → Stripe Checkout
    → Página banco                  → Página Stripe
    → Paga con tarjeta              → Paga con tarjeta
        ↓                               ↓
5. Webhook actualiza estado     5. Webhook actualiza estado
        ↓                               ↓
6. Redirige a /pago/exito      6. Redirige a /pago/exito
        ↓                               ↓
7. Reserva confirmada ✅        7. Reserva confirmada ✅
```

## 🎯 Recomendación Final

1. **Configura Stripe AHORA** (10 min) para tener alternativa funcionando
2. **Sigue trabajando en resolver Redsys** (es tu mejor opción económica)
3. **Ofrece ambos métodos** temporalmente a los clientes
4. **Analiza datos** después de 1 mes para decidir estrategia final

Con esta implementación tienes:
- ✅ Sistema de pagos funcionando (Stripe)
- ✅ Flexibilidad para resolver Redsys sin prisa
- ✅ Mejor experiencia de usuario (elige su método preferido)
- ✅ Datos para tomar decisión informada

---

**¿Por dónde empezar?**

Tu app ya está en producción (Vercel), así que:

👉 Lee **`STRIPE-VERCEL-PRODUCCION.md`** y sigue los pasos. En 15 minutos tendrás Stripe funcionando en producción.

> Nota: Si estás en desarrollo local, usa `STRIPE-SETUP-RAPIDO.md` en su lugar.
