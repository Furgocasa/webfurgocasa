export type BusinessClosedRange = { start_date: string; end_date: string };

export function isYmdInClosedRange(ymd: string, ranges: BusinessClosedRange[]): boolean {
  return ranges.some((r) => ymd >= r.start_date && ymd <= r.end_date);
}

/** Solo fechas de recogida y devolución; un día cerrado en medio del periodo es válido. */
export function validatePickupDropoffAgainstClosedDates(
  pickup: string,
  dropoff: string,
  ranges: BusinessClosedRange[]
): { ok: true } | { ok: false; error: string } {
  if (isYmdInClosedRange(pickup, ranges)) {
    return {
      ok: false,
      error:
        "La fecha de recogida coincide con un día de cierre (festivo o vacaciones). Elige otras fechas.",
    };
  }
  if (isYmdInClosedRange(dropoff, ranges)) {
    return {
      ok: false,
      error:
        "La fecha de devolución coincide con un día de cierre (festivo o vacaciones). Elige otras fechas.",
    };
  }
  return { ok: true };
}
