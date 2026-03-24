"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  Treemap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
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
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin
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

interface LocaleStatsData {
  localeStats: Array<{
    locale_code: string;
    locale_name: string;
    search_count: number;
    with_availability: number;
    selection_count: number;
    booking_count: number;
    percentage: string;
    selection_rate: string;
    conversion_rate: string;
  }>;
}

interface LocationStatsData {
  locationStats: Array<{
    city: string;
    location_name: string;
    search_count: number;
    with_availability: number;
    selection_count: number;
    booking_count: number;
    avg_price: string;
    percentage: string;
    selection_rate: string;
    conversion_rate: string;
  }>;
}

interface SearchTimingData {
  searchTiming: Array<{
    search_date: string;
    day_of_week: number;
    day_name: string;
    is_weekend: boolean;
    total_searches: number;
    searches_with_availability: number;
    vehicle_selections: number;
    bookings_created: number;
    selection_rate: string;
    conversion_rate: string;
    avg_advance_days: string;
    avg_rental_days: string;
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
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'Europe/Madrid' });
}

function formatDateWithYear(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' });
}

// Hook personalizado para ordenación de tablas
function useSortableData<T>(items: T[] | undefined, config?: { key: keyof T; direction: 'asc' | 'desc' }) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(config || null);

  const sortedItems = React.useMemo(() => {
    if (!items) return [];
    
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Manejar valores nulos/undefined
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Convertir strings numéricos a números para comparación correcta
        const aNum = typeof aValue === 'string' ? parseFloat(aValue) : aValue;
        const bNum = typeof bValue === 'string' ? parseFloat(bValue) : bValue;

        if (!isNaN(aNum as number) && !isNaN(bNum as number)) {
          return sortConfig.direction === 'asc' 
            ? (aNum as number) - (bNum as number)
            : (bNum as number) - (aNum as number);
        }

        // Comparación de strings
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}

// Componente de encabezado de tabla ordenable
function SortableTableHeader<T>({ 
  label, 
  sortKey, 
  currentSort, 
  onSort 
}: { 
  label: string; 
  sortKey: keyof T; 
  currentSort: { key: keyof T; direction: 'asc' | 'desc' } | null;
  onSort: (key: keyof T) => void;
}) {
  const isSorted = currentSort?.key === sortKey;
  
  return (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isSorted ? (
          currentSort?.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-30" />
        )}
      </div>
    </th>
  );
}

const TreemapCustomContent = (props: any) => {
  const { x, y, width, height, index, name, value, conversion, reservas } = props;
  
  // Colores: Top 3 en naranjas/cálidos, resto en azules
  const bgColors = [
    '#ea580c', // orange-600
    '#f97316', // orange-500
    '#fb923c', // orange-400
    '#2563eb', // blue-600
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#93c5fd', // blue-300
    '#bfdbfe', // blue-200
  ];
  const color = index < bgColors.length ? bgColors[index] : '#dbeafe';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="#ffffff"
        strokeWidth={3}
      />
      {width > 80 && height > 40 ? (
        <>
          <text
            x={x + 10}
            y={y + 24}
            fill="#ffffff"
            fontSize={13}
            fontWeight={500}
            style={{ textRendering: "geometricPrecision" }}
          >
            {name}
          </text>
          {height > 55 && (
            <text
              x={x + 10}
              y={y + 44}
              fill="#ffffff"
              fontSize={12}
              opacity={0.95}
              style={{ textRendering: "geometricPrecision" }}
            >
              {value} búsquedas
            </text>
          )}
          {height > 75 && width > 120 && (
            <text
              x={x + 10}
              y={y + 60}
              fill="#ffffff"
              fontSize={11}
              opacity={0.8}
              style={{ textRendering: "geometricPrecision" }}
            >
              {reservas} res. · {conversion}% conv.
            </text>
          )}
        </>
      ) : null}
    </g>
  );
};

export default function SearchAnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Actualizar título de la página
  useEffect(() => {
    document.title = "Admin - Busquedas";
  }, []);

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

  const { data: searchTiming, isLoading: loadingTiming } = useQuery<SearchTimingData>({
    queryKey: ["search-analytics", "search-timing", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("search-timing", dateRange.start, dateRange.end),
  });

  const { data: localeStats, isLoading: loadingLocale } = useQuery<LocaleStatsData>({
    queryKey: ["search-analytics", "locale", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("locale", dateRange.start, dateRange.end),
  });

  const { data: locationStats, isLoading: loadingLocation } = useQuery<LocationStatsData>({
    queryKey: ["search-analytics", "location", dateRange.start, dateRange.end],
    queryFn: () => fetchAnalytics("location", dateRange.start, dateRange.end),
  });

  // Hooks de ordenación para todas las tablas (deben estar al nivel superior)
  const sortedDates = useSortableData(topDates?.topDates, { key: 'search_count', direction: 'desc' });
  const sortedTiming = useSortableData(searchTiming?.searchTiming, { key: 'search_date', direction: 'desc' });
  const sortedVehicles = useSortableData(vehiclePerf?.vehiclePerformance, { key: 'times_selected', direction: 'desc' });
  const sortedDemand = useSortableData(demandAvailability?.demandAvailability, { key: 'week_start', direction: 'desc' });

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Análisis de Búsquedas</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">
            Analiza el comportamiento de búsqueda y conversión de usuarios
          </p>
        </div>

        {/* Selector de fechas */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600 whitespace-nowrap">Desde:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border rounded-lg w-full sm:w-auto text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-gray-600 whitespace-nowrap">Hasta:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border rounded-lg w-full sm:w-auto text-sm"
            />
          </div>
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
          <p className="text-sm text-gray-600">Reservas confirmadas</p>
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
            Búsqueda → Reserva confirmada
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

      {/* NUEVO: Búsquedas por Idioma */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            Búsquedas por Idioma
          </h2>
          <p className="text-sm text-gray-600">
            Distribución de búsquedas según el idioma de la página visitada
          </p>
        </div>

        {loadingLocale ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Gráfico de barras visual */}
            <div className="mb-8 space-y-4">
              {localeStats?.localeStats.map((locale) => {
                const percentage = parseFloat(locale.percentage);
                const getFlagEmoji = (code: string) => {
                  const flags: Record<string, string> = {
                    'es': '🇪🇸',
                    'en': '🇬🇧',
                    'fr': '🇫🇷',
                    'de': '🇩🇪',
                    'desconocido': '🌐'
                  };
                  return flags[code] || '🌐';
                };

                const getColorClasses = (code: string) => {
                  const colors: Record<string, { bg: string; bar: string }> = {
                    'es': { bg: 'bg-yellow-50', bar: 'bg-yellow-500' },
                    'en': { bg: 'bg-blue-50', bar: 'bg-blue-500' },
                    'fr': { bg: 'bg-indigo-50', bar: 'bg-indigo-500' },
                    'de': { bg: 'bg-red-50', bar: 'bg-red-500' },
                    'desconocido': { bg: 'bg-gray-50', bar: 'bg-gray-400' }
                  };
                  return colors[code] || { bg: 'bg-gray-50', bar: 'bg-gray-400' };
                };

                const colors = getColorClasses(locale.locale_code);

                return (
                  <div key={locale.locale_code} className={`p-4 rounded-lg border ${colors.bg}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getFlagEmoji(locale.locale_code)}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {locale.locale_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {locale.search_count} búsquedas ({locale.percentage}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-green-600">{locale.booking_count}</span> reservas
                        </div>
                        <div className="text-xs text-gray-500">
                          {locale.conversion_rate}% conversión
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`h-8 rounded-full ${colors.bar} flex items-center px-3 text-white text-sm font-bold transition-all duration-500`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {percentage}%
                      </div>
                    </div>
                    
                    {/* Detalles adicionales */}
                    <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-gray-900">{locale.with_availability}</div>
                        <div className="text-gray-500">Con disponib.</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-gray-900">{locale.selection_count}</div>
                        <div className="text-gray-500">Selecciones</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-gray-900">{locale.selection_rate}%</div>
                        <div className="text-gray-500">Tasa selección</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insights */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-2">
                💡 Insights
              </h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• El idioma se detecta desde la URL de la página visitada (/es/, /en/, /fr/, /de/)</li>
                <li>• Usa estos datos para identificar qué idiomas tienen mayor demanda</li>
                <li>• Compara tasas de conversión entre idiomas para optimizar traducciones</li>
                <li>• "Desconocido" aparece cuando no se pudo detectar el idioma (búsquedas directas a API)</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* NUEVO: Búsquedas por Ubicación (Murcia vs Madrid) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-green-600" />
            Búsquedas por Ubicación
          </h2>
          <p className="text-sm text-gray-600">
            Distribución de búsquedas según el punto de recogida
          </p>
        </div>

        {loadingLocation ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Gráfico de barras visual */}
            <div className="mb-8 space-y-4">
              {locationStats?.locationStats.map((location, index) => {
                const percentage = parseFloat(location.percentage);
                
                const locationIcons: Record<string, string> = {
                  'Murcia': '🌴', 'Madrid': '🏙️', 'Alicante': '🏖️',
                  'Albacete': '🌾', 'Valencia': '🍊', 'Barcelona': '⛪',
                  'Sin especificar': '❓'
                };
                const getLocationIcon = (city: string) => locationIcons[city] || '📍';

                const colorPalette = [
                  { bg: 'bg-orange-50', bar: 'bg-orange-500' },
                  { bg: 'bg-purple-50', bar: 'bg-purple-500' },
                  { bg: 'bg-cyan-50', bar: 'bg-cyan-500' },
                  { bg: 'bg-emerald-50', bar: 'bg-emerald-500' },
                  { bg: 'bg-rose-50', bar: 'bg-rose-500' },
                  { bg: 'bg-amber-50', bar: 'bg-amber-500' },
                  { bg: 'bg-indigo-50', bar: 'bg-indigo-500' },
                  { bg: 'bg-teal-50', bar: 'bg-teal-500' },
                ];
                const getColorClasses = (_city: string, idx: number) => {
                  if (_city === 'Sin especificar') return { bg: 'bg-gray-50', bar: 'bg-gray-400' };
                  return colorPalette[idx % colorPalette.length];
                };

                const colors = getColorClasses(location.city, index);

                return (
                  <div key={location.city} className={`p-4 rounded-lg border ${colors.bg}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getLocationIcon(location.city)}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {location.city}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {location.search_count} búsquedas ({location.percentage}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold text-green-600">{location.booking_count}</span> reservas
                        </div>
                        <div className="text-xs text-gray-500">
                          {location.conversion_rate}% conversión
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`h-8 rounded-full ${colors.bar} flex items-center px-3 text-white text-sm font-bold transition-all duration-500`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        {percentage}%
                      </div>
                    </div>
                    
                    {/* Detalles adicionales */}
                    <div className="mt-3 grid grid-cols-4 gap-3 text-xs">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-gray-900">{location.with_availability}</div>
                        <div className="text-gray-500">Con disponib.</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-gray-900">{location.selection_count}</div>
                        <div className="text-gray-500">Selecciones</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-gray-900">{location.selection_rate}%</div>
                        <div className="text-gray-500">Tasa selección</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold text-gray-900">€{location.avg_price}</div>
                        <div className="text-gray-500">Precio medio</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!locationStats?.locationStats || locationStats.locationStats.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No hay datos de ubicación disponibles para el período seleccionado
                </div>
              )}
            </div>

            {/* Comparativa rápida */}
            {locationStats?.locationStats && locationStats.locationStats.length >= 2 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-purple-50 border border-orange-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  📊 Comparativa {locationStats.locationStats.slice(0, 2).map(l => l.city).join(' vs ')}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {locationStats.locationStats.slice(0, 2).map((loc) => {
                    const icons: Record<string, string> = {
                      'Murcia': '🌴', 'Madrid': '🏙️', 'Alicante': '🏖️',
                      'Albacete': '🌾', 'Valencia': '🍊', 'Barcelona': '⛪'
                    };
                    return (
                    <div key={loc.city} className="p-3 bg-white rounded-lg border">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        {icons[loc.city] || '📍'} {loc.city}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Búsquedas:</span>
                          <span className="ml-1 font-semibold">{loc.search_count}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Reservas:</span>
                          <span className="ml-1 font-semibold text-green-600">{loc.booking_count}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Conversión:</span>
                          <span className={`ml-1 font-semibold ${parseFloat(loc.conversion_rate) > 5 ? 'text-green-600' : 'text-amber-600'}`}>
                            {loc.conversion_rate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Precio medio:</span>
                          <span className="ml-1 font-semibold">€{loc.avg_price}</span>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Insights */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2 text-sm flex items-center gap-2">
                💡 Insights
              </h3>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• La ubicación se determina por el punto de recogida seleccionado en la búsqueda</li>
                <li>• Compara el rendimiento entre ubicaciones para optimizar la estrategia de marketing</li>
                <li>• Analiza qué ubicación genera mejores tasas de conversión</li>
                <li>• El precio medio te ayuda a identificar diferencias de demanda entre zonas</li>
              </ul>
            </div>
          </>
        )}
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
        <p className="text-sm text-gray-600 mb-6">
          Muestra qué periodos quieren alquilar los clientes (fechas de recogida/devolución más buscadas)
        </p>

        {loadingDates ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Gráfico Treemap para los top 20 */}
            {topDates?.topDates && topDates.topDates.length > 0 && (
              <div className="h-96 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={topDates.topDates.slice(0, 15).map(d => ({
                      name: `${formatDate(d.pickup_date)} - ${formatDate(d.dropoff_date)}`,
                      size: d.search_count,
                      reservas: d.bookings_count,
                      conversion: parseFloat(d.conversion_rate)
                    }))}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    fill="#8884d8"
                    content={<TreemapCustomContent />}
                  >
                    <RechartsTooltip 
                      formatter={(value: any, name: string, props: any) => {
                        if (name === 'size') return [value, 'Búsquedas'];
                        return [value, name];
                      }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <SortableTableHeader label="Fechas" sortKey="pickup_date" currentSort={sortedDates.sortConfig} onSort={sortedDates.requestSort} />
                    <SortableTableHeader label="Días" sortKey="rental_days" currentSort={sortedDates.sortConfig} onSort={sortedDates.requestSort} />
                    <SortableTableHeader label="Búsquedas" sortKey="search_count" currentSort={sortedDates.sortConfig} onSort={sortedDates.requestSort} />
                    <SortableTableHeader label="Reservas" sortKey="bookings_count" currentSort={sortedDates.sortConfig} onSort={sortedDates.requestSort} />
                    <SortableTableHeader label="Conv. %" sortKey="conversion_rate" currentSort={sortedDates.sortConfig} onSort={sortedDates.requestSort} />
                    <SortableTableHeader label="Temporada" sortKey="season" currentSort={sortedDates.sortConfig} onSort={sortedDates.requestSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedDates.items.map((date, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium whitespace-nowrap">
                        {formatDateWithYear(date.pickup_date)} <span className="text-gray-400 mx-1">→</span> {formatDateWithYear(date.dropoff_date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {date.rental_days} d
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-blue-100 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${Math.min(100, (date.search_count / (topDates?.topDates[0]?.search_count || 1)) * 100)}%` }} 
                            />
                          </div>
                          {date.search_count}
                        </div>
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
                        <span className="inline-flex items-center gap-1.5">
                          {date.season ? (
                            <>
                              <span className={`w-2 h-2 rounded-full ${
                                date.season.toLowerCase().includes('alta') ? 'bg-red-500' :
                                date.season.toLowerCase().includes('media') ? 'bg-yellow-500' :
                                'bg-blue-500'
                              }`} />
                              {date.season}
                            </>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* NUEVO: Cuándo buscan los clientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Clock className="h-6 w-6 text-purple-600" />
            Cuándo Buscan los Clientes
          </h2>
          <p className="text-sm text-gray-600">
            Análisis de en qué momento realizan las búsquedas (no confundir con fechas que buscan)
          </p>
        </div>

        {loadingTiming ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <SortableTableHeader label="Fecha" sortKey="search_date" currentSort={sortedTiming.sortConfig} onSort={sortedTiming.requestSort} />
                  <SortableTableHeader label="Día" sortKey="day_name" currentSort={sortedTiming.sortConfig} onSort={sortedTiming.requestSort} />
                  <SortableTableHeader label="Búsquedas" sortKey="total_searches" currentSort={sortedTiming.sortConfig} onSort={sortedTiming.requestSort} />
                  <SortableTableHeader label="Disponib." sortKey="searches_with_availability" currentSort={sortedTiming.sortConfig} onSort={sortedTiming.requestSort} />
                  <SortableTableHeader label="Selecciones" sortKey="vehicle_selections" currentSort={sortedTiming.sortConfig} onSort={sortedTiming.requestSort} />
                  <SortableTableHeader label="Reservas" sortKey="bookings_created" currentSort={sortedTiming.sortConfig} onSort={sortedTiming.requestSort} />
                  <SortableTableHeader label="Conv. %" sortKey="conversion_rate" currentSort={sortedTiming.sortConfig} onSort={sortedTiming.requestSort} />
                  <SortableTableHeader label="Antelación" sortKey="avg_advance_days" currentSort={sortedTiming.sortConfig} onSort={sortedTiming.requestSort} />
                  <SortableTableHeader label="Días alquiler" sortKey="avg_rental_days" currentSort={sortedTiming.sortConfig} onSort={sortedTiming.requestSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTiming.items.map((timing) => (
                  <tr 
                    key={timing.search_date} 
                    className={`hover:bg-gray-50 ${timing.is_weekend ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatDate(timing.search_date)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        timing.is_weekend 
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {timing.day_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                      {timing.total_searches}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {timing.searches_with_availability}
                    </td>
                    <td className="px-4 py-3 text-sm text-purple-600 font-semibold">
                      {timing.vehicle_selections}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                      {timing.bookings_created}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(timing.conversion_rate) >= 25 
                          ? "bg-green-100 text-green-800"
                          : parseFloat(timing.conversion_rate) >= 10
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {timing.conversion_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {timing.avg_advance_days} días
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {timing.avg_rental_days} días
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Insights */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                  📊 Insights de fin de semana
                </h3>
                <p className="text-xs text-blue-700">
                  Las filas marcadas en azul son fines de semana. Compara el volumen de búsquedas entre semana vs fin de semana.
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2 text-sm">
                  💡 Antelación media
                </h3>
                <p className="text-xs text-purple-700">
                  La columna "Antelación" muestra con cuántos días de antelación los usuarios buscan respecto a su fecha de recogida deseada.
                </p>
              </div>
            </div>
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
                  <SortableTableHeader label="Vehículo" sortKey="vehicle_name" currentSort={sortedVehicles.sortConfig} onSort={sortedVehicles.requestSort} />
                  <SortableTableHeader label="Selecciones" sortKey="times_selected" currentSort={sortedVehicles.sortConfig} onSort={sortedVehicles.requestSort} />
                  <SortableTableHeader label="Reservas" sortKey="times_booked" currentSort={sortedVehicles.sortConfig} onSort={sortedVehicles.requestSort} />
                  <SortableTableHeader label="Conv. %" sortKey="booking_rate" currentSort={sortedVehicles.sortConfig} onSort={sortedVehicles.requestSort} />
                  <SortableTableHeader label="Precio medio" sortKey="avg_price" currentSort={sortedVehicles.sortConfig} onSort={sortedVehicles.requestSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedVehicles.items.map((vehicle) => (
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
                  <SortableTableHeader label="Semana" sortKey="week_start" currentSort={sortedDemand.sortConfig} onSort={sortedDemand.requestSort} />
                  <SortableTableHeader label="Año" sortKey="week_start" currentSort={sortedDemand.sortConfig} onSort={sortedDemand.requestSort} />
                  <SortableTableHeader label="Búsquedas" sortKey="search_count" currentSort={sortedDemand.sortConfig} onSort={sortedDemand.requestSort} />
                  <SortableTableHeader label="Ocupación" sortKey="occupancy_rate" currentSort={sortedDemand.sortConfig} onSort={sortedDemand.requestSort} />
                  <SortableTableHeader label="Disponible" sortKey="availability_rate" currentSort={sortedDemand.sortConfig} onSort={sortedDemand.requestSort} />
                  <SortableTableHeader label="Índice Demanda" sortKey="demand_index" currentSort={sortedDemand.sortConfig} onSort={sortedDemand.requestSort} />
                  <SortableTableHeader label="Oportunidad" sortKey="price_opportunity" currentSort={sortedDemand.sortConfig} onSort={sortedDemand.requestSort} />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recomendación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedDemand.items.map((week) => {
                  const weekYear = new Date(week.week_start).getFullYear();
                  return (
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
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-bold bg-gray-100 text-gray-900 border border-gray-300">
                        {weekYear}
                      </span>
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
                  );
                })}
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
