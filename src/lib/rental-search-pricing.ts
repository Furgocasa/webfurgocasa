import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  calculateRentalDays,
  calculatePricingDays,
  calculateSeasonalPrice,
  calculateSeasonalSurcharge,
  calculateDurationDiscount,
  type Season,
} from "@/lib/utils";

export type SearchPricingResult = {
  days: number;
  pricingDays: number;
  hasTwoDayPricing: boolean;
  pricePerDay: number;
  originalPricePerDay: number;
  basePrice: number;
  locationFee: number;
  totalPrice: number;
  originalTotalPrice: number;
  season: string;
  seasonBreakdown: ReturnType<typeof calculateSeasonalPrice>["seasonBreakdown"];
  seasonalAddition: number;
  durationDiscount: number;
  hasDurationDiscount: boolean;
};

/**
 * Misma lógica que GET /api/availability para el bloque de precios (temporadas, 2 días→3, ubicación).
 */
export async function buildPricingForSearch(
  supabase: SupabaseClient<Database>,
  params: {
    pickupDate: string;
    dropoffDate: string;
    pickupTime: string;
    dropoffTime: string;
    pickupLocation: string | null;
    dropoffLocation: string | null;
  }
): Promise<SearchPricingResult> {
  const {
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
    pickupLocation,
    dropoffLocation,
  } = params;

  const days = calculateRentalDays(
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime
  );
  const pricingDays = calculatePricingDays(days);
  const hasTwoDayPricing = days === 2;

  const { data: seasonsData } = await supabase
    .from("seasons")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", dropoffDate)
    .gte("end_date", pickupDate);

  const seasons = (seasonsData || []) as Season[];
  const priceResult = calculateSeasonalPrice(pickupDate, pricingDays, seasons);
  const seasonalAddition = calculateSeasonalSurcharge(
    priceResult.avgPricePerDay,
    pricingDays
  );
  const durationDiscountInfo = calculateDurationDiscount(
    pickupDate,
    pricingDays,
    seasons
  );

  const locationSlugs = [pickupLocation, dropoffLocation].filter(
    Boolean
  ) as string[];
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .in("slug", locationSlugs);

  let locationFee = 0;
  const pickupLoc = locations?.find((l) => l.slug === pickupLocation);
  const dropoffLoc = locations?.find((l) => l.slug === dropoffLocation);
  locationFee =
    (pickupLoc?.extra_fee || 0) + (dropoffLoc?.extra_fee || 0);

  const baseTotal = priceResult.total;
  const originalTotal = durationDiscountInfo.originalTotal;
  const totalWithLocationFee = baseTotal + locationFee;
  const originalTotalWithLocationFee = originalTotal + locationFee;
  const pricePerDayWithLocation = totalWithLocationFee / pricingDays;
  const originalPricePerDayWithLocation =
    originalTotalWithLocationFee / pricingDays;
  const effectiveDiscountPercentage =
    originalTotalWithLocationFee > 0
      ? Math.round(
          ((originalTotalWithLocationFee - totalWithLocationFee) /
            originalTotalWithLocationFee) *
            1000
        ) / 10
      : 0;

  return {
    days,
    pricingDays,
    hasTwoDayPricing,
    pricePerDay: Math.round(pricePerDayWithLocation * 100) / 100,
    originalPricePerDay:
      Math.round(originalPricePerDayWithLocation * 100) / 100,
    basePrice: Math.round(baseTotal * 100) / 100,
    locationFee: Math.round(locationFee * 100) / 100,
    totalPrice: Math.round(totalWithLocationFee * 100) / 100,
    originalTotalPrice: Math.round(originalTotalWithLocationFee * 100) / 100,
    season: priceResult.dominantSeason,
    seasonBreakdown: priceResult.seasonBreakdown,
    seasonalAddition,
    durationDiscount: effectiveDiscountPercentage,
    hasDurationDiscount: effectiveDiscountPercentage > 0,
  };
}
