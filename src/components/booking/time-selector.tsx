"use client";

import { Clock } from "lucide-react";
import {
  type TimeSlotRange,
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
  const options = getTimeSlotOptions(referenceDate, timeSlots);
  const effectiveValue = isTimeSlotSelectable(referenceDate, value, timeSlots)
    ? value
    : getFirstSelectableTime(referenceDate, timeSlots) || "10:00";

  const selectId = id || `time-selector-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative">
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <select
        id={selectId}
        value={effectiveValue}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full pl-4 pr-10 py-3.5 border-2 border-gray-300 rounded-lg bg-white hover:border-furgocasa-blue focus:outline-none focus:ring-2 focus:ring-furgocasa-blue/30 focus:border-furgocasa-blue transition-colors appearance-none cursor-pointer touch-target text-sm font-medium text-gray-800 text-center"
      >
        {options.map(({ time, enabled }) => (
          <option key={time} value={time} disabled={!enabled}>
            {time}
          </option>
        ))}
      </select>
      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-700 pointer-events-none" aria-hidden="true" />
    </div>
  );
}
