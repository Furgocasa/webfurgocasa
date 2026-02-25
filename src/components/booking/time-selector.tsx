"use client";

import { Clock } from "lucide-react";

interface TimeSlotRange {
  open: string;
  close: string;
}

const DEFAULT_RANGES: TimeSlotRange[] = [
  { open: "10:00", close: "14:00" },
  { open: "17:00", close: "19:00" },
];

function generateSlotsFromRanges(ranges: TimeSlotRange[], interval: number = 30): string[] {
  const slots: string[] = [];
  for (const range of ranges) {
    const [startH, startM] = range.open.split(':').map(Number);
    const [endH, endM] = range.close.split(':').map(Number);
    let minutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    while (minutes <= endMinutes) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      minutes += interval;
    }
  }
  return [...new Set(slots)].sort();
}

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  timeSlots?: TimeSlotRange[] | null;
  label?: string;
  id?: string;
}

export function TimeSelector({
  value,
  onChange,
  timeSlots,
  label = "Seleccionar hora",
  id,
}: TimeSelectorProps) {
  const ranges = timeSlots && timeSlots.length > 0 ? timeSlots : DEFAULT_RANGES;
  const availableSlots = generateSlotsFromRanges(ranges);

  const selectId = id || `time-selector-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative">
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <select
        id={selectId}
        value={availableSlots.includes(value) ? value : availableSlots[0] || "10:00"}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white hover:border-furgocasa-blue focus:outline-none focus:ring-1 focus:ring-furgocasa-blue focus:border-furgocasa-blue transition-colors appearance-none cursor-pointer"
      >
        {availableSlots.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" aria-hidden="true" />
    </div>
  );
}
