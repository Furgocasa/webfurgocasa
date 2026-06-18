"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Clock } from "lucide-react";
import {
  type TimeSlotRange,
  DEFAULT_PREFERRED_PICKUP_TIME,
  getFirstSelectableTime,
  getTimeSlotOptions,
  isTimeSlotSelectable,
} from "@/lib/pickup-time-slots";

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  timeSlots?: TimeSlotRange[] | null;
  referenceDate?: string | null;
  label?: string;
  id?: string;
}

export function TimeSelector({
  value,
  onChange,
  timeSlots,
  referenceDate,
  label = "Seleccionar hora",
  id,
}: TimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id || `time-selector-${generatedId}`;

  const options = getTimeSlotOptions(referenceDate, timeSlots);
  const effectiveValue = isTimeSlotSelectable(referenceDate, value, timeSlots)
    ? value
    : getFirstSelectableTime(referenceDate, timeSlots) || DEFAULT_PREFERRED_PICKUP_TIME;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <button
        id={selectId}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="w-full pl-4 pr-10 py-3.5 border-2 border-gray-300 rounded-lg bg-white hover:border-furgocasa-blue focus:outline-none focus:ring-2 focus:ring-furgocasa-blue/30 focus:border-furgocasa-blue transition-colors cursor-pointer touch-target text-sm font-medium text-gray-800 text-center"
      >
        {effectiveValue}
      </button>
      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-700 pointer-events-none" aria-hidden="true" />

      {isOpen && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-[70] mt-1 max-h-56 overflow-y-auto rounded-lg border-2 border-gray-200 bg-white shadow-lg"
        >
          {options.map(({ time, enabled }) => (
            <li key={time} role="presentation">
              {enabled ? (
                <button
                  type="button"
                  role="option"
                  aria-selected={time === effectiveValue}
                  onClick={() => {
                    onChange(time);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-center transition-colors touch-target ${
                    time === effectiveValue
                      ? "bg-furgocasa-blue/10 font-semibold text-furgocasa-blue"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {time}
                </button>
              ) : (
                <div
                  role="option"
                  aria-disabled="true"
                  aria-selected={false}
                  className="w-full px-4 py-2.5 text-sm text-center bg-red-50 text-gray-400 cursor-not-allowed select-none"
                  title="No disponible en verano (jun–sep)"
                >
                  {time}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
