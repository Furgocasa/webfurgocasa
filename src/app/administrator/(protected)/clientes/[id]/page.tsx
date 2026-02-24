"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, 
  FileText, DollarSign, Edit, Trash2, AlertCircle,
  CheckCircle, Clock, Car, CreditCard, Package
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  dni: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  date_of_birth: string | null;
  driver_license: string | null;
  driver_license_expiry: string | null;
  notes: string | null;
  total_bookings: number;
  total_spent: number;
  created_at: string;
  updated_at: string | null;
}

interface Booking {
  id: string;
  booking_number: string;
  pickup_date: string;
  dropoff_date: string;
  days: number;
  total_price: number;
  status: string;
  payment_status: string;
  vehicle: {
    name: string;
    internal_code: string | null;
  };
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendiente" },
  confirmed: { bg: "bg-green-100", text: "text-green-800", label: "Confirmada" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800", label: "En curso" },
  completed: { bg: "bg-gray-100", text: "text-gray-800", label: "Completada" },
  cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelada" },
};

const paymentStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendiente" },
  partial: { bg: "bg-orange-100", text: "text-orange-800", label: "Parcial" },
  paid: { bg: "bg-green-100", text: "text-green-800", label: "Pagado" },
  refunded: { bg: "bg-gray-100", text: "text-gray-800", label: "Reembolsado" },
};

export default function ClienteDetallePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Cargar datos del cliente
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (customerError) throw customerError;
      setCustomer(customerData);

      // Cargar reservas del cliente
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          pickup_date,
          dropoff_date,
          days,
          total_price,
          status,
          payment_status,
          vehicle:vehicles(name, internal_code)
        `)
        .eq('customer_id', customerId)
        .order('pickup_date', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

    } catch (error: any) {
      console.error('Error loading customer:', error);
      setMessage({ type: 'error', text: error.message || 'Error al cargar el cliente' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al cliente "${customer?.name}"?\n\nEsta acción NO eliminará sus reservas (quedarán con snapshot del cliente por motivos de auditoría).`)) {
      return;
    }

    if (!confirm(`¿REALMENTE SEGURO? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeleting(true);
      const supabase = createClient();
      
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Cliente eliminado correctamente' });
      setTimeout(() => {
        router.push('/administrator/clientes');
      }, 1500);
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      setMessage({ type: 'error', text: error.message || 'Error al eliminar el cliente' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente no encontrado</h2>
        <Link href="/administrator/clientes" className="text-furgocasa-orange hover:underline">
          Volver a clientes
        </Link>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link 
            href="/administrator/clientes"
            className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a clientes
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-furgocasa-blue to-blue-600 flex items-center justify-center text-white font-bold text-xl">
              {customer.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-gray-600 mt-1">
                Cliente desde {new Date(customer.created_at).toLocaleDateString('es-ES', { 
                  month: 'long', 
                  year: 'numeric',
                  timeZone: 'Europe/Madrid'
                })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex gap-3">
          <Link
            href={`/administrator/clientes/${customerId}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-furgocasa-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm"
          >
            <Edit className="h-4 w-4" />
            Editar cliente
          </Link>
          
          <button
            onClick={handleDelete}
            disabled={deleting || activeBookings.length > 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={activeBookings.length > 0 ? 'No se puede eliminar un cliente con reservas activas' : ''}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 uppercase font-medium">Total Reservas</p>
            <Car className="h-5 w-5 text-furgocasa-blue" />
          </div>
          <p className="text-3xl font-bold text-furgocasa-blue">{customer.total_bookings || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 uppercase font-medium">Total Gastado</p>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{formatPrice(customer.total_spent || 0)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 uppercase font-medium">Activas</p>
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{activeBookings.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 uppercase font-medium">Completadas</p>
            <CheckCircle className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-600">{completedBookings.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del cliente */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-6 w-6 text-furgocasa-blue" />
              Información Personal
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 uppercase font-medium mb-1">Email</p>
                <a href={`mailto:${customer.email}`} className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {customer.email}
                </a>
              </div>

              {customer.phone && (
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium mb-1">Teléfono</p>
                  <a href={`tel:${customer.phone}`} className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </a>
                </div>
              )}

              {customer.dni && (
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium mb-1">DNI/NIE</p>
                  <p className="text-gray-900">{customer.dni}</p>
                </div>
              )}

              {customer.date_of_birth && (
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium mb-1">Fecha de Nacimiento</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(customer.date_of_birth).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'Europe/Madrid'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dirección */}
          {(customer.address || customer.city) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-furgocasa-blue" />
                Dirección
              </h3>
              <div className="space-y-2">
                {customer.address && <p className="text-gray-900">{customer.address}</p>}
                {(customer.postal_code || customer.city) && (
                  <p className="text-gray-700">
                    {customer.postal_code && `${customer.postal_code} `}
                    {customer.city}
                  </p>
                )}
                {customer.country && (
                  <p className="text-sm text-gray-500">{customer.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Permiso de conducir */}
          {(customer.driver_license || customer.driver_license_expiry) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-furgocasa-blue" />
                Permiso de Conducir
              </h3>
              <div className="space-y-2">
                {customer.driver_license && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Número</p>
                    <p className="text-gray-900 font-mono">{customer.driver_license}</p>
                  </div>
                )}
                {customer.driver_license_expiry && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Fecha de vencimiento</p>
                    <p className="text-gray-900">
                      {new Date(customer.driver_license_expiry).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notas */}
          {customer.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-furgocasa-blue" />
                Notas Internas
              </h3>
              <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200 whitespace-pre-wrap">
                {customer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Historial de reservas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-furgocasa-blue" />
              Historial de Reservas ({bookings.length})
            </h3>

            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Este cliente aún no tiene reservas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/administrator/reservas/${booking.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-furgocasa-orange hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-mono font-bold bg-blue-100 text-blue-800 rounded">
                            {booking.booking_number}
                          </span>
                          {booking.vehicle.internal_code && (
                            <span className="inline-block px-2 py-1 text-xs font-mono font-bold bg-gray-100 text-gray-700 rounded">
                              {booking.vehicle.internal_code}
                            </span>
                          )}
                        </div>
                        
                        <p className="font-semibold text-gray-900 mb-1">{booking.vehicle.name}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.pickup_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              timeZone: 'Europe/Madrid'
                            })}
                          </span>
                          <span>→</span>
                          <span>
                            {new Date(booking.dropoff_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              timeZone: 'Europe/Madrid'
                            })}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span>{booking.days} días</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-furgocasa-orange mb-2">
                          {formatPrice(booking.total_price)}
                        </p>
                        <div className="flex flex-col gap-1">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusColors[booking.status]?.bg} ${statusColors[booking.status]?.text} font-medium`}>
                            {statusColors[booking.status]?.label}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${paymentStatusColors[booking.payment_status]?.bg} ${paymentStatusColors[booking.payment_status]?.text} font-medium`}>
                            {paymentStatusColors[booking.payment_status]?.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Resumen por estado */}
          {bookings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-700 font-medium mb-1">Activas/Pendientes</p>
                <p className="text-2xl font-bold text-yellow-800">{activeBookings.length}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 font-medium mb-1">Completadas</p>
                <p className="text-2xl font-bold text-gray-800">{completedBookings.length}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium mb-1">Canceladas</p>
                <p className="text-2xl font-bold text-red-800">{cancelledBookings.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
