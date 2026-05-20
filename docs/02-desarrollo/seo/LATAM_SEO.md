# Estrategia SEO LATAM - Motorhome y Casa Rodante

## Contexto del problema

En **España** la gente busca principalmente:
- **Autocaravana**
- **Camper**

En **América Latina** (LATAM) la gente busca:
- **Motorhome**
- **Casa rodante**

La misma URL `/alquiler-autocaravanas-campervans/[location]` está optimizada para terminología española. El público LATAM no usa esos términos y puede no encontrar nuestras páginas.

---

## Estrategia elegida: Opción 2 (una sola página mejorada)

**Decisión:** LATAM es minoritario. En lugar de crear landings separadas, se mejora la página existente con:

1. **H2 con keywords LATAM** (motorhome, casa rodante)
2. **Sección dedicada** para visitantes de América Latina
3. **Meta title y description** actualizados con términos LATAM

### Ventajas de esta opción
- Una sola página fuerte (sin duplicar contenido)
- Sin riesgo de canibalización
- Menor esfuerzo de mantenimiento
- Si el tráfico LATAM crece, se puede evaluar landings separadas más adelante

### Alternativa futura (si LATAM crece)
Si el tráfico LATAM se vuelve significativo, crear:
- `/alquiler-motorhome-casa-rodante/[location]` — landings separadas con contenido diferenciado

---

## Implementación realizada

### Archivo modificado
`src/app/es/alquiler-autocaravanas-campervans/[location]/page.tsx`

### Cambios aplicados

#### 1. Meta title y description
**Sin cambios.** Se mantienen centrados en **campers** y autocaravanas. La identidad principal es camper.

#### 2. H2 adicional en sección de vehículos
- **H2:** "Alquiler de Motorhomes y Casa Rodante en {ciudad}"
- Ubicado en la sección de vehículos, junto al H2 existente.

#### 3. Nueva sección LATAM
- **H2:** "¿Buscas alquilar un motorhome o casa rodante en {ciudad}?"
- **Contenido:** Explica que en España se llaman autocaravanas o campers, pero es lo mismo. Invita a visitantes de Argentina, México, Colombia, Chile y resto de LATAM.
- **Ubicación:** Entre ExtrasSection y aviso de oficina cercana.
- **Estilo:** Fondo gradiente ámbar/naranja (amber-50 to orange-50) para diferenciarla visualmente.

---

## Keywords objetivo

| Audiencia | España | LATAM |
|-----------|--------|-------|
| Término 1 | Autocaravana | Motorhome |
| Término 2 | Camper | Casa rodante |
| URL actual | `/alquiler-autocaravanas-campervans` | ✓ (incluye keywords en H2, meta, sección) |

---

## Métricas a revisar

1. **Impresiones** en Search Console para queries con "motorhome", "casa rodante", "alquiler motorhome Madrid", etc.
2. **Tráfico** desde países LATAM (Argentina, México, Colombia, Chile, etc.)
3. **CTR** en resultados de búsqueda para las nuevas meta titles

---

## Notas

- Las ubicaciones con `meta_title` o `meta_description` personalizados en Supabase **no** se ven afectadas por el cambio de fallback.
- Los textos de la sección LATAM usan `t()` para traducción; en español devuelven el texto tal cual.
- Si en el futuro se implementan landings separadas, ver `LATAM_SEO.md` para el contexto y la estrategia alternativa.

---

## Incidente: landing `/es/alquiler-motorhome-madrid` (marzo-mayo 2026)

### Qué pasó

El 20 de marzo de 2026 (commit `1fdc596a`) se creó una **landing separada LATAM** para Madrid (`/es/alquiler-motorhome-madrid`) contradiciendo la "Opción 2" documentada arriba. Esa landing acumuló **tres bugs críticos en producción** durante 2 meses:

1. **Bucle infinito de redirect** en `next.config.js`: la URL canónica se auto-redirigía a sí misma → `ERR_TOO_MANY_REDIRECTS`. Visitantes y Googlebot no podían acceder.
2. **`ReferenceError: Phone is not defined`** en el componente `motorhome-rental-madrid-landing.tsx`: faltaba el import del icono. Cuando el redirect-loop se arregló, la página seguía dando `Application error: a client-side exception has occurred`.
3. **Claves de traducción técnicas en bruto** (`"FAQ vocab camper motorhome latam question/answer"`) visibles literalmente en TODAS las landings dinámicas `[location]/page.tsx` en español, porque la función `t()` devuelve la clave cuando el idioma es `es`. Afectaba a Madrid, Alicante, Murcia, Barcelona, Valencia, etc.

### Impacto observable

- Caída pronunciada de tráfico desde Argentina (y resto de LATAM) en Search Console entre marzo y mayo de 2026.
- Posicionamiento perdido en queries como `alquiler casa rodante madrid`, `alquiler de motorhome en madrid españa`.
- Tasa de rebote disparada en landings de ciudad por el texto "FAQ vocab camper motorhome latam..." visible en bruto.

### Decisión tomada (20 mayo 2026)

**Volver a la Opción 2 documentada al 100%**, eliminando la landing separada de Madrid:

1. **Eliminada** la página física `src/app/es/alquiler-motorhome-madrid/page.tsx`.
2. **Eliminado** el componente huérfano `src/components/landing/motorhome-rental-madrid-landing.tsx`.
3. **Redirects 301** en `next.config.js` consolidados: `/es/alquiler-motorhome-madrid`, `/alquiler-motorhome-madrid`, `/es/alquiler-casas-rodantes-madrid` y `/alquiler-casas-rodantes-madrid` → todos apuntan a `/es/alquiler-autocaravanas-campervans/madrid` (la dinámica con sección LATAM).
4. **Bug Phone import** arreglado preventivamente antes de eliminar el archivo (commit `071d6b1f`).
5. **Bug claves traducción** arreglado en `[location]/page.tsx` + `home.ts` (commit `071d6b1f`): se usa el texto en español como clave (patrón correcto del sistema `t()`).
6. **Eliminada** la entrada del sitemap-html (`src/app/es/sitemap-html/page.tsx`) y del responsive tester (`TESTER/routes.json`).

### Reglas para evitar repetir el incidente

- ❌ **NO crear landings separadas LATAM** por ciudad. La estrategia es una sola página fuerte por ciudad (la dinámica `[location]`) con sección LATAM dentro.
- ❌ **NO añadir redirects con `source === destination`** en `next.config.js` (causa loop infinito en producción).
- ✅ **Cuando se use `t("...")`**, la clave debe ser **el texto real en español**, NO una clave técnica abstracta. Si el idioma es `es`, la función devuelve la clave tal cual.
- ✅ **Probar SIEMPRE en producción** (no solo en local) tras hacer cambios en redirects o crear landings nuevas. El `TESTER/` con Puppeteer ayuda a detectar `Application error` y similares.
- ✅ **Si el futuro tráfico LATAM lo justifica**, considerar primero **mejorar la sección LATAM existente** dentro de `[location]/page.tsx` (descuento -15%, contenido específico aeropuerto Barajas para Madrid, etc.) antes de plantear landings separadas.

### Pendiente (Fase 2 — futuro)

- Mejorar la sección LATAM dentro de `[location]/page.tsx` con el contenido bueno que tenía la landing eliminada (descuento -15% LATAM, info Aeropuerto Barajas cuando `location === 'madrid'`).
- Replicar la sección LATAM en `[location]/page.tsx` de EN/FR/DE (actualmente solo existe en ES).
