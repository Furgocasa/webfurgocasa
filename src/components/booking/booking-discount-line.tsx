"use client";

import { formatPrice } from "@/lib/utils";
import {
  getBookingDiscountLabel,
  getCouponDiscountAmount,
  getManualDiscountAmount,
  getOfferSavingsAmount,
  LastMinuteOfferSnapshot,
  resolveBookingDiscountKind,
  type BookingDiscountFields,
} from "@/lib/bookings/discount-display";

interface BookingDiscountLineProps {
  booking: BookingDiscountFields;
  offer?: LastMinuteOfferSnapshot | null;
  /** admin-orange: texto blanco sobre fondo naranja; admin-light: gris sobre blanco */
  theme?: "client" | "admin-orange" | "admin-light";
  t?: (key: string) => string;
}

export function BookingDiscountLine({
  booking,
  offer,
  theme = "client",
  t = (key) => key,
}: BookingDiscountLineProps) {
  const kind = resolveBookingDiscountKind(booking, offer);
  if (kind === "none") return null;

  const amount =
    kind === "coupon"
      ? getCouponDiscountAmount(booking)
      : kind === "offer"
        ? getOfferSavingsAmount(booking, offer)
        : getManualDiscountAmount(booking);

  const label = getBookingDiscountLabel(booking, offer, {
    couponPrefix: t("Cupón"),
    offerPrefix: t("Oferta última hora"),
    manualLabel: t("Descuento"),
  });

  const amountClass =
    theme === "admin-light"
      ? "font-semibold text-green-600"
      : "font-semibold text-green-300";

  const labelClass =
    theme === "admin-light" ? "text-gray-600" : "opacity-90";

  const noteClass =
    theme === "admin-light"
      ? "text-xs text-gray-500 italic"
      : "text-xs opacity-75 italic";

  return (
    <div className="space-y-0.5">
      <div className={`flex justify-between text-sm ${theme === "admin-light" ? "" : ""}`}>
        <span className={labelClass}>{label}:</span>
        <span className={amountClass}>- {formatPrice(amount)}</span>
      </div>
      {kind === "offer" && (
        <p className={noteClass}>{t("Ya incluido en el precio del alquiler")}</p>
      )}
    </div>
  );
}
