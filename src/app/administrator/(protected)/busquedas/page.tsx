"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Search, 
  MousePointerClick, 
  CheckCircle,
  Calendar,
  Clock,
  Car,
  Target,
  AlertTriangle,
  BarChart3,
  Loader2
} from "lucide-react";

interface AnalyticsData {
  period: { from: string; to: string };
  kpis: {
    totalSearches: number;
    withAvailability: number;
    vehicleSelections: number;
    bookingsCreated: number;
    selectionRate: string;
    bookingRateFromSelection: string;
    overallConversionRate: string;
    avgRentalDays: string;
    avgAdvanceDays: string;
    avgTimeToSelectSeconds: number;
    avgTimeToBookingSeconds: number;
  };
}

interface FunnelData {
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number | string;
  }>;
  abandonment: {
    noAvailability: number;
    afterSearch: number;
    afterSelection: number;
  };
}

interface TopDatesData {
  topDates: Array<{
    pickup_date: string;
    dropoff_date: string;
    rental_days: number;
    search_count: number;
    bookings_count: number;
    season: string;
    avg_price: string;
    conversion_rate: string;
  }>;
}

interface VehiclePerformanceData {
  vehiclePerformance: Array<{
    vehicle_id: string;
    vehicle_name: string;
    vehicle_slug: string;
    times_selected: number;
    times_booked: number;
    booking_rate: string;
    avg_price: string;
  }>;
}

interface SeasonStatsData {
  seasonStats: Array<{
    season_name: string;
    search_count: number;
    selection_count: number;
    booking_count: number;
    selection_rate: string;
    conversion_rate: string;
    avg_price: string;
  }>;
}

interface DurationStatsData {
  durationStats: Array<{
    duration: string;
    search_count: number;
    booking_count: number;
    conversion_rate: string;
    percentage: string;
  }>;
}

interface DemandAvailabilityData {
  demandAvailability: Array<{
    week_start: string;
    week_end: string;
    search_count: number;
    unique_date_ranges: number;
    occupancy_rate: string;
    availability_rate: string;
    total_vehicles: number;
    demand_index: string;
    price_opportunity: "high" | "medium" | "low" | "none";
    recommendation: string;
  }>;
}

async function fetchAnalytics(type: string, startDate: string, endDate: string) {
  const params = new URLSearchParams({
    type,
    start_date: startDate,
    end_date: endDate,
  });
  
  const response = await fetch(`/api/admin/search-analytics?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error("Error al cargar estadísticas");
  }
  
  return response.json();
}

function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function SearchAnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Queries para cada tipo de datos
  const { data: overview, isLoading: loadingOverview } = useQuery<AnalyticsData>({
    queryKey: ["search-analytics", "overview", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("overview", dateRange.start, dateRange.end),
  });

  const { data: funnelData, isLoading: loadingFunnel } = useQuery<FunnelData>({
    queryKey: ["search-analytics", "funnel", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("funnel", dateRange.start, dateRange.end),
  });

  const { data: topDates, isLoading: loadingDates } = useQuery<TopDatesData>({
    queryKey: ["search-analytics", "dates", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("dates", dateRange.start, dateRange.end),
  });

  const { data: vehiclePerf, isLoading: loadingVehicles } = useQuery<VehiclePerformanceData>({
    queryKey: ["search-analytics", "vehicles", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("vehicles", dateRange.start, dateRange.end),
  });

  const { data: seasonStats, isLoading: loadingSeasons } = useQuery<SeasonStatsData>({
    queryKey: ["search-analytics", "seasons", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("seasons", dateRange.start, dateRange.end),
  });

  const { data: durationStats, isLoading: loadingDuration } = useQuery<DurationStatsData>({
    queryKey: ["search-analytics", "duration", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("duration", dateRange.start, dateRange.end),
  });

  const { data: demandAvailability, isLoading: loadingDemand } = useQuery<DemandAvailabilityData>({
    queryKey: ["search-analytics", "demand-availability", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("demand-availability", dateRange.start, dateRange.end),
  });

  if (loadingOverview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-furgocasa-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análisis de Búsquedas</h1>
          <p className="text-gray-600 mt-1">
            Analiza el comportamiento de búsqueda y conversión de usuarios
          </p>
        </div>

        {/* Selector de fechas */}
        <div className="flex gap-3 items-center">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border rounded-lg"
          />
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Search className="h-8 w-8 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">
              {overview?.kpis.totalSearches || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Búsquedas totales</p>
          <p className="text-xs text-gray-500 mt-1">
            {overview?.kpis.withAvailability || 0} con disponibilidad
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <MousePointerClick className="h-8 w-8 text-purple-600" />
            <span className="text-3xl font-bold text-gray-900">
              {overview?.kpis.vehicleSelections || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Vehículos seleccionados</p>
          <p className="text-xs text-green-600 font-medium mt-1">
            {overview?.kpis.selectionRate || 0}% de conversión
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <span className="text-3xl font-bold text-gray-900">
              {overview?.kpis.bookingsCreated || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Reservas creadas</p>
          <p className="text-xs text-green-600 font-medium mt-1">
            {overview?.kpis.overallConversionRate || 0}% total
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-8 w-8 text-furgocasa-orange" />
            <span className="text-3xl font-bold text-gray-900">
              {overview?.kpis.overallConversionRate || 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Tasa de conversión</p>
          <p className="text-xs text-gray-500 mt-1">
            Búsqueda → Reserva
          </p>
        </div>
      </div>

      {/* Métricas secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <Calendar className="h-5 w-5 text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-blue-900">
            {overview?.kpis.avgRentalDays || 0} días
          </p>
          <p className="text-sm text-blue-700">Duración media de alquiler</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <Clock className="h-5 w-5 text-purple-600 mb-2" />
          <p className="text-2xl font-bold text-purple-900">
            {overview?.kpis.avgAdvanceDays || 0} días
          </p>
          <p className="text-sm text-purple-700">Antelación media</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <TrendingUp className="h-5 w-5 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-green-900">
            {overview?.kpis.avgTimeToSelectSeconds 
              ? formatSeconds(overview.kpis.avgTimeToSelectSeconds)
              : "N/A"}
          </p>
          <p className="text-sm text-green-700">Tiempo medio hasta selección</p>
        </div>
      </div>

      {/* Embudo de conversión */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-furgocasa-orange" />
          Embudo de Conversión
        </h2>

        {loadingFunnel ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {funnelData?.funnel.map((stage, index) => {
              const percentage = typeof stage.percentage === 'string' 
                ? parseFloat(stage.percentage) 
                : stage.percentage;
              
              return (
                <div key={stage.stage}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {stage.stage}
                    </span>
                    <span className="text-sm text-gray-600">
                      {stage.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8">
                    <div
                      className={`h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-semibold ${
                        index === 0 ? "bg-blue-500" :
                        index === 1 ? "bg-purple-500" :
                        index === 2 ? "bg-furgocasa-orange" :
                        "bg-green-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage}%
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Puntos de abandono */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Puntos de Abandono
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-700">Sin disponibilidad:</span>
                  <span className="font-semibold text-amber-900">
                    {funnelData?.abandonment.noAvailability || 0} búsquedas
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Tras búsqueda (con disponibilidad):</span>
                  <span className="font-semibold text-amber-900">
                    {funnelData?.abandonment.afterSearch || 0} usuarios
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Tras selección:</span>
                  <span className="font-semibold text-amber-900">
                    {funnelData?.abandonment.afterSelection || 0} usuarios
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top fechas más buscadas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Fechas Más Buscadas (Top 20)
        </h2>

        {loadingDates ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recogida</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Devolución</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Búsquedas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conv. %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temporada</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio medio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topDates?.topDates.map((date, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(date.pickup_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatDate(date.dropoff_date)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {date.rental_days}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                      {date.search_count}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      {date.bookings_count}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(date.conversion_rate) >= 30 
                          ? "bg-green-100 text-green-800"
                          : parseFloat(date.conversion_rate) >= 15
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {date.conversion_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {date.season || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      €{date.avg_price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rendimiento por vehículo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Car className="h-6 w-6 text-furgocasa-orange" />
          Rendimiento por Vehículo
        </h2>

        {loadingVehicles ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selecciones</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conv. %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio medio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehiclePerf?.vehiclePerformance.map((vehicle) => (
                  <tr key={vehicle.vehicle_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {vehicle.vehicle_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 font-semibold">
                      {vehicle.times_selected}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                      {vehicle.times_booked}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(vehicle.booking_rate) >= 40 
                          ? "bg-green-100 text-green-800"
                          : parseFloat(vehicle.booking_rate) >= 25
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {vehicle.booking_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      €{vehicle.avg_price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Análisis por temporada */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Análisis por Temporada
          </h2>

          {loadingSeasons ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {seasonStats?.seasonStats.map((season) => (
                <div key={season.season_name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{season.season_name}</h3>
                    <span className="text-sm font-semibold text-green-600">
                      {season.conversion_rate}% conversión
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Búsquedas:</span>
                      <span className="ml-2 font-semibold">{season.search_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Reservas:</span>
                      <span className="ml-2 font-semibold">{season.booking_count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Precio medio:</span>
                      <span className="ml-2 font-semibold">€{season.avg_price}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tasa selección:</span>
                      <span className="ml-2 font-semibold">{season.selection_rate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución por duración */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Distribución por Duración
          </h2>

          {loadingDuration ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {durationStats?.durationStats.map((duration) => (
                <div key={duration.duration}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {duration.duration}
                    </span>
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-blue-600">{duration.search_count}</span>
                      {" / "}
                      <span className="font-semibold text-green-600">{duration.booking_count}</span>
                      {" "}
                      <span className="text-gray-500">({duration.conversion_rate}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="h-6 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-end pr-2 text-white text-xs font-semibold"
                      style={{ width: `${duration.percentage}%` }}
                    >
                      {duration.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NUEVO: Demanda vs Disponibilidad */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Target className="h-6 w-6 text-furgocasa-orange" />
            Demanda vs Disponibilidad por Semana
          </h2>
          <p className="text-sm text-gray-600">
            Correlación entre búsquedas y ocupación para identificar oportunidades de precio
          </p>
        </div>

        {loadingDemand ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semana</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Búsquedas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ocupación</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponible</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Índice Demanda</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oportunidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recomendación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {demandAvailability?.demandAvailability.map((week) => (
                  <tr 
                    key={week.week_start} 
                    className={`hover:bg-gray-50 ${
                      week.price_opportunity === "high" ? "bg-red-50" :
                      week.price_opportunity === "medium" ? "bg-yellow-50" :
                      week.price_opportunity === "low" ? "bg-blue-50" :
                      ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {formatDate(week.week_start)} - {formatDate(week.week_end)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {week.unique_date_ranges} rangos únicos
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                        {week.search_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-16">
                          <div
                            className={`h-2 rounded-full ${
                              parseFloat(week.occupancy_rate) >= 80 ? "bg-red-500" :
                              parseFloat(week.occupancy_rate) >= 60 ? "bg-yellow-500" :
                              "bg-green-500"
                            }`}
                            style={{ width: `${week.occupancy_rate}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {week.occupancy_rate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {week.availability_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${
                        parseFloat(week.demand_index) >= 2 ? "text-red-600" :
                        parseFloat(week.demand_index) >= 1 ? "text-yellow-600" :
                        "text-green-600"
                      }`}>
                        {week.demand_index}
                      </span>
                      <div className="text-xs text-gray-500">
                        ({week.total_vehicles} veh.)
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        week.price_opportunity === "high" ? "bg-red-100 text-red-800" :
                        week.price_opportunity === "medium" ? "bg-yellow-100 text-yellow-800" :
                        week.price_opportunity === "low" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {week.price_opportunity === "high" ? "🔥 ALTA" :
                         week.price_opportunity === "medium" ? "💡 MEDIA" :
                         week.price_opportunity === "low" ? "📉 BAJA" :
                         "✓ Normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                      {week.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Leyenda */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">📖 Leyenda:</h3>
              <div className="grid md:grid-cols-2 gap-3 text-xs text-gray-600">
                <div>
                  <strong>Índice de Demanda:</strong> Búsquedas / Vehículos disponibles
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>• &gt;2.0 = Demanda muy alta</li>
                    <li>• 1.0-2.0 = Demanda moderada</li>
                    <li>• &lt;1.0 = Demanda baja</li>
                  </ul>
                </div>
                <div>
                  <strong>Oportunidad de Precio:</strong>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>🔥 <strong>ALTA:</strong> Ocupación ≥80% + Demanda ≥2.0 → Subir +15-20%</li>
                    <li>💡 <strong>MEDIA:</strong> Ocupación ≥60% + Demanda ≥1.5 → Subir +10%</li>
                    <li>📉 <strong>BAJA:</strong> Ocupación &lt;40% + Demanda &lt;0.5 → Promociones</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
