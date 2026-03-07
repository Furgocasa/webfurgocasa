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
