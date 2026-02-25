"use client";

import { useEffect, useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface OccupancyPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  occupancy_rate: number;
  status: "available" | "moderate" | "high" | "full";
  color: "green" | "yellow" | "orange" | "red";
  label: string;
  icon: string;
}

interface OccupancyResponse {
  success: boolean;
  periods: OccupancyPeriod[];
  metadata: {
    total_vehicles: number;
    total_periods: number;
    generated_at: string;
  };
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

        const result = await response.json();
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
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Si hay error, no hay datos, o no hay periodos con alta demanda: no mostrar nada
  if (error || !data || data.periods.length === 0) {
    return null;
  }

  const getColorClasses = (color: string) => {
    switch (color) {
      case "green":
        return {
          bg: "bg-green-50 border-green-200",
          text: "text-green-700",
          badge: "bg-green-100 text-green-800",
          dot: "bg-green-500",
        };
      case "yellow":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          text: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800",
          dot: "bg-yellow-500",
        };
      case "orange":
        return {
          bg: "bg-orange-50 border-orange-200",
          text: "text-orange-700",
          badge: "bg-orange-100 text-orange-800",
          dot: "bg-orange-500",
        };
      case "red":
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-700",
          badge: "bg-red-100 text-red-800",
          dot: "bg-red-500",
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
          dot: "bg-gray-500",
        };
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');
    const tz = "Europe/Madrid";

    const startDay = startDate.toLocaleDateString("es-ES", { day: "numeric", timeZone: tz });
    const endDay = endDate.toLocaleDateString("es-ES", { day: "numeric", timeZone: tz });
    const startMonth = startDate.toLocaleDateString("es-ES", { month: "short", timeZone: tz });
    const endMonth = endDate.toLocaleDateString("es-ES", { month: "short", timeZone: tz });
    
    if (startMonth === endMonth) {
      return `${startDay}-${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-furgocasa-blue/10 rounded-xl flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-furgocasa-blue" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-heading font-bold text-gray-900">
            {t("Disponibilidad por periodos")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("Consulta la ocupación de fechas clave")}
          </p>
        </div>
      </div>

      {/* Periodos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.periods.map((period) => {
          const colors = getColorClasses(period.color);
          
          return (
            <div
              key={period.id}
              className={`relative border-2 rounded-xl p-4 transition-all hover:shadow-md ${colors.bg} group`}
            >
              {/* Indicador de estado (pulso en alta demanda) */}
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${colors.dot} ${
                    period.status === "high" || period.status === "full"
                      ? "animate-pulse"
                      : ""
                  }`}
                ></span>
              </div>

              {/* Nombre del periodo */}
              <div className="flex items-start gap-2 mb-2">
                <Calendar className={`h-5 w-5 mt-0.5 ${colors.text}`} />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base">
                    {period.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {formatDateRange(period.start_date, period.end_date)}
                  </p>
                </div>
              </div>

              {/* Barra de ocupación */}
              <div className="mt-3 mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {t("Ocupación")}
                  </span>
                  <span className="text-xs font-bold text-gray-900">
                    {period.occupancy_rate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      period.color === "green"
                        ? "bg-green-500"
                        : period.color === "yellow"
                        ? "bg-yellow-500"
                        : period.color === "orange"
                        ? "bg-orange-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(period.occupancy_rate, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Badge de estado */}
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors.badge}`}
                >
                  <span>{period.icon}</span>
                  <span>{period.label}</span>
                </span>
              </div>

              {/* Mensaje adicional para estados críticos */}
              {period.status === "full" && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                  ⚠️ {t("Reserva con antelación")}
                </p>
              )}
              {period.status === "high" && (
                <p className="text-xs text-orange-600 mt-2 font-medium">
                  ⏰ {t("Últimas plazas disponibles")}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer informativo */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
              {t("Moderado")} (50-70%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
              {t("Alta")} (70-90%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
              {t("Completo")} (&gt;90%)
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
