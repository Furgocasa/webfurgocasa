import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { calculateRentalDays, type Season } from "@/lib/utils";

type SeasonMinRow = Pick<Season, "start_date" | "end_date" | "min_days">;

/**
 * Mínimo exigido — misma regla que el buscador (search-widget + useSeasonMinDays):
 * - Ubicación con min_days fijo → ese valor.
 * - Si no → max(min_days) de las temporadas activas en la **fecha de recogida** únicamente.
 *   No se usa el mínimo de temporadas posteriores del viaje (p. ej. alta 7 días al cruzar el 22-jun).
 */
export function getRequiredMinRentalDays(
  pickupDate: string,
  seasons: SeasonMinRow[],
  locationMinDays: number | null | undefined
): number {
  if (locationMinDays != null) {
    return locationMinDays;
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
          .select("min_days")
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
    locationMinDays: locationResult.data?.min_days ?? null,
  });
}
