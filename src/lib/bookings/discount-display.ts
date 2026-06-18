export interface BookingDiscountFields {
  discount?: number | null;
  coupon_discount?: number | null;
  coupon_code?: string | null;
  last_minute_offer_id?: string | null;
}

export interface LastMinuteOfferSnapshot {
  id: string;
  discount_percentage: number;
  original_price_per_day?: number;
  final_price_per_day?: number;
  offer_days?: number;
  status?: string;
}

export type BookingDiscountKind = "coupon" | "offer" | "manual" | "none";

export function getCouponDiscountAmount(booking: BookingDiscountFields): number {
  return booking.coupon_discount || 0;
}

export function isLastMinuteOfferBooking(
  booking: BookingDiscountFields,
  offer?: LastMinuteOfferSnapshot | null
): boolean {
  if (booking.last_minute_offer_id || offer?.id) return true;
  return false;
}

export function getOfferSavingsAmount(
  booking: BookingDiscountFields,
  offer?: LastMinuteOfferSnapshot | null
): number {
  if (!isLastMinuteOfferBooking(booking, offer)) return 0;
  return booking.discount || 0;
}

export function getManualDiscountAmount(booking: BookingDiscountFields): number {
  if (getCouponDiscountAmount(booking) > 0) return 0;
  if (isLastMinuteOfferBooking(booking)) return 0;
  return booking.discount || 0;
}

/** Descuento que se resta al calcular total_price (cupón o manual admin, no oferta). */
export function getDiscountSubtractedFromTotal(booking: BookingDiscountFields): number {
  const coupon = getCouponDiscountAmount(booking);
  if (coupon > 0) return coupon;
  if (isLastMinuteOfferBooking(booking)) return 0;
  return booking.discount || 0;
}

export function calculateBookingTotalPrice(input: {
  base_price: number;
  extras_price?: number | null;
  location_fee?: number | null;
  discount?: number | null;
  coupon_discount?: number | null;
  coupon_code?: string | null;
  last_minute_offer_id?: string | null;
  stripe_fee_total?: number | null;
}): number {
  const total =
    input.base_price +
    (input.extras_price || 0) +
    (input.location_fee || 0) -
    getDiscountSubtractedFromTotal(input) +
    (input.stripe_fee_total || 0);

  return Math.max(0, Math.round(total * 100) / 100);
}

export function resolveBookingDiscountKind(
  booking: BookingDiscountFields,
  offer?: LastMinuteOfferSnapshot | null
): BookingDiscountKind {
  if (getCouponDiscountAmount(booking) > 0) return "coupon";
  if (getOfferSavingsAmount(booking, offer) > 0) return "offer";
  if (getManualDiscountAmount(booking) > 0) return "manual";
  return "none";
}

export function getBookingDiscountLabel(
  booking: BookingDiscountFields,
  offer?: LastMinuteOfferSnapshot | null,
  labels?: {
    couponPrefix?: string;
    offerPrefix?: string;
    manualLabel?: string;
  }
): string {
  const kind = resolveBookingDiscountKind(booking, offer);
  const couponPrefix = labels?.couponPrefix ?? "Cupón";
  const offerPrefix = labels?.offerPrefix ?? "Oferta última hora";
  const manualLabel = labels?.manualLabel ?? "Descuento";

  if (kind === "coupon") {
    return booking.coupon_code
      ? `${couponPrefix} ${booking.coupon_code}`
      : couponPrefix;
  }

  if (kind === "offer") {
    const pct = offer?.discount_percentage;
    return pct != null ? `${offerPrefix} (-${pct}%)` : offerPrefix;
  }

  return manualLabel;
}

export function getOfferIncludedNote(labels?: { includedNote?: string }): string {
  return labels?.includedNote ?? "Ya incluido en el precio del alquiler";
}
