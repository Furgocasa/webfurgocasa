"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays } from "date-fns";
import { es as localeEs, enUS, fr as localeFr, de as localeDe } from "date-fns/locale";
import type { Locale as AppLocale } from "@/lib/i18n/config";
import { useLanguage } from "@/contexts/language-context";
import { getSeasonDisplayTipo, type SeasonKind } from "@/lib/utils";

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
  season_type?: SeasonKind | null;
}

const dateFnsLocales: Record<AppLocale, typeof localeEs> = {
  es: localeEs,
  en: enUS,
  fr: localeFr,
  de: localeDe,
};

const seasonNames = {
  BAJA: { es: "Temporada Baja", en: "Low Season", fr: "Basse Saison", de: "Nebensaison" },
  MEDIA: { es: "Temporada Media", en: "Mid Season", fr: "Moyenne Saison", de: "Zwischensaison" },
  ALTA: { es: "Temporada Alta", en: "High Season", fr: "Haute Saison", de: "Hochsaison" },
} as const;

function labelForTipo(tipo: keyof typeof seasonNames, lang: string): string {
  const row = seasonNames[tipo];
  const l = lang as AppLocale;
  if (l in row) return row[l as keyof typeof row];
  return row.en;
}

export function SeasonsCalendar({ year, hidePassedMonths = false }: { year: number; hidePassedMonths?: boolean }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const dfLocale = dateFnsLocales[language as AppLocale] ?? localeEs;

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
      const { tipo, color } = getSeasonDisplayTipo(season);
      return { ...season, tipo, color };
    }

    return {
      tipo: 'BAJA' as const,
      color: '#E5E7EB',
    };
  };

  const getMonthsToDisplay = () => {
    const months: number[] = [];

    if (hidePassedMonths && year === currentYear) {
      for (let i = currentMonth; i < 12; i++) {
        months.push(i);
      }
    } else {
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
    const isPastMonth = year < currentYear || (year === currentYear && monthIndex < currentMonth);

    const firstDayOfWeek = (start.getDay() + 6) % 7;

    const weekDayLabels = Array.from({ length: 7 }, (_, i) =>
      format(addDays(new Date(2024, 0, 1), i), 'EEEEE', { locale: dfLocale })
    );

    return (
      <div key={monthIndex} className={`bg-white rounded-xl shadow-md overflow-hidden ${isPastMonth ? 'opacity-50' : ''}`}>
        <div className={`bg-gradient-to-r ${isPastMonth ? 'from-gray-400 to-gray-500' : 'from-furgocasa-blue to-blue-700'} text-white p-4`}>
          <h3 className="text-lg font-bold text-center">
            {format(monthDate, 'LLLL yyyy', { locale: dfLocale })}
          </h3>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDayLabels.map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const seasonInfo = getSeasonForDate(day);
              const isToday = isSameDay(day, new Date());
              const isPastDay = day < today && !isToday;

              const backgroundColor = isPastDay
                ? '#F3F4F6'
                : seasonInfo.tipo === 'BAJA'
                  ? '#FFFFFF'
                  : seasonInfo.color + '50';

              const textColor = isPastDay
                ? '#9CA3AF'
                : seasonInfo.tipo === 'BAJA'
                  ? '#6B7280'
                  : '#000000';

              const tooltipText =
                'name' in seasonInfo && seasonInfo.name
                  ? seasonInfo.name
                  : labelForTipo(seasonInfo.tipo, language);

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
