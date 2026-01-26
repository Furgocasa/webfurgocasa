"use client";

import { useEffect, useState, Suspense } from"react";
import { useLanguage } from"@/contexts/language-context";
import { useSearchParams, useRouter } from"next/navigation";

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
import { supabase } from"@/lib/supabase/client";
import { formatPrice } from"@/lib/utils";
import { CheckCircle, Calendar, Car, MapPin, Download, Mail } from"lucide-react";
import { LocalizedLink } from"@/components/localized-link";

/**
 * Componente para mostrar cuando no tenemos datos del pago
 * NO limpia sessionStorage - eso se hace en el componente principal
 */
function PaymentSuccessGeneric({ bookingId }: { bookingId?: string | null }) {
  const { t } = useLanguage();

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-6">
        {t("Tu pago ha sido procesado correctamente. Pronto recibirás un email de confirmación con todos los detalles de tu reserva.")}
      </p>
      <div className="space-y-3">
        {bookingId && (
          <LocalizedLink
            href={`/reservar/${bookingId}`}
            className="block w-full bg-furgocasa-blue text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("Ver mi reserva")}
          </LocalizedLink>
        )}
        <LocalizedLink
          href="/"
          className={`block w-full ${bookingId ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-furgocasa-orange text-white hover:bg-orange-600'} font-semibold py-3 px-8 rounded-lg transition-colors`}
        >
          {t("Volver al inicio")}
        </LocalizedLink>
      </div>
    </div>
  );
}

interface Payment {
  id: string;
  order_number: string;
  amount: number;
  status: string;
  booking: {
    id: string;
    booking_number: string;
    pickup_date: string;
    dropoff_date: string;
    pickup_time: string;
    dropoff_time: string;
    total_price: number;
    amount_paid: number;
    customer_name: string;
    customer_email: string;
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
  };
}

function PagoExitoContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [fallbackBookingId, setFallbackBookingId] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    // Evitar ejecución múltiple (StrictMode en dev ejecuta 2 veces)
    if (hasRun) {
      console.log("[PAGO-EXITO] Ya se ejecutó loadPaymentInfo, ignorando...");
      return;
    }
    setHasRun(true);
    
    // 🔍 CAPTURAR DATOS POST si existen (Redsys puede enviar por POST)
    console.log("[PAGO-EXITO] 🔍 Intentando capturar datos POST...");
    if (typeof window !== 'undefined' && (window as any).redsysPostData) {
      console.log("[PAGO-EXITO] 🔍 Datos POST capturados:", (window as any).redsysPostData);
    } else {
      console.log("[PAGO-EXITO] 🔍 No hay datos POST en window.redsysPostData");
    }
    
    // Redsys puede enviar el Ds_MerchantParameters en la URL de retorno
    // También podríamos recibir un ID de pago o booking desde nuestro sistema
    loadPaymentInfo();
  }, [hasRun]);

  const loadPaymentInfo = async () => {
    console.log("[PAGO-EXITO] === INICIANDO loadPaymentInfo ===");
    console.log("[PAGO-EXITO] URL actual:", window.location.href);
    console.log("[PAGO-EXITO] Query params:", window.location.search);
    console.log("[PAGO-EXITO] Hash:", window.location.hash);
    
    // 🔍 CAPTURAR TODOS LOS PARÁMETROS POSIBLES DE REDSYS
    const allParams = new URLSearchParams(window.location.search);
    const allParamsObj: Record<string, string> = {};
    allParams.forEach((value, key) => {
      allParamsObj[key] = value;
    });
    console.log("[PAGO-EXITO] 🔍 TODOS los parámetros URL:", allParamsObj);
    console.log("[PAGO-EXITO] 🔍 Número total de parámetros:", Array.from(allParams.keys()).length);
    
    try {
      setLoading(true);

      // Stripe: session_id en la URL
      const stripeSessionId = searchParams.get("session_id");
      
      // Redsys: MÚLTIPLES variantes de parámetros
      const merchantParams = searchParams.get("Ds_MerchantParameters");
      const dsSignature = searchParams.get("Ds_Signature");
      const dsSignatureVersion = searchParams.get("Ds_SignatureVersion");
      
      console.log("[PAGO-EXITO] 🔍 Parámetros Redsys específicos:", {
        stripeSessionId: !!stripeSessionId,
        Ds_MerchantParameters: !!merchantParams,
        Ds_MerchantParameters_length: merchantParams?.length || 0,
        Ds_Signature: !!dsSignature,
        Ds_SignatureVersion: dsSignatureVersion,
      });
      
      let orderNumber: string | null = null;
      let redsysResponseCode: string | null = null;
      let redsysAuthCode: string | null = null;
      let savedBookingId: string | null = null;
      
      // Si viene de Stripe, buscar por stripe_session_id
      if (stripeSessionId) {
        const { data, error } = await supabase
          .from("payments")
          .select(`
            *,
            booking:bookings(
              *,
              vehicle:vehicles(name, brand, model),
              pickup_location:locations!pickup_location_id(name),
              dropoff_location:locations!dropoff_location_id(name)
            )
          `)
          .eq("stripe_session_id", stripeSessionId)
          .single();

        if (!error && data) {
          setPayment(data as any);
          return;
        }
      }
      
      // Si viene de Redsys, decodificar parámetros de la URL
      if (merchantParams) {
        try {
          const decoded = JSON.parse(atob(merchantParams));
          orderNumber = decoded.Ds_Order;
          redsysResponseCode = decoded.Ds_Response;
          redsysAuthCode = decoded.Ds_AuthorisationCode;
          console.log("[PAGO-EXITO] Parámetros Redsys decodificados de URL:", {
            orderNumber,
            responseCode: redsysResponseCode,
            authCode: redsysAuthCode
          });
        } catch (e) {
          console.error("Error decodificando parámetros de Redsys:", e);
        }
      }
      
      // FALLBACK: Si no hay parámetros en URL, intentar recuperar de sessionStorage
      if (!orderNumber && typeof window !== 'undefined') {
        const savedOrderNumberFromStorage = sessionStorage.getItem('lastPaymentOrderNumber');
        savedBookingId = sessionStorage.getItem('lastPaymentBookingId');
        
        console.log("[PAGO-EXITO] SessionStorage valores:", {
          savedOrderNumber: savedOrderNumberFromStorage,
          savedBookingId: savedBookingId
        });
        
        if (savedOrderNumberFromStorage) {
          orderNumber = savedOrderNumberFromStorage;
          console.log("[PAGO-EXITO] OrderNumber recuperado de sessionStorage:", orderNumber);
        }
        
        // Guardar bookingId para fallback visual
        if (savedBookingId) {
          setFallbackBookingId(savedBookingId);
        }
        
        // Limpiar sessionStorage después de usar
        if (savedOrderNumberFromStorage || savedBookingId) {
          sessionStorage.removeItem('lastPaymentOrderNumber');
          sessionStorage.removeItem('lastPaymentBookingId');
          console.log("[PAGO-EXITO] SessionStorage limpiado");
        }
      }

      console.log("[PAGO-EXITO] OrderNumber final antes de buscar:", orderNumber);

      // Si tenemos el número de pedido (Redsys), buscar ese pago específico
      if (orderNumber) {
        console.log("[PAGO-EXITO] Buscando pago con orderNumber:", orderNumber);
        
        // IMPORTANTE: Usamos fetch a una API server-side para evitar problemas de RLS
        // El cliente Supabase del navegador puede no tener permisos para ver payments
        try {
          const searchResponse = await fetch(`/api/payments/by-order?orderNumber=${encodeURIComponent(orderNumber)}`);
          console.log("[PAGO-EXITO] Respuesta de búsqueda:", searchResponse.status);
          
          if (!searchResponse.ok) {
            console.error("[PAGO-EXITO] Error en API de búsqueda:", searchResponse.status, searchResponse.statusText);
            // Fallback: intentar directamente con supabase client
          }
          
          const searchResult = await searchResponse.json();
          console.log("[PAGO-EXITO] Resultado de búsqueda:", searchResult);
          
          const data = searchResult.payment;
          const error = searchResult.error ? { message: searchResult.error } : null;

          if (error) {
            console.error("[PAGO-EXITO] Error buscando pago:", error);
          }
        
          if (!error && data) {
          console.log("[PAGO-EXITO] Pago encontrado:", {
            paymentId: data.id,
            status: data.status,
            amount: data.amount,
            bookingId: data.booking_id
          });
          
          // RESPALDO: Si el pago sigue pendiente, actualizar el estado
          // Nota: Redsys SOLO redirige a URLOK si el pago fue exitoso
          const responseCodeNum = parseInt(redsysResponseCode || "0000", 10);
          const isRedsysSuccess = responseCodeNum >= 0 && responseCodeNum <= 99;
          
          // FALLBACK AGRESIVO: Si llegó a /pago/exito Y el pago está pendiente, 
          // ASUMIMOS que el pago fue exitoso (Redsys solo redirige aquí si fue autorizado)
          const shouldTriggerFallback = data.status === "pending";
          
          console.log("[PAGO-EXITO] ⚠️ EVALUANDO FALLBACK AGRESIVO:", {
            paymentStatus: data.status,
            isPending: data.status === "pending",
            merchantParams: !!merchantParams,
            redsysResponseCode,
            isRedsysSuccess,
            shouldTriggerFallback,
            mensaje: "Si llegó aquí con pago pending → ACTIVAR FALLBACK"
          });
          
          if (shouldTriggerFallback) {
            console.log("[PAGO-EXITO] RESPALDO: Activando fallback para actualizar pago...");
            
            // Llamar a la API para procesar el pago (esto actualiza payment, booking y envía email)
            try {
              const requestBody = {
                orderNumber,
                responseCode: redsysResponseCode || "0000", // Asumir éxito si no hay código
                authCode: redsysAuthCode || "FALLBACK",
                merchantParams,
                fromSuccessPage: true // Indicar que viene de la página de éxito
              };
              console.log("[PAGO-EXITO] Llamando a /api/redsys/verify-payment con:", requestBody);
              
              const response = await fetch("/api/redsys/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
              });
              
              console.log("[PAGO-EXITO] Respuesta de verify-payment:", response.status, response.statusText);
              
              if (response.ok) {
                const responseData = await response.json();
                console.log("[PAGO-EXITO] Pago actualizado correctamente via respaldo:", responseData);
                // Recargar los datos actualizados
                const { data: updatedData } = await supabase
                  .from("payments")
                  .select(`
                    *,
                    booking:bookings(
                      *,
                      vehicle:vehicles(name, brand, model),
                      pickup_location:locations!pickup_location_id(name),
                      dropoff_location:locations!dropoff_location_id(name)
                    )
                  `)
                  .eq("order_number", orderNumber)
                  .single();
                
                if (updatedData) {
                  setPayment(updatedData as any);
                  return;
                }
              } else {
                console.error("[PAGO-EXITO] Error en respaldo:", await response.text());
              }
            } catch (verifyError) {
              console.error("[PAGO-EXITO] Error llamando a verify-payment:", verifyError);
            }
          }
          
          setPayment(data as any);
          }
        } catch (fetchError) {
          console.error("[PAGO-EXITO] Error en fetch de búsqueda:", fetchError);
        }
      }
    } catch (error) {
      console.error("Error loading payment info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando pago...</p>
          </div>
        </div>
</>
    );
  }

  return (
    <>
<main className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header Verde */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
              <div className="bg-white/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-16 w-16" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {t("¡Pago realizado con éxito!")}
              </h1>
              <p className="text-green-100">
                {t("Tu reserva ha sido confirmada")}
              </p>
            </div>

            <div className="p-8">
              {payment ? (
                <>
                  {/* Detalles del pago */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                    <h2 className="font-bold text-green-800 mb-4 text-lg">
                      {t("Detalles de la transacción")}
                    </h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("Número de reserva")}:</span>
                        <span className="font-mono font-bold text-green-700">{payment.booking.booking_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("Referencia pago")}:</span>
                        <span className="font-mono">{payment.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t("Importe pagado")}:</span>
                        <span className="font-bold text-green-700">{formatPrice(payment.amount)}</span>
                      </div>
                      {payment.booking.total_price > payment.booking.amount_paid && (
                        <div className="flex justify-between pt-2 border-t border-green-200">
                          <span className="text-gray-600">{t("Pendiente de pago")}:</span>
                          <span className="font-bold text-orange-600">
                            {formatPrice(payment.booking.total_price - payment.booking.amount_paid)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resumen de la reserva */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Car className="h-6 w-6 text-furgocasa-blue" />
                      <div>
                        <p className="font-semibold text-gray-900">{payment.booking.vehicle.name}</p>
                        <p className="text-sm text-gray-600">
                          {payment.booking.vehicle.brand} {payment.booking.vehicle.model}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-furgocasa-blue mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium">{t("Recogida")}</p>
                          <p className="font-medium text-gray-900">
                            {new Date(payment.booking.pickup_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600">{payment.booking.pickup_time}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-furgocasa-blue mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium">{t("Devolución")}</p>
                          <p className="font-medium text-gray-900">
                            {new Date(payment.booking.dropoff_date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-gray-600">{payment.booking.dropoff_time}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-furgocasa-blue" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">{t("Recogida en")}</p>
                        <p className="font-medium text-gray-900">{payment.booking.pickup_location.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-furgocasa-blue" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">{t("Devolución en")}</p>
                        <p className="font-medium text-gray-900">{payment.booking.dropoff_location.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mensaje importante si queda pendiente */}
                  {payment.booking.total_price > payment.booking.amount_paid && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                      <p className="text-sm text-yellow-800">
                        <strong>{t("Recuerda:")}</strong>{""}
                        {t("El pago restante debe realizarse como máximo 15 días antes de la fecha de recogida.")}
                      </p>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 justify-center">
                      <Mail className="h-4 w-4" />
                      {t("Te hemos enviado un email de confirmación a")}{""}
                      <strong>{payment.booking.customer_email}</strong>
                    </div>

                    <LocalizedLink
                      href={`/reservar/${payment.booking.id}`}
                      className="block w-full bg-furgocasa-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      {t("Ver mi reserva")}
                    </LocalizedLink>

                    <LocalizedLink
                      href="/"
                      className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors text-center"
                    >
                      {t("Volver al inicio")}
                    </LocalizedLink>
                  </div>
                </>
              ) : (
                // Sin datos de pago específicos - usar bookingId de fallback
                <PaymentSuccessGeneric bookingId={fallbackBookingId} />
              )}
            </div>
          </div>
        </div>
      </main>
</>
  );
}

export default function PagoExitoPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PagoExitoContent />
    </Suspense>
  );
}
