"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useLanguage } from "@/contexts/language-context";

interface Season {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  price_less_than_week: number;
  price_one_week: number;
  price_two_weeks: number;
  price_three_weeks: number;
  year: number;
  min_days: number;
  is_active: boolean;
}

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Precios base de temporada BAJA
const PRECIO_BAJA = {
  price_less_than_week: 95,
  price_one_week: 85,
  price_two_weeks: 75,
  price_three_weeks: 65,
};

// Determinar tipo y color de temporada según el sobrecoste
const getTipoTemporada = (season: Season) => {
  const sobrecoste = season.price_less_than_week - PRECIO_BAJA.price_less_than_week;
  if (sobrecoste >= 60) return { tipo: 'ALTA', color: '#EF4444' }; // Rojo
  if (sobrecoste >= 30) return { tipo: 'MEDIA', color: '#F59E0B' }; // Naranja
  return { tipo: 'BAJA', color: '#3B82F6' }; // Azul (por si acaso)
};

const seasonNames = {
  BAJA: { es: "Temporada Baja", en: "Low Season" },
  MEDIA: { es: "Temporada Media", en: "Mid Season" },
  ALTA: { es: "Temporada Alta", en: "High Season" },
};

export function SeasonsCalendar({ year, hidePassedMonths = false }: { year: number; hidePassedMonths?: boolean }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  const today = new Date();
  const currentMonth = today.getMonth(); // 0-11
  const currentYear = today.getFullYear();

  useEffect(() => {
    loadSeasons();
  }, [year]);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('year', year)
        .order('start_date');

      if (error) throw error;
      setSeasons(data || []);
    } catch (error) {
      console.error('Error loading seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeasonForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const season = seasons.find(season => 
      dateStr >= season.start_date && dateStr <= season.end_date
    );
    
    if (season) {
      const { tipo, color } = getTipoTemporada(season);
      return { ...season, tipo, color };
    }
    
    // Por defecto, es TEMPORADA BAJA
    return {
      tipo: 'BAJA' as const,
      color: '#E5E7EB', // Gris claro para días normales (BAJA)
      name: 'Temporada Baja'
    };
  };

  // Determinar qué meses mostrar
  const getMonthsToDisplay = () => {
    const months: number[] = [];
    
    if (hidePassedMonths && year === currentYear) {
      // Solo mostrar meses desde el actual en adelante
      for (let i = currentMonth; i < 12; i++) {
        months.push(i);
      }
    } else {
      // Mostrar todos los meses
      for (let i = 0; i < 12; i++) {
        months.push(i);
      }
    }
    
    return months;
  };

  const renderMonth = (monthIndex: number) => {
    const monthDate = new Date(year, monthIndex, 1);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    const isCurrentMonth = year === currentYear && monthIndex === currentMonth;
    const isPastMonth = year < currentYear || (year === currentYear && monthIndex < currentMonth);

    // Calcular el día de la semana del primer día (0 = domingo, ajustamos a lunes = 0)
    const firstDayOfWeek = (start.getDay() + 6) % 7;

    return (
      <div key={monthIndex} className={`bg-white rounded-xl shadow-md overflow-hidden ${isPastMonth ? 'opacity-50' : ''}`}>
        <div className={`bg-gradient-to-r ${isPastMonth ? 'from-gray-400 to-gray-500' : 'from-furgocasa-blue to-blue-700'} text-white p-4`}>
          <h3 className="text-lg font-bold text-center">
            {monthNames[monthIndex]}
          </h3>
        </div>
        
        <div className="p-4">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espacios en blanco antes del primer día */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Días del mes */}
            {days.map((day) => {
              const seasonInfo = getSeasonForDate(day);
              const isToday = isSameDay(day, new Date());
              const isPastDay = day < today && !isToday;
              
              // Para días BAJA, solo un fondo muy ligero
              const backgroundColor = isPastDay 
                ? '#F3F4F6'  // Gris claro para días pasados
                : seasonInfo.tipo === 'BAJA' 
                  ? '#FFFFFF'  // Blanco para BAJA
                  : seasonInfo.color + '50'; // Color con transparencia para MEDIA/ALTA
              
              const textColor = isPastDay
                ? '#9CA3AF'
                : seasonInfo.tipo === 'BAJA'
                  ? '#6B7280'
                  : '#000000';
              
              const tooltipText = seasonInfo.name || seasonNames[seasonInfo.tipo][language];
              
              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-all font-medium ${
                    isToday ? 'ring-2 ring-furgocasa-orange font-bold' : ''
                  } ${isPastDay ? 'opacity-50' : ''} ${
                    seasonInfo.tipo !== 'BAJA' ? 'shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor,
                    color: textColor,
                  }}
                  title={tooltipText}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const monthsToDisplay = getMonthsToDisplay();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-blue"></div>
        <p className="mt-4 text-gray-500">{t("Cargando calendario...")}</p>
      </div>
    );
  }

  if (monthsToDisplay.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t("No hay meses disponibles para mostrar en este año")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {monthsToDisplay.map(monthIndex => renderMonth(monthIndex))}
    </div>
  );
}
