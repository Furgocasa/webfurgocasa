=================================================================
ACTUALIZACIÓN POST-MIGRACIÓN A www.furgocasa.com
Fecha: 20 de enero de 2026
=================================================================

## ✅ MIGRACIÓN COMPLETADA

La aplicación ha migrado exitosamente de:
- ❌ `webfurgocasa.vercel.app` (URL temporal de Vercel)
- ✅ `www.furgocasa.com` (URL de producción definitiva)

## 🔄 CAMBIOS NECESARIOS EN CONFIGURACIONES

=================================================================
1. STRIPE - WEBHOOK URL (CRÍTICO)
=================================================================

### 📍 Ubicación: Stripe Dashboard → Developers → Webhooks

**ANTES:**
```
https://webfurgocasa.vercel.app/api/stripe/webhook
```

**AHORA (ACTUALIZAR):**
```
https://www.furgocasa.com/api/stripe/webhook
```

### ✅ Cómo actualizar:

1. Ve a https://dashboard.stripe.com/webhooks
2. Encuentra tu webhook actual
3. Haz clic en **"..."** (menú) → **"Update details"**
4. Cambia la URL a: `https://www.furgocasa.com/api/stripe/webhook`
5. **Guarda**

⚠️ **IMPORTANTE**: Si no actualizas esto, los webhooks de Stripe NO llegarán
y los pagos quedarán en estado "pending" indefinidamente.

=================================================================
2. REDSYS - URL DE CALLBACK (CRÍTICO)
=================================================================

### 📍 Ubicación: Panel de administración de Redsys

**ANTES:**
```
https://webfurgocasa.vercel.app
```

**AHORA (ACTUALIZAR):**
```
https://www.furgocasa.com
```

### ✅ Cómo actualizar:

1. Contacta con soporte de Redsys: soporte.comercios@redsys.es
2. Solicita actualizar las URLs de callback/notificación a:
   - URL OK: `https://www.furgocasa.com/pago/exito`
   - URL KO: `https://www.furgocasa.com/pago/error`
   - URL de notificación: `https://www.furgocasa.com/api/redsys/notification`

3. Pregunta específicamente sobre:
   - Error SIS0042 (si aún persiste)
   - Autorización del nuevo dominio www.furgocasa.com
   - Configuración del terminal 001

=================================================================
3. VARIABLES DE ENTORNO EN VERCEL (OPCIONAL)
=================================================================

### 📍 Ubicación: Vercel Dashboard → Settings → Environment Variables

Aunque técnicamente no es necesario cambiar las URLs en las variables
de entorno (porque la app escucha en el dominio que le llegue), 
PODRÍAS actualizar si tienes variables como:

```env
NEXT_PUBLIC_SITE_URL=https://www.furgocasa.com
NEXT_PUBLIC_BASE_URL=https://www.furgocasa.com
```

Verifica que apunten a `www.furgocasa.com` y no a `webfurgocasa.vercel.app`

=================================================================
4. META PIXEL - DOMINIO VERIFICADO (OPCIONAL)
=================================================================

### 📍 Ubicación: Meta Business Suite → Settings → Domains

Si tienes Meta Pixel configurado:

1. Ve a https://business.facebook.com/
2. Settings → Domains
3. Verifica que `www.furgocasa.com` esté añadido y verificado
4. El TXT de verificación ya está en tus DNS:
   ```
   facebook-domain-verification=038n6pvvpp7ts3tp9z9n8tohwm77et
   ```

=================================================================
5. GOOGLE SEARCH CONSOLE (IMPORTANTE)
=================================================================

### 📍 Ubicación: Google Search Console

**ACCIÓN NECESARIA:**

1. Ve a https://search.google.com/search-console
2. Añade `www.furgocasa.com` como nueva propiedad
3. Verifica usando el método DNS TXT (ya está configurado):
   ```
   google-site-verification=XdSPsgba3G9a1Msc1PPBRti1T8vuV9h3mMjXlxL16BA
   ```
4. Envía el sitemap:
   ```
   https://www.furgocasa.com/sitemap.xml
   ```

**OPCIONAL:** Puedes mantener la propiedad de `webfurgocasa.vercel.app` 
pero la redirección 308 transferirá la autoridad al nuevo dominio.

=================================================================
6. GOOGLE ANALYTICS (VERIFICAR)
=================================================================

### 📍 Ubicación: Google Analytics → Admin → Property Settings

Verifica que el "Default URL" esté configurado como:
```
https://www.furgocasa.com
```

No requiere cambios en el código (el tracking ID funciona en cualquier dominio).

=================================================================
7. SITEMAP Y ROBOTS.TXT (YA ACTUALIZADO)
=================================================================

✅ **Ya están actualizados automáticamente** porque usan la URL canónica:

- `src/app/sitemap.ts` - Genera URLs con www.furgocasa.com
- `src/app/robots.ts` - Apunta al sitemap correcto
- Todas las páginas tienen `canonical: "https://www.furgocasa.com/..."`

=================================================================
8. OPEN GRAPH Y META TAGS (YA ACTUALIZADO)
=================================================================

✅ **Ya están actualizados** en:
- `src/app/page.tsx` - og:url apunta a www.furgocasa.com
- `src/components/home/organization-jsonld.tsx` - URLs correctas
- Todos los JSON-LD schemas usan www.furgocasa.com

=================================================================
9. EMAILS (VERIFICAR PLANTILLAS)
=================================================================

### 📍 Ubicación: src/lib/email/templates.ts

Verifica que los enlaces en los emails apunten a www.furgocasa.com:

✅ Las plantillas usan URLs relativas o dinámicas, pero verifica que
cualquier enlace absoluto use `www.furgocasa.com`

=================================================================
10. DOCUMENTACIÓN (ACTUALIZAR REFERENCIAS)
=================================================================

Los siguientes archivos .md tienen referencias a webfurgocasa.vercel.app
y deberían actualizarse para reflejar el dominio de producción:

### Archivos críticos a actualizar:
- ✅ README.md - URL de producción
- ✅ INDICE-DOCUMENTACION.md - URL de producción
- ✅ CHANGELOG.md - Referencias históricas
- ✅ STRIPE-VERCEL-PRODUCCION.md - Webhook URL
- ✅ IMPLEMENTACION-STRIPE-COMPLETA.md - URLs de ejemplo
- ✅ REDSYS-CONFIGURACION.md - Callback URLs
- ⚠️ PWA-INICIO-RAPIDO.md - URLs de instalación

=================================================================
CHECKLIST DE VERIFICACIÓN POST-MIGRACIÓN
=================================================================

### Inmediato (Hoy):
☐ Actualizar webhook de Stripe con nueva URL
☐ Contactar Redsys para actualizar callbacks
☐ Añadir www.furgocasa.com a Google Search Console
☐ Enviar sitemap a Google
☐ Verificar que la redirección funciona (webfurgocasa.vercel.app → www.furgocasa.com)

### Esta semana:
☐ Verificar Meta Pixel con nuevo dominio
☐ Actualizar Google Analytics (si es necesario)
☐ Actualizar documentación interna
☐ Probar flujo completo de pago con Stripe
☐ Probar flujo completo de pago con Redsys (cuando esté configurado)

### Verificaciones técnicas:
☐ SSL funciona correctamente (candado verde)
☐ Redirección 308 de *.vercel.app funciona
☐ Todos los assets (imágenes, CSS, JS) cargan desde Supabase Storage
☐ No hay mixed content warnings (HTTP/HTTPS)
☐ PWA se instala correctamente desde www.furgocasa.com
☐ Emails se envían con links correctos

=================================================================
COMANDOS DE VERIFICACIÓN
=================================================================

### Verificar redirección:
```bash
curl -I https://webfurgocasa.vercel.app/
# Debería mostrar: HTTP/2 308 y location: https://www.furgocasa.com/
```

### Verificar SSL:
```bash
curl -I https://www.furgocasa.com/
# Debería mostrar: HTTP/2 200
```

### Verificar sitemap:
```bash
curl https://www.furgocasa.com/sitemap.xml
# Debería mostrar XML con URLs de www.furgocasa.com
```

### Verificar robots.txt:
```bash
curl https://www.furgocasa.com/robots.txt
# Debería mostrar: Sitemap: https://www.furgocasa.com/sitemap.xml
```

=================================================================
PRÓXIMOS PASOS
=================================================================

1. **CRÍTICO**: Actualizar webhook de Stripe (5 minutos)
2. **IMPORTANTE**: Contactar Redsys sobre callback URLs (email)
3. **IMPORTANTE**: Añadir a Google Search Console (10 minutos)
4. **RECOMENDADO**: Actualizar documentación (30 minutos)
5. **OPCIONAL**: Verificar todas las integraciones (1 hora)

=================================================================
MONITOREO POST-MIGRACIÓN
=================================================================

Durante las próximas 48 horas, monitorea:

📊 **Vercel Dashboard** → Deployments
- Verifica que no hay errores 500
- Revisa logs de funciones serverless
- Monitorea uso de Edge Functions

📊 **Supabase Dashboard** → API
- Verifica que las queries funcionan
- Revisa logs de autenticación
- Monitorea uso de Storage

📊 **Stripe Dashboard** → Events
- Verifica que los webhooks llegan (después de actualizar URL)
- Revisa que no hay eventos fallidos
- Monitorea pagos de prueba

📊 **Google Search Console** (después de 24-48h)
- Verifica indexación del nuevo dominio
- Revisa errores de rastreo
- Monitorea métricas Core Web Vitals

=================================================================
SOPORTE Y RECURSOS
=================================================================

- **Documentación completa**: Ver archivos .md en la raíz del proyecto
- **Backup DNS**: DNS-BACKUP-OVH.txt
- **Guía de migración**: GUIA-MIGRACION-VERCEL.md
- **Configuración redirección**: REDIRECCION-VERCEL-CONFIGURADA.md

=================================================================
FIN DEL DOCUMENTO
=================================================================

Última actualización: 20 de enero de 2026
Estado: ✅ Migración completada, pendiente actualizaciones externas
