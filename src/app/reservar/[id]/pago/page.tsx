"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { supabase } from "@/lib/supabase/client";
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

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(name, brand, model),
          pickup_location:locations!pickup_location_id(name),
          dropoff_location:locations!dropoff_location_id(name)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      
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
        firstPayment: Math.ceil(total * 0.5), // 50% redondeado hacia arriba
        secondPayment: Math.floor(total * 0.5), // Resto
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

      // Llamar al endpoint de Redsys para iniciar el pago
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
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Error al procesar el pago');
      setProcessing(false);
    }
    // No reseteamos processing porque el usuario será redirigido a Redsys
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
                  <p className="text-2xl font-bold">{booking.total_price.toFixed(2)}€</p>
                </div>
                
                {booking.amount_paid > 0 && (
                  <div className="flex items-center justify-between mb-2 text-green-200">
                    <p className="text-sm">{t("Ya pagado")}</p>
                    <p className="font-semibold">-{booking.amount_paid.toFixed(2)}€</p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-white/30">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{t("Pendiente de pago")}</p>
                    <p className="text-3xl font-bold">{(booking.total_price - (booking.amount_paid || 0)).toFixed(2)}€</p>
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
            
            {/* Política de pagos 50%-50% */}
            {!paymentInfo.isPending50 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  {t("Política de pago Furgocasa")}
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>50%</strong> {t("al realizar la reserva")} ({paymentInfo.firstPayment.toFixed(2)}€)</li>
                  <li>• <strong>50%</strong> {t("máximo 15 días antes de la recogida")} ({paymentInfo.secondPayment.toFixed(2)}€)</li>
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
                        {t("Pagar restante")} - {amountToPay.toFixed(2)}€
                      </>
                    ) : (
                      <>
                        {t("Pagar 50% ahora")} - {amountToPay.toFixed(2)}€
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
                  {t("Pagar total ahora")} - {booking.total_price.toFixed(2)}€
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 mb-1">{t("Pago seguro con Redsys")}</p>
                  <p>{t("Tus datos están protegidos mediante conexión SSL encriptada. No almacenamos datos de tarjeta.")}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/Redsys.jpg" alt="Redsys" className="h-6" />
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

