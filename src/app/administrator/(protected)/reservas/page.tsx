"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Calendar, Download, Mail, CheckCircle, Clock, XCircle, AlertCircle, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

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

const paymentStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" },
  partial: { bg: "bg-orange-100", text: "text-orange-700", label: "Parcial" },
  paid: { bg: "bg-green-100", text: "text-green-700", label: "Pagado" },
  refunded: { bg: "bg-gray-100", text: "text-gray-700", label: "Reembolsado" },
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para ordenamiento - por defecto por fecha de creación descendente
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading bookings...');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(id, name, slug, internal_code),
          customer:customers(id, name, email, phone),
          pickup_location:locations!pickup_location_id(id, name),
          dropoff_location:locations!dropoff_location_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Bookings loaded:', data?.length || 0);
      setBookings((data || []) as Booking[]);
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      setError(err.message);
      
      // Retry automático después de 1 segundo si falla la primera vez
      if (bookings.length === 0) {
        console.log('Retrying in 1 second...');
        setTimeout(() => {
          loadBookings();
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

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
      
      // Actualizar estado local
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
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

      // Actualizar lista local
      setBookings(bookings.filter(b => b.id !== bookingId));
      alert('Reserva eliminada correctamente');
    } catch (err: any) {
      console.error('Error deleting booking:', err);
      alert('Error al eliminar la reserva: ' + err.message);
    }
  };

  // Ordenar reservas
  const sortedBookings = useMemo(() => {
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

  const bookingsList = sortedBookings;
  const pendingCount = bookingsList.filter(b => b.status === 'pending').length;
  const confirmedCount = bookingsList.filter(b => b.status === 'confirmed').length;
  const inProgressCount = bookingsList.filter(b => b.status === 'in_progress').length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthCount = bookingsList.filter(b => {
    const bookingDate = new Date(b.created_at || 0);
    return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
  }).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
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
            <input type="text" placeholder="Buscar por cliente, nº reserva, vehículo..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="in_progress">En curso</option>
            <option value="completed">Completada</option>
          </select>
          <input type="date" className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange" />
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
              {bookingsList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No hay reservas registradas</p>
                    <p className="text-sm mt-1">Las reservas aparecerán aquí cuando se creen</p>
                  </td>
                </tr>
              ) : (
                bookingsList.map((booking) => {
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
                        <p className="text-xs text-gray-500">{days} {days === 1 ? 'día' : 'días'}</p>
                      </td>
                      
                      {/* Fecha fin */}
                      <td className="px-4 py-4">
                        <p className="text-gray-900 text-sm font-medium">{formatDate(booking.dropoff_date)}</p>
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
                        <p className="font-bold text-gray-900 text-sm">{totalPrice.toFixed(2)}€</p>
                        {pendingAmount > 0 && (
                          <p className="text-xs text-red-600 mt-1">Pdte: {pendingAmount.toFixed(2)}€</p>
                        )}
                      </td>
                      
                      {/* Pagado */}
                      <td className="px-4 py-4 text-right">
                        <p className={`font-semibold text-sm ${
                          amountPaid === 0 ? 'text-gray-400' : 
                          amountPaid >= totalPrice ? 'text-green-600' : 
                          'text-orange-600'
                        }`}>
                          {amountPaid.toFixed(2)}€
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
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">Mostrando 1-{bookingsList.length} de {bookingsList.length} reservas</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
