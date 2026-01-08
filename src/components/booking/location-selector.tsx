"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

// TODO: Cargar desde Supabase
const getLocations = (t: (text: string) => string) => [
  { 
    id: "murcia", 
    name: t("Murcia (Sede)"), 
    address: "Avenida Puente Tocinos, 4, 30007 Murcia",
    minDays: 2,
    label: t("Murcia (Sede)") + " - " + t("Mín. 2 días")
  },
  { 
    id: "madrid", 
    name: t("Madrid"), 
    address: "Madrid",
    minDays: 10,
    label: t("Madrid") + " - " + t("Mín. 10 días")
  },
];

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function LocationSelector({
  value,
  onChange,
  placeholder = "Selecciona ubicación",
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const LOCATIONS = getLocations(t);

  // Find selected location
  const selectedLocation = LOCATIONS.find((loc) => loc.id === value);

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
            {selectedLocation ? selectedLocation.name : placeholder}
          </span>
          {selectedLocation && (
            <span className="text-xs text-gray-500 mt-0.5">
              {t("Mínimo")} {selectedLocation.minDays} {t("días")}
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
            className="fixed inset-0 z-[99]"
            onClick={() => setIsOpen(false)}
          />

          {/* Options */}
          <div className="absolute top-full left-0 right-0 mt-1 z-[100] bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
            {LOCATIONS.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => {
                  onChange(location.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 hover:bg-furgocasa-blue hover:text-white transition-colors text-left ${
                  value === location.id ? "bg-furgocasa-blue text-white" : "text-gray-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="block font-medium uppercase text-sm">
                    {location.name}
                  </span>
                  <span className={`text-xs mt-0.5 ${
                    value === location.id ? "text-white/80" : "text-gray-500"
                  }`}>
                    {t("Mínimo")} {location.minDays} {t("días")}
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
