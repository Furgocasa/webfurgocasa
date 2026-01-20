"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();
  const LOCATIONS = getLocations(t);

  // Calcular posición del dropdown cuando se abre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Find selected location
  const selectedLocation = LOCATIONS.find((loc) => loc.id === value);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={buttonRef}
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

      {/* Dropdown - Renderizado en Portal para estar siempre encima */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[99998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Options - Posicionado absolutamente desde el body */}
          <div 
            className="fixed z-[99999] bg-white rounded-md shadow-2xl border border-gray-200 overflow-hidden max-h-[250px] overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
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
        </>,
        document.body
      )}
    </div>
  );
}
