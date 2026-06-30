# Diagnóstico caída de tráfico + Enlazado interno (Junio 2026)

> Documento de referencia. Reúne (1) el diagnóstico de la caída de tráfico orgánico
> desde finales de agosto 2025, (2) la explicación honesta sobre el término "camper" en
> España y (3) la implementación de enlazado interno blog → landings de ciudad.
>
> **Fuentes analizadas (jun 2026):** exports GSC `Performance-on-Search` (abr–jun YoY,
> ventana ago–sep 2025 vs jun–jul 2025), informe Ads+Orgánico Google Ads, cruce keyword
> por keyword. Los CSV originales ya no se conservan en el repo; las conclusiones viven aquí.

---

## 1. TL;DR

- La caída orgánica **−52% YoY en clics (España)** **no equivale a una caída del negocio del −52%**.
- Es una mezcla de:
  1. **Problema de margen** (canibalización SEM: pagamos por clics que antes eran orgánicos gratis).
  2. **Decisiones deliberadas** (retirada de anuncios en Madrid, empuje en Alicante).
  3. **Cambios de Google/IA** (eliminación del parámetro `&num=100` en sept-2025 y AI Overviews).
  4. **Factores internos** (ya corregidos: URLs, metadatos, estructura).
- El término **"camper" NO perdió posición** (de hecho mejoró). Lo que cayó fueron **clics + impresiones**, y las impresiones cayeron en gran parte por **artefacto de medición**, no por pérdida real de visibilidad.

---

## 2. El caso "camper" en España (lectura correcta de GSC)

Filtro GSC: consulta contiene "camper", país España, 16 meses.

| Métrica | Valor | Lectura |
|---|---|---|
| Clics | 8,19 mil | Es el dato que de verdad cayó |
| Impresiones | 343 mil | Caída en gran parte **artificial** |
| CTR | 2,4 % | Bajo → margen real de mejora |
| Posición media | 23 | La tendencia (línea naranja) **mejoró** |

### 2.1 Por qué NO se "arreglaron" impresiones ni posiciones

- **Las impresiones no eran una avería on-page.** En **septiembre 2025 Google eliminó el parámetro `&num=100`**. Esto hizo desaparecer impresiones "fantasma" de las posiciones 11–100 que generaban scrapers y herramientas SEO. La caída de impresiones es por tanto **un cambio de medición**, no una pérdida proporcional de visibilidad real.
- **La posición no empeoró: mejoró.** La "posición media 23" es el promedio mezclado de cientos de consultas long-tail; en las keywords de dinero la posición está mejor que ese promedio.
- **Conclusión:** el problema real era de **clics** (CTR + canibalización SEM + AI Overviews + retirada de ads en Madrid), no de ranking on-page. Por eso la estrategia ataca **CTR y relevancia/autoridad de las páginas de dinero**, no las impresiones (que dependen de Google/medición y están fuera del control on-page).

### 2.2 Ventana del desplome inicial (Joomla, ago–sep 2025 vs jun–jul 2025, solo España)

| Métrica | jun–jul 25 | ago–sep 25 | Cambio |
|---|---|---|---|
| Clics | 14.244 | 11.571 | −19% |
| Impresiones | 403.653 | 452.355 | +12% |
| CTR | 3,53% | 2,56% | −28% |
| Posición | 16,6 | 20,1 | peor |

Paradoja clave: **más impresiones pero menos clics** → empeoramiento de posición/CTR, no pérdida de visibilidad bruta. La web Next.js entró en **enero 2026**; el inicio de la caída fue **en Joomla**.

---

## 3. Combinado Ads + Orgánico YoY (por keyword)

Fuente: GSC (orgánico) + Google Ads Paid & Organic, Abr–Jun 2025 vs Abr–Jun 2026.

| Keyword | Orgánico YoY | Ads YoY | Combinado | Conclusión |
|---|---|---|---|---|
| alquiler camper murcia | ↓ | ↑ | ≈ plano | Swap orgánico→pago (problema de **margen**, no de demanda) |
| alquiler camper alicante | ↓ | ↑↑ | ↑ | Crecimiento real impulsado por ads |
| alquiler camper madrid | ↓ | ↓↓ | ↓↓ | Caída por **retirada deliberada** de anuncios |

**Canibalización SEM (filas "Ambos" en informe Ads+Orgánico):** en "alquiler camper murcia", el anuncio se llevaba ~1.364 clics y el orgánico ~41 cuando aparecían juntos; CTR orgánico ~1%.

---

## 4. Diagnóstico del enlazado interno (estado previo)

Auditoría de cómo se enlazaba internamente hacia las landings de ciudad de alquiler
(`/alquiler-autocaravanas-campervans/[slug]`).

| Origen | ¿Enlaza a landings? | Anchor text |
|---|---|---|
| Blog (código) | ❌ No (hueco principal) | — |
| Blog (CTAs sidebar/banners) | ❌ Iban a `/vehiculos` y `/ofertas` | "Ver flota" |
| `DestinationsGrid` (home + landings) | ✅ Sí | `MURCIA` (solo nombre, mayúsculas) |
| `alquiler-campers-gran-volumen` | ✅ 6 ciudades | `Murcia` (solo nombre) |
| sitemap-html | ✅ Todas | la URL |
| Header / Footer | ❌ Ninguna | — |

**Dos problemas clave:**
1. El **blog (que rankea bien) no pasaba autoridad** a las páginas de dinero. El dato `posts.location_tags` solo se usaba en sentido inverso (la landing muestra artículos).
2. **Anchor text flojo para SEO local**: en todo el sitio se usaba "MURCIA", nunca "alquiler camper en Murcia".

**Cobertura de datos verificada:**
- 273 posts totales · **195 con `location_tags` (71 %)** · 78 sin etiquetar.
- 65 landings activas en `location_targets`.

---

## 5. Implementación realizada

Cuatro mejoras (A, B, C, D), todas modificando archivos existentes.

### A — CTA geolocalizado blog → landing (la más potente)
En cada artículo se lee la **primera ciudad de `location_tags` que tenga landing activa** y se
muestra un bloque destacado tras el contenido con anchor de la keyword de dinero:
**"Alquiler de campers y autocaravanas en {Ciudad} →"**. Pasa autoridad del blog a las páginas de dinero.

### B — Bloque "Alquiler por ciudad" en el footer (enlaces sitewide)
Fila nueva en el footer con 7 ciudades de dinero (Murcia, Alicante, Madrid, Cartagena, Albacete,
Almería, Valencia), anchor **"Alquiler de campers en {Ciudad}"**. Enlaces internos desde todas las páginas.

### C — Anchor del `DestinationsGrid` (sin tocar el diseño)
Añadidos `aria-label`, `title` y `<span class="sr-only">Alquiler de campers en</span>` antes del
nombre. Google lee "Alquiler de campers en Murcia"; visualmente idéntico.

### D — Sidebar del blog geolocalizado
El CTA del sidebar (antes siempre `/vehiculos`) ahora apunta a la landing de la ciudad del post
con anchor **"Alquiler de campers en {Ciudad}"**, con fallback a `/vehiculos` si el post no tiene ciudad.

### Metadatos para CTR (cambio relacionado)
Fallbacks reescritos en la landing de alquiler para atacar el CTR del 2,4 %:
- Título: `Alquiler de Campers y Autocaravanas en {Ciudad} · 95€/día`
- Descripción: incluye precio (95€/día), km ilimitados, asistencia 24/7, cancelación gratuita y 50% al reservar.

> Detalle de archivos: ver commit `11ce3f9d` y `docs/02-desarrollo/blog/LOCATION-TAGS-ARTICULOS.md`.

---

## 6. Qué NO se hizo (y por qué)

- **No se "recuperaron" impresiones.** Su caída es principalmente medición (`num=100`) + IA: fuera del control on-page.
- **No se añadieron valoraciones/estrellas on-page** en las campers (decisión del cliente). La vía
  para estrellas en SERP es Google Business Profile + `Product` schema, no `AggregateRating` sobre `LocalBusiness`.

---

## 7. Seguimiento y pendientes

- **Medir en GSC** las 5–6 keywords de dinero por ciudad enfocando **CTR y posición** (no impresiones).
  Horizonte: CTR en semanas; enlazado/posición en 1–3 meses.
- **Etiquetar los 78 posts** sin `location_tags` para que también muestren el CTA geolocalizado.
- Replicar patrón de anchor en banners del blog (opcional).

---

## 8. Comandos útiles

```bash
npm run check:location-tags
npm run audit:location-seo-db:insecure
npm run assign:location-tags:dry
```
