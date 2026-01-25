# 🧪 Guía de Pruebas - Sistema de Emails

## 🚀 Prueba Rápida de Configuración

### Paso 1: Configurar Variables de Entorno

Crea o actualiza tu archivo `.env.local`:

```env
# Resend API (OBLIGATORIO)
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=onboarding@resend.dev  # Para pruebas, usa el dominio de Resend
COMPANY_EMAIL=tu-email@ejemplo.com       # Tu email personal para recibir notificaciones

# Resto de variables necesarias
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
REDSYS_MERCHANT_CODE=999008881
REDSYS_TERMINAL=001
REDSYS_SECRET_KEY=sq7HjrUOBfKmC576ILgskD5srU870gJ7
REDSYS_ENVIRONMENT=test
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Paso 2: Test Inicial de Resend

Visita en tu navegador:

```
http://localhost:3000/api/test-email
```

O especifica un email destino:

```
http://localhost:3000/api/test-email?to=tu-email@ejemplo.com
```

**✅ Resultado esperado:**
- JSON con `success: true`
- Email recibido en tu bandeja de entrada
- Verificar que el email se vea correctamente

**❌ Si falla:**
- Verifica que `RESEND_API_KEY` esté configurada
- Revisa la consola del servidor para ver el error
- Asegúrate de haber guardado el archivo `.env.local`
- Reinicia el servidor de desarrollo (`npm run dev`)

### Paso 3: Test del Flujo Completo de Reserva

#### 3.1. Crear una Reserva

1. Inicia el servidor: `npm run dev`
2. Ve a `http://localhost:3000`
3. Busca un vehículo disponible
4. Completa el formulario de reserva
5. Envía la reserva

**✅ Resultado esperado:**
- Reserva creada en la base de datos
- Email recibido en el email del cliente
- Email recibido en `COMPANY_EMAIL`
- Ambos emails con el título "Reserva FGxxxxxxxx creada"

**Logs esperados en consola:**
```
✅ Email de reserva creada enviado al cliente: { id: '...' }
✅ Notificación de reserva enviada a la empresa: { id: '...' }
```

#### 3.2. Completar el Primer Pago

1. Desde la página de la reserva, haz clic en "Pagar"
2. Completa el pago con tarjeta de prueba de Redsys:
   - **Tarjeta:** 4548 8120 4940 0004
   - **Fecha:** Cualquier fecha futura
   - **CVV:** 123
3. Espera la confirmación de Redsys

**✅ Resultado esperado:**
- Redirección a página de éxito
- Email de confirmación de pago recibido
- Email de notificación a la empresa
- Estado de la reserva actualizado a "confirmed"

**Logs esperados en consola:**
```
✅ Reserva actualizada: amount_paid=XXX, payment_status=partial
📧 Enviando email de tipo: first_payment
✅ Email de primer pago confirmado enviado al cliente
```

#### 3.3. Completar el Segundo Pago

1. Ve de nuevo a la página de la reserva
2. Haz clic en "Completar pago" (50% restante)
3. Completa el pago con tarjeta de prueba
4. Espera confirmación

**✅ Resultado esperado:**
- Email de pago completo recibido
- Email de notificación a la empresa
- Estado actualizado a `payment_status: paid`

**Logs esperados:**
```
✅ Reserva actualizada: amount_paid=TOTAL, payment_status=paid
📧 Enviando email de tipo: second_payment
✅ Email de segundo pago confirmado enviado al cliente
```

## 🔍 Debugging

### Ver Logs en Tiempo Real

Terminal del servidor de desarrollo:
```bash
npm run dev
# Observa los logs que comienzan con ✅, ❌, o 📧
```

### Verificar Estado en Resend

1. Ve a https://resend.com/emails
2. Busca tus emails enviados
3. Revisa el estado: `Delivered`, `Bounced`, o `Failed`
4. Si está `Failed`, revisa los detalles del error

### Errores Comunes y Soluciones

#### Error: "RESEND_API_KEY no está configurada"
**Solución:**
- Verifica que el archivo `.env.local` existe
- Asegúrate de que la variable está sin espacios: `RESEND_API_KEY=re_xxxxx`
- Reinicia el servidor después de añadir variables

#### Error: "Invalid API key"
**Solución:**
- Verifica que copiaste la API key completa desde Resend
- La key debe comenzar con `re_`
- Genera una nueva key en https://resend.com/api-keys

#### Los emails no llegan
**Solución:**
1. Revisa la carpeta de spam
2. Verifica que el email destino es correcto
3. En desarrollo, usa `onboarding@resend.dev` como remitente
4. Revisa el dashboard de Resend para ver el estado del envío

#### Error: "Domain not verified"
**Solución (solo en producción):**
- En desarrollo, usa `onboarding@resend.dev`
- Para producción, verifica tu dominio en Resend:
  1. Ve a https://resend.com/domains
  2. Añade tu dominio
  3. Configura los registros DNS
  4. Espera la verificación

## 📊 Checklist de Testing

- [ ] Test inicial exitoso (`/api/test-email`)
- [ ] Email de reserva creada recibido
- [ ] Email de primer pago recibido
- [ ] Email de segundo pago recibido
- [ ] Emails recibidos en `COMPANY_EMAIL`
- [ ] Emails se ven bien en móvil
- [ ] Emails se ven bien en Gmail
- [ ] Emails se ven bien en Outlook
- [ ] Enlaces en los emails funcionan
- [ ] Logs en consola son claros

## 🎨 Verificar Diseño de Emails

### Gmail
1. Abre el email recibido
2. Verifica que el header naranja se vea correctamente
3. Los botones deben ser naranjas y estar centrados
4. Los precios deben estar resaltados

### Outlook
1. Abre el email en Outlook
2. Verifica que los colores se vean correctamente
3. Las tablas de detalles deben estar alineadas

### Móvil
1. Abre el email en tu móvil
2. Todo el contenido debe ser legible
3. Los botones deben ser fáciles de tocar
4. No debe haber scroll horizontal

## 📝 Notas para Producción

Cuando vayas a producción:

1. **Actualizar variables:**
```env
RESEND_FROM_EMAIL=noreply@furgocasa.com
COMPANY_EMAIL=info@furgocasa.com
NEXT_PUBLIC_APP_URL=https://furgocasa.com
REDSYS_ENVIRONMENT=production
```

2. **Verificar dominio en Resend:**
   - Añade `furgocasa.com` en el dashboard
   - Configura los registros DNS SPF, DKIM, DMARC
   - Espera verificación (puede tardar hasta 72h)

3. **Probar en producción:**
   - Haz una reserva de prueba
   - Verifica que los emails lleguen
   - Monitorea el dashboard de Resend

4. **Monitoreo:**
   - Revisa diariamente el dashboard de Resend
   - Configura alertas para emails fallidos
   - Mantén un registro de envíos importantes

## 🆘 Soporte

Si tienes problemas:

1. **Revisa la documentación:** `SISTEMA-EMAILS.md`
2. **Revisa los logs:** Consola del servidor
3. **Revisa Resend:** https://resend.com/emails
4. **Verifica el código:** Todos los archivos están en `src/lib/email/`

---

**Última actualización:** 19 de enero de 2026
