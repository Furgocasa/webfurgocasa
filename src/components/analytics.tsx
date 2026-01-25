'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// ID de Google Analytics
const GA_MEASUREMENT_ID = 'G-G5YLBN5XXZ';

/**
 * Verifica si la ruta actual es una página de administrador
 */
function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/administrator') || pathname.startsWith('/admin');
}

/**
 * Componente de Google Analytics para trackear navegación
 * 
 * El script principal se carga en layout.tsx
 * Este componente solo maneja cambios de ruta
 */
export function GoogleAnalytics() {
  const pathname = usePathname();

  // Trackear cambios de ruta
  useEffect(() => {
    // No enviar pageviews de páginas de administrador
    if (isAdminPath(pathname)) {
      console.log('[Analytics] Página admin - NO se enviará pageview');
      return;
    }

    // Enviar pageview cuando cambia la ruta
    if (typeof window !== 'undefined' && (window as any).gtag && pathname) {
      // ESTRATEGIA HÍBRIDA ROBUSTA (V3):
      // Combinamos MutationObserver + Polling para garantizar detección del título
      
      let sent = false;
      const oldTitle = document.title; // Título de la página anterior
      
      const sendPageView = (trigger: string) => {
        if (sent) return;
        
        const currentTitle = document.title;
        console.log(`[Analytics] 📡 Enviando (${trigger}) | Path: ${pathname} | Title: "${currentTitle}"`);
        
        (window as any).gtag('config', GA_MEASUREMENT_ID, {
          page_path: pathname,
          page_title: currentTitle || 'Furgocasa',
        });
        sent = true;
        cleanup();
      };

      // Limpieza de timers y observadores
      let checkInterval: NodeJS.Timeout;
      let fallbackTimer: NodeJS.Timeout;
      let observer: MutationObserver | null = null;

      const cleanup = () => {
        clearInterval(checkInterval);
        clearTimeout(fallbackTimer);
        if (observer) observer.disconnect();
      };

      // 1. POLLING INTELIGENTE (Cada 100ms)
      // Detecta si el título cambia respecto al anterior
      checkInterval = setInterval(() => {
        if (document.title !== oldTitle && document.title.length > 0) {
          sendPageView('polling_change_detected');
        }
      }, 100);

      // 2. MUTATION OBSERVER (Reacción inmediata)
      const titleElement = document.querySelector('title');
      if (titleElement) {
        observer = new MutationObserver(() => {
          if (document.title && document.title.length > 0) {
            // Si el título es diferente al anterior, enviar ya.
            // Si es igual, esperar al polling o fallback (evita falsos positivos en carga inicial)
            if (document.title !== oldTitle) {
               sendPageView('mutation_detected');
            }
          }
        });
        observer.observe(titleElement, { childList: true, subtree: true, characterData: true });
      }

      // 3. FALLBACK FINAL (1.5s)
      // Si el título no ha cambiado en 1.5s (ej: misma página con params distintos), enviar igual
      fallbackTimer = setTimeout(() => {
        sendPageView('timeout_fallback');
      }, 1500);

      return cleanup;
    }
  }, [pathname]);

  return null;
}

/**
 * Hook para enviar eventos personalizados a Google Analytics
 * Automáticamente ignora eventos de páginas /administrator
 */
export function useAnalyticsEvent() {
  const pathname = usePathname();

  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number
  ) => {
    // CRÍTICO: No enviar eventos desde páginas de administrador
    if (pathname?.startsWith('/administrator')) {
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  return { trackEvent };
}

/**
 * Función para actualizar el consentimiento de cookies
 * (Llamada desde CookieProvider cuando el usuario acepta)
 */
export function updateAnalyticsConsent(granted: boolean) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      'analytics_storage': granted ? 'granted' : 'denied',
      'ad_storage': granted ? 'granted' : 'denied',
    });
  }
}
