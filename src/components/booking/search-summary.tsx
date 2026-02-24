"use client";

import { Calendar, MapPin, Clock, Edit2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { calculateRentalDays } from "@/lib/utils";

interface SearchSummaryProps {
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickupLocation: string;
  dropoffLocation: string;
}

export function SearchSummary({
  pickupDate,
  dropoffDate,
  pickupTime,
  dropoffTime,
  pickupLocation,
  dropoffLocation,
}: SearchSummaryProps) {
  const { t } = useLanguage();
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "Europe/Madrid",
    });
  };

  // IMPORTANTE: Usar calculateRentalDays que considera las horas
  const days = calculateRentalDays(pickupDate, pickupTime, dropoffDate, dropoffTime);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pickup */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-furgocasa-orange rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="text-white">
            <p className="text-sm text-white/70">{t("Recogida")}</p>
            <p className="font-semibold">{formatDateDisplay(pickupDate)}</p>
            <p className="text-sm text-white/70 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {pickupTime}
            </p>
          </div>
        </div>

        {/* Arrow / Days */}
        <div className="hidden md:flex flex-col items-center">
          <span className="text-2xl font-bold text-furgocasa-orange">
            {days} {t("días")}
          </span>
          <div className="w-24 h-px bg-white/30 my-2" />
        </div>

        {/* Dropoff */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-furgocasa-orange rounded-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="text-white">
            <p className="text-sm text-white/70">{t("Devolución")}</p>
            <p className="font-semibold">{formatDateDisplay(dropoffDate)}</p>
            <p className="text-sm text-white/70 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {dropoffTime}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div className="text-white">
            <p className="text-sm text-white/70">{t("Ubicación")}</p>
            <p className="font-semibold capitalize">
              {pickupLocation || "Murcia"}
            </p>
            {pickupLocation !== dropoffLocation && dropoffLocation && (
              <p className="text-sm text-white/70">
                {t("Devolución")}: {dropoffLocation}
              </p>
            )}
          </div>
        </div>

        {/* Edit button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <Edit2 className="h-4 w-4" />
          <span className="text-sm">{t("Modificar")}</span>
        </Link>
      </div>
    </div>
  );
}
