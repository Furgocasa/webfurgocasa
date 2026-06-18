export interface TimeSlotRange {
  open: string;
  close: string;
}

export const DEFAULT_TIME_RANGES: TimeSlotRange[] = [
  { open: "10:00", close: "14:00" },
  { open: "17:00", close: "19:00" },
];

/** Meses con restricción por calor en la nave (jun–sep). */
export const SUMMER_RESTRICTED_MONTHS = [6, 7, 8, 9] as const;

const SUMMER_MORNING_LAST = "12:00";
const SUMMER_AFTERNOON_SLOTS = new Set(["18:00", "18:30", "19:00"]);

export function generateSlotsFromRanges(
  ranges: TimeSlotRange[],
  interval: number = 30
): string[] {
  const slots: string[] = [];
  for (const range of ranges) {
    const [startH, startM] = range.open.split(":").map(Number);
    const [endH, endM] = range.close.split(":").map(Number);
    let minutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    while (minutes <= endMinutes) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      minutes += interval;
    }
  }
  return [...new Set(slots)].sort();
}

export function isSummerRestrictedMonth(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const month = Number(dateStr.slice(5, 7));
  return (SUMMER_RESTRICTED_MONTHS as readonly number[]).includes(month);
}

function isSlotAllowedInSummer(time: string): boolean {
  if (time <= SUMMER_MORNING_LAST) return true;
  return SUMMER_AFTERNOON_SLOTS.has(time);
}

export function isTimeSlotSelectable(
  referenceDate: string | null | undefined,
  time: string,
  openingHours?: TimeSlotRange[] | null
): boolean {
  const ranges =
    openingHours && openingHours.length > 0 ? openingHours : DEFAULT_TIME_RANGES;
  const allSlots = generateSlotsFromRanges(ranges);
  if (!allSlots.includes(time)) return false;
  if (!isSummerRestrictedMonth(referenceDate)) return true;
  return isSlotAllowedInSummer(time);
}

export function getTimeSlotOptions(
  referenceDate: string | null | undefined,
  openingHours?: TimeSlotRange[] | null
): { time: string; enabled: boolean }[] {
  const ranges =
    openingHours && openingHours.length > 0 ? openingHours : DEFAULT_TIME_RANGES;
  return generateSlotsFromRanges(ranges).map((time) => ({
    time,
    enabled: isTimeSlotSelectable(referenceDate, time, openingHours),
  }));
}

export function getFirstSelectableTime(
  referenceDate: string | null | undefined,
  openingHours?: TimeSlotRange[] | null
): string | null {
  const options = getTimeSlotOptions(referenceDate, openingHours);
  return options.find((o) => o.enabled)?.time ?? null;
}

export function validateBookingTimes(params: {
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  pickupOpeningHours?: TimeSlotRange[] | null;
  dropoffOpeningHours?: TimeSlotRange[] | null;
}): { ok: true } | { ok: false; error: string } {
  const {
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
    pickupOpeningHours,
    dropoffOpeningHours,
  } = params;

  if (
    !isTimeSlotSelectable(pickupDate, pickupTime, pickupOpeningHours)
  ) {
    return {
      ok: false,
      error:
        "La hora de recogida no está disponible en verano (jun–sep). Por la mañana hasta las 12:00; por la tarde 18:00, 18:30 o 19:00.",
    };
  }

  if (
    !isTimeSlotSelectable(dropoffDate, dropoffTime, dropoffOpeningHours)
  ) {
    return {
      ok: false,
      error:
        "La hora de devolución no está disponible en verano (jun–sep). Por la mañana hasta las 12:00; por la tarde 18:00, 18:30 o 19:00.",
    };
  }

  return { ok: true };
}
