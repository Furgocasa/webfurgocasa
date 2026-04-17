# 📋 PENDIENTES DE SEGURIDAD

**Fecha original**: 5 de Febrero, 2026  
**Última revisión**: 17 de abril, 2026 (segunda pasada del día)  
**Estado**: 🟢 **Sprint de seguridad completado — solo quedan tareas de infraestructura externa**

---

## 🆕 ACTUALIZACIÓN — 17 de abril, 2026 (tarde)

Segunda tanda de fixes cerrados en el mismo día tras la auditoría Supabase Security Advisor. Todos los cierres son aditivos, reversibles y testeables.

**Nuevos cierres en código (esta tanda):**
- ✅ **Bloqueo de importe en `/api/redsys/initiate`** — Ahora rechaza con 400 si `amount` no coincide con ni el importe pendiente ni el 50 % inicial (tolerancia 0,05 €). `preauth` sigue sin validarse (fianza tiene importe independiente).
- ✅ **Recálculo de precios en `/api/bookings/create`** — Reserva rechazada con 400 si el `total_price` enviado por el cliente difiere del recálculo servidor en más de `max(2 €, 2 %)`. Reutiliza `buildPricingForSearch` + `extraLineUnitPriceEuros`. `last_minute_offer_id` se loguea pero no bloquea (precio fijado por oferta).
- ✅ **5 endpoints `/api/test-*` + `/api/debug/schema` cerrados** — Ahora requieren sesión de admin válida (`requireAdmin()` en `src/lib/auth/require-admin.ts`). Antes: abiertos sin auth (filtraban esquema, datos de reservas, y permitían envío de emails con credenciales SMTP).
- ✅ **Rate limiting ampliado** — Añadidas `/api/pricing/calculate`, `/api/creator-collaboration` (5 / 5 min antispam), `/api/bookings/send-email`, `/api/availability/alternatives`, `/api/blog/views`.
- ✅ **Validación de tamaño y tipo en uploads** — `uploadFile()` en `src/lib/supabase/storage.ts` ahora invoca `validateFileSize` (10 MB) y `validateFileType` (JPG/PNG/WebP/GIF) antes de optimizar.
- ✅ **Helper UUID centralizado** — `isValidUUID` movido a `src/lib/utils.ts` y aplicado a `/api/bookings/[id]` y `/api/offers/last-minute/[id]`.
- ✅ **`NEXT_PUBLIC_CALENDAR_TOKEN` eliminado del cliente** — Nuevo endpoint `/api/admin/calendar/subscription-url` (admin-only) devuelve la URL completa. El token solo vive en `CALENDAR_SUBSCRIPTION_TOKEN` server-side.

**Acciones manuales pendientes del admin (fuera del código):**
- 🟠 Rotar `CALENDAR_SUBSCRIPTION_TOKEN` en Vercel (recomendado). Ya puede eliminarse `NEXT_PUBLIC_CALENDAR_TOKEN` del proyecto de Vercel sin romper nada.
- 🟠 Migrar rate-limit a Upstash Redis (requiere crear cuenta Upstash y compartir las credenciales para integrar).
- 🟡 Revisar CSP (quitar `unsafe-eval`).
- 🟡 Decisión de producto: ¿`/api/bookings/[id]` debería devolver datos personales completos (DNI, driver_license, dirección) solo a admins? Actualmente cualquiera con el UUID de la reserva accede.
- 🟡 `npm audit` mensual.
- 🟡 Revisar Supabase Advisor mensualmente.

**Cierres de la tanda anterior (auditoría Supabase Security Advisor):**
- ✅ **Privilege escalation en `admins`** — policies permisivas `INSERT`/`DELETE` eliminadas.
- ✅ **Listado de buckets públicos** (`blog`, `extras`, `media`, `vehicles`) restringido a `authenticated`.
- ✅ **Search-path injection (46 funciones)** — todas con `SET search_path = public, pg_temp`.
- ✅ **Leaked Password Protection** activado en Supabase Auth.

---

## ⚠️⚠️⚠️ PRINCIPIO ABSOLUTO - LEER ANTES DE IMPLEMENTAR ⚠️⚠️⚠️

### 🛡️ **LO MÁS IMPORTANTE: NO AFECTAR LA FUNCIONALIDAD**

**TODAS las correcciones pendientes DEBEN seguir estos principios:**

1. ✅ **Cambios ADITIVOS únicamente** - Solo agregar validaciones, NO modificar lógica existente
2. ✅ **Modo MONITOREO primero** - Primero solo loggear, después de verificar que funciona, activar bloqueo
3. ✅ **Fallbacks SEGUROS** - Si algo falla, el sistema funciona como antes
4. ✅ **Pruebas ANTES de activar** - Monitorear 48-72 horas antes de bloquear nada
5. ✅ **Reversibilidad TOTAL** - Cualquier cambio debe poder revertirse fácilmente

**❌ NUNCA:**
- ❌ Modificar lógica de pagos existente
- ❌ Cambiar flujos de reservas
- ❌ Afectar APIs públicas sin fallback
- ❌ Bloquear sin monitorear primero
- ❌ Cambiar comportamiento sin pruebas

**📖 Ver**: [`CORRECCIONES-SEGURAS-SIN-AFECTAR.md`](./CORRECCIONES-SEGURAS-SIN-AFECTAR.md) para la estrategia completa

---

## 📊 RESUMEN DE ESTADO (actualizado 17 abr 2026 tarde)

| Prioridad | Total | Corregidas | Pendientes | % Completado |
|-----------|-------|------------|------------|--------------|
| 🔴 **Críticas** | 8 | 8 | **0** | 100% ✅ |
| 🟠 **Altas** | 5 | 3 | **2** | 60% ✅ |
| 🟡 **Medias** | 7 | 1 | **6** | 14% ⏳ |
| **TOTAL** | **20** | **12** | **8** | **60%** |

> Las pendientes restantes son mayoritariamente acciones de infraestructura externa (Vercel, Upstash) o decisiones de producto, no cambios de código puros.

---

## 🔴 VULNERABILIDADES CRÍTICAS PENDIENTES (3)

### 1. ⚠️ VALIDACIÓN DE IP EN WEBHOOKS REDSYS

**Ubicación**: `src/app/api/redsys/notification/route.ts`

**Estado Actual**:
```typescript
// ❌ ACTUAL: No valida que la petición viene de Redsys
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  // No hay validación de IP origen ni headers específicos
}
```

**Riesgo**:
- 🔴 Cualquiera puede enviar notificaciones falsas
- 🔴 Posible manipulación de pagos
- 🔴 Ataques de replay

**Solución Propuesta**:
```typescript
// ✅ PROPUESTO: Validar IP origen de Redsys
const REDSYS_IPS = [
  '195.76.9.97',   // IP oficial Redsys
  '195.76.9.98',   // IP oficial Redsys (backup)
];

const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

// Modo seguro: Primero solo loggear, después activar bloqueo
if (clientIP && !REDSYS_IPS.includes(clientIP)) {
  console.warn('⚠️ [SEGURIDAD] Webhook desde IP no reconocida:', {
    ip: clientIP,
    expectedIPs: REDSYS_IPS,
    timestamp: new Date().toISOString(),
  });
  // TODO: Después de verificar que funciona, activar bloqueo:
  // return NextResponse.json({ error: 'Unauthorized IP' }, { status: 403 });
}
```

**Implementación Segura** (⚠️ **SIN AFECTAR FUNCIONALIDAD**):
1. ✅ **PASO 1**: Solo loggear IPs no reconocidas (modo monitoreo) - **CERO impacto**
2. ⏳ **PASO 2**: Monitorear por 48-72 horas - Verificar que Redsys siempre viene de las IPs correctas
3. ⏳ **PASO 3**: Solo DESPUÉS de confirmar, activar bloqueo (si es necesario)
4. ✅ **GARANTÍA**: Si algo falla, simplemente no loggeamos y funciona igual que antes

**⚠️ IMPORTANTE**: 
- NO bloquear nada hasta confirmar que funciona
- Si Redsys viene de IPs diferentes, ajustar la lista ANTES de bloquear
- El código debe tener fallback seguro

**Prioridad**: 🔴 **ALTA** - Implementar esta semana (modo monitoreo primero)

---

### 2. ⚠️ PROTECCIÓN CSRF EN APIS PÚBLICAS

**Ubicación**: Todas las rutas `/api/*` excepto webhooks

**Estado Actual**:
```typescript
// ❌ ACTUAL: No hay protección CSRF
export async function POST(request: NextRequest) {
  // Cualquiera puede llamar desde cualquier origen
  const body = await request.json();
  // ...
}
```

**Riesgo**:
- 🔴 Ataques CSRF desde sitios maliciosos
- 🔴 Creación de reservas falsas
- 🔴 Manipulación de datos sin consentimiento del usuario

**Solución Propuesta**:
```typescript
// ✅ PROPUESTO: Implementar protección CSRF
import { validateCSRFToken } from '@/lib/security/csrf';

export async function POST(request: NextRequest) {
  // Validar token CSRF (excepto webhooks que tienen su propia validación)
  const csrfToken = request.headers.get('x-csrf-token');
  const origin = request.headers.get('origin');
  
  if (!validateCSRFToken(csrfToken, origin)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' }, 
      { status: 403 }
    );
  }
  
  // Continuar con la lógica normal...
}
```

**Archivos a Crear**:
- ⏳ `src/lib/security/csrf.ts` - Validación de tokens CSRF
- ⏳ Actualizar formularios para incluir tokens CSRF

**Implementación Segura** (⚠️ **SIN AFECTAR FUNCIONALIDAD**):
1. ✅ **PASO 1**: Implementar validación pero con modo "advertencia" primero (solo loggear)
2. ⏳ **PASO 2**: Monitorear por 1-2 semanas que todos los formularios incluyen tokens
3. ⏳ **PASO 3**: Solo DESPUÉS de confirmar, activar bloqueo real
4. ✅ **GARANTÍA**: Si falta token, primero solo advertir, no bloquear inmediatamente

**⚠️ IMPORTANTE**: 
- Los formularios existentes deben seguir funcionando durante la transición
- Implementar gradualmente, no todo de golpe
- Tener modo "permitir sin token" temporalmente para no romper nada

**Prioridad**: 🔴 **ALTA** - Implementar en próximas 2 semanas (modo advertencia primero)

---

### 3. ⚠️ RATE LIMITING INSUFICIENTE

**Ubicación**: `src/middleware.ts:55-60`

**Estado Actual**:
```typescript
// ⚠️ ACTUAL: Solo 4 rutas protegidas
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  '/api/customers': { limit: 10, window: 60 },
  '/api/bookings/create': { limit: 10, window: 60 },
  '/api/availability': { limit: 60, window: 60 },
  '/api/admin/check-auth': { limit: 30, window: 60 },
  // ❌ Faltan: /api/redsys/initiate, /api/stripe/initiate, etc.
};
```

**Riesgo**:
- 🔴 APIs de pago sin rate limiting
- 🔴 Posible DoS en endpoints críticos
- 🔴 Abuso de APIs públicas

**Solución Propuesta**:
```typescript
// ✅ PROPUESTO: Ampliar rate limiting
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  // Rutas existentes (mantener)
  '/api/customers': { limit: 10, window: 60 },
  '/api/bookings/create': { limit: 10, window: 60 },
  '/api/availability': { limit: 60, window: 60 },
  '/api/admin/check-auth': { limit: 30, window: 60 },
  
  // ✅ NUEVAS: Rutas de pago (límites generosos)
  '/api/redsys/initiate': { limit: 20, window: 60 },      // 20 pagos/minuto
  '/api/redsys/notification': { limit: 100, window: 60 },  // Webhooks pueden ser muchos
  '/api/stripe/initiate': { limit: 20, window: 60 },
  '/api/stripe/webhook': { limit: 100, window: 60 },
  
  // ✅ NUEVAS: Otras APIs públicas
  '/api/coupons/validate': { limit: 30, window: 60 },
  '/api/search-tracking': { limit: 60, window: 60 },
};
```

**Implementación Segura** (⚠️ **SIN AFECTAR FUNCIONALIDAD**):
- ✅ **Límites generosos** - 20 pagos/minuto es más que suficiente para uso normal
- ✅ **Solo agregar rutas** - No modificar límites existentes
- ✅ **Sin impacto** - Los usuarios legítimos nunca alcanzan estos límites
- ✅ **Reversible** - Si hay problemas, simplemente aumentar límites o quitar rutas

**⚠️ IMPORTANTE**: 
- Los límites deben ser MUY generosos para no afectar uso normal
- Si hay quejas de usuarios legítimos, aumentar límites inmediatamente
- Monitorear logs después de implementar para verificar que no hay bloqueos incorrectos

**Prioridad**: 🔴 **MEDIA** - Implementar esta semana (límites generosos)

---

## 🟠 VULNERABILIDADES ALTAS PENDIENTES (5)

### 4. ⚠️ CSP CON 'unsafe-inline' Y 'unsafe-eval'

**Ubicación**: `next.config.js:130`

**Estado Actual**:
```javascript
// ⚠️ ACTUAL: CSP permisivo
script-src 'self' 'unsafe-inline' 'unsafe-eval' ...
```

**Riesgo**: Reduce protección contra XSS

**Solución**: Usar nonces o hashes para scripts inline

**Prioridad**: 🟠 **MEDIA** - Implementar próximo mes

---

### 5. ⚠️ FALTA VALIDACIÓN DE TAMAÑO DE ARCHIVOS

**Ubicación**: APIs que reciben archivos (media uploads)

**Estado Actual**: No hay límite de tamaño en uploads

**Riesgo**: DoS por archivos grandes

**Solución Propuesta**:
```typescript
// ✅ PROPUESTO: Validar tamaño máximo
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json(
    { error: 'File too large. Maximum size: 10MB' },
    { status: 400 }
  );
}
```

**Implementación Segura** (⚠️ **SIN AFECTAR FUNCIONALIDAD**):
- ✅ **Límite generoso** - 10MB es más que suficiente para imágenes normales
- ✅ **Validación temprana** - Rechazar ANTES de procesar (ahorra recursos)
- ✅ **Mensaje claro** - Usuario sabe qué hacer si el archivo es muy grande
- ✅ **Sin impacto** - Los archivos normales (fotos) son mucho menores a 10MB

**⚠️ IMPORTANTE**: 
- Verificar tamaño ANTES de subir a Supabase (ahorra tiempo y dinero)
- Si hay necesidad de archivos más grandes, aumentar límite fácilmente
- No afecta archivos ya subidos

**Prioridad**: 🟠 **MEDIA** - Implementar próximas 2 semanas (límite generoso)

---

### 6. ⚠️ COOKIES SIN SAMESITE STRICT

**Ubicación**: Autenticación Supabase

**Estado Actual**: Cookies pueden ser enviadas en requests cross-site

**Riesgo**: Ataques CSRF

**Solución**: Configurar SameSite=Strict en cookies de autenticación

**Prioridad**: 🟠 **BAJA** - Implementar próximo mes

---

### 7. ⚠️ FALTA VALIDACIÓN DE UUIDs

**Ubicación**: APIs que reciben UUIDs

**Estado Actual**: No se valida formato de UUID antes de queries

**Riesgo**: SQL injection (aunque Supabase lo previene)

**Solución Propuesta**:
```typescript
// ✅ PROPUESTO: Validar formato UUID
import { validateUUID } from '@/lib/security/validation';

if (!validateUUID(bookingId)) {
  return NextResponse.json(
    { error: 'Invalid ID format' },
    { status: 400 }
  );
}
```

**Prioridad**: 🟠 **BAJA** - Implementar próximo mes

---

### 8. ⚠️ STACK TRACES EN ERRORES

**Ubicación**: Múltiples APIs

**Estado Actual**: Stack traces expuestos en producción

**Riesgo**: Información sobre estructura del código

**Solución**: Ocultar stack traces en producción (ya parcialmente implementado)

**Prioridad**: 🟠 **BAJA** - Completar próximas 2 semanas

---

## 🟡 VULNERABILIDADES MEDIAS PENDIENTES (7)

### 9. Headers de Seguridad Faltantes
- ⏳ Falta `X-Permitted-Cross-Domain-Policies`
- ⏳ Falta `Cross-Origin-Embedder-Policy`

**Prioridad**: 🟡 **BAJA** - Implementar próximo mes

---

### 10. Logs Excesivos en Producción
- ⏳ Muchos `console.log` que deberían estar solo en desarrollo
- ⏳ Ya se corrigieron los críticos, faltan los menos importantes

**Prioridad**: 🟡 **BAJA** - Limpiar gradualmente

---

### 11. Falta Rotación de Secretos
- ⏳ No hay proceso de rotación de tokens y secretos
- ⏳ Debería rotarse cada 90 días

**Prioridad**: 🟡 **BAJA** - Implementar proceso manual primero

---

### 12. Validación de Email Débil
- ⏳ Solo valida formato, no existencia
- ⏳ Podría mejorarse con verificación de dominio

**Prioridad**: 🟡 **BAJA** - Mejora opcional

---

### 13. Falta Rate Limiting por Usuario
- ⏳ Solo por IP, puede ser evadido con VPN
- ⏳ Implementar rate limiting por sesión/usuario autenticado

**Prioridad**: 🟡 **BAJA** - Mejora futura

---

### 14. CORS Configuración Permisiva
- ⏳ Permite cualquier origen en algunas APIs
- ⏳ Restringir a dominios conocidos

**Prioridad**: 🟡 **BAJA** - Revisar y ajustar

---

### 15. Falta Monitoreo de Seguridad
- ⏳ No hay alertas de intentos de ataque
- ⏳ Implementar logging de eventos de seguridad

**Prioridad**: 🟡 **BAJA** - Implementar sistema de alertas

---

## 📋 PLAN DE IMPLEMENTACIÓN PRIORIZADO

### ⚠️⚠️⚠️ RECORDATORIO CRÍTICO ⚠️⚠️⚠️
**TODAS las implementaciones deben seguir el principio: NO AFECTAR FUNCIONALIDAD**
- Modo monitoreo primero
- Límites generosos
- Fallbacks seguros
- Reversible fácilmente

### 🔴 FASE 1: Críticas Pendientes (Esta Semana)
1. ⏳ **Validación IP en webhooks** - ⚠️ Modo monitoreo primero (solo loggear)
2. ⏳ **Ampliar rate limiting** - ⚠️ Límites generosos (20/min es más que suficiente)
3. ⏳ **Protección CSRF** - ⚠️ Modo advertencia primero (no bloquear inmediatamente)

### 🟠 FASE 2: Altas (Próximas 2 Semanas)
4. ⏳ Validar tamaño de archivos
5. ⏳ Ocultar stack traces completamente
6. ⏳ Validar UUIDs

### 🟡 FASE 3: Medias (Próximo Mes)
7. ⏳ Mejorar CSP (eliminar unsafe-inline)
8. ⏳ Agregar headers faltantes
9. ⏳ Configurar SameSite en cookies
10. ⏳ Reducir logs en producción
11. ⏳ Implementar rotación de secretos
12. ⏳ Mejorar validación de email
13. ⏳ Rate limiting por usuario
14. ⏳ Configurar CORS estricto
15. ⏳ Implementar monitoreo

---

## ✅ LO QUE YA ESTÁ CORREGIDO

### Vulnerabilidades Críticas Corregidas (8/8) ✅
1. ✅ **Logs sensibles eliminados** — Solo en desarrollo.
2. ✅ **Token hardcodeado eliminado** — `CALENDAR_SUBSCRIPTION_TOKEN` en variable de entorno.
3. ✅ **Errores genéricos en producción** — Mensajes genéricos (sin stack traces) en producción.
4. ✅ **Datos admin minimizados** — `/api/admin/check-auth` solo devuelve `{isAdmin: boolean}`.
5. ✅ **Validación de montos Redsys (modo monitoreo)** — Activada en abril 2026.
6. ✅ **Bloqueo de importe Redsys** — `/api/redsys/initiate` rechaza importes manipulados (17 abr 2026).
7. ✅ **Recálculo de precios servidor** — `/api/bookings/create` rechaza `total_price` manipulado (17 abr 2026).
8. ✅ **Endpoints de test/debug cerrados** — `/api/test-*`, `/api/debug/schema` requieren admin (17 abr 2026).

### Vulnerabilidades Altas Corregidas (3/5)
9. ✅ **Rate limiting ampliado** — Añadidas rutas de pagos, cupones, contacto, pricing, emails.
10. ✅ **Validación de tamaño y tipo en uploads** — `uploadFile` aplica límites.
11. ✅ **Helper UUID centralizado** — `isValidUUID` en `src/lib/utils.ts` + aplicado en rutas dinámicas públicas.

### Vulnerabilidades Medias Corregidas (1/7)
12. ✅ **`NEXT_PUBLIC_CALENDAR_TOKEN` eliminado del cliente** — Reemplazado por endpoint admin-only.

---

## 🎯 RECOMENDACIONES INMEDIATAS

### ⚠️ TODAS CON PRINCIPIO: NO AFECTAR FUNCIONALIDAD ⚠️

### Esta Semana:
1. 🔴 **Validar IP en webhooks** - ⚠️ **SOLO MODO MONITOREO** (loggear, NO bloquear)
2. 🔴 **Ampliar rate limiting** - ⚠️ **LÍMITES GENEROSOS** (20/min, más que suficiente)

### Próximas 2 Semanas:
3. 🔴 **Implementar protección CSRF** - ⚠️ **MODO ADVERTENCIA PRIMERO** (no bloquear inmediatamente)
4. 🟠 **Validar tamaño de archivos** - ⚠️ **LÍMITE GENEROSO** (10MB es más que suficiente)

### Próximo Mes:
5. 🟠 **Ocultar stack traces completamente** - ⚠️ Solo cambiar mensajes, no lógica
6. 🟠 **Validar UUIDs** - ⚠️ Validación temprana, rechazo claro, sin impacto en válidos
7. 🟡 **Mejorar CSP** - ⚠️ Cambios graduales, probar que todo sigue funcionando

---

## 📊 PROGRESO GENERAL

```
Correcciones Completadas: ████████████░░░░░░░░ 60%
Críticas Pendientes:       ░░░░░░░░░░░░░░░░░░░░  0%
Altas Pendientes:         ████░░░░░░░░░░░░░░░░ 20%
Medias Pendientes:        ████████████░░░░░░░░ 60%
```

**Total**: 12 de 20 vulnerabilidades corregidas (60%)

---

---

## ✅ GARANTÍAS DE IMPLEMENTACIÓN

### 🛡️ Garantía #1: Cero Cambios en Funcionalidad
- Todas las correcciones son **aditivas** (solo agregan validaciones)
- No modifican lógica existente
- No cambian flujos de pago
- No afectan APIs públicas

### 🛡️ Garantía #2: Modo Seguro Primero
- Primero solo **loggear/monitorear**
- Después de verificar que funciona, **activar bloqueos**
- Cada corrección se prueba individualmente
- Si algo falla, se revierte inmediatamente

### 🛡️ Garantía #3: Fallbacks Seguros
- Si algo falla, el sistema funciona como antes
- Validaciones tienen modo "solo loggear" antes de bloquear
- Límites son generosos para no afectar uso normal
- Todo es reversible fácilmente

---

**Última actualización**: 17 de abril, 2026 (tarde)  
**Próxima revisión**: 17 de mayo, 2026  
**Principio absoluto**: 🛡️ **NO AFECTAR FUNCIONALIDAD**
