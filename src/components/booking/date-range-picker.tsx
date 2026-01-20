"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import { Calendar, X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface DateRangePickerProps {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  onDateChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  minDays?: number;
  maxDays?: number;
  disabledDates?: Date[];
}

export function DateRangePicker({
  dateRange,
  onDateChange,
  minDays = 2,
  maxDays = 89,
  disabledDates = [],
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [numberOfMonths, setNumberOfMonths] = useState(2);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const updateMonths = () => {
      setNumberOfMonths(window.innerWidth >= 768 ? 2 : 1);
    };
    
    updateMonths();
    window.addEventListener('resize', updateMonths);
    return () => window.removeEventListener('resize', updateMonths);
  }, []);

  // Calcular posición del dropdown cuando se abre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Calculate min date (+3 days from today)
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 3);

  // Calculate max date (6 months from now)
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 6);

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

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) return;
    
    // Si ya teníamos un rango completo (from Y to), cualquier click nuevo resetea
    if (dateRange.from && dateRange.to) {
      // Empezar de nuevo con solo la fecha de inicio
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
      // Guardar el rango (ya no intercambiamos porque no debería pasar)
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
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white hover:border-furgocasa-blue focus:outline-none focus:ring-1 focus:ring-furgocasa-blue focus:border-furgocasa-blue transition-colors"
      >
        <span className="text-gray-700 font-medium">{displayText()}</span>
        <div className="flex items-center gap-2">
          {numberOfDays() > 0 && (
            <span className="text-xs bg-furgocasa-blue text-white px-2 py-1 rounded">
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
          <Calendar className="h-4 w-4 text-gray-500" />
        </div>
      </button>

      {/* Calendar dropdown - Renderizado en Portal para estar siempre encima */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[99998] bg-black/10"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar - Posicionado absolutamente desde el body */}
          <div 
            className="fixed z-[99999] bg-white rounded-xl shadow-2xl border border-gray-200 p-2 md:p-4 max-h-[70vh] overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: window.innerWidth < 768 ? `${dropdownPosition.width}px` : 'auto',
            }}
          >
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
                // Siempre deshabilitar fechas antes del mínimo
                { before: minDate },
                // Siempre deshabilitar fechas después del máximo
                { after: maxDate },
                // Si hay fecha de inicio seleccionada (sin fecha fin), deshabilitar fechas que no cumplan el mínimo
                ...(dateRange.from && !dateRange.to ? [
                  // Deshabilitar fechas entre la fecha de inicio y el mínimo requerido
                  (date: Date) => {
                    if (date < dateRange.from) return false; // Ya manejado por { before: minDate }
                    if (date.getTime() === dateRange.from.getTime()) return false; // Permitir la fecha de inicio
                    const minEndDate = getMinEndDate();
                    return date < minEndDate; // Deshabilitar si es antes del mínimo requerido
                  }
                ] : []),
                ...disabledDates.map((date) => date),
              ]}
              modifiers={{
                today: new Date(),
              }}
              modifiersStyles={{
                today: {
                  fontWeight: "bold",
                  border: "2px solid #1e40af",
                },
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
        </>,
        document.body
      )}
    </div>
  );
}
