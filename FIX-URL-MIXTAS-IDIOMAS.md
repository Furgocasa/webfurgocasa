# Fix: URLs Mixtas entre Idiomas - Error en Proceso de Reserva

**Fecha:** 26 de enero de 2026  
**Problema:** Error al hacer clic en "Réserver" desde la página de búsqueda en idiomas distintos al español  
**Estado:** ✅ Resuelto

## Problema Detectado

Al buscar vehículos en francés (o alemán/inglés) y hacer clic en el botón "Réserver" de una tarjeta de vehículo, se generaban URLs mixtas como:

```
https://www.furgocasa.com/es/reservar/fahrzeug?vehicle_id=...
```

Esta URL mezcla:
- `/es/` (prefijo de idioma español) - ❌ Incorrecto
- `/reservar/` (palabra en español) - ❌ Incorrecto  
- `/fahrzeug` (palabra en alemán) - ❌ Incorrecto

La URL correcta debería ser `/fr/reserver/vehicule` (todo en francés).

## Causa Raíz

El componente `VehicleCard` (`src/components/booking/vehicle-card.tsx`) construía la URL de reserva **manualmente sin el prefijo de idioma**:

```typescript
// ❌ CÓDIGO INCORRECTO (líneas 64-72):
const bookingPaths: Record<string, string> = {
  es: '/reservar/vehiculo',
  en: '/book/vehicle',
  fr: '/reserver/vehicule',  // ⚠️ Sin prefijo /fr/
  de: '/buchen/fahrzeug'
};

const reservationUrl = `${bookingPaths[language]}?${bookingParams.toString()}`;
router.push(reservationUrl); // ⚠️ Empuja ruta sin prefijo de idioma
```

**¿Qué pasaba?**

1. El usuario busca en `/fr/recherche` (francés)
2. Hace clic en "Réserver"
3. El componente construye `/reserver/vehicule?...` (sin `/fr/`)
4. `router.push()` navega a una ruta relativa sin prefijo
5. El middleware de Next.js intenta adivinar el idioma
6. Debido a Accept-Language del navegador o defaults, termina en español: `/es/reservar/...`
7. Como "fahrzeug" está en algún parámetro o en la construcción, se genera la URL mixta

## Solución Implementada

Usar la función `getTranslatedRoute()` que:
- ✅ Traduce la ruta automáticamente según el idioma
- ✅ Añade el prefijo de idioma correcto (`/fr/`, `/de/`, etc.)
- ✅ Maneja los query params correctamente

```typescript
// ✅ CÓDIGO CORRECTO:
import { getTranslatedRoute } from "@/lib/route-translations";

// Siempre usar ruta base en español
const reservationUrl = getTranslatedRoute(
  `/reservar/vehiculo?${bookingParams.toString()}`,
  language
);
router.push(reservationUrl);
```

**Resultado:**
- En francés: `/fr/reserver/vehicule?...`
- En alemán: `/de/buchen/fahrzeug?...`
- En inglés: `/en/book/vehicle?...`
- En español: `/es/reservar/vehiculo?...`

## Solución Implementada

### 1. Fix en VehicleCard (Principal)

Modificado `src/components/booking/vehicle-card.tsx` para usar `getTranslatedRoute()`:

**Antes:**
```typescript
// ❌ Construcción manual sin prefijo de idioma
const bookingPaths: Record<string, string> = {
  es: '/reservar/vehiculo',
  en: '/book/vehicle',
  fr: '/reserver/vehicule',
  de: '/buchen/fahrzeug'
};
const reservationUrl = `${bookingPaths[language]}?${bookingParams.toString()}`;
```

**Después:**
```typescript
// ✅ Usar getTranslatedRoute() que añade prefijo automáticamente
import { getTranslatedRoute } from "@/lib/route-translations";

const reservationUrl = getTranslatedRoute(
  `/reservar/vehiculo?${bookingParams.toString()}`,
  language
);
```

### 2. Validación de UUID en API Endpoint (Defensa adicional)

### 2. Validación de UUID en API Endpoint (Defensa adicional)

Añadida validación en `/src/app/api/bookings/[id]/route.ts` como medida defensiva por si alguna vez llega una petición con ID inválido:

```typescript
// Helper para validar UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// En el GET handler:
if (!isValidUUID(bookingId)) {
  return NextResponse.json(
    { error: "ID de reserva inválido. Debe ser un UUID válido." },
    { status: 400 }  // 400 en lugar de 500
  );
}
```

### 3. Redirecciones 301 en next.config.js (Defensa adicional)

Como medida defensiva adicional (por si llegan URLs mixtas desde enlaces externos o bookmarks antiguos), se añadieron redirecciones permanentes en `next.config.js`:

#### Español (ES)
```javascript
{ source: '/es/reservar/fahrzeug', destination: '/es/reservar/vehiculo', permanent: true },
{ source: '/es/reservar/vehicle', destination: '/es/reservar/vehiculo', permanent: true },
{ source: '/es/reservar/vehicule', destination: '/es/reservar/vehiculo', permanent: true },
{ source: '/es/reservar/neu', destination: '/es/reservar/nueva', permanent: true },
{ source: '/es/reservar/new', destination: '/es/reservar/nueva', permanent: true },
{ source: '/es/reservar/nouvelle', destination: '/es/reservar/nueva', permanent: true },
```

#### Alemán (DE)
```javascript
{ source: '/de/buchen/vehiculo', destination: '/de/buchen/fahrzeug', permanent: true },
{ source: '/de/buchen/vehicle', destination: '/de/buchen/fahrzeug', permanent: true },
{ source: '/de/buchen/vehicule', destination: '/de/buchen/fahrzeug', permanent: true },
{ source: '/de/buchen/nueva', destination: '/de/buchen/neu', permanent: true },
{ source: '/de/buchen/new', destination: '/de/buchen/neu', permanent: true },
{ source: '/de/buchen/nouvelle', destination: '/de/buchen/neu', permanent: true },
```

#### Francés (FR)
```javascript
{ source: '/fr/reserver/vehiculo', destination: '/fr/reserver/vehicule', permanent: true },
{ source: '/fr/reserver/vehicle', destination: '/fr/reserver/vehicule', permanent: true },
{ source: '/fr/reserver/fahrzeug', destination: '/fr/reserver/vehicule', permanent: true },
{ source: '/fr/reserver/nueva', destination: '/fr/reserver/nouvelle', permanent: true },
{ source: '/fr/reserver/new', destination: '/fr/reserver/nouvelle', permanent: true },
{ source: '/fr/reserver/neu', destination: '/fr/reserver/nouvelle', permanent: true },
```

#### Inglés (EN)
```javascript
{ source: '/en/book/vehiculo', destination: '/en/book/vehicle', permanent: true },
{ source: '/en/book/fahrzeug', destination: '/en/book/vehicle', permanent: true },
{ source: '/en/book/vehicule', destination: '/en/book/vehicle', permanent: true },
{ source: '/en/book/nueva', destination: '/en/book/new', permanent: true },
{ source: '/en/book/neu', destination: '/en/book/new', permanent: true },
{ source: '/en/book/nouvelle', destination: '/en/book/new', permanent: true },
```

## Rutas Correctas por Idioma

| Español | Inglés | Francés | Alemán |
|---------|--------|---------|--------|
| `/es/reservar` | `/en/book` | `/fr/reserver` | `/de/buchen` |
| `/es/reservar/vehiculo` | `/en/book/vehicle` | `/fr/reserver/vehicule` | `/de/buchen/fahrzeug` |
| `/es/reservar/nueva` | `/en/book/new` | `/fr/reserver/nouvelle` | `/de/buchen/neu` |
| `/es/reservar/[id]/pago` | `/en/book/[id]/payment` | `/fr/reserver/[id]/paiement` | `/de/buchen/[id]/zahlung` |
| `/es/reservar/[id]/confirmacion` | `/en/book/[id]/confirmation` | `/fr/reserver/[id]/confirmation` | `/de/buchen/[id]/bestaetigung` |

## Impacto

### Beneficios
- ✅ URLs mal formadas ahora redirigen automáticamente a la URL correcta
- ✅ Mejor experiencia de usuario (no más errores 500)
- ✅ Mejor SEO (redirecciones 301 permanentes)
- ✅ Validación más robusta en endpoints API

### Rendimiento
- Impacto mínimo: Las redirecciones son procesadas por Next.js de forma muy eficiente
- Las validaciones de UUID son operaciones muy rápidas (regex simple)

## Testing

Para verificar que funciona correctamente:

1. **Acceder a URL mixta española:**
   ```
   https://www.furgocasa.com/es/reservar/fahrzeug?vehicle_id=xxx
   ```
   Debería redirigir a:
   ```
   https://www.furgocasa.com/es/reservar/vehiculo?vehicle_id=xxx
   ```

2. **Acceder a URL mixta alemana:**
   ```
   https://www.furgocasa.com/de/buchen/vehiculo?vehicle_id=xxx
   ```
   Debería redirigir a:
   ```
   https://www.furgocasa.com/de/buchen/fahrzeug?vehicle_id=xxx
   ```

3. **Intentar acceder a API con ID inválido:**
   ```
   GET /api/bookings/fahrzeug
   ```
   Debería retornar 400 con mensaje claro:
   ```json
   { "error": "ID de reserva inválido. Debe ser un UUID válido." }
   ```

## Archivos Modificados

1. **`src/components/booking/vehicle-card.tsx`** (FIX PRINCIPAL)
   - Importado `getTranslatedRoute` desde `@/lib/route-translations`
   - Reemplazado el objeto `bookingPaths` manual por llamada a `getTranslatedRoute()`
   - Ahora genera URLs correctas con prefijo de idioma: `/fr/reserver/vehicule`, `/de/buchen/fahrzeug`, etc.

2. **`src/app/api/bookings/[id]/route.ts`** (Defensa adicional)
   - Añadida función `isValidUUID()`
   - Añadida validación antes de consultar la base de datos
   - Retorna 400 Bad Request en lugar de 500 para IDs inválidos

3. **`next.config.js`** (Defensa adicional)
   - Añadidas redirecciones para corregir URLs mixtas en todos los idiomas
   - Total: ~24 nuevas redirecciones como medida defensiva

## Lecciones Aprendidas

### ❌ NO hacer esto:
```typescript
// Construir URLs manualmente con rutas traducidas
const bookingPaths = {
  es: '/reservar/vehiculo',
  en: '/book/vehicle',
  fr: '/reserver/vehicule',
  de: '/buchen/fahrzeug'
};
const url = `${bookingPaths[language]}?${params}`;
router.push(url); // ⚠️ Falta el prefijo de idioma (/fr/, /de/, etc.)
```

### ✅ Hacer esto:
```typescript
// Usar getTranslatedRoute() que añade prefijo automáticamente
import { getTranslatedRoute } from "@/lib/route-translations";

const url = getTranslatedRoute(`/reservar/vehiculo?${params}`, language);
router.push(url); // ✅ Genera /fr/reserver/vehicule, /de/buchen/fahrzeug, etc.
```

O alternativamente, usar `LocalizedLink`:
```typescript
<LocalizedLink href={`/reservar/vehiculo?${params}`}>
  Réserver
</LocalizedLink>
```

### Regla General

**Siempre usar rutas base en español** y dejar que el sistema las traduzca:
- ✅ `getTranslatedRoute("/reservar/vehiculo", language)`
- ✅ `<LocalizedLink href="/reservar/vehiculo">`
- ❌ Nunca construir rutas traducidas manualmente sin prefijos

## Notas

- Las redirecciones son **permanentes (301)** porque URLs mixtas no deberían existir nunca
- Los motores de búsqueda actualizarán sus índices automáticamente
- Las validaciones de UUID previenen errores innecesarios en la base de datos
- Esta solución es escalable: si se añaden más idiomas, solo hay que añadir más redirecciones siguiendo el patrón

## Relacionado

- Ver `next.config.js` sección "GRUPO 3: CORRECCIÓN IDIOMA CRUZADO"
- Ver `src/app/api/bookings/[id]/route.ts` función `isValidUUID()`
