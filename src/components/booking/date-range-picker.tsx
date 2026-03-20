"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import { Calendar, X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getMadridToday } from "@/lib/utils";
import {
  isYmdInClosedRange,
  type BusinessClosedRange,
} from "@/lib/business-closed-dates";

interface DateRangePickerProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onDateChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  minDays?: number;
  maxDays?: number;
  disabledDates?: Date[];
  /** Cierres de oficina: no se puede elegir ese día como recogida ni devolución (sí puede caer en medio del alquiler). */
  closedRanges?: BusinessClosedRange[];
}

export function DateRangePicker({
  dateRange,
  onDateChange,
  minDays = 2,
  maxDays = 89,
  disabledDates = [],
  closedRanges = [],
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [numberOfMonths, setNumberOfMonths] = useState(2);
  const { t } = useLanguage();

  useEffect(() => {
    const updateMonths = () => {
      setNumberOfMonths(window.innerWidth >= 768 ? 2 : 1);
    };
    
    updateMonths();
    window.addEventListener('resize', updateMonths);
    return () => window.removeEventListener('resize', updateMonths);
  }, []);

  const today = getMadridToday();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 3);

  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 36);

  // Calculate minimum end date based on selected start date
  const getMinEndDate = () => {
    if (!dateRange.from) return minDate;
    const minEnd = new Date(dateRange.from);
    minEnd.setDate(dateRange.from.getDate() + minDays);
    return minEnd;
  };

  // Format the display text
  const displayText = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "dd MMM", { locale: es })} - ${format(
        dateRange.to,
        "dd MMM yyyy",
        { locale: es }
      )}`;
    }
    if (dateRange.from) {
      return `${format(dateRange.from, "dd MMM yyyy", { locale: es })} - ${t("Selecciona fin")}`;
    }
    return t("Selecciona el periodo de alquiler");
  };

  // Calculate number of days
  const numberOfDays = () => {
    if (dateRange.from && dateRange.to) {
      const diff = Math.ceil(
        (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diff;
    }
    return 0;
  };

  // Días cerrados como función disabled para DayPicker.
  // Solo se deshabilitan cuando el usuario va a elegir un ENDPOINT (inicio o fin).
  // Cuando ya hay un rango completo seleccionado los días cerrados aparecen grises
  // (el siguiente click será un nuevo inicio, así que está bien).
  // Truco: DayPicker v8 en modo range NO permite que un rango cruce un día disabled.
  // Por eso solo marcamos disabled los cerrados cuando NO estamos en medio de elegir
  // el fin (es decir: si solo hay from seleccionado, no los deshabilitamos para que
  // el rango pueda cruzarlos). En su lugar interceptamos en handleSelect.
  const isSelectingEnd = !!dateRange.from && !dateRange.to;

  const closedDisabledFn = useMemo(() => {
    if (closedRanges.length === 0) return null;
    return (d: Date) => isYmdInClosedRange(format(d, "yyyy-MM-dd"), closedRanges);
  }, [closedRanges]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return;
    
    // Si ya teníamos un rango completo (from Y to), cualquier click nuevo resetea
    if (dateRange.from && dateRange.to) {
      onDateChange({
        from: range.from,
        to: undefined,
      });
      return;
    }
    
    // Si teníamos una fecha de inicio y el usuario hace click en una fecha anterior,
    // resetear completamente y empezar con la nueva fecha como inicio
    if (dateRange.from && !dateRange.to && range.from && range.from < dateRange.from) {
      onDateChange({
        from: range.from,
        to: undefined,
      });
      return;
    }
    
    // Si solo teníamos fecha de inicio y ahora tenemos ambas
    if (range.from && range.to) {
      // Rechazar silenciosamente si el fin cae en día cerrado
      if (closedDisabledFn && closedDisabledFn(range.to)) {
        return;
      }
      onDateChange({
        from: range.from,
        to: range.to,
      });
      
      // Cerrar cuando ambas fechas estén seleccionadas
      setTimeout(() => setIsOpen(false), 300);
    } else {
      // Solo fecha de inicio seleccionada
      onDateChange({
        from: range.from,
        to: range.to,
      });
    }
  };

  const handleClearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange({
      from: undefined,
      to: undefined,
    });
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-3.5 border-2 border-gray-300 rounded-lg bg-white hover:border-furgocasa-blue focus:outline-none focus:ring-2 focus:ring-furgocasa-blue/30 focus:border-furgocasa-blue transition-colors touch-target"
      >
        <span className="text-gray-800 font-medium text-sm">{displayText()}</span>
        <div className="flex items-center gap-2">
          {numberOfDays() > 0 && (
            <span className="text-xs bg-furgocasa-blue text-white px-2 py-1 rounded-md font-medium">
              {numberOfDays()} {t("días")}
            </span>
          )}
          {dateRange.from && dateRange.to && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClearDates}
              onKeyDown={(e) => e.key === 'Enter' && handleClearDates(e as unknown as React.MouseEvent)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
              title={t("Borrar fechas")}
            >
              <X className="h-4 w-4" />
            </span>
          )}
          <Calendar className="h-5 w-5 text-gray-700" />
        </div>
      </button>

      {/* Calendar dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            className="absolute top-full left-0 right-0 md:left-0 md:right-auto mt-2 z-[200] bg-white rounded-xl shadow-2xl border border-gray-200 p-2 md:p-4 w-full md:w-auto max-h-[70vh] overflow-y-auto">
            {/* Helper text cuando hay fechas seleccionadas */}
            {dateRange.from && dateRange.to && (
              <div className="mb-2 md:mb-3 p-2 md:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 text-center leading-relaxed">
                  💡 {t("Haz clic en una nueva fecha para cambiar tu selección")}
                </p>
              </div>
            )}
            
            {/* Helper text cuando solo hay fecha de inicio */}
            {dateRange.from && !dateRange.to && (
              <div className="mb-2 md:mb-3 p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 text-center leading-relaxed">
                  ✓ {t("Ahora selecciona la fecha de devolución")} ({t("mínimo")} {minDays} {t("días")})
                </p>
              </div>
            )}

            <DayPicker
              mode="range"
              selected={dateRange}
              onSelect={handleSelect}
              locale={es}
              numberOfMonths={numberOfMonths}
              disabled={[
                { before: minDate },
                { after: maxDate },
                ...(dateRange.from && !dateRange.to ? [
                  (date: Date) => {
                    if (date < dateRange.from) return false;
                    if (date.getTime() === dateRange.from.getTime()) return false;
                    const minEndDate = getMinEndDate();
                    return date < minEndDate;
                  }
                ] : []),
                ...disabledDates.map((date) => date),
                // Días cerrados: disabled solo cuando el usuario elige el inicio
                // (o ya tiene rango completo y va a hacer click en nuevo inicio).
                // Cuando está eligiendo el fin NO los deshabilitamos para que
                // DayPicker permita que el rango los cruce.
                ...(!isSelectingEnd && closedDisabledFn ? [closedDisabledFn] : []),
              ]}
              modifiers={{
                today: getMadridToday(),
                ...(isSelectingEnd && closedDisabledFn
                  ? { business_closed: closedDisabledFn }
                  : {}),
              }}
              modifiersStyles={{
                today: {
                  fontWeight: "bold",
                  border: "2px solid #1e40af",
                },
                ...(isSelectingEnd && closedDisabledFn
                  ? {
                      business_closed: {
                        color: "#9ca3af",
                        opacity: 0.5,
                        cursor: "not-allowed",
                      },
                    }
                  : {}),
              }}
              classNames={{
                months: "flex gap-2 md:gap-4 flex-col md:flex-row w-full",
                month: "space-y-2 md:space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-2",
                caption_label: "text-sm md:text-base font-medium text-gray-900",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center",
                nav_button_previous: "absolute left-0 md:left-1",
                nav_button_next: "absolute right-0 md:right-1",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell:
                  "text-gray-500 rounded-md flex-1 font-normal text-xs md:text-sm",
                row: "flex w-full mt-1 md:mt-2",
                cell: "text-center text-xs md:text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-furgocasa-blue/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-8 w-8 md:h-9 md:w-9 mx-auto p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors text-xs md:text-sm",
                day_selected:
                  "bg-furgocasa-blue text-white hover:bg-blue-700 focus:bg-furgocasa-blue",
                day_today: "bg-gray-100 text-gray-900 font-bold",
                day_outside: "text-gray-300 opacity-50",
                day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
                day_range_middle:
                  "aria-selected:bg-furgocasa-blue/10 aria-selected:text-gray-900",
                day_hidden: "invisible",
              }}
            />

            {/* Footer */}
            <div className="border-t mt-2 md:mt-4 pt-2 md:pt-4 flex flex-col gap-2 items-center text-xs md:text-sm">
              <span className="text-gray-500 text-center">
                {t("Mínimo")} {minDays} {t("días")} · {t("Máximo")} {maxDays} {t("días")}
              </span>
              {dateRange.from && dateRange.to ? (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full md:w-auto bg-furgocasa-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {t("Confirmar")}
                </button>
              ) : (
                <span className="text-gray-400 text-xs text-center">
                  {t("Selecciona fechas de inicio y fin")}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
