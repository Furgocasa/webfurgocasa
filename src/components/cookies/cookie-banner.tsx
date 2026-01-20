"use client";

import { useCookies } from "./cookie-context";
import Link from "next/link";
import { X, Cookie, Shield, BarChart3, Settings, Megaphone } from "lucide-react";

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, openSettings } = useCookies();

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg md:p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Icono y texto */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <Cookie className="h-8 w-8 text-furgocasa-orange flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Utilizamos cookies
                </h3>
                <p className="text-gray-600 text-sm">
                  Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico 
                  y mostrarte contenido personalizado. Puedes aceptar todas, rechazarlas o configurar 
                  tus preferencias.{" "}
                  <Link href="/cookies" className="text-furgocasa-orange hover:underline">
                    Más información
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={openSettings}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Configurar
            </button>
            <button
              onClick={rejectAll}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Rechazar todas
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-furgocasa-orange text-white rounded-lg font-medium hover:bg-furgocasa-orange-dark transition-colors text-sm"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CookieSettingsModal() {
  const {
    isSettingsOpen,
    closeSettings,
    preferences,
    updatePreferences,
    savePreferences,
    acceptAll,
    rejectAll,
  } = useCookies();

  if (!isSettingsOpen) return null;

  const cookieTypes = [
    {
      id: "necessary",
      name: "Cookies necesarias",
      description:
        "Estas cookies son esenciales para el funcionamiento del sitio web. Sin ellas, el sitio no funcionaría correctamente.",
      icon: Shield,
      required: true,
      enabled: preferences.necessary,
    },
    {
      id: "analytics",
      name: "Cookies analíticas",
      description:
        "Nos permiten contar las visitas y analizar cómo los usuarios navegan por el sitio para mejorarlo.",
      icon: BarChart3,
      required: false,
      enabled: preferences.analytics,
    },
    {
      id: "functional",
      name: "Cookies funcionales",
      description:
        "Permiten recordar tus preferencias (como búsquedas recientes) para una experiencia más personalizada.",
      icon: Settings,
      required: false,
      enabled: preferences.functional,
    },
    {
      id: "marketing",
      name: "Cookies de marketing",
      description:
        "Se utilizan para mostrarte anuncios relevantes y medir la efectividad de las campañas publicitarias.",
      icon: Megaphone,
      required: false,
      enabled: preferences.marketing,
    },
  ];

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Cookie className="h-8 w-8 text-furgocasa-orange" />
            <h2 className="text-xl font-bold text-gray-900">Configuración de cookies</h2>
          </div>
          <button
            onClick={closeSettings}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-gray-600 mb-6">
            Elige qué tipos de cookies deseas aceptar. Las cookies necesarias no se pueden desactivar 
            ya que son imprescindibles para el funcionamiento del sitio.
          </p>

          <div className="space-y-4">
            {cookieTypes.map((cookie) => (
              <div
                key={cookie.id}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  cookie.enabled
                    ? "border-furgocasa-orange bg-furgocasa-orange/5"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      cookie.enabled ? "bg-furgocasa-orange text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <cookie.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{cookie.name}</h3>
                      {cookie.required ? (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          Siempre activas
                        </span>
                      ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cookie.enabled}
                            onChange={(e) =>
                              updatePreferences({ [cookie.id]: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-furgocasa-orange/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-furgocasa-orange"></div>
                        </label>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{cookie.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Más info */}
          <p className="text-sm text-gray-500 mt-6">
            Para más información sobre cómo utilizamos las cookies, consulta nuestra{" "}
            <Link href="/cookies" className="text-furgocasa-orange hover:underline" onClick={closeSettings}>
              Política de Cookies
            </Link>
            .
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={rejectAll}
            className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-white transition-colors"
          >
            Rechazar todas
          </button>
          <button
            onClick={savePreferences}
            className="flex-1 px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Guardar preferencias
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 px-4 py-2.5 bg-furgocasa-orange text-white rounded-lg font-medium hover:bg-furgocasa-orange-dark transition-colors"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}

// Botón pequeño para abrir configuración (para el footer)
export function CookieSettingsButton() {
  const { openSettings } = useCookies();

  return (
    <button
      onClick={openSettings}
      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
    >
      <Cookie className="h-4 w-4" />
      Configurar cookies
    </button>
  );
}
