# Sistema de Envío de Emails - Furgocasa

## 📧 Descripción General

Este documento describe el sistema completo de envío de correos electrónicos implementado en la aplicación Furgocasa. El sistema envía notificaciones automáticas tanto a los clientes como a la empresa en los momentos clave del proceso de reserva.

**Tecnología:** SMTP via Nodemailer (compatible con OVH y cualquier servidor SMTP)

## 🎯 Momentos de Envío

### 1. Reserva Creada (Pendiente de Pago)
**Cuándo:** Cuando un cliente completa el formulario de reserva y se crea en la base de datos.

**Quién recibe:**
- ✉️ **Cliente:** Email con detalles de la reserva y enlace para proceder al pago
- ✉️ **Empresa (reservas@furgocasa.com):** Notificación de nueva reserva pendiente

**Archivo:** `src/app/reservar/nueva/page.tsx`

### 2. Primer Pago Confirmado
**Cuándo:** Cuando Redsys notifica que se ha completado el primer pago (puede ser 50% o 100%).

**Quién recibe:**
- ✉️ **Cliente:** Confirmación de pago y reserva confirmada
- ✉️ **Empresa:** Notificación de pago recibido

**Archivo:** `src/app/api/redsys/notification/route.ts`

### 3. Segundo Pago Confirmado
**Cuándo:** Cuando el cliente completa el pago del 50% restante.

**Quién recibe:**
- ✉️ **Cliente:** Confirmación de pago completo con recordatorios para el día de recogida
- ✉️ **Empresa:** Notificación de pago completo

**Archivo:** `src/app/api/redsys/notification/route.ts`

## 📁 Estructura de Archivos

```
src/
├── lib/
│   └── email/
│       ├── index.ts              # Funciones principales de envío
│       ├── smtp-client.ts        # Cliente SMTP (Nodemailer)
│       └── templates.ts          # Plantillas HTML de emails (4 plantillas)
└── app/
    └── api/
        ├── bookings/
        │   └── send-email/
        │       └── route.ts      # API endpoint para envío de emails
        ├── cron/
        │   └── return-reminders/
        │       └── route.ts      # Cron: recordatorio de devolución (diario 18:00 UTC)
        ├── test-email/
        │   └── route.ts          # Endpoint de prueba SMTP
        └── test-return-reminder/
            └── route.ts          # Endpoint de prueba recordatorio (temporal)
```

## 🔧 Configuración

### Variables de Entorno Requeridas

Añade las siguientes variables a tu archivo `.env.local`:

```env
# ==========================================
# SMTP (OVH u otro proveedor)
# ==========================================
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=465
SMTP_USER=reservas@furgocasa.com
SMTP_PASSWORD=tu-contraseña-del-buzon

# Email remitente
SMTP_FROM_EMAIL=reservas@furgocasa.com
SMTP_FROM_NAME=Furgocasa

# Email de la empresa (para recibir notificaciones)
COMPANY_EMAIL=reservas@furgocasa.com

# URL de la aplicación (para producción)
NEXT_PUBLIC_APP_URL=https://furgocasa.com
```

### Configurar SMTP en OVH

1. **Accede a tu panel de OVH** → Webmail / Emails
2. **Crea el buzón** `reservas@furgocasa.com` si no existe
3. **Anota la contraseña** del buzón
4. **Datos del servidor SMTP de OVH:**
   - **Host:** `ssl0.ovh.net`
   - **Puerto SSL:** `465`
   - **Puerto TLS:** `587`
   - **Usuario:** Email completo (ej: `reservas@furgocasa.com`)
   - **Contraseña:** La del buzón

### Probar la Configuración

Una vez configuradas las variables de entorno, puedes probar:

```bash
# Solo verificar conexión SMTP
curl http://localhost:3000/api/test-email?verify=true

# Enviar email de prueba
curl http://localhost:3000/api/test-email?to=tu-email@ejemplo.com
```

## 📋 Funciones Principales

### `sendBookingCreatedEmail()`
Envía email cuando se crea una reserva (pendiente de pago).

```typescript
import { sendBookingCreatedEmail } from '@/lib/email';

await sendBookingCreatedEmail(customerEmail, {
  bookingNumber: 'FG12345678',
  customerName: 'Juan Pérez',
  vehicleName: 'Camper Volkswagen California',
  pickupDate: '2026-06-15',
  dropoffDate: '2026-06-22',
  // ... más datos
});
```

### `sendFirstPaymentConfirmedEmail()`
Envía email cuando se confirma el primer pago.

```typescript
import { sendFirstPaymentConfirmedEmail } from '@/lib/email';

await sendFirstPaymentConfirmedEmail(customerEmail, bookingData);
```

### `sendSecondPaymentConfirmedEmail()`
Envía email cuando se completa el segundo pago.

```typescript
import { sendSecondPaymentConfirmedEmail } from '@/lib/email';

await sendSecondPaymentConfirmedEmail(customerEmail, bookingData);
```

## 🎨 Plantillas de Email

Todas las plantillas están en `src/lib/email/templates.ts` y siguen un diseño consistente:

- **Header:** Logo y nombre de Furgocasa con degradado naranja
- **Contenido:** Información específica de la reserva
- **Detalles:** Boxes con información estructurada
- **Botones CTA:** Enlaces a la reserva o al panel de administración
- **Footer:** Información de contacto y disclaimer

### Colores de la Marca
- **Naranja principal:** `#f97316`
- **Azul principal:** `#1e3a8a`
- **Verde (éxito):** `#10b981`
- **Amarillo (warning):** `#f59e0b`

## 🔄 Flujo de Integración

### En el Frontend (Cliente)

```typescript
// Al crear una reserva
try {
  await fetch('/api/bookings/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'booking_created',
      bookingId: booking.id,
    }),
  });
} catch (error) {
  console.error('Error enviando email:', error);
  // No bloquear el proceso
}
```

### En el Backend (Notificación de Redsys)

```typescript
// Al recibir confirmación de pago
const isFirstPayment = currentPaid === 0;
const emailType = isFirstPayment ? 'first_payment' : 'second_payment';

await fetch('/api/bookings/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: emailType,
    bookingId: payment.booking_id,
  }),
});
```

## 🧪 Testing

### Modo de Desarrollo

Durante el desarrollo, puedes usar:

```env
# Email de prueba (recibirás los emails en tu inbox)
RESEND_FROM_EMAIL=onboarding@resend.dev
COMPANY_EMAIL=tu-email@ejemplo.com
```

### Test Manual

1. Crea una reserva de prueba en la aplicación
2. Verifica que recibes el email de "Reserva creada"
3. Completa un pago de prueba con Redsys
4. Verifica que recibes el email de "Pago confirmado"

### Logs

Los emails dejan logs en consola:

```
✅ Email de reserva creada enviado al cliente: { id: '...' }
✅ Notificación de reserva enviada a la empresa: { id: '...' }
📧 Enviando email de tipo: first_payment
```

## ⚠️ Manejo de Errores

El sistema está diseñado para **no bloquear** el proceso de reserva si falla el envío de emails:

```typescript
try {
  await sendEmail(...);
} catch (emailError) {
  console.error('Error enviando email:', emailError);
  // No se lanza el error, el proceso continúa
}
```

### Logs de Errores

```
❌ Error enviando email de reserva creada: [error message]
```

## 📊 Monitoreo

### En Resend Dashboard

1. Ve a "Logs" para ver todos los emails enviados
2. Revisa el estado: `Delivered`, `Bounced`, `Failed`
3. Ve detalles de cada email (opens, clicks, etc.)

### En la Aplicación

Los logs de consola te permiten rastrear:
- Cuándo se intentó enviar un email
- Si fue exitoso o falló
- El ID del email en Resend

## 🔒 Seguridad

- ✅ La API Key de Resend está en variables de entorno
- ✅ Los emails se envían desde el servidor (nunca desde el cliente)
- ✅ Se valida el `bookingId` antes de enviar
- ✅ Solo se pueden enviar 3 tipos de emails predefinidos

## 🚀 Producción

### Checklist antes de ir a producción:

- [ ] Configurar dominio en Resend y verificar DNS
- [ ] Actualizar `RESEND_FROM_EMAIL` con email del dominio verificado
- [ ] Actualizar `COMPANY_EMAIL` con el email real de la empresa
- [ ] Actualizar `NEXT_PUBLIC_APP_URL` con la URL de producción
- [ ] Verificar que los enlaces en los emails apuntan a la URL correcta
- [ ] Hacer pruebas de envío completo en producción
- [ ] Monitorear los primeros envíos en el dashboard de Resend

## 📞 Soporte

Si tienes problemas con el envío de emails:

1. Verifica que las variables de entorno estén configuradas
2. Revisa los logs de consola para errores específicos
3. Comprueba el dashboard de Resend para ver el estado de los envíos
4. Verifica que el dominio esté correctamente verificado en Resend

### 4. Recordatorio de Devolución (víspera del dropoff)
**Cuándo:** Automático, cada día a las 20:00 h (Madrid) vía Vercel Cron.

**Quién recibe:**
- ✉️ **Cliente:** Recordatorio con fecha/hora/lugar de devolución y tabla de penalizaciones (idéntica a la web)
- ✉️ **Empresa (reservas@furgocasa.com):** Copia del mismo email

**Archivo cron:** `src/app/api/cron/return-reminders/route.ts`
**Plantilla:** `getReturnReminderTemplate()` en `src/lib/email/templates.ts`
**Cron schedule:** `0 18 * * *` (18:00 UTC = 20:00 Madrid verano / 19:00 invierno) en `vercel.json`

**Idempotencia:** columna `bookings.return_reminder_sent` (boolean). Una vez enviado, no se reenvía aunque el cron se ejecute de nuevo.

**Contenido del email:**
- Datos de devolución (reserva, fecha, hora, lugar, dirección)
- Sección "Devolución del vehículo: obligatorio" con chips y tabla de 3 columnas (requisito / incumplimiento / importe IVA incl.), importes idénticos a la web:
  - Limpieza interior: desde 120 €
  - Aguas grises: 20 €
  - WC químico: 70 €
  - Puntualidad: 40 € (1.ª h) + 20 €/h
- Nota sobre devolución de fianza (1.000 €, 10 días laborables)
- Consejo de preparación (mínimo 1 h antes)
- CTA a `furgocasa.com/es/tarifas#devolucion-vehiculo`

**Compatibilidad:** HTML basado en tablas, sin emojis Unicode, sin border-radius, chips como celdas de tabla, `mso-padding-alt` para Outlook. Hereda la base template del resto de emails.

**Migración SQL requerida:**
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_reminder_sent BOOLEAN NOT NULL DEFAULT FALSE;
```
Archivo: `supabase/migrations/20260323-add-return-reminder-sent.sql`

**Endpoint de prueba (temporal):** `GET /api/test-return-reminder?booking=FC26010043&to=info@furgocasa.com`

## 🎉 Funcionalidades Adicionales Posibles

Ideas para futuras mejoras:

- [x] ~~Email de recordatorio de devolución la víspera~~ ✅ Implementado (marzo 2026)
- [ ] Email de recordatorio 7 días antes de la recogida
- [ ] Email de recordatorio para el segundo pago
- [ ] Email de agradecimiento después de la devolución
- [ ] Email con encuesta de satisfacción
- [ ] Emails en múltiples idiomas según el usuario
- [ ] Templates personalizados por vehículo
- [ ] Sistema de preferencias de notificaciones del cliente

---

**Última actualización:** 23 de marzo de 2026
**Versión:** 1.1.0
