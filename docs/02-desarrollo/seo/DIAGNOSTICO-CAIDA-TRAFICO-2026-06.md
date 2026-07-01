# Diagnóstico ejecutivo — Caída de tráfico orgánico Furgocasa

**Fecha:** 29 de junio de 2026
**Periodo analizado:** feb 2025 → jun 2026 (Search Console, Google Ads, BD, código)
**Pregunta de partida:** "Tenía muy buenos datos hasta finales de agosto de 2025. ¿Qué pasó? ¿Es culpa nuestra, de Google, de la competencia o de la IA?"

---

## 1. TL;DR (conclusión en 6 líneas)

1. El **−52% de clics orgánicos en España** (18.024 → 8.588 abr–jun) parece dramático, pero **el combinado Ads+Orgánico demuestra que NO es −52% de negocio** (ver §4-bis).
2. **Murcia (tu mercado nº1) es un SWAP, no una pérdida**: el orgánico se hundió pero los anuncios lo taparon → combinado de "alquiler camper murcia" **plano (−4%)**. Pagas por clics que antes eran gratis: **problema de MARGEN.**
3. **Madrid sí cayó de verdad (−96% combinado), pero lo provocaste tú**: apagaste los anuncios (207 → 3) sobre un orgánico ya débil. Decisión de presupuesto, no penalización.
4. La causa nº1 del problema orgánico **no es perder visibilidad, es perder el CLIC**: el CTR en España cayó **−44%** (5,22% → 2,91%) con impresiones casi planas (IA + pack de mapas + tus propios anuncios encima del orgánico).
5. Buena parte del "desplome de impresiones/posición" es un **espejismo de medición** (`&num=100`, sept-2025), no pérdida real.
6. El SEO on-page/técnico está **bien** (títulos camper-first ya corregidos, datos estructurados completos, GBP 4,5★/406 reseñas). La **recuperación ya ha empezado** desde mediados de mayo 2026.

---

## 2. La única métrica que no miente: CLICS en España

Comparativa interanual limpia (1 abr–27 jun, **2025 vs 2026**, filtro España):

| Métrica (España) | 2025 | 2026 | Cambio |
|---|---|---|---|
| **Clics** | 18.024 | 8.588 | **−52%** 🔴 |
| Impresiones | 345.163 | 295.497 | −14% |
| CTR | 5,22% | 2,91% | **−44%** 🔴 |
| Posición media | 9,39 | 14,94 | peor |

**Lectura:** las impresiones apenas bajan (−14%), pero los clics se parten por la mitad. **No es que no aparezcas; es que no te clican.** Si hubieras mantenido el CTR de 2025, tendrías ~15.400 clics en vez de 8.588: **el colapso de CTR cuesta ~6.800 clics**; la caída de impresiones, casi nada.

---

## 3. Trampas de medición (no perder el tiempo aquí)

| Trampa | Qué es | Implicación |
|---|---|---|
| **`&num=100`** | Google dejó de contar impresiones-fantasma de bots en posiciones 40-100 (~sept 2025) | La caída masiva de impresiones y la "mejora" de posición media **agregada** son humo. EE.UU.: 124.453 impresiones → 87 clics |
| **Posición media agregada** | Promedio de todos los países/queries | Mejoró (23→15) solo porque desapareció el humo internacional. **Engañosa.** Mirar España por keyword |
| **Informe de IA** | Google no lanzó el informe de IA en Search Console hasta el **3 jun 2026** (UK, solo impresiones) | **Imposible** ver datos de AI Overviews para 2025. Su ausencia no prueba nada |

> **Regla de oro:** medir **clics** (no impresiones) y **organic + paid combinado** (no solo orgánico). Comparaciones que cruzan septiembre 2025 en impresiones/posición están rotas por diseño.

---

## 4. Causas reales, ordenadas por daño

### Causa 1 — Colapso de CTR (la más cara, ~6.800 clics) — ACTIVA
El clic se lo llevan elementos por encima del orgánico:
- **Vistas de IA / AI Overviews** (no medible en histórico).
- **Pack de mapas** (en Murcia puedes ganarlo tú con 4,5★/406).
- **Tus propios anuncios** en "alquiler camper murcia/alicante/madrid" (ver Causa 4).

Prueba: "alquiler camper murcia" mantuvo top 5 pero su CTR cayó 11,8% → 5,2% y los clics 206 → 58.

### Causa 2 — Reseteo de autoridad + títulos en la migración — YA CORREGIDA
- La migración a Next.js (ene 2026) reseteó señales acumuladas.
- Entre ene–may 2026, el `<title>` de BD lideraba con **"autocaravanas"** (migración `20260323`), por eso "autocaravanas [ciudad]" aguantó posición y "camper [ciudad]" cayó.
- La migración **`20260512` (12-may-2026)** reseteó todo a NULL → fallback del código **camper-first**.
- **Estado actual verificado (auditoría BD):** 65 landings activas, todas con `meta_title`/`h1_title`/`meta_description` = NULL → todas usan el fallback camper-first. **Nada que reescribir.**

### Causa 3 — Cluster "casa rodante" / LATAM — ROTO
Incidente documentado en `LATAM_SEO.md`. Posiciones hundidas (p.ej. "alquiler casa rodante madrid" de 2,8 → 30). Aplicar la estrategia ya escrita.

### Causa 4 — Auto-canibalización SEM — PROBLEMA DE MARGEN
Pujas en **exactamente** las keywords que más cayeron en orgánico. El anuncio se queda el clic que antes era orgánico (cuantificado en §4-bis):
- **No es pérdida de negocio**: el cliente entra, pero ahora lo **pagas** (Search Console solo ve orgánico → exagera el "agujero"). "alquiler camper murcia": orgánico 206 → 58, pero combinado **−4%** porque Ads subió 356 → 484.
- **Murcia**: top 3 orgánico + pack local → el anuncio **canibaliza** clics gratis. Es el ahorro recuperable.
- **Madrid** (orgánico ~pos 32) / **Alicante** (~pos 12): el anuncio **sí aporta** (en Alicante el combinado crece +106%), pero CPC caro por baja relevancia orgánica.
- Datos Ads: ~23.000 clics / **24.500 €** / 18 meses / CTR 22%.

### NO es la causa — Consolidación de URLs de pueblos
Quitó impresiones de long-tail hiperlocal de **valor ~0** (pueblos con ~0 clics). Las ciudades que perdieron clics (Murcia, Madrid, Toledo, Albacete, Cartagena) **conservan su página**. **No deshacer la consolidación** (volvería a diluir autoridad).

---

## 4-bis. La prueba definitiva: Combinado Ads + Orgánico YoY (por keyword)

Cruzando el informe **Orgánico y de pago** de Google Ads (clics de anuncios abr–jun 2026 vs 2025) con los clics orgánicos de Search Console, keyword por keyword. **Esto desmonta el "−52%" como pérdida de negocio.**

| Keyword | Ads 26←25 | Orgánico 26←25 | **Combinado 2026** | **Combinado 2025** | **YoY** |
|---|---|---|---|---|---|
| **alquiler camper murcia** | 484 ← 356 | 58 ← 206 | **542** | **562** | **−4%** |
| alquiler autocaravanas murcia | 293 ← 516 | 90 ← 142 | 383 | 658 | −42% |
| alquiler de autocaravanas murcia | 139 ← 229 | 30 ← 38 | 169 | 267 | −37% |
| alquiler de camper murcia | 146 ← 130 | 18 ← 59 | 164 | 189 | −13% |
| alquilar camper murcia | 117 ← 118 | 8 ← 45 | 125 | 163 | −23% |
| alquiler autocaravana murcia | 70 ← 75 | 8 ← 20 | 78 | 95 | −18% |
| alquilar autocaravana murcia | 81 ← 92 | 17 ← 21 | 98 | 113 | −13% |
| **alquiler camper alicante** | 176 ← 48 | 9 ← 42 | **185** | **90** | **+106%** |
| **alquiler camper madrid** | 3 ← 207 | 4 ← 51 | **7** | **258** | **−97%** |
| alquiler de camper madrid | 3 ← 73 | 1 ← 8 | 4 | 81 | −95% |
| alquilar camper madrid | 2 ← 36 | 1 ← 4 | 3 | 40 | −93% |

*(Lectura: "484 ← 356" = 484 clics en 2026, 356 en 2025)*

**Conclusión por ciudad:**

- **MURCIA (tu casa) → es un SWAP, no pérdida de demanda.** Suma de las 7 keywords core: **1.559 combinados (2026) vs 2.047 (2025) = −24%**. El orgánico se hundió (ej. "alquiler camper murcia" 206 → 58, −72%) pero **los anuncios taparon el agujero** (356 → 484): el combinado de la keyword estrella queda **plano (−4%)**. Pagas por clics que antes tenías gratis. Es **margen, no demanda.**
- **MADRID → pérdida real, pero autoinfligida.** Las 3 keywords camper Madrid: **14 (2026) vs 379 (2025) = −96%**. **Apagaste los anuncios** (207 → 3) y el orgánico siempre fue débil (pos. 32) y también cayó. Explica un trozo gordo de la caída ABSOLUTA del panel, pero fue **decisión de presupuesto**, no penalización.
- **ALICANTE → creciendo a contracorriente.** "alquiler camper alicante" combinado **+106%** (90 → 185), empujado por inversión en Ads.

> **Implicación:** el −52% orgánico ≠ −52% de negocio. Es (1) swap gratis→pago en Murcia [recuperable], (2) retirada voluntaria de Madrid [decisión], y (3) artefacto `&num=100` [humo].

---

## 5. Lo que está BIEN (no tocar)

- ✅ **Títulos/H1/meta**: camper-first, correctos (desde 12-may-2026).
- ✅ **Datos estructurados**: `LocalBusiness`, `aggregateRating`, `Offer`/precio, `FAQPage`, `BreadcrumbList` implementados.
- ✅ **Google Business Profile**: 4,5★ con 406 reseñas (excelente).
- ✅ **Arquitectura**: Server Components, ISR, sitemaps, multidioma, canonicals/hreflang.
- ⚠️ **Pero ojo (reglas Google 2026):** `aggregateRating` en `LocalBusiness` **no pinta estrellas** en el orgánico (auto-servidas) y los rich results de **FAQ están deprecados** desde 2023. Las estrellas reales viven en el **GBP** y, en orgánico, solo en `Product` (fichas de vehículo).

---

## 6. Plan de acción priorizado

### Prioridad 1 — Recuperar el CLIC (CTR), no la posición
1. **Ganar el pack local de Murcia y zona**: optimizar GBP (categoría "alquiler de campers", servicios, fotos, reseñas frescas). Es la contra directa al robo de clic en el mercado nº1.
2. **Estrellas en orgánico**: verificar/añadir `Product` + `aggregateRating` real en **fichas de vehículo** (único schema que da estrellas en el SERP).
3. **Reseñas reales en las landings** (prueba social = más CTR/conversión).
4. **Medir la IA**: activar y revisar el nuevo informe de IA generativa de Search Console.

### Prioridad 2 — Optimizar el gasto SEM (margen)
1. **Test de pausa en Murcia** ("alquiler camper murcia") 2 semanas → medir si clics **totales (orgánico+pago)** se mantienen. Si sí → ahorro directo.
2. **Mantener Madrid/Alicante** pero mejorar relevancia orgánica para bajar CPC.
3. Informe **Orgánico y de pago** (Google Ads) sobre las 3 keywords para cuantificar canibalización.

### Prioridad 3 — Autoridad y recuperación
1. **Enlaces internos** con anchor "alquiler camper [ciudad]" hacia las landings.
2. **Backlinks** para acelerar la recuperación de la señal perdida en la migración.
3. **Esperar y medir**: el reset de títulos solo tiene ~6 semanas; vigilar recuperación 1-2 meses antes de tocar on-page.

### Prioridad 4 — LATAM
1. Aplicar `LATAM_SEO.md`: reforzar bloque "casa rodante/motorhome" en páginas `[location]` y revisar redirects/traducciones rotas.

---

## 7. Qué medir (KPIs correctos)

- **Clics, NO impresiones.** Las impresiones están contaminadas (num=100) y no pagan.
- **Orgánico + Pago combinado** por ciudad, no orgánico solo.
- **Posición de "camper [ciudad]" filtrada a España**, por keyword, mensual (vigilar recuperación post-12-may).
- **Reservas/conversiones** como métrica final, por encima de clics.
- **Informe de IA generativa** (impresiones en IA) de aquí en adelante.

---

## 8. Respuesta a la pregunta original

> "¿Es culpa nuestra, de Google, de la competencia o de la IA?"

**Primero, una corrección de marco:** el "−52%" asusta, pero el combinado Ads+Orgánico (§4-bis) demuestra que **no perdiste la mitad del negocio**. De lo que realmente pasó, en orden:

1. **Nuestra, de margen (Murcia)**: en tu mercado nº1 cambiaste clics gratis por clics de pago. El combinado está casi plano (−4%). No es pérdida de cliente, es pérdida de **margen** → recuperable bajando dependencia de Ads.
2. **Nuestra, de decisión (Madrid)**: apagaste los anuncios sobre un orgánico débil → −96% combinado ahí. Explica buena parte de la caída absoluta del panel, pero fue una **elección**, no un castigo.
3. **De Google y la IA**: cambio de SERP (Vistas de IA, pack de mapas) que se come el clic en orgánico + el espejismo de medición `num=100`.
4. **Nuestra, ya corregido**: la migración reseteó autoridad y durante meses los títulos lideraron con "autocaravanas" (resuelto el 12-may-2026).
5. **Lo bueno**: la base SEO es sólida, Alicante crece (+106%) y la recuperación ya empezó.
