import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { calculateRentalDays, type Season } from "@/lib/utils";

type SeasonMinRow = Pick<Season, "start_date" | "end_date" | "min_days">;

/** Meses pico para mínimos de sedes de entrega: julio, agosto, septiembre */
export const LOCATION_PEAK_MONTHS = [7, 8, 9] as const;

export const MURCIA_LOCATION_SLUG = "murcia";

export type LocationMinDaysRow = {
  slug?: string | null;
  min_days?: number | null;
  min_days_peak?: number | null;
  min_days_off_peak?: number | null;
};

export function isLocationPeakPickupMonth(pickupDate: string): boolean {
  const month = parseInt(pickupDate.slice(5, 7), 10);
  return (LOCATION_PEAK_MONTHS as readonly number[]).includes(month);
}

/** Devuelve el valor solo si es un mínimo "real" (> 0). 0/null/vacío => null (usar temporadas). */
function positiveMin(value: number | null | undefined): number | null {
  return value != null && value > 0 ? value : null;
}

/**
 * Regla de negocio (jun 2026):
 * - Murcia → siempre temporadas (null).
 * - Resto de sedes → SU mínimo de localización SIEMPRE manda sobre las temporadas.
 *   El tramo aplicable según el mes de recogida: pico (jul–sep) o resto (oct–jun).
 * - Excepción: si el valor del tramo aplicable es 0 (o está vacío), esa sede cae a
 *   las temporadas para ese tramo (null).
 * - `min_days` legacy: respaldo si no hay peak/off configurados.
 */
export function resolveLocationMinDays(
  pickupDate: string,
  location: LocationMinDaysRow | null | undefined
): number | null {
  if (!location || !pickupDate) return null;
  if (location.slug === MURCIA_LOCATION_SLUG) return null;

  const applicable = isLocationPeakPickupMonth(pickupDate)
    ? location.min_days_peak
    : location.min_days_off_peak;

  // El tramo aplicable manda si es > 0. Si es 0/null, respaldo en min_days legacy.
  return positiveMin(applicable) ?? positiveMin(location.min_days);
}

/**
 * Par de valores (pico / resto) para mostrar en el desplegable. null en un lado
 * significa "según temporada" para ese tramo (valor 0 o vacío).
 */
export function getLocationMinDaysDisplayPair(
  location: LocationMinDaysRow
): { peak: number | null; off: number | null } | null {
  if (location.slug === MURCIA_LOCATION_SLUG) return null;

  const legacy = positiveMin(location.min_days);
  const peak = positiveMin(location.min_days_peak) ?? legacy;
  const off = positiveMin(location.min_days_off_peak) ?? legacy;

  if (peak == null && off == null) return null;
  return { peak, off };
}

/**
 * Texto bajo cada sede en el selector de ubicación (buscador).
 * Con fecha de recogida: mínimo que aplica a esa fecha. Sin fecha: resumen pico/resto.
 */
export function formatLocationMinDaysLabel(
  location: LocationMinDaysRow,
  pickupDate: string | null,
  t: (key: string) => string
): string {
  if (location.slug === MURCIA_LOCATION_SLUG) {
    return t("Mín. según temporada");
  }

  if (pickupDate) {
    const resolved = resolveLocationMinDays(pickupDate, location);
    if (resolved != null) {
      return `${t("Mínimo")} ${resolved} ${t("días")}`;
    }
    return t("Mín. según temporada");
  }

  const pair = getLocationMinDaysDisplayPair(location);
  if (!pair) return t("Mín. según temporada");

  const peakTxt = pair.peak != null ? `${pair.peak}` : t("temporada");
  const offTxt = pair.off != null ? `${pair.off}` : t("temporada");

  if (pair.peak != null && pair.peak === pair.off) {
    return `${t("Mínimo")} ${pair.peak} ${t("días")}`;
  }

  return `${t("Mín.")} ${peakTxt}/${offTxt} ${t("días")}`;
}

/**
 * Mínimo exigido — misma regla que el buscador (search-widget + useSeasonMinDays):
 * - Ubicación con override (peak/off o min_days fijo) → ese valor según fecha de recogida.
 * - Murcia o sin override → max(min_days) de temporadas activas en la fecha de recogida.
 */
export function getRequiredMinRentalDays(
  pickupDate: string,
  seasons: SeasonMinRow[],
  location?: LocationMinDaysRow | null,
  /** @deprecated Usar `location` (objeto). Se mantiene para llamadas antiguas. */
  locationMinDays?: number | null
): number {
  const row: LocationMinDaysRow | null =
    location ??
    (locationMinDays != null ? { min_days: locationMinDays } : null);

  const fromLocation = resolveLocationMinDays(pickupDate, row);
  if (fromLocation != null) {
    return fromLocation;
  }

  const applicable = seasons.filter(
    (s) => pickupDate >= s.start_date && pickupDate <= s.end_date
  );

  if (applicable.length === 0) {
    return 2;
  }

  return Math.max(...applicable.map((s) => s.min_days ?? 2));
}

export const MINIMUM_RENTAL_DAYS_MESSAGE =
  "No se ofrecen resultados porque el periodo mínimo exigido para este periodo es superior al periodo buscado";

export type MinimumRentalDaysCheck =
  | {
      ok: true;
      rentalDays: number;
      requiredMinDays: number;
    }
  | {
      ok: false;
      rentalDays: number;
      requiredMinDays: number;
      message: string;
    };

export function checkMinimumRentalDays(params: {
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  seasons: SeasonMinRow[];
  location?: LocationMinDaysRow | null;
  /** @deprecated Usar `location` */
  locationMinDays?: number | null;
}): MinimumRentalDaysCheck {
  const rentalDays = calculateRentalDays(
    params.pickupDate,
    params.pickupTime,
    params.dropoffDate,
    params.dropoffTime
  );
  const requiredMinDays = getRequiredMinRentalDays(
    params.pickupDate,
    params.seasons,
    params.location,
    params.locationMinDays
  );

  if (rentalDays < requiredMinDays) {
    return {
      ok: false,
      rentalDays,
      requiredMinDays,
      message: MINIMUM_RENTAL_DAYS_MESSAGE,
    };
  }

  return { ok: true, rentalDays, requiredMinDays };
}

/** Temporadas activas que cubren la fecha de recogida (igual que useSeasonMinDays). */
export async function fetchSeasonsForPickupDate(
  supabase: SupabaseClient<Database>,
  pickupDate: string
): Promise<SeasonMinRow[]> {
  const { data, error } = await supabase
    .from("seasons")
    .select("start_date, end_date, min_days")
    .eq("is_active", true)
    .lte("start_date", pickupDate)
    .gte("end_date", pickupDate);

  if (error) {
    console.error("[rental-min-days] Error cargando temporadas:", error);
    return [];
  }

  return (data || []) as SeasonMinRow[];
}

export async function loadMinimumRentalDaysCheck(
  supabase: SupabaseClient<Database>,
  params: {
    pickupDate: string;
    dropoffDate: string;
    pickupTime: string;
    dropoffTime: string;
    pickupLocation?: string | null;
  }
): Promise<MinimumRentalDaysCheck> {
  const { pickupDate, dropoffDate, pickupTime, dropoffTime, pickupLocation } =
    params;

  const [seasons, locationResult] = await Promise.all([
    fetchSeasonsForPickupDate(supabase, pickupDate),
    pickupLocation
      ? supabase
          .from("locations")
          .select("slug, min_days, min_days_peak, min_days_off_peak")
          .eq("slug", pickupLocation)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (locationResult.error) {
    console.error("[rental-min-days] Error cargando ubicación:", locationResult.error);
  }

  return checkMinimumRentalDays({
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
    seasons,
    location: locationResult.data ?? null,
  });
}
