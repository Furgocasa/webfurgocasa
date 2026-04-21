"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { DateRangePicker } from "./date-range-picker";
import { LocationSelector, type TimeSlot } from "./location-selector";
import { TimeSelector } from "./time-selector";
import { useLanguage } from "@/contexts/language-context";
import { calculateRentalDays } from "@/lib/utils";
import { getTranslatedRoute } from "@/lib/route-translations";
import { useSeasonMinDays } from "@/hooks/use-season-min-days";
import { type BusinessClosedRange } from "@/lib/business-closed-dates";

interface SearchWidgetProps {
  defaultLocation?: string;
  fallbackLocation?: string;
}

export function SearchWidget({ defaultLocation, fallbackLocation }: SearchWidgetProps = {}) {
  const { t, language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [location, setLocation] = useState(""); // slug de la ubicación
  const [locationMinDays, setLocationMinDays] = useState<number | null>(null);
  const [locationOpeningHours, setLocationOpeningHours] = useState<TimeSlot[] | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [pickupTime, setPickupTime] = useState("11:00");
  const [dropoffTime, setDropoffTime] = useState("11:00");
  const [closedRanges, setClosedRanges] = useState<BusinessClosedRange[]>([]);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [locationExtraFee, setLocationExtraFee] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/business-closed-dates", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const ranges: BusinessClosedRange[] = (json.ranges || []).map(
          (row: { start_date: string; end_date: string }) => ({
            start_date: row.start_date,
            end_date: row.end_date,
          })
        );
        if (cancelled) return;
        setClosedRanges(ranges);
      } catch {
        /* ignorar: buscador funciona sin cierres si la API falla */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Obtener mínimo de días según temporadas activas
  const pickupDateStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const seasonMinDays = useSeasonMinDays(pickupDateStr, pickupDateStr);

  // Determinar el mínimo de días: si la ubicación tiene min_days fijo, usar ese; si no, usar temporada
  const getMinDays = () => {
    if (locationMinDays !== null) return locationMinDays;
    return seasonMinDays;
  };

  // Cuando cambia la ubicación, guardar slug, min_days y opening_hours
  const handleLocationChange = (slug: string, minDays: number | null, openingHours: TimeSlot[] | null, extraFee: number | null, name: string) => {
    setLocation(slug);
    setLocationMinDays(minDays);
    setLocationOpeningHours(openingHours);
    setLocationExtraFee(extraFee);
    setLocationName(name);
    // Si las fechas actuales no cumplen el nuevo mínimo, resetear
    if (dateRange.from && dateRange.to) {
      const newMinDays = minDays !== null ? minDays : seasonMinDays;
      const pickupDate = format(dateRange.from, 'yyyy-MM-dd');
      const dropoffDate = format(dateRange.to, 'yyyy-MM-dd');
      const days = calculateRentalDays(pickupDate, pickupTime, dropoffDate, dropoffTime);
      if (days < newMinDays) {
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

    // Si la ubicación no es Murcia y tiene tarifa extra, mostrar modal de upsell
    if (location && location !== "murcia" && locationExtraFee && locationExtraFee > 0) {
      setShowUpsellModal(true);
      return;
    }

    executeSearch(location || "murcia");
  };

  const executeSearch = (searchLocation: string) => {
    setIsLoading(true);

    // Build query params - misma ubicación para recogida y devolución
    const params = new URLSearchParams({
      pickup_date: format(dateRange.from!, "yyyy-MM-dd"),
      dropoff_date: format(dateRange.to!, "yyyy-MM-dd"),
      pickup_time: pickupTime,
      dropoff_time: dropoffTime,
      pickup_location: searchLocation,
      dropoff_location: searchLocation, // Siempre la misma que recogida
    });

    // Usar ruta traducida según el idioma actual
    // ⚠️ IMPORTANTE: Usar window.location.href en lugar de router.push
    // para garantizar que los query params se preserven correctamente
    // ya que hay colisión entre middleware y rewrites de next.config.js
    const searchPath = getTranslatedRoute(`/buscar?${params.toString()}`, language);
    window.location.href = searchPath;
  };

  return (
    <div className="relative bg-white p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-2xl">
      <form onSubmit={handleSearch} className="space-y-4 lg:space-y-5">
        {/*
         * Layout:
         * - Mobile: apilado (grid-cols-1)
         * - Desktop (lg+): una sola línea con 5 columnas
         *   [Ubicación 1] [Fecha 2] [Hora recogida 1] [Hora devolución 1]
         */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-4">
          {/* Location (única para recogida y devolución) */}
          <div className="space-y-2 relative z-[60] lg:col-span-1">
            <label className="block text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide text-left">
              {t("Ubicación (recogida y devolución)")}
            </label>
            <LocationSelector
              value={location}
              onChange={handleLocationChange}
              placeholder={t("MURCIA (SEDE)")}
              pickupDate={pickupDateStr}
              defaultLocation={defaultLocation}
              fallbackLocation={fallbackLocation}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2 relative z-[50] lg:col-span-2">
            <label className="block text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide text-left">
              {t("Fecha recogida | Devolución")}
            </label>
            <DateRangePicker
              dateRange={dateRange}
              onDateChange={setDateRange}
              minDays={getMinDays()}
              closedRanges={closedRanges}
            />
          </div>

          {/* Times Row (internamente 2 cols; ocupa 2 cols en lg+) */}
          <div className="grid grid-cols-2 gap-3 lg:gap-4 relative z-[40] lg:col-span-2">
            {/* Pickup Time */}
            <div className="space-y-2">
              <label className="block text-xs lg:text-sm font-medium text-gray-600 uppercase tracking-wide text-left">
                {t("Hora recogida")}
              </label>
              <TimeSelector
                value={pickupTime}
                onChange={setPickupTime}
                timeSlots={locationOpeningHours}
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
                timeSlots={locationOpeningHours}
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
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
            {t("El periodo mínimo es de")} {getMinDays()} {t("días")}
          </p>
        )}
      </form>

      {/* Upsell Modal */}
      {showUpsellModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 lg:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
              {t("Has elegido")} {t(locationName)}
            </h3>
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
              {t("Recuerda que nuestra sede central está en")} <strong className="text-gray-900">Murcia</strong>. {t("Allí tienes una duración de alquiler menor y no hay sobrecostes por desplazamiento.")}
            </p>
            <p className="text-furgocasa-orange font-bold text-lg">
              {t("¿Quieres ahorrarte los")} {(locationExtraFee || 0) * 2}€ {t("extras de viaje?")}
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowUpsellModal(false);
                  executeSearch("murcia");
                }}
                className="w-full bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-3.5 lg:py-4 px-4 rounded-xl transition-colors text-center"
              >
                {t("Cambiar a Murcia sin comisión")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUpsellModal(false);
                  executeSearch(location);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 lg:py-4 px-4 rounded-xl transition-colors text-center"
              >
                {t("Mantener")} {t(locationName)} {t("como ubicación")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
