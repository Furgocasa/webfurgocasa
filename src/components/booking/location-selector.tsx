"use client";

import { useState, useEffect } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { createClient } from "@/lib/supabase/client";

export interface TimeSlot {
  open: string;
  close: string;
}

interface LocationData {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  min_days: number | null;
  opening_hours: TimeSlot[] | null;
  active_from: string | null;
  active_until: string | null;
  active_recurring: boolean | null;
  extra_fee: number | null;
}

/**
 * Comprueba si una ubicación está disponible para una fecha dada.
 * - Sin fechas de disponibilidad → siempre disponible
 * - Con recurring = true → compara solo mes/día (se repite cada año)
 * - Con recurring = false → compara fecha completa (periodo puntual)
 */
function isLocationAvailableForDate(location: LocationData, pickupDate: string | null): boolean {
  if (!location.active_from && !location.active_until) return true;
  if (!pickupDate) return true;

  if (location.active_recurring) {
    const [, pickupMonth, pickupDay] = pickupDate.split('-').map(Number);
    const pickupMD = pickupMonth * 100 + pickupDay;

    let fromMD = 0;
    let untilMD = 1231;

    if (location.active_from) {
      const [, fromMonth, fromDay] = location.active_from.split('-').map(Number);
      fromMD = fromMonth * 100 + fromDay;
    }
    if (location.active_until) {
      const [, untilMonth, untilDay] = location.active_until.split('-').map(Number);
      untilMD = untilMonth * 100 + untilDay;
    }

    if (fromMD <= untilMD) {
      return pickupMD >= fromMD && pickupMD <= untilMD;
    } else {
      // Rango cruzado (ej: oct-feb): disponible si >= from O <= until
      return pickupMD >= fromMD || pickupMD <= untilMD;
    }
  } else {
    if (location.active_from && pickupDate < location.active_from) return false;
    if (location.active_until && pickupDate > location.active_until) return false;
    return true;
  }
}

interface LocationSelectorProps {
  value: string;
  onChange: (slug: string, minDays: number | null, openingHours: TimeSlot[] | null, extraFee: number | null, locationName: string) => void;
  placeholder?: string;
  pickupDate?: string | null;
  defaultLocation?: string;
  fallbackLocation?: string;
}

export function LocationSelector({
  value,
  onChange,
  placeholder = "Selecciona ubicación",
  pickupDate = null,
  defaultLocation,
  fallbackLocation,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [allLocations, setAllLocations] = useState<LocationData[]>([]);
  const [defaultApplied, setDefaultApplied] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const loadLocations = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("locations")
        .select("id, slug, name, address, min_days, opening_hours, active_from, active_until, active_recurring, extra_fee")
        .eq("is_active", true)
        .eq("is_pickup", true)
        .order("name");
      
      if (data) {
        setAllLocations(data as LocationData[]);
      }
    };
    loadLocations();
  }, []);

  // Filtrar ubicaciones disponibles según la fecha de recogida
  const locations = allLocations.filter(loc => isLocationAvailableForDate(loc, pickupDate));

  // Aplicar preselección: primero intenta defaultLocation (slug de la landing),
  // si no existe como ubicación activa, usa fallbackLocation (nearest_location)
  useEffect(() => {
    if (defaultApplied || allLocations.length === 0 || value) return;
    if (!defaultLocation && !fallbackLocation) return;

    const loc = (defaultLocation && allLocations.find(l => l.slug === defaultLocation))
      || (fallbackLocation && allLocations.find(l => l.slug === fallbackLocation));

    if (loc) {
      onChange(loc.slug, loc.min_days, loc.opening_hours, loc.extra_fee, loc.name);
      setDefaultApplied(true);
    }
  }, [defaultLocation, fallbackLocation, allLocations, defaultApplied, value, onChange]);

  const selectedLocation = locations.find((loc) => loc.slug === value);

  const getMinDaysLabel = (minDays: number | null) => {
    if (minDays) return `${t("Mínimo")} ${minDays} ${t("días")}`;
    return t("Mín. según temporada");
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="w-full flex items-center justify-between px-4 py-3.5 border-2 border-gray-300 rounded-lg bg-white hover:border-furgocasa-blue focus:outline-none focus:ring-2 focus:ring-furgocasa-blue/30 focus:border-furgocasa-blue transition-colors text-left touch-target"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <MapPin className="h-5 w-5 text-furgocasa-blue flex-shrink-0" aria-hidden="true" />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-gray-800 font-semibold uppercase text-sm truncate">
              {selectedLocation ? t(selectedLocation.name) : placeholder}
            </span>
            {selectedLocation && (
              <span className="text-xs text-gray-500 mt-0.5">
                {getMinDaysLabel(selectedLocation.min_days)}
              </span>
            )}
          </div>
          {selectedLocation?.extra_fee ? (
            <div className="text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0 bg-furgocasa-orange/10 text-furgocasa-orange mr-2">
              +{selectedLocation.extra_fee * 2}€
            </div>
          ) : null}
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-700 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="listbox"
            className="absolute top-full left-0 right-0 mt-2 z-[200] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-h-[60vh] overflow-y-auto"
          >
            {locations.map((location) => (
              <button
                key={location.id}
                type="button"
                role="option"
                aria-selected={value === location.slug}
                onClick={() => {
                  onChange(location.slug, location.min_days, location.opening_hours, location.extra_fee, location.name);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3.5 hover:bg-furgocasa-blue hover:text-white transition-colors text-left touch-target ${
                  value === location.slug ? "bg-furgocasa-blue text-white" : "text-gray-700"
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <MapPin className={`h-4 w-4 flex-shrink-0 ${
                    value === location.slug ? "text-white/80" : "text-furgocasa-blue/60"
                  }`} aria-hidden="true" />
                  <div className="flex flex-col flex-1 text-left">
                    <span className="block font-semibold uppercase text-sm">
                      {t(location.name)}
                    </span>
                    <span className={`text-xs mt-0.5 ${
                      value === location.slug ? "text-white/80" : "text-gray-500"
                    }`}>
                      {getMinDaysLabel(location.min_days)}
                    </span>
                  </div>
                  {location.extra_fee ? (
                    <div className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0 ${
                      value === location.slug 
                        ? "bg-white/20 text-white" 
                        : "bg-orange-100 text-furgocasa-orange"
                    }`}>
                      +{location.extra_fee * 2}€
                    </div>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
