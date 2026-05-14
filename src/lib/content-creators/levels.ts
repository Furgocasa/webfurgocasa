/**
 * Niveles de colaboración (programa Creadores de contenido)
 * =========================================================
 * Fuente única de verdad para:
 *   - Landing pública /es/creadores-de-contenido (server component).
 *   - Formulario de solicitud (client component).
 *   - API /api/creator-collaboration (cálculo del nivel para el email).
 *
 * Sincronizado con la tabla pública y con
 * docs/02-desarrollo/contenido/GUIA_CONTENIDO.md §2.
 *
 * ⚠️ Este archivo NO lleva "use client" porque debe poder importarse
 * desde server components sin atravesar la frontera de cliente
 * (un import de un módulo "use client" desde un server component
 * provoca SSR error: "An error occurred in the Server Components render").
 */

export interface CollabLevel {
  tag: "Tiny" | "Light" | "Standard" | "Premium";
  cesion: string;
  fotos: string;
  broll: string;
  editada: string;
}

export const COLLAB_LEVELS: CollabLevel[] = [
  {
    tag: "Tiny",
    cesion: "1 día",
    fotos: "10–15 fotos (2–3 escenas)",
    broll: "3–5 min útiles",
    editada: "—",
  },
  {
    tag: "Light",
    cesion: "2–3 días",
    fotos: "25–35 fotos (más localizaciones)",
    broll: "10–15 min útiles",
    editada: "1 reel vertical (experiencia, recorrido, explicación o talking-head)",
  },
  {
    tag: "Standard",
    cesion: "4–5 días",
    fotos: "45–60 fotos (variedad real)",
    broll: "20–30 min útiles",
    editada: "2 reels verticales",
  },
  {
    tag: "Premium",
    cesion: "Hasta 7 días de cesión de camper",
    fotos: "70–100 fotos",
    broll: "40–50 min útiles",
    editada: "2–3 reels verticales + 1 vídeo experiencia de hasta 90 s",
  },
];

export const MAX_REQUESTED_DAYS = 14;

/**
 * Devuelve el nivel que corresponde a `days`. Para >7 días devuelve `null`
 * (se valora caso por caso fuera de la tabla pública).
 */
export function levelFromDays(days: number | null | undefined): CollabLevel | null {
  if (!days || !Number.isFinite(days) || days < 1) return null;
  if (days === 1) return COLLAB_LEVELS[0];
  if (days <= 3) return COLLAB_LEVELS[1];
  if (days <= 5) return COLLAB_LEVELS[2];
  if (days <= 7) return COLLAB_LEVELS[3];
  return null;
}

/**
 * Versión "etiqueta" para uso en backend cuando hay que reflejar también el
 * tramo "fuera de tabla" (>7 días) en logs/emails sin null.
 */
export function levelTagFromDays(days: number): CollabLevel["tag"] | "Fuera de tabla" {
  const lvl = levelFromDays(days);
  return lvl ? lvl.tag : "Fuera de tabla";
}
