'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// ID de Google Analytics
const GA_MEASUREMENT_ID = 'G-G5YLBN5XXZ';

/**
 * Verifica si la ruta actual es una página de administrador
 */
function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/administrator') || pathname.startsWith('/admin');
}

function GoogleAnalyticsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Trackear cambios de ruta y parámetros
  useEffect(() => {
    const paramsString = searchParams?.toString();
    const queryString = paramsString ? `?${paramsString}` : '';
    const fullPath = pathname + queryString;

    // No enviar pageviews de páginas de administrador
    if (isAdminPath(pathname)) {
      console.log('[Analytics] Página admin - NO se enviará pageview');
      return;
    }

    // Enviar pageview cuando cambia la ruta o los parámetros
    // NOTA: Comprobamos window.gtag dentro de un intervalo para manejar la condición de carrera
    // en la carga inicial (cuando el script de GA aún no se ha ejecutado pero el componente ya montó)
    const trySendPageView = () => {
       if (typeof window !== 'undefined' && (window as any).gtag && pathname) {
          // ESTRATEGIA HÍBRIDA ROBUSTA (V3):
          // Combinamos MutationObserver + Polling para garantizar detección del título
          
          let sent = false;
          const oldTitle = document.title; // Título de la página anterior
          
          const sendPageView = (trigger: string) => {
            if (sent) return;
            
            const currentTitle = document.title;
            console.log(`[Analytics] 📡 Enviando (${trigger}) | URL: ${fullPath} | Title: "${currentTitle}"`);

            // Limpiar URL si es demasiado larga (límite seguro para GA4)
            // GA4 soporta hasta ~420 chars en algunos contextos, aunque page_location es más flexible.
            // Recortamos fbclid si es excesivo.
            let safeFullPath = fullPath;
            let safeLocation = window.location.href;

            if (safeLocation.length > 300) {
               // Si la URL es monstruosa, intentamos limpiar parámetros conocidos que sean muy largos
               try {
                 const urlObj = new URL(window.location.href);
                 const fbclid = urlObj.searchParams.get('fbclid');
                 if (fbclid && fbclid.length > 50) {
                   // Truncar fbclid visualmente pero mantener que existe
                   urlObj.searchParams.set('fbclid', fbclid.substring(0, 20) + '...');
                   safeLocation = urlObj.toString();
                   
                   // Ajustar también el page_path relativo
                   const newSearchParams = new URLSearchParams(searchParams?.toString());
                   newSearchParams.set('fbclid', fbclid.substring(0, 20) + '...');
                   safeFullPath = pathname + '?' + newSearchParams.toString();
                   
                   console.log(`[Analytics] ✂️ URL recortada para envío seguro: ${safeFullPath}`);
                 }
               } catch (e) {
                 // Si falla el parseo, enviamos original
               }
            }
            
            (window as any).gtag('config', GA_MEASUREMENT_ID, {
              page_path: safeFullPath, 
              page_location: safeLocation, 
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
                if (document.title !== oldTitle) {
                   sendPageView('mutation_detected');
                }
              }
            });
            observer.observe(titleElement, { childList: true, subtree: true, characterData: true });
          }
    
          // 3. FALLBACK FINAL (1.5s)
          fallbackTimer = setTimeout(() => {
            sendPageView('timeout_fallback');
          }, 1500);

          return cleanup;
       }
       return null;
    };

    // Intentar enviar inmediatamente
    const cleanupFunc = trySendPageView();

    // Si no se pudo enviar (gtag no definido), esperar a que cargue
    let retryInterval: NodeJS.Timeout;
    if (!cleanupFunc) {
      let attempts = 0;
      retryInterval = setInterval(() => {
        const cleanup = trySendPageView();
        if (cleanup) {
          clearInterval(retryInterval);
        }
        attempts++;
        if (attempts > 50) clearInterval(retryInterval); // Dejar de intentar tras 5s
      }, 100);
    }

    return () => {
      if (cleanupFunc) cleanupFunc();
      clearInterval(retryInterval);
    };
  }, [pathname, searchParams]); // Dependencia añadida: searchParams

  return null;
}

/**
 * Componente de Google Analytics para trackear navegación
 * Envuelto en Suspense para compatibilidad con useSearchParams en Next.js App Router
 */
export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsContent />
    </Suspense>
  );
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
