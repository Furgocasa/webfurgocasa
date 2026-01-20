"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { DateRangePicker } from "./date-range-picker";
import { LocationSelector } from "./location-selector";
import { TimeSelector } from "./time-selector";
import { useLanguage } from "@/contexts/language-context";
import { calculateRentalDays } from "@/lib/utils";

export function SearchWidget() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [location, setLocation] = useState(""); // Una sola ubicación para recogida y devolución
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [pickupTime, setPickupTime] = useState("11:00");
  const [dropoffTime, setDropoffTime] = useState("11:00");

  // Determinar el mínimo de días según la ubicación
  const getMinDays = () => {
    if (location === "madrid") return 10;
    return 2; // Murcia o sin selección
  };

  // Resetear fechas cuando cambia la ubicación
  const handleLocationChange = (locationId: string) => {
    setLocation(locationId);
    // Si cambia a Madrid y las fechas actuales no cumplen el mínimo, resetear
    if (locationId === "madrid" && dateRange.from && dateRange.to) {
      const pickupDate = format(dateRange.from, 'yyyy-MM-dd');
      const dropoffDate = format(dateRange.to, 'yyyy-MM-dd');
      const days = calculateRentalDays(pickupDate, pickupTime, dropoffDate, dropoffTime);
      if (days < 10) {
        setDateRange({ from: undefined, to: undefined });
      }
    }
  };

  // Calcular número de días del rango con las horas
  const calculateDays = () => {
    if (!dateRange.from || !dateRange.to) return 0;
    const pickupDate = format(dateRange.from, 'yyyy-MM-dd');
    const dropoffDate = format(dateRange.to, 'yyyy-MM-dd');
    return calculateRentalDays(pickupDate, pickupTime, dropoffDate, dropoffTime);
  };

  // Validar que el rango cumple con el mínimo de días
  const isValidDateRange = () => {
    if (!dateRange.from || !dateRange.to) return false;
    const days = calculateDays();
    const minDaysRequired = getMinDays();
    return days >= minDaysRequired;
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange.from || !dateRange.to) {
      return;
    }

    // Validación final: asegurar que cumple el mínimo de días
    if (!isValidDateRange()) {
      alert(t("El periodo mínimo es de") + " " + getMinDays() + " " + t("días"));
      return;
    }

    setIsLoading(true);

    // Build query params - misma ubicación para recogida y devolución
    const selectedLocation = location || "murcia";
    const params = new URLSearchParams({
      pickup_date: format(dateRange.from, "yyyy-MM-dd"),
      dropoff_date: format(dateRange.to, "yyyy-MM-dd"),
      pickup_time: pickupTime,
      dropoff_time: dropoffTime,
      pickup_location: selectedLocation,
      dropoff_location: selectedLocation, // Siempre la misma que recogida
    });

    router.push(`/buscar?${params.toString()}`);
  };

  return (
    <div className="relative bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-2xl z-[300]">
      <form onSubmit={handleSearch} className="space-y-4 lg:space-y-5">
        {/* Location (única para recogida y devolución) */}
        <div className="space-y-2">
          <label className="block text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide text-left">
            {t("Ubicación (recogida y devolución)")}
          </label>
          <LocationSelector
            value={location}
            onChange={handleLocationChange}
            placeholder={t("MURCIA (SEDE)")}
          />
        </div>

        {/* Date Range */}
        <div className="relative space-y-2">
          <label className="block text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide text-left">
            {t("Fecha recogida | Devolución")}
          </label>
          <DateRangePicker
            dateRange={dateRange}
            onDateChange={setDateRange}
            minDays={getMinDays()}
          />
        </div>

        {/* Times Row - Apilado en mobile/tablet, horizontal en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pickup Time */}
          <div className="space-y-2">
            <label className="block text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide text-left">
              {t("Hora recogida")}
            </label>
            <TimeSelector
              value={pickupTime}
              onChange={setPickupTime}
            />
          </div>

          {/* Dropoff Time */}
          <div className="space-y-2">
            <label className="block text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide text-left">
              {t("Hora devolución")}
            </label>
            <TimeSelector
              value={dropoffTime}
              onChange={setDropoffTime}
            />
          </div>
        </div>

        {/* Search Button - Más grande en mobile/tablet para táctil */}
        <button
          type="submit"
          disabled={isLoading || !dateRange.from || !dateRange.to || !isValidDateRange()}
          className="w-full bg-furgocasa-blue hover:bg-blue-700 text-white font-bold py-4 lg:py-5 px-8 rounded-lg lg:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base lg:text-lg touch-target"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
              {t("Buscando...")}
            </>
          ) : (
            t("Buscar")
          )}
        </button>
        
        {/* Mensaje de validación si no cumple mínimo */}
        {dateRange.from && dateRange.to && !isValidDateRange() && (
          <p className="text-xs lg:text-sm text-red-600 text-center -mt-2">
            ⚠️ {t("El periodo mínimo es de")} {getMinDays()} {t("días")}
          </p>
        )}
      </form>
    </div>
  );
}
