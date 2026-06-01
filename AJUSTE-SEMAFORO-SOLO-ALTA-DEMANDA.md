# Semáforo de ocupación — Histórico de ajustes

> **Estado actual (jun 2026)**: ver [`docs/SEMAFORO-OCUPACION.md`](docs/SEMAFORO-OCUPACION.md) — sistema por **semanas dentro de meses**, umbral **40%**, meses dinámicos.

---

## v1 — Solo periodos con presión (feb 2026)

**Feedback**: no mostrar periodos verdes; solo urgencia real.

**Implementado**:

- Umbral inicial **50%** (luego bajado a **40%**)
- `return null` si no hay periodos
- Periodos hardcodeados (`KEY_PERIODS_2026`)

---

## v2 — Semanas dinámicas (may–jun 2026)

**Feedback**: un mes entero (p. ej. «Agosto 44%») oculta picos semanales (p. ej. 8–14 ago 60%).

**Implementado**:

- Eliminada lista `KEY_PERIODS_2026`
- API devuelve `months[]` con `weeks[]` (bloques 1-7, 8-14, …)
- UI: tarjeta por mes + grid de semanas
- Mes incluido si total ≥40% **o** alguna semana ≥40%
- Script `scripts/analyze-august-weeks.ts` para auditoría con Supabase

---

## v3 — Mes en curso (jun 2026)

**Feedback**:

1. No mostrar tramos raros tipo «27-28 may» al final del mes.
2. Sí mostrar el mes entero al inicio (p. ej. 1 jun → todo junio).

**Implementado**:

- Mes en curso **visible** si quedan **>3 días** de mes
- Mes en curso **oculto** solo en los **últimos 3 días** (29–31)
- Semanas pasadas del mes en curso no se listan
- Semanas siempre con etiqueta calendario completa (1-7, 8-14, …)

---

## v4 — Espaciado en `/reservar` (jun 2026)

**Feedback**: demasiado aire entre buscador y semáforo.

**Implementado**:

- Hero: `pb-10 lg:pb-12` (antes `pb-48` + widget `-mb-32`)
- Sección semáforo: `py-10 lg:py-12` (padding simétrico arriba/abajo)
- Aplicado en es/en/fr/de `reservar-client.tsx`

---

## Umbrales actuales (referencia rápida)

```typescript
// src/app/api/occupancy-highlights/route.ts
const THRESHOLD_MODERATE = 40;
const DAYS_LEFT_TO_SKIP_CURRENT_MONTH = 3;
const MONTHS_AHEAD = 12;
```

| Constante | Efecto al subir | Efecto al bajar |
|-----------|-----------------|-----------------|
| `THRESHOLD_MODERATE` | Menos meses/semanas visibles | Más presión mostrada |
| `DAYS_LEFT_TO_SKIP_CURRENT_MONTH` | Oculta mes actual antes | Muestra mes actual más tiempo |
| `MONTHS_AHEAD` | Más meses en API | Ventana más corta |

---

**Última revisión**: Junio 2026
