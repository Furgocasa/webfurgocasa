"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { createClient } from "@/lib/supabase/client";

interface LocationData {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  min_days: number | null;
}

interface LocationSelectorProps {
  value: string;
  onChange: (slug: string, minDays: number | null) => void;
  placeholder?: string;
}

export function LocationSelector({
  value,
  onChange,
  placeholder = "Selecciona ubicación",
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    const loadLocations = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("locations")
        .select("id, slug, name, address, min_days")
        .eq("is_active", true)
        .eq("is_pickup", true)
        .order("name");
      
      if (data) {
        setLocations(data as LocationData[]);
      }
    };
    loadLocations();
  }, []);

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
