import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { calculateRentalDays, parseDateString, toDateString, type Season } from "@/lib/utils";

type SeasonMinRow = Pick<Season, "start_date" | "end_date" | "min_days">;

/**
 * Mínimo exigido según el buscador:
 * - Ubicación con min_days fijo → ese valor.
 * - Si no → el mayor min_days de las temporadas que cubren algún día del alquiler
 *   (más estricto que solo la fecha de recogida; evita trampas en rangos mixtos).
 */
export function getRequiredMinRentalDays(
  pickupDate: string,
  dropoffDate: string,
  pickupTime: string,
  dropoffTime: string,
  seasons: SeasonMinRow[],
  locationMinDays: number | null | undefined
): number {
  if (locationMinDays != null) {
    return locationMinDays;
  }

  const rentalDays = calculateRentalDays(
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime
  );

  if (rentalDays < 1) {
    return 2;
  }

  let maxMin = 2;
  const startDate = parseDateString(pickupDate);

  for (let i = 0; i < rentalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = toDateString(currentDate);

    const applicable = seasons.filter(
      (s) => dateStr >= s.start_date && dateStr <= s.end_date
    );

    for (const season of applicable) {
      maxMin = Math.max(maxMin, season.min_days ?? 2);
    }
  }

  return maxMin;
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
    params.dropoffDate,
    params.pickupTime,
    params.dropoffTime,
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

/** Temporadas que solapan con el periodo de alquiler (misma consulta que precios en availability). */
export async function fetchSeasonsForRentalRange(
  supabase: SupabaseClient<Database>,
  pickupDate: string,
  dropoffDate: string
): Promise<SeasonMinRow[]> {
  const { data, error } = await supabase
    .from("seasons")
    .select("start_date, end_date, min_days")
    .eq("is_active", true)
    .lte("start_date", dropoffDate)
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
    fetchSeasonsForRentalRange(supabase, pickupDate, dropoffDate),
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
