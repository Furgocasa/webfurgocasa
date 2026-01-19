"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { formatPrice } from "@/lib/utils";
import { 
  ArrowLeft, Calendar, MapPin, Car, User, Mail, Phone, 
  CreditCard, CheckCircle, Clock, AlertCircle, XCircle,
  FileText, Package, Download, Home
} from "lucide-react";
import Link from "next/link";

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
  total_price: number;
  deposit_amount: number;
  amount_paid: number;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_dni: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_postal_code: string | null;
  notes: string;
  created_at: string;
  customer?: {
    id: string;
    date_of_birth: string | null;
    country: string | null;
    driver_license: string | null;
    driver_license_expiry: string | null;
  } | null;
  vehicle: {
    id: string;
    name: string;
    brand: string;
    model: string;
    main_image?: string;
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
      description: string;
    };
  }>;
}

const statusConfig: Record<string, { bg: string; text: string; label: string; icon: any; description: string }> = {
  pending: { 
    bg: "bg-yellow-100", 
    text: "text-yellow-800", 
    label: "Pendiente de pago", 
    icon: Clock,
    description: "Tu reserva está creada. Completa el pago para confirmarla."
  },
  confirmed: { 
    bg: "bg-green-100", 
    text: "text-green-800", 
    label: "Confirmada", 
    icon: CheckCircle,
    description: "Tu reserva está confirmada. ¡Prepárate para tu aventura!"
  },
  in_progress: { 
    bg: "bg-blue-100", 
    text: "text-blue-800", 
    label: "En curso", 
    icon: Car,
    description: "¡Disfruta tu viaje! El vehículo está actualmente en uso."
  },
  completed: { 
    bg: "bg-gray-100", 
    text: "text-gray-800", 
    label: "Completada", 
    icon: CheckCircle,
    description: "Tu alquiler ha finalizado. ¡Esperamos verte pronto!"
  },
  cancelled: { 
    bg: "bg-red-100", 
    text: "text-red-800", 
    label: "Cancelada", 
    icon: XCircle,
    description: "Esta reserva ha sido cancelada."
  },
};

export default function ReservaPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/bookings/${bookingId}`);
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error || 'Error al cargar la reserva');
        return;
      }

      const data = payload?.booking;

      if (!data) {
        setError('Reserva no encontrada');
        return;
      }

      // Procesar la imagen principal del vehículo
      if (data.vehicle && data.vehicle.images) {
        const primaryImage = data.vehicle.images.find((img: any) => img.is_primary);
        const firstImage = data.vehicle.images[0];
        (data.vehicle as any).main_image = primaryImage?.image_url || firstImage?.image_url || null;
      }

      setBooking(data as any);
    } catch (error: any) {
      console.error('Error loading booking:', error);
      setError(error.message || 'Error al cargar la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
            <p className="text-gray-600">{t("Cargando información de la reserva...")}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("Error")}</h2>
            <p className="text-gray-600 mb-4">{error || t("Reserva no encontrada")}</p>
            <Link href="/" className="text-furgocasa-orange hover:underline">
              {t("Volver al inicio")}
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const statusInfo = statusConfig[booking.status];
  const StatusIcon = statusInfo.icon;

  // Calcular pagos fraccionados
  const totalPrice = booking.total_price || 0;
  const amountPaid = booking.amount_paid || 0;
  const firstPayment = totalPrice * 0.5; // 50% inicial
  const secondPayment = totalPrice * 0.5; // 50% restante
  const pendingAmount = totalPrice - amountPaid;
  
  // Calcular días hasta el inicio del alquiler
  const pickupDate = new Date(booking.pickup_date);
  const today = new Date();
  const daysUntilPickup = Math.ceil((pickupDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const secondPaymentDue = daysUntilPickup <= 15; // 15 días antes o menos

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("Volver al inicio")}
            </Link>
          </div>

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <div className="text-center">
              <StatusIcon className="h-16 w-16 mx-auto mb-4" style={{ color: statusInfo.text.replace('text-', '') }} />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("Reserva")} {booking.booking_number}
              </h1>
              <p className="text-sm text-gray-500 mb-3">
                {t("Número de confirmación")}: {booking.id.substring(0, 13)}-{new Date(booking.created_at).getTime()}
              </p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.text} font-semibold mb-3`}>
                {statusInfo.label}
              </div>
              <p className="text-gray-600 mb-2">{statusInfo.description}</p>
              <p className="text-sm text-gray-500">
                {t("Reserva creada el")} {new Date(booking.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons - Sistema de pagos fraccionados */}
          {/* Primer pago (50%) - Pendiente */}
          {booking.status === 'pending' && amountPaid === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{t("Primer pago (50%)")}</h3>
                  <p className="text-gray-600 mb-2">
                    {t("Para confirmar tu reserva, necesitamos el pago del 50% del total.")}
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("Pago inicial")} (50%):</span>
                      <span className="text-2xl font-bold text-furgocasa-orange">{formatPrice(firstPayment)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {t("El segundo pago")} ({formatPrice(secondPayment)}) {t("se realizará máximo 15 días antes del inicio del alquiler")}.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/reservar/${bookingId}/pago?amount=${firstPayment.toFixed(2)}`)}
                    className="bg-furgocasa-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
                  >
                    <CreditCard className="h-5 w-5" />
                    {t("Pagar")} {formatPrice(firstPayment)} {t("y confirmar")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Primer pago realizado - Esperando segundo pago */}
          {booking.status === 'confirmed' && amountPaid >= firstPayment && amountPaid < totalPrice && (
            <div className={`rounded-2xl p-6 mb-6 ${secondPaymentDue ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
              <div className="flex items-start gap-4">
                {secondPaymentDue ? (
                  <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {secondPaymentDue ? (
                      t("⚠️ Segundo pago urgente")
                    ) : (
                      t("Primer pago completado ✓")
                    )}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {secondPaymentDue ? (
                      <>
                        <strong className="text-red-700">{t("¡Atención!")}</strong> {t("Faltan")} {daysUntilPickup} {t("días para el inicio del alquiler. El segundo pago debe realizarse como máximo 15 días antes.")}
                      </>
                    ) : (
                      <>
                        {t("Has pagado")} {formatPrice(amountPaid)}. {t("Puedes realizar el segundo pago cuando quieras.")}
                      </>
                    )}
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{t("Total de la reserva")}:</span>
                        <span className="font-semibold">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{t("Ya pagado")}:</span>
                        <span className="font-semibold text-green-600">{formatPrice(amountPaid)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-gray-900 font-medium">{t("Pendiente")}:</span>
                        <span className="text-xl font-bold text-furgocasa-orange">{formatPrice(pendingAmount)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botón siempre visible */}
                  <button
                    onClick={() => router.push(`/reservar/${bookingId}/pago?amount=${pendingAmount.toFixed(2)}`)}
                    className={`font-semibold py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2 ${
                      secondPaymentDue 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-furgocasa-orange text-white hover:bg-orange-600'
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                    {secondPaymentDue ? t("Pagar ahora") : t("Realizar segundo pago")} ({formatPrice(pendingAmount)})
                  </button>

                  {/* Aviso informativo si hay tiempo */}
                  {!secondPaymentDue && (
                    <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t("Recuerda: el segundo pago debe completarse como máximo 15 días antes del inicio del alquiler")} ({new Date(pickupDate.getTime() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })})
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pago completado */}
          {booking.status === 'confirmed' && amountPaid >= totalPrice && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{t("¡Pago completado!")}</h3>
                  <p className="text-gray-600 mb-2">
                    {t("Has completado el pago total de la reserva. ¡Todo listo para tu aventura!")}
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{t("Total pagado")}:</span>
                      <span className="text-2xl font-bold text-green-600">{formatPrice(amountPaid)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirmada (mensaje estándar si no aplica sistema de pagos) */}
          {booking.status === 'confirmed' && booking.payment_status === 'paid' && amountPaid >= totalPrice && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{t("¡Tu reserva está confirmada!")}</h3>
                  <p className="text-gray-600">
                    {t("Hemos enviado la confirmación a tu email. No olvides traer tu DNI/NIE y el carnet de conducir el día de la recogida.")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Izquierda */}
            <div className="lg:col-span-2 space-y-6">
              {/* Vehicle */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="h-6 w-6 text-furgocasa-blue" />
                  {t("Tu vehículo")}
                </h2>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {booking.vehicle.main_image ? (
                      <img 
                        src={booking.vehicle.main_image} 
                        alt={booking.vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Car className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xl">{booking.vehicle.name}</p>
                    <p className="text-gray-600">{booking.vehicle.brand} · {booking.vehicle.model}</p>
                  </div>
                </div>
              </div>

              {/* Tus datos */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-6 w-6 text-furgocasa-blue" />
                  {t("Datos del conductor principal")}
                </h2>
                
                <div className="space-y-3">
                  {/* Nombre y Apellidos */}
                  {(() => {
                    const fullName = booking.customer_name || '';
                    const nameParts = fullName.trim().split(/\s+/);
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    
                    return (
                      <>
                        {firstName && (
                          <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                            <p className="text-sm text-gray-600 font-medium">{t("Nombre del conductor principal")}:</p>
                            <p className="text-gray-900">{firstName}</p>
                          </div>
                        )}
                        {lastName && (
                          <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                            <p className="text-sm text-gray-600 font-medium">{t("Apellidos del conductor principal")}:</p>
                            <p className="text-gray-900">{lastName}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* DNI - ID nº */}
                  {booking.customer_dni && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600 font-medium">{t("DNI - ID nº")}:</p>
                      <p className="text-gray-900">{booking.customer_dni}</p>
                    </div>
                  )}

                  {/* Dirección del conductor principal */}
                  {booking.customer_address && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600 font-medium">{t("Dirección del conductor principal")}:</p>
                      <p className="text-gray-900">{booking.customer_address}</p>
                    </div>
                  )}

                  {/* Código postal del conductor principal */}
                  {booking.customer_postal_code && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600 font-medium">{t("Código postal del conductor principal")}:</p>
                      <p className="text-gray-900">{booking.customer_postal_code}</p>
                    </div>
                  )}

                  {/* Municipio del conductor principal */}
                  {booking.customer_city && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600 font-medium">{t("Municipio del conductor principal")}:</p>
                      <p className="text-gray-900">{booking.customer_city}</p>
                    </div>
                  )}

                  {/* País del conductor principal */}
                  {booking.customer?.country && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600 font-medium">{t("País del conductor principal")}:</p>
                      <p className="text-gray-900">{booking.customer.country}</p>
                    </div>
                  )}

                  {/* Edad del conductor principal */}
                  {booking.customer?.date_of_birth && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600 font-medium">{t("Edad del conductor principal")}:</p>
                      <p className="text-gray-900">
                        {(() => {
                          const birthDate = new Date(booking.customer.date_of_birth);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const monthDiff = today.getMonth() - birthDate.getMonth();
                          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                          }
                          return age;
                        })()}
                      </p>
                    </div>
                  )}

                  {/* Fecha de caducidad carnet conducir del conductor principal */}
                  {booking.customer?.driver_license_expiry && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                      <p className="text-sm text-gray-600 font-medium">{t("Fecha de caducidad carnet conducir del conductor principal")}:</p>
                      <p className="text-gray-900">
                        {new Date(booking.customer.driver_license_expiry).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}

                  {/* Teléfono */}
                  <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">{t("Teléfono")}:</p>
                    <a href={`tel:${booking.customer_phone}`} className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {booking.customer_phone}
                    </a>
                  </div>

                  {/* e-Mail */}
                  <div className="grid grid-cols-[200px_1fr] gap-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">{t("e-Mail")}:</p>
                    <a href={`mailto:${booking.customer_email}`} className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {booking.customer_email}
                    </a>
                  </div>

                  {/* Comentarios */}
                  {booking.notes && (
                    <div className="grid grid-cols-[200px_1fr] gap-4 py-2">
                      <p className="text-sm text-gray-600 font-medium">{t("Comentarios")}:</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-furgocasa-blue" />
                  {t("Fechas")}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 uppercase font-medium mb-2">{t("Recogida")}</p>
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
                    <p className="text-sm text-gray-500 uppercase font-medium mb-2">{t("Devolución")}</p>
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
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Duración")}</p>
                    <p className="font-bold text-furgocasa-blue text-xl">{booking.days} {booking.days === 1 ? t("día") : t("días")}</p>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-6 w-6 text-furgocasa-blue" />
                  {t("Ubicación")}
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Punto de recogida")}</p>
                      <p className="font-semibold text-gray-900">{booking.pickup_location.name}</p>
                      {booking.pickup_location.address && (
                        <p className="text-sm text-gray-600 mt-1">{booking.pickup_location.address}</p>
                      )}
                    </div>
                  </div>

                  {booking.pickup_location.name !== booking.dropoff_location.name && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Punto de devolución")}</p>
                        <p className="font-semibold text-gray-900">{booking.dropoff_location.name}</p>
                        {booking.dropoff_location.address && (
                          <p className="text-sm text-gray-600 mt-1">{booking.dropoff_location.address}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Extras */}
              {booking.booking_extras && booking.booking_extras.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-6 w-6 text-furgocasa-blue" />
                    {t("Extras incluidos")}
                  </h2>
                  <div className="space-y-3">
                    {booking.booking_extras.map((item: any) => (
                      <div key={item.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.extra.name}</p>
                          {item.extra.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.extra.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {t("Cantidad")}: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-furgocasa-orange text-lg ml-4">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Notes */}
              {booking.notes && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-furgocasa-blue" />
                    {t("Tus notas")}
                  </h2>
                  <p className="text-gray-700">{booking.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar - Derecha */}
            <div className="space-y-6">
              {/* Price Summary */}
              <div className="bg-gradient-to-br from-furgocasa-orange to-orange-600 text-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">{t("Resumen de pago")}</h3>
                
                <div className="space-y-3 mb-4 pb-4 border-b border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-90">{t("Alquiler")} ({booking.days} días)</span>
                    <span className="font-semibold">{formatPrice(booking.base_price)}</span>
                  </div>
                  
                  {booking.extras_price > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">{t("Extras")}</span>
                      <span className="font-semibold">{formatPrice(booking.extras_price)}</span>
                    </div>
                  )}

                  {booking.location_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">{t("Comisión de entrega/recogida")}</span>
                      <span className="font-semibold">{formatPrice(booking.location_fee)}</span>
                    </div>
                  )}

                  {booking.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">{t("Descuento")}</span>
                      <span className="font-semibold text-green-300">- {formatPrice(booking.discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="opacity-90">{t("Fianza")} *</span>
                    <span className="font-semibold">1.000,00 €</span>
                  </div>
                </div>

                {/* Sistema de pagos fraccionados */}
                {amountPaid < totalPrice && (
                  <div className="space-y-2 mb-4 pb-4 border-b border-white/20">
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">{t("Primer pago")} (50%)</span>
                      <span className="font-semibold">{formatPrice(firstPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="opacity-90">{t("Segundo pago")} (50%)</span>
                      <span className="font-semibold">{formatPrice(secondPayment)}</span>
                    </div>
                    {amountPaid > 0 && (
                      <div className="flex justify-between text-sm pt-2 border-t border-white/20">
                        <span className="opacity-90">{t("Ya pagado")}</span>
                        <span className="font-semibold text-green-300">{formatPrice(amountPaid)} ✓</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm opacity-90 mb-1">{t("Total")}</p>
                  <p className="text-4xl font-bold">{formatPrice(booking.total_price)}</p>
                  {pendingAmount > 0 && (
                    <p className="text-sm mt-2 opacity-90">
                      {t("Pendiente")}: <span className="font-bold">{formatPrice(pendingAmount)}</span>
                    </p>
                  )}
                  {amountPaid >= totalPrice && (
                    <p className="text-sm mt-2 bg-green-500/20 px-3 py-1 rounded-full inline-block">
                      ✓ {t("Pagado completamente")}
                    </p>
                  )}
                </div>

                <p className="text-xs opacity-75">
                  * {t("La fianza se devuelve al finalizar el alquiler si no hay daños")}
                </p>
              </div>

              {/* Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">{t("¿Necesitas ayuda?")}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t("Si tienes alguna duda sobre tu reserva, no dudes en contactarnos.")}
                </p>
                <div className="space-y-2 text-sm">
                  <a href="tel:+34868364161" className="flex items-center gap-2 text-furgocasa-blue hover:text-furgocasa-orange">
                    <Phone className="h-4 w-4" />
                    +34 868 364 161
                  </a>
                  <a href="mailto:info@furgocasa.com" className="flex items-center gap-2 text-furgocasa-blue hover:text-furgocasa-orange">
                    <Mail className="h-4 w-4" />
                    info@furgocasa.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de cancelación/modificación */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t("Solicitud de cancelación / modificación")}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {t("Si deseas cancelar o modificar tu reserva, por favor contáctanos directamente. Te responderemos lo antes posible.")}
            </p>
            
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{t("Email")}</p>
                  <a href="mailto:info@furgocasa.com?subject=Solicitud de modificación/cancelación - Reserva ${booking.booking_number}" 
                     className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    info@furgocasa.com
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{t("Teléfono")}</p>
                  <a href="tel:+34868364161" className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    +34 868 364 161
                  </a>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {t("Asegúrate de incluir tu número de reserva")} ({booking.booking_number}) {t("en tu mensaje para que podamos ayudarte más rápidamente.")}<br/>
                  {t("Consulta nuestra")} <Link href="/tarifas" className="text-furgocasa-blue hover:underline">{t("política de cancelación")}</Link> {t("para más información.")}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

