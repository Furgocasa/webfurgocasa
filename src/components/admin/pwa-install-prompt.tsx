"use client";

import { useEffect, useState } from "react";
import { X, Download, Share, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Detectar si es iOS
function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

// Detectar si está en modo standalone (PWA instalada)
function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-ignore - propiedad específica de iOS Safari
    window.navigator.standalone === true
  );
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Detectar iOS
    setIsIOSDevice(isIOS());
    
    // Verificar si ya está instalada (modo standalone)
    if (isStandalone()) {
      setIsInstalled(true);
      return;
    }

    // Verificar si el usuario ya rechazó la instalación
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // Mostrar de nuevo después de 7 días
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // En iOS, mostrar el banner con instrucciones manuales
    if (isIOS()) {
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return;
    }

    // En otros navegadores (Android/Chrome), usar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      
      // Mostrar el banner después de 5 segundos
      setTimeout(() => {
        setShowBanner(true);
      }, 5000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Detectar cuando se instala
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA instalada");
    } else {
      console.log("Instalación rechazada");
      localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
    }

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
  };

  // No mostrar nada si ya está instalada
  if (isInstalled) {
    return null;
  }

  // No mostrar si no hay banner que mostrar
  if (!showBanner) {
    return null;
  }

  // Para iOS: mostrar instrucciones manuales
  if (isIOSDevice) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-slate-900 text-white rounded-lg shadow-2xl p-4 border border-slate-700">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-sm">Instalar App en iPhone</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-xs text-slate-300 mb-4 space-y-2">
            <p className="font-medium text-white">Para instalar la app:</p>
            <div className="flex items-center gap-2">
              <span className="bg-slate-700 rounded px-1.5 py-0.5">1</span>
              <span>Pulsa el botón</span>
              <Share className="h-4 w-4 inline text-blue-400" />
              <span>(Compartir)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-slate-700 rounded px-1.5 py-0.5">2</span>
              <span>Selecciona</span>
              <Plus className="h-4 w-4 inline text-blue-400" />
              <span>&quot;Añadir a inicio&quot;</span>
            </div>
            <p className="text-slate-400 mt-2">
              Así podrás acceder al panel como una app sin barra de navegación.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  // Para Android/Chrome: mostrar botón de instalación directa
  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-slate-900 text-white rounded-lg shadow-2xl p-4 border border-slate-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-sm">Instalar App de Administrador</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-xs text-slate-300 mb-4">
          Instala la app para acceder rápidamente al panel de administración desde tu dispositivo móvil.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook para detectar si la app está instalada
export function useIsPWAInstalled() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore
      window.navigator.standalone === true
    );
  }, []);

  return isInstalled;
}
