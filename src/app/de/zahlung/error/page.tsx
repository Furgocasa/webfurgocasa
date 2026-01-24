"use client";

import { Suspense } from"react";
import { useSearchParams } from"next/navigation";
import { useLanguage } from"@/contexts/language-context";

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
import { XCircle, RefreshCw, Phone, Mail, HelpCircle } from"lucide-react";
import { LocalizedLink } from"@/components/localized-link";

// Häufige Redsys-Fehlercodes und ihre freundlichen Meldungen
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {"0101": {
    title:"Karte abgelaufen",
    description:"Die verwendete Karte ist abgelaufen. Bitte verwenden Sie eine andere gültige Karte.",
  },"0102": {
    title:"Karte gesperrt",
    description:"Ihre Karte ist vorübergehend gesperrt. Kontaktieren Sie Ihre Bank für weitere Informationen.",
  },"0116": {
    title:"Unzureichendes Guthaben",
    description:"Das Guthaben auf der Karte reicht nicht aus, um die Transaktion abzuschließen.",
  },"0129": {
    title:"CVV falsch",
    description:"Der eingegebene Sicherheitscode (CVV) ist nicht korrekt. Überprüfen Sie die 3-stellige Nummer auf der Rückseite Ihrer Karte.",
  },"0184": {
    title:"Authentifizierungsfehler",
    description:"Ihre Identität konnte nicht überprüft werden. Stellen Sie sicher, dass Sie die 3D Secure-Authentifizierung korrekt abschließen.",
  },"0190": {
    title:"Zahlung abgelehnt",
    description:"Die Bank hat die Transaktion abgelehnt. Kontaktieren Sie Ihre Bank für weitere Informationen.",
  },"9915": {
    title:"Zahlung abgebrochen",
    description:"Sie haben den Zahlungsvorgang abgebrochen. Falls es ein Fehler war, können Sie es erneut versuchen.",
  },"default": {
    title:"Zahlungsfehler",
    description:"Während des Zahlungsvorgangs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
  },
};

function PagoErrorContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  
  // Intentar obtener el código de error de Redsys
  let errorCode ="default";
  const merchantParams = searchParams.get("Ds_MerchantParameters");
  
  if (merchantParams) {
    try {
      const decoded = JSON.parse(atob(merchantParams));
      if (decoded.Ds_Response) {
        errorCode = decoded.Ds_Response;
      }
    } catch (e) {
      console.error("Error decodificando parámetros:", e);
    }
  }

  const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES["default"];

  return (
    <>
<main className="min-h-screen bg-gradient-to-b from-red-50 to-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Error Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header Rojo */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white text-center">
              <div className="bg-white/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-16 w-16" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {errorInfo.title}
              </h1>
              <p className="text-red-100">
                {t("No se ha podido completar el pago")}
              </p>
            </div>

            <div className="p-8">
              {/* Mensaje de error */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <p className="text-red-800">
                  {errorInfo.description}
                </p>
                {errorCode !=="default" && (
                  <p className="text-sm text-red-600 mt-2">
                    {t("Código de error")}: {errorCode}
                  </p>
                )}
              </div>

              {/* Qué hacer ahora */}
              <div className="space-y-4 mb-8">
                <h2 className="font-bold text-gray-900 text-lg">
                  {t("¿Qué puedes hacer?")}
                </h2>
                
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-furgocasa-blue mt-0.5 flex-shrink-0" />
                    <span>{t("Intentar de nuevo con la misma u otra tarjeta")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-furgocasa-blue mt-0.5 flex-shrink-0" />
                    <span>{t("Verificar que los datos de la tarjeta son correctos")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-furgocasa-blue mt-0.5 flex-shrink-0" />
                    <span>{t("Contactar con tu banco si el problema persiste")}</span>
                  </li>
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-furgocasa-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  {t("Volver a intentar")}
                </button>

                <LocalizedLink
                  href="/"
                  className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  {t("Volver al inicio")}
                </LocalizedLink>
              </div>

              {/* Contacto */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600 mb-4">
                  {t("¿Necesitas ayuda? Contacta con nosotros")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+34XXX"
                    className="flex items-center justify-center gap-2 text-furgocasa-blue hover:text-blue-700"
                  >
                    <Phone className="h-5 w-5" />
                    <span>+34 XXX XXX XXX</span>
                  </a>
                  <a
                    href="mailto:info@furgocasa.com"
                    className="flex items-center justify-center gap-2 text-furgocasa-blue hover:text-blue-700"
                  >
                    <Mail className="h-5 w-5" />
                    <span>info@furgocasa.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              {t("Tu reserva sigue guardada. No se ha realizado ningún cargo a tu tarjeta.")}
            </p>
          </div>
        </div>
      </main>
</>
  );
}

export default function PagoErrorPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PagoErrorContent />
    </Suspense>
  );
}
