"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useRouter, useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { 
  ArrowLeft, CreditCard, CheckCircle, AlertCircle, 
  Calendar, MapPin, Car, User, Mail, Phone, Clock
} from "lucide-react";
import Link from "next/link";
import { getBookingByNumber, isValidBookingNumber } from "@/lib/bookings/get-by-number";

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
  const bookingNumber = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'redsys' | 'stripe'>('redsys'); // Redsys habilitado

  // Actualizar título del navegador
  useEffect(() => {
    document.title = 'Pago de reserva - Furgocasa';
  }, []);

  useEffect(() => {
    if (bookingNumber) {
      loadBooking();
    }
  }, [bookingNumber]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      
      if (!isValidBookingNumber(bookingNumber)) {
        setError('Número de reserva inválido');
        return;
      }

      const data = await getBookingByNumber(bookingNumber);

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
  
  // Comisión del 2% SOLO para Stripe (Redsys sin comisión)
  const STRIPE_FEE_PERCENT = 0.02;
  const stripeFee = amountToPay * STRIPE_FEE_PERCENT;
  const amountWithStripeFee = amountToPay + stripeFee;
  
  // Para pago completo con Stripe
  const fullAmount = booking ? booking.total_price - (booking.amount_paid || 0) : 0;
  const fullStripeFee = fullAmount * STRIPE_FEE_PERCENT;
  const fullAmountWithStripeFee = fullAmount + fullStripeFee;

  const handlePayment = async (paymentType:"deposit" |"full" ="deposit") => {
    console.log("\n" + "=".repeat(80));
    console.log("💳 FRONTEND - INICIANDO PROCESO DE PAGO");
    console.log("=".repeat(80));
    
    setProcessing(true);
    setError(null);

    try {
      // Determinar el monto base a cobrar
      let baseAmount = amountToPay;
      if (paymentType ==="full") {
        baseAmount = booking!.total_price - (booking!.amount_paid || 0);
      }
      
      // Para Stripe: añadir comisión del 2%
      // Para Redsys: monto base sin comisión
      const amount = paymentMethod === 'stripe' 
        ? baseAmount + (baseAmount * STRIPE_FEE_PERCENT)
        : baseAmount;
      
      console.log("📊 [1/5] Información del pago:", {
        bookingId: params.id,
        bookingNumber: booking?.booking_number,
        baseAmount,
        amount,
        amountFormatted: formatPrice(amount),
        paymentType,
        paymentMethod,
        stripeFeeApplied: paymentMethod === 'stripe',
        timestamp: new Date().toISOString(),
      });

      if (paymentMethod === 'stripe') {
        // === FLUJO DE STRIPE (con comisión del 2%) ===
        console.log("🟣 [2/5] Método seleccionado: STRIPE (con 2% comisión)");
        console.log("💰 Comisión Stripe:", {
          baseAmount,
          fee: baseAmount * STRIPE_FEE_PERCENT,
          totalAmount: amount,
        });
        const response = await fetch('/api/stripe/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            bookingId: params.id,
            amount, // Monto CON comisión para Stripe
            baseAmount, // Monto base para registrar en la reserva
            paymentType: paymentType ==="full" ?"full" :"deposit",
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Error al iniciar el pago');
        }

        console.log('✅ [3/5] Stripe Checkout iniciado:', data.sessionId);
        console.log('🔗 [4/5] Redirigiendo a Stripe...');

        // Redirigir a Stripe Checkout
        if (data.url) {
          console.log("=".repeat(80));
          console.log("✅ FRONTEND - REDIRIGIENDO A STRIPE");
          console.log("=".repeat(80) + "\n");
          window.location.href = data.url;
        } else {
          throw new Error('No se recibió URL de Stripe');
        }

      } else {
        // === FLUJO DE REDSYS ===
        console.log("🔴 [2/5] Método seleccionado: REDSYS");
        console.log("📡 [2/5] Llamando a /api/redsys/initiate...");
        
        const response = await fetch('/api/redsys/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            bookingId: params.id,
            amount,
            paymentType: paymentType ==="full" ?"full" :"deposit",
          }),
        });

        console.log("📥 [3/5] Respuesta del servidor recibida");
        const data = await response.json();

        if (!data.success) {
          console.error("❌ ERROR: El servidor devolvió error:", data.error);
          throw new Error(data.error || 'Error al iniciar el pago');
        }

        // 🔍 LOG: Ver la respuesta del backend
        console.log('✅ [3/5] Respuesta exitosa del backend:');
        console.log({
          success: data.success,
          redsysUrl: data.redsysUrl,
          orderNumber: data.orderNumber,
          hasFormData: !!data.formData,
          formDataKeys: data.formData ? Object.keys(data.formData) : [],
        });

        // 🔍 LOG: Decodificar los parámetros para verificar
        if (data.formData?.Ds_MerchantParameters) {
          console.log("🔍 [3/5] Decodificando parámetros recibidos...");
          try {
            const decoded = JSON.parse(atob(data.formData.Ds_MerchantParameters));
            console.log('📋 [3/5] Parámetros Redsys (decodificados):');
            console.log(JSON.stringify(decoded, null, 2));
            
            // Validaciones visuales
            console.log("🔍 [3/5] Validaciones de parámetros:");
            console.log({
              amountCorrecto: decoded.DS_MERCHANT_AMOUNT === String(Math.round(amount * 100)),
              amountEnviado: decoded.DS_MERCHANT_AMOUNT,
              amountEsperado: String(Math.round(amount * 100)),
              orderNumber: decoded.DS_MERCHANT_ORDER,
              orderLength: decoded.DS_MERCHANT_ORDER?.length,
              merchantCode: decoded.DS_MERCHANT_MERCHANTCODE,
              terminal: decoded.DS_MERCHANT_TERMINAL,
              tieneURLs: !!(decoded.DS_MERCHANT_URLOK && decoded.DS_MERCHANT_URLKO && decoded.DS_MERCHANT_MERCHANTURL),
            });
          } catch (e) {
            console.error('❌ ERROR decodificando parámetros en frontend:', e);
          }
        }

        // Crear formulario oculto y enviarlo a Redsys
        console.log("📝 [4/5] Creando formulario para enviar a Redsys...");
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.redsysUrl;
        form.target = '_self'; // Asegurarnos de que se abre en la misma ventana

        // Añadir campos ocultos con los parámetros de Redsys
        let fieldCount = 0;
        Object.entries(data.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
          fieldCount++;
          
          // 🔍 LOG: Ver qué se está añadiendo al formulario
          const displayValue = value?.toString().substring(0, 80);
          console.log(`  ✓ ${key}: ${displayValue}${value && value.toString().length > 80 ? '...' : ''}`);
        });

        // 🔍 LOG: Ver el formulario completo antes de enviarlo
        console.log("📤 [5/5] Formulario creado con éxito:");
        console.log({
          action: form.action,
          method: form.method,
          target: form.target,
          numberOfFields: fieldCount,
        });

        // Añadir formulario al DOM y enviarlo
        console.log("🚀 [5/5] Enviando formulario a Redsys...");
        console.log("=".repeat(80));
        console.log("✅ FRONTEND - REDIRIGIENDO A REDSYS");
        console.log("=".repeat(80) + "\n");
        
        // Guardar bookingNumber y orderNumber en sessionStorage para recuperarlo después del pago
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastPaymentBookingNumber', bookingNumber);
          sessionStorage.setItem('lastPaymentOrderNumber', data.orderNumber);
          console.log("💾 Guardado en sessionStorage: bookingNumber=" + bookingNumber + ", orderNumber=" + data.orderNumber);
        }
        
        document.body.appendChild(form);
        
        // Log antes de submit
        console.log("⏳ Ejecutando form.submit()...");
        form.submit();
        console.log("✅ form.submit() ejecutado");
      }
      
    } catch (error: any) {
      console.error("\n" + "=".repeat(80));
      console.error("❌ ERROR EN PROCESO DE PAGO (FRONTEND)");
      console.error("=".repeat(80));
      console.error('Error:', error);
      console.error('Mensaje:', error.message);
      console.error('Stack:', error.stack);
      console.error("=".repeat(80) + "\n");
      
      setError(error.message || 'Error al procesar el pago');
      setProcessing(false);
    }
    // No reseteamos processing porque el usuario será redirigido
  };

  if (loading) {
    return (
      <>
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información de la reserva...</p>
          </div>
        </div>
</>
    );
  }

  if (error || !booking) {
    return (
      <>
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
</>
    );
  }

  return (
    <>
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

              {/* Customer Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <User className="h-6 w-6 text-furgocasa-blue" />
                  <h3 className="text-lg font-semibold text-gray-900">{t("Datos del conductor principal")}</h3>
                </div>
                
                {booking.customer ? (
                  <div className="space-y-3">
                    {/* Nombre */}
                    <div className="grid grid-cols-[180px_1fr] gap-4 py-2 border-b border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">{t("Nombre")}:</p>
                      <p className="text-gray-900">{booking.customer.name}</p>
                    </div>

                    {/* DNI */}
                    {booking.customer.dni && (
                      <div className="grid grid-cols-[180px_1fr] gap-4 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">{t("DNI - ID nº")}:</p>
                        <p className="text-gray-900">{booking.customer.dni}</p>
                      </div>
                    )}

                    {/* Dirección */}
                    {booking.customer.address && (
                      <div className="grid grid-cols-[180px_1fr] gap-4 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">{t("Dirección")}:</p>
                        <p className="text-gray-900">{booking.customer.address}</p>
                      </div>
                    )}

                    {/* Código postal */}
                    {booking.customer.postal_code && (
                      <div className="grid grid-cols-[180px_1fr] gap-4 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">{t("Código postal")}:</p>
                        <p className="text-gray-900">{booking.customer.postal_code}</p>
                      </div>
                    )}

                    {/* Ciudad */}
                    {booking.customer.city && (
                      <div className="grid grid-cols-[180px_1fr] gap-4 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">{t("Ciudad")}:</p>
                        <p className="text-gray-900">{booking.customer.city}</p>
                      </div>
                    )}

                    {/* País */}
                    {booking.customer.country && (
                      <div className="grid grid-cols-[180px_1fr] gap-4 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">{t("País")}:</p>
                        <p className="text-gray-900">{booking.customer.country}</p>
                      </div>
                    )}

                    {/* Edad */}
                    {booking.customer.date_of_birth && (
                      <div className="grid grid-cols-[180px_1fr] gap-4 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">{t("Edad")}:</p>
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

                    {/* Teléfono */}
                    {booking.customer.phone && (
                      <div className="grid grid-cols-[180px_1fr] gap-4 py-2 border-b border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">{t("Teléfono")}:</p>
                        <a href={`tel:${booking.customer.phone}`} className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {booking.customer.phone}
                        </a>
                      </div>
                    )}

                    {/* Email */}
                    <div className="grid grid-cols-[180px_1fr] gap-4 py-2">
                      <p className="text-sm text-gray-600 font-medium">{t("Email")}:</p>
                      <a href={`mailto:${booking.customer.email}`} className="text-furgocasa-blue hover:text-furgocasa-orange flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {booking.customer.email}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">{t("No hay datos del cliente disponibles")}</div>
                )}
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
                {/* Redsys - RECOMENDADO (sin comisión) */}
                <button
                  onClick={() => setPaymentMethod('redsys')}
                  className={`p-4 border-2 rounded-lg transition-all relative ${
                    paymentMethod === 'redsys'
                      ? 'border-furgocasa-orange bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="absolute -top-2 left-4 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                    {t("Recomendado")}
                  </span>
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
                      <p className="text-xs text-gray-500">{t("Pasarela bancaria española")}</p>
                      <p className="text-xs text-green-600 font-medium">{t("Sin comisión")}</p>
                    </div>
                    <img 
                      src="/images/redsys.png" 
                      alt="Redsys" 
                      className="h-8 object-contain"
                    />
                  </div>
                </button>

                {/* Stripe - Con comisión del 2% */}
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
                      <p className="text-xs text-gray-500">{t("Pago internacional / Apple Pay")}</p>
                      <p className="text-xs text-amber-600 font-medium">+2% {t("comisión")}</p>
                    </div>
                    <svg className="h-6" viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#635bff" d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.93 0 1.85 6.29.97 6.29 5.88z"/>
                    </svg>
                  </div>
                </button>
              </div>
              
              {/* Desglose de precio con Stripe */}
              {paymentMethod === 'stripe' && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800 mb-2">{t("Desglose del pago con Stripe")}:</p>
                  <div className="space-y-1 text-sm text-amber-700">
                    <div className="flex justify-between">
                      <span>{t("Importe base")}</span>
                      <span>{formatPrice(amountToPay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t("Comisión de gestión")} (2%)</span>
                      <span>+{formatPrice(stripeFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-amber-300">
                      <span>{t("Total a pagar")}</span>
                      <span>{formatPrice(amountWithStripeFee)}</span>
                    </div>
                  </div>
                </div>
              )}
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
                        {t("Pagar restante")} - {formatPrice(paymentMethod === 'stripe' ? amountWithStripeFee : amountToPay)}
                        {paymentMethod === 'stripe' && <span className="text-xs ml-1">({t("incl.")} 2%)</span>}
                      </>
                    ) : (
                      <>
                        {t("Pagar 50% ahora")} - {formatPrice(paymentMethod === 'stripe' ? amountWithStripeFee : amountToPay)}
                        {paymentMethod === 'stripe' && <span className="text-xs ml-1">({t("incl.")} 2%)</span>}
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
                  {t("Pagar total ahora")} - {formatPrice(paymentMethod === 'stripe' ? fullAmountWithStripeFee : fullAmount)}
                  {paymentMethod === 'stripe' && <span className="text-xs ml-1">({t("incl.")} 2%)</span>}
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
                  <img src="/images/redsys.png" alt="Redsys" className="h-8" />
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
</>
  );
}

