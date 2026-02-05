# 🚨 ATAQUES EXTERNOS - Análisis de Amenazas Reales

**Fecha**: 5 de Febrero, 2026  
**Versión**: 1.0.0  
**Estado**: ⚠️ CRÍTICO - Tu aplicación está vulnerable a estos ataques

---

## 📋 RESUMEN EJECUTIVO

Este documento analiza los **ataques externos reales** que pueden ocurrir contra tu aplicación Furgocasa. Se identifican **12 tipos de ataques** que son posibles actualmente debido a vulnerabilidades existentes.

### ⚠️ ATAQUES POSIBLES ACTUALMENTE

| Ataque | Probabilidad | Impacto | Estado Actual |
|--------|-------------|---------|---------------|
| **1. Webhook Falsificado** | 🔴 ALTA | 🔴 CRÍTICO | ⚠️ VULNERABLE |
| **2. CSRF (Cross-Site Request Forgery)** | 🔴 ALTA | 🔴 CRÍTICO | ⚠️ VULNERABLE |
| **3. DoS/DDoS** | 🟠 MEDIA | 🟠 ALTO | ⚠️ PARCIALMENTE PROTEGIDO |
| **4. Manipulación de Pagos** | 🔴 ALTA | 🔴 CRÍTICO | ⚠️ VULNERABLE |
| **5. Robo de Tokens** | 🔴 ALTA | 🔴 CRÍTICO | ⚠️ VULNERABLE |
| **6. Ataque de Replay** | 🟠 MEDIA | 🟠 ALTO | ⚠️ VULNERABLE |
| **7. Enumeración de Usuarios** | 🟡 BAJA | 🟡 MEDIO | ⚠️ PARCIALMENTE VULNERABLE |
| **8. XSS (Cross-Site Scripting)** | 🟡 BAJA | 🟠 ALTO | ✅ PARCIALMENTE PROTEGIDO |
| **9. SQL Injection** | 🟢 MUY BAJA | 🔴 CRÍTICO | ✅ PROTEGIDO |
| **10. Brute Force** | 🟠 MEDIA | 🟡 MEDIO | ⚠️ PARCIALMENTE PROTEGIDO |
| **11. Session Hijacking** | 🟠 MEDIA | 🟠 ALTO | ⚠️ PARCIALMENTE PROTEGIDO |
| **12. Data Exfiltration** | 🟠 MEDIA | 🔴 CRÍTICO | ⚠️ VULNERABLE |

---

## 🔴 ATAQUE #1: WEBHOOK FALSIFICADO (CRÍTICO)

### ¿Qué es?
Un atacante envía notificaciones falsas de pago a tu endpoint `/api/redsys/notification` haciéndose pasar por Redsys.

### ¿Cómo funciona?
```bash
# Atacante puede hacer esto:
curl -X POST https://www.furgocasa.com/api/redsys/notification \
  -d "Ds_MerchantParameters=FAKE_DATA" \
  -d "Ds_Signature=FAKE_SIGNATURE"
```

### ¿Por qué es posible?
- ❌ **No hay validación de IP origen** - Cualquiera puede llamar al endpoint
- ❌ **Solo valida la firma** - Pero si el atacante conoce el formato, puede intentar falsificarla
- ❌ **No hay rate limiting** - Puede enviar miles de notificaciones falsas

### Impacto Real:
1. **Marcar pagos como completados sin recibir dinero**
2. **Confirmar reservas sin pago real**
3. **Cancelar reservas legítimas**
4. **Manipular estados de pagos**

### Escenario Real:
```
1. Cliente crea reserva por 500€
2. Atacante envía webhook falso diciendo "pago completado"
3. Tu sistema marca la reserva como confirmada
4. Cliente recibe vehículo sin pagar
5. TÚ PIERDES 500€
```

### ✅ Solución:
```typescript
// Validar IP origen de Redsys
const REDSYS_IPS = [
  '195.76.9.97',  // IPs oficiales de Redsys
  '195.76.9.98',
  // ... más IPs
];

const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0];
if (!REDSYS_IPS.includes(clientIP)) {
  console.error('⚠️ Intento de webhook falsificado desde:', clientIP);
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

**Prioridad**: 🔴 CRÍTICA - Implementar HOY

---

## 🔴 ATAQUE #2: CSRF (Cross-Site Request Forgery) (CRÍTICO)

### ¿Qué es?
Un sitio web malicioso hace que tus usuarios ejecuten acciones en tu sitio sin su conocimiento.

### ¿Cómo funciona?
```html
<!-- Sitio malicioso: evil-site.com -->
<form action="https://www.furgocasa.com/api/bookings/create" method="POST">
  <input name="vehicle_id" value="VEHICULO_CARO">
  <input name="amount" value="0.01">  <!-- Precio manipulado -->
  <input name="customer_email" value="atacante@evil.com">
</form>
<script>document.forms[0].submit();</script>
```

### ¿Por qué es posible?
- ❌ **No hay tokens CSRF** - Cualquier sitio puede hacer requests
- ❌ **Cookies se envían automáticamente** - El navegador las incluye
- ❌ **APIs públicas sin protección** - Cualquiera puede llamarlas

### Impacto Real:
1. **Crear reservas con precios manipulados** (ej: 0.01€ en lugar de 500€)
2. **Cancelar reservas de otros usuarios**
3. **Modificar datos de clientes**
4. **Iniciar pagos sin consentimiento**

### Escenario Real:
```
1. Usuario está logueado en furgocasa.com
2. Visita sitio malicioso (ej: oferta-camper-gratis.com)
3. El sitio malicioso automáticamente crea una reserva con precio 0.01€
4. Usuario no se da cuenta hasta que recibe confirmación
5. TÚ PIERDES dinero
```

### ✅ Solución:
```typescript
// Generar token CSRF en el servidor
import { generateCSRFToken, validateCSRFToken } from '@/lib/security/csrf';

// En el frontend, incluir token en headers
headers: {
  'X-CSRF-Token': csrfToken
}

// En el backend, validar token
const csrfToken = request.headers.get('x-csrf-token');
if (!validateCSRFToken(csrfToken)) {
  return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
}
```

**Prioridad**: 🔴 CRÍTICA - Implementar esta semana

---

## 🔴 ATAQUE #3: DoS/DDoS (Denial of Service)

### ¿Qué es?
Atacante satura tu servidor con requests para dejarlo inoperativo.

### ¿Cómo funciona?
```bash
# Atacante ejecuta esto desde múltiples IPs:
for i in {1..10000}; do
  curl https://www.furgocasa.com/api/availability &
done
```

### ¿Por qué es posible?
- ⚠️ **Rate limiting limitado** - Solo 4 rutas protegidas
- ❌ **APIs de pago sin rate limiting** - Pueden ser saturadas
- ❌ **Rate limiting por IP** - Fácil de evadir con múltiples IPs

### Impacto Real:
1. **Tu sitio se vuelve lento o inaccesible**
2. **Clientes no pueden hacer reservas**
3. **Pérdida de ingresos**
4. **Costos elevados en Vercel** (si hay límites)

### Escenario Real:
```
1. Competidor contrata botnet (1000+ IPs)
2. Todos hacen requests simultáneos a /api/availability
3. Tu servidor se satura
4. Clientes legítimos no pueden usar el sitio
5. TÚ PIERDES ventas durante horas/días
```

### ✅ Solución:
```typescript
// Rate limiting más agresivo
const RATE_LIMITS = {
  '/api/redsys/initiate': { limit: 5, window: 60 },  // Muy estricto para pagos
  '/api/bookings/create': { limit: 5, window: 60 },
  '/api/availability': { limit: 30, window: 60 },
  // ... TODAS las APIs
};

// Usar Redis para rate limiting distribuido
// Implementar CAPTCHA después de X intentos
```

**Prioridad**: 🟠 ALTA - Implementar pronto

---

## 🔴 ATAQUE #4: MANIPULACIÓN DE PAGOS

### ¿Qué es?
Atacante manipula el monto o datos del pago antes de enviarlo.

### ¿Cómo funciona?
```javascript
// Atacante intercepta request en el navegador
fetch('/api/redsys/initiate', {
  method: 'POST',
  body: JSON.stringify({
    bookingId: 'RESERVA_LEGITIMA',
    amount: 0.01,  // ❌ Cambió de 500€ a 0.01€
    paymentType: 'full'
  })
});
```

### ¿Por qué es posible?
- ❌ **Validación solo en frontend** - Fácil de modificar
- ⚠️ **Validación en backend débil** - No verifica que el monto coincida con la reserva
- ❌ **No hay verificación de integridad** - El monto puede ser manipulado

### Impacto Real:
1. **Pagar 0.01€ en lugar de 500€**
2. **Obtener vehículos casi gratis**
3. **Pérdidas económicas masivas**

### Escenario Real:
```
1. Cliente crea reserva por 500€ (bookingId: abc123)
2. Atacante modifica el request de pago: amount: 0.01
3. Tu sistema procesa pago de 0.01€
4. Reserva se marca como pagada
5. Cliente recibe vehículo por casi nada
6. TÚ PIERDES 499.99€
```

### ✅ Solución:
```typescript
// SIEMPRE validar monto contra la reserva en BD
const { data: booking } = await supabase
  .from('bookings')
  .select('total_price, amount_paid')
  .eq('id', bookingId)
  .single();

// Validar que el monto es correcto
const expectedAmount = booking.total_price - (booking.amount_paid || 0);
if (Math.abs(amount - expectedAmount) > 0.01) {  // Tolerancia de 1 céntimo
  return NextResponse.json(
    { error: 'El monto no coincide con la reserva' },
    { status: 400 }
  );
}
```

**Prioridad**: 🔴 CRÍTICA - Implementar HOY

---

## 🔴 ATAQUE #5: ROBO DE TOKENS Y SECRETOS

### ¿Qué es?
Atacante obtiene tokens y secretos de tu aplicación para usarlos maliciosamente.

### ¿Cómo funciona?
```javascript
// Atacante abre DevTools en el navegador
console.log(process.env.NEXT_PUBLIC_CALENDAR_TOKEN);
// Ve: "furgocasa2026"

// Ahora puede acceder a:
fetch('/api/calendar/entregas?token=furgocasa2026')
```

### ¿Por qué es posible?
- ❌ **Token hardcodeado** - Visible en código fuente
- ❌ **Variables NEXT_PUBLIC_*** - Expuestas en bundle del cliente
- ❌ **Logs exponen secretos** - Parcialmente visibles

### Impacto Real:
1. **Acceso no autorizado a endpoints protegidos**
2. **Robo de datos de calendario**
3. **Manipulación de información sensible**
4. **Escalada de privilegios**

### Escenario Real:
```
1. Atacante revisa código fuente en GitHub
2. Encuentra token hardcodeado: "furgocasa2026"
3. Accede a /api/calendar/entregas?token=furgocasa2026
4. Obtiene información de entregas y recogidas
5. Puede planificar ataques con información sensible
```

### ✅ Solución:
```typescript
// ❌ ELIMINAR tokens hardcodeados
// ❌ ELIMINAR NEXT_PUBLIC_ de secretos
// ✅ Usar solo variables de servidor

// En .env (NUNCA en código):
CALENDAR_SUBSCRIPTION_TOKEN=token_seguro_generado_aleatoriamente

// En código:
const token = process.env.CALENDAR_SUBSCRIPTION_TOKEN;
if (!token) throw new Error('Token no configurado');
```

**Prioridad**: 🔴 CRÍTICA - Corregir HOY

---

## 🟠 ATAQUE #6: ATAQUE DE REPLAY

### ¿Qué es?
Atacante captura un request legítimo y lo reenvía múltiples veces.

### ¿Cómo funciona?
```bash
# Atacante captura request de pago exitoso
# Lo reenvía 10 veces:
for i in {1..10}; do
  curl -X POST https://www.furgocasa.com/api/redsys/notification \
    -d "Ds_MerchantParameters=CAPTURED_DATA" \
    -d "Ds_Signature=CAPTURED_SIGNATURE"
done
```

### ¿Por qué es posible?
- ❌ **No hay validación de duplicados** - Mismo pago puede procesarse múltiples veces
- ❌ **No hay timestamps únicos** - No se detecta replay
- ❌ **No hay nonces** - Mismo request puede repetirse

### Impacto Real:
1. **Procesar el mismo pago múltiples veces**
2. **Marcar reservas como pagadas varias veces**
3. **Confusión en estados de pagos**

### ✅ Solución:
```typescript
// Validar que el pago no se haya procesado antes
const { data: existingPayment } = await supabase
  .from('payments')
  .select('id, status')
  .eq('order_number', params.Ds_Order)
  .single();

if (existingPayment && existingPayment.status === 'completed') {
  // Ya procesado, ignorar
  return NextResponse.json({ success: true });
}
```

**Prioridad**: 🟠 ALTA - Implementar pronto

---

## 🟡 ATAQUE #7: ENUMERACIÓN DE USUARIOS ADMIN

### ¿Qué es?
Atacante descubre qué usuarios son administradores.

### ¿Cómo funciona?
```javascript
// Atacante prueba emails comunes:
const emails = ['admin@furgocasa.com', 'root@furgocasa.com', ...];

emails.forEach(email => {
  fetch('/api/admin/check-auth')
    .then(r => r.json())
    .then(data => {
      if (data.isAdmin) {
        console.log('Admin encontrado:', email);
      }
    });
});
```

### ¿Por qué es posible?
- ⚠️ **Endpoint expone si es admin** - Aunque no revele datos completos
- ⚠️ **Mensajes de error diferentes** - Pueden revelar información

### Impacto Real:
1. **Identificar objetivos para ataques**
2. **Foco en cuentas administrativas**
3. **Ataques dirigidos más efectivos**

### ✅ Solución:
```typescript
// Siempre retornar mismo formato, sin revelar si existe
return NextResponse.json({ 
  isAdmin: false  // Siempre false si no está autenticado
});
```

**Prioridad**: 🟡 MEDIA - Mejorar cuando sea posible

---

## 🟡 ATAQUE #8: XSS (Cross-Site Scripting)

### ¿Qué es?
Atacante inyecta código JavaScript malicioso en tu sitio.

### ¿Cómo funciona?
```javascript
// Si tu sitio renderiza input del usuario sin sanitizar:
<div>{userInput}</div>

// Atacante puede inyectar:
userInput = '<script>alert("XSS")</script>';
```

### ¿Por qué es posible?
- ⚠️ **CSP tiene 'unsafe-inline'** - Permite scripts inline
- ⚠️ **CSP tiene 'unsafe-eval'** - Permite eval()
- ✅ **React sanitiza por defecto** - Pero CSP débil reduce protección

### Impacto Real:
1. **Robo de cookies de sesión**
2. **Redirección a sitios maliciosos**
3. **Modificación de contenido**

### ✅ Solución:
```javascript
// Mejorar CSP en next.config.js
script-src 'self' 'nonce-{random}';  // Sin unsafe-inline
// Usar nonces para scripts necesarios
```

**Prioridad**: 🟡 MEDIA - Mejorar CSP

---

## ✅ ATAQUE #9: SQL INJECTION (PROTEGIDO)

### Estado: ✅ PROTEGIDO

**Por qué está protegido:**
- Supabase usa prepared statements
- Row Level Security (RLS) activado
- Validación con Zod antes de queries

**No requiere acción inmediata.**

---

## 🟠 ATAQUE #10: BRUTE FORCE

### ¿Qué es?
Atacante prueba miles de contraseñas para acceder a cuentas admin.

### ¿Por qué es posible?
- ⚠️ **Rate limiting solo por IP** - Puede usar múltiples IPs
- ⚠️ **No hay CAPTCHA** - Después de X intentos fallidos
- ⚠️ **No hay bloqueo de cuenta** - Después de múltiples intentos

### ✅ Solución:
```typescript
// Implementar bloqueo de cuenta después de 5 intentos
// Agregar CAPTCHA después de 3 intentos
// Rate limiting más estricto en login
```

**Prioridad**: 🟠 ALTA - Implementar pronto

---

## 🟠 ATAQUE #11: SESSION HIJACKING

### ¿Qué es?
Atacante roba la cookie de sesión de un usuario legítimo.

### ¿Por qué es posible?
- ⚠️ **Cookies sin SameSite Strict** - Pueden ser enviadas cross-site
- ⚠️ **No hay HttpOnly explícito** - Aunque Supabase lo maneja
- ⚠️ **No hay rotación de sesiones** - Sesiones largas

### ✅ Solución:
```typescript
// Configurar cookies con SameSite=Strict
// Implementar rotación de tokens
// Timeout de sesión más corto
```

**Prioridad**: 🟠 ALTA - Mejorar configuración

---

## 🟠 ATAQUE #12: DATA EXFILTRATION

### ¿Qué es?
Atacante roba datos sensibles de tu aplicación.

### ¿Cómo funciona?
- Logs exponen información sensible
- Errores revelan estructura de BD
- Variables públicas exponen secretos

### Impacto Real:
1. **Robo de datos de clientes**
2. **Exposición de información financiera**
3. **Violación de GDPR**

### ✅ Solución:
- Eliminar logs sensibles
- Ocultar detalles de errores
- Mover secretos fuera de cliente

**Prioridad**: 🟠 ALTA - Corregir logs y errores

---

## 📊 RESUMEN DE PRIORIDADES

### 🔴 CRÍTICO - Corregir HOY:
1. ✅ Validar origen en webhooks
2. ✅ Validar monto contra reserva en BD
3. ✅ Eliminar tokens hardcodeados
4. ✅ Mover secretos fuera de NEXT_PUBLIC_*

### 🟠 ALTA - Esta Semana:
5. ✅ Implementar protección CSRF
6. ✅ Ampliar rate limiting
7. ✅ Implementar validación de replay
8. ✅ Mejorar protección contra brute force

### 🟡 MEDIA - Próximas 2 Semanas:
9. ✅ Mejorar CSP
10. ✅ Configurar SameSite en cookies
11. ✅ Minimizar información expuesta

---

## 🛡️ PROTECCIONES ACTUALES

### ✅ Lo que SÍ tienes:
- ✅ Headers de seguridad (CSP, HSTS, X-Frame-Options)
- ✅ Validación de inputs con Zod
- ✅ Rate limiting básico (4 rutas)
- ✅ Bloqueo geográfico (China)
- ✅ Validación de firmas (Redsys, Stripe)
- ✅ Row Level Security en Supabase
- ✅ HTTPS forzado

### ❌ Lo que FALTA:
- ❌ Validación de origen en webhooks
- ❌ Protección CSRF
- ❌ Rate limiting completo
- ❌ Validación de monto en pagos
- ❌ Tokens seguros
- ❌ Protección contra replay
- ❌ CAPTCHA en login
- ❌ Monitoreo de seguridad

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### Día 1 (HOY):
1. Validar IP origen en webhooks Redsys
2. Validar monto contra reserva en BD
3. Eliminar token hardcodeado
4. Mover secretos fuera de cliente

### Día 2-3:
5. Implementar protección CSRF
6. Ampliar rate limiting a todas las APIs
7. Implementar validación de replay

### Semana 2:
8. Agregar CAPTCHA en login
9. Mejorar CSP
10. Configurar SameSite en cookies
11. Implementar monitoreo

---

**Última actualización**: 5 de Febrero, 2026  
**Próxima revisión**: Después de implementar correcciones críticas
