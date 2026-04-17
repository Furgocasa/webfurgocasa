"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Car, ArrowUpDown, ArrowUp, ArrowDown, Link, Copy, Check } from "lucide-react";
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
  amount_paid?: number;
  payment_status?: string;
  status: string;
  notes?: string;
  vehicle_id: string | null;
  customer_id: string;
  customer: Customer | null;
  vehicle?: Vehicle;
  pickup_location?: RentalLocation;
  dropoff_location?: RentalLocation;
  booking_extras?: BookingExtra[];
}

interface BlockedDate {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

/** Hora HH:MM para tooltips (time Postgres, ISO o cadena vacía). */
function formatBookingClockTime(raw: string | null | undefined, fallback = '10:00'): string {
  if (raw == null) return fallback;
  const s = String(raw).trim();
  if (!s) return fallback;
  if (/^\d{4}-\d{2}-\d{2}/.test(s) || s.includes('T')) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Madrid',
      });
    }
  }
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (m) {
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
      return `${String(hh).padStart(2, '0')}:${m[2]}`;
    }
  }
  return fallback;
}

export default function CalendarioPage() {
  // Establecer título de la página
  useEffect(() => {
    document.title = "Admin - Calendario | Furgocasa";
  }, []);

  const router = useRouter();
  const [startDate, setStartDate] = useState(new Date());
  const [monthsToShow, setMonthsToShow] = useState(3); // Por defecto 3 meses
  const [isMobile, setIsMobile] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<(Booking & { vehicle?: Vehicle }) | null>(null);
  
  // Estado para ordenamiento
  const [sortField, setSortField] = useState<'internal_code' | 'name'>('internal_code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estado para filtro de búsqueda por código
  const [searchCode, setSearchCode] = useState('');

  // Estado para modal de suscripción al calendario
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [calendarSubscriptionUrl, setCalendarSubscriptionUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/calendar/subscription-url")
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        if (!cancelled && data?.url) setCalendarSubscriptionUrl(data.url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar vehículos con el hook
  const { 
    data: vehicles, 
    loading: vehiclesLoading, 
    error: vehiclesError 
  } = useAdminData<Vehicle[]>({
    queryKey: ['vehicles-calendar'], // QueryKey único para caché
    queryFn: async () => {
      const supabase = createClient();
      const result = await supabase
        .from('vehicles')
        .select('id, name, brand, slug, internal_code')
        .eq('is_for_rent', true)
        .or('sale_status.neq.sold,sale_status.is.null')
        .order('internal_code', { ascending: true, nullsFirst: false });
      
      return {
        data: (result.data || []) as Vehicle[],
        error: result.error
      };
    },
    retryCount: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 30, // 30 minutos - lista de vehículos cambia poco
  });

  // Cargar bookings con el hook (depende de startDate y monthsToShow)
  const { 
    data: bookingsRaw, 
    loading: bookingsLoading, 
    error: bookingsError 
  } = useAdminData<any[]>({
    queryKey: ['bookings-calendar'], // QueryKey único para caché del calendario
    dependencies: [startDate, monthsToShow], // Recargar cuando cambien estas dependencias
    queryFn: async () => {
      const supabase = createClient();
      // Calcular rango de fechas para los meses a mostrar
      // Construir fechas en formato ISO sin conversión UTC
      const firstYear = startDate.getFullYear();
      const firstMonth = startDate.getMonth();
      const firstDayStr = `${firstYear}-${String(firstMonth + 1).padStart(2, '0')}-01`;
      
      const lastDayDate = new Date(firstYear, firstMonth + monthsToShow, 0);
      const lastDayStr = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;

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
          amount_paid,
          notes
        `)
        .gte('dropoff_date', firstDayStr)
        .lte('pickup_date', lastDayStr)
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
    staleTime: 1000 * 60 * 10, // 10 minutos - las reservas del calendario se actualizan con frecuencia moderada
  });

  // Cargar bloqueos con el hook
  const { 
    data: blockedDatesRaw, 
    loading: blockedDatesLoading, 
    error: blockedDatesError 
  } = useAdminData<BlockedDate[]>({
    queryKey: ['blocked-dates-calendar'],
    dependencies: [startDate, monthsToShow],
    queryFn: async () => {
      const supabase = createClient();
      const firstYear = startDate.getFullYear();
      const firstMonth = startDate.getMonth();
      const firstDayStr = `${firstYear}-${String(firstMonth + 1).padStart(2, '0')}-01`;
      
      const lastDayDate = new Date(firstYear, firstMonth + monthsToShow, 0);
      const lastDayStr = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;

      const result = await supabase
        .from('blocked_dates')
        .select('*')
        .gte('end_date', firstDayStr)
        .lte('start_date', lastDayStr)
        .order('start_date');

      return {
        data: (result.data || []) as BlockedDate[],
        error: result.error
      };
    },
    dependencies: [startDate, monthsToShow],
    retryCount: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 10,
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
        const supabase = createClient();

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

        // Cargar booking extras - Solo si hay bookings
        let bookingExtrasData: any[] = [];
        if (bookingsRaw.length > 0) {
          const bookingIds = bookingsRaw.map(b => b.id);
          // Dividir en lotes más pequeños para evitar URLs demasiado largas
          const batchSize = 50;
          const batches = [];
          for (let i = 0; i < bookingIds.length; i += batchSize) {
            batches.push(bookingIds.slice(i, i + batchSize));
          }
          
          for (const batch of batches) {
            const { data } = await supabase
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
              .in('booking_id', batch);
            
            if (data) {
              bookingExtrasData.push(...data);
            }
          }
        }

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

  const loading = vehiclesLoading || bookingsLoading || blockedDatesLoading || enrichmentLoading;

  // Detectar si es móvil o tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // tablets y móviles
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Código duplicado eliminado - los datos se cargan con useAdminData hooks arriba

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

  // Filtrar y ordenar vehículos
  const filteredAndSortedVehicles = (vehicles || [])
    // Primero filtrar por código de búsqueda
    .filter(vehicle => {
      if (!searchCode.trim()) return true; // Si no hay búsqueda, mostrar todos
      
      const search = searchCode.toLowerCase().trim();
      const code = (vehicle.internal_code || '').toLowerCase();
      const name = vehicle.name.toLowerCase();
      const brand = (vehicle.brand || '').toLowerCase();
      
      // Buscar en código, nombre o marca
      return code.includes(search) || name.includes(search) || brand.includes(search);
    })
    // Después ordenar
    .sort((a, b) => {
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
    return date.toLocaleDateString('es-ES', { weekday: 'short', timeZone: 'Europe/Madrid' }).substring(0, 3);
  };

  const isDateInRange = (day: number, monthDate: Date, pickup: string, dropoff: string) => {
    // Crear fecha en formato ISO sin conversión de zona horaria
    const year = monthDate.getFullYear();
    const month = String(monthDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return dateStr >= pickup && dateStr <= dropoff;
  };

  const isPickupDate = (day: number, monthDate: Date, pickup: string) => {
    // Crear fecha en formato ISO sin conversión de zona horaria
    const year = monthDate.getFullYear();
    const month = String(monthDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return dateStr === pickup;
  };

  const isDropoffDate = (day: number, monthDate: Date, dropoff: string) => {
    // Crear fecha en formato ISO sin conversión de zona horaria
    const year = monthDate.getFullYear();
    const month = String(monthDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    return dateStr === dropoff;
  };

  const getBookingsForVehicle = (vehicleId: string) => {
    return (bookings || []).filter(b => b.vehicle_id === vehicleId);
  };

  // Reservas pendientes de asignar (sin vehículo). Se muestran en una fila
  // especial del calendario para facilitar la reasignación de flota.
  const unassignedBookings = (bookings || []).filter(b => !b.vehicle_id);

  const getBlockedDatesForVehicle = (vehicleId: string) => {
    return (blockedDatesRaw || []).filter(b => b.vehicle_id === vehicleId);
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

    // Verificar que vehicles no sea null antes de procesar
    if (!vehicles || vehicles.length === 0) {
      return events;
    }

    bookings.forEach(booking => {
      const vehicle = vehicles.find(v => v.id === booking.vehicle_id);
      const bookingWithVehicle = { ...booking, vehicle };
      
      // Agregar evento de recogida (formato ISO sin conversión UTC)
      const pickupKey = booking.pickup_date; // Ya está en formato YYYY-MM-DD
      if (!events[pickupKey]) events[pickupKey] = [];
      events[pickupKey].push({ type: 'pickup', booking: bookingWithVehicle });
      
      // Agregar evento de devolución (formato ISO sin conversión UTC)
      const dropoffKey = booking.dropoff_date; // Ya está en formato YYYY-MM-DD
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

  // Función para copiar URL de suscripción al calendario
  // ✅ SEGURIDAD: La URL se obtiene desde /api/admin/calendar/subscription-url
  // (solo accesible para admins). El token NUNCA se expone al cliente.
  const copyCalendarUrl = () => {
    if (!calendarSubscriptionUrl) {
      alert('Token de calendario no disponible. Contacta al administrador.');
      return;
    }

    navigator.clipboard.writeText(calendarSubscriptionUrl).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 3000);
    }).catch(err => {
      console.error('Error al copiar:', err);
      alert('No se pudo copiar la URL. Por favor, cópiala manualmente.');
    });
  };

  // Mostrar estado de carga
  if (vehiclesLoading && !vehicles) {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cargando calendario...</p>
          </div>
        </div>
      </div>
    );
  }

  if (vehiclesError || bookingsError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 sm:p-6">
          <h2 className="text-red-800 dark:text-red-300 font-semibold text-sm sm:text-base">Error al cargar el calendario</h2>
          <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-2">
            {vehiclesError || bookingsError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.97] transition-all text-sm"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Calendario</h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">Reservas por vehículo</p>
        </div>
        
        <button
          onClick={() => setShowCalendarModal(true)}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.97] transition-all shadow-sm text-sm"
        >
          <Link className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Sincronizar con mi Calendario</span>
          <span className="sm:hidden">Sincronizar</span>
        </button>
      </div>

      {/* Navigation and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Fila 1: Navegación + Selector período - compacto en móvil */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                onClick={previousPeriod}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
              >
                Hoy
              </button>
              <button
                onClick={nextPeriod}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <CalendarIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 dark:text-gray-100 capitalize truncate">
                {months[0].toLocaleDateString('es-ES', { month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' })}
                {monthsToShow > 1 && (
                  <span className="hidden sm:inline"> — {months[months.length - 1].toLocaleDateString('es-ES', { month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' })}</span>
                )}
              </span>
            </div>

            <select
              id="period"
              value={monthsToShow}
              onChange={(e) => setMonthsToShow(Number(e.target.value))}
              className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1m</option>
              <option value={3}>3m</option>
              <option value={6}>6m</option>
              <option value={12}>12m</option>
            </select>
          </div>

          {/* Fila 2: Filtro vehículo - solo si no es móvil muy pequeño o siempre visible */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="search-code"
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Filtrar vehículos..."
                className="w-full px-3 py-2 pl-9 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              {searchCode && (
                <button
                  onClick={() => setSearchCode('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchCode && (
              <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">
                {filteredAndSortedVehicles.length}/{(vehicles || []).length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Aviso de reservas sin vehículo asignado */}
      {unassignedBookings.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-sm sm:text-base">
                {unassignedBookings.length} reserva{unassignedBookings.length !== 1 ? 's' : ''} pendiente{unassignedBookings.length !== 1 ? 's' : ''} de asignar vehículo
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 mt-1">
                Hay alquileres en este periodo sin vehículo asignado. Asígnales uno antes de la fecha de recogida.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {unassignedBookings.slice(0, 6).map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBooking(b as any)}
                    className="text-xs px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-mono font-semibold transition-colors"
                    title={`${b.booking_number} · ${b.customer?.name || 'Sin cliente'} · ${b.pickup_date} → ${b.dropoff_date}`}
                  >
                    {b.booking_number}
                  </button>
                ))}
                {unassignedBookings.length > 6 && (
                  <span className="text-xs px-2 py-1 text-amber-800">
                    +{unassignedBookings.length - 6} más
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
          ) : filteredAndSortedVehicles.length === 0 ? (
            <div className="p-12 text-center">
              <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron vehículos con el filtro "{searchCode}"</p>
              <button
                onClick={() => setSearchCode('')}
                className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpiar filtro
              </button>
            </div>
          ) : (
            // Cada mes con su propio scroll horizontal independiente
            <>
              {months.map((monthDate, monthIndex) => {
                const days = getDaysInMonth(monthDate);
                const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' });

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
                                  isTodayFlag ? 'bg-yellow-300 border-l-2 border-r-2 border-yellow-400' : ''
                                }`}
                              >
                                <div className={`text-xs font-semibold pt-2 ${
                                  isTodayFlag ? 'text-yellow-900' : 'text-gray-700'
                                }`}>
                                  {day}
                                </div>
                                <div className={`text-[10px] pb-2 ${
                                  isTodayFlag ? 'text-yellow-800' : 'text-gray-500'
                                }`}>
                                  {getDayName(day, monthDate)}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Fila especial: reservas sin vehículo asignado */}
                        {unassignedBookings.length > 0 && !searchCode.trim() && (
                          <div className="flex border-b-2 border-amber-400 bg-amber-50/40 hover:bg-amber-50">
                            {/* Columna código */}
                            <div className="w-24 flex-shrink-0 p-3 border-r border-gray-200">
                              <span className="inline-block px-2 py-1 text-xs font-mono font-bold bg-amber-200 text-amber-900 rounded">
                                ⚠️ S/A
                              </span>
                            </div>
                            {/* Columna nombre */}
                            <div className="w-48 flex-shrink-0 p-3 border-r border-gray-200">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-amber-900 text-sm truncate">
                                    Sin vehículo
                                  </p>
                                  <p className="text-xs text-amber-700 truncate">
                                    Pendiente asignar ({unassignedBookings.length})
                                  </p>
                                </div>
                              </div>
                            </div>
                            {/* Días del mes */}
                            {days.map((day) => {
                              const isTodayFlag = isToday(day, monthDate);
                              const year = monthDate.getFullYear();
                              const month = String(monthDate.getMonth() + 1).padStart(2, '0');
                              const dayStr = String(day).padStart(2, '0');
                              const currentDateStr = `${year}-${month}-${dayStr}`;

                              const dayUnassigned = unassignedBookings.filter(b =>
                                currentDateStr >= b.pickup_date && currentDateStr <= b.dropoff_date
                              );
                              const pickupHere = unassignedBookings.filter(b => b.pickup_date === currentDateStr);
                              const dropoffHere = unassignedBookings.filter(b => b.dropoff_date === currentDateStr);
                              const firstOfDay = dayUnassigned[0];

                              return (
                                <div
                                  key={day}
                                  className={`w-12 flex-shrink-0 border-r border-gray-200 relative ${
                                    isTodayFlag ? 'bg-yellow-300 border-l-2 border-r-2 border-yellow-400' : ''
                                  }`}
                                >
                                  {firstOfDay ? (
                                    <div
                                      className="h-12 flex items-center justify-center relative bg-amber-400 cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-amber-600 ring-inset"
                                      onClick={() => setSelectedBooking(firstOfDay as any)}
                                      title={`⚠️ SIN VEHÍCULO\n${dayUnassigned.map(b => `· ${b.booking_number} (${b.customer?.name || 'Sin cliente'})`).join('\n')}\n\nClick para abrir`}
                                    >
                                      {pickupHere.length > 0 && (
                                        <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-green-600 rounded px-1 border border-white leading-none py-0.5">
                                          {pickupHere.length > 1 ? `${pickupHere.length}REC` : 'REC'}
                                        </span>
                                      )}
                                      <span className="text-[11px] font-bold text-amber-900">
                                        ⚠️{dayUnassigned.length}
                                      </span>
                                      {dropoffHere.length > 0 && (
                                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-red-600 rounded px-1 border border-white leading-none py-0.5">
                                          {dropoffHere.length > 1 ? `${dropoffHere.length}DEV` : 'DEV'}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="h-12 bg-amber-50/30"></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Filas de vehículos */}
                        {filteredAndSortedVehicles.map((vehicle) => {
                          const vehicleBookings = getBookingsForVehicle(vehicle.id);
                          const vehicleBlocks = getBlockedDatesForVehicle(vehicle.id);

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
                                
                                // Crear fecha ISO del día actual sin conversión UTC
                                const year = monthDate.getFullYear();
                                const month = String(monthDate.getMonth() + 1).padStart(2, '0');
                                const dayStr = String(day).padStart(2, '0');
                                const currentDateStr = `${year}-${month}-${dayStr}`;
                                
                                // Buscar TODAS las reservas que incluyan este día
                                const dayBookings = vehicleBookings.filter(booking =>
                                  currentDateStr >= booking.pickup_date && currentDateStr <= booking.dropoff_date
                                );

                                // Buscar reservas que empiezan EXACTAMENTE en este día
                                const pickupBookings = vehicleBookings.filter(booking =>
                                  booking.pickup_date === currentDateStr
                                );

                                // Buscar reservas que terminan EXACTAMENTE en este día
                                const dropoffBookings = vehicleBookings.filter(booking =>
                                  booking.dropoff_date === currentDateStr
                                );

                                // Verificar si este día está bloqueado
                                const isBlocked = vehicleBlocks.some(block =>
                                  currentDateStr >= block.start_date && currentDateStr <= block.end_date
                                );

                                const blockInfo = isBlocked ? vehicleBlocks.find(block =>
                                  currentDateStr >= block.start_date && currentDateStr <= block.end_date
                                ) : null;

                                // Reserva principal para mostrar (la primera activa en el día)
                                const dayBooking = dayBookings.length > 0 ? dayBookings[0] : null;

                                // VALIDACIÓN CRÍTICA: Detectar conflictos de reservas REALES
                                // Verificar si hay solapamiento considerando las horas
                                let realConflicts = 0;
                                if (dayBookings.length > 1) {
                                  // Comprobar cada par de reservas para ver si se solapan en horas
                                  for (let i = 0; i < dayBookings.length; i++) {
                                    for (let j = i + 1; j < dayBookings.length; j++) {
                                      const booking1 = dayBookings[i];
                                      const booking2 = dayBookings[j];
                                      
                                      const booking1Pickup = new Date(`${booking1.pickup_date}T${booking1.pickup_time || '10:00'}`);
                                      const booking1Dropoff = new Date(`${booking1.dropoff_date}T${booking1.dropoff_time || '10:00'}`);
                                      const booking2Pickup = new Date(`${booking2.pickup_date}T${booking2.pickup_time || '10:00'}`);
                                      const booking2Dropoff = new Date(`${booking2.dropoff_date}T${booking2.dropoff_time || '10:00'}`);
                                      
                                      // Hay conflicto real si los periodos se solapan
                                      if (booking1Pickup < booking2Dropoff && booking1Dropoff > booking2Pickup) {
                                        realConflicts++;
                                        console.error(
                                          `[CALENDARIO ERROR] Conflicto detectado para vehículo ${vehicle.internal_code || vehicle.name}`,
                                          `en fecha ${currentDateStr}:`,
                                          `Reserva 1: ${booking1.booking_number} (${booking1.pickup_date} ${booking1.pickup_time} - ${booking1.dropoff_date} ${booking1.dropoff_time})`,
                                          `Reserva 2: ${booking2.booking_number} (${booking2.pickup_date} ${booking2.pickup_time} - ${booking2.dropoff_date} ${booking2.dropoff_time})`
                                        );
                                      }
                                    }
                                  }
                                }

                                return (
                                  <div
                                    key={day}
                                    className={`w-12 flex-shrink-0 border-r border-gray-200 relative ${
                                      isTodayFlag ? 'bg-yellow-300 border-l-2 border-r-2 border-yellow-400' : ''
                                    }`}
                                  >
                                    {isBlocked ? (
                                      /* Mostrar bloqueo */
                                      <div
                                        className="h-12 flex items-center justify-center relative bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                                        title={`🚫 BLOQUEADO\n${blockInfo?.reason || 'Sin razón especificada'}\nClick para editar`}
                                        onClick={() => {
                                          if (blockInfo) {
                                            router.push(`/administrator/bloqueos/${blockInfo.id}/editar`);
                                          }
                                        }}
                                      >
                                        <span className="text-white text-xs font-bold">🚫</span>
                                      </div>
                                    ) : dayBooking ? (
                                      <div
                                        className={`h-12 flex items-center justify-center relative group/booking ${
                                          getStatusColor(dayBooking.status)
                                        } ${realConflicts > 0 ? 'ring-2 ring-yellow-500 ring-inset' : ''} cursor-pointer hover:opacity-80 transition-opacity`}
                                        onClick={(e) => {
                                          // Si es el marcador verde o rojo, no hacer nada (para que se vea el tooltip)
                                          if ((e.target as HTMLElement).closest('.smart-tooltip-trigger')) {
                                            e.stopPropagation();
                                            return;
                                          }
                                          // En PC y móvil, abrir modal
                                          setSelectedBooking(dayBooking);
                                        }}
                                        title={realConflicts > 0
                                          ? `⚠️ CONFLICTO: ${dayBookings.length} reservas con solapamiento horario\n${dayBookings.map(b => `- ${b.booking_number} (${b.customer?.name})`).join('\n')}\n\nClick para ver detalles`
                                          : `${dayBooking.customer?.name || 'Sin cliente'}\n${dayBooking.booking_number}\nEstado: ${dayBooking.status}\n${pickupBookings.length > 0 ? `🟢 Recogida:\n${pickupBookings.map(b => `  · ${formatBookingClockTime(b.pickup_time)} — ${b.pickup_location?.name || b.pickup_location_name || 'Sin ubicación'}`).join('\n')}\n` : ''}${dropoffBookings.length > 0 ? `🔴 Devolución:\n${dropoffBookings.map(b => `  · ${formatBookingClockTime(b.dropoff_time)} — ${b.dropoff_location?.name || b.dropoff_location_name || 'Sin ubicación'}`).join('\n')}\n` : ''}Click para ver detalles`
                                        }
                                      >
                                        {/* Indicadores de inicio (verde) - puede haber múltiples */}
                                        {pickupBookings.length > 0 && (
                                          <SmartTooltip
                                            className="absolute top-0.5 left-1/2 -translate-x-1/2 h-3.5 bg-green-500 rounded border border-white shadow-sm z-[100] smart-tooltip-trigger flex items-center justify-center px-1 min-w-[12px] max-w-[44px] overflow-hidden"
                                            content={
                                              <>
                                                {pickupBookings.map((booking, idx) => (
                                                  <div key={booking.id} className={idx > 0 ? 'mt-2 pt-2 border-t border-gray-600' : ''}>
                                                    <div className="font-semibold text-green-400 mb-1">🟢 RECOGIDA {pickupBookings.length > 1 ? `#${idx + 1}` : ''}</div>
                                                    <div className="text-gray-200 text-[11px] font-medium">Hora de recogida</div>
                                                    <div className="font-bold text-base tabular-nums tracking-tight">{formatBookingClockTime(booking.pickup_time)}</div>
                                                    <div className="text-gray-300 text-xs mt-1">
                                                      📍 {booking.pickup_location?.name || booking.pickup_location_name || 'Sin ubicación'}
                                                    </div>
                                                    <div className="text-gray-400 text-xs mt-1">
                                                      {booking.booking_number}
                                                    </div>
                                                  </div>
                                                ))}
                                              </>
                                            }
                                          >
                                            <span className="text-[8px] font-bold text-white whitespace-nowrap leading-none tracking-tighter">
                                              {pickupBookings.length > 1 
                                                ? `${pickupBookings.length} REC` 
                                                : ((pickupBookings[0].pickup_location?.name || pickupBookings[0].pickup_location_name || '').substring(0, 6).toUpperCase())
                                              }
                                            </span>
                                          </SmartTooltip>
                                        )}
                                        
                                        {/* Número de reservas activas - mostrar WARNING si hay más de 1 */}
                                        <span className={`text-[10px] font-bold ${
                                          realConflicts > 0 ? 'text-yellow-900 bg-yellow-300 px-1 rounded animate-pulse' : 'text-white'
                                        }`}>
                                          {realConflicts > 0 && '⚠️ '}
                                          {dayBookings.length}
                                        </span>

                                        {/* Indicadores de fin (rojo) - puede haber múltiples */}
                                        {dropoffBookings.length > 0 && (
                                          <SmartTooltip
                                            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-3.5 bg-red-500 rounded border border-white shadow-sm z-[100] smart-tooltip-trigger flex items-center justify-center px-1 min-w-[12px] max-w-[44px] overflow-hidden"
                                            content={
                                              <>
                                                {dropoffBookings.map((booking, idx) => (
                                                  <div key={booking.id} className={idx > 0 ? 'mt-2 pt-2 border-t border-gray-600' : ''}>
                                                    <div className="font-semibold text-red-400 mb-1">🔴 DEVOLUCIÓN {dropoffBookings.length > 1 ? `#${idx + 1}` : ''}</div>
                                                    <div className="text-gray-200 text-[11px] font-medium">Hora de devolución</div>
                                                    <div className="font-bold text-base tabular-nums tracking-tight">{formatBookingClockTime(booking.dropoff_time)}</div>
                                                    <div className="text-gray-300 text-xs mt-1">
                                                      📍 {booking.dropoff_location?.name || booking.dropoff_location_name || 'Sin ubicación'}
                                                    </div>
                                                    <div className="text-gray-400 text-xs mt-1">
                                                      {booking.booking_number}
                                                    </div>
                                                  </div>
                                                ))}
                                              </>
                                            }
                                          >
                                            <span className="text-[8px] font-bold text-white whitespace-nowrap leading-none tracking-tighter">
                                              {dropoffBookings.length > 1 
                                                ? `${dropoffBookings.length} DEV` 
                                                : ((dropoffBookings[0].dropoff_location?.name || dropoffBookings[0].dropoff_location_name || '').substring(0, 6).toUpperCase())
                                              }
                                            </span>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2 sm:p-4">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Cargando calendario...</div>
          ) : (
            <div className="space-y-4">
              {months.map((monthDate, monthIndex) => {
                const daysInMonth = getDaysInMonth(monthDate);
                const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
                const startingDayOfWeek = firstDayOfMonth.getDay();
                
                const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' });
                
                return (
                  <div key={monthIndex} className="space-y-2">
                    {/* Header del mes */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-xl font-bold text-center capitalize text-sm sm:text-base">
                      {monthName}
                    </div>
                    
                    {/* Grid del calendario - gap más pequeño en móvil */}
                    <div className="grid grid-cols-7 gap-[2px] sm:gap-1">
                      {/* Días de la semana */}
                      {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 py-1 sm:py-2">
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
                        const hasEvents = dayEvents.length > 0;
                        
                        return (
                          <div 
                            key={day}
                            onClick={() => {
                              if (dayEvents.length === 1) {
                                const ev = dayEvents[0];
                                setSelectedBooking({ ...ev.booking, vehicle: ev.booking.vehicle });
                              }
                            }}
                            className={`aspect-square border rounded-lg p-0.5 sm:p-1 flex flex-col transition-colors ${
                              isTodayFlag
                                ? 'bg-yellow-200 dark:bg-yellow-900/40 border-yellow-400 dark:border-yellow-600 border-2 shadow-sm'
                                : hasEvents
                                  ? 'border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/30'
                                  : 'border-gray-100 dark:border-gray-700'
                            } ${dayEvents.length === 1 ? 'cursor-pointer active:scale-95' : ''}`}
                          >
                            {/* Número del día */}
                            <div className={`text-[10px] sm:text-xs font-semibold text-center leading-none ${
                              isTodayFlag ? 'text-yellow-900 dark:text-yellow-300 font-extrabold' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {day}
                            </div>
                            
                            {/* Eventos - solo dots en pantalla muy pequeña, badges en sm+ */}
                            <div className="flex-1 flex flex-col justify-center gap-[1px] mt-0.5 overflow-hidden">
                              {/* Vista compacta en <sm: solo puntos de color */}
                              <div className="flex sm:hidden flex-wrap justify-center gap-[2px]">
                                {dayEvents.slice(0, 4).map((event, idx) => (
                                  <span
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      event.type === 'pickup' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                  />
                                ))}
                                {dayEvents.length > 4 && (
                                  <span className="text-[7px] text-gray-400 font-bold leading-none">+{dayEvents.length - 4}</span>
                                )}
                              </div>
                              
                              {/* Vista expandida en sm+: badges con código */}
                              <div className="hidden sm:flex sm:flex-col gap-[1px]">
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
                                      className="cursor-pointer hover:opacity-75 active:scale-95 transition-all"
                                    >
                                      <div className={`flex items-center gap-0.5 text-[8px] sm:text-[9px] leading-tight px-0.5 py-[1px] rounded ${
                                        !event.booking.vehicle_id
                                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 ring-1 ring-amber-400'
                                          : isPickup
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                      }`}>
                                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0 ${
                                          !event.booking.vehicle_id ? 'bg-amber-500' : isPickup ? 'bg-green-500' : 'bg-red-500'
                                        }`} />
                                        <span className="font-bold truncate">
                                          {!event.booking.vehicle_id ? '⚠️S/A' : (vehicle?.internal_code || '?')}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                                {dayEvents.length > 3 && (
                                  <div className="text-[7px] text-gray-500 text-center font-bold">
                                    +{dayEvents.length - 3}
                                  </div>
                                )}
                              </div>
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

      {/* Legend - compacta en móvil */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
        <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">Leyenda:</p>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">1</div>
            <span className="text-gray-600 dark:text-gray-400">Pend.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-400 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">1</div>
            <span className="text-gray-600 dark:text-gray-400">Conf.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-400 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">1</div>
            <span className="text-gray-600 dark:text-gray-400">En curso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-400 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">1</div>
            <span className="text-gray-600 dark:text-gray-400">Compl.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col gap-0.5">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            </div>
            <span className="text-gray-600 dark:text-gray-400">Ini/Fin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 rounded flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">🚫</div>
            <span className="text-gray-600 dark:text-gray-400">Bloq.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-400 ring-2 ring-amber-600 ring-inset rounded flex items-center justify-center text-amber-900 text-[10px] sm:text-xs font-bold flex-shrink-0">⚠️</div>
            <span className="text-gray-600 dark:text-gray-400">Sin veh.</span>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Vehículos</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{(vehicles || []).length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Reservas</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{bookings.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
          <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">
            Disponibles{unassignedBookings.length > 0 ? ' / Sin asignar' : ''}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
            {(vehicles || []).length - new Set((bookings || []).filter(b => b.vehicle_id).map(b => b.vehicle_id)).size}
            {unassignedBookings.length > 0 && (
              <span className="text-amber-600 dark:text-amber-400"> / {unassignedBookings.length}</span>
            )}
          </p>
        </div>
      </div>

      {/* Modal de información de reserva (todas las resoluciones) */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[100] flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle para drag en móvil */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-1 sm:hidden" />
            {/* Header */}
            <div className={`${getStatusColor(selectedBooking.status)} text-white px-4 sm:px-6 py-3 sm:py-4 sm:rounded-t-2xl`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold">{selectedBooking.booking_number}</h3>
                  <p className="text-xs sm:text-sm opacity-90 capitalize">{selectedBooking.status}</p>
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
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Vehículo */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">🚐 Vehículo</div>
                {selectedBooking.vehicle_id && selectedBooking.vehicle ? (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-bold text-gray-900">{selectedBooking.vehicle?.name || 'Sin nombre'}</div>
                    <div className="text-sm text-gray-600">{selectedBooking.vehicle?.brand || ''}</div>
                    {selectedBooking.vehicle?.internal_code && (
                      <div className="text-xs text-gray-500 mt-1">Código: {selectedBooking.vehicle.internal_code}</div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3">
                    <div className="font-bold text-amber-900">⚠️ Sin vehículo asignado</div>
                    <div className="text-xs text-amber-700 mt-1">
                      Esta reserva está pendiente de asignación. Edítala para asignar un vehículo.
                    </div>
                  </div>
                )}
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
                      {new Date(selectedBooking.pickup_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' })}
                    </div>
                    <div className="text-sm text-gray-600">{formatBookingClockTime(selectedBooking.pickup_time)}</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <div className="text-xs font-semibold text-red-700 mb-1">🔴 Devolución</div>
                    <div className="font-bold text-gray-900">
                      {new Date(selectedBooking.dropoff_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' })}
                    </div>
                    <div className="text-sm text-gray-600">{formatBookingClockTime(selectedBooking.dropoff_time)}</div>
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
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex gap-2 sm:gap-3" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.97] transition-all text-sm"
              >
                Cerrar
              </button>
              <button
                onClick={() => router.push(`/administrator/reservas/${selectedBooking.id}`)}
                className="flex-1 px-3 py-2.5 sm:py-3 bg-furgocasa-orange text-white font-semibold rounded-xl hover:bg-furgocasa-orange-dark active:scale-[0.97] transition-all text-sm"
              >
                Ver detalles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Suscripción al Calendario */}
      {showCalendarModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[100] flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setShowCalendarModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">📅 Sincronizar con tu Calendario</h3>
                  <p className="text-sm opacity-90 mt-1">Recibe entregas y recogidas automáticamente en tu móvil</p>
                </div>
                <button 
                  onClick={() => setShowCalendarModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Instrucciones */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">✨ ¿Qué es esto?</h4>
                <p className="text-sm text-blue-800">
                  Conecta esta URL a tu calendario nativo (iPhone, Android, Outlook, etc.) y todas las entregas y recogidas 
                  aparecerán automáticamente en tu móvil. Se actualizan solas cada pocas horas, como Notion Calendar.
                </p>
              </div>

              {/* URL de suscripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL de Suscripción:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={calendarSubscriptionUrl || '[Cargando URL…]'}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700"
                  />
                  <button
                    onClick={copyCalendarUrl}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      urlCopied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {urlCopied ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {urlCopied && (
                  <p className="text-sm text-green-600 mt-2 font-semibold">
                    ✅ URL copiada al portapapeles
                  </p>
                )}
              </div>

              {/* Instrucciones paso a paso */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">📱 Cómo añadirla a tu calendario:</h4>
                
                {/* iPhone / iPad */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">🍎</span> iPhone / iPad
                  </h5>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Abre la app <strong>Calendario</strong> (la nativa de iOS)</li>
                    <li>Toca <strong>Calendarios</strong> (abajo en el centro)</li>
                    <li>Toca <strong>Añadir calendario</strong> → <strong>Añadir suscripción</strong></li>
                    <li>Pega la URL que copiaste arriba</li>
                    <li>Dale un nombre: <strong>"Furgocasa - Entregas"</strong></li>
                    <li>¡Listo! Los eventos aparecerán automáticamente</li>
                  </ol>
                </div>

                {/* Android / Google Calendar */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">📱</span> Android / Google Calendar
                  </h5>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Abre <strong>Google Calendar</strong> en el navegador (no en la app)</li>
                    <li>En el menú lateral, busca <strong>Otros calendarios</strong> y haz click en <strong>+</strong></li>
                    <li>Selecciona <strong>Desde URL</strong></li>
                    <li>Pega la URL que copiaste arriba</li>
                    <li>Haz click en <strong>Añadir calendario</strong></li>
                    <li>¡Listo! Sincronizará automáticamente con tu móvil</li>
                  </ol>
                </div>

                {/* Outlook */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <span className="text-xl">📧</span> Outlook / Microsoft
                  </h5>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Abre <strong>Outlook.com</strong> en el navegador</li>
                    <li>Haz click en <strong>Agregar calendario</strong></li>
                    <li>Selecciona <strong>Suscribirse desde la web</strong></li>
                    <li>Pega la URL que copiaste arriba</li>
                    <li>Dale un nombre y elige el color</li>
                    <li>¡Listo! Se sincronizará automáticamente</li>
                  </ol>
                </div>
              </div>

              {/* Características */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✅ Lo que verás:</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>🟢 <strong>Entregas</strong> con hora, cliente y vehículo</li>
                  <li>🔴 <strong>Recogidas</strong> con hora, cliente y vehículo</li>
                  <li>📍 <strong>Ubicación</strong> de cada evento (Murcia/Madrid)</li>
                  <li>🔔 <strong>Notificaciones</strong> 30 minutos antes (según tu config)</li>
                  <li>🔄 <strong>Actualización automática</strong> cada pocas horas</li>
                  <li>📅 <strong>Eventos de los próximos 6 meses</strong></li>
                </ul>
              </div>

              {/* Nota importante */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Importante:</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Solo tienes que hacer esto <strong>UNA VEZ</strong></li>
                  <li>• Después se actualiza <strong>SOLO</strong> automáticamente</li>
                  <li>• Esta URL es compartida por todo el equipo</li>
                  <li>• No la compartas fuera de Furgocasa</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
