import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { calculateRentalDays, type Season } from "@/lib/utils";

/** Misma regla que el buscador: ubicación con min_days fijo, si no, temporada de la fecha de recogida. */
export function getRequiredMinRentalDays(
  pickupDate: string,
  seasons: Pick<Season, "start_date" | "end_date" | "min_days">[],
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
  seasons: Pick<Season, "start_date" | "end_date" | "min_days">[];
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

  const [{ data: seasonsData }, { data: locationData }] = await Promise.all([
    supabase
      .from("seasons")
      .select("start_date, end_date, min_days")
      .eq("is_active", true)
      .lte("start_date", pickupDate)
      .gte("end_date", pickupDate),
    pickupLocation
      ? supabase
          .from("locations")
          .select("min_days")
          .eq("slug", pickupLocation)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return checkMinimumRentalDays({
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
    seasons: (seasonsData || []) as Pick<
      Season,
      "start_date" | "end_date" | "min_days"
    >[],
    locationMinDays: locationData?.min_days ?? null,
  });
}
