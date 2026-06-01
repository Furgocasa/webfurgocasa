# 🚦 Semáforo de Ocupación — Vista visual (v2 semanas)

## 📍 Ubicación

**URL**: https://www.furgocasa.com/es/reservar

**Posición**: Debajo del buscador, antes de «Puntos de recogida». Mismo bloque en `/en/book`, `/fr/reserver`, `/de/buchen`.

---

## 🎨 Diseño actual (jun 2026)

### Sección completa

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 Disponibilidad por semanas                                  │
│  Mira la ocupación semana a semana y reserva cuanto antes...    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─ Junio 2026 ─────────────────────── 🟡 Ocupación moderada ─┐ │
│  │ Ocupación del mes  53.7%  ████████░░░░░░░░░░               │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ POR SEMANAS                                                  │ │
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │ │
│  │ │ 1-7 │ │8-14 │ │15-21│ │22-28│ │29-30│                   │ │
│  │ │58.6%│ │51.4%│ │57.1%│ │48.6%│ │ 50% │                   │ │
│  │ │ 🟡  │ │ 🟡  │ │ 🟡  │ │ 🟡  │ │ 🟡  │                   │ │
│  │ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─ Agosto 2026 ──────────────────── 🟡 Ocupación moderada ─┐ │
│  │ ...                                                          │ │
│  │ │ 1-7 │ │8-14 │ ...                                          │ │
│  │ │ 50% │ │ 60% │ 🟠 Alta + ⏰ Últimas plazas                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  🟡 Moderado (40-60%)  🟠 Alta (60-85%)  🔴 Muy alta (>85%)     │
│                                              10 vehículos disp.  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎭 Estados por semana

| Nivel | Rango | Fondo tarjeta | Extra |
|-------|-------|---------------|-------|
| 🟡 Moderado | 40–60% | Amarillo claro | Barra amarilla |
| 🟠 Alta | 60–85% | Naranja claro | Pulso + «Últimas plazas» |
| 🔴 Muy alta | >85% | Rojo claro | Pulso + «Reserva con antelación» |
| 🟢 Baja | <40% | Verde claro | Visible dentro del mes; no genera urgencia |

La **cabecera del mes** usa el color del total mensual. Las **mini-tarjetas** usan el color de cada semana.

---

## 📱 Responsive

| Breakpoint | Grid semanas |
|------------|--------------|
| Móvil | 2 columnas |
| Tablet (`sm`) | 3 columnas |
| Desktop (`lg`) | 5 columnas (una fila por mes) |

Cada mes es una tarjeta apilada verticalmente (lista de meses con presión).

---

## 📅 Qué meses aparecen

- **Mes en curso**: visible si faltan **más de 3 días** para fin de mes (1 jun → junio completo).
- **Últimos 3 días del mes**: mes actual oculto; empieza el siguiente.
- **Mes futuro**: incluido si total ≥40% **o** alguna semana ≥40%.
- **Sin datos de presión**: el componente entero no se muestra.

---

## 🔄 Datos y cache

- Fuente: Supabase (reservas + bloqueos)
- Cache CDN: **1 hora**
- API: `/api/occupancy-highlights` → `{ months: [...] }`

---

## 💬 Textos (ES)

| Elemento | Texto |
|----------|-------|
| Título | Disponibilidad por semanas |
| Subtítulo | Mira la ocupación semana a semana… |
| Mes | Ocupación del mes |
| Bloque semanas | Por semanas |
| Alta | Últimas plazas |
| Muy alta | Reserva con antelación |

Traducciones EN/FR/DE en `translations-preload.ts`.

---

## ✅ Checklist visual

- [x] Urgencia por **semana**, no solo por mes
- [x] Meses dinámicos (sin mantener fechas a mano)
- [x] Responsive mobile-first
- [x] Pulso solo en alta/muy alta demanda
- [x] Espaciado simétrico con el buscador (`py-10 lg:py-12`)
- [x] Fallback silencioso si no hay presión

---

**Actualizado**: Junio 2026  
**Ver también**: `docs/SEMAFORO-OCUPACION.md`
