"use client";

import { Clock } from "lucide-react";

// Generate time slots: 10:00-13:00 and 17:00-19:00 in 30-minute intervals
const TIME_SLOTS = [
  // Morning slots: 10:00 - 13:00
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00",
  // Evening slots: 17:00 - 19:00
  "17:00", "17:30", "18:00", "18:30", "19:00"
];

interface TimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  minTime?: string;
  maxTime?: string;
}

export function TimeSelector({
  value,
  onChange,
  minTime = "08:00",
  maxTime = "20:00",
}: TimeSelectorProps) {
  // Filter time slots based on min/max
  const availableSlots = TIME_SLOTS.filter((time) => {
    return time >= minTime && time <= maxTime;
  });

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white hover:border-furgocasa-blue focus:outline-none focus:ring-1 focus:ring-furgocasa-blue focus:border-furgocasa-blue transition-colors appearance-none cursor-pointer"
      >
        {availableSlots.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
    </div>
  );
}
