# 🚦 Sistema de Semáforo de Ocupación

## 📋 Descripción

Sistema visual en `/es/reservar` (y equivalentes i18n) que muestra la **ocupación semana a semana** dentro de cada mes, con indicadores tipo semáforo para acelerar la decisión de reserva.

**Objetivo**: que el cliente vea urgencia en tramos concretos (p. ej. «8–14 ago: 60% — alta demanda») y no un promedio mensual que oculta picos.

## 🎯 Objetivo

- **Crear urgencia visual** en semanas de alta demanda
- **Transparencia** con datos reales de reservas + bloqueos
- **Acelerar conversión** mostrando presión por fechas concretas
- **Reducir consultas** sobre disponibilidad

## 🏗️ Arquitectura

### 1. API Endpoint

**Ruta**: `GET /api/occupancy-highlights`

**Constantes** (`src/app/api/occupancy-highlights/route.ts`):

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `MONTHS_AHEAD` | 12 | Meses analizados hacia adelante |
| `THRESHOLD_MODERATE` | 40 | Umbral mínimo para mostrar mes/semana |
| `DAYS_LEFT_TO_SKIP_CURRENT_MONTH` | 3 | Si quedan ≤3 días de mes, se omite el mes en curso |

**Response** (forma actual):

```json
{
  "success": true,
  "months": [
    {
      "id": "2026-08",
      "name": "Agosto 2026",
      "year": 2026,
      "month": 8,
      "start_date": "2026-08-01",
      "end_date": "2026-08-31",
      "occupancy_rate": 44.2,
      "status": "moderate",
      "color": "yellow",
      "status_label": "Ocupación moderada",
      "icon": "🟡",
      "has_high_demand_week": true,
      "weeks": [
        {
          "id": "2026-08-w2",
          "label": "8-14",
          "start_date": "2026-08-08",
          "end_date": "2026-08-14",
          "occupancy_rate": 60,
          "status": "high",
          "color": "orange",
          "status_label": "Alta demanda",
          "icon": "🟠"
        }
      ]
    }
  ],
  "metadata": {
    "total_vehicles": 10,
    "total_months": 4,
    "months_analyzed": 12,
    "threshold": 40,
    "generated_at": "2026-06-01T..."
  }
}
```

**Cache**: `public, s-maxage=3600, stale-while-revalidate=7200` (1 h en CDN)

**Rate limit** (`middleware.ts`): 120 req/min

### 2. Componente Frontend

**Archivo**: `src/components/booking/occupancy-highlights.tsx`

- Una **tarjeta por mes** con barra de ocupación mensual
- **Grid de semanas** (2 cols móvil, 3 tablet, 5 desktop) con semáforo por tramo
- Pulso animado en semanas `high` / `full`
- Skeleton loader; `return null` si error o sin meses
- Título: **«Disponibilidad por semanas»**

### 3. Integración en Página

**Archivos** (misma estructura en los 4 idiomas):

- `src/app/es/reservar/reservar-client.tsx`
- `src/app/en/book/reservar-client.tsx`
- `src/app/fr/reserver/reservar-client.tsx`
- `src/app/de/buchen/reservar-client.tsx`

**Ubicación**: entre el `SearchWidget` y «Puntos de recogida».

**Espaciado** (jun 2026):

```tsx
{/* Hero: pb-10 lg:pb-12, sin -mb-32 en el widget */}
<section className="py-10 lg:py-12 bg-gray-50">
  <OccupancyHighlights />
</section>
```

## 📅 Generación de periodos (dinámica)

**Ya no hay lista hardcodeada** (`KEY_PERIODS_2026` eliminada).

1. **Meses**: desde el mes en curso (salvo últimos 3 días) + 11 meses siguientes.
2. **Semanas por mes**: bloques calendario fijos — `1-7`, `8-14`, `15-21`, `22-28`, `29-fin`.
3. **Mes en curso**:
   - Se muestra si quedan **más de 3 días** en el mes (p. ej. 1 jun → todo junio).
   - Se **omite** del 29 al 31 (p. ej. 29 may → empieza por junio).
   - Semanas **ya pasadas** del mes en curso no se listan.
4. **Inclusión de un mes** en la respuesta si:
   - el **total mensual** ≥ 40%, **o**
   - **alguna semana** ≥ 40% (p. ej. julio total 35% pero semana 15–21 al 41% → julio aparece).

## 🎨 Lógica de colores

| Ocupación | Color | Estado | Label API | UI |
|-----------|-------|--------|-----------|-----|
| < 40% | 🟢 Verde | `available` | Disponible | Semana visible pero sin badge de urgencia en leyenda |
| 40–60% | 🟡 Amarillo | `moderate` | Ocupación moderada | Normal |
| 60–85% | 🟠 Naranja | `high` | Alta demanda | Pulso + «Últimas plazas» |
| > 85% | 🔴 Rojo | `full` | Muy alta demanda | Pulso + «Reserva con antelación» |

**Componente**: si `months.length === 0`, no se renderiza nada.

## 🔧 Cálculo de ocupación

Por cada periodo (mes o semana):

```
ocupación % = (días no reservables / días × flota) × 100
```

**Días no reservables** = reservas ∪ bloqueos (`blocked_dates`), sin duplicar el mismo día por vehículo.

**Flota**: `is_for_rent = true`, `status = available`, no vendidos (`sale_status != sold`).

**Reservas**: `confirmed`, `in_progress`, `completed` (pendientes **no** cuentan).

**Bloqueos**: lectura con service role en servidor (RLS admin).

> **Nota**: el panel de informes admin cuenta solo reservas en el numerador; el semáforo público **suma bloqueos** para reflejar días no alquilables.

## 🌍 Traducciones

`src/lib/translations-preload.ts` — claves principales:

- `Disponibilidad por semanas`
- `Mira la ocupación semana a semana y reserva cuanto antes las fechas más solicitadas`
- `Ocupación del mes`, `Por semanas`, `Ocupación`
- `Ocupación moderada`, `Alta demanda`, `Muy alta demanda`
- `Últimas plazas`, `Reserva con antelación`
- Nombres de meses (`Enero` … `Diciembre`) en ES/EN/FR/DE

## 🚀 Testing

### API local / prod

```bash
npm run test:occupancy
# o
curl https://www.furgocasa.com/api/occupancy-highlights
```

### Auditoría con datos reales (Supabase)

```bash
npx tsx scripts/analyze-august-weeks.ts
```

Compara meses/semanas jun–sep con la misma fórmula; requiere `.env.local` con service role.

### Página

```bash
npm run dev
# http://localhost:3000/es/reservar
```

## 📝 Mantenimiento

### Ya no hace falta actualizar fechas anuales

Los periodos se generan solos. Solo revisar si cambian reglas de negocio:

| Qué ajustar | Dónde |
|-------------|-------|
| Umbral 40% | `THRESHOLD_MODERATE` |
| Meses analizados | `MONTHS_AHEAD` |
| Omitir mes en curso | `DAYS_LEFT_TO_SKIP_CURRENT_MONTH` (default 3) |
| Colores / labels | `getOccupancyStatus()` |

### Posibles mejoras

1. Click en semana → pre-rellenar `SearchWidget`
2. Panel admin para umbrales sin deploy
3. Métrica alternativa: reservas / capacidad ofertada (sin bloqueos en denominador)

## 🐛 Troubleshooting

| Síntoma | Comprobación |
|---------|--------------|
| No aparece el bloque | Ningún mes/semana ≥ 40%; revisar API JSON |
| Mes actual no sale | ¿Quedan ≤3 días de mes? Es intencionado |
| Solo sale un mes | Cache 1 h; hard refresh o esperar deploy |
| % distinto al admin | Semáforo incluye `blocked_dates`; informes no |
| Mayo con 27–28 | Deploy antiguo; debe ser junio+ con semanas 1-7, 8-14… |

## 📚 Referencias

| Recurso | Ruta |
|---------|------|
| API | `src/app/api/occupancy-highlights/route.ts` |
| UI | `src/components/booking/occupancy-highlights.tsx` |
| Integración ES | `src/app/es/reservar/reservar-client.tsx` |
| Traducciones | `src/lib/translations-preload.ts` |
| Test API | `scripts/test-occupancy-api.js` |
| Análisis DB | `scripts/analyze-august-weeks.ts` |
| Doc visual | `docs/SEMAFORO-OCUPACION-VISUAL.md` |

---

**Creado**: Febrero 2026  
**Última actualización**: Junio 2026 (v2 — semanas dinámicas)  
**Mantenedor**: Furgocasa Dev Team
