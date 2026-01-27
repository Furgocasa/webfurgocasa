# 🛡️ Bloqueo Geográfico - Middleware

## Fecha de implementación
27 de enero de 2026

## Motivo
Bloquear tráfico no legítimo desde China que representa:
- 7.52% del tráfico total
- 0.68% de interacción (vs 45.77% de España)
- 0 segundos de tiempo medio en página
- 0.00€ de ingresos
- Solo 2 eventos clave vs 1,251 de España

Este tráfico distorsiona las métricas de Analytics y consume recursos sin valor.

## Implementación

### Ubicación
`src/middleware.ts` - Líneas 68-79

### Código
```typescript
// Vercel proporciona automáticamente la geolocalización en request.geo
const country = request.geo?.country || 'unknown';

// Bloquear China debido a tráfico no legítimo
const blockedCountries = ['CN'];

if (blockedCountries.includes(country)) {
  return new Response('Access denied', { status: 403 });
}
```

### Orden de ejecución
1. **Bloqueo geográfico** (PRIMERO) ← Nuevo
2. Rate limiting para APIs
3. Normalización de URLs legacy
4. Gestión de i18n/locale
5. Otras validaciones

## ¿Qué NO se ve afectado?

### ✅ Funcionalidades que siguen operando normal:
- Todos los usuarios de España, Europa, América, resto del mundo
- APIs de disponibilidad, reservas, pagos
- Sistema de traducciones (i18n)
- Rate limiting
- Admin panel
- Gestión de imágenes y assets
- PWA y manifests
- Sitemap y robots.txt
- Bots legítimos (Googlebot, Bingbot, etc.) - NO usan geolocalización de China

### ✅ Mejoras que obtiene:
- Métricas de Analytics más precisas
- Porcentaje de interacción real (sin ruido de bots)
- Ahorro de bandwidth de Vercel
- Menos carga en el servidor

## ¿Cómo funciona?

### Detección automática de país
Vercel proporciona automáticamente `request.geo.country` con el código ISO 3166-1 alpha-2:
- `ES` - España
- `CN` - China (bloqueado)
- `FR` - Francia
- `DE` - Alemania
- etc.

### Respuesta al bloqueo
- **Status**: 403 Forbidden
- **Mensaje**: "Access denied"
- **Sin página de verificación**: Respuesta instantánea
- **No almacena nada**: Sin cookies, sin tracking

## Añadir más países bloqueados

Si detectas tráfico problemático de otros países, edita la línea 75:

```typescript
const blockedCountries = ['CN', 'RU', 'KP']; // China, Rusia, Corea del Norte
```

Códigos ISO de países comunes:
- `CN` - China
- `RU` - Rusia
- `KP` - Corea del Norte
- `IN` - India
- `VN` - Vietnam
- `BR` - Brasil

## Monitorización

### ¿Cómo verificar que funciona?

1. **Google Analytics**: 
   - Ve a "Detalles demográficos: País"
   - China debería desaparecer de las estadísticas (puede tardar 24-48h)

2. **Logs de Vercel**:
   - Ve a Vercel Dashboard → Logs
   - Busca respuestas con status `403`
   - Verás las peticiones bloqueadas desde China

3. **Test con VPN**:
   - Usa una VPN con servidor en China
   - Intenta acceder a furgocasa.com
   - Deberías ver "Access denied"

## Desactivar el bloqueo (si es necesario)

Si alguna vez necesitas desactivarlo temporalmente, comenta las líneas 77-79:

```typescript
// if (blockedCountries.includes(country)) {
//   return new Response('Access denied', { status: 403 });
// }
```

## Notas técnicas

### ¿Por qué no bloquear solo Lanzhou?
- La ciudad (`request.geo.city`) no siempre está disponible
- Los bots pueden cambiar fácilmente de ciudad/IP
- Bloquear todo el país es más efectivo y estándar

### ¿Afecta al SEO?
NO. Los bots de Google, Bing, etc. no aparecen como procedentes de China aunque tengan servidores allí. Usan IPs identificadas como crawlers legítimos.

### ¿Qué pasa si un cliente real en China quiere alquilar?
- Caso extremadamente raro (alquilas furgonetas en España)
- Puede usar VPN para acceder
- Puede contactar por email/WhatsApp directamente

## Commit de referencia
```
dd009ae - feat(middleware): bloquear tráfico geográfico desde China (27 enero 2026)
```
