# Sedes de entrega virtuales — Modelo operativo y rentabilidad

**Última actualización:** 3 de junio de 2026  
**Estado:** Política de negocio vigente (documentación de análisis financiero y operativo)  
**Ámbito:** Madrid, Alicante, Albacete vs sede central Murcia

---

## Resumen ejecutivo

- **Toda la flota está en Murcia.** Madrid, Alicante y Albacete no son sedes con vehículos propios: son **puntos de entrega/recogida** de la flota central + **captación SEO** (landings por ciudad).
- **Murcia** (`extra_fee = 0`): recogida/devolución sin recargo; mínimo de días según temporada.
- **Madrid** (`extra_fee = 150 €/trayecto`, ida+vuelta = **300 €**): mínimo actual **20 días** en verano (protección de flota y jornadas operativas); en temporadas bajas conviene **bajar** el mínimo (7–14 días).
- **Alicante / Albacete** (`extra_fee = 100 €/trayecto`, ida+vuelta = **200 €**; `min_days = 7`): en **2026, 0 reservas web** — mantener como SEO + embudo hacia Murcia, sin subir flota.
- En la web, si el cliente elige una sede con recargo, aparece un **modal de upsell** ofreciendo Murcia sin comisión (`search-widget.tsx`).
- **Operaciones:** entregas y revisiones las cubren **Alejandro Paro** (responsable de operaciones) y **Narciso Pardo** (sociotrabajadores). No hay relevo por “días libres”: si uno está en un desplazamiento largo, el otro cubre. El recurso escaso en verano es **jornadas de socios**, no solo vehículos.

---

## 1. Modelo de negocio (no confundir con “multi-sede”)

| Concepto | Realidad |
|----------|----------|
| Flota | Una sola, base **Murcia** (códigos `FU…` en histórico y web) |
| Madrid / Alicante / Albacete | Filas en `locations` + landings `location_targets`; **sin stock local** |
| Coste fijo de “abrir sede” | ~0 (no local, no personal dedicado, no flota duplicada) |
| Downside de Alicante/Albacete | Nulo hasta que haya demanda; solo SEO y mantenimiento de contenido |

### Objetivos de las sedes virtuales

1. **SEO y captación** — Tráfico “alquiler autocaravana [ciudad]” que de otro modo no llegaría.
2. **Relleno de ocupación** — Sobre todo **estancias largas en temporada baja** (furgo que en Murcia estaría parada).
3. **Autoselección del cliente** — Recargo + modal “ahórrate la comisión viniendo a Murcia”:
   - Cliente que **paga** el recargo → cubre logística y alquiler largo en punto remoto.
   - Cliente que **cambia a Murcia** → venta sin logística y margen máximo en base.

---

## 2. Configuración técnica (base de datos y web)

### Tabla `locations` (valores de producción, junio 2026)

| `slug` | `extra_fee` (€/trayecto) | Ida + vuelta | Mínimos (recogida) | Reservas web 2026 |
|--------|--------------------------|--------------|-------------------|-------------------|
| `murcia` | 0 | 0 € | **Temporadas** (`min_days` NULL) | 97 |
| `madrid` | 150 | 300 € | **20** jul–sep · **12** oct–jun | 11 (+1 cancelada) |
| `alicante` | 100 | 200 € | **7** / **7** | 0 |
| `albacete` | 100 | 200 € | **7** / **7** | 0 |

**Implementación (jun 2026):** columnas `min_days_peak` y `min_days_off_peak` en `locations`. El mes de **recogida** jul/ago/sep usa pico; el resto usa valle. Murcia ignora estas columnas. Migración: `supabase/migrations/20260603-location-min-days-peak-offpeak.sql`. Lógica: `src/lib/rental-min-days.ts`.

- **`location_fee` en reservas** = `pickup.extra_fee + dropoff.extra_fee` (suma por trayecto).
- El importe va **incluido en `total_price`** (`base_price + extras_price + location_fee - discount`).
- Política reciente: **300 €** por entrega ida y vuelta en Madrid (150 € × 2). Antes el cobro fue irregular en reservas migradas/manual; la web ya refleja `extra_fee` en selector y API.

### Modal de upsell (búsqueda)

**Archivo:** `src/components/booking/search-widget.tsx`

Al pulsar “Buscar” con una ubicación distinta de Murcia y `extra_fee > 0`:

- Mensaje: sede central en Murcia, sin sobrecostes, mínimo de alquiler menor.
- Destaca: “¿Quieres ahorrarte los **{extra_fee × 2} €** extras de viaje?”
- Botones: **“Cambiar a Murcia sin comisión”** | **“Mantener [sede] como ubicación”**

**Selector:** `src/components/booking/location-selector.tsx` muestra badge `+{extra_fee × 2}€` en sedes con recargo.

### Landings SEO sin sede física

**Componente:** `src/components/locations/nearby-office-notice.tsx`  
Para ciudades en `location_targets` **sin** sede en esa ciudad: mensaje honesto + CTA hacia Murcia (u otra sede cercana). Distinto del modal de reserva, pero misma filosofía de reconducción.

### Histórico Excel vs web

- Tabla `historical_bookings`: ocupación 2018–2026 importada del Excel (`npm run import:historical`). **No** es operativa; ver `docs/04-referencia/admin/INFORMES-HISTORICO-EXCEL.md`.
- Para **Madrid operativo**, filtrar por campo **`location` = MADRID** (no por empresa “FURGOCASA MADRID”, que mezcla muchas recogidas en Murcia).
- **Fuente de verdad 2026:** tabla `bookings` de la web.

---

## 3. Datos 2026 (web, junio 2026)

### Por sede de recogida

| Sede | Reservas | Ingresos (`total_price`) | `location_fee` cobrado |
|------|----------|--------------------------|-------------------------|
| Murcia | 97 | ~83.811 € | 0 € |
| Madrid | 11 efectivas | ~19.671 € | 600 € (solo 4 reservas con fee; resto 0 en migración/manual) |
| Alicante | 0 | — | — |
| Albacete | 0 | — | — |

### Perfil Madrid 2026 (rentable por diseño)

- Ticket medio ~**1.788 €**/reserva vs ~864 € en Murcia.
- Duración media ~**25 días** (alineado con `min_days = 20`).
- Mayoría en **temporada baja/media** (dic–may): relleno, no canibalización del verano en Murcia.
- **Ocupación verano flota Murcia (jul–ago 2026, a fecha de consulta):** ~34 % días-furgo; precio medio ponderado verano ~**136 €/día** vs ~**83 €/día** ene–jun — justifica **no** mover furgos a Madrid en pico salvo alquileres muy largos.

### Histórico Madrid (ubicación real, referencia)

- **104** alquileres con `location` MADRID (2018–2026), ~120.669 €, media **12,2** días.
- Crecimiento reciente: 7 (2023) → 35 (2025); 2026 en histórico aún parcial (2 filas) — la web concentra el dato actual.

---

## 4. Operativa real (Alejandro / Narciso)

### Ciclo Madrid ida y vuelta (Madrid → Madrid)

Cada reserva consume **dos desplazamientos** del equipo:

1. **Entrega:** Conducir furgo Murcia → Madrid; socio vuelve en **tren** (+ taxis en Madrid si aplica).
2. **Devolución:** Subir en **tren** a Madrid; **revisión con el cliente** en Madrid; conducir furgo Madrid → Murcia.

**Implicación:** ~**2 jornadas completas** por reserva (Alejandro o Narciso). En verano esas jornadas compiten con entregas/revisiones en Murcia.

### Cobertura entre socios

- **Alejandro Paro** — Responsable de operaciones (entregas, revisiones, desplazamientos).
- **Narciso Pardo** — Socio; cubre cuando el otro está en viaje de entrega larga.
- **No hay calendario de “libres”** en el sentido de empresa con plantilla: sociotrabajadores en España, operación continua. El límite práctico es **capacidad de jornadas**, no un tercer operario de relevo.

### Sentido único (Madrid → Murcia) — no es el modelo por defecto

Teóricamente el cliente podría devolver en Murcia y la revisión hacerse en base (1 viaje del socio en lugar de 2). **No es viable como oferta general:** el cliente típico de Madrid quiere **recoger y devolver en Madrid**; la revisión en devolución la hace el equipo en el punto acordado. No se debe planificar operación asumiendo que el cliente reposiciona la furgo.

---

## 5. Economía del recargo (300 € Madrid)

### Coste de caja estimado por ciclo ida y vuelta

| Partida | Rango orientativo |
|---------|-------------------|
| Combustible (2 × ~400 km) | ~130 € |
| Trenes socio (2 viajes) | ~90–110 € |
| Taxis Madrid | ~80–100 € |
| Hotel (ocasional) | ~40–70 € |
| **Total caja (sin imputar sueldo)** | **~320–410 €** |

Con **300 €** de recargo: la línea logística queda **casi neutra en caja**; el margen del negocio viene del **alquiler** (días × precio/día).

### “Peaje” Madrid en verano (coste de oportunidad)

Además de la caja, en **jul–ago** hay ~**2 días** de furgo en tránsito y jornadas de socio. A ~136 €/día de precio medio en verano, solo el tránsito representa ~**272 €** de facturación potencial perdida en Murcia, más las 2 jornadas.

Por eso el recargo **no basta** solo con cubrir gasolina+tren: hace falta **duración larga** para diluir el peaje sobre el ingreso del alquiler.

| Días alquiler Madrid (verano, ~136 €/día) | Peaje ~290 € implícito | % sobre ingreso bruto orientativo |
|-------------------------------------------|------------------------|-----------------------------------|
| 5 días | ~290 € | ~43 % — evitar |
| 10 días | ~290 € | ~21 % — dudoso |
| 14 días | ~290 € | ~15 % — límite |
| **20 días** | ~290 € | **~11 %** — política actual ✅ |

### Temporada baja

- Furgo **parada** en Murcia → oportunidad de tránsito ≈ 0.
- Peaje efectivo ≈ caja − 300 € ≈ **20 €**.
- Break-even de duración **mucho menor** (desde ~8–10 días ya compensa).

---

## 6. Política estacional (`min_days_peak` / `min_days_off_peak`)

Configurable en **Admin → Ubicaciones** (solo sedes de entrega; Murcia en **Temporadas**).

| Sede | Pico (jul, ago, sep) | Resto (oct–jun) |
|------|----------------------|-----------------|
| Madrid | 20 | 12 |
| Alicante / Albacete | 7 | 7 |

Ajustar en admin sin tocar código. Alicante/Albacete: mantener **200 €** de fee hasta haya demanda.

---

## 7. Decisiones estratégicas (checklist)

| Pregunta | Respuesta documentada |
|----------|----------------------|
| ¿Cerrar Madrid? | **No.** Embudo con upside en valle; en pico solo alquileres largos. |
| ¿Cerrar Alicante/Albacete? | **No como SEO**; **sí** evitar flota o personal allí (ya es así). |
| ¿Subir recargo Madrid? | Opcional si se quiere margen en logística; a 300 € ya se cubre caja. |
| ¿Bajar `min_days` en verano? | **No** mientras precio/día verano ~136 € y 2 jornadas/reserva. |
| ¿Aplicar siempre `location_fee`? | **Sí** — coherente con `extra_fee` en BD (implementación reciente). |

---

## 8. Archivos y consultas útiles

| Qué | Dónde |
|-----|--------|
| Sedes y recargos | `locations.extra_fee`, `locations.min_days` |
| Cálculo fee reserva | `src/lib/rental-search-pricing.ts`, `src/app/api/availability/route.ts` |
| Modal Murcia sin comisión | `src/components/booking/search-widget.tsx` |
| Migración mínimo Madrid | `supabase/migrations/add-min-days-to-locations.sql` |
| Informes histórico + web | `docs/04-referencia/admin/INFORMES-HISTORICO-EXCEL.md`, `/administrator/informes` |
| Anillo SEO sedes | `supabase/migrations/20260323-location-targets-ring-madrid-alicante-albacete.sql` |

### Consulta rápida reservas por sede (service role)

```sql
SELECT l.slug, COUNT(*) AS n, SUM(b.total_price) AS ingresos, SUM(b.location_fee) AS fees
FROM bookings b
JOIN locations l ON l.id = b.pickup_location_id
GROUP BY l.slug
ORDER BY n DESC;
```

---

## 9. Actualización de datos

Los importes de **2026** en este documento se obtuvieron de la BD de producción en **junio de 2026**. Revisar trimestralmente o tras cambiar `extra_fee` / `min_days`.

**Responsables operativos citados:** Alejandro Paro (operaciones), Narciso Pardo (socio, cobertura mutua).

---

## Documentos relacionados

- [PROCESO-RESERVA-COMPLETO.md](./PROCESO-RESERVA-COMPLETO.md) — Flujo de búsqueda y reserva
- [FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md) — Reglas críticas de reservas
- [INFORMES-HISTORICO-EXCEL.md](../admin/INFORMES-HISTORICO-EXCEL.md) — Histórico 2018–2026
- [NEARBY-OFFICE-NOTICE-IMPLEMENTATION.md](../otros/NEARBY-OFFICE-NOTICE-IMPLEMENTATION.md) — Landings ciudad sin sede
- [SUPABASE-SCHEMA-REAL.md](../arquitectura/SUPABASE-SCHEMA-REAL.md) — Campos `locations` y `bookings`
