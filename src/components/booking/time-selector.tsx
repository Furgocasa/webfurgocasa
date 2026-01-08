"use client";

import { useState } from "react";
import { Clock, ChevronDown } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);

  // Filter time slots based on min/max
  const availableSlots = TIME_SLOTS.filter((time) => {
    return time >= minTime && time <= maxTime;
  });

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white hover:border-furgocasa-blue focus:outline-none focus:ring-1 focus:ring-furgocasa-blue focus:border-furgocasa-blue transition-colors"
      >
        <span className="text-gray-700 font-medium">{value}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
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
          <div className="absolute top-full left-0 right-0 mt-1 z-[100] bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
            {availableSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => {
                  onChange(time);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-furgocasa-blue hover:text-white transition-colors font-medium ${
                  value === time
                    ? "bg-furgocasa-blue text-white"
                    : "text-gray-700"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
