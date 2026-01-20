'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// ID de Google Analytics
const GA_MEASUREMENT_ID = 'G-G5YLBN5XXZ';

/**
 * Verifica si la ruta actual es una página de administrador
 * @param pathname La ruta actual
 * @returns true si es una página de administrador
 */
function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/administrator') || pathname.startsWith('/admin');
}

/**
 * Componente de Google Analytics con exclusión de páginas administrativas
 * 
 * CRÍTICO: Este componente NO registra tráfico en páginas /administrator o /admin
 * Solo envía eventos a Google Analytics para páginas públicas
 * 
 * MEDICIÓN ID: G-G5YLBN5XXZ
 */
export function GoogleAnalytics() {
  const pathname = usePathname();

  // Efecto para inicializar Google Analytics (solo una vez)
  useEffect(() => {
    // CRÍTICO: No cargar Analytics en páginas de administrador
    if (isAdminPath(pathname)) {
      console.log('[Analytics] Página de administrador detectada. Analytics NO se cargará.');
      return;
    }

    // Cargar gtag solo si no está ya cargado
    if (typeof window !== 'undefined' && !(window as any).gtag) {
      console.log('[Analytics] Inicializando Google Analytics:', GA_MEASUREMENT_ID);
      
      // Inicializar dataLayer
      (window as any).dataLayer = (window as any).dataLayer || [];
      
      // Crear función gtag
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;

      // Configurar consentimiento por defecto (GDPR compliant)
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'functionality_storage': 'denied',
        'personalization_storage': 'denied',
        'security_storage': 'granted'
      });

      // Cargar script de Google Analytics
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.async = true;
      document.head.appendChild(script);

      // Inicializar Google Analytics cuando el script cargue
      script.onload = () => {
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
          page_path: pathname,
          send_page_view: true
        });
        console.log('[Analytics] Script cargado correctamente');
      };
    }
  }, []); // Solo ejecutar una vez al montar

  // Efecto para trackear cambios de ruta
  useEffect(() => {
    // CRÍTICO: No enviar pageviews de páginas de administrador
    if (isAdminPath(pathname)) {
      console.log('[Analytics] Navegación a página admin detectada. NO se enviará pageview.');
      return;
    }

    // Enviar pageview cuando cambia la ruta (solo páginas públicas)
    if (typeof window !== 'undefined' && (window as any).gtag && pathname) {
      console.log('[Analytics] Enviando pageview:', pathname);
      (window as any).gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  // No renderizar nada
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
