"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Calendar, Download, Mail, CheckCircle, Clock, XCircle, AlertCircle, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAllDataProgressive } from "@/hooks/use-all-data-progressive";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";

interface Booking {
  id: string;
  booking_number: string;
  pickup_date: string;
  dropoff_date: string;
  status: string | null;
  payment_status: string | null;
  total_price: number;
  amount_paid: number | null;
  created_at: string | null;
  vehicle: {
    id: string;
    name: string;
    slug: string;
    internal_code: string | null;
  } | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  pickup_location: {
    id: string;
    name: string;
  } | null;
  dropoff_location: {
    id: string;
    name: string;
  } | null;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  pending: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" },
  confirmed: { icon: CheckCircle, bg: "bg-green-100", text: "text-green-700", label: "Confirmada" },
  in_progress: { icon: AlertCircle, bg: "bg-blue-100", text: "text-blue-700", label: "En curso" },
  completed: { icon: CheckCircle, bg: "bg-gray-100", text: "text-gray-700", label: "Completada" },
  cancelled: { icon: XCircle, bg: "bg-red-100", text: "text-red-700", label: "Cancelada" },
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", { 
    day: "2-digit", 
    month: "2-digit",
    year: "numeric"
  });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("es-ES", { 
    day: "2-digit", 
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

type SortField = 'booking_number' | 'customer' | 'internal_code' | 'vehicle' | 'pickup_date' | 'dropoff_date' | 'pickup_location' | 'dropoff_location' | 'total_price' | 'amount_paid' | 'status' | 'payment_status' | 'created_at';

// Claves para localStorage
const SORT_FIELD_KEY = 'bookings_sort_field';
const SORT_DIRECTION_KEY = 'bookings_sort_direction';

export default function BookingsPage() {
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Paginación frontend
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para ordenamiento - cargar desde localStorage o usar default
  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SORT_FIELD_KEY);
      return (saved as SortField) || 'created_at';
    }
    return 'created_at';
  });
  
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SORT_DIRECTION_KEY);
      return (saved as 'asc' | 'desc') || 'desc';
    }
    return 'desc';
  });

  const queryClient = useQueryClient();

  // Guardar preferencia de ordenación en localStorage
  useEffect(() => {
    localStorage.setItem(SORT_FIELD_KEY, sortField);
    localStorage.setItem(SORT_DIRECTION_KEY, sortDirection);
  }, [sortField, sortDirection]);

  // Cargar TODAS las reservas progresivamente
  const { 
    data: bookings, 
    loading, 
    loadingMore,
    error,
    totalCount,
    isComplete,
    progress,
    refetch: refetchBookings,
  } = useAllDataProgressive<Booking>({
    queryKey: ['bookings'],
    table: 'bookings',
    select: `
      *,
      vehicle:vehicles(id, name, slug, internal_code),
      customer:customers(id, name, email, phone),
      pickup_location:locations!pickup_location_id(id, name),
      dropoff_location:locations!dropoff_location_id(id, name)
    `,
    orderBy: { column: 'created_at', ascending: false },
    initialBatchSize: 10, // Primeros 10 registros inmediatos
    batchSize: 50,        // Luego cargar de 50 en 50
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Refrescar datos
      refetchBookings();
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado');
    }
  };

  const handleDelete = async (bookingId: string, bookingNumber: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la reserva ${bookingNumber}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Primero eliminar los extras de la reserva
      await supabase.from('booking_extras').delete().eq('booking_id', bookingId);
      
      // Luego eliminar la reserva
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      // Refrescar datos automáticamente
      refetchBookings();
      
      alert('Reserva eliminada correctamente');
    } catch (err: any) {
      console.error('Error deleting booking:', err);
      alert('Error al eliminar la reserva: ' + err.message);
    }
  };

  // Ordenar TODAS las reservas
  const sortedBookings = useMemo(() => {
    if (!bookings) return [];
    return [...bookings].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'booking_number':
          aValue = a.booking_number;
          bValue = b.booking_number;
          break;
        case 'customer':
          aValue = a.customer?.name || '';
          bValue = b.customer?.name || '';
          break;
        case 'internal_code':
          aValue = a.vehicle?.internal_code || '';
          bValue = b.vehicle?.internal_code || '';
          break;
        case 'vehicle':
          aValue = a.vehicle?.name || '';
          bValue = b.vehicle?.name || '';
          break;
        case 'pickup_date':
          aValue = new Date(a.pickup_date).getTime();
          bValue = new Date(b.pickup_date).getTime();
          break;
        case 'dropoff_date':
          aValue = new Date(a.dropoff_date).getTime();
          bValue = new Date(b.dropoff_date).getTime();
          break;
        case 'pickup_location':
          aValue = a.pickup_location?.name || '';
          bValue = b.pickup_location?.name || '';
          break;
        case 'dropoff_location':
          aValue = a.dropoff_location?.name || '';
          bValue = b.dropoff_location?.name || '';
          break;
        case 'total_price':
          aValue = a.total_price || 0;
          bValue = b.total_price || 0;
          break;
        case 'amount_paid':
          aValue = a.amount_paid || 0;
          bValue = b.amount_paid || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'payment_status':
          aValue = a.payment_status;
          bValue = b.payment_status;
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        default:
          aValue = a.created_at || '';
          bValue = b.created_at || '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [bookings, sortField, sortDirection]);

  // Filtrar reservas con búsqueda en tiempo real (sobre TODAS las reservas)
  const filteredBookings = useMemo(() => {
    let filtered = [...sortedBookings];

    // Búsqueda en tiempo real
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.booking_number.toLowerCase().includes(search) ||
        booking.customer?.name?.toLowerCase().includes(search) ||
        booking.customer?.email?.toLowerCase().includes(search) ||
        booking.customer?.phone?.toLowerCase().includes(search) ||
        booking.vehicle?.name?.toLowerCase().includes(search) ||
        booking.vehicle?.internal_code?.toLowerCase().includes(search) ||
        booking.pickup_location?.name?.toLowerCase().includes(search) ||
        booking.dropoff_location?.name?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    return filtered;
  }, [sortedBookings, searchTerm, statusFilter]);

  // Paginación frontend sobre datos filtrados
  const totalItems = filteredBookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredBookings.slice(start, end);
  }, [filteredBookings, currentPage, itemsPerPage]);

  // Resetear página al cambiar filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const allBookings = bookings || [];
  const pendingCount = allBookings.filter(b => b.status === 'pending').length;
  const confirmedCount = allBookings.filter(b => b.status === 'confirmed').length;
  const inProgressCount = allBookings.filter(b => b.status === 'in_progress').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthCount = allBookings.filter(b => {
    const bookingDate = new Date(b.created_at || 0);
    return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
  }).length;

  if (loading && allBookings.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-furgocasa-orange mb-4" />
          <p className="text-gray-500">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-red-800 font-semibold">Error al cargar reservas</h2>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600 mt-1">Gestiona todas las reservas de tu flota</p>
          {/* Indicador de carga progresiva */}
          {loadingMore && (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-blue-600">
                Cargando más reservas... {progress}% ({bookings.length}/{totalCount})
              </span>
            </div>
          )}
          {isComplete && totalCount > 10 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ Todas las reservas cargadas ({totalCount})
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-5 w-5" />Exportar
          </button>
          <Link href="/administrator/reservas/nueva" className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />Nueva reserva
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pendientes", value: pendingCount.toString(), color: "text-yellow-600" }, 
          { label: "Confirmadas", value: confirmedCount.toString(), color: "text-green-600" }, 
          { label: "En curso", value: inProgressCount.toString(), color: "text-blue-600" }, 
          { label: "Este mes", value: monthCount.toString(), color: "text-gray-600" }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, nº reserva, vehículo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="in_progress">En curso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <select 
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
          >
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
            <option value="50">50 por página</option>
            <option value="100">100 por página</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('booking_number')}
                >
                  <div className="flex items-center gap-2">
                    <span>Reserva</span>
                    {renderSortIcon('booking_number')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('customer')}
                >
                  <div className="flex items-center gap-2">
                    <span>Cliente</span>
                    {renderSortIcon('customer')}
                  </div>
                </th>
                <th 
                  className="px-3 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('internal_code')}
                >
                  <div className="flex items-center gap-1">
                    <span>Cód.</span>
                    {renderSortIcon('internal_code')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('vehicle')}
                >
                  <div className="flex items-center gap-2">
                    <span>Vehículo</span>
                    {renderSortIcon('vehicle')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('pickup_date')}
                >
                  <div className="flex items-center gap-2">
                    <span>Inicio</span>
                    {renderSortIcon('pickup_date')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('dropoff_date')}
                >
                  <div className="flex items-center gap-2">
                    <span>Fin</span>
                    {renderSortIcon('dropoff_date')}
                  </div>
                </th>
                <th className="px-3 py-4 text-center text-sm font-semibold text-gray-900">
                  Duración
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('pickup_location')}
                >
                  <div className="flex items-center gap-2">
                    <span>Recogida</span>
                    {renderSortIcon('pickup_location')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('dropoff_location')}
                >
                  <div className="flex items-center gap-2">
                    <span>Devolución</span>
                    {renderSortIcon('dropoff_location')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-right text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('total_price')}
                >
                  <div className="flex items-center justify-end gap-2">
                    <span>Total</span>
                    {renderSortIcon('total_price')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-right text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('amount_paid')}
                >
                  <div className="flex items-center justify-end gap-2">
                    <span>Pagado</span>
                    {renderSortIcon('amount_paid')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Estado</span>
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th className="px-4 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">
                      {searchTerm || statusFilter ? 'No se encontraron reservas' : 'No hay reservas registradas'}
                    </p>
                    <p className="text-sm mt-1">
                      {searchTerm || statusFilter ? 'Intenta ajustar los filtros de búsqueda' : 'Las reservas aparecerán aquí cuando se creen'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => {
                  const bookingStatus = booking.status || 'pending';
                  const StatusIcon = statusConfig[bookingStatus]?.icon || Clock;
                  const statusStyle = statusConfig[bookingStatus] || statusConfig.pending;
                  
                  // Calcular días de diferencia
                  const pickupDate = new Date(booking.pickup_date);
                  const dropoffDate = new Date(booking.dropoff_date);
                  const days = Math.ceil((dropoffDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
                  
                  const totalPrice = booking.total_price || 0;
                  const amountPaid = booking.amount_paid || 0;
                  const pendingAmount = totalPrice - amountPaid;
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      {/* Reserva */}
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 text-sm">{booking.booking_number}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(booking.created_at || '')}</p>
                      </td>
                      
                      {/* Cliente */}
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900 text-sm">{booking.customer?.name || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-500">{booking.customer?.phone || '—'}</p>
                      </td>
                      
                      {/* Código interno */}
                      <td className="px-3 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-mono font-semibold">
                          {booking.vehicle?.internal_code || '—'}
                        </span>
                      </td>
                      
                      {/* Vehículo */}
                      <td className="px-4 py-4">
                        <p className="text-gray-900 text-sm">{booking.vehicle?.name || 'Sin vehículo'}</p>
                      </td>
                      
                      {/* Fecha inicio */}
                      <td className="px-4 py-4">
                        <p className="text-gray-900 text-sm font-medium">{formatDate(booking.pickup_date)}</p>
                      </td>
                      
                      {/* Fecha fin */}
                      <td className="px-4 py-4">
                        <p className="text-gray-900 text-sm font-medium">{formatDate(booking.dropoff_date)}</p>
                      </td>
                      
                      {/* Duración */}
                      <td className="px-3 py-4 text-center">
                        <p className="text-gray-900 text-sm font-semibold">{days}</p>
                        <p className="text-xs text-gray-500">{days === 1 ? 'día' : 'días'}</p>
                      </td>
                      
                      {/* Ubicación recogida */}
                      <td className="px-4 py-4">
                        <p className="text-gray-900 text-sm">{booking.pickup_location?.name || '—'}</p>
                      </td>
                      
                      {/* Ubicación devolución */}
                      <td className="px-4 py-4">
                        <p className="text-gray-900 text-sm">{booking.dropoff_location?.name || '—'}</p>
                      </td>
                      
                      {/* Total */}
                      <td className="px-4 py-4 text-right">
                        <p className="font-bold text-gray-900 text-sm">{formatPrice(totalPrice)}</p>
                        {pendingAmount > 0 && (
                          <p className="text-xs text-red-600 mt-1">Pdte: {formatPrice(pendingAmount)}</p>
                        )}
                      </td>
                      
                      {/* Pagado */}
                      <td className="px-4 py-4 text-right">
                        <p className={`font-semibold text-sm ${
                          amountPaid === 0 ? 'text-gray-400' : 
                          amountPaid >= totalPrice ? 'text-green-600' : 
                          'text-orange-600'
                        }`}>
                          {formatPrice(amountPaid)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {amountPaid === 0 ? 'Sin pagos' : 
                           amountPaid >= totalPrice ? 'Completado' : 
                           `${((amountPaid / totalPrice) * 100).toFixed(0)}%`}
                        </p>
                      </td>
                      
                      {/* Estado (desplegable) */}
                      <td className="px-4 py-4 text-center">
                        <select
                          value={booking.status || 'pending'}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <option value="pending">⏱ Pendiente</option>
                          <option value="confirmed">✓ Confirmada</option>
                          <option value="in_progress">▶ En curso</option>
                          <option value="completed">✓ Completada</option>
                          <option value="cancelled">✗ Cancelada</option>
                        </select>
                      </td>
                      
                      {/* Acciones */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link 
                            href={`/administrator/reservas/${booking.id}`} 
                            className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" 
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button 
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Enviar email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <Link 
                            href={`/administrator/reservas/${booking.id}/editar`} 
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(booking.id, booking.booking_number)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación Frontend */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {paginatedBookings.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} reservas
            {searchTerm || statusFilter ? ' (filtradas)' : ''}
            {loadingMore && ` • Cargando todas... ${progress}%`}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
