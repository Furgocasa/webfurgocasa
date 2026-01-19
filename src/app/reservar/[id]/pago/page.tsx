"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { formatPrice } from "@/lib/utils";
import { 
  ArrowLeft, CreditCard, CheckCircle, AlertCircle, 
  Calendar, MapPin, Car, User, Mail, Phone, Clock
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
  total_price: number;
  amount_paid: number;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle: {
    name: string;
    brand: string;
    model: string;
  };
  pickup_location: {
    name: string;
  };
  dropoff_location: {
    name: string;
  };
}

export default function PagoPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'redsys' | 'stripe'>('redsys');

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

      setBooking(data as any);
    } catch (error: any) {
      console.error('Error loading booking:', error);
      setError(error.message || 'Error al cargar la reserva');
    } finally {
      setLoading(false);
    }
  };

  // Calcular importes según política 50%-50%
  const calculatePaymentAmounts = () => {
    if (!booking) return { firstPayment: 0, secondPayment: 0, isPending50: false };
    
    const total = booking.total_price;
    const amountPaid = booking.amount_paid || 0;
    const pendingAmount = total - amountPaid;
    
    // Si no se ha pagado nada, primer pago es 50%
    if (amountPaid === 0) {
      return {
        firstPayment: total * 0.5, // 50% exacto (con decimales)
        secondPayment: total * 0.5, // 50% exacto (con decimales)
        isPending50: false,
      };
    }
    
    // Si ya se pagó algo, el siguiente pago es el pendiente total
    return {
      firstPayment: 0,
      secondPayment: pendingAmount,
      isPending50: amountPaid > 0 && pendingAmount > 0,
    };
  };

  const paymentInfo = calculatePaymentAmounts();
  const amountToPay = paymentInfo.isPending50 ? paymentInfo.secondPayment : paymentInfo.firstPayment;

  const handlePayment = async (paymentType: "deposit" | "full" = "deposit") => {
    setProcessing(true);
    setError(null);

    try {
      // Determinar el monto a cobrar
      let amount = amountToPay;
      if (paymentType === "full") {
        amount = booking!.total_price - (booking!.amount_paid || 0);
      }

      if (paymentMethod === 'stripe') {
        // === FLUJO DE STRIPE ===
        const response = await fetch('/api/stripe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            bookingId: params.id,
            amount,
            paymentType: paymentType === "full" ? "full" : "deposit",
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Error al iniciar el pago');
        }

        console.log('✅ Stripe Checkout iniciado:', data.sessionId);

        // Redirigir a Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No se recibió URL de Stripe');
        }

      } else {
        // === FLUJO DE REDSYS ===
        const response = await fetch('/api/redsys/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            bookingId: params.id,
            amount,
            paymentType: paymentType === "full" ? "full" : "deposit",
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Error al iniciar el pago');
        }

        // 🔍 LOG: Ver la respuesta del backend
        console.log('📥 Respuesta del backend:', {
          success: data.success,
          redsysUrl: data.redsysUrl,
          hasFormData: !!data.formData,
          formDataKeys: data.formData ? Object.keys(data.formData) : [],
        });

        // 🔍 LOG: Decodificar los parámetros para verificar
        if (data.formData?.Ds_MerchantParameters) {
          try {
            const decoded = JSON.parse(atob(data.formData.Ds_MerchantParameters));
            console.log('🔍 Parámetros en frontend:', {
              amount: decoded.DS_MERCHANT_AMOUNT,
              order: decoded.DS_MERCHANT_ORDER,
              terminal: decoded.DS_MERCHANT_TERMINAL,
              merchantCode: decoded.DS_MERCHANT_MERCHANTCODE,
            });
          } catch (e) {
            console.error('Error decodificando parámetros en frontend:', e);
          }
        }

        // Crear formulario oculto y enviarlo a Redsys
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.redsysUrl;

        // Añadir campos ocultos con los parámetros de Redsys
        Object.entries(data.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
          
          // 🔍 LOG: Ver qué se está añadiendo al formulario
          console.log(`📝 Campo añadido: ${key} = ${value?.toString().substring(0, 50)}...`);
        });

        // 🔍 LOG: Ver el formulario completo antes de enviarlo
        console.log('📤 Enviando formulario a:', form.action);
        console.log('📤 Método:', form.method);
        console.log('📤 Número de campos:', form.elements.length);

        // Añadir formulario al DOM y enviarlo
        document.body.appendChild(form);
        form.submit();
      }
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Error al procesar el pago');
      setProcessing(false);
    }
    // No reseteamos processing porque el usuario será redirigido
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información de la reserva...</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Reserva no encontrada'}</p>
            <Link href="/" className="text-furgocasa-orange hover:underline">
              Volver al inicio
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("¡Reserva creada correctamente!")}
              </h1>
              <p className="text-gray-600 mb-4">
                {t("Número de reserva")}: <span className="font-mono font-bold text-furgocasa-orange">{booking.booking_number}</span>
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-800 rounded-lg">
                <Clock className="h-5 w-5" />
                <span className="font-medium">{t("Pendiente de pago")}</span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("Detalles de la reserva")}
            </h2>

            <div className="space-y-6">
              {/* Vehicle */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Car className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Vehículo")}</p>
                  <p className="font-semibold text-gray-900 text-lg">{booking.vehicle.name}</p>
                  <p className="text-sm text-gray-600">{booking.vehicle.brand} {booking.vehicle.model}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Recogida")}</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.pickup_date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{booking.pickup_time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Devolución")}</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.dropoff_date).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">{booking.dropoff_time}</p>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Recogida en")}</p>
                    <p className="font-semibold text-gray-900">{booking.pickup_location.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <MapPin className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Devolución en")}</p>
                    <p className="font-semibold text-gray-900">{booking.dropoff_location.name}</p>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <User className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Cliente")}</p>
                  <p className="font-semibold text-gray-900">{booking.customer_name}</p>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {booking.customer_email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {booking.customer_phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="p-6 bg-gradient-to-r from-furgocasa-blue to-blue-700 rounded-lg text-white">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm opacity-90">{t("Total reserva")}</p>
                  <p className="text-2xl font-bold">{formatPrice(booking.total_price)}</p>
                </div>
                
                {booking.amount_paid > 0 && (
                  <div className="flex items-center justify-between mb-2 text-green-200">
                    <p className="text-sm">{t("Ya pagado")}</p>
                    <p className="font-semibold">-{formatPrice(booking.amount_paid)}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-white/30">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{t("Pendiente de pago")}</p>
                    <p className="text-3xl font-bold">{formatPrice(booking.total_price - (booking.amount_paid || 0))}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("Proceder con el pago")}
            </h2>

            {/* Selector de método de pago */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t("Selecciona el método de pago")}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Redsys */}
                <button
                  onClick={() => setPaymentMethod('redsys')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'redsys'
                      ? 'border-furgocasa-orange bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'redsys' ? 'border-furgocasa-orange' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'redsys' && (
                        <div className="w-3 h-3 rounded-full bg-furgocasa-orange"></div>
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-900">Redsys</p>
                      <p className="text-xs text-gray-500">Pasarela bancaria española</p>
                    </div>
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/c/ca/Redsys.jpg" 
                      alt="Redsys" 
                      className="h-5 object-contain"
                    />
                  </div>
                </button>

                {/* Stripe */}
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'stripe'
                      ? 'border-furgocasa-orange bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'stripe' ? 'border-furgocasa-orange' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'stripe' && (
                        <div className="w-3 h-3 rounded-full bg-furgocasa-orange"></div>
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-900">Stripe</p>
                      <p className="text-xs text-gray-500">Pago internacional seguro</p>
                    </div>
                    <svg className="h-6" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#635bff" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Política de pagos 50%-50% */}
            {!paymentInfo.isPending50 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {t("Política de pago Furgocasa")}
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>50%</strong> {t("al realizar la reserva")} ({formatPrice(paymentInfo.firstPayment)})</li>
                  <li>• <strong>50%</strong> {t("máximo 15 días antes de la recogida")} ({formatPrice(paymentInfo.secondPayment)})</li>
                </ul>
              </div>
            )}

            {paymentInfo.isPending50 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  {t("Segundo pago pendiente")}
                </h3>
                <p className="text-sm text-yellow-800">
                  {t("Ya realizaste el primer pago. Este es el importe restante para completar tu reserva.")}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* Botón pago principal (50% o restante) */}
              <button
                onClick={() => handlePayment("deposit")}
                disabled={processing}
                className="w-full bg-furgocasa-orange text-white font-semibold py-4 px-6 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t("Redirigiendo a pasarela de pago...")}
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    {paymentInfo.isPending50 ? (
                      <>
                        {t("Pagar restante")} - {formatPrice(amountToPay)}
                      </>
                    ) : (
                      <>
                        {t("Pagar 50% ahora")} - {formatPrice(amountToPay)}
                      </>
                    )}
                  </>
                )}
              </button>

              {/* Opción de pagar el total (solo si no se ha pagado nada) */}
              {!paymentInfo.isPending50 && (
                <button
                  onClick={() => handlePayment("full")}
                  disabled={processing}
                  className="w-full bg-white text-furgocasa-blue border-2 border-furgocasa-blue font-semibold py-4 px-6 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="h-5 w-5" />
                  {t("Pagar total ahora")} - {formatPrice(booking.total_price)}
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    {paymentMethod === 'redsys' ? t("Pago seguro con Redsys") : t("Pago seguro con Stripe")}
                  </p>
                  <p>{t("Tus datos están protegidos mediante conexión SSL encriptada. No almacenamos datos de tarjeta.")}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
                {paymentMethod === 'redsys' ? (
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/Redsys.jpg" alt="Redsys" className="h-6" />
                ) : (
                  <svg className="h-6" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#635bff" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"/>
                  </svg>
                )}
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-furgocasa-orange transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("Volver al inicio")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

