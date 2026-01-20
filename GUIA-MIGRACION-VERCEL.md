=================================================================
GUÍA DE MIGRACIÓN DNS: OVH → VERCEL
Dominio: furgocasa.com
Fecha: 20 de enero de 2026
=================================================================

⚠️ ADVERTENCIA IMPORTANTE ⚠️
Esta guía te llevará paso a paso para migrar tu dominio a Vercel.
El backup completo de tu configuración actual está en: DNS-BACKUP-OVH.txt

=================================================================
PASO 1: PREPARATIVOS EN VERCEL
=================================================================

1. Ve a tu proyecto en Vercel Dashboard: https://vercel.com/dashboard
2. Entra en tu proyecto furgocasa-app
3. Ve a Settings → Domains
4. Añade estos dos dominios:
   - furgocasa.com
   - www.furgocasa.com

5. Vercel te mostrará qué registros DNS necesitas configurar. 
   Normalmente serán:
   
   ✅ VERCEL TE PIDE ESTOS VALORES ESPECÍFICOS:
   
   Para furgocasa.com (dominio raíz):
   - Tipo: A
   - Host: @ (o furgocasa.com)
   - Value: 216.198.79.1
   
   Para www.furgocasa.com:
   - Tipo: CNAME
   - Host: www
   - Value: 84e15c1fe0a9edd9.vercel-dns-017.com.

6. ¡NO CIERRES LA VENTANA DE VERCEL! Necesitarás copiar exactamente estos valores.

=================================================================
PASO 2: MODIFICACIONES EN OVH
=================================================================

Inicia sesión en OVH y ve a la zona DNS de furgocasa.com.

⚠️ ORDEN IMPORTANTE: Sigue estos pasos EN ORDEN

────────────────────────────────────────────────────────────────
2.1. CAMBIAR REGISTROS A (LOS DOS MÁS IMPORTANTES)
────────────────────────────────────────────────────────────────

Busca estos dos registros:

❌ CAMBIO 1 - Dominio raíz (furgocasa.com):
   
   ANTES:
   Tipo: A
   Host: @ (o furgocasa.com.)
   Valor: 46.105.204.26

   DESPUÉS:
   Tipo: A
   Host: @
   Valor: 216.198.79.1
   TTL: 300 (5 minutos, para poder revertir rápido si hay problemas)

❌ CAMBIO 2 - Subdominio www (www.furgocasa.com):
   
   ANTES:
   Tipo: A
   Host: www
   Valor: 46.105.204.26

   DESPUÉS:
   Tipo: CNAME
   Host: www
   Valor: 84e15c1fe0a9edd9.vercel-dns-017.com.
   TTL: 300 (5 minutos)
   
   ⚠️ IMPORTANTE: Cambias de tipo A a CNAME. Primero elimina el registro A 
   de www y luego crea el nuevo CNAME.

────────────────────────────────────────────────────────────────
2.2. ELIMINAR REGISTROS TXT INNECESARIOS DE OVH (OPCIONAL)
────────────────────────────────────────────────────────────────

Estos registros TXT parecen ser redirecciones de OVH que ya no necesitas:

❌ PUEDES ELIMINAR (opcional, no afectarán):
   - TXT @ "1|www.furgocasa.com"
   - TXT www "3|welcome"
   - TXT www "l|es"

✅ MANTENER (IMPORTANTES):
   - TXT "google-site-verification=..." (ambos)
   - TXT "facebook-domain-verification=..."
   - TXT webmail y www.webmail (si usas webmail)

────────────────────────────────────────────────────────────────
2.3. VERIFICAR QUE NO TOCAS NADA DE EMAIL
────────────────────────────────────────────────────────────────

✅ NO TOCAR ESTOS REGISTROS (tu email depende de ellos):

MX (3 registros):
   - MX 1 mx1.mail.ovh.net.
   - MX 5 mx2.mail.ovh.net.
   - MX 100 mx3.mail.ovh.net.

CNAME para email:
   - mail.furgocasa.com → ssl0.ovh.net.
   - smtp.furgocasa.com → ssl0.ovh.net.
   - imap.furgocasa.com → ssl0.ovh.net.
   - pop3.furgocasa.com → ssl0.ovh.net.
   - autoconfig.furgocasa.com → mailconfig.ovh.net.
   - autodiscover.furgocasa.com → mailconfig.ovh.net.

CNAME para DKIM:
   - ovhmo3368304-selector1._domainkey.furgocasa.com → ...
   - ovhmo3368304-selector2._domainkey.furgocasa.com → ...

SRV:
   - _autodiscover._tcp.furgocasa.com
   - _imaps._tcp.furgocasa.com
   - _submission._tcp.furgocasa.com

SPF:
   - "v=spf1 include:mx.ovh.com ~all"

A para webmail:
   - webmail.furgocasa.com → 213.186.33.5
   - www.webmail.furgocasa.com → 213.186.33.5

=================================================================
PASO 3: GUARDAR Y ESPERAR PROPAGACIÓN
=================================================================

1. Guarda todos los cambios en OVH
2. Vuelve a Vercel y espera a que verifique el dominio
3. La propagación DNS puede tardar:
   - Mínimo: 5-15 minutos
   - Normal: 1-2 horas
   - Máximo: 24-48 horas (raro)

4. Vercel te dirá cuando el dominio esté verificado y funcionando

=================================================================
PASO 4: VERIFICACIÓN
=================================================================

Prueba estos comandos en tu terminal para verificar:

# Verificar que el DNS apunta a Vercel
nslookup furgocasa.com
nslookup www.furgocasa.com

# Verificar que el sitio carga
curl -I https://www.furgocasa.com
curl -I https://furgocasa.com

Prueba en navegadores:
- https://furgocasa.com
- https://www.furgocasa.com
- Modo incógnito (para evitar caché)
- En tu móvil (con datos móviles, no WiFi de casa)

=================================================================
PASO 5: CONFIGURAR SSL/HTTPS EN VERCEL
=================================================================

Vercel automáticamente:
1. Genera certificados SSL (Let's Encrypt)
2. Redirige HTTP → HTTPS
3. Redirige furgocasa.com → www.furgocasa.com (o viceversa, tú eliges)

En Settings → Domains, puedes configurar cuál es tu dominio principal.

=================================================================
PASO 6: DESPUÉS DE 24 HORAS (CUANDO TODO FUNCIONE)
=================================================================

Una vez confirmes que todo funciona correctamente:

1. Aumenta el TTL de los registros A:
   - Cambia de 300 a 3600 (1 hora) o más
   - Esto mejorará el rendimiento y reducirá consultas DNS

2. Elimina el CNAME de ftp.furgocasa.com si no lo usas

3. Puedes eliminar los TXT de OVH que marcamos como opcionales

=================================================================
PLAN B: CÓMO REVERTIR SI ALGO SALE MAL
=================================================================

Si después de hacer los cambios algo no funciona:

1. Ve a OVH y cambia los registros A de vuelta:
   - furgocasa.com A → 46.105.204.26
   - www.furgocasa.com A → 46.105.204.26

2. Espera 5-15 minutos (TTL de 300 segundos)

3. Tu sitio viejo volverá a estar activo

4. Revisa qué salió mal y vuelve a intentar

⚠️ IMPORTANTE: No apagues el servidor viejo hasta que confirmes
que el nuevo funciona perfectamente durante al menos 48 horas.

=================================================================
CHECKLIST FINAL
=================================================================

Antes de empezar:
☐ He leído toda esta guía
☐ Tengo acceso a OVH
☐ Tengo acceso a Vercel
☐ He añadido los dominios en Vercel
☐ Conozco las IPs que me dio Vercel
☐ Tengo el backup DNS-BACKUP-OVH.txt guardado
☐ He avisado a mi equipo/clientes de posible downtime

Durante la migración:
☐ He cambiado el registro A de furgocasa.com
☐ He cambiado el registro A de www.furgocasa.com
☐ NO he tocado ningún registro MX, CNAME de email, ni SPF
☐ He guardado los cambios en OVH

Después de la migración:
☐ Vercel muestra el dominio como verificado
☐ https://furgocasa.com carga correctamente
☐ https://www.furgocasa.com carga correctamente
☐ El certificado SSL es válido (candado verde)
☐ He probado en modo incógnito
☐ He probado desde mi móvil con datos
☐ He esperado 24h y todo sigue funcionando
☐ He probado enviar/recibir emails (que sigan funcionando)
☐ He aumentado el TTL a 3600

=================================================================
CONTACTOS DE EMERGENCIA
=================================================================

Si algo sale muy mal:
- Soporte OVH: https://www.ovh.es/soporte/
- Soporte Vercel: https://vercel.com/support
- Documentación Vercel sobre dominios: https://vercel.com/docs/concepts/projects/domains

=================================================================
NOTAS ADICIONALES
=================================================================

1. El email seguirá funcionando normalmente porque no tocamos
   ningún registro relacionado con email (MX, CNAME, SRV, SPF, DKIM)

2. Si tienes Google Analytics, Search Console, o Meta Pixel,
   seguirán funcionando porque no cambiamos sus verificaciones

3. Vercel incluye:
   - CDN global automático
   - SSL gratuito y automático
   - DDoS protection
   - Mejor rendimiento que el hosting tradicional

4. Puedes mantener tu servidor viejo activo durante unos días
   más por precaución, pero una vez todo funcione, puedes apagarlo

=================================================================
¡BUENA SUERTE CON LA MIGRACIÓN!
=================================================================

Recuerda: Es normal tener un poco de nervios, pero has hecho bien
en guardar un backup completo. Si sigues estos pasos, debería ser
una migración sin problemas. Y si algo sale mal, puedes revertir
en minutos.
