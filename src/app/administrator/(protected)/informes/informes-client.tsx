"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Car,
  Percent,
  Filter,
  X,
  ChevronDown,
  Download,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  differenceInDays,
} from "date-fns";
import { es } from "date-fns/locale";

// Tipos
interface Vehicle {
  id: string;
  name: string;
  internal_code?: string;
  is_for_rent: boolean;
}

interface Booking {
  id: string;
  vehicle_id: string;
  customer_id: string | null;
  pickup_date: string;
  dropoff_date: string;
  total_price: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  customer_name: string;
  customer_email: string;
  days: number;
  vehicle?: {
    id: string;
    name: string;
    internal_code?: string;
  };
}

interface Season {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface InformesClientProps {
  vehicles: Vehicle[];
  bookings: Booking[];
  seasons: Season[];
}

// Colores para gráficos
const COLORS = [
  "#F97316", // orange-500
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#F59E0B", // amber-500
  "#06B6D4", // cyan-500
  "#EF4444", // red-500
];

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function InformesClient({
  vehicles,
  bookings,
  seasons,
}: InformesClientProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Estados de filtros
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  
  // Modo de visualización de ingresos: 'creation' (fecha de creación) o 'rental' (días alquilados)
  const [revenueMode, setRevenueMode] = useState<'creation' | 'rental'>('creation');

  // Vehículos de alquiler solamente
  const rentableVehicles = vehicles.filter(v => v.is_for_rent);

  // Años disponibles basado en reservas
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    bookings.forEach(b => {
      years.add(new Date(b.pickup_date).getFullYear());
    });
    // Añadir año actual si no hay reservas
    years.add(currentYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [bookings, currentYear]);

  // Obtener rango de fechas según filtros
  const getDateRange = useMemo(() => {
    if (dateRange) {
      return { start: parseISO(dateRange.start), end: parseISO(dateRange.end) };
    }
    if (selectedSeason) {
      // Buscar todas las temporadas que pertenecen al tipo seleccionado
      let seasonsOfType: Season[] = [];
      
      if (selectedSeason === 'baja') {
        seasonsOfType = seasons.filter(s => 
          s.is_active && 
          s.slug &&
          !s.slug.toLowerCase().includes('media') && 
          !s.slug.toLowerCase().includes('alta')
        );
      } else if (selectedSeason === 'media') {
        seasonsOfType = seasons.filter(s => 
          s.is_active && 
          s.slug && 
          s.slug.toLowerCase().includes('media')
        );
      } else if (selectedSeason === 'alta') {
        seasonsOfType = seasons.filter(s => 
          s.is_active && 
          s.slug && 
          s.slug.toLowerCase().includes('alta')
        );
      }
      
      // Si hay temporadas, obtener el rango completo (desde la fecha más temprana hasta la más tardía)
      if (seasonsOfType.length > 0) {
        const allDates = seasonsOfType.flatMap(s => [parseISO(s.start_date), parseISO(s.end_date)]);
        const start = allDates.reduce((min, date) => date < min ? date : min);
        const end = allDates.reduce((max, date) => date > max ? date : max);
        return { start, end };
      }
    }
    if (selectedMonth !== null) {
      const start = startOfMonth(new Date(selectedYear, selectedMonth));
      const end = endOfMonth(new Date(selectedYear, selectedMonth));
      return { start, end };
    }
    // Por defecto: año completo
    return { start: startOfYear(new Date(selectedYear, 0)), end: endOfYear(new Date(selectedYear, 0)) };
  }, [selectedYear, selectedMonth, selectedSeason, dateRange, seasons]);

  // Estados válidos para informes (solo alquileres reales)
  const VALID_STATUSES: Booking["status"][] = ["confirmed", "in_progress", "completed"];

  // Filtrar reservas según criterios
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Solo incluir reservas confirmadas, en curso o completadas (alquileres reales)
      if (!VALID_STATUSES.includes(booking.status)) return false;
      
      // Filtro por vehículos
      if (selectedVehicles.length > 0 && !selectedVehicles.includes(booking.vehicle_id)) {
        return false;
      }

      // Filtro por fecha
      const pickupDate = parseISO(booking.pickup_date);
      const dropoffDate = parseISO(booking.dropoff_date);
      
      // La reserva debe solaparse con el rango seleccionado
      const overlaps = 
        pickupDate <= getDateRange.end && dropoffDate >= getDateRange.start;
      
      return overlaps;
    });
  }, [bookings, selectedVehicles, getDateRange]);

  // ============================================
  // CÁLCULOS DE MÉTRICAS
  // ============================================

  // Ingresos totales
  const totalRevenue = useMemo(() => {
    return filteredBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  }, [filteredBookings]);

  // Clientes únicos
  const uniqueCustomers = useMemo(() => {
    const customerEmails = new Set(filteredBookings.map(b => b.customer_email));
    return customerEmails.size;
  }, [filteredBookings]);

  // Total reservas
  const totalBookings = filteredBookings.length;

  // Cálculo de ocupación real
  const occupancyData = useMemo(() => {
    const vehiclesToCalculate = selectedVehicles.length > 0 
      ? rentableVehicles.filter(v => selectedVehicles.includes(v.id))
      : rentableVehicles;
    
    if (vehiclesToCalculate.length === 0) return { percentage: 0, daysBooked: 0, daysAvailable: 0 };

    // Días totales en el rango * número de vehículos
    const daysInRange = differenceInDays(getDateRange.end, getDateRange.start) + 1;
    const totalAvailableDays = daysInRange * vehiclesToCalculate.length;

    // Calcular días reservados (sin doble conteo)
    let totalBookedDays = 0;
    
    vehiclesToCalculate.forEach(vehicle => {
      const vehicleBookings = filteredBookings.filter(b => b.vehicle_id === vehicle.id);
      
      // Crear un set de fechas reservadas para evitar solapamientos
      const bookedDates = new Set<string>();
      
      vehicleBookings.forEach(booking => {
        const bookingStart = parseISO(booking.pickup_date);
        const bookingEnd = parseISO(booking.dropoff_date);
        
        // Solo contar días dentro del rango seleccionado
        const effectiveStart = bookingStart < getDateRange.start ? getDateRange.start : bookingStart;
        const effectiveEnd = bookingEnd > getDateRange.end ? getDateRange.end : bookingEnd;
        
        if (effectiveStart <= effectiveEnd) {
          const days = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd });
          days.forEach(day => bookedDates.add(format(day, 'yyyy-MM-dd')));
        }
      });
      
      totalBookedDays += bookedDates.size;
    });

    const percentage = totalAvailableDays > 0 
      ? (totalBookedDays / totalAvailableDays) * 100 
      : 0;

    return {
      percentage: Math.round(percentage * 10) / 10,
      daysBooked: totalBookedDays,
      daysAvailable: totalAvailableDays,
    };
  }, [filteredBookings, rentableVehicles, selectedVehicles, getDateRange]);

  // Valor medio por reserva
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // ============================================
  // DATOS PARA GRÁFICOS
  // ============================================

  // Ingresos por mes
  const revenueByMonth = useMemo(() => {
    const data: { month: string; ingresos: number; reservas: number }[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(new Date(selectedYear, i));
      const monthEnd = endOfMonth(new Date(selectedYear, i));
      
      let ingresos = 0;
      let reservasCount = 0;
      
      if (revenueMode === 'creation') {
        // Modo "creación de pedidos": ingresos del mes en que se creó/confirmó la reserva
        const monthBookings = filteredBookings.filter(b => {
          const pickupDate = parseISO(b.pickup_date);
          return isWithinInterval(pickupDate, { start: monthStart, end: monthEnd });
        });
        
        ingresos = monthBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        reservasCount = monthBookings.length;
      } else {
        // Modo "días alquilados": ingresos distribuidos según los días reales del alquiler
        filteredBookings.forEach(booking => {
          const bookingStart = parseISO(booking.pickup_date);
          const bookingEnd = parseISO(booking.dropoff_date);
          
          // Verificar si la reserva solapa con este mes
          if (bookingStart <= monthEnd && bookingEnd >= monthStart) {
            // Calcular días de la reserva que caen en este mes
            const effectiveStart = bookingStart < monthStart ? monthStart : bookingStart;
            const effectiveEnd = bookingEnd > monthEnd ? monthEnd : bookingEnd;
            
            if (effectiveStart <= effectiveEnd) {
              const daysInMonth = differenceInDays(effectiveEnd, effectiveStart) + 1;
              const totalDays = booking.days || differenceInDays(bookingEnd, bookingStart) + 1;
              
              // Distribuir ingresos proporcionalmente
              const proportionalRevenue = (booking.total_price || 0) * (daysInMonth / totalDays);
              ingresos += proportionalRevenue;
              
              // Contar la reserva si tiene días en este mes
              if (isWithinInterval(bookingStart, { start: monthStart, end: monthEnd })) {
                reservasCount++;
              }
            }
          }
        });
      }
      
      data.push({
        month: MONTHS[i].substring(0, 3),
        ingresos: Math.round(ingresos * 100) / 100, // Redondear a 2 decimales
        reservas: reservasCount,
      });
    }
    
    return data;
  }, [filteredBookings, selectedYear, revenueMode]);

  // Ocupación por mes
  const occupancyByMonth = useMemo(() => {
    const vehiclesToCalculate = selectedVehicles.length > 0 
      ? rentableVehicles.filter(v => selectedVehicles.includes(v.id))
      : rentableVehicles;
    
    if (vehiclesToCalculate.length === 0) return [];

    const data: { month: string; ocupacion: number }[] = [];
    
    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(new Date(selectedYear, i));
      const monthEnd = endOfMonth(new Date(selectedYear, i));
      const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
      const totalAvailableDays = daysInMonth * vehiclesToCalculate.length;
      
      let totalBookedDays = 0;
      
      vehiclesToCalculate.forEach(vehicle => {
        const vehicleBookings = bookings.filter(b => 
          b.vehicle_id === vehicle.id && 
          VALID_STATUSES.includes(b.status) &&
          (selectedVehicles.length === 0 || selectedVehicles.includes(b.vehicle_id))
        );
        
        const bookedDates = new Set<string>();
        
        vehicleBookings.forEach(booking => {
          const bookingStart = parseISO(booking.pickup_date);
          const bookingEnd = parseISO(booking.dropoff_date);
          
          const effectiveStart = bookingStart < monthStart ? monthStart : bookingStart;
          const effectiveEnd = bookingEnd > monthEnd ? monthEnd : bookingEnd;
          
          if (effectiveStart <= effectiveEnd) {
            const days = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd });
            days.forEach(day => bookedDates.add(format(day, 'yyyy-MM-dd')));
          }
        });
        
        totalBookedDays += bookedDates.size;
      });

      const percentage = totalAvailableDays > 0 
        ? (totalBookedDays / totalAvailableDays) * 100 
        : 0;
      
      data.push({
        month: MONTHS[i].substring(0, 3),
        ocupacion: Math.round(percentage * 10) / 10,
      });
    }
    
    return data;
  }, [bookings, rentableVehicles, selectedVehicles, selectedYear]);

  // Datos por vehículo
  const vehicleStats = useMemo(() => {
    const vehiclesToShow = selectedVehicles.length > 0 
      ? rentableVehicles.filter(v => selectedVehicles.includes(v.id))
      : rentableVehicles;

    return vehiclesToShow.map(vehicle => {
      const vehicleBookings = filteredBookings.filter(b => b.vehicle_id === vehicle.id);
      const revenue = vehicleBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      
      // Calcular ocupación del vehículo
      const daysInRange = differenceInDays(getDateRange.end, getDateRange.start) + 1;
      const bookedDates = new Set<string>();
      
      vehicleBookings.forEach(booking => {
        const bookingStart = parseISO(booking.pickup_date);
        const bookingEnd = parseISO(booking.dropoff_date);
        
        const effectiveStart = bookingStart < getDateRange.start ? getDateRange.start : bookingStart;
        const effectiveEnd = bookingEnd > getDateRange.end ? getDateRange.end : bookingEnd;
        
        if (effectiveStart <= effectiveEnd) {
          const days = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd });
          days.forEach(day => bookedDates.add(format(day, 'yyyy-MM-dd')));
        }
      });
      
      const occupancy = daysInRange > 0 ? (bookedDates.size / daysInRange) * 100 : 0;

      return {
        name: vehicle.internal_code || vehicle.name,
        fullName: vehicle.name,
        ingresos: revenue,
        reservas: vehicleBookings.length,
        ocupacion: Math.round(occupancy * 10) / 10,
        diasReservados: bookedDates.size,
      };
    }).sort((a, b) => b.ingresos - a.ingresos);
  }, [rentableVehicles, selectedVehicles, filteredBookings, getDateRange]);

  // Datos por temporada - Agrupados en 3 categorías: Baja, Media, Alta
  const seasonStats = useMemo(() => {
    // Definir los tipos de temporada
    type SeasonType = 'baja' | 'media' | 'alta';
    const seasonTypes: SeasonType[] = ['baja', 'media', 'alta'];
    const seasonNames = {
      baja: 'Temporada Baja',
      media: 'Temporada Media',
      alta: 'Temporada Alta'
    };
    
    const vehiclesToCalculate = selectedVehicles.length > 0 
      ? rentableVehicles.filter(v => selectedVehicles.includes(v.id))
      : rentableVehicles;

    return seasonTypes.map(seasonType => {
      // Obtener todas las temporadas de este tipo
      let seasonsOfType: Season[] = [];
      
      if (seasonType === 'baja') {
        // Temporada baja: todas las que NO contienen 'media' ni 'alta' en el slug
        seasonsOfType = seasons.filter(s => 
          s.is_active && 
          s.slug &&
          !s.slug.toLowerCase().includes('media') && 
          !s.slug.toLowerCase().includes('alta')
        );
      } else {
        // Temporada media o alta: las que contienen el tipo en el slug
        seasonsOfType = seasons.filter(s => 
          s.is_active && 
          s.slug && 
          s.slug.toLowerCase().includes(seasonType)
        );
      }

      let totalRevenue = 0;
      const uniqueBookingIds = new Set<string>();
      let totalBookedDays = 0;
      let totalAvailableDays = 0;
      const allPeriods: string[] = [];

      // Procesar cada temporada de este tipo
      seasonsOfType.forEach(season => {
        const seasonStart = parseISO(season.start_date);
        const seasonEnd = parseISO(season.end_date);
        
        // Añadir periodo al array
        allPeriods.push(`${format(seasonStart, 'dd MMM', { locale: es })} - ${format(seasonEnd, 'dd MMM', { locale: es })}`);

        // Filtrar reservas que caen en esta temporada
        const seasonBookings = bookings.filter(b => {
          if (!VALID_STATUSES.includes(b.status)) return false;
          if (selectedVehicles.length > 0 && !selectedVehicles.includes(b.vehicle_id)) return false;
          
          const pickupDate = parseISO(b.pickup_date);
          const dropoffDate = parseISO(b.dropoff_date);
          
          return pickupDate <= seasonEnd && dropoffDate >= seasonStart;
        });

        // Sumar ingresos (distribuidos proporcionalmente si la reserva cruza varias temporadas)
        seasonBookings.forEach(booking => {
          uniqueBookingIds.add(booking.id); // Guardar ID único para contar reservas
          
          // Calcular días de la reserva que caen en esta temporada específica
          const bookingStart = parseISO(booking.pickup_date);
          const bookingEnd = parseISO(booking.dropoff_date);
          
          const effectiveStart = bookingStart < seasonStart ? seasonStart : bookingStart;
          const effectiveEnd = bookingEnd > seasonEnd ? seasonEnd : bookingEnd;
          
          if (effectiveStart <= effectiveEnd) {
            const daysInSeason = differenceInDays(effectiveEnd, effectiveStart) + 1;
            const totalDays = booking.days || differenceInDays(bookingEnd, bookingStart) + 1;
            
            // Distribuir ingresos proporcionalmente
            const proportionalRevenue = (booking.total_price || 0) * (daysInSeason / totalDays);
            totalRevenue += proportionalRevenue;
          }
        });

        // Calcular ocupación de esta temporada específica
        const daysInSeason = differenceInDays(seasonEnd, seasonStart) + 1;
        totalAvailableDays += daysInSeason * vehiclesToCalculate.length;
        
        vehiclesToCalculate.forEach(vehicle => {
          const vehicleBookings = seasonBookings.filter(b => b.vehicle_id === vehicle.id);
          const bookedDates = new Set<string>();
          
          vehicleBookings.forEach(booking => {
            const bookingStart = parseISO(booking.pickup_date);
            const bookingEnd = parseISO(booking.dropoff_date);
            
            const effectiveStart = bookingStart < seasonStart ? seasonStart : bookingStart;
            const effectiveEnd = bookingEnd > seasonEnd ? seasonEnd : bookingEnd;
            
            if (effectiveStart <= effectiveEnd) {
              const days = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd });
              days.forEach(day => bookedDates.add(format(day, 'yyyy-MM-dd')));
            }
          });
          
          totalBookedDays += bookedDates.size;
        });
      });

      const occupancy = totalAvailableDays > 0 
        ? (totalBookedDays / totalAvailableDays) * 100 
        : 0;

      return {
        name: seasonNames[seasonType],
        ingresos: Math.round(totalRevenue * 100) / 100, // Redondear a 2 decimales
        reservas: uniqueBookingIds.size, // Contar reservas únicas
        ocupacion: Math.round(occupancy * 10) / 10,
        periodo: allPeriods.length > 0 ? allPeriods.join(' | ') : 'Sin periodos definidos',
      };
    });
  }, [seasons, bookings, rentableVehicles, selectedVehicles]);

  // Distribución de ingresos para gráfico de pastel
  const revenueDistribution = useMemo(() => {
    return vehicleStats.slice(0, 6).map((v, i) => ({
      name: v.name,
      value: v.ingresos,
      color: COLORS[i % COLORS.length],
    }));
  }, [vehicleStats]);

  // ============================================
  // FUNCIONES DE CONTROL
  // ============================================

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const clearFilters = () => {
    setSelectedVehicles([]);
    setSelectedMonth(null);
    setSelectedSeason(null);
    setDateRange(null);
    setSelectedYear(currentYear);
  };

  const hasActiveFilters = 
    selectedVehicles.length > 0 || 
    selectedMonth !== null || 
    selectedSeason !== null || 
    dateRange !== null ||
    selectedYear !== currentYear;

  // Descripción del periodo seleccionado
  const periodDescription = useMemo(() => {
    if (dateRange) {
      return `${format(parseISO(dateRange.start), 'd MMM yyyy', { locale: es })} - ${format(parseISO(dateRange.end), 'd MMM yyyy', { locale: es })}`;
    }
    if (selectedSeason) {
      const seasonNames: Record<string, string> = {
        baja: 'Temporada Baja',
        media: 'Temporada Media',
        alta: 'Temporada Alta'
      };
      return seasonNames[selectedSeason] || '';
    }
    if (selectedMonth !== null) {
      return `${MONTHS[selectedMonth]} ${selectedYear}`;
    }
    return `Año ${selectedYear}`;
  }, [selectedYear, selectedMonth, selectedSeason, dateRange]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Informes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">
            Análisis de rendimiento • <span className="font-medium text-furgocasa-orange">{periodDescription}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-furgocasa-orange text-white border-furgocasa-orange' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-white text-furgocasa-orange text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Selector de Año */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Selector de Mes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
              <select
                value={selectedMonth ?? ""}
                onChange={(e) => {
                  setSelectedMonth(e.target.value === "" ? null : Number(e.target.value));
                  setSelectedSeason(null);
                  setDateRange(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
              >
                <option value="">Todo el año</option>
                {MONTHS.map((month, i) => (
                  <option key={i} value={i}>{month}</option>
                ))}
              </select>
            </div>

            {/* Selector de Temporada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temporada</label>
              <select
                value={selectedSeason ?? ""}
                onChange={(e) => {
                  setSelectedSeason(e.target.value === "" ? null : e.target.value);
                  setSelectedMonth(null);
                  setDateRange(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="baja">Temporada Baja</option>
                <option value="media">Temporada Media</option>
                <option value="alta">Temporada Alta</option>
              </select>
            </div>

            {/* Rango personalizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rango personalizado</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateRange?.start ?? ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setDateRange(prev => ({ 
                        start: e.target.value, 
                        end: prev?.end || e.target.value 
                      }));
                      setSelectedMonth(null);
                      setSelectedSeason(null);
                    }
                  }}
                  className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
                <input
                  type="date"
                  value={dateRange?.end ?? ""}
                  onChange={(e) => {
                    if (e.target.value && dateRange?.start) {
                      setDateRange(prev => ({ 
                        start: prev?.start || e.target.value, 
                        end: e.target.value 
                      }));
                    }
                  }}
                  className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Selector de Vehículos */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehículos 
              {selectedVehicles.length > 0 && (
                <span className="ml-2 text-furgocasa-orange">({selectedVehicles.length} seleccionados)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {rentableVehicles.map(vehicle => (
                <button
                  key={vehicle.id}
                  onClick={() => toggleVehicle(vehicle.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedVehicles.includes(vehicle.id)
                      ? 'bg-furgocasa-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {vehicle.internal_code || vehicle.name}
                </button>
              ))}
              {selectedVehicles.length > 0 && (
                <button
                  onClick={() => setSelectedVehicles([])}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Quitar todos
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ingresos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-sm text-gray-500">Ingresos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Media: {avgBookingValue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}/reserva
          </p>
        </div>

        {/* Ocupación */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Percent className="h-6 w-6 text-blue-600" />
            </div>
            {occupancyData.percentage >= 50 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          <p className="text-sm text-gray-500">Ocupación</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {occupancyData.percentage}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {occupancyData.daysBooked} de {occupancyData.daysAvailable} días
          </p>
        </div>

        {/* Reservas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Reservas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalBookings}</p>
          <p className="text-xs text-gray-500 mt-1">
            {(totalBookings / Math.max(1, (selectedVehicles.length || rentableVehicles.length))).toFixed(1)} por vehículo
          </p>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Clientes únicos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{uniqueCustomers}</p>
          <p className="text-xs text-gray-500 mt-1">
            {totalBookings > 0 ? (totalBookings / uniqueCustomers).toFixed(1) : 0} reservas/cliente
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos por Mes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Ingresos por mes ({selectedYear})</h3>
          </div>
          
          {/* Selector de modo de visualización */}
          <div className="mb-4">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setRevenueMode('creation')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  revenueMode === 'creation'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Creación de pedidos
              </button>
              <button
                onClick={() => setRevenueMode('rental')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  revenueMode === 'rental'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Días alquilados
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {revenueMode === 'creation' 
                ? 'Ingresos contabilizados en el mes que se realizó la reserva'
                : 'Ingresos distribuidos según los días reales del alquiler en cada mes'
              }
            </p>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }), 'Ingresos']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
                <Bar dataKey="ingresos" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ocupación por Mes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Ocupación por mes ({selectedYear})</h3>
          </div>
          
          {/* Espacio equivalente al selector de modo para mantener alineación */}
          <div className="mb-4">
            <div className="h-10"></div>
            <p className="text-xs text-gray-500 mt-2">
              Porcentaje de días ocupados respecto al total de días disponibles
            </p>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Ocupación']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ocupacion" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparativas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución de Ingresos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de ingresos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {revenueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {revenueDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla por Vehículo */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rendimiento por vehículo</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Vehículo</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Ingresos</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Reservas</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Ocupación</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Días</th>
                </tr>
              </thead>
              <tbody>
                {vehicleStats.map((vehicle, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-gray-900">{vehicle.name}</p>
                        <p className="text-xs text-gray-500">{vehicle.fullName}</p>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 font-semibold text-gray-900">
                      {vehicle.ingresos.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="text-right py-3 px-2 text-gray-700">{vehicle.reservas}</td>
                    <td className="text-right py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.ocupacion >= 70 ? 'bg-green-100 text-green-700' :
                        vehicle.ocupacion >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {vehicle.ocupacion}%
                      </span>
                    </td>
                    <td className="text-right py-3 px-2 text-gray-500 text-sm">{vehicle.diasReservados}</td>
                  </tr>
                ))}
              </tbody>
              {vehicleStats.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="py-3 px-2 font-bold text-gray-900">Total</td>
                    <td className="text-right py-3 px-2 font-bold text-gray-900">
                      {totalRevenue.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="text-right py-3 px-2 font-bold text-gray-900">{totalBookings}</td>
                    <td className="text-right py-3 px-2 font-bold text-furgocasa-orange">{occupancyData.percentage}%</td>
                    <td className="text-right py-3 px-2 font-bold text-gray-700">{occupancyData.daysBooked}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      {/* Tabla por Temporada */}
      {seasonStats.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rendimiento por temporada</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Temporada</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Periodo</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ingresos</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Reservas</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Ocupación</th>
                </tr>
              </thead>
              <tbody>
                {seasonStats.map((season, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{season.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{season.periodo}</td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900">
                      {season.ingresos.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="text-right py-3 px-4 text-gray-700">{season.reservas}</td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-furgocasa-orange" 
                            style={{ width: `${Math.min(season.ocupacion, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">{season.ocupacion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gráfico de Barras Comparativo por Vehículo */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Comparativa de vehículos</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vehicleStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 12 }} width={80} />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  if (name === 'ingresos') return [value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }), 'Ingresos'];
                  if (name === 'ocupacion') return [`${value}%`, 'Ocupación'];
                  return [value, name];
                }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Legend />
              <Bar dataKey="ingresos" name="Ingresos (€)" fill="#F97316" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info adicional */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p>
          <strong>Nota:</strong> Solo se contabilizan <span className="font-semibold text-green-700">alquileres reales</span> (reservas confirmadas, en curso y completadas).
          Las reservas pendientes y canceladas no se incluyen. Los cálculos de ocupación se basan en días reservados vs. días disponibles en el periodo seleccionado.
        </p>
      </div>
    </div>
  );
}
