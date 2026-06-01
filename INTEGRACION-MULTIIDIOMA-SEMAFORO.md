# Integración multiidioma — Semáforo de ocupación

> Documentación técnica completa: [`docs/SEMAFORO-OCUPACION.md`](docs/SEMAFORO-OCUPACION.md)

## 🌍 Páginas

| Idioma | URL | Archivo |
|--------|-----|---------|
| 🇪🇸 Español | `/es/reservar` | `src/app/es/reservar/reservar-client.tsx` |
| 🇬🇧 Inglés | `/en/book` | `src/app/en/book/reservar-client.tsx` |
| 🇫🇷 Francés | `/fr/reserver` | `src/app/fr/reserver/reservar-client.tsx` |
| 🇩🇪 Alemán | `/de/buchen` | `src/app/de/buchen/reservar-client.tsx` |

Todas importan el mismo componente:

```tsx
import { OccupancyHighlights } from "@/components/booking/occupancy-highlights";
```

## 📐 Layout (actual)

```tsx
{/* Hero con SearchWidget — pb-10 lg:pb-12, sin solapamiento -mb-32 */}
<section className="py-10 lg:py-12 bg-gray-50">
  <div className="container mx-auto px-4">
    <div className="max-w-5xl mx-auto">
      <OccupancyHighlights />
    </div>
  </div>
</section>
```

## 🌐 Traducciones

`src/lib/translations-preload.ts` — el componente usa `useLanguage()` y `t()`.

Claves principales (v2):

| Clave ES | EN |
|----------|-----|
| Disponibilidad por semanas | Availability by weeks |
| Ocupación del mes | Monthly occupancy |
| Por semanas | By weeks |
| Ocupación moderada | Moderate occupancy |
| Alta demanda | High demand |
| Muy alta demanda | Very high demand |
| Últimas plazas | Last spots |

Nombres de meses traducidos (Enero…Diciembre).

## 🔌 API compartida

Un solo endpoint para los 4 idiomas: `GET /api/occupancy-highlights`

Los nombres de mes en JSON vienen en español (`Junio 2026`); el componente traduce el mes con `t("Junio")` etc.

## 🎯 Comportamiento unificado

1. API devuelve `months` con `weeks` (ver doc técnica).
2. Si `months.length === 0` → componente oculto.
3. Umbral **40%** para mostrar mes o semana con presión.
4. Mes en curso omitido solo en los **últimos 3 días** del mes.

## 🧪 Probar

```bash
npm run dev
# ES: http://localhost:3000/es/reservar
# EN: http://localhost:3000/en/book
# FR: http://localhost:3000/fr/reserver
# DE: http://localhost:3000/de/buchen

npm run test:occupancy
```

## 📁 Archivos del sistema

| Tipo | Archivo |
|------|---------|
| API | `src/app/api/occupancy-highlights/route.ts` |
| UI | `src/components/booking/occupancy-highlights.tsx` |
| i18n | `src/lib/translations-preload.ts` |
| Test | `scripts/test-occupancy-api.js` |
| Auditoría | `scripts/analyze-august-weeks.ts` |
| Rate limit | `src/middleware.ts` |

---

**Actualizado**: Junio 2026
