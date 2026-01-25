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
      // Usar MutationObserver para detectar el cambio real del título
      // Esto soluciona el problema de títulos "not set" o antiguos en navegación SPA
      
      let sent = false;
      const titleElement = document.querySelector('title');
      let observer: MutationObserver | null = null;
      
      const sendPageView = (trigger: string) => {
        if (sent) return;
        
        const currentTitle = document.title;
        console.log(`[Analytics] Enviando pageview (${trigger}):`, pathname, 'Title:', currentTitle);
        
        (window as any).gtag('config', GA_MEASUREMENT_ID, {
          page_path: pathname,
          page_title: currentTitle || 'Furgocasa',
        });
        sent = true;
        
        // Limpiar observadores una vez enviado
        if (observer) observer.disconnect();
      };

      // 1. Fallback de seguridad: Si en 1.5s no cambia el título, enviar lo que haya
      const timeoutId = setTimeout(() => {
        sendPageView('timeout_fallback');
      }, 1500);

      // 2. Observar cambios en el <title>
      if (titleElement) {
        observer = new MutationObserver(() => {
          // Si el título no está vacío, asumimos que es el nuevo
          if (document.title && document.title.trim().length > 0) {
            // Pequeño delay extra para asegurar estabilidad
            setTimeout(() => sendPageView('title_change'), 100);
          }
        });
        
        observer.observe(titleElement, { childList: true, subtree: true, characterData: true });
      }

      return () => {
        clearTimeout(timeoutId);
        if (observer) observer.disconnect();
      };
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
