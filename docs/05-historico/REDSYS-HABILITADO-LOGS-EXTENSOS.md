# 🔴 Redsys Habilitado con Sistema de Logs Extensos

**Fecha**: 23 de Enero de 2026  
**Estado**: ✅ REDSYS HABILITADO con logging completo

---

## 📋 Resumen de Cambios

Se ha **habilitado Redsys como método de pago** y se ha implementado un **sistema de logs extensos** en todos los puntos críticos del flujo de pago para facilitar la detección y resolución de cualquier error.

---

## ✅ Cambios Realizados

### 1. **Frontend - Página de Pago** (`src/app/reservar/[id]/pago/page.tsx`)

#### Cambio 1: Redsys habilitado por defecto
```typescript
// ANTES
const [paymentMethod, setPaymentMethod] = useState<'redsys' | 'stripe'>('stripe');

// AHORA
const [paymentMethod, setPaymentMethod] = useState<'redsys' | 'stripe'>('redsys');
```

#### Cambio 2: Selector de método de pago restaurado
- ✅ Botón de Redsys ahora es clickeable (eliminado `disabled`)
- ✅ Eliminada la etiqueta "Próximamente"
- ✅ Redsys se muestra como opción principal
- ✅ Ambos métodos (Redsys y Stripe) están disponibles

#### Cambio 3: Logs extensos en el proceso de pago
Se han añadido logs detallados en cada paso:

```
[1/5] Información del pago (bookingId, amount, método)
[2/5] Método seleccionado (Redsys/Stripe)
[3/5] Respuesta del backend + decodificación de parámetros
[4/5] Creación del formulario HTML
[5/5] Envío del formulario a Redsys
```

**Logs específicos añadidos**:
- 📊 Información completa del pago a realizar
- 🔍 Decodificación de parámetros Redsys en frontend
- ✅ Validaciones de parámetros (amount, orderNumber, merchantCode, etc.)
- 📤 Detalles del formulario antes de enviarlo
- 🚀 Confirmación de redirección a Redsys

---

### 2. **Backend - API Initiate** (`src/app/api/redsys/initiate/route.ts`)

Se ha implementado un sistema de logging estructurado con **8 fases**:

```
[1/8] ✅ Datos recibidos y validaciones iniciales
[2/8] ✅ Búsqueda de reserva en BD
[3/8] ✅ Generación de número de pedido único
[4/8] ✅ Configuración de Redsys (validación completa)
[5/8] ✅ Generación de parámetros y firma
[6/8] ✅ Registro en base de datos
[7/8] ✅ Preparación de respuesta
[8/8] ✅ Proceso completado exitosamente
```

**Información loggeada**:
- Datos recibidos del frontend (bookingId, amount, paymentType)
- Validación de tipos de datos
- Información de la reserva encontrada
- Número de pedido generado (orderNumber)
- **Configuración completa de Redsys**:
  - merchantCode
  - terminal
  - secretKey (longitud, presencia)
  - URLs (OK, KO, notificación)
  - Entorno (test/producción)
- **Parámetros enviados a Redsys (decodificados)**:
  - Todos los campos DS_MERCHANT_*
  - Validaciones de formato
  - Verificación de conversión a céntimos
- Firma generada (Ds_Signature)
- Estado del registro en BD
- URL final de Redsys

---

### 3. **Backend - API Notification** (`src/app/api/redsys/notification/route.ts`)

Sistema de logging estructurado con **7 fases**:

```
[1/7] ✅ Datos recibidos de Redsys
[2/7] ✅ Decodificación de parámetros
[3/7] ✅ Validación de firma HMAC-SHA256
[4/7] ✅ Determinación del estado del pago
[5/7] ✅ Actualización del registro de pago
[6/7] ✅ Actualización de la reserva (si autorizado)
[7/7] ✅ Envío de email de confirmación
```

**Información loggeada**:
- Parámetros recibidos de Redsys (Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature)
- **Todos los datos de la transacción**:
  - Ds_Order (número de pedido)
  - Ds_Response (código de respuesta)
  - Ds_Amount (importe en céntimos)
  - Ds_AuthorisationCode
  - Ds_Date, Ds_Hour
  - Ds_Card_Country, Ds_Card_Type
  - Ds_MerchantData
- Validación de firma (éxito/fallo)
- Estado determinado (authorized, error, etc.)
- Mensaje de respuesta traducido
- **Actualización de reserva**:
  - amount_paid anterior y nuevo
  - Porcentaje pagado
  - Nuevo payment_status
  - Estado de la reserva
- Tipo de email enviado (first_payment/second_payment)

---

## 🔍 Cómo Leer los Logs

### En el Navegador (Frontend)

1. Abre las **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Cuando hagas clic en "Pagar", verás:

```
================================================================================
💳 FRONTEND - INICIANDO PROCESO DE PAGO
================================================================================
📊 [1/5] Información del pago: { ... }
🔴 [2/5] Método seleccionado: REDSYS
📡 [2/5] Llamando a /api/redsys/initiate...
📥 [3/5] Respuesta del servidor recibida
✅ [3/5] Respuesta exitosa del backend: { ... }
🔍 [3/5] Decodificando parámetros recibidos...
📋 [3/5] Parámetros Redsys (decodificados): { ... }
📝 [4/5] Creando formulario para enviar a Redsys...
📤 [5/5] Formulario creado con éxito: { ... }
🚀 [5/5] Enviando formulario a Redsys...
================================================================================
✅ FRONTEND - REDIRIGIENDO A REDSYS
================================================================================
```

### En Vercel (Backend)

#### Opción 1: Dashboard de Vercel

1. Ve a https://vercel.com
2. Selecciona tu proyecto `furgocasa-app`
3. Ve a **Functions** en el menú lateral
4. Busca la función que ejecutaste (por ejemplo: `api/redsys/initiate`)
5. Haz clic en **Logs**

#### Opción 2: Vercel CLI

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Ver logs en tiempo real
vercel logs --follow

# Ver logs de una función específica
vercel logs --function=api/redsys/initiate

# Ver logs de producción
vercel logs --prod
```

### Estructura de Logs Backend

```
================================================================================
🚀 REDSYS INITIATE - INICIO DE PROCESO
================================================================================
📥 [1/8] Datos recibidos en el request: { ... }
✅ [1/8] Validaciones iniciales correctas
📊 [2/8] Cliente Supabase creado
🔍 [2/8] Buscando reserva en BD...
✅ [2/8] Reserva encontrada: { ... }
🎲 [3/8] Generando número de pedido único...
✅ [3/8] Número de pedido generado: FC...
⚙️ [4/8] Obteniendo configuración de Redsys...
⚙️ [4/8] Configuración de Redsys: { ... }
✅ [4/8] Configuración de Redsys completa y válida
🔨 [5/8] Generando parámetros de pago...
📋 [5/8] Tipo de pago: Pago normal
💳 [5/8] Creando formulario de pago normal...
📤 [5/8] FormData generado exitosamente: { ... }
🔍 [5/8] Decodificando parámetros para verificación...
✅ [5/8] Parámetros decodificados correctamente: { ... }
💾 [6/8] Registrando pago en la base de datos...
✅ [6/8] Registro de pago creado en BD
🌐 [7/8] URL de Redsys: https://...
✅ [7/8] Preparando respuesta al frontend...
📦 [8/8] Respuesta final: { ... }
================================================================================
✅ REDSYS INITIATE - PROCESO COMPLETADO EXITOSAMENTE
================================================================================
```

---

## 🔍 Datos Críticos a Verificar en los Logs

### 1. Configuración de Redsys

Busca en los logs del backend:

```javascript
⚙️ [4/8] Configuración de Redsys: {
  merchantCode: '347036410',      // ✅ Debe ser tu FUC correcto
  terminal: '001',                // ✅ Debe ser tu terminal
  hasSecretKey: true,             // ✅ Debe ser true
  secretKeyLength: 24,            // ✅ Debe ser > 0
  urlOk: 'https://www.furgocasa.com/pago/exito',  // ✅ URLs correctas
  urlKo: 'https://www.furgocasa.com/pago/error',
  notificationUrl: 'https://www.furgocasa.com/api/redsys/notification',
  environment: 'production'       // ✅ o 'test' si estás en pruebas
}
```

### 2. Parámetros Enviados a Redsys

Busca en los logs:

```javascript
✅ [5/8] Parámetros decodificados correctamente: {
  "DS_MERCHANT_AMOUNT": "9500",           // ✅ Céntimos (95.00€ = 9500)
  "DS_MERCHANT_ORDER": "FC2601231234XXXX", // ✅ Formato correcto
  "DS_MERCHANT_MERCHANTCODE": "347036410", // ✅ Tu FUC
  "DS_MERCHANT_CURRENCY": "978",          // ✅ Euro
  "DS_MERCHANT_TRANSACTIONTYPE": "0",     // ✅ Autorización
  "DS_MERCHANT_TERMINAL": "001",          // ✅ Tu terminal
  "DS_MERCHANT_MERCHANTURL": "https://...", // ✅ URL de notificación
  "DS_MERCHANT_URLOK": "https://...",     // ✅ URL de éxito
  "DS_MERCHANT_URLKO": "https://..."      // ✅ URL de error
}
```

### 3. Validaciones Específicas

```javascript
🔍 [5/8] Validaciones de parámetros: {
  amountEnCentimos: '9500',
  amountOriginal: 95,
  conversionCorrecta: true,        // ✅ DEBE SER TRUE
  orderNumber: 'FC2601231234XXXX',
  orderLength: 12,                 // ✅ DEBE SER 12
  orderFormatCorrecto: true,       // ✅ DEBE SER TRUE
  terminal: '001',
  merchantCode: '347036410',
  currency: '978',
  transactionType: '0'
}
```

---

## 🚨 Detección de Errores

### Error en el Frontend

Si hay un error **ANTES** de enviar a Redsys, verás:

```
================================================================================
❌ ERROR EN PROCESO DE PAGO (FRONTEND)
================================================================================
Error: [Objeto Error]
Mensaje: [Descripción del error]
Stack: [Traza del error]
================================================================================
```

### Error en el Backend (Initiate)

```
================================================================================
❌ ERROR CRÍTICO EN REDSYS INITIATE
================================================================================
Error: [Objeto Error]
Stack: [Traza del error]
================================================================================
```

### Error en Redsys (Página de Pago)

Si llegas a la página de Redsys pero esta da error:
1. **Mira la consola del navegador** en la página de Redsys
2. **Mira los logs del backend** para ver los parámetros enviados
3. **Compara** los errores 404 que aparezcan

---

## 📊 Ejemplo de Flujo Completo con Logs

### 1. Usuario hace clic en "Pagar" (Frontend)

```
💳 FRONTEND - INICIANDO PROCESO DE PAGO
📊 [1/5] amount: 95, bookingId: xxx, paymentMethod: redsys
🔴 [2/5] Método seleccionado: REDSYS
```

### 2. Backend procesa la solicitud

```
🚀 REDSYS INITIATE - INICIO DE PROCESO
📥 [1/8] Datos recibidos: { bookingId, amount: 95 }
✅ [1/8] Validaciones correctas
✅ [2/8] Reserva encontrada
✅ [3/8] Order number: FC2601231234XXXX
✅ [4/8] Configuración válida
✅ [5/8] Parámetros generados correctamente
✅ [6/8] Pago registrado en BD
✅ REDSYS INITIATE - PROCESO COMPLETADO
```

### 3. Frontend recibe respuesta y crea formulario

```
📥 [3/5] Respuesta del servidor recibida
✅ [3/5] Respuesta exitosa
🔍 [3/5] Parámetros decodificados: { amount: 9500, order: FC... }
📝 [4/5] Creando formulario...
📤 [5/5] Formulario creado: 3 campos
🚀 [5/5] Enviando a Redsys...
✅ FRONTEND - REDIRIGIENDO A REDSYS
```

### 4. Redsys procesa el pago

(El usuario está en la página de Redsys)

### 5. Redsys envía notificación al backend

```
📨 REDSYS NOTIFICATION - RECIBIENDO NOTIFICACIÓN
📥 [1/7] Datos recibidos de Redsys
✅ [2/7] Parámetros decodificados
✅ [3/7] Firma validada correctamente
📊 [3/7] Datos: order: FC..., response: 0000, amount: 9500
✅ [4/7] Estado: authorized
✅ [5/7] Pago actualizado en BD
✅ [6/7] Reserva actualizada: amount_paid=95, payment_status=partial
✅ [7/7] Email programado
✅ REDSYS NOTIFICATION - PROCESO COMPLETADO
```

---

## 🎯 Próximos Pasos

1. **Hacer una prueba de pago**:
   - Crea una reserva de prueba
   - Selecciona Redsys
   - Haz clic en "Pagar"
   - **IMPORTANTE**: Mantén abierta la consola del navegador (F12)

2. **Revisar los logs**:
   - **En el navegador**: Consola de DevTools
   - **En Vercel**: Dashboard > Functions > Logs

3. **Si hay error**:
   - Copia TODOS los logs
   - Busca el mensaje de error específico
   - Revisa las validaciones que fallen
   - Compara con los datos esperados

4. **Compartir logs**:
   - Si necesitas ayuda, copia los logs completos
   - Incluye tanto frontend como backend
   - Indica en qué punto exacto falló

---

## 📞 Contacto con Redsys (si persiste el error)

Si después de revisar los logs todo parece correcto pero Redsys sigue dando error:

1. **Prepara esta información**:
   - Logs completos del proceso
   - Número de pedido (Order Number)
   - Parámetros enviados (decodificados)
   - Error específico de Redsys

2. **Contacta a soporte**:
   - Email: soporte.comercios@redsys.es
   - Teléfono: 902 33 25 45
   - Horario: L-V 9:00-18:00

---

## ✅ Checklist Final

- [x] Redsys habilitado en el selector de métodos de pago
- [x] Redsys configurado por defecto
- [x] Logs extensos en frontend
- [x] Logs extensos en backend (initiate)
- [x] Logs extensos en backend (notification)
- [x] Validaciones de parámetros implementadas
- [x] Documentación completa de logs

---

**Estado**: ✅ SISTEMA DE LOGS COMPLETO Y REDSYS HABILITADO  
**Siguiente paso**: Realizar prueba de pago y revisar logs
