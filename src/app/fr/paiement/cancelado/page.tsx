"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

function PagoCanceladoContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icono de advertencia */}
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pago Cancelado
          </h1>

          {/* Descripción */}
          <p className="text-gray-600 mb-8">
            Has cancelado el proceso de pago. Tu reserva sigue activa pero pendiente de pago.
          </p>

          {/* Botones de acción */}
          <div className="space-y-3">
            {bookingId && (
              <Link
                href={`/reserver/${bookingId}/pago`}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver a intentar el pago
              </Link>
            )}

            {bookingId && (
              <Link
                href={`/reserver/${bookingId}`}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Ver mi reserva
              </Link>
            )}

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Volver al inicio
            </Link>
          </div>

          {/* Información adicional */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-sm text-blue-800">
              Si tienes problemas con el pago, puedes contactarnos por WhatsApp o email. 
              Te ayudaremos a completar tu reserva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PagoCanceladoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <PagoCanceladoContent />
    </Suspense>
  );
}
