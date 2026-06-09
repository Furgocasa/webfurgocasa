# Configuración de Google Analytics

## ⚠️ DOCUMENTO PARCIALMENTE HISTÓRICO

**Última actualización**: 20 de mayo de 2026 — analytics diferida.
**Fecha de la sección histórica de implementación manual**: 25 de enero de 2026.

**👉 Documentos actuales:**
- `MIGRACION-NEXT-THIRD-PARTIES.md` - Guía de migración + nota carga diferida mayo 2026
- `RESUMEN-MIGRACION-ANALYTICS-v4.4.0.md` - Resumen ejecutivo
- `FIX-ANALYTICS-VISITAS-DUPLICADAS.md` - Fix de visitas duplicadas (27/01/2026)
- `CONFIGURACION-META-PIXEL.md` - Pixel diferido + fix typo `fbevents.js`

---

## ID de Medición
**G-G5YLBN5XXZ**

## Nueva Implementación (v4.4.0)

Desde la versión 4.4.0, la aplicación utiliza la librería oficial de Next.js para Google Analytics.

> 🆕 **Mayo 2026 (v4.5.x):** se mantiene `@next/third-parties/google`,
> pero el componente **ya no se monta directamente en
> `src/app/layout.tsx`**. Ahora se monta dentro de
> `src/components/deferred-analytics.tsx`, que retrasa la carga de GA,
> GTM y Meta Pixel hasta la **primera interacción del usuario** (scroll,
> click, mousemove, touchstart, keydown) o un timeout de 2,5 s.
>
> Esto sacó ~250-350 ms de TBT móvil en páginas de localización sin
> perder tracking de la mayoría de usuarios (la interacción suele
> ocurrir en <2 s). Ver `MIGRACION-NEXT-THIRD-PARTIES.md` y la entrada
> *20 mayo 2026* del `CHANGELOG.md`.

### Estructura actual (mayo 2026)

```tsx
// src/app/layout.tsx
<DeferredAnalytics
  gaId="G-G5YLBN5XXZ"
  gtmId="GTM-5QLGH57"
  metaPixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
/>

// src/components/deferred-analytics.tsx (resumen)
'use client';
// useEffect → espera interacción o 2,5 s → setReady(true)
// {ready && <GoogleTagManager gtmId={gtmId} />}
// {ready && <GoogleAnalytics gaId={gaId} />}
// {ready && metaPixelId && inyecta fbevents.js + fbq('init', ...)}
```

### Estructura original (enero–mayo 2026, histórica)

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-G5YLBN5XXZ" />
      </body>
    </html>
  )
}
```

### Ventajas de la Nueva Implementación
- ✅ **Estabilidad garantizada**: Mantenida por Vercel/Google
- ✅ **Sin race conditions**: Gestión automática de carga asíncrona
- ✅ **Captura automática**: Títulos, URLs completas (incluido `fbclid`)
- ✅ **Menos código**: 1 línea vs 300+ líneas custom
- ✅ **Tracking correcto**: Sin visitas duplicadas (tras configuración GA4)

### Configuración Requerida en GA4

**⚠️ IMPORTANTE**: Para evitar visitas duplicadas, debes configurar GA4:

1. **Admin** → **Flujos de datos** → Selecciona tu flujo (G-G5YLBN5XXZ)
2. **Medición mejorada** → **Mostrar configuración avanzada**
3. **Desactivar**: "La página cambia en función de los eventos del historial de navegación"
4. **Mantener activo**: "Cargas de página"

📖 **Ver guía detallada:** `FIX-ANALYTICS-VISITAS-DUPLICADAS.md`

### Desventajas
- ⚠️ **No hay exclusión del admin**: Los scripts se cargan en todas las páginas
- **Solución recomendada**: Configurar filtro por IP en Google Analytics

### Configurar Filtro por IP (Recomendado)
1. Google Analytics → Admin → Flujos de datos → Tu flujo
2. Configuración de etiquetas → Mostrar todo
3. Definir filtro de IP interno
4. Añadir tu IP de oficina/casa

---

## 📜 Documentación Histórica (Implementación Manual)

### ⚠️ IMPORTANTE - Exclusión Total de Páginas de Administrador (YA NO APLICA)

**NOTA**: La exclusión manual del admin ya NO está implementada en la nueva versión.

La siguiente información se mantiene solo como referencia histórica de cómo funcionaba la implementación manual (v1.0.0 - v4.3.0).

### Cómo Funcionaba la Exclusión Manual (Obsoleto)

1. **Componente `AnalyticsScripts` (Client-Side)**:
   - Detectaba la ruta actual usando `usePathname()`
   - Si la ruta comenzaba con `/administrator` o `/admin`:
     - NO renderizaba ningún script de Google Analytics
     - NO cargaba gtag.js
     - NO inicializaba dataLayer
   - Solo en páginas públicas se cargaban los scripts

2. **Componente `GoogleAnalytics` (Tracking de Navegación)**:
   - Detectaba cambios de ruta
   - Si era una ruta de admin, NO enviaba pageviews
   - Solo trackeaba navegación en páginas públicas

### Archivos Obsoletos (Conservados para Historial)

```
src/components/
├── analytics-scripts.tsx      # ❌ Ya NO se usa (exclusión manual)
├── analytics.tsx              # ❌ Ya NO se usa (tracking manual con V1-V7)
└── analytics-debug.tsx        # ✅ Se mantiene (útil en desarrollo)
```

### Documentación Histórica de Iteraciones

Los siguientes documentos explican los problemas que se intentaron resolver con la implementación manual:

- `AUDITORIA-ANALYTICS-TITULOS.md` - V1: Problema de títulos faltantes
- `FIX-ANALYTICS-TITULOS.md` - V2: MutationObserver para títulos
- `AUDITORIA-ANALYTICS-PARAMS.md` - V4: Captura de parámetros `fbclid`
- `AUDITORIA-ANALYTICS-INITIAL-LOAD.md` - V5: Race conditions en carga inicial
- `AUDITORIA-ANALYTICS-URL-TRIMMING.md` - V6: Recorte de URLs largas
- `AUDITORIA-ANALYTICS-URL-TRIMMING-V7.md` - V7: Recorte agresivo de `fbclid`

**Todos estos problemas están ahora resueltos** con la librería oficial `@next/third-parties/google`.

---

## 📊 Eventos Ecommerce GTM (mayo 2026 — solo cobros confirmados)

**Contenedor:** `GTM-5QLGH57` (cargado en `src/app/layout.tsx` vía `<GoogleTagManager gtmId="GTM-5QLGH57" />`).

Los únicos eventos `sendGTMEvent` activos son los de la **página de éxito tras pasarela** (Redsys/Stripe). No se envían eventos al visitar la ficha de la reserva, la página de pago ni la confirmación por transferencia; así se evita que Google Ads cuente conversiones por meras visitas o enlaces compartidos.

### Eventos enviados desde código

| Evento | Cuándo se dispara | Archivos (4 idiomas) | Dedup |
|---|---|---|---|
| `purchase` | **Primer cobro** autorizado (parcial o total), con `value = total_price` (LTV) | `src/app/{es,en,fr,de}/{pago,payment,paiement,zahlung}/exito/page.tsx` | `localStorage` + `order_number` |
| `additional_payment_received` | Cobros posteriores (segundo 50 %, ajustes), `value = payment.amount` | mismas páginas de éxito | `localStorage` + `order_number` |

**Eliminados del código (mayo 2026):** `generate_lead`, `begin_checkout`, `add_payment_info`. Si en el futuro se necesita embudo en GA4, se pueden reintroducir como eventos **secundarios** en GTM (sin marcarlos como conversión en Ads) o con nombres custom que Ads no importe.

### ⚠️ Regla crítica anti-doble-conteo (modelo 50 % + 50 %)

El negocio cobra el primer 50 % y, hasta 15 días antes de la recogida, el segundo 50 %. Cada cobro es una transacción Redsys distinta (`order_number` distinto). **Si se disparase `purchase` en ambos cobros con `value = total_price`, GA4 doblaría ingresos y Google Ads doblaría conversión.**

**Solución implementada (client-side):**

```ts
const totalPaid = payment.booking.amount_paid || 0; // ya actualizado en BD
const isFirstPayment = totalPaid - payment.amount <= 0.01;

if (isFirstPayment) {
  // event: "purchase" con value = total_price (LTV completo)
} else {
  // event: "additional_payment_received" con value = payment.amount
}
```

`payment.booking.amount_paid` viene actualizado por `/api/payments/by-order` *después* de aplicar la transacción actual, así que si el resto (`amount_paid - amount`) es 0 ⇒ no había cobros previos ⇒ es el primer pago.

### Configuración requerida en el contenedor GTM

| Etiqueta | Trigger | Notas |
|---|---|---|
| GA4 — `purchase` event | Custom event `purchase` | Mapear `transaction_id`, `value`, `currency`, `items`, `payment_type` |
| GA4 — `additional_payment_received` | Custom event `additional_payment_received` | Para reportes internos. **NO** marcarlo como conversión |
| **Google Ads — Conversión "Reserva"** | Custom event `purchase` | **SOLO `purchase`**, nunca `additional_payment_received`. De lo contrario se duplica conversión cuando llega el segundo 50 %. **IMPORTANTE (Junio 2026):** Asegurarse en Google Ads de que la conversión principal está enlazada a GTM (Etiqueta de conversión) y no a un evento automático de "Página vista" que inflaba las conversiones a >30 diarias. |
| Google Ads — Remarketing | Pageviews o eventos propios en GTM | Ya no hay `begin_checkout` / `add_payment_info` desde la web; usar audiencias por URL o etiquetas custom si hace falta |

### Payload `ecommerce` enviado

#### `purchase` (primer pago)

```json
{
  "event": "purchase",
  "ecommerce": {
    "transaction_id": "<order_number Redsys/Stripe>",
    "value": <total_price>,
    "currency": "EUR",
    "payment_type": "first_50" | "full",
    "items": [{
      "item_id": "<booking.id>",
      "item_name": "<vehicle.brand> <vehicle.model>",
      "item_category": "Camper Rental",
      "price": <total_price>,
      "quantity": 1
    }]
  }
}
```

#### `additional_payment_received` (segundo pago, ajustes)

```json
{
  "event": "additional_payment_received",
  "ecommerce": {
    "transaction_id": "<order_number>",
    "booking_id": "<booking.id>",
    "value": <payment.amount>,
    "currency": "EUR",
    "payment_type": "second_50"
  }
}
```

### Verificación en producción

1. **GA4 DebugView:** tras un pago real que termine en `/…/pago/exito` (o equivalente por idioma), debe aparecer **`purchase`** (primer cobro) o **`additional_payment_received`** (segundos cobros). No debe haber otros eventos ecommerce desde estas páginas de éxito salvo esos dos.
2. **Console del navegador:** logs `[GTM] purchase enviado…` / `additional_payment_received…` en las páginas de éxito.
3. **`window.dataLayer`:** solo debe incluir pushes de compra tras confirmación de pasarela.

### Cómo desactivar o extender eventos

Los únicos `sendGTMEvent` del flujo de reserva están en las cuatro páginas `…/exito/page.tsx`. Para desactivar el tracking de compras: comentar esos bloques. Para reintentar tras pruebas: `localStorage.removeItem('gtm_purchase_<order_number>')` o `localStorage.clear()`.

---

## Cumplimiento GDPR

El sistema incluye gestión de consentimiento con `CookieProvider`:

### Modo por Defecto (Sin Consentimiento)
```javascript
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted'
});
```

### Cuando el Usuario Acepta
```javascript
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});
```

## Integración con el Sistema de Cookies

El sistema de cookies (`src/components/cookies/cookie-context.tsx`) gestiona:

1. **Banner de Consentimiento**: Primera visita al sitio
2. **Preferencias Guardadas**: localStorage
3. **Actualización de Consentimiento**: Comunica a Google Analytics

### Funciones Clave
- `acceptAll()`: Acepta todas las cookies incluyendo analytics
- `rejectAll()`: Solo cookies necesarias, analytics denegado
- `updatePreferences()`: Preferencias personalizadas

## Verificación de Funcionamiento

### En el Navegador (Chrome DevTools)

1. **Consola del Navegador**:
   - Debe verse el script de Google Tag Manager cargándose
   - Verifica `window.gtag` existe

2. **Network Tab**:
   - Verás peticiones a `googletagmanager.com`
   - Incluye tanto páginas públicas como admin (nueva implementación)

3. **Verificar dataLayer**:
   ```javascript
   // En la consola
   window.dataLayer
   // Debe mostrar un array con eventos
   ```

### En Google Analytics

1. **Tiempo Real**:
   - Ve a Analytics → Informes → Tiempo Real
   - Navega por el sitio: Verás tráfico en todas las páginas
   - **Nota**: Incluye navegación en admin (filtrar por IP recomendado)

2. **Debug Mode** (opcional):
   ```javascript
   gtag('config', 'G-G5YLBN5XXZ', {
     'debug_mode': true
   });
   ```

## Mantenimiento

### Cambiar el ID de Google Analytics
Edita `src/app/layout.tsx`:
```tsx
<GoogleAnalytics gaId="G-XXXXXXXXXX" />
```

## Solución de Problemas

### Problema: Analytics no funciona en ninguna página
- Verifica el ID de medición `G-G5YLBN5XXZ`
- Revisa las cookies aceptadas en `localStorage`
- Comprueba que no hay bloqueadores de ads activos

### Problema: Las cookies no se actualizan
- Limpia localStorage: `localStorage.clear()`
- Borra las cookies del navegador
- Recarga la página

## Recursos

- [Google Analytics 4 - Consent Mode](https://support.google.com/analytics/answer/9976101)
- [Next.js Third Parties - Google Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries#google-analytics)
- [@next/third-parties Documentation](https://www.npmjs.com/package/@next/third-parties)
- [GDPR Compliance](https://support.google.com/analytics/answer/9019185)

---

**Última actualización**: 3 de junio de 2026 (Fix de conversiones infladas en Google Ads)  
**ID de Medición GA4**: G-G5YLBN5XXZ  
**Contenedor GTM**: GTM-5QLGH57  
**Estado**: ✅ Conversión ecommerce alineada con cobro real en pasarela  
**Versión actual**: v4.5.0+
