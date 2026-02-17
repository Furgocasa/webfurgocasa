"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { createClient } from "@/lib/supabase/client";

interface LocationData {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  min_days: number | null;
  active_from: string | null;
  active_until: string | null;
  active_recurring: boolean | null;
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
  onChange: (slug: string, minDays: number | null) => void;
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
        .select("id, slug, name, address, min_days, active_from, active_until, active_recurring")
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
      onChange(loc.slug, loc.min_days);
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
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white hover:border-furgocasa-blue focus:outline-none focus:ring-1 focus:ring-furgocasa-blue focus:border-furgocasa-blue transition-colors text-left"
      >
        <div className="flex flex-col">
          <span className="text-gray-700 font-medium uppercase text-sm">
            {selectedLocation ? t(selectedLocation.name) : placeholder}
          </span>
          {selectedLocation && (
            <span className="text-xs text-gray-500 mt-0.5">
              {getMinDaysLabel(selectedLocation.min_days)}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />

          {/* Options */}
          <div className="absolute top-full left-0 right-0 mt-1 z-[200] bg-white rounded-md shadow-2xl border border-gray-200 overflow-hidden max-h-[250px] overflow-y-auto">
            {locations.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => {
                  onChange(location.slug, location.min_days);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 hover:bg-furgocasa-blue hover:text-white transition-colors text-left ${
                  value === location.slug ? "bg-furgocasa-blue text-white" : "text-gray-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="block font-medium uppercase text-sm">
                    {t(location.name)}
                  </span>
                  <span className={`text-xs mt-0.5 ${
                    value === location.slug ? "text-white/80" : "text-gray-500"
                  }`}>
                    {getMinDaysLabel(location.min_days)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
