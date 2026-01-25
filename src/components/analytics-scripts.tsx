'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

/**
 * Componente que carga los scripts de Google Analytics
 * SOLO en páginas públicas (NO en /administrator ni /admin)
 */
export function AnalyticsScripts() {
  const pathname = usePathname();
  
  // ✅ CRÍTICO: Calcular inmediatamente si es página admin (sin esperar useEffect)
  const isAdminPage = useMemo(() => {
    return pathname?.startsWith('/administrator') || pathname?.startsWith('/admin');
  }, [pathname]);

  const [shouldLoadAnalytics, setShouldLoadAnalytics] = useState(!isAdminPage);

  useEffect(() => {
    if (isAdminPage) {
      console.log('[Analytics] ⛔ Ruta de administrador detectada. Scripts de Analytics NO se cargarán.');
      setShouldLoadAnalytics(false);
    } else {
      console.log('[Analytics] ✅ Ruta pública detectada. Cargando scripts de Analytics...');
      setShouldLoadAnalytics(true);
    }
  }, [isAdminPage]);

  // NO renderizar nada si estamos en páginas de administrador
  if (isAdminPage || !shouldLoadAnalytics) {
    return null;
  }

  return (
    <>
      {/* Google Analytics - Consentimiento por defecto denegado (GDPR) */}
      <Script
        id="gtag-consent-default"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Consentimiento por defecto denegado (GDPR compliant)
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'functionality_storage': 'denied',
              'personalization_storage': 'denied',
              'security_storage': 'granted'
            });
          `,
        }}
      />
      
      {/* Google Analytics - Script principal */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-G5YLBN5XXZ"
        strategy="afterInteractive"
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G5YLBN5XXZ', {
              page_path: window.location.pathname,
              send_page_view: false
            });
            console.log('[Analytics] Google Analytics inicializado (sin pageview automático)');
          `,
        }}
      />
    </>
  );
}
