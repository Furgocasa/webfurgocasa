"use client";

import { useState, useEffect } from"react";
import { useLanguage } from"@/contexts/language-context";
import { useParams } from"next/navigation";
import { formatPrice } from"@/lib/utils";
import { 
  CheckCircle, AlertCircle, Calendar, MapPin, Car, 
  User, Mail, Phone, Building, CreditCard, Copy, Check
} from"lucide-react";
import Link from"next/link";

interface Booking {
  id: string;
  booking_number: string;
  pickup_date: string;
  dropoff_date: string;
  pickup_time: string;
  dropoff_time: string;
  days: number;
  total_price: number;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
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

export default function ConfirmacionPage() {
  const { t } = useLanguage();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Datos bancarios de ejemplo (deberías obtenerlos de la configuración)
  const bankDetails = {
    bankName: 'Banco Ejemplo',
    iban: 'ES00 0000 0000 0000 0000 0000',
    bic: 'ABCDESXX',
    holder: 'FURGOCASA SL',
  };

  // Actualizar título del navegador
  useEffect(() => {
    document.title = 'Confirmación de reserva - Furgocasa';
  }, []);

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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
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
                <Building className="h-5 w-5" />
                <span className="font-medium">{t("Pendiente de transferencia")}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("Instrucciones de pago")}
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900">
                {t("Para confirmar tu reserva, realiza una transferencia bancaria por el importe total a la cuenta indicada. Una vez recibido el pago, confirmaremos tu reserva por email.")}
              </p>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase font-medium">{t("Banco")}</p>
                </div>
                <p className="font-semibold text-gray-900">{bankDetails.bankName}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase font-medium">IBAN</p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.iban, 'iban')}
                    className="text-sm text-furgocasa-blue hover:text-furgocasa-orange transition-colors flex items-center gap-1"
                  >
                    {copied === 'iban' ? (
                      <>
                        <Check className="h-4 w-4" />
                        {t("Copiado")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        {t("Copiar")}
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono font-semibold text-gray-900 text-lg">{bankDetails.iban}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 uppercase font-medium">BIC/SWIFT</p>
                  <button
                    onClick={() => copyToClipboard(bankDetails.bic, 'bic')}
                    className="text-sm text-furgocasa-blue hover:text-furgocasa-orange transition-colors flex items-center gap-1"
                  >
                    {copied === 'bic' ? (
                      <>
                        <Check className="h-4 w-4" />
                        {t("Copiado")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        {t("Copiar")}
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono font-semibold text-gray-900 text-lg">{bankDetails.bic}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-medium mb-2">{t("Beneficiario")}</p>
                <p className="font-semibold text-gray-900">{bankDetails.holder}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-medium mb-2">{t("Concepto")}</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-semibold text-gray-900 text-lg">
                    Reserva {booking.booking_number}
                  </p>
                  <button
                    onClick={() => copyToClipboard(`Reserva ${booking.booking_number}`, 'concept')}
                    className="text-sm text-furgocasa-blue hover:text-furgocasa-orange transition-colors flex items-center gap-1"
                  >
                    {copied === 'concept' ? (
                      <>
                        <Check className="h-4 w-4" />
                        {t("Copiado")}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        {t("Copiar")}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-furgocasa-orange to-orange-600 rounded-lg text-white">
                <p className="text-sm opacity-90 mb-1">{t("Importe a transferir")}</p>
                <p className="text-4xl font-bold">{formatPrice(booking.total_price)}</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>{t("Importante")}:</strong> {t("Asegúrate de incluir el número de reserva en el concepto de la transferencia para que podamos identificar tu pago correctamente.")}
              </p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("Resumen de la reserva")}
            </h2>

            <div className="space-y-4">
              {/* Vehicle */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Car className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Vehículo")}</p>
                  <p className="font-semibold text-gray-900">{booking.vehicle.name}</p>
                  <p className="text-sm text-gray-600">{booking.vehicle.brand} {booking.vehicle.model}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-furgocasa-blue flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">{t("Recogida")}</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(booking.pickup_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
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
                    <p className="font-semibold text-gray-900 text-sm">
                      {new Date(booking.dropoff_date).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
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
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("Próximos pasos")}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-furgocasa-orange text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t("Realiza la transferencia")}</p>
                  <p className="text-sm text-gray-600">{t("Utiliza los datos bancarios proporcionados arriba")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-furgocasa-orange text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t("Espera la confirmación")}</p>
                  <p className="text-sm text-gray-600">{t("Te enviaremos un email en cuanto recibamos tu pago (generalmente 24-48h)")}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-furgocasa-orange text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t("Recoge tu vehículo")}</p>
                  <p className="text-sm text-gray-600">{t("En la fecha indicada, acude a recoger tu camper con la documentación necesaria")}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">
                {t("Hemos enviado un email a")} <strong>{booking.customer_email}</strong> {t("con toda esta información")}
              </p>
              <Link 
                href="/"
                className="inline-block bg-furgocasa-blue text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("Volver al inicio")}
              </Link>
            </div>
          </div>
        </div>
      </main>
</>
  );
}

