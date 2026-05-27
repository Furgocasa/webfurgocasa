"use client";

import { useEffect, useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

type ColorKey = "green" | "yellow" | "orange" | "red";
type StatusKey = "available" | "moderate" | "high" | "full";

interface OccupancyWeek {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
  occupancy_rate: number;
  status: StatusKey;
  color: ColorKey;
  status_label: string;
  icon: string;
}

interface OccupancyMonth {
  id: string;
  name: string;
  year: number;
  month: number;
  start_date: string;
  end_date: string;
  occupancy_rate: number;
  status: StatusKey;
  color: ColorKey;
  status_label: string;
  icon: string;
  weeks: OccupancyWeek[];
  has_high_demand_week: boolean;
}

interface OccupancyResponse {
  success: boolean;
  months: OccupancyMonth[];
  metadata: {
    total_vehicles: number;
    total_months: number;
    months_analyzed: number;
    threshold: number;
    generated_at: string;
  };
}

const MONTH_NAMES_ES: Record<number, string> = {
  1: "Enero", 2: "Febrero", 3: "Marzo", 4: "Abril", 5: "Mayo", 6: "Junio",
  7: "Julio", 8: "Agosto", 9: "Septiembre", 10: "Octubre", 11: "Noviembre", 12: "Diciembre",
};

function getBarColorClass(color: ColorKey): string {
  switch (color) {
    case "green": return "bg-green-500";
    case "yellow": return "bg-yellow-500";
    case "orange": return "bg-orange-500";
    case "red": return "bg-red-500";
  }
}

function getCardClasses(color: ColorKey) {
  switch (color) {
    case "green":
      return { bg: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-800", text: "text-green-700" };
    case "yellow":
      return { bg: "bg-yellow-50 border-yellow-200", badge: "bg-yellow-100 text-yellow-800", text: "text-yellow-700" };
    case "orange":
      return { bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-800", text: "text-orange-700" };
    case "red":
      return { bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-800", text: "text-red-700" };
  }
}

export function OccupancyHighlights() {
  const { t } = useLanguage();
  const [data, setData] = useState<OccupancyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOccupancy() {
      try {
        const response = await fetch("/api/occupancy-highlights");
        if (!response.ok) {
          throw new Error("Error al cargar disponibilidad");
        }
        const result = (await response.json()) as OccupancyResponse;
        setData(result);
      } catch (err) {
        console.error("Error fetching occupancy:", err);
        setError("No se pudo cargar la información de disponibilidad");
      } finally {
        setIsLoading(false);
      }
    }
    fetchOccupancy();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data || data.months.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-furgocasa-blue/10 rounded-xl flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-furgocasa-blue" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-heading font-bold text-gray-900">
            {t("Disponibilidad por semanas")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("Mira la ocupación semana a semana y reserva cuanto antes las fechas más solicitadas")}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {data.months.map((month) => {
          const monthColors = getCardClasses(month.color);
          const monthName = MONTH_NAMES_ES[month.month] || month.name;

          return (
            <article
              key={month.id}
              className={`rounded-xl border-2 overflow-hidden ${monthColors.bg}`}
            >
              <header className="p-4 lg:p-5 border-b border-white/60">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className={`h-5 w-5 ${monthColors.text}`} />
                    <h3 className="font-heading font-bold text-gray-900 text-lg">
                      {t(monthName)} {month.year}
                    </h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${monthColors.badge}`}
                  >
                    <span>{month.icon}</span>
                    <span>{t(month.status_label)}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {t("Ocupación del mes")}
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {month.occupancy_rate}%
                  </span>
                </div>
                <div className="w-full bg-white/70 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getBarColorClass(month.color)}`}
                    style={{ width: `${Math.min(month.occupancy_rate, 100)}%` }}
                  />
                </div>
              </header>

              <div className="p-4 lg:p-5 bg-white">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t("Por semanas")}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {month.weeks.map((week) => {
                    const weekColors = getCardClasses(week.color);
                    const pulse = week.status === "high" || week.status === "full";
                    return (
                      <div
                        key={week.id}
                        className={`relative rounded-lg border-2 p-3 ${weekColors.bg}`}
                      >
                        <div className="absolute top-2 right-2">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${getBarColorClass(week.color)} ${pulse ? "animate-pulse" : ""}`}
                          />
                        </div>
                        <div className="text-sm font-bold text-gray-900 mb-2 pr-4">
                          {week.label}
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-600">
                            {t("Ocupación")}
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {week.occupancy_rate}%
                          </span>
                        </div>
                        <div className="w-full bg-white/80 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${getBarColorClass(week.color)}`}
                            style={{ width: `${Math.min(week.occupancy_rate, 100)}%` }}
                          />
                        </div>
                        {week.status === "full" && (
                          <p className="text-[10px] text-red-600 mt-1.5 font-medium">
                            ⚠️ {t("Reserva con antelación")}
                          </p>
                        )}
                        {week.status === "high" && (
                          <p className="text-[10px] text-orange-600 mt-1.5 font-medium">
                            ⏰ {t("Últimas plazas")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
              {t("Moderado")} (40-60%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
              {t("Alta")} (60-85%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              {t("Muy alta")} (&gt;85%)
            </span>
          </div>
          <span className="text-gray-400">
            {data.metadata.total_vehicles} {t("vehículos disponibles")}
          </span>
        </div>
      </div>
    </section>
  );
}
