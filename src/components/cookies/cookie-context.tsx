"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CookiePreferences {
  necessary: boolean; // Siempre true, no se puede desactivar
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

interface CookieContextType {
  preferences: CookiePreferences;
  hasConsented: boolean;
  updatePreferences: (prefs: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  isSettingsOpen: boolean;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
};

const CookieContext = createContext<CookieContextType | undefined>(undefined);

const COOKIE_CONSENT_KEY = "furgocasa_cookie_consent";
const COOKIE_PREFERENCES_KEY = "furgocasa_cookie_preferences";

export function CookieProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [hasConsented, setHasConsented] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar preferencias guardadas
  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);

      if (consent === "true" && savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          setPreferences({ ...defaultPreferences, ...parsed, necessary: true });
          setHasConsented(true);
          setShowBanner(false);
        } catch {
          setShowBanner(true);
        }
      } else {
        setShowBanner(true);
      }
      setIsLoaded(true);

      // Escuchar evento para abrir configuración
      const handleOpenSettings = () => setIsSettingsOpen(true);
      window.addEventListener("openCookieSettings", handleOpenSettings);
      return () => window.removeEventListener("openCookieSettings", handleOpenSettings);
    }
  }, []);

  // Aplicar cookies según preferencias
  useEffect(() => {
    if (!isLoaded || !hasConsented) return;

    // Analytics (Google Analytics)
    if (preferences.analytics) {
      enableAnalytics();
    } else {
      disableAnalytics();
    }

    // Marketing (Facebook Pixel, Google Ads)
    if (preferences.marketing) {
      enableMarketing();
    } else {
      disableMarketing();
    }

    // Functional
    if (preferences.functional) {
      enableFunctional();
    }
  }, [preferences, hasConsented, isLoaded]);

  const enableAnalytics = () => {
    // Habilitar Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
    console.log("Analytics enabled");
  };

  const disableAnalytics = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
    // Eliminar cookies de analytics
    deleteCookie("_ga");
    deleteCookie("_gid");
    document.cookie.split(";").forEach((c) => {
      if (c.trim().startsWith("_ga_")) {
        deleteCookie(c.split("=")[0].trim());
      }
    });
    console.log("Analytics disabled");
  };

  const enableMarketing = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("consent", "grant");
    }
    console.log("Marketing enabled");
  };

  const disableMarketing = () => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("consent", "revoke");
    }
    deleteCookie("_fbp");
    deleteCookie("_gcl_au");
    console.log("Marketing disabled");
  };

  const enableFunctional = () => {
    console.log("Functional cookies enabled");
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
  };

  const updatePreferences = (prefs: Partial<CookiePreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs, necessary: true }));
  };

  const savePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setHasConsented(true);
    setShowBanner(false);
    setIsSettingsOpen(false);
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
    setHasConsented(true);
    setShowBanner(false);
    setIsSettingsOpen(false);
  };

  const rejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(onlyNecessary));
    setHasConsented(true);
    setShowBanner(false);
    setIsSettingsOpen(false);
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  return (
    <CookieContext.Provider
      value={{
        preferences,
        hasConsented,
        updatePreferences,
        acceptAll,
        rejectAll,
        savePreferences,
        openSettings,
        closeSettings,
        isSettingsOpen,
        showBanner,
        setShowBanner,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
}

export function useCookies() {
  const context = useContext(CookieContext);
  if (context === undefined) {
    throw new Error("useCookies must be used within a CookieProvider");
  }
  return context;
}
