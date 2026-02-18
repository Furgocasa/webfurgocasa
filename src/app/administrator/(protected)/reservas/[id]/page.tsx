"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, Calendar, MapPin, Car, User, Mail, Phone, 
  CreditCard, CheckCircle, Clock, AlertCircle, XCircle,
  FileText, DollarSign, Package, ExternalLink, Edit, Send, Copy
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Booking {
  id: string;
  booking_number: string;
  pickup_date: string;
  dropoff_date: string;
  pickup_time: string;
  dropoff_time: string;
  days: number;
  base_price: number;
  extras_price: number;
  location_fee: number;
  discount: number;
  coupon_code: string | null;
  coupon_discount: number;
  total_price: number;
  amount_paid: number | null;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  notes: string;
  admin_notes: string;
  created_at: string;
  vehicle: {
    id: string;
    name: string;
    brand: string;
    model: string;
    internal_code: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dni: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    date_of_birth: string | null;
    driver_license: string | null;
    driver_license_expiry: string | null;
    notes: string | null;
    total_bookings: number;
    total_spent: number;
  };
  pickup_location: {
    name: string;
    address: string;
  };
  dropoff_location: {
    name: string;
    address: string;
  };
  booking_extras: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    extra: {
      name: string;
      price_type: string;
    };
  }>;
}

const statusColors: Record<string, { bg: string; text: string; label: string; icon: any }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendiente", icon: Clock },
  confirmed: { bg: "bg-green-100", text: "text-green-800", label: "Confirmada", icon: CheckCircle },
  in_progress: { bg: "bg-blue-100", text: "text-blue-800", label: "En curso", icon: Car },
  completed: { bg: "bg-gray-100", text: "text-gray-800", label: "Completada", icon: CheckCircle },
  cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelada", icon: XCircle },
};

const paymentStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pendiente" },
  partial: { bg: "bg-orange-100", text: "text-orange-800", label: "Parcial" },
  paid: { bg: "bg-green-100", text: "text-green-800", label: "Pagado" },
  refunded: { bg: "bg-gray-100", text: "text-gray-800", label: "Reembolsado" },
};

export default function ReservaDetalleAdminPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const supabase = createClient(); // ✅ Crear instancia
      
      // Forzar una consulta fresca sin cache
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(id, name, brand, model, internal_code),
          customer:customers(
            id, 
            name, 
            email, 
            phone, 
            dni, 
            address, 
            city, 
            postal_code, 
            country,
            date_of_birth,
            driver_license,
            driver_license_expiry,
            notes,
            total_bookings,
            total_spent
          ),
          pickup_location:locations!pickup_location_id(name, address),
          dropoff_location:locations!dropoff_location_id(name, address),
          booking_extras(
            id,
            quantity,
            unit_price,
            total_price,
            extra:extras(name, price_type)
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      
      console.log('Booking loaded:', data); // Debug: ver datos cargados
      setBooking(data as any);

    } catch (error: any) {
      console.error('Error loading booking:', error);
      setMessage({ type: 'error', text: error.message || 'Error al cargar la reserva' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!confirm(`¿Cambiar el estado de la reserva a "${statusColors[newStatus]?.label}"?`)) {
      return;
    }

    try {
      setUpdating(true);
      const supabase = createClient(); // ✅ Crear instancia
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Estado actualizado correctamente' });
      loadBooking();
    } catch (error: any) {
      console.error('Error updating status:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el estado' });
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    if (!confirm(`¿Cambiar el estado de pago a "${paymentStatusColors[newStatus]?.label}"?`)) {
      return;
    }

    try {
      setUpdating(true);
      const supabase = createClient(); // ✅ Crear instancia
      
      const updateData: any = { payment_status: newStatus };
      
      // Si se marca como pagado y la reserva está pendiente, cambiar a confirmada
      if (newStatus === 'paid' && booking?.status === 'pending') {
        updateData.status = 'confirmed';
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Estado de pago actualizado correctamente' });
      loadBooking();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el estado de pago' });
    } finally {
      setUpdating(false);
    }
  };

  const sendEmail = async (type: 'first_payment' | 'second_payment') => {
    const emailLabels = {
      first_payment: 'Confirmación 1º Pago',
      second_payment: 'Confirmación 2º Pago',
    };

    if (!confirm(`¿Enviar email de "${emailLabels[type]}" al cliente?`)) {
      return;
    }

    try {
      setSendingEmail(true);
      const response = await fetch('/api/bookings/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          bookingId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el email');
      }

      setMessage({ 
        type: 'success', 
        text: `Email de ${emailLabels[type]} enviado correctamente a ${booking?.customer_email}` 
      });
    } catch (error: any) {
      console.error('Error sending email:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al enviar el email' 
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const copyReservationDetails = async () => {
    if (!booking) return;
    const pickup = new Date(booking.pickup_date);
    const dropoff = new Date(booking.dropoff_date);
    const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    const pickupFormatted = pickup.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const dropoffFormatted = dropoff.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const pickupLocation = booking.pickup_location
      ? [booking.pickup_location.name, booking.pickup_location.address].filter(Boolean).join(' ')
      : '-';
    const dropoffLocation = booking.dropoff_location
      ? [booking.dropoff_location.name, booking.dropoff_location.address].filter(Boolean).join(' ')
      : '-';
    const text = `Recogida ${pickupFormatted}${booking.pickup_time ? ` ${booking.pickup_time}` : ''}
Devolución ${dropoffFormatted}${booking.dropoff_time ? ` ${booking.dropoff_time}` : ''}
Duración ${days} días
Recogida en ${pickupLocation}
Devolución en ${dropoffLocation}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage({ type: 'error', text: 'No se pudo copiar al portapapeles' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reserva...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reserva no encontrada</h2>
        <Link href="/administrator/reservas" className="text-furgocasa-orange hover:underline">
          Volver a reservas
        </Link>
      </div>
    );
  }

  const StatusIcon = statusColors[booking.status]?.icon || Clock;

  // Obtener datos de pago directamente del booking (campo amount_paid)
  const totalPaid = booking.amount_paid || 0;
  
  // Calcular pendiente
  const totalPending = booking.total_price - totalPaid;
  
  // Calcular porcentaje pagado
  const percentagePaid = booking.total_price > 0 ? (totalPaid / booking.total_price) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link 
            href="/administrator/reservas"
            className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a reservas
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Reserva {booking.booking_number}</h1>
          <p className="text-gray-600 mt-1">
            Creada el {new Date(booking.created_at).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        {/* Botones de acción */}
        <div className="flex flex-wrap gap-3">
          {/* Botones de emails */}
          <div className="flex gap-2">
            <button
              onClick={() => sendEmail('first_payment')}
              disabled={sendingEmail}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reenviar email de confirmación (1º pago)"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Email 1º Pago</span>
            </button>
            
            <button
              onClick={() => sendEmail('second_payment')}
              disabled={sendingEmail}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reenviar email de confirmación (2º pago)"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Email 2º Pago</span>
            </button>
          </div>

          {/* Separador visual */}
          <div className="hidden sm:block w-px bg-gray-300 self-stretch"></div>

          {/* Botones de acción originales */}
          <Link
            href={`/administrator/reservas/${bookingId}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </Link>
          
          <a
            href={`/reservar/${bookingId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Vista Cliente</span>
          </a>
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <StatusIcon className="h-6 w-6 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Estado de la reserva</h3>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusColors[booking.status]?.bg} ${statusColors[booking.status]?.text} font-semibold mb-4`}>
            {statusColors[booking.status]?.label}
          </div>
          <div className="space-y-2">
            {booking.status === 'pending' && (
              <button
                onClick={() => updatePaymentStatus('paid')}
                disabled={updating}
                className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Marcar como pagado y confirmar
              </button>
            )}
            {booking.status === 'confirmed' && (
              <button
                onClick={() => updateStatus('in_progress')}
                disabled={updating}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Marcar en curso
              </button>
            )}
            {booking.status === 'in_progress' && (
              <button
                onClick={() => updateStatus('completed')}
                disabled={updating}
                className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Marcar completada
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={updating}
                className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Cancelar reserva
              </button>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-6 w-6 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Estado del pago</h3>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${paymentStatusColors[booking.payment_status]?.bg} ${paymentStatusColors[booking.payment_status]?.text} font-semibold mb-4`}>
            {paymentStatusColors[booking.payment_status]?.label}
          </div>
          
          {/* Desglose de pagos */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de la reserva:</span>
              <span className="font-semibold text-gray-900">{formatPrice(booking.total_price)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total pagado:</span>
              <span className="font-semibold text-green-600">{formatPrice(totalPaid)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">Pendiente:</span>
              <span className={`font-bold ${totalPending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {formatPrice(totalPending)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {booking.payment_status === 'pending' && (
              <button
                onClick={() => updatePaymentStatus('paid')}
                disabled={updating}
                className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Marcar como pagado
              </button>
            )}
            {booking.payment_status === 'paid' && booking.status === 'cancelled' && (
              <button
                onClick={() => updatePaymentStatus('refunded')}
                disabled={updating}
                className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Marcar como reembolsado
              </button>
            )}
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-br from-furgocasa-orange to-orange-600 text-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-6 w-6" />
            <h3 className="font-semibold">Resumen económico</h3>
          </div>
          
          {/* Desglose de precios */}
          <div className="space-y-2 text-sm mb-4 pb-4 border-b border-white/20">
            <div className="flex justify-between">
              <span className="opacity-90">Alquiler ({booking.days} días):</span>
              <span className="font-semibold">{formatPrice(booking.base_price)}</span>
            </div>
            
            {/* Extras desglosados */}
            {booking.booking_extras && booking.booking_extras.length > 0 ? (
              booking.booking_extras.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="opacity-90">
                    {item.extra.name} {item.quantity > 1 && `×${item.quantity}`}
                  </span>
                  <span className="font-semibold">{formatPrice(item.total_price)}</span>
                </div>
              ))
            ) : booking.extras_price > 0 ? (
              <div className="flex justify-between">
                <span className="opacity-90">Extras:</span>
                <span className="font-semibold">{formatPrice(booking.extras_price)}</span>
              </div>
            ) : null}
            
            {/* Comisión de entrega/recogida */}
            {booking.location_fee > 0 && (
              <div className="flex justify-between">
                <span className="opacity-90">Comisión entrega/recogida:</span>
                <span className="font-semibold">{formatPrice(booking.location_fee)}</span>
              </div>
            )}
            
            {/* Descuento o Cupón */}
            {((booking.discount ?? booking.coupon_discount) || 0) > 0 && (
              <div className="flex justify-between">
                <span className="opacity-90">
                  {booking.coupon_code ? `Cupón ${booking.coupon_code}` : 'Descuento'}:
                </span>
                <span className="font-semibold text-green-300">
                  - {formatPrice(booking.discount ?? booking.coupon_discount ?? 0)}
                </span>
              </div>
            )}
          </div>
          
          {/* Total y estado de pago */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-base">
              <span className="opacity-90 font-medium">Total reserva:</span>
              <span className="font-semibold">{formatPrice(booking.total_price)}</span>
            </div>
            {booking.amount_paid && booking.amount_paid > 0 && (
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Ya pagado:</span>
                <span className="font-semibold text-green-300">{formatPrice(booking.amount_paid)} ✓</span>
              </div>
            )}
            {booking.amount_paid && booking.amount_paid < booking.total_price && (
              <div className="flex justify-between text-sm pt-2 border-t border-white/20">
                <span className="opacity-90 font-medium">Pendiente:</span>
                <span className="font-bold text-lg">{formatPrice(booking.total_price - booking.amount_paid)}</span>
              </div>
            )}
          </div>
          
          <div className="text-3xl font-bold mb-2">{formatPrice(booking.total_price)}</div>
          <p className="text-sm opacity-90">{booking.days} días de alquiler</p>
          
          {/* Fianza al final */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between text-sm mb-1">
              <span className="opacity-90">Fianza *</span>
              <span className="font-semibold">1.000,00 €</span>
            </div>
            <p className="text-xs opacity-75">
              * Se devuelve al finalizar el alquiler si no hay daños
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="h-6 w-6 text-furgocasa-blue" />
              Vehículo
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Car className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                {booking.vehicle.internal_code && (
                  <span className="inline-block px-2 py-1 text-xs font-mono font-bold bg-blue-100 text-blue-800 rounded mb-1">
                    {booking.vehicle.internal_code}
                  </span>
                )}
                <p className="font-semibold text-gray-900 text-lg">{booking.vehicle.name}</p>
                <p className="text-sm text-gray-600">{booking.vehicle.brand} · {booking.vehicle.model}</p>
              </div>
            </div>
          </div>

          {/* Dates & Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-furgocasa-blue" />
                Fechas y ubicación
              </h3>
              <button
                type="button"
                onClick={copyReservationDetails}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-furgocasa-blue hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                {copied ? '¡Copiado!' : 'Copiar detalles de la reserva'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-medium mb-2">Recogida</p>
                <p className="font-semibold text-gray-900">
                  {new Date(booking.pickup_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-1">{booking.pickup_time}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-medium mb-2">Devolución</p>
                <p className="font-semibold text-gray-900">
                  {new Date(booking.dropoff_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-1">{booking.dropoff_time}</p>
              </div>

              <div className="md:col-span-2 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-medium mb-1">Duración</p>
                <p className="font-bold text-furgocasa-blue text-xl">
                  {(() => {
                    const pickup = new Date(booking.pickup_date);
                    const dropoff = new Date(booking.dropoff_date);
                    const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
                    return days;
                  })()} días
                </p>
                {booking.days !== Math.ceil((new Date(booking.dropoff_date).getTime() - new Date(booking.pickup_date).getTime()) / (1000 * 60 * 60 * 24)) && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Base de datos: {booking.days} días (desincronizado)
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">Recogida en</p>
                  <p className="font-semibold text-gray-900">{booking.pickup_location.name}</p>
                  {booking.pickup_location.address && (
                    <p className="text-sm text-gray-600">{booking.pickup_location.address}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium">Devolución en</p>
                  <p className="font-semibold text-gray-900">{booking.dropoff_location.name}</p>
                  {booking.dropoff_location.address && (
                    <p className="text-sm text-gray-600">{booking.dropoff_location.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Extras */}
          {booking.booking_extras && booking.booking_extras.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-6 w-6 text-furgocasa-blue" />
                Extras
              </h3>
              <div className="space-y-3">
                {booking.booking_extras.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.extra.name}</p>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.quantity} × {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatPrice(item.total_price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {(booking.notes || booking.admin_notes) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-furgocasa-blue" />
                Notas
              </h3>
              {booking.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 uppercase font-medium mb-2">Notas del cliente</p>
                  <p className="text-gray-700">{booking.notes}</p>
                </div>
              )}
              {booking.admin_notes && (
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium mb-2">Notas internas</p>
                  <p className="text-gray-700">{booking.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Customer Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-6 w-6 text-furgocasa-blue" />
              Cliente
            </h3>
            
            {booking.customer ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium mb-1">Nombre</p>
                  <p className="font-semibold text-gray-900">{booking.customer.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium mb-1">Email</p>
                  <a href={`mailto:${booking.customer.email}`} className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {booking.customer.email}
                  </a>
                </div>

                {booking.customer.phone && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Teléfono</p>
                    <a href={`tel:${booking.customer.phone}`} className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {booking.customer.phone}
                    </a>
                  </div>
                )}

                {booking.customer.dni && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">DNI/NIE</p>
                    <p className="text-gray-900">{booking.customer.dni}</p>
                  </div>
                )}

                {booking.customer.date_of_birth && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Fecha de Nacimiento</p>
                    <p className="text-gray-900">
                      {new Date(booking.customer.date_of_birth).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {booking.customer.address && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Dirección</p>
                    <p className="text-gray-900">{booking.customer.address}</p>
                    {(booking.customer.postal_code || booking.customer.city) && (
                      <p className="text-sm text-gray-600">
                        {booking.customer.postal_code && `${booking.customer.postal_code} `}
                        {booking.customer.city}
                      </p>
                    )}
                    {booking.customer.country && (
                      <p className="text-sm text-gray-500 mt-1">{booking.customer.country}</p>
                    )}
                  </div>
                )}

                {(booking.customer.driver_license || booking.customer.driver_license_expiry) && (
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Permiso de Conducir</p>
                    {booking.customer.driver_license && (
                      <p className="text-gray-900">{booking.customer.driver_license}</p>
                    )}
                    {booking.customer.driver_license_expiry && (
                      <p className="text-sm text-gray-600">
                        Vence: {new Date(booking.customer.driver_license_expiry).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Reservas totales</p>
                      <p className="text-2xl font-bold text-furgocasa-orange">{booking.customer.total_bookings}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total gastado</p>
                      <p className="text-2xl font-bold text-green-600">{formatPrice(booking.customer.total_spent || 0)}</p>
                    </div>
                  </div>
                </div>

                {booking.customer.notes && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 uppercase font-medium mb-2">Notas del cliente</p>
                    <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      {booking.customer.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Cliente eliminado o no vinculado
                </p>
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-600">Datos registrados en la reserva:</p>
                  <p className="text-sm"><strong>Nombre:</strong> {booking.customer_name}</p>
                  <p className="text-sm"><strong>Email:</strong> {booking.customer_email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

