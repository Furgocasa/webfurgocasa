"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SmartTooltip } from "@/components/admin/smart-tooltip";
import type { Database } from "@/lib/supabase/database.types";
import { useAdminData } from "@/hooks/use-admin-data";

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];

interface Vehicle {
  id: string;
  name: string;
  brand: string | null;
  slug: string;
  internal_code: string | null;
  model?: string | null;
  plate_number?: string | null;
  year?: number | null;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

interface RentalLocation {
  id: string;
  name: string;
  address?: string;
}

interface BookingExtra {
  id: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
  extra: {
    id: string;
    name: string;
    description?: string;
  };
}

interface Booking {
  id: string;
  booking_number: string;
  pickup_date: string;
  dropoff_date: string;
  pickup_time: string;
  dropoff_time: string;
  pickup_location_id?: string;
  dropoff_location_id?: string;
  pickup_location_name?: string;
  dropoff_location_name?: string;
  total_price: number;
  deposit_amount?: number;
  amount_paid?: number;
  payment_status?: string;
  status: string;
  notes?: string;
  vehicle_id: string;
  customer_id: string;
  customer: Customer | null;
  vehicle?: Vehicle;
  pickup_location?: RentalLocation;
  dropoff_location?: RentalLocation;
  booking_extras?: BookingExtra[];
}

export default function CalendarioPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState(new Date());
  const [monthsToShow, setMonthsToShow] = useState(3); // Por defecto 3 meses
  const [isMobile, setIsMobile] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<(Booking & { vehicle?: Vehicle }) | null>(null);
  
  // Estado para ordenamiento
  const [sortField, setSortField] = useState<'internal_code' | 'name'>('internal_code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Cargar vehículos con el hook
  const { 
    data: vehicles, 
    loading: vehiclesLoading, 
    error: vehiclesError 
  } = useAdminData<Vehicle[]>({
    queryFn: async () => {
      const result = await supabase
        .from('vehicles')
        .select('id, name, brand, slug, internal_code')
        .eq('is_for_rent', true)
        .order('internal_code', { ascending: true, nullsFirst: false });
      
      return {
        data: (result.data || []) as Vehicle[],
        error: result.error
      };
    },
    retryCount: 3,
    retryDelay: 1000,
    initialDelay: 200,
  });

  // Cargar bookings con el hook (depende de startDate y monthsToShow)
  const { 
    data: bookingsRaw, 
    loading: bookingsLoading, 
    error: bookingsError 
  } = useAdminData<any[]>({
    queryFn: async () => {
      // Calcular rango de fechas para los meses a mostrar
      const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + monthsToShow, 0);

      const result = await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          vehicle_id,
          customer_id,
          pickup_location_id,
          dropoff_location_id,
          pickup_date,
          pickup_time,
          dropoff_date,
          dropoff_time,
          status,
          payment_status,
          total_price,
          deposit_amount,
          amount_paid,
          notes
        `)
        .gte('dropoff_date', firstDay.toISOString().split('T')[0])
        .lte('pickup_date', lastDay.toISOString().split('T')[0])
        .neq('status', 'cancelled')
        .order('pickup_date');

      return {
        data: result.data || [],
        error: result.error
      };
    },
    dependencies: [startDate, monthsToShow],
    retryCount: 3,
    retryDelay: 1000,
    initialDelay: 200,
  });

  // Estado local para bookings enriquecidos
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);

  // Enriquecer bookings cuando cambien los datos raw
  useEffect(() => {
    const enrichBookings = async () => {
      if (!bookingsRaw || bookingsRaw.length === 0) {
        setBookings([]);
        return;
      }

      try {
        setEnrichmentLoading(true);

        const customerIds = [...new Set(bookingsRaw.map(b => b.customer_id).filter((id): id is string => Boolean(id)))];
        const vehicleIds = [...new Set(bookingsRaw.map(b => b.vehicle_id).filter((id): id is string => Boolean(id)))];
        const locationIds = [...new Set([
          ...bookingsRaw.map(b => b.pickup_location_id),
          ...bookingsRaw.map(b => b.dropoff_location_id)
        ].filter((id): id is string => Boolean(id)))];

        // Cargar customers
        const { data: customersData } = await supabase
          .from('customers')
          .select('id, name, email, phone')
          .in('id', customerIds);

        // Cargar vehicles
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('id, name, brand, model, internal_code, plate_number, year')
          .in('id', vehicleIds);

        // Cargar locations
        const { data: locationsData } = await supabase
          .from('locations')
          .select('id, name, address, city')
          .in('id', locationIds);

        // Cargar booking extras
        const { data: bookingExtrasData } = await supabase
          .from('booking_extras')
          .select(`
            id,
            booking_id,
            extra_id,
            quantity,
            price_per_unit,
            subtotal,
            extras (
              id,
              name,
              description
            )
          `)
          .in('booking_id', bookingsRaw.map(b => b.id));

        // Mapear relaciones
        const customersMap = new Map(customersData?.map(c => [c.id, c]) || []);
        const vehiclesMap = new Map(vehiclesData?.map(v => [v.id, v]) || []);
        const locationsMap = new Map(locationsData?.map(l => [l.id, l]) || []);
        const extrasMap = new Map<string, any[]>();
        
        bookingExtrasData?.forEach(be => {
          if (!extrasMap.has(be.booking_id)) {
            extrasMap.set(be.booking_id, []);
          }
          extrasMap.get(be.booking_id)?.push({
            id: be.id,
            quantity: be.quantity,
            price_per_unit: be.price_per_unit,
            subtotal: be.subtotal,
            extra: be.extras
          });
        });

        const enriched = bookingsRaw.map(booking => ({
          ...booking,
          customer: customersMap.get(booking.customer_id) || null,
          vehicle: vehiclesMap.get(booking.vehicle_id) || null,
          pickup_location: locationsMap.get(booking.pickup_location_id) || null,
          dropoff_location: locationsMap.get(booking.dropoff_location_id) || null,
          extras: extrasMap.get(booking.id) || []
        } as unknown as Booking));

        setBookings(enriched);
      } catch (err) {
        console.error('[Calendario] Error enriching bookings:', err);
      } finally {
        setEnrichmentLoading(false);
      }
    };

    enrichBookings();
  }, [bookingsRaw]);

  const loading = vehiclesLoading || bookingsLoading || enrichmentLoading;

  // Detectar si es móvil o tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // tablets y móviles
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Pequeño delay para asegurar que el cliente esté inicializado
    const timer = setTimeout(() => {
      loadData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [startDate, monthsToShow]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar vehículos ordenados por código interno por defecto
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, name, brand, slug, internal_code')
        .eq('is_for_rent', true)
        .order('internal_code', { ascending: true, nullsFirst: false });

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);

      // Calcular rango de fechas para los meses a mostrar
      const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const lastDay = new Date(startDate.getFullYear(), startDate.getMonth() + monthsToShow, 0);

      // Cargar bookings con relaciones
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          vehicle_id,
          customer_id,
          pickup_location_id,
          dropoff_location_id,
          pickup_date,
          pickup_time,
          dropoff_date,
          dropoff_time,
          status,
          payment_status,
          total_price,
          deposit_amount,
          amount_paid,
          notes
        `)
        .gte('dropoff_date', firstDay.toISOString().split('T')[0])
        .lte('pickup_date', lastDay.toISOString().split('T')[0])
        .neq('status', 'cancelled')
        .order('pickup_date');

      if (bookingsError) {
        console.error('Bookings error details:', bookingsError);
        throw bookingsError;
      }

      // Cargar datos relacionados manualmente si es necesario
      let enrichedBookings: Booking[] = [];
      
      // Si hay bookings, cargar las relaciones
      if (bookingsData && bookingsData.length > 0) {
        const customerIds = [...new Set(bookingsData.map(b => b.customer_id).filter((id): id is string => Boolean(id)))];
        const vehicleIds = [...new Set(bookingsData.map(b => b.vehicle_id).filter((id): id is string => Boolean(id)))];
        const locationIds = [...new Set([
          ...bookingsData.map(b => b.pickup_location_id),
          ...bookingsData.map(b => b.dropoff_location_id)
        ].filter((id): id is string => Boolean(id)))];

        // Cargar customers
        const { data: customersData } = await supabase
          .from('customers')
          .select('id, name, email, phone')
          .in('id', customerIds);

        // Cargar vehicles
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('id, name, brand, model, internal_code, plate_number, year')
          .in('id', vehicleIds);

        // Cargar locations
        const { data: locationsData } = await supabase
          .from('locations')
          .select('id, name, address, city')
          .in('id', locationIds);

        // Cargar booking extras
        const { data: bookingExtrasData } = await supabase
          .from('booking_extras')
          .select(`
            id,
            booking_id,
            extra_id,
            quantity,
            unit_price,
            total_price
          `)
          .in('booking_id', bookingsData.map(b => b.id));

        // Si hay extras, cargar sus detalles
        const extraIds = [...new Set((bookingExtrasData || []).map(be => be.extra_id).filter((id): id is string => Boolean(id)))];
        let extrasData: { id: string; name: string; description: string | null }[] = [];
        if (extraIds.length > 0) {
          const { data } = await supabase
            .from('extras')
            .select('id, name, description')
            .in('id', extraIds);
          extrasData = data || [];
        }

        // Crear mapas para búsqueda rápida
        const customersMap = new Map((customersData || []).map(c => [c.id, c]));
        const vehiclesMap = new Map((vehiclesData || []).map(v => [v.id, v]));
        const locationsMap = new Map((locationsData || []).map(l => [l.id, l]));
        const extrasMap = new Map(extrasData.map(e => [e.id, e]));

        // Enriquecer los bookings con las relaciones
        enrichedBookings = bookingsData.map(booking => ({
          ...booking,
          customer: customersMap.get(booking.customer_id ?? '') || null,
          vehicle: vehiclesMap.get(booking.vehicle_id ?? '') || undefined,
          pickup_location: locationsMap.get(booking.pickup_location_id ?? '') || undefined,
          dropoff_location: locationsMap.get(booking.dropoff_location_id ?? '') || undefined,
          booking_extras: (bookingExtrasData || [])
            .filter(be => be.booking_id === booking.id)
            .map(be => ({
              id: be.id,
              quantity: be.quantity || 0,
              price_per_unit: be.unit_price,
              subtotal: be.total_price,
              extra: {
                id: be.extra_id,
                name: extrasMap.get(be.extra_id)?.name || '',
                description: extrasMap.get(be.extra_id)?.description || undefined
              }
            }))
        } as unknown as Booking));
      }

      setBookings(enrichedBookings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el ordenamiento
  const handleSort = (field: 'internal_code' | 'name') => {
    if (sortField === field) {
      // Si ya está ordenado por este campo, cambiar dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un campo nuevo, ordenar ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para renderizar icono de ordenamiento
  const renderSortIcon = (field: 'internal_code' | 'name') => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  // Ordenar vehículos
  const sortedVehicles = (vehicles || []).sort((a, b) => {
    let aValue: string;
    let bValue: string;

    if (sortField === 'internal_code') {
      aValue = a.internal_code || '';
      bValue = b.internal_code || '';
    } else {
      aValue = a.name;
      bValue = b.name;
    }

    aValue = aValue.toLowerCase();
    bValue = bValue.toLowerCase();

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const previousPeriod = () => {
    setStartDate(new Date(startDate.getFullYear(), startDate.getMonth() - monthsToShow));
  };

  const nextPeriod = () => {
    setStartDate(new Date(startDate.getFullYear(), startDate.getMonth() + monthsToShow));
  };

  const goToToday = () => {
    setStartDate(new Date());
  };

  // Generar array de meses a mostrar
  const getMonthsArray = () => {
    const months = [];
    for (let i = 0; i < monthsToShow; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      months.push(date);
    }
    return months;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const getDayName = (day: number, monthDate: Date) => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    return date.toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 3);
  };

  const isDateInRange = (day: number, monthDate: Date, pickup: string, dropoff: string) => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return dateStr >= pickup && dateStr <= dropoff;
  };

  const isPickupDate = (day: number, monthDate: Date, pickup: string) => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === pickup;
  };

  const isDropoffDate = (day: number, monthDate: Date, dropoff: string) => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return dateStr === dropoff;
  };

  const getBookingsForVehicle = (vehicleId: string) => {
    return (bookings || []).filter(b => b.vehicle_id === vehicleId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-red-400';
      case 'in_progress':
        return 'bg-blue-400';
      case 'completed':
        return 'bg-gray-400';
      case 'pending':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-300';
    }
  };

  const isToday = (day: number, monthDate: Date) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === monthDate.getMonth() &&
      today.getFullYear() === monthDate.getFullYear()
    );
  };

  const months = getMonthsArray();
  const periodLabel = monthsToShow === 1 ? 'mes' : 'meses';

  // Vista móvil: Organizar eventos por día
  const getMobileCalendarEvents = () => {
    const events: Record<string, Array<{
      type: 'pickup' | 'dropoff';
      booking: Booking & { vehicle?: Vehicle };
    }>> = {};

    bookings.forEach(booking => {
      const vehicle = vehicles.find(v => v.id === booking.vehicle_id);
      const bookingWithVehicle = { ...booking, vehicle };
      
      // Agregar evento de recogida
      const pickupKey = new Date(booking.pickup_date).toISOString().split('T')[0];
      if (!events[pickupKey]) events[pickupKey] = [];
      events[pickupKey].push({ type: 'pickup', booking: bookingWithVehicle });
      
      // Agregar evento de devolución
      const dropoffKey = new Date(booking.dropoff_date).toISOString().split('T')[0];
      if (!events[dropoffKey]) events[dropoffKey] = [];
      events[dropoffKey].push({ type: 'dropoff', booking: bookingWithVehicle });
    });

    // Ordenar eventos de cada día por hora
    Object.keys(events).forEach(date => {
      events[date].sort((a, b) => {
        const timeA = a.type === 'pickup' ? a.booking.pickup_time : a.booking.dropoff_time;
        const timeB = b.type === 'pickup' ? b.booking.pickup_time : b.booking.dropoff_time;
        return (timeA || '10:00').localeCompare(timeB || '10:00');
      });
    });

    return events;
  };

  const mobileEvents = isMobile ? getMobileCalendarEvents() : {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Disponibilidad</h1>
          <p className="text-gray-600 mt-1">Vista cronológica de reservas por vehículo</p>
        </div>
      </div>

      {/* Navigation and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Period Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="period" className="text-sm font-medium text-gray-700">
              Mostrar:
            </label>
            <select
              id="period"
              value={monthsToShow}
              onChange={(e) => setMonthsToShow(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 mes</option>
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={previousPeriod}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={`${monthsToShow} ${periodLabel} anterior${monthsToShow > 1 ? 'es' : ''}`}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Hoy
            </button>

            <div className="text-center min-w-[200px]">
              <div className="flex items-center justify-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <span className="text-lg font-bold text-gray-900 capitalize">
                  {months[0].toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  {monthsToShow > 1 && (
                    <> - {months[months.length - 1].toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</>
                  )}
                </span>
              </div>
            </div>

            <button
              onClick={nextPeriod}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={`${monthsToShow} ${periodLabel} siguiente${monthsToShow > 1 ? 's' : ''}`}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Desktop vs Mobile */}
      {!isMobile ? (
        /* VISTA ESCRITORIO - Gantt Style */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-visible">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Cargando calendario...</div>
          ) : (vehicles || []).length === 0 ? (
            <div className="p-12 text-center">
              <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay vehículos disponibles para alquiler</p>
            </div>
          ) : (
            // Cada mes con su propio scroll horizontal independiente
            <>
              {months.map((monthDate, monthIndex) => {
                const days = getDaysInMonth(monthDate);
                const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

                return (
                  <div key={monthIndex} className="mb-8 last:mb-0 border-b border-gray-300 last:border-b-0 pb-8 last:pb-0">
                    {/* Month Title */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 font-bold text-lg capitalize">
                      {monthName}
                    </div>

                    {/* Contenedor con scroll horizontal independiente por mes */}
                    <div className="overflow-x-auto overflow-y-visible">
                      <div className="inline-block min-w-full">
                        {/* Header con días */}
                        <div className="flex border-b border-gray-200 bg-gray-50">
                          {/* Columna de código interno */}
                          <div 
                            className="w-24 flex-shrink-0 p-3 font-semibold text-gray-700 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('internal_code')}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-sm">Código</span>
                              {renderSortIcon('internal_code')}
                            </div>
                          </div>
                          {/* Columna de vehículos */}
                          <div 
                            className="w-48 flex-shrink-0 p-3 font-semibold text-gray-700 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span>Vehículos</span>
                              {renderSortIcon('name')}
                            </div>
                          </div>
                          {/* Columnas de días */}
                          {days.map((day) => {
                            const isTodayFlag = isToday(day, monthDate);
                            return (
                              <div
                                key={day}
                                className={`w-12 flex-shrink-0 text-center border-r border-gray-200 ${
                                  isTodayFlag ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div className={`text-xs font-semibold pt-2 ${
                                  isTodayFlag ? 'text-blue-600' : 'text-gray-700'
                                }`}>
                                  {day}
                                </div>
                                <div className={`text-[10px] pb-2 ${
                                  isTodayFlag ? 'text-blue-500' : 'text-gray-500'
                                }`}>
                                  {getDayName(day, monthDate)}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Filas de vehículos */}
                        {sortedVehicles.map((vehicle) => {
                          const vehicleBookings = getBookingsForVehicle(vehicle.id);

                          return (
                            <div
                              key={vehicle.id}
                              className="flex border-b border-gray-200 hover:bg-gray-50"
                            >
                              {/* Código interno del vehículo */}
                              <div className="w-24 flex-shrink-0 p-3 border-r border-gray-200">
                                {vehicle.internal_code ? (
                                  <span className="inline-block px-2 py-1 text-xs font-mono font-bold bg-blue-100 text-blue-800 rounded">
                                    {vehicle.internal_code}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 text-xs">—</span>
                                )}
                              </div>
                              
                              {/* Nombre del vehículo */}
                              <div className="w-48 flex-shrink-0 p-3 border-r border-gray-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 text-sm truncate">
                                      {vehicle.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {vehicle.brand}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Días del mes */}
                              {days.map((day) => {
                                const isTodayFlag = isToday(day, monthDate);
                                
                                // Buscar si hay una reserva que incluya este día
                                const dayBooking = vehicleBookings.find(booking =>
                                  isDateInRange(day, monthDate, booking.pickup_date, booking.dropoff_date)
                                );

                                const isPickup = dayBooking && isPickupDate(day, monthDate, dayBooking.pickup_date);
                                const isDropoff = dayBooking && isDropoffDate(day, monthDate, dayBooking.dropoff_date);

                                return (
                                  <div
                                    key={day}
                                    className={`w-12 flex-shrink-0 border-r border-gray-200 relative ${
                                      isTodayFlag ? 'bg-blue-50' : ''
                                    }`}
                                  >
                                    {dayBooking ? (
                                      <div
                                        className={`h-12 flex items-center justify-center relative group/booking ${
                                          getStatusColor(dayBooking.status)
                                        } cursor-pointer hover:opacity-80 transition-opacity`}
                                        onClick={(e) => {
                                          // Si es el marcador verde o rojo, no hacer nada (para que se vea el tooltip)
                                          if ((e.target as HTMLElement).closest('.smart-tooltip-trigger')) {
                                            e.stopPropagation();
                                            return;
                                          }
                                          // En PC y móvil, abrir modal
                                          setSelectedBooking(dayBooking);
                                        }}
                                        title={`${dayBooking.customer?.name || 'Sin cliente'}\n${dayBooking.booking_number}\nEstado: ${dayBooking.status}\nClick para ver detalles`}
                                      >
                                        {/* Indicador de inicio (verde) con tooltip */}
                                        {isPickup && (
                                          <SmartTooltip
                                            className="absolute top-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-500 rounded-sm border border-white shadow-sm z-[100] smart-tooltip-trigger"
                                            content={
                                              <>
                                                <div className="font-semibold text-green-400 mb-1">🟢 RECOGIDA</div>
                                                <div className="font-bold text-base">{dayBooking.pickup_time || '10:00'}</div>
                                                <div className="text-gray-300 text-xs mt-1">
                                                  📍 {dayBooking.pickup_location?.name || 'Sin ubicación'}
                                                </div>
                                              </>
                                            }
                                          >
                                            <div className="w-full h-full"></div>
                                          </SmartTooltip>
                                        )}
                                        
                                        {/* Número de reserva */}
                                        <span className="text-[10px] font-bold text-white">
                                          1
                                        </span>

                                        {/* Indicador de fin (rojo) con tooltip */}
                                        {isDropoff && (
                                          <SmartTooltip
                                            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-sm border border-white shadow-sm z-[100] smart-tooltip-trigger"
                                            content={
                                              <>
                                                <div className="font-semibold text-red-400 mb-1">🔴 DEVOLUCIÓN</div>
                                                <div className="font-bold text-base">{dayBooking.dropoff_time || '10:00'}</div>
                                                <div className="text-gray-300 text-xs mt-1">
                                                  📍 {dayBooking.dropoff_location?.name || 'Sin ubicación'}
                                                </div>
                                              </>
                                            }
                                          >
                                            <div className="w-full h-full"></div>
                                          </SmartTooltip>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="h-12 bg-white"></div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
      </div>
      ) : (
        /* VISTA MÓVIL - Notion Calendar Style */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Cargando calendario...</div>
          ) : (
            <div className="space-y-4">
              {months.map((monthDate, monthIndex) => {
                const daysInMonth = getDaysInMonth(monthDate);
                const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
                const startingDayOfWeek = firstDayOfMonth.getDay();
                
                const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
                
                return (
                  <div key={monthIndex} className="space-y-3">
                    {/* Header del mes */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-bold text-center capitalize">
                      {monthName}
                    </div>
                    
                    {/* Grid del calendario */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Días de la semana */}
                      {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs font-semibold text-gray-500 py-2">
                          {day}
                        </div>
                      ))}
                      
                      {/* Espacios vacíos antes del primer día */}
                      {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}
                      
                      {/* Días del mes */}
                      {daysInMonth.map((day) => {
                        const dateKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const dayEvents = mobileEvents[dateKey] || [];
                        const isTodayFlag = isToday(day, monthDate);
                        
                        return (
                          <div 
                            key={day}
                            className={`aspect-square border rounded-lg p-1 ${
                              isTodayFlag ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                            }`}
                          >
                            {/* Número del día */}
                            <div className={`text-xs font-semibold text-center mb-1 ${
                              isTodayFlag ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              {day}
                            </div>
                            
                            {/* Eventos del día */}
                            <div className="space-y-0.5">
                              {dayEvents.slice(0, 3).map((event, idx) => {
                                const vehicle = event.booking.vehicle;
                                const isPickup = event.type === 'pickup';
                                
                                return (
                                  <div
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBooking({ ...event.booking, vehicle });
                                    }}
                                    className="cursor-pointer hover:opacity-75 transition-opacity"
                                  >
                                    <div className={`flex items-center gap-0.5 text-[9px] leading-tight p-0.5 rounded ${
                                      isPickup ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        isPickup ? 'bg-green-500' : 'bg-red-500'
                                      }`} />
                                      <span className="font-bold truncate">
                                        {vehicle?.internal_code || 'N/A'}
                                      </span>
                                      <span className="text-[8px] opacity-75">
                                        {isPickup ? event.booking.pickup_time : event.booking.dropoff_time}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {/* Indicador de más eventos */}
                              {dayEvents.length > 3 && (
                                <div className="text-[8px] text-gray-500 text-center font-semibold">
                                  +{dayEvents.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Leyenda:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center text-white text-xs font-bold">1</div>
            <span className="text-gray-600">Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-400 rounded flex items-center justify-center text-white text-xs font-bold">1</div>
            <span className="text-gray-600">Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">1</div>
            <span className="text-gray-600">En curso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-bold">1</div>
            <span className="text-gray-600">Completada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm border border-white shadow-sm"></div>
              <div className="w-3 h-3 bg-red-500 rounded-sm border border-white shadow-sm"></div>
            </div>
            <span className="text-gray-600">Inicio / Fin</span>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">Total vehículos</p>
          <p className="text-2xl font-bold text-gray-900">{(vehicles || []).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">Reservas en el período</p>
          <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">Vehículos disponibles</p>
          <p className="text-2xl font-bold text-green-600">
            {(vehicles || []).length - new Set((bookings || []).map(b => b.vehicle_id)).size}
          </p>
        </div>
      </div>

      {/* Modal de información de reserva (todas las resoluciones) */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`${getStatusColor(selectedBooking.status)} text-white px-6 py-4 rounded-t-3xl sm:rounded-t-2xl`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold">{selectedBooking.booking_number}</h3>
                  <p className="text-sm opacity-90 capitalize">{selectedBooking.status}</p>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Vehículo */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">🚐 Vehículo</div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-bold text-gray-900">{selectedBooking.vehicle?.name || 'Sin nombre'}</div>
                  <div className="text-sm text-gray-600">{selectedBooking.vehicle?.brand || ''}</div>
                  {selectedBooking.vehicle?.internal_code && (
                    <div className="text-xs text-gray-500 mt-1">Código: {selectedBooking.vehicle.internal_code}</div>
                  )}
                </div>
              </div>

              {/* Cliente */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">👤 Cliente</div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-semibold text-gray-900">{selectedBooking.customer?.name || 'Sin cliente'}</div>
                  {selectedBooking.customer?.phone && (
                    <a href={`tel:${selectedBooking.customer.phone}`} className="text-sm text-furgocasa-orange hover:underline">
                      {selectedBooking.customer.phone}
                    </a>
                  )}
                  {selectedBooking.customer?.email && (
                    <a href={`mailto:${selectedBooking.customer.email}`} className="text-xs text-gray-500 hover:underline block">
                      {selectedBooking.customer.email}
                    </a>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">📅 Fechas</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-xs font-semibold text-green-700 mb-1">🟢 Recogida</div>
                    <div className="font-bold text-gray-900">
                      {new Date(selectedBooking.pickup_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-600">{selectedBooking.pickup_time || '10:00'}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="text-xs font-semibold text-red-700 mb-1">🔴 Devolución</div>
                    <div className="font-bold text-gray-900">
                      {new Date(selectedBooking.dropoff_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-600">{selectedBooking.dropoff_time || '10:00'}</div>
                  </div>
                </div>
              </div>

              {/* Ubicaciones */}
              {(selectedBooking.pickup_location || selectedBooking.dropoff_location || 
                selectedBooking.pickup_location_name || selectedBooking.dropoff_location_name) && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">📍 Ubicaciones</div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {(selectedBooking.pickup_location || selectedBooking.pickup_location_name) && (
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">↗</span>
                        <div>
                          <div className="text-xs text-gray-500">Origen</div>
                          <div className="font-medium text-gray-900">
                            {selectedBooking.pickup_location?.name || selectedBooking.pickup_location_name}
                          </div>
                          {selectedBooking.pickup_location?.address && (
                            <div className="text-xs text-gray-500 mt-0.5">{selectedBooking.pickup_location.address}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {(selectedBooking.dropoff_location || selectedBooking.dropoff_location_name) && (
                      <div className="flex items-start gap-2">
                        <span className="text-red-600 mt-0.5">↘</span>
                        <div>
                          <div className="text-xs text-gray-500">Destino</div>
                          <div className="font-medium text-gray-900">
                            {selectedBooking.dropoff_location?.name || selectedBooking.dropoff_location_name}
                          </div>
                          {selectedBooking.dropoff_location?.address && (
                            <div className="text-xs text-gray-500 mt-0.5">{selectedBooking.dropoff_location.address}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Extras */}
              {selectedBooking.booking_extras && selectedBooking.booking_extras.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">🎁 Extras</div>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {selectedBooking.booking_extras.map((bookingExtra) => (
                      <div key={bookingExtra.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{bookingExtra.extra.name}</div>
                          {bookingExtra.quantity > 1 && (
                            <div className="text-xs text-gray-500">
                              {bookingExtra.quantity} × {bookingExtra.price_per_unit}€
                            </div>
                          )}
                        </div>
                        <div className="font-semibold text-gray-900">{bookingExtra.subtotal}€</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Precio */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">💰 Precio</div>
                <div className="bg-furgocasa-orange/10 rounded-lg p-4 border border-furgocasa-orange/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-furgocasa-orange">{selectedBooking.total_price}€</span>
                  </div>
                  {selectedBooking.payment_status && (
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-furgocasa-orange/20">
                      <span className="text-gray-600">Estado de pago:</span>
                      <span className={`font-semibold capitalize ${
                        selectedBooking.payment_status === 'paid' ? 'text-green-600' :
                        selectedBooking.payment_status === 'partial' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {selectedBooking.payment_status === 'paid' ? 'Pagado' :
                         selectedBooking.payment_status === 'partial' ? 'Pago parcial' :
                         'Pendiente'}
                      </span>
                    </div>
                  )}
                  {selectedBooking.amount_paid !== undefined && selectedBooking.amount_paid > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Pagado:</span>
                      <span className="font-semibold text-green-600">{selectedBooking.amount_paid}€</span>
                    </div>
                  )}
                  {selectedBooking.amount_paid !== undefined && 
                   selectedBooking.total_price > selectedBooking.amount_paid && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Pendiente:</span>
                      <span className="font-semibold text-red-600">
                        {selectedBooking.total_price - selectedBooking.amount_paid}€
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas */}
              {selectedBooking.notes && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">📝 Notas</div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => router.push(`/administrator/reservas/${selectedBooking.id}`)}
                className="flex-1 px-4 py-3 bg-furgocasa-orange text-white font-semibold rounded-lg hover:bg-furgocasa-orange-dark transition-colors"
              >
                Ver detalles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
